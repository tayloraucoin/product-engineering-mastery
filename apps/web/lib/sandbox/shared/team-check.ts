/**
 * The team check itself, pure (LAB-2, D-LAB-35): a signed-in developer or
 * admin is a team member, and opens every experiment and /admin. Everyone
 * else, signed out included, is not. `team.ts` binds it to the request; this
 * file holds no seam, so it runs under `node --test`.
 *
 * Outside the sandbox a developer is a user: the policies' admin check and
 * the tRPC admin tier both match `admin` exactly. Who may grant roles is
 * LAB-9's, not this file's.
 */

import type { AuthContext } from "@pem/auth/context";

/** The application roles that make a team member; removing one from APP_ROLES fails to compile here. */
export type TeamRole = Extract<AuthContext["role"], "developer" | "admin">;

export type TeamMember = { userId: string; email: string; role: TeamRole };

const TEAM_ROLES = [
  "developer",
  "admin",
] as const satisfies readonly TeamRole[];

function isTeamRole(role: AuthContext["role"]): role is TeamRole {
  return (TEAM_ROLES as readonly string[]).includes(role);
}

/**
 * The team member a request's context names, or null. A member with no email
 * is null too: the record of actions names its actor by email.
 */
export function teamMemberOf(context: AuthContext | null): TeamMember | null {
  if (!context || !isTeamRole(context.role)) return null;
  if (!context.email) return null;
  return { userId: context.userId, email: context.email, role: context.role };
}

/** The team member for whatever context `getContext` resolves; `team.ts` passes the request's. */
export async function getTeamMemberWith(
  getContext: () => Promise<AuthContext | null>,
): Promise<TeamMember | null> {
  return teamMemberOf(await getContext());
}
