/**
 * migrate:assess (MIG-6): the conventions and process detectors, the listings
 * (conflicts, SDK importers, records, collisions) and the hygiene lines.
 * Scratch target repos in $TMPDIR with real git (tooling/lib/assess/scratch-target.ts).
 * Every repo, file, policy line and count here is synthetic.
 */

import assert from "node:assert/strict";
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  listSdkImports,
  readToolkitGlobs,
  startsWithUseClient,
} from "./lib/assess/conventions.ts";
import { readHygiene } from "./lib/assess/hygiene.ts";
import { listImportedModules } from "./lib/assess/imports.ts";
import { listConflicts, listRecords } from "./lib/assess/process.ts";
import { openRepo } from "./lib/assess/repo.ts";
import { assessRepo } from "./lib/assess/report.ts";
import {
  commitAll,
  git,
  pkg,
  removeScratch,
  scratchOrigin,
  scratchTarget,
  writeFiles,
} from "./lib/assess/scratch-target.ts";
import type { Score } from "./lib/assess/signal.ts";
import { measureSignals } from "./lib/assess/signals.ts";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

after(removeScratch);

const scoresOf = (dir: string) =>
  Object.fromEntries(
    measureSignals(openRepo(dir)).map((s) => [s.id, s.score]),
  ) as Record<string, Score | null>;

const many = (
  n: number,
  make: (i: number) => [string, string],
): Record<string, string> =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => make(i)));

const CLIENT = '"use client";\nexport const C = () => null;\n';
const SERVER = "export const S = () => null;\n";

test("C1 (MIG-6) V1 and V2 score 0 when the boundaries file and the preset are tracked, 2 when absent", () => {
  const present = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "packages/config/eslint/boundaries.js": "export default [];\n",
      "packages/config/tailwind/preset.css": "@theme {}\n",
    }),
  );
  assert.deepEqual([present.V1, present.V2], [0, 0]);
  const absent = scoresOf(scratchTarget({ "package.json": pkg({}) }));
  assert.deepEqual([absent.V1, absent.V2], [2, 2]);
});

test("C1 (MIG-6) V3: 3 process.env readers outside env.ts score 1, 30 score 2, and env.ts itself never counts", () => {
  const reader = (i: number): [string, string] => [
    `src/reader-${i}.ts`,
    "export const url = process.env.API_URL;\n",
  ];
  const three = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "apps/web/env.ts": "export const env = process.env;\n",
      ...many(3, reader),
    }),
  );
  assert.equal(three.V3, 1);
  const thirty = scoresOf(
    scratchTarget({ "package.json": pkg({}), ...many(30, reader) }),
  );
  assert.equal(thirty.V3, 2);
  const none = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "apps/web/env.ts": "export const env = process.env;\n",
      ".yarn/releases/yarn-4.13.0.cjs": "process.env.X;\n",
    }),
  );
  assert.equal(
    none.V3,
    0,
    "an env.ts and a vendored Yarn release are not readers",
  );
});

test('C1 (MIG-6) V4: 60 percent of "use client" files outside _components/ scores 2; 10 percent scores 0; a directive after a comment counts', () => {
  const sixty = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(6, (i) => [`app/widgets/w-${i}.tsx`, CLIENT]),
      ...many(4, (i) => [`app/_components/c-${i}.tsx`, CLIENT]),
      ...many(5, (i) => [`app/server-${i}.tsx`, SERVER]),
    }),
  );
  assert.equal(sixty.V4, 2);
  const ten = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(1, (i) => [`app/widgets/w-${i}.tsx`, CLIENT]),
      ...many(9, (i) => [`app/_components/c-${i}.tsx`, CLIENT]),
    }),
  );
  assert.equal(ten.V4, 0);
  assert.ok(
    startsWithUseClient("// leaf\n/* note */\n'use client'\nexport {};"),
  );
  assert.ok(!startsWithUseClient('import x from "y";\n"use client";\n'));
});

