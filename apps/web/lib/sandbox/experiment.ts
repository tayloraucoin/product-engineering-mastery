/**
 * The experiment page's server logic (ux/experimental/experiment.md; S15,
 * D-LAB-10, D-LAB-14, R9). Pure behind a deps seam, as gate.ts: which design
 * a visit opens on, the switcher's order, the primary, and the view log.
 * `experimentDepsFor` and `viewDepsFor` bind the seam to @pem/db/sandbox.
 *
 * - First visit: one design is drawn with `crypto.randomInt` over the design
 *   count and claimed; the claim keeps whatever was stored first, so the
 *   draw is made once. The address names no design on a first visit.
 * - Later visits open on the last design viewed, or a `?design=` the review's
 *   "Look at ◆ again" link names (LAB-17).
 * - The team is never counted (D-LAB-14): no read, no claim, no view.
 */

import { randomInt as cryptoRandomInt } from "node:crypto";

import {
  claimFirstDesign,
  readReviewerDesigns,
  recordViewEvent,
  type ReviewerDesigns,
  type ReviewerViewer,
  type SandboxDb,
} from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import type { ViewerResult } from "./access-check.ts";
import type { PrimaryKind } from "./client/experiment-view.ts";

/** A uniform integer in [0, max): `crypto.randomInt` in the app, a seeded generator in tests. */
export type RandomInt = (max: number) => number;

/** The draw: one of the designs, uniformly. Never Math.random, never a modulo over bytes. */
export function drawFirstDesign(
  designs: readonly { id: string }[],
  randomInt: RandomInt,
): string {
  const index = randomInt(designs.length);
  const design = designs[index];
  if (!Number.isInteger(index) || !design)
    throw new RangeError("The draw fell outside the designs.");
  return design.id;
}

export type OpeningDeps = {
  readReviewerDesigns(viewer: ReviewerViewer): Promise<ReviewerDesigns>;
  claimFirstDesign(viewer: ReviewerViewer, design: string): Promise<string>;
  randomInt: RandomInt;
};

export type Opening = {
  /** The design rendered first. */
  shown: string;
  /** Design ids in switcher order: the viewer's first design first, then the config's order. */
  order: string[];
  primary: PrimaryKind;
  /** Whether views are logged: a reviewer only. */
  counted: boolean;
};

export type OpeningViewer =
  { kind: "team" } | { kind: "reviewer"; viewer: ReviewerViewer };

/** The search params the page passes on: `?design=` and `?from=review`. */
export type OpeningRequest = { design?: unknown; from?: unknown };

function known(config: ExperimentConfig, design: unknown): design is string {
  return config.designs.some((d) => d.id === design);
}

function orderFrom(config: ExperimentConfig, first: string): string[] {
  const ids = config.designs.map((d) => d.id);
  return [first, ...ids.filter((id) => id !== first)];
}

/**
 * Which design this visit opens on. The team opens on the config's first
 * design (or a named one) and touches no deps. A reviewer's first visit
 * draws and claims, ignoring `?design=`; later visits honour a known
 * `?design=`, else the last design, else the first.
 */
export async function openingDesignWith(
  deps: OpeningDeps,
  who: OpeningViewer,
  config: ExperimentConfig,
  request: OpeningRequest,
): Promise<Opening> {
  const fromReview = request.from === "review";
  if (who.kind === "team") {
    const first = config.designs[0]!.id;
    return {
      shown: known(config, request.design) ? request.design : first,
      order: orderFrom(config, first),
      primary: fromReview ? "back" : "finish",
      counted: false,
    };
  }

  const stored = await deps.readReviewerDesigns(who.viewer);
  const primary: PrimaryKind = fromReview
    ? "back"
    : stored.hasSent
      ? "edit"
      : "finish";

  if (stored.firstDesign === null) {
    const drawn = drawFirstDesign(config.designs, deps.randomInt);
    const claimed = await deps.claimFirstDesign(who.viewer, drawn);
    // A design since dropped from the config falls back to the config's first.
    const first = known(config, claimed) ? claimed : config.designs[0]!.id;
    return {
      shown: first,
      order: orderFrom(config, first),
      primary,
      counted: true,
    };
  }

  const first = known(config, stored.firstDesign)
    ? stored.firstDesign
    : config.designs[0]!.id;
  const shown = known(config, request.design)
    ? request.design
    : known(config, stored.lastDesign)
      ? stored.lastDesign
      : first;
  return { shown, order: orderFrom(config, first), primary, counted: true };
}

/** The opening deps, bound to `crypto.randomInt` and the database, read only for a reviewer. */
export function experimentDepsFor(db: () => SandboxDb): OpeningDeps {
  return {
    readReviewerDesigns: (viewer) => readReviewerDesigns(db(), viewer, {}),
    claimFirstDesign: (viewer, design) =>
      claimFirstDesign(db(), viewer, { design }),
    randomInt: (max) => cryptoRandomInt(max),
  };
}

export type ViewKind = "load" | "switch";

/** The view action's result: never more than which of these happened. */
export type RecordViewResult =
  | { kind: "recorded" }
  | { kind: "not-counted" }
  | { kind: "invalid" }
  | { kind: "failed" };

export type RecordViewDeps = {
  resolveViewer(slug: string): Promise<ViewerResult>;
  recordViewEvent(
    viewer: ReviewerViewer,
    input: { kind: ViewKind; design: string },
  ): Promise<void>;
};

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * One load or switch, called from a client effect after mount, never during
 * render. Malformed input is invalid before anything is read. Only a
 * reviewer on an open experiment is counted: the team, a closed experiment
 * (ended) and anyone at the gate write nothing (D-LAB-14). The design is
 * checked against the experiment's config before the write.
 */
export async function recordViewWith(
  deps: RecordViewDeps,
  slug: unknown,
  input: unknown,
): Promise<RecordViewResult> {
  const kind = (input as { kind?: unknown } | null)?.kind;
  const design = (input as { design?: unknown } | null)?.design;
  if (
    typeof slug !== "string" ||
    slug.length > 48 ||
    !SLUG.test(slug) ||
    (kind !== "load" && kind !== "switch") ||
    typeof design !== "string"
  )
    return { kind: "invalid" };

  const result = await deps.resolveViewer(slug);
  if (result.kind !== "reviewer") return { kind: "not-counted" };
  if (!known(result.experiment, design)) return { kind: "invalid" };
  try {
    await deps.recordViewEvent(result.viewer, { kind, design });
    return { kind: "recorded" };
  } catch {
    return { kind: "failed" };
  }
}

/** The view write, bound to the database; `db` is read only when a reviewer is counted. */
export function viewDepsFor(
  db: () => SandboxDb,
): RecordViewDeps["recordViewEvent"] {
  return (viewer, input) => recordViewEvent(db(), viewer, input);
}
