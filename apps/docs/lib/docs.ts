import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * The docs app renders markdown that lives OUTSIDE it: the root `AGENTS.md`
 * and everything under the root `docs/`. Those files are the source of truth
 * (agents and GitHub read them raw); this app is only a reader.
 *
 * `next dev` and `next build` run with the app directory as the working
 * directory (turbo runs each task in its package), so the repo root is two
 * levels up.
 */
const REPO_ROOT = path.resolve(process.cwd(), "../..");
const DOCS_DIR = "docs";

/**
 * Every page is prerendered (`dynamicParams = false`), so these reads happen
 * only at build time. The ignore comment stops Turbopack from tracing the
 * whole repository into the server output on their account.
 */
function fromRepoRoot(relativePath: string) {
  return path.join(/* turbopackIgnore: true */ REPO_ROOT, relativePath);
}

export type Doc = {
  /** Route segments; `[]` is the index (`docs/README.md`). */
  slug: string[];
  href: string;
  title: string;
  /** Repo-root-relative POSIX path, e.g. `docs/architecture/tech-stack.md`. */
  relativePath: string;
  /** Sidebar group: "Start", or the folder under `docs/`. */
  section: string;
  body: string;
};

const INDEX_PATH = `${DOCS_DIR}/README.md`;
const SPINE_PATH = "AGENTS.md";

/**
 * The index, then the agent spine, then every other doc. Read once per
 * render; `next dev` re-reads on every request.
 */
export const getAllDocs = cache((): Doc[] => {
  const rest = listMarkdownFiles(DOCS_DIR)
    .filter((relativePath) => relativePath !== INDEX_PATH)
    .sort(compareDocPaths);
  return [INDEX_PATH, SPINE_PATH, ...rest].map(readDoc);
});

export function getDocBySlug(slug: string[]): Doc | undefined {
  const href = toHref(slug);
  return getAllDocs().find((doc) => doc.href === href);
}

/**
 * Maps a markdown link written inside `fromPath` to a route in this app.
 * Returns `null` when the target is a repo file the app does not render.
 */
export function resolveDocLink(
  fromPath: string,
  target: string,
): string | null {
  const [targetPath = "", hash] = target.split("#");
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(fromPath), targetPath),
  );
  const doc = getAllDocs().find(
    (candidate) => candidate.relativePath === resolved,
  );
  if (!doc) return null;
  return hash ? `${doc.href}#${hash}` : doc.href;
}

function listMarkdownFiles(relativeDir: string): string[] {
  const entries = fs.readdirSync(fromRepoRoot(relativeDir), {
    withFileTypes: true,
  });
  return entries.flatMap((entry) => {
    const relativePath = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(relativePath);
    return entry.name.endsWith(".md") ? [relativePath] : [];
  });
}

/** READMEs first within a folder, then alphabetical. */
function compareDocPaths(a: string, b: string) {
  const rank = (p: string) =>
    `${path.posix.dirname(p)}/${path.posix.basename(p) === "README.md" ? "" : path.posix.basename(p)}`;
  return rank(a).localeCompare(rank(b));
}

function readDoc(relativePath: string): Doc {
  const body = fs.readFileSync(fromRepoRoot(relativePath), "utf8");
  const slug = toSlug(relativePath);
  return {
    slug,
    href: toHref(slug),
    title:
      body.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
      path.posix.basename(relativePath, ".md"),
    relativePath,
    section: toSection(relativePath),
    body,
  };
}

function toSlug(relativePath: string): string[] {
  if (relativePath === SPINE_PATH) return ["agents"];
  const segments = relativePath
    .slice(DOCS_DIR.length + 1, -".md".length)
    .toLowerCase()
    .split("/");
  return segments.at(-1) === "readme" ? segments.slice(0, -1) : segments;
}

function toHref(slug: string[]) {
  return `/${slug.join("/")}`;
}

function toSection(relativePath: string) {
  const segments = relativePath.split("/");
  if (segments[0] !== DOCS_DIR || segments.length < 3) return "Start";
  const folder = segments[1] ?? "";
  return folder.charAt(0).toUpperCase() + folder.slice(1).replaceAll("-", " ");
}
