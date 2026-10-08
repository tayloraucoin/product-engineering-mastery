# Review — assay on LAB-7

> Written by `yarn review:run assay LAB-7`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 0f69c949b10bb9a0019f1af7b0a2a6cac0efe67ae5a8db3db5be47c6f831efa2
- as_built_sha256: d607d446bcfad5fb68f538c9850cdd90d5398d405e11dc28e158f080d7ba9737
- head: 0026476d95103d8260efd115fd305d694c8d4d17
- runner: claude 2.1.232 (Claude Code) (agent assay; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T21:11:38Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run assay LAB-7`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are assay, reviewing ticket LAB-7 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C1.log (sha256 b1ae961d1cf4)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C2.log (sha256 b1ae961d1cf4)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C3.log (sha256 b1ae961d1cf4)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C4.log (sha256 b1ae961d1cf4)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C5.log (sha256 b1ae961d1cf4)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C6.log (sha256 b1ae961d1cf4)
   - C7 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/gate-notice.png (sha256 988dec6ee5ac)
   - C8 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/gate-throttled.png (sha256 55a130377342)
   - C9 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C9-steps.md (sha256 61c01a98ea32)
   - C10 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/gate-states.png (sha256 5564d7515dd4)
   - C11 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C11.log (sha256 b1ae961d1cf4)
   - C12 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C12-served-diff.md (sha256 1a33aed80d39)
   - C13 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/C13-look-over.md (sha256 fbff39ba1c86)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): apps/web/app/experimental/layout.tsx, apps/web/lib/sandbox/gate.test.ts, apps/web/lib/sandbox/gate.ts, apps/web/lib/sandbox/state.ts, apps/web/lib/sandbox/validators.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/experimental/gate.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Coverage

Read-only pass (Read/Grep/Glob). Scored from: contract, `results.json`, `as-built.md`, all 13 evidence files, the five changed files, the four unchanged surface files the ticket's work binds (`page.tsx`, `actions.ts`, `_components/gate/*`), `ux/experimental/gate.md`, and `canon-rubric.md`.

- **Seen:** the full `yarn workspace web test` TAP log (exit 0, 201 tests / 29 suites — `results.json`'s `tests: 230` is tests + suites, not a mismatch); `gate-notice.png` (1440, light, guest); `gate-throttled.png` (390); `gate-states.png` (10 keys × 390/834/1440 × light/dark = 60 cells).
- **UNVERIFIED:** focus-visible at any viewport (no capture in evidence; `@pem/ui` `field.tsx` carries `focus-visible`, which is not the same as a seen pixel) — C-R10. Reduced-motion is asserted in `as-built.md:18` and not visible in evidence; the surface has no motion, so cost is nil. The 60-cell sheet is legible for layout, state presence and copy; it is **not** legible for type size or AA contrast per cell, so C-R04 and C-R09 are UNVERIFIED below the two full-size captures.
- I ran nothing and changed nothing.

## Criterion by criterion

| ID | Met? | Evidence and code |
| --- | --- | --- |
| C1 | Yes | Log suite 62 (3/3). `gate.ts:120-155` returns `gate`/200 for all four refusals; props keys asserted exactly `path, prefilledEmail, accountEmail, state` (`gate.test.ts:106-109`). `page.tsx:72-81` renders in place — no redirect, no rewrite; `notFound()` only on the team + unknown slug. |
| C2 | Yes | Log suite 63 (6/6). `gate.ts:258-269` validates before the throttle; one `WRONG_CODE` for all four refusals, four tries on one key (`gate.test.ts:249`); a non-normalising code is a try with no lookup (`:252-261`); empty/malformed reach neither throttle nor store (`:263-296`); throw → `server-error` (`:298-307`). "Both fields kept" is carried by the controlled inputs (`gate-form.tsx:77-78`) and the `gate-server-error` cell, not by a test. |
| C3 | Yes | Log suite 64. `redirect` to `/experimental/<slug>`, no `?r=` (`gate.ts:283`); trim + lower-case happens in `access-check.ts:153`, asserted at `gate.test.ts:353-356`; closed experiment granted (`:359-369`). |
| C4 | Yes | Log suite 65. `page.tsx:57-63` reads `?r=` only when there is no account email; `gate.ts:142` nulls the prefill; identity is `{ userId }` (`gate.ts:272-275`). Sign-out scope is `local` by default (`packages/auth/src/session.ts:116`), so "this device only" holds. |
| C5 | Yes | Log suite 66. |
| C6 | Yes | Log suite 67. Ten gate keys registered `anyone`, every other key `team` (`state.ts:25-52`); non-gate key reads as absent for anyone else and is filtered again by `isGateStateKey` (`page.tsx:53`). |
| C7 | Yes (capture) | `gate-notice.png`: "What we keep" + four points, in order, verbatim, as plain text, above "Your email". Address is `hello@example.com` from `@pem/brand` (`gate.ts:33`). |
| C8 | Yes (capture) | `gate-throttled.png`: "Too many tries. You can try again after 2:18 PM.", both fields filled, button disabled, no countdown (A-19 clean). |
| C9 | Correctly deferred | Builder's wiring claims check out: `aria-invalid`/`aria-describedby` (`gate-form.tsx:169-170, 195-198`), `FieldError` is `role="alert"` (`packages/ui/.../field.tsx:204`), `<time dateTime>` on the lock (`:207`). Screen-reader pass is the operator's. |
| C10 | Yes (capture) | All ten keys at all three widths, both themes, in `gate-states.png`. |
| C11 | Yes | Log suite 68; `layout.tsx:9-11`. Backed independently by the served `X-Robots-Tag` (log suite 79; `C12-served-diff.md:5`). |
| C12 | Partly — see finding 3 | The narrative is sound and matches `page.tsx`/`gate.tsx` (nothing registry-derived reaches the Gate), but it was taken at a commit other than the recorded head and the diff output was not kept. |
| C13 | Correctly deferred | `C13-look-over.md` names what to look at. |

Non-negotiables: all seven hold in code. No Blocking.

## Findings

**1. Should-fix — the throttle sentence renders with no time until hydration, and stays that way without JS.** `gate-form.tsx:102` formats the instant only when `mounted`, so the first paint is "Too many tries. You can try again after ." A server-rendered throttled response (progressive-enhancement POST, or any pre-hydration paint of `?state=gate-throttled`) shows the broken sentence. gate.md States: the throttled state "shows a fixed time"; C-R05 (a label that isn't the outcome). *Smallest fix:* render a server-side fallback inside the `<time>` (the instant formatted in UTC or the request zone) and replace it after mount, instead of passing `""`.

**2. Should-fix — three capture criteria are recorded PASS with no reproducible procedure.** `results.json` C7/C8/C10 are PASS; `as-built.md:18` says the 60 shots came from ad-hoc headless Chrome over the DevTools protocol. No capture harness exists in the repo (no Playwright config, no `tooling/` capture script), and `.claude/rules/testing.md` says every `capture` criterion is UNVERIFIED until one does; C-R01 forbids passing what cannot be shown again at the next head. The images are real and I scored them — the gap is re-runnability. *Smallest fix:* add the exact capture command to `as-built.md` (one line), so the next head can reproduce the same 60 cells.

**3. Should-fix — C12's proof was taken on different code than the record points at.** `C12-served-diff.md:3` names commit `8bdf3d9`; the run record's head is `69dca23` (`results.json:152`). This is the only HTTP-level proof of the ticket's central non-negotiable (one face, in place, 200, both slugs), and the stripped diff itself was not kept — only prose about it. *Smallest fix:* re-run the two `curl`s at the recorded head and paste the stripped `diff` output into the evidence file.

**4. Should-fix — the `?state=` fixtures are wired to the live actions.** `gate.tsx:38-40` binds the real `enterGate` and `signOutHere` on every face, fixtures included. Pressing "Open the review" on `?state=gate-empty` spends a real throttle try (and `?state=gate-signed-in`'s "Sign out" really ends the session), though the contract's non-negotiable and gate.md call these "synthetic fixtures". A state tour can lock the gate it is touring. *Smallest fix:* when `props.state !== null`, pass no-op actions to `GateForm`.

**5. Consider — C11 and two other criteria are proven by regex over source text.** `gate.test.ts:596-602` (and `:129-139`, `:309-326`) assert file contents, not observable behaviour, which `.claude/rules/testing.md` rules out; an equivalent spelling (`robots: "noindex, nofollow"`) would be correct and fail. JSX cannot be imported under `node --test`, so the scan is defensible — but the test name should say it scans source, and the behavioural backstop is the served header (suite 79, C12). *Smallest fix:* rename the test to say it is a source scan.

## Cut (polish, not acted on)

- `gate-notice.png`: the demo root layout's `FloatingThemeToggle` (`app/layout.tsx:32`) sits over the gate and is the first tab stop before "Your email", against gate.md's "no nav". Not this ticket's path — route to the demo root-layout owner.
- The disabled button's label contrast in `gate-throttled.png` is low; disabled controls are exempt from AA, so C-R09 is not engaged.
- C2's "both fields kept" clause rests on a capture cell, not a test.

## Rubric gaps (for the design director)

- `canon-rubric.md` has no line for **evidence provenance** — a capture or manual check recorded at a head other than the one it was taken on. C-R01 covers "uncaptured", not "captured elsewhere". Findings 2 and 3 are scored under C-R01 by extension; the line does not discriminate today.
- No line covers a **fixture with real side effects** (finding 4). C-P08 requires every state be reachable by `?state=`; nothing says reaching it must cost nothing.

Round 1 of 3. No Blocking finding; the four Should-fixes are all one-change fixes and none of them falsifies a non-negotiable.

VERDICT: PASS
