/**
 * yarn cost and yarn contract:built (WEB-13; audit R4, R9). Scratch repos in
 * $TMPDIR with real git; see tooling/lib/scratch-repo.ts. The transcripts are
 * the synthetic ones in tooling/fixtures/specs/cost-transcripts/, copied into
 * a synthetic Claude config folder. Every repo, record and verdict is synthetic.
 */

import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
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
  // m2 and m3 are two records each and s2 copies m1 to m3: counted once. n1
  // names nothing; s2's copy of m2 named WEB-1, so n1 is WEB-1's. The two
  // synthetic records in s2 are not calls. m1 precedes any work command; n3
  // names OB2-1; the other project is not read.
  const tag = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(
    r.out,
    new RegExp(
      `^${tag("WEB-1 [attributed to the last ticket a work command named in its thread; estimate]: 13 calls [one per message id], ")}`,
      "m",
    ),
  );
  // input 20, write 5,640, read 48,000, output 870: 20 + 7,050 + 4,800 + 4,350.
  for (const part of [
    "16k weighted [in 1, write 1.25, read 0.1, out 5; model-blind estimate, not the meter]",
    "(build 4 3k, proofs 1 351, captures 1 451, reviews 3 10k, status 1 551, git 1 601, re-reading 1 451, other 1 551) [by first tool]",
    "raw 48k read and 870 out [summed once per message id]",
    // n2, the last main-thread call: 2 + 6,000 + 300; the synthetic records after it are skipped.
    "thread context at its last main-thread call 6k [in + read + write]",
    "2 thread(s) naming it",
    "headless at least 0 run(s) 0 [results.json keeps the last run per review; not in the weighted total]",
  ])
    assert.ok(r.out.includes(part), `missing "${part}" in ${r.out}`);
  assert.ok(!r.out.includes(SECRET), "no transcript text in the output");

  const epic = cost(repo, config, ["--epic", "OB2"]);
  assert.equal(epic.status, 0, epic.out);
  // n3 (named as OB2-001), n4, and s3's w2 from the worktree folder.
  assert.match(
    epic.out,
    /^OB2 \[attributed[^\]]*\]: 3 calls \[one per message id\], 2k weighted/m,
  );
  assert.match(epic.out, /^ {2}OB2-1 \[attributed[^\]]*\]: 3 calls/m);
  assert.match(epic.out, /2 thread\(s\) naming it/);
  // m1 in s1 and w1 in s3 come before any work command.
  assert.match(
    epic.out,
    /; 2 call\(s\) in these transcripts belong to no ticket \[before any work command\]$/m,
  );
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
  assert.match(r.out, /headless at least 1 run\(s\) 3k/);
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
    /^Cost, recorded [0-9TZ:-]+: WEB-1 \[attributed to the last ticket a work command named in its thread; estimate\]: 13 calls \[one per message id\], 16k weighted \[in 1, write 1\.25, read 0\.1, out 5; model-blind estimate, not the meter\].*\[by first tool\].*\[results\.json keeps the last run per review; not in the weighted total\]\.$/m,
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

/** Synthetic transcript records: a typed prompt, a title, a call with an optional tool. */
const record = {
  prompt: (session: string, at: string, text: string, sidechain = false) => ({
    type: "user",
    sessionId: session,
    isSidechain: sidechain,
    timestamp: at,
    message: { role: "user", content: text },
  }),
  title: (session: string, text: string) => ({
    type: "custom-title",
    sessionId: session,
    customTitle: text,
  }),
  call: (
    session: string,
    id: string,
    at: string,
    tool?: { name: string; input: Record<string, unknown> },
    sidechain = false,
  ) => ({
    type: "assistant",
    sessionId: session,
    isSidechain: sidechain,
    cwd: "/synthetic/repo",
    timestamp: at,
    message: {
      id,
      model: "synthetic-model",
      usage: {
        input_tokens: 1,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0,
        output_tokens: 1,
      },
      content: tool
        ? [
            {
              type: "tool_use",
              id: `t-${id}`,
              name: tool.name,
              input: tool.input,
            },
          ]
        : [{ type: "text", text: SECRET }],
    },
  }),
};

