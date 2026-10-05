/**
 * Sentry in the Node.js runtime (STK-18), started by instrumentation.ts.
 * Without the tier's DSN nothing starts (lib/error-reporting/connect.ts).
 */

import * as Sentry from "@sentry/nextjs";

import { registerErrorReporter } from "@pem/observability/error-reporter";

import { env } from "./env";
import { connectErrorReporting } from "./lib/error-reporting/connect";

connectErrorReporting(
  {
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  },
  {
    init: Sentry.init,
    capture: Sentry.captureException,
    register: registerErrorReporter,
  },
);
