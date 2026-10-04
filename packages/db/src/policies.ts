/**
 * The three policy factories (D-STK-5). Each table declares its policies
 * beside its columns by calling one of these; drizzle-kit writes them into the
 * migration. They read the settings the bridge in rls.ts sets, and grant only
 * to `authenticated`: anon has no policy, so RLS denies it every row.
 *
 * - `ownerPrivatePolicies`: only the owner reads or writes the row, admins
 *   included. For anything promised to a person as "only you can see this".
 * - `ownerRowPolicies`: the owner reads and amends the row and admins may read
 *   it; the system creates and deletes it. For a user's own account row.
 * - `serviceOnlyPolicies`: no user reaches the row; only service code on the
 *   singleton does.
 */

import { sql, type SQL } from "drizzle-orm";
import { pgPolicy, type AnyPgColumn } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

/** The bridged user's id; NULL outside the bridge, so no row matches. */
export const appUserId = sql`nullif(current_setting('app.user_id', true), '')::uuid`;

/** True when the bridged user's application role is admin. */
export const appUserIsAdmin = sql`coalesce(current_setting('app.user_role', true), '') = 'admin'`;

const deny = sql`false`;

function isOwner(ownerColumn: AnyPgColumn): SQL {
  return sql`${ownerColumn} = ${appUserId}`;
}

/** Owner-only select, insert, update and delete. */
export function ownerPrivatePolicies(table: string, ownerColumn: AnyPgColumn) {
  const owner = isOwner(ownerColumn);
  return [
    pgPolicy(`${table}_select_owner`, {
      for: "select",
      to: authenticatedRole,
      using: owner,
    }),
    pgPolicy(`${table}_insert_owner`, {
      for: "insert",
      to: authenticatedRole,
      withCheck: owner,
    }),
    pgPolicy(`${table}_update_owner`, {
      for: "update",
      to: authenticatedRole,
      using: owner,
      withCheck: owner,
    }),
    pgPolicy(`${table}_delete_owner`, {
      for: "delete",
      to: authenticatedRole,
      using: owner,
    }),
  ];
}

/** The owner reads and updates, admins read; inserts and deletes are the system's. */
export function ownerRowPolicies(table: string, ownerColumn: AnyPgColumn) {
  const owner = isOwner(ownerColumn);
  return [
    pgPolicy(`${table}_select_owner_or_admin`, {
      for: "select",
      to: authenticatedRole,
      using: sql`(${owner} or ${appUserIsAdmin})`,
    }),
    pgPolicy(`${table}_update_owner`, {
      for: "update",
      to: authenticatedRole,
      using: owner,
      withCheck: owner,
    }),
    pgPolicy(`${table}_insert_denied`, {
      for: "insert",
      to: authenticatedRole,
      withCheck: deny,
    }),
    pgPolicy(`${table}_delete_denied`, {
      for: "delete",
      to: authenticatedRole,
      using: deny,
    }),
  ];
}

/** Every user operation denied; service code reaches the table through the singleton. */
export function serviceOnlyPolicies(table: string) {
  return [
    pgPolicy(`${table}_all_denied`, {
      for: "all",
      to: authenticatedRole,
      using: deny,
      withCheck: deny,
    }),
  ];
}
