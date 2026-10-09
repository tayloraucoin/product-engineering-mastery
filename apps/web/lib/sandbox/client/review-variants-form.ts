/**
 * The closing review with two to four designs (LAB-18, review-variants.md;
 * D-LAB-18, D-LAB-21, S15, S20), pure: each design rated on its own, then a
 * choice among them that unlocks once every design has a rating. This holds
 * the words, the choice's options in the order the server derived, the lock
 * and its line, the unlock announcement, the follow-ups per choice, the
 * Blockers wording, and the changed-after-choosing flags.
 *
 * - Nothing is pre-selected and nothing is marked recommended: the choice
 *   starts null, and the options are only the designs (in the server's
 *   order, `designOrder` in lib/sandbox/review/review-variants.ts) and the three
 *   anchors, always last, never shuffled.
 * - "Can't judge yet" counts as a rating.
 * - A rating changed while a choice is set marks that design's flag. Flags
 *   belong to each version: they start false in edit mode, and nothing is
 *   shown to the reviewer about them.
 * - The last design viewed before the choice is snapshotted each time the
 *   choice is set.
 *
 * Pure and client-safe: no @pem/db, next or env.ts.
 */

import { CANT_JUDGE, OVERALL_SCALE } from "./review-core.ts";

/** The three anchors, below the designs, in this order (S20). */
export const CHOICE_ANCHORS = [
  { id: "combine", label: "Combine elements of more than one" },
  { id: "none", label: "None of these" },
  { id: "no-preference", label: "No preference; any would work" },
] as const;

export type ChoiceAnchorId = (typeof CHOICE_ANCHORS)[number]["id"];

export const STRENGTH_OPTIONS = [
  { id: "slight", label: "Slight" },
  { id: "clear", label: "Clear" },
  { id: "strong", label: "Strong" },
] as const;

export type StrengthId = (typeof STRENGTH_OPTIONS)[number]["id"];

/** review-variants.md's Words, verbatim. `label` is a design's glyph plus name ("◆ Diamond"). */
export const VARIANTS_WORDS = {
  eachHeading: "Each design",
  legend: (label: string) => `${label} design`,
  rating: (label: string) =>
    `How well does the ${label} design meet the goals below?`,
  weakness: (label: string) =>
    `What is the main weakness of the ${label} design?`,
  lookAgain: (label: string) => `Look at the ${label} design again`,
  unviewed: (label: string) => `You haven't looked at the ${label} design yet.`,
  lookAtIt: "Look at it",
  lookAtItName: (label: string) => `Look at the ${label} design`,
  choiceHeading: "Your choice",
  choiceQuestion: "Which design would you take forward?",
  lockedEach: "Rate each design above to choose.",
  locked: (labels: readonly string[]) =>
    `Rate the ${listOf(labels)} ${labels.length === 1 ? "design" : "designs"} above to choose.`,
  unlocked: "You can now choose a design.",
  strength: "How strong is that preference?",
  reasons: "What made you choose that one?",
  carryOver:
    "Is there anything from the other designs you'd want carried into it?",
  combine: "Which parts of each would you combine?",
  noneNeeds: "What would a design need to do to work for you?",
  blockersChosen: (label: string) =>
    `What, if anything, would stop you approving the ${label} design as it stands?`,
  blockersAny:
    "What, if anything, would stop you approving any of these as they stand?",
} as const;

