/**
 * The entitlement service's inputs (D-STK-11, STK-21): what a webhook handler
 * hands over once it has read a verified Stripe event. Each is checked here
 * before the service touches the database, so a malformed or unexpected
 * object from Stripe stops at the validator, never half-way through a write.
 */

import { z } from "zod";

const stripeId = (prefix: string, what: string) =>
  z
    .string()
    .startsWith(prefix, { error: `Name the ${what} by its Stripe id.` });

export const stripeCustomerId = stripeId("cus_", "customer");
export const stripeSubscriptionId = stripeId("sub_", "subscription");

/** Stripe's subscription statuses that entitle the user to the plan. */
export const ENTITLED_STATUSES = ["active", "trialing"] as const;

/** When Stripe created the event: entitlements apply events in this order. */
const occurredAt = z.date({ error: "Say when Stripe created the event." });

/**
 * checkout.session.completed for a subscription: the checkout names the user
 * (`client_reference_id`, set server-side by the app from the signed-in
 * session when it created the checkout, never from the client) and
 * Stripe names the customer it made for them.
 */
export const completeCheckoutInput = z.object({
  userId: z.uuid({ error: "The checkout names no user of this app." }),
  customerId: stripeCustomerId,
  subscriptionId: stripeSubscriptionId.nullable(),
  /** `payment_status` is `paid` or `no_payment_required`. */
  paid: z.boolean(),
  occurredAt,
});

/**
 * customer.subscription.updated and .deleted: the subscription's state.
 * `userId` is the subscription's `metadata.user_id`, when the checkout set
 * one, for an update that arrives before its checkout.
 */
export const syncSubscriptionInput = z.object({
  customerId: stripeCustomerId,
  subscriptionId: stripeSubscriptionId,
  status: z.string().min(1, { error: "Give the subscription's status." }),
  priceId: z.string().startsWith("price_").nullable(),
  currentPeriodEnd: z.date().nullable(),
  // Only a fallback for an update that beats its checkout: anything but a
  // uuid is read as no user, never as a reason to drop the event. Trusted
  // because the app sets it server-side from the session when it creates the
  // checkout; never take it from the client.
  userId: z.uuid().nullable().catch(null),
  occurredAt,
});

export type CompleteCheckoutInput = z.input<typeof completeCheckoutInput>;
export type SyncSubscriptionInput = z.input<typeof syncSubscriptionInput>;
