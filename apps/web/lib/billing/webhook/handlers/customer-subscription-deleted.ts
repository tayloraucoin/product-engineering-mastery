/** customer.subscription.deleted: the subscription has ended; the entitlement is `canceled`. */

import type { WebhookHandler } from "../dispatch.ts";
import { applyEntitlement, type BillingHandlerDeps } from "./deps.ts";
import { subscriptionInput } from "./subscription.ts";

export function customerSubscriptionDeleted(
  deps: BillingHandlerDeps,
): WebhookHandler<"customer.subscription.deleted"> {
  return async (event) => {
    await applyEntitlement(deps, event, () =>
      deps.syncSubscription(
        subscriptionInput(event, event.data.object, "canceled"),
      ),
    );
  };
}
