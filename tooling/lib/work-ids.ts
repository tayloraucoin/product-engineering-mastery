/**
 * Which work-ids a commit may open with (A4, convention 2): a toolkit prefix,
 * an app prefix, or an epic prefix that exists on disk, as `<PREFIX>: ` or
 * `<PREFIX>-<n>: `. One home for bash-guard and the native commit-msg hook.
 *
 * Node built-ins only, so the hooks that import it start fast.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export type Layout = {
  specsRoot: string;
  prefixes: string[];
  branchPattern: string;
  readable: boolean;
};

/** An epic's prefix exists once its folder does: <specsRoot>/<app>/epics/<EPIC>-<slug>/ (A4). */
export function findEpicPrefixes(root: string, specsRoot: string): string[] {
  const found: string[] = [];
  const dir = path.join(root, specsRoot);
  if (!existsSync(dir)) return found;
  for (const app of readdirSync(dir)) {
    const epics = path.join(dir, app, "epics");
    if (!existsSync(epics) || !statSync(epics).isDirectory()) continue;
    for (const name of readdirSync(epics)) {
      const prefix = name.match(/^([A-Z][A-Z0-9]{1,4})-/)?.[1];
      if (prefix) found.push(prefix);
    }
  }
  return found;
}

/** Reads toolkit.json without validating it; a missing file yields readable: false. */
export function readLayout(root: string, epicPrefixes?: string[]): Layout {
  try {
    const toolkit = JSON.parse(
      readFileSync(path.join(root, "toolkit.json"), "utf8"),
    ) as {
      specsRoot: string;
      toolkitPrefixes: string[];
      apps: Record<string, { prefix: string }>;
      branchPattern: string;
    };
    return {
      specsRoot: toolkit.specsRoot,
      prefixes: [
        ...toolkit.toolkitPrefixes,
        ...Object.values(toolkit.apps).map((app) => app.prefix),
        ...(epicPrefixes ?? findEpicPrefixes(root, toolkit.specsRoot)),
      ],
      branchPattern: toolkit.branchPattern,
      readable: true,
    };
  } catch {
    return {
      specsRoot: "specs",
      prefixes: [],
      branchPattern: "agent/{id}",
      readable: false,
    };
  }
}

export const hasWorkId = (subject: string, prefixes: string[]) =>
  prefixes.length > 0 &&
  new RegExp(`^(${prefixes.join("|")})(-\\d+)?: \\S`).test(subject);

/** Whether a branch is an agent branch: it matches branchPattern with any id. */
export function isAgentBranch(branch: string, branchPattern: string): boolean {
  const [before, after] = branchPattern.split("{id}");
  return (
    branch.startsWith(before ?? "") &&
    branch.endsWith(after ?? "") &&
    branch.length > (before ?? "").length + (after ?? "").length
  );
}
