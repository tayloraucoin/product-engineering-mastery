/**
 * toolkit.json: the one home for layout facts (E-05, amended by A4 and A7).
 * Every tooling script loads it through here, so a missing or malformed key
 * fails loudly, with the key's name and the fix, before any check runs.
 *
 * Template: docs/engineering/templates/toolkit.template.json
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./docs.ts";

export const TOOLKIT_FILE = "toolkit.json";
const TEMPLATE = "docs/engineering/templates/toolkit.template.json";

const TIERS = ["starter", "overlay", "overlay-local"] as const;
const REVIEWER_STATUSES = ["draft", "ruled"] as const;
/** A work-id prefix: 2 to 5 upper-case letters or digits, letter first (A4). */
const PREFIX = /^[A-Z][A-Z0-9]{1,4}$/;
const APP_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ROLE = /^[a-z]+$/;

export type ToolkitApp = {
  /** Repo-relative folder of the app. */
  path: string;
  /** Work-id prefix for the app's one-offs, as in `WEB-41`. */
  prefix: string;
  /** Repo-relative folder of the app's design layer, or null when it has none. */
  designLayer: string | null;
};

export type ToolkitReviewer = {
  /** Repo-relative glob matched against a ticket's planned paths and its diff. */
  glob: string;
  /** Lower-case role name, as in the role's file name. */
  role: string;
  why: string;
  status?: (typeof REVIEWER_STATUSES)[number];
};

export type Toolkit = {
  tier: (typeof TIERS)[number];
  specsRoot: string;
  apps: Record<string, ToolkitApp>;
  toolkitPrefixes: string[];
  verify: { full: string; fast: string };
  migrationsDir: string | null;
  branchPattern: string;
  /** The branch agents never commit on and merged work lives on, as in "main". */
  protectedBranch: string;
  reviewers: ToolkitReviewer[];
};

const KEYS = [
  "tier",
  "specsRoot",
  "apps",
  "toolkitPrefixes",
  "verify",
  "migrationsDir",
  "branchPattern",
  "protectedBranch",
  "reviewers",
] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";
const isRelative = (value: string) =>
  !path.isAbsolute(value) && !value.startsWith("~") && !value.includes("..");

