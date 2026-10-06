/**
 * The error-reporter seam (D-STK-12): vendor-free. The default reporter does
 * nothing; an app registers one at startup (STK-18 registers Sentry in
 * apps/web), and `logger.error` hands it every error. Reporting is never on
 * the critical path: a reporter that throws or rejects is swallowed.
 */

export type ErrorReport = {
  /** The thrown value, as caught. */
  error: unknown;
  /** Low-cardinality labels for grouping; the logger adds `namespace` and `event`. */
  tags: Readonly<Record<string, string>>;
  /** The signed-in user's id, never an address or a name. */
  userId?: string;
  /** The log call's other fields, already redacted. */
  context: Readonly<Record<string, unknown>>;
};

export type ErrorReporter = (report: ErrorReport) => void | Promise<void>;

const noopReporter: ErrorReporter = () => undefined;

let current: ErrorReporter = noopReporter;

/** Sets the reporter every `logger.error` uses. Returns a function that restores the previous one. */
export function registerErrorReporter(reporter: ErrorReporter): () => void {
  const previous = current;
  current = reporter;
  return () => {
    current = previous;
  };
}

/** Hands a report to the registered reporter. Never throws and never rejects. */
export function reportError(report: ErrorReport): void {
  try {
    void Promise.resolve(current(report)).catch(() => undefined);
  } catch {
    // A failing reporter must not take the caller down with it.
  }
}
