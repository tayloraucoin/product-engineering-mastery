/**
 * The local auth mirror (D-STK-6, Mode A). Sign-in runs on hosted staging,
 * while the local database, started by `yarn db:local` without Supabase Auth,
 * has no row in auth.users for that user, so public.users and every foreign
 * key to it would be empty. The auth request seam (STK-12) calls
 * `applyLocalAuthMirror` with the signed-in user, and this file writes that
 * user's id and email into the local auth.users; the setup triggers then
 * create or update the public.users row.
 *
 * This is the only writer to auth.users. It never reads process.env: the
 * caller hands in the client. Three guards stand between it and a real auth
 * database:
 *   1. the client's host must be loopback, checked before any connection;
 *   2. the INSERT itself writes nothing when auth.identities exists, which
 *      only Supabase Auth creates (hosted, or the full local stack of Mode B);
 *   3. the INSERT itself writes nothing unless the marker table exists, which
 *      only `yarn db:local` creates, on a database it started.
 * Guards 2 and 3 live inside the statement, so no caller can skip them.
 */

import type postgres from "postgres";

/** The schema and table whose presence marks a database as a Mode A mirror target. */
export const MARKER_SCHEMA = "local_auth_mirror";
export const MARKER_TABLE = `${MARKER_SCHEMA}.marker`;

export type MirrorUser = { id: string; email: string | null };

/**
 * What one call did. `refused` means the statement's own guard found
 * auth.identities or no marker, and wrote nothing. `cached` means this process
 * mirrored the same id and email within the last minute, and nothing was sent.
 */
export type MirrorOutcome =
  "inserted" | "updated" | "unchanged" | "refused" | "cached";

/** Whether `host` names this machine: localhost, 127.0.0.0/8 or ::1. */
export function isLoopbackHost(host: string): boolean {
  const bare = host
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "");
  return (
    bare === "localhost" ||
    bare === "::1" ||
    /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(bare)
  );
}

/** Whether `url` parses and its host is loopback; an unparseable URL is not. */
export function isLoopbackUrl(url: string): boolean {
  try {
    return isLoopbackHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Throws unless every host the client would connect to is loopback. */
export function assertLoopbackClient(sql: postgres.Sql): void {
  const hosts = sql.options.host;
  const offending = hosts.filter(
    (host) => typeof host !== "string" || !isLoopbackHost(host),
  );
  if (hosts.length === 0 || offending.length > 0) {
    throw new Error(
      `The local auth mirror writes only to a loopback database; this client points at ${hosts.join(", ") || "no host"}. It is for Mode A on DATABASE_ENVIRONMENT=local (D-STK-6).`,
    );
  }
}

// Ids this process has mirrored, with the email written and when. The request
// seam calls the mirror on every request; this keeps it to one statement per
// user and email per minute. An entry expires, so a database wiped and
// restarted under a running dev server gets its users back within a minute,
// and a refused call is never cached, so starting `yarn db:local` takes
// effect without a restart.
export const MIRROR_CACHE_TTL_MS = 60_000;
const mirrored = new Map<string, { email: string | null; at: number }>();

/** Forgets every mirrored id, for tests. */
export function clearLocalAuthMirrorCache(): void {
  mirrored.clear();
}

type GuardedRow = { open: boolean; inserted: boolean | null };

/**
 * Mirrors `user` into the local auth.users: inserts id and email when the row
 * is absent, updates the email when it changed, and does nothing otherwise.
 * Throws before connecting when the client's host is not loopback. Throws
 * Postgres's unique violation (23505) when a different local id already holds
 * the email, as when a staging user was deleted and re-created: replaying
 * staging deletions is out of scope, so the caller logs it and serves the
 * request, and deleting the stale local auth.users row clears it.
 */
export async function applyLocalAuthMirror(
  sql: postgres.Sql,
  user: MirrorUser,
): Promise<MirrorOutcome> {
  assertLoopbackClient(sql);
  const entry = mirrored.get(user.id);
  if (
    entry &&
    entry.email === user.email &&
    Date.now() - entry.at < MIRROR_CACHE_TTL_MS
  ) {
    return "cached";
  }

  // to_regclass returns null for an absent table and never raises, so the
  // guard costs nothing on a database without either table. The insert's
  // SELECT yields no row unless the guard is open, so a refused call writes
  // nothing. xmax = 0 on the returned row marks a fresh insert; a nonzero
  // xmax marks the conflict branch's update.
  const [row] = await sql<GuardedRow[]>`
    with guard as (
      select
        to_regclass('auth.identities') is null
          and to_regclass(${MARKER_TABLE}) is not null as open
    ),
    written as (
      insert into auth.users (id, email)
      select ${user.id}::uuid, ${user.email}
      from guard
      where guard.open
      on conflict (id) do update
        set email = excluded.email
        where auth.users.email is distinct from excluded.email
      returning (xmax = 0) as inserted
    )
    select guard.open, (select inserted from written) as inserted
    from guard`;

  if (!row?.open) return "refused";
  mirrored.set(user.id, { email: user.email, at: Date.now() });
  if (row.inserted === null) return "unchanged";
  return row.inserted ? "inserted" : "updated";
}
