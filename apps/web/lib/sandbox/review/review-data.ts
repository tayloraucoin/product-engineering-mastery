/**
 * The review's reads and its send, bound to the request's world (LAB-17):
 * `resolveViewer` and @pem/db/sandbox. The rules are in review.ts. A failure
 * is logged as a fixed event: never an answer, a comment, an id or a query's
 * error text (a failed insert's error carries its parameters).
 */

import "server-only";

import {
  listMyComments,
  listMyViewedDesigns,
  readMyLatestVersion,
  readReviewerDesigns,
  saveReviewVersion,
  type MyComment,
  type MyReviewVersion,
  type ReviewerViewer,
} from "@pem/db/sandbox";
import { createLogger } from "@pem/observability/logger";

import type { ExperimentConfig } from "../../../app/experimental/_experiments/registry.ts";
import type { SendReviewResult } from "../client/review-send.ts";
import type { VariantsContext } from "../client/review-variants-form.ts";
import { resolveViewer, sandboxDb } from "../shared/access.ts";
import { designOrder, switcherOrder } from "./review-variants.ts";
import { sendReviewWith, type ReviewDeps } from "./review.ts";

const log = createLogger("sandbox");

const deps: ReviewDeps = {
  resolveViewer,
  listMyComments: (viewer) => listMyComments(sandboxDb(), viewer, {}),
  saveReviewVersion: (viewer, input) =>
    saveReviewVersion(sandboxDb(), viewer, input),
};

export async function sendReviewFor(
  slug: unknown,
  input: unknown,
): Promise<SendReviewResult> {
  const result = await sendReviewWith(deps, slug, input);
  if (result.kind === "not-saved") log.warn("sandbox.review_not_saved");
  return result;
}

/**
 * What the review page reads for a reviewer: their own comments and latest
 * version, and with several designs (LAB-18) the designs in switcher order,
 * the choice's order derived for them, the designs they have viewed, and
 * the last one viewed.
 */
export async function loadReviewFor(
  viewer: ReviewerViewer,
  experiment: ExperimentConfig,
): Promise<{
  comments: MyComment[];
  latest: MyReviewVersion | null;
  designs: ExperimentConfig["designs"];
  variants: VariantsContext | null;
}> {
  const db = sandboxDb();
  const several = experiment.designs.length >= 2;
  const [comments, latest, stored, viewed] = await Promise.all([
    listMyComments(db, viewer, {}),
    readMyLatestVersion(db, viewer, {}),
    several ? readReviewerDesigns(db, viewer, {}) : null,
    several ? listMyViewedDesigns(db, viewer, {}) : null,
  ]);
  if (!stored || !viewed)
    return { comments, latest, designs: experiment.designs, variants: null };
  const ids = experiment.designs.map((d) => d.id);
  return {
    comments,
    latest,
    designs: switcherOrder(experiment.designs, stored.firstDesign),
    variants: {
      order: designOrder(experiment.slug, viewer.reviewerId, ids),
      viewed: viewed.filter((id) => ids.includes(id)),
      lastDesign:
        stored.lastDesign && ids.includes(stored.lastDesign)
          ? stored.lastDesign
          : null,
    },
  };
}
