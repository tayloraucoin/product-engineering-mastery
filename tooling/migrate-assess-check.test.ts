/**
 * migrate:assess --check (MIG-7): the preconditions a run checks before it
 * writes and before its last commit. One scratch repo per failure, each with
 * a bare origin so pushed and unpushed states are real. Every repo, branch
 * and version here is synthetic.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkPreconditions,
  NODE_FLOOR,
  nodeFloorOk,
} from "./lib/assess/preconditions.ts";
import { openRepo } from "./lib/assess/repo.ts";
import {
  commitAll,
  git,
  pkg,
  removeScratch,
  scratchOrigin,
  scratchTarget,
  writeFiles,
} from "./lib/assess/scratch-target.ts";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

after(removeScratch);

/** A committed repo on main, pushed to a bare origin, with the migration branch checked out at main's tip. */
function readyRepo(): string {
  const dir = scratchTarget({ "package.json": pkg({ scripts: {} }) });
  const origin = scratchOrigin();
  git(dir, "remote", "add", "origin", origin);
  git(dir, "push", "-q", "-u", "origin", "main");
  git(dir, "switch", "-q", "-c", "migrate");
  return dir;
}

const failedIds = (
  dir: string,
  extra: string[] = [],
  env: Record<string, string> = {},
  protectedBranch = "main",
) => {
  const r = spawnSync(
    process.execPath,
    [
      path.join(REPO, "tooling/migrate-assess.ts"),
      dir,
      "--check",
      "--protected",
      protectedBranch,
      ...extra,
    ],
    { cwd: REPO, encoding: "utf8", env: { ...process.env, ...env } },
  );
  const failed = [...r.stdout.matchAll(/^FAIL {2}([a-z-]+): (.*)$/gm)].map(
    (m) => [m[1]!, m[2]!] as const,
  );
  return { status: r.status, failed, out: r.stdout, err: r.stderr };
};

test("C1 (MIG-7) a clean repo on a fresh branch off a pushed protected branch passes every precondition", () => {
  const r = failedIds(readyRepo());
  assert.equal(r.status, 0, r.out + r.err);
  assert.deepEqual(r.failed, []);
  assert.match(r.out, /every precondition holds \(\d+\)/);
});

test("C1 (MIG-7) a dirty tree, untracked file included, fails clean-tree alone", () => {
  const dir = readyRepo();
  writeFileSync(path.join(dir, "notes.txt"), "scratch\n");
  const r = failedIds(dir);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["clean-tree"],
  );
  assert.match(r.failed[0]![1], /notes\.txt/);
});

test("C1 (MIG-7) a detached HEAD fails on-a-branch alone", () => {
  const dir = readyRepo();
  git(dir, "checkout", "-q", "--detach");
  const r = failedIds(dir);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["on-a-branch"],
  );
});

test("C1 (MIG-7) the protected branch checked out fails not-on-protected alone", () => {
  const dir = readyRepo();
  git(dir, "switch", "-q", "main");
  const r = failedIds(dir);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["not-on-protected"],
  );
  assert.match(r.failed[0]![1], /git switch -c/);
});

test("C1 (MIG-7) a migration branch with its own commits beyond the fork point fails fork-point-clean alone", () => {
  const dir = readyRepo();
  writeFiles(dir, { "AGENTS.md": "# Agents\n" });
  commitAll(dir, "early");
  const r = failedIds(dir);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["fork-point-clean"],
  );
  assert.match(r.failed[0]![1], /1 commits beyond its fork point/);
});

test("C1 (MIG-7) a protected branch with no remote copy, or one that differs from it, fails protected-pushed alone", () => {
  const unpushed = scratchTarget({ "package.json": pkg({ scripts: {} }) });
  git(unpushed, "switch", "-q", "-c", "migrate");
  let r = failedIds(unpushed);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["protected-pushed"],
  );
  assert.match(r.failed[0]![1], /no copy under refs\/remotes\/origin\/main/);
  // Pushed, then moved locally: the two differ.
  const moved = readyRepo();
  git(moved, "switch", "-q", "main");
  writeFiles(moved, { "README.md": "# Moved\n" });
  commitAll(moved, "local only");
  git(moved, "switch", "-q", "migrate");
  git(moved, "reset", "-q", "--hard", "main");
  r = failedIds(moved);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["protected-pushed"],
  );
  assert.match(r.failed[0]![1], /differs from refs\/remotes\/origin\/main/);
});

