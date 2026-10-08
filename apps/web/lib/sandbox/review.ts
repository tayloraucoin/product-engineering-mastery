/**
 * The closing review's server logic (LAB-17, review.md; S18, S20, S21, S22),
 * pure behind a deps seam, as comments.ts: who the review page renders for,
 * and the send. `review-data.ts` binds the seam to @pem/db/sandbox.
 *
 * - The team never sends a review (S18): the page sends them to the
 *   experiment page, unless a review `?state=` key renders its fixture, and
 *   their send stores nothing.
 * - A send is judged here, never trusted from the browser: its size, its
 *   shape, the viewer, every answer against core v1 and the config, every
 *   triage key against the viewer's own comments, and every required answer
 *   (`requiredGaps`, the browser's own check). Results are fixed and never
 *   echo input; a missing answer is named by its field id only.
 * - A closed experiment stores nothing and returns `closed`.
 * - With several designs (LAB-18), each design's rating and the choice
 *   replace Overall; every design id is checked against the config, and the
 *   stored choice records the order this reviewer was shown, derived here
 *   (`designOrder`), never the browser's.
 */

import { z } from "zod";

import type { ReviewerViewer } from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import type { ViewerResult } from "./access-check.ts";
import { CORE_VERSION, TRIAGE_OPTIONS } from "./client/review-core.ts";
import {
  ANSWER_OPTIONS,
  mattersMostView,
  requiredGaps,
  type ReviewAnswers,
  type ReviewComment,
  type ReviewTriage,
} from "./client/review-form.ts";
import type { SendReviewResult } from "./client/review-send.ts";
import { isReviewStateKey, type ReviewStateKey } from "./client/review-view.ts";
import {
  designOrder,
  variantsFitConfig,
  variantsInput,
  withShownOrder,
} from "./review-variants.ts";
import { isSandboxSlug, SANDBOX_SLUG, SANDBOX_SLUG_MAX } from "./slug.ts";

/** The answers' JSON, in bytes (data-contract.md). */
export const REVIEW_ANSWERS_BYTES_MAX = 64 * 1024;
/** The whole send: the answers plus a triage of up to 500 comment ids. */
const REVIEW_INPUT_BYTES_MAX = 128 * 1024;
/** One written answer, in characters; far below the 64 KB of all of them. */
export const REVIEW_TEXT_MAX = 5000;

export function experimentPath(slug: string): string {
  return `/experimental/${encodeURIComponent(slug)}`;
}

export type ReviewPageView =
  | { kind: "not-found" }
  | { kind: "redirect"; to: string }
  | { kind: "fixture"; key: ReviewStateKey; experiment: ExperimentConfig }
  | { kind: "reviewer"; viewer: ReviewerViewer; experiment: ExperimentConfig };

/**
 * Who the review page renders for. `state` is the `?state=` key this viewer
 * may render (`readSandboxState`), or null. The gate and the ended page live
 * at the experiment's own address, so a visitor without live access, or on
 * a closed experiment, is sent there.
 * [ASSUMPTION: the review route has no gate of its own.]
 */
export function reviewPageView(
  result: ViewerResult,
  state: string | null,
  slug: string,
): ReviewPageView {
  switch (result.kind) {
    case "not-found":
      return { kind: "not-found" };
    case "team":
      return isReviewStateKey(state)
        ? { kind: "fixture", key: state, experiment: result.experiment }
        : { kind: "redirect", to: experimentPath(slug) };
    case "reviewer":
      return {
        kind: "reviewer",
        viewer: result.viewer,
        experiment: result.experiment,
      };
    default:
      return { kind: "redirect", to: experimentPath(slug) };
  }
}

const text = z.string().max(REVIEW_TEXT_MAX);

const sendInput = z.strictObject({
  versionId: z.uuid(),
  answers: z.strictObject({
    overall: z.enum(ANSWER_OPTIONS.overall).optional(),
    blockers: z
      .union([
        z.strictObject({ none: z.literal(true) }),
        z.strictObject({ text: text.trim().min(1) }),
      ])
      .optional(),
    gaps: text.optional(),
    targeted: z.string().max(200).optional(),
    questions: z
      .record(z.string().regex(SANDBOX_SLUG).max(SANDBOX_SLUG_MAX), text)
      .optional(),
    nextStep: z.enum(ANSWER_OPTIONS.nextStep).optional(),
    ...variantsInput(text),
  }),
  triage: z.strictObject({
    comments: z.record(
      z.uuid(),
      z.enum(TRIAGE_OPTIONS.map((o) => o.id) as ["must", "should", "fine"]),
    ),
    mattersMost: z.uuid().nullable(),
  }),
});

