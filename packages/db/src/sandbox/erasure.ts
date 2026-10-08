/**
 * Deleting and erasing reviewers' data (LAB-16, data.md; S27, S28, S12c;
 * D-LAB-26 to 28), and reading the record of actions (D-LAB-3).
 *
 * - `deleteExperimentData` is an admin's only: `requireAdmin` runs before
 *   anything else, whatever the caller checked (D-LAB-26). It hard-deletes
 *   the slug's reviewers, accesses, views, comments, versions and team notes.
 * - `eraseEmail` works by access, never by reviewer: it deletes the accesses
 *   made with the email, or with the signed-in reviewer's user ids, which the
 *   app looks up by account email before calling. The same code's other
 *   email keeps its data ("Each is erased separately"). Labels and display
 *   names equal to the email become "Erased reviewer"; a reviewer left with
 *   no access is revoked and relabelled; a name label is cleared only when
 *   its reviewer id is in `clearLabels` (D-LAB-27).
 * - Each runs in one transaction with its record row, which holds counts
 *   only: never a label, an email or a reviewer (D-LAB-28).
 *
 * Every function is team only; a reviewer viewer is refused before any query.
 * Errors are fixed strings that never echo input.
 */

import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { sandboxAccesses } from "../schema/sandbox/accesses.ts";
import { sandboxActions } from "../schema/sandbox/actions.ts";
import { sandboxComments } from "../schema/sandbox/comments.ts";
import { sandboxReviewVersions } from "../schema/sandbox/review-versions.ts";
import { sandboxReviewers } from "../schema/sandbox/reviewers.ts";
import { sandboxViewEvents } from "../schema/sandbox/view-events.ts";
import { recordAction } from "./actions.ts";
import { isSandboxSlug } from "./slug.ts";
import {
  isUuid,
  requireAdmin,
  requireTeam,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

/** The record's names for this module's two actions; the app renders their words. */
export const ERASURE_ACTIONS = Object.freeze({
  dataDeleted: "data-deleted",
  reviewerErased: "reviewer-erased",
} as const);

/** What an erased label or display name becomes (D-LAB-27). */
export const ERASED_LABEL = "Erased reviewer";

/** The record of actions' page size (data.md: paginated at 50). */
export const ACTIONS_PAGE_SIZE = 50;

export const ERASURE_INPUT_INVALID = "The erasure input is not valid.";

/** The longest address the form takes; the gate stores nothing longer. */
const EMAIL_MAX = 254;
/** More accounts than one address can hold; a longer list is refused. */
const USER_IDS_MAX = 20;
/** More labels than one erasure lists; a longer list is refused. */
const CLEAR_LABELS_MAX = 500;
/** More pages than the record will hold for years; a later page is refused. */
const PAGE_MAX = 10_000;

/**
 * What an experiment holds, by kind. `codes` and `reviewers` are both its
 * reviewer rows, since one code is one reviewer (D-LAB-6): the tab says
 * "5 access codes", the button "Delete data from 5 reviewers".
 */
export type ExperimentDataCounts = {
  reviewers: number;
  codes: number;
  views: number;
  /** Reviewers' comments and replies; team notes are counted apart. */
  comments: number;
  /** Reviewers with at least one sent version. */
  reviews: number;
  versions: number;
  teamNotes: number;
};

/** As `ExperimentDataCounts`, with null for a count that failed to load: the tab's partial state. */
export type ExperimentDataCountsRead = {
  [K in keyof ExperimentDataCounts]: number | null;
};

/** A name label the erasure leaves unless it is ticked (D-LAB-27). */
export type NameLabel = { reviewerId: string; slug: string; label: string };

/** What an email holds across every experiment, before it is erased. */
export type ErasureFound = {
  experiments: number;
  comments: number;
  versions: number;
  views: number;
  nameLabels: NameLabel[];
};

/** What one erasure removed or changed. */
export type ErasureCounts = {
  accesses: number;
  comments: number;
  versions: number;
  views: number;
  labelsScrubbed: number;
  reviewersRevoked: number;
};

/** What came through one identity on a code. */
export type HeldCounts = { comments: number; versions: number; views: number };

export type ReviewerEmails = {
  slug: string;
  /** Each email typed with the code, oldest first, with what came through it. */
  emails: (HeldCounts & { email: string })[];
  /** Each signed-in account that used the code; the app finds its email. */
  accounts: (HeldCounts & { userId: string })[];
};

export type ActionRow = {
  id: string;
  at: Date;
  actorEmail: string;
  action: string;
  slug: string | null;
  /** Role changes only: a team member's email, never a reviewer's. */
  targetEmail: string | null;
  counts: Record<string, number> | null;
};

export type ActionsPage = {
  rows: ActionRow[];
  page: number;
  /** Every row in the record, for the page count. */
  total: number;
};

function validSlug(slug: unknown): string {
  if (!isSandboxSlug(slug)) throw new SandboxAccessError(ERASURE_INPUT_INVALID);
  return slug;
}

/** An email as the gate stores it: trimmed, lower-cased, one `@` with text either side. */
function validEmail(email: unknown): string {
  if (
    typeof email !== "string" ||
    email.length > EMAIL_MAX ||
    email !== email.trim().toLowerCase() ||
    !/^[^\s@]+@[^\s@]+$/.test(email)
  )
    throw new SandboxAccessError(ERASURE_INPUT_INVALID);
  return email;
}

function validIds(ids: unknown, max: number): string[] {
  // Postgres echoes a malformed uuid in its error; refuse it first.
  if (!Array.isArray(ids) || ids.length > max || !ids.every(isUuid))
    throw new SandboxAccessError(ERASURE_INPUT_INVALID);
  return [...new Set(ids.map((id) => id.toLowerCase()))];
}

/** A label or display name that is this email, ignoring case and stray spaces. */
const namesEmail = (email: string): SQL =>
  or(
    sql`lower(btrim(${sandboxReviewers.label})) = ${email}`,
    sql`lower(btrim(${sandboxReviewers.displayName})) = ${email}`,
  )!;

/** True for a label that reads as an email address: another person's, never a name. */
const looksLikeEmail = (label: string) =>
  /^[^\s@]+@[^\s@]+$/.test(label.trim());

/** The accesses made with the email, or by one of the accounts. */
function identityMatch(email: string, userIds: string[]): SQL {
  return userIds.length === 0
    ? eq(sandboxAccesses.email, email)
    : or(
        eq(sandboxAccesses.email, email),
        inArray(sandboxAccesses.userId, userIds),
      )!;
}

async function countOrNull(
  read: () => Promise<number>,
): Promise<number | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}

