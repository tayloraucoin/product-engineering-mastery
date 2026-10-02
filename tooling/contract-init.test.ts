/**
 * contract:init: one active item, the A6 gates (J5; A13.2). Scratch repos in $TMPDIR with real git; see
 * tooling/lib/scratch-repo.ts. Every repo, file and verdict is synthetic.
 */

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
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

test("A4 contract:init allocates sequential ids, from the template, then starts with every criterion FAIL", () => {
  const repo = freshRepo();
  for (const [slug, id] of [
    ["first", "WEB-1"],
    ["second", "WEB-2"],
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
  write(
    repo,
    "specs/web/one-offs/WEB-2-second/contract.md",
    oneOffContract("WEB-2"),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "second"]);
  assert.equal(r.status, 0, r.out);
  const results = JSON.parse(
    read(repo, "specs/web/one-offs/WEB-2-second/results.json"),
  );
  assert.deepEqual(
    Object.values(results.criteria).map((c: any) => c.status),
    ["FAIL", "FAIL"],
  );
  assert.equal(git(repo, "rev-parse", "--abbrev-ref", "HEAD"), "agent/WEB-2");
});

test("one active item per branch: a second start on agent/WEB-1 is refused", () => {
  const repo = startOneOff();
  tool(repo, "contract.ts", ["init", "web", "other"]);
  write(
    repo,
    "specs/web/one-offs/WEB-2-other/contract.md",
    oneOffContract("WEB-2"),
  );
  const r = tool(repo, "contract.ts", ["init", "web", "other"]);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /holds WEB-1, still open/);
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
      "specs/web/one-offs/WEB-1-filter/contract.md",
      oneOffContract("WEB-1", {
        cites: ["specs/web/ux/records/table.md", "REC-1"],
      }),
    );
    const r = tool(repo, "contract.ts", ["init", "web", "filter"]);
    assert.equal(r.status === 0 ? 0 : 1, status, r.out);
    assert.match(r.out, expected);
  }
});
