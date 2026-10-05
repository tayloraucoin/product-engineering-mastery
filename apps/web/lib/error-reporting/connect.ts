/**
 * Plugs Sentry into @pem/observability's vendor-free seam (D-STK-12): with a
 * DSN, the SDK starts and `logger.error` reports through it; without one,
 * nothing starts and the seam keeps its no-op reporter (NN4). Each runtime's
 * `sentry.*.config.ts` calls this with the SDK's own functions, so the rule
 * is tested without the SDK.
 */

import type {
  ErrorReport,
  ErrorReporter,
} from "@pem/observability/error-reporter";

import { sentryOptions, type ReportingTarget } from "./options.ts";

type CaptureContext = {
  tags: Record<string, string>;
  user?: { id: string };
  contexts: { log: Record<string, unknown> };
};

export type ReportingDeps = {
  init: (options: ReturnType<typeof sentryOptions>) => unknown;
  capture: (error: unknown, context: CaptureContext) => unknown;
  register: (reporter: ErrorReporter) => unknown;
};

/** An ErrorReport as Sentry's capture call: tags, the user as an id, the redacted fields as a context. */
export function toCapture(report: ErrorReport): CaptureContext {
  return {
    tags: { ...report.tags },
    ...(report.userId ? { user: { id: report.userId } } : {}),
    contexts: { log: { ...report.context } },
  };
}

/** Starts the SDK and registers its reporter when `dsn` is set. Returns whether it did. */
export function connectErrorReporting(
  target: { dsn: string | undefined; environment: string },
  deps: ReportingDeps,
): boolean {
  if (!target.dsn) return false;
  const resolved: ReportingTarget = {
    dsn: target.dsn,
    environment: target.environment,
  };
  deps.init(sentryOptions(resolved));
  deps.register((report) => {
    deps.capture(report.error, toCapture(report));
  });
  return true;
}
