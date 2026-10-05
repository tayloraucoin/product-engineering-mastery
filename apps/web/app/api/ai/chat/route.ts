/**
 * The streamed chat route (D-STK-12): POST `{ messages }` in the AI SDK's UI
 * message format, answered as a UI message stream that `useChat` reads. Its
 * gates (401 before a vendor call with nobody signed in, 400 on a bad body,
 * 503 with no key) are @pem/ai's `createChatHandler`, tested there.
 */

import { createChatHandler } from "@pem/ai/client";

import { getAuthContext } from "../../../../lib/supabase/context";
import { ai } from "../ai";

export const POST = createChatHandler({
  ai,
  currentUserId: async () => (await getAuthContext())?.userId ?? null,
});
