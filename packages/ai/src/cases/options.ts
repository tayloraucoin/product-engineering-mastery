/** Call settings every case shares, from models.ts: the case's output cap and effort. */

import { CASE_MODELS, type CaseId } from "../models.ts";

export function callSettings(caseId: CaseId) {
  const { maxOutputTokens, effort } = CASE_MODELS[caseId];
  return { maxOutputTokens, providerOptions: { anthropic: { effort } } };
}
