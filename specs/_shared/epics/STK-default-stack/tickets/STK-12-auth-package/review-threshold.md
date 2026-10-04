# Review — threshold on STK-12

> Written by `yarn review:run threshold STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: b54069cd7147ddd773f5e5c76af846365c8398f6
- runner: claude 2.1.232 (Claude Code) (role docs/roles/product-design/threshold-accessibility-auditor.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:13:38Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run threshold STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are threshold, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Accessibility review — STK-12 auth-package

**Reviewer:** Threshold · **Scope:** the UI this ticket ships (`apps/web/app/auth/**`), plus the criteria as written. Keyboard and screen-reader passes run by reading the DOM the server emits; contrast computed from `packages/config/tailwind/preset.css` with the same luminance model `tooling/contrast-audit.ts` uses (my numbers reproduce its 3.30:1 and 3.99:1 at C4.log:36, :45 exactly).

`[ASSUMPTION: no conformance target is stated in the repo, so I audit to WCAG 2.2 AA and say so. No product design layer exists yet, so canon.md alone governs, and canon.md:81 delegates contrast and color-alone to "the auditor's tests".]`
`[ASSUMPTION: no AT data supplied; judged keyboard-only, VoiceOver and NVDA, light and dark, plus forced-colors.]`

## Criteria

**C1 — the seam returns user and role from `getUser`, and refuses a session whose user cannot be fetched. Met.** `packages/auth/src/context.ts:101` calls `client.auth.getUser()` and nothing else; a throw returns `null` (`:102-103`), and so does `result.error || !user` (`:106`). `roleOf` (`:65-70`) reads `app_metadata.role` against `APP_ROLES` only; `getSession()` appears nowhere in the resolver. C1.log:591 and :597 are the pair that matters — a forged admin cookie refused on a 401, then the same cookie passing with the role from the server's answer.

**C2 — `updateSession` purges cookies for a different project ref. Met.** `cookies.ts:40` matches `sb-<ref>-auth-token` plus chunk and verifier suffixes; `foreignSessionCookies` (`:52-67`) emits deletions for every ref but the configured one, or all of them when `url` is null. `session.ts:63-65` purges before refreshing and `:71` filters the purged names out of the client's read; the batch-growing `write` (`:57-61`) is what keeps `proxy.ts`'s response rebuild from dropping the purge. C1.log:682-730 covers both directions, the no-project switch, own cookies kept and an unrelated `sb-` cookie kept; live-checks.md:11-12 and :50 show it on a running server.

**C3 — boundaries pass with `@supabase/*` owned by auth. Met.** `boundaries.js:86` pins `"@supabase/*": "auth"`; `:76` gives auth its edges. C3.log is exit 0 with no output, which is what the passing lint emits; the substantive proof is C4.log:69-88 — `@supabase/*` refused in `db` and in `apps/web`, `@pem/auth` refused in `db` and `email`.

**C4 — the full chain passes with the service-role key among the seeded server-only variables, no sentinel in a client chunk. Met.** `apps/web/env.ts:54-57` reads the three service-role forms and `:106`/`:130-134` declare and pick it server-side, so the plan built from `.env.example` and `turbo.json` seeds it (C4.log:159-160). The `NEXT_PUBLIC_` hole is closed separately at `env.ts:113-122` through `publicKeyProblem` (`config.ts:46-52`), proven live at live-checks.md:42-44. The `C4 (last run exited 1)` at C4.log:25 is self-referential: `verify` ran before this log was recorded as C4's own evidence.

**C5 — a staging sign-in on localhost redirects back to localhost. Correctly deferred, not met.** `redirect.ts:29-32` pins the origin to env.ts's site URL and re-checks the resolved origin; `safeNextPath` (`:15-22`) refuses `//host`, `/\host` and control characters. Unit-tested at C1.log:622-673, probed against a synthetic project at live-checks.md:23-25. The hosted round trip is untested, which is exactly what `--verdict deferred` and C5-operator.md record. No overclaim.

No criterion in this contract covers accessibility, so the findings below rest on my own standard, as canon.md:81 assigns.

**Carried findings now fixed, verified in code:** F2 — `send-link-button.tsx:20-22` renders an always-present `role="status"` whose text becomes "Sending your sign-in link" while busy, and `page.tsx:78` no longer disables the field in `loading` (live-checks.md:54). F3's binding — `email-field.tsx:17-18` sets `aria-invalid` and `aria-describedby` from `errorId`, wired at `page.tsx:76` to the message's `id` (`:72`), confirmed rendered at live-checks.md:53. F5 — the duplicate `aria-disabled` is gone (`send-link-button.tsx:17`).

## Findings

### Blocking

None. The task completes end to end keyboard-only and screen-reader-only: landing on `/auth/sign-in`, reaching the field, submitting, hearing the pending status, reading the `sent` state, and following the link through `/auth/callback` to `/`. Every control has an accessible name, `lang="en"` is set (`layout.tsx:27`), the title resolves to "Sign in · <brand>" (`page.tsx:16` + `layout.tsx:17-20`), there is one `h1`, the label is visible and `for`-bound (`email-field.tsx:8-10`), `autoComplete="email"` satisfies 1.3.5, `text-base` avoids iOS zoom-on-focus, both targets are 36px (≥ 24×24, SC 2.5.8), nothing is carried by color alone, and the only motion is `transition-colors`, which needs no reduced-motion equivalent.

### Should-fix

**F1 (carried) · The email field's boundary is 1.26:1 light and 1.31:1 dark. SC 1.4.11 Non-text Contrast (AA) failure.**
`apps/web/app/auth/sign-in/_components/email-field.tsx:19` styles the input `border border-border bg-background`. The fill equals the page fill, so the 1px `--border` is the only thing identifying where the control is: `--neutral-200` light (`preset.css:66`, `:42`) → 1.26:1 against `--background`; `--neutral-800` dark (`:111`, `:48`) → 1.31:1. On hover it gets worse — `hover:bg-accent` is `--neutral-100` (`:72`), closer to the border than the page is.
*Reproduce:* open `/auth/sign-in`, measure the unfocused input's border against the page fill, light and dark.
*Why no check catches it:* `tooling/contrast-audit.ts` has no `--border` pair — all 18 passing pairs apply the 3:1 bar to `--ring` only (C4.log:36-48). True for a separator; false for a control's boundary, which is what this ticket just built.
*Disposition — correct.* STK-25 is drafted, opens `preset.css`, `contrast-audit.ts` and this exact file, and carries "the control-boundary pair at 3:1 or more in light and dark" as C1. The smallest fix is a new role token, not darkening `--border`, which its non-negotiables say in those words.
*Cost:* slows a task. A low-vision user finds the field by its visible label and reveals it on focus, so nothing is blocked — but this is the one finding here an external AA audit would write up.

**F8 (new) · In forced-colors mode the field has no focus indicator at all. SC 2.4.7 Focus Visible; canon C-P07 "Focus is always visible" (`canon.md:100`).**
`email-field.tsx:19` pairs `focus-visible:ring-2 focus-visible:ring-ring` with `focus-visible:outline-none`. Tailwind v4 (`apps/web/package.json:35`) changed `outline-none` to `outline-style: none` — v3's transparent-outline behavior is now `outline-hidden`. Windows High Contrast and forced-colors strip `box-shadow`, which is what `ring` compiles to, and the author's `outline-style: none` is not overridden. The ring is the only indicator, so focus becomes invisible on the one text field in the flow.
*Reproduce:* Windows High Contrast (or Chrome DevTools, Rendering, `forced-colors: active`) on `/auth/sign-in`; tab to the field and look for the ring.
*Smallest fix:* `focus-visible:outline-hidden` in place of `outline-none`, or a real `focus-visible:outline-2 focus-visible:outline-offset-2`. One word, but it should land in the shared pattern, not one file.
*Owner:* the token and UI layer, not this ticket alone — the same pair is in `packages/ui/src/primitives/control/button/button.variants.ts:8` and in `theme-toggle`, `docs-nav` and `search`, all predating STK-12, and no `forced-colors:` variant exists anywhere in the repo. STK-25 is the natural home: it already opens `email-field.tsx` and the audit.
*Cost:* slows a task, for forced-colors users only. In default color modes the ring measures 3.30:1 light and 3.99:1 dark and is fine.

### Consider

**F4 (carried) · The page's two load-time regions do not announce as changes.** `page.tsx:56` (`role="status"`, the `sent` state) and `:72` (`role="alert"`, the messages) are only ever reached by a full navigation from `redirect()`, so the region exists at document load rather than changing afterward: NVDA and JAWS usually speak `role="alert"` at load, VoiceOver usually does not. No harm — both sit in reading order directly under the `h1`, where the user lands. Noted so nobody reads them as covering the pending announcement; `send-link-button.tsx:20` is what covers that, correctly.

**F3-remainder (carried) · The typed address is still lost on an `invalid` round trip.** `email-field.tsx:11-20` has no `value` or `defaultValue`, and `actions.ts:30` redirects to a fresh document. The state is genuinely reachable — `type="email"` accepts `ana@example`, which `z.email()` (`actions.ts:20`) rejects — so a real user retypes. Deferred to STK-24, which exists and reopens this form; keeping the address out of the URL and the log (`actions.ts:4-5`, live-checks.md:17) is the constraint that makes the fix non-trivial. Cost falls hardest on voice-control, switch and motor-impaired users. 3.3.1 and 3.3.3 are satisfied, so this is usability past the floor, not a conformance failure.

**F9 (new) · `next` is dropped on every validation round trip.** `page.tsx:77` carries `next` in a hidden input, but `actions.ts:30` and `:45` redirect to `/auth/sign-in?state=invalid` and `?state=error` without it. A user who arrives at `?next=/records/5`, typos the address, then succeeds lands at `/` rather than where they were going. Same cohort and same owner as the finding above; worth fixing in the same pass, since both are the cost of the fresh document.

**F10 (new, out of scope) · The fixed theme toggle can obscure a focused control.** `apps/web/app/layout.tsx:30` renders `<header className="fixed top-4 right-4">`. SC 2.4.11 Focus Not Obscured (Minimum) is new in 2.2 and applies to exactly this shape. Low risk on this page — the form is vertically centered and short — but STK-12 is the first ticket to put a focusable form under that header. `layout.tsx` is not in this ticket's planned paths (STK-6 owns it), so this is named, not charged here.

**F11 · One as-built line no longer matches its evidence.** `as-built.md:46` explains that "C1 and C2 can record test totals one apart"; both logs now record 114 (C1.log:5, C2.log:5) and `results.json` agrees, so the note describes a superseded pair of runs. Harmless, and evidence integrity is assay's and vigil's beat — routed, not ruled. The declared gaps at live-checks.md:38 (dark theme, 390 and 1440, reduced motion not captured, no harness until P-C) remain honestly declared; they become real gaps the day the harness lands.

## Acceptance criteria to inherit

For the next ticket that touches a form, so this is specified rather than retrofitted: every control's boundary measures 3:1 against its adjacent surface in both themes, at rest and on hover; every focus indicator survives `forced-colors: active`; every validation message is bound to its control by `aria-describedby` with `aria-invalid` set; every asynchronous action has an always-present `role="status"` node that names what is happening; no submitted value and no `next` is lost on a validation round trip.

**Summary:** every criterion the contract names is met or honestly deferred, and the page this ticket ships is completable by keyboard and by screen reader. Two should-fixes stand — one carried AA conformance failure (F1) with a drafted owner whose criterion is the fix, and one new forced-colors focus gap (F8) belonging to the shared pattern. Neither turns anyone away at the door.

VERDICT: PASS
