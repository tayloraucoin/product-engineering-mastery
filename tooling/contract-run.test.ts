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
    read(repo, "specs/web/one-offs/WEB-001-filter/results.json"),
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
    JSON.parse(read(repo, "specs/web/one-offs/WEB-001-filter/results.json"))
      .criteria.C1.status,
    "FAIL",
  );
});

test("Vigil 10, one-off: init, run, as-built, status and check-specs close with nothing left", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  write(
    repo,
    "specs/web/one-offs/WEB-001-filter/as-built.md",
    AS_BUILT("WEB-1"),
  );
  tool(repo, "status.ts", []);
  commit(repo, "WEB-1: as-built");
  const status = tool(repo, "status.ts", ["WEB-1"]);
  assert.match(status.out, /Left to go: none/);
  const r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
});

const C1_LOG = "specs/web/one-offs/WEB-001-filter/evidence/C1.log";
const RESULTS = "specs/web/one-offs/WEB-001-filter/results.json";

/** The log's text with its `at:` line replaced, as another run would write it. */
const withAt = (log: string, at: string) =>
  log.replace(/^at: .*$/m, `at: ${at}`);

test("C1 a criterion that runs check-specs passes on a second full run, after an earlier criterion's log is rewritten", () => {
  const repo = startOneOff({
    criteria: [
      "  - id: C1",
      "    statement: The filter keeps matching rows.",
      "    evidence: test",
      "    command: yarn test:sample",
      "  - id: C2",
      "    statement: The specs tree checks clean.",
      "    evidence: check",
      "    command: yarn check:specs",
    ].join("\n"),
  });
  buildAndProve(repo);
  // The second run rewrites C1's log before C2 runs check-specs: C1's result
  // must already be recorded by then.
  const r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  assert.equal(JSON.parse(read(repo, RESULTS)).criteria.C2.status, "PASS");
  // C2's check-specs saw C1 recorded: neither tampered nor in flight.
  const c2 = read(repo, "specs/web/one-offs/WEB-001-filter/evidence/C2.log");
  assert.doesNotMatch(c2, /changed after it was recorded/);
  assert.doesNotMatch(c2, /C1's PASS no longer holds|newer run/);
});

/** WEB-1 proven, its results committed, then C1 re-run with the new results.json held back: a run in flight. */
function runInFlight(repo: string) {
  buildAndProve(repo);
  commit(repo, "WEB-1: proven");
  const held = read(repo, RESULTS);
  const r = tool(repo, "contract.ts", ["run", "WEB-1", "C1"]);
  assert.equal(r.status, 0, r.out);
  write(repo, RESULTS, held);
  return JSON.parse(held).criteria.C1.run as { at: string; head: string };
}

test("C2 a log rewritten by a newer run, not yet recorded, is silent below --strict and warns as in flight under it (C7)", () => {
  const repo = startOneOff();
  const recorded = runInFlight(repo);
  const head = git(repo, "rev-parse", "HEAD");
  assert.notEqual(head, recorded.head);
  // Below --strict a rewritten log is not read: nothing to re-prove here.
  const lenient = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
  assert.equal(lenient.status, 0, lenient.out);
  assert.doesNotMatch(lenient.out, /C1/);
  assert.match(
    tool(repo, "status.ts", ["--brief"]).out,
    /WEB-1 filter \(proven; nothing left\)/,
  );
  const r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    new RegExp(
      `warn .*C1's PASS no longer holds: evidence .*C1\\.log is from a newer run \\(.*, ${head.slice(0, 7)}\\) than the one recorded \\(${recorded.at}\\)`,
    ),
  );
  assert.doesNotMatch(r.out, /changed after it was recorded/);
});

