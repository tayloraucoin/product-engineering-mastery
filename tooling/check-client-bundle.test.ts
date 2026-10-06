/**
 * check-client-bundle (STK-4, C5): the scan over synthetic client chunks in
 * tooling/fixtures/client-bundle/<case>/static. Every sentinel and value is
 * synthetic.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { REPO_ROOT } from "./lib/docs.ts";

const SENTINEL = "EXAMPLE_API_KEY=pem-sentinel-example_api_key-0000synthetic";

const check = (...args: string[]) => {
  const r = spawnSync(
    process.execPath,
    [path.join(REPO_ROOT, "tooling/check-client-bundle.ts"), ...args],
    { cwd: REPO_ROOT, encoding: "utf8" },
  );
  return { status: r.status, out: r.stdout + r.stderr };
};
const fixture = (name: string) =>
  `tooling/fixtures/client-bundle/${name}/static`;

test("C5: a client chunk holding a server-only sentinel fails, naming the variable and the chunk", () => {
  const r = check("--scan", fixture("leak"), "--sentinel", SENTINEL);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /server-only values reached the browser bundle/);
  assert.match(
    r.out,
    /EXAMPLE_API_KEY in tooling\/fixtures\/client-bundle\/leak\/static\/chunks\/app-synthetic\.js/,
  );
});

test("C5: no build output fails", () => {
  const missing = check("--scan", fixture("missing"), "--sentinel", SENTINEL);
  assert.equal(missing.status, 1, missing.out);
  assert.match(
    missing.out,
    /no build output at tooling\/fixtures\/client-bundle\/missing\/static/,
  );
  const empty = check("--scan", fixture("empty"), "--sentinel", SENTINEL);
  assert.equal(empty.status, 1, empty.out);
  assert.match(empty.out, /no client chunks under/);
});

test("C5: clean client chunks pass", () => {
  const r = check("--scan", fixture("clean"), "--sentinel", SENTINEL);
  assert.equal(r.status, 0, r.out);
  assert.match(
    r.out,
    /1 server-only value\(s\), none in 1 browser-facing file\(s\)/,
  );
});

test("C5: a scan with no sentinel named is refused", () => {
  const r = check("--scan", fixture("clean"));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /name at least one --sentinel/);
});

test("the plan plants server-only names from .env.example and turbo.json, and fails on drift, naming it", () => {
  // The repo's settings deny reading .env files, so the fixture commits
  // env.example and the test renames it in a copy under $TMPDIR.
  const root = mkdtempSync(path.join(tmpdir(), "client-bundle-plan-"));
  cpSync(
    path.join(REPO_ROOT, "tooling/fixtures/client-bundle/registry"),
    root,
    {
      recursive: true,
    },
  );
  renameSync(path.join(root, "env.example"), path.join(root, ".env.example"));
  const r = check("--plan", "--root", root);
  assert.equal(r.status, 1, r.out);
  assert.match(
    r.out,
    /would plant: EXAMPLE_API_KEY, EXAMPLE_API_KEY_LOCAL, SYNTHETIC_DB_URL, SYNTHETIC_TASK_SECRET\n/,
  );
  assert.match(
    r.out,
    /turbo\.json lists SYNTHETIC_DB_URL, SYNTHETIC_TASK_SECRET, which \.env\.example does not/,
  );
});
