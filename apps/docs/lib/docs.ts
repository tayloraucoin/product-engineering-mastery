import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import YAML from "yaml";

/**
 * The docs app renders markdown that lives OUTSIDE it: the root `AGENTS.md`,
 * and everything under the root `docs/`. Those
 * files are the source of truth (agents and GitHub read them raw); this app is
 * only a reader (records 0004, 0007).
 *
 * `next dev` and `next build` run with the app directory as the working
 * directory (turbo runs each task in its package), so the repo root is two
 * levels up.
 */
const REPO_ROOT = path.resolve(process.cwd(), "../..");

/**
 * Every page is prerendered (`dynamicParams = false`), so these reads happen
 * only at build time. The ignore comment stops Turbopack from tracing the
 * whole repository into the server output on their account.
 */
function fromRepoRoot(relativePath: string) {
  return path.join(/* turbopackIgnore: true */ REPO_ROOT, relativePath);
}

/** Directories rendered, and the route prefix each one mounts at. */
const CONTENT_ROOTS = [{ dir: "docs", prefix: [] as string[] }];
const SPINE_PATH = "AGENTS.md";
const INDEX_PATH = "docs/index.md";
const START_PATH = "docs/README.md";
const MAP_PATH = "docs/_generated/directory-map.md";
/** The Start group, in this order; each is labelled with its file name. */
const START_PATHS = [START_PATH, INDEX_PATH, SPINE_PATH, MAP_PATH];
/** A folder's landing page: README.md, or docs/index.md at the root (record 0006). */
const LANDING = "README.md";

/**
 * Sidebar groups and their labels. Keys are `layer` values (docs/index.md,
 * CF-16). The sidebar lists them by label (`getGroups`); this order only
 * breaks ties in search and static generation.
 */
const GROUPS: { key: string; label: string }[] = [
  { key: "start", label: "Start" },
  { key: "decisions", label: "Decisions" },
  { key: "design", label: "Design" },
  { key: "product", label: "Product" },
  { key: "measurement", label: "Measurement" },
  { key: "runbooks", label: "Runbooks" },
  { key: "roles", label: "Roles" },
  { key: "prompts", label: "Prompts" },
  { key: "references", label: "References" },
  { key: "engineering", label: "Engineering" },
  { key: "workflows", label: "Workflows" },
  { key: "research", label: "Research" },
];

/** Never listed in the sidebar; still rendered and searchable (P-B; CF-05). */
const HIDDEN_GROUPS = new Set(["generated"]);

export type Frontmatter = Record<string, unknown>;

export type Doc = {
  /** Route segments; `[]` is the map (`docs/index.md`). */
  slug: string[];
  href: string;
  title: string;
  /** The sidebar label: the title, plus the file name for Start entries. */
  navTitle: string;
  description: string | null;
  /** Repo-root-relative POSIX path, e.g. `docs/design/canon.md`. */
  relativePath: string;
  /** Sidebar group key (a `layer` value, or start / generated). */
  group: string;
  /** Subfolder below the group's folder, for sub-headings (e.g. `templates`). */
  folder: string;
  status: string | null;
  hidden: boolean;
  frontmatter: Frontmatter | null;
  body: string;
};

export type Group = { key: string; label: string; docs: Doc[] };

/** Read once per render; `next dev` re-reads on every request. */
export const getAllDocs = cache((): Doc[] => {
  const files = [
    INDEX_PATH,
    SPINE_PATH,
    ...CONTENT_ROOTS.flatMap(({ dir }) => listMarkdownFiles(dir)).filter(
      (f) => f !== INDEX_PATH,
    ),
  ];
  return files.map(readDoc).sort(compareDocs);
});

export function getDocBySlug(slug: string[]): Doc | undefined {
  const href = toHref(slug);
  return getAllDocs().find((doc) => doc.href === href);
}

/** Visible sidebar groups with their documents: Start first, the rest by label. */
export function getGroups(): Group[] {
  const docs = getAllDocs();
  return GROUPS.filter(({ key }) => !HIDDEN_GROUPS.has(key))
    .map(({ key, label }) => ({
      key,
      label,
      docs: docs.filter((d) => d.group === key),
    }))
    .filter((group) => group.docs.length > 0)
    .sort((a, b) =>
      a.key === "start"
        ? -1
        : b.key === "start"
          ? 1
          : a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
    );
}

export function getHiddenCount() {
  return getAllDocs().filter((doc) => doc.hidden).length;
}

