import assert from "node:assert/strict";
import { test } from "node:test";

import { DEMO_SURFACES, readDemoState } from "./states.ts";

const UNIVERSAL = ["empty", "loading", "error", "partial", "offline"];

test("C3: a registered key reads back; unknown, repeated and unregistered read null", () => {
  assert.equal(readDemoState("error", "records-table"), "error");
  assert.equal(readDemoState("bogus", "records-table"), null);
  assert.equal(readDemoState(["error", "empty"], "records-table"), null);
  assert.equal(readDemoState(undefined, "records-table"), null);
  assert.equal(readDemoState("error", "no-such-surface"), null);
  assert.equal(readDemoState("toString", "records-table"), null);
  assert.equal(readDemoState("error", "__proto__"), null);
  assert.equal(readDemoState("empty", "delete-dialog"), null);
  assert.equal(readDemoState("loading", "delete-dialog"), null);
});

test("C3: each surface lists only the universal keys its States table has", () => {
  const expected: Record<string, string[]> = {
    onboarding: ["beat-1", "beat-2", "beat-3", ...UNIVERSAL],
    "records-table": [
      "empty",
      "no-results",
      "loading",
      "error",
      "partial",
      "offline",
      "deleted",
    ],
    "record-detail": UNIVERSAL,
    "record-form": [
      "invalid",
      "submitting",
      "empty",
      "loading",
      "error",
      "partial",
      "offline",
      "dirty",
    ],
    settings: UNIVERSAL,
    "delete-dialog": ["error", "partial", "offline"],
  };
  assert.deepEqual(
    Object.keys(DEMO_SURFACES).sort(),
    Object.keys(expected).sort(),
  );
  for (const [id, keys] of Object.entries(expected)) {
    assert.deepEqual([...DEMO_SURFACES[id]!.keys], keys, id);
    assert.equal(DEMO_SURFACES[id]!.id, id);
  }
});