test("C3 a log edited after its run fails check-specs --strict as changed after it was recorded, whatever its header claims, and is silent below it (C7)", () => {
  const repo = startOneOff();
  const recorded = runInFlight(repo);
  const head = git(repo, "rev-parse", "HEAD");
  const inFlight = read(repo, C1_LOG);
  const withHead = (log: string, h: string) =>
    log.replace(/^head: .*$/m, `head: ${h}`);
  // The recorded run's own header, as it was before the re-run.
  const asRecorded = withHead(withAt(inFlight, recorded.at), recorded.head);
  for (const edited of [
    `${asRecorded}\nok 2 - an extra line\n`,
    withAt(asRecorded, "2000-01-01T00:00:00Z"),
    asRecorded.replace(/^[\s\S]*?\n---\n/, ""),
    withAt(inFlight, "2999-01-01T00:00:00Z"),
    withHead(asRecorded, "f".repeat(40)),
    withHead(asRecorded, head).replace(/^command: .*$/m, "command: yarn x"),
  ]) {
    write(repo, C1_LOG, edited);
    const lenient = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
    assert.equal(lenient.status, 0, lenient.out);
    assert.doesNotMatch(lenient.out, /C1/);
    const r = checkSpecs(repo);
    assert.notEqual(r.status, 0, r.out);
    assert.match(
      r.out,
      /C1 is PASS, but evidence .*C1\.log changed after it was recorded/,
    );
  }
});

test("PR-19: only a Q3 ticket's PASS goes stale when a planned path changes after it was recorded", () => {
  const change = (repo: string) => {
    buildAndProve(repo);
    write(
      repo,
      "src/filter.ts",
      "export const keep = (n: number) => n >= 1;\n",
    );
    commit(repo, "WEB-1: change after proof");
    return tool(repo, "status.ts", ["WEB-1"]).out;
  };
  assert.match(change(startOneOff()), /Left to go: none/);
  assert.match(
    change(startOneOff({ qa: "Q3" })),
    /src\/filter\.ts changed after it was recorded/,
  );
});

test("PR-19: criteria that share a command share one run", () => {
  const repo = startOneOff({
    criteria: [
      "  - id: C1",
      "    statement: The filter keeps matching rows.",
      "    evidence: test",
      "    command: yarn test:sample",
      "  - id: C2",
      "    statement: The filter drops the rest.",
      "    evidence: test",
      "    command: yarn test:sample",
    ].join("\n"),
  });
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  commit(repo, "WEB-1: filter");
  const r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /PASS C1 test {2}yarn test:sample {2}\(\d/);
  assert.match(r.out, /PASS C2 test {2}yarn test:sample {2}\(shared run/);
  const results = JSON.parse(read(repo, RESULTS)).criteria;
  assert.equal(results.C1.run.at, results.C2.run.at);
});

test("PR-16: a closed ticket's proofs are frozen; a later change to its paths does not reopen it", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  write(
    repo,
    "specs/web/one-offs/WEB-001-filter/as-built.md",
    AS_BUILT("WEB-1"),
  );
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
  const dir = "specs/web/one-offs/WEB-001-filter";
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

test("WEB-13 built_at survives contract:qa and contract:record, and a record after it ends the built stage", () => {
  const repo = startOneOff({
    criteria: [
      "  - id: C1",
      "    statement: The filter keeps matching rows.",
      "    evidence: test",
      "    command: yarn test:sample",
      "  - id: C3",
      "    statement: The filter reads well.",
      "    evidence: manual",
      "    reason: a judgment of wording",
    ].join("\n"),
  });
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  commit(repo, "WEB-1: filter");
  let r = tool(repo, "contract.ts", ["built", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  const builtAt = JSON.parse(read(repo, RESULTS)).built_at;
  r = tool(repo, "contract.ts", ["qa", "WEB-1", "Q2", "--reviewers", "vigil"]);
  assert.equal(r.status, 0, r.out);
  assert.equal(JSON.parse(read(repo, RESULTS)).built_at, builtAt);
  assert.match(tool(repo, "status.ts", ["WEB-1"]).out, /, built\)/);
  write(
    repo,
    "specs/web/one-offs/WEB-001-filter/evidence/C3.md",
    "Read well (synthetic).\n",
  );
  commit(repo, "WEB-1: evidence");
  r = tool(repo, "contract.ts", [
    "record",
    "WEB-1",
    "C3",
    "--evidence",
    "specs/web/one-offs/WEB-001-filter/evidence/C3.md",
  ]);
  assert.equal(r.status, 0, r.out);
  assert.equal(JSON.parse(read(repo, RESULTS)).built_at, builtAt);
  assert.match(tool(repo, "status.ts", ["WEB-1"]).out, /, open\)/);
});
