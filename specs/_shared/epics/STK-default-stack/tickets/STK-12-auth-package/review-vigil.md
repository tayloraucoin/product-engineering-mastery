# Review — vigil on STK-12

> Written by `yarn review:run vigil STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: 9613cc3632d42b001e9aee4fd3ef90e4bbd0a373
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:48:23Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# QA review — STK-12 auth-package

**Reviewer:** Vigil · **Mode:** full feature review, fresh context, code and evidence only. I built the checklist from `contract.md` and `technical.md` (D-STK-7, D-STK-16) before opening `packages/auth/`; findings below trace to a contract line, a path rule, or a stated craft standard.

`[ASSUMPTION: no running app available to me — Read/Grep/Glob only. Every item below resolves to verified-in-code, runtime-required, or unverifiable, and I say which.]`
`[ASSUMPTION: C1–C4 are recorded at head 89bff074 and the harness did not flag them stale at session start; I cannot run git, so I take their freshness on the harness's word and name it here.]`

## Criteria

**C1 — the seam returns user and role from `getUser`, and refuses a session whose user cannot be fetched. Met.**
`packages/auth/src/context.ts:101` calls `client.auth.getUser()` and nothing else; a throw returns `null` (`:100-104`), and so does `result.error || !user` (`:106`). `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES` and falls back to `user`; `user_metadata` is never read. The test I care about is adversarial, not nominal: `context.test.ts:87-108` builds a real `@supabase/ssr` client over a forged cookie, asserts `getSession()` reports `admin` (`:100`), stubs `/auth/v1/user` at 401, asserts the seam returns `null` **and** that the call to the Auth server happened (`:104-107`). `:110-132` then passes the same cookie with a 200 and takes the role from the server's answer, not the cookie. The stub reader throws if `getSession()` is ever called (`:41-43`). `C1.log:534-542`, `# fail 0`, `# skipped 0`.

**C2 — `updateSession` purges cookies for a different project ref. Met.**
`cookies.ts:40` matches `sb-<ref>-auth-token` plus chunk and all three verifier forms; `foreignSessionCookies` (`:52-67`) deletes every ref but the configured one, or all of them when `url` is `null`. `session.ts:63-65` purges before the refresh and `:70-72` hides the purged names from the client's read, so the SDK cannot resurrect them; the batch-growing `write` (`:57-61`) is what keeps `proxy.ts:32`'s response rebuild from dropping the purge. Six tests cover both switch directions, own cookies kept, an unrelated `sb-` cookie kept, the no-project clear, and every cookie form (`session.test.ts:27-119`; `C2.log`, 114 tests, exit 0). `config.test.ts:35-42` reads `storageKey` off a client the installed SDK built and asserts it equals `authCookieStem(url)` — that is the test that stops an SDK rename from silently turning the purge into a no-op, and it is the best thing in this ticket.

**C3 — boundaries pass with `@supabase/*` owned by auth. Met.**
`boundaries.js:62,81,92` add the `auth` element, its edges (`config`, `db`, `observability`) and `"@supabase/*": "auth"`. `C3.log` is exit 0 with an empty body, which proves only that the lint ran clean; the substantive proof is `tooling/boundaries.test.ts:38-58,100-104` — `@supabase/*` refused in `db` and in `apps/web` with the message asserted, `@pem/auth` refused in `db` and `email`, allowed in `auth` and in the app — passing at `C4.log:92-115,152-159`.

**C4 — the full chain passes with the service-role key among the seeded server-only variables, and no sentinel in a client chunk. Met.**
I checked the seeding arithmetic rather than taking the claim: `check-client-bundle.ts:74-93` plants every non-`NEXT_PUBLIC_` name in `.env.example` and `turbo.json` minus three enum words. `.env.example:70-72` and `turbo.json:27-29` carry all three service-role forms; the plantable set is exactly 18 names, and `C4.log:1571` reports "18 server-only value(s), none in 27 browser-facing file(s)". `env.ts:106,130-134` declares and picks the key server-side. The hole the sentinel scan cannot see — a secret pasted into the public slot — is closed separately at `env.ts:113-122` via `publicKeyProblem` (`config.ts:46-52`), tested at `config.test.ts:18-33` and shown exiting 1 at `live-checks.md:42-44`. The `C4 (last run exited 1)` at `C4.log:28` is self-referential: verify ran before this log became C4's evidence.

**C5 — a staging sign-in on localhost redirects back to localhost. Correctly deferred, not met.**
`redirect.ts:25-33` pins the origin to env.ts's site URL and re-checks the resolved origin; `safeNextPath` (`:15-22`) refuses `//host`, `/\host` and control characters; the request's Host header is never read. Unit-tested (`C1.log:595-630`) and probed against a synthetic project (`C5-operator.md:7`). The hosted round trip is untested, which is what `--verdict deferred` and the operator steps record. No overclaim.

**Non-negotiables — all six hold.** Four factories; `admin.ts:20-24` with `persistSession`, `autoRefreshToken`, `detectSessionInUrl` false, asserted off the built client (`admin.test.ts:14-17`). Authorization reads `getUser` only. `updateSession` is called at `proxy.ts:42` and nowhere else in the repo (grep: only tests, docs and the package itself). `env.ts:44-53` reads literal `process.env.NEXT_PUBLIC_*` names, collapsed at `next.config.ts:42`. `client-safe.test.ts:60-74` walks `./config`, `./browser`, `./redirect` to no server module, no built-in and no workspace package, and `:83-86` asserts `import "server-only"` on all four server subpaths — with `:76-81` proving the walk can see a server import when there is one, which is what stops it being a tautology.

## Findings

### Blocking

None. I probed each promise this slice makes adversarially rather than reading it: authorization from a forged admin cookie, a secret in a client chunk, an open redirect via `//evil`, a session-persisting admin client, and cookies surviving a tier switch are each closed by a cited test or an enforced check.

### Should-fix

**1 · The user's destination is silently discarded on every recoverable path.** `actions.ts:30` and `:46` redirect to `/auth/sign-in?state=invalid` and `?state=error`; `route.ts:53-54` builds the `expired` target; `page.tsx:60` links to a bare `/auth/sign-in`. None carries `next`, which `page.tsx:77` carries correctly on the happy path only. A user deep-linked to `?next=/settings` who mistypes once signs in successfully and lands on `/`, with nothing to tell them what happened. Expected per the ticket's own redirect rules (`contract.md:13`, `redirect.ts:36-45`), which exist precisely to carry `next` through. Not a dead end, so not Blocking. Named by assay (#1) and threshold (F9) and **absent from the as-built's "Not done from the reviews" list** (`as-built.md:40-45`), so a reader of the record would believe it was handled. *Owner: this ticket or STK-24, which reopens the form.*

**2 · The as-built overstates the UI verification, and its "Not verified" section does not cover the gap.** `as-built.md:22` reads "Every state was checked in the browser on 2026-10-04"; the file it cites says light theme at 800 px and names dark, 390, 1440 and reduced motion as not captured (`live-checks.md:29,38`). `as-built.md:49-53` lists C5, live refresh and the mirror, not this. A merged as-built is immutable (`.claude/rules/specs.md`) and is the record later tickets inherit; "checked in the browser" without its qualifier is the exact shape of claim my honesty test exists to catch. Raised by assay (#2) and still unamended. *Smallest fix: narrow line 22 to "light theme, 800 px", and add one line under Not verified.*

**3 · C4's command is `yarn verify`, which the specs rule bars outright.** `contract.md:64` sets `command: "yarn verify"`; `.claude/rules/specs.md` says "`yarn verify` is never a criterion: it runs once at batch close", and `contract:run` accepted it anyway. Routed to me by assay. Not Blocking, and I will defend that in one clause: the evidence produced is a strict superset of what a narrower command would prove, and re-cutting the criterion now changes `criteria_sha256` and invalidates every other recorded proof on this ticket. But it couples C4's standing to unrelated work on a shared branch, and it is why `C4.log` contains a warning about C4 itself. *Owner: the contract author, at authoring time on the next ticket; and `contract:init` should refuse the command rather than leave it to a reviewer to catch.*

### Consider

**4 · `evidence/live-checks.md` carries eight of the as-built's claims and is bound to no run record.** It is cited at `as-built.md:6,8,22,25` and elsewhere, but appears nowhere in `results.json`, so nothing hashes it and nothing goes stale when it changes. Partly a harness gap — there is no mechanism to record non-criterion evidence — which is why it is Consider and not higher.

**5 · The as-built's test-count note describes a state that no longer exists.** `as-built.md:46` explains that C1 and C2 "can record test totals one apart"; both logs and `results.json:15,28` now read 114. Harmless, but it is a false line in an immutable record. *Smallest fix: delete the paragraph.*

**6 · `proxy.ts:42` awaits `updateSession` unguarded.** The matcher covers every page and route (`:48-50`), so any throw that escapes the SDK 500s the whole site, including `/auth/sign-in` — the one page that could explain the problem. The trigger is narrow (network failure surfaces in `error`, not as a throw), the seam itself is defensive (`context.ts:100-104`), and both the previous vigil round and warden ranked this Consider; I agree. It is also missing from the as-built's "Not done from the reviews" list, so the decline is undocumented.

**7 · `actions.ts:33` creates an account for any address typed in.** `signInWithOtp` defaults to `shouldCreateUser: true`. The as-built and `.env.example:54-55` treat the project's email rate limit as the cap on abuse, which covers email volume; it does not cover user-row creation from an unauthenticated form, and no copy tells the person typing that they are creating an account. Right default for a starter, probably — but it should be a stated default, not an inherited one. *Smallest fix: set the flag explicitly, with a comment saying which behaviour was chosen.*

**8 · The `?state=` vocabulary diverges from the app rule and `offline` is unargued.** `apps/web/AGENTS.md` requires `empty|loading|error|partial|offline` on every route; `page.tsx:18` ships `loading|sent|invalid|error|expired`. `as-built.md:37` argues `empty` and `partial` away convincingly for a form and does not mention `offline`. With no `states.md` or `coverage-gaps.md` yet there is nowhere to record five real states and three N/A, so this routes to the design layer at Phase 3 rather than to this ticket.

## Conversations

*Raised on the user's behalf, not as defects. Declining any of these is a legitimate call.*

A person who mistypes their address here loses two things at once: what they typed (`email-field.tsx:11-20`, no `defaultValue`) and where they were going (finding 1). Each is small; together they turn one typo into retyping an address and then arriving somewhere they did not ask for. Both are deferred to STK-24, which is the right home. The question for whoever picks that ticket up is whether they are treated as one fix — restoring the form's memory — rather than two line items, because the cost falls on the same person in the same five seconds.

"Send another link" (`page.tsx:60`) names an outcome it does not produce: it navigates to an empty form. For someone who has been waiting two minutes and is now slightly anxious, a control labelled with the thing they want, which instead resets their work, reads as a failure. "Use a different address" is honest, or the link could actually re-send. Assay raised this as Consider; I second it from the support-desk side, because this is the state people email about.

The `sent` state's `role="status"` (`page.tsx:56`) arrives on a fresh navigation, where VoiceOver typically will not announce it. It sits directly under the `h1` in reading order, so nobody is stranded — threshold judged it the same way (F4). Worth knowing when the next async surface is built, because the pattern will be copied.

## Runtime checklist

Ordered by risk. Everything below is code-verified only.

1. Run C5 as written (`C5-operator.md:13-18`): a real staging sign-in started on localhost must land on `http://localhost:3000/auth/callback?code=…` then `/`, never the staging origin, with an `sb-<staging ref>-auth-token` cookie on localhost.
2. In the same session, let an access token actually expire and reload a page. No test anywhere reaches a live Auth server, so the refresh half of `updateSession` is unproven end to end (`as-built.md:52`).
3. Click one sign-in link **twice**, and click an expired one. Both must land on `?state=expired` with the no-store headers, and neither may leave a half-written session cookie.
4. Switch `DATABASE_ENVIRONMENT` between Mode A and Mode B on a browser that holds live cookies from both, with the real chunked cookies a hosted session writes (the synthetic probe at `live-checks.md:11-12` used short values; chunking is where this breaks).
5. Sign in from a deep link (`/auth/sign-in?next=/some/path`), mistype the address once, then succeed — confirm finding 1's behaviour before deciding its priority.
6. Submit the form on a throttled connection and double-tap the button: confirm `useFormStatus` disables it before a second POST goes out (`send-link-button.tsx:13-17`).
7. The sign-in page at 390 and 1440, in dark, with reduced motion — uncaptured today and unverifiable until the P-C harness lands.

---

**Sign-off.** Five criteria, four met in code and evidence, one correctly deferred; all six non-negotiables hold, and the two that could hurt someone — authorization from an unverified session and a secret in a browser bundle — are each closed by a test that attacks them rather than describes them. Three Should-fix findings: a silently dropped destination, an as-built that claims more browser verification than it has, and a contract criterion that uses a command the specs rule forbids. None of them turns a user away at the door, and none is defensible as Blocking.

VERDICT: PASS
