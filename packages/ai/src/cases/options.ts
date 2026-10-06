/** Call settings every case shares, from models.ts: the case's caps and effort. */

import { CASE_MODELS, type CaseId } from "../models.ts";

export function callSettings(caseId: CaseId) {
  const { maxOutputTokens, effort } = CASE_MODELS[caseId];
  return { maxOutputTokens, providerOptions: { anthropic: { effort } } };
}

export class AiInputTooLongError extends Error {
  constructor(caseId: CaseId, limit: number) {
    super(`${caseId}: the text is over ${limit} characters`);
    this.name = "AiInputTooLongError";
  }
}

/** Throws before any model is called when `text` is over the case's input cap. */
export function checkInput(caseId: CaseId, text: string): void {
  const limit = CASE_MODELS[caseId].maxInputCharacters;
  if (text.length > limit) throw new AiInputTooLongError(caseId, limit);
}
