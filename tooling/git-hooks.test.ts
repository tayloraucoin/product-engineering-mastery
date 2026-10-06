/**
 * WEB-10: the native commit-msg hook on a repo with no commits yet, as the
 * new-project guide leaves it after `git init` and `git switch -c`. A copy of
 * tooling/ and toolkit.json in a scratch repo, run as git would run the hook.
 */

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

import { REPO_ROOT } from "./lib/docs.ts";
import { getCurrentBranch } from "./lib/git.ts";
import { readLayout } from "./lib/work-ids.ts";

let repo: string;
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
const prefix = readLayout(REPO_ROOT).prefixes[0] ?? "PEM";

before(() => {
  repo = mkdtempSync(path.join(tmpdir(), "pem-commit-msg-"));
  cpSync(path.join(REPO_ROOT, "tooling"), path.join(repo, "tooling"), {
    recursive: true,
    filter: (src) => !src.includes(`${path.sep}fixtures`),
  });
  cpSync(path.join(REPO_ROOT, "toolkit.json"), path.join(repo, "toolkit.json"));
  // The hook's imports resolve through the toolkit's installed packages.
  symlinkSync(
    path.join(REPO_ROOT, "node_modules"),
    path.join(repo, "node_modules"),
  );
  git("init", "-q", "-b", "main");
  git("switch", "-q", "-c", `agent/${prefix}-unborn`);
});

after(() => rmSync(repo, { recursive: true, force: true }));

function hook(message: string) {
  const file = path.join(repo, "MSG");
  writeFileSync(file, `${message}\n`);
  return spawnSync(
    process.execPath,
    [path.join(repo, "tooling/git-hooks/commit-msg.ts"), file],
    { cwd: repo, encoding: "utf8" },
  );
}

test("C1: the branch of a repo with no commits is read, not an error", () => {
  assert.equal(getCurrentBranch(repo), `agent/${prefix}-unborn`);
});

test("C1: on an unborn agent branch the hook passes a work-id and refuses a message without one", () => {
  const passed = hook(`${prefix}: new project from the toolkit`);
  assert.equal(passed.status, 0, passed.stderr);
  const refused = hook("new project from the toolkit");
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /opens with a work-id/);
});

test("a detached HEAD still reads as HEAD", () => {
  git(
    "-c",
    "user.email=t@example.test",
    "-c",
    "user.name=t",
    "commit",
    "-q",
    "--allow-empty",
    "--no-verify",
    "-m",
    "root",
  );
  git("switch", "-q", "--detach");
  assert.equal(getCurrentBranch(repo), "HEAD");
});
