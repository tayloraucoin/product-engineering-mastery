/**
 * What a user's subscription entitles them to (D-STK-11, STK-21): one row per
 * user, written only by the entitlement service (@pem/services/billing) from
 * verified Stripe events. The row links the user to their Stripe customer and
 * mirrors the subscription's state; `isEntitled` in the service reads it.
 *
 * No user reaches the table: a user who could write their own row could grant
 * themselves the plan. Reads for the signed-in user go through a service too.
 * Deleting the user deletes the row; the customer and its payments stay in
 * Stripe, where an erasure request is answered (remove/billing.md).
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { serviceOnlyPolicies } from "../../policies.ts";
import { users } from "../account/users.ts";

export const billingEntitlements = pgTable(
  "billing_entitlements",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Stripe's customer id (`cus_...`): how a subscription event finds its user. */
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    /** The subscription (`sub_...`); null until checkout creates one. */
    stripeSubscriptionId: text("stripe_subscription_id"),
    /** The subscribed price (`price_...`): the plan. */
    priceId: text("price_id"),
    /** Stripe's subscription status, as last reported. */
    status: text("status").notNull(),
    /** End of the period paid for; access may run to it after a cancellation. */
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    /** When Stripe created the newest event applied: an older event arriving late changes nothing. */
    stripeEventAt: timestamp("stripe_event_at", {
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  () => serviceOnlyPolicies("billing_entitlements"),
);

export type BillingEntitlement = typeof billingEntitlements.$inferSelect;
