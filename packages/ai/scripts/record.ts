/**
 * Records each case's fixture against the live model: calls the case with the
 * fixture's input on the model models.ts names, runs the case's eval, and
 * rewrites `src/fixtures/<case>.ts` only when the answer passes.
 *
 *   yarn workspace @pem/ai record [extract | chat | generate ...]
 *
 * Reads ANTHROPIC_API_KEY from packages/ai/.env.local or the shell; it spends
 * a few cents per case. A developer's tool, never run by CI.
 */

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

import { createLogger } from "@pem/observability/logger";

import { streamChat } from "../src/cases/chat.ts";
import { extractContact } from "../src/cases/extract.ts";
import { summarize } from "../src/cases/generate.ts";
import { EVALS } from "../src/evals.ts";
import { FIXTURES, type Fixture } from "../src/fixtures/index.ts";
import { CASE_MODELS, type CaseId } from "../src/models.ts";
import {
  chatPrompt,
  extractContactPrompt,
  summarizePrompt,
} from "../src/prompts/index.ts";

const fixturesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/fixtures",
);
const CASES = Object.keys(FIXTURES) as CaseId[];
const VERSIONS: Record<CaseId, string> = {
  extract: extractContactPrompt.version,
  chat: chatPrompt.version,
  generate: summarizePrompt.version,
};
const EXPORT_NAMES: Record<CaseId, string> = {
  extract: "extractFixture",
  chat: "chatFixture",
  generate: "generateFixture",
};

/** The case's answer as text, the form a fixture stores. */
async function answer(
  caseId: CaseId,
  model: LanguageModel,
  input: string,
): Promise<{ text: string; value: unknown }> {
  if (caseId === "extract") {
    const contact = await extractContact(model, input);
    return { text: JSON.stringify(contact), value: contact };
  }
  if (caseId === "generate") {
    const text = await summarize(model, input);
    return { text, value: text };
  }
  const response = await streamChat(
    model,
    [{ id: "record", role: "user", parts: [{ type: "text", text: input }] }],
    createLogger("ai-record"),
  );
  let text = "";
  for (const line of (await response.text()).split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const chunk = JSON.parse(line.slice(6)) as { type: string; delta?: string };
    if (chunk.type === "text-delta") text += chunk.delta ?? "";
  }
  return { text, value: text };
}

function write(fixture: Fixture): void {
  const file = path.join(fixturesDir, `${fixture.case}.ts`);
  writeFileSync(
    file,
    `// Written by scripts/record.ts; edit only the input, then record again.\n` +
      `import type { Fixture } from "./fixture.ts";\n\n` +
      `export const ${EXPORT_NAMES[fixture.case]}: Fixture = ${JSON.stringify(fixture, null, 2)};\n`,
  );
  console.log(`record — wrote ${path.relative(process.cwd(), file)}`);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error(
    "record — set ANTHROPIC_API_KEY (packages/ai/.env.local or the shell).",
  );
  process.exit(1);
}
const anthropic = createAnthropic({ apiKey });
const wanted = process.argv.slice(2).length
  ? (process.argv.slice(2) as CaseId[])
  : CASES;
let failed = false;
for (const caseId of wanted) {
  if (!CASES.includes(caseId)) {
    console.error(
      `record — unknown case ${caseId}; one of ${CASES.join(", ")}`,
    );
    process.exit(1);
  }
  const fixture = FIXTURES[caseId];
  const { model } = CASE_MODELS[caseId];
  const { text, value } = await answer(caseId, anthropic(model), fixture.input);
  const problems = EVALS[caseId](value, fixture.input);
  if (problems.length) {
    failed = true;
    console.error(
      `record — ${caseId} failed its eval, fixture kept: ${problems.join("; ")}`,
    );
    continue;
  }
  write({
    ...fixture,
    promptVersion: VERSIONS[caseId],
    model,
    recordedOn: new Date().toISOString().slice(0, 10),
    source: "recorded",
    output: text,
  });
}
process.exit(failed ? 1 : 0);
