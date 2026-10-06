# C6: following remove/error-monitoring.md on a scratch copy

Done by the agent on 2026-10-05, on a throwaway detached git worktree of commit 6f1ce01 (`scratchpad/c6-removal`), with every step of `docs/runbooks/remove/error-monitoring.md` followed in order. The worktree was first made at 735deb0 and moved to 6f1ce01 before any check ran; 6f1ce01 only reformats `apps/web/lib/error-reporting/build.test.ts`, which the removal deletes. The worktree was then discarded.

## What was done

- Deleted: `apps/web/instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `lib/error-reporting/`. About 1 minute.
- Edited as the runbook lists: `next.config.ts` (exports `nextConfig` unwrapped), `env.ts`, `apps/web/package.json`, `tooling/check-client-bundle.ts`, `boundaries.js` and `boundaries.test.ts`, the `tech-stack.md` row, and the comment in `packages/observability/src/error-reporter.ts`. About 2 minutes.
- Removed the "Error monitoring" block from `.env.example` and the ten names from `turbo.json`'s `globalEnv`. Under a minute.
- `yarn install` dropped every `@sentry/*` entry from `yarn.lock`. Seconds.
- The vendor-side steps were not run: a scratch copy has no Sentry account or hosting settings.
- `"removed": true` was set on the `error-monitoring` entry, and the five deleted paths were added to `tooling/refs-pending.json`, as step 4 says.

## What was seen

- `yarn check-stack` exited 0: "16 module(s); nothing missing, nothing left behind."
- The scoped `git grep -il sentry ...` first printed `tooling/boundaries.test.ts`: the `// STK-18: @sentry/* is owned by apps/web` comment above the deleted probes. With that line deleted, it printed nothing.
- `yarn check-refs` first named the five deleted paths and exited 1. With them in `refs-pending.json`, it exited 0.
- `yarn verify` exited 0 in about 2.5 minutes. Every step passed: `format:check`, the tests (no failures), `lint`, `lint:boundaries`, `check-types`, `check-client-bundle` ("30 server-only value(s), none in 24 browser-facing file(s)") and `build` included.
- The whole runbook took about 5 minutes, `yarn verify` included.

## Found by the rehearsal

- Boundaries entries names only "the three probes" in `tooling/boundaries.test.ts`. The comment line above the first two names `@sentry/*`, so the grep in Verify step 3 finds it. The smallest fix: "delete the three probes that name `@sentry/`, and the `// STK-18` comment above the first two."
- Files to edit names the `withSentryConfig` wrapper in `next.config.ts`, but not the doc comment above it ("Sentry wraps the config (STK-18) ..."). The rehearsal took the comment as part of the wrapper. The smallest fix: "the `withSentryConfig` import and the wrapper with its comment".

Both fixes are in the runbook as of the commit that records this file.
