/**
 * critic-verdict (DEMO-16 C1): the gate exits zero only when every review
 * passes, and non-zero for each way a set can fail, an empty one included.
 * Each case writes a synthetic captures folder under $TMPDIR and runs the
 * script as CI does.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { judgeReview, readPin } from "./critic-verdict.ts";
import { REPO_ROOT } from "./lib/docs.ts";

const SCRIPT = path.join(import.meta.dirname, "critic-verdict.ts");
const scratch = mkdtempSync(path.join(tmpdir(), "critic-verdict-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const LINES = [
  ...Array.from(
    { length: 15 },
    (_, i) => `C-R${String(i + 1).padStart(2, "0")} PASS — fine`,
  ),
  "P-A01 PASS — same words at every width",
  "Code lint: UNVERIFIED (tk-ui-code-lint not installed)",
];

/** A review in the skill's shape; each part can be swapped for a failing one. */
function review(
  over: {
    coverage?: string;
    lines?: string[];
    findings?: string[];
    verdict?: string;
  } = {},
) {
  return [
    "# Review — sample, round 1",
    "Model: claude-opus-5-5",
    "Read: docs/design/canon-rubric.md",
    over.coverage ?? "Coverage: 12/12 files read; missing: none",
    "",
    "Top 3",
    "1. a",
    "2. b",
    "3. c",
    "",
    "Lines",
    ...(over.lines ?? LINES),
    "",
    "Findings",
    ...(over.findings ?? [
      "- [Should-fix] C-R07 · ready 390 light · header · two radii",
    ]),
    "",
    "Not covered: hover",
    over.verdict ?? "Verdict: PASS",
    "",
  ].join("\n");
}

let n = 0;
/** A captures folder: surface → review files (round name → text); each gets a PNG. */
function captures(set: Record<string, Record<string, string>>): string {
  const dir = path.join(scratch, `set-${n++}`);
  mkdirSync(dir);
  for (const [surface, files] of Object.entries(set)) {
    mkdirSync(path.join(dir, surface));
    writeFileSync(path.join(dir, surface, "ready-390.png"), "");
    for (const [name, text] of Object.entries(files))
      writeFileSync(path.join(dir, surface, name), text);
  }
  return dir;
}

function run(...args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
  });
  return { status: r.status, out: r.stdout + r.stderr };
}

test("C1: every review PASS, no Blocking, no UNVERIFIED key → exit 0", () => {
  const dir = captures({
    a: { "review-round-1.md": review() },
    b: { "review-round-1.md": review() },
  });
  const r = run(dir, "--surfaces", "a,b");
  assert.equal(r.status, 0, r.out);
});

test("C1: the latest round decides, not an earlier FAIL", () => {
  const dir = captures({
    a: {
      "review-round-1.md": review({ verdict: "Verdict: FAIL" }),
      "review-round-2.md": review(),
    },
  });
  assert.equal(run(dir).status, 0);
});

const FAILING: [string, Record<string, Record<string, string>>, RegExp][] = [
  [
    "a FAIL verdict",
    { a: { "review-round-1.md": review({ verdict: "Verdict: FAIL" }) } },
    /Verdict: FAIL/,
  ],
  [
    "a Blocking finding under a PASS verdict",
    {
      a: {
        "review-round-1.md": review({
          findings: ["- [Blocking] C-R10 · ready 390 dark · email · no label"],
        }),
      },
    },
    /\[Blocking\] C-R10/,
  ],
  [
    "an UNVERIFIED rubric line under a PASS verdict",
    {
      a: {
        "review-round-1.md": review({
          lines: [
            ...LINES.slice(0, 3),
            "C-R04 UNVERIFIED — loading 834 dark missing",
            ...LINES.slice(4),
          ],
        }),
      },
    },
    /C-R04 UNVERIFIED/,
  ],
  [
    "a missing capture on the Coverage line",
    {
      a: {
        "review-round-1.md": review({
          coverage: "Coverage: 11/12 files read; missing: loading-834-dark.png",
        }),
      },
    },
    /missing: loading-834-dark\.png/,
  ],
  [
    "no Coverage line",
    { a: { "review-round-1.md": review({ coverage: "" }) } },
    /no readable Coverage/,
  ],
  [
    "a last line that is not the verdict",
    { a: { "review-round-1.md": review() + "\nnotes after the verdict\n" } },
    /last line/,
  ],
  [
    "a captured surface with no review",
    { a: { "review-round-1.md": review() }, b: {} },
    /b: no review/,
  ],
  ["an empty set", {}, /no review at all/],
];

for (const [name, set, says] of FAILING)
  test(`C1: ${name} → non-zero`, () => {
    const r = run(captures(set));
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, says);
  });

test("C1: a listed surface the critic never reviewed → non-zero", () => {
  const r = run(
    captures({ a: { "review-round-1.md": review() } }),
    "--surfaces",
    "a,settings",
  );
  assert.equal(r.status, 1);
  assert.match(r.out, /settings: no review/);
});

test("C1: a folder that does not exist → non-zero", () => {
  assert.equal(run(path.join(scratch, "absent")).status, 1);
});

test("C1: the skill's Code lint UNVERIFIED line alone never fails", () => {
  assert.deepEqual(judgeReview(review()), []);
});

test("--pin reads the model the shipped skill was calibrated on", () => {
  const skill = path.join(REPO_ROOT, ".claude/skills/tk-ui-critic/SKILL.md");
  assert.deepEqual(readPin(readFileSync(skill, "utf8")), {
    model: "claude-opus-5-5",
    effort: "medium",
  });
  assert.equal(run("--pin", skill).out.trim(), "claude-opus-5-5 medium");
  assert.equal(readPin("no pin here"), null);
  assert.equal(run("--pin", path.join(scratch, "nope.md")).status, 1);
});
