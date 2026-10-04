/**
 * yarn check-catalog (CAT-3, D-CAT-7): the check-off for the component kit
 * and the catalog.
 *
 *   node tooling/check-catalog.ts [--ticket <id>] [--write] [--root <dir>]
 *
 * `packages/catalog/manifest.json` is the plan: every component the kit
 * (`@pem/ui`) and the shelf (`@pem/catalog`) should hold, with its source,
 * layer, kind, wave and ticket. Each entry's state is derived from the tree,
 * never typed: planned (no folder yet), present (the component file exists),
 * storied (its story has the right title, tags and provenance), or link-only
 * (an item recorded by link and reason, CS-09). `STATUS.md` beside the
 * manifest is the generated view; `--write` rewrites it.
 *
 * Exits 1 on: a manifest entry that is malformed or names an unknown source,
 * kind or layer, or a path outside the layout; a story whose title, tags
 * (`source:`, `verdict:`, `layer:`) or provenance (`upstream`, `licence`)
 * disagree with its entry; a component story in either package with no
 * entry; a stale STATUS.md; and, with `--ticket`, any entry of that ticket
 * not yet storied or link-only.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { KINDS } from "./check-ui-layout.ts";
import { REPO_ROOT } from "./lib/docs.ts";

const MANIFEST = "packages/catalog/manifest.json";
const STATUS = "packages/catalog/STATUS.md";
const TARGETS = ["ui", "catalog"] as const;
const LAYERS = ["primitive", "composed", "block"] as const;
const VERDICTS = ["kit", "after-edits", "shelf", "mine", "unruled"] as const;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

type Source = {
  label: string;
  name: string;
  verdict: (typeof VERDICTS)[number];
  licence: string;
  homepage: string | null;
  ruling: string;
};
type Entry = {
  id: string;
  name: string;
  source: string;
  target: (typeof TARGETS)[number];
  path: string;
  kind: string;
  layer: (typeof LAYERS)[number];
  wave: number | null;
  ticket: string;
  linkOnly?: { url: string; reason: string };
};
type Manifest = { sources: Record<string, Source>; entries: Entry[] };
export type State = "planned" | "present" | "storied" | "link-only";
export type Result = {
  problems: string[];
  states: Map<string, State>;
  status: string;
};

const titleCase = (kebab: string) => {
  const words = kebab.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** The verdict tag an entry's story carries: `kit` in @pem/ui, else its source's. */
export const verdictOf = (entry: Entry, sources: Record<string, Source>) =>
  entry.target === "ui" ? "kit" : sources[entry.source]!.verdict;

/** Where an entry must live, by its target, layer, kind and source. */
function expectedDir(entry: Entry): string {
  const name = path.posix.basename(entry.path);
  if (entry.target === "ui") {
    const group = entry.layer === "primitive" ? "primitives" : "composed";
    return `packages/ui/src/${group}/${entry.kind}/${name}`;
  }
  return `packages/catalog/src/${entry.source}/${entry.kind}/${name}`;
}

/** The story title an entry's story must carry. */
export function expectedTitle(
  entry: Entry,
  sources: Record<string, Source>,
): string {
  const name = titleCase(path.posix.basename(entry.path));
  if (entry.target === "ui") {
    const group = entry.layer === "primitive" ? "Primitives" : "Composed";
    return `${group}/${titleCase(entry.kind)}/${name}`;
  }
  return `Catalog/${titleCase(entry.kind)}/${name}/${sources[entry.source]!.label}`;
}

