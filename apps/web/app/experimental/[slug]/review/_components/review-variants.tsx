"use client";

/**
 * With two to four designs (LAB-18, review-variants.md; D-LAB-18, S20):
 * "Each design" in place of Overall, and "Your choice" after the comments.
 * The rules are pure, in lib/sandbox/client/review-variants-form.ts; these
 * leaves only render them.
 *
 * - Each design is a fieldset whose legend is "◆ Diamond design". A design
 *   never viewed has both its questions disabled, with the line and "Look
 *   at it".
 * - The choice is a radio group, disabled with its reason tied through
 *   aria-describedby until every design has a rating. Nothing is selected
 *   or marked recommended. Its follow-ups come after it in DOM order, so
 *   focus stays on the chosen option and nothing moves above it.
 */
import Link from "next/link";

import { Field, FieldLabel, FieldLegend, FieldSet } from "@pem/ui/field";
import { Textarea } from "@pem/ui/textarea";

import type { DesignOption } from "../../../../../lib/sandbox/client/experiment-view";
import {
  CANT_JUDGE,
  OVERALL_SCALE,
} from "../../../../../lib/sandbox/client/review-core";
import { GAP_IDS } from "../../../../../lib/sandbox/client/review-form";
import {
  CHOICE_ANCHORS,
  choiceLock,
  choiceOptions,
  followUps,
  STRENGTH_OPTIONS,
  unviewed,
  VARIANTS_WORDS as V,
  type FollowUp,
  type VariantsAnswers,
  type VariantsContext,
} from "../../../../../lib/sandbox/client/review-variants-form";
import { ChoiceGroup } from "./choice-group";

const linkClass = "-my-3 inline-block py-3 underline underline-offset-4";

export function EachDesign({
  designs,
  goals,
  variants,
  context,
  hrefs,
  errors,
  disabled,
  onRate,
  onWeakness,
  onLeave,
}: {
  /** In page order: the reviewer's switcher order. */
  designs: readonly DesignOption[];
  goals: readonly string[];
  variants: VariantsAnswers;
  context: VariantsContext;
  /** Each design's "Look at … again" address. */
  hrefs: Readonly<Record<string, string>>;
  errors: Readonly<Record<string, string>>;
  disabled: boolean;
  onRate(design: string, rating: string): void;
  onWeakness(design: string, text: string): void;
  /** Leaving for a design from its questions: focus comes back to them. */
  onLeave(fieldId: string): void;
}) {
  return (
    <div className="flex flex-col gap-10">
      <ul className="list-disc pl-5 text-muted-foreground">
        {goals.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ul>
      {designs.map((design) => {
        const notSeen = unviewed(design.id, context);
        const fieldId = GAP_IDS.rating(design.id);
        const lineId = `design-${design.id}-unviewed`;
        const weaknessId = `weakness-${design.id}`;
        return (
          <FieldSet key={design.id} id={`design-${design.id}`}>
            <FieldLegend className="text-lg font-semibold">
              {V.legend(design.label)}
            </FieldLegend>
            {notSeen ? (
              <p id={lineId}>
                {V.unviewed(design.label)}{" "}
                <Link
                  href={hrefs[design.id] ?? "#"}
                  className={linkClass}
                  aria-label={V.lookAtItName(design.label)}
                  onClick={() => onLeave(fieldId)}
                >
                  {V.lookAtIt}
                </Link>
              </p>
            ) : null}
            <ChoiceGroup
              id={fieldId}
              legend={V.rating(design.label)}
              options={OVERALL_SCALE}
              apart={[CANT_JUDGE]}
              value={variants.ratings[design.id] ?? null}
              onChange={(value) => onRate(design.id, value)}
              error={errors[fieldId]}
              disabled={disabled || notSeen}
              describedBy={notSeen ? lineId : undefined}
            />
            <Field>
              <FieldLabel htmlFor={weaknessId}>
                {V.weakness(design.label)}
              </FieldLabel>
              <Textarea
                id={weaknessId}
                rows={2}
                value={variants.weaknesses[design.id] ?? ""}
                disabled={disabled || notSeen}
                aria-describedby={notSeen ? lineId : undefined}
                onChange={(event) => onWeakness(design.id, event.target.value)}
              />
            </Field>
            {notSeen ? null : (
              <p>
                <Link
                  href={hrefs[design.id] ?? "#"}
                  className={linkClass}
                  onClick={() => onLeave(fieldId)}
                >
                  {V.lookAgain(design.label)}
                </Link>
              </p>
            )}
          </FieldSet>
        );
      })}
    </div>
  );
}

const FOLLOW_UP_WORDS: Record<Exclude<FollowUp, "strength">, string> = {
  reasons: V.reasons,
  carryOver: V.carryOver,
  combine: V.combine,
  noneNeeds: V.noneNeeds,
};

export function YourChoice({
  designs,
  variants,
  context,
  errors,
  disabled,
  onChoose,
  onStrength,
  onText,
}: {
  designs: readonly DesignOption[];
  variants: VariantsAnswers;
  context: VariantsContext;
  errors: Readonly<Record<string, string>>;
  disabled: boolean;
  onChoose(choice: string): void;
  onStrength(strength: string): void;
  onText(key: Exclude<FollowUp, "strength">, text: string): void;
}) {
  const lock = choiceLock(designs, variants.ratings);
  const options = choiceOptions(context.order, designs);
  const anchorIds: readonly string[] = CHOICE_ANCHORS.map((a) => a.id);
  const asked = followUps(variants.choice, designs);
  const reasonId = "choice-reason";
  return (
    <div className="flex flex-col gap-8">
      <ChoiceGroup
        id={GAP_IDS.choice}
        legend={V.choiceQuestion}
        options={options.filter((o) => !anchorIds.includes(o.id))}
        apart={options.filter((o) => anchorIds.includes(o.id))}
        value={variants.choice}
        onChange={onChoose}
        error={errors[GAP_IDS.choice]}
        disabled={disabled || lock.locked}
        describedBy={lock.locked ? reasonId : undefined}
      >
        {lock.locked ? (
          <p id={reasonId} className="mb-4 text-muted-foreground">
            {lock.line}
          </p>
        ) : null}
      </ChoiceGroup>
      {asked.map((key) =>
        key === "strength" ? (
          <ChoiceGroup
            key={key}
            id={GAP_IDS.strength}
            legend={V.strength}
            options={STRENGTH_OPTIONS}
            value={variants.strength}
            onChange={onStrength}
            error={errors[GAP_IDS.strength]}
            disabled={disabled}
            inline
          />
        ) : (
          <Field key={key}>
            <FieldLabel htmlFor={`choice-${key}`}>
              {FOLLOW_UP_WORDS[key]}
            </FieldLabel>
            <Textarea
              id={`choice-${key}`}
              value={variants[key]}
              disabled={disabled}
              onChange={(event) => onText(key, event.target.value)}
            />
          </Field>
        ),
      )}
    </div>
  );
}