test("C1 (MIG-6) V5: 3 SDK importers outside every reviewer glob score 1, 12 score 2, and one under a glob is matched", () => {
  const stripeFile = (i: number): [string, string] => [
    `app/widgets/pay-${i}.ts`,
    'import Stripe from "stripe";\nexport const s = new Stripe("sk_test_synthetic");\n',
  ];
  const three = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(3, stripeFile),
      "app/billing/charge.ts": 'import Stripe from "stripe";\nexport {};\n',
    }),
  );
  assert.equal(three.V5, 1);
  const twelve = scoresOf(
    scratchTarget({ "package.json": pkg({}), ...many(12, stripeFile) }),
  );
  assert.equal(twelve.V5, 2);
  const repo = openRepo(
    scratchTarget({
      "package.json": pkg({}),
      "app/billing/charge.ts": 'import Stripe from "stripe";\nexport {};\n',
      "app/note.ts":
        '// import Stripe from "stripe"\nconst s = "require(\'openai\')";\nexport { s };\n',
    }),
  );
  const rows = listSdkImports(repo, readToolkitGlobs(REPO));
  assert.deepEqual(rows, [
    {
      file: "app/billing/charge.ts",
      module: "stripe",
      matchedBy: "**/billing/**",
    },
  ]);
});

test("C1 (MIG-6) the import scanner reads statements, subpaths and scopes, never comments or strings", () => {
  const found = listImportedModules(
    [
      'import { createClient } from "@supabase/supabase-js";',
      "import type { X } from 'stripe/webhooks';",
      'export * from "resend";',
      'const a = require("@anthropic-ai/sdk");',
      'const b = await import("ai/rsc");',
      '// import z from "openai"',
      'const s = "from \\"next-auth\\"";',
      "const t = `require('@clerk/nextjs')`;",
    ].join("\n"),
  );
  assert.deepEqual(found.sort(), [
    "@anthropic-ai/sdk",
    "@supabase/supabase-js",
    "ai/rsc",
    "resend",
    "stripe/webhooks",
  ]);
});

test("C2 (MIG-6) P1: two conflicting instruction lines on two policies score 1; four policies score 2; a PR mention alone is no conflict", () => {
  const two = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "AGENTS.md": [
        "# Agents",
        "- Run yarn build before any PR.",
        "- **No git branches or PRs** during slice work.",
        "- **No tests during slices**; a finalization pass adds them.",
        "",
      ].join("\n"),
    }),
  );
  assert.equal(two.P1, 1);
  const four = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "CLAUDE.md":
        "Never create a branch.\nDo not write tests.\nAlways push when done.\nCommit directly to main.\n",
    }),
  );
  assert.equal(four.P1, 2);
  const none = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "CLAUDE.md": "yarn build must pass before any PR.\n",
    }),
  );
  assert.equal(none.P1, 0);
});

test("C2 (MIG-6) P2: 95 percent of docs with frontmatter scores 0, 20 percent scores 1, none scores 2", () => {
  const fm = (title: string) => `---\ntitle: ${title}\n---\n\n# ${title}\n`;
  const plain = (title: string) => `# ${title}\n`;
  const ninetyFive = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(19, (i) => [`docs/a-${i}.md`, fm(`A ${i}`)]),
      "docs/plain.md": plain("Plain"),
    }),
  );
  assert.equal(ninetyFive.P2, 0);
  const twenty = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(2, (i) => [`docs/a-${i}.md`, fm(`A ${i}`)]),
      ...many(8, (i) => [`docs/p-${i}.md`, plain(`P ${i}`)]),
    }),
  );
  assert.equal(twenty.P2, 1);
  const none = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(3, (i) => [`docs/p-${i}.md`, plain(`P ${i}`)]),
    }),
  );
  assert.equal(none.P2, 2);
});

test("C2 (MIG-6) P3: two foreign record kinds score 2, one scores 1, none scores 0", () => {
  const two = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "docs/specs/epic-1/TECHNICAL-DECISIONS.md":
        "# Decisions\n\n- 2026-01-01 · one\n",
      "docs/specs/epic-1/DEVIATIONS.md":
        "# Deviations\n\n- 2026-01-01 · E1-1 · x · y\n",
    }),
  );
  assert.equal(two.P3, 2);
  const one = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "docs/specs/epic-1/DEVIATIONS.md": "# Deviations\n",
    }),
  );
  assert.equal(one.P3, 1);
  const none = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "docs/decisions/ledger.md": "# Ledger\n",
      "docs/decisions/records/0001-adopt.md": "# 0001\n",
    }),
  );
  assert.equal(
    none.P3,
    0,
    "the practice's own decisions files are not foreign",
  );
});

