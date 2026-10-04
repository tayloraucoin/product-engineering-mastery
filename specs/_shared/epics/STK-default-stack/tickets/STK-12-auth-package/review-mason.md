# Review — mason on STK-12

> Written by `yarn review:run mason STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 855981be4d2ad425fff17544d9036a119228db59e102d6af23b444dbbf0e4ce3
- head: 9e1336164ea21edac17a2bdeda7384b08723cdc7
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:26:43Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C1.log (sha256 0fe563b5bae1)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C2.log (sha256 09b8a0b8bd2e)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C3.log (sha256 0d14b91358c9)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C4.log (sha256 58b2fe37b3e7)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C5-operator.md (sha256 f5398d318881)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/auth/callback/route.ts, apps/web/app/auth/sign-in/_components/email-field.tsx, apps/web/app/auth/sign-in/_components/send-link-button.tsx, apps/web/app/auth/sign-in/actions.ts, apps/web/app/auth/sign-in/page.tsx, apps/web/env.ts, apps/web/lib/supabase/admin.ts, apps/web/lib/supabase/client.ts, apps/web/lib/supabase/config.ts, apps/web/lib/supabase/context.ts, apps/web/lib/supabase/local-mirror.ts, apps/web/lib/supabase/server.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, packages/auth/eslint.config.mjs, packages/auth/package.json, packages/auth/src/admin.test.ts, packages/auth/src/admin.ts, packages/auth/src/browser.ts, packages/auth/src/client-safe.test.ts, packages/auth/src/config.ts, packages/auth/src/context.test.ts, packages/auth/src/context.ts, packages/auth/src/cookies.ts, packages/auth/src/redirect.test.ts, packages/auth/src/redirect.ts, packages/auth/src/server.ts, packages/auth/src/session.test.ts, packages/auth/src/session.ts, packages/auth/src/test-helpers.ts, packages/auth/tsconfig.json, packages/config/eslint/boundaries.js, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — the request seam returns user and role from `getUser` and refuses a session whose user cannot be fetched. Met.**
`yarn test` exit 0, sha matches the recorded hash. The proof is real, not a stub-only assertion: `packages/auth/src/context.test.ts:87` builds an actual `@supabase/ssr` server client over a forged session cookie that claims `app_metadata.role: "admin"`, asserts `getSession()` returns that admin, stubs `/auth/v1/user` with 401, and asserts the seam returns `null` plus that the Auth endpoint was actually called. `context.test.ts:110` is the mirror-image case. The code matches: `packages/auth/src/context.ts:96-117` calls only `getUser()`, returns `null` on error, missing user or throw, and `roleOf` (`context.ts:63-68`) reads `app_metadata` with deny-by-default to `user`. No `getSession()` or `getClaims()` anywhere in product code (grep across `packages/auth` and `apps/web`).

**C2 — `updateSession` purges cookies for a different project ref. Met.**
`session.test.ts` covers both switch directions, the project's own cookies kept, an unrelated `sb-` cookie kept, nothing written when there is no foreign cookie, and every cookie form Supabase writes (chunks, `-code-verifier`, `-flows-`, `-flow-<id>-`). `session.ts:49-61` purges before refreshing and filters the purged names out of `getAll`, so the refresh cannot resurrect them; `session.ts:42-47` accumulates writes into one growing batch, which is what makes `proxy.ts:30`'s response rebuild safe.

**C3 — boundaries pass with `@supabase/*` owned by auth. Met.**
`boundaries.js:58` adds the `auth` element, `:75` the `auth: ["config","db","observability"]` row, `:86` `"@supabase/*": "auth"`. `tooling/boundaries.test.ts:38-58` adds the six probes; C4.log lines 72-95 and 120 show `@supabase/*` refused in `db` and in `apps/web`, `@pem/auth` refused in `db` and `email`, and allowed in `auth` and the app. `yarn lint:boundaries` exit 0.

**C4 — full chain passes, service-role key among the seeded server-only variables, no sentinel in a client chunk. Met.**
`yarn verify` exit 0. C4.log:1295 — "18 server-only value(s), none in 27 browser-facing file(s)". The seeding is derived, not hand-listed: `tooling/check-client-bundle.ts:78-93` reads `.env.example` and `turbo.json`, and `SUPABASE_SERVICE_ROLE_KEY` with its `_LOCAL`/`_STAGING` forms is in both (`.env.example:68-70`, `turbo.json:27-29`), so the claim holds structurally and would keep holding. The scan covers prerendered pages and RSC payloads, not just static chunks, which is what makes the sign-in route's inclusion meaningful.

**C5 — staging sign-in on localhost. Correctly deferred, not claimed.**
`deferred: true` with the contract's own stated reason (hosted staging project). `C5-operator.md` gives reproducible operator steps and is honest about what the agent did probe. The residual risk is covered by `redirect.test.ts`, which tests the real attack set (`//host`, `/\host`, scheme, NUL, tab) and asserts the origin never leaves the site URL.

The as-built's claims check out against the code in every place I verified: factories (`server.ts`, `browser.ts`, `admin.ts`, `session.ts`), `ADMIN_AUTH_OPTIONS` all false with a test reading them off the built client, refresh only in `proxy.ts`, `client-safe.test.ts` walking the three client-safe subpaths and pinning the subpath classification itself, `env.ts` as the sole `process.env` reader (plus `packages/auth/eslint.config.mjs:9` mechanically banning `process.env` inside the package), the `toolkit.json` `auth` entry, both runbooks, the conventions row at `codebase-conventions.md:90`, and the tech-stack rows with exact pins. `@pem/auth → @pem/db` runs with the graph (D-STK-1), and `@pem/db/rls` imports `./client.ts` type-only, so the seam does not drag the driver.

D-STK-7 as ratified is what shipped. I ratify the auth topology.

## Findings

**Should-fix — the cookie-name derivation is an unpinned SDK internal with a bad failure mode.** `packages/auth/src/config.ts:30-32` and `packages/auth/src/cookies.ts:40` both reimplement supabase-js's storage-key scheme (documented as read on 2026-10-04 at 2.117.2). If a future bump changes that scheme, the two sides diverge and `foreignSessionCookies` starts classifying the project's *own* live cookie as foreign — a sign-out loop on every request, in production, with every test still green because the tests assert the derivation against itself. Exact pins and the deps rule slow this down; they do not catch it. Add one test that reads the storage key off a client built by the installed SDK and asserts it equals `authCookieStem(url)`, so the bump fails the suite instead of the users.

**Should-fix — `@pem/auth`'s server subpaths are not poisoned against client import.** `server.ts:12`, `admin.ts:9`, `session.ts:16` and `context.ts:22` have no `import "server-only"`; only the app's wrappers do (`apps/web/lib/supabase/server.ts:8`, `admin.ts:8`, `context.ts:9`). `client-safe.test.ts` enforces the direction that matters least — client-safe subpaths staying clean — and nothing stops a `"use client"` leaf from importing `@pem/auth/admin` directly. The blast radius is bounded today (the service-role key is server-only and `check-client-bundle` would catch an inlined sentinel), so this is not a gap in C4. It is a missing rail: the package is the thing a second app will consume without the app-local wrappers. Four import lines, plus `server-only` moving into `packages/auth/package.json` and the `tech-stack.md:43` row widening past `apps/web`.

**Consider — the callback reports a configuration gap as an expired link.** `apps/web/app/auth/callback/route.ts:32-34` sets `state=expired` before the `!supabaseConfig` return, so an unconfigured tier tells the user their link expired. A distinct state (or reusing the page's "not set up" branch) would stop a misdiagnosis.

**Consider — two app-local seams have no consumer.** `apps/web/lib/supabase/client.ts:12` and `admin.ts:15` are unreferenced. Both are contract non-negotiables, so they belong here; but the browser client's inlining path is therefore proven by reading only — nothing imports it, so no bundle contains it, and `check-client-bundle`'s sentinel build runs with no `NEXT_PUBLIC_SUPABASE_*` set at all. The mechanism in `env.ts:126-132` plus `next.config.ts:42` is correct; it is just unexercised, and the as-built reads as though it were exercised.

Clean work on the parts that carry the risk: the forged-cookie test is the right test, and the purge-then-refresh ordering is the detail most implementations get wrong.

VERDICT: PASS
