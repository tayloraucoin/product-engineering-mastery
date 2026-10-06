# Review — warden on LAB-5

> Written by `yarn review:run warden LAB-5`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ac8c9770eee88ab3e18ed75f15f5ab6ff8054df532ee48803007d976028ea4b6
- as_built_sha256: 333cd8197f7c9a79dd90f222ffa68f4e18ac042d546b3d1d65d2e7c7bda22bd8
- head: 0026476d95103d8260efd115fd305d694c8d4d17
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T21:17:09Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-5`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-5 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C1.log (sha256 2bab1e30131b)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C2.log (sha256 2bab1e30131b)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C3.log (sha256 2bab1e30131b)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C4.log (sha256 2bab1e30131b)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C5.log (sha256 2bab1e30131b)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C6.log (sha256 2bab1e30131b)
   - C7 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C7.log (sha256 2bab1e30131b)
   - C8 check: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C8.log (sha256 1369128c16e9)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/env.ts, apps/web/lib/sandbox/access.test.ts, apps/web/lib/sandbox/access.ts, apps/web/lib/sandbox/admin-gate.test.ts, apps/web/lib/sandbox/admin-nav.test.ts, apps/web/lib/sandbox/admin-routes.test.ts, apps/web/lib/sandbox/code.test.ts, apps/web/lib/sandbox/code.ts, apps/web/lib/sandbox/cookie.test.ts, apps/web/lib/sandbox/cookie.ts, apps/web/lib/sandbox/gate.test.ts, apps/web/lib/sandbox/link.test.ts, apps/web/lib/sandbox/link.ts, apps/web/lib/sandbox/people.test.ts, apps/web/lib/sandbox/registry.test.ts, apps/web/lib/sandbox/robots.test.ts, apps/web/lib/sandbox/robots.ts, apps/web/lib/sandbox/secret.ts, apps/web/lib/sandbox/state.test.ts, apps/web/lib/sandbox/team.test.ts, apps/web/lib/sandbox/throttle.test.ts, apps/web/next.config.ts, turbo.json.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/gate.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — LAB-5 gate-codes-cookie (warden)

Read: contract, `results.json`, as-built, all eight evidence logs, the changed planned paths, `technical/gate.md`, plus `packages/db/src/sandbox/gate.ts` (LAB-3's, unchanged here) to check the scoping the gate order leans on, `app/experimental/_experiments/registry.ts` for the slug bound, and LAB-7's `evidence/C12-served-diff.md` because this ticket's C7 non-negotiable is proved at the HTTP layer there. This is a re-review: the as-built records four changes made after the first mason/warden pass, and I checked each against the code rather than the note.

### Criterion by criterion

**C1 — met.** `normaliseCode` (`apps/web/lib/sandbox/code.ts:30-38`) is D-LAB-31 line for line: ASCII-only upper-casing, drop outside `0-9A-Z`, `O→0`, `I`/`L→1`, then exactly 16 Crockford symbols, so `U` stays a wrong code. The ASCII-first ordering is the right call for the stated reason — `toUpperCase` mints an `I` from `ı` and `SS` from `ß`. Evidence covers every clause of the statement: 500 seeded cases each for forgiving spellings, one-symbol changes, 15/17 symbols and `U` in both cases, plus ten non-ASCII stand-ins generated and then exhaustively at all 16 positions of a fixed code, non-string inputs, and a fixed SHA-256 vector (`code.test.ts:76-163`). Seed in each test name.

**C2 — met, and stronger than the statement.** 10 bytes consumed 5 bits at a time gives exactly 16 symbols with no remainder and no modulo bias (`code.ts:51-66`), so the 80 bits the no-salt decision rests on are really there. Shape asserted 100×; 1,000 codes distinct and each round-tripping `normaliseCode`/`formatCode`.

**C3 — met.** Value, label and flags match gate.md's Cookies row (`cookie.ts:38-97`). Every failure in the statement has a test: under-30-days verification, a one-character change at every position × 5 replacements, foreign slug both directions, age ≥ 30 days, future `issuedAt` with a valid MAC, missing and emptied parts, `v2`/`v0`/`V1`/empty with a valid MAC, MACs under `email-link` and `throttle`, and a short/absent secret. Two details worth naming: the MAC compares before any field parsing, so there is no early-exit oracle on version or slug; and it compares as base64url *text* in `timingSafeEqual` (`secret.ts:51-60`), which closes the last-symbol malleability a decode-then-compare would open. The post-review change checks out — `accessCookieOptions(slug, secure)` (`cookie.ts:90`) takes the flag and `access.ts:75` passes `productionRuntime`, not `deployed`, and `technical/gate.md:38` now says so. `MAX_COOKIE_LENGTH` 256 (`cookie.ts:27`) is comfortably above the real maximum of 95 + `SLUG_MAX_LENGTH` 48 = 143, so the pre-split bound can never refuse a cookie this app signs.

**C4 — met structurally, not just empirically.** The order in `access-check.ts:68-97` is `getTeamMember()` → registry → cookie → `checkAccess`, and the database binding is built lazily inside the lambda (`access.ts:67`), so no earlier path to it exists. 300 random and 300 tampered values, three bad values at once, a valid foreign-slug cookie, unknown slugs with valid cookies for them, an expired cookie and an absent secret — all against a `checkAccess` that throws and is never caught (`access.test.ts:84-175`). `grantAccessWith` short-circuits on unknown slug and unnormalisable code before any query (`access-check.ts:143-145`). This was my first focus area; it holds.

**C5 — met.** Team-before-cookie is proven with a cookie reader that throws, for both roles on an open and a closed experiment; team on an unknown slug is `not-found`; `checkAccess` null is the gate; closed with live access is `ended`; open is `reviewer`; the exact `checkAccess` input including the signed-in `userId` is asserted (`access.test.ts:177-296`). S12b holds: unknown slug, bad cookie and dead access all exit as `{kind:"gate"}`, and LAB-7's C12 shows the two served bodies differ only in a per-request id and an action key that is a function of the path.

**C6 — met.** The token is slug-free by design and the slug binding is enforced at the data layer (`packages/db/src/sandbox/gate.ts:135-155` joins through the reviewer's slug and `revokedAt`) — the strongest layer available for it. Tampering at every position × 5 replacements gives null with zero database calls; a cookie MAC and a whole cookie are refused; an unknown slug short-circuits before the database (`link.ts:90`). "Grants nothing" is true by construction: `ResolveViewerDeps` has no query input, so no token can reach the access decision. Origin is `env.NEXT_PUBLIC_SITE_URL` (`access.ts:118`), never the request host.

**C7 — met, and now backed below the source scan.** The array and its two sources only, the `headers()` return, the absent robots files, `proxy.ts`'s silence, the byte-counted 32-byte floor whose message never holds the value, and env.ts's refinement and tiered pick are all asserted (`robots.test.ts:13-77`); the occurrence count now counts definitions, so a comment cannot fail it. My predecessor's Should-fix — that this proves the control by reading source text while `withSentryConfig` composes the real export — is discharged by evidence rather than by a code change: LAB-7's C12 shows both `/experimental` paths and `/admin` served with `X-Robots-Tag: noindex, nofollow` and `/` without it. The as-built records that routing (`as-built.md:29`). No robots or sitemap file exists anywhere in the repo.

**C8 — met.** 37 planted server-only values, the three `SANDBOX_SECRET` forms among them, none in 50 browser-facing files. `turbo.json:57-59` and `.env.example:149-157` list the same three names, and `.env.example` ships them empty. `secret-check.ts` holds no secret and imports nothing from node, which is what keeps env.ts's reach into `instrumentation-client.ts` clean — the deviation is sound.

The as-built's claims check out against the code. `access-check.ts` and `secret-check.ts` sit outside `planned_paths` but inside `devs_call`'s "split between pure cores and request-bound wrappers" and are declared. No `.skip`/`.only`; nothing under `apps/web/lib/sandbox` logs anything; every thrown error is a fixed string that names a variable, never input. `results.json`'s `tests: 230` against the log's `# tests 201` is the harness counting the 29 suites too, not a mismatch. Evidence was captured at `69dca23`; the only commit since is `0026476`, which touches specs alone, so nothing a LAB-5 criterion reads has moved.

