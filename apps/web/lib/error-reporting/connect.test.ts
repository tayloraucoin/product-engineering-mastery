import assert from "node:assert/strict";
import { test } from "node:test";

import type { ErrorReporter } from "@pem/observability/error-reporter";

import { connectErrorReporting, type ReportingDeps } from "./connect.ts";
import { resolveSentryDsn } from "./dsn.ts";
import { DATA_COLLECTION } from "./options.ts";

const PRODUCTION_DSN = "https://public@o0.ingest.us.sentry.io/1";
const STAGING_DSN = "https://public@o0.ingest.us.sentry.io/2";

/** A source with production's and staging's DSNs set, as a developer's .env.local might hold them. */
const source = {
  NEXT_PUBLIC_SENTRY_DSN: PRODUCTION_DSN,
  NEXT_PUBLIC_SENTRY_DSN_STAGING: STAGING_DSN,
};

/** Fakes for the SDK and the seam, recording every call. */
function fakes() {
  const calls = {
    init: [] as unknown[],
    capture: [] as unknown[][],
    reporters: [] as ErrorReporter[],
  };
  const deps: ReportingDeps = {
    init: (options) => calls.init.push(options),
    capture: (error, context) => calls.capture.push([error, context]),
    register: (reporter) => calls.reporters.push(reporter),
  };
  return { calls, deps };
}

test("on local nothing registers, though production's and staging's DSNs are set", () => {
  const { calls, deps } = fakes();
  const dsn = resolveSentryDsn(source, "local");
  assert.equal(dsn, undefined);
  assert.equal(
    connectErrorReporting({ dsn, environment: "local" }, deps),
    false,
  );
  assert.equal(calls.init.length, 0);
  assert.equal(calls.reporters.length, 0);
});

test("each tier reads only its own DSN, never production's", () => {
  assert.equal(resolveSentryDsn(source, "staging"), STAGING_DSN);
  assert.equal(resolveSentryDsn(source, "production"), PRODUCTION_DSN);
  assert.equal(
    resolveSentryDsn({ NEXT_PUBLIC_SENTRY_DSN: PRODUCTION_DSN }, "staging"),
    undefined,
  );
  assert.equal(
    resolveSentryDsn({ NEXT_PUBLIC_SENTRY_DSN_LOCAL: "  " }, "local"),
    undefined,
  );
});

test("a local DSN set on purpose registers", () => {
  const { calls, deps } = fakes();
  const dsn = resolveSentryDsn(
    { NEXT_PUBLIC_SENTRY_DSN_LOCAL: "https://public@o0.ingest.us.sentry.io/3" },
    "local",
  );
  assert.equal(
    connectErrorReporting({ dsn, environment: "local" }, deps),
    true,
  );
  assert.equal(calls.reporters.length, 1);
});

test("with a DSN, the SDK starts with every data category off and the reporter is registered", () => {
  const { calls, deps } = fakes();
  const dsn = resolveSentryDsn(source, "staging");
  assert.equal(
    connectErrorReporting({ dsn, environment: "staging" }, deps),
    true,
  );
  const [options] = calls.init as Record<string, unknown>[];
  assert.equal(options?.dsn, STAGING_DSN);
  assert.equal(options?.environment, "staging");
  assert.equal(options?.sendDefaultPii, false);
  assert.equal(options?.enableLogs, false);
  assert.equal(options?.dataCollection, DATA_COLLECTION);
  for (const key of ["tracesSampleRate", "tracesSampler", "profilesSampleRate"])
    assert.ok(!(key in options!), `${key} is set`);
  const integrations = options?.integrations as (
    defaults: { name: string }[],
  ) => { name: string }[];
  assert.deepEqual(
    integrations([{ name: "BrowserTracing" }, { name: "Dedupe" }]),
    [{ name: "Dedupe" }],
  );

  assert.equal(calls.reporters.length, 1);
  const error = new Error("synthetic");
  void calls.reporters[0]!({
    error,
    tags: { namespace: "billing", event: "checkout.failed" },
    userId: "user_123",
    context: { plan: "pro" },
  });
  assert.deepEqual(calls.capture, [
    [
      error,
      {
        tags: { namespace: "billing", event: "checkout.failed" },
        user: { id: "user_123" },
        contexts: { log: { plan: "pro" } },
      },
    ],
  ]);
});

test("every dataCollection category is set explicitly", () => {
  assert.deepEqual(Object.keys(DATA_COLLECTION).sort(), [
    "cookies",
    "databaseQueryData",
    "frameContextLines",
    "genAI",
    "graphQL",
    "httpBodies",
    "httpHeaders",
    "queues",
    "stackFrameVariables",
    "urlQueryParams",
    "userInfo",
  ]);
});
