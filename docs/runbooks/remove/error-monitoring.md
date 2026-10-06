---
title: "Remove error monitoring — a removal runbook"
description: "Follow from step 4 of new-project/README.md when the briefing drops Error monitoring (Sentry); delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-04
supersedes:
load_when:
---

# Remove error monitoring

> **Module:** Sentry, wired in the web app only (D-STK-12), and `@sentry/nextjs`, owned by the web app (D-STK-16). The observability package's vendor-free error reporter (STK-5) is not part of it and stays: with Sentry gone, `logger.error` still logs and hands each error to the no-op reporter.
> **Built by:** STK-18. The lists below are the module's `error-monitoring` entry in `toolkit.json`'s `stack` block, and what reads it.
> **Run from:** step 4 of [`new-project/README.md`](../new-project/README.md).

## Files to delete

- `apps/web/instrumentation.ts`: starts the SDK per server runtime and reports request errors.
- `apps/web/instrumentation-client.ts`: starts the SDK in the browser.
- `apps/web/sentry.server.config.ts` and `apps/web/sentry.edge.config.ts`.
- `apps/web/lib/error-reporting/`: the scrub rule, the per-tier DSN, the SDK and build options, the seam connection and their tests.

`apps/web/app/global-error.tsx` and `?state=error` in `apps/web/app/page.tsx` stay: the error page logs through `@pem/observability`, which names no vendor.

## Files to edit

- `apps/web/next.config.ts`: the `withSentryConfig` import and the wrapper with its comment (export `nextConfig` itself), the `sentryBuildOptions` import, and `errorReportingBuild` from the `./env` import.
- `apps/web/env.ts`: the `resolveSentryDsn` and `resolveSentryProject` import; in `raw`, the `NEXT_PUBLIC_SENTRY_DSN` reads (with `_LOCAL` and `_STAGING`), `NEXT_PUBLIC_SENTRY_ENVIRONMENT`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (with `_STAGING`), `VERCEL_GIT_COMMIT_SHA` and `NEXT_RUNTIME`; `sentryDsn`, `nextRuntime` and `errorReportingBuild`; the two `NEXT_PUBLIC_SENTRY_*` entries in `client`, `runtimeEnv` and `nextConfigEnv`.
- `apps/web/package.json`: `@sentry/nextjs`, and `SENTRY_CLI_NO_TELEMETRY=1` at the start of the `build` script.
- `tooling/check-client-bundle.ts`: `VERCEL_GIT_COMMIT_SHA` and `NEXT_RUNTIME` in `UNPLANTABLE`, and the comment's Sentry clause.
- `packages/config/eslint/boundaries.js` and `tooling/boundaries.test.ts`: see Boundaries entries.
- `docs/engineering/tech-stack.md`: the `@sentry/nextjs` row.
- `packages/observability/src/error-reporter.ts`: the comment's "STK-18 registers Sentry in apps/web" clause; the seam itself stays.

## Variables

From `.env.example` (the whole "Error monitoring" block) and `turbo.json`'s `globalEnv`:

- `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN_LOCAL`, `NEXT_PUBLIC_SENTRY_DSN_STAGING`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_PROJECT_STAGING`
- `VERCEL_GIT_COMMIT_SHA` and `NEXT_RUNTIME`: only this module reads them.

## Dependencies

`@sentry/nextjs`. After deleting the files, run `yarn install` so `yarn.lock` drops it and its `@sentry/*` dependencies.

## Boundaries entries

The module holds no element. In `packages/config/eslint/boundaries.js`, delete the `"@sentry/*": "app-web"` entry in `SDK_OWNERS`. In `tooling/boundaries.test.ts`, delete the three probes that name `@sentry/`, and the `// STK-18` comment above the first two.

## Vendor-side steps

1. In Sentry (US region, organization settings), delete the staging and production projects, or archive them to keep their history.
2. Revoke the organization auth token the deployments used.
3. Delete the `NEXT_PUBLIC_SENTRY_DSN*`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT*` values from the hosting provider's environment settings.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `error-monitoring` entry of the `stack` block.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `git grep -il sentry -- apps packages tooling turbo.json .env.example ':!tooling/refs-pending.json'` prints nothing.
4. `yarn check-refs` names the deleted paths this runbook still lists. Add each to `tooling/refs-pending.json`, keyed exactly as printed: `"<deleted path>": "removed by docs/runbooks/remove/error-monitoring.md"`.
5. `yarn verify` exits 0.
