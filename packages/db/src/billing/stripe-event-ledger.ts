/**
 * The Stripe webhook ledger's three writes (D-STK-11, STK-16), on the
 * singleton: the route claims an event before its handler runs, marks it
 * processed after the handler succeeds, and releases the claim when the
 * handler throws. A claim is a lease: a delivery that died mid-handler leaves
 * a `processing` row, and once that row is older than the lease a later
 * delivery takes it over instead of waiting for ever.
 */

import { and, eq, sql } from "drizzle-orm";

import type { Db } from "../client.ts";
import { stripeEvents } from "../schema/billing/stripe-events.ts";

/** Longer than the route's maxDuration, so a live handler's claim is never taken over. */
export const STRIPE_EVENT_LEASE_SECONDS = 600;

/**
 * - `claimed`: this delivery holds the event; run its handler.
 * - `processed`: a handler already succeeded; acknowledge and do nothing.
 * - `in-flight`: another delivery holds a live claim; ask Stripe to retry.
 */
export type StripeEventClaim = "claimed" | "processed" | "in-flight";

/** Takes the event for this delivery, or says why it cannot. */
export async function claimStripeEvent(
  db: Db,
  event: { id: string; type: string },
  leaseSeconds: number = STRIPE_EVENT_LEASE_SECONDS,
): Promise<StripeEventClaim> {
  const [claimed] = await db
    .insert(stripeEvents)
    .values({ id: event.id, type: event.type })
    .onConflictDoUpdate({
      target: stripeEvents.id,
      set: { claimedAt: sql`now()` },
      setWhere: and(
        eq(stripeEvents.status, "processing"),
        sql`${stripeEvents.claimedAt} < now() - make_interval(secs => ${leaseSeconds})`,
      ),
    })
    .returning({ id: stripeEvents.id });
  if (claimed) return "claimed";

  const [row] = await db
    .select({ status: stripeEvents.status })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, event.id));
  // No row means the holder released it a moment ago: a retry will claim it.
  return row?.status === "processed" ? "processed" : "in-flight";
}

/** Records that the event's handler succeeded; a replay is acknowledged from now on. */
export async function markStripeEventProcessed(
  db: Db,
  id: string,
): Promise<void> {
  await db
    .update(stripeEvents)
    .set({ status: "processed", processedAt: sql`now()` })
    .where(and(eq(stripeEvents.id, id), eq(stripeEvents.status, "processing")));
}

/** Drops a failed handler's claim, so Stripe's retry runs the handler again. */
export async function releaseStripeEvent(db: Db, id: string): Promise<void> {
  await db
    .delete(stripeEvents)
    .where(and(eq(stripeEvents.id, id), eq(stripeEvents.status, "processing")));
}

/** How long a `processed` row is kept: well past Stripe's three days of retries (remove/billing.md). */
export const STRIPE_EVENT_RETENTION_DAYS = 30;

/** Deletes `processed` rows older than the retention; returns how many went. A `processing` row is never pruned. */
export async function pruneStripeEvents(
  db: Db,
  retentionDays: number = STRIPE_EVENT_RETENTION_DAYS,
): Promise<number> {
  const pruned = await db
    .delete(stripeEvents)
    .where(
      and(
        eq(stripeEvents.status, "processed"),
        sql`${stripeEvents.processedAt} < now() - make_interval(days => ${retentionDays})`,
      ),
    )
    .returning({ id: stripeEvents.id });
  return pruned.length;
}
