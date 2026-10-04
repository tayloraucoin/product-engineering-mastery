/**
 * Stop hook (E-18; A13.3; V1, ruling (i)).
 *
 * When the working tree changed since SessionStart (or since the last green
 * stop), runs `yarn verify:fast` over the files this session edited, read
 * from its transcript (PR-15): threads share the operator's checkout, so a
 * stop never judges another thread's files. A session that edited nothing
 * is never blocked. On failure it blocks the stop
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

import {
  readSnapshot,
  saveSnapshot,
  treeFingerprint,
} from "./session-state.ts";

const ROOT =
  process.env.CLAUDE_PROJECT_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
/** E-18: the whole reason stays within about 300 tokens (1,200 characters), prefix included. */
const REASON_LIMIT = 1000;

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

let input: {
  session_id?: string;
  stop_hook_active?: boolean;
  transcript_path?: string;
} = {};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const node = (script: string, args: string[], env?: NodeJS.ProcessEnv) =>
  spawnSync(process.execPath, [path.join(ROOT, "tooling", script), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    timeout: 90_000,
    env: { ...process.env, ...env },
  });

/**
 * The repo files this session wrote with its edit tools, from its transcript.
 * Null when the transcript cannot be read: the gate then checks the whole
 * branch, as it did before PR-15.
 */
function sessionFiles(): string[] | null {
  if (!input.transcript_path) return null;
  let text: string;
  try {
    text = readFileSync(input.transcript_path, "utf8");
  } catch {
    return null;
  }
  const files = new Set<string>();
  for (const line of text.split("\n")) {
    if (!line.includes('"tool_use"')) continue;
    try {
      const content = (JSON.parse(line) as { message?: { content?: unknown } })
        .message?.content;
      if (!Array.isArray(content)) continue;
      for (const block of content as {
        type?: string;
        name?: string;
        input?: { file_path?: string; notebook_path?: string };
      }[]) {
        if (block.type !== "tool_use") continue;
        if (!/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(block.name ?? ""))
          continue;
        const file = block.input?.file_path ?? block.input?.notebook_path;
        if (!file) continue;
        const rel = path.relative(ROOT, path.resolve(ROOT, file));
        if (!rel.startsWith("..") && !path.isAbsolute(rel))
          files.add(rel.split(path.sep).join("/"));
      }
    } catch {
      // A partial line: skip it.
    }
  }
  return [...files];
}

/** What is left on every item in build: tickets share the operator's branch (PR-14). */
function leftToGo(): string {
  if (fixture) return fixture.left ?? "Active: none.";
  const status = node("status.ts", ["--brief"]);
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

const mine = fixture ? null : sessionFiles();
if (mine && mine.length === 0)
  reply({
    systemMessage: `This session edited no files; nothing to check. ${leftToGo()}`,
  });

const started = Date.now();
const verify = fixture
  ? {
      status: fixture.verifyExit ?? 0,
      stdout: fixture.verifyOutput ?? "",
      stderr: "",
    }
  : node(
      "verify-fast.ts",
      [],
      mine ? { PEM_VERIFY_FAST_FILES: mine.join("\n") } : undefined,
    );
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
  reason: `verify:fast failed on files this session edited. Fix them, then finish; this blocks once. If the file is another thread's, say so and stop. Output:\n${tail}`,
  systemMessage: leftToGo(),
});
