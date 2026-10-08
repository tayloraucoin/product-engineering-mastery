/**
 * yarn cost and yarn contract:built (WEB-13; audit R4, R9). Scratch repos in
 * $TMPDIR with real git; see tooling/lib/scratch-repo.ts. The transcripts are
 * the synthetic ones in tooling/fixtures/specs/cost-transcripts/, copied into
 * a synthetic Claude config folder. Every repo, record and verdict is synthetic.
 */

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  AS_BUILT,
  buildAndProve,
  checkSpecs,
  commit,
  oneOffContract,
  read,
  startOneOff,
  tool,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/specs/cost-transcripts",
);
const SECRET = "SYNTHETIC-TRANSCRIPT-TEXT";
const RESULTS = "specs/web/one-offs/WEB-001-filter/results.json";

/** A Claude config folder holding the fixture under the repo's project slug, a worktree's, and another project's. */
function configFor(repo: string): string {
  const config = mkdtempSync(
    path.join(process.env.TMPDIR ?? tmpdir(), "pem-cost-"),
  );
  const slug = realpathSync(repo).replace(/[^a-zA-Z0-9]/g, "-");
  cpSync(path.join(FIXTURE, "repo"), path.join(config, "projects", slug), {
    recursive: true,
  });
  cpSync(
    path.join(FIXTURE, "worktree"),
    path.join(config, "projects", `${slug}--claude-worktrees-w1`),
    { recursive: true },
  );
  cpSync(
    path.join(FIXTURE, "other-project"),
    path.join(config, "projects", "-synthetic-other-project"),
    { recursive: true },
  );
  return config;
}

/** Adds epic OB2 with a drafted ticket OB2-1, so --epic has something to sum. */
function addEpic(repo: string) {
  let r = tool(repo, "spec-init.ts", ["web", "OB2", "onboarding"]);
  assert.equal(r.status, 0, r.out);
  const draft = path.join(repo, "draft.md");
  writeFileSync(draft, oneOffContract("OB2-1"));
  r = tool(repo, "contract.ts", [
    "init",
    "OB2",
    "welcome",
    "--from",
    draft,
    "--draft",
  ]);
  assert.equal(r.status, 0, r.out);
}

const cost = (repo: string, config: string, args: string[]) =>
  tool(repo, "cost.ts", args, { CLAUDE_CONFIG_DIR: config });

test("WEB-13 C1 yarn cost counts once per message id, weights, attributes by the last work command, classifies by first tool, and prints no transcript text", () => {
  const repo = startOneOff();
  addEpic(repo);
  const config = configFor(repo);
  const r = cost(repo, config, ["WEB-1"]);
  assert.equal(r.status, 0, r.out);
  // 13 calls: m2 to m10 in s1, the reviewer's r1 and r2, n1 and n2 in s2.
  // m2 and m3 are two records each and s2 copies m1 to m3: counted once.
  // m1 precedes any work command; n3 names OB2-1; the other project is not read.
  assert.match(r.out, /^WEB-1: 13 calls \[one per message id\], /m);
  // input 20, write 5,640, read 48,000, output 870: 20 + 7,050 + 4,800 + 4,350.
  assert.match(
    r.out,
    /16k weighted \[in 1, write 1\.25, read 0\.1, out 5; estimate\]/,
  );
  assert.match(
    r.out,
    /\(build 3 3k, proofs 2 1k, captures 1 451, reviews 3 10k, status 1 551, git 1 601, re-reading 1 451, other 1 551\) \[by first tool\]/,
  );
  // n2, the last main-thread call: 2 + 6,000 + 300.
  assert.match(
    r.out,
    /context at last call 6k \[in \+ read \+ write, main thread\]/,
  );
  assert.match(
    r.out,
    /2 thread\(s\) \[attributed to the last ticket a work command named; estimate\]/,
  );
  assert.match(
    r.out,
    /headless 0 run\(s\) 0 \[results\.json, last run per review\]/,
  );
  assert.ok(!r.out.includes(SECRET), "no transcript text in the output");

  const epic = cost(repo, config, ["--epic", "OB2"]);
  assert.equal(epic.status, 0, epic.out);
  // n3 (named as OB2-001), n4, and s3's w2 from the worktree folder.
  assert.match(epic.out, /^OB2: 3 calls \[one per message id\], 2k weighted/m);
  assert.match(epic.out, /^ {2}OB2-1: 3 calls/m);
  assert.match(epic.out, /2 thread\(s\)/);
  assert.ok(!epic.out.includes(SECRET), "no transcript text in the output");
});

