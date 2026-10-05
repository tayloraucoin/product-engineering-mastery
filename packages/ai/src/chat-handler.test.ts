/** The chat route's gates (createChatHandler): who may reach the vendor, what body is accepted, and the answer with no key. */

import assert from "node:assert/strict";
import { test } from "node:test";

import type { LogFields, Logger } from "@pem/observability/logger";

import { createAi, createChatHandler, type AiConfig } from "./client.ts";
import { FIXTURES } from "./fixtures/index.ts";

const LOCAL: AiConfig = { tier: "local", deployed: false };
const KEYED: AiConfig = { ...LOCAL, apiKey: "sk-ant-synthetic" };

function setup(config: AiConfig, userId: string | null) {
  const calls: string[] = [];
  const fetch: typeof globalThis.fetch = async (input) => {
    calls.push(String(input instanceof Request ? input.url : input));
    throw new Error("offline: the test vendor answers nothing");
  };
  const lines: { event: string; fields?: LogFields }[] = [];
  const keep = (event: string, fields?: LogFields) => {
    lines.push({ event, fields });
  };
  const logger: Logger = { info: keep, warn: keep, error: keep };
  const ai = createAi(config, { fetch, logger });
  let asked = 0;
  const handler = createChatHandler({
    ai,
    currentUserId: async () => {
      asked += 1;
      return userId;
    },
  });
  return { calls, lines, handler, asked: () => asked };
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/ai/chat", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const chat = {
  messages: [
    {
      id: "m1",
      role: "user",
      parts: [{ type: "text", text: FIXTURES.chat.input }],
    },
  ],
};

test("with a key and nobody signed in: 401, and the vendor is never called", async () => {
  const { calls, handler } = setup(KEYED, null);
  const response = await handler(post(chat));
  assert.equal(response.status, 401);
  assert.equal(calls.length, 0);
});

test("with a key and a user: the call reaches the vendor and is logged with the user's id", async () => {
  const { calls, lines, handler } = setup(KEYED, "user-synthetic");
  const response = await handler(post(chat));
  assert.equal(response.status, 200);
  await response.text();
  assert.ok(calls.length > 0);
  const vendor = lines.find((line) => line.event === "vendor");
  assert.equal(vendor?.fields?.userId, "user-synthetic");
  assert.equal(vendor?.fields?.case, "chat");
});

test("fixtures answer anyone, without asking who is signed in", async () => {
  const { calls, handler, asked } = setup(LOCAL, null);
  const response = await handler(post(chat));
  assert.equal(response.status, 200);
  assert.match(await response.text(), /text-delta/);
  assert.equal(asked(), 0);
  assert.equal(calls.length, 0);
});

test("a body the gate refuses is 400, before any model is called", async () => {
  for (const body of [
    "not json",
    {},
    {
      messages: [
        { id: "r", role: "user", parts: [{ type: "reasoning", text: "x" }] },
      ],
    },
  ]) {
    const { calls, handler } = setup(LOCAL, null);
    const response = await handler(post(body));
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  }
});

test("no key on a hosted tier is 503, naming nothing about the configuration", async () => {
  const { handler } = setup(
    { tier: "staging", deployed: true },
    "user-synthetic",
  );
  const response = await handler(post(chat));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "AI is not configured" });
});