export function groupLabel(key: string) {
  return GROUPS.find((group) => group.key === key)?.label ?? "Generated";
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
  const absolute = fromRepoRoot(relativeDir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(relativePath);
    return entry.name.endsWith(".md") ? [relativePath] : [];
  });
}

function splitFrontmatter(text: string): {
  frontmatter: Frontmatter | null;
  body: string;
} {
  if (!text.startsWith("---\n")) return { frontmatter: null, body: text };
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: null, body: text };
  try {
    const parsed: unknown = YAML.parse(text.slice(4, end));
    return {
      frontmatter:
        parsed && typeof parsed === "object" ? (parsed as Frontmatter) : {},
      body: text.slice(end + 5),
    };
  } catch {
    return { frontmatter: null, body: text };
  }
}

function readDoc(relativePath: string): Doc {
  const { frontmatter, body } = splitFrontmatter(
    fs.readFileSync(fromRepoRoot(relativePath), "utf8"),
  );
  const slug = toSlug(relativePath);
  const group = toGroup(relativePath, frontmatter);
  const str = (key: string) => {
    const value = frontmatter?.[key];
    return typeof value === "string" && value.length > 0 ? value : null;
  };
  // Titles are plain text in the sidebar, the tab and search; drop inline-code backticks.
  const title = (
    str("title") ??
    body.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    path.posix.basename(relativePath, ".md")
  ).replace(/`/g, "");
  return {
    slug,
    href: toHref(slug),
    title,
    navTitle:
      group === "start"
        ? `${title} (${path.posix.basename(relativePath)})`
        : title,
    description: str("description"),
    relativePath,
    group,
    folder: toFolder(relativePath, group),
    status: str("status"),
    hidden: HIDDEN_GROUPS.has(group),
    frontmatter,
    body,
  };
}

function toSlug(relativePath: string): string[] {
  if (relativePath === SPINE_PATH) return ["agents"];
  if (relativePath === INDEX_PATH) return [];
  const root = CONTENT_ROOTS.find(({ dir }) =>
    relativePath.startsWith(`${dir}/`),
  )!;
  const segments = relativePath
    .slice(root.dir.length + 1, -".md".length)
    .replace(/\.template$/, "-template")
    .toLowerCase()
    .split("/");
  // A folder's README.md is its route; the docs root keeps index.md as the map.
  const last = segments.at(-1);
  const slug =
    last === "readme" && relativePath !== START_PATH
      ? segments.slice(0, -1)
      : segments;
  return [...root.prefix, ...slug];
}

function toHref(slug: string[]) {
  return `/${slug.join("/")}`;
}

function toGroup(
  relativePath: string,
  frontmatter: Frontmatter | null,
): string {
  if (START_PATHS.includes(relativePath)) return "start";
  if (relativePath.startsWith("docs/_generated/")) return "generated";
  const layer = frontmatter?.layer;
  return typeof layer === "string" && GROUPS.some((g) => g.key === layer)
    ? layer
    : "engineering";
}

/** The folder path between the group's own folder and the file, e.g. `templates/refs`. */
function toFolder(relativePath: string, group: string): string {
  if (group === "start") return "";
  const segments = relativePath.split("/").slice(0, -1);
  const rootDepth = relativePath.startsWith("apps/web/") ? 3 : 2;
  return segments.slice(rootDepth).join("/");
}

/** Group order, then folder, then a folder's index first, then path. */
function compareDocs(a: Doc, b: Doc) {
  const order = (doc: Doc) => GROUPS.findIndex((g) => g.key === doc.group);
  if (order(a) !== order(b)) return order(a) - order(b);
  if (a.group === "start") {
    return (
      START_PATHS.indexOf(a.relativePath) - START_PATHS.indexOf(b.relativePath)
    );
  }
  if (a.folder !== b.folder) {
    if (a.folder === "") return -1;
    if (b.folder === "") return 1;
    return a.folder.localeCompare(b.folder);
  }
  const isLanding = (doc: Doc) =>
    path.posix.basename(doc.relativePath) === LANDING;
  if (isLanding(a) !== isLanding(b)) return isLanding(a) ? -1 : 1;
  return a.relativePath.localeCompare(b.relativePath);
}

/** Plain text for the search index: markdown syntax stripped, words kept. */
export function toSearchText(body: string) {
  return body
    .replace(/```\w*/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|]/g, " ")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toHeadings(body: string) {
  return [...body.matchAll(/^#{1,4}\s+(.+)$/gm)]
    .map((m) => m[1]!.trim())
    .join(" · ");
}
