/**
 * C1: a cookie session and a bearer token resolve to the same ctx.user; a
 * protected procedure refuses an anonymous caller and an admin procedure a
 * non-admin.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { TRPCError } from "@trpc/server";

import { bearerToken, createApiContext } from "./context.ts";
import {
  ACCESS_TOKEN,
  headers,
  SESSION_COOKIE,
  sources,
  supabaseUser,
  USER_ID,
} from "./test-helpers.ts";
import {
  adminProcedure,
  createCallerFactory,
  protectedProcedure,
  publicProcedure,
  router,
} from "./trpc.ts";

const probe = router({
  whoami: publicProcedure.query(({ ctx }) => ctx.user),
  mine: protectedProcedure.query(({ ctx }) => ctx.service.userId),
  everyone: adminProcedure.query(({ ctx }) => ctx.service.role),
});
const createCaller = createCallerFactory(probe);

async function caller(
  entries: Record<string, string>,
  options: Parameters<typeof sources>[0],
) {
  return createCaller(
    await createApiContext(headers(entries), sources(options)),
  );
}

async function codeOf(work: Promise<unknown>): Promise<string> {
  try {
    await work;
  } catch (error) {
    assert.ok(error instanceof TRPCError, `not a TRPCError: ${String(error)}`);
    return error.code;
  }
  assert.fail("the procedure answered");
}

test("C1: a cookie session and a bearer token for one user resolve to the same ctx.user", async () => {
  const fromCookie = await createApiContext(
    headers({ cookie: SESSION_COOKIE }),
    sources({ cookie: SESSION_COOKIE }),
  );
  const fromBearer = await createApiContext(
    headers({ authorization: `Bearer ${ACCESS_TOKEN}` }),
    sources({ cookie: null }),
  );
  const expected = {
    userId: USER_ID,
    email: "ana@example.test",
    role: "user",
  };
  assert.deepEqual(fromCookie.user, expected);
  assert.deepEqual(fromBearer.user, expected);
});

test("C1: an Authorization header decides alone: a refused token is anonymous even beside a good cookie", async () => {
  const context = await createApiContext(
    headers({ cookie: SESSION_COOKIE, authorization: "Bearer forged" }),
    sources({ cookie: SESSION_COOKIE }),
  );
  assert.equal(context.user, null);
});

test("C1: a scheme other than Bearer, or an empty token, is anonymous", async () => {
  for (const authorization of [`Basic ${ACCESS_TOKEN}`, "Bearer", "Bearer  "]) {
    const context = await createApiContext(
      headers({ authorization }),
      sources({ cookie: SESSION_COOKIE }),
    );
    assert.equal(context.user, null, authorization);
  }
  assert.equal(bearerToken(`bearer ${ACCESS_TOKEN}`), ACCESS_TOKEN);
});

test("C1: a protected procedure refuses an anonymous caller with UNAUTHORIZED", async () => {
  const anonymous = await caller({}, { cookie: null });
  assert.equal(await anonymous.whoami(), null);
  assert.equal(await codeOf(anonymous.mine()), "UNAUTHORIZED");
  assert.equal(await codeOf(anonymous.everyone()), "UNAUTHORIZED");
});

test("C1: a protected procedure hands the service a context for the caller, by cookie or by token", async () => {
  const byCookie = await caller(
    { cookie: SESSION_COOKIE },
    { cookie: SESSION_COOKIE },
  );
  const byToken = await caller(
    { authorization: `Bearer ${ACCESS_TOKEN}` },
    { cookie: null },
  );
  assert.equal(await byCookie.mine(), USER_ID);
  assert.equal(await byToken.mine(), USER_ID);
});

test("C1: an admin procedure refuses a non-admin with FORBIDDEN and serves an admin", async () => {
  const plain = await caller(
    { authorization: `Bearer ${ACCESS_TOKEN}` },
    { cookie: null, user: supabaseUser("user") },
  );
  assert.equal(await codeOf(plain.everyone()), "FORBIDDEN");

  const admin = await caller(
    { authorization: `Bearer ${ACCESS_TOKEN}` },
    { cookie: null, user: supabaseUser("admin") },
  );
  assert.equal(await admin.everyone(), "admin");
});
