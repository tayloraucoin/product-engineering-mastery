# Review — assay on STK-12

> Written by `yarn review:run assay STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 159e25dc3a425dee3d2161566a419ac46a8b1cceff4594f39e4f0bdd7d16974a
- head: d0a1b7b2a508207c286584634b73d427484c1209
- runner: claude 2.1.232 (Claude Code) (agent assay; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:39:32Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run assay STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are assay, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Coverage

**Captured and read:** contract, `results.json`, as-built, C1/C2/C3/C4 logs, `C5-operator.md`, the unrecorded `evidence/live-checks.md`, all 42 changed files in the planned paths, `technical.md` (D-STK-7, D-STK-16), canon §1–§2, `canon-rubric.md`.

**Round 1 of 3** for `review:assay` (`results.json` shows `run: null`; `review-warden.md` ran at an earlier head, `9e13361`, than the current proofs, `b542e0e`).

**Not verified, named rather than passed (C-R01):**

- The sign-in page at 390 and 1440, in dark theme, with reduced motion, for any of its six states. `live-checks.md:38` admits this; light theme at 800 px only. `.claude/rules/testing.md` rules that no capture harness exists until P-C, so this is a system gap, not a builder failure. These rubric lines are UNVERIFIED, not PASS.
- C5 (recorded `--verdict deferred`, legitimate per `.claude/rules/specs.md`).
- `live-checks.md` carries no hash in `results.json`; it is cited by as-built but is not recorded evidence for any criterion.
- C1 and C2 are a full turbo cache replay (`C1.log:783`, `C2.log:783`, "7 cached, FULL TURBO"), not an execution at that head. `check-specs` reports no staleness for them, so the harness treats them as fresh.

**No product design layer exists** — `apps/web/docs/design/` is absent — so per `apps/web/AGENTS.md` the canon alone governs, and C-R10's "every state in `states.md`" is N/A.

## Criteria

| ID | Verdict | Evidence and code |
| --- | --- | --- |
| C1 | **Met** | `context.ts:98-119` reads only `getUser()`; `result.error \|\| !user` → null; a throw → null. `context.test.ts:87-108` builds a real `@supabase/ssr` client over a forged cookie that `getSession()` reports as `admin` (`:100`), stubs `/auth/v1/user` at 401, and asserts the seam returns null and did call `/auth/v1/user`. `:110-132` shows the role taken from the server's answer, not the cookie. `C1.log:475-557` — 29 pass, 0 skipped. Mirror once-per-user proven at `:545-551`. |
| C2 | **Met** | `session.ts:51-53` purges before refresh; `cookies.ts:40-63` matches chunk and all three verifier forms. `session.test.ts:27-107` covers both switch directions, own cookies kept, `sb-session-notes` kept, and the five cookie shapes. `C2.log:520-550`. |
| C3 | **Met** | `boundaries.js:58,76,86` add the `auth` element, its import row and `"@supabase/*": "auth"`. `C3.log` exit 0. Six probes in `C4.log:73-128`: `@supabase/*` refused in `db` and `apps/web`, `@pem/auth` refused in `db` and `email`, allowed in `auth` and the app. |
| C4 | **Met** | `C4.log:1338` — "18 server-only value(s), none in 27 browser-facing file(s)". The service-role key is seeded because `.env.example:70-72` and `turbo.json:27-29` carry the name and `env.ts:106` reads it server-side; the harness test at `C4.log:163` proves names are planted from those two files. `config.ts:46-52` and `env.ts:113-122` additionally refuse a secret in the public slot; `live-checks.md:42-44` shows the build exiting 1. Exit 0. |
| C5 | **Deferred**, correctly | `C5-operator.md` gives the operator steps and states what the agent probed against a synthetic project. `results.json` records `deferred: true`. |

**Non-negotiables:** all six hold. Four factories present; `admin.ts:20-24` sets `persistSession`, `autoRefreshToken`, `detectSessionInUrl` false. `getSession` appears nowhere outside comments and tests (grepped repo-wide). `updateSession` is called only at `proxy.ts:22`. `env.ts:44-53` reads literal `process.env.NEXT_PUBLIC_*` names, collapsed into `next.config.ts:42`. `client-safe.test.ts:60-74` walks `./config`, `./browser`, `./redirect`; `:83-86` asserts `import "server-only"` on all four server subpaths.

## Findings

**1. Should-fix — the declared `loading` state is not the state users see.** `apps/web/app/auth/sign-in/page.tsx:74` disables the field only when `?state=loading` is in the URL, but the real in-flight render comes from `useFormStatus` in `send-link-button.tsx:9`, which the server-rendered `email-field.tsx:2` cannot read. During an actual submit the button says "Sending link" while the input stays enabled — so the state the critic can capture differs from the state the user gets (C-P08, C-R10). Smallest fix: make `EmailField` a client leaf reading `useFormStatus`, as the button does, so both renders agree.

**2. Should-fix — the as-built's test counts contradict the recorded evidence.** `as-built.md:40` says "C1 and C2 report 106 and 105 tests"; `results.json:15,28` and the log headers (`C1.log:5`, `C2.log:5`) say 113 and 112. The explanation offered (one run, interleaved cached output, nothing skipped) still holds for 113/112 — both logs show `# skipped 0` — but the figures are wrong, and `.claude/rules/specs.md` makes the as-built immutable once merged. Smallest fix: correct the two numbers before merge.

**3. Should-fix — the focus token is reused for hover.** `apps/web/app/auth/sign-in/_components/email-field.tsx:15` sets `hover:border-ring` beside `focus-visible:ring-ring`, giving one shade two meanings (C-R09, C-P05). It also fails the dialect test: `@pem/ui`'s own bordered control hovers with a surface change (`button.variants.ts:14`, `hover:bg-accent hover:text-accent-foreground`). Smallest fix: drop `hover:border-ring`, use `hover:bg-accent`.

**4. Should-fix — the app's server store drops the no-store headers the cookie contract carries.** `packages/auth/src/cookies.ts:27-32` defines `headers` as Supabase's no-store headers that "a store that answers an HTTP response sets"; `apps/web/lib/supabase/server.ts:20` takes `(written)` and ignores them. `proxy.ts:33-34` does set them, so only the Route Handler and Server Action paths are affected — the callback route writes session cookies on a 307 with no `Cache-Control: no-store`. `as-built.md:16` claims this contract without noting the app-side gap. Routed to warden for the caching judgment; smallest fix is to set the headers on the handler's response or record the omission as a deviation.

**5. Consider — `browser.ts` does not import what it says it imports.** `packages/auth/src/browser.ts:2-3` and `as-built.md:13` both say the browser client uses "`@supabase/ssr`'s browser entry"; `browser.ts:9` imports the package root. The consequence is bundle size, not a leak. Smallest fix: correct the two comments, or import the browser entry if the package exposes one.

**Cut (polish, not worth a round):** `as-built.md:21` says the callback accepts "a `token_hash` plus `type`" without noting that `route.ts:23` admits only four types, so the `recovery` link in `live-checks.md:25` is reported as expired. `C4.log:1338` prints a count but not the seeded names, so C4's service-role clause is proven by reading `.env.example`/`turbo.json` rather than by the log line.

## Rubric and contract gaps (routed, kept out of the score)

- **No `capture` criterion** though the ticket ships a UI surface with six states. `.claude/rules/testing.md` says UI criteria default to `capture` and that every `capture` is UNVERIFIED until P-C. The contract resolved this by omitting the criterion rather than recording it as unverified, which leaves the UI with no line to be unverified against. Route to the contract owner.
- **C4's command is `yarn verify`**, which `.claude/rules/specs.md` bars outright: "`yarn verify` is never a criterion: it runs once at batch close." `contract:run` accepted it, so the harness does not enforce its own rule. Route to vigil.
- **The `?state=` vocabulary diverges** from `apps/web/AGENTS.md` (`empty|loading|error|partial|offline`): `page.tsx:18` declares `loading|sent|invalid|error|expired`, and the other three fall through to the default form. `as-built.md:33` argues a form has none of them, which I accept — but with `apps/web/docs/design/` unwritten there is no `states.md` or `coverage-gaps.md` to record the five real states and the three N/A. Route to the design layer when Phase 3 lands.
- **The native `<input>`** (`email-field.tsx`) is outside the `@pem/ui` vocabulary and can only be "ruled in" by a `components.md` that does not exist yet. `as-built.md:34` documents it and names the promotion trigger; that is the best available home today.

Near-the-line call, named: I considered the C1/C2 cache replay (coverage, above) as a Should-fix on evidence quality and leaned to Consider-and-cut, because `check-specs` reports both proofs fresh at `b542e0e` and turbo's cache key is the input set. If the rubric wants executed-not-replayed runs for `test` criteria, that line needs sharpening.

No Blocking finding: every law this ticket could break — authorization from an unverified session, a secret in a client bundle, an open redirect, a session-persisting admin client, invisible focus — is closed by a cited test or an enforced check, and no required state is missing.

VERDICT: PASS
