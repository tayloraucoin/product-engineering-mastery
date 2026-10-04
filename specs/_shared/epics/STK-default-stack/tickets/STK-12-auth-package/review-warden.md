# Review — warden on STK-12

> Written by `yarn review:run warden STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: d1644426b27768437f2b048adfa8f79ef0aa4969
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:31:23Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C1.log (sha256 e87d4f04c6b6)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C2.log (sha256 55d177f3605a)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C3.log (sha256 7f83d616e670)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C4.log (sha256 fd680a776dde)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C5-operator.md (sha256 f5ff425ccc9e)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/auth/callback/route.ts, apps/web/app/auth/sign-in/_components/email-field.tsx, apps/web/app/auth/sign-in/_components/send-link-button.tsx, apps/web/app/auth/sign-in/actions.ts, apps/web/app/auth/sign-in/page.tsx, apps/web/env.ts, apps/web/lib/supabase/admin.ts, apps/web/lib/supabase/client.ts, apps/web/lib/supabase/config.ts, apps/web/lib/supabase/context.ts, apps/web/lib/supabase/local-mirror.ts, apps/web/lib/supabase/server.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, packages/auth/eslint.config.mjs, packages/auth/package.json, packages/auth/src/admin.test.ts, packages/auth/src/admin.ts, packages/auth/src/browser.ts, packages/auth/src/client-safe.test.ts, packages/auth/src/config.test.ts, packages/auth/src/config.ts, packages/auth/src/context.test.ts, packages/auth/src/context.ts, packages/auth/src/cookies.ts, packages/auth/src/redirect.test.ts, packages/auth/src/redirect.ts, packages/auth/src/server.ts, packages/auth/src/session.test.ts, packages/auth/src/session.ts, packages/auth/src/test-helpers.ts, packages/auth/tsconfig.json, packages/config/eslint/boundaries.js, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I have read the contract, `results.json`, the as-built, all five evidence files, every changed file under `packages/auth/` and `apps/web/`, the boundaries config, `turbo.json`, `.env.example`, the manifest, the removal runbook, the tech-stack row, and the installed `@supabase/auth-js` source. This is a re-review: the recorded warden PASS went stale when seven docs files changed. I checked my previously open items first, then re-walked the auth paths.

## Criteria

**C1 — met.** `packages/auth/src/context.ts:98-119` calls `getUser()` and nothing else; `result.error || !user` returns null (`:106`), a throw returns null (`:100-104`). `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES`, never `user_metadata`. A repo-wide grep finds `getSession()` in no product code — only in `context.test.ts` and two comments — and the test reader throws if the seam ever reaches for it (`context.test.ts:41-43`). The evidence is adversarial rather than a mock agreeing with itself: `context.test.ts:87-108` builds a real `@supabase/ssr` client over a cookie in the SDK's own format, asserts `getSession()` *would* hand back an admin (`:100`), stubs `/auth/v1/user` at 401, and the seam answers null while the call to `/auth/v1/user` is asserted to have happened; `:110-132` proves the role comes from the server's answer, not the cookie. C1.log:570-619, `# fail 0`, `# skipped 0`.

**C2 — met.** `cookies.ts:52-67` deletes every `sb-<ref>-auth-token*` whose ref differs from the configured project's; `session.ts:63-75` purges before the refresh and filters the purged names out of the client's `getAll`, so the SDK cannot resurrect them. Six tests cover both switch directions, the project's own cookies surviving, an unrelated `sb-session-notes` surviving, all five cookie forms, and the no-project switch (`session.test.ts:27-119`; C1.log:730-765). The fact the purge rests on is pinned to the installed SDK: C1.log:550-555 shows the storage key read off a built client equals `authCookieStem(url)`, so an SDK rename fails the suite instead of silently signing users out.

**C3 — met.** `boundaries.js:62` adds the `auth` element, `:81` gives it `config, db, observability` only, `:92` pins `@supabase/*` to `auth`, and `ownerOverrides()` (`:127-139`) lets only that element's own files import it. `apps/**` imports no `@supabase/*` anywhere (grep: no matches). C3.log is a bare header, so it proves exit 0 and nothing more; the substance is the six auth probes in `tooling/boundaries.test.ts:38-56, 102-104`, which run inside C4.log.

**C4 — met.** `yarn verify` exit 0 at the recorded head. The seeding is by construction, not a hand-kept list: `check-client-bundle.ts:78-93` derives planted names from `.env.example` and `turbo.json`, and `SUPABASE_SERVICE_ROLE_KEY` sits in all three forms in both (`.env.example:70-72`, `turbo.json:27-29`), with the drift check (`:95-100`) refusing a name in one and not the other. The bundle check's blind spot — a secret pasted into a `NEXT_PUBLIC_` name — is closed at the layer that cannot be bypassed: `publicKeyProblem` (`config.ts:46-52`) refuses an `sb_secret_` key or a service-role JWT, applied in the client schema (`env.ts:113-122`), which `createEnv` evaluates before `nextConfigEnv` (`:148`) can collapse the value into `next.config.ts:42`.

