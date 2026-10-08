/**
 * The closing review with two to four designs, on the server (LAB-18,
 * review-variants.md; D-LAB-18, S15, S20): the order the choice's designs
 * are shown in, the switcher order "Each design" follows, and the send's
 * check of the designs and the choice.
 *
 * - `designOrder` is a pure function of the slug and the reviewer id, so one
 *   reviewer sees the same order on every load, device and access, and it is
 *   never stored as a column: the version records it, derived here at send
 *   time, never taken from the browser. The ids are sorted by
 *   sha256(slug:reviewerId:designId). A hash sort has no modulo bias and no
 *   generator to seed wrongly; never Math.random.
 * - Every design id in a send is checked against the config.
 */

import { createHash } from "node:crypto";
import { z } from "zod";

import type { ReviewAnswers } from "./client/review-form.ts";
import {
  CHOICE_ANCHORS,
  followUps,
  STRENGTH_OPTIONS,
  type StoredChoice,
} from "./client/review-variants-form.ts";
import { SANDBOX_SLUG } from "./slug.ts";

/** The choice's design ids in this reviewer's order. */
export function designOrder(
  slug: string,
  reviewerId: string,
  designIds: readonly string[],
): string[] {
  const key = (id: string) =>
    createHash("sha256").update(`${slug}:${reviewerId}:${id}`).digest("hex");
  return [...new Set(designIds)]
    .map((id) => ({ id, key: key(id) }))
    .sort((a, b) =>
      a.key < b.key ? -1 : a.key > b.key ? 1 : a.id < b.id ? -1 : 1,
    )
    .map((d) => d.id);
}

/** "Each design" comes in switcher order: the reviewer's first design first, then the config's (LAB-11). */
export function switcherOrder<T extends { id: string }>(
  designs: readonly T[],
  firstDesign: string | null,
): T[] {
  const first = designs.find((d) => d.id === firstDesign);
  return first ? [first, ...designs.filter((d) => d !== first)] : [...designs];
}

/** A design id has a slug's shape, with its own cap. */
const DESIGN_ID = SANDBOX_SLUG;

/** The send's designs and choice, as the browser may send them: never an order. */
export function variantsInput(text: z.ZodString) {
  const designId = z.string().max(24).regex(DESIGN_ID);
  return {
    designs: z
      .record(
        designId,
        z.strictObject({
          rating: z.string().max(24).optional(),
          weakness: text.optional(),
          changedAfterChoosing: z.boolean(),
        }),
      )
      .optional(),
    choice: z
      .strictObject({
        option: z.string().max(24),
        strength: z
          .enum(STRENGTH_OPTIONS.map((s) => s.id) as [string, ...string[]])
          .optional(),
        reasons: text.optional(),
        carryOver: text.optional(),
        combine: text.optional(),
        noneNeeds: text.optional(),
        lastViewed: designId.optional(),
      })
      .optional(),
  };
}

const ANCHORS: readonly string[] = CHOICE_ANCHORS.map((a) => a.id);

/**
 * The designs and the choice fit the config: with one design neither is
 * sent; with several, Overall is not sent, every design id (in the ratings,
 * the choice and the last design viewed) is the config's, each rating is a
 * goal-fit option, and the choice carries only its own follow-ups.
 */
export function variantsFitConfig(
  answers: ReviewAnswers,
  designIds: readonly string[],
  ratingIds: readonly string[],
): boolean {
  if (designIds.length < 2)
    return answers.designs === undefined && answers.choice === undefined;
  if (answers.overall !== undefined) return false;
  for (const [id, entry] of Object.entries(answers.designs ?? {})) {
    if (!designIds.includes(id)) return false;
    if (entry.rating !== undefined && !ratingIds.includes(entry.rating))
      return false;
  }
  const choice = answers.choice;
  if (!choice) return true;
  if (!designIds.includes(choice.option) && !ANCHORS.includes(choice.option))
    return false;
  if (choice.lastViewed !== undefined && !designIds.includes(choice.lastViewed))
    return false;
  const asked = followUps(
    choice.option,
    designIds.map((id) => ({ id, label: id })),
  );
  const sent = (
    ["strength", "reasons", "carryOver", "combine", "noneNeeds"] as const
  ).filter((key) => choice[key] !== undefined);
  return sent.every((key) => asked.includes(key));
}

/** The answers as stored: the choice records the order this reviewer was shown, derived here. */
export function withShownOrder(
  answers: ReviewAnswers,
  order: readonly string[],
): ReviewAnswers {
  if (!answers.choice) return answers;
  const choice: StoredChoice = { ...answers.choice, order: [...order] };
  return { ...answers, choice };
}
