/**
 * Stop hook (E-18; A13.3; V1, ruling (i)).
 *
 * When the session changed the working tree since SessionStart (or since the
 * last green stop), runs `yarn verify:fast`. On failure it blocks the stop
 * once, with the failure as the reason, so the agent fixes it; Claude Code
 * sets `stop_hook_active` on the stop that follows, and this hook never
 * blocks that one (V1). It always shows the person "Left to go" for the
 * active ticket through `systemMessage`, which does not continue the turn.
 *
 * Output is one JSON object on stdout, exit 0. Fixtures:
 * tooling/hooks/fixtures/stop-gate.json, run by `yarn test:hooks`.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readLayout } from "../lib/work-ids.ts";
import {
  readSnapshot,
  saveSnapshot,
  treeFingerprint,
} from "./session-state.ts";

const ROOT =
  process.env.CLAUDE_PROJECT_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
/** E-18: the whole reason stays within about 300 tokens (1,200 characters), prefix included. */
const REASON_LIMIT = 1100;

/** Set only by the fixture runner: the git and verify facts a case assumes. */
type FixtureContext = {
  changed?: boolean;
  verifyExit?: number;
  verifyOutput?: string;
  left?: string;
};
const fixture: FixtureContext | null = process.env.PEM_HOOK_FIXTURE_CONTEXT
  ? (JSON.parse(process.env.PEM_HOOK_FIXTURE_CONTEXT) as FixtureContext)
  : null;

let input: { session_id?: string; stop_hook_active?: boolean } = {};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const node = (script: string, args: string[]) =>
  spawnSync(process.execPath, [path.join(ROOT, "tooling", script), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    timeout: 90_000,
  });

/** "Left to go" for the ticket this branch is for, or the brief line when there is none. */
function leftToGo(): string {
  if (fixture) return fixture.left ?? "Active: none.";
  const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  }).stdout.trim();
  const [before, after] = readLayout(ROOT).branchPattern.split("{id}");
  const id =
    branch.startsWith(before ?? "") && branch.endsWith(after ?? "")
      ? branch.slice(
          (before ?? "").length,
          branch.length - (after ?? "").length,
        )
      : null;
  const status = /^[A-Z][A-Z0-9]{1,4}-\d+$/.test(id ?? "")
    ? node("status.ts", [id!])
    : node("status.ts", ["--brief"]);
  return (status.stdout || "").trim() || "Status unavailable: run yarn status.";
}

const session = input.session_id ?? "unknown";
const fingerprint = fixture ? "" : treeFingerprint(ROOT);
const changed = fixture
  ? (fixture.changed ?? true)
  : readSnapshot(session) !== fingerprint;

const reply = (body: Record<string, unknown>): never => {
  process.stdout.write(`${JSON.stringify(body)}\n`);
  process.exit(0);
};

if (!changed)
  reply({
    systemMessage: `Nothing changed since the last check. ${leftToGo()}`,
  });

const started = Date.now();
const verify = fixture
  ? {
      status: fixture.verifyExit ?? 0,
      stdout: fixture.verifyOutput ?? "",
      stderr: "",
    }
  : node("verify-fast.ts", []);
const seconds = ((Date.now() - started) / 1000).toFixed(1);
const output = `${verify.stdout ?? ""}${verify.stderr ?? ""}`.trim();

if (verify.status === 0) {
  if (!fixture) saveSnapshot(session, fingerprint);
  reply({ systemMessage: `verify:fast passed (${seconds} s). ${leftToGo()}` });
}

const tail =
  output.length > REASON_LIMIT ? `…${output.slice(-REASON_LIMIT)}` : output;
if (input.stop_hook_active)
  reply({
    systemMessage: `verify:fast still fails (${seconds} s); not blocking a second time (loop guard). ${leftToGo()}`,
  });
reply({
  decision: "block",
  reason: `verify:fast failed. Fix it, then finish your turn; this blocks once. Output:\n${tail}`,
  systemMessage: leftToGo(),
});
