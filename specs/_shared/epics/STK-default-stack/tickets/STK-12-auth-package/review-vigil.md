# Review — vigil on STK-12

> Written by `yarn review:run vigil STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: b54069cd7147ddd773f5e5c76af846365c8398f6
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:13:38Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — vigil on STK-12

I read the contract, `results.json`, the as-built, all five registered evidence files plus `evidence/live-checks.md`'s citations, every file under `packages/auth/`, the app's `proxy.ts`, `env.ts`, `next.config.ts`, `lib/supabase/*` and `app/auth/**`, `boundaries.js`, `tooling/check-client-bundle.ts`, `toolkit.json`, `turbo.json`, `.env.example`, both runbooks and the two docs rows, then the cited surface (`technical.md`, D-STK-7 and D-STK-16). I built the checklist from the contract before opening the implementation. Where the as-built makes a claim, I traced it to the code rather than accepting it.

One freshness check worth stating up front, because it decides how much the logs are worth: the auth package's own TAP stream in `C1.log:754-762` reports `1..30`, 30 passed, 0 skipped, and the package on disk holds exactly 30 tests (context 8, session 6, config 3, client-safe 9, admin 1, redirect 3), with every subtest name in the log matching a test name in the files. The recorded evidence therefore describes the code I read, not an earlier shape of it.

## Criteria

**C1 — met.** `packages/auth/src/context.ts:98-119` calls `client.auth.getUser()` and nothing else; `result.error || !user` returns null (`:106`), a thrown call returns null (`:101-104`), and `roleOf` (`:65-70`) reads only `app_metadata.role` filtered through `APP_ROLES`. A repo-wide grep finds `getSession()` in product code nowhere — only in two comments and `context.test.ts:99`, where the stub reader throws if the seam ever reaches for it (`context.test.ts:41-43`). The strongest evidence is `context.test.ts:87-108`: a real `@supabase/ssr` client over a forged cookie that `getSession()` reports as an admin, with `/auth/v1/user` stubbed at 401, and the seam answers `null` — then `:110-132` proves the role follows the server's answer, not the cookie. Passing in `C1.log:590-601`.

**C2 — met.** `cookies.ts:40-67` matches `sb-<ref>-auth-token` with chunk and verifier suffixes and deletes every ref that is not `projectRef(config.url)`; `session.ts:63-75` purges first and then filters the purged names out of the client's `getAll`, so the SDK cannot read a cookie that is on its way out. Six tests cover both switch directions, the project's own cookies surviving, an unrelated `sb-session-notes` surviving, every cookie form, and the no-project clear (`C1.log:681-723`). `config.test.ts:35-42` pins the one fact the purge rests on by reading `storageKey` off a client the installed SDK built — the right place for that assertion.

**C3 — met, with a thin log.** `boundaries.js:58` adds the `auth` element, `:76` gives it `config, db, observability` only, `:86` pins `@supabase/*` to `auth`, and `ownerOverrides()` (`:120-132`) is what lets the package import what it owns. `C3.log` is a bare header: exit 0 and no output, so by itself it proves only the exit code. The substance is the six probes inside the `yarn verify` run (`C4.log:69-92`, `117-128`): `@supabase/*` refused in `db` and in `apps/web`, `@pem/auth` refused in `db` and `email`, allowed in `auth` and in the app.

**C4 — met, and verified by construction rather than by the builder's word.** `check-client-bundle.ts:78-93` derives the planted names from `.env.example` ∪ `turbo.json`, minus `NEXT_PUBLIC_*` and the three enum names, and `refuseDrift` (`:95-100`) fails if turbo lists one the example lacks. `SUPABASE_SERVICE_ROLE_KEY` and its two forms are in both (`.env.example:70-72`, `turbo.json:27-29`), so they are seeded by the rule, not a hand-kept list; the 18 values the log reports (`C4.log:1340`) is exactly the count those two files yield, which is a second check that nothing was quietly dropped. `yarn verify` exit 0, no sentinel in 27 browser-facing files. The adjacent hole the criterion does not cover — a secret pasted into the `NEXT_PUBLIC_` slot, which no bundle scan can catch — is closed upstream by `publicKeyProblem` (`config.ts:46-52`) applied in the client schema at `env.ts:113-122`, which runs before `nextConfigEnv` (`:148`) can collapse a value into `next.config.ts:42`. Tested at `config.test.ts:18-33`.

**C5 — correctly deferred, and not claimed as verified.** `--verdict deferred` with `deferred: true` is the sanctioned mechanism for a check only a person can run; the reason matches the contract; `C5-operator.md:12-24` gives executable steps with the expected observations, including the rate-limit setting. It is listed under "Not verified" with two other honest gaps.

**Non-negotiables — all six hold.** Four factories (`server.ts`, `browser.ts`, `admin.ts`, `session.ts`), with the admin client's three session flags asserted on the built client (`admin.ts:20-24`, `admin.test.ts:14-17`). Authorization reads `getUser` only, above. One seam, wrapped in React `cache` with the resolver at module scope (`lib/supabase/context.ts:21-29`), mirroring once per id-plus-email with concurrent callers sharing one call (`context.ts:80-96`, tests at `context.test.ts:134-174`). Refresh only in `apps/web/proxy.ts:42`; nothing else imports `@pem/auth/session`. The browser client takes inlined literals (`env.ts:26-58` reads each `NEXT_PUBLIC_*` as a literal member expression; `:136-142` returns the inlined value in the browser), and `packages/auth` cannot read `process.env` at all — the lint forbids it (`eslint.config.mjs:9-17`) and no file does. Client-safe subpaths are walked for server imports with the walker itself proven to detect one (`client-safe.test.ts:60-81`), and all four server subpaths open with `import "server-only"`, asserted at `:83-86` under `--conditions=react-server` (`package.json:39`).

**As-built claims I checked and found true:** `remove-supabase-auth.md` lists every file, variable, dependency and boundaries entry I could find, and remembers to rotate the key (`:70`); `remove-supabase-database.md` carries the "When auth stays" inlining; `tech-stack.md:42-43` carries both rows and is honest that `apps/docs` floats `server-only`, which is also why `toolkit.json:259` leaves it out of the `auth` dependencies — `apps/docs/lib/docs.ts:1` does import it, so that reasoning stands; `codebase-conventions.md:90` carries the row. The redirect rules are closed at both layers with the bypasses tested (`redirect.ts:15-33`, `redirect.test.ts:18-32`); the callback never reads Host, treats an unconfigured tier as "not set up" rather than "expired" (`route.ts:48-52`), and sends no-store headers on every redirect (`:27-36`); the sign-in action keeps the address out of the URL and the log (`actions.ts:44`) and answers `?state=sent` whether or not the address exists.

## Findings

**Should-fix — `results.json:98-111`: the ticket's ledger says warden FAILed while warden's own recorded file says PASS, and the hash that binds them no longer matches.** The record is from the 21:26:43 run at head `9e13361` with `evidence_sha256: 431ae330…`; `review-warden.md:7-11` on disk is the later 21:39:32 PASS at head `d0a1b7b`, written against a different as-built. A tier-2 one-way door would reach Taylor with its ledger and its evidence disagreeing on a reviewer. `results.json` is machine-written and must not be hand-fixed: re-run `yarn review:run warden STK-12`. (`check-specs` already warns, `C4.log:25`, so the close gate holds — but the warning says "last run exited 0", which reads as a tooling hiccup rather than "the file says PASS".) Owner: whoever closes the batch.

**Consider — `apps/web/proxy.ts:42`: an unguarded refresh fails every route rather than serving the request signed out.** The matcher covers every page and route (`:48-50`), and the proxy authorizes nothing, so failing closed buys no safety and costs the whole site — including `/auth/sign-in`, the one page that could explain the problem. I cannot name a live trigger today (`getUser` returns network errors in `error` rather than throwing, and `projectRef`'s `new URL` is protected by `env.ts:111`'s `z.url()`), which is why this is not ranked higher. Open from warden's pass too (`review-warden.md:66`). A try/catch that logs and returns the pass-through response is strictly better.

**Consider — `apps/web/lib/supabase/server.ts:20-27`: the cookie-write catch is silent in the one path where the write *is* the session.** The as-built declines a log here on the grounds that a Server Component's catch fires on every render and a Route Handler's never fires. The second half is a likelihood, not a guarantee: the same client serves `app/auth/callback/route.ts:62-67`, where `exchangeCodeForSession` writes the session cookies. If a write there ever fails, the route still redirects to `/` (`route.ts:70-72`) and the user lands signed out, with no cookie, no message and nothing in the log — the kind of loop a support ticket cannot resolve. Scoping the catch to the render path, or logging once at warn outside it, keeps the quiet render behaviour and makes the other case diagnosable.

**Consider — `packages/auth/src/context.ts:89-91`: the mirror's failure log hands the raw error to the logger, which redacts by field name only.** `local-mirror.ts:57` re-throws every non-unique-violation error, and a Postgres error's `detail` routinely quotes the offending value — here, an email address. `redactFields` keys on names, so a message string passes through, against the logger's own contract that a person is identified by `userId` only (`logger.ts:11-12`). The path is local-dev only (`local-mirror.ts:37-39`), which is the whole reason this is a Consider; logging `error.code` and a message, as the sibling branch already does (`local-mirror.ts:59-64`), would close it.

**Consider — `packages/auth/src/cookies.ts:52-67`: the purge is scoped to the host, and localhost cookies ignore the port.** The rule is "any Supabase session cookie whose ref is not ours", and the documentation frames it as a tier switch (`session.ts:8-11`). A developer running a second local app on another port against a different Supabase project will be signed out of that app on every request this one serves, with no clue why. No security impact — it deletes a foreign session rather than exposing one — but this package is going to be copied into products, and the behaviour deserves a line in the runbook or in `session.ts`'s header where the tier switch is explained.

**Consider — `as-built.md:46` explains a discrepancy the recorded evidence no longer shows.** It says C1 and C2 "can record test totals one apart"; both logs now report `tests: 114` (`C1.log:5`, `C2.log:5`). An as-built is immutable after merge, and this is the one line in it whose numbers a later reader will check against the files and find nothing to explain.

**Consider — `contract.md:62-64`: `yarn verify` is used as a criterion command.** `.claude/rules/specs.md` says `yarn verify` is never a criterion because it runs once at batch close. The criterion was honoured and the evidence is real; the note is for how the epic's remaining contracts are written, not for this one — the service-role seeding it asserts would sit just as well on `check-client-bundle` with `yarn verify` left to the close.

## What remains for runtime, and what I could not verify

1. **C5, the operator's:** a real staging sign-in started on localhost returning to localhost, the `sb-<staging ref>` cookie on localhost, and the local `public.users` row. Steps are in `C5-operator.md`; step 1 (the staging redirect-URL list and the email rate limit) is a prerequisite no code can supply.
2. **Session refresh against a genuinely expiring token.** No test reaches a live Auth server; the purge and the refresh are proven separately against a stubbed fetch.
3. **The browser and admin clients have no consumer**, so their inlining and server-only paths are proven by reading and by the sentinel build's absence of a leak, not by a client chunk that actually imports `env.ts`. Stated honestly in the as-built.
4. **Proof freshness at the current head.** C1–C4 were recorded at `53a8da10`, C5 at `76c5899`, and assay, mason and threshold wrote reviews at `b54069c` whose records `results.json` does not yet hold (`run: null`). I have no git access, so I cannot confirm nothing in the planned paths moved since; the content match I described above is as far as file reading goes. `yarn check-specs` is the mechanism, and the `C4.log` warnings show it working.
5. **Not mine to re-file, but on the record for the merge:** the field's 1.26:1 border against the page (threshold F1) is a logged, deliberate deviation with STK-25 drafted; it is below WCAG 1.4.11's 3:1 for a control boundary today, and that is an accepted risk someone should accept with eyes open rather than inherit.

Three of five reviewer records are unwritten and warden's is stale, so the ticket cannot close on my pass alone — which is as it should be for a one-way door.

VERDICT: PASS
