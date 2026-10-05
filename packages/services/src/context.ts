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
