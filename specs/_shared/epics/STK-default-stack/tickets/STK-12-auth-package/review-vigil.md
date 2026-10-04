# Review — vigil on STK-12

> Written by `yarn review:run vigil STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 159e25dc3a425dee3d2161566a419ac46a8b1cceff4594f39e4f0bdd7d16974a
- head: d0a1b7b2a508207c286584634b73d427484c1209
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:39:32Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Vigil review — STK-12 `auth-package`

**Verdict: Pass with conditions.** No Blocking findings. Four code criteria are met in both evidence and code; C5 is honestly deferred to the operator; two Should-fix items and six Consider items follow. The ticket still cannot close on my review alone — see "For the operator" at the end.

Plan was built from `contract.md` + `technical.md` (D-STK-7, D-STK-16) before the implementation was read. `truth_files: none` and D-STK-15 waive the UX surface, so the oracle is the contract's criteria and non-negotiables plus `apps/web/AGENTS.md` for route states.

---

### Criterion by criterion

**C1 — the seam returns the user and role from `getUser` and refuses a session whose user cannot be fetched. Met.**
Evidence: `evidence/C1.log` exit 0 at head `b542e0e`, 113 tests, 0 skipped; the auth suite's `ok 14`–`ok 21` (C1.log:470–561) including `C1: a forged session cookie is refused when Supabase cannot fetch its user`. Code: `packages/auth/src/context.ts:101-106` calls `getUser()` only and returns `null` on an error, a missing user or a throw; `roleOf` (`context.ts:65-70`) reads `app_metadata.role` against `APP_ROLES` and never `user_metadata`. The test is not vacuous: `context.test.ts:87-108` builds a real `@supabase/ssr` client over a forged cookie, asserts `getSession()` *would* have authorized an admin, then asserts the seam returns `null` and that `/auth/v1/user` was actually called; `context.test.ts:41-43` makes any `getSession()` read a test failure. Mirror behaviour (once per user per process, retry after refusal/failure, one call under concurrency, never for an anonymous request) is covered at `ok 19`–`ok 21`. **Verified in code and test.**

**C2 — `updateSession` purges cookies for a different project ref. Met.**
Evidence: `evidence/C2.log` exit 0, same head, `ok 25`–`ok 29`. Code: `session.ts:51-53` purges before refreshing, and the purge is excluded from the client's `getAll` (`session.ts:58-60`) so a deleted cookie is not re-read; `cookies.ts:40` matches the plain, chunked (`.N`) and all three verifier forms; writes batch cumulatively (`session.ts:43-49`), which is what makes `proxy.ts:30`'s response rebuild safe. The strongest piece is `config.test.ts:35-42`: the stem the purge uses is asserted equal to the installed SDK's own `storageKey`, so an SDK rename fails the suite instead of silently stranding cookies. **Verified in code and test.**

**C3 — boundaries pass with `@supabase/*` owned by auth. Met, with a note on the evidence.**
`evidence/C3.log` is a header only, exit 0 — correct for a silent check, but it proves "boundaries pass", not "owned by auth". The ownership half is verified elsewhere: `packages/config/eslint/boundaries.js:86` (`"@supabase/*": "auth"`) with the per-owner override at `:119-132`, and six probes at `tooling/boundaries.test.ts:38-58` / `:90-93` — `@supabase/*` refused in `db` and in `apps/web`, `@pem/auth` refused in `db` and `email`, both allowed in `auth` and in the app. Those probes ran green in `C4.log:73-96` and `:121-128`. **Verified in code and test, across two evidence files.**

**C4 — the full chain passes with the service-role key among the seeded server-only variables, and no sentinel in a client chunk. Met.**
`evidence/C4.log` exit 0; `check-client-bundle — 18 server-only value(s), none in 27 browser-facing file(s)` (C4.log:1338). The seed plan is derived from `.env.example` and `turbo.json` (`tooling/check-client-bundle.ts:77-98`), and both list `SUPABASE_SERVICE_ROLE_KEY` with its `_LOCAL` and `_STAGING` forms (`.env.example:70-72`, `turbo.json:27-29`); `apps/web/env.ts:54-57,130-134` reads them, so the sentinel has a real reader. The bundle check cannot see a secret in a `NEXT_PUBLIC_` name, and that hole is closed separately at `config.ts:46-52` and `env.ts:113-122`, tested at `config.test.ts:18-33` (`ok 11`, `ok 12`) and exercised live (`live-checks.md:40-45`). **Verified in code and check.**

**C5 — a staging sign-in on localhost redirects back to localhost. Not verified; deferred, correctly.**
Recorded with `--verdict deferred` and `deferred: true` (`results.json:55-67`); the contract's own reason ("needs the hosted staging project") matches, so under `.claude/rules/specs.md` it stops holding the ticket. `evidence/C5-operator.md` gives runnable steps, the redirect-URL prerequisite and the rate-limit check. What it rests on is unit-tested (`redirect.test.ts`, `ok 22`–`ok 24`) and probed against a synthetic project (`live-checks.md:19-25`). **Cannot verify here — flagged, in the operator list below.**

**Non-negotiables.** All six verified in code: four factories plus `ADMIN_AUTH_OPTIONS` with `persistSession`/`autoRefreshToken`/`detectSessionInUrl` false (`admin.ts:20-24`, asserted off the built client at `admin.test.ts:15-17`); authorization reads `getUser` only, and nothing anywhere reads `SessionUpdate.userId`; one request seam, wrapped in React `cache` (`lib/supabase/context.ts:26`); `updateSession` imported in exactly one place repo-wide (`proxy.ts:14`); the browser path reads literal `process.env.NEXT_PUBLIC_*` (`env.ts:136-142`) inlined by `next.config.ts:42`; client-safe subpaths walked for server imports and server subpaths asserted to carry `import "server-only"` (`client-safe.test.ts:60-86`).

---

### Findings

**Should-fix — the as-built misstates the test counts it is explaining.** `as-built.md:40` says "C1 and C2 report 106 and 105 tests"; `results.json:15,28` and both log headers (`C1.log:5`, `C2.log:5`) say 113 and 112. The explanation (a line lost to interleaved cache replay; both logs show `# skipped 0`) still holds for 113 vs 112, so nothing is hidden — but the as-built is immutable once merged and is the record a future reader diffs against `results.json`. Owner: builder, before merge.

**Should-fix — the tier-switch purge does not run on the one switch that leads to an unconfigured tier.** `apps/web/proxy.ts:20` returns before `updateSession` when `supabaseConfig` is null, so switching `DATABASE_ENVIRONMENT` from a configured tier to one with no project leaves the old project's chunked `sb-<ref>-auth-token.N` cookies on localhost with nothing to purge them — the exact accumulation `session.ts:6-11` exists to prevent, ending in a request-header limit rather than a wrong answer. The non-negotiable ("cookies of another project ref are purged on tier switch") is met wherever a project is configured; this is the gap at its edge. Developer-facing only. Owner: builder.

**Consider — `proxy.ts` has no guard of its own.** `proxy.ts:22` awaits `updateSession` unprotected. Network failure returns an `AuthRetryableFetchError` in `error` rather than throwing, so the trigger is narrow, but any throw that does escape 500s every matched route — including `/auth/sign-in`, the one page that could explain the problem. The seam itself is defensive (`context.ts:100-104`); the proxy is not.

**Consider — three documented `?state=` values render the default form.** `page.tsx:18` accepts `loading|sent|invalid|error|expired`; `empty`, `partial` and `offline` from `apps/web/AGENTS.md` fall through to the form. The deviation is logged (`as-built.md:33`) and the reasoning is sound for a form with no data, but `offline` is arguable for a surface whose only action is a network call. With no capture harness until P-C, the five real states were read once in one theme at one width (`live-checks.md:29-38`); dark, 390/1440 and reduced motion are unverified for this route and will be the critic's problem later.

**Consider — "all six were checked" does not match the list.** `as-built.md:22` says all six states were checked in the browser; `live-checks.md:31-36` lists default, `loading`, `sent`, `error`, `expired` and the unconfigured page — `invalid` is absent. It shares the render path with `error`/`expired` (`page.tsx:69-73`), so the risk is small; the claim is just wider than the evidence.

**Consider — an error costs the user their destination and their typed address.** `actions.ts:30` and `:45` redirect to `/auth/sign-in?state=invalid|error` without `next`, and `page.tsx:58`'s "Send another link" drops it too. A user who arrived at `?next=/records`, mistyped once, and recovered now lands on `/` after sign-in, having retyped their address from scratch. Carrying `next` through both redirects and pre-filling the field would fix both.

**Consider — a raw driver error reaches the log on the mirror path.** `context.ts:90` logs `{ error, userId }`; a Postgres error's `detail` can quote the row, and the mirrored row holds the user's email. `@pem/observability` redacts by key, not inside a caught error object. Local tier, non-deployed only (`local-mirror.ts:37-39`), which is why this is not higher.

**Consider — `yarn verify` as a criterion.** `contract.md:64` makes C4's command `yarn verify`, which `.claude/rules/specs.md` says is never a criterion because it runs once at batch close. The run is genuine evidence and I have counted it; the note is for the next contract author.

### Conversations

One, for whoever owns the sign-in surface: the page tells a user "It works once, in this browser" (`page.tsx:57`) — accurate and kind. But the only failure copy a user can ever reach says the link "has expired or was already used" (`page.tsx:25`), and the callback reaches it for every failure shape, including `type=recovery` and a code whose verifier cookie was lost in a different browser (`callback/route.ts:45-53`). Someone who clicked a fresh link in a mail app's in-app browser will read "expired" and believe the product is broken rather than that they switched browsers. Is a second message worth it — "this link needs the browser you asked from" — or is one honest dead end with a working "send another" the right trade for a starter? Genuinely a product call, not a defect.

### For the operator

1. **C5, in order of risk:** add `http://localhost:3000/auth/callback` to the staging project's redirect URLs, confirm the email rate limit, then run `evidence/C5-operator.md` steps 2–5 with STK-11's C4. This is the only end-to-end proof that a real magic link completes; everything upstream of it is unit-tested, nothing is runtime-proven.
2. **Then verify by hand:** a second click on the same link (should land on `?state=expired`, not a 500); a tier switch from staging to local with the local stack up, watching the `sb-<ref>` cookies clear; the sign-in page in dark theme at 390.
3. **Review state:** `review:warden` is recorded FAIL at an older head (`results.json:89-101`) and `review:assay`, `review:mason`, `review:threshold` have no run record. The as-built claims warden's Blocking finding is answered by `config.ts:46-52` and `env.ts:113-122`; I verified that code exists and is tested, but flipping warden's criterion is warden's call, not mine. The ticket closes when those re-run.
4. `C4.log:18-24` shows STK-11's proofs stale and three tickets closing — expected mid-batch, and a `--strict` matter before merge, not a defect in STK-12.

Assumptions, stated for the record: `[ASSUMPTION: the precedence ladder was not supplied with this run; I read it as enforced checks → contract and technical.md → apps/web/AGENTS.md → craft judgment.]` `[ASSUMPTION: Next 16 applies cookie mutations made through next/headers in a Route Handler to a manually returned NextResponse.redirect — the callback's session write rests on it, and only C5 can prove it.]`

VERDICT: PASS
