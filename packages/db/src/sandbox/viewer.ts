/**
 * Who a sandbox query runs for (door 4, D-LAB-34, data-contract.md). Every
 * sandbox table is service-only, so no policy scopes a guest's rows: this
 * module does, and every viewer-facing function takes `(db, viewer, input)`.
 * The app builds the viewer only after verifying it (`resolveViewer` in
 * apps/web/lib/sandbox, LAB-5); nothing here reads a cookie or a session.
 *
 * - A reviewer function scopes by `reviewerScope`: the viewer's reviewer id
 *   and slug, one helper, so collaborate mode (LAB-25) widens reads in one
 *   place.
 * - A team function calls `requireTeam`; an admin-only one `requireAdmin`.
 *
 * Errors are fixed strings that never echo input.
 */

import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import type { Db } from "../client.ts";

export type ReviewerViewer = {
  kind: "reviewer";
  slug: string;
  reviewerId: string;
  accessId: string;
};

export type TeamViewer = {
  kind: "team";
  userId: string;
  email: string;
  role: "developer" | "admin";
};

export type Viewer = ReviewerViewer | TeamViewer;

/** The singleton, or a transaction on it, so one action's writes can share a transaction. */
export type SandboxDb = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];

/** The one error a refused or malformed call throws; its message never carries input. */
export class SandboxAccessError extends Error {
  override name = "SandboxAccessError";
}

export const NOT_A_TEAM_VIEWER = "This needs a team member.";
export const NOT_AN_ADMIN_VIEWER = "This needs an admin.";
export const NOT_A_REVIEWER_VIEWER = "This needs a reviewer.";

export function requireTeam(viewer: Viewer): TeamViewer {
  if (
    viewer?.kind !== "team" ||
    (viewer.role !== "developer" && viewer.role !== "admin") ||
    !isUuid(viewer.userId) ||
    typeof viewer.email !== "string" ||
    viewer.email.length === 0
  )
    throw new SandboxAccessError(NOT_A_TEAM_VIEWER);
  return viewer;
}

export function requireAdmin(viewer: Viewer): TeamViewer {
  const team = requireTeam(viewer);
  if (team.role !== "admin") throw new SandboxAccessError(NOT_AN_ADMIN_VIEWER);
  return team;
}

export function requireReviewer(viewer: Viewer): ReviewerViewer {
  if (viewer?.kind !== "reviewer")
    throw new SandboxAccessError(NOT_A_REVIEWER_VIEWER);
  return viewer;
}

/** The rows a reviewer may read or write in a table with `reviewer_id` and `slug`: their own, on their slug. */
export function reviewerScope(
  viewer: Viewer,
  columns: { reviewerId: AnyPgColumn; slug: AnyPgColumn },
): SQL {
  const reviewer = requireReviewer(viewer);
  return and(
    eq(columns.reviewerId, reviewer.reviewerId),
    eq(columns.slug, reviewer.slug),
  )!;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a UUID. Postgres echoes a bad uuid in its error, so callers check first. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
