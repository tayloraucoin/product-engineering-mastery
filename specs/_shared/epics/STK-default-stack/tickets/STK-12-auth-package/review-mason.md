# Review — mason on STK-12

> Written by `yarn review:run mason STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: 96ed56e82ecdff9e4aaae180831c8cd868f6d4da
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:42:39Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — STK-12 auth-package (mason)

Verified against the contract at `89bff074`, the head every automated proof names. Tier 2, and two one-way doors (`packages/auth/**`, `**/proxy.ts` auth topology; `boundaries.js` package graph) — so the code got a full read, not a sample.

### Criteria

**C1 — the request seam returns the user and role from getUser, and refuses a session whose user cannot be fetched. MET.**
`packages/auth/src/context.ts:98-119` calls `client.auth.getUser()` and nothing else; an error, a null user or a throw returns `null` before any context is built. Role comes from `app_metadata` through `roleOf` (`context.ts:65-70`); `user_metadata` is never read, and `context.test.ts:64-75` pins that. The decisive test is `context.test.ts:87-108`: it builds a real `@supabase/ssr` server client over a forged cookie, asserts at line 99-100 that `getSession()` *would* have authorized an admin, then shows the seam returning `null` when `/auth/v1/user` answers 401 and that the call to Auth actually happened. That proves the refusal through the SDK, not through a stub — the right shape for an auth criterion. `C1.log` exit 0, 114 tests, `# skipped 0`.

**C2 — updateSession purges cookies for a different project ref. MET.**
`session.ts:63-65` purges before refreshing; `cookies.ts:40` matches the stem, chunk and all three verifier forms. Six tests (`C1.log:648-679`) cover staging-on-local, local-on-staging, own cookies kept, an unrelated `sb-` cookie kept, no-foreign-no-write, and the no-project clear. `config.test.ts:35-42` is the part I'd have asked for: it reads the storage key off a client built by the installed SDK and asserts it equals `authCookieStem(url)`, so an SDK rename fails the suite instead of silently ending the purge.

**C3 — boundaries pass with `@supabase/*` owned by auth. MET.**
`boundaries.js:62` (element), `:82` (`auth: ["config","db","observability"]`), `:92` (`"@supabase/*": "auth"`). Six probes in `tooling/boundaries.test.ts:38-57,101-104`, all green in `C4.log:92-115,152-159`. The `auth → db` edge is inside the D-STK-1 graph, not a new door. `C3.log` exit 0.

**C4 — the full chain passes with the service-role key among the seeded server-only variables, no sentinel in a client chunk. MET.**
`.env.example:70-72` and `turbo.json:27-29` declare all three forms; `check-client-bundle.ts:74-93` plants every non-`NEXT_PUBLIC_` name from both registries. `C4.log:1571` reports 18 planted values and no leak across 27 browser-facing files — 18 is exactly the plantable set, which includes `SUPABASE_SERVICE_ROLE_KEY` and its suffixed forms. `yarn verify` exit 0. Caveat worth stating plainly: the sentinel build configures no project and nothing imports the admin client, so the check proves the key is seeded and absent, not that a reading code path keeps it server-side. Its one reader (`apps/web/lib/supabase/admin.ts:16`) sits behind `import "server-only"`.

**C5 — a staging sign-in on localhost redirects back to localhost. NOT VERIFIED, correctly deferred.**
Recorded `deferred: true`, which is the sanctioned record for a manual criterion needing the hosted project (`.claude/rules/specs.md`). `C5-operator.md` gives reproducible steps and names the vendor prerequisite. The rules under it are unit-tested (`redirect.test.ts:18-32` closes `//host`, `/\host`, scheme and control-character escapes) and probed live.

**Non-negotiables:** all six hold. Four factories present; `admin.ts:20-24` sets `persistSession`/`autoRefreshToken`/`detectSessionInUrl` false, asserted in `admin.test.ts`. `updateSession` has exactly one caller, `apps/web/proxy.ts:42`. No `getSession()` anywhere outside tests and comments. `client-safe.test.ts:60-86` walks `./config`, `./browser`, `./redirect` to no server module and marks the four server subpaths `server-only`. The browser client reads inlined `NEXT_PUBLIC_*` literals via `env.ts:137-142`.

**As-built claims** check out against the code, including the awkward ones — the mirror keyed on id and email (`context.ts:81`), the auth→db edge with its removal path (`remove-supabase-database.md:40-46`), and the C1/C2 test-count artefact. Both removal runbooks are genuinely complete, down to the `PACKAGE_IMPORTS` row and the `client-safe.test.ts` assertion that goes with the import.

### Findings

**Should-fix — `apps/web/proxy.ts:24-38`: the one-way-door file carries the only untested logic in the topology.**
The adapter rebuilds the response on every `setAll` and relies on each call receiving every write so far (the invariant at line 31-33). `updateSession` is well covered; this adapter is not, and there is no test file anywhere under `apps/web`. Its failure mode is silent — the purge stops reaching the browser and nothing in `yarn test` notices. It is proven today only by a manual browser check (`evidence/live-checks.md:5-12`). A unit test over a synthetic `NextRequest` asserting that two successive batches both survive on the response closes it.

**Should-fix — `results.json:84-111`: two of five reviews are stale, and the as-built does not say so.**
`review:vigil` is recorded at `d0a1b7b2` and `review:warden` at `d1644426`, against proofs at `89bff074`. The C4 evidence records it itself (`C4.log:26-27` — 17 changed files for vigil). The Deviations section names the test-count artefact but not this. On a tier 2 ticket the reviews are the gate; both need re-running before merge, and the as-built should carry the line.

**Consider — `apps/web/lib/supabase/client.ts:12`: the guard is one-directional.**
The four server subpaths carry `server-only`; nothing stops a Server Component importing `./client` and building a `document.cookie` client on the server. Costs nothing today (no consumer). The first client component to use it is the moment for a `client-only` marker and its tech-stack row.

**Consider — `apps/web/app/auth/callback/route.ts:39`: `EMAIL_LINK_TYPES` omits `recovery` and `email_change`.**
Correct for this ticket — no password flow — but those links land on `?state=expired`, which will read as a bug the first time a product enables password reset. Worth a line in STK-24.

No Blocking findings. The placement is right, the seams are thin, authorization reads the verified user at the one seam, and the enforcement is mechanical rather than aspirational.

VERDICT: PASS
