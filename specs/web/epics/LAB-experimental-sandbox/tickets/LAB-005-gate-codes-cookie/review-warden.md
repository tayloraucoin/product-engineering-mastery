# Review — warden on LAB-5

> Written by `yarn review:run warden LAB-5`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ac8c9770eee88ab3e18ed75f15f5ab6ff8054df532ee48803007d976028ea4b6
- as_built_sha256: bdc896cc2728ab708947dca61b8ef61f4fc56850dba0a2aa47dafbf5c47d788a
- head: 7f7a16f5e3d3d5b0946208062bf993c375a28d17
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T20:47:10Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-5`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-5 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — LAB-5 gate-codes-cookie (warden)

Read: contract, `results.json`, as-built, all eight evidence logs, the twenty-one changed planned paths, and `technical/gate.md`. I also read `packages/db/src/sandbox/gate.ts` (unchanged by this ticket) to check the scoping the gate order depends on, and the installed Next docs to settle whether `:path*` covers a bare path.

### Criterion by criterion

**C1 — met.** `normaliseCode` (`code.ts:30-38`) is gate.md:26 line for line: ASCII-only upper-casing, drop outside `0-9A-Z`, `O→0`, `I`/`L→1`, then exactly 16 Crockford symbols. The ASCII-first ordering is the right call and the reason is correct — `toUpperCase` would mint an `I` from `ı` and `SS` from `ß`. Evidence covers all of the statement: 500 seeded cases each for forgiving spellings, one-symbol changes, 15/17 symbols, `U` in both cases, and ten non-ASCII stand-ins, plus every stand-in at every one of 16 positions against a fixed code, non-string inputs, and a fixed SHA-256 vector (`code.test.ts:76-163`). Seed is in each test name.

**C2 — met.** 10 bytes → exactly 16 symbols with no leftover bits (`code.ts:51-66`); shape asserted 100×, 1,000 codes distinct and each round-tripping through `normaliseCode`/`formatCode`.

**C3 — met.** Value, labels and flags match gate.md's Cookies row exactly (`cookie.ts:38-97`). Every clause of the statement has a test: under-30-days verification, a one-character change at every position × 5 replacements, foreign slug in both directions, age ≥ 30 days, future `issuedAt` with a valid MAC, missing and emptied parts, `v2`/`v0`/`V1`/empty version with a valid MAC, MACs under `email-link` and `throttle`. Two details I checked and liked: the MAC compares before any field parsing, so there is no early-exit timing on version or slug; and the MAC compares as base64url *text* (`secret.ts:51-60`) rather than decoded bytes, which closes the last-symbol malleability the as-built names.

**C4 — met, and structurally rather than just empirically.** The order in `access-check.ts:68-91` is `getTeamMember()` → registry → cookie → `checkAccess`, and `checkAccess` is a dep whose database binding is built lazily inside the lambda (`access.ts:66`), so there is no way to reach the database earlier. 300 random and 300 tampered values, a valid foreign-slug cookie, unknown slugs with valid cookies, and an expired cookie, all against a `checkAccess` that throws and is not caught. This was my first focus area; it holds.

**C5 — met.** Team before cookie is proven with a cookie reader that throws, for both roles and for an open and a closed experiment; team-on-unknown-slug is `not-found`; `checkAccess` null is the gate; closed with live access is `ended`; open is `reviewer`; the exact `checkAccess` input including the signed-in `userId` is asserted. S12b holds — unknown slug, bad cookie and dead access all exit as `{kind:"gate"}`.

**C6 — met.** The token is slug-free by design, and the slug binding is enforced at the data layer (`gate.ts:132-152` joins through the reviewer's slug and `revokedAt`), which is the strongest layer available for it. Tampering at every position × 5 replacements yields null with zero database calls; a cookie MAC and a whole cookie are rejected; an unknown slug short-circuits before the database (`link.ts:90`). The "`?r=` grants nothing" clause is proven by construction: `ResolveViewerDeps` has no query input, so no token can reach the access decision. Origin comes from `env.NEXT_PUBLIC_SITE_URL` (`access.ts:117`), never the request host.

**C7 — met as written.** The array, its two sources and only those, the `headers()` return, the absent robots files, `proxy.ts`'s silence, the byte-counted 32-byte floor with no value in the message, and env.ts's refinement and tiered pick are all asserted. I confirmed the one thing the test cannot: `headers.md:104` in the installed Next states `/blog/:slug*` matches `/blog`, so `/experimental` and `/admin` themselves are covered, not only their children. See Should-fix 1 on how this is proven.

**C8 — met.** `check-client-bundle` plants names drawn from both `.env.example` and `turbo.json` minus `NEXT_PUBLIC_` and the five unplantable enum/platform names (`tooling/check-client-bundle.ts:88-107`), so all three `SANDBOX_SECRET` forms are planted; the generated sentinels run ~44-50 bytes, comfortably past env.ts's 32-byte refinement, so the build exercises the real path. 37 values, none in 24 browser-facing files. Both files list the same three names (`turbo.json:57-59`, `.env.example:149-157`). `secret-check.ts` carries no secret and imports nothing from node, so env.ts's reach into the client bundle stays clean.

The as-built's claims check out against the code; the two undeclared-in-`planned_paths` modules (`access-check.ts`, `secret-check.ts`) fall inside `devs_call`'s "split between pure cores and request-bound wrappers" and are declared anyway. No `.skip`/`.only`, nothing in `apps/web/lib/sandbox` logs anything, and every thrown error is a fixed string that never echoes input. (`results.json`'s `tests: 141` vs the log's `# tests 126` is the harness counting the 15 suites too — not a mismatch.)

