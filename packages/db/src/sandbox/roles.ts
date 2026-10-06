/**
 * The lock every role change runs under (LAB-9, R3, S2). Roles live in Auth's
 * `app_metadata`, not in a table here, so the last-admin guard cannot be a
 * constraint: the People action counts admins and writes the new role inside
 * `fn`, and this lock makes two changes run one after the other, so two
 * admins demoting each other at once leave one admin.
 *
 * `pg_advisory_xact_lock` is held by the transaction and released when it
 * ends. A session lock would leak on the hosted transaction pooler, where the
 * next statement may run on another connection.
 *
 * Admin only: a reviewer or a developer is refused before any SQL runs.
 */

import { sql } from "drizzle-orm";

import { requireAdmin, type SandboxDb, type Viewer } from "./viewer.ts";

/** One key for every role change in the database; `hashtext` turns the name into the lock's int. */
export const ROLE_CHANGE_LOCK = "pem.sandbox.role-change";

/** The transaction `fn` runs in, for the record of the change to land with it. */
export type RoleChangeTx = Parameters<
  Parameters<SandboxDb["transaction"]>[0]
>[0];

export async function withRoleChangeLock<T>(
  db: SandboxDb,
  viewer: Viewer,
  fn: (tx: RoleChangeTx) => Promise<T>,
): Promise<T> {
  requireAdmin(viewer);
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${ROLE_CHANGE_LOCK}))`,
    );
    return fn(tx);
  });
}
