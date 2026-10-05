/**
 * C1: each case returns its expected shape from its recorded fixture, and the
 * extraction's is Zod-validated. C2: a missing key on the local tier replays
 * the fixture and never calls the vendor.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { UIMessage } from "ai";

import type { LogFields, Logger } from "@pem/observability/logger";

import {
  AiInputTooLongError,
  aiMode,
  AiNotConfiguredError,
  contactSchema,
  createAi,
  type AiConfig,
} from "./client.ts";
import { EVALS } from "./evals.ts";
import { FIXTURES } from "./fixtures/index.ts";
import { CASE_MODELS, type CaseId } from "./models.ts";
import {
  chatPrompt,
  extractContactPrompt,
  summarizePrompt,
} from "./prompts/index.ts";

const LOCAL: AiConfig = { tier: "local", deployed: false };

/** A vendor stand-in: records each request and answers none. */
function fakeFetch() {
  const calls: string[] = [];
  const fetch: typeof globalThis.fetch = async (input) => {
    calls.push(String(input instanceof Request ? input.url : input));
    throw new Error("offline: the test vendor answers nothing");
  };
  return { calls, fetch };
}

/** Runs `body` with the stand-in also installed as the global fetch, so a request that bypasses the provider is seen too. */
async function withGlobalFetch(
  fetch: typeof globalThis.fetch,
  body: () => Promise<void>,
): Promise<void> {
  const original = globalThis.fetch;
  globalThis.fetch = fetch;
  try {
    await body();
  } finally {
    globalThis.fetch = original;
  }
}

function memoryLogger() {
  const lines: { event: string; fields?: LogFields }[] = [];
  const keep = (event: string, fields?: LogFields) => {
    lines.push({ event, fields });
  };
  const logger: Logger = { info: keep, warn: keep, error: keep };
  return { lines, logger };
}

function userMessage(text: string): UIMessage {
  return { id: "m1", role: "user", parts: [{ type: "text", text }] };
}

/** The text a UI message stream carries: every text-delta joined. */
async function streamedText(response: Response): Promise<string> {
  const body = await response.text();
  let text = "";
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const chunk = JSON.parse(line.slice(6)) as { type: string; delta?: string };
    if (chunk.type === "text-delta") text += chunk.delta ?? "";
  }
  return text;
}

test("C1: each fixture answers its prompt's current version on the case's model", () => {
  const versions: Record<CaseId, string> = {
    extract: extractContactPrompt.version,
    chat: chatPrompt.version,
    generate: summarizePrompt.version,
  };
  for (const caseId of Object.keys(FIXTURES) as CaseId[]) {
    const fixture = FIXTURES[caseId];
    assert.equal(fixture.case, caseId);
    assert.equal(
      fixture.promptVersion,
      versions[caseId],
      `${caseId} fixture is stale`,
    );
    assert.equal(fixture.model, CASE_MODELS[caseId].model);
  }
});

test("C1: extraction returns a Zod-validated contact that passes its eval", async () => {
  const ai = createAi(LOCAL, { logger: memoryLogger().logger });
  const fixture = FIXTURES.extract;
  const contact = await ai.extractContact(fixture.input);
  assert.deepEqual(contactSchema.parse(contact), JSON.parse(fixture.output));
  assert.deepEqual(EVALS.extract(contact, fixture.input), []);
});

test("C1: an extraction answer that breaks the schema is refused", async () => {
  const { createFixtureModel } = await import("./fixture-model.ts");
  const { extractContact } = await import("./cases/extract.ts");
  const broken = createFixtureModel({
    ...FIXTURES.extract,
    output: '{"name":"","email":42}',
  });
  await assert.rejects(extractContact(broken, "text"));
});

test("C1: the one-shot generate returns a summary that passes its eval", async () => {
  const ai = createAi(LOCAL, { logger: memoryLogger().logger });
  const fixture = FIXTURES.generate;
  const summary = await ai.summarize(fixture.input);
  assert.equal(summary, fixture.output);
  assert.deepEqual(EVALS.generate(summary, fixture.input), []);
});

test("C1: the chat streams a UI message response that passes its eval", async () => {
  const ai = createAi(LOCAL, { logger: memoryLogger().logger });
  const fixture = FIXTURES.chat;
  const response = await ai.streamChat([userMessage(fixture.input)]);
  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /text\/event-stream/,
  );
  const text = await streamedText(response);
  assert.equal(text, fixture.output);
  assert.deepEqual(EVALS.chat(text, fixture.input), []);
});

