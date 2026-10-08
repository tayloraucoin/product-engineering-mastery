/**
 * The team's layer (LAB-14, team-layer.md, S18, D-LAB-14, D-LAB-15). Team
 * only: each takes `(db, viewer, input)` and refuses a reviewer viewer. The
 * team names the slug in its input.
 *
 * - `listTeamComments`: the slug's codes (for the reviewer filter, by label)
 *   and every root on it, the reviewers' comments with their code's label and
 *   the team's notes with their author's email. Never a reply (beat 2,
 *   threads.ts), and nothing here is ever read for a reviewer.
 * - `saveTeamNote`: a team note is a row with `team_user_id` and no
 *   reviewer, access or kind. The id is minted in the browser: insert `on
 *   conflict (id) do nothing`, then an update scoped by id and the author's
 *   user id, so a retry lands once and an id held by a reviewer's comment or
 *   another member's note is `taken`, with nothing changed. T-numbers are
 *   shared by the team per slug and fixed here, under an advisory lock on
 *   the slug: the browser's provisional number is kept if no note on the
 *   slug holds it, else max + 1. An edit keeps its number.
 * - `deleteTeamNote`: a hard delete of the author's own note. An id held by
 *   anything else is `taken`; an id held by nothing is already gone.
 *
 * No closed check: notes can be added and edited after close (D-LAB-15).
 * Nothing here writes a view (D-LAB-14). Errors are fixed strings that never
 * echo input.
 */

import { and, asc, eq, isNotNull, isNull, max, sql } from "drizzle-orm";

import { users } from "../schema/account/users.ts";
import { sandboxComments, sandboxReviewers } from "../schema/index.ts";
import {
  SANDBOX_SLUG_MAX,
  SANDBOX_SLUG_PATTERN,
} from "../schema/sandbox/columns.ts";
import type { SandboxCommentKind } from "../schema/sandbox/comments.ts";
import {
  COMMENT_INPUT_INVALID,
  validCommentInput,
  type CommentAnchor,
} from "./comments.ts";
import {
  isUuid,
  requireTeam,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

const SLUG = new RegExp(SANDBOX_SLUG_PATTERN);

/** Who wrote a root, as the team reads it: a reviewer by code, or a team member by email. */
export type TeamCommentAuthor =
  | { kind: "reviewer"; reviewerId: string; label: string }
  | { kind: "team"; email: string | null; self: boolean };

/** One root on the slug, as the team reads it. */
export type TeamComment = {
  id: string;
  number: number;
  design: string;
  kind: SandboxCommentKind | null;
  body: string;
  anchor: CommentAnchor;
  viewportW: number;
  viewportH: number;
  clientCreatedAt: Date;
  createdAt: Date;
  author: TeamCommentAuthor;
};

/** The slug's codes in label order, and its roots: reviewer comments and team notes. */
export type TeamComments = {
  reviewers: { reviewerId: string; label: string }[];
  comments: TeamComment[];
};

export type SaveTeamNoteInput = {
  id: string;
  slug: string;
  number: number;
  design: string;
  body: string;
  anchor: CommentAnchor;
  viewportW: number;
  viewportH: number;
  clientCreatedAt: Date;
};

/** `{ number }`: saved under the T-number the server fixed. `taken`: the id is not the viewer's note. */
export type SaveTeamNoteOutcome = { number: number } | "taken";

function invalid(): never {
  throw new SandboxAccessError(COMMENT_INPUT_INVALID);
}

function validSlug(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > SANDBOX_SLUG_MAX ||
    !SLUG.test(value)
  )
    invalid();
  return value;
}

/** Only the slug, so a reviewer-shaped input cannot widen or narrow the read. */
function slugOnly(input: unknown): string {
  if (input === null || typeof input !== "object") invalid();
  const raw = input as Record<string, unknown>;
  if (Object.keys(raw).some((key) => key !== "slug")) invalid();
  return validSlug(raw.slug);
}

/** A team note: a row with an author account and no reviewer, access or parent. */
function isNote() {
  return and(
    isNotNull(sandboxComments.teamUserId),
    isNull(sandboxComments.reviewerId),
    isNull(sandboxComments.parentId),
  );
}

