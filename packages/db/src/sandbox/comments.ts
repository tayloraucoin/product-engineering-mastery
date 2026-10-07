/**
 * A reviewer's pins (LAB-12, pins.md, S17, D-LAB-13). Reviewer only: each
 * takes `(db, viewer, input)`, refuses a team viewer, and touches only the
 * viewer's own comments on their slug. Team notes are LAB-14's.
 *
 * - `listMyComments`: the viewer's own comments, in number order; never a
 *   team note, never another reviewer's.
 * - `saveComment`: the id is minted in the browser, so a retry lands once:
 *   insert `on conflict (id) do nothing`, then, when the row already exists,
 *   an update scoped by id, reviewer and slug, all in one transaction. An id
 *   held by anyone else matches no update and comes back `taken`, with
 *   nothing changed and nothing about the row revealed. The 500 cap is
 *   counted inside the same transaction, behind a lock on the reviewer row,
 *   so two saves at once cannot both pass it.
 * - `deleteComment`: a hard delete of the viewer's own row; an id that is
 *   not theirs deletes nothing. Undo is `saveComment` under the same id.
 *
 * Limits (data-contract.md): a body of 1 to 2,000 characters, an anchor of
 * at most 2 KB, at most 500 comments per reviewer per experiment
 * ([PROPOSED], built as written). Errors are fixed strings that never echo
 * input.
 */

import { and, asc, count, eq } from "drizzle-orm";

import {
  SANDBOX_COMMENT_BODY_MAX,
  SANDBOX_COMMENT_KINDS,
  type SandboxAnchor,
  type SandboxCommentKind,
} from "../schema/sandbox/comments.ts";
import { sandboxComments, sandboxReviewers } from "../schema/index.ts";
import { REVIEWER_NOT_FOUND } from "./experiment.ts";
import {
  isUuid,
  requireReviewer,
  reviewerScope,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

export const COMMENT_INPUT_INVALID = "The comment input is not valid.";
export const COMMENT_BODY_INVALID = "The comment must be 1 to 2,000 characters.";

/** At most this many comments per reviewer per experiment ([PROPOSED], data-contract.md). */
export const COMMENTS_PER_REVIEWER_MAX = 500;
/** An anchor's JSON, in bytes. */
export const ANCHOR_BYTES_MAX = 2048;

const DESIGN_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DESIGN_ID_MAX = 24;
/** A pin's number; far above the cap, so a real number always fits. */
const NUMBER_MAX = 100_000;
/** A viewport side in CSS pixels. */
const VIEWPORT_MAX = 100_000;
/** A place name, as the browser builds it (40 characters plus quotes). */
const PLACE_MAX = 80;
const REF_MAX = 1024;

/** An anchor as stored: the marked region, an id or a path, the fractions, and the place's name. */
export type CommentAnchor = SandboxAnchor & { place?: string };

/** One comment as its author reads it back. */
export type MyComment = {
  id: string;
  number: number;
  design: string;
  kind: SandboxCommentKind | null;
  body: string;
  anchor: CommentAnchor;
  createdAt: Date;
};

export type SaveCommentInput = {
  id: string;
  number: number;
  design: string;
  kind: SandboxCommentKind | null;
  body: string;
  anchor: CommentAnchor;
  viewportW: number;
  viewportH: number;
  clientCreatedAt: Date;
};

/**
 * `saved`: inserted, or the viewer's own row updated. `limit`: a new comment
 * past the cap, not stored. `taken`: the id is held by someone else; nothing
 * changed.
 */
export type SaveCommentOutcome = "saved" | "limit" | "taken";

function invalid(): never {
  throw new SandboxAccessError(COMMENT_INPUT_INVALID);
}

function emptyInput(input: unknown) {
  if (input === null || typeof input !== "object" || Object.keys(input).length)
    invalid();
}

function fraction(value: unknown): number {
  if (typeof value !== "number" || !(value >= 0 && value <= 1)) invalid();
  return value;
}

function ref(value: unknown): string {
  if (typeof value !== "string" || value.length > REF_MAX) invalid();
  return value;
}

/** Exactly one of marked, id or path, the fractions, and an optional place name; at most 2 KB. */
function validAnchor(value: unknown): CommentAnchor {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    invalid();
  const raw = value as Record<string, unknown>;
  const allowed = ["marked", "id", "path", "x", "y", "place"];
  if (Object.keys(raw).some((key) => !allowed.includes(key))) invalid();
  const refs = (["marked", "id", "path"] as const).filter(
    (key) => raw[key] !== undefined,
  );
  if (refs.length !== 1) invalid();
  const anchor: CommentAnchor = { x: fraction(raw.x), y: fraction(raw.y) };
  anchor[refs[0]!] = ref(raw[refs[0]!]);
  if (raw.marked === "" || raw.id === "") invalid();
  if (raw.place !== undefined) {
    if (typeof raw.place !== "string" || raw.place.length > PLACE_MAX)
      invalid();
    anchor.place = raw.place;
  }
  if (Buffer.byteLength(JSON.stringify(anchor)) > ANCHOR_BYTES_MAX) invalid();
  return anchor;
}

function wholeNumber(value: unknown, max: number): number {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > max)
    invalid();
  return value as number;
}

