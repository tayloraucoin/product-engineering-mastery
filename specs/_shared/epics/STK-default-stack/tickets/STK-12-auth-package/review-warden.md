# Review — warden on STK-12

> Written by `yarn review:run warden STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 159e25dc3a425dee3d2161566a419ac46a8b1cceff4594f39e4f0bdd7d16974a
- head: d0a1b7b2a508207c286584634b73d427484c1209
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:39:32Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C1.log (sha256 2e2f32b04f1d)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C2.log (sha256 a725da405774)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C3.log (sha256 2dde42ecf73f)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C4.log (sha256 ad4efcb44ffb)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C5-operator.md (sha256 f5ff425ccc9e)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/auth/callback/route.ts, apps/web/app/auth/sign-in/_components/email-field.tsx, apps/web/app/auth/sign-in/_components/send-link-button.tsx, apps/web/app/auth/sign-in/actions.ts, apps/web/app/auth/sign-in/page.tsx, apps/web/env.ts, apps/web/lib/supabase/admin.ts, apps/web/lib/supabase/client.ts, apps/web/lib/supabase/config.ts, apps/web/lib/supabase/context.ts, apps/web/lib/supabase/local-mirror.ts, apps/web/lib/supabase/server.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, packages/auth/eslint.config.mjs, packages/auth/package.json, packages/auth/src/admin.test.ts, packages/auth/src/admin.ts, packages/auth/src/browser.ts, packages/auth/src/client-safe.test.ts, packages/auth/src/config.test.ts, packages/auth/src/config.ts, packages/auth/src/context.test.ts, packages/auth/src/context.ts, packages/auth/src/cookies.ts, packages/auth/src/redirect.test.ts, packages/auth/src/redirect.ts, packages/auth/src/server.ts, packages/auth/src/session.test.ts, packages/auth/src/session.ts, packages/auth/src/test-helpers.ts, packages/auth/tsconfig.json, packages/config/eslint/boundaries.js, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I have read the contract, results.json, the as-built, all five evidence files plus `evidence/live-checks.md`, every changed file under `packages/auth/`, `apps/web/`, the boundaries config, the manifest, the two runbooks, the docs rows, and `tooling/check-client-bundle.ts`. This is a re-review: my prior pass (`review-warden.md`, head `9e13361`) FAILed on one Blocking finding. I checked that finding first.

## Criteria

**C1 — met.** `packages/auth/src/context.ts:98-119` calls `getUser()` and nothing else; `result.error || !user` returns null (`:106`), a throw returns null (`:102-104`), and `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES` only. `getSession()` is called nowhere in product code — a repo-wide grep finds it only in `context.test.ts:99` and two comments, and the test's reader stub throws if the seam ever reaches for it (`context.test.ts:41-43`). The evidence is the right shape: `context.test.ts:87-108` builds a real `@supabase/ssr` client over a forged cookie, asserts `getSession()` *would* hand back an admin, stubs `/auth/v1/user` at 401, and the seam answers null; `:110-132` then proves the role comes from the server's answer, not the cookie. C1.log:530-539.

**C2 — met.** `cookies.ts:48-63` deletes every `sb-<ref>-auth-token*` whose ref differs from `projectRef(config.url)`; `session.ts:51-62` purges before the refresh and filters purged names out of the client's `getAll`, so the SDK cannot resurrect them. Five tests cover both switch directions, the project's own cookies surviving, an unrelated `sb-session-notes` surviving, and all five cookie forms (C1.log:584-618). New since my last pass: `config.test.ts:35-42` reads `storageKey` off a client built by the installed SDK and asserts it equals `authCookieStem(url)` — that pins the one fact the whole purge rests on, so an SDK rename fails the suite instead of silently signing users out.

**C3 — met.** `boundaries.js:58` adds the `auth` element, `:76` gives it `config, db, observability` only, `:86` pins `@supabase/*` to `auth`. Six auth probes pass in C4.log:73-92, 121-128. C3.log is a bare header (exit 0, no output), so it proves only the exit code; the substance is the probe set inside C4.

**C4 — met.** `check-client-bundle.ts:78-93` derives planted names from `.env.example` and `turbo.json`, both of which now carry `SUPABASE_SERVICE_ROLE_KEY` in all three forms (`.env.example:70-72`, `turbo.json:27-29`) — seeded by construction, not by a hand-kept list. C4.log:1338: 18 server-only values, none in 27 browser-facing files; `yarn verify` exit 0.

My prior Blocking is closed, and at the layer I asked for. `publicKeyProblem` (`packages/auth/src/config.ts:46-52`) refuses an `sb_secret_` key or a JWT whose `role` claim is `service_role`; `apps/web/env.ts:113-122` applies it in the client schema, which `createEnv` (`:82`) evaluates before `nextConfigEnv` (`:148`) can collapse the value into `next.config.ts:42`'s inlined env block. So the build dies before a bundle exists. Tested (`config.test.ts:18-33`, C1.log:355-356) and live-checked (`live-checks.md:42-44`: a build with `sb_secret_synthetic` exits 1 naming the variable). I also checked the obvious bypass: `@t3-oss/env-core/dist/index.js:12` honours only an explicit `skipValidation`, and no `SKIP_ENV_VALIDATION` escape hatch exists in the installed version, so the guard cannot be switched off by an environment variable. Putting the predicate in `@pem/auth/config` rather than in the app means a product that copies the package inherits it.

**C5 — correctly deferred, not met and not claimed.** `--verdict deferred` with `deferred: true` is the sanctioned mechanism; the reason matches the contract; `C5-operator.md` gives executable steps, now including the email rate-limit confirmation (`:13`). Listed under "Not verified" with two other honest gaps.

**Non-negotiables — all six hold.** Admin client session-free, asserted on the built client's own fields (`admin.ts:20-24`, `admin.test.ts:14-17`). Refresh only in `apps/web/proxy.ts:22`. Browser client over inlined literals (`client.ts:8-14`, `env.ts:136-142`). Client-safe subpaths walked for server imports, with the walker itself proven to detect one (`client-safe.test.ts:60-81`). New since my last pass: all four server subpaths open with `import "server-only"` and `client-safe.test.ts:83-86` asserts it, with the package's own tests running under `--conditions=react-server` (`package.json:39`) — my prior Consider, resolved at a stronger layer than I suggested.

Spot-checked as-built claims that held: `remove-supabase-database.md:40-46` carries the promised "When auth stays" section with the exact inlining; `tech-stack.md:42-43` carries both rows and is honest that `apps/docs` floats `server-only`; `codebase-conventions.md:90` carries the row; `toolkit.json:247-263` omits `server-only` from the `auth` dependencies for the stated reason; `packages/auth/eslint.config.mjs:9-17` bans `process.env` in the package; `apps/web/env.ts` is still the app's only reader. Sign-out is drafted (`STK-24-auth-sign-out/contract.md` exists), which answers my prior Consider about revocation having no home.

## Findings

No Blocking, no Should-fix.

**Consider — `packages/auth/src/config.ts:46-52`: the secret-key guard knows two key shapes, pinned in a comment rather than in a row with an expiry.** The comment honestly dates what it read (`sb_secret_`, service-role JWT, CLI 2.119.0, 2026-10-04). If Supabase introduces a third secret format, the guard passes it and the key is published — the same impact as the finding it fixed, with nothing failing. Every other vendor fact in this repo carries an expiry condition in `tech-stack.md`; this one is the control for the worst disclosure the stack can produce and does not. One row, or one line in the `@supabase/*` row naming "key-format prefixes" as the thing to re-verify on a bump.

**Consider — `apps/web/proxy.ts:22-36`: a throw during refresh fails every route instead of serving the request signed out.** `updateSession` is not wrapped, and the proxy matcher covers every page and route (`:42-44`). The paths I can reach are narrow — `getUser` returns network errors rather than throwing, and `projectRef`'s `new URL` is protected by `env.ts:111`'s `z.url()` — so I can't name a live trigger today. But the proxy authorizes nothing, so failing closed buys no security and costs the whole site. A try/catch that logs and returns the pass-through response is strictly better than the current behaviour.

**Consider — `apps/web/app/auth/sign-in/actions.ts:33`: the abuse cap is a dashboard setting with no revisit trigger.** The accepted risk is recorded (as-built Deviations) and the operator steps now name the setting, which is the honest answer while the stack has no rate-limit seam — `technical.md:56`'s ticket order has none. I am not re-ranking a logged acceptance. What it lacks is the trigger: name custom SMTP, or the first ticket that adds a KV seam, as the moment this returns. An acceptance without a revisit date is how a vector gets inherited silently.

**Consider — `as-built.md:40` states test counts the recorded evidence does not show.** It says C1 and C2 "report 106 and 105 tests"; the logs at this head report 113 (C1.log:5) and 112 (C2.log:5). The explanation still holds — same command, same head, three seconds apart, identical one-test delta, both logs `# skipped 0` — but an as-built is immutable after merge, and this is the one line in it whose numbers a later reader would check against the files.

Everything else I probed held: the open redirect is shut at both the path and origin layers with the bypass cases tested (`redirect.ts:15-33`, C1.log:562-575); the sign-in action keeps the address out of the URL and the log (`actions.ts:44`, confirmed in `live-checks.md:17`); the callback echoes nothing on failure and treats an unconfigured tier as "not set up" rather than "expired" (`route.ts:32-36`); `?state=sent` is returned whether or not the address exists, so the form confirms nothing about a target; the proxy discards `updateSession`'s return, so it authorizes nothing; the mirror's `settled` set stays empty off Mode A, since `localAuthMirror()` returns undefined (`local-mirror.ts:37-39`); and `remove-supabase-auth.md:70` still remembers to rotate the service-role key.

VERDICT: PASS
