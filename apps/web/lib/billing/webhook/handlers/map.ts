/** The three default handlers, given their dependencies (STK-21). index.ts binds the real ones. */

import type { WebhookHandlers } from "../dispatch.ts";
import { checkoutSessionCompleted } from "./checkout-session-completed.ts";
import { customerSubscriptionDeleted } from "./customer-subscription-deleted.ts";
import { customerSubscriptionUpdated } from "./customer-subscription-updated.ts";
import type { BillingHandlerDeps } from "./deps.ts";

export function createHandlers(deps: BillingHandlerDeps): WebhookHandlers {
  return {
    "checkout.session.completed": checkoutSessionCompleted(deps),
    "customer.subscription.updated": customerSubscriptionUpdated(deps),
    "customer.subscription.deleted": customerSubscriptionDeleted(deps),
  };
}
