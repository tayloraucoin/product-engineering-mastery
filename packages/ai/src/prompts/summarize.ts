/**
 * Prompt for the one-shot generate case: a summary of a passage. A change to
 * the wording bumps the version, and the fixture is recorded again.
 */

export const summarizePrompt = {
  id: "summarize",
  version: "2026-10-04.1",
  instructions:
    "Summarize the user's text in one sentence of at most 30 words. Return the sentence only.",
} as const;
