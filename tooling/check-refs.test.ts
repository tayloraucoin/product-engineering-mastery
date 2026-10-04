/**
 * check-refs: a pending entry that now exists is stale, unless git ignores it
 * (machine-local, never in CI). Scratch repos in $TMPDIR with real git; see
 * tooling/lib/scratch-repo.ts. Every file is synthetic.
 */

import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  freshRepo,
  read,
  tool,
  useScratchRepo,
  write,
} from "./lib/scratch-repo.ts";

useScratchRepo();

function repoWithPending(entries: Record<string, string>) {
  const repo = freshRepo();
  // Only the files each case writes are live; the copied templates are not.
  rmSync(path.join(repo, "docs"), { recursive: true, force: true });
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
