/**
 * Integration tests for the local auth mirror (D-STK-6), against the database
 * `yarn db:local` starts (`yarn test:db`; never part of `yarn test`). They
 * migrate, apply the setup SQL, create the marker as db:local does, then mirror
 * synthetic users and read back auth.users and public.users. The two refusal
 * cases run inside a transaction that is rolled back: one creates
 * auth.identities as Supabase Auth's own role would, the other drops the
 * marker. An absent database fails the run and names `yarn db:local`.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, mock, test } from "node:test";
import postgres from "postgres";

import {
  applySetup,
  openMigrationClient,
  runMigrations,
} from "../scripts/database.ts";
import { migrationUrl, tier } from "../scripts/env.ts";
import { markLocalAuthMirror } from "../scripts/local-auth-marker.ts";
import { describeUrl } from "../src/connection.ts";
import {
  applyLocalAuthMirror,
  clearLocalAuthMirrorCache,
  MARKER_TABLE,
  MIRROR_CACHE_TTL_MS,
} from "../src/local-auth-mirror.ts";
import { assertLoopbackClient } from "../src/loopback.ts";

const created: string[] = [];
let admin: postgres.Sql | undefined;
let authAdmin: postgres.Sql | undefined;

/** A fresh synthetic user, removed again after the run. */
function syntheticUser(label: string) {
  const id = randomUUID();
  created.push(id);
  return { id, email: `${label}-${id.slice(0, 8)}@example.test` };
}

async function authRow(id: string) {
  const client = admin;
  assert.ok(client);
  const rows = await client<{ row: Record<string, unknown> }[]>`
    select to_jsonb(u) as row from auth.users u where u.id = ${id}`;
  return rows[0]?.row;
}

async function publicEmail(id: string) {
  const client = admin;
  assert.ok(client);
  const rows = await client<{ email: string | null }[]>`
    select email from public.users where id = ${id}`;
  return rows.map((row) => row.email);
}

before(async () => {
  if (tier !== "local") {
    throw new Error(
      `yarn test:db runs only against the local database; DATABASE_ENVIRONMENT is ${tier}.`,
    );
  }
  const url = migrationUrl();
  const client = openMigrationClient(url, tier);
  assertLoopbackClient(client);
  try {
    await client`select 1`;
  } catch (error) {
    await client.end({ timeout: 0 });
    throw new Error(
      `The local database is not reachable at ${describeUrl(url)}. Start it with yarn db:local, then rerun yarn test:db. (${error instanceof Error ? error.message : String(error)})`,
    );
  }
  admin = client;
  await runMigrations(client);
  await applySetup(client);
  const marker = await markLocalAuthMirror(client);
  assert.equal(
    marker,
    "marked",
    "auth.identities exists: this database belongs to Supabase Auth (Mode B). Run yarn db:stop --no-backup, then yarn db:local.",
  );

  // Supabase Auth's own role, which creates auth.identities on a real auth
  // database. The CLI gives it the database password.
  const auth = new URL(url);
  auth.username = "supabase_auth_admin";
  authAdmin = postgres(auth.toString(), { max: 1, onnotice: () => {} });
});

after(async () => {
  await authAdmin?.end();
  if (!admin) return;
  if (created.length > 0) {
    await admin`delete from auth.users where id in ${admin(created)}`;
  }
  await admin.end();
});

beforeEach(() => clearLocalAuthMirrorCache());