/**
 * What an experiment holds, for its Data tab. Team only: a developer sees
 * the counts too (D-LAB-26). A count whose query fails is null, so the tab
 * shows what loaded and pauses the delete.
 */
export async function countExperimentData(
  db: SandboxDb,
  viewer: Viewer,
  input: { slug: string },
): Promise<ExperimentDataCountsRead> {
  requireTeam(viewer);
  const slug = validSlug(input?.slug);
  const reviewers = await countOrNull(async () => {
    const [row] = await db
      .select({ n: count() })
      .from(sandboxReviewers)
      .where(eq(sandboxReviewers.slug, slug));
    return row!.n;
  });
  const views = await countOrNull(async () => {
    const [row] = await db
      .select({ n: count() })
      .from(sandboxViewEvents)
      .where(eq(sandboxViewEvents.slug, slug));
    return row!.n;
  });
  const comments = await countOrNull(async () => {
    const [row] = await db
      .select({ n: count() })
      .from(sandboxComments)
      .where(
        and(eq(sandboxComments.slug, slug), isNull(sandboxComments.teamUserId)),
      );
    return row!.n;
  });
  const teamNotes = await countOrNull(async () => {
    const [row] = await db
      .select({ n: count() })
      .from(sandboxComments)
      .where(
        and(
          eq(sandboxComments.slug, slug),
          isNotNull(sandboxComments.teamUserId),
        ),
      );
    return row!.n;
  });
  let versions: number | null = null;
  let reviews: number | null = null;
  try {
    const [row] = await db
      .select({
        versions: count(),
        reviews: countDistinct(sandboxReviewVersions.reviewerId),
      })
      .from(sandboxReviewVersions)
      .where(eq(sandboxReviewVersions.slug, slug));
    versions = row!.versions;
    reviews = row!.reviews;
  } catch {
    // Both stay null: the tab shows "—" for each.
  }
  return {
    reviewers,
    codes: reviewers,
    views,
    comments,
    reviews,
    versions,
    teamNotes,
  };
}

