/**
 * Sentry in the browser (STK-18). Next runs this before the app hydrates.
 * The DSN and the tier are the values next.config.ts inlined; without a DSN
 * nothing starts and `logger.error` keeps its no-op reporter.
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