/** Every problem in a parsed toolkit file, each naming its key and the fix. */
export function validateToolkit(
  data: unknown,
  root: string = REPO_ROOT,
): string[] {
  const problems: string[] = [];
  const bad = (key: string, fix: string) => problems.push(`"${key}" ${fix}`);
  if (!isObject(data)) return ["the file must hold one JSON object"];

  for (const key of KEYS) {
    if (!(key in data))
      bad(key, `is missing; copy it from ${TEMPLATE} and fill it in`);
  }
  for (const key of Object.keys(data)) {
    if (!(KEYS as readonly string[]).includes(key))
      bad(key, `is not a toolkit key; the keys are ${KEYS.join(", ")}`);
  }

  if ("tier" in data && !(TIERS as readonly unknown[]).includes(data.tier))
    bad("tier", `must be one of ${TIERS.join(", ")}`);

  if ("specsRoot" in data) {
    if (!isText(data.specsRoot) || !isRelative(data.specsRoot))
      bad("specsRoot", 'must be a repo-relative folder, such as "specs"');
  }

  const prefixes = new Map<string, string>();
  const claim = (prefix: unknown, key: string) => {
    if (typeof prefix !== "string" || !PREFIX.test(prefix)) {
      bad(key, "must be 2 to 5 upper-case letters or digits, letter first");
      return;
    }
    const owner = prefixes.get(prefix);
    if (owner)
      bad(key, `repeats the prefix ${prefix} already used by ${owner}`);
    else prefixes.set(prefix, key);
  };

  if ("apps" in data) {
    if (!isObject(data.apps) || Object.keys(data.apps).length === 0) {
      bad(
        "apps",
        "must map at least one app name to { path, prefix, designLayer }",
      );
    } else {
      for (const [name, app] of Object.entries(data.apps)) {
        const at = `apps.${name}`;
        if (!APP_NAME.test(name)) bad(at, "must be a kebab-case app name");
        if (!isObject(app)) {
          bad(at, "must be { path, prefix, designLayer }");
          continue;
        }
        if (!isText(app.path) || !isRelative(app.path))
          bad(`${at}.path`, "must be a repo-relative folder");
        else if (
          !existsSync(path.join(root, app.path)) ||
          !statSync(path.join(root, app.path)).isDirectory()
        )
          bad(`${at}.path`, `points at ${app.path}, which is not a folder`);
        claim(app.prefix, `${at}.prefix`);
        if (!("designLayer" in app))
          bad(`${at}.designLayer`, "is missing; use a folder path, or null");
        else if (
          app.designLayer !== null &&
          (!isText(app.designLayer) || !isRelative(app.designLayer))
        )
          bad(`${at}.designLayer`, "must be a repo-relative folder, or null");
      }
    }
  }

  if ("toolkitPrefixes" in data) {
    if (
      !Array.isArray(data.toolkitPrefixes) ||
      data.toolkitPrefixes.length === 0
    )
      bad("toolkitPrefixes", 'must list at least one prefix, such as ["PEM"]');
    else
      data.toolkitPrefixes.forEach((prefix, i) =>
        claim(prefix, `toolkitPrefixes[${i}]`),
      );
  }

  if ("verify" in data) {
    if (!isObject(data.verify)) bad("verify", "must be { full, fast }");
    else
      for (const key of ["full", "fast"])
        if (!isText(data.verify[key]))
          bad(`verify.${key}`, "must be the command to run, as a string");
  }

  if ("migrationsDir" in data) {
    const dir = data.migrationsDir;
    if (dir !== null && (!isText(dir) || !isRelative(dir)))
      bad("migrationsDir", "must be a repo-relative folder, or null");
  }

  if ("branchPattern" in data) {
    if (!isText(data.branchPattern) || !data.branchPattern.includes("{id}"))
      bad("branchPattern", 'must contain {id}, as in "agent/{id}"');
  }

  if ("protectedBranch" in data) {
    if (!isText(data.protectedBranch) || /\s|\{id\}/.test(data.protectedBranch))
      bad("protectedBranch", 'must be a branch name, such as "main"');
  }

  if ("reviewers" in data) {
    if (!Array.isArray(data.reviewers)) {
      bad("reviewers", "must be a list of { glob, role, why }");
    } else {
      data.reviewers.forEach((row, i) => {
        const at = `reviewers[${i}]`;
        if (!isObject(row)) {
          bad(at, "must be { glob, role, why }");
          return;
        }
        if (!isText(row.glob) || !isRelative(row.glob))
          bad(`${at}.glob`, "must be a repo-relative glob");
        if (typeof row.role !== "string" || !ROLE.test(row.role))
          bad(`${at}.role`, 'must be a lower-case role name, such as "warden"');
        if (!isText(row.why))
          bad(`${at}.why`, "must say in one line why this role reads the path");
        if (
          "status" in row &&
          !(REVIEWER_STATUSES as readonly unknown[]).includes(row.status)
        )
          bad(`${at}.status`, `must be one of ${REVIEWER_STATUSES.join(", ")}`);
      });
    }
  }

  return problems;
}

/** Reads and validates a toolkit file; exits 1 with every problem named. */
export function loadToolkit(file: string = TOOLKIT_FILE): Toolkit {
  const target = path.join(REPO_ROOT, file);
  const stop = (problems: string[]): never => {
    console.error(
      `${file} — ${problems.length} problem(s):\n${problems
        .map((problem) => `  ${problem}`)
        .join("\n")}`,
    );
    process.exit(1);
  };
  if (!existsSync(target))
    stop([
      `the file does not exist; copy ${TEMPLATE} to ${file} and fill it in`,
    ]);
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(target, "utf8"));
  } catch (error) {
    stop([
      `is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    ]);
  }
  const problems = validateToolkit(data);
  if (problems.length > 0) stop(problems);
  return data as Toolkit;
}

/** Every work-id prefix the layout file admits, toolkit prefixes first. */
export function staticPrefixes(toolkit: Toolkit): string[] {
  return [
    ...toolkit.toolkitPrefixes,
    ...Object.values(toolkit.apps).map((app) => app.prefix),
  ];
}
