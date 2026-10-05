/** One-shot generate: a one-sentence summary of a passage. */

import { generateText, type LanguageModel } from "ai";

import { summarizePrompt } from "../prompts/summarize.ts";
import { callSettings } from "./options.ts";

export async function summarize(
  model: LanguageModel,
  text: string,
): Promise<string> {
  const result = await generateText({
    model,
    instructions: summarizePrompt.instructions,
    prompt: text,
    ...callSettings("generate"),
  });
  return result.text.trim();
}
