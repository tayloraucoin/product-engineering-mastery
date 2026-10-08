import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { GRANT_ADMIN_ERRORS, grantAdmin } from "./grant-admin.ts";

const KEY = "sb_secret_synthetic_grant_admin_key";
const JWT_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.c2ln";
const AUTH = "https://stagingref0000000000.supabase.co";

type StoredUser = {
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
};

/** The Auth admin API in memory: list users by page, update one by id. */
function stubAuth(users: StoredUser[]) {
  const store = new Map(users.map((u) => [u.id, structuredClone(u)]));
  const calls: { method: string; url: string; init: RequestInit }[] = [];
  const send = (async (
    input: string | URL | Request,
    init: RequestInit = {},
  ) => {
    const url = new URL(String(input));
    const method = init.method ?? "GET";
    calls.push({ method, url: url.toString(), init });
    if (method === "GET" && url.pathname === "/auth/v1/admin/users")
      return Response.json({ users: [...store.values()] });
    const match = /^\/auth\/v1\/admin\/users\/(.+)$/.exec(url.pathname);
    if (method === "PUT" && match && store.has(match[1]!)) {
      const body = JSON.parse(String(init.body)) as {
        app_metadata: Record<string, unknown>;
      };
      store.get(match[1]!)!.app_metadata = body.app_metadata;
      return Response.json(store.get(match[1]!));
    }
    return new Response("not found", { status: 404 });
  }) as typeof fetch;
  return { send, calls, store };
}

const ana: StoredUser = {
  id: "00000000-0000-4000-8000-0000000000a1",
  email: "ana@example.com",
  app_metadata: { provider: "email", providers: ["email"] },
};

const options = (send: typeof fetch, email = "Ana@Example.com ") => ({
  email,
  authUrl: AUTH,
  serviceRoleKey: KEY,
  authUrlName: "NEXT_PUBLIC_SUPABASE_URL_STAGING",
  fetch: send,
});

describe("C5: db:grant-admin", () => {
  test("C5: makes an existing account admin and keeps its other app_metadata keys", async () => {
    const auth = stubAuth([ana]);
    assert.equal(await grantAdmin(options(auth.send)), "granted");
    assert.deepEqual(auth.store.get(ana.id)!.app_metadata, {
      provider: "email",
      providers: ["email"],
      role: "admin",
    });
    const put = auth.calls.find((c) => c.method === "PUT")!;
    assert.equal(new URL(put.url).pathname, `/auth/v1/admin/users/${ana.id}`);
  });

  test("C5: refuses an unknown email with a fixed message that does not echo it, and writes nothing", async () => {
    const auth = stubAuth([ana]);
    await assert.rejects(
      grantAdmin(options(auth.send, "nobody-xyz@example.com")),
      (error: Error) => {
        assert.equal(error.message, GRANT_ADMIN_ERRORS.unknown);
        assert.doesNotMatch(error.message, /nobody-xyz/);
        return true;
      },
    );
    assert.ok(auth.calls.every((c) => c.method === "GET"));
  });

  test("C5: a second run changes nothing", async () => {
    const auth = stubAuth([ana]);
    await grantAdmin(options(auth.send));
    const before = structuredClone(auth.store.get(ana.id));
    const puts = auth.calls.filter((c) => c.method === "PUT").length;
    assert.equal(await grantAdmin(options(auth.send)), "already-admin");
    assert.deepEqual(auth.store.get(ana.id), before);
    assert.equal(auth.calls.filter((c) => c.method === "PUT").length, puts);
  });

  test("C5: every request refuses redirects, and no message carries the key", async () => {
    for (const key of [KEY, JWT_KEY]) {
      const auth = stubAuth([ana]);
      await grantAdmin({ ...options(auth.send), serviceRoleKey: key });
      for (const call of auth.calls) {
        assert.equal(call.init.redirect, "error");
        assert.equal((call.init.headers as Record<string, string>).apikey, key);
      }
      // A failing API: the error names the status, never the key.
      const failing = (async () =>
        new Response(`denied for ${key}`, { status: 401 })) as typeof fetch;
      await assert.rejects(
        grantAdmin({ ...options(failing), serviceRoleKey: key }),
        (error: Error) => {
          assert.doesNotMatch(error.message, new RegExp(key.slice(0, 12)));
          assert.match(error.message, /401/);
          return true;
        },
      );
    }
    const jwt = stubAuth([ana]);
    await grantAdmin({ ...options(jwt.send), serviceRoleKey: JWT_KEY });
    assert.equal(
      (jwt.calls[0]!.init.headers as Record<string, string>).authorization,
      `Bearer ${JWT_KEY}`,
    );
  });

  test("C5: a missing email, URL or key is refused before anything is sent", async () => {
    const auth = stubAuth([ana]);
    await assert.rejects(grantAdmin(options(auth.send, "")), {
      message: GRANT_ADMIN_ERRORS.usage,
    });
    await assert.rejects(
      grantAdmin({ ...options(auth.send), serviceRoleKey: undefined }),
      { message: GRANT_ADMIN_ERRORS.key },
    );
    await assert.rejects(
      grantAdmin({ ...options(auth.send), authUrl: undefined }),
      /NEXT_PUBLIC_SUPABASE_URL_STAGING is unset/,
    );
    assert.equal(auth.calls.length, 0);
  });
});