test("C1 (MIG-7) an existing toolkit.json fails no-toolkit-json alone; a tracked local settings file fails local-settings-untracked alone", () => {
  const set = readyRepo();
  git(set, "switch", "-q", "main");
  writeFiles(set, { "toolkit.json": '{ "tier": "overlay" }\n' });
  commitAll(set, "layout");
  git(set, "push", "-q", "origin", "main");
  git(set, "switch", "-q", "migrate");
  git(set, "reset", "-q", "--hard", "main");
  let r = failedIds(set);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["no-toolkit-json"],
  );
  const local = readyRepo();
  git(local, "switch", "-q", "main");
  writeFiles(local, { ".claude/settings.local.json": "{}\n" });
  // A machine-wide excludes file may ignore the local settings file; the case is that it was committed anyway.
  git(local, "add", "-f", ".claude/settings.local.json");
  commitAll(local, "local settings");
  git(local, "push", "-q", "origin", "main");
  git(local, "switch", "-q", "migrate");
  git(local, "reset", "-q", "--hard", "main");
  r = failedIds(local);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["local-settings-untracked"],
  );
  assert.match(r.failed[0]![1], /git rm --cached/);
});

test("C1 (MIG-7) Node below 22.18 fails node-floor alone, with the floor named; the predicate reads three numbers", () => {
  const r = failedIds(readyRepo(), [], { PEM_ASSESS_NODE_VERSION: "22.17.9" });
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["node-floor"],
  );
  assert.match(r.failed[0]![1], /22\.17\.9 is below 22\.18\.0/);
  assert.equal(NODE_FLOOR, "22.18.0");
  assert.ok(nodeFloorOk("22.18.0"));
  assert.ok(nodeFloorOk("v22.22.2"));
  assert.ok(nodeFloorOk("24.0.0"));
  assert.ok(!nodeFloorOk("22.17.9"));
  assert.ok(!nodeFloorOk("20.19.0"));
});

test("C2 (MIG-7) a stale protected branch (the migration branch forks from a newer pushed branch) fails protected-holds-fork with the fix naming the branch work merges into", () => {
  const dir = scratchTarget({ "package.json": pkg({ scripts: {} }) });
  const origin = scratchOrigin();
  git(dir, "remote", "add", "origin", origin);
  git(dir, "push", "-q", "-u", "origin", "main");
  // The real work lives on a pushed branch main never caught up with.
  git(dir, "switch", "-q", "-c", "feature/workflow");
  writeFiles(dir, {
    "AGENTS.md": "# Agents\n",
    "apps/web/page.tsx": "export {};\n",
  });
  commitAll(dir, "work");
  git(dir, "push", "-q", "-u", "origin", "feature/workflow");
  git(dir, "switch", "-q", "-c", "migrate");
  let r = failedIds(dir);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["protected-holds-fork"],
  );
  assert.match(
    r.failed[0]![1],
    /set the protected branch to the branch work merges into/,
  );
  // Named right, the same repo passes.
  r = failedIds(dir, [], {}, "feature/workflow");
  assert.equal(r.status, 0, r.out);
});

