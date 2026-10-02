/**
 * Runs every hook against its fixtures (E-16; J3).
 *
 *   yarn test:hooks
 *
 * A fixture file is tooling/hooks/fixtures/<hook>.json: synthetic hook inputs,
 * each with the exit code it must produce (0 allows, 2 blocks). The run fails
 * when a case misbehaves, when a rule lacks an allow or a deny case, when a
 * denial is longer than its budget, or when the hook is slow.
 */

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { REPO_ROOT } from "./lib/docs.ts";

const FIXTURES = "tooling/hooks/fixtures";
/** A PreToolUse hook runs before every matching call; the build prompt's limit is 200 ms. */
const MEDIAN_LIMIT_MS = 200;
/** E-16: at most 60 tokens per denial, estimated as characters / 4. */
const DENIAL_TOKEN_LIMIT = 60;

type Case = {
  rule: string;
  expect: "allow" | "deny";
  name: string;
  command?: string;
  input?: Record<string, unknown>;
  cwd?: string;
  context?: Record<string, unknown>;
  message?: string;
};
type FixtureFile = {
  hook: string;
  defaultContext?: Record<string, unknown>;
  cases: Case[];
};

const failures: string[] = [];
const summary: string[] = [];

for (const name of readdirSync(path.join(REPO_ROOT, FIXTURES)).sort()) {
  if (!name.endsWith(".json")) continue;
  const file = JSON.parse(
    readFileSync(path.join(REPO_ROOT, FIXTURES, name), "utf8"),
  ) as FixtureFile;
  const script = path.join(REPO_ROOT, "tooling/hooks", `${file.hook}.ts`);
  const seen = new Map<string, Set<string>>();
  const times: number[] = [];
  let longest = 0;

  for (const item of file.cases) {
    const input = item.input ?? {
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: { command: item.command },
      cwd: (item.cwd ?? "$ROOT").replace("$ROOT", REPO_ROOT),
    };
    const env = { ...process.env };
    delete env.CLAUDE_PROJECT_DIR;
    env.PEM_HOOK_FIXTURE_CONTEXT = JSON.stringify({
      ...file.defaultContext,
      ...item.context,
    });
    const started = performance.now();
    const result = spawnSync(process.execPath, [script], {
      input: JSON.stringify(input),
      encoding: "utf8",
      env,
    });
    times.push(performance.now() - started);

    const where = `${file.hook} / ${item.rule} / ${item.name}`;
    const expected = item.expect === "deny" ? 2 : 0;
    seen.set(item.rule, (seen.get(item.rule) ?? new Set()).add(item.expect));
    if (result.status !== expected) {
      failures.push(
        `${where}: expected exit ${expected}, got ${result.status}. stderr: ${result.stderr.trim() || "(empty)"}`,
      );
      continue;
    }
    if (item.expect !== "deny") continue;
    const stderr = result.stderr.trim();
    longest = Math.max(longest, Math.ceil(stderr.length / 4));
    if (!stderr.startsWith(`${file.hook} [${item.rule}]`))
      failures.push(`${where}: blocked by the wrong rule: ${stderr}`);
    if (item.message && !stderr.includes(item.message))
      failures.push(
        `${where}: the denial does not say "${item.message}": ${stderr}`,
      );
    if (Math.ceil(stderr.length / 4) > DENIAL_TOKEN_LIMIT)
      failures.push(
        `${where}: the denial is about ${Math.ceil(stderr.length / 4)} tokens; the limit is ${DENIAL_TOKEN_LIMIT}`,
      );
  }

  for (const [rule, kinds] of seen) {
    for (const kind of ["allow", "deny"])
      if (!kinds.has(kind))
        failures.push(
          `${file.hook} / ${rule}: no ${kind} case; every rule needs both`,
        );
  }

  const sorted = [...times].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const max = sorted.at(-1) ?? 0;
  if (median > MEDIAN_LIMIT_MS)
    failures.push(
      `${file.hook}: median ${median.toFixed(0)} ms per call; the limit is ${MEDIAN_LIMIT_MS} ms`,
    );
  summary.push(
    `${file.hook}: ${file.cases.length} cases, ${seen.size} rules; ` +
      `median ${median.toFixed(0)} ms, max ${max.toFixed(0)} ms per call; ` +
      `longest denial about ${longest} tokens`,
  );
}

if (summary.length === 0) failures.push(`no fixture files in ${FIXTURES}`);
if (failures.length > 0) {
  console.error(
    `test:hooks — ${failures.length} failure(s):\n  ${failures.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(`test:hooks — every case behaved.\n  ${summary.join("\n  ")}`);