/**
 * Hard-deletes everything an experiment holds (S27, D-LAB-26): its reviewers
 * (every code), their accesses, views, comments, replies and versions, and
 * its team notes, which have no reviewer to cascade from. Admins only,
 * refused for a developer here whatever the page or action checked. The
 * slug's reviewer rows are locked first, so no entry, pin or send lands
 * between the counts and the delete. One record row, `data-deleted`, with
 * the counts; none when nothing was held.
 */
export async function deleteExperimentData(
  db: SandboxDb,
  viewer: Viewer,
  input: { slug: string },
): Promise<ExperimentDataCounts> {
  requireAdmin(viewer);
  const slug = validSlug(input?.slug);
  return db.transaction(async (tx) => {
    const reviewerIds = (
      await tx
        .select({ id: sandboxReviewers.id })
        .from(sandboxReviewers)
        .where(eq(sandboxReviewers.slug, slug))
        .for("update")
    ).map((r) => r.id);

    const views = await tx
      .delete(sandboxViewEvents)
      .where(eq(sandboxViewEvents.slug, slug))
      .returning({ id: sandboxViewEvents.id });
    const comments = await tx
      .delete(sandboxComments)
      .where(eq(sandboxComments.slug, slug))
      .returning({ teamUserId: sandboxComments.teamUserId });
    const versions = await tx
      .delete(sandboxReviewVersions)
      .where(eq(sandboxReviewVersions.slug, slug))
      .returning({ reviewerId: sandboxReviewVersions.reviewerId });
    const accesses =
      reviewerIds.length === 0
        ? []
        : await tx
            .delete(sandboxAccesses)
            .where(inArray(sandboxAccesses.reviewerId, reviewerIds))
            .returning({ id: sandboxAccesses.id });
    const reviewers = await tx
      .delete(sandboxReviewers)
      .where(eq(sandboxReviewers.slug, slug))
      .returning({ id: sandboxReviewers.id });

    const teamNotes = comments.filter((c) => c.teamUserId !== null).length;
    const counts: ExperimentDataCounts = {
      reviewers: reviewers.length,
      codes: reviewers.length,
      views: views.length,
      comments: comments.length - teamNotes,
      reviews: new Set(versions.map((v) => v.reviewerId)).size,
      versions: versions.length,
      teamNotes,
    };
    if (reviewers.length > 0 || comments.length > 0)
      await recordAction(tx, viewer, {
        action: ERASURE_ACTIONS.dataDeleted,
        slug,
        counts: {
          reviewers: counts.reviewers,
          accesses: accesses.length,
          viewEvents: counts.views,
          comments: counts.comments,
          reviewVersions: counts.versions,
          teamNotes: counts.teamNotes,
        },
      });
    return counts;
  });
}

/**
 * What an email holds across every experiment, or null when it holds
 * nothing: no access made with it or by the accounts, and no label or
 * display name that is it. `nameLabels` lists the labels the erasure would
 * otherwise leave: on a reviewer that keeps another access, and neither this
 * email nor another address.
 */
