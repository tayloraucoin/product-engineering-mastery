/**
 * migrate:assess (MIG-5): the scorer, the shape and checks detectors, the
 * report, and the cold-session import rule. Scratch target repos in $TMPDIR
 * with real git (tooling/lib/assess/scratch-target.ts). Every repo, file and
 * score here is synthetic.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

import { openRepo } from "./lib/assess/repo.ts";
import { scoreSignals } from "./lib/assess/score.ts";
import {
  pkg,
  removeScratch,
  scratchTarget,
  snapshotTree,
} from "./lib/assess/scratch-target.ts";
import { readMajor } from "./lib/assess/shape.ts";
import type { Score } from "./lib/assess/signal.ts";
import { measureSignals, SIGNALS } from "./lib/assess/signals.ts";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IDS = SIGNALS.map((s) => s.id);

after(removeScratch);

const scoresOf = (dir: string) =>
  Object.fromEntries(
    measureSignals(openRepo(dir)).map((s) => [s.id, s.score]),
  ) as Record<string, Score | null>;

const runAssess = (args: string[], via: "node" | "yarn" = "node") => {
  const [cmd, argv] =
    via === "yarn"
      ? ["yarn", ["migrate:assess", ...args]]
      : [
          process.execPath,
          [path.join(REPO, "tooling/migrate-assess.ts"), ...args],
        ];
  const r = spawnSync(cmd, argv, { cwd: REPO, encoding: "utf8" });
  return { status: r.status ?? 1, out: r.stdout, err: r.stderr };
};

/** assess.md's table, row by row: S1 S2 C1-C5 V1-V5 P1-P5. */
const TABLE: { synapse: Score[]; cc: Score[]; ta: Score[] } = {
  synapse: [0, 0, 1, 0, 2, 0, 1, 0, 0, 1, 2, 1, 1, 2, 2, 1, 0],
  cc: [0, 0, 1, 0, 2, 0, 1, 0, 0, 2, 1, 2, 1, 2, 2, 2, 2],
  ta: [2, 1, 2, 2, 2, 0, 1, 2, 2, 1, 1, 2, 0, 2, 2, 1, 0],
};
const set = (scores: Score[]) =>
  scores.map((score, i) => ({ id: IDS[i] ?? "", score }));

test("C1 the scorer reads assess.md's table: 14 near, 18 middle, 23 and the gate far", () => {
  assert.equal(IDS.length, 17);
  const synapse = scoreSignals(set(TABLE.synapse));
  assert.deepEqual(
    [synapse.total, synapse.path, synapse.gate.failed],
    [14, "near", false],
  );
  const cc = scoreSignals(set(TABLE.cc));
  assert.deepEqual([cc.total, cc.path, cc.gate.failed], [18, "middle", false]);
  const ta = scoreSignals(set(TABLE.ta));
  assert.deepEqual([ta.total, ta.path, ta.gate.failed], [23, "far", true]);
  assert.match(ta.gate.reasons.join(), /S1 = 2/);
});

test("C1 S1 = 2 with a total of 10 is far by the gate alone", () => {
  const scores: Score[] = [2, 0, 1, 0, 2, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0];
  const v = scoreSignals(set(scores));
  assert.deepEqual([v.total, v.path, v.gate.failed], [10, "far", true]);
});

test("C1 the band edges: 15 near, 16 middle, 21 middle, 22 far; a non-JavaScript repo is far", () => {
  const at = (total: number) => {
    const scores = IDS.map(() => 0) as Score[];
    for (let left = total, i = 1; left > 0; i++) {
      const score: Score = left >= 2 ? 2 : 1;
      scores[i] = score;
      left -= score;
    }
    return scoreSignals(set(scores)).path;
  };
  assert.deepEqual(
    [at(15), at(16), at(21), at(22)],
    ["near", "middle", "middle", "far"],
  );
  const v = scoreSignals(set(TABLE.synapse), { javascript: false });
  assert.deepEqual(
    [v.path, v.gate.reasons],
    ["far", ["not a JavaScript repo"]],
  );
});

