# Review — threshold on STK-12

> Written by `yarn review:run threshold STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 159e25dc3a425dee3d2161566a419ac46a8b1cceff4594f39e4f0bdd7d16974a
- head: d0a1b7b2a508207c286584634b73d427484c1209
- runner: claude 2.1.232 (Claude Code) (role docs/roles/product-design/threshold-accessibility-auditor.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:39:32Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run threshold STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are threshold, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Accessibility review — STK-12 auth-package

**Reviewer:** Threshold · **Scope:** the UI this ticket shipped (`apps/web/app/auth/**`), audited against the contract, the evidence and the code. Keyboard and screen-reader passes run by reading the DOM the server emits; contrast computed from `packages/config/tailwind/preset.css` using the same luminance model `tooling/contrast-audit.ts` uses (my numbers reproduce its reported 4.96:1, 3.30:1 and 3.99:1 exactly).

`[ASSUMPTION: no conformance target is stated anywhere in the repo, so I audit to WCAG 2.2 AA and say so. No product design layer exists yet (C4.log:1273, "product layer not written yet"), so canon.md alone governs, and canon delegates contrast and color-alone to "the auditor's tests" (canon.md:81).]`
`[ASSUMPTION: no AT data supplied; judged for keyboard-only, VoiceOver and NVDA, light and dark.]`

## Criteria

**C1 — the seam returns user and role from `getUser`, and refuses a session whose user cannot be fetched. Met.** `packages/auth/src/context.ts:98-119` reads only `client.auth.getUser()`; `result.error || !user` returns `null` (`:106`), a throw returns `null` (`:102-103`), and `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES` only. `getSession()` appears nowhere in the resolver. C1.log:530-539 shows the pair that matters: a forged admin cookie refused on a 401, then the same cookie passing with the role from the server's answer, not the cookie's.

**C2 — `updateSession` purges cookies for a different project ref. Met.** `cookies.ts:40-63` matches `sb-<ref>-auth-token` plus chunk and verifier suffixes and emits deletions for every ref but the configured one; `session.ts:51-62` purges before refreshing and filters the purged names out of the client's read. The batch-growing `write` (`session.ts:45-49`) is what keeps `proxy.ts:30`'s response rebuild from dropping the purge. C1.log:584-618 covers both directions, own cookies kept, and an unrelated `sb-` cookie kept; live-checks.md:11-12 shows it on a running server.

**C3 — boundaries pass with `@supabase/*` owned by auth. Met.** `boundaries.js:86` pins `"@supabase/*": "auth"`, `:76` gives auth its edges. C3.log is exit 0 with no output, which is what the passing lint emits; the substantive proof is C4.log:73-83 and :121-125 — `@supabase/*` refused in `db` and in `apps/web`, allowed in `auth`.

**C4 — the full chain passes with the service-role key among the seeded server-only variables, no sentinel in a client chunk. Met.** `apps/web/env.ts:106` declares `SUPABASE_SERVICE_ROLE_KEY` server-side and `:130-134` picks it per tier, so the plan built from `.env.example` and `turbo.json` (C4.log:163) seeds it; C4.log:1338 reports 18 server-only values, none in 27 browser-facing files. The `NEXT_PUBLIC_` hole is closed separately at `env.ts:117-122` via `publicKeyProblem` (`config.ts:46-52`), proven live at live-checks.md:42-44. The `warn STK-12 … C4 (last run exited 1)` at C4.log:24 is self-referential — `verify` ran before this log was recorded as C4's own evidence.

**C5 — a staging sign-in on localhost redirects back to localhost. Correctly deferred, not met.** `redirect.ts:25-33` pins the origin to env.ts's site URL and `safeNextPath` (`:15-22`) refuses `//host`, `/\host` and control characters; C1.log:562-575 unit-tests it; live-checks.md:23-25 probes it against a synthetic project. The hosted round trip is untested, which is exactly what `--verdict deferred` and C5-operator.md record. No overclaim.

No criterion in this contract covers accessibility, so the findings below rest on my own standard, as canon.md:81 assigns.

## Findings

### Blocking

None. The task completes end to end keyboard-only and screen-reader-only: landing on `/auth/sign-in`, reaching the field, submitting, reading the `sent` state, and following the link through `/auth/callback` to `/`. Every control has an accessible name, focus is visible at 3.30:1 (light) and 3.99:1 (dark), there is no trap and no unreachable control. `lang="en"` is set (`layout.tsx:27`), the document title is "Sign in · <brand>" (`page.tsx:16`), there is one `h1`, `autoComplete="email"` satisfies 1.3.5, the label is visible and `for`-bound (`email-field.tsx:5-8`), `text-base` avoids iOS zoom-on-focus, nothing is carried by color alone, and the only motion is `transition-colors`, which needs no reduced-motion equivalent.

### Should-fix

**F1 · The email field's boundary is 1.26:1 light and 1.31:1 dark. SC 1.4.11 Non-text Contrast (AA) failure.**
`apps/web/app/auth/sign-in/_components/email-field.tsx:15` styles the input `border border-border bg-background`. Because the fill equals the page fill, the 1px `--border` is the *only* thing identifying where the control is. `--border` is `--neutral-200` light (`preset.css:50`) → 1.26:1 against `--background`; `--neutral-800` dark (`preset.css:66`) → 1.31:1. AA asks 3:1, and the author-styled exception does not apply.
*Reproduce:* open `/auth/sign-in`, measure the unfocused input's border against the page background, light and dark.
*Why it is not caught:* `tooling/contrast-audit.ts:28-73` has no `--border` pair — it applies the 3:1 bar to `--ring` only (C4.log:33-50, 18 pairs). That is deliberate: STK-19's as-built:23 states `[ASSUMPTION] … Borders are decorative and are not audited.` True for a separator; false for a control's boundary, which is what STK-12 just built.
*Smallest fix:* add one token for the control-boundary role (e.g. `--input-border` at L≈0.669 light, which is the lightness 3:1 requires) used only by form controls, leave `--border` decorative, and add that one pair to `PAIRS`. Do **not** darken `--border` itself to reach 3:1 — it would take `--neutral-200` from L 0.922 to ≈0.669 and turn every hairline in the system heavy.
*Cost to the person:* slows a task. A low-vision user finds the field via the visible "Email" label and reveals it on focus, so completion is not blocked — but this is the one finding on this ticket that an external AA audit would write up.

**F2 · Pressing the button drops focus and announces nothing while the link sends. SC 4.1.3 Status Messages (AA).**
`send-link-button.tsx:12` sets `disabled={busy}` from `useFormStatus`. The moment the form submits, the focused button is disabled, so the browser moves focus to `<body>`; the label change to "Sending link" (`:13`) sits on that same disabled element with no live region anywhere on the page. Between the press and the redirect a screen-reader user hears silence, and a keyboard user has lost their place.
*Reproduce:* VoiceOver or NVDA on `/auth/sign-in`, tab to the button, press Enter, listen until the next page loads.
*Smallest fix:* render an always-present `<p role="status" className="sr-only">` inside the client leaf whose text becomes "Sending your sign-in link" while `busy`. It must exist before the text changes — a node created only when pending announces unreliably. Keep `disabled` for the double-submit guard.
*Cost:* slows a task. Owner: STK-24 already opens this file.

**F3 · The `invalid` message is not tied to the field, and the typed address is lost.**
`page.tsx:69-73` renders the message as a sibling `<p>`; the input at `page.tsx:74` / `email-field.tsx:8-16` carries no `aria-invalid`, no `aria-describedby` and no value. The state is genuinely reachable — `type="email"` accepts `ana@example`, which `z.email()` in `actions.ts:20` rejects — so a real user does land here, on a fresh document, with an empty field they must retype.
*Reproduce:* enter `ana@example`, submit, land on `?state=invalid`; tab to the field and listen (hears "Email, edit text, required" — no error); observe the field is empty.
*Smallest fix:* `aria-invalid="true"` plus `aria-describedby` pointing at the message's `id` when `state === "invalid"`, and carry the submitted address back through the action's own state. Keep it out of the URL and the log — `actions.ts:3-5` and live-checks.md:17 are an answer to warden, and a query-string fix would regress it.
*Cost:* slows a task, and the retype falls hardest on voice-control, switch and motor-impaired users. 3.3.1 and 3.3.3 are satisfied (the error is identified in text and suggests a correction), so this is usability past the floor, not a conformance failure.

### Consider

**F4 · The two live-region roles on this page do not announce.** `page.tsx:54` (`role="status"`) and `:70` (`role="alert"`) are only ever reached by a full navigation from `redirect()`, so the region is present at document load rather than changing afterward: NVDA and JAWS usually speak `role="alert"` at load, VoiceOver usually does not. No harm — both messages sit in reading order directly under the `h1`, where the user lands. Worth knowing so nobody treats these as covering F2; they do not.

**F5 · `disabled` and `aria-disabled` on the same button.** `send-link-button.tsx:12`. `aria-disabled` is for a control you keep focusable; on a natively disabled button it adds nothing. Harmless, but it reads as if the focusable-disabled pattern were implemented when it is not.

**F6 · Three as-built claims do not match the evidence.** `as-built.md:22` says the sign-in states were "All six … checked in the browser," but live-checks.md:27-36 lists default, `loading`, `sent`, `error`, `expired` and no-project — `invalid`, the one state with an unlabeled error (F3), was not among them. `as-built.md:40` quotes 106 and 105 tests where C1.log:5 and C2.log:5 record 113 and 112; the explanation given (one `yarn test` at one head, interleaved cache replay, `# skipped 0` throughout) is borne out by the logs, but the numbers are stale. Evidence integrity is vigil's and assay's beat, not mine — routed, not ruled.

**F7 · This page was never seen in dark theme or at 390 and 1440.** live-checks.md:38 declares it and names the reason (no capture harness until P-C, per `.claude/rules/testing.md`). The dark-theme risk is largely covered by the token audit's nine dark pairs, with the exception that is F1. Accepted as declared; it becomes a real gap the moment the harness lands.

## Acceptance criteria to inherit

For the next ticket that touches a form, so this is specified rather than retrofitted: every control's boundary measures 3:1 against its adjacent surface in both themes; every validation message is bound to its control by `aria-describedby` with `aria-invalid` set; every asynchronous action has an always-present `role="status"` node that names what is happening; no submitted value is lost on a validation round trip.

**Summary:** every criterion the contract names is met or honestly deferred, and the one page this ticket ships is completable by keyboard and by screen reader. One AA conformance failure (F1) and two usability gaps (F2, F3) ship as should-fixes with named owners and smallest fixes — none of them turns anyone away at the door.

VERDICT: PASS
