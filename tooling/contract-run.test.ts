/**
 * contract:run: run records, zero tests, closure, staleness (J5; A13.2). Scratch repos in $TMPDIR with real git; see
 * tooling/lib/scratch-repo.ts. Every repo, file and verdict is synthetic.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  AS_BUILT,
  buildAndProve,
  checkSpecs,
  commit,
  git,
  read,
  startOneOff,
  tool,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

test("contract:run refuses an uncommitted tree, then records run records with HEAD and evidence hashes", () => {
  const repo = startOneOff();
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  let r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /commit first/);
  commit(repo, "WEB-1: filter");
  r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  const results = JSON.parse(
    read(repo, "specs/web/one-offs/WEB-1-filter/results.json"),
  );
  const c1 = results.criteria.C1;
  assert.equal(c1.status, "PASS");
  assert.equal(c1.run.head, git(repo, "rev-parse", "HEAD"));
  assert.equal(c1.run.tests, 1);
  assert.match(c1.run.evidence_sha256, /^[0-9a-f]{64}$/);
});

test("contract:run FAILs a test criterion whose runner matched zero tests", () => {
  const repo = startOneOff({
    criteria: [
      "  - id: C1",
      "    statement: Nothing is tested.",
      "    evidence: test",
      "    command: yarn test:none",
    ].join("\n"),
  });
  commit(repo, "WEB-1: nothing");
  const r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /zero tests/);
  assert.equal(
    JSON.parse(read(repo, "specs/web/one-offs/WEB-1-filter/results.json"))
      .criteria.C1.status,
    "FAIL",
  );
});

test("Vigil 10, one-off: init, run, as-built, status and check-specs close with nothing left", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  write(repo, "specs/web/one-offs/WEB-1-filter/as-built.md", AS_BUILT("WEB-1"));
  tool(repo, "status.ts", []);
  commit(repo, "WEB-1: as-built");
  const status = tool(repo, "status.ts", ["WEB-1"]);
  assert.match(status.out, /Left to go: none/);
  const r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
});

test("Vigil 3: an open ticket's PASS recorded at X goes stale when a planned path changes at X+1", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  write(repo, "src/filter.ts", "export const keep = (n: number) => n >= 1;\n");
  commit(repo, "WEB-1: change after proof");
  const status = tool(repo, "status.ts", ["WEB-1"]);
  assert.match(status.out, /src\/filter\.ts changed after it was recorded/);
});

test("PR-16: a closed ticket's proofs are frozen; a later change to its paths does not reopen it", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  write(repo, "specs/web/one-offs/WEB-1-filter/as-built.md", AS_BUILT("WEB-1"));
  tool(repo, "status.ts", []);
  commit(repo, "WEB-1: as-built");
  write(repo, "src/filter.ts", "export const keep = (n: number) => n >= 1;\n");
  commit(repo, "WEB-2: a later ticket edits a shared file");
  const r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
  assert.match(tool(repo, "status.ts", ["WEB-1"]).out, /Left to go: none/);
});

test("PR-16: operator_review adds a manual criterion; deferring it lists an operator check and still closes the ticket", () => {
  const repo = startOneOff({ operatorReview: true });
  const dir = "specs/web/one-offs/WEB-1-filter";
  assert.match(
    read(repo, `${dir}/contract.md`),
    /id: C3\n\s+statement: Taylor has looked this ticket over/,
  );
  buildAndProve(repo);
  let r = tool(repo, "contract.ts", [
    "record",
    "WEB-1",
    "C1",
    "--evidence",
    `${dir}/evidence/C1.log`,
    "--verdict",
    "deferred",
  ]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /C1 is test evidence/);
  write(
    repo,
    `${dir}/evidence/C3.md`,
    "Open the list and filter by status (synthetic).\n",
  );
  r = tool(repo, "contract.ts", [
    "record",
    "WEB-1",
    "C3",
    "--evidence",
    `${dir}/evidence/C3.md`,
    "--verdict",
    "deferred",
  ]);
  assert.equal(r.status, 0, r.out);
  write(repo, `${dir}/as-built.md`, AS_BUILT("WEB-1", "C3: handed to Taylor."));
  tool(repo, "status.ts", []);
  commit(repo, "WEB-1: as-built");
  assert.match(
    read(repo, "specs/_status.md"),
    /\| WEB-1 \| C3 \| Taylor has looked/,
  );
  assert.match(
    read(repo, "specs/_status.md"),
    /\| WEB-1 \| one-off \| closed \|/,
  );
  const status = tool(repo, "status.ts", ["WEB-1"]);
  assert.match(status.out, /Left to go: none/);
  assert.match(status.out, /Operator checks \(not holding the ticket\): C3/);
  assert.equal(checkSpecs(repo).status, 0);
});
