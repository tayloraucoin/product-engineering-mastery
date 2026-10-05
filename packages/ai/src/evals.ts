/**
 * The eval for each case: what a good answer to its fixture's input looks
 * like. The tests run each check on the recorded fixture (C1), and the record
 * script runs it on a live answer and refuses to save one that fails, so a
 * fixture always holds an answer that passed.
 *
 * Each check returns the problems it found; none means the answer passes.
 */

import { contactSchema } from "./cases/extract.ts";
import type { CaseId } from "./models.ts";

/** Extraction: schema-valid, and the email exactly as the input wrote it. */
function checkExtract(output: unknown, input: string): string[] {
  const parsed = contactSchema.safeParse(output);
  if (!parsed.success) return [`not a contact: ${parsed.error.message}`];
  const problems: string[] = [];
  const email = parsed.data.email;
  if (!email) problems.push("no email, though the input gives one");
  else if (!input.includes(email))
    problems.push(`email ${email} is not in the input`);
  if (!input.includes(parsed.data.name))
    problems.push(`name ${parsed.data.name} is not in the input`);
  return problems;
}

/** Chat: some prose, and short. */
function checkChat(output: unknown): string[] {
  if (typeof output !== "string" || output.trim() === "")
    return ["empty reply"];
  return output.length > 1_200 ? ["reply longer than 1,200 characters"] : [];
}

/** Generate: one sentence of at most 30 words. */
function checkGenerate(output: unknown): string[] {
  if (typeof output !== "string" || output.trim() === "")
    return ["empty summary"];
  const problems: string[] = [];
  const words = output.trim().split(/\s+/).length;
  if (words > 30) problems.push(`${words} words, more than 30`);
  const sentences = output
    .trim()
    .split(/[.!?](\s|$)/)
    .filter((s) => s.trim());
  if (sentences.length > 1) problems.push("more than one sentence");
  return problems;
}

export const EVALS: Record<
  CaseId,
  (output: unknown, input: string) => string[]
> = {
  extract: checkExtract,
  chat: checkChat,
  generate: checkGenerate,
};
