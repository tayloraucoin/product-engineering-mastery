# Review — mason on STK-12

> Written by `yarn review:run mason STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 159e25dc3a425dee3d2161566a419ac46a8b1cceff4594f39e4f0bdd7d16974a
- head: d0a1b7b2a508207c286584634b73d427484c1209
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:39:31Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

I have read the contract, results, as-built, all five evidence files plus `evidence/live-checks.md`, and every changed file. The evidence hashes in my prompt match the run records in `results.json`, so what I read is what was recorded.

## Criteria

**C1 — met.** `packages/auth/src/context.ts:98-118` calls `getUser()` and nothing else; a throw is caught (`:101-103`), and `result.error || !user` returns null (`:107`) — so a response carrying both a user and an error is still anonymous. `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES` from `@pem/db/rls`; `user_metadata` is never read. The proof is the strong kind: `context.test.ts:87-108` builds a real `@supabase/ssr` server client over a forged session cookie, asserts at `:100` that `getSession()` *would* hand back an admin, stubs `/auth/v1/user` at 401, and the seam returns null — then `:110-132` shows the same cookie passing with the role taken from the server's answer (`user`), not the cookie's claim (`admin`). The seam's test reader throws if `getSession()` is ever called (`:41-43`). Across the repo, `getSession` appears only in that test and two comments (grep, `*.ts,*.tsx`). C1.log:530-560 records all eight.

**C2 — met.** `cookies.ts:40-63` matches `sb-<ref>-auth-token` plus the chunk and verifier forms and deletes every ref but the configured project's; `session.ts:51-59` runs the purge first and filters the purged names out of the client's `getAll`, so the SDK cannot resurrect them, and the growing-batch write at `:43-49` is exactly the contract `proxy.ts:24-35` depends on when it rebuilds its response. Five tests cover both switch directions, the project's own cookies surviving, a near-miss `sb-session-notes` surviving, and all five cookie shapes (C1.log:584-622). `config.test.ts:35-42` pins `authCookieStem` to the storage key the installed SDK actually builds, so an SDK rename fails the suite instead of silently stranding sessions — that is the right mechanical guard for a vendor fact. The live purge through `proxy.ts` is in `live-checks.md:9-12`.

**C3 — met.** `boundaries.js:58` adds the `auth` element, `:77` grants it `config, db, observability` only — correctly no `env`, re-enforced by `packages/auth/eslint.config.mjs:9-17` — and `:85` pins `@supabase/*` to `auth`. `tooling/boundaries.test.ts:38-58, 89-93` adds the six probes, passing in C4.log:73-92, 121-126. `@supabase/*` appears in no file outside `packages/auth`, the manifest and the boundaries config (grep). C3.log is a bare header (exit 0, no output), so on its own it proves only the exit code; the substance sits in the probes inside C4.

**C4 — met.** C4.log:1338 — 18 server-only values, none in 27 browser-facing files; exit 0. The seeding claim holds structurally: `check-client-bundle.ts:74-75, 78-81` derives planted names from `.env.example` and `turbo.json`, and `SUPABASE_SERVICE_ROLE_KEY` is in all three forms in both (`.env.example:70-72`, `turbo.json:27-29`), so the key is planted by construction rather than by a list someone must remember. The `NEXT_PUBLIC_` blind spot that warden ranked Blocking is now closed at the seam: `config.ts:46-52` refuses an `sb_secret_` key or a `service_role` JWT, `env.ts:113-122` wires it into the publishable slot, `config.test.ts:18-33` tests both rejections and both accepts, and `live-checks.md:42-45` shows a build exiting 1 with the variable named.

**C5 — correctly deferred, not met and not claimed.** `--verdict deferred`, the reason matches the contract, and `C5-operator.md` gives steps a person can run. The as-built lists it under "Not verified" with two other honest gaps.

**Non-negotiables — all six hold.** Four factories (`server.ts`, `browser.ts`, `admin.ts`, `session.ts`); `ADMIN_AUTH_OPTIONS` session-free and asserted on the built client's own fields (`admin.test.ts:14-17`); `updateSession` called only from `apps/web/proxy.ts:22` (grep); the browser client built from `env.NEXT_PUBLIC_*` literals collapsed through `next.config.ts:42`; `client-safe.test.ts:53-86` classifies every exported subpath, walks the client-safe three for server imports, built-ins and workspace packages, and asserts `server-only` on the other four — and because test 1 compares `Object.keys(pkg.exports)` against the union, a new subpath fails the suite until it is classified. That is enforcement, not prose.

**Architecture.** Placement is what D-STK-7 and conventions §1 prescribe, and the one judgment call — the browser client living in the app because Next inlines only literal reads — is argued in-file at `lib/supabase/client.ts:1-6`. The doors this ticket opens (`packages/auth/**`, `proxy.ts`, `env.ts`, `boundaries.js`) are all pre-ratified by D-STK-7, D-STK-3/4, D-STK-16 and REC 0010. I'll say plainly that I endorse the decision the as-built flags as a cost: the proxy discards `updateSession`'s user and the seam calls `getUser()` again. Carrying identity from proxy to RSC through a header is the foot-gun this avoids, and "getUser everywhere" is the rule a toolkit should copy. The latency exit is named and reversible.

## Findings

**Should-fix — `as-built.md:22`: the state-check claim does not match its own evidence.** It says the five `?state=` values and the unconfigured page "were all checked in the browser," citing `live-checks.md`. That file (`:29-36`) lists default, `loading`, `sent`, `error`, `expired` and unconfigured — six, but `invalid` is not among them. The risk is near zero (`page.tsx:69-73` renders `invalid` through the identical branch as `error` and `expired`) and no criterion rests on it, which is why this is not Blocking. But the as-built is the permanent record: check it or say it was not checked.

**Should-fix — `as-built.md:40`: stale test counts.** The line explains a 106/105 discrepancy; the recorded evidence is 113 and 112 (`C1.log:5`, `results.json:15,28`) after the re-prove at `b542e0e`. The explanation still holds — both logs show 0 skipped, and the one-test gap is turbo's interleaved replay — but the numbers should be the ones its own evidence shows.

**Consider — `apps/web/app/auth/sign-in/_components/email-field.tsx:8`: a native `<input>` against the `@pem/ui`-only vocabulary.** Honestly declared, and `@pem/ui` has no input yet, so I am not relitigating it. The declared trigger ("a second consumer moves it to `@pem/ui`") is weaker than the rule it departs from: the durable fix is a line in `apps/web/docs/design/components.md` when Phase 3 writes it, so this is a ruled primitive rather than an inherited exception. Assay owns the UI call.

**Consider — `packages/auth/src/cookies.ts:61`: the delete writes carry `path` and `maxAge` but no `domain`.** Correct for every cookie `@supabase/ssr` writes today, and verified live. A product that configures `cookieOptions.domain` would have a foreign cookie survive the purge and the header keep growing — the exact failure this code exists to prevent. One comment naming the assumption is enough.

The browser and admin clients still have no consumer, so their paths are proven by reading only; the as-built already carries that under "Not done from the reviews" and STK-13 onward gives them one. Everything else I checked held: no upward or cross-app import, no suppression, the open redirect shut at both the path and origin layers with the bypass cases tested (`redirect.ts:15-33`), the service-role key reachable only from a `server-only` module, and the two removal runbooks carrying the `@pem/db` coupling this ticket introduced (`remove-supabase-database.md:40-46`).

One close-out fact, not a finding: `review-warden.md` is bound to head `9e1336` and `results.json` still records it FAIL. Its Blocking finding is answered in the code I read, but the ticket cannot close until warden is re-run against the current head.

VERDICT: PASS
