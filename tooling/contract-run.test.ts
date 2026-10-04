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

const C1_LOG = "specs/web/one-offs/WEB-1-filter/evidence/C1.log";
const RESULTS = "specs/web/one-offs/WEB-1-filter/results.json";

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
  const c2 = read(repo, "specs/web/one-offs/WEB-1-filter/evidence/C2.log");
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

test("C2 a log rewritten by a newer run, not yet recorded, warns as in flight and check-specs exits 0", () => {
  const repo = startOneOff();
  const recorded = runInFlight(repo);
  const head = git(repo, "rev-parse", "HEAD");
  assert.notEqual(head, recorded.head);
  const r = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    new RegExp(
      `warn .*C1's PASS no longer holds: evidence .*C1\\.log is from a newer run \\(.*, ${head.slice(0, 7)}\\) than the one recorded \\(${recorded.at}\\)`,
    ),
  );
  assert.doesNotMatch(r.out, /changed after it was recorded/);
});

test("C3 a log edited after its run fails check-specs as changed after it was recorded, whatever its header claims", () => {
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
    const r = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
    assert.notEqual(r.status, 0, r.out);
    assert.match(
      r.out,
      /C1 is PASS, but evidence .*C1\.log changed after it was recorded/,
    );
  }
});

test("Vigil 3: a PASS recorded at X goes stale when a planned path changes at X+1", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  write(repo, "specs/web/one-offs/WEB-1-filter/as-built.md", AS_BUILT("WEB-1"));
  commit(repo, "WEB-1: as-built");
  write(repo, "src/filter.ts", "export const keep = (n: number) => n >= 1;\n");
  commit(repo, "WEB-1: change after proof");
  const r = checkSpecs(repo);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /src\/filter\.ts changed after it was recorded/);
});
