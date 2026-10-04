/**
 * Guards the tracked agent permissions (E-15; ruling (d)).
 *
 *   yarn check-settings            fixtures first, then .claude/settings.json
 *   yarn check-settings <file>     one settings file, no fixtures
 *
 * Fails when: a required deny or ask is missing, a deny would block the local
 * reset, an allow rule admits every shell
 * command, a value holds a machine path, the sandbox is off, a required hook is
 * not registered, a registered hook points at a script that does not exist, or
 * settings.local.json is tracked.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";

const SETTINGS = ".claude/settings.json";
const LOCAL = ".claude/settings.local.json";
const FIXTURES = "tooling/fixtures/settings";
const TEMPLATE = "docs/engineering/templates/settings.template.json";

/** Ruling (d)'s denies. Each must appear in permissions.deny exactly as written. */
const REQUIRED_DENIES = [
  "Bash(git push)",
  "Bash(git push *)",
  "Bash(git reset --hard *)",
  "Bash(git clean *)",
  "Bash(git branch -D *)",
  "Bash(git filter-branch *)",
  "Bash(npm publish *)",
  "Bash(npm login *)",
  "Read(**/.env)",
  "Read(**/secrets/**)",
  "Read(**/*.pem)",
  "Read(~/.ssh/**)",
  "Read(~/.aws/**)",
  // D-STK-18: no agent resets or drops a database.
  "Bash(*db:reset*)",
  "Bash(*db:drop*)",
  "Bash(*drizzle-kit drop*)",
  "Bash(*supabase db reset*)",
  "Bash(*DROP SCHEMA*)",
  "Bash(*DROP DATABASE*)",
];
/**
 * The env files that hold values (PR-16). Either the blanket rule, or every
 * one of the named files: the named form leaves .env.example readable, which
 * holds names and local defaults, never a key.
 */
const ENV_BLANKET_DENY = "Read(**/.env.*)";
const ENV_FILE_DENIES = [
  "Read(**/.env.local)",
  "Read(**/.env.*.local)",
  "Read(**/.env.development)",
  "Read(**/.env.staging)",
  "Read(**/.env.production)",
];
/** D-STK-18's asks: every command that changes a database waits for Taylor. */
const REQUIRED_ASKS = [
  "Bash(*db:migrate*)",
  "Bash(*db:push*)",
  "Bash(*db:seed*)",
  "Bash(*db:setup*)",
  "Bash(*db:local:reset*)",
  "Bash(*drizzle-kit migrate*)",
  "Bash(*drizzle-kit push*)",
  "Bash(*supabase db push*)",
];
/** Asked, never denied: a deny broad enough to catch it takes the local rebuild away. */
const LOCAL_RESET = "yarn db:local:reset";
/**
 * Hooks that must stay registered (A13.1). Deleting a hook block would
 * otherwise pass every check. A hook joins this list in the step that lands
 * its script (A2).
 */
