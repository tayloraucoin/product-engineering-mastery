/**
 * Per-experiment counts for /admin's Experiments list and an experiment's
 * header (LAB-10, gap 4, D-LAB-24). Team only. It returns numbers and one
 * date per slug, never a label, an email or a row, so nothing a reviewer
 * gave crosses into the list.
 *
 * - `codes`: reviewer rows on the slug, revoked included ("5 codes").
 * - `sent`: reviewers with at least one review version ("2 sent").
 * - `lastActivityAt`: the latest reviewer view, comment or send. Team notes
 *   (`team_user_id`) never count, and team visits are never logged (D-LAB-14).
 * - `reviewersHoldingData`: reviewer rows still on the slug. A row's label may
 *   be an email, so a reviewer holds guest data while their row remains;
 *   deleting an experiment's data removes them all (LAB-16).
 *
 * One grouped query per table, each scoped to the asked slugs.
 */

import {
  and,
  count,
  countDistinct,
  inArray,
  isNotNull,
  max,
} from "drizzle-orm";

import {
  sandboxComments,
  sandboxReviewers,
  sandboxReviewVersions,
  sandboxViewEvents,
} from "../schema/index.ts";
import { isSandboxSlug } from "./slug.ts";
import {
  requireTeam,
  SandboxAccessError,
  type SandboxDb,
  type Viewer,
} from "./viewer.ts";

export type ExperimentStats = {
  slug: string;
  codes: number;
  sent: number;
  lastActivityAt: Date | null;
  reviewersHoldingData: number;
};

/** More slugs than any registry holds; a longer list is refused. */
export const EXPERIMENT_STATS_MAX_SLUGS = 200;

export const EXPERIMENT_STATS_INPUT_INVALID =
  "The experiment list is not valid.";

function validSlugs(input: { slugs: readonly string[] }): string[] {
  const slugs = input?.slugs;
  if (
    !Array.isArray(slugs) ||
    slugs.length > EXPERIMENT_STATS_MAX_SLUGS ||
    !slugs.every(isSandboxSlug)
  )
    throw new SandboxAccessError(EXPERIMENT_STATS_INPUT_INVALID);
  return [...new Set(slugs)];
}

const later = (a: Date | null, b: Date | null | undefined) =>
  !b ? a : !a || b > a ? b : a;

/** One entry per asked slug, in the order asked; a slug with no rows has zeros and no date. */
export async function listExperimentStats(
  db: SandboxDb,
  viewer: Viewer,
  input: { slugs: readonly string[] },
): Promise<ExperimentStats[]> {
  requireTeam(viewer);
  const slugs = validSlugs(input);
  const stats = new Map<string, ExperimentStats>(
    slugs.map((slug) => [
      slug,
      {
        slug,
        codes: 0,
        sent: 0,
        lastActivityAt: null,
        reviewersHoldingData: 0,
      },
    ]),
  );
  if (slugs.length === 0) return [];

  const reviewers = await db
    .select({ slug: sandboxReviewers.slug, n: count() })
    .from(sandboxReviewers)
    .where(inArray(sandboxReviewers.slug, slugs))
    .groupBy(sandboxReviewers.slug);
  for (const row of reviewers) {
    const entry = stats.get(row.slug)!;
    entry.codes = row.n;
    entry.reviewersHoldingData = row.n;
  }

  const versions = await db
    .select({
      slug: sandboxReviewVersions.slug,
      sent: countDistinct(sandboxReviewVersions.reviewerId),
      at: max(sandboxReviewVersions.createdAt),
    })
    .from(sandboxReviewVersions)
    .where(inArray(sandboxReviewVersions.slug, slugs))
    .groupBy(sandboxReviewVersions.slug);
  for (const row of versions) {
    const entry = stats.get(row.slug)!;
    entry.sent = row.sent;
    entry.lastActivityAt = later(entry.lastActivityAt, row.at);
  }

  const views = await db
    .select({ slug: sandboxViewEvents.slug, at: max(sandboxViewEvents.at) })
    .from(sandboxViewEvents)
    .where(inArray(sandboxViewEvents.slug, slugs))
    .groupBy(sandboxViewEvents.slug);
  for (const row of views) {
    const entry = stats.get(row.slug)!;
    entry.lastActivityAt = later(entry.lastActivityAt, row.at);
  }

  const comments = await db
    .select({ slug: sandboxComments.slug, at: max(sandboxComments.createdAt) })
    .from(sandboxComments)
    .where(
      and(
        inArray(sandboxComments.slug, slugs),
        // A reviewer's comment; a team note has no reviewer.
        isNotNull(sandboxComments.reviewerId),
      ),
    )
    .groupBy(sandboxComments.slug);
  for (const row of comments) {
    const entry = stats.get(row.slug)!;
    entry.lastActivityAt = later(entry.lastActivityAt, row.at);
  }

  return slugs.map((slug) => stats.get(slug)!);
}
