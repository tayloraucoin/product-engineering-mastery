import assert from "node:assert/strict";
import { test } from "node:test";

import {
  readSandboxState,
  SANDBOX_STATE_KEYS,
  type SandboxStateAudience,
  type SandboxViewerKind,
} from "./state.ts";

const KEYS: Record<string, SandboxStateAudience> = {
  "synthetic-gate": "anyone",
  "synthetic-results": "team",
};

const VIEWERS: SandboxViewerKind[] = ["reviewer", "guest", "team"];

test("C6: an anyone key renders for a reviewer, a guest and the team", () => {
  for (const viewer of VIEWERS)
    assert.equal(
      readSandboxState("synthetic-gate", viewer, KEYS),
      "synthetic-gate",
    );
});

test("C6: a team key renders only for the team", () => {
  assert.equal(
    readSandboxState("synthetic-results", "team", KEYS),
    "synthetic-results",
  );
  assert.equal(readSandboxState("synthetic-results", "reviewer", KEYS), null);
  assert.equal(readSandboxState("synthetic-results", "guest", KEYS), null);
});

test("C6: an unknown, missing or repeated key reads as absent", () => {
  for (const viewer of VIEWERS) {
    assert.equal(readSandboxState("not-a-key", viewer, KEYS), null);
    assert.equal(readSandboxState("constructor", viewer, KEYS), null);
    assert.equal(readSandboxState(undefined, viewer, KEYS), null);
    assert.equal(
      readSandboxState(["synthetic-gate", "synthetic-gate"], viewer, KEYS),
      null,
    );
  }
});

test("C6: the shipped registry marks every key anyone or team", () => {
  for (const audience of Object.values(SANDBOX_STATE_KEYS))
    assert.ok(audience === "anyone" || audience === "team");
  assert.equal(readSandboxState("synthetic-gate", "team"), null);
});
