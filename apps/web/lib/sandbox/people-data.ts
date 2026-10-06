/**
 * People, bound to the request's world (LAB-9): the Auth admin API through
 * `lib/supabase/admin.ts` (the one service-role seam), the role-change lock
 * and the record of actions. The rules are `changeRoleWith` in people.ts.
 * Never logs an email or the key.
 */

import "server-only";

import {
  recordAction,
  ROLE_CHANGE_ACTION,
  withRoleChangeLock,
  type RoleChangeTx,
  type TeamViewer,
} from "@pem/db/sandbox";

import { createSupabaseAdminClient } from "../supabase/admin";
import { sandboxDb } from "./access.ts";
import {
  changeRoleWith,
  roleFromMetadata,
  type AuthPerson,
  type ChangeRoleResult,
} from "./people.ts";
import type { TeamMember } from "./team-check.ts";

/** The Auth API's largest page; a team app has far fewer accounts. */
const PER_PAGE = 1000;
const MAX_PAGES = 50;

type AuthUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  created_at?: string;
  last_sign_in_at?: string;
};

function toPerson(user: AuthUser): AuthPerson {
  return {
    id: user.id,
    email: user.email ?? null,
    appMetadata: { ...(user.app_metadata ?? {}) },
    createdAt: user.created_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

/** Every account, page by page. A failed page throws: a partial count could pass the last-admin guard. */
export async function listAuthPeople(): Promise<AuthPerson[]> {
  const admin = createSupabaseAdminClient();
  const people: AuthPerson[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    });
    if (error) throw new Error("People: the Auth API did not list users.");
    people.push(...data.users.map(toPerson));
    if (data.users.length < PER_PAGE) return people;
  }
  throw new Error("People: more accounts than the page limit.");
}

/** Sets one person's role as `actor`, an admin who has passed requireTeamAction. */
export function changeRoleAs(
  actor: TeamMember,
  input: unknown,
): Promise<ChangeRoleResult> {
  const viewer: TeamViewer = { kind: "team", ...actor };
  // Built inside each call, so an unset key fails the change, not the action.
  const admin = () => createSupabaseAdminClient();
  return changeRoleWith<RoleChangeTx>(
    {
      withLock: (fn) => withRoleChangeLock(sandboxDb(), viewer, fn),
      async readPerson(userId) {
        const { data, error } = await admin().auth.admin.getUserById(userId);
        if (error) {
          if (error.status === 404) return null;
          throw new Error("People: the Auth API did not read the user.");
        }
        return data.user ? toPerson(data.user) : null;
      },
      async countAdmins() {
        const people = await listAuthPeople();
        return people.filter((p) => roleFromMetadata(p.appMetadata) === "admin")
          .length;
      },
      async writeAppMetadata(userId, appMetadata) {
        const { error } = await admin().auth.admin.updateUserById(userId, {
          app_metadata: appMetadata,
        });
        if (error)
          throw new Error("People: the Auth API did not write the role.");
      },
      recordRoleChange: (tx, targetEmail) =>
        recordAction(tx, viewer, { action: ROLE_CHANGE_ACTION, targetEmail }),
    },
    actor,
    input,
  );
}
