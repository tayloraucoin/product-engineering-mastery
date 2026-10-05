/**
 * Streamed chat: a conversation in the AI SDK's UI message format in, a
 * streamed UI message response out, which the app's route returns as is.
 * `parseChatRequest` is the route's input gate: text only (no files, no tool
 * parts, since no tools are offered), and a cap on turns and characters, so
 * one request cannot run up the bill.
 */

import {
  convertToModelMessages,
  safeValidateUIMessages,
  streamText,
  type LanguageModel,
  type UIMessage,
} from "ai";

import type { Logger } from "@pem/observability/logger";

import { chatPrompt } from "../prompts/chat.ts";
import { callSettings } from "./options.ts";

export const CHAT_LIMITS = { messages: 40, characters: 20_000 } as const;

const ALLOWED_PARTS = new Set(["text", "reasoning", "step-start"]);

export type ChatRequest =
  { ok: true; messages: UIMessage[] } | { ok: false; error: string };

/** The route's body, `{ messages }`, checked before any model is called. */
export async function parseChatRequest(body: unknown): Promise<ChatRequest> {
  const messages =
    typeof body === "object" && body !== null && "messages" in body
      ? body.messages
      : undefined;
  if (!Array.isArray(messages) || messages.length === 0)
    return { ok: false, error: "messages is required" };
  if (messages.length > CHAT_LIMITS.messages)
    return { ok: false, error: `at most ${CHAT_LIMITS.messages} messages` };
  const validated = await safeValidateUIMessages({ messages });
  if (!validated.success) return { ok: false, error: "messages is malformed" };
  let characters = 0;
  for (const message of validated.data) {
    if (message.role === "system")
      return { ok: false, error: "system messages are not accepted" };
    for (const part of message.parts) {
      if (!ALLOWED_PARTS.has(part.type))
        return { ok: false, error: `${part.type} parts are not accepted` };
      if (part.type === "text") characters += part.text.length;
    }
  }
  if (characters > CHAT_LIMITS.characters)
    return {
      ok: false,
      error: `at most ${CHAT_LIMITS.characters} characters of text`,
    };
  if (validated.data.at(-1)?.role !== "user")
    return { ok: false, error: "the last message must be the user's" };
  return { ok: true, messages: validated.data };
}

export async function streamChat(
  model: LanguageModel,
  messages: UIMessage[],
  logger: Logger,
): Promise<Response> {
  const result = streamText({
    model,
    instructions: chatPrompt.instructions,
    messages: await convertToModelMessages(messages),
    ...callSettings("chat"),
    onError: ({ error }) => {
      logger.error("chat.failed", { error });
    },
  });
  // The default error text is generic, so no vendor message reaches the browser.
  return result.toUIMessageStreamResponse();
}
