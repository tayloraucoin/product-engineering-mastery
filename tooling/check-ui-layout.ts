/**
 * yarn check-ui-layout (STK-22): keeps `@pem/ui` laid out the way the house
 * repos lay it out, and exits 1 with one line per problem.
 *
 *   node tooling/check-ui-layout.ts [package dir]
 *
 * The layout is written for people in `packages/ui/AGENTS.md`; the kinds are
 * named only here, in KINDS. What this checks:
 *
 * - `src/` holds only TOP's folders.
 * - A component is a kebab-case folder `primitives/<kind>/<name>/` or
 *   `composed/<kind>/<name>/`, with `<name>.tsx` and `index.ts`.
 * - `cva` is imported only in a `*.variants.ts` file.
 * - A primitive has no `copy.ts` and imports no other component.
 * - Every `exports` target in `package.json` exists, and none is a wildcard.
 *
 * Whether a component is generic enough to be a primitive is judgment; the
 * check only catches the two mechanical signs that it is not.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { REPO_ROOT } from "./lib/docs.ts";

export const TOP = [
  "primitives",
  "composed",
  "providers",
  "hooks",
  "lib",
  "styles",
] as const;

export const KINDS = [
  "control",
  "display",
  "feedback",
  "layout",
  "media",
  "navigation",
  "typography",
] as const;

const COMPONENT_ROOTS = ["primitives", "composed"];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SOURCE = /\.tsx?$/;
const CVA_IMPORT =
  /import\s*\{[^}]*\bcva\b[^}]*\}\s*from\s*["']class-variance-authority["']/;
const RELATIVE_IMPORT = /from\s*["'](\.{1,2}\/[^"']+)["']/g;

const visible = (dir: string) =>
  readdirSync(dir).filter((name) => !name.startsWith("."));
const isDir = (p: string) => statSync(p).isDirectory();

/** Every file under `dir`, recursively. */
function walk(dir: string): string[] {
  return visible(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return isDir(full) ? walk(full) : [full];
  });
}

/** Every string target in an `exports` value, however deeply conditioned. */
function targetsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object")
    return Object.values(value).flatMap(targetsOf);
  return [];
}

/** Every problem in the package at `root`, each naming its path. */
export function checkUiLayout(root: string): string[] {
  const shown = path.relative(REPO_ROOT, root).startsWith("..")
    ? root
    : path.relative(REPO_ROOT, root);
  const at = (rel: string) => `${shown}/${rel}`;
  const problems: string[] = [];
  const src = path.join(root, "src");
  if (!existsSync(src)) return [`${at("src")}: missing`];

  for (const name of visible(src)) {
    if (!(TOP as readonly string[]).includes(name))
      problems.push(
        `${at(`src/${name}`)}: not a layout folder; src/ holds only ${TOP.join(", ")}`,
      );
  }

  for (const group of COMPONENT_ROOTS) {
    const groupDir = path.join(src, group);
    if (!existsSync(groupDir)) continue;
    for (const kind of visible(groupDir)) {
      const kindRel = `src/${group}/${kind}`;
      const kindDir = path.join(groupDir, kind);
      if (!isDir(kindDir) || !(KINDS as readonly string[]).includes(kind)) {
        problems.push(
          `${at(kindRel)}: not a kind; ${group}/ holds only ${KINDS.join(", ")}`,
        );
        continue;
      }
      for (const name of visible(kindDir)) {
        const rel = `${kindRel}/${name}`;
        const dir = path.join(kindDir, name);
        if (!isDir(dir) || !KEBAB.test(name)) {
          problems.push(
            `${at(rel)}: a component is a kebab-case folder ${group}/<kind>/<name>/`,
          );
          continue;
        }
        for (const required of [`${name}.tsx`, "index.ts"]) {
          if (!existsSync(path.join(dir, required)))
            problems.push(`${at(rel)}: missing ${required}`);
        }
        if (group === "primitives") {
          if (existsSync(path.join(dir, "copy.ts")))
            problems.push(
              `${at(`${rel}/copy.ts`)}: a primitive owns no copy; a component with strings is composed`,
            );
          for (const file of walk(dir).filter((f) => SOURCE.test(f))) {
            for (const [, spec] of readFileSync(file, "utf8").matchAll(
              RELATIVE_IMPORT,
            )) {
              const target = path.relative(
                src,
                path.resolve(path.dirname(file), spec!),
              );
              const inOther =
                (target.startsWith(`primitives${path.sep}`) &&
                  !path.resolve(src, target).startsWith(dir + path.sep)) ||
                target.startsWith(`composed${path.sep}`);
              if (inOther)
                problems.push(
                  `${at(path.relative(root, file))}: a primitive imports no other component (${spec})`,
                );
            }
          }
        }
      }
    }
  }

  for (const file of walk(src)) {
    if (!SOURCE.test(file) || file.endsWith(".variants.ts")) continue;
    if (CVA_IMPORT.test(readFileSync(file, "utf8")))
      problems.push(
        `${at(path.relative(root, file))}: cva belongs in a <name>.variants.ts beside it`,
      );
  }

  const manifest = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  ) as { exports?: Record<string, unknown> };
  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    const targets = new Set(targetsOf(value));
    if (key.includes("*") || [...targets].some((t) => t.includes("*"))) {
      problems.push(
        `${at("package.json")}: exports "${key}" is a wildcard; list each entry`,
      );
      continue;
    }
    for (const target of targets) {
      if (!existsSync(path.join(root, target)))
        problems.push(
          `${at("package.json")}: exports "${key}" points at ${target}, which does not exist`,
        );
    }
  }

  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const root = path.resolve(
    process.argv[2] ?? path.join(REPO_ROOT, "packages/ui"),
  );
  const problems = checkUiLayout(root);
  if (problems.length) {
    console.error(
      `check-ui-layout: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log("check-ui-layout: ok");
}
