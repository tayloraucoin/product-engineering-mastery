# Review — mason on STK-12

> Written by `yarn review:run mason STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: b54069cd7147ddd773f5e5c76af846365c8398f6
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:13:38Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C1.log (sha256 7d0ab7ea3600)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C2.log (sha256 a2ffb925479d)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C3.log (sha256 af554cb87fb0)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C4.log (sha256 5cdfc0b94278)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C5-operator.md (sha256 f5ff425ccc9e)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/auth/callback/route.ts, apps/web/app/auth/sign-in/_components/email-field.tsx, apps/web/app/auth/sign-in/_components/send-link-button.tsx, apps/web/app/auth/sign-in/actions.ts, apps/web/app/auth/sign-in/page.tsx, apps/web/env.ts, apps/web/lib/supabase/admin.ts, apps/web/lib/supabase/client.ts, apps/web/lib/supabase/config.ts, apps/web/lib/supabase/context.ts, apps/web/lib/supabase/local-mirror.ts, apps/web/lib/supabase/server.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, packages/auth/eslint.config.mjs, packages/auth/package.json, packages/auth/src/admin.test.ts, packages/auth/src/admin.ts, packages/auth/src/browser.ts, packages/auth/src/client-safe.test.ts, packages/auth/src/config.test.ts, packages/auth/src/config.ts, packages/auth/src/context.test.ts, packages/auth/src/context.ts, packages/auth/src/cookies.ts, packages/auth/src/redirect.test.ts, packages/auth/src/redirect.ts, packages/auth/src/server.ts, packages/auth/src/session.test.ts, packages/auth/src/session.ts, packages/auth/src/test-helpers.ts, packages/auth/tsconfig.json, packages/config/eslint/boundaries.js, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I have read the contract, `results.json`, the as-built, all five evidence files plus `evidence/live-checks.md`, and every changed file at the current head. The evidence hashes in my prompt match the run records in `results.json`, so what I read is what was recorded.

## Criteria

**C1 — met.** `packages/auth/src/context.ts:98-118` calls `getUser()` and nothing else: a throw is caught (`:101-103`), and `result.error || !user` returns null (`:106`), so a response carrying both a user and an error is still anonymous. `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES` from `@pem/db/rls`; `user_metadata` is never read. The proof is the strong kind rather than a mock agreeing with itself: `context.test.ts:87-108` builds a real `@supabase/ssr` server client over a forged session cookie, asserts at `:100` that `getSession()` *would* hand back an admin, stubs `/auth/v1/user` at 401, and the seam returns null; `:110-132` then shows the same cookie passing with the role taken from the server's answer (`user`), not the cookie's claim (`admin`). The test reader throws if `getSession()` is ever called (`:41-43`). Repo-wide, `getSession` appears only in that test and two comments. C1.log records 18 of 18 in the auth suite, zero skipped.

**C2 — met.** `cookies.ts:40-66` matches `sb-<ref>-auth-token` plus every chunk and verifier form and deletes each ref but the configured project's; `session.ts:63-74` runs the purge first and filters purged names out of the client's `getAll`, so the SDK cannot resurrect them, and the growing-batch write at `:55-61` is exactly the contract `proxy.ts:24-37` relies on when it rebuilds its response. Six tests cover both switch directions, the project's own cookies surviving, the near-miss `sb-session-notes` surviving, all five cookie shapes, and the no-project clear (C2.log:590-704). `config.test.ts:35-42` pins `authCookieStem` to the storage key the installed SDK actually builds, so an SDK rename fails the suite instead of silently stranding sessions — the right mechanical guard for a vendor fact. The live purge through `proxy.ts` is in `live-checks.md:9-12, 50`.

**C3 — met.** `boundaries.js:58` adds the `auth` element, `:77` grants it `config, db, observability` only — correctly no `env`, re-enforced by `packages/auth/eslint.config.mjs:9-17` — and `:86` pins `@supabase/*` to `auth`. `tooling/boundaries.test.ts:38-58, 89-93` carries the six probes, all passing in C4.log:69-92, 117-126. `@supabase/*` appears in no file outside `packages/auth`, the manifest and the boundaries config. C3.log is a bare header (exit 0, no output), so on its own it proves only the exit code; the substance sits in the probes inside C4.

**C4 — met.** C4.log:1340 — 18 server-only values, none in 27 browser-facing files; exit 0. The seeding claim holds by construction, not by a list someone must maintain: `check-client-bundle.ts:74-93` derives planted names from `.env.example` and `turbo.json`, and `SUPABASE_SERVICE_ROLE_KEY` is in all three forms in both (`.env.example:70-72`, `turbo.json:27-29`) — I counted the plantable names in `.env.example` and get exactly 18, matching the log. The `NEXT_PUBLIC_` blind spot the bundle check cannot see is closed at the seam: `config.ts:46-52` refuses an `sb_secret_` key or a `service_role` JWT, `env.ts:113-122` wires it into the publishable slot, `config.test.ts:18-33` tests both rejections and both accepts, and `live-checks.md:42-45` shows a build exiting 1 naming the variable.

**C5 — correctly deferred, not met and not claimed.** `--verdict deferred`, the reason matches the contract, and `C5-operator.md` gives steps a person can run, now including the rate-limit setting. The as-built lists it under "Not verified" with two other honest gaps.

**Non-negotiables — all six hold.** Four factories; `ADMIN_AUTH_OPTIONS` session-free and asserted on the built client's own fields (`admin.test.ts:14-17`); `updateSession` called only from `apps/web/proxy.ts:42`; the browser client built from `env.NEXT_PUBLIC_*` literals collapsed through `next.config.ts:42`, with `nextPublicEnv` refusing any other name; `client-safe.test.ts:53-86` classifies every exported subpath, walks the client-safe three for server imports, built-ins and workspace packages, and asserts `server-only` on the other four — and because test 1 compares `Object.keys(pkg.exports)` against the union, a new subpath fails the suite until it is classified. That is enforcement, not prose.

**Architecture.** Placement is what D-STK-7 and conventions §1 prescribe; the one judgment call — the browser client in the app because Next inlines only literal reads — is argued in-file at `lib/supabase/client.ts:1-6`. Every door this ticket opens (`packages/auth/**`, `proxy.ts`, `env.ts`, `boundaries.js`) is pre-ratified by D-STK-7, D-STK-3/4, D-STK-16 and REC 0010, and the new `@pem/auth → @pem/db` edge runs with the ratified graph, not across it: one source of truth for the role vocabulary, with the inline-on-removal instruction carried in `remove-supabase-database.md:40-46` down to the test line. I endorse the cost the as-built flags: the proxy discards `updateSession`'s user and the seam calls `getUser()` again. Carrying identity from proxy to RSC through a header is the foot-gun that avoids, and "getUser everywhere" is the rule a toolkit should copy. The latency exit is named and reversible. The two Should-fix items from the prior round are answered: `invalid` is now checked (`live-checks.md:53`) and the test-count note no longer cites numbers its evidence contradicts.

## Findings

**Should-fix — `docs/runbooks/remove-supabase-auth.md:47`: the runbook's "Files to edit" omits `docs/engineering/codebase-conventions.md`.** Removing this module leaves §4's `@pem/auth` row (`codebase-conventions.md:90`) and `@supabase/*` in the SDK-owner paragraph (`:98`) describing a package that is gone, plus `auth` in the layer-order line at `:77`. Its sibling carries exactly this edit (`remove-supabase-database.md:35`), so this is drift from the protocol's own pattern, not taste. `yarn check-stack` reads files, variables and dependencies — it cannot see doc prose, so nothing will catch it.

**Consider — `packages/auth/src/cookies.ts:65`: the delete writes carry `path` and `maxAge` but no `domain`.** Correct for every cookie `@supabase/ssr` writes today and verified live; restated because it is unchanged from the last round. A product that sets `cookieOptions.domain` would have a foreign cookie survive the purge and the header keep growing — the exact failure this code exists to prevent. One comment naming the assumption is enough.

**Consider — `evidence/live-checks.md:32`: the first round's `loading` line says "the field and the button disabled," which `:54` and the code contradict** (`email-field.tsx` takes no `disabled` prop). The later section corrects it and the as-built states the current behaviour, which is how an append-only log should work; a three-word "superseded by the second round" on that line keeps the frozen record from misleading whoever reads it next.

Everything else I checked held: no upward or cross-app import, no boundaries suppression anywhere in the ticket's paths (the one `eslint-disable` is `no-control-regex` at `redirect.ts:19`, with its reason), the open redirect shut at both the path and origin layers with the bypass cases tested (`redirect.test.ts:18-32`), the service-role key reachable only from `server-only` modules, `@pem/db/rls` importing nothing that opens a connection, and `server-only` correctly kept out of the manifest's `auth` dependencies so a clean removal still passes.

One close-out fact, not a finding: `results.json` records `review:warden` FAIL, and `review:vigil`'s PASS went stale against the current head. Both must be re-run before this ticket closes, whatever my verdict.

VERDICT: PASS
