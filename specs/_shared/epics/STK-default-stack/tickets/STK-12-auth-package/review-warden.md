# Review — warden on STK-12

> Written by `yarn review:run warden STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: b54069cd7147ddd773f5e5c76af846365c8398f6
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:13:37Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

I have read the contract, `results.json`, the as-built, all five evidence files plus `evidence/live-checks.md`, every changed file under `packages/auth/` and `apps/web/`, the boundaries config, the manifest, the removal runbooks, the docs rows, and the installed `@supabase/auth-js` source. This is a third-round review at head `53a8da1`; I checked the previously open items first.

## Criteria

**C1 — met.** `packages/auth/src/context.ts:98-119` calls `getUser()` and nothing else; `result.error || !user` returns null (`:106`) and a throw returns null (`:100-104`). `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES` only. A repo-wide grep finds `getSession()` nowhere in product code — only in `context.test.ts` and two comments — and the test reader throws if the seam ever reaches for it (`context.test.ts:41-43`). The evidence is the right shape rather than a mock agreeing with itself: `context.test.ts:87-108` builds a real `@supabase/ssr` client over a cookie in the SDK's own format with a forged signature (`test-helpers.ts:44-70`), asserts `getSession()` *would* hand back an admin, stubs `/auth/v1/user` at 401, and the seam answers null; `:110-132` proves the role comes from the server's answer, not the cookie. C1.log:556-619.

**C2 — met.** `cookies.ts:52-67` deletes every `sb-<ref>-auth-token*` whose ref differs from the configured project's; `session.ts:63-75` purges before the refresh and filters the purged names out of the client's `getAll`, so the SDK cannot resurrect them. Six tests cover both switch directions, the project's own cookies surviving, `sb-session-notes` surviving, all five cookie forms, and the no-project switch (`session.test.ts:27-119`; C1.log:681-724). The one fact the purge rests on is pinned to the installed SDK: C1.log:495-497 shows the storage key read off a built client equals `authCookieStem(url)`, so an SDK rename fails the suite instead of silently signing users out. Live-checked through the proxy (`live-checks.md:9-12, 50`).

**C3 — met.** `boundaries.js:58` adds the `auth` element, `:76` gives it `config, db, observability` only, `:86` pins `@supabase/*` to `auth`. C3.log is a bare header, so it proves only exit 0; the substance is the six auth probes inside C4.log:69-92 and 117-128.

**C4 — met.** `yarn verify` exit 0 at the recorded head. `SUPABASE_SERVICE_ROLE_KEY` is present in all three forms in `.env.example:70-72` and `turbo.json:27-29`, which is where `check-client-bundle` derives its planted names, so the seeding is by construction rather than a hand-kept list; C4.log:1340 reports 18 server-only values and none in 27 browser-facing files. The round-one Blocking stays closed at the layer I asked for: `publicKeyProblem` (`config.ts:46-52`) refuses an `sb_secret_` key or a service-role JWT, applied in the client schema (`env.ts:113-122`), which `createEnv` evaluates before `nextConfigEnv` (`:148`) can collapse the value into `next.config.ts:42` — the build dies before a bundle exists (`live-checks.md:42-44`).

**C5 — correctly deferred, not met and not claimed.** `--verdict deferred` is the sanctioned mechanism, the reason matches the contract, and `C5-operator.md` gives executable steps. Its record is stale against nine files (C4.log:23); I re-read the callback and sign-in code against the steps and they still describe current behaviour, so the deferral remains honest.

**Non-negotiables — all six hold.** Admin client session-free, asserted on the built client's own options (`admin.ts:20-24`). Refresh only in `apps/web/proxy.ts:22`, whose return value is discarded, so the proxy authorizes nothing. Browser client over inlined literals (`client.ts:8-14`, `env.ts:136-142`). Client-safe subpaths walked for server imports with the walker itself proven to detect one, and all four server subpaths asserted to carry `import "server-only"` under `--conditions=react-server` (`client-safe.test.ts:60-86`, `package.json:39`).

Spot-checked as-built claims that held: `toolkit.json:247-263`, `remove-supabase-auth.md:70` (service-role rotation), `codebase-conventions.md:90`, `tech-stack.md:42-43`, `apps/web/package.json:14-19`. The open redirect is shut at both the path and origin layers (`redirect.ts:15-33`); the action keeps the address out of the URL and the log (`actions.ts:44`, and `redact.ts:65-73` drops an Error's own properties, so a Postgres `detail` carrying an email never prints); every callback redirect carries no-store headers (`route.ts:27-36`); an unconfigured tier is "not set up", not "expired" (`route.ts:49-52`).

## Findings

**Should-fix — `apps/web/app/auth/sign-in/actions.ts:33`: `signInWithOtp` is called with no `shouldCreateUser`, so a dashboard setting silently decides both the registration policy and whether this form is a user-existence oracle.** The installed SDK sends `create_user: options?.shouldCreateUser ?? true` (`node_modules/@supabase/auth-js/src/GoTrueClient.ts:2305`), so on the Supabase default every address submitted becomes an account on confirmation — under copy that says only "We will email you a link that signs you in" (`page.tsx:69`). Turn signups off in the dashboard and the opposite failure appears: Supabase answers with an error for an address that has no user, `actions.ts:43-46` sends `?state=error`, and a known address gets `?state=sent` — so which of two pages renders answers "does this person have an account here?" for anyone who can type an address. The adversary is the one who already knows the victim, and for the domains this starter exists to be copied into, "X has an account here" is the disclosure that matters. Neither branch is chosen anywhere in the ticket: the contract's out-of-scope covers OAuth and extra UI, not this. Fix it where the decision is made in code — pass `shouldCreateUser` explicitly, and if it is false, collapse the unknown-user error onto `?state=sent` so both answers look alike. `.env.example:49-60` and `C5-operator.md:13` already name the rate-limit setting; this belongs beside it. Not Blocking: the oracle branch needs a non-default setting, the default branch is the behaviour every magic-link quickstart ships, and nothing sits behind this form yet.

**Consider — `packages/auth/src/config.ts:46-52` and `docs/engineering/tech-stack.md:42`: the secret-key guard still carries no re-verify trigger.** I raised this last round; the as-built's "Not done from the reviews" (`:40-45`) neither takes it nor declines it. The guard knows two key shapes, dated in a comment. A third Supabase secret format passes it and the key is published — the same impact as the finding it fixed, with nothing failing. The row says "verified 2026-10-04" but does not name key-format prefixes as the thing to re-check on a bump.

**Consider — `apps/web/proxy.ts:22-43`: `updateSession` is still unwrapped.** Also raised last round, also neither taken nor declined. The matcher covers every page and route (`:48-50`), and the proxy authorizes nothing, so a throw during refresh costs the whole site and buys no security. I cannot name a live trigger today — `getUser` returns network errors rather than throwing, and `projectRef`'s `new URL` is guarded by `env.ts:111` — but a catch that logs and returns the pass-through response is strictly better.

**Consider — `results.json:98-111` and `review-warden.md:7,11` disagree about the last warden run.** The record holds the 21:26:43 run at head `9e13361` with `status: FAIL` and `evidence_sha256: 431ae330…`; the file on disk is the 21:39:32 run at head `d0a1b7b` with verdict PASS. The file's own header says check-specs binds it to those hashes, so the binding is broken, and a merge-reader following `results.json` to the review would read a different verdict than the one recorded. A records matter rather than a security one, but Taylor reads this pair before merge.

VERDICT: PASS
