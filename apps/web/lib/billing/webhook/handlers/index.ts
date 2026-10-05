/**
 * The handler map the webhook route dispatches through (D-STK-11). One entry
 * per event the product acts on, each imported from its own file here:
 *
 *   import { checkoutSessionCompleted } from "./checkout-session-completed.ts";
 *   export const handlers: WebhookHandlers = {
 *     "checkout.session.completed": checkoutSessionCompleted,
 *   };
 *
 * Empty until the default handlers land (STK-21): every event is acknowledged
 * and dispatched nowhere. Subscribe the webhook endpoint in Stripe to the
 * types listed here, and to nothing else.
 */

import type { WebhookHandlers } from "../dispatch.ts";

export const handlers: WebhookHandlers = {};
