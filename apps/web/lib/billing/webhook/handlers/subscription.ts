/** The service input both subscription handlers send, from a subscription object. */

import type Stripe from "stripe";

import { occurredAt, stripeId } from "./deps.ts";

export function subscriptionInput(
  event: { created: number },
  subscription: Stripe.Subscription,
  status: string = subscription.status,
) {
  const item = subscription.items.data[0];
  return {
    customerId: stripeId(subscription.customer),
    subscriptionId: subscription.id,
    status,
    priceId: item?.price.id ?? null,
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
    userId: subscription.metadata.user_id ?? null,
    occurredAt: occurredAt(event),
  };
}
