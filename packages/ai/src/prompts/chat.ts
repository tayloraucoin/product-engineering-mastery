/**
 * Prompt for the streamed chat case. A product replaces the instructions with
 * its own and bumps the version; the fixture is recorded again.
 */

export const chatPrompt = {
  id: "chat",
  version: "2026-10-04.1",
  instructions:
    "You are a concise assistant inside a product demo. Answer in plain prose, in a few sentences. If you do not know, say so.",
} as const;
