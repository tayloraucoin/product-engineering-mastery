/**
 * Threads (beat 2, LAB-25, threads.md, D-LAB-16, D-LAB-17): replies one
 * level deep under a reviewer's comment, in a collaborate experiment. Each
 * takes `(db, viewer, input)`, and the input carries the experiment's mode,
 * which the app reads from the registry by slug, never from a request. The
 * team names the slug in its input; a reviewer's slug is the viewer's.
 *
 * - A reviewer reads through `reviewerScope` with the mode: private is their
 *   own rows; collaborate is the slug's reviewer comments and replies and the
 *   team's replies, never a team note. A reviewer's row names another
 *   reviewer by display name and a team reply as `team`, and holds no email,
 *   label, user id, reviewer id or access id. Only their own roots carry a
 *   number.
 * - The team reads the slug's reviewer comments with their replies, naming
 *   reviewers by the code's label and team members by email. Team notes are
 *   LAB-14's and never in a thread.
 * - A reply whose root is gone reads under a removed root rebuilt from the
 *   replies ("Comment removed", C-LAB-threads-5). A reply whose parent still
 *   exists but is outside the read (a team note) is dropped, so a reply can
 *   never carry a hidden root's place into a read.
 * - `saveReply` resolves the root inside its transaction: a reply's parent
 *   gives its root, and the reply copies the root's design and anchor. An id
 *   matching no row is a removed root, placed from a surviving reply under
 *   it. A team note, another slug, an unknown id or private mode is
 *   `not-saved`, with nothing written. The id is minted in the browser:
 *   insert `on conflict do nothing`, then an update of the author's own
 *   reply, so a retry lands once. A reviewer's replies count toward the 500
 *   per reviewer, inside the save, behind the lock saveComment takes.
 * - `deleteReply` hard-deletes the viewer's own reply; Undo is `saveReply`
 *   under the same id.
 *
 * Errors are fixed strings that never echo input.
 */

import {
  and,
  asc,
  count,
  eq,
  inArray,
  isNotNull,
  isNull,
  type SQL,
} from "drizzle-orm";

import { users } from "../schema/account/users.ts";
import { sandboxComments, sandboxReviewers } from "../schema/index.ts";
import {
  SANDBOX_SLUG_MAX,
  SANDBOX_SLUG_PATTERN,
} from "../schema/sandbox/columns.ts";
import {
  SANDBOX_COMMENT_BODY_MAX,
  type SandboxCommentKind,
} from "../schema/sandbox/comments.ts";
import { COMMENTS_PER_REVIEWER_MAX, type CommentAnchor } from "./comments.ts";
import { REVIEWER_NOT_FOUND } from "./experiment.ts";
import {
  isUuid,
  requireReviewer,
  requireTeam,
  reviewerScope,
  SandboxAccessError,
  threadRowsOn,
  type ReviewerViewer,
  type ReviewMode,
  type SandboxDb,
  type TeamViewer,
  type Viewer,
} from "./viewer.ts";

export const THREAD_INPUT_INVALID = "The thread input is not valid.";
export const REPLY_BODY_INVALID = "The reply must be 1 to 2,000 characters.";

/** Replies are never numbered (threads.md); the column is not null, so they hold 0. */
const REPLY_NUMBER = 0;
const SLUG = new RegExp(SANDBOX_SLUG_PATTERN);

/** Who wrote a row, as a reviewer reads it: themself, another reviewer by display name, or the team. */
export type ReviewerAuthor = "self" | { reviewer: string | null } | "team";
/** Who wrote a row, as the team reads it: themself, a reviewer by the code's label, or a team member by email. */
export type TeamAuthor =
  "self" | { reviewer: string | null } | { team: string | null };

export type ThreadReply<A> = {
  id: string;
  parentId: string;
  body: string;
  createdAt: Date;
  author: A;
};

/** A comment and its replies, oldest first. `number` is present only where the reader may see it. */
export type ThreadComment<A> = {
  id: string;
  design: string;
  anchor: CommentAnchor;
  kind: SandboxCommentKind | null;
  body: string;
  createdAt: Date;
  author: A;
  number?: number;
  replies: ThreadReply<A>[];
};

/**
 * A root deleted or erased, rebuilt from the replies that survive it. Its
 * `createdAt` is its oldest surviving reply's, so it sorts among the others.
 */
export type RemovedComment<A> = {
  id: string;
  design: string;
  anchor: CommentAnchor;
  createdAt: Date;
  removed: true;
  replies: ThreadReply<A>[];
};

