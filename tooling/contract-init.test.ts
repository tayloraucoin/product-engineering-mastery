/**
 * contract:init: the operator's branch, the A6 gates (J5; A13.2; PR-14). Scratch repos in $TMPDIR with real git; see
 * tooling/lib/scratch-repo.ts. Every repo, file and verdict is synthetic.
 */

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  AS_BUILT,
  buildAndProve,
  checkSpecs,
  commit,
  freshRepo,
  git,
  oneOffContract,
  read,
  startOneOff,
  tool,
  useScratchRepo,
  WORK_BRANCH,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

test("A4 contract:init allocates sequential ids, from the template, then starts with every criterion FAIL", () => {
  const repo = freshRepo();
  for (const [slug, id] of [
    ["first", "WEB-001"],
    ["second", "WEB-002"],
  ]) {
    const r = tool(repo, "contract.ts", ["init", "WEB", slug!]);
    assert.equal(r.status, 0, r.out);
    assert.ok(
      existsSync(
        path.join(repo, `specs/web/one-offs/${id}-${slug}/contract.md`),
      ),
      r.out,
    );
  }
  const initialised = read(
    repo,
    "specs/web/one-offs/WEB-001-first/contract.md",
  );
  assert.match(initialised, /^## Build notes$/m);
  assert.match(initialised, /\*\*Approach:\*\*/);
  write(
    repo,
    "specs/web/one-offs/WEB-002-second/contract.md",
    oneOffContract("WEB-2"),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "second"]);
  assert.equal(r.status, 0, r.out);
  const results = JSON.parse(
    read(repo, "specs/web/one-offs/WEB-002-second/results.json"),
  );
  assert.deepEqual(
    Object.values(results.criteria).map((c: any) => c.status),
    ["FAIL", "FAIL"],
  );
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), WORK_BRANCH);
});

test("the protected branch refuses a start; the operator picks the work branch", () => {
  const repo = freshRepo();
  git(repo, "switch", "-q", "main");
  tool(repo, "contract.ts", ["init", "web", "first"]);
  write(
    repo,
    "specs/web/one-offs/WEB-001-first/contract.md",
    oneOffContract("WEB-1"),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "first"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /this is main, where agents do not commit/);
});

test("parallel tickets: a second item starts on the same branch while the first is open", () => {
  const repo = startOneOff();
  tool(repo, "contract.ts", ["init", "web", "other"]);
  write(
    repo,
    "specs/web/one-offs/WEB-002-other/contract.md",
    oneOffContract("WEB-2", { planned: ["src/other.ts"] }),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "other"]);
  assert.equal(r.status, 0, r.out);
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), WORK_BRANCH);
  const brief = tool(repo, "status.ts", ["--brief"]);
  assert.match(brief.out, /Active: WEB-1 filter \(open[^)]*\); WEB-2 other/);
});

test("parallel tickets: another ticket's uncommitted file does not block a run, its own does", () => {
  const repo = startOneOff();
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  commit(repo, "WEB-1: filter");
  write(repo, "src/other.ts", "export const half = 1;\n");
  let r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 2;\n");
  r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /commit first: src\/filter\.ts/);
});

test("parallel tickets: another ticket's commit leaves this ticket's proof fresh", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  write(repo, "src/other.ts", "export const other = 2;\n");
  commit(repo, "WEB-2: other");
  const status = tool(repo, "status.ts", ["WEB-1"]);
  assert.match(status.out, /Left to go: none/);
});

test("stacking: a dependent ticket starts on the same branch once its predecessor is built, before any as-built or review", () => {
  const repo = startOneOff();
  buildAndProve(repo);
  tool(repo, "contract.ts", ["init", "web", "other"]);
  write(
    repo,
    "specs/web/one-offs/WEB-002-other/contract.md",
    oneOffContract("WEB-2", { depends: ["WEB-1"], planned: ["src/other.ts"] }),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "other"]);
  assert.equal(r.status, 0, r.out);
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), WORK_BRANCH);
});