test("C1 unmeasured signals leave the path undecided unless every outcome lands in one band", () => {
  const partial = set(TABLE.synapse).map((s, i) =>
    i >= 7 ? { ...s, score: null } : s,
  );
  const v = scoreSignals(partial);
  assert.deepEqual([v.total, v.ceiling, v.path], [4, 24, null]);
  assert.equal(v.unmeasured.length, 10);
  const high = partial.map((s, i) => (i < 7 ? { ...s, score: 2 as Score } : s));
  assert.equal(scoreSignals(high).path, "far");
});

const CI_CHAIN = [
  "name: CI",
  "on: [push]",
  "jobs:",
  "  verify:",
  "    runs-on: ubuntu-latest",
  "    steps:",
  "      - run: yarn install --immutable",
  "      - name: Lint",
  "        run: yarn lint",
  "      - run: yarn check-types",
  "      - run: yarn build",
  "",
].join("\n");

const MONOREPO = {
  "package.json": pkg({
    packageManager: "yarn@4.13.0",
    engines: { node: ">=22" },
    workspaces: ["apps/*", "packages/*"],
    scripts: {
      build: "turbo run build",
      lint: "turbo run lint",
      "check-types": "turbo run check-types",
      format: 'prettier --write "**/*.{ts,tsx,md}"',
    },
    devDependencies: { typescript: "5.9.2", turbo: "^2.5.0" },
  }),
  "turbo.json": "{}\n",
  ".github/workflows/ci.yml": CI_CHAIN,
  "apps/web/package.json": pkg({
    dependencies: { next: "16.2.6", react: "19.2.0", tailwindcss: "^4.1.0" },
  }),
  "apps/web/app/page.tsx": "export default function Page() { return null; }\n",
};

test("C2 a workspaces repo with turbo.json, a CI chain, no tests, both scripts and a write-only format", () => {
  const s = scoresOf(scratchTarget(MONOREPO));
  assert.deepEqual(
    [s.S1, s.S2, s.C1, s.C2, s.C3, s.C4, s.C5],
    [0, 0, 1, 0, 2, 0, 1],
  );
  for (const id of IDS.slice(7)) assert.equal(s[id], null, id);
});

test("C2 a single-app repo without turbo.json scores S1 2, and Next 15 alone puts S2 at 1", () => {
  const dir = scratchTarget({
    "package.json": pkg({
      packageManager: "yarn@4.13.0",
      scripts: {
        dev: "next dev",
        lint: "eslint .",
        typecheck: "tsc --noEmit",
        format: "prettier --write .",
      },
      dependencies: {
        next: "^15.1.0",
        react: "^19.0.0",
        tailwindcss: "^4.0.0",
      },
      devDependencies: { typescript: "^5.7.0" },
    }),
    "app/page.tsx": "export default function Page() { return null; }\n",
  });
  const s = scoresOf(dir);
  assert.deepEqual(
    [s.S1, s.S2, s.C1, s.C2, s.C3, s.C4, s.C5],
    [2, 1, 2, 2, 2, 0, 1],
  );
});

test("C2 the zero rows: a verify script, a runner with tests, a --check format; two majors off score S2 2", () => {
  const dir = scratchTarget({
    "package.json": pkg({
      packageManager: "pnpm@9.0.0",
      engines: { node: "^20" },
      workspaces: ["apps/*"],
      scripts: {
        verify: "yarn lint && yarn test",
        test: "vitest run",
        lint: "eslint .",
        "check-types": "tsc -b",
        "format:check": "prettier --check .",
      },
      devDependencies: { vitest: "^3.0.0", typescript: "^5.9.0" },
    }),
    "src/sum.test.ts": "export {};\n",
    "src/my file — notes.md": "a path with a space and an em-dash\n",
  });
  const s = scoresOf(dir);
  assert.deepEqual(
    [s.S1, s.S2, s.C1, s.C2, s.C3, s.C4, s.C5],
    [1, 2, 0, 2, 0, 0, 0],
  );
  assert.ok(openRepo(dir).tracked.has("src/my file — notes.md"));
});

test("C2 readMajor takes the floor of a range and ignores tags and protocols", () => {
  assert.equal(readMajor("^15.1.0"), 15);
  assert.equal(readMajor(">=22"), 22);
  assert.equal(readMajor("16.2.6"), 16);
  assert.equal(readMajor("^20 || ^22"), 20);
  assert.equal(readMajor("20.x"), 20);
  assert.equal(readMajor("latest"), null);
  assert.equal(readMajor("workspace:*"), null);
});

