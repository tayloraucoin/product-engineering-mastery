/**
 * The stop gate's tier (E-18; A13.3): what this branch changes, checked fast.
 *
 *   yarn verify:fast
 *
 * The changed set is every file the branch changes against the protected
 * branch's merge-base, working tree and untracked files included. Each step
 * runs only when that set reaches it:
 *   - format: Prettier on the changed files;
 *   - lint and types: Turbo's `lint` and `check-types` on the affected
 *     workspaces and their dependents (the cache makes the rest free), the
 *     boundaries lint on changed code, and `tsc -p tooling` for tooling;
 *   - the repo's own checks when their inputs change: the docs lint, the
 *     settings check, the hook fixtures;
 *   - always, because each takes under a second: check-specs and budget.
 * The build and the contract-loop tests (16 s) stay in `yarn verify` and CI. Fails fast;
 * prints each step's time.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";
import { getBaseRef, runGit } from "./lib/git.ts";

type Step = { name: string; command: string[]; when: boolean };

const base = getBaseRef();
const fork = base ? runGit(["merge-base", base, "HEAD"]) : null;
const lines = (text: string | null) => (text ?? "").split("\n").filter(Boolean);
const changed = [
  ...new Set([
    ...lines(
      fork
        ? runGit(["diff", "--name-only", fork, "--"])
        : runGit(["diff", "--name-only", "HEAD", "--"]),
    ),
    ...lines(runGit(["ls-files", "--others", "--exclude-standard"])),
  ]),
].filter((file) => existsSync(path.join(REPO_ROOT, file)));

const touches = (pattern: RegExp) => changed.some((file) => pattern.test(file));
const code = changed.filter((file) =>
  /^(apps|packages)\/.+\.(ts|tsx|mjs)$/.test(file),
);
/** The extensions `yarn format:check` covers, read from its glob so the two never disagree. */
const formatExtensions = (
  (
    JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    }
  ).scripts["format:check"]?.match(/\{([a-z,]+)\}/)?.[1] ?? "ts,tsx,md"
).split(",");
const formattable = changed.filter((file) =>
  formatExtensions.includes(path.extname(file).slice(1)),
);

const steps: Step[] = [
  {
    name: "format (changed files)",
    command: [
      "yarn",
      "prettier",
      "--check",
      "--ignore-unknown",
      ...formattable,
    ],
    when: formattable.length > 0,
  },
  {
    name: "lint and types (affected workspaces)",
    command: [
      "yarn",
      "turbo",
      "run",
      "lint",
      "check-types",
      `--filter=...[${fork ?? "HEAD"}]`,
      "--output-logs=errors-only",
      "--ui=stream",
    ],
    when: touches(/^(apps|packages)\//),
  },
  {
    name: "boundaries (changed code)",
    command: ["yarn", "eslint", "--max-warnings", "0", ...code],
    when: code.length > 0,
  },
  {
    name: "types (tooling)",
    command: ["yarn", "check-types:tooling"],
    when: touches(/^tooling\/.+\.ts$/),
  },
  {
    name: "docs lint",
    command: ["yarn", "lint:docs"],
    when: touches(/^(docs\/|\.claude\/rules\/|toolkit\.json$)/),
  },
  {
    name: "settings",
    command: ["yarn", "check-settings"],
    when: touches(
      /^(\.claude\/settings\.json|tooling\/check-settings\.ts|tooling\/fixtures\/settings\/)/,
    ),
  },
  {
    name: "hook fixtures",
    command: ["yarn", "test:hooks"],
    when: touches(/^tooling\/(hooks\/|lib\/work-ids\.ts|test-hooks\.ts)/),
  },
  { name: "check-specs", command: ["yarn", "check-specs"], when: true },
  { name: "budget", command: ["yarn", "budget"], when: true },
];

/** No colour codes in output the stop gate quotes: picocolors colours whenever FORCE_COLOR is present, even as "0". */
const plainEnv: NodeJS.ProcessEnv = {
  ...process.env,
  TURBO_TELEMETRY_DISABLED: "1",
  NO_COLOR: "1",
};
delete plainEnv.FORCE_COLOR;

const started = Date.now();
const timings: string[] = [];
for (const step of steps) {
  if (!step.when) continue;
  const t = Date.now();
  const result = spawnSync(step.command[0]!, step.command.slice(1), {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: plainEnv,
  });
  const seconds = ((Date.now() - t) / 1000).toFixed(1);
  timings.push(`${step.name} ${seconds} s`);
  if (result.status !== 0) {
    const output = `${result.stdout}${result.stderr}`
      .trim()
      .split("\n")
      .slice(-25)
      .join("\n");
    console.error(
      `verify:fast — ${step.name} failed (${seconds} s):\n${output}`,
    );
    process.exit(1);
  }
}
console.log(
  `verify:fast — ${changed.length} changed file(s); ${((Date.now() - started) / 1000).toFixed(1)} s: ${timings.join(", ") || "nothing to check"}.`,
);