export type ThreadRoot<A> = ThreadComment<A> | RemovedComment<A>;

/** `slug` only for the team; a reviewer's is the viewer's. */
export type ListThreadInput = { mode: ReviewMode; slug?: string };
export type ListRepliesInput = {
  rootId: string;
  mode: ReviewMode;
  slug?: string;
};
export type SaveReplyInput = {
  id: string;
  parentId: string;
  body: string;
  clientCreatedAt: Date;
  mode: ReviewMode;
  slug?: string;
};

/** `ok`: stored, or the author's own reply edited. `limit`: past the reviewer's cap. `not-saved`: nothing written. */
export type SaveReplyOutcome = "ok" | "not-saved" | "limit";

function invalid(): never {
  throw new SandboxAccessError(THREAD_INPUT_INVALID);
}

function fields(input: unknown, allowed: string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input))
    invalid();
  const raw = input as Record<string, unknown>;
  if (Object.keys(raw).some((key) => !allowed.includes(key))) invalid();
  return raw;
}

function validMode(value: unknown): ReviewMode {
  if (value !== "private" && value !== "collaborate") invalid();
  return value;
}

function validId(value: unknown): string {
  if (!isUuid(value)) invalid();
  return value.toLowerCase();
}

/** The reviewer, or the team member and the slug they name. A reviewer never names one. */
function whoAndWhere(
  viewer: Viewer,
  raw: Record<string, unknown>,
):
  | { kind: "reviewer"; reviewer: ReviewerViewer; slug: string }
  | { kind: "team"; team: TeamViewer; slug: string } {
  if (viewer?.kind === "reviewer") {
    const reviewer = requireReviewer(viewer);
    if (raw.slug !== undefined) invalid();
    return { kind: "reviewer", reviewer, slug: reviewer.slug };
  }
  const team = requireTeam(viewer);
  const slug = raw.slug;
  if (
    typeof slug !== "string" ||
    slug.length > SANDBOX_SLUG_MAX ||
    !SLUG.test(slug)
  )
    invalid();
  return { kind: "team", team, slug };
}

const threadColumns = {
  id: sandboxComments.id,
  parentId: sandboxComments.parentId,
  design: sandboxComments.design,
  anchor: sandboxComments.anchor,
  kind: sandboxComments.kind,
  body: sandboxComments.body,
  number: sandboxComments.number,
  createdAt: sandboxComments.createdAt,
  reviewerId: sandboxComments.reviewerId,
  teamUserId: sandboxComments.teamUserId,
};

type Row = {
  id: string;
  parentId: string | null;
  design: string;
  anchor: unknown;
  kind: SandboxCommentKind | null;
  body: string;
  number: number;
  createdAt: Date;
  reviewerId: string | null;
  teamUserId: string | null;
  /** The display name to a reviewer, the label to the team. */
  reviewerName: string | null;
  /** A team member's email, read for the team only. */
  teamEmail: string | null;
};

/** A reviewer's rows for this mode, with the display names they may see. */
async function rowsForReviewer(
  db: SandboxDb,
  reviewer: ReviewerViewer,
  mode: ReviewMode,
  rootId?: string,
): Promise<Row[]> {
  const scope = reviewerScope(reviewer, sandboxComments, { mode });
  const rows = await db
    .select({ ...threadColumns, reviewerName: sandboxReviewers.displayName })
    .from(sandboxComments)
    .leftJoin(
      sandboxReviewers,
      eq(sandboxReviewers.id, sandboxComments.reviewerId),
    )
    .where(
      rootId === undefined
        ? scope
        : and(scope, eq(sandboxComments.parentId, rootId)),
    )
    .orderBy(asc(sandboxComments.createdAt), asc(sandboxComments.id));
  return rows.map((row) => ({ ...row, teamEmail: null }));
}

/**
 * The team's rows on a slug: reviewer comments, and in collaborate mode every
 * reply, with the code's label and the team member's email. A team row
 * without a parent is a note and is never here.
 */
async function rowsForTeam(
  db: SandboxDb,
  slug: string,
  mode: ReviewMode,
  rootId?: string,
): Promise<Row[]> {
  let where: SQL;
  if (rootId !== undefined) {
    if (mode !== "collaborate") return [];
    where = and(
      eq(sandboxComments.slug, slug),
      eq(sandboxComments.parentId, rootId),
    )!;
  } else if (mode === "collaborate") {
    where = threadRowsOn(slug, sandboxComments);
  } else {
    where = and(
      eq(sandboxComments.slug, slug),
      isNotNull(sandboxComments.reviewerId),
      isNull(sandboxComments.parentId),
    )!;
  }
  return db
    .select({
      ...threadColumns,
      reviewerName: sandboxReviewers.label,
      teamEmail: users.email,
    })
    .from(sandboxComments)
    .leftJoin(
      sandboxReviewers,
      eq(sandboxReviewers.id, sandboxComments.reviewerId),
    )
    .leftJoin(users, eq(users.id, sandboxComments.teamUserId))
    .where(where)
    .orderBy(asc(sandboxComments.createdAt), asc(sandboxComments.id));
}