test("a dependency that has not started refuses the start", () => {
  const repo = freshRepo();
  tool(repo, "contract.ts", ["init", "web", "first"]);
  tool(repo, "contract.ts", ["init", "web", "second"]);
  write(
    repo,
    "specs/web/one-offs/WEB-002-second/contract.md",
    oneOffContract("WEB-2", { depends: ["WEB-1"] }),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "second"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /depends on WEB-1, which has not started on this branch/);
});

test("WEB-23 C1: a predecessor with built_at and no recorded criteria lets the dependent start; one with neither built_at nor its criteria PASS still refuses", () => {
  const repo = startOneOff();
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  commit(repo, "WEB-1: filter");
  tool(repo, "contract.ts", ["init", "web", "other"]);
  write(
    repo,
    "specs/web/one-offs/WEB-002-other/contract.md",
    oneOffContract("WEB-2", { depends: ["WEB-1"], planned: ["src/other.ts"] }),
  );
  // Started, criteria at FAIL, no built_at: refused, as before.
  let r = tool(repo, "contract.ts", ["init", "web", "other"]);
  assert.notEqual(r.status, 0, r.out);
  assert.match(
    r.out,
    /depends on WEB-1, which is not built yet: no built_at, and C1, C2 not PASS/,
  );
  assert.ok(
    !existsSync(
      path.join(repo, "specs/web/one-offs/WEB-002-other/results.json"),
    ),
    "a refused start writes no results",
  );
  // The build pass records built_at and nothing else: the dependent starts.
  r = tool(repo, "contract.ts", ["built", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  const before = JSON.parse(
    read(repo, "specs/web/one-offs/WEB-001-filter/results.json"),
  );
  assert.ok(
    Object.values(before.criteria).every((c: any) => c.status === "FAIL"),
    "no criterion was recorded",
  );
  r = tool(repo, "contract.ts", ["init", "web", "other"]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /WEB-2 started/);
});

test("A6: a cited file not approved, or holding a BLOCKING marker, is refused; a plain open marker is listed", () => {
  const cases: [string, RegExp, number][] = [
    [
      "---\nstatus: draft\n---\n\n# Records (synthetic)\n- REC-1: rows.\n",
      /status: draft/,
      1,
    ],
    [
      "---\nstatus: approved\n---\n\n# Records (synthetic)\n- REC-1: rows. [NEEDS DECISION — BLOCKING] the sort.\n",
      /BLOCKING/,
      1,
    ],
    [
      "---\nstatus: approved\n---\n\n# Records (synthetic)\n- REC-1: rows. [NEEDS DECISION] the sort.\n",
      /Open decisions \(not blocking\)/,
      0,
    ],
  ];
  for (const [surface, expected, status] of cases) {
    const repo = freshRepo();
    write(repo, "specs/web/ux/records/table.md", surface);
    commit(repo, "PEM: surface");
    tool(repo, "contract.ts", ["init", "web", "filter"]);
    write(
      repo,
      "specs/web/one-offs/WEB-001-filter/contract.md",
      oneOffContract("WEB-1", {
        cites: ["specs/web/ux/records/table.md", "REC-1"],
      }),
    );
    const r = tool(repo, "contract.ts", ["init", "web", "filter"]);
    assert.equal(r.status === 0 ? 0 : 1, status, r.out);
    assert.match(r.out, expected);
  }
});

test("PR-19 levels: a ticket starts at Q1 with no review criterion; contract:qa Q3 adds the reviewers named, and a lower level drops them", () => {
  const repo = startOneOff({ truth: ["specs/web/ux/records/table.md"] });
  const rel = "specs/web/one-offs/WEB-001-filter/contract.md";
  assert.match(read(repo, rel), /^qa: Q1$/m);
  assert.doesNotMatch(read(repo, rel), /id: review:/);
  let r = tool(repo, "contract.ts", [
    "qa",
    "WEB-1",
    "Q3",
    "--reviewers",
    "vigil",
  ]);
  assert.equal(r.status, 0, r.out);
  assert.match(read(repo, rel), /^qa: Q3$/m);
  assert.match(read(repo, rel), /id: review:vigil/);
  r = tool(repo, "contract.ts", ["qa", "WEB-1", "Q2"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    /Q2; reviewers vigil \(in the thread\); dropped review:vigil/,
  );
  assert.doesNotMatch(read(repo, rel), /id: review:/);
  buildAndProve(repo);
  const status = tool(repo, "status.ts", ["WEB-1"]);
  assert.match(status.out, /Left to go: none/);
  assert.match(status.out, /Reviewers: vigil \(in the thread\)/);
});

test("PR-19: a critical path below Q3 is flagged once at the start, never refused, and never assigns a reviewer", () => {
  const repo = freshRepo();
  tool(repo, "contract.ts", ["init", "web", "charge"]);
  const rel = "specs/web/one-offs/WEB-001-charge/contract.md";
  write(
    repo,
    rel,
    oneOffContract("WEB-1", { planned: ["src/billing/charge.ts"] }),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "charge"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    /src\/billing\/charge\.ts is a critical path and this ticket is Q1, below Q3/,
  );
  assert.match(read(repo, rel), /^reviewers: \[\]$/m);
  assert.doesNotMatch(read(repo, rel), /id: review:/);
  assert.equal(checkSpecs(repo).status, 0);
});

test("PR-15: check-specs warns on a ticket still closing, and fails it only with --strict", () => {
  const repo = startOneOff();
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  write(
    repo,
    "specs/web/one-offs/WEB-001-filter/as-built.md",
    AS_BUILT("WEB-1"),
  );
  tool(repo, "status.ts", []);
  commit(repo, "WEB-1: as-built before proof");
  const loose = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
  assert.equal(loose.status, 0, loose.out);
  assert.match(loose.out, /warn .*WEB-1 has an as-built/);
  assert.notEqual(checkSpecs(repo).status, 0);
});

test("O3: yarn verify is never a criterion; contract:init and contract:add refuse it and name the specific check", () => {
  const repo = freshRepo();
  tool(repo, "contract.ts", ["init", "web", "chain"]);
  const rel = "specs/web/one-offs/WEB-001-chain/contract.md";
  write(
    repo,
    rel,
    oneOffContract("WEB-1", {
      criteria: [
        "  - id: C1",
        "    statement: The filter keeps matching rows.",
        "    evidence: test",
        "    command: yarn test:sample",
        "  - id: C2",
        "    statement: The whole chain passes.",
        "    evidence: check",
        "    command: yarn verify",
      ].join("\n"),
    }),
  );
  let r = tool(repo, "contract.ts", ["init", "web", "chain"]);
  assert.notEqual(r.status, 0);
  assert.match(
    r.out,
    /WEB-1 cannot start: C2 runs yarn verify, which is never a criterion: the batch close proves the whole chain once\. Name the specific check/,
  );
  assert.ok(
    !existsSync(
      path.join(repo, "specs/web/one-offs/WEB-001-chain/results.json"),
    ),
    r.out,
  );

  write(repo, rel, oneOffContract("WEB-1"));
  r = tool(repo, "contract.ts", ["init", "web", "chain"]);
  assert.equal(r.status, 0, r.out);
  r = tool(repo, "contract.ts", [
    "add",
    "WEB-1",
    "C3",
    "--evidence",
    "check",
    "--statement",
    "The whole chain passes.",
    "--command",
    "yarn verify",
  ]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /C3 runs yarn verify, which is never a criterion/);
  assert.doesNotMatch(read(repo, rel), /id: C3/);
});

test("C6: Q2 is one reviewer; init refuses a second seat, check-specs warns on the draft and names it, and a focus line naming the seat allows it", () => {
  const repo = freshRepo();
  tool(repo, "contract.ts", ["init", "web", "filter"]);
  const rel = "specs/web/one-offs/WEB-001-filter/contract.md";
  write(
    repo,
    rel,
    oneOffContract("WEB-1", { qa: "Q2", reviewers: ["mason", "warden"] }),
  );
  let r = tool(repo, "contract.ts", ["init", "web", "filter"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /WEB-1 cannot start:/);
  assert.match(r.out, /names 2 reviewers at Q2 \(mason, warden\)/);
  assert.match(r.out, /docs\/workflows\/qa-levels\.md/);
  assert.ok(
    !existsSync(
      path.join(repo, "specs/web/one-offs/WEB-001-filter/results.json"),
    ),
    "a refused start writes no results",
  );
  // The draft is the operator's to settle at the gate: a warning that names it, never a failure.
  tool(repo, "status.ts", []);
  const loose = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
  assert.equal(loose.status, 0, loose.out);
  assert.match(
    loose.out,
    /warn {2}specs\/web\/one-offs\/WEB-001-filter\/contract\.md names 2 reviewers at Q2 \(mason, warden\)/,
  );
  assert.equal(checkSpecs(repo).status, 0);
  // A focus line that names only the seat already counted is not enough.
  write(
    repo,
    rel,
    oneOffContract("WEB-1", {
      qa: "Q2",
      reviewers: ["mason", "warden"],
      focus: ["the filter's empty state: its action stays reachable"],
    }),
  );
  r = tool(repo, "contract.ts", ["init", "web", "filter"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /names 2 reviewers at Q2/);
  // A focus line that names what the second reviewer examines allows the start.
  write(
    repo,
    rel,
    oneOffContract("WEB-1", {
      qa: "Q2",
      reviewers: ["mason", "warden"],
      focus: ["the gate cookie: httpOnly and scoped to the gate path (warden)"],
    }),
  );
  r = tool(repo, "contract.ts", ["init", "web", "filter"]);
  assert.equal(r.status, 0, r.out);
  assert.match(read(repo, rel), /^qa: Q2$/m);
  assert.doesNotMatch(read(repo, rel), /id: review:/);
  const after = tool(repo, "check-specs.ts", ["--skip-fixtures"]);
  assert.equal(after.status, 0, after.out);
  assert.doesNotMatch(after.out, /reviewers at Q2/);
});

test("C6: contract:qa refuses a second Q2 reviewer no focus line names, takes one a focus line names, and leaves Q3 alone", () => {
  const repo = startOneOff({
    focus: ["the gate cookie: httpOnly and scoped to the gate path (warden)"],
  });
  const rel = "specs/web/one-offs/WEB-001-filter/contract.md";
  let r = tool(repo, "contract.ts", [
    "qa",
    "WEB-1",
    "Q2",
    "--reviewers",
    "mason,vigil",
  ]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /WEB-1 names 2 reviewers at Q2 \(mason, vigil\)/);
  assert.match(r.out, /docs\/workflows\/qa-levels\.md/);
  assert.match(read(repo, rel), /^qa: Q1$/m);
  assert.match(read(repo, rel), /^reviewers: \[\]$/m);
  r = tool(repo, "contract.ts", [
    "qa",
    "WEB-1",
    "Q2",
    "--reviewers",
    "mason,warden",
  ]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /WEB-1 is Q2; reviewers mason, warden \(in the thread\)/);
  r = tool(repo, "contract.ts", [
    "qa",
    "WEB-1",
    "Q3",
    "--reviewers",
    "mason,vigil,warden",
  ]);
  assert.equal(r.status, 0, r.out);
  assert.match(read(repo, rel), /id: review:vigil/);
  // Back down to Q2 with the Q3 list: refused, the contract untouched.
  r = tool(repo, "contract.ts", ["qa", "WEB-1", "Q2"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /names 3 reviewers at Q2 \(mason, vigil, warden\)/);
  assert.match(read(repo, rel), /^qa: Q3$/m);
});