test("C2 (MIG-6) P4: a UX spec outside specs/<app>/ux/ scores 1, one inside scores 0, an archived one does not count", () => {
  const elsewhere = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "docs/admin/ADMIN-UX-SPEC.md": "# Admin UX spec\n",
    }),
  );
  assert.equal(elsewhere.P4, 1);
  const folder = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "docs/ux/epic1-setup-ux-architecture.md": "# UX\n",
    }),
  );
  assert.equal(folder.P4, 1);
  const living = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "specs/web/ux/onboarding/welcome.md": "---\ntarget: x\n---\n# Welcome\n",
    }),
  );
  assert.equal(living.P4, 0);
  const archived = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      "docs/archive/ux/ux-design-handoff-v1.0.md": "# Old\n",
    }),
  );
  assert.equal(archived.P4, 2);
});

test("C2 (MIG-6) P5: 60 doc paths with a space score 2, 6 with an em-dash score 1, plain paths score 0", () => {
  const sixty = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(60, (i) => [`docs/note ${i}.md`, `# Note ${i}\n`]),
    }),
  );
  assert.equal(sixty.P5, 2);
  const six = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(6, (i) => [`docs/roles/Role${i}—prompt.md`, "# Role\n"]),
    }),
  );
  assert.equal(six.P5, 1);
  const plain = scoresOf(
    scratchTarget({
      "package.json": pkg({}),
      ...many(3, (i) => [`docs/note-${i}.md`, "# Note\n"]),
      "src/my file.ts": "export {};\n",
    }),
  );
  assert.equal(plain.P5, 0, "only markdown paths count");
});

const LISTED = {
  "package.json": pkg({ scripts: {} }),
  "AGENTS.md":
    "# Agents\n\n- No tests during slices.\n- Commit to the working branch; no branches, no PRs.\n",
  "apps/web/AGENTS.md": "# Web\n\nNothing conflicting here.\n",
  "app/billing/charge.ts": 'import Stripe from "stripe";\nexport {};\n',
  "app/widgets/mail.ts": 'import { Resend } from "resend";\nexport {};\n',
  "docs/specs/epic-1/TECHNICAL-DECISIONS.md": "# Decisions\n\n- one\n- two\n",
  "docs/specs/epic-1/DEVIATIONS.md": "# Deviations\n",
  "docs/specs/epic-1/PROGRESS.md": "# Progress\n",
  "docs/ux/epic1-ux-architecture.md": "# UX\n",
  "docs/decisions/mlp-report.md": "# Report\n",
  "docs/roles/engineering/Forge—staff-engineer-role-prompt.md": "# Forge\n",
  "docs/roles/vigil-qa.md": "---\ntitle: Vigil\nrole: Vigil\n---\n# Vigil\n",
  "docs/workflows/README.md": "# Host workflows\n",
};

test("C3 (MIG-6) the listings name each conflict with file and line, each SDK importer with its glob or none, each record with kind, path and lines, and each collision", () => {
  const dir = scratchTarget(LISTED);
  const repo = openRepo(dir);
  assert.deepEqual(listConflicts(repo), [
    {
      policy: "tests",
      file: "AGENTS.md",
      line: 3,
      text: "- No tests during slices.",
    },
    {
      policy: "branches",
      file: "AGENTS.md",
      line: 4,
      text: "- Commit to the working branch; no branches, no PRs.",
    },
  ]);
  const data = assessRepo(repo, REPO);
  assert.deepEqual(data.sdkImports, [
    {
      file: "app/billing/charge.ts",
      module: "stripe",
      matchedBy: "**/billing/**",
    },
    { file: "app/widgets/mail.ts", module: "resend", matchedBy: "none" },
  ]);
  const records = listRecords(repo);
  assert.deepEqual(
    records.map((r) => [r.kind, r.path, r.lines]).sort(),
    [
      ["decision log", "docs/specs/epic-1/TECHNICAL-DECISIONS.md", 5],
      ["deviation log", "docs/specs/epic-1/DEVIATIONS.md", 2],
      ["host decisions", "docs/decisions/mlp-report.md", 2],
      [
        "host role prompt",
        "docs/roles/engineering/Forge—staff-engineer-role-prompt.md",
        2,
      ],
      ["progress log", "docs/specs/epic-1/PROGRESS.md", 2],
      ["ux spec", "docs/ux/epic1-ux-architecture.md", 2],
    ].sort(),
  );
  assert.ok(data.collisions.includes("docs/roles/"), data.collisions.join());
  assert.ok(
    data.collisions.includes("docs/workflows/"),
    data.collisions.join(),
  );
  assert.ok(!data.collisions.includes("docs/decisions/ledger.md"));
});