export async function findErasure(
  db: SandboxDb,
  viewer: Viewer,
  input: { email: string; userIds: string[] },
): Promise<ErasureFound | null> {
  requireTeam(viewer);
  const email = validEmail(input?.email);
  const userIds = validIds(input.userIds, USER_IDS_MAX);

  const accesses = await db
    .select({ id: sandboxAccesses.id, reviewerId: sandboxAccesses.reviewerId })
    .from(sandboxAccesses)
    .where(identityMatch(email, userIds));
  const accessIds = accesses.map((a) => a.id);
  const touched = [...new Set(accesses.map((a) => a.reviewerId))];
  const named = await db
    .select({ id: sandboxReviewers.id })
    .from(sandboxReviewers)
    .where(namesEmail(email));
  if (accessIds.length === 0 && named.length === 0) return null;

  const reviewers = await db
    .select({
      id: sandboxReviewers.id,
      slug: sandboxReviewers.slug,
      label: sandboxReviewers.label,
    })
    .from(sandboxReviewers)
    .where(
      inArray(sandboxReviewers.id, [
        ...new Set([...touched, ...named.map((r) => r.id)]),
      ]),
    )
    .orderBy(sandboxReviewers.slug, sandboxReviewers.createdAt);
  const kept = await keepingAccess(db, touched, email, userIds);
  const held = await heldThrough(db, accessIds);
  const total = (kind: keyof HeldCounts) =>
    [...held.values()].reduce((sum, h) => sum + h[kind], 0);

  return {
    experiments: new Set(reviewers.map((r) => r.slug)).size,
    comments: total("comments"),
    versions: total("versions"),
    views: total("views"),
    nameLabels: reviewers
      .filter(
        (r) =>
          kept.has(r.id) &&
          r.label !== ERASED_LABEL &&
          !looksLikeEmail(r.label),
      )
      .map((r) => ({ reviewerId: r.id, slug: r.slug, label: r.label })),
  };
}

/** The reviewers among `touched` with an access that is not this identity's. */
async function keepingAccess(
  db: SandboxDb,
  touched: string[],
  email: string,
  userIds: string[],
): Promise<Set<string>> {
  if (touched.length === 0) return new Set();
  const rows = await db
    .selectDistinct({ reviewerId: sandboxAccesses.reviewerId })
    .from(sandboxAccesses)
    .where(
      and(
        inArray(sandboxAccesses.reviewerId, touched),
        sql`not (${identityMatch(email, userIds)})`,
      ),
    );
  return new Set(rows.map((r) => r.reviewerId));
}

/** Comments, versions and views that came through each access, keyed by access id. */
async function heldThrough(
  db: SandboxDb,
  accessIds: string[],
): Promise<Map<string, HeldCounts>> {
  const held = new Map<string, HeldCounts>(
    accessIds.map((id) => [id, { comments: 0, versions: 0, views: 0 }]),
  );
  if (accessIds.length === 0) return held;
  const comments = await db
    .select({ accessId: sandboxComments.accessId, n: count() })
    .from(sandboxComments)
    .where(inArray(sandboxComments.accessId, accessIds))
    .groupBy(sandboxComments.accessId);
  for (const row of comments) held.get(row.accessId!)!.comments = row.n;
  const versions = await db
    .select({ accessId: sandboxReviewVersions.accessId, n: count() })
    .from(sandboxReviewVersions)
    .where(inArray(sandboxReviewVersions.accessId, accessIds))
    .groupBy(sandboxReviewVersions.accessId);
  for (const row of versions) held.get(row.accessId)!.versions = row.n;
  const views = await db
    .select({ accessId: sandboxViewEvents.accessId, n: count() })
    .from(sandboxViewEvents)
    .where(inArray(sandboxViewEvents.accessId, accessIds))
    .groupBy(sandboxViewEvents.accessId);
  for (const row of views) held.get(row.accessId)!.views = row.n;
  return held;
}

/**
 * Each email used with one code, and each signed-in account, with what came
 * through it: the erase view opened from a reviewer (R6). Null when no
 * reviewer has this id. Reads only; erases nothing.
 */