describe("the mirror on a marked database without auth.identities", () => {
  test("inserts id and email only, and the trigger creates public.users", async () => {
    const user = syntheticUser("insert");
    assert.ok(admin);
    assert.equal(await applyLocalAuthMirror(admin, user), "inserted");

    const row = await authRow(user.id);
    assert.ok(row);
    const filled = Object.entries(row)
      .filter(([, value]) => value !== null)
      .map(([column]) => column)
      .sort();
    assert.deepEqual(filled, ["email", "id"]);
    assert.equal(row.email, user.email);
    assert.deepEqual(await publicEmail(user.id), [user.email]);
  });

  test("a repeat call is served from the per-process cache, then unchanged", async () => {
    const user = syntheticUser("repeat");
    assert.ok(admin);
    assert.equal(await applyLocalAuthMirror(admin, user), "inserted");
    assert.equal(await applyLocalAuthMirror(admin, user), "cached");
    clearLocalAuthMirrorCache();
    assert.equal(await applyLocalAuthMirror(admin, user), "unchanged");
  });

  test("after public loses the user's row, as on a local reset, setup restores it", async () => {
    const user = syntheticUser("reset");
    const client = admin;
    assert.ok(client);
    assert.equal(await applyLocalAuthMirror(client, user), "inserted");
    await client`delete from public.users where id = ${user.id}`;
    clearLocalAuthMirrorCache();
    assert.equal(await applyLocalAuthMirror(client, user), "unchanged");
    assert.deepEqual(await publicEmail(user.id), []);
    await applySetup(client);
    assert.deepEqual(await publicEmail(user.id), [user.email]);
  });

  test("a cached user whose rows were wiped is mirrored again once the cache entry expires", async () => {
    const user = syntheticUser("wiped");
    const client = admin;
    assert.ok(client);
    mock.timers.enable({ apis: ["Date"], now: Date.now() });
    try {
      assert.equal(await applyLocalAuthMirror(client, user), "inserted");
      await client`delete from auth.users where id = ${user.id}`;
      assert.equal(await applyLocalAuthMirror(client, user), "cached");
      mock.timers.tick(MIRROR_CACHE_TTL_MS);
      assert.equal(await applyLocalAuthMirror(client, user), "inserted");
      assert.deepEqual(await publicEmail(user.id), [user.email]);
    } finally {
      mock.timers.reset();
    }
  });

  test("upserts a changed email into auth.users and public.users", async () => {
    const user = syntheticUser("change");
    assert.ok(admin);
    assert.equal(await applyLocalAuthMirror(admin, user), "inserted");
    const changed = { ...user, email: `changed-${user.email}` };
    assert.equal(await applyLocalAuthMirror(admin, changed), "updated");

    const row = await authRow(user.id);
    assert.equal(row?.email, changed.email);
    assert.deepEqual(await publicEmail(user.id), [changed.email]);
  });
});

/**
 * Runs `body` inside a transaction on a single-connection client and always
 * rolls back. A raw BEGIN keeps the client a full Sql, with its host, so the
 * mirror runs exactly as the request seam would call it; postgres.js allows a
 * raw BEGIN only on a client with max: 1.
 */
async function rolledBack(
  client: postgres.Sql,
  body: () => Promise<void>,
): Promise<void> {
  await client.unsafe("begin");
  try {
    await body();
  } finally {
    await client.unsafe("rollback");
  }
}

async function authCount(client: postgres.Sql, id: string) {
  const [count] = await client<{ n: number }[]>`
    select count(*)::int as n from auth.users where id = ${id}`;
  return count?.n;
}

describe("the guard inside the INSERT", () => {
  test("inserts zero rows when auth.identities exists", async () => {
    const user = syntheticUser("identities");
    const client = authAdmin;
    assert.ok(client);
    await rolledBack(client, async () => {
      await client`create table auth.identities (id uuid primary key)`;
      assert.equal(await applyLocalAuthMirror(client, user), "refused");
      assert.equal(await authCount(client, user.id), 0);
    });
    assert.equal(await authRow(user.id), undefined);
  });

  test("inserts zero rows when the marker is absent", async () => {
    const user = syntheticUser("unmarked");
    const client = admin;
    assert.ok(client);
    await rolledBack(client, async () => {
      await client.unsafe(`drop table ${MARKER_TABLE}`);
      assert.equal(await applyLocalAuthMirror(client, user), "refused");
      assert.equal(await authCount(client, user.id), 0);
    });
    assert.equal(await authRow(user.id), undefined);
  });

  test("a refusal leaves an existing row's email as it was", async () => {
    const user = syntheticUser("kept");
    const client = admin;
    assert.ok(client);
    assert.equal(await applyLocalAuthMirror(client, user), "inserted");
    clearLocalAuthMirrorCache();
    await rolledBack(client, async () => {
      await client.unsafe(`drop table ${MARKER_TABLE}`);
      assert.equal(
        await applyLocalAuthMirror(client, {
          ...user,
          email: "other@example.test",
        }),
        "refused",
      );
    });
    assert.equal((await authRow(user.id))?.email, user.email);
  });
});
