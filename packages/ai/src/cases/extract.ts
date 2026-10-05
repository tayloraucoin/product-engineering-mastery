/**
 * Structured extraction: one contact out of free text, returned as the Zod
 * schema below and validated against it before a caller sees it.
 */

import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";

import { extractContactPrompt } from "../prompts/extract-contact.ts";
import { callSettings, checkInput } from "./options.ts";

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(3).nullable(),
  company: z.string().min(1).nullable(),
});

export type Contact = z.infer<typeof contactSchema>;

export async function extractContact(
  model: LanguageModel,
  text: string,
): Promise<Contact> {
  checkInput("extract", text);
  const result = await generateText({
    model,
    instructions: extractContactPrompt.instructions,
    prompt: text,
    output: Output.object({ schema: contactSchema, name: "contact" }),
    ...callSettings("extract"),
  });
  return contactSchema.parse(result.output);
}
