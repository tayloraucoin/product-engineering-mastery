// Written by scripts/record.ts; edit only the input, then record again.
import type { Fixture } from "./fixture.ts";

export const chatFixture: Fixture = {
  case: "chat",
  promptVersion: "2026-10-04.1",
  model: "claude-opus-5-5",
  recordedOn: "2026-10-04",
  source: "synthetic",
  input: "What can you help me with here?",
  output:
    "I can answer questions about this demo, explain what a page does, and help you draft short pieces of text. Ask me anything and I will keep it brief.",
};