Three residuals are already on the record and I am not refiling them: the link token's missing issue time (`as-built.md:31`, accepted under D-LAB-38), `access.ts`'s lack of a unit test (`as-built.md:30`, routed to and exercised by LAB-7 C12), and the config-level noindex proof (`as-built.md:29`). On the last one the durability half stands — nothing in CI would catch a future wrapper that overrides `headers()` — but it is recorded with its reasoning, so it is the operator's accepted risk, not a new finding.

### Findings

**Consider — a reviewer cannot end their own access on a shared device.** `ACCESS_COOKIE_MAX_AGE_SECONDS` is 30 days fixed from issue (`cookie.ts:24`) and nothing anywhere deletes `sandbox_access`: `setAccessCookie` (`access.ts:83-95`) is the only writer, and the gate's "Sign out" (`gate.ts:41`) is the auth sign-out, which touches a signed-in user's session, not this cookie. Adversary: a housemate, colleague or ex-partner on the device the reviewer opened the experiment on. Path: the reviewer enters their code on a shared laptop → the cookie lives 30 days at `/experimental/<slug>` → anyone using that browser opens a private client experiment and can post feedback that lands under the reviewer's own row. Impact is bounded and real: a client's unreleased design seen by someone who should not see it, and opinions attributed to a person who did not write them. This is spec-sanctioned — S10 sets 30 days and D-LAB-32 sets the shape — so it is not a defect against this contract, and the team's revoke/replace (which bumps `code_version` and bounces old devices) is the lever that exists today. The smallest control is a "forget this device" action on the experiment page that clears the cookie at its path; it costs the legitimate user nothing because it is opt-in. Route it to the gate-page or /admin owner (LAB-15 holds revocation), and record the decision either way so the 30 days is a choice on the record rather than a silence.

**Consider — `verifyAccessCookie` allows no clock-skew grace.** `ageMs < 0` refuses any `issuedAt` in the future (`cookie.ts:80`). Within one deployment this cannot fire, because `issuedAt` is floored to whole seconds, but across instances with skewed clocks a freshly issued cookie would be refused and the reviewer sent back to the gate to re-enter a code. The contract and C3 both name a future `issuedAt` as a must-fail, so softening it needs a spec change, not a code change; I note it only because the cost of that failure lands on the reviewer, not the attacker.

No finding blocks. The order the gate's safety rests on is enforced where a later refactor cannot forget it, the two existence leaks that matter — unknown slug and dead access — are indistinguishable from the gate at the HTTP layer, revocation and code replacement re-check on every request, the cookie carries no personal data, and no code, cookie or token is logged on any path.

VERDICT: PASS
