/**
 * A recorded fixture: one input to a case, and the text the model answered.
 * The local tier with no key replays it (`fixture-model.ts`), and each case's
 * eval checks it (`evals.ts`). `yarn workspace @pem/ai record` calls the live
 * model with `input` and rewrites the file; `source` says which it holds.
 */

import type { CaseId } from "../models.ts";

export type Fixture = {
  case: CaseId;
  /** The prompt version the output answers; a stale one fails the eval. */
  promptVersion: string;
  /** The model that answered, or that a synthetic output stands in for. */
  model: string;
  recordedOn: string;
  /** `synthetic` until the record script has run against the vendor. */
  source: "synthetic" | "recorded";
  /** The user's text: the passage to read, or the chat message. */
  input: string;
  /** The model's text, verbatim: JSON for extraction, prose otherwise. */
  output: string;
};