export async function findReviewerEmails(
  db: SandboxDb,
  viewer: Viewer,
  input: { reviewerId: string },
): Promise<ReviewerEmails | null> {
  requireTeam(viewer);
  if (!isUuid(input?.reviewerId))
    throw new SandboxAccessError(ERASURE_INPUT_INVALID);
  const [reviewer] = await db
    .select({ slug: sandboxReviewers.slug })
    .from(sandboxReviewers)
    .where(eq(sandboxReviewers.id, input.reviewerId));
  if (!reviewer) return null;

  const accesses = await db
    .select({
      id: sandboxAccesses.id,
      email: sandboxAccesses.email,
      userId: sandboxAccesses.userId,
    })
    .from(sandboxAccesses)
    .where(eq(sandboxAccesses.reviewerId, input.reviewerId))
    .orderBy(sandboxAccesses.createdAt, sandboxAccesses.id);
  const held = await heldThrough(
    db,
    accesses.map((a) => a.id),
  );

  const byEmail = new Map<string, HeldCounts>();
  const byAccount = new Map<string, HeldCounts>();
  for (const access of accesses) {
    const into = access.email !== null ? byEmail : byAccount;
    const key = (access.email ?? access.userId)!;
    const sum = into.get(key) ?? { comments: 0, versions: 0, views: 0 };
    const add = held.get(access.id)!;
    into.set(key, {
      comments: sum.comments + add.comments,
      versions: sum.versions + add.versions,
      views: sum.views + add.views,
    });
  }
  return {
    slug: reviewer.slug,
    emails: [...byEmail].map(([email, h]) => ({ email, ...h })),
    accounts: [...byAccount].map(([userId, h]) => ({ userId, ...h })),
  };
}

/**
 * Erases an email everywhere it reached (S28, D-LAB-27), in one transaction:
 * the accesses made with it or by the accounts, with every view, comment,
 * reply and version that came through them; then each reviewer it reached
 * that is left with no access, revoked and relabelled; then every label and
 * display name that is the email; then the ticked name labels among the
 * reviewers it touched. One record row, `reviewer-erased`, with the counts
 * and no slug. Null, with nothing written, when the email holds nothing.
 */
