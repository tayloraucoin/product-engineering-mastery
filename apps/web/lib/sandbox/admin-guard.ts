/**
 * The /admin guards, bound to the request (LAB-8). The rule is `adminGate`
 * in admin-gate.ts; this file only reads who is asking and acts on it.
 *
 * - Every /admin page calls `requireTeamPage(path)` before any read, and the
 *   layout calls `requireTeamPage(null)`. A layout does not re-render on
 *   client navigation, so a page never trusts it (Next 16, "Layouts and auth
 *   checks").
 * - Every exported /admin server action calls `requireTeamAction()` first
 *   and returns its refusal unchanged. `signOutAdmin` is the one exception.
 *
 * `admin-routes.test.ts` scans the route files to hold both rules.
 */

import "server-only";

import { notFound, redirect } from "next/navigation";

import { getAuthContext } from "../supabase/context";
import {
  adminGate,
  requireTeamActionWith,
  type TeamActionRefusal,
} from "./admin-gate.ts";
import { getTeamMember, type TeamMember } from "./team.ts";

type GuardOptions = { adminOnly?: boolean };

/**
 * The team member for an /admin page at `path`, or a redirect to sign-in, or
 * the app's 404. From a layout (`path` null), no session renders the page
 * bare, which then redirects with its own path as `next`.
 */
export async function requireTeamPage(
  path: string,
  options?: GuardOptions,
): Promise<TeamMember>;
export async function requireTeamPage(
  path: null,
  options?: GuardOptions,
): Promise<TeamMember | null>;
export async function requireTeamPage(
  path: string | null,
  options: GuardOptions = {},
): Promise<TeamMember | null> {
  // One getUser per request: getAuthContext is cached, and getTeamMember reads it.
  const member = await getTeamMember();
  const signedIn = member !== null || (await getAuthContext()) !== null;
  const gate = adminGate({
    member,
    signedIn,
    path,
    adminOnly: options.adminOnly,
  });
  if (gate.kind === "team") return gate.member;
  if (gate.kind === "bare") return null;
  if (gate.kind === "sign-in") redirect(gate.url);
  notFound();
}

/** The team member for an /admin action, or the one fixed refusal; nothing is done before it. */
export function requireTeamAction(
  options?: GuardOptions,
): Promise<TeamMember | TeamActionRefusal> {
  return requireTeamActionWith(getTeamMember, options);
}

export { isTeamActionRefusal, TEAM_ACTION_REFUSED } from "./admin-gate.ts";
export type { TeamActionRefusal } from "./admin-gate.ts";
