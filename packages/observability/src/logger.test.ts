/** C1 and C2: the logger hands errors to the reporter, survives a failing one, and redacts secret-like keys. */

import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import { registerErrorReporter, type ErrorReport } from "./error-reporter.ts";
import { createLogger } from "./logger.ts";
import { REDACTED, scrubText } from "./redact.ts";

let restore: (() => void) | undefined;

afterEach(() => {
  restore?.();
  restore = undefined;
  mock.restoreAll();
});

/** Captures what the logger prints at `level`, without printing it. */
function capture(level: "info" | "warn" | "error") {
  return mock.method(console, level, () => undefined);
}

test("C1: logger.error passes the error, tags and user id to the registered reporter", () => {
  capture("error");
  const reports: ErrorReport[] = [];
  restore = registerErrorReporter((report) => {
    reports.push(report);
  });
  const error = new Error("synthetic failure");

  createLogger("billing").error("checkout.failed", {
    error,
    userId: "user_123",
    tags: { stage: "session" },
    plan: "pro",
  });

  assert.equal(reports.length, 1);
  const [report] = reports;
  assert.equal(report?.error, error);
  assert.equal(report?.userId, "user_123");
  assert.deepEqual(report?.tags, {
    stage: "session",
    namespace: "billing",
    event: "checkout.failed",
  });
  assert.deepEqual(report?.context, { plan: "pro" });
});

test("C1: logger.error with no error hands the reporter one named for the event", () => {
  capture("error");
  const reports: ErrorReport[] = [];
  restore = registerErrorReporter((report) => {
    reports.push(report);
  });

  createLogger("billing").error("checkout.stalled");

  assert.ok(reports[0]?.error instanceof Error);
  assert.equal(
    (reports[0]?.error as Error).message,
    "billing: checkout.stalled",
  );
});

test("C1: a reporter that throws is swallowed, and the line still prints", () => {
  const printed = capture("error");
  restore = registerErrorReporter(() => {
    throw new Error("reporter down");
  });

  assert.doesNotThrow(() =>
    createLogger("billing").error("checkout.failed", {
      error: new Error("synthetic"),
    }),
  );
  assert.equal(printed.mock.callCount(), 1);
});

test("C1: a reporter that rejects is swallowed", async () => {
  capture("error");
  let unhandled = false;
  const onUnhandled = () => {
    unhandled = true;
  };
  process.on("unhandledRejection", onUnhandled);
  restore = registerErrorReporter(() =>
    Promise.reject(new Error("reporter down")),
  );

  createLogger("billing").error("checkout.failed");
  await new Promise((resolve) => setImmediate(resolve));

  process.off("unhandledRejection", onUnhandled);
  assert.equal(unhandled, false);
});

test("C1: the default reporter is a no-op", () => {
  capture("error");
  assert.doesNotThrow(() => createLogger("billing").error("checkout.failed"));
});

test("C2: a secret-like key is redacted at any depth, whatever its case", () => {
  const printed = capture("info");

  createLogger("auth").info("session.refreshed", {
    userId: "user_123",
    password: "hunter2",
    token: "tok_synthetic",
    Authorization: "Bearer synthetic",
    headers: { authorization: "Bearer synthetic", accept: "text/html" },
    resendApiKey: "re_synthetic",
    attempts: [{ refresh_token: "rt_synthetic", ok: true }],
  });

  const [line, fields] = printed.mock.calls[0]?.arguments ?? [];
  assert.equal(line, "[auth] session.refreshed");
  assert.deepEqual(fields, {
    userId: "user_123",
    password: REDACTED,
    token: REDACTED,
    Authorization: REDACTED,
    headers: { authorization: REDACTED, accept: "text/html" },
    resendApiKey: REDACTED,
    attempts: [{ refresh_token: REDACTED, ok: true }],
  });
});

