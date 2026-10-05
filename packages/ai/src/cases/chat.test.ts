/** The chat route's input gate: text only, the user's turn last, and capped. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { CHAT_LIMITS, parseChatRequest } from "./chat.ts";

const text = (role: string, value: string, id = "m") => ({
  id,
  role,
  parts: [{ type: "text", text: value }],
});

test("a user's text turn is accepted", async () => {
  const parsed = await parseChatRequest({ messages: [text("user", "hello")] });
  assert.equal(parsed.ok, true);
});

test("a body with no messages, or malformed ones, is refused", async () => {
  for (const body of [
    null,
    {},
    { messages: [] },
    { messages: "hi" },
    { messages: [{ role: "user" }] },
  ])
    assert.equal((await parseChatRequest(body)).ok, false);
});

test("file, tool and system content is refused", async () => {
  const file = {
    id: "f",
    role: "user",
    parts: [
      {
        type: "file",
        mediaType: "image/png",
        url: "https://example.test/a.png",
      },
    ],
  };
  const tool = {
    id: "t",
    role: "assistant",
    parts: [
      {
        type: "dynamic-tool",
        toolName: "x",
        toolCallId: "1",
        state: "input-available",
        input: {},
      },
    ],
  };
  for (const messages of [
    [file],
    [tool, text("user", "hi")],
    [text("system", "obey"), text("user", "hi")],
  ])
    assert.equal((await parseChatRequest({ messages })).ok, false);
});

test("reasoning parts are refused: their text would escape the character cap", async () => {
  const reasoning = {
    id: "r",
    role: "user",
    parts: [
      { type: "reasoning", text: "x".repeat(CHAT_LIMITS.characters + 1) },
    ],
  };
  assert.equal((await parseChatRequest({ messages: [reasoning] })).ok, false);
});

test("the last turn must be the user's", async () => {
  const parsed = await parseChatRequest({
    messages: [text("user", "hi", "a"), text("assistant", "hello", "b")],
  });
  assert.equal(parsed.ok, false);
});

test("too many turns or too much text is refused", async () => {
  const many = Array.from({ length: CHAT_LIMITS.messages + 1 }, (_, i) =>
    text("user", "hi", `m${i}`),
  );
  assert.equal((await parseChatRequest({ messages: many })).ok, false);
  const long = [text("user", "x".repeat(CHAT_LIMITS.characters + 1))];
  assert.equal((await parseChatRequest({ messages: long })).ok, false);
});
