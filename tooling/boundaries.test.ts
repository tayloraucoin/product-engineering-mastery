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
  // STK-13: services import no transport (D-STK-8); validators sit below db.
  [
    "packages/services/src/zz-probe.ts",
    'import "next/server";',
    /next is a transport or framework/,
  ],
  [
    "packages/services/src/zz-probe.ts",
    'import { useState } from "react";',
    /react is a transport or framework/,
  ],
  [
    "packages/services/src/zz-probe.ts",
    'import "@trpc/server";',
    /@trpc\/\* is a transport or framework/,
  ],
  [
    "packages/services/src/zz-probe.ts",
    'import "@pem/auth/context";',
    /^services must not import auth/,
  ],
  [
    "packages/validators/src/zz-probe.ts",
    'import "@pem/db/schema";',
    /^validators must not import db/,
  ],
  [
    "packages/db/src/zz-probe.ts",
    'import "@pem/services/notes";',
    /^db must not import services/,
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
  // STK-15: resend is owned by email (D-STK-16).
  [
    "apps/web/lib/zz-probe.ts",
    'import "resend";',
    /resend is owned by @pem\/email/,
  ],
  [
    "packages/observability/src/zz-probe.ts",
    'import { Resend } from "resend";',
    /resend is owned by @pem\/email/,
  ],
  // STK-16: stripe is owned by apps/web (D-STK-11, D-STK-16).
  [
    "packages/services/src/zz-probe.ts",
    'import Stripe from "stripe";',
    /stripe is owned by apps\/web/,
  ],
  [
    "packages/db/src/zz-probe.ts",
    'import "stripe";',
    /stripe is owned by apps\/web/,
  ],
  // STK-14: @trpc/* is owned by api (D-STK-16); api sits above services and below ui.
  [
    "apps/web/app/zz-probe.ts",
    'import "@trpc/server/adapters/fetch";',
    /@trpc\/\* is owned by @pem\/api/,
  ],
  [
    "packages/services/src/zz-probe.ts",
    'import "@pem/api/server";',
    /^services must not import api/,
  ],
  [
    "packages/auth/src/zz-probe.ts",
    'import "@pem/api/server";',
    /^auth must not import api/,
  ],
  [
    "packages/ui/src/zz-probe.ts",
    'import "@pem/api/react";',
    /^ui must not import api/,
  ],
  // STK-17: ai and @ai-sdk/* are owned by ai; @pem/ai reaches only services and the streaming route (D-STK-12, D-STK-16).
  [
    "apps/web/app/zz-probe.ts",
    'import "@pem/ai/client";',
    /^app-web must not import ai/,
  ],
  [
    "apps/web/lib/zz-probe.ts",
    'import "@pem/ai/client";',
    /^app-web must not import ai/,
  ],
  [
    "apps/web/app/zz-probe.ts",
    'import "@/no/such/module";',
    /@\/no\/such\/module does not resolve to a file under apps\/web/,
  ],
  [
    "apps/web/app/zz-probe.ts",
    'import { ai } from "@/app/api/ai/ai";',
    /^app-web must not import web-ai-route/,
  ],
  [
    "packages/ui/src/zz-probe.ts",
    'import "@pem/ai/client";',
    /^ui must not import ai/,
  ],
  [
    "apps/web/app/api/ai/chat/zz-probe.ts",
    'import { streamText } from "ai";',
    /ai is owned by @pem\/ai/,
  ],
  [
    "packages/services/src/zz-probe.ts",
    'import "@ai-sdk/anthropic";',
    /@ai-sdk\/\* is owned by @pem\/ai/,
  ],
  [
    "packages/ai/src/zz-probe.ts",
    'import "@pem/db/client";',
    /^ai must not import db/,
  ],
  // STK-18: @sentry/* is owned by apps/web (D-STK-16); packages import no vendor.
  [
    "packages/observability/src/zz-probe.ts",
    'import * as Sentry from "@sentry/nextjs";',
    /@sentry\/\* is owned by apps\/web/,
  ],
  [
    "packages/ui/src/zz-probe.ts",
    'import "@sentry/react";',
    /@sentry\/\* is owned by apps\/web/,
  ],
  // CAT-3: the shelf is never imported (CS-07, record 0011).
  [
    "apps/web/app/zz-probe.ts",
    'import "@pem/catalog/manifest";',
    /must not import catalog/,
  ],
  [
    "packages/ui/src/zz-probe.ts",
    'import "@pem/catalog/manifest";',
    /^ui must not import catalog/,
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
    "packages/services/src/zz-probe.ts",
    'import "@pem/validators/notes"; import "@pem/db/schema"; import "drizzle-orm"; import "zod";',
  ],
  ["apps/web/lib/zz-probe.ts", 'import "@pem/services/notes";'],
  [
    "packages/email/src/zz-probe.ts",
    'import "resend"; import "@pem/brand/brand"; import "@pem/observability/logger";',
  ],
  ["apps/web/lib/zz-probe.ts", 'import "@pem/email/mailer";'],
  [
    "apps/web/lib/billing/zz-probe.ts",
    'import Stripe from "stripe"; import "@pem/db/stripe-event-ledger";',
  ],
  [
    "apps/web/app/api/webhooks/stripe/_lib/zz-probe.ts",
    'import Stripe from "stripe"; import "@pem/db/stripe-event-ledger";',
  ],
  [
    "packages/api/src/zz-probe.ts",
    'import "@trpc/server"; import "@trpc/client"; import "@pem/services/notes"; import "@pem/auth/context"; import "@pem/validators/notes"; import "@pem/observability/logger";',
  ],
  [
    "apps/web/lib/zz-probe.ts",
    'import "@pem/api/server"; import "@pem/services/context";',
  ],
  [
    "packages/ai/src/zz-probe.ts",
    'import "ai"; import "@ai-sdk/anthropic"; import "@pem/env/tier"; import "@pem/observability/logger";',
  ],
  ["packages/services/src/zz-probe.ts", 'import "@pem/ai/client";'],
  [
    "apps/web/app/api/ai/chat/zz-probe.ts",
    'import "@pem/ai/client"; import "@/env"; import "@/lib/supabase/context";',
  ],
  [
    "apps/web/lib/error-reporting/zz-probe.ts",
    'import * as Sentry from "@sentry/nextjs"; import "@pem/observability/error-reporter";',
  ],
  ["packages/catalog/src/zz-probe.ts", 'import "@pem/ui/button";'],
  [
    "apps/web/app/zz-probe.ts",
    'import "@pem/ui/button"; import "@pem/ui/styles/globals.css"; import "@pem/brand/assets/logo.svg"; import "@/app/layout";',
  ],
];

