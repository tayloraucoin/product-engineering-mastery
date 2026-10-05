/**
 * The webhook ledger bound to this app's database (STK-16): @pem/db's three
 * writes on the runtime singleton, which bypasses row-level security as the
 * table's service-only policy expects. Without a database URL each write
 * throws, so the route answers 500 and Stripe retries until one is set.
 */

import "server-only";

import { getDb } from "@pem/db/client";
import {
  claimStripeEvent,
  markStripeEventProcessed,
  releaseStripeEvent,
} from "@pem/db/stripe-event-ledger";

import { env } from "../../../env";
import type { WebhookLedger } from "./handle.ts";

function db() {
  if (!env.DATABASE_URL)
    throw new Error(
      "DATABASE_URL is unset for this tier; the webhook ledger has nowhere to write.",
    );
  return getDb({ url: env.DATABASE_URL, tier: env.DATABASE_ENVIRONMENT });
}

export const databaseLedger: WebhookLedger = {
  claim: (event) => claimStripeEvent(db(), event),
  markProcessed: (id) => markStripeEventProcessed(db(), id),
  release: (id) => releaseStripeEvent(db(), id),
};
