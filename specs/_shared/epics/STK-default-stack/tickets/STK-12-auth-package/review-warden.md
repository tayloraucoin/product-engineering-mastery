# Review — warden on STK-12

> Written by `yarn review:run warden STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: 458e25d4e332622daa4eac7e327e9e39758037fa
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:01:41Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C1.log (sha256 bd185ff046fc)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C2.log (sha256 1dabe5d64363)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C3.log (sha256 53615ab69c28)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C4.log (sha256 2802c2f9c9fc)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C5-operator.md (sha256 f5ff425ccc9e)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/auth/callback/route.ts, apps/web/app/auth/sign-in/_components/email-field.tsx, apps/web/app/auth/sign-in/_components/send-link-button.tsx, apps/web/app/auth/sign-in/actions.ts, apps/web/app/auth/sign-in/page.tsx, apps/web/env.ts, apps/web/lib/supabase/admin.ts, apps/web/lib/supabase/client.ts, apps/web/lib/supabase/config.ts, apps/web/lib/supabase/context.ts, apps/web/lib/supabase/local-mirror.ts, apps/web/lib/supabase/server.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, packages/auth/eslint.config.mjs, packages/auth/package.json, packages/auth/src/admin.test.ts, packages/auth/src/admin.ts, packages/auth/src/browser.ts, packages/auth/src/client-safe.test.ts, packages/auth/src/config.test.ts, packages/auth/src/config.ts, packages/auth/src/context.test.ts, packages/auth/src/context.ts, packages/auth/src/cookies.ts, packages/auth/src/redirect.test.ts, packages/auth/src/redirect.ts, packages/auth/src/server.ts, packages/auth/src/session.test.ts, packages/auth/src/session.ts, packages/auth/src/test-helpers.ts, packages/auth/tsconfig.json, packages/config/eslint/boundaries.js, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — the request seam returns user and role from `getUser`, and refuses a session whose user cannot be fetched. Met.**
`C1.log` is a real `yarn test` at head `89bff074`, exit 0, 114 tests, `# fail 0`, `# skipped 0`. The named subtests are present and passing (ok 14–21), including the one that matters most: `packages/auth/src/context.test.ts:87` builds a real `@supabase/ssr` server client over a forged cookie that claims `app_metadata.role: "admin"`, asserts `getSession()` returns that admin, then asserts the seam returns `null` when the stubbed Auth server answers `/auth/v1/user` with 401 — and asserts the call to `/auth/v1/user` actually happened. `context.ts:98-119` calls only `getUser`; the test reader throws if `getSession` is touched (`context.test.ts:41`). `roleOf` (`context.ts:65`) reads `app_metadata.role` against `APP_ROLES` and nothing else, with `context.test.ts:64` proving a `user_metadata.role: "admin"` is ignored. That closes the one escalation path a user can reach themselves, since `user_metadata` is the user's own to write.

**C2 — `updateSession` purges cookies for a different project ref. Met.**
`C2.log` is a separate `yarn test` at the same head, exit 0, `# fail 0`, `# skipped 0`, with the six purge subtests present (ok 25–30). `session.ts:63-74` purges first, then filters the purged names out of the `getAll` the SDK reads, so a foreign cookie is never parsed. `cookies.ts:40` matches the stem plus `$`, `.` or `-`, covering chunks and all three verifier forms (`session.test.ts:85`). `config.test.ts:35` reads the storage key off a client built by the installed SDK and asserts it equals `authCookieStem(url)` for both fixtures — so an SDK rename fails the suite instead of stranding users. The no-project switch is covered by `clearSessionCookies` (`session.ts:44`), called from `proxy.ts:41`. `evidence/live-checks.md:9-12` shows the purge working through the real proxy: three `sb-127-*` cookies gone after one reload, the project's own and `pem-probe` kept.

**C3 — boundaries pass with `@supabase/*` owned by auth. Met.**
`C3.log` exit 0. `boundaries.js:92` adds `"@supabase/*": "auth"` to `SDK_OWNERS` and `:81` gives `auth` exactly `config`, `db`, `observability`. The base config applies `restrictedImports(null)` to all of `packages/**` and `apps/**`, so the SDK is banned everywhere but the owner override. Six probes in `tooling/boundaries.test.ts` (lines 41, 46, 51, 56 refusing; 102, 104 allowing) match the as-built's claim, and they appear passing in the C4 run (ok 4–7, 14–15). I checked for a quiet exemption: `packages/db` imports no `@supabase/*` at all — the seeding scripts reference only the variable names.