function validInput(input: unknown): SaveCommentInput {
  if (input === null || typeof input !== "object") invalid();
  const raw = input as Record<string, unknown>;
  if (!isUuid(raw.id)) invalid();
  const design = raw.design;
  if (
    typeof design !== "string" ||
    design.length > DESIGN_ID_MAX ||
    !DESIGN_ID.test(design)
  )
    invalid();
  const kind = raw.kind ?? null;
  if (kind !== null && !(SANDBOX_COMMENT_KINDS as readonly unknown[]).includes(kind))
    invalid();
  const body = raw.body;
  if (
    typeof body !== "string" ||
    body.trim().length === 0 ||
    body.length > SANDBOX_COMMENT_BODY_MAX
  )
    throw new SandboxAccessError(COMMENT_BODY_INVALID);
  const created = raw.clientCreatedAt;
  if (!(created instanceof Date) || Number.isNaN(created.getTime())) invalid();
  return {
    id: raw.id.toLowerCase(),
    number: wholeNumber(raw.number, NUMBER_MAX),
    design,
    kind: kind as SandboxCommentKind | null,
    body,
    anchor: validAnchor(raw.anchor),
    viewportW: wholeNumber(raw.viewportW, VIEWPORT_MAX),
    viewportH: wholeNumber(raw.viewportH, VIEWPORT_MAX),
    clientCreatedAt: created,
  };
}

/** The viewer's own comments on their slug, in number order. Takes an empty input. */
export async function listMyComments(
  db: SandboxDb,
  viewer: Viewer,
  input: Record<string, never>,
): Promise<MyComment[]> {
  const reviewer = requireReviewer(viewer);
  emptyInput(input);
  const rows = await db
    .select({
      id: sandboxComments.id,
      number: sandboxComments.number,
      design: sandboxComments.design,
      kind: sandboxComments.kind,
      body: sandboxComments.body,
      anchor: sandboxComments.anchor,
      createdAt: sandboxComments.createdAt,
    })
    .from(sandboxComments)
    .where(reviewerScope(reviewer, sandboxComments))
    .orderBy(asc(sandboxComments.number), asc(sandboxComments.createdAt));
  return rows.map((row) => ({ ...row, anchor: row.anchor as CommentAnchor }));
}

/**
 * Inserts the comment under its browser-minted id, or updates the viewer's
 * own row under that id (its type and text; its design, place and number
 * stay as first saved). See the module comment for the cap and `taken`.
 */
export async function saveComment(
  db: SandboxDb,
  viewer: Viewer,
  input: SaveCommentInput,
): Promise<SaveCommentOutcome> {
  const reviewer = requireReviewer(viewer);
  const comment = validInput(input);
  try {
    return await db.transaction(async (tx) => {
      // The reviewer row, locked: saves for one reviewer count the cap in turn.
      const [row] = await tx
        .select({ id: sandboxReviewers.id })
        .from(sandboxReviewers)
        .where(
          and(
            eq(sandboxReviewers.id, reviewer.reviewerId),
            eq(sandboxReviewers.slug, reviewer.slug),
          ),
        )
        .for("update");
      if (!row) throw new SandboxAccessError(REVIEWER_NOT_FOUND);

      const inserted = await tx
        .insert(sandboxComments)
        .values({
          ...comment,
          slug: reviewer.slug,
          reviewerId: reviewer.reviewerId,
          accessId: reviewer.accessId,
        })
        .onConflictDoNothing({ target: sandboxComments.id })
        .returning({ id: sandboxComments.id });

      if (inserted.length === 1) {
        const [held] = await tx
          .select({ n: count() })
          .from(sandboxComments)
          .where(reviewerScope(reviewer, sandboxComments));
        // Past the cap the throw rolls the insert back: nothing is stored.
        if (held!.n > COMMENTS_PER_REVIEWER_MAX) throw new OverLimit();
        return "saved";
      }

      const updated = await tx
        .update(sandboxComments)
        .set({ kind: comment.kind, body: comment.body })
        .where(
          and(
            eq(sandboxComments.id, comment.id),
            reviewerScope(reviewer, sandboxComments),
          ),
        )
        .returning({ id: sandboxComments.id });
      return updated.length === 1 ? "saved" : "taken";
    });
  } catch (error) {
    if (error instanceof OverLimit) return "limit";
    // The composite keys refuse an access that is not this reviewer's, or one
    // erased since the request began: a fixed error, never Postgres's.
    if (isForeignKeyViolation(error))
      throw new SandboxAccessError(REVIEWER_NOT_FOUND);
    throw error;
  }
}

/** Deletes the viewer's own comment under this id; any other id deletes nothing. */
export async function deleteComment(
  db: SandboxDb,
  viewer: Viewer,
  input: { id: string },
): Promise<void> {
  const reviewer = requireReviewer(viewer);
  const id = (input as { id?: unknown } | null)?.id;
  if (!isUuid(id)) invalid();
  await db
    .delete(sandboxComments)
    .where(
      and(
        eq(sandboxComments.id, id.toLowerCase()),
        reviewerScope(reviewer, sandboxComments),
      ),
    );
}

/** Thrown inside the save's transaction to roll back a comment past the cap. */
class OverLimit extends Error {}

function isForeignKeyViolation(error: unknown): boolean {
  const code = (e: unknown) => (e as { code?: unknown } | null)?.code;
  return (
    code(error) === "23503" ||
    code((error as { cause?: unknown } | null)?.cause) === "23503"
  );
}
