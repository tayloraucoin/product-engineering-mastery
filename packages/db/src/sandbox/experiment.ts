/**
 * The experiment page's reads and writes (LAB-11, S15, D-LAB-14). Reviewer
 * only: each takes `(db, viewer, input)`, refuses a team viewer, and touches
 * only the viewer's own reviewer row and view events on their slug. The team
 * is never counted, so no team function lives here.
 *
 * - `readReviewerDesigns`: the first design drawn for them, the last design
 *   viewed, and whether they have sent a review.
 * - `claimFirstDesign`: stores the drawn design only while none is stored,
 *   then returns whichever is stored, so two first visits at once keep one.
 * - `recordViewEvent`: one `load` or `switch` row, and `last_design`.
 *
 * A design id is checked for shape only; the app checks it against the
 * experiment's config first. Errors are fixed strings that never echo input.
 */

import { and, eq, isNull } from "drizzle-orm";

import {
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../schema/index.ts";
import {
  SANDBOX_VIEW_KINDS,
  type SandboxViewKind,
} from "../schema/sandbox/view-events.ts";
import {
  requireReviewer,
  reviewerScope,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

export const DESIGN_INPUT_INVALID = "The design input is not valid.";
export const REVIEWER_NOT_FOUND = "The reviewer was not found.";

/** A config design id: lower-case words joined by hyphens, at most 24 characters. */
const DESIGN_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DESIGN_ID_MAX = 24;

function validDesign(design: unknown): string {
  if (
    typeof design !== "string" ||
    design.length > DESIGN_ID_MAX ||
    !DESIGN_ID.test(design)
  )
    throw new SandboxAccessError(DESIGN_INPUT_INVALID);
  return design;
}

export type ReviewerDesigns = {
  firstDesign: string | null;
  lastDesign: string | null;
  hasSent: boolean;
};

/** The viewer's own first and last design, and whether they have sent a review. Takes an empty input. */
export async function readReviewerDesigns(
  db: SandboxDb,
  viewer: Viewer,
  input: Record<string, never>,
): Promise<ReviewerDesigns> {
  const reviewer = requireReviewer(viewer);
  if (input === null || typeof input !== "object" || Object.keys(input).length)
    throw new SandboxAccessError(DESIGN_INPUT_INVALID);
  const [row] = await db
    .select({
      firstDesign: sandboxReviewers.firstDesign,
      lastDesign: sandboxReviewers.lastDesign,
    })
    .from(sandboxReviewers)
    .where(
      and(
        eq(sandboxReviewers.id, reviewer.reviewerId),
        eq(sandboxReviewers.slug, reviewer.slug),
      ),
    );
  if (!row) throw new SandboxAccessError(REVIEWER_NOT_FOUND);
  const [sent] = await db
    .select({ id: sandboxReviewVersions.id })
    .from(sandboxReviewVersions)
    .where(reviewerScope(reviewer, sandboxReviewVersions))
    .limit(1);
  return {
    firstDesign: row.firstDesign,
    lastDesign: row.lastDesign,
    hasSent: sent !== undefined,
  };
}

/**
 * Stores `design` as the viewer's first design unless one is stored, and
 * returns the stored one. The write keeps the first value: a row already
 * holding a first design matches no update, and is read back instead. Under
 * read committed a second claim at the same instant waits on the first's row
 * lock, re-checks `first_design is null`, and so matches nothing.
 */
export async function claimFirstDesign(
  db: SandboxDb,
  viewer: Viewer,
  input: { design: string },
): Promise<string> {
  const reviewer = requireReviewer(viewer);
  const design = validDesign(input?.design);
  const scope = and(
    eq(sandboxReviewers.id, reviewer.reviewerId),
    eq(sandboxReviewers.slug, reviewer.slug),
  );
  const [claimed] = await db
    .update(sandboxReviewers)
    .set({ firstDesign: design })
    .where(and(scope, isNull(sandboxReviewers.firstDesign)))
    .returning({ firstDesign: sandboxReviewers.firstDesign });
  if (claimed?.firstDesign) return claimed.firstDesign;
  const [stored] = await db
    .select({ firstDesign: sandboxReviewers.firstDesign })
    .from(sandboxReviewers)
    .where(scope);
  if (!stored?.firstDesign) throw new SandboxAccessError(REVIEWER_NOT_FOUND);
  return stored.firstDesign;
}

/** One `load` or `switch` through the viewer's access, and their `last_design`. */
export async function recordViewEvent(
  db: SandboxDb,
  viewer: Viewer,
  input: { kind: SandboxViewKind; design: string },
): Promise<void> {
  const reviewer = requireReviewer(viewer);
  const kind = input?.kind;
  if (!(SANDBOX_VIEW_KINDS as readonly unknown[]).includes(kind))
    throw new SandboxAccessError(DESIGN_INPUT_INVALID);
  const design = validDesign(input.design);
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(sandboxReviewers)
      .set({ lastDesign: design })
      .where(
        and(
          eq(sandboxReviewers.id, reviewer.reviewerId),
          eq(sandboxReviewers.slug, reviewer.slug),
        ),
      )
      .returning({ id: sandboxReviewers.id });
    if (updated.length !== 1) throw new SandboxAccessError(REVIEWER_NOT_FOUND);
    // The composite keys refuse an access that is not this reviewer's.
    await tx.insert(sandboxViewEvents).values({
      reviewerId: reviewer.reviewerId,
      accessId: reviewer.accessId,
      slug: reviewer.slug,
      kind,
      design,
    });
  });
}