/** Every root on the slug for the team, with the slug's codes. */
export async function listTeamComments(
  db: SandboxDb,
  viewer: Viewer,
  input: { slug: string },
): Promise<TeamComments> {
  const team = requireTeam(viewer);
  const slug = slugOnly(input);
  const reviewers = await db
    .select({ reviewerId: sandboxReviewers.id, label: sandboxReviewers.label })
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.slug, slug))
    .orderBy(asc(sandboxReviewers.label), asc(sandboxReviewers.id));
  const rows = await db
    .select({
      id: sandboxComments.id,
      number: sandboxComments.number,
      design: sandboxComments.design,
      kind: sandboxComments.kind,
      body: sandboxComments.body,
      anchor: sandboxComments.anchor,
      viewportW: sandboxComments.viewportW,
      viewportH: sandboxComments.viewportH,
      clientCreatedAt: sandboxComments.clientCreatedAt,
      createdAt: sandboxComments.createdAt,
      reviewerId: sandboxComments.reviewerId,
      label: sandboxReviewers.label,
      teamUserId: sandboxComments.teamUserId,
      email: users.email,
    })
    .from(sandboxComments)
    .leftJoin(
      sandboxReviewers,
      eq(sandboxReviewers.id, sandboxComments.reviewerId),
    )
    .leftJoin(users, eq(users.id, sandboxComments.teamUserId))
    .where(
      and(eq(sandboxComments.slug, slug), isNull(sandboxComments.parentId)),
    )
    .orderBy(
      asc(sandboxComments.design),
      asc(sandboxComments.number),
      asc(sandboxComments.createdAt),
    );
  return {
    reviewers,
    comments: rows.map(
      ({ reviewerId, label, teamUserId, email, anchor, ...row }) => ({
        ...row,
        anchor: anchor as CommentAnchor,
        author:
          reviewerId !== null
            ? { kind: "reviewer", reviewerId, label: label ?? "" }
            : { kind: "team", email, self: teamUserId === team.userId },
      }),
    ),
  };
}

function validNote(input: unknown): SaveTeamNoteInput {
  if (input === null || typeof input !== "object") invalid();
  const { slug, ...rest } = input as Record<string, unknown>;
  // A note has no type: a kind, even null, is refused.
  if ("kind" in rest) invalid();
  const checked = validCommentInput({ ...rest, kind: null });
  return {
    id: checked.id,
    slug: validSlug(slug),
    number: checked.number,
    design: checked.design,
    body: checked.body,
    anchor: checked.anchor,
    viewportW: checked.viewportW,
    viewportH: checked.viewportH,
    clientCreatedAt: checked.clientCreatedAt,
  };
}

/** Inserts the viewer's note under its browser-minted id, or updates their own note's text. */
export async function saveTeamNote(
  db: SandboxDb,
  viewer: Viewer,
  input: SaveTeamNoteInput,
): Promise<SaveTeamNoteOutcome> {
  const team = requireTeam(viewer);
  const note = validNote(input);
  return db.transaction(async (tx) => {
    // Notes on one slug are numbered in turn.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`sandbox-team-notes:${note.slug}`}, 0))`,
    );
    const mine = and(
      eq(sandboxComments.id, note.id),
      eq(sandboxComments.slug, note.slug),
      eq(sandboxComments.teamUserId, team.userId),
      isNote(),
    );
    const [existing] = await tx
      .select({ number: sandboxComments.number })
      .from(sandboxComments)
      .where(mine);
    if (existing) {
      await tx.update(sandboxComments).set({ body: note.body }).where(mine);
      return { number: existing.number };
    }

    const notesOnSlug = and(eq(sandboxComments.slug, note.slug), isNote());
    const [clash] = await tx
      .select({ id: sandboxComments.id })
      .from(sandboxComments)
      .where(and(notesOnSlug, eq(sandboxComments.number, note.number)))
      .limit(1);
    let number = note.number;
    if (clash) {
      const [top] = await tx
        .select({ n: max(sandboxComments.number) })
        .from(sandboxComments)
        .where(notesOnSlug);
      number = (top?.n ?? 0) + 1;
    }
    const inserted = await tx
      .insert(sandboxComments)
      .values({
        id: note.id,
        slug: note.slug,
        design: note.design,
        number,
        kind: null,
        body: note.body,
        anchor: note.anchor,
        viewportW: note.viewportW,
        viewportH: note.viewportH,
        clientCreatedAt: note.clientCreatedAt,
        teamUserId: team.userId,
      })
      .onConflictDoNothing({ target: sandboxComments.id })
      .returning({ id: sandboxComments.id });
    // The id is held by a reviewer's comment, a reply, another member's
    // note or a note on another slug: nothing changes, nothing is said.
    return inserted.length === 1 ? { number } : "taken";
  });
}

/** Deletes the viewer's own note under this id; `taken` when the id is held by anything else. */
export async function deleteTeamNote(
  db: SandboxDb,
  viewer: Viewer,
  input: { id: string },
): Promise<"deleted" | "taken"> {
  const team = requireTeam(viewer);
  if (input === null || typeof input !== "object") invalid();
  const raw = input as Record<string, unknown>;
  if (Object.keys(raw).some((key) => key !== "id") || !isUuid(raw.id))
    invalid();
  const id = raw.id.toLowerCase();
  return db.transaction(async (tx) => {
    const deleted = await tx
      .delete(sandboxComments)
      .where(
        and(
          eq(sandboxComments.id, id),
          eq(sandboxComments.teamUserId, team.userId),
          isNote(),
        ),
      )
      .returning({ id: sandboxComments.id });
    if (deleted.length === 1) return "deleted";
    const [held] = await tx
      .select({ id: sandboxComments.id })
      .from(sandboxComments)
      .where(eq(sandboxComments.id, id));
    return held ? "taken" : "deleted";
  });
}
