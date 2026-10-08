/**
 * check-refs: a pending entry that now exists is stale, unless git ignores it
 * (machine-local, never in CI). Scratch repos in $TMPDIR with real git; see
 * tooling/lib/scratch-repo.ts. Every file is synthetic.
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  freshRepo,
  read,
  singleAppRepo,
  tool,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

function repoWithPending(entries: Record<string, string>) {
  const repo = freshRepo();
  // Only the files each case writes are live; the copied templates are not.
  rmSync(path.join(repo, "docs"), { recursive: true, force: true });
  // toolkit.json still names each stack module's runbook, which must exist.
  const { stack } = JSON.parse(read(repo, "toolkit.json"));
  for (const module of Object.values(stack ?? {}) as {
    runbook: string | null;
  }[])
    if (module.runbook) write(repo, module.runbook, "");
  for (const root of ["AGENTS.md", "CLAUDE.md", "README.md"])
    write(repo, root, "# Synthetic\n");
  write(repo, "tooling/refs-pending.json", JSON.stringify(entries, null, 2));
  return repo;
}

test("a pending entry that now exists is stale", () => {
  const repo = repoWithPending({
    "docs/lands-later.md": "lands in a later step",
  });
  write(repo, "docs/lands-later.md", "# Landed (synthetic)\n");
  const r = tool(repo, "check-refs.ts", []);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /docs\/lands-later\.md exists now/);
});

test("a git-ignored pending entry is machine-local and never stale", () => {
  const repo = repoWithPending({
    ".claude/settings.local.json": "machine-local and untracked by design",
  });
  write(
    repo,
    ".gitignore",
    `${read(repo, ".gitignore")}.claude/settings.local.json\n`,
  );
  write(repo, ".claude/settings.local.json", "{}\n");
  const r = tool(repo, "check-refs.ts", []);
  assert.equal(r.status, 0, r.out);
});

const MANIFEST = "docs/runbooks/migrate/manifest.json";
const REPO_ROOT = path.resolve(import.meta.dirname, "..");
type Entry = { path: string; mode: string; when: string; group?: string };
const manifest = JSON.parse(read(REPO_ROOT, MANIFEST)) as {
  when: Record<string, string>;
  entries: Entry[];
};

test("C1 every manifest entry has a path, a mode and a when the manifest defines", () => {
  assert.ok(manifest.entries.length > 0);
  for (const entry of manifest.entries) {
    assert.equal(typeof entry.path, "string", JSON.stringify(entry));
    assert.ok(["copy", "derive"].includes(entry.mode), JSON.stringify(entry));
    assert.ok(entry.when in manifest.when, `undefined when: ${entry.when}`);
  }
  const paths = manifest.entries.map((entry) => entry.path);
  assert.equal(new Set(paths).size, paths.length, "a path is listed twice");
});

test("C1 every copy path exists in this repo, and the manifest lists itself as a copy", () => {
  for (const entry of manifest.entries.filter((e) => e.mode === "copy"))
    assert.ok(
      existsSync(path.join(REPO_ROOT, entry.path)),
      `${entry.path} does not exist`,
    );
  assert.ok(
    manifest.entries.some((e) => e.path === MANIFEST && e.mode === "copy"),
  );
});

test("C1 no entry names a root a target never gets", () => {
  for (const entry of manifest.entries)
    assert.doesNotMatch(
      entry.path,
      /^(docs\/(references|research|prompts)|apps|packages)(\/|$)/,
      entry.path,
    );
});

/** A single-app overlay repo holding the manifest, a synthetic spine, and the given docs. */
function overlayRepoWith(docs: Record<string, string>) {
  const repo = singleAppRepo();
  write(repo, MANIFEST, read(REPO_ROOT, MANIFEST));
  for (const rel of ["AGENTS.md", "CLAUDE.md", "docs/index.md"])
    write(repo, rel, "# Synthetic\n");
  write(repo, "tooling/refs-pending.json", "{}\n");
  for (const [rel, text] of Object.entries(docs)) write(repo, rel, text);
  return repo;
}

test("C2 under overlay a broken link in a host doc outside the manifest passes", () => {
  const repo = overlayRepoWith({
    "docs/host/notes.md": "See [the old plan](../plans/gone.md).\n",
    "docs/workflows/guide.md":
      "See [the manifest](../runbooks/migrate/manifest.json).\n",
  });
  const r = tool(repo, "check-refs.ts", []);
  assert.equal(r.status, 0, r.out);
});

test("C2 under overlay a broken link in a manifest path fails, naming the file", () => {
  const repo = overlayRepoWith({
    "docs/host/notes.md": "See [the old plan](../plans/gone.md).\n",
    "docs/workflows/guide.md": "See [the missing stage](stages/missing.md).\n",
  });
  const r = tool(repo, "check-refs.ts", []);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /docs\/workflows\/guide\.md/);
  assert.doesNotMatch(r.out, /docs\/host\/notes\.md/);
});

/** MIG-3 C7: what the derived package.json names, the manifest installs. */
const STARTER_ONLY = new Set([
  "tooling/check-stack.ts",
  "tooling/check-catalog.ts",
  "tooling/check-ui-layout.ts",
  "tooling/contrast-audit.ts",
  "tooling/check-client-bundle.ts",
  // The starter's dev-server helper (web:dev:local) and the toolkit-only assess.
  "tooling/print-local-urls.ts",
  "tooling/migrate-assess.ts",
]);

test("C7 every package.json script that runs a tooling file names a manifest entry, bar the starter-only checks; the two corrected copy entries and the tsconfig derive entry are there", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const scripts = (
    JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    }
  ).scripts;
  const manifest = JSON.parse(
    readFileSync(
      path.join(root, "docs/runbooks/migrate/manifest.json"),
      "utf8",
    ),
  ) as { entries: { path: string; mode: string }[] };
  const installed = (file: string) =>
    manifest.entries.some((e) =>
      e.path.endsWith("/") ? file.startsWith(e.path) : e.path === file,
    );
  const missing: string[] = [];
  for (const [name, command] of Object.entries(scripts)) {
    const file = command.match(/\bnode (tooling\/[^\s"]+)/)?.[1];
    if (!file || STARTER_ONLY.has(file) || installed(file)) continue;
    missing.push(`${name} runs ${file}`);
  }
  assert.deepEqual(missing, []);
  const byPath = new Map(manifest.entries.map((e) => [e.path, e.mode]));
  assert.equal(byPath.get("tooling/check-reviewers.ts"), "copy");
  assert.equal(byPath.get("tooling/check-test-weakening.ts"), "copy");
  assert.equal(byPath.get("tooling/tsconfig.json"), "derive");
});