function validate(manifest: Manifest): string[] {
  const problems: string[] = [];
  const at = (entry: Entry) => `${MANIFEST}: ${entry.id ?? "(no id)"}`;
  for (const [id, source] of Object.entries(manifest.sources ?? {})) {
    if (!KEBAB.test(id))
      problems.push(`${MANIFEST}: source "${id}" is not kebab-case`);
    if (!VERDICTS.includes(source.verdict))
      problems.push(
        `${MANIFEST}: source "${id}" has verdict "${source.verdict}"; use one of ${VERDICTS.join(", ")}`,
      );
    if (!source.label || source.label.includes("/"))
      problems.push(
        `${MANIFEST}: source "${id}" needs a label without "/" (it is a sidebar level)`,
      );
  }
  const ids = new Set<string>();
  for (const entry of manifest.entries ?? []) {
    if (ids.has(entry.id)) problems.push(`${at(entry)}: duplicate id`);
    ids.add(entry.id);
    if (!manifest.sources?.[entry.source])
      problems.push(`${at(entry)}: source "${entry.source}" is not in sources`);
    if (!TARGETS.includes(entry.target))
      problems.push(`${at(entry)}: target must be ui or catalog`);
    if (!LAYERS.includes(entry.layer))
      problems.push(`${at(entry)}: layer must be one of ${LAYERS.join(", ")}`);
    if (!(KINDS as readonly string[]).includes(entry.kind))
      problems.push(
        `${at(entry)}: kind "${entry.kind}" is not one of ${KINDS.join(", ")}`,
      );
    if (entry.target === "ui" && entry.layer === "block")
      problems.push(
        `${at(entry)}: a block is a page and lives in the catalog, never the kit`,
      );
    if (!entry.ticket || !entry.name)
      problems.push(`${at(entry)}: needs a name and a ticket`);
    if (entry.linkOnly && (!entry.linkOnly.url || !entry.linkOnly.reason))
      problems.push(`${at(entry)}: linkOnly needs a url and a reason`);
    if (
      manifest.sources?.[entry.source] &&
      LAYERS.includes(entry.layer) &&
      entry.path !== expectedDir(entry)
    )
      problems.push(
        `${at(entry)}: path is ${entry.path}; it must be ${expectedDir(entry)}`,
      );
  }
  return problems;
}

/** Every `*.stories.tsx` under a component root, repo-relative. */
function componentStories(root: string): string[] {
  const out: string[] = [];
  const walk = (rel: string) => {
    const abs = path.join(root, rel);
    if (!existsSync(abs)) return;
    for (const name of readdirSync(abs)) {
      if (name.startsWith(".")) continue;
      const child = path.posix.join(rel, name);
      if (statSync(path.join(root, child)).isDirectory()) walk(child);
      else if (name.endsWith(".stories.tsx")) out.push(child);
    }
  };
  walk("packages/ui/src/primitives");
  walk("packages/ui/src/composed");
  walk("packages/catalog/src");
  return out;
}

/** The problems with one entry's story, and whether it is storied. */
function checkStory(
  root: string,
  entry: Entry,
  sources: Record<string, Source>,
): string[] {
  const name = path.posix.basename(entry.path);
  const file = `${entry.path}/${name}.stories.tsx`;
  const text = readFileSync(path.join(root, file), "utf8");
  const problems: string[] = [];
  const title = /\btitle:\s*["']([^"']+)["']/.exec(text)?.[1];
  const want = expectedTitle(entry, sources);
  if (title !== want)
    problems.push(
      `${file}: title is ${title ? `"${title}"` : "missing"}; it must be "${want}"`,
    );
  const tags = /\btags:\s*\[([^\]]*)\]/.exec(text)?.[1] ?? "";
  for (const tag of [
    `source:${entry.source}`,
    `verdict:${verdictOf(entry, sources)}`,
    `layer:${entry.layer}`,
  ])
    if (!tags.includes(`"${tag}"`))
      problems.push(`${file}: tags lack "${tag}" (the manifest's ${entry.id})`);
  const provenance = /\bprovenance:\s*\{([\s\S]*?)\}/.exec(text)?.[1] ?? "";
  for (const field of ["upstream", "licence"])
    if (!new RegExp(`\\b${field}:`).test(provenance))
      problems.push(`${file}: parameters.provenance needs ${field}`);
  return problems;
}

