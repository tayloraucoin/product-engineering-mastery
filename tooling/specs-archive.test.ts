/**
 * Readable specs at scale: padded ticket folders and yarn specs:archive.
 * Scratch repos in $TMPDIR with real git; see tooling/lib/scratch-repo.ts.
 * Every repo, file and verdict is synthetic.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

const ONE_OFFS = "specs/web/one-offs";

/**
 * Closes WEB-1 in a past month: its last result and the commit adding its
 * as-built. An operator_review criterion is handed to the operator, with its
 * evidence in the ticket folder.
 */
function closeWeb1(repo: string, at = "2025-03-14T10:00:00Z") {
  const dir = `${ONE_OFFS}/WEB-001-filter`;
  buildAndProve(repo);
  const operator = /id: C3/.test(read(repo, `${dir}/contract.md`));
  if (operator) {
    write(repo, `${dir}/evidence/C3.md`, "Filter by status (synthetic).\n");
    const r = tool(repo, "contract.ts", [
      "record",
      "WEB-1",
      "C3",
      "--evidence",
      `${dir}/evidence/C3.md`,
      "--verdict",
      "deferred",
    ]);
    assert.equal(r.status, 0, r.out);
  }
  const results = `${dir}/results.json`;
  write(
    repo,
    results,
    read(repo, results).replace(/"updated_at": ".*"/, `"updated_at": "${at}"`),
  );
  write(
    repo,
    `${dir}/as-built.md`,
    AS_BUILT("WEB-1", operator ? "C3: handed to Taylor." : "none"),
  );
  git(repo, "add", "-A");
  execFileSync(
    "git",
    ["commit", "-q", "--no-verify", "-m", "WEB-1: as-built"],
    {
      cwd: repo,
      env: { ...process.env, GIT_COMMITTER_DATE: at, GIT_AUTHOR_DATE: at },
    },
  );
}

test("contract:init pads new ticket folders so they list in number order; the id stays unpadded", () => {
  const repo = freshRepo();
  for (let n = 1; n <= 10; n++) {
    const r = tool(repo, "contract.ts", ["init", "web", `t${n}`]);
    assert.equal(r.status, 0, r.out);
  }
  const listed = readdirSync(path.join(repo, ONE_OFFS)).sort();
  assert.deepEqual(
    listed,
    Array.from(
      { length: 10 },
      (_, i) => `WEB-${String(i + 1).padStart(3, "0")}-t${i + 1}`,
    ),
  );
  assert.match(
    read(repo, `${ONE_OFFS}/WEB-010-t10/contract.md`),
    /^id: WEB-10$/m,
  );
  assert.match(tool(repo, "status.ts", ["WEB-10"]).out, /^WEB-10 t10 /);
});

test("a folder filed before padding still reads, and the next number follows it", () => {
  const repo = freshRepo();
  write(repo, `${ONE_OFFS}/WEB-7-legacy/contract.md`, oneOffContract("WEB-7"));
  const r = tool(repo, "contract.ts", ["init", "web", "next"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(repo, `${ONE_OFFS}/WEB-008-next`)), r.out);
});

test("--dry-run prints what would move and what is held, and moves nothing", () => {
  const repo = startOneOff();
  closeWeb1(repo);
  tool(repo, "contract.ts", ["init", "web", "other"]);
  commit(repo, "WEB-2: drafted");
  const r = tool(repo, "specs-archive.ts", ["--dry-run"]);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    /move {2}WEB-1 one-off: specs\/web\/one-offs\/WEB-001-filter\/ → specs\/web\/_archive\/2025\/03\/WEB-001-filter\//,
  );
  assert.match(r.out, /hold {2}WEB-2 one-off: draft/);
  assert.match(r.out, /Nothing moved/);
  assert.ok(existsSync(path.join(repo, `${ONE_OFFS}/WEB-001-filter`)));
  assert.ok(!existsSync(path.join(repo, "specs/web/_archive")));
});

test("archive never moves open or closing work, or a folder with uncommitted changes", () => {
  const repo = startOneOff();
  let r = tool(repo, "specs-archive.ts", []);
  assert.match(r.out, /hold {2}WEB-1 one-off: open/);
  buildAndProve(repo);
  write(repo, `${ONE_OFFS}/WEB-001-filter/as-built.md`, AS_BUILT("WEB-1"));
  r = tool(repo, "specs-archive.ts", []);
  assert.match(r.out, /hold {2}WEB-1 one-off: uncommitted: .*as-built\.md/);
  commit(repo, "WEB-1: as-built");
  tool(repo, "contract.ts", [
    "add",
    "WEB-1",
    "C3",
    "--evidence",
    "check",
    "--statement",
    "One more check.",
    "--command",
    "yarn check:ok",
  ]);
  commit(repo, "WEB-1: C3 added");
  r = tool(repo, "specs-archive.ts", []);
  assert.match(r.out, /hold {2}WEB-1 one-off: closing/);
  assert.ok(existsSync(path.join(repo, `${ONE_OFFS}/WEB-001-filter`)));
});

