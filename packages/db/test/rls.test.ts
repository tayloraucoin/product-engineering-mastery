/**
 * Integration tests for the bridge and the policies, against the local
 * Supabase image (`yarn test:db`; never part of `yarn test`). They migrate,
 * apply the setup SQL twice, create two synthetic auth users, and read back
 * what each may see. An absent image fails the run and names `yarn db:local`:
 * a skipped privacy proof would read as a passing one.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { eq, sql } from "drizzle-orm";
import type postgres from "postgres";

import {
  applySetup,
  openMigrationClient,
  runMigrations,
} from "../scripts/database.ts";
import { migrationUrl, runtimeUrl, tier } from "../scripts/env.ts";
import { createDb, type Db } from "../src/client.ts";
import { describeUrl } from "../src/connection.ts";
import { assertLoopbackClient } from "../src/loopback.ts";
import { createRlsClient } from "../src/rls.ts";
import { notes, users } from "../src/schema/index.ts";

const alice = randomUUID();
const bob = randomUUID();

let admin: postgres.Sql | undefined;
let db: Db;

before(async () => {
  if (tier !== "local") {
    throw new Error(
      `yarn test:db runs only against the local image; DATABASE_ENVIRONMENT is ${tier}.`,
    );
  }
  const url = migrationUrl();
  const client = openMigrationClient(url, tier);
  // The local tier skips the pooler check, so a hosted URL in a _LOCAL
  // variable would otherwise be migrated and written to.
  assertLoopbackClient(client);
  try {
    await client`select 1`;
  } catch (error) {
    await client.end({ timeout: 0 });
    throw new Error(
      `The local Supabase image is not reachable at ${describeUrl(url)}. Start it with yarn db:local, then rerun yarn test:db. (${error instanceof Error ? error.message : String(error)})`,
    );
  }
  admin = client;
  await runMigrations(client);
  await applySetup(client);
  await client`insert into auth.users (id, email) values (${alice}, 'alice@example.test'), (${bob}, 'bob@example.test')`;
  db = createDb({ url: runtimeUrl(), tier });
  // The runtime client writes too, through the bridge; same check.
  assertLoopbackClient(db.$client);
});

after(async () => {
  await db?.$client.end();
  if (!admin) return;
  await admin`delete from auth.users where id in (${alice}, ${bob})`;
  await admin.end();
});

describe("the bridge", () => {
  test("sets app.user_id, app.user_role and the role for the transaction", async () => {
    const rls = createRlsClient(db, { userId: alice, role: "user" });
    const inside = await rls.execute((tx) =>
      tx.execute<{ user_id: string; user_role: string; pg_role: string }>(
        sql`select current_setting('app.user_id', true) as user_id, current_setting('app.user_role', true) as user_role, current_user as pg_role`,
      ),
    );
    assert.deepEqual(
      [...inside],
      [{ user_id: alice, user_role: "user", pg_role: "authenticated" }],
    );
  });

  test("leaves nothing behind on the pooled connection after the transaction", async () => {
    await createRlsClient(db, { userId: alice, role: "admin" }).execute(
      async () => {},
    );
    const outside = await db.execute<{
      user_id: string | null;
      user_role: string | null;
      pg_role: string;
    }>(
      sql`select nullif(current_setting('app.user_id', true), '') as user_id, nullif(current_setting('app.user_role', true), '') as user_role, current_user as pg_role`,
    );
    assert.deepEqual(
      [...outside],
      [{ user_id: null, user_role: null, pg_role: "postgres" }],
    );
  });
});

describe("the setup SQL", () => {
  test("mirrors each auth user into public.users", async () => {
    const rows = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, alice));
    assert.deepEqual(rows, [{ id: alice, email: "alice@example.test" }]);
  });

  test("is idempotent: a second run leaves the same triggers and policies", async () => {
    const client = admin;
    assert.ok(client);
    const census = () => client`
      select
        (select count(*)::int from pg_trigger where not tgisinternal
           and tgrelid in ('auth.users'::regclass, 'public.users'::regclass, 'public.notes'::regclass)) as triggers,
        (select count(*)::int from pg_policies where schemaname = 'public') as policies,
        (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity) as tables_without_rls`;
    const [first] = await census();
    await applySetup(client);
    const [second] = await census();
    assert.deepEqual(second, first);
    assert.equal(first?.tables_without_rls, 0);
  });
});

describe("an owner-private policy", () => {
  test("hides another user's row and refuses writes to it", async () => {
    const asAlice = createRlsClient(db, { userId: alice, role: "user" });
    const asBob = createRlsClient(db, { userId: bob, role: "user" });
    // Even an admin role does not open an owner-private table.
    const asBobAdmin = createRlsClient(db, { userId: bob, role: "admin" });

    const [note] = await asAlice.execute((tx) =>
      tx
        .insert(notes)
        .values({ ownerId: alice, body: "synthetic note" })
        .returning({ id: notes.id }),
    );
    assert.ok(note);

    const aliceSees = await asAlice.execute((tx) =>
      tx.select({ id: notes.id }).from(notes).where(eq(notes.id, note.id)),
    );
    assert.deepEqual(aliceSees, [{ id: note.id }]);

    for (const other of [asBob, asBobAdmin]) {
      const seen: { id: string }[] = await other.execute((tx) =>
        tx.select({ id: notes.id }).from(notes).where(eq(notes.id, note.id)),
      );
      assert.deepEqual(seen, []);

      const updated: { id: string }[] = await other.execute((tx) =>
        tx
          .update(notes)
          .set({ body: "overwritten" })
          .where(eq(notes.id, note.id))
          .returning({ id: notes.id }),
      );
      assert.deepEqual(updated, []);
    }

    await assert.rejects(
      asBob.execute((tx) =>
        tx.insert(notes).values({ ownerId: alice, body: "forged owner" }),
      ),
      (error: Error & { cause?: { code?: string } }) =>
        (error.cause?.code ?? (error as { code?: string }).code) === "42501",
    );

    const [unchanged] = await db
      .select({ body: notes.body })
      .from(notes)
      .where(eq(notes.id, note.id));
    assert.equal(unchanged?.body, "synthetic note");
  });

  test("a user reads their own account row and not another's", async () => {
    const seen = await createRlsClient(db, {
      userId: bob,
      role: "user",
    }).execute((tx) =>
      tx
        .select({ id: users.id })
        .from(users)
        .where(sql`${users.id} in (${alice}, ${bob})`),
    );
    assert.deepEqual(seen, [{ id: bob }]);
  });
});
