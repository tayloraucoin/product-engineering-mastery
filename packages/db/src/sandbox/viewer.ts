/**
 * Who a sandbox query runs for (door 4, D-LAB-34, data-contract.md). Every
 * sandbox table is service-only, so no policy scopes a guest's rows: this
 * module does, and every viewer-facing function takes `(db, viewer, input)`.
 * The app builds the viewer only after verifying it (`resolveViewer` in
 * apps/web/lib/sandbox, LAB-5); nothing here reads a cookie or a session.
 *
 * - A reviewer function scopes by `reviewerScope`: the viewer's reviewer id
 *   and slug, one helper, so collaborate mode (LAB-25) widens reads in one
 *   place, and only threads.ts asks it to.
 * - A team function calls `requireTeam`; an admin-only one `requireAdmin`.
 *
 * Errors are fixed strings that never echo input.
 */

import { and, eq, isNotNull, or, type SQL } from "drizzle-orm";
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

/** An experiment's mode, as its config holds it; the app reads it from the registry by slug, never from a request. */
export type ReviewMode = "private" | "collaborate";

export const SCOPE_MODE_INVALID = "The scope's mode is not valid.";

/**
 * The rows a reviewer may read or write in a table with `reviewer_id` and
 * `slug`. Private, the default and the only scope a write uses: their own,
 * on their slug. Collaborate (beat 2, D-LAB-17), for reads of
 * `sandbox_comments` only: the slug's reviewer comments and replies, and the
 * team's replies, never a team note. A team row with no parent is a note.
 */
export function reviewerScope(
  viewer: Viewer,
  columns: {
    reviewerId: AnyPgColumn;
    slug: AnyPgColumn;
    parentId?: AnyPgColumn;
  },
  options: { mode: ReviewMode } = { mode: "private" },
): SQL {
  const reviewer = requireReviewer(viewer);
  if (options?.mode === "private")
    return and(
      eq(columns.reviewerId, reviewer.reviewerId),
      eq(columns.slug, reviewer.slug),
    )!;
  if (options?.mode !== "collaborate" || !columns.parentId)
    throw new SandboxAccessError(SCOPE_MODE_INVALID);
  return threadRowsOn(reviewer.slug, {
    reviewerId: columns.reviewerId,
    slug: columns.slug,
    parentId: columns.parentId,
  });
}

/**
 * The one definition of what on a slug belongs to a thread (beat 2): a
 * reviewer's comment or reply, or a reply from the team. A team row with no
 * parent is a note and never matches. The collaborate scope above and the
 * team's thread read (threads.ts) both use it.
 */
export function threadRowsOn(
  slug: string,
  columns: {
    reviewerId: AnyPgColumn;
    slug: AnyPgColumn;
    parentId: AnyPgColumn;
  },
): SQL {
  return and(
    eq(columns.slug, slug),
    or(isNotNull(columns.reviewerId), isNotNull(columns.parentId)),
  )!;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a UUID. Postgres echoes a bad uuid in its error, so callers check first. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
