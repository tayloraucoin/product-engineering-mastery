/**
 * The story-coverage check (STK-8): every @pem/ui component has a story file
 * beside it, with at least one story, under the title grammar
 * `<Group>/<Kind>/<Name>` (`Primitives/Control/Button`,
 * `Composed/Control/Theme toggle`) or `Providers/<Name>` (`Providers/Theme`).
 * `story-coverage.test.ts` runs it on this package, so a component without a
 * story fails `yarn test`, naming the component.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const GROUPS = ["primitives", "composed"] as const;
const TITLE = /\btitle:\s*["']([^"']+)["']/;
const STORY_EXPORT = /^export const [A-Z]\w*\s*:/m;

const visible = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir).filter(
        (name) =>
          !name.startsWith(".") && statSync(path.join(dir, name)).isDirectory(),
      )
    : [];

/** `primitives` → `Primitives`; `theme-toggle` → `Theme toggle`. */
const titleCase = (kebab: string) => {
  const words = kebab.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** The problems with one component folder's stories, each naming the component. */
function checkFolder(
  dir: string,
  shown: string,
  storyFiles: string[],
  title: string,
): string[] {
  const found = storyFiles.filter((file) => existsSync(path.join(dir, file)));
  if (found.length === 0)
    return [`${shown}: no story; add ${storyFiles[0]} beside the component`];
  const source = readFileSync(path.join(dir, found[0]!), "utf8");
  const problems: string[] = [];
  if (!STORY_EXPORT.test(source))
    problems.push(`${shown}/${found[0]}: exports no story`);
  const actual = TITLE.exec(source)?.[1];
  if (actual !== title)
    problems.push(
      `${shown}/${found[0]}: title is ${actual ? `"${actual}"` : "missing"}; it must be "${title}"`,
    );
  return problems;
}

/** Every story-coverage problem in the package at `root`. */
export function storyCoverage(root: string, shownRoot = root): string[] {
  const src = path.join(root, "src");
  const problems: string[] = [];

  for (const group of GROUPS) {
    for (const kind of visible(path.join(src, group))) {
      for (const name of visible(path.join(src, group, kind))) {
        problems.push(
          ...checkFolder(
            path.join(src, group, kind, name),
            `${shownRoot}/src/${group}/${kind}/${name}`,
            [`${name}.stories.tsx`],
            `${titleCase(group)}/${titleCase(kind)}/${titleCase(name)}`,
          ),
        );
      }
    }
  }

  for (const name of visible(path.join(src, "providers"))) {
    const dir = path.join(src, "providers", name);
    const storyFiles = readdirSync(dir).filter((file) =>
      file.endsWith(".stories.tsx"),
    );
    problems.push(
      ...checkFolder(
        dir,
        `${shownRoot}/src/providers/${name}`,
        storyFiles.length ? storyFiles : [`${name}-provider.stories.tsx`],
        `Providers/${titleCase(name)}`,
      ),
    );
  }

  return problems;
}
