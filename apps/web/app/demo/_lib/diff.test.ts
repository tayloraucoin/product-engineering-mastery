import assert from "node:assert/strict";
import { test } from "node:test";

import { diffClauses } from "./diff.ts";
import { FIXTURE_BODIES, HALVORSEN_ID } from "./fixtures/index.ts";

/** A small LCG so the generated cases are the same on every run. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomClauses(next: () => number): string[] {
  const length = Math.floor(next() * 8); // 0 to 7, repeats allowed
  return Array.from({ length }, () => `clause ${Math.floor(next() * 6)}`);
}

test("C1: 500 seeded cases rebuild both versions and the counts agree", () => {
  const next = lcg(20261008);
  for (let i = 0; i < 500; i++) {
    const oldC = randomClauses(next);
    const newC = randomClauses(next);
    const { rows, counts } = diffClauses(oldC, newC);
    const label = JSON.stringify({ oldC, newC });
    assert.deepEqual(
      rows.filter((r) => r.kind !== "added").map((r) => r.text),
      oldC,
      `old rebuilds: ${label}`,
    );
    assert.deepEqual(
      rows.filter((r) => r.kind !== "removed").map((r) => r.text),
      newC,
      `new rebuilds: ${label}`,
    );
    const removedRows = rows.filter((r) => r.kind === "removed").length;
    const addedRows = rows.filter((r) => r.kind === "added").length;
    assert.equal(counts.changed + counts.removed, removedRows, label);
    assert.equal(counts.changed + counts.added, addedRows, label);
  }
});

test('C1: Halvorsen 4 against 3 reads "2 clauses changed, 1 added"', () => {
  const [v4, v3] = FIXTURE_BODIES[HALVORSEN_ID]!.versions;
  const diff = diffClauses(v3!.clauses, v4!.clauses);
  assert.equal(diff.summary, "2 clauses changed, 1 added");
  assert.deepEqual(diff.counts, { changed: 2, added: 1, removed: 0 });
});

test("C1: identical clause lists have no changes", () => {
  const diff = diffClauses(["a", "b"], ["a", "b"]);
  assert.equal(diff.summary, "No clause changes");
  assert.ok(diff.rows.every((r) => r.kind === "same"));
});
