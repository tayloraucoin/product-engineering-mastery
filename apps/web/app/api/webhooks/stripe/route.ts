/**
 * Stripe's webhook endpoint (D-STK-8, D-STK-11): a Route Handler that reads
 * the raw body, since the signature covers its exact bytes, and hands it to
 * handleStripeWebhook (_lib/handle.ts), which verifies it, claims the event
 * id in the ledger and dispatches through the handler map.
 * The route writes nothing to the database but the ledger. Locally,
 * `yarn stripe:listen` forwards test events here.
 */

import { env } from "@/env";

import { handleStripeWebhook } from "./_lib/handle";
import { handlers } from "./_lib/handlers";
import { databaseLedger } from "./_lib/ledger";

/** Shorter than the ledger's lease (STRIPE_EVENT_LEASE_SECONDS), so a live claim is never taken over. */
export const maxDuration = 60;

export async function POST(request: Request) {
  const { status, body } = await handleStripeWebhook(
    {
      body: await request.text(),
      signature: request.headers.get("stripe-signature"),
    },
    {
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      livemode: env.DATABASE_ENVIRONMENT === "production",
      handlers,
      ledger: databaseLedger,
    },
  );
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