/** "■ Square", "■ Square and ▲ Triangle", "■ Square, ▲ Triangle and ● Circle". */
function listOf(labels: readonly string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

/** One design as this module needs it: its id and its glyph plus name. */
export type VariantDesign = { id: string; label: string };

/** What the page knows of this reviewer's designs, from the server. */
export type VariantsContext = {
  /** The choice's design ids in the order the server derived for this reviewer. */
  order: readonly string[];
  /** The designs this reviewer has a view event on. */
  viewed: readonly string[];
  /** The last design viewed, read at page render: snapshotted when the choice is set. */
  lastDesign: string | null;
};

/** The variants' part of the form, as the form and the draft hold it. */
export type VariantsAnswers = {
  /** A goal-fit option id per design, "Can't judge yet" included. */
  ratings: Record<string, string>;
  weaknesses: Record<string, string>;
  /** Per design: its rating was changed while a choice was set (D-LAB-21). */
  changed: Record<string, boolean>;
  /** A design id or an anchor id; null until chosen, never pre-selected. */
  choice: string | null;
  strength: string | null;
  reasons: string;
  carryOver: string;
  combine: string;
  noneNeeds: string;
  /** The last design viewed when the choice was last set. */
  lastViewed: string | null;
};

export function emptyVariants(): VariantsAnswers {
  return {
    ratings: {},
    weaknesses: {},
    changed: {},
    choice: null,
    strength: null,
    reasons: "",
    carryOver: "",
    combine: "",
    noneNeeds: "",
    lastViewed: null,
  };
}

/** Two to four designs: "Each design" replaces Overall and "Your choice" is asked. */
export function hasVariants(designs: readonly unknown[]): boolean {
  return designs.length >= 2;
}

const RATING_IDS: readonly string[] = [
  ...OVERALL_SCALE.map((o) => o.id),
  CANT_JUDGE.id,
];
const ANCHOR_IDS: readonly string[] = CHOICE_ANCHORS.map((a) => a.id);
const STRENGTH_IDS: readonly string[] = STRENGTH_OPTIONS.map((s) => s.id);

export function isRating(value: unknown): value is string {
  return typeof value === "string" && RATING_IDS.includes(value);
}

export function isAnchor(value: unknown): value is ChoiceAnchorId {
  return typeof value === "string" && ANCHOR_IDS.includes(value);
}

export function isStrength(value: unknown): value is StrengthId {
  return typeof value === "string" && STRENGTH_IDS.includes(value);
}

/**
 * The choice's options: the designs in the server's order, then the three
 * anchors in their fixed order. An id in `order` that is not a design here
 * is dropped, and a design missing from it follows the rest.
 */
export function choiceOptions(
  order: readonly string[],
  designs: readonly VariantDesign[],
): { id: string; label: string }[] {
  const byId = new Map(designs.map((d) => [d.id, d]));
  const ordered = [
    ...order.filter((id) => byId.has(id)),
    ...designs.map((d) => d.id).filter((id) => !order.includes(id)),
  ];
  return [
    ...[...new Set(ordered)].map((id) => ({ id, label: byId.get(id)!.label })),
    ...CHOICE_ANCHORS.map((a) => ({ id: a.id, label: a.label })),
  ];
}

/** The choice is locked until every design has a rating; the line names what is left. */
export function choiceLock(
  designs: readonly VariantDesign[],
  ratings: Readonly<Record<string, string>>,
): { locked: boolean; left: VariantDesign[]; line: string | null } {
  const left = designs.filter((d) => !isRating(ratings[d.id]));
  if (left.length === 0) return { locked: false, left, line: null };
  const line =
    left.length === designs.length
      ? VARIANTS_WORDS.lockedEach
      : VARIANTS_WORDS.locked(left.map((d) => d.label));
  return { locked: true, left, line };
}

/** Said politely once, when the choice goes from locked to unlocked; never on a page that opens unlocked. */
export function unlockAnnouncement(
  wasLocked: boolean,
  isLocked: boolean,
): string | null {
  return wasLocked && !isLocked ? VARIANTS_WORDS.unlocked : null;
}

export type FollowUp =
  "strength" | "reasons" | "carryOver" | "combine" | "noneNeeds";

/** What follows the choice, in DOM order: a design gets three, Combine and None one each, No preference none. */
export function followUps(
  choice: string | null,
  designs: readonly VariantDesign[],
): FollowUp[] {
  if (choice === null) return [];
  if (designs.some((d) => d.id === choice))
    return ["strength", "reasons", "carryOver"];
  if (choice === "combine") return ["combine"];
  if (choice === "none") return ["noneNeeds"];
  return [];
}

/** Blockers name a chosen design; Combine, None, No preference and no choice yet read "any of these". */
export function blockersQuestion(
  choice: string | null,
  designs: readonly VariantDesign[],
): string {
  const chosen = designs.find((d) => d.id === choice);
  return chosen
    ? VARIANTS_WORDS.blockersChosen(chosen.label)
    : VARIANTS_WORDS.blockersAny;
}

/** A design whose questions are disabled: it has no view event yet. */
export function unviewed(
  design: string,
  context: Pick<VariantsContext, "viewed">,
): boolean {
  return !context.viewed.includes(design);
}

/** A rating set. Changing it while a choice is set marks that design's flag, and only that one. */
export function rateDesign(
  v: VariantsAnswers,
  design: string,
  rating: string,
): VariantsAnswers {
  const changed =
    v.choice !== null &&
    v.ratings[design] !== undefined &&
    v.ratings[design] !== rating;
  return {
    ...v,
    ratings: { ...v.ratings, [design]: rating },
    changed: changed ? { ...v.changed, [design]: true } : v.changed,
  };
}

/**
 * The choice set, with the last design viewed snapshotted. Moving to
 * another option clears the strength, which was said of the one before.
 * [ASSUMPTION: review-variants.md does not say; a strength carried over to
 * another design would be a preference never stated.]
 */
export function chooseOption(
  v: VariantsAnswers,
  choice: string,
  lastDesign: string | null,
): VariantsAnswers {
  return {
    ...v,
    choice,
    strength: v.choice === choice ? v.strength : null,
    lastViewed: lastDesign,
  };
}

/** The version's record of the designs and the choice (review-variants.md Instrumentation). */
export type StoredDesignAnswer = {
  rating?: string;
  weakness?: string;
  changedAfterChoosing: boolean;
};

export type StoredChoice = {
  option: string;
  strength?: string;
  reasons?: string;
  carryOver?: string;
  combine?: string;
  noneNeeds?: string;
  lastViewed?: string;
  /** The design order shown; set by the server, never sent by the browser. */
  order?: string[];
};

/** What one send carries for the designs and the choice: only this choice's follow-ups, text only where written. */
export function variantsPayload(
  v: VariantsAnswers,
  designs: readonly VariantDesign[],
): { designs: Record<string, StoredDesignAnswer>; choice?: StoredChoice } {
  const out: Record<string, StoredDesignAnswer> = {};
  for (const d of designs) {
    const entry: StoredDesignAnswer = {
      changedAfterChoosing: v.changed[d.id] === true,
    };
    if (isRating(v.ratings[d.id])) entry.rating = v.ratings[d.id];
    const weakness = v.weaknesses[d.id];
    if (weakness?.trim()) entry.weakness = weakness;
    out[d.id] = entry;
  }
  const valid =
    v.choice !== null &&
    (designs.some((d) => d.id === v.choice) || isAnchor(v.choice));
  if (!valid) return { designs: out };
  const choice: StoredChoice = { option: v.choice! };
  const asked = followUps(v.choice, designs);
  if (asked.includes("strength") && isStrength(v.strength))
    choice.strength = v.strength!;
  for (const key of ["reasons", "carryOver", "combine", "noneNeeds"] as const)
    if (asked.includes(key) && v[key].trim()) choice[key] = v[key];
  if (v.lastViewed && designs.some((d) => d.id === v.lastViewed))
    choice.lastViewed = v.lastViewed;
  return { designs: out, choice };
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

function record<T>(
  raw: unknown,
  keep: (value: unknown) => value is T,
): Record<string, T> {
  const out: Record<string, T> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, value] of Object.entries(raw)) if (keep(value)) out[k] = value;
  return out;
}