test("WEB-13 C2 yarn cost --record writes a cost block the schema accepts, later writers keep it, and yarn status prints it", () => {
  const repo = startOneOff();
  const config = configFor(repo);
  let r = tool(repo, "contract.ts", [
    "qa",
    "WEB-1",
    "Q3",
    "--reviewers",
    "vigil",
  ]);
  assert.equal(r.status, 0, r.out);
  commit(repo, "WEB-1: Q3");
  buildAndProve(repo);
  write(
    repo,
    "specs/web/one-offs/WEB-001-filter/as-built.md",
    AS_BUILT("WEB-1"),
  );
  commit(repo, "WEB-1: as-built");
  r = tool(repo, "review-run.ts", ["vigil", "WEB-1"], {
    PEM_REVIEW_RUNNER: path.join(repo, "review-runner.ts"),
  });
  assert.equal(r.status, 0, r.out);

  r = cost(repo, config, ["WEB-1", "--record"]);
  assert.equal(r.status, 0, r.out);
  // The synthetic review run: 1,200 + 500 × 1.25 + 3,400 × 0.1 + 260 × 5.
  assert.match(r.out, /headless 1 run\(s\) 3k/);
  let block = JSON.parse(read(repo, RESULTS)).cost;
  assert.equal(block.calls, 13);
  assert.equal(block.weighted, 16220);
  assert.equal(block.tokens_cache_read, 48000);
  assert.equal(block.tokens_output, 870);
  assert.deepEqual(block.by_category.reviews, { calls: 3, weighted: 9805 });
  assert.equal(block.context_last_call, 6302);
  assert.equal(block.threads, 2);
  assert.equal(block.headless_runs, 1);
  assert.equal(block.headless_weighted, 3465);
  assert.ok(!read(repo, RESULTS).includes(SECRET), "no transcript text stored");
  commit(repo, "WEB-1: cost");
  assert.equal(checkSpecs(repo).status, 0, checkSpecs(repo).out);

  // contract:run rewrites results.json through the same serializer: the block stays.
  r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  block = JSON.parse(read(repo, RESULTS)).cost;
  assert.equal(block.weighted, 16220);

  const status = tool(repo, "status.ts", ["WEB-1"]);
  assert.match(
    status.out,
    /^Cost \(recorded [0-9TZ:-]+; one call per message id, weighted 1, 1\.25, 0\.1, 5 \[estimate\]\): 13 calls, 16k weighted/m,
  );
});

test("WEB-13 C3 yarn contract:built marks the ticket built in status, _status.md and the brief line until a criterion is recorded, and contract:run proceeds", () => {
  const repo = startOneOff();
  write(repo, "src/filter.ts", "export const keep = (n: number) => n > 1;\n");
  let r = tool(repo, "contract.ts", ["built", "WEB-1"]);
  assert.notEqual(r.status, 0, "built refuses uncommitted code");
  assert.match(r.out, /commit first/);
  commit(repo, "WEB-1: filter");
  r = tool(repo, "contract.ts", ["built", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /WEB-1 is built at .*awaiting harden/);
  const builtAt = JSON.parse(read(repo, RESULTS)).built_at;
  assert.match(builtAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

  assert.match(
    tool(repo, "status.ts", ["WEB-1"]).out,
    /^WEB-1 filter \(one-off, Q1, built\)/m,
  );
  assert.match(
    tool(repo, "status.ts", ["WEB-1"]).out,
    /code in, criteria unrecorded, awaiting harden/,
  );
  assert.match(
    tool(repo, "status.ts", ["--brief"]).out,
    /WEB-1 filter \(built; left: /,
  );
  tool(repo, "status.ts", []);
  assert.match(
    read(repo, "specs/_status.md"),
    /\| WEB-1 \| one-off \| built \|/,
  );
  commit(repo, "WEB-1: built");
  assert.equal(checkSpecs(repo).status, 0, checkSpecs(repo).out);

  // Hardening: contract:run proceeds as on an open ticket, and the word goes.
  r = tool(repo, "contract.ts", ["run", "WEB-1"]);
  assert.equal(r.status, 0, r.out);
  const results = JSON.parse(read(repo, RESULTS));
  assert.equal(results.built_at, builtAt);
  assert.equal(results.criteria.C1.status, "PASS");
  assert.doesNotMatch(tool(repo, "status.ts", ["--brief"]).out, /\(built;/);
});
