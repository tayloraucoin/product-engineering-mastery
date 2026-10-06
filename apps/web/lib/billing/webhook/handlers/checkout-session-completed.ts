/**
 * checkout.session.completed: the user paid (or started a trial) in Stripe
 * Checkout. The app creates each subscription checkout with
 * `client_reference_id` set to the signed-in user's id and
 * `subscription_data.metadata.user_id` to the same; this links that user to
 * the customer Stripe made. A one-off payment checkout is not a subscription
 * and is left alone.
 */

import type { WebhookHandler } from "../dispatch.ts";
import {
  applyEntitlement,
  occurredAt,
  stripeId,
  type BillingHandlerDeps,
} from "./deps.ts";

export function checkoutSessionCompleted(
  deps: BillingHandlerDeps,
): WebhookHandler<"checkout.session.completed"> {
  return async (event) => {
    const session = event.data.object;
    if (session.mode !== "subscription") return;
    await applyEntitlement(deps, event, () =>
      deps.completeCheckout({
        userId: session.client_reference_id,
        customerId: stripeId(session.customer),
        subscriptionId: stripeId(session.subscription),
        paid: session.payment_status !== "unpaid",
        occurredAt: occurredAt(event),
      }),
    );
  };
}
