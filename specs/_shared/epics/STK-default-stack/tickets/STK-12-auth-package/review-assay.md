# Review — assay on STK-12

> Written by `yarn review:run assay STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: b54069cd7147ddd773f5e5c76af846365c8398f6
- runner: claude 2.1.232 (Claude Code) (agent assay; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:13:38Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run assay STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are assay, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Coverage

**Read:** contract, `results.json`, as-built, `C1`–`C4` logs, `C5-operator.md`, the unrecorded `evidence/live-checks.md`, all 42 changed files in the planned paths, `technical.md` (D-STK-7, D-STK-16), canon §1–§2, `review-assay.md` (round 1).

**Round 2 of 3.** `results.json:68-72` shows `review:assay` reset to `run: null`; my round-1 PASS was bound to as-built `159e25dc…`, which the current as-built no longer is. Findings below are round-1 items that remain, plus what the new code shows.

**Not verified, named rather than passed (C-R01):**

- The sign-in page at 390 and 1440, in dark theme, with reduced motion, in any state. `live-checks.md:38` admits this: light theme, 800 px only. `.claude/rules/testing.md` rules no capture harness exists until P-C, so this is a system gap, not a builder failure. These lines are UNVERIFIED, never PASS.
- C5, recorded `--verdict deferred` — legitimate per `.claude/rules/specs.md`.
- `live-checks.md` carries no hash in `results.json`: cited by the as-built, recorded evidence for nothing.
- C1–C4 were recorded at head `53a8da1`; C5 at `76c5899`. I cannot run `check-specs`, so I take C1–C4's freshness on the harness's word; the code I read matches what the as-built describes at that head.
- No product design layer (`apps/web/docs/design/` absent), so the canon alone governs and C-R10's "every state in `states.md`" is N/A.

## Criteria

| ID | Verdict | Evidence and code |
| --- | --- | --- |
| C1 | **Met** | `context.ts:98-119` reads only `getUser()`; `result.error \|\| !user` → null, a throw → null, `getSession` never called. `context.test.ts:87-108` builds a real `@supabase/ssr` client over a forged cookie that `getSession()` reports as `admin` (`:100`), stubs `/auth/v1/user` at 401, asserts null and asserts the call happened; `:110-132` takes the role from the server's answer. `C1.log:556-619`, `# fail 0`, `# skipped 0`. |
| C2 | **Met** | `session.ts:63-65` purges before refresh and hides purged cookies from the client (`:70-72`); `cookies.ts:40-45` matches the chunk and all three verifier forms. `C2.log:1221-1256`: both switch directions, own cookies kept, no-project clear, every cookie form. `config.test.ts`'s stem-vs-SDK assertion (`C2.log:1012-1017`) guards an SDK rename. |
| C3 | **Met** | `boundaries.js:58,76,86` add the `auth` element, its row and `"@supabase/*": "auth"`. `C3.log` exit 0 (body empty — a silent lint, thin but consistent with the script). Six probes in `C4.log:69-128`: `@supabase/*` refused in `db` and `apps/web`, `@pem/auth` refused in `db` and `email`, allowed in `auth` and in the app. |
| C4 | **Met** | `C4.log:1340` — "18 server-only value(s), none in 27 browser-facing file(s)". The service-role name is seeded because `.env.example:70-72` carries it and `env.ts:106` reads it server-side; `C4.log:159-163` proves names are planted from `.env.example` and `turbo.json`. `config.ts:46-52` and `env.ts:113-122` additionally refuse a secret in the public slot; `live-checks.md:42-44` shows that build exiting 1. Exit 0. |
| C5 | **Deferred, correctly** | `C5-operator.md` gives the operator steps and what was probed against a synthetic project; `results.json:65` records `deferred: true`. |

**Non-negotiables:** all six hold. Four factories (`server.ts`, `browser.ts`, `admin.ts`, `session.ts`); `admin.ts:20-24` sets `persistSession`, `autoRefreshToken`, `detectSessionInUrl` false. Authorization reads `getUser` only. `updateSession` is called at `proxy.ts:42` and nowhere else. `env.ts:44-53` reads literal `process.env.NEXT_PUBLIC_*` names, collapsed at `next.config.ts:42`. `client-safe.test.ts:60-74` walks `./config`, `./browser`, `./redirect`; `:83-86` asserts `import "server-only"` on all four server subpaths.

**Round-1 findings, resolved:** the `loading` state now matches a real submit (`send-link-button.tsx:12-18`, field left enabled); the hover is a surface change (`email-field.tsx:19`, `hover:bg-accent`); `browser.ts:2-9` no longer claims an entry it does not import; the callback's session-cookie redirects carry no-store headers (`route.ts:27-36`); the test-count claim was rewritten.

