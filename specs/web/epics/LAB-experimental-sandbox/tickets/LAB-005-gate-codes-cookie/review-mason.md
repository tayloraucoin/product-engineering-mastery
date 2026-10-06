# Review — mason on LAB-5

> Written by `yarn review:run mason LAB-5`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ac8c9770eee88ab3e18ed75f15f5ab6ff8054df532ee48803007d976028ea4b6
- as_built_sha256: bdc896cc2728ab708947dca61b8ef61f4fc56850dba0a2aa47dafbf5c47d788a
- head: 7f7a16f5e3d3d5b0946208062bf993c375a28d17
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T20:39:40Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-5`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-5 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C1.log (sha256 b76ccf01cab6)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C2.log (sha256 b76ccf01cab6)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C3.log (sha256 b76ccf01cab6)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C4.log (sha256 b76ccf01cab6)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C5.log (sha256 b76ccf01cab6)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C6.log (sha256 b76ccf01cab6)
   - C7 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C7.log (sha256 b76ccf01cab6)
   - C8 check: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-005-gate-codes-cookie/evidence/C8.log (sha256 dc01cbbb7e80)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/env.ts, apps/web/lib/sandbox/access.test.ts, apps/web/lib/sandbox/access.ts, apps/web/lib/sandbox/admin-gate.test.ts, apps/web/lib/sandbox/admin-nav.test.ts, apps/web/lib/sandbox/admin-routes.test.ts, apps/web/lib/sandbox/code.test.ts, apps/web/lib/sandbox/code.ts, apps/web/lib/sandbox/cookie.test.ts, apps/web/lib/sandbox/cookie.ts, apps/web/lib/sandbox/link.test.ts, apps/web/lib/sandbox/link.ts, apps/web/lib/sandbox/registry.test.ts, apps/web/lib/sandbox/robots.test.ts, apps/web/lib/sandbox/robots.ts, apps/web/lib/sandbox/secret.ts, apps/web/lib/sandbox/state.test.ts, apps/web/lib/sandbox/team.test.ts, apps/web/next.config.ts, turbo.json.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/gate.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

Verified the whole chain. Here is the review.

## Evidence integrity

C1–C7 share one log (one command, `yarn workspace web test`, exit 0, sha `b76ccf01cab6`); C8 is `dc01cbbb7e80`. Both hashes match what the run records claim. The log's TAP footer reports 126 tests across 15 suites, which reconciles with `results.json`'s `tests: 141` (126 + 15 suite entries).

Proof head is `cc074b3`; HEAD is now `7f7a16f`, with LAB-8's shell (`9a0cd4d`) in between. I re-read every file the criteria assert against at current HEAD — `next.config.ts` still has exactly one `headers()` returning `SANDBOX_NOINDEX_HEADERS`, no robots file exists anywhere (`apps/web/public/` does not exist), `proxy.ts` has no sandbox mention, `robots.ts` holds exactly the two sources — so nothing the evidence proved has since drifted. LAB-8's additions under `apps/web/lib/sandbox/*.test.ts` (`admin-gate`, `admin-nav`, `admin-routes`) fall inside LAB-5's planned-path glob but are another ticket's files; they reopen nothing. `yarn check-specs --strict` still owns the formal staleness gate before merge.

## Criteria

**C1 — PASS.** `code.ts:30-38` upper-cases only `[a-z]`, drops everything outside `0-9A-Z`, then maps `O`→`0` and `[IL]`→`1`, then requires exactly 16 alphabet symbols. Because `CODE_ALPHABET` (`code.ts:16`) excludes I, L, O and U, normalisation is the identity on real codes and no two valid codes can collapse — the forgiveness costs no hash space. Log 482-531: 500 generated cases each for forgiving spellings, one-symbol changes, 15/17 symbols, `U` in either case, and non-ASCII stand-ins, plus the exhaustive 10×16 stand-in sweep (`code.test.ts:138-147`) and a fixed SHA-256 vector (`code.test.ts:154-162`). The gotcha the contract named is handled in the right order: `ß`/`ı` are dropped, never upper-cased into invented symbols.

**C2 — PASS.** `generateCode` (`code.ts:51-66`) draws 10 bytes = exactly 80 bits = 16 symbols with no leftover bits; `formatCode` groups four by four. Log 537-550: shape over 100 draws, 1,000 distinct, each round-trips through `normaliseCode`/`formatCode`.

**C3 — PASS.** `cookie.ts` is gate.md's Cookies row exactly: `v1.<accessId>.<slug>.<issuedAt seconds>.<mac>`, label `access-v1` (`secret.ts:19`), `Path=/experimental/<slug>`, HttpOnly, Lax, `maxAge` 2,592,000 fixed at issue, never refreshed on use. MAC is checked before any field is trusted, over the prefix rejoined from the same five parts, so there is no canonicalisation gap; `matchesMac` (`secret.ts:56-60`) is length-guarded `timingSafeEqual` on the base64url text, and the decision not to decode (`secret.ts:46-50`) is correct — decoding would let two spellings of one MAC verify. Log 556-641 covers all fourteen cases the criterion names, including every single-character position (`cookie.test.ts:49-57`) and a forged valid-MAC `v2`/`V1`/empty version.

**C4 — PASS, and this is the one that mattered.** `access-check.ts:68-91` holds the order: `getTeamMember()`, registry, cookie, and only then `checkAccess`. The binding in `access.ts:66` constructs the client *inside* the closure (`(input) => checkAccess(sandboxDb(), input)`), so no database handle is even opened on a gate path. Log 390-427: 300 random and 300 tampered cookie values, a valid foreign-slug cookie, an unknown slug holding a valid cookie for itself, a missing/expired cookie and an absent secret — all against a `checkAccess` that throws when called (`access.test.ts:34-36`). The leak the contract feared (a slug lookup "for safety") is absent.

**C5 — PASS.** Log 433-476. Team viewer without touching the cookie (proven with a cookie reader that throws, `access.test.ts:164-166`), 404 to the team on an unknown slug, gate when `checkAccess` returns null, `ended` for live access on `closedOn !== null`, `reviewer` on open, and the signed-in reviewer's user id asserted in the recorded call args (`access.test.ts:256-258`). `grantAccessWith` lower-cases and trims the email before `createAccess`, which `@pem/db/sandbox` independently refuses un-normalised (`gate.ts:74-75`).

**C6 — PASS.** `link.ts` token is `<accessId>.<mac>` under label `email-link`, truncated to 16 bytes; `readLinkEmailWith:90` checks the registry before the database. Log 647-702: every tampered position with the DB stub asserted uncalled, a cookie MAC and a whole cookie refused by domain separation, foreign-slug and erased access null, unknown slug null without a query, and — the important one — `resolveViewerWith` with only `?r=` still returns `{kind:"gate"}` (`link.test.ts:115-136`). `resolveViewerWith` never reads `r` at all, so the token cannot grant access by construction, not merely by test.

**C7 — PASS.** `robots.ts:17-20` is exactly the two sources; `next.config.ts:52-54` returns it and nothing else sets headers there; no robots file exists (re-confirmed at HEAD); `proxy.ts` is untouched. `sandboxSecretProblem` counts UTF-8 bytes, not characters (`secret-check.ts:11`, tested with 16×`é` = 32 bytes passing and 15 failing), and `env.ts:208-215` refines with it. Log 868-899.

**C8 — PASS.** `yarn check-client-bundle` plants names drawn from both `.env.example` and `turbo.json` and fails on drift (`tooling/check-client-bundle.ts:91-113`); 37 planted values, none in 24 browser-facing files. I counted the plantable non-`NEXT_PUBLIC_` names across both files and it lands exactly on 37, with `SANDBOX_SECRET`, `_LOCAL` and `_STAGING` among them. Both files list all three (`turbo.json:57-59`, `.env.example:149-157`).

Non-negotiables all hold: no logging statement exists anywhere under `apps/web/lib/sandbox`; no code or secret in a URL; three distinct MAC labels; no fallback secret (unset ⇒ `verifyAccessCookie` null, `setAccessCookie`/`linkUrl` throw); no new dependency (only `node:crypto`, `next/headers`, `@pem/*`); no new query — the four gate-group signatures in `packages/db/src/sandbox/gate.ts` match the call sites exactly; every thrown message is a fixed string. The `access-check.ts`/`secret-check.ts` splits sit outside `planned_paths` but are squarely inside `devs_call` ("the split between pure cores and request-bound wrappers"), have sound reasons, follow LAB-2's `team.ts`/`team-check.ts` precedent, and are recorded in as-built. Scope held: no throttle, no gate page, no `/admin` issuance.

## Findings

**Should-fix — `apps/web/lib/sandbox/cookie.ts:94` (with `apps/web/lib/sandbox/access.ts:74`): the access cookie's `Secure` flag reads `deployed`, so a production build served off Vercel sends a live credential over plaintext HTTP.** `deployed` is `isDeployed(VERCEL_ENV)` (`env.ts:96`), false for `next start` on any other host. `env.ts:98-103` already draws exactly this distinction and names the right reader: "A guard that must hold off Vercel reads this, not `deployed`." This is a note against the design, not the build — the contract and gate.md both say "Secure when deployed" and the builder implemented that to the letter, and Vercel is today's only deployment target, so there is no live exposure. But this is the one-way-door ticket for cookie shape, and the fix is one argument: pass `productionRuntime`. It needs a line in gate.md's Cookies row and the ticket record, not a silent edit.

**Consider — `apps/web/lib/sandbox/access.test.ts:56` and `code.test.ts:17`: the generated-input seed is drawn fresh each run, so C1 and C4 are not reproducible from the log alone.** The contract asked for exactly this ("a seeded loop over `crypto.randomBytes`, with the seed printed on failure"), and the seed is recoverable (`3596424818`, `1321087416` in the log's test names), so the evidence stands. Worth weighing a committed seed plus one random run for a Q3 auth path: you get a replayable proof and keep the drift-finding.

**Consider — `apps/web/lib/sandbox/robots.test.ts:37`: `assert.equal(source.match(/headers\(\)/g)?.length, 1)` makes C7 fail on a comment that merely mentions `headers()` in `next.config.ts`.** The intent (nothing else sets headers there) is right; keying on the `async headers() { return SANDBOX_NOINDEX_HEADERS; }` match alone, already asserted two lines above, would survive prose.

No Blocking findings. The order the gate's safety rests on is correct, and it is correct structurally — the database handle is unreachable before the cookie verifies, not merely unreached — and the generated-input proofs exercise it with a stub that throws.

VERDICT: PASS
