/**
 * Client-safe subpaths carry no server import: walking every import from
 * `./config`, `./browser` and `./redirect` reaches no server module of this
 * package, no `node:` built-in, no server framework entry and no other
 * workspace package.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SRC = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(path.join(SRC, "..", "package.json"), "utf8"),
) as { exports: Record<string, { default: string }> };

const CLIENT_SAFE = ["./config", "./browser", "./redirect"];
const SERVER = ["./server", "./admin", "./session", "./context"];
const ALLOWED_PACKAGES = ["@supabase/ssr", "@supabase/supabase-js"];

const IMPORT =
  /^\s*(?:import|export)\b[^;]*?from\s+["']([^"']+)["']|^\s*import\s+["']([^"']+)["']/gm;

function importsOf(file: string): string[] {
  const text = readFileSync(file, "utf8");
  return [...text.matchAll(IMPORT)].map((match) => (match[1] ?? match[2])!);
}

function walk(
  entry: string,
  seen = new Set<string>(),
): { files: Set<string>; external: Set<string> } {
  const external = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of importsOf(file)) {
      if (specifier.startsWith("."))
        queue.push(path.resolve(path.dirname(file), specifier));
      else external.add(specifier);
    }
  }
  return { files: seen, external };
}

const entryFile = (subpath: string) =>
  path.resolve(SRC, "..", pkg.exports[subpath]!.default);

test("every subpath is classed as client-safe or server", () => {
  assert.deepEqual(
    Object.keys(pkg.exports).sort(),
    [...CLIENT_SAFE, ...SERVER].sort(),
  );
});

for (const subpath of CLIENT_SAFE)
  test(`${subpath} reaches no server module, built-in or workspace package`, () => {
    const { files, external } = walk(entryFile(subpath));
    const serverFiles = SERVER.map(entryFile);
    for (const file of files)
      assert.ok(
        !serverFiles.includes(file),
        `${subpath} reaches ${path.basename(file)}`,
      );
    for (const specifier of external)
      assert.ok(
        ALLOWED_PACKAGES.includes(specifier),
        `${subpath} imports ${specifier}`,
      );
  });

test("the walk sees a server import when there is one", () => {
  const { files, external } = walk(entryFile("./session"));
  assert.ok(files.has(entryFile("./server")));
  assert.ok(!external.has("node:fs"));
  assert.ok(walk(entryFile("./context")).external.has("@pem/db/rls"));
});
