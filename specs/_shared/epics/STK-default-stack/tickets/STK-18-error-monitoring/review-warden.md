# Review — warden on STK-18

> Written by `yarn review:run warden STK-18`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 77aee5f65dd609eb5bc1926767f5c3923dc49c6d27adb61cebbdfcec1903249c
- as_built_sha256: 6ed0d17b66e4deb858412aaadd83abd13aee1a68b66c9e61e12aaa4ce4a3503a
- head: 3285758dda0c96e80492ba2d5546abdae0786fb3
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T02:42:30Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-18`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-18 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/evidence/C1.log (sha256 2e1fd0d02a94)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/evidence/C2.log (sha256 2e1fd0d02a94)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/evidence/C3.log (sha256 9610d71a4bd3)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/evidence/C4.log (sha256 c3b0baf8a7b0)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/evidence/C5-operator.md (sha256 3366a8db17f4)
   - C6 manual: specs/_shared/epics/STK-default-stack/tickets/STK-18-error-monitoring/evidence/C6-removal.md (sha256 d512cc351c0a)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/global-error.tsx, apps/web/app/page.tsx, apps/web/env.ts, apps/web/instrumentation-client.ts, apps/web/instrumentation.ts, apps/web/lib/error-reporting/build.test.ts, apps/web/lib/error-reporting/build.ts, apps/web/lib/error-reporting/connect.test.ts, apps/web/lib/error-reporting/connect.ts, apps/web/lib/error-reporting/dsn.ts, apps/web/lib/error-reporting/options.ts, apps/web/lib/error-reporting/scrub.test.ts, apps/web/lib/error-reporting/scrub.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, apps/web/sentry.edge.config.ts, apps/web/sentry.server.config.ts, docs/engineering/tech-stack.md, docs/runbooks/remove/error-monitoring.md, packages/config/eslint/boundaries.js, specs/_shared/epics/STK-default-stack/technical.md, tooling/boundaries.test.ts, tooling/check-client-bundle.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Per criterion

**C1 — the scrub (`beforeSend`).** Met. `apps/web/lib/error-reporting/scrub.ts:77` rebuilds `request` as url-plus-method only, so `cookies`, `data`, `headers`, `query_string` and `env` cannot survive (`scrub.ts:80-86`); `stripQuery` cuts at `?` or `#` (`scrub.ts:71-74`); the user collapses to a scrubbed id, and a user with no id is dropped whole (`scrub.ts:88-93`). `extra` and `server_name` are deleted, breadcrumb `data` dropped, exception and thread frames lose `vars`, and message, exception values, tags, transaction, `logentry` and `contexts` all pass `scrubText`/`redactValue`. `scrub.test.ts` asserts the whole set on a synthetic event, including a serialised leak sweep for seven planted values; those tests run and pass in `evidence/C1.log:2032-2099` at the recorded HEAD. I checked the claim that the scrub is a real backstop rather than a duplicate of `dataCollection`: `@sentry/core`'s request-data integration attaches scope-held request body data unconditionally (`node_modules/@sentry/core/build/cjs/integrations/requestdata.js:27`, `data: options.include?.data ?? true`), and `onRequestError` puts the request headers on the scope (`node_modules/@sentry/nextjs/build/cjs/common/captureRequestError.js:12-17`). Both land in `event.request`, which `beforeSend` rebuilds. Two layers, and the second one holds alone.

**C2 — registers only with a DSN.** Met. `dsn.ts:18-33` reads the tier's own variable only, with no fallback to production's; `connect.ts:41` returns false before `init` when the DSN is absent. `connect.test.ts:35-45` proves local registers nothing with both other tiers' DSNs set. In the browser the value is the literal from `next.config.ts`'s env block, and `env.ts:257` sets it to `""` rather than `undefined` so a `.env.local` production DSN cannot be inlined into a local bundle — I verified the mechanism in Next 16.3.8 itself (`node_modules/next/dist/lib/static-env.js:71-78` and `node_modules/next/dist/build/define-env.js:61-62` spread `config.env` over the ambient `NEXT_PUBLIC_*` values, so `""` wins), and `nextPublicEnv` keeps an empty string while dropping only `undefined` (`packages/env/src/next-public.ts:20`). The app's entire Sentry surface is three `init` calls through `sentryOptions` plus `captureException` and `captureRequestError` — no bypass path.

