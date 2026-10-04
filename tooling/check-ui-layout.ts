/**
 * yarn check-ui-layout (STK-22): keeps `@pem/ui` laid out the way the house
 * repos lay it out, and exits 1 with one line per problem.
 *
 *   node tooling/check-ui-layout.ts [package dir]
 *
 * The layout is written for people in `packages/ui/AGENTS.md`; this file holds
 * the two lists it depends on. `src/` holds only TOP's folders. A component is
 * a folder `primitives/<kind>/<name>/` or `composed/<kind>/<name>/`, with
 * `<name>.tsx` and `index.ts`; its `cva()` lives in `<name>.variants.ts`. Every
 * `exports` target in the package's `package.json` exists.
 *
 * A product that needs a new kind adds it to KINDS and to the AGENTS.md line
 * in the same change.
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

const visible = (dir: string) =>
  readdirSync(dir).filter((name) => !name.startsWith("."));
const isDir = (p: string) => statSync(p).isDirectory();

/** Every problem in the package at `root`, each naming its path. */
export function checkUiLayout(root: string): string[] {
  const shown = path.relative(REPO_ROOT, root).startsWith("..")
    ? root
    : path.relative(REPO_ROOT, root);
  const at = (rel: string) => `${shown}/${rel}`;
  const problems: string[] = [];
  const src = path.join(root, "src");

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
        const main = path.join(dir, `${name}.tsx`);
        if (existsSync(main) && /\bcva\(/.test(readFileSync(main, "utf8")))
          problems.push(
            `${at(`${rel}/${name}.tsx`)}: cva() belongs in ${name}.variants.ts`,
          );
      }
    }
  }

  const manifest = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  ) as { exports?: Record<string, string | Record<string, string>> };
  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    const targets = typeof value === "string" ? [value] : Object.values(value);
    for (const target of new Set(targets)) {
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
