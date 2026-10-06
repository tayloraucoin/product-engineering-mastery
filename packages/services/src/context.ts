/**
 * What every service takes first (D-STK-8): who is asking and a database
 * scoped to them. The transport builds it from the request seam's AuthContext
 * (`@pem/auth/context`) and the runtime client; a service never builds its own
 * and never reaches the unscoped singleton.
 */

import type { Db } from "@pem/db/client";
import { createRlsClient, type AppRole, type RlsClient } from "@pem/db/rls";

export type ServiceContext = {
  /** The signed-in user's id. */
  userId: string;
  /** The application role the policies read. */
  role: AppRole;
  /** Every query runs in one transaction as this user, under row-level security. */
  db: RlsClient;
};

/** The context for `user` on `db`'s pool. */
export function createServiceContext(
  db: Db,
  user: { userId: string; role: AppRole },
): ServiceContext {
  return {
    userId: user.userId,
    role: user.role,
    db: createRlsClient(db, user),
  };
}

/**
 * What a service takes when no user is asking: a verified Stripe webhook, a
 * scheduled job. Its queries run in one transaction on the singleton, outside
 * row-level security, so only a caller that has proven its source some other
 * way (a webhook's signature) may build one, and only a service that names
 * the user it acts for from that proven source takes one.
 */
export type SystemContext = {
  /** Marks the unscoped context, so a ServiceContext can never be passed where this is taken, nor this where a ServiceContext is. */
  system: true;
  db: RlsClient;
};

/** The context for a system caller on `db`'s pool. */
export function createSystemContext(db: Db): SystemContext {
  return {
    system: true,
    db: { execute: (callback) => db.transaction(callback) },
  };
}
