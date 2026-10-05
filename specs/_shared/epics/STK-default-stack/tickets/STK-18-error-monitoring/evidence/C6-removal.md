# C6: following remove-error-monitoring.md on a scratch copy

Done by the agent on 2026-10-04, on a throwaway git worktree of HEAD 492e300 (`.claude/worktrees/stk18-removal`), with every step of `docs/runbooks/remove-error-monitoring.md` followed in order. The worktree was then discarded.

## What was done

- Deleted: `apps/web/instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `lib/error-reporting/`.
- Edited as the runbook lists: `next.config.ts` (exports `nextConfig` unwrapped), `env.ts`, `proxy.ts`, `package.json`, `tooling/check-client-bundle.ts`, `boundaries.js` and `boundaries.test.ts`, the `tech-stack.md` row, and the comment in `packages/observability/src/error-reporter.ts`. The `.env.example` block and the `turbo.json` names were removed.
- `yarn install` dropped `@sentry/*` from `yarn.lock`. `"removed": true` was set on the `error-monitoring` entry.
- The five deleted paths were added to `tooling/refs-pending.json`, as the runbook's step 4 says.

## What was seen

- `yarn check-stack`: "16 module(s); nothing missing, nothing left behind."
- `git grep -il sentry -- apps packages tooling turbo.json .env.example ':!tooling/refs-pending.json'` printed nothing.
- Every `yarn verify` step passed, `build` and `check-client-bundle` included, except `format:check`. All 30 files it named are `packages/ui/src/primitives/**` components that CAT-9 committed at 02f5fb7 and that HEAD fails on without the removal too. None of them is a file the removal touched.

## Found by the rehearsal, fixed in the runbook

The first pass (on 741737c) found that `check-refs` fails on the runbook's own list of deleted paths, and that the grep needed scoping. Commit 0a9f5f2 added the `refs-pending.json` step and the scoped `git grep`.
