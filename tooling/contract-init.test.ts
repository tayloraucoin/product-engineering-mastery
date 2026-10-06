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
