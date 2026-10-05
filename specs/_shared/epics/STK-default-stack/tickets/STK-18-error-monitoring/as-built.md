# As-built — STK-18

## Shipped against the contract

- C1: `apps/web/lib/error-reporting/scrub.ts` is `beforeSend`. It keeps the request's path and method only, reduces the user to an id, scrubs the message, the exception values and the breadcrumb messages with `@pem/observability`'s `scrubText`, and drops breadcrumb data, stack-frame local variables and `extra`. Tested on a synthetic event (`scrub.test.ts`).
- C2: `dsn.ts` reads only the tier's own `NEXT_PUBLIC_SENTRY_DSN[_LOCAL|_STAGING]`, never falling back to production's. `connect.ts` starts the SDK and registers the seam's reporter only with a DSN (`connect.test.ts`). In the browser on local, `/?state=error` sent nothing to Sentry (2026-10-04).
- C3: `"@sentry/*": "app-web"` in `SDK_OWNERS`; probes in `tooling/boundaries.test.ts` ban it from packages and allow it in `apps/web`.
- C4: `build.ts` uploads source maps and creates the release only on a deployment holding the token, the org and the tier's project. Every other build skips both, and `yarn build` without `SENTRY_AUTH_TOKEN` passes (`build.test.ts`).
- NN3 and NN6: `options.ts` sets all eleven `dataCollection` categories (all off, five context lines) and `sendDefaultPii: false`. It sets no traces or profiles sample rate and `enableLogs: false`, drops the browser's default `BrowserTracing`, and the build tree-shakes tracing.
- NN7: `docs/runbooks/remove-error-monitoring.md` and the `error-monitoring` entry in `toolkit.json`.
- `@sentry/nextjs` 11.0.0 (verified 2026-10-04; the newest 11.x past the 7-day age gate, and the line that has `dataCollection`), pinned exactly in `apps/web`, with its row in `docs/engineering/tech-stack.md`.

## Deviations

- Sentry region: US, ratified by Taylor 2026-10-04 (`technical.md`, routed call 2).
- [ASSUMPTION] The devs_call is tunnel off. Sentry's tunnel rewrite forwards to whatever org and project the caller's `?o=`/`?p=` name, so it would be an unauthenticated relay to any Sentry org through this origin (warden, round 2). Browser events go straight to the US ingest; an ad blocker may drop some, and server errors are unaffected. Validating `o` and `p` in `proxy.ts` would bring it back if browser coverage matters later.
- [ASSUMPTION] `NEXT_PUBLIC_SENTRY_ENVIRONMENT` is derived by `env.ts` from the tier, so browser events carry `staging` or `production`. The DSN goes into `next.config.ts`'s env block as `""` when the tier has none, so Next cannot inline a production DSN from `.env.local` into a local bundle.
- `NEXT_RUNTIME` and `VERCEL_GIT_COMMIT_SHA` are read in `env.ts`, the one `process.env` reader, and added to `check-client-bundle`'s `UNPLANTABLE`: Next or the platform sets them, and the commit is public as the release.
- Added to `planned_paths`: `apps/web/app/page.tsx` (`?state=error` throws off a deployment and on staging deployments, never on production or a deployment with no tier, so the error page is reachable and C5 has a trigger; this brought `review:threshold`), plus `yarn.lock`, `tech-stack.md`, `check-client-bundle.ts`, `tooling/boundaries.test.ts` and `technical.md`.
- `app/global-error.tsx` reports through `logger.error` and names no vendor, so it stays when the module is removed.
- Other threads' commits from the shared index swept in some of these edits (2707c47, eae70ad) and reverted six of them once (1d8a050); 795065a restores them.

## Not verified

- C5 (manual, deferred): needs the hosted staging project. Steps are in `evidence/C5-operator.md`.
- C6 (manual): the agent rehearsed the removal on a scratch worktree of 492e300 on 2026-10-04 (`evidence/C6-removal.md`). Since then the tunnel went off, which drops the runbook's `proxy.ts` step.

## Next

Taylor creates the Sentry org (US) and the two projects, sets the Vercel variables in `evidence/C5-operator.md`, and opens `/?state=error` on a preview.