function render(manifest: Manifest, states: Map<string, State>): string {
  const tickets = [...new Set(manifest.entries.map((e) => e.ticket))];
  const count = (ticket: string, state: State) =>
    manifest.entries.filter(
      (e) => e.ticket === ticket && states.get(e.id) === state,
    ).length;
  const lines = [
    "# Component status",
    "",
    "Generated by `yarn check-catalog --write` from `manifest.json` and the tree; `yarn check-catalog` fails when this file is stale. Do not edit it. A state is derived, never typed: **planned** (no folder yet), **present** (the component file exists), **storied** (its story's title, tags and provenance agree with the manifest), **link-only** (kept by link and reason, CS-09).",
    "",
    "## By ticket",
    "",
    "| Ticket | Entries | Planned | Present | Storied | Link-only |",
    "| --- | --- | --- | --- | --- | --- |",
    ...tickets.map((t) => {
      const total = manifest.entries.filter((e) => e.ticket === t).length;
      return `| ${t} | ${total} | ${count(t, "planned")} | ${count(t, "present")} | ${count(t, "storied")} | ${count(t, "link-only")} |`;
    }),
  ];
  for (const ticket of tickets) {
    lines.push(
      "",
      `## ${ticket}`,
      "",
      "| Component | Source | Shelf | Layer | Kind | State |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    for (const e of manifest.entries.filter((x) => x.ticket === ticket))
      lines.push(
        `| ${e.name} | ${manifest.sources[e.source]?.label ?? e.source} | ${e.target === "ui" ? "kit" : "catalog"} | ${e.layer} | ${e.kind} | ${states.get(e.id)} |`,
      );
  }
  return `${lines.join("\n")}\n`;
}

export function checkCatalog(
  root: string,
  options: { ticket?: string; write?: boolean } = {},
): Result {
  const manifestPath = path.join(root, MANIFEST);
  if (!existsSync(manifestPath))
    return {
      problems: [`${MANIFEST}: missing`],
      states: new Map(),
      status: "",
    };
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  const problems = validate(manifest);
  const states = new Map<string, State>();
  if (problems.length) return { problems, states, status: "" };

  const known = new Set<string>();
  for (const entry of manifest.entries) {
    const name = path.posix.basename(entry.path);
    known.add(`${entry.path}/${name}.stories.tsx`);
    if (entry.linkOnly) {
      states.set(entry.id, "link-only");
      continue;
    }
    if (!existsSync(path.join(root, entry.path, `${name}.tsx`))) {
      states.set(entry.id, "planned");
      continue;
    }
    const storyFile = path.join(root, entry.path, `${name}.stories.tsx`);
    if (!existsSync(storyFile)) {
      states.set(entry.id, "present");
      continue;
    }
    const storyProblems = checkStory(root, entry, manifest.sources);
    problems.push(...storyProblems);
    states.set(entry.id, storyProblems.length ? "present" : "storied");
  }

  for (const story of componentStories(root))
    if (!known.has(story))
      problems.push(`${story}: no manifest entry; add one to ${MANIFEST}`);

  const status = render(manifest, states);
  const statusPath = path.join(root, STATUS);
  if (options.write) writeFileSync(statusPath, status);
  else if (
    !existsSync(statusPath) ||
    readFileSync(statusPath, "utf8") !== status
  )
    problems.push(`${STATUS}: stale; run yarn check-catalog --write`);

  if (options.ticket) {
    const mine = manifest.entries.filter((e) => e.ticket === options.ticket);
    if (!mine.length)
      problems.push(`${MANIFEST}: no entry belongs to ${options.ticket}`);
    for (const e of mine) {
      const state = states.get(e.id);
      if (state !== "storied" && state !== "link-only")
        problems.push(
          `${options.ticket}: ${e.id} is ${state}; it must be storied or link-only`,
        );
    }
  }
  return { problems, states, status };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const flag = (name: string) => {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args[i + 1];
  };
  const root = path.resolve(flag("--root") ?? REPO_ROOT);
  const { problems, states } = checkCatalog(root, {
    ticket: flag("--ticket"),
    write: args.includes("--write"),
  });
  if (problems.length) {
    console.error(
      `check-catalog: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`,
    );
    process.exit(1);
  }
  const done = [...states.values()].filter(
    (s) => s === "storied" || s === "link-only",
  ).length;
  console.log(
    `check-catalog: ${done} of ${states.size} entries done; STATUS.md current.`,
  );
}
