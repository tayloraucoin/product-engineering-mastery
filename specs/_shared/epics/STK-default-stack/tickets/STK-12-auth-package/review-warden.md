# Review — warden on STK-12

> Written by `yarn review:run warden STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 855981be4d2ad425fff17544d9036a119228db59e102d6af23b444dbbf0e4ce3
- head: 9e1336164ea21edac17a2bdeda7384b08723cdc7
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:26:43Z
- verdict: FAIL

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

I have read the contract, results, as-built, all five evidence files, and every changed file. Findings below.

## Criteria

**C1 — met.** `packages/auth/src/context.ts:96-117` calls `getUser()` and nothing else; `result.error || !user` returns null, and a throw is caught at :98-100. `roleOf` (:63-68) reads `app_metadata.role` against `APP_ROLES` only. The evidence is the strongest kind for this criterion: `context.test.ts:87-108` builds a real `@supabase/ssr` client over a forged session cookie, asserts `getSession()` *would* hand back an admin (:100), stubs `/auth/v1/user` at 401, and the seam returns null (C1.log:135). `context.test.ts:110-132` then proves the role comes from the server's answer, not the cookie. `getSession()` appears nowhere in product code — only in that test and two comments.

**C2 — met.** `cookies.ts:48-63` deletes every `sb-<ref>-auth-token*` whose ref differs from `projectRef(config.url)`; `session.ts:49-51` runs the purge before the refresh and filters purged names out of the client's `getAll` (:56-58), so the SDK cannot resurrect them. Five tests (C1.log:185-214) cover both switch directions, the project's own cookies surviving, an unrelated `sb-session-notes` surviving, and all five cookie forms Supabase writes. The batching contract in `session.ts:43-47` matches what `proxy.ts:30` needs.

**C3 — met.** `boundaries.js:58` adds the `auth` element, `:77` gives it `config, db, observability` only (no `env` — consistent with the package never reading `process.env`, enforced again by `packages/auth/eslint.config.mjs:9-17`), and `:85` pins `@supabase/*` to `auth`. Seven probes in `tooling/boundaries.test.ts:38-58, 90-93` pass in C4.log:72-85, 120-127. Note that C3.log is a bare header — exit 0, no output — so it proves only the exit code; the substance is the probe set inside C4.

**C4 — met, with the gap below.** C4.log:1295 — 18 server-only values, none in 27 browser-facing files. The as-built's claim checks out structurally: `check-client-bundle.ts:78-93` derives the planted names from `.env.example` and `turbo.json`, and both now carry `SUPABASE_SERVICE_ROLE_KEY` in all three forms (`.env.example:68-70`, `turbo.json:27-29`), so the service-role key is seeded automatically rather than by a hand-maintained list.

**C5 — correctly deferred, not met and not claimed.** `--verdict deferred` with `deferred: true` is the sanctioned mechanism for an operator-only check, the reason matches the contract, and `C5-operator.md` gives executable steps. The as-built lists it under "Not verified" alongside two other honest gaps (no test reaches a live Auth server; the mirror's end-to-end path is STK-11's C4). That is the right disclosure.

**Non-negotiables** — all six hold. Admin client session-free and asserted on the built client's own fields (`admin.test.ts:14-17`), refresh only in `proxy.ts:22`, browser client over inlined literals (`client.ts`, `env.ts:126-132`), client-safe subpaths walked for server imports (`client-safe.test.ts:60-74`).

## Findings

**Blocking — `apps/web/env.ts:112`: the publishable-key variable has no guard on what class of key it holds.** This ticket's own `slice_type` names two risks: "authorization from an unverified session **or a secret in a client bundle**." The first is closed thoroughly. The second is closed only for server-*named* variables, and this ticket introduced the one public variable that carries a key.

- Adversary: anyone who loads a page, plus every scraper and cache.
- Path: an operator fills the blank at `.env.example:62-64` with the service-role key instead of the publishable one — the two sit nine lines apart in that file and adjacent in the Supabase dashboard, and in the legacy pair both are `eyJ…` JWTs differing only in a `role` claim. `env.ts:141` passes the value to `nextConfigEnv`; `next.config.ts:42` inlines it into every bundle, "the browser's included" (its own comment, and `next-public.ts:1-5`).
- Impact: a key that bypasses every row-level-security policy is published, cached and indexable. Full read and write of the database for anyone who views source. It is the worst disclosure this stack can produce.
- Why nothing catches it: `check-client-bundle.ts:74-75` skips `NEXT_PUBLIC_*` names by construction, so no sentinel exists for this variable — the full verify chain passes with the key published. `nextPublicEnv` guards the *name*, never the value. The only current control is the prose comment at `.env.example:65-67`: policy documentation, the weakest layer available.
- Control, at the seam where it belongs: a `.refine()` on `env.ts:112` refusing a Supabase secret key — the `sb_secret_` prefix, or a JWT whose payload `role` is `service_role`. `packages/env/src/key-mode.ts:27` is already a generic, tested `keyModeProblem(name, value, tier, prefixes)` built for exactly this shape and currently unused by the app; D-STK-4 already ratified that the seam refuses a wrong-class key by prefix. Verify the current prefixes on the day, the way this repo pins every other vendor fact.
- The environment seam is a one-way door with warden named on it (technical.md's door table), which is why I am ranking a missing guard rather than a defect. If the appetite says fast-follow, that is Taylor's call to record against D-STK-4 with a revisit trigger — not mine to assume.

**Should-fix — `apps/web/app/auth/sign-in/actions.ts:33`: an unauthenticated endpoint that sends email to any address, with no rate limit and no operator step naming one.** Adversary: anyone on the internet. Path: POST the action in a loop with arbitrary addresses. Impact: the project's email quota drained, so real users cannot sign in, and unsolicited mail leaving the product's domain and sender reputation. Supabase's own per-project limit caps the blast radius today, which is why this is not Blocking — but `.env.example:53` and `C5-operator.md:13` carefully tell the operator to add a redirect URL and say nothing about the rate limit, so the first product to wire custom SMTP and raise it inherits the vector silently. Smallest control: one line in the operator steps and in `remove-supabase-auth.md`'s vendor section naming the Authentication rate-limit setting as a required check.

**Consider — no sign-out exists anywhere in the repo** (`apps/web/app/auth/` holds only `callback/` and `sign-in/`; `signOut` appears in no file). The contract puts "sign-in UI beyond one minimal page" out of scope, so this is not a defect against STK-12 and I am not relitigating that. But the module that owns sessions ships with no revocation path, no later ticket in technical.md's order claims one, and revocation on a shared device is the control a real person needs most. It needs a named home before the demo app gets anything worth protecting.

**Consider — `packages/auth/src/{server,admin,session,context}.ts` carry no `server-only` marker.** The app wrappers do (`lib/supabase/admin.ts:8`, `server.ts:8`, `context.ts:9`, `local-mirror.ts:12`), and `tech-stack.md:43` is honest that the dependency lives in `apps/web`. But the package is the artifact products copy, so a client component in a future product can `import "@pem/auth/admin"` with nothing refusing. The reason a bare import is wrong here is real: `server-only` throws under plain Node and would break the package's own `node --test`. So the control is an eslint rule or a `react-server` export condition, not an import — worth a line in the as-built either way, since the omission currently reads as an oversight.

**Consider — `apps/web/lib/supabase/server.ts:24-27` swallows a failed cookie write with no log.** The comment correctly explains the Server Component case, which is the common one. In the callback route that same write *is* the sign-in; if it ever failed the user would be redirected to `/` anonymous, and nothing would be recorded. One `log.warn` in the catch answers the "would we know" question cheaply.

**Consider — the two test logs disagree on count.** C1.log reports `tests: 106`, C2.log `tests: 105`, same command, same head, eight seconds apart, both exit 0 with zero failures. C2 was a turbo cache replay with interleaved output, which is the likely cause of a miscount rather than a skipped test. Worth one line so a later reader doesn't take it for a hidden skip.

Everything else I checked held: no secret reaches a log (`redact.ts:65-73` drops an Error's own properties, which closes the postgres-detail path from `context.ts:88`), the open redirect is shut at both the path and origin layers with the bypass cases tested (`redirect.ts:15-33`, `redirect.test.ts:18-32`), the sign-in action keeps the address out of the URL and the log (`actions.ts:44`), the callback echoes nothing on failure, the proxy discards `updateSession`'s return so it authorizes nothing, and `remove-supabase-auth.md:70` remembers to rotate the service-role key.

VERDICT: FAIL
