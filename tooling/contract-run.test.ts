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
  assert.doesNotMatch(
    read(repo, "specs/web/one-offs/WEB-1-filter/evidence/C2.log"),
    /changed after it was recorded/,
  );
});

test("C2 a log rewritten by a newer run, not yet recorded, warns as in flight and check-specs exits 0", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  commit(repo, "WEB-1: proven");
  const recorded = JSON.parse(read(repo, RESULTS)).criteria.C1.run;
  // What contract:run leaves between the log's rename and its results.json write.
  write(
    repo,
    C1_LOG,
    withAt(read(repo, C1_LOG), "2999-01-01T00:00:00Z").replace(
      "ok 1",
      "ok 1 (re-run)",
    ),
  );
  const r = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    /warn .*C1's PASS no longer holds: evidence .*C1\.log is from a newer run \(2999-01-01T00:00:00Z/,
  );
  assert.match(r.out, new RegExp(`than the one recorded \\(${recorded.at}\\)`));
  assert.doesNotMatch(r.out, /changed after it was recorded/);
});

test("C3 a log edited after its run fails check-specs as changed after it was recorded, with its header kept or made older", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  commit(repo, "WEB-1: proven");
  const original = read(repo, C1_LOG);
  for (const edited of [
    `${original}\nok 2 - an extra line\n`,
    withAt(original, "2000-01-01T00:00:00Z"),
    original.replace(/^[\s\S]*?\n---\n/, ""),
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