### Findings

**Should-fix — C7 proves the noindex control by reading source text, not the config the build uses.** `robots.test.ts:27-38` regexes `next.config.ts` and counts `headers()` occurrences. The effective export is composed by `withSentryConfig` (`next.config.ts:63`), so the assertion can keep passing while the config Next actually receives changes. Adversary: nobody today — a future wrapper version or config edit. Path: a composing wrapper adds or overrides `headers()` → `/experimental` and `/admin` responses lose `X-Robots-Tag` → a slug that leaks in a mail log gets indexed → a client's private experiment becomes searchable, which is the S12 promise this header exists to keep. I checked the installed `@sentry/nextjs`: its only `headers` is the source-map upload plugin's HTTP headers, so this is proof durability, not a live defect. Fix: import the default export and assert `await config.headers()` deep-equals `SANDBOX_NOINDEX_HEADERS`.

**Should-fix — `apps/web/lib/sandbox/access.ts` has no test of any kind, and it is the file that runs in production.** Every C4/C5 proof binds `resolveViewerWith` by hand, so the request wiring at `access.ts:56-70` — `readAccessCookie: () => jar.get(ACCESS_COOKIE)?.value`, `secret: sandboxSecret()`, `now: new Date()`, the slug passed through — is unproven. The deviation note explains *why* `node --test` cannot load it, which I accept; it does not name the residual. A wrong slug or a stale clock here would defeat the order the pure core proves so carefully, and nothing would catch it. Route it: have LAB-7's page test, which must run in a Next context anyway, assert the wrapper's order once, and record the residual in as-built.

**Consider — `access.ts:62` takes one `sandbox_access` cookie.** Declared as an assumption (as-built:19), and per-slug paths do make a collision unlikely. But a cookie planted at a broader path (sibling subdomain, or any tier where `deployed` is false and `Secure` is off) can shadow the real one, and the reviewer is then shown the gate instead of their experiment — a legitimate-user lockout recoverable only by re-entering the code, which is the kind of friction that lands on the person least able to absorb it. `jar.getAll(ACCESS_COOKIE)` and accepting the first value that verifies costs one line and removes the failure mode. The integrity half of this — a reviewer who can plant a cookie causing another visitor's feedback to land under their own reviewer row — is bounded by the fact that they must already hold a live code for that slug, and `__Host-` is unavailable for the reason gate.md:38 records, so the data-layer scoping is what holds here.

**Consider — the link token carries no issue time (`link.ts:36-40`), so it verifies until the secret rotates or the access dies.** This is spec-conformant: gate.md:58 defines the token as `<accessId>.<mac>` and nothing more. The impact is genuinely small — the only thing an old link discloses is the email address already sitting in the message that carried it, and `findAccessEmail` re-checks slug and revocation on every use — so I would record it as an accepted residual under D-LAB-38 rather than change the format.

**Consider — the C1–C7 evidence file was captured at `cc074b3`, and `9a0cd4d` (LAB-8) landed before the as-built commit.** The only files C7 scans are `next.config.ts` and `env.ts`; I verified both still satisfy the assertions at the current tree (one `headers()`, the three names, the refinement intact), and nothing else LAB-8 touched is read by a LAB-5 criterion, so the proofs stand. `yarn check-specs --strict` is the gate for this before a merge; noting it so that run is not the first look.

No finding blocks. The order the gate's safety rests on is enforced where it cannot be forgotten, revocation and replacement re-check on every request, the cookie holds no personal data, and nothing logs a code, a cookie or a token.

VERDICT: PASS
