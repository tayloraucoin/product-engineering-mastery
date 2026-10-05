/**
 * The default model for each standard case (D-STK-12), and the day it was
 * chosen. This file is the only place a model id is written: a case reads its
 * id from here, so moving to a newer model is one edit and a fresh
 * `yarn workspace @pem/ai record` (README.md).
 *
 * Chosen 2026-10-04 from Anthropic's current model table (cached 2026-09-25):
 * Claude Opus 5.5 is the current default model. Its effort defaults to
 * `medium`; each case below sets its own.
 */

export const MODELS_CHOSEN_ON = "2026-10-04";

export const DEFAULT_MODEL = "claude-opus-5-5";

/**
 * The cases this package wires, each with its model, effort and output cap.
 * The cap bounds one call's spend; thinking counts toward it, so it leaves
 * room above the answer (a three-field object, a reply of a few sentences,
 * one sentence), and a cut-off answer costs a retry.
 */
export const CASE_MODELS = {
  extract: { model: DEFAULT_MODEL, effort: "low", maxOutputTokens: 4_000 },
  chat: { model: DEFAULT_MODEL, effort: "low", maxOutputTokens: 8_000 },
  generate: { model: DEFAULT_MODEL, effort: "medium", maxOutputTokens: 4_000 },
} as const;

export type CaseId = keyof typeof CASE_MODELS;
