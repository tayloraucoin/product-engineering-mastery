/**
 * The handler map the webhook route dispatches through (D-STK-11). One entry
 * per event the product acts on, each in its own file here, registered in
 * map.ts. The defaults (STK-21):
 *
 * - checkout.session.completed: links the user to their Stripe customer.
 * - customer.subscription.updated: the subscription's status, plan and period.
 * - customer.subscription.deleted: the entitlement ends.
 *
 * Subscribe the webhook endpoint in Stripe to these three types and nothing
 * else. Every handler writes through the entitlement service
 * (@pem/services/billing), never the database directly.
 */

import "server-only";

import { createLogger } from "@pem/observability/logger";
import { completeCheckout, syncSubscription } from "@pem/services/billing";
import { createSystemContext } from "@pem/services/context";

import type { WebhookHandlers } from "../dispatch.ts";
import { webhookDb } from "../ledger.ts";
import { createHandlers } from "./map.ts";

export const handlers: WebhookHandlers = createHandlers({
  completeCheckout: (input) =>
    completeCheckout(createSystemContext(webhookDb()), input),
  syncSubscription: (input) =>
    syncSubscription(createSystemContext(webhookDb()), input),
  log: createLogger("billing"),
});
