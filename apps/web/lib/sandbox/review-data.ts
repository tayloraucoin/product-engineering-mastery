/**
 * The review's reads and its send, bound to the request's world (LAB-17):
 * `resolveViewer` and @pem/db/sandbox. The rules are in review.ts. A failure
 * is logged as a fixed event: never an answer, a comment, an id or a query's
 * error text (a failed insert's error carries its parameters).
 */

import "server-only";

import {
  listMyComments,
  readMyLatestVersion,
  saveReviewVersion,
  type MyComment,
  type MyReviewVersion,
  type ReviewerViewer,
} from "@pem/db/sandbox";
import { createLogger } from "@pem/observability/logger";

import { resolveViewer, sandboxDb } from "./access.ts";
import type { SendReviewResult } from "./client/review-send.ts";
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

/** What the review page reads for a reviewer: their own comments and latest version. */
export async function loadReviewFor(viewer: ReviewerViewer): Promise<{
  comments: MyComment[];
  latest: MyReviewVersion | null;
}> {
  const db = sandboxDb();
  const [comments, latest] = await Promise.all([
    listMyComments(db, viewer, {}),
    readMyLatestVersion(db, viewer, {}),
  ]);
  return { comments, latest };
}
