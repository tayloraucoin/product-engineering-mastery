/** Call settings every case shares: the output cap and the case's effort from models.ts. */

import { CASE_MODELS, type CaseId } from "../models.ts";

/** A ceiling, not a target: thinking counts toward it, and a cut-off answer costs a retry. */
export const MAX_OUTPUT_TOKENS = 16_000;

export function callSettings(caseId: CaseId) {
  return {
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: { anthropic: { effort: CASE_MODELS[caseId].effort } },
  };
}
