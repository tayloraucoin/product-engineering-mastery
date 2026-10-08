/**
 * Every experiment, by slug (S13, S14). There is no experiments table: an
 * experiment is its `config.ts` in a folder named after its slug, listed once
 * in `registeredConfigs` below. The gate, the experiment page and /admin read
 * designs, goals, mode and close date from here and nowhere else.
 *
 * This file and every `config.ts` hold no JSX, no static `.tsx` import and no
 * `@/` alias, so `node --test` loads them (lib/sandbox/registry.test.ts). A
 * design's component is reached lazily, through its `component` loader.
 *
 * The list is validated once, at module load, so a bad config fails
 * `next build` as well as the test.
 */
import type { ComponentType } from "react";
import { z } from "zod";

import { SANDBOX_SLUG, SANDBOX_SLUG_MAX } from "../../../lib/sandbox/slug.ts";
import { SANDBOX_TIME_ZONE, todayIn } from "../../../lib/sandbox/time.ts";
import { pricing2026 } from "./pricing-2026/config.ts";

/** Neutral labels, fixed per experiment, at most four (D-LAB-10, S15). */
export const DESIGN_SHAPES = [
  "circle",
  "square",
  "triangle",
  "diamond",
] as const;

/** The kinds of extra question a config may ask in the review (LAB-17). */
export const QUESTION_KINDS = ["scale", "choice", "text"] as const;

/**
 * Every refusal, as a fixed string that names its field and never echoes the
 * config's own values.
 */
export const REGISTRY_ERRORS = {
  config: "config: an object holding the experiment's fields",
  unknownField: "config: a field the schema does not know",
  slugPattern:
    "slug: lower-case letters and digits in words joined by single hyphens",
  slugLength: `slug: at most ${SANDBOX_SLUG_MAX} characters`,
  slugDuplicate: "slug: already used by another experiment",
  title: "title: required",
  designsCount: "designs: 1 to 4 designs",
  design: "designs: each design is an object of id, shape and component",
  designId: "designs.id: lower-case letters and digits joined by hyphens",
  designIdDuplicate: "designs.id: each design has its own id",
  designShape: "designs.shape: circle, square, triangle or diamond",
  designShapeDuplicate: "designs.shape: each design has its own shape",
  designComponent: "designs.component: a function that loads the design",
  goalsCount: "goals: 2 to 3 goals",
  goalText: "goals: each goal is non-empty text",
  targetedQuestion:
    "targetedQuestion: non-empty text and five non-empty labels when present",
  questions: "questions: each question has an id and non-empty text",
  questionKind: "questions.kind: scale, choice or text",
  questionOptions:
    "questions.options: 2 to 7 non-empty options for a scale or choice, none for text",
  questionIdDuplicate: "questions.id: each question has its own id",
  mode: "mode: private or collaborate",
  coreVersion: "coreVersion: v1",
  closedOnFormat: "closedOn: an ISO date (YYYY-MM-DD) or null",
  closedOnFuture: `closedOn: never after today in ${SANDBOX_TIME_ZONE}`,
} as const;

const E = REGISTRY_ERRORS;

/** Loads one design's component; never called by node. */
export type DesignLoader = () => Promise<ComponentType>;

const nonEmpty = (message: string) =>
  z.string({ error: message }).trim().min(1, { error: message });

const isoDate = z
  .string({ error: E.closedOnFormat })
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: E.closedOnFormat })
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    },
    { error: E.closedOnFormat },
  );

const designSchema = z.strictObject(
  {
    id: z
      .string({ error: E.designId })
      .regex(SANDBOX_SLUG, { error: E.designId })
      .max(24, { error: E.designId }),
    shape: z.enum(DESIGN_SHAPES, { error: E.designShape }),
    component: z.custom<DesignLoader>((value) => typeof value === "function", {
      error: E.designComponent,
    }),
  },
  { error: E.design },
);

