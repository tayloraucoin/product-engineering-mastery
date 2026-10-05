/**
 * Integration test for `yarn db:local:reset` (D-STK-18), against the database
 * `yarn db:local` starts (`yarn test:db`; never part of `yarn test`). It
 * migrates, leaves a stray table, a stray enum and a note behind, resets, and
 * reads back what the reset kept and what it rebuilt. An absent database fails
 * the run and names `yarn db:local`.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import type postgres from "postgres";

import {
  applySetup,
  openMigrationClient,
  runMigrations,
} from "../scripts/database.ts";
import { migrationUrl, tier } from "../scripts/env.ts";
import { resetLocalDatabase } from "../scripts/reset-local-db.ts";
import { describeUrl } from "../src/connection.ts";
import { assertLoopbackClient } from "../src/loopback.ts";

const user = randomUUID();
let admin: postgres.Sql | undefined;

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
});

after(async () => {
  if (!admin) return;
  await admin`delete from auth.users where id = ${user}`;
  await admin`drop table if exists public.reset_stray`;
  await admin`drop type if exists public.reset_stray_kind`;
  await admin.end();
});

test("empties public, keeps auth, and rebuilds the schema and setup", async () => {
  const client = admin;
  assert.ok(client);
  await client`insert into auth.users (id, email) values (${user}, 'reset@example.test')`;
  await client`create type public.reset_stray_kind as enum ('a', 'b')`;
  await client`create table public.reset_stray (kind public.reset_stray_kind)`;
  const [before] = await client<{ count: number }[]>`
    select count(*)::int as count from public.users where id = ${user}`;
  assert.equal(
    before?.count,
    1,
    "the auth trigger mirrors the user before the reset",
  );
  await client`insert into public.notes (owner_id, body) values (${user}, 'synthetic note')`;

  await resetLocalDatabase(client);

  const [state] = await client<
    {
      stray: string | null;
      stray_kind: string | null;
      mirrored: number;
      notes: number;
      auth_kept: number;
      journal: number;
      policies: number;
      triggers: number;
    }[]
  >`
    select
      to_regclass('public.reset_stray')::text as stray,
      to_regtype('public.reset_stray_kind')::text as stray_kind,
      (select count(*)::int from public.users where id = ${user}) as mirrored,
      (select count(*)::int from public.notes where owner_id = ${user}) as notes,
      (select count(*)::int from auth.users where id = ${user}) as auth_kept,
      (select count(*)::int from drizzle.__drizzle_migrations) as journal,
      (select count(*)::int from pg_policies where schemaname = 'public' and tablename = 'notes') as policies,
      (select count(*)::int from pg_trigger where tgrelid = 'auth.users'::regclass
         and tgname in ('on_auth_user_created', 'on_auth_user_email_changed')) as triggers`;
  assert.equal(state?.stray, null, "a table outside the migrations is gone");
  assert.equal(
    state?.stray_kind,
    null,
    "an enum outside the migrations is gone",
  );
  assert.equal(state?.notes, 0, "public rows are gone");
  assert.equal(
    state?.mirrored,
    1,
    "setup's backfill restores the user's public row",
  );
  assert.equal(state?.auth_kept, 1, "auth.users is left alone");
  assert.ok((state?.journal ?? 0) > 0, "the migrations are reapplied");
  assert.equal(state?.policies, 4, "the notes policies are back");
  assert.equal(state?.triggers, 2, "the setup triggers on auth.users are back");
});
