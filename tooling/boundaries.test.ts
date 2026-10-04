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
  // STK-12: @supabase/* is owned by auth (D-STK-16); auth sits above db.
  [
    "packages/db/src/zz-probe.ts",
    'import "@supabase/ssr";',
    /@supabase\/\* is owned by @pem\/auth/,
  ],
  [
    "apps/web/lib/zz-probe.ts",
    'import "@supabase/supabase-js";',
    /@supabase\/\* is owned by @pem\/auth/,
  ],
  [
    "packages/db/src/zz-probe.ts",
    'import "@pem/auth/context";',
    /^db must not import auth/,
  ],
  [
    "packages/email/src/zz-probe.ts",
    'import "@pem/auth/server";',
    /^email must not import auth/,
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

const UNEXPORTED: [file: string, specifier: string][] = [
  ["packages/env/src/zz-probe.ts", "@pem/env/not-exported"],
  ["packages/ui/src/zz-probe.ts", "@pem/db"],
];

for (const [file, specifier] of UNEXPORTED)
  test(`C2: ${specifier}, which its package does not export, is a resolve error with no stack`, async () => {
    const messages = await lint(file, `import "${specifier}";`);
    const error = messages.find((text) => text.startsWith("Resolve error:"));
    assert.ok(
      error?.startsWith(`Resolve error: ${specifier} does not resolve`),
      `expected a resolve error, got ${JSON.stringify(messages)}`,
    );
    assert.doesNotMatch(error!, /\n\s+at /);
  });

const ALLOWED: [file: string, code: string][] = [
  ["packages/db/src/zz-probe.ts", 'import type { Tier } from "@pem/env/tier";'],
  ["packages/ui/src/zz-probe.ts", 'import "next-themes"; import "react";'],
  [
    "packages/auth/src/zz-probe.ts",
    'import "@supabase/ssr"; import "@supabase/supabase-js"; import "@pem/db/rls"; import "@pem/observability/logger";',
  ],
  ["apps/web/lib/zz-probe.ts", 'import "@pem/auth/server";'],
  [
    "apps/web/app/zz-probe.ts",
    'import "@pem/ui/button"; import "@pem/ui/styles/globals.css"; import "@pem/brand/assets/logo.svg"; import "@/app/layout";',
  ],
];

for (const [file, code] of ALLOWED)
  test(`C2: ${code} in ${file} still passes`, async () => {
    assert.deepEqual(await lint(file, code), []);
  });
