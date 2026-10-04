/**
 * The boundaries lint (WEB-2): one test per probe, named after its contract
 * criterion. Each probe is linted as text under a file path inside a package
 * or app, through the repo-root ESLint config that `yarn lint:boundaries`
 * runs, so no probe file is ever written to the tree.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

import { REPO_ROOT } from "./lib/docs.ts";

const eslint = new ESLint({ cwd: REPO_ROOT });

/** The error messages the boundaries config reports for `code` at `file`. */
async function lint(file: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: file });
  return result!.messages.map((message) => message.message);
}

const DISALLOWED: [file: string, code: string, message: RegExp][] = [
  [
    "packages/ui/src/zz-probe.ts",
    'import "@pem/db/client";',
    /^ui must not import db/,
  ],
  [
    "packages/env/src/zz-probe.ts",
    'import "@pem/brand/brand";',
    /^env must not import brand/,
  ],
  [
    "packages/env/src/zz-probe.ts",
    'import "../../db/src/client";',
    /^env must not import db/,
  ],
];

for (const [file, code, message] of DISALLOWED)
  test(`C1: ${code} in ${file} fails the boundaries lint`, async () => {
    const messages = await lint(file, code);
    assert.ok(
      messages.some((text) => message.test(text)),
      `expected ${message}, got ${JSON.stringify(messages)}`,
    );
  });

test("C2: an @pem subpath its package does not export is a resolve error", async () => {
  const messages = await lint(
    "packages/env/src/zz-probe.ts",
    'import "@pem/env/not-exported";',
  );
  assert.ok(
    messages.some((text) =>
      /^Resolve error: @pem\/env\/not-exported does not resolve/.test(text),
    ),
    `expected a resolve error, got ${JSON.stringify(messages)}`,
  );
});

const ALLOWED: [file: string, code: string][] = [
  ["packages/db/src/zz-probe.ts", 'import type { Tier } from "@pem/env/tier";'],
  ["packages/ui/src/zz-probe.ts", 'import "next-themes"; import "react";'],
  [
    "apps/web/app/zz-probe.ts",
    'import "@pem/ui/button"; import "@pem/ui/styles/globals.css"; import "@pem/brand/assets/logo.svg"; import "@/app/layout";',
  ],
];

for (const [file, code] of ALLOWED)
  test(`C2: ${code} in ${file} still passes`, async () => {
    assert.deepEqual(await lint(file, code), []);
  });