const CONTRACT_KEYS = [
  "target",
  "commit",
  "toolkitCommit",
  "signals",
  "total",
  "path",
  "gate",
  "preconditions",
  "conflicts",
  "sdkImports",
  "records",
  "collisions",
  "hygiene",
];

test("C3 --json prints one object with every data-contract key, and the target is byte for byte unchanged", () => {
  const dir = scratchTarget(MONOREPO);
  const before = snapshotTree(dir);
  const r = runAssess([dir, "--json"], "yarn");
  assert.equal(r.status, 0, r.err);
  const data = JSON.parse(r.out);
  for (const key of CONTRACT_KEYS) assert.ok(key in data, key);
  assert.equal(data.signals.length, 17);
  for (const s of data.signals)
    assert.deepEqual(Object.keys(s), ["id", "value", "score", "evidence"]);
  assert.equal(data.commit, openRepo(dir).commit);
  assert.match(data.toolkitCommit, /^[0-9a-f]{40}$/);
  assert.deepEqual(snapshotTree(dir), before);
});

test("C3 a target that is not a git repository exits 2 with a reason", () => {
  const r = runAssess([path.join(REPO, "does-not-exist-assess")]);
  assert.equal(r.status, 2);
  assert.match(r.err, /not a folder/);
});

test("C4 the markdown names each signal with its score and evidence, the total, the path, the gate and what is not yet measured", () => {
  const dir = scratchTarget(MONOREPO);
  const r = runAssess([dir]);
  assert.equal(r.status, 0, r.err);
  const md = r.out;
  assert.match(md, /^- Total: \*\*4\*\* of 14 measured \(7 of 17 signals\)$/m);
  assert.match(md, /^- Gate: passed$/m);
  assert.match(md, /^- Path: \*\*not decided\*\*/m);
  assert.match(
    md,
    /^- Not yet measured: V1, V2, V3, V4, V5, P1, P2, P3, P4, P5 /m,
  );
  assert.match(
    md,
    /^\| S1 \| Workspaces and turbo\.json \| 3 \| 0 \| workspaces .* turbo\.json at the root \|$/m,
  );
  assert.match(
    md,
    /^\| C1 \| One verify command \| 2 \| 1 \| no verify script; \.github\/workflows\/ci\.yml chains lint, types, build \|$/m,
  );
  assert.match(
    md,
    /^\| C5 \| .* \| 1 \| write-only: format: prettier --write/m,
  );
  for (const id of IDS) assert.match(md, new RegExp(`^\\| ${id} \\|`, "m"), id);
  assert.match(md, /^\| V1 \| .* \| not yet measured \| not yet measured \|$/m);
});

test("C4 a single-app target reports the gate and the far path", () => {
  const dir = scratchTarget({ "package.json": pkg({ scripts: {} }) });
  const md = runAssess([dir]).out;
  assert.match(
    md,
    /^- Gate: \*\*failed\*\* \(S1 = 2: no workspaces and no turbo\.json\)$/m,
  );
  assert.match(md, /^- Path: \*\*far\*\*/m);
});

test("C5 migrate-assess.ts and tooling/lib/assess/ import node: modules and each other only", () => {
  const folder = path.join(REPO, "tooling/lib/assess");
  const files = [
    path.join(REPO, "tooling/migrate-assess.ts"),
    ...readdirSync(folder, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => path.join(folder, f)),
  ];
  assert.ok(files.length >= 5);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const specifiers = [
      ...text.matchAll(
        /^\s*(?:import|export)\b[^;]*?\bfrom\s+["']([^"']+)["']/gm,
      ),
      ...text.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g),
      ...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g),
      ...text.matchAll(/^\s*import\s+["']([^"']+)["']/gm),
    ].map((m) => m[1] ?? "");
    for (const spec of specifiers) {
      if (spec.startsWith("node:")) continue;
      assert.ok(
        spec.startsWith("."),
        `${path.relative(REPO, file)} imports ${spec}`,
      );
      const resolved = path.resolve(path.dirname(file), spec);
      assert.ok(
        resolved.startsWith(folder + path.sep),
        `${path.relative(REPO, file)} imports ${spec}, outside tooling/lib/assess/`,
      );
    }
  }
});
