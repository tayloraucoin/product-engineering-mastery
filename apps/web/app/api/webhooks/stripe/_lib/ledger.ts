/**
 * The webhook ledger bound to this app's database (STK-16): @pem/db's three
 * writes on the runtime singleton, which bypasses row-level security as the
 * table's service-only policy expects. Without a database URL each write
 * throws, so the route answers 500 and Stripe retries until one is set.
 */

import "server-only";

import { getDb } from "@pem/db/client";
import {
  claimStripeEvent,
  markStripeEventProcessed,
  pruneStripeEvents,
  releaseStripeEvent,
} from "@pem/db/stripe-event-ledger";
import { createLogger } from "@pem/observability/logger";

import { env } from "../../../../../env";
import type { WebhookLedger } from "./handle.ts";

/** The singleton for this tier; the ledger and the entitlement handlers share it. */
export function webhookDb() {
  if (!env.DATABASE_URL)
    throw new Error(
      "DATABASE_URL is unset for this tier; the webhook ledger has nowhere to write.",
    );
  return getDb({ url: env.DATABASE_URL, tier: env.DATABASE_ENVIRONMENT });
}

const log = createLogger("billing");

export const databaseLedger: WebhookLedger = {
  claim: (event) => claimStripeEvent(webhookDb(), event),
  markProcessed: async (id) => {
    await markStripeEventProcessed(webhookDb(), id);
    // Retention (STK-21): processed rows go after 30 days. Best effort: a
    // failed prune is logged and never fails the delivery it rode on.
    try {
      await pruneStripeEvents(webhookDb());
    } catch (error) {
      log.error("webhook.prune_failed", { error });
    }
  },
  release: (id) => releaseStripeEvent(webhookDb(), id),
};
