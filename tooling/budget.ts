/**
 * The context budget, enforced (docs/index.md "Budget per build"; CF-03).
 * Reads the caps from docs/index.md itself, so the table there is the contract.
 *
 *   yarn budget
 *
 * Token counts are an estimate: characters / 4 after collapsing runs of
 * whitespace (markdown table padding costs almost nothing once tokenized).
 * A sharper counter is part of thread P-F.
 */

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  readMarkdown,
  readText,
  REPO_ROOT,
  splitFrontmatter,
} from "./lib/docs.ts";

const INDEX = "docs/index.md";
const LINE_CAPS: Record<string, number> = {
  "AGENTS.md": 100,
  "CLAUDE.md": 20,
  [INDEX]: 80,
};

const exists = (rel: string) => existsSync(path.join(REPO_ROOT, rel));
const estimate = (text: string) =>
  Math.ceil(text.replace(/\s+/g, " ").length / 4);
const tokensOf = (rel: string) => (exists(rel) ? estimate(readText(rel)) : 0);

function listIn(relDir: string, filter: (name: string) => boolean): string[] {
  if (!exists(relDir)) return [];
  return readdirSync(path.join(REPO_ROOT, relDir))
    .filter(filter)
    .map((name) => path.posix.join(relDir, name));
}

/** "always 4,000 + design layer 5,000 + …" → { always: 4000, "design layer": 5000, … } */
function parseCaps(): {
  rows: Map<string, { cap: number; parts: Map<string, number> }>;
} {
  const text = readText(INDEX);
  const rows = new Map<string, { cap: number; parts: Map<string, number> }>();
  for (const line of text.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 5 || !/^[\d,]+$/.test(cells[3] ?? "")) continue;
    const parts = new Map<string, number>();
    for (const m of cells[2]!.matchAll(
      /([a-z`/][a-z`/ ,()'-]*?)\s+([\d,]{3,})/gi,
    )) {
      parts.set(
        m[1]!.replace(/[`]/g, "").trim().toLowerCase(),
        Number(m[2]!.replace(/,/g, "")),
      );
    }
    rows.set(cells[1]!.toLowerCase(), {
      cap: Number(cells[3]!.replace(/,/g, "")),
      parts,
    });
  }
  return { rows };
}

/** Descriptions the model sees in every session: model-invocable skills and subagents. */
function listingTokens(): { tokens: number; skills: number; agents: number } {
  let tokens = 0;
  const skills = listIn(".claude/skills", (n) => !n.endsWith(".md"))
    .map((dir) => `${dir}/SKILL.md`)
    .filter(exists)
    .filter(
      (rel) =>
        readMarkdown(rel).frontmatter?.["disable-model-invocation"] !== true,
    );
  for (const rel of skills)
    tokens += estimate(
      String(readMarkdown(rel).frontmatter?.description ?? ""),
    );
  const agents = listIn(".claude/agents", (n) => n.endsWith(".md"));
  for (const rel of agents)
    tokens += estimate(
      String(readMarkdown(rel).frontmatter?.description ?? ""),
    );
  return { tokens, skills: skills.length, agents: agents.length };
}

/** The canon section a forked critic loads: §2 (anti-patterns) and §3 (rubric). */
function canonCriticSlice(): number {
  const { body } = splitFrontmatter(readText("docs/design/canon.md"));
  const start = body.indexOf("\n## 2.");
  const end = body.indexOf("\n## 4.");
  return estimate(body.slice(start, end === -1 ? undefined : end));
}

function largest(files: string[]) {
  return files.reduce((max, f) => Math.max(max, tokensOf(f)), 0);
}

const { rows } = parseCaps();
const errors: string[] = [];
const report: string[] = [];
const line = (label: string, tokens: number, cap?: number, note = "") => {
  const over = cap !== undefined && tokens > cap;
  if (over) errors.push(`${label}: ${tokens} tokens over the ${cap} cap`);
  report.push(
    `${over ? "FAIL" : "ok  "} ${label.padEnd(44)} ${String(tokens).padStart(6)}${cap ? ` / ${cap}` : ""}${note ? `  ${note}` : ""}`,
  );
};

// Line caps.
for (const [rel, cap] of Object.entries(LINE_CAPS)) {
  const lines = readText(rel).trimEnd().split("\n").length;
  if (lines > cap)
    errors.push(`${rel}: ${lines} lines over the ${cap}-line cap`);
  report.push(
    `${lines > cap ? "FAIL" : "ok  "} ${`${rel} (lines)`.padEnd(44)} ${String(lines).padStart(6)} / ${cap}`,
  );
}

// What each build loads. Missing files (Phase 3 and later) count as zero and are named.
const productLayer = listIn("apps/web/docs/design", (n) => n.endsWith(".md"));
const example = [
  "apps/web/specs/_example/brief.md",
  "apps/web/specs/_example/package.md",
];
const skillBodies = listIn(".claude/skills", (n) => !n.endsWith(".md"))
  .map((d) => `${d}/SKILL.md`)
  .filter(exists);
const listing = listingTokens();

const always =
  tokensOf("AGENTS.md") +
  tokensOf("CLAUDE.md") +
  tokensOf(INDEX) +
  listing.tokens;
const canon = tokensOf("docs/design/canon.md");
const uiRule = tokensOf(".claude/rules/ui.md");
const design = canon + productLayer.reduce((s, f) => s + tokensOf(f), 0);
const briefAndPackage = example.reduce((s, f) => s + tokensOf(f), 0);
const skillBody = largest(skillBodies);
const nonUiRules =
  tokensOf(".claude/rules/ts.md") +
  tokensOf(".claude/rules/testing.md") +
  tokensOf("apps/web/AGENTS.md");

const ui = rows.get("ui build");
const nonUi = rows.get("non-ui build");
const critic = rows.get("critic pass (forked)");
if (!ui || !nonUi || !critic)
  throw new Error(
    "docs/index.md budget table is missing a row this script reads",
  );

const pending = (files: string[]) =>
  files.some(exists) ? "" : "(not written yet)";

line(
  "always-on",
  always,
  ui.parts.get("always"),
  `skills ${listing.skills}, agents ${listing.agents}`,
);
line(
  "design layer (canon + product layer)",
  design,
  ui.parts.get("design layer"),
  productLayer.length ? "" : "(product layer not written yet)",
);
line(
  "brief and package (demo example)",
  briefAndPackage,
  ui.parts.get("brief and package"),
  pending(example),
);
line(
  "one skill body (largest)",
  skillBody,
  ui.parts.get("one skill body"),
  skillBodies.length ? "" : "(no skills yet)",
);
line(
  "UI build (+ ui.md rule)",
  always + design + uiRule + briefAndPackage + skillBody,
  ui.cap,
);
line("non-UI build", always + nonUiRules + briefAndPackage, nonUi.cap);
line(
  "critic pass (canon §2–§3 + brief/package)",
  canonCriticSlice() + briefAndPackage,
  critic.cap,
);

// The index allots a product's own design layer about 1,700 of the design-layer cap.
const PRODUCT_SHARE = 1700;
const designCap = ui.parts.get("design layer") ?? 0;
const headroom = designCap - canon;
if (headroom < PRODUCT_SHARE) {
  report.push(
    `WARN canon.md is ${canon} tokens; the design layer cap leaves ${headroom} for a product layer, ` +
      `not the ${PRODUCT_SHARE} docs/index.md allots. Open item in docs/decisions/changelog.md.`,
  );
}

console.log(report.join("\n"));
if (errors.length > 0) {
  console.error(`\nbudget — ${errors.length} over:\n${errors.join("\n")}`);
  process.exit(1);
}
console.log("\nbudget — within every cap in docs/index.md.");