**C4 — the full chain passes with the service-role key among the seeded server-only variables, and no sentinel in a client chunk. Met.**
`C4.log` exit 0, ending `check-client-bundle — 18 server-only value(s), none in 27 browser-facing file(s)`, with both app builds green. `SUPABASE_SERVICE_ROLE_KEY` and its two tiered forms are read in `env.ts:54-57` and declared server-only at `:106`, so the seeder picks them up from `.env.example`/`turbo.json`. The gap the bundle check structurally cannot see — a secret handed a `NEXT_PUBLIC_` name — is closed at the env seam: `publicKeyProblem` (`config.ts:46`) rejects `sb_secret_` and a `service_role` JWT, wired into the client schema at `env.ts:113-122`, tested at `config.test.ts:18`, and `evidence/live-checks.md:42` records a build with `sb_secret_synthetic` exiting 1 and naming the variable. That is my earlier Blocking finding, properly closed, and at the right layer.

The warnings inside `C4.log` (lines 26-28) are the pre-run state of this ticket's own records, not live failures; `review:vigil` was re-recorded afterwards and the staleness that invalidated my last pass (`tech-stack.md`, `toolkit.json`, `yarn.lock`) is resolved — the dependency rows are at `tech-stack.md:46-47` and the `auth` manifest entry at `toolkit.json:263`.

**C5 — a staging sign-in on localhost redirects back to localhost. Not verified, correctly deferred.**
Recorded `deferred: true` with operator steps; it needs the hosted project and an inbox, which is a legitimate reason under the specs rule. What it rests on is proven elsewhere: `redirect.test.ts:18` refuses `//evil`, `/\evil`, a NUL and a tab, and `afterSignInUrl` re-checks `url.origin === origin` as a second gate (`redirect.ts:32`); the origin is always env.ts's site URL, never the request Host. `live-checks.md:24,52` show `next=%2F%2Fevil.example.test` not leaving localhost against a synthetic project.

**Non-negotiables.** All six hold. Four factories exist, with `admin.test.ts:8` reading `persistSession`, `autoRefreshToken` and `detectSessionInUrl` off the built client as `false`. `updateSession` is called from `proxy.ts:42` and nowhere else. The browser path reads inlined literals (`env.ts:136-142`, `next.config.ts:42`) through `nextPublicEnv`, which refuses a non-public name. `client-safe.test.ts` walks every import from `./config`, `./browser` and `./redirect`, and proves the walk can see a server import when there is one (`:76`) — so the passing assertions mean something.

Two further checks of my own: `getSession()` appears nowhere in `apps/web`, and `process.env` is read only in `env.ts`.

## Findings

No Blocking. No Should-fix.

**Consider** — `apps/web/app/auth/sign-in/actions.ts:33`: `signInWithOtp` leaves `shouldCreateUser` at its default `true`, so the page titled "Sign in" is also an open sign-up — a stranger creates an `auth.users` row for any address typed or scripted into the form. The recorded acceptance ("sends a link to any address", capped by the project email rate limit) covers the mail volume, not the rows retained. This is a decision, not a defect: either sign-up is open, in which case say so in the page copy and name it in the epic, or set `shouldCreateUser: false` and give invites their own path.

**Consider** — `apps/web/app/auth/callback/route.ts:63`: the `token_hash` branch calls `verifyOtp`, which carries no PKCE verifier, so such a link signs in whatever browser opens it — a forwarded or intercepted link works anywhere, and an attacker-obtained link can sign a victim in as the attacker. The default `code` flow is immune because the verifier cookie stays in the originating browser. The `sent` copy at `page.tsx:59` promises "It works once, in this browser", which is true for the default flow only. Worth a line in the runbook, or dropping the branch until a project actually uses a custom `{{ .TokenHash }}` template.

**Consider** — `packages/auth/src/config.ts:30`: `projectRef` takes the first hostname label, so two projects reached through custom auth domains (`auth.a.test`, `auth.b.test`) share the ref `auth`, and the purge reads the other's cookies as its own. The stale cookie is inert — `getUser` refuses it — so the cost is exactly the header growth the purge exists to prevent. Named so a product on a custom auth domain knows before it switches tiers.

**Consider** — `docs/runbooks/remove-supabase-auth.md:70` covers rotating the service-role key but nothing covers user data: no path deletes a user or their rows, and nothing states how long an `auth.users` row created by a typo'd address is kept. Sign-out is drafted as STK-24; deletion and retention have no ticket in the epic. Worth one line on the record now, while there are no users to delete.

The deviations in the as-built check out against the code, including the ones that cut against the builder: the mirror key really is id-plus-email (`context.ts:81`), the proxy really does call `getUser` rather than `getClaims`, and `email-field.tsx` really is a native input with no `@pem/ui` equivalent yet. The declined review items are declined with reasons I accept — the swallowed cookie-write catch at `lib/supabase/server.ts:24` costs nothing, because the proxy refreshes on the next request anyway.

VERDICT: PASS