export async function eraseEmail(
  db: SandboxDb,
  viewer: Viewer,
  input: { email: string; userIds: string[]; clearLabels: string[] },
): Promise<ErasureCounts | null> {
  requireTeam(viewer);
  const email = validEmail(input?.email);
  const userIds = validIds(input.userIds, USER_IDS_MAX);
  const clearLabels = validIds(input.clearLabels, CLEAR_LABELS_MAX);

  return db.transaction(async (tx) => {
    const accesses = await tx
      .select({
        id: sandboxAccesses.id,
        reviewerId: sandboxAccesses.reviewerId,
      })
      .from(sandboxAccesses)
      .where(identityMatch(email, userIds))
      .for("update");
    const accessIds = accesses.map((a) => a.id);
    const touched = [...new Set(accesses.map((a) => a.reviewerId))];
    const named = (
      await tx
        .select({ id: sandboxReviewers.id })
        .from(sandboxReviewers)
        .where(namesEmail(email))
    ).map((r) => r.id);
    if (accessIds.length === 0 && named.length === 0) return null;
    const reached = [...new Set([...touched, ...named])];
    // Lock what this erasure may relabel, so no entry lands on it meanwhile.
    await tx
      .select({ id: sandboxReviewers.id })
      .from(sandboxReviewers)
      .where(inArray(sandboxReviewers.id, reached))
      .for("update");

    let deleted = { accesses: 0, comments: 0, versions: 0, views: 0 };
    if (accessIds.length > 0) {
      const views = await tx
        .delete(sandboxViewEvents)
        .where(inArray(sandboxViewEvents.accessId, accessIds))
        .returning({ id: sandboxViewEvents.id });
      const comments = await tx
        .delete(sandboxComments)
        .where(inArray(sandboxComments.accessId, accessIds))
        .returning({ id: sandboxComments.id });
      const versions = await tx
        .delete(sandboxReviewVersions)
        .where(inArray(sandboxReviewVersions.accessId, accessIds))
        .returning({ id: sandboxReviewVersions.id });
      const gone = await tx
        .delete(sandboxAccesses)
        .where(inArray(sandboxAccesses.id, accessIds))
        .returning({ id: sandboxAccesses.id });
      deleted = {
        accesses: gone.length,
        comments: comments.length,
        versions: versions.length,
        views: views.length,
      };
    }

    // A reviewer it reached that now has no access: the code was this
    // email's alone (or made for it and never used), so it is revoked and
    // relabelled.
    const withAccess = new Set(
      (
        await tx
          .selectDistinct({ reviewerId: sandboxAccesses.reviewerId })
          .from(sandboxAccesses)
          .where(inArray(sandboxAccesses.reviewerId, reached))
      ).map((r) => r.reviewerId),
    );
    const emptied = reached.filter((id) => !withAccess.has(id));
    const ticked = clearLabels.filter(
      (id) => touched.includes(id) && withAccess.has(id),
    );

    const revoked =
      emptied.length === 0
        ? []
        : await tx
            .update(sandboxReviewers)
            .set({ revokedAt: sql`now()` })
            .where(
              and(
                inArray(sandboxReviewers.id, emptied),
                isNull(sandboxReviewers.revokedAt),
              ),
            )
            .returning({ id: sandboxReviewers.id });

    const wholeLabel = [...new Set([...emptied, ...ticked])];
    const relabelled = await tx
      .update(sandboxReviewers)
      .set({
        label: sql`case when ${
          wholeLabel.length === 0
            ? sql`false`
            : inArray(sandboxReviewers.id, wholeLabel)
        } or lower(btrim(${sandboxReviewers.label})) = ${email} then ${ERASED_LABEL} else ${sandboxReviewers.label} end`,
        displayName: sql`case when lower(btrim(${sandboxReviewers.displayName})) = ${email} then ${ERASED_LABEL} else ${sandboxReviewers.displayName} end`,
      })
      .where(
        and(
          inArray(sandboxReviewers.id, reached),
          or(
            wholeLabel.length === 0
              ? sql`false`
              : inArray(sandboxReviewers.id, wholeLabel),
            namesEmail(email),
          ),
        ),
      )
      .returning({ id: sandboxReviewers.id });

    const counts: ErasureCounts = {
      ...deleted,
      labelsScrubbed: relabelled.length,
      reviewersRevoked: revoked.length,
    };
    await recordAction(tx, viewer, {
      action: ERASURE_ACTIONS.reviewerErased,
      counts: {
        accesses: counts.accesses,
        viewEvents: counts.views,
        comments: counts.comments,
        reviewVersions: counts.versions,
        labelsScrubbed: counts.labelsScrubbed,
        reviewersRevoked: counts.reviewersRevoked,
      },
    });
    return counts;
  });
}

/**
 * One page of the record of actions, newest first, 50 to a page (D-LAB-3).
 * Read-only: nothing in this module edits or deletes a record row.
 */
export async function listActions(
  db: SandboxDb,
  viewer: Viewer,
  input: { page: number },
): Promise<ActionsPage> {
  requireTeam(viewer);
  const page = input?.page;
  if (!Number.isInteger(page) || page < 1 || page > PAGE_MAX)
    throw new SandboxAccessError(ERASURE_INPUT_INVALID);
  const rows = await db
    .select({
      id: sandboxActions.id,
      at: sandboxActions.at,
      actorEmail: sandboxActions.actorEmail,
      action: sandboxActions.action,
      slug: sandboxActions.slug,
      targetEmail: sandboxActions.targetEmail,
      counts: sandboxActions.counts,
    })
    .from(sandboxActions)
    .orderBy(desc(sandboxActions.at), desc(sandboxActions.id))
    .limit(ACTIONS_PAGE_SIZE)
    .offset((page - 1) * ACTIONS_PAGE_SIZE);
  const [total] = await db.select({ n: count() }).from(sandboxActions);
  return {
    rows: rows.map((row) => ({
      ...row,
      counts: (row.counts as Record<string, number> | null) ?? null,
    })),
    page,
    total: total!.n,
  };
}