const REQUIRED_HOOKS = [
  {
    event: "PreToolUse",
    matcher: "Bash",
    script: "tooling/hooks/bash-guard.ts",
  },
  {
    event: "PreToolUse",
    matcher: "Edit|Write|NotebookEdit",
    script: "tooling/hooks/results-gate.ts",
  },
  {
    event: "SessionStart",
    matcher: undefined,
    script: "tooling/hooks/session-start.ts",
  },
  { event: "Stop", matcher: undefined, script: "tooling/hooks/stop-gate.ts" },
];
/** Shell reads the Read tool's deny cannot be trusted to cover on its own. */
const REQUIRED_DENY_READ = ["~/.ssh", "~/.aws"];
const MACHINE_PATH =
  /(^|[\s("'=:])(\/\/?(Users|home|private|var|opt)\/|[A-Za-z]:\\)/;

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];

/** Every string in a JSON value, with the path that reaches it. */
function walk(value: unknown, at: string, out: [string, string][]) {
  if (typeof value === "string") out.push([at, value]);
  else if (Array.isArray(value))
    value.forEach((item, i) => walk(item, `${at}[${i}]`, out));
  else if (isObject(value))
    for (const [key, item] of Object.entries(value))
      walk(item, at ? `${at}.${key}` : key, out);
}

/** Whether a `Bash(...)` rule's pattern, with `*` as any text, matches the whole command. */
function bashRuleMatches(rule: string, command: string): boolean {
  const pattern = rule.match(/^Bash\((.*)\)$/)?.[1];
  if (pattern === undefined) return false;
  // The legacy `prefix:*` form means the prefix, then anything.
  const body = pattern
    .replace(/:\*$/, "*")
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}$`).test(command);
}

export function checkSettings(settings: unknown): string[] {
  const problems: string[] = [];
  if (!isObject(settings)) return ["the file must hold one JSON object"];
  const permissions = isObject(settings.permissions)
    ? settings.permissions
    : {};
  const deny = strings(permissions.deny);
  const allow = strings(permissions.allow);
  const ask = strings(permissions.ask);

  for (const rule of REQUIRED_DENIES) {
    if (!deny.includes(rule))
      problems.push(
        `permissions.deny is missing ${rule}; restore it from ${TEMPLATE}`,
      );
  }
  if (
    !deny.includes(ENV_BLANKET_DENY) &&
    !ENV_FILE_DENIES.every((rule) => deny.includes(rule))
  )
    problems.push(
      `permissions.deny must hold ${ENV_BLANKET_DENY}, or every one of ${ENV_FILE_DENIES.join(", ")}; restore it from ${TEMPLATE}`,
    );
  for (const rule of REQUIRED_ASKS) {
    if (!ask.includes(rule))
      problems.push(
        `permissions.ask is missing ${rule}; restore it from ${TEMPLATE}`,
      );
  }
  for (const rule of deny) {
    if (bashRuleMatches(rule, LOCAL_RESET))
      problems.push(
        `permissions.deny holds ${rule}, which also blocks ${LOCAL_RESET}; ` +
          "narrow it so the local reset stays an ask (D-STK-18)",
      );
  }
  for (const rule of allow) {
    if (/^Bash(\(\s*\*?\s*\)|\(\*:\*\))?$/.test(rule))
      problems.push(
        `permissions.allow holds ${rule}, which admits every shell command; ` +
          "replace it with the specific commands, as in the template",
      );
  }

  const hooks = isObject(settings.hooks) ? settings.hooks : {};
  for (const { event, matcher, script } of REQUIRED_HOOKS) {
    const entries = Array.isArray(hooks[event]) ? hooks[event] : [];
    const registered = entries.some(
      (entry) =>
        isObject(entry) &&
        (entry.matcher ?? "") === (matcher ?? "") &&
        JSON.stringify(entry.hooks ?? []).includes(
          `\${CLAUDE_PROJECT_DIR}/${script}`,
        ),
    );
    if (!registered)
      problems.push(
        `hooks.${event} does not register ${script}${matcher ? ` for "${matcher}"` : ""}; restore the entry from ${TEMPLATE}`,
      );
  }

  const sandbox = isObject(settings.sandbox) ? settings.sandbox : {};
  if (sandbox.enabled !== true)
    problems.push("sandbox.enabled must be true; the sandbox is the boundary");
  const filesystem = isObject(sandbox.filesystem) ? sandbox.filesystem : {};
  const denyRead = strings(filesystem.denyRead);
  for (const entry of REQUIRED_DENY_READ) {
    if (!denyRead.includes(entry))
      problems.push(
        `sandbox.filesystem.denyRead is missing ${entry}; restore it from ${TEMPLATE}`,
      );
  }

  const found: [string, string][] = [];
  walk(settings, "", found);
  for (const [at, value] of found) {
    if (MACHINE_PATH.test(value))
      problems.push(
        `${at} holds a machine path (${value}); use ~/, a repo-relative path, ` +
          "or ${CLAUDE_PROJECT_DIR}",
      );
    // A hook is never registered to a script that does not exist (A2).
    const script = value.match(/\$\{CLAUDE_PROJECT_DIR\}\/([^"'\s]+)/);
    if (
      at.startsWith("hooks.") &&
      script &&
      !existsSync(path.join(REPO_ROOT, script[1]!))
    )
      problems.push(
        `${at} registers ${script[1]}, which does not exist; ` +
          "land the script and its fixtures first, then register the hook",
      );
  }
  return problems;
}

function isTracked(rel: string): boolean {
  try {
    return (
      execFileSync("git", ["ls-files", "--", rel], {
        cwd: REPO_ROOT,
        encoding: "utf8",
      }).trim() !== ""
    );
  } catch {
    return false;
  }
}

function readJson(rel: string): unknown {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, rel), "utf8"));
}

/** Each fixture: { expect: "pass" | "fail", message?: string, settings: {...} }. */
function runFixtures(): string[] {
  const failures: string[] = [];
  const dir = path.join(REPO_ROOT, FIXTURES);
  const files = readdirSync(dir).filter(
    (name) => name.endsWith(".json") && !name.startsWith("local-"),
  );
  for (const name of files) {
    const fixture = readJson(`${FIXTURES}/${name}`) as {
      expect: "pass" | "fail";
      message?: string;
      settings: unknown;
    };
    const problems = checkSettings(fixture.settings);
    const failed = problems.length > 0;
    if (failed !== (fixture.expect === "fail"))
      failures.push(
        `${name}: expected ${fixture.expect}, got ${failed ? `fail (${problems[0]})` : "pass"}`,
      );
    else if (
      fixture.message &&
      !problems.some((problem) => problem.includes(fixture.message!))
    )
      failures.push(
        `${name}: no problem mentions "${fixture.message}"; got: ${problems.join(" | ")}`,
      );
  }
  if (files.length === 0) failures.push(`no fixtures found in ${FIXTURES}`);
  return failures.length ? failures : [`${files.length}`];
}

const only = process.argv[2];
if (only) {
  const problems = checkSettings(readJson(only));
  if (problems.length > 0) {
    console.error(
      `${only} — ${problems.length} problem(s):\n  ${problems.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log(`check-settings — ${only} is clean.`);
  process.exit(0);
}

const fixtureResult = runFixtures();
if (fixtureResult.length > 1 || !/^\d+$/.test(fixtureResult[0]!)) {
  console.error(
    `check-settings — fixtures misbehaved:\n  ${fixtureResult.join("\n  ")}`,
  );
  process.exit(1);
}

const problems: string[] = [];
if (!existsSync(path.join(REPO_ROOT, SETTINGS)))
  problems.push(`${SETTINGS} does not exist; copy ${TEMPLATE} to it`);
else problems.push(...checkSettings(readJson(SETTINGS)));
if (isTracked(LOCAL))
  problems.push(
    `${LOCAL} is tracked; run \`git rm --cached ${LOCAL}\` (it is machine-local and may hold secrets)`,
  );

if (problems.length > 0) {
  console.error(
    `check-settings — ${problems.length} problem(s) in ${SETTINGS}:\n  ${problems.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(
  `check-settings — ${fixtureResult[0]} fixtures behaved; ${SETTINGS} is clean.`,
);