export const experimentConfigSchema = z.strictObject(
  {
    slug: z
      .string({ error: E.slugPattern })
      .max(SANDBOX_SLUG_MAX, { error: E.slugLength })
      .regex(SANDBOX_SLUG, { error: E.slugPattern }),
    title: nonEmpty(E.title),
    designs: z
      .array(designSchema, { error: E.designsCount })
      .min(1, { error: E.designsCount })
      .max(4, { error: E.designsCount })
      .superRefine((designs, ctx) => {
        if (new Set(designs.map((d) => d.id)).size !== designs.length)
          ctx.addIssue({ code: "custom", message: E.designIdDuplicate });
        if (new Set(designs.map((d) => d.shape)).size !== designs.length)
          ctx.addIssue({ code: "custom", message: E.designShapeDuplicate });
      }),
    goals: z
      .array(nonEmpty(E.goalText), { error: E.goalsCount })
      .min(2, { error: E.goalsCount })
      .max(3, { error: E.goalsCount }),
    // review.md's optional targeted question: a 5-point item-specific scale,
    // its labels in order (LAB-17).
    targetedQuestion: z
      .strictObject(
        {
          text: nonEmpty(E.targetedQuestion),
          labels: z
            .array(
              nonEmpty(E.targetedQuestion).max(200, {
                error: E.targetedQuestion,
              }),
              {
                error: E.targetedQuestion,
              },
            )
            .length(5, { error: E.targetedQuestion }),
        },
        { error: E.targetedQuestion },
      )
      .optional(),
    // The review's extra questions (LAB-17): a scale or a choice among its
    // options, in order, or free text; optional unless marked required. A
    // question with no kind is text.
    questions: z
      .array(
        z
          .strictObject(
            {
              id: z
                .string({ error: E.questions })
                .regex(SANDBOX_SLUG, { error: E.questions }),
              text: nonEmpty(E.questions),
              kind: z
                .enum(QUESTION_KINDS, { error: E.questionKind })
                .default("text"),
              options: z
                .array(nonEmpty(E.questionOptions), {
                  error: E.questionOptions,
                })
                .min(2, { error: E.questionOptions })
                .max(7, { error: E.questionOptions })
                .optional(),
              required: z.boolean({ error: E.questions }).default(false),
            },
            { error: E.questions },
          )
          .superRefine((question, ctx) => {
            if ((question.kind === "text") !== (question.options === undefined))
              ctx.addIssue({ code: "custom", message: E.questionOptions });
          }),
        { error: E.questions },
      )
      .superRefine((questions, ctx) => {
        if (new Set(questions.map((q) => q.id)).size !== questions.length)
          ctx.addIssue({ code: "custom", message: E.questionIdDuplicate });
      }),
    mode: z.enum(["private", "collaborate"], { error: E.mode }),
    coreVersion: z.literal("v1", { error: E.coreVersion }),
    closedOn: isoDate.nullable(),
  },
  {
    // A misspelled field is refused, never silently dropped.
    error: (issue) =>
      issue.code === "unrecognized_keys" ? E.unknownField : E.config,
  },
);

export type ExperimentConfig = z.infer<typeof experimentConfigSchema>;
/** What a `config.ts` declares, checked with `satisfies`. */
export type ExperimentConfigInput = z.input<typeof experimentConfigSchema>;
export type DesignShape = (typeof DESIGN_SHAPES)[number];
export type ConfigQuestion = ExperimentConfig["questions"][number];

/** One refusal: which config (by its place in the list) and why. */
export type RegistryError = { index: number; message: string };

export type RegistryResult =
  | { ok: true; experiments: readonly ExperimentConfig[] }
  | { ok: false; errors: readonly RegistryError[] };

/**
 * Validates every config against the schema, then across the list: no slug
 * twice, and no `closedOn` after today in `SANDBOX_TIME_ZONE` at `now`. ISO
 * dates compare as strings, so the check is a string comparison with
 * London's date, never with the UTC date.
 */
export function validateRegistry(
  configs: readonly unknown[],
  now: Date,
): RegistryResult {
  const errors: RegistryError[] = [];
  const experiments: ExperimentConfig[] = [];
  const today = todayIn(SANDBOX_TIME_ZONE, now);
  const seen = new Set<string>();

  configs.forEach((config, index) => {
    // Duplicates are checked before the parse, so a config with another
    // error still claims its slug.
    const slug = (config as { slug?: unknown } | null)?.slug;
    if (typeof slug === "string") {
      if (seen.has(slug)) errors.push({ index, message: E.slugDuplicate });
      seen.add(slug);
    }
    const parsed = experimentConfigSchema.safeParse(config);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        errors.push({ index, message: issue.message });
      return;
    }
    const experiment = parsed.data;
    if (experiment.closedOn !== null && experiment.closedOn > today)
      errors.push({ index, message: E.closedOnFuture });
    experiments.push(experiment);
  });

  return errors.length > 0 ? { ok: false, errors } : { ok: true, experiments };
}

/** Every experiment, once each. A new experiment adds its config here. */
export const registeredConfigs: readonly unknown[] = [pricing2026];

function loadExperiments(): readonly ExperimentConfig[] {
  const result = validateRegistry(registeredConfigs, new Date());
  if (!result.ok)
    throw new Error(
      `Experiment registry refused: ${result.errors
        .map((e) => `config ${e.index}: ${e.message}`)
        .join("; ")}`,
    );
  return result.experiments;
}

export const experiments: readonly ExperimentConfig[] = loadExperiments();

const bySlug = new Map(experiments.map((e) => [e.slug, e]));

/** The experiment with this slug, or null for any slug not registered. */
export function findExperiment(slug: string): ExperimentConfig | null {
  return bySlug.get(slug) ?? null;
}