test("C3 (MIG-7) several failures are listed in one run, --json carries them as preconditions with ok false, and --protected missing is itself a failure", () => {
  const dir = scratchTarget({ "package.json": pkg({ scripts: {} }) });
  writeFileSync(path.join(dir, "scratch.txt"), "untracked\n");
  const r = failedIds(dir, [], { PEM_ASSESS_NODE_VERSION: "20.0.0" });
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["clean-tree", "not-on-protected", "protected-pushed", "node-floor"],
  );
  const j = spawnSync(
    process.execPath,
    [
      path.join(REPO, "tooling/migrate-assess.ts"),
      dir,
      "--check",
      "--json",
      "--protected",
      "main",
    ],
    {
      cwd: REPO,
      encoding: "utf8",
      env: { ...process.env, PEM_ASSESS_NODE_VERSION: "20.0.0" },
    },
  );
  assert.equal(j.status, 1);
  const data = JSON.parse(j.stdout);
  const failed = data.preconditions.filter((p: { ok: boolean }) => !p.ok);
  assert.deepEqual(
    failed.map((p: { id: string }) => p.id),
    ["clean-tree", "not-on-protected", "protected-pushed", "node-floor"],
  );
  for (const p of data.preconditions)
    assert.deepEqual(Object.keys(p), ["id", "ok", "fix"]);
  assert.equal(data.signals.length, 17, "the data contract is whole");
  const noProtected = spawnSync(
    process.execPath,
    [path.join(REPO, "tooling/migrate-assess.ts"), dir, "--check"],
    { cwd: REPO, encoding: "utf8" },
  );
  assert.equal(noProtected.status, 1);
  assert.match(
    noProtected.stdout,
    /^FAIL {2}protected-named: .*--protected <branch>/m,
  );
  const misuse = spawnSync(
    process.execPath,
    [path.join(REPO, "tooling/migrate-assess.ts"), dir, "--end"],
    { cwd: REPO, encoding: "utf8" },
  );
  assert.equal(misuse.status, 2);
  assert.match(misuse.stderr, /--end and --protected go with --check/);
});

test("C4 (MIG-7) --check --end passes with commits on the migration branch and a dirty tree, and fails when the protected branch moved past the fork point or a local settings file is tracked", () => {
  const dir = readyRepo();
  writeFiles(dir, {
    "toolkit.json": '{ "tier": "overlay" }\n',
    "AGENTS.md": "# Agents\n",
  });
  commitAll(dir, "migrate step 3");
  writeFiles(dir, {
    "docs/decisions/records/0001-adopt-the-practice.md": "# 0001\n",
  });
  let r = failedIds(dir, ["--end"]);
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(r.failed, []);
  assert.doesNotMatch(r.out, /clean-tree|fork-point-clean|no-toolkit-json/);
  // The protected branch moved during the day.
  git(dir, "stash", "-q", "-u");
  git(dir, "switch", "-q", "main");
  writeFiles(dir, { "README.md": "# Team commit\n" });
  commitAll(dir, "team");
  git(dir, "push", "-q", "origin", "main");
  git(dir, "switch", "-q", "migrate");
  r = failedIds(dir, ["--end"]);
  assert.equal(r.status, 1);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["protected-holds-fork"],
  );
  assert.match(r.failed[0]![1], /moved during the day/);
  // A tracked local settings file fails at the end too.
  const local = readyRepo();
  writeFiles(local, { ".claude/settings.local.json": "{}\n" });
  git(local, "add", "-f", ".claude/settings.local.json");
  commitAll(local, "oops");
  r = failedIds(local, ["--end"]);
  assert.deepEqual(
    r.failed.map(([id]) => id),
    ["local-settings-untracked"],
  );
});

test("C4 (MIG-7) the library form reports every rule with ok and fix, and skips the start-only rules at the end", () => {
  const dir = readyRepo();
  const start = checkPreconditions(openRepo(dir), { protectedBranch: "main" });
  assert.deepEqual(
    start.map((p) => p.id),
    [
      "clean-tree",
      "on-a-branch",
      "protected-named",
      "protected-exists",
      "not-on-protected",
      "protected-pushed",
      "fork-point-clean",
      "protected-holds-fork",
      "no-toolkit-json",
      "local-settings-untracked",
      "node-floor",
    ],
  );
  assert.ok(start.every((p) => p.ok && p.fix === ""));
  const end = checkPreconditions(openRepo(dir), {
    protectedBranch: "main",
    end: true,
  });
  assert.deepEqual(
    end.map((p) => p.id),
    [
      "on-a-branch",
      "protected-named",
      "protected-exists",
      "not-on-protected",
      "protected-pushed",
      "protected-holds-fork",
      "local-settings-untracked",
      "node-floor",
    ],
  );
});
