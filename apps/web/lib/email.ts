/**
 * The app's mailer: @pem/email, configured from env.ts. Server-only, since it
 * holds the Resend key (check-client-bundle plants a sentinel for it). A
 * service sends through it (packages/email/README.md); on the local tier it
 * logs the message instead of sending.
 */

import "server-only";

import { createMailer } from "@pem/email/mailer";

import { env, productionRuntime } from "../env";

export const mailer = createMailer({
  tier: env.DATABASE_ENVIRONMENT,
  apiKey: env.RESEND_API_KEY,
  fromAddress: env.EMAIL_FROM,
  deployed: productionRuntime,
});
