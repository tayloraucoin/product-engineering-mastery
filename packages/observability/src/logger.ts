/**
 * The logger (D-STK-12). One call shape at every level:
 *
 *   const log = createLogger("billing");
 *   log.info("checkout.started", { plan: "pro" });
 *   log.error("checkout.failed", { error, userId, tags: { stage: "session" } });
 *
 * `event` is a stable dotted name, never a sentence with values in it; values
 * go in `fields`. Each line prints as `[namespace] event {fields}` on the
 * console method for its level. Fields are redacted before they print
 * (`redact.ts`): no secret, request body or personal data reaches a log, so
 * identify a person by `userId` only.
 *
 * Every string, an error's message and stack included, is also scrubbed of
 * addresses, bearer credentials, JWTs and secret query values.
 *
 * `error` hands `fields.error` (or, when absent, an Error named for the event),
 * redacted `tags` and `userId` to the registered error reporter
 * (`error-reporter.ts`). The error goes as caught, since a reporter needs its
 * stack frames; a reporter that ships it off the host scrubs its text with
 * `scrubText` first (STK-18).
 */

import { reportError } from "./error-reporter.ts";
import { redactFields } from "./redact.ts";

export type LogFields = {
  /** The caught value; on `error` it goes to the reporter. */
  error?: unknown;
  /** The signed-in user's id. */
  userId?: string;
  /** Labels for the reporter to group by; printed with the other fields. */
  tags?: Readonly<Record<string, string>>;
  [field: string]: unknown;
};

type LogMethod = (event: string, fields?: LogFields) => void;

export type Logger = {
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
};

type Level = keyof Logger;

function write(level: Level, prefix: string, event: string, fields?: object) {
  const line = `${prefix} ${event}`;
  if (fields && Object.keys(fields).length > 0) console[level](line, fields);
  else console[level](line);
}

export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;

  return {
    info: (event, fields) =>
      write("info", prefix, event, fields && redactFields(fields)),
    warn: (event, fields) =>
      write("warn", prefix, event, fields && redactFields(fields)),
    error: (event, fields = {}) => {
      const { error, userId, tags, ...rest } = fields;
      write("error", prefix, event, redactFields(fields));
      reportError({
        error: error ?? new Error(`${namespace}: ${event}`),
        tags: {
          ...(redactFields(tags ?? {}) as Record<string, string>),
          namespace,
          event,
        },
        userId,
        context: redactFields(rest),
      });
    },
  };
}