**C3 — boundaries.** Met. `packages/config/eslint/boundaries.js:130` pins `@sentry/*` to `app-web`; `tooling/boundaries.test.ts:174-184` bans it in `packages/observability` and `packages/ui`, and line 263-265 allows it in `apps/web/lib/error-reporting`. `evidence/C3.log` exit 0, and the three probes pass in `evidence/C4.log:284-291, 404-405`.

**C4 — a tokenless build passes the chain.** Met. `build.ts:20-24` requires deployed, token, org and the tier's project together; `build.test.ts:16-41` covers the tokenless, the undeployed and the uploading cases, and `:60-83` covers a staging build missing `SENTRY_PROJECT_STAGING` uploading nothing rather than into production's project. `evidence/C4.log` is `yarn verify` exit 0 with `web:build` compiled and `check-client-bundle — 34 server-only value(s), none in 24 browser-facing file(s)` (line 3317) — which also exercises a build that holds a sentinel `SENTRY_AUTH_TOKEN`, so the `SENTRY_CLI_NO_TELEMETRY=1` opt-out in `apps/web/package.json:8` matters and is pinned by `build.test.ts:47-58`.

**C5 — staging event with the commit release.** Not verified, correctly deferred: there is no hosted org yet. `evidence/C5-operator.md` is a complete operator script, and it puts the controls the code cannot reach at the vendor layer — IP-address storage off, server-side scrubber on, retention at the plan minimum, a spend cap, per-key rate limits on both projects (both DSNs are public, and `?state=error` throws on every staging request), and the inbound filters. Listed under Operator checks in `specs/_status.md:65`.

**C6 — removal rehearsal.** Met, with a disclosure I want Taylor to have read rather than filed: the rehearsal was run by the agent on a throwaway worktree of 6f1ce01, not by a person and not at current HEAD, and the vendor-side steps were not run. Both the as-built and `evidence/C6-removal.md:3,11` say so. The staleness argument holds — every commit since lands inside `apps/web/lib/error-reporting/` (which the removal deletes), in `env.ts` lines the runbook already names, or in `toolkit.json`'s `boundaries` field, which `check-stack` does not read. The runbook is complete against the module: files, edits, variables (`check-stack` expands `_LOCAL`/`_STAGING` from the base names, `tooling/check-stack.ts:43`), the dependency, the boundaries entries, the vendor-side steps, and the two gaps the rehearsal itself found. The Sentry mentions left outside the runbook's edit list are the removal catalogue, the new-project guide, the generated directory map and specs history — all correct to keep.

Non-negotiables: NN1 ratified (`technical.md:47`, US, before the org exists); NN2 held; NN3 all eleven categories set with `EveryCategory` failing the type check on a new or nested key (`options.ts:32-71`); NN4 held; NN5 held; NN6 held — no sample rates, `enableLogs: false`, and seven integrations dropped by names read from the SDK's own factories at the installed version (`connect.test.ts:141-165`), including the release-health sessions that would otherwise reach Sentry on every page load; NN7 held.

## Findings

**Consider — `apps/web/lib/error-reporting/options.ts:73-86`: the scrub has no span-side twin, and the next ticket inherits the hole.** `scrub.ts:1-9` promises that a category left on by mistake still never leaves, and for events that is true. Spans are a different envelope: `@sentry/core`'s `addNormalizedRequestDataToSpan` writes `http.request.body.data` from scope-held body data with no `dataCollection` gate (`requestdata.js:27,155-160`), and this config sets no `beforeSendSpan`. Nothing is sent today — no sample rate, `BrowserTracing` dropped — so this is inert, not a defect. But whoever turns tracing on inherits a backstop that covers one envelope of two. A line in `options.ts` naming `beforeSendSpan` as required-with-tracing costs nothing now and is the difference between a decision and an oversight later.

**Consider — `apps/web/env.ts:257`: the empty-string DSN override is correct but unpinned.** The protection depends on Next spreading `config.env` after the ambient `NEXT_PUBLIC_*` values. It does at 16.3.8, and I checked the source rather than the claim. Nothing in the repo asserts that ordering, and `check-client-bundle` cannot help because it skips `NEXT_PUBLIC_` names by design (`tooling/check-client-bundle.ts:88-89`). If a Next upgrade flips the precedence, a developer with a production DSN in `.env.local` starts shipping local errors into the production project — not a credential leak, since the DSN is public, but real data crossing a tier boundary, silently. The as-built already names this as a drafted follow-up; keeping it on the list is the whole of my ask.

Nothing blocking. Nothing I would hold the merge for.

VERDICT: PASS