## Findings

**1. Should-fix — `next` is dropped on every recoverable error path.** A user deep-linked to `/auth/sign-in?next=/settings` who mistypes the address goes to `/auth/sign-in?state=invalid` with no `next` (`actions.ts:30`); an expired link goes to `?state=expired` with no `next` (`route.ts:53-54`); "Send another link" goes to a bare `/auth/sign-in` (`page.tsx:60`). After the next successful sign-in they land on `/`, silently. The page carries `next` through the happy path only (`page.tsx:77`), against the redirect rules this ticket calls its own (`contract.md:13`, `redirect.ts:36-45`). Late finding — I missed it in round 1, and it is not a regression. Smallest fix: append the request's `next` to those three targets.

**2. Should-fix — the as-built overstates what the UI verification covered.** `as-built.md:22` says "Every state was checked in the browser on 2026-10-04"; the file it cites says light theme at 800 px, and names dark, 390, 1440 and reduced motion as not captured (`live-checks.md:38`). The "Not verified" section (`as-built.md:49-53`) lists C5, live session refresh and the mirror, but not the capture gap. A merged as-built is immutable (`.claude/rules/specs.md`), and this is the record a later reader will trust (C-R01). Smallest fix: narrow line 22 to "light theme, 800 px", and add one line under Not verified naming the uncaptured viewports, theme and reduced motion.

**3. Consider — the test-count note now describes a state that is not in the file it cites.** `as-built.md:46` explains totals "one apart", but `results.json:15,28` and both log headers read 114 and 114. Smallest fix: delete the paragraph.

**4. Consider — the cookie contract's `headers` is still unimplemented in the app's server store.** `cookies.ts:27-32` documents `headers` as something "a store that answers an HTTP response sets"; `apps/web/lib/supabase/server.ts:20` takes `(written)` and drops them. The consequence I named in round 1 is closed — the callback sets them by hand (`route.ts:27-36`) — so what remains is a comment that outruns the code on the Server Action path, where `signInWithOtp` writes the PKCE verifier cookie. Smallest fix: set the headers there, or say in `server.ts` why they are not needed.

**5. Consider — "Send another link" names an outcome it does not produce.** `page.tsx:60` links to the form; it sends nothing, and it is a second label for the intent the button already names "Email me a sign-in link" (`send-link-button.tsx:18`) — C-P09, A-17. Smallest fix: "Use a different address", or keep the label and send the form.

**Cut (polish):** the `sent` state's `role="status"` (`page.tsx:56`) is mounted with its content on a fresh navigation, where announcement is unreliable — threshold's depth, not mine. `route.ts:39` still admits four link types, so the `recovery` probe in `live-checks.md:25` reads as expired; as-built `:21` does not say so.

## Rubric and contract gaps (routed, kept out of the score)

- **No `capture` criterion** for a ticket that ships a six-state UI surface. `.claude/rules/testing.md` makes `capture` the default for UI and makes every capture UNVERIFIED until P-C; omitting the criterion leaves the UI with no line to be unverified against. Unchanged from round 1 — route to the contract owner.
- **C4's command is `yarn verify`**, which `.claude/rules/specs.md` bars outright ("never a criterion: it runs once at batch close"), and `contract:run` accepted it. Route to vigil.
- **The `?state=` vocabulary diverges** from `apps/web/AGENTS.md` (`empty|loading|error|partial|offline`): `page.tsx:18` declares `loading|sent|invalid|error|expired`. `as-built.md:37` argues empty and partial are inapplicable to a form, which I accept; `offline` is not argued and not built. With no `states.md` or `coverage-gaps.md` yet, there is nowhere to record the five real states and the three N/A. Route to the design layer at Phase 3.
- **The native `<input>`** (`email-field.tsx`) sits outside the `@pem/ui` vocabulary and can only be ruled in by a `components.md` that does not exist. `as-built.md:38` documents it and names the promotion trigger; that is the best home available today.

**Not scored, owned by the gate:** `review:vigil`'s PASS is stale against six changed files (`C4.log:24`) and `review:warden` stands FAIL at head `9e13361`, before the work `as-built.md:8` says answers it. `check-specs --strict` holds the merge until both are re-run.

**Near-the-line call, named:** finding 1 sat between Should-fix and Blocking. It silently discards a user's destination, which is a trust cost, but it breaks no law, no contract criterion and no required state, and the ticket's scope is "one minimal page" (`contract.md:46`). I leaned to Should-fix. If the rubric wants redirect-continuity treated as a law, that line needs sharpening.

No Blocking finding: authorization from an unverified session, a secret in a client bundle, an open redirect, a session-persisting admin client and invisible focus are each closed by a cited test or an enforced check.

VERDICT: PASS
