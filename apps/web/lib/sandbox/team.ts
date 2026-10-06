/**
 * The app's one team check (LAB-2, D-LAB-35): a signed-in developer or admin
 * is a team member, and opens every experiment and /admin. Everyone else,
 * signed out included, is not. The role is `app_metadata.role`, read through
 * `getAuthContext()` on each request and never cached beyond it, so a role
 * change applies on the person's next request (R11).
 *
 * Outside the sandbox a developer is a user: the policies' admin check and
 * the tRPC admin tier both match `admin` exactly. Who may grant roles is
 * LAB-9's, not this file's.
 */

import type { AuthContext } from "@pem/auth/context";

export type TeamRole = "developer" | "admin";

export type TeamMember = { userId: string; email: string; role: TeamRole };

const TEAM_ROLES: readonly string[] = [
  "developer",
  "admin",
] satisfies TeamRole[];

/**
 * The team member a request's context names, or null. A member with no email
 * is null too: the record of actions names its actor by email.
 */
export function teamMemberOf(context: AuthContext | null): TeamMember | null {
  if (!context || !TEAM_ROLES.includes(context.role)) return null;
  if (!context.email) return null;
  return {
    userId: context.userId,
    email: context.email,
    role: context.role as TeamRole,
  };
}

/** The team member making this request, or null. */
export async function getTeamMember(): Promise<TeamMember | null> {
  // Loaded on call: the seam is server-only, and the pure check above is tested under node.
  const { getAuthContext } = await import("../supabase/context");
  return teamMemberOf(await getAuthContext());
}
