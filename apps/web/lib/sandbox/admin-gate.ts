/**
 * Who reaches /admin (LAB-8, S4, S12a), as one pure decision. `admin-guard.ts`
 * binds it to the request; this file holds no seam, so it runs under
 * `node --test`.
 *
 * - No session: sign-in, with `next` set to the path asked for, so the person
 *   comes back to it.
 * - Signed in without a team role (a user, or anyone holding only an
 *   experiment's code): the app's 404. Nothing says /admin exists.
 * - A developer on an admin-only path (People): the same 404.
 *
 * The role is read on every request through `getTeamMember()` (LAB-2), never
 * from a cookie or a cache, so a role change applies on the next request
 * (R11). The sandbox access cookie is never read here: a code opens one
 * experiment, never /admin.
 */

import { safeNextPath } from "@pem/auth/redirect";

import { isAdminOnlyPath } from "./admin-nav.ts";
import type { TeamMember } from "./team-check.ts";

export const ADMIN_SIGN_IN_PATH = "/auth/sign-in";

export type AdminGateInput = {
  /** The request's team member, or null for anyone else, signed out included. */
  member: TeamMember | null;
  /** Whether the request has a session at all, team or not. */
  signedIn: boolean;
  /**
   * The path asked for, or null from a layout. A layout gets no pathname, so
   * with no session it renders its page bare and the page's own redirect
   * carries the right `next`.
   */
  path: string | null;
  /**
   * True for a page or action only an admin may reach. A path under an
   * admin-only nav entry (People) is admin-only whether or not this is set.
   */
  adminOnly?: boolean;
};

export type AdminGateResult =
  | { kind: "team"; member: TeamMember }
  | { kind: "sign-in"; url: string }
  | { kind: "bare" }
  | { kind: "not-found" };

/** Sign-in with `next` set to `path`, refused back to the default when it is not a same-origin path. */
export function adminSignInUrl(path: string): string {
  const params = new URLSearchParams({ next: safeNextPath(path) });
  return `${ADMIN_SIGN_IN_PATH}?${params.toString()}`;
}

export function adminGate({
  member,
  signedIn,
  path,
  adminOnly = false,
}: AdminGateInput): AdminGateResult {
  if (member) {
    const onlyAdmins = adminOnly || (path !== null && isAdminOnlyPath(path));
    if (onlyAdmins && member.role !== "admin") return { kind: "not-found" };
    return { kind: "team", member };
  }
  if (signedIn) return { kind: "not-found" };
  return path === null
    ? { kind: "bare" }
    : { kind: "sign-in", url: adminSignInUrl(path) };
}

/**
 * The one answer every refused /admin action gives. It names no reason, so
 * a caller learns nothing about who may do what.
 */
export const TEAM_ACTION_REFUSED = Object.freeze({
  outcome: "refused",
} as const);
export type TeamActionRefusal = typeof TEAM_ACTION_REFUSED;

export function isTeamActionRefusal(
  value: TeamMember | TeamActionRefusal,
): value is TeamActionRefusal {
  return value === TEAM_ACTION_REFUSED;
}

/**
 * An /admin action's check, before it does anything: the team member, or the
 * fixed refusal for no session (a code holder included), a user, and a
 * developer when `adminOnly`. `admin-guard.ts` binds `getMember` to
 * `getTeamMember()`.
 */
export async function requireTeamActionWith(
  getMember: () => Promise<TeamMember | null>,
  { adminOnly = false }: { adminOnly?: boolean } = {},
): Promise<TeamMember | TeamActionRefusal> {
  const member = await getMember();
  if (!member) return TEAM_ACTION_REFUSED;
  if (adminOnly && member.role !== "admin") return TEAM_ACTION_REFUSED;
  return member;
}