test("C2: request bodies and personal data are redacted too", () => {
  const printed = capture("warn");

  createLogger("api").warn("request.rejected", {
    body: { name: "Synthetic Person" },
    email: "person@example.test",
    phone: "+1 555 0100",
    route: "/api/example",
  });

  assert.deepEqual(printed.mock.calls[0]?.arguments[1], {
    body: REDACTED,
    email: REDACTED,
    phone: REDACTED,
    route: "/api/example",
  });
});

test("C2: the reporter's context is redacted; the error itself is passed as caught", () => {
  const printed = capture("error");
  const reports: ErrorReport[] = [];
  restore = registerErrorReporter((report) => {
    reports.push(report);
  });

  createLogger("auth").error("sign_in.failed", {
    error: new Error("synthetic"),
    password: "hunter2",
  });

  assert.deepEqual(reports[0]?.context, { password: REDACTED });
  const printedFields = printed.mock.calls[0]?.arguments[1] as Record<
    string,
    unknown
  >;
  assert.equal(printedFields.password, REDACTED);
  assert.deepEqual(Object.keys(printedFields.error as object).sort(), [
    "message",
    "name",
    "stack",
  ]);
});

test("C2: personal data and request bodies are redacted under their common compound names", () => {
  const printed = capture("info");

  createLogger("signup").info("signup.completed", {
    userEmail: "person@example.test",
    emailAddress: "person@example.test",
    phoneNumber: "+1 555 0100",
    ipAddress: "192.0.2.1",
    ip: "192.0.2.1",
    firstName: "Synthetic",
    input: { name: "Synthetic Person" },
    payload: { note: "synthetic" },
    responseBody: "synthetic",
    plan: "pro",
  });

  const fields = printed.mock.calls[0]?.arguments[1] as Record<string, unknown>;
  for (const key of [
    "userEmail",
    "emailAddress",
    "phoneNumber",
    "ipAddress",
    "ip",
    "firstName",
    "input",
    "payload",
    "responseBody",
  ])
    assert.equal(fields[key], REDACTED, key);
  assert.equal(fields.plan, "pro");
});

test("C1: a secret-like tag is redacted before it reaches the reporter", () => {
  capture("error");
  const reports: ErrorReport[] = [];
  restore = registerErrorReporter((report) => {
    reports.push(report);
  });

  createLogger("billing").error("checkout.failed", {
    tags: { stage: "session", email: "person@example.test" },
  });

  assert.deepEqual(reports[0]?.tags, {
    stage: "session",
    email: REDACTED,
    namespace: "billing",
    event: "checkout.failed",
  });
});

test("C2: free text is scrubbed of addresses, bearer credentials, JWTs and secret query values", () => {
  assert.equal(scrubText("sent to person@example.test"), `sent to ${REDACTED}`);
  assert.equal(
    scrubText("Authorization: Bearer abc.def-123"),
    `Authorization: Bearer ${REDACTED}`,
  );
  assert.equal(
    scrubText("jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl here"),
    `jwt ${REDACTED} here`,
  );
  assert.equal(
    scrubText("GET /auth/callback?code=abc123&next=/home&token=xyz"),
    `GET /auth/callback?code=${REDACTED}&next=/home&token=${REDACTED}`,
  );
  assert.equal(
    scrubText("checkout.failed for plan pro"),
    "checkout.failed for plan pro",
  );
});

test("C2: an error's message and stack are scrubbed on the printed line", () => {
  const printed = capture("error");

  createLogger("auth").error("reset.failed", {
    error: new Error("no user person@example.test for token=abc123"),
    note: "reply to person@example.test",
  });

  const fields = printed.mock.calls[0]?.arguments[1] as {
    error: { message: string; stack: string };
    note: string;
  };
  assert.equal(
    fields.error.message,
    `no user ${REDACTED} for token=${REDACTED}`,
  );
  assert.ok(!fields.error.stack.includes("person@example.test"));
  assert.equal(fields.note, `reply to ${REDACTED}`);
});
