/**
 * The Stripe webhook ledger (D-STK-11, STK-16): one row per event id the
 * webhook route has taken. A row is `processing` while one delivery holds the
 * event and its handler runs, and `processed` only once that handler has
 * succeeded; a failed handler deletes the row, so Stripe's retry runs it
 * again. Nothing else about the event is kept: the payload stays in Stripe.
 * No user reaches the table; the route writes it on the singleton.
 *
 * Retention: each row points, through Stripe, at a person's payment, so it is
 * kept no longer than it is needed. STK-21 prunes `processed` rows older than
 * 30 days, well past Stripe's three-day retries (remove/billing.md).
 */

import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";

export const STRIPE_EVENT_STATUSES = ["processing", "processed"] as const;
export type StripeEventStatus = (typeof STRIPE_EVENT_STATUSES)[number];

export const stripeEvents = pgTable(
  "stripe_events",
  {
    /** Stripe's event id (`evt_...`): the idempotency key. */
    id: text("id").primaryKey(),
    /** The event type, for reading the ledger; dispatch never reads it back. */
    type: text("type").notNull(),
    status: text("status", { enum: STRIPE_EVENT_STATUSES })
      .notNull()
      .default("processing"),
    /** When the current delivery took the event; a stale claim may be taken over. */
    claimedAt: timestamp("claimed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    /** Set when the handler succeeded; null while processing. */
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    check(
      "stripe_events_status_check",
      sql`${table.status} in ('processing', 'processed')`,
    ),
    // The prune runs after every processed delivery (STK-21): it reads only this.
    index("stripe_events_processed_at_idx")
      .on(table.processedAt)
      .where(sql`${table.status} = 'processed'`),
    ...serviceOnlyPolicies("stripe_events"),
  ],
);

export type StripeEvent = typeof stripeEvents.$inferSelect;
