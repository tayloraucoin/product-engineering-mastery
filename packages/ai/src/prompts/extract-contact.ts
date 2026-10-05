/**
 * Prompt for the extraction case: one contact out of free text, as the Zod
 * schema in `cases/extract.ts` describes it. A change to the wording bumps
 * the version, and the fixture is recorded again.
 */

export const extractContactPrompt = {
  id: "extract-contact",
  version: "2026-10-04.1",
  instructions:
    "Extract the contact described in the user's text. Use only what the text states; leave a field null when the text does not give it. Return the email address exactly as written.",
} as const;
