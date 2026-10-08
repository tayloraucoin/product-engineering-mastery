/**
 * The app's one team check, bound to the request (LAB-2). `getTeamMember()`
 * reads `getAuthContext()` on each request and caches nothing beyond it, so a
 * role change applies on the person's next request (R11). The rule itself is
 * `teamMemberOf` in team-check.ts; resolveViewer (LAB-5), the /admin shell
 * (LAB-8) and every /admin action build their team viewer from this.
 */

import "server-only";

import { getAuthContext } from "../../supabase/context";
import { getTeamMemberWith, type TeamMember } from "./team-check.ts";

export { teamMemberOf, type TeamMember, type TeamRole } from "./team-check.ts";

/** The team member making this request, or null. */
export function getTeamMember(): Promise<TeamMember | null> {
  return getTeamMemberWith(getAuthContext);
}