const isText = (value: unknown): value is string => typeof value === "string";
const isTrue = (value: unknown): value is boolean => value === true;

/** Edit mode: the latest version's designs and choice filled in, every flag false again. */
export function variantsFromVersion(answers: {
  designs?: unknown;
  choice?: unknown;
}): VariantsAnswers {
  const designs = (answers.designs ?? {}) as Record<string, unknown>;
  const ratings: Record<string, string> = {};
  const weaknesses: Record<string, string> = {};
  if (designs && typeof designs === "object")
    for (const [id, raw] of Object.entries(designs)) {
      const entry = (raw ?? {}) as { rating?: unknown; weakness?: unknown };
      if (isRating(entry.rating)) ratings[id] = entry.rating;
      if (typeof entry.weakness === "string") weaknesses[id] = entry.weakness;
    }
  const c = (answers.choice ?? null) as Partial<
    Record<keyof StoredChoice, unknown>
  > | null;
  return {
    ...emptyVariants(),
    ratings,
    weaknesses,
    choice: c && typeof c.option === "string" ? c.option : null,
    strength: c && isStrength(c.strength) ? c.strength : null,
    reasons: str(c?.reasons),
    carryOver: str(c?.carryOver),
    combine: str(c?.combine),
    noneNeeds: str(c?.noneNeeds),
    lastViewed: c && typeof c.lastViewed === "string" ? c.lastViewed : null,
  };
}

/** The draft's variants, read back defensively: anything malformed is dropped. */
export function variantsFromDraft(raw: unknown): VariantsAnswers {
  const d = (raw ?? {}) as Partial<Record<keyof VariantsAnswers, unknown>>;
  if (!raw || typeof raw !== "object") return emptyVariants();
  return {
    ratings: record(d.ratings, isRating),
    weaknesses: record(d.weaknesses, isText),
    changed: record(d.changed, isTrue),
    choice: typeof d.choice === "string" ? d.choice : null,
    strength: isStrength(d.strength) ? d.strength : null,
    reasons: str(d.reasons),
    carryOver: str(d.carryOver),
    combine: str(d.combine),
    noneNeeds: str(d.noneNeeds),
    lastViewed: typeof d.lastViewed === "string" ? d.lastViewed : null,
  };
}
