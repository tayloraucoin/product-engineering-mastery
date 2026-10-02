/**
 * Guards the tracked agent permissions (E-15; ruling (d)).
 *
 *   yarn check-settings            fixtures first, then .claude/settings.json
 *   yarn check-settings <file>     one settings file, no fixtures
 *
 * Fails when: a required deny is missing, an allow rule admits every shell
 * command, a value holds a machine path, the sandbox is off, a registered hook
 * points at a script that does not exist, or settings.local.json is tracked.
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
  "Read(**/.env.*)",
  "Read(**/secrets/**)",
  "Read(**/*.pem)",
  "Read(~/.ssh/**)",
  "Read(~/.aws/**)",
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

export function checkSettings(settings: unknown): string[] {
  const problems: string[] = [];
  if (!isObject(settings)) return ["the file must hold one JSON object"];
  const permissions = isObject(settings.permissions)
    ? settings.permissions
    : {};
  const deny = strings(permissions.deny);
  const allow = strings(permissions.allow);

  for (const rule of REQUIRED_DENIES) {
    if (!deny.includes(rule))
      problems.push(
        `permissions.deny is missing ${rule}; restore it from ${TEMPLATE}`,
      );
  }
  for (const rule of allow) {
    if (/^Bash(\(\s*\*?\s*\)|\(\*:\*\))?$/.test(rule))
      problems.push(
        `permissions.allow holds ${rule}, which admits every shell command; ` +
          "replace it with the specific commands, as in the template",
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
    const script = value.match(/^\$\{CLAUDE_PROJECT_DIR\}\/(.+)$/);
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
