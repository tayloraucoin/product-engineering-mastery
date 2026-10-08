# Review — warden on LAB-7

> Written by `yarn review:run warden LAB-7`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 0f69c949b10bb9a0019f1af7b0a2a6cac0efe67ae5a8db3db5be47c6f831efa2
- as_built_sha256: d607d446bcfad5fb68f538c9850cdd90d5398d405e11dc28e158f080d7ba9737
- head: 0026476d95103d8260efd115fd305d694c8d4d17
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T21:17:55Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-7`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-7 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Warden review — LAB-7 gate-page

Read in order: contract, `results.json`, as-built, all evidence (including the three captures), the five changed files plus `page.tsx`, `actions.ts` and `_components/gate/**` (planned paths that exist on the branch), and `ux/experimental/gate.md`. Supporting reads: `access.ts`, `access-check.ts`, `cookie.ts`, `link.ts`, `throttle.ts`, `@pem/auth/session`, `@pem/ui` field, `@pem/brand`.

## Criteria

| ID | Met | What the code and evidence show |
| --- | --- | --- |
| C1 | Yes | `access-check.ts:68-98` routes real, unknown, revoked-cookie and closed-without-access all to `GATE`; `gate.ts:120-155` maps that to `{kind:"gate", status:200}` with exactly four props. Test asserts all four props equal apart from `path`, and that the key set is exactly `accountEmail, path, prefilledEmail, state`. Team-on-unknown → `not-found` (`access-check.ts:75`). `page.tsx:33` pins fixed `metadata`, no `generateMetadata`. Log: `ok 62`. |
| C2 | Yes | One `WRONG_CODE` string for wrong, revoked, unknown-slug and closed-non-live (`gate.ts:288`), four tries on one counter. Non-normalising code counts a try and is never looked up (`calls.lookups` 0). Empty/malformed fields return their own Words and reach neither throttle nor store (`calls.throttle` 0, `calls.marked` 0). Throwing store → `server-error` (`gate.ts:289-290`), asserted to carry neither field. Log: `ok 63`. |
| C3 | Yes | `gate.ts:281-283`: cookie set, then `redirect(gatePath(slug))` — no query, so no `?r=`. `access-check.ts:151-154` trims and lower-cases; test asserts `"  Ana@Example.COM "` → `ana@example.com`. Live code on `closed-2026` granted identically. Log: `ok 64`. |
| C4 | Yes | `gate.ts:142` drops `prefilledEmail` whenever `accountEmail` is set; `gate.ts:258-275` parses `{code}` only and builds `{userId}`, so a posted `email` field is unread. `page.tsx:59` and `actions.ts:52-53` use the same `auth && !teamMemberOf(auth) && auth.email` test, so the two faces cannot disagree. Log: `ok 65`. |
| C5 | Yes | `access-check.ts:72-81` resolves the team before any cookie read; both roles, open and closed → `experiment`. Log: `ok 66`. |
| C6 | Yes | All ten keys `anyone` in `state.ts:26-35`; the test also asserts every non-`gate-` key is `team`, so the registry cannot drift. `gate.ts:121-133` ignores `result` entirely when a state is set, which is why the fixture is byte-identical on a real and an unknown slug. `page.tsx:53` filters through `isGateStateKey`, so a team key cannot produce a gate face. Log: `ok 67`. |
| C7 | Yes | `gate-notice.png`: "What we keep" with all four points, in order, verbatim, as plain text, above "Your email". `gate-notice.tsx:11-22` renders them as `<p>` siblings before the form — DOM order matches visual order, nothing behind a link. Words pinned verbatim by test (`ok 69`). |
| C8 | Yes | `gate-throttled.png`: "Too many tries. You can try again after 2:18 PM.", both fields filled, button disabled, no countdown. `gate-form.tsx:106-113` is a single `setTimeout`, never a tick. Enforcement is server-side (`throttle.ts:203-204`), so the disabled button is cosmetic, not the control. |
| C9 | Deferred, correctly | `--verdict deferred`, listed in `specs/_status.md:90`. The builder's ARIA claims check out: `FieldError` is `role="alert"` (`packages/ui/src/primitives/layout/field/field.tsx:204`), `aria-invalid`/`aria-describedby` wired at `gate-form.tsx:169-170, 195-198`, hint always in the description, lock carried on a `<time>`. Nothing focused on load except the prefilled-email case (`gate.tsx:43`), as gate.md requires. |
| C10 | Yes | `gate-states.png`: ten labelled rows, six shots each (390/834/1440 × light/dark). All ten keys present. |
| C11 | Yes | `layout.tsx:9-11`, plus the `X-Robots-Tag: noindex, nofollow` header from `next.config.ts` via `lib/sandbox/robots.ts` — two layers, the header one the page cannot forget. Log: `ok 68`. |
| C12 | Yes | `C12-served-diff.md`: both slugs 200 with the noindex header; after slug normalisation the only diffs are Next's per-request id and `$ACTION_KEY`, which is a function of the bound slug and so of the path alone. The diff covers only the no-cookie case, but `Gate` is a pure function of its four props (`gate.tsx:22-56` reads nothing but props, Words and the app icon), and C1 proves the props equal for all four faces — so the HTML argument carries to revoked and closed. |
| C13 | Deferred, correctly | `--verdict deferred`, `specs/_status.md:91`, with a five-item look-over that names the right things. |

Non-negotiables all hold, including the two I was asked to focus on. The one face survives the adversarial reading: same status, same component, same props, same error sentence, same throttle counters (global, never per slug — `throttle.ts:14-16`), same served HTML. Three things are better than the contract required and worth naming: revocation is re-checked at the database on every request rather than trusted from the cookie, so a revoked reviewer falls back to the gate with a still-valid cookie; the 30-day promise in the notice matches `ACCESS_COOKIE_MAX_AGE_SECONDS` exactly (`cookie.ts:24`), fixed at issue and never refreshed; and `gate.ts` reaches `access-check.ts` and `throttle.ts` through type-only imports (`gate.ts:15-16`), so the `"use client"` leaf pulls no server code or secret into the bundle.

## Findings

**Should-fix — the erasure-address acceptance loses its revisit trigger when this ticket closes.**
`specs/.../LAB-007-gate-page/as-built.md:39` and the contract's `out_of_scope` record a sound acceptance: `contact.email` stays `hello@example.com` until the operator sets a real, monitored address, "before any real code is issued". That trigger has no home outside this ticket. LAB-15 is the ticket that issues the first real codes, and its `out_of_scope` (`specs/.../LAB-015-admin-access-codes/contract.md:46-49`) says nothing about the address; the Operator checks table in `specs/_status.md:83-93` carries LAB-7's C9 and C13 but not this. So the notice can ship to a real reviewer telling them to email an address nobody reads — a privacy promise with no recipient, in the one sentence that tells someone how to get their data deleted. The acceptance itself is fine; the fix is to give it an owner that survives: a line in LAB-15's contract or a row in Operator checks. Not blocking — no real code exists yet, and the builder flagged it to the operator in `C13-look-over.md:6`.

**Consider — enter-action timing still separates a real slug from an unknown one.**
`access-check.ts:143-146` returns null for an unknown slug before `findLiveReviewerByCodeHash`, so a real slug costs one extra indexed query per try. Everything else on both paths is identical. This is deliberate and already asserted in LAB-6's suite ("only the real slug is looked up", log line 1477), so it is a recorded property, not a LAB-7 regression — I note it only because it is the last remaining channel against S12b's "learns nothing, not even that the experiment exists", and it belongs on the epic's gap list next to gap 3 rather than nowhere.

**Consider — `?r=<junk>` on a tier with no `DATABASE_URL` turns the gate into a 500.**
`page.tsx:62` evaluates `sandboxDb()` eagerly as an argument, and `access.ts:49-52` throws when `DATABASE_URL` is unset — before `readLinkEmailWith` can reject the token. The same request without `?r=` renders the gate fine. It is not an existence leak (both slugs behave alike) and it needs a misconfigured tier, but it contradicts `link.ts:80-82`'s promise that a bad token is "ignored silently". One line: pass the db lazily, or move the call inside the branch that needs it.

**Consider — the throttled sentence renders with an empty time before hydration.**
`gate-form.tsx:102` formats the lock only once `mounted`, so the server render of `?state=gate-throttled` reads "Too many tries. You can try again after ." Real locks arrive from the action after mount, so this is the fixture path plus a brief flash — but it is also what a reader without JS sees, and what a screen reader may announce first on that state.

**Consider — `?r=` tokens outlive the page they fill.**
`link.ts:63-65` puts a replayable handle to a reviewer's email in a URL, so it persists in browser history and in the platform's own request logs. The gate does the right things within its reach: the token grants no access (asserted, log line 1022), it is stripped on success by redirecting to the bare path, the page loads no third-party resource that could carry it in a `Referer`, and Sentry's `beforeSend` drops query strings. The residual — history on a shared device, and platform access logs the team can read — is the link design's, and the place to weigh it is LAB-20, before confirmation emails start sending those URLs.

**Consider — evidence commit.** `C12-served-diff.md:3` says the responses were served from 8bdf3d9; `results.json` records C12 at head 69dca23. The intervening commit is the as-built doc, so the served HTML should be unchanged, but the two-commit gap is worth a glance when `check-specs --strict` runs before merge.

No finding here reaches Blocking: nothing discloses a reviewer's identity or participation to someone who should not have it, nothing lets an unauthorised visitor past the gate, and the one face holds under every probe I could put to it from the files.

VERDICT: PASS
