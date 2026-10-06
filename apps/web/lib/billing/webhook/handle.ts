/**
 * One Stripe webhook delivery, start to finish (D-STK-11), with no framework
 * in it: the route hands in the raw body, the signature header and its
 * dependencies, and sends back the status this returns.
 *
 *   1. Verify the signature on the raw body. Unsigned or forged: 400, and
 *      nothing is read or written. An event whose mode is not the tier's (a
 *      test event on production, a live one elsewhere) is refused the same
 *      way: a signing secret carries no mode, so the event's own flag is the
 *      only guard against a secret pasted into the wrong tier.
 *   2. Look the type up in the handler map. No handler: 200, nothing written.
 *   3. Claim the event id in the ledger. Already processed: 200. Held by a live
 *      delivery: 409, so Stripe retries once that one has finished.
 *   4. Run the handler. It throws: release the claim and answer 500, the
 *      retryable status, so the event id is never recorded as processed.
 *   5. Mark the event processed, and answer 200.
 *
 * Stripe retries any non-2xx for up to three days, so a 500 is never a loop:
 * a handler that keeps failing shows in the logs and Stripe's dashboard.
 */

import Stripe from "stripe";

import type { StripeEventClaim } from "@pem/db/stripe-event-ledger";
import { createLogger } from "@pem/observability/logger";

import { handlerFor, type WebhookHandlers } from "./dispatch.ts";

/** The status Stripe retries: a handler failed, or the ledger could not be written. */
export const RETRYABLE_STATUS = 500;

/** The ledger's three writes, as the route binds them to the database. */
export type WebhookLedger = {
  claim(event: { id: string; type: string }): Promise<StripeEventClaim>;
  markProcessed(id: string): Promise<void>;
  release(id: string): Promise<void>;
};

export type WebhookDelivery = {
  /** The request body exactly as received, never re-serialized JSON. */
  body: string;
  /** The `stripe-signature` header. */
  signature: string | null;
};

export type WebhookDeps = {
  /** The endpoint's signing secret (`whsec_...`); undefined when billing is not configured. */
  webhookSecret: string | undefined;
  /** Whether this tier takes live-mode events: production only. */
  livemode: boolean;
  handlers: WebhookHandlers;
  ledger: WebhookLedger;
};

/** What the response says; it names no configuration state, which the log carries. */
export type WebhookOutcome =
  "rejected" | "ignored" | "duplicate" | "in-flight" | "failed" | "processed";

export type WebhookResult = {
  status: number;
  body: { outcome: WebhookOutcome };
};

const log = createLogger("billing");

const result = (status: number, outcome: WebhookOutcome): WebhookResult => ({
  status,
  body: { outcome },
});

export async function handleStripeWebhook(
  delivery: WebhookDelivery,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  if (!deps.webhookSecret) {
    log.error("webhook.unconfigured", {
      reason:
        "STRIPE_WEBHOOK_SECRET is unset for this tier (STRIPE_WEBHOOK_SECRET_LOCAL off a deployment)",
    });
    return result(RETRYABLE_STATUS, "failed");
  }
  if (!delivery.signature) {
    log.warn("webhook.rejected", { reason: "no stripe-signature header" });
    return result(400, "rejected");
  }

  let event: Stripe.Event;
  try {
    event = await Stripe.webhooks.constructEventAsync(
      delivery.body,
      delivery.signature,
      deps.webhookSecret,
    );
  } catch (error) {
    log.warn("webhook.rejected", {
      reason: error instanceof Error ? error.message : "verification failed",
    });
    return result(400, "rejected");
  }

  const fields = { eventId: event.id, eventType: event.type };
  if (event.livemode !== deps.livemode) {
    log.error("webhook.wrong_mode", {
      ...fields,
      reason: event.livemode
        ? "a live-mode event reached a test tier; this endpoint's secret belongs to production"
        : "a test-mode event reached production; this endpoint's secret is a test endpoint's",
    });
    return result(400, "rejected");
  }
  const handler = handlerFor(deps.handlers, event);
  if (!handler) {
    log.info("webhook.ignored", fields);
    return result(200, "ignored");
  }

  let claim: StripeEventClaim;
  try {
    claim = await deps.ledger.claim({ id: event.id, type: event.type });
  } catch (error) {
    log.error("webhook.ledger_failed", { ...fields, error, step: "claim" });
    return result(RETRYABLE_STATUS, "failed");
  }
  if (claim === "processed") {
    log.info("webhook.duplicate", fields);
    return result(200, "duplicate");
  }
  if (claim === "in-flight") {
    log.info("webhook.in_flight", fields);
    return result(409, "in-flight");
  }

  try {
    await handler(event);
  } catch (error) {
    log.error("webhook.handler_failed", { ...fields, error });
    try {
      await deps.ledger.release(event.id);
    } catch (releaseError) {
      // The claim's lease lapses on its own, and a later retry takes it over.
      log.error("webhook.ledger_failed", {
        ...fields,
        error: releaseError,
        step: "release",
      });
    }
    return result(RETRYABLE_STATUS, "failed");
  }

  try {
    await deps.ledger.markProcessed(event.id);
  } catch (error) {
    // The handler ran; the retry finds the claim in flight until the lease lapses, then runs it again.
    log.error("webhook.ledger_failed", { ...fields, error, step: "mark" });
    return result(RETRYABLE_STATUS, "failed");
  }
  log.info("webhook.processed", fields);
  return result(200, "processed");
}
