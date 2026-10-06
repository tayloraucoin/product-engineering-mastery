/**
 * C1: the request seam returns the user and role from getUser, and refuses a
 * session whose user cannot be fetched.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import type { Logger } from "@pem/observability/logger";

import {
  createAuthContextResolver,
  roleOf,
  type AuthUser,
  type Mirror,
  type MirrorUser,
  type UserReader,
} from "./context.ts";
import { createServerAuthClient } from "./server.ts";
import {
  forgedSessionCookie,
  memoryStore,
  recordingFetch,
  STAGING,
  USER_ID,
} from "./test-helpers.ts";

const silent: Logger = { info() {}, warn() {}, error() {} };

/** A client whose getUser answers as given and whose getSession must never be called. */
function reader(
  answer: { user: AuthUser | null; error?: unknown } | Error,
): UserReader & { calls: number } {
  const client = {
    calls: 0,
    auth: {
      async getUser() {
        client.calls += 1;
        if (answer instanceof Error) throw answer;
        return { data: { user: answer.user }, error: answer.error ?? null };
      },
      getSession() {
        throw new Error("the seam read the unverified session");
      },
    },
  };
  return client;
}

const ana: AuthUser = {
  id: USER_ID,
  email: "ana@example.test",
  app_metadata: { role: "admin" },
};

test("C1: returns the user's id, email and app_metadata role from getUser", async () => {
  const resolve = createAuthContextResolver({ logger: silent });
  assert.deepEqual(await resolve(reader({ user: ana })), {
    userId: USER_ID,
    email: "ana@example.test",
    role: "admin",
  });
});

test("C1: a user without a known app_metadata role is a user; user_metadata is never read", async () => {
  const resolve = createAuthContextResolver({ logger: silent });
  const plain = { id: USER_ID, email: null, app_metadata: { role: "owner" } };
  const selfPromoted = {
    id: USER_ID,
    email: null,
    app_metadata: {},
    user_metadata: { role: "admin" },
  };
  assert.equal((await resolve(reader({ user: plain })))?.role, "user");
  assert.equal((await resolve(reader({ user: selfPromoted })))?.role, "user");
});

test("C1: roleOf returns developer for app_metadata.role developer, admin for admin, and user for a missing or unknown value (LAB-2)", () => {
  const as = (app_metadata: AuthUser["app_metadata"]): AuthUser => ({
    id: USER_ID,
    email: "dev@example.test",
    app_metadata,
  });
  assert.equal(roleOf(as({ role: "developer" })), "developer");
  assert.equal(roleOf(as({ role: "admin" })), "admin");
  assert.equal(roleOf(as({ role: "user" })), "user");
  assert.equal(roleOf(as({})), "user");
  assert.equal(roleOf(as(undefined)), "user");
  for (const unknown of [
    "owner",
    "Developer",
    "DEVELOPER",
    " developer",
    1,
    null,
  ])
    assert.equal(roleOf(as({ role: unknown })), "user");
});

test("C1: refuses when getUser returns an error, even with a user beside it", async () => {
  const resolve = createAuthContextResolver({ logger: silent });
  assert.equal(
    await resolve(reader({ user: ana, error: new Error("invalid JWT") })),
    null,
  );
  assert.equal(await resolve(reader({ user: null })), null);
  assert.equal(await resolve(reader(new Error("Auth unreachable"))), null);
});

test("C1: a forged session cookie is refused when Supabase cannot fetch its user", async () => {
  const fetch = recordingFetch(401, {
    code: 401,
    error_code: "bad_jwt",
    msg: "invalid JWT: unable to parse or verify signature",
  });
  const client = createServerAuthClient(
    STAGING,
    memoryStore([forgedSessionCookie(STAGING)]),
    { fetch },
  );
  // The cookie alone claims an admin: the unverified session would authorize it.
  const { data } = await client.auth.getSession();
  assert.equal(data.session?.user.app_metadata.role, "admin");

  const resolve = createAuthContextResolver({ logger: silent });
  assert.equal(await resolve(client), null);
  assert.ok(
    fetch.urls.some((url) => url === `${STAGING.url}/auth/v1/user`),
    `expected a call to /auth/v1/user, got ${JSON.stringify(fetch.urls)}`,
  );
});

test("C1: the same cookie passes once Supabase returns its user, with the role from that answer", async () => {
  const fetch = recordingFetch(200, {
    id: USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "ana@example.test",
    app_metadata: {},
    user_metadata: {},
    created_at: "2026-10-04T00:00:00Z",
  });
  const client = createServerAuthClient(
    STAGING,
    memoryStore([forgedSessionCookie(STAGING)]),
    { fetch },
  );
  const resolve = createAuthContextResolver({ logger: silent });
  // The cookie said admin; the server's answer has no role, so the seam says user.
  assert.deepEqual(await resolve(client), {
    userId: USER_ID,
    email: "ana@example.test",
    role: "user",
  });
});

test("C1: the mirror is called once per user per process, and again after a refusal, a failure or an email change", async () => {
  const calls: MirrorUser[] = [];
  const outcomes: (Awaited<ReturnType<Mirror>> | Error)[] = [
    "refused",
    new Error("connection refused"),
    "settled",
    "settled",
  ];
  const mirror: Mirror = async (user) => {
    calls.push(user);
    const next = outcomes.shift() ?? "settled";
    if (next instanceof Error) throw next;
    return next;
  };
  const resolve = createAuthContextResolver({ mirror, logger: silent });
  const client = reader({ user: ana });

  for (let i = 0; i < 5; i += 1) await resolve(client);
  assert.equal(calls.length, 3, "refused, failed, settled, then cached");

  await resolve(reader({ user: { ...ana, email: "ana.new@example.test" } }));
  assert.equal(calls.length, 4);
  assert.deepEqual(calls.at(-1), {
    id: USER_ID,
    email: "ana.new@example.test",
  });
});

test("C1: concurrent requests for one user share one mirror call", async () => {
  let calls = 0;
  const mirror: Mirror = async () => {
    calls += 1;
    await new Promise((done) => setTimeout(done, 10));
    return "settled";
  };
  const resolve = createAuthContextResolver({ mirror, logger: silent });
  await Promise.all(
    Array.from({ length: 5 }, () => resolve(reader({ user: ana }))),
  );
  assert.equal(calls, 1);
});

test("C1: an anonymous or refused request never reaches the mirror", async () => {
  let calls = 0;
  const resolve = createAuthContextResolver({
    mirror: async () => {
      calls += 1;
      return "settled";
    },
    logger: silent,
  });
  await resolve(reader({ user: null }));
  await resolve(reader({ user: ana, error: new Error("invalid JWT") }));
  assert.equal(calls, 0);
});
