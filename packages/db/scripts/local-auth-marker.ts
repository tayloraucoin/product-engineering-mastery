/**
 * Creates the marker that opens the local auth mirror's guard (D-STK-6). Only
 * `yarn db:local` calls it, on the database it just started; the integration
 * tests call it too. The marker lives in its own schema, outside public, so
 * Drizzle never sees it, and no client role may read it.
 *
 * It refuses a non-loopback host before connecting, and refuses a database
 * where auth.identities exists: that one belongs to Supabase Auth (the full
 * stack of Mode B), and the mirror must stay shut there.
 */

import type postgres from "postgres";

import { MARKER_SCHEMA, MARKER_TABLE } from "../src/local-auth-mirror.ts";
import { assertLoopbackClient } from "../src/loopback.ts";

export type MarkerResult = "marked" | "auth-owned";

/** Creates the marker; idempotent. Returns `auth-owned` and writes nothing when Supabase Auth owns the database. */
export async function markLocalAuthMirror(
  sql: postgres.Sql,
): Promise<MarkerResult> {
  assertLoopbackClient(sql);
  const [state] = await sql<{ auth_owned: boolean }[]>`
    select to_regclass('auth.identities') is not null as auth_owned`;
  if (state?.auth_owned) return "auth-owned";
  await sql.unsafe(`
    create schema if not exists ${MARKER_SCHEMA};
    revoke all on schema ${MARKER_SCHEMA} from public;
    create table if not exists ${MARKER_TABLE} (
      created_at timestamptz not null default now()
    );
    comment on table ${MARKER_TABLE} is
      'Marks this database as a Mode A local auth mirror target (D-STK-6). Created by yarn db:local only.';
  `);
  return "marked";
}
