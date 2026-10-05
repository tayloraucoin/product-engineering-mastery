/**
 * The app's Stripe client (D-STK-11, D-STK-16: `stripe` is owned by apps/web
 * and imported nowhere else). Server-only: it holds the secret key, which
 * env.ts has already matched to the tier by its prefix (D-STK-4). Checkout and
 * portal sessions are created through it (STK-21); the webhook route needs
 * only the signing secret and never calls Stripe.
 */

import "server-only";

import Stripe from "stripe";

import { env } from "../../env";

let client: Stripe | undefined;

/** Whether this tier has a Stripe key; without one the app serves with billing off. */
export const billingConfigured = Boolean(env.STRIPE_SECRET_KEY);

/** The tier's price to sell, or undefined when it is not set. */
export const stripePriceId = env.STRIPE_PRICE_ID;

/** The one client for this process; throws, naming the variable, when the tier has no key. */
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY)
    throw new Error(
      "STRIPE_SECRET_KEY is unset for this tier; billing is off (see .env.example).",
    );
  client ??= new Stripe(env.STRIPE_SECRET_KEY, {
    appInfo: { name: "pem-web" },
  });
  return client;
}