test("C2: no key on the local tier replays every fixture and never calls the vendor", async () => {
  const vendor = fakeFetch();
  const { lines, logger } = memoryLogger();
  const ai = createAi(LOCAL, { fetch: vendor.fetch, logger });
  assert.equal(ai.mode, "fixture");
  await withGlobalFetch(vendor.fetch, async () => {
    await ai.extractContact(FIXTURES.extract.input);
    await ai.summarize(FIXTURES.generate.input);
    await streamedText(await ai.streamChat([userMessage(FIXTURES.chat.input)]));
  });
  assert.equal(vendor.calls.length, 0);
  assert.deepEqual(
    lines
      .filter((line) => line.event === "fixture")
      .map((line) => line.fields?.case),
    ["extract", "generate", "chat"],
  );
});

test("C2: with a key, the same call goes to the vendor (the stand-in sees it)", async () => {
  const vendor = fakeFetch();
  const ai = createAi(
    { ...LOCAL, apiKey: "sk-ant-synthetic" },
    { fetch: vendor.fetch, logger: memoryLogger().logger },
  );
  assert.equal(ai.mode, "vendor");
  await assert.rejects(ai.summarize("text"));
  assert.ok(vendor.calls.length > 0);
  assert.ok(
    vendor.calls.every((url) => url.startsWith("https://api.anthropic.com/")),
  );
});

test("C2: no key in a deployment or on a hosted tier throws, and never replays a fixture", async () => {
  for (const config of [
    { tier: "local", deployed: true },
    { tier: "staging", deployed: false },
    { tier: "production", deployed: true },
  ] satisfies AiConfig[]) {
    assert.equal(aiMode(config), "unconfigured");
    const vendor = fakeFetch();
    const ai = createAi(config, {
      fetch: vendor.fetch,
      logger: memoryLogger().logger,
    });
    await withGlobalFetch(vendor.fetch, async () => {
      await assert.rejects(ai.summarize("text"), AiNotConfiguredError);
      await assert.rejects(ai.extractContact("text"), AiNotConfiguredError);
      await assert.rejects(
        ai.streamChat([userMessage("hi")]),
        AiNotConfiguredError,
      );
    });
    assert.equal(vendor.calls.length, 0);
  }
});

test("with a key, the request names the case's model, its effort, the output cap and the versioned prompt", async () => {
  const bodies: Record<string, unknown>[] = [];
  const fetch: typeof globalThis.fetch = async (_input, init) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return Response.json({
      id: "msg_synthetic",
      type: "message",
      role: "assistant",
      model: CASE_MODELS.generate.model,
      content: [{ type: "text", text: "A synthetic summary." }],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    });
  };
  const ai = createAi(
    { ...LOCAL, apiKey: "sk-ant-synthetic" },
    { fetch, logger: memoryLogger().logger },
  );
  assert.equal(await ai.summarize("text"), "A synthetic summary.");
  const [body] = bodies;
  assert.equal(body?.model, CASE_MODELS.generate.model);
  assert.equal(body?.max_tokens, CASE_MODELS.generate.maxOutputTokens);
  assert.match(
    JSON.stringify(body?.system),
    new RegExp(summarizePrompt.instructions.slice(0, 40)),
  );
  assert.match(
    JSON.stringify(body),
    new RegExp(`"effort":"${CASE_MODELS.generate.effort}"`),
  );
});

test("a text over its case's input cap is refused before any model is called", async () => {
  const { calls, fetch } = fakeFetch();
  const { logger } = memoryLogger();
  for (const config of [LOCAL, { ...LOCAL, apiKey: "sk-ant-synthetic" }]) {
    const ai = createAi(config, { fetch, logger });
    await assert.rejects(
      ai.extractContact("x".repeat(CASE_MODELS.extract.maxInputCharacters + 1)),
      AiInputTooLongError,
    );
    await assert.rejects(
      ai.summarize("x".repeat(CASE_MODELS.generate.maxInputCharacters + 1)),
      AiInputTooLongError,
    );
  }
  assert.equal(calls.length, 0);
});

test("the client module is server-only, so a client component cannot import the keyed client", () => {
  const source = readFileSync(new URL("./client.ts", import.meta.url), "utf8");
  assert.match(source, /^import "server-only";$/m);
});