/** Of these parent ids, the ones whose row still exists: a reply under one outside the read is dropped. */
async function hiddenParents(
  db: SandboxDb,
  slug: string,
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const rows = await db
    .select({ id: sandboxComments.id })
    .from(sandboxComments)
    .where(
      and(eq(sandboxComments.slug, slug), inArray(sandboxComments.id, ids)),
    );
  return new Set(rows.map((row) => row.id));
}

function reviewerAuthor(row: Row, me: ReviewerViewer): ReviewerAuthor {
  if (row.reviewerId === me.reviewerId) return "self";
  if (row.reviewerId !== null) return { reviewer: row.reviewerName };
  return "team";
}

function teamAuthor(row: Row, me: TeamViewer): TeamAuthor {
  if (row.teamUserId === me.userId) return "self";
  if (row.reviewerId !== null) return { reviewer: row.reviewerName };
  return { team: row.teamEmail };
}

function replyOf<A>(row: Row, author: A): ThreadReply<A> {
  return {
    id: row.id,
    parentId: row.parentId!,
    body: row.body,
    createdAt: row.createdAt,
    author,
  };
}

/** Roots with their replies, oldest first; removed roots rebuilt; replies under a hidden parent dropped. */
async function assemble<A>(
  db: SandboxDb,
  slug: string,
  rows: Row[],
  authorOf: (row: Row) => A,
  showNumber: (row: Row) => boolean,
): Promise<ThreadRoot<A>[]> {
  const roots = new Map<string, ThreadRoot<A>>();
  for (const row of rows) {
    if (row.parentId !== null) continue;
    roots.set(row.id, {
      id: row.id,
      design: row.design,
      anchor: row.anchor as CommentAnchor,
      kind: row.kind,
      body: row.body,
      createdAt: row.createdAt,
      author: authorOf(row),
      ...(showNumber(row) ? { number: row.number } : {}),
      replies: [],
    });
  }
  const orphans = [
    ...new Set(
      rows
        .filter((row) => row.parentId !== null && !roots.has(row.parentId))
        .map((row) => row.parentId!),
    ),
  ];
  const hidden = await hiddenParents(db, slug, orphans);
  for (const row of rows) {
    if (row.parentId === null || hidden.has(row.parentId)) continue;
    let root = roots.get(row.parentId);
    if (!root) {
      // The oldest surviving reply places the removed root: it copied the root's design and anchor.
      root = {
        id: row.parentId,
        design: row.design,
        anchor: row.anchor as CommentAnchor,
        createdAt: row.createdAt,
        removed: true,
        replies: [],
      };
      roots.set(row.parentId, root);
    }
    root.replies.push(replyOf(row, authorOf(row)));
  }
  // Oldest first, removed roots by their oldest surviving reply.
  return [...roots.values()].sort(
    (a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime() ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

/**
 * Every thread the viewer may read on the slug: roots, oldest first, each
 * with its replies. A reviewer's own roots carry their number.
 */
export function listThread(
  db: SandboxDb,
  viewer: ReviewerViewer,
  input: ListThreadInput,
): Promise<ThreadRoot<ReviewerAuthor>[]>;
export function listThread(
  db: SandboxDb,
  viewer: TeamViewer,
  input: ListThreadInput,
): Promise<ThreadRoot<TeamAuthor>[]>;
export function listThread(
  db: SandboxDb,
  viewer: Viewer,
  input: ListThreadInput,
): Promise<ThreadRoot<ReviewerAuthor>[] | ThreadRoot<TeamAuthor>[]>;
export async function listThread(
  db: SandboxDb,
  viewer: Viewer,
  input: ListThreadInput,
): Promise<ThreadRoot<ReviewerAuthor>[] | ThreadRoot<TeamAuthor>[]> {
  const raw = fields(input, ["mode", "slug"]);
  const who = whoAndWhere(viewer, raw);
  const mode = validMode(raw.mode);
  if (who.kind === "reviewer") {
    const me = who.reviewer;
    const rows = await rowsForReviewer(db, me, mode);
    return assemble(
      db,
      who.slug,
      rows,
      (row) => reviewerAuthor(row, me),
      (row) => row.reviewerId === me.reviewerId,
    );
  }
  const rows = await rowsForTeam(db, who.slug, mode);
  return assemble(
    db,
    who.slug,
    rows,
    (row) => teamAuthor(row, who.team),
    (row) => row.reviewerId !== null,
  );
}

/** The replies under one root, oldest first, for a pin opened. A root outside the read gives none. */
export function listReplies(
  db: SandboxDb,
  viewer: ReviewerViewer,
  input: ListRepliesInput,
): Promise<ThreadReply<ReviewerAuthor>[]>;
export function listReplies(
  db: SandboxDb,
  viewer: TeamViewer,
  input: ListRepliesInput,
): Promise<ThreadReply<TeamAuthor>[]>;
export function listReplies(
  db: SandboxDb,
  viewer: Viewer,
  input: ListRepliesInput,
): Promise<ThreadReply<ReviewerAuthor>[] | ThreadReply<TeamAuthor>[]>;
export async function listReplies(
  db: SandboxDb,
  viewer: Viewer,
  input: ListRepliesInput,
): Promise<ThreadReply<ReviewerAuthor>[] | ThreadReply<TeamAuthor>[]> {
  const raw = fields(input, ["rootId", "mode", "slug"]);
  const who = whoAndWhere(viewer, raw);
  const mode = validMode(raw.mode);
  const rootId = validId(raw.rootId);
  const rows =
    who.kind === "reviewer"
      ? await rowsForReviewer(db, who.reviewer, mode, rootId)
      : await rowsForTeam(db, who.slug, mode, rootId);
  if (rows.length === 0) return [];
  // A root that exists must be a reviewer comment the read could hold.
  const [root] = await db
    .select({
      reviewerId: sandboxComments.reviewerId,
      parentId: sandboxComments.parentId,
    })
    .from(sandboxComments)
    .where(
      and(eq(sandboxComments.id, rootId), eq(sandboxComments.slug, who.slug)),
    );
  if (root && (root.reviewerId === null || root.parentId !== null)) return [];
  if (who.kind === "reviewer") {
    const me = who.reviewer;
    return rows.map((row) => replyOf(row, reviewerAuthor(row, me)));
  }
  return rows.map((row) => replyOf(row, teamAuthor(row, who.team)));
}

type Placement = {
  rootId: string;
  design: string;
  anchor: unknown;
  viewportW: number;
  viewportH: number;
};

function placement(rootId: string, row: Omit<Placement, "rootId">): Placement {
  return {
    rootId,
    design: row.design,
    anchor: row.anchor,
    viewportW: row.viewportW,
    viewportH: row.viewportH,
  };
}

/** The root a reply belongs under, on this slug: a live reviewer comment, or a removed root a reply still places. */
async function resolveRoot(
  tx: SandboxDb,
  slug: string,
  parentId: string,
): Promise<Placement | null> {
  const place = {
    id: sandboxComments.id,
    parentId: sandboxComments.parentId,
    reviewerId: sandboxComments.reviewerId,
    design: sandboxComments.design,
    anchor: sandboxComments.anchor,
    viewportW: sandboxComments.viewportW,
    viewportH: sandboxComments.viewportH,
  };
  const onSlug = (id: SQL) => and(id, eq(sandboxComments.slug, slug));
  const [parent] = await tx
    .select(place)
    .from(sandboxComments)
    .where(onSlug(eq(sandboxComments.id, parentId)));
  const rootId = parent?.parentId ?? parentId;
  const [root] =
    parent && parent.parentId === null
      ? [parent]
      : await tx
          .select(place)
          .from(sandboxComments)
          .where(onSlug(eq(sandboxComments.id, rootId)));
  if (root) {
    // A team note, or a row that is itself a reply, is no root.
    if (root.reviewerId === null || root.parentId !== null) return null;
    return placement(rootId, root);
  }
  // Removed: a surviving reply under it holds the root's place.
  const [survivor] = await tx
    .select(place)
    .from(sandboxComments)
    .where(onSlug(eq(sandboxComments.parentId, rootId)))
    .orderBy(asc(sandboxComments.createdAt), asc(sandboxComments.id))
    .limit(1);
  return survivor ? placement(rootId, survivor) : null;
}

/**
 * A reply, new or the author's own edited, under its browser-minted id. The
 * parent may be the root or a reply in its thread; either way it is stored
 * under the root. See the module comment for what is refused.
 */
export async function saveReply(
  db: SandboxDb,
  viewer: Viewer,
  input: SaveReplyInput,
): Promise<SaveReplyOutcome> {
  const raw = fields(input, [
    "id",
    "parentId",
    "body",
    "clientCreatedAt",
    "mode",
    "slug",
  ]);
  const who = whoAndWhere(viewer, raw);
  const mode = validMode(raw.mode);
  const id = validId(raw.id);
  const parentId = validId(raw.parentId);
  const body = raw.body;
  if (
    typeof body !== "string" ||
    body.trim().length === 0 ||
    body.length > SANDBOX_COMMENT_BODY_MAX
  )
    throw new SandboxAccessError(REPLY_BODY_INVALID);
  const created = raw.clientCreatedAt;
  if (!(created instanceof Date) || Number.isNaN(created.getTime())) invalid();
  if (mode !== "collaborate" || id === parentId) return "not-saved";

  try {
    return await db.transaction(async (tx) => {
      if (who.kind === "reviewer") {
        // The reviewer row, locked: this reviewer's saves count the cap in turn.
        const [row] = await tx
          .select({ id: sandboxReviewers.id })
          .from(sandboxReviewers)
          .where(
            and(
              eq(sandboxReviewers.id, who.reviewer.reviewerId),
              eq(sandboxReviewers.slug, who.slug),
            ),
          )
          .for("update");
        if (!row) throw new SandboxAccessError(REVIEWER_NOT_FOUND);
      }

      const root = await resolveRoot(tx, who.slug, parentId);
      if (!root || root.rootId === id) return "not-saved";

      const author =
        who.kind === "reviewer"
          ? {
              reviewerId: who.reviewer.reviewerId,
              accessId: who.reviewer.accessId,
            }
          : { teamUserId: who.team.userId };
      const inserted = await tx
        .insert(sandboxComments)
        .values({
          id,
          slug: who.slug,
          design: root.design,
          number: REPLY_NUMBER,
          kind: null,
          body,
          anchor: root.anchor as CommentAnchor,
          viewportW: root.viewportW,
          viewportH: root.viewportH,
          clientCreatedAt: created,
          parentId: root.rootId,
          ...author,
        })
        .onConflictDoNothing({ target: sandboxComments.id })
        .returning({ id: sandboxComments.id });

      if (inserted.length === 1) {
        if (who.kind === "reviewer") {
          const [held] = await tx
            .select({ n: count() })
            .from(sandboxComments)
            .where(reviewerScope(who.reviewer, sandboxComments));
          // Past the cap the throw rolls the insert back: nothing is stored.
          if (held!.n > COMMENTS_PER_REVIEWER_MAX) throw new OverLimit();
        }
        return "ok";
      }

      // The id exists: only the author's own reply takes the edit.
      const own =
        who.kind === "reviewer"
          ? reviewerScope(who.reviewer, sandboxComments)
          : eq(sandboxComments.teamUserId, who.team.userId);
      const updated = await tx
        .update(sandboxComments)
        .set({ body })
        .where(
          and(
            eq(sandboxComments.id, id),
            eq(sandboxComments.slug, who.slug),
            isNotNull(sandboxComments.parentId),
            own,
          ),
        )
        .returning({ id: sandboxComments.id });
      return updated.length === 1 ? "ok" : "not-saved";
    });
  } catch (error) {
    if (error instanceof OverLimit) return "limit";
    // The composite keys refuse an access erased since the request began.
    if (isForeignKeyViolation(error))
      throw new SandboxAccessError(REVIEWER_NOT_FOUND);
    throw error;
  }
}

/** Deletes the viewer's own reply under this id; any other id deletes nothing. */
export async function deleteReply(
  db: SandboxDb,
  viewer: Viewer,
  input: { id: string },
): Promise<void> {
  const raw = fields(input, ["id"]);
  const id = validId(raw.id);
  const own =
    viewer?.kind === "reviewer"
      ? reviewerScope(requireReviewer(viewer), sandboxComments)
      : eq(sandboxComments.teamUserId, requireTeam(viewer).userId);
  await db
    .delete(sandboxComments)
    .where(
      and(eq(sandboxComments.id, id), isNotNull(sandboxComments.parentId), own),
    );
}

/** Thrown inside the save's transaction to roll back a reply past the cap. */
class OverLimit extends Error {}

function isForeignKeyViolation(error: unknown): boolean {
  const code = (e: unknown) => (e as { code?: unknown } | null)?.code;
  return (
    code(error) === "23503" ||
    code((error as { cause?: unknown } | null)?.cause) === "23503"
  );
}
