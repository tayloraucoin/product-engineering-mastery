/** customer.subscription.updated: a renewal, a plan change, a failed payment (`past_due`), a pause. */

import type { WebhookHandler } from "../dispatch.ts";
import { applyEntitlement, type BillingHandlerDeps } from "./deps.ts";
import { subscriptionInput } from "./subscription.ts";

export function customerSubscriptionUpdated(
  deps: BillingHandlerDeps,
): WebhookHandler<"customer.subscription.updated"> {
  return async (event) => {
    await applyEntitlement(deps, event, () =>
      deps.syncSubscription(subscriptionInput(event, event.data.object)),
    );
  };
}
