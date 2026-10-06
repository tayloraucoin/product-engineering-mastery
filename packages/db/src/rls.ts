/**
 * The bridge from a request's identity to row-level security (D-STK-5). Every
 * user-scoped query runs inside `execute`: one transaction that sets
 * `app.user_id` and `app.user_role` with `set_config(…, true)` and switches to
 * the `authenticated` role with `SET LOCAL`, so the policies beside each table
 * apply and all three settings end with the transaction. The pool is shared;
 * the bridge never opens a connection of its own.
 */

import { sql } from "drizzle-orm";

import type { Db } from "./client.ts";

/** The application roles a policy may read from `app.user_role`. */
export const APP_ROLES = ["user", "developer", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

/** Who the queries run for; the auth layer builds it from the session. */
export type RlsContext = {
  userId: string;
  role: AppRole;
};

export type RlsTransaction = Parameters<Parameters<Db["transaction"]>[0]>[0];

export type RlsClient = {
  /** Runs `callback` in one transaction, as the context's user, under RLS. */
  execute<T>(callback: (tx: RlsTransaction) => Promise<T>): Promise<T>;
};

/** The Postgres role every bridged transaction runs as; never taken from input. */
export const BRIDGE_PG_ROLE = "authenticated";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Throws unless the context names a UUID user and a known role: no partial identity reaches SQL. */
export function assertRlsContext(context: RlsContext): RlsContext {
  if (!UUID.test(context.userId)) {
    throw new Error("The RLS context's userId must be a UUID.");
  }
  if (!(APP_ROLES as readonly string[]).includes(context.role)) {
    throw new Error(
      `The RLS context's role must be one of ${APP_ROLES.join(", ")}.`,
    );
  }
  return context;
}

/** A client whose every query runs as `context`'s user, on `db`'s pool. */
export function createRlsClient(db: Db, context: RlsContext): RlsClient {
  const { userId, role } = assertRlsContext(context);
  return {
    execute(callback) {
      return db.transaction(async (tx) => {
        // Bound parameters, never interpolated; `true` scopes each to this transaction.
        await tx.execute(
          sql`select set_config('app.user_id', ${userId}, true), set_config('app.user_role', ${role}, true)`,
        );
        // SET cannot take a bind parameter; the role is the constant above.
        await tx.execute(sql.raw(`set local role ${BRIDGE_PG_ROLE}`));
        return callback(tx);
      });
    },
  };
}
