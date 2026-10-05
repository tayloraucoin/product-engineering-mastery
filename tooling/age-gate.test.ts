/**
 * The install age gate (EN-13): `.yarnrc.yml` keeps the gate at a week, and
 * its one exception, `npmPreapprovedPackages`, holds only exact `name@x.y.z`
 * descriptors, each named by a ledger line. Named after CAT-6's criterion.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { parse } from "yaml";

import { REPO_ROOT } from "./lib/docs.ts";

const yarnrc = parse(
  readFileSync(path.join(REPO_ROOT, ".yarnrc.yml"), "utf8"),
) as {
  npmMinimalAgeGate?: string | number;
  npmPreapprovedPackages?: string[];
};
const ledger = readFileSync(
  path.join(REPO_ROOT, "docs/decisions/ledger.md"),
  "utf8",
);

/** An exact npm version of one package, scoped or not: never a range, glob or bare name. */
export const EXACT =
  /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*@\d+\.\d+\.\d+(-[\w.]+)?$/;

test("C2: the age gate is a week", () => {
  assert.equal(String(yarnrc.npmMinimalAgeGate), "7d");
});

test("C2: every pre-approved package is one exact version, named in the ledger", () => {
  const entries = yarnrc.npmPreapprovedPackages ?? [];
  assert.ok(Array.isArray(entries), "npmPreapprovedPackages must be a list");
  for (const entry of entries) {
    assert.match(entry, EXACT, `${entry} is not one exact name@x.y.z`);
    assert.ok(
      ledger.includes(entry),
      `${entry} has no ledger line naming its advisory`,
    );
  }
});

test("C2: the exact-version rule rejects ranges, globs and bare names", () => {
  for (const bad of [
    "lodash",
    "lodash@^4.17.21",
    "@scope/*",
    "lodash@4",
    "lodash@latest",
  ])
    assert.doesNotMatch(bad, EXACT, bad);
  for (const good of [
    "lodash@4.17.21",
    "@scope/pkg@1.2.3",
    "next@16.3.9-canary.1",
  ])
    assert.match(good, EXACT, good);
});