test("archive moves a closed one-off by close month; status, check-specs and allocation still see it", () => {
  const repo = startOneOff({ operatorReview: true });
  closeWeb1(repo);
  let r = tool(repo, "specs-archive.ts", []);
  assert.equal(r.status, 0, r.out);
  const archived = "specs/web/_archive/2025/03/WEB-001-filter";
  assert.ok(existsSync(path.join(repo, archived, "as-built.md")), r.out);
  assert.ok(!existsSync(path.join(repo, `${ONE_OFFS}/WEB-001-filter`)));

  // Records are not rewritten: the evidence paths they name follow the folder.
  assert.match(
    read(repo, `${archived}/results.json`),
    /one-offs\/WEB-001-filter\/evidence/,
  );
  r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
  assert.match(
    read(repo, "specs/_status.md"),
    /\| WEB-1 \| C3 \| .* \| `specs\/web\/_archive\/2025\/03\/WEB-001-filter\/evidence\/C3\.md` \|/,
  );
  assert.match(
    tool(repo, "status.ts", ["WEB-1"]).out,
    /\(one-off, Q1, closed, archived 2025\/03\) — specs\/web\/_archive\/2025\/03\/WEB-001-filter\//,
  );
  const status = read(repo, "specs/_status.md");
  assert.match(status, /## Archive[\s\S]*\| 2025\/03 \| WEB-1 \| one-off \|/);
  assert.doesNotMatch(status.split("## Operator checks")[0]!, /WEB-1/);

  commit(repo, "WEB: archive WEB-1");
  r = tool(repo, "contract.ts", ["init", "web", "after"]);
  assert.equal(r.status, 0, r.out);
  assert.ok(existsSync(path.join(repo, `${ONE_OFFS}/WEB-002-after`)), r.out);
});

test("an epic moves only once every ticket is closed and its approved proposals are promoted", () => {
  const repo = freshRepo();
  let r = tool(repo, "spec-init.ts", ["web", "OB2", "onboarding"]);
  assert.equal(r.status, 0, r.out);
  const epic = "specs/web/epics/OB2-onboarding";
  const truth = "specs/web/ux/onboarding/welcome.md";
  write(
    repo,
    truth,
    "---\nstatus: approved\n---\n\n# Welcome (synthetic)\n- OB2-W1: the welcome names the next step.\n",
  );
  write(
    repo,
    `${epic}/ux/onboarding/welcome.md`,
    `---\ntarget: ${truth}\nstatus: approved\npromoted:\n---\n\n# Welcome, v2 (synthetic)\n- OB2-W1: the welcome names the next step and the time it takes.\n`,
  );
  const draft = path.join(repo, "draft.md");
  writeFileSync(draft, oneOffContract("OB2-1", { cites: [truth, "OB2-W1"] }));
  r = tool(repo, "contract.ts", [
    "init",
    "OB2",
    "welcome",
    "--from",
    draft,
    "--draft",
  ]);
  assert.equal(r.status, 0, r.out);
  rmSync(draft);
  commit(repo, "OB2: drafted");
  r = tool(repo, "specs-archive.ts", ["--dry-run"]);
  assert.match(r.out, /hold {2}OB2 epic: OB2-1 draft/);

  const runner = { PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts") };
  r = tool(repo, "review-run.ts", ["vigil", "OB2"], runner);
  assert.equal(r.status, 0, r.out);
  commit(repo, "OB2: pre-flight");
  r = tool(repo, "contract.ts", ["init", "OB2", "welcome"]);
  assert.equal(r.status, 0, r.out);
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  commit(repo, "OB2-1: welcome");
  r = tool(repo, "contract.ts", ["run", "OB2-1"]);
  assert.equal(r.status, 0, r.out);
  write(repo, `${epic}/tickets/OB2-001-welcome/as-built.md`, AS_BUILT("OB2-1"));
  commit(repo, "OB2-1: as-built");

  r = tool(repo, "specs-archive.ts", []);
  assert.match(
    r.out,
    /hold {2}OB2 epic: approved proposals not promoted \(yarn truth:promote OB2\)/,
  );
  r = tool(repo, "truth-promote.ts", ["OB2"]);
  assert.equal(r.status, 0, r.out);
  commit(repo, "OB2: promoted");

  r = tool(repo, "specs-archive.ts", []);
  assert.equal(r.status, 0, r.out);
  const month = new Date().toISOString().slice(0, 7).replace("-", "/");
  const archived = `specs/web/_archive/${month}/OB2-onboarding`;
  assert.match(
    r.out,
    new RegExp(`move {2}OB2 epic, 1 ticket\\(s\\): ${epic}/ → ${archived}/`),
  );
  assert.ok(
    existsSync(
      path.join(repo, `${archived}/tickets/OB2-001-welcome/as-built.md`),
    ),
  );
  r = checkSpecs(repo);
  assert.equal(r.status, 0, r.out);
  commit(repo, "OB2: archived");

  // The prefix stays taken, and the archived epic takes no new tickets.
  r = tool(repo, "spec-init.ts", ["web", "OB2", "again"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /OB2 is already the epic specs\/web\/_archive\//);
  r = tool(repo, "contract.ts", ["init", "OB2", "more"]);
  assert.notEqual(r.status, 0);
  assert.match(
    r.out,
    /OB2 is archived at .*Move it back to specs\/web\/epics\/OB2-onboarding\//,
  );
});
