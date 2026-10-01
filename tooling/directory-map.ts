/**
 * Writes docs/_generated/directory-map.md: every file under docs/ with its
 * title, layer and status. A listing, not a map (CF-05); docs/index.md is the map.
 * Never loaded by agents (docs/index.md, "Never").
 *
 *   yarn directory-map
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { listMarkdown, readMarkdown, REPO_ROOT } from "./lib/docs.ts";

const OUT = "docs/_generated/directory-map.md";
const files = listMarkdown("docs").filter(
  (f) => !f.startsWith("docs/_generated/"),
);

const rows: string[] = [];
let folder = "";
for (const file of files) {
  const dir = path.posix.dirname(file);
  if (dir !== folder) {
    folder = dir;
    rows.push(
      "",
      `## ${dir}/`,
      "",
      "| File | Title | Layer | Status |",
      "| --- | --- | --- | --- |",
    );
  }
  const fm = readMarkdown(file).frontmatter ?? {};
  const cell = (v: unknown) => String(v ?? "").replace(/\|/g, "\\|");
  rows.push(
    `| \`${path.posix.basename(file)}\` | ${cell(fm.title)} | ${cell(fm.layer)} | ${cell(fm.status)} |`,
  );
}

const out = [
  "# Directory map (generated)",
  "",
  `Every markdown file under \`docs/\` (${files.length}), written by \`yarn directory-map\`. Do not edit by hand. The map of the practice is \`docs/index.md\`.`,
  ...rows,
  "",
].join("\n");

mkdirSync(path.join(REPO_ROOT, path.posix.dirname(OUT)), { recursive: true });
writeFileSync(path.join(REPO_ROOT, OUT), out);
console.log(`directory-map — ${files.length} files → ${OUT}`);