/** A Claude config folder holding these synthetic files under the repo's project slug. */
function configWith(repo: string, files: Record<string, object[]>): string {
  const config = mkdtempSync(
    path.join(process.env.TMPDIR ?? tmpdir(), "pem-cost-"),
  );
  const slug = realpathSync(repo).replace(/[^a-zA-Z0-9]/g, "-");
  for (const [rel, records] of Object.entries(files)) {
    const file = path.join(config, "projects", slug, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(
      file,
      records.map((r) => JSON.stringify(r)).join("\n") + "\n",
    );
  }
  return config;
}

/** WEB-1 started, and WEB-2 drafted with --draft, so both ids are in the tree. */
function repoWithDraft(): string {
  const repo = startOneOff();
  const draft = path.join(repo, "draft.md");
  writeFileSync(draft, oneOffContract("WEB-2", { planned: ["src/other.ts"] }));
  const r = tool(repo, "contract.ts", [
    "init",
    "web",
    "second",
    "--from",
    draft,
    "--draft",
  ]);
  assert.equal(r.status, 0, r.out);
  return repo;
}

const callsOf = (out: string, id: string) =>
  Number(new RegExp(`^${id} \\[[^\\]]*\\]: (\\d+) calls`, "m").exec(out)?.[1]);

test("WEB-23 C2 yarn cost attributes a thread to the one ticket its first human prompt or, failing that, its title names, from its first call", () => {
  const repo = repoWithDraft();
  const at = (n: number) => `2026-10-07T11:00:${String(n).padStart(2, "0")}Z`;
  const config = configWith(repo, {
    // The prompt names WEB-1: every call is WEB-1's, the first two before any work command.
    "p1.jsonl": [
      record.prompt("p1", at(0), `${SECRET} build WEB-1`),
      record.call("p1", "a1", at(1)),
      record.call("p1", "a2", at(2), {
        name: "Read",
        input: { file_path: "/synthetic/repo/src/filter.ts" },
      }),
      record.call("p1", "a3", at(3), {
        name: "Bash",
        input: { command: "yarn contract:run WEB-1" },
      }),
    ],
    // The prompt names nothing; the title names WEB-1.
    "p2.jsonl": [
      record.prompt("p2", at(10), SECRET),
      record.call("p2", "b1", at(11)),
      record.title("p2", `${SECRET} WEB-1 title`),
      record.call("p2", "b2", at(12)),
    ],
    // The prompt names two tickets: no seed. Its subagent's prompt names WEB-2 and seeds nothing.
    "p3.jsonl": [
      record.prompt("p3", at(20), `${SECRET} WEB-1 then WEB-2`),
      record.call("p3", "c1", at(21)),
    ],
    // A range names several tickets: no seed.
    "p4.jsonl": [
      record.prompt("p4", at(30), `${SECRET} WEB-1 to 2`),
      record.call("p4", "e1", at(31)),
    ],
    "p3/subagents/agent-x.jsonl": [
      record.prompt("p3", at(22), `${SECRET} WEB-2`, true),
      record.call("p3", "x1", at(23), undefined, true),
    ],
  });
  const one = cost(repo, config, ["WEB-1"]);
  assert.equal(one.status, 0, one.out);
  // a1 to a3 and b1, b2; c1, e1 and x1 belong to no ticket.
  assert.equal(callsOf(one.out, "WEB-1"), 5, one.out);
  assert.match(one.out, /2 thread\(s\) naming it/);
  const two = cost(repo, config, ["WEB-2"]);
  assert.equal(callsOf(two.out, "WEB-2"), 0, two.out);
  assert.ok(
    !one.out.includes(SECRET) && !two.out.includes(SECRET),
    "no transcript text in the output",
  );
});

test("WEB-23 C3 a contract:init --draft written in a thread, its spec edit and its commit, do not take the thread's later calls; a work command on it does", () => {
  const repo = repoWithDraft();
  const at = (n: number) => `2026-10-07T12:00:${String(n).padStart(2, "0")}Z`;
  const config = configWith(repo, {
    "d1.jsonl": [
      record.prompt("d1", at(0), `${SECRET} build WEB-1`),
      record.call("d1", "d1", at(1)),
      record.call("d1", "d2", at(2), {
        name: "Bash",
        input: {
          command:
            "yarn contract:init web second --from /synthetic/draft.md --draft 2>&1 | tail -3",
        },
      }),
      record.call("d1", "d3", at(3), {
        name: "Edit",
        input: {
          file_path:
            "/synthetic/repo/specs/web/one-offs/WEB-002-second/contract.md",
        },
      }),
      record.call("d1", "d4", at(4), {
        name: "Bash",
        input: { command: 'git commit -m "WEB-2: draft" -- specs/web' },
      }),
      record.call("d1", "d5", at(5)),
      // A work command on the draft takes it, as before.
      record.call("d1", "d6", at(6), {
        name: "Bash",
        input: { command: "yarn contract:run WEB-2" },
      }),
      record.call("d1", "d7", at(7)),
    ],
  });
  const one = cost(repo, config, ["WEB-1"]);
  assert.equal(one.status, 0, one.out);
  assert.equal(callsOf(one.out, "WEB-1"), 5, one.out);
  const two = cost(repo, config, ["WEB-2"]);
  assert.equal(callsOf(two.out, "WEB-2"), 2, two.out);
});
