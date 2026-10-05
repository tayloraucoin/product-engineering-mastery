/**
 * The install age gate (EN-14): `.yarnrc.yml` keeps the gate at a week, and
 * its one exception, `npmPreapprovedPackages`, holds only exact `name@x.y.z`
 * descriptors, each named, with its advisory, on one ledger line. Named after
 * CAT-6's criterion.
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

/** A GitHub or CVE advisory id. */
const ADVISORY = /\b(GHSA(-[23456789cfghjmpqrvwx]{4}){3}|CVE-\d{4}-\d{4,})\b/;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `entry`, with nothing on either side that would make it another package or version. */
const named = (entry: string) =>
  new RegExp(`(?<![\\w@/.-])${escape(entry)}(?![\\w.-])`);

/** One ledger row names this exact version and its advisory, outside a "Was:" cell. */
export function isApproved(entry: string, ledgerText: string): boolean {
  return ledgerText.split("\n").some((line) => {
    if (!line.startsWith("| EN-")) return false;
    const current = line.split("Was:")[0]!;
    return named(entry).test(current) && ADVISORY.test(current);
  });
}

test("C2: the age gate is a week", () => {
  assert.equal(String(yarnrc.npmMinimalAgeGate), "7d");
});

test("C2: every pre-approved package is one exact version, named with its advisory in the ledger", () => {
  const entries = yarnrc.npmPreapprovedPackages ?? [];
  assert.ok(Array.isArray(entries), "npmPreapprovedPackages must be a list");
  for (const entry of entries) {
    assert.match(entry, EXACT, `${entry} is not one exact name@x.y.z`);
    assert.ok(
      isApproved(entry, ledger),
      `${entry} has no ledger row naming it with its advisory`,
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

test("C2: a pre-approval needs one ledger row naming that exact version and its advisory", () => {
  const row =
    "| EN-99 | react@19.2.9 pre-approved for GHSA-c2qf-rxjj-qqgw until 2026-10-12 | — |";
  assert.ok(isApproved("react@19.2.9", row));
  assert.ok(
    !isApproved("react@19.2.9", row.replace("react@", "preact@")),
    "another package",
  );
  assert.ok(
    !isApproved("react@19.2.1", row.replace("19.2.9", "19.2.10")),
    "another version",
  );
  assert.ok(
    !isApproved("react@19.2.9", row.replace("react@", "@types/react@")),
    "a scoped neighbour",
  );
  assert.ok(
    !isApproved("react@19.2.9", row.replace("GHSA-c2qf-rxjj-qqgw", "a fix")),
    "no advisory id",
  );
  assert.ok(
    !isApproved(
      "react@19.2.9",
      "| EN-99 | the gate | — | ruled. Was: react@19.2.9 for GHSA-c2qf-rxjj-qqgw |",
    ),
    "only a Was: cell",
  );
});
