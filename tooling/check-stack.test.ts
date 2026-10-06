/**
 * check-stack (STK-2, D-STK-13): one test per contract criterion, each over
 * synthetic fixture trees in tooling/fixtures/stack/<case>/{case.json, …}.
 * A tree is copied to $TMPDIR before the run, and its env.example becomes
 * .env.example there: the repo's own settings deny reading .env files, so no
 * fixture holds one under that name. Every module, variable and value is
 * synthetic.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { REPO_ROOT } from "./lib/docs.ts";

const FIXTURES = path.join(REPO_ROOT, "tooling/fixtures/stack");
const scratch = mkdtempSync(path.join(tmpdir(), "check-stack-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

type Case = { expect: "pass" | "fail"; messages: string[] };

/** Copies a fixture tree out of the repo, naming its env file as the check expects. */
function stage(name: string): string {
  const root = path.join(scratch, name);
  cpSync(path.join(FIXTURES, name), root, { recursive: true });
  const rename = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) rename(full);
      else if (entry.name === "env.example")
        renameSync(full, path.join(dir, ".env.example"));
    }
  };
  rename(root);
  return root;
}

/** Runs check-stack on one fixture and asserts its exit and every expected message. */
function runCase(name: string) {
  const fixture = JSON.parse(
    readFileSync(path.join(FIXTURES, name, "case.json"), "utf8"),
  ) as Case;
  const result = spawnSync(
    process.execPath,
    ["tooling/check-stack.ts", "--root", stage(name)],
    { cwd: REPO_ROOT, encoding: "utf8" },
  );
  const out = `${result.stdout}${result.stderr}`;
  assert.equal(
    result.status === 0 ? "pass" : "fail",
    fixture.expect,
    `${name}: ${out}`,
  );
  for (const message of fixture.messages)
    assert.ok(out.includes(message), `${name}: no "${message}" in:\n${out}`);
  const problems = /check-stack — (\d+) problem/.exec(out);
  assert.equal(
    problems ? Number(problems[1]) : 0,
    fixture.messages.length,
    `${name}: expected exactly the listed problems, got:\n${out}`,
  );
}

test("C1: a present module missing a listed file fails, naming the module and the file", () => {
  runCase("c1-present-file-missing");
});

test("C2: a removed module with a leftover file, variable or dependency fails, naming each leftover", () => {
  runCase("c2-removed-file");
  runCase("c2-removed-env-example");
  runCase("c2-removed-turbo");
  runCase("c2-removed-dependency");
});

test("C2: a clean removal passes, and near-miss names are not leftovers", () => {
  runCase("clean");
});

test("C3: a locked module marked removed fails", () => {
  runCase("c3-locked-removed");
});

test("C4: an entry missing any of files, env, dependencies, boundaries, locked or runbook fails, naming the field", () => {
  runCase("c4-missing-field");
});

test("C5: a runbook path that does not exist fails, naming the path", () => {
  runCase("c5-runbook-missing");
});