**C5 — correctly deferred; not met and not claimed.** `--verdict deferred` is the sanctioned mechanism, the reason matches the contract, and `C5-operator.md` gives executable steps. It was re-recorded at 23:31 (head `c19369c`), after the C4 run that flagged it stale, so its record now holds. I re-read the callback and sign-in code against the steps: they still describe current behaviour.

**Non-negotiables — all six hold.** Admin client session-free, asserted on the built client's own options (`admin.ts:20-24`). Refresh only in `apps/web/proxy.ts:42`, whose return value is discarded, so the proxy authorizes nothing. Browser client over inlined literals (`client.ts:8-14`, `env.ts:136-142`). Client-safe subpaths walked for server imports with the walker itself proven to detect one, and all four server subpaths asserted to carry `import "server-only"` under `--conditions=react-server` (`client-safe.test.ts:60-86`, `package.json:39`). Open redirect shut at both the path and origin layers (`redirect.ts:15-33`); the request's Host is never read.

The C1/C2 test-count discrepancy (113 vs 114 at one head) is disclosed in the as-built and both logs show `# fail 0`, `# skipped 0`. Spot-checked as-built claims that held: `toolkit.json:259-274`, `remove-supabase-auth.md:70`, `tech-stack.md:42-43`, `turbo.json:21-29`.

## Findings

**Should-fix — `apps/web/app/auth/callback/route.ts:63-67`: the `token_hash` branch accepts a sign-in credential with nothing binding it to the browser that requested it, so one cross-site GET signs a victim's browser in as the attacker.** The `code` branch is safe: `exchangeCodeForSession` needs the PKCE verifier cookie, which only the requesting browser holds. `verifyOtp` has no such binding — `GoTrueClient.js:2053-2071` POSTs `{token_hash, type}` to `/verify` and, on success, calls `_saveSession`, which writes session cookies through the server client's store. The path: an attacker requests a magic link for their own address, reads the hash out of their own inbox (Supabase's default `ConfirmationURL` carries it as `token=`, the same value this route accepts as `token_hash`), then gets the victim to issue one GET — an `<img src>` on any page suffices, since SameSite governs sending, not setting. The victim's next top-level visit is authenticated as the attacker, and everything the victim then types lands in the attacker's account. The actor is any attacker who can get a page loaded; no victim credential and no interaction beyond that are needed. I am not calling it Blocking: nothing authenticated sits behind this callback in this repo yet, and the shape is Supabase's own published pattern for custom templates. But this is a starter whose job is to be copied, and the product that copies it inherits the defect. Either drop the branch until a custom email template needs it (nothing here configures one — `EMAIL_LINK_TYPES` at `:39` serves a template that does not exist), or bind it with a state value issued at send time and checked here. **The severity rises to Blocking the moment an authenticated surface exists behind the callback** — that is STK-13, which the as-built names as next.

**Should-fix — `apps/web/app/auth/sign-in/actions.ts:33`: `signInWithOtp` is still called with no `shouldCreateUser`, so a dashboard setting silently decides both the registration policy and whether this form is a user-existence oracle.** Raised last round; the as-built's "Not done from the reviews" (`:40-45`) neither takes it nor declines it, and its deviation at `:39` credits the earlier rate-limit finding instead. The SDK sends `create_user: shouldCreateUser ?? true`, so on the Supabase default every address submitted becomes an account on confirmation, under copy that promises only a sign-in link (`page.tsx:69`). Turn signups off and the opposite failure appears: an unknown address errors into `?state=error` (`:43-46`) while a known one gets `?state=sent` (`:47`), so which page renders answers "does this person have an account here?" for anyone who can type an address. The adversary is the one who already knows the victim. Pass `shouldCreateUser` explicitly, and if it is false, collapse the unknown-user error onto `?state=sent` so both answers look alike.

**Consider — `packages/auth/src/config.ts:46-52` and `docs/engineering/tech-stack.md:42`: the secret-key guard still carries no re-verify trigger.** Raised in two prior rounds, still neither taken nor declined. The guard knows two key shapes, dated in a comment; a third Supabase secret format passes it and the key is published, with nothing failing. The row says "verified 2026-10-04" without naming key-format prefixes as the thing to re-check on a bump.

**Consider — `apps/web/proxy.ts:42`: `updateSession` is still unwrapped.** The matcher covers every page and route (`:48-50`) and the proxy authorizes nothing, so a throw during refresh costs the whole site and buys no security. I cannot name a live trigger today, but a catch that logs and returns the pass-through response is strictly better.

**Consider — `results.json:68-82` records `review:assay`, `review:mason` and `review:threshold` as `FAIL` with `run: null`, while all three files sit on disk with `verdict: PASS` at head `b54069c`.** This is the binding gap I flagged last round for warden and vigil, now on the other three: a merge-reader following `results.json` sees three unproven reviews, a reader opening the folder sees three passes. It fails in the safe direction — the gate is `results.json` and it says not-proven — but Taylor reads this pair before merge, and `review-<role>.md` says it is hash-bound to a record that does not exist.

No Blocking finding. C1 through C4 are met on evidence I could re-derive from the code, C5 is honestly deferred, and all six non-negotiables hold at the layers the contract asked for.

VERDICT: PASS
