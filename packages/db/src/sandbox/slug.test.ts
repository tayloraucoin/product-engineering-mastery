import assert from "node:assert/strict";
import { test } from "node:test";

import { isSandboxSlug, SANDBOX_SLUG, SANDBOX_SLUG_MAX } from "./slug.ts";

test("WEB-15 C1: isSandboxSlug accepts lower-case words joined by single hyphens, up to 48 characters", () => {
  for (const slug of [
    "a",
    "a-b-1",
    "pricing-2026",
    "a".repeat(SANDBOX_SLUG_MAX),
  ])
    assert.equal(isSandboxSlug(slug), true, slug);
});

test("WEB-15 C1: isSandboxSlug refuses 49 characters, stray hyphens, upper case, spaces and a non-string", () => {
  for (const value of [
    "a".repeat(SANDBOX_SLUG_MAX + 1),
    "-a",
    "a-",
    "a--b",
    "A-b",
    "a b",
    "",
    null,
    undefined,
    42,
    ["a"],
  ])
    assert.equal(isSandboxSlug(value), false, String(value));
});

test("WEB-15 C1: the shared RegExp holds no state between calls", () => {
  assert.equal(SANDBOX_SLUG.global, false);
  assert.equal(SANDBOX_SLUG.test("a-b") && SANDBOX_SLUG.test("a-b"), true);
});
