/**
 * Keeps src/local-auth-mirror.ts the only writer to auth.users in the
 * package's shipped code (STK-11): any other INSERT, UPDATE, DELETE or
 * TRUNCATE against auth.users would bypass the mirror's three guards. Tests
 * are exempt; they create and remove synthetic auth users.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const MIRROR = "src/local-auth-mirror.ts";
const WRITE =
  /\b(?:insert\s+into|update|delete\s+from|truncate(?:\s+table)?)\s+auth\.users\b/i;

function shippedFiles(dir: string): string[] {
  return readdirSync(path.join(packageRoot, dir), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return shippedFiles(rel);
    return /\.(ts|sql)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)
      ? [rel]
      : [];
  });
}

test("only the local auth mirror writes to auth.users", () => {
  const files = ["src", "scripts", "supabase", "migrations"].flatMap(
    shippedFiles,
  );
  assert.ok(files.includes(MIRROR));
  const writers = files.filter((rel) =>
    WRITE.test(readFileSync(path.join(packageRoot, rel), "utf8")),
  );
  assert.deepEqual(writers, [MIRROR]);
});

test("the pattern catches each kind of write", () => {
  for (const statement of [
    "insert into auth.users (id) values ($1)",
    "UPDATE auth.users SET email = $1",
    "delete from auth.users where id = $1",
    "truncate table auth.users",
  ]) {
    assert.match(statement, WRITE);
  }
  assert.doesNotMatch("select id, email from auth.users", WRITE);
});
