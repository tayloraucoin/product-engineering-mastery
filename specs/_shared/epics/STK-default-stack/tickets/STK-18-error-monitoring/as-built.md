# As-built — STK-18

## Shipped against the contract

- C1: `apps/web/lib/error-reporting/scrub.ts` is `beforeSend`. It keeps the request's path and method only, reduces the user to an id, scrubs the message, the exception values and the breadcrumb messages with `@pem/observability`'s `scrubText`, and drops breadcrumb data, stack-frame local variables and `extra`. Tested on a synthetic event (`scrub.test.ts`).
- C2: `dsn.ts` reads only the tier's own `NEXT_PUBLIC_SENTRY_DSN[_LOCAL|_STAGING]`, never falling back to production's. `connect.ts` starts the SDK and registers the seam's reporter only with a DSN (`connect.test.ts`). In the browser on local, `/?state=error` sent nothing to Sentry (2026-10-04).
- C3: `"@sentry/*": "app-web"` in `SDK_OWNERS`; probes in `tooling/boundaries.test.ts` ban it from packages and allow it in `apps/web`.
- C4: `build.ts` uploads source maps and creates the release only on a deployment holding the token, the org and the tier's project. Every other build skips both, and `yarn build` without `SENTRY_AUTH_TOKEN` passes (`build.test.ts`).
- NN3 and NN6: `options.ts` sets all eleven `dataCollection` categories (all off, five context lines) and `sendDefaultPii: false`. It sets no traces or profiles sample rate and `enableLogs: false`, drops the browser's default `BrowserTracing`, and the build tree-shakes tracing.
- NN7: `docs/runbooks/remove/error-monitoring.md` and the `error-monitoring` entry in `toolkit.json`.
- `@sentry/nextjs` 11.0.0 (verified 2026-10-04; the newest 11.x past the 7-day age gate, and the line that has `dataCollection`), pinned exactly in `apps/web`, with its row in `docs/engineering/tech-stack.md`.

## Deviations

- Sentry region: US, ratified by Taylor 2026-10-04 (`technical.md`, routed call 2).
- [ASSUMPTION] The devs_call is tunnel off. Sentry's tunnel rewrite forwards to whatever org and project the caller's `?o=`/`?p=` name, so it would be an unauthenticated relay to any Sentry org through this origin (warden, round 2). Browser events go straight to the US ingest; an ad blocker may drop some, and server errors are unaffected. Validating `o` and `p` in `proxy.ts` would bring it back if browser coverage matters later.
- [ASSUMPTION] `NEXT_PUBLIC_SENTRY_ENVIRONMENT` is derived by `env.ts` from the tier, so browser events carry `staging` or `production`. The DSN goes into `next.config.ts`'s env block as `""` when the tier has none, so Next cannot inline a production DSN from `.env.local` into a local bundle.
- `NEXT_RUNTIME` and `VERCEL_GIT_COMMIT_SHA` are read in `env.ts`, the one `process.env` reader, and added to `check-client-bundle`'s `UNPLANTABLE`: Next or the platform sets them, and the commit is public as the release.
- Added to `planned_paths`: `apps/web/app/page.tsx` (`?state=error` throws off a deployment and on staging deployments, never on production or a deployment with no tier, so the error page is reachable and C5 has a trigger), plus `yarn.lock`, `tech-stack.md`, `check-client-bundle.ts`, `tooling/boundaries.test.ts` and `technical.md`.
- `app/global-error.tsx` reports through `logger.error` and names no vendor, so it stays when the module is removed.
- Warden's third review (2026-10-05) found the Sentry project still fell back to production's when a staging deployment lacked `SENTRY_PROJECT_STAGING`, so a staging build would upload into the production project. `dsn.ts`'s `resolveSentryProject` now reads only the tier's own name, like the DSN, and `build.test.ts` covers the missing variable. From the same review: `UNWANTED_INTEGRATIONS` also names Replay, ReplayCanvas, Feedback and BrowserProfiling, so an SDK upgrade that makes one a default is still dropped; `beforeSend` scrubs tags and the transaction name; and the C5 steps rate-limit both projects' client keys and turn on Sentry's inbound filters, since both DSNs are public.
- `apps/web/package.json`'s `build` script sets `SENTRY_CLI_NO_TELEMETRY=1` (2026-10-05, 735deb0). The sandbox caught `check-client-bundle`'s build reaching `o1.ingest.us.sentry.io`: with `SENTRY_AUTH_TOKEN` in the environment the bundler plugin starts the Sentry CLI (the `sentry` package it depends on), upload or not, and the CLI reports to Sentry's own project; `telemetry: false` covers only the plugin. A developer with a token in `.env.local` would have sent it too. `build.test.ts` holds the script to the opt-out, and the removal runbook lists it. Next's and Turbo's own telemetry (`telemetry.vercel.com`) predate this ticket and are left alone.
- Reviewers: the page path first brought `review:threshold` (1ee1048), with assay, mason and vigil. PR-19's migration (5cd37f4, 2026-10-05) set this ticket's reviewers to warden alone, as the operator's level and reviewers now decide, so threshold never reviewed `global-error.tsx` or `?state=error`. The error page is two lines of copy and a retry button with no vendor in it; a threshold pass can be asked for with `contract:qa`.
- Warden's fourth review: thread frames lose their local variables as exception frames do; the scrub's comment says the path and transaction are kept and a path-segment token is the product's to scrub; `EveryCategory` makes the type check fail when an SDK upgrade adds a nested `dataCollection` key, not only a top-level one.
- Other threads' commits from the shared index swept in some of these edits (2707c47, eae70ad) and reverted six of them once (1d8a050); 795065a restores them.

## Not verified

- C5 (manual, deferred): needs the hosted staging project. Steps are in `evidence/C5-operator.md`.
- C6 (manual, done by the agent): the removal was rehearsed again on a scratch worktree of 6f1ce01 on 2026-10-05, after the tunnel went off and the build script changed (`evidence/C6-removal.md`). Grep empty and `yarn verify` green; the two comments the runbook missed are now named in it (1f1790a). Every commit since lands inside `apps/web/lib/error-reporting/` (which the removal deletes), in `env.ts`'s Sentry lines the runbook already names, or in the C5 evidence; only the runbook's `resolveSentryProject` import name changed, so the result holds.

## Next

Taylor creates the Sentry org (US) and the two projects, sets the Vercel variables in `evidence/C5-operator.md`, and opens `/?state=error` on a preview.