export type SendReviewInput = z.infer<typeof sendInput>;

export type ReviewDeps = {
  resolveViewer(slug: string): Promise<ViewerResult>;
  listMyComments(viewer: ReviewerViewer): Promise<ReviewComment[]>;
  saveReviewVersion(
    viewer: ReviewerViewer,
    input: {
      id: string;
      coreVersion: string;
      answers: ReviewAnswers;
      triage: ReviewTriage;
    },
  ): Promise<{ number: number; createdAt: Date }>;
};

function bytes(value: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(value) ?? "");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** Every answer is one the config asks, holding one of its options. */
function fitsConfig(answers: ReviewAnswers, config: ExperimentConfig): boolean {
  if (
    !variantsFitConfig(
      answers,
      config.designs.map((d) => d.id),
      ANSWER_OPTIONS.overall,
    )
  )
    return false;
  if (answers.targeted !== undefined) {
    const labels = config.targetedQuestion?.labels ?? [];
    if (!labels.includes(answers.targeted)) return false;
  }
  for (const [id, value] of Object.entries(answers.questions ?? {})) {
    const question = config.questions.find((q) => q.id === id);
    if (!question) return false;
    if (question.kind !== "text" && !question.options?.includes(value))
      return false;
  }
  return true;
}

/**
 * One send. Malformed or oversized input is `not-saved` before anything is
 * read. Only a reviewer on an open experiment stores a version: closed is
 * `closed`; the team, the gate and an unknown slug are `not-saved`. A triage
 * key that is not the viewer's own comment is `not-saved`; a missing
 * required answer is `invalid`, naming the field ids.
 */
export async function sendReviewWith(
  deps: ReviewDeps,
  slug: unknown,
  input: unknown,
): Promise<SendReviewResult> {
  if (!isSandboxSlug(slug)) return { kind: "not-saved" };
  if (
    bytes(input) > REVIEW_INPUT_BYTES_MAX ||
    bytes((input as { answers?: unknown } | null)?.answers) >
      REVIEW_ANSWERS_BYTES_MAX
  )
    return { kind: "not-saved" };
  const parsed = sendInput.safeParse(input);
  if (!parsed.success) return { kind: "not-saved" };
  const { versionId, answers, triage } = parsed.data;

  try {
    const result = await deps.resolveViewer(slug);
    if (result.kind === "ended") return { kind: "closed" };
    if (result.kind !== "reviewer") return { kind: "not-saved" };
    if (!fitsConfig(answers, result.experiment)) return { kind: "not-saved" };

    const comments = await deps.listMyComments(result.viewer);
    const own = new Set(comments.map((c) => c.id));
    const named = [
      ...Object.keys(triage.comments),
      ...(triage.mattersMost ? [triage.mattersMost] : []),
    ];
    if (named.some((id) => !own.has(id.toLowerCase())))
      return { kind: "not-saved" };

    const stored: ReviewTriage = {
      comments: Object.fromEntries(
        Object.entries(triage.comments).map(([id, v]) => [id.toLowerCase(), v]),
      ),
      mattersMost: null,
    };
    stored.mattersMost = mattersMostView(
      {
        triage: stored.comments,
        mattersMost: triage.mattersMost?.toLowerCase() ?? null,
      },
      comments,
    ).value;

    const gaps = requiredGaps(
      { answers, triage: stored },
      comments,
      result.experiment,
    );
    if (gaps.length) return { kind: "invalid", missing: gaps.map((g) => g.id) };

    const saved = await deps.saveReviewVersion(result.viewer, {
      id: versionId.toLowerCase(),
      coreVersion: CORE_VERSION,
      answers: withShownOrder(
        answers,
        designOrder(
          result.experiment.slug,
          result.viewer.reviewerId,
          result.experiment.designs.map((d) => d.id),
        ),
      ),
      triage: stored,
    });
    return {
      kind: "ok",
      number: saved.number,
      createdAt: saved.createdAt.toISOString(),
    };
  } catch {
    return { kind: "not-saved" };
  }
}
