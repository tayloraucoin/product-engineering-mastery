/**
 * merged records and the native git hooks (J5; A13.2). Scratch repos in $TMPDIR with real git; see
 * tooling/lib/scratch-repo.ts. Every repo, file and verdict is synthetic.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AS_BUILT,
  buildAndProve,
  checkSpecs,
  commit,
  exec,
  freshRepo,
  git,
  read,
  startOneOff,
  tool,
  useScratchRepo,
  WORK_BRANCH,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

test("a merged as-built is immutable except applied:", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  const rel = "specs/web/one-offs/WEB-001-filter/as-built.md";
  write(repo, rel, AS_BUILT("WEB-1"));
  tool(repo, "status.ts", []);
  commit(repo, "WEB-1: as-built");
  git(repo, "switch", "-q", "main");
  git(
    repo,
    "merge",
    "-q",
    "--no-ff",
    "--no-verify",
    "-m",
    "Merge WEB-1",
    WORK_BRANCH,
  );
  write(
    repo,
    rel,
    AS_BUILT("WEB-1").replace("applied: n/a", "applied: 2026-10-02"),
  );
  let r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
  write(
    repo,
    rel,
    AS_BUILT("WEB-1").replace("Nothing.", "Rewritten after merge."),
  );
  r = checkSpecs(repo);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /merged and immutable except its applied:/);
});

test("A9 commit-msg: an agent branch needs a work-id; another branch does not", () => {
  const repo = freshRepo();
  git(repo, "config", "core.hooksPath", "tooling/git-hooks");
  git(repo, "switch", "-q", "-c", "agent/WEB-9");
  write(repo, "a.txt", "a\n");
  git(repo, "add", "a.txt");
  let r = exec(repo, "git", ["commit", "-q", "-m", "no work id here"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /opens with a work-id/);
  r = exec(repo, "git", ["commit", "-q", "-m", "WEB-9: with a work id"]);
  assert.equal(r.status, 0, r.out);
  git(repo, "switch", "-q", "-c", "taylor-scratch");
  write(repo, "b.txt", "b\n");
  git(repo, "add", "b.txt");
  r = exec(repo, "git", ["commit", "-q", "-m", "no work id here"]);
  assert.equal(r.status, 0, r.out);
});

test("A9 pre-commit: staging a hand-edited results.json is refused", () => {
  const repo = startOneOff();
  git(repo, "config", "core.hooksPath", "tooling/git-hooks");
  commit(repo, "WEB-1: start");
  const rel = "specs/web/one-offs/WEB-001-filter/results.json";
  write(
    repo,
    rel,
    read(repo, rel).replace('"status": "FAIL"', '"status": "PASS"'),
  );
  git(repo, "add", rel);
  const r = exec(repo, "git", ["commit", "-q", "-m", "WEB-1: grade myself"], {
    PEM_SPECS_FIXTURE: "",
  });
  assert.notEqual(r.status, 0);
  assert.match(r.out, /PASS with no run record/);
});