test("C3 (MIG-6) hygiene names a dirty tree, an unpushed branch, a worktree and a tracked file over 10 MB, and scores none of them", () => {
  const dir = scratchTarget({
    "package.json": pkg({ scripts: {} }),
    "assets/demo.bin": "x".repeat(11 * 1024 * 1024),
  });
  writeFileSync(path.join(dir, "scratch.txt"), "untracked\n");
  git(
    dir,
    "worktree",
    "add",
    "-q",
    path.join(dir, ".claude/worktrees/side"),
    "-b",
    "side",
  );
  const repo = openRepo(dir);
  const h = readHygiene(repo);
  assert.equal(h.branch, "main");
  assert.deepEqual(h.remote, {
    ref: "refs/remotes/origin/main",
    state: "absent",
    ahead: 0,
    behind: 0,
  });
  assert.ok(h.dirty >= 1, String(h.dirty));
  // macOS reaches $TMPDIR through a symlink; git prints the real path.
  assert.deepEqual(h.worktrees, [
    realpathSync(path.join(dir, ".claude/worktrees/side")),
  ]);
  assert.deepEqual(
    h.largeFiles.map((f) => f.path),
    ["assets/demo.bin"],
  );
  const before = measureSignals(repo).map((s) => s.score);
  // A pushed, equal branch reads as equal; a branch ahead of its remote says so.
  const origin = scratchOrigin();
  git(dir, "remote", "add", "origin", origin);
  git(dir, "push", "-q", "-u", "origin", "main");
  assert.equal(readHygiene(openRepo(dir)).remote?.state, "equal");
  writeFiles(dir, { "more.md": "# More\n" });
  commitAll(dir, "ahead");
  const ahead = readHygiene(openRepo(dir)).remote;
  assert.deepEqual(
    [ahead?.state, ahead?.ahead, ahead?.behind],
    ["ahead", 1, 0],
  );
  assert.deepEqual(
    measureSignals(openRepo(dir)).map((s) => s.score),
    before,
    "hygiene changes no score",
  );
});

test("C4 (MIG-6) a worktree and an untracked .env are never read: the worktree is listed under hygiene only, and no opened path is an env file or sits in a worktree", () => {
  const dir = scratchTarget({
    ...LISTED,
    ".env.example": "API_URL=\n",
  });
  writeFileSync(path.join(dir, ".env"), "SECRET=synthetic\n");
  git(dir, "worktree", "add", "-q", ".claude/worktrees/side", "-b", "side");
  const side = realpathSync(path.join(dir, ".claude/worktrees/side"));
  mkdirSync(path.join(side, "app/widgets"), { recursive: true });
  writeFileSync(
    path.join(side, "app/widgets/worktree-only.ts"),
    'import OpenAI from "openai";\nexport {};\n',
  );
  const repo = openRepo(dir);
  const data = assessRepo(repo, REPO);
  assert.deepEqual((data.hygiene as { worktrees: string[] }).worktrees, [side]);
  assert.ok(!data.sdkImports.some((s) => s.file.includes("worktree-only")));
  assert.ok(repo.opened.length > 0);
  for (const abs of repo.opened) {
    assert.ok(
      !abs.startsWith(side + path.sep),
      `opened ${abs} inside the worktree`,
    );
    assert.doesNotMatch(
      path.basename(abs),
      /^\.env$|^\.env\./,
      `opened ${abs}`,
    );
  }
});