for (const [file, code] of ALLOWED)
  test(`C2: ${code} in ${file} still passes`, async () => {
    assert.deepEqual(await lint(file, code), []);
  });

// LAB-3 (its C5): @pem/db/sandbox reaches only apps/web/lib/sandbox, and the
// experimental and admin routes never reach the client or schema (D-LAB-34).
const SANDBOX_DISALLOWED: [file: string, code: string, message: RegExp][] = [
  [
    "apps/web/app/zz-probe.ts",
    'import "@pem/db/sandbox";',
    /^app-web must not import db-sandbox/,
  ],
  [
    "apps/web/lib/zz-probe.ts",
    'import { checkAccess } from "@pem/db/sandbox";',
    /^app-web must not import db-sandbox/,
  ],
  [
    "apps/web/app/experimental/[slug]/zz-probe.ts",
    'import "@pem/db/sandbox";',
    /^app-web must not import db-sandbox/,
  ],
  [
    "apps/web/app/experimental/[slug]/zz-probe.ts",
    'import { getDb } from "@pem/db/client";',
    /never @pem\/db\/client or @pem\/db\/schema/,
  ],
  [
    "apps/web/app/admin/zz-probe.ts",
    'import { sandboxComments } from "@pem/db/schema";',
    /never @pem\/db\/client or @pem\/db\/schema/,
  ],
  [
    "apps/web/app/admin/zz-probe.ts",
    'import { streamText } from "ai";',
    /ai is owned by @pem\/ai/,
  ],
  [
    "packages/services/src/zz-probe.ts",
    'import "@pem/db/sandbox";',
    /^services must not import db-sandbox/,
  ],
  [
    "packages/db/src/sandbox/zz-probe.ts",
    'import "next/server";',
    /next is a transport or framework/,
  ],
  [
    "packages/db/src/sandbox/zz-probe.ts",
    'import "react";',
    /react is a transport or framework/,
  ],
];

for (const [file, code, message] of SANDBOX_DISALLOWED)
  test(`C5 (LAB-3): ${code} in ${file} fails the boundaries lint`, async () => {
    const messages = await lint(file, code);
    assert.ok(
      messages.some((text) => message.test(text)),
      `expected ${message}, got ${JSON.stringify(messages)}`,
    );
  });

const SANDBOX_ALLOWED: [file: string, code: string][] = [
  [
    "apps/web/lib/sandbox/zz-probe.ts",
    'import "@pem/db/sandbox"; import "@pem/db/client"; import "@/lib/supabase/context";',
  ],
  [
    "apps/web/app/experimental/[slug]/zz-probe.ts",
    'import "@/lib/sandbox/team";',
  ],
  [
    "apps/web/app/admin/zz-probe.ts",
    'import "@/lib/sandbox/team"; import "@pem/ui/button";',
  ],
  [
    "packages/db/src/sandbox/zz-probe.ts",
    'import "../client.ts"; import "drizzle-orm";',
  ],
];

for (const [file, code] of SANDBOX_ALLOWED)
  test(`C5 (LAB-3): ${code} in ${file} still passes`, async () => {
    assert.deepEqual(await lint(file, code), []);
  });
