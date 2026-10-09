/**
 * What every handler is given, and how each applies its event (STK-21): the
 * entitlement service, bound to a system context by index.ts, and the
 * logger. Handlers take these as an argument rather than importing the
 * database, so each is tested with a stand-in service and no database.
 */

import type { Logger } from "@pem/observability/logger";
import type { EntitlementOutcome } from "@pem/services/billing";
import { DomainError } from "@pem/services/errors";

export type BillingHandlerDeps = {
  completeCheckout(input: unknown): Promise<EntitlementOutcome>;
  syncSubscription(input: unknown): Promise<EntitlementOutcome>;
  log: Logger;
};

/** Stripe's object reference: an id, or the expanded object. */
export function stripeId(value: string | { id: string } | null): string | null {
  if (value === null) return null;
  return typeof value === "string" ? value : value.id;
}

/** An event's creation time, which orders entitlement writes. */
export function occurredAt(event: { created: number }): Date {
  return new Date(event.created * 1000);
}

/**
 * Calls the service and logs anything but a clean apply, once. An event the
 * validator refuses is logged as an error and acknowledged: Stripe would send
 * the same object for three days, and a retry cannot fix it.
 */
export async function applyEntitlement(
  deps: BillingHandlerDeps,
  event: { id: string; type: string },
  write: () => Promise<EntitlementOutcome>,
): Promise<void> {
  const tags = { event: event.type, eventId: event.id };
  let result: EntitlementOutcome;
  try {
    result = await write();
  } catch (error) {
    if (error instanceof DomainError && error.code === "INVALID") {
      deps.log.error("billing.event_invalid", { error, tags });
      return;
    }
    throw error;
  }
  if (result.outcome === "no-user") deps.log.warn("billing.no_user", { tags });
  else if (result.outcome === "customer-mismatch")
    deps.log.error("billing.customer_mismatch", {
      error: new Error(
        result.reason === "customer-taken"
          ? "the event's customer is linked to another user, named here"
          : "the user named here is still entitled through another customer; they may have paid twice",
      ),
      userId: result.userId,
      tags: { ...tags, reason: result.reason },
    });
  else if (result.outcome === "superseded")
    deps.log.warn("billing.superseded_subscription", {
      userId: result.userId,
      tags,
    });
  else if (result.outcome === "stale")
    deps.log.info("billing.stale_event", { userId: result.userId, tags });
}
