/**
 * The app's mailer: @pem/email, configured from env.ts. Server-only, since it
 * holds the Resend key. A service sends through it (packages/email/README.md);
 * on the local tier it logs the message instead of sending.
 */

import { createMailer } from "@pem/email/mailer";

import { env } from "../env";

export const mailer = createMailer({
  tier: env.DATABASE_ENVIRONMENT,
  apiKey: env.RESEND_API_KEY,
  fromAddress: env.EMAIL_FROM,
});
