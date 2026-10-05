/**
 * The streamed chat route (D-STK-12): POST `{ messages }` in the AI SDK's UI
 * message format, answered as a UI message stream that `useChat` reads.
 *
 * - 400 when the body fails @pem/ai's gate (text only, capped turns and size).
 * - 401 when the call would reach the vendor and nobody is signed in: a live
 *   model spends money, so it answers only a user. The local fixtures answer
 *   anyone, since they cost nothing and leave the process.
 * - 503 when no key is set where fixtures may not answer.
 */

import { AiNotConfiguredError, parseChatRequest } from "@pem/ai/client";

import { getAuthContext } from "../../../../lib/supabase/context";
import { ai } from "../ai";

export async function POST(request: Request): Promise<Response> {
  if (ai.mode === "vendor" && !(await getAuthContext()))
    return Response.json({ error: "sign in to chat" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = await parseChatRequest(body);
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });

  try {
    return await ai.streamChat(parsed.messages);
  } catch (error) {
    if (error instanceof AiNotConfiguredError)
      return Response.json({ error: "AI is not configured" }, { status: 503 });
    throw error;
  }
}
