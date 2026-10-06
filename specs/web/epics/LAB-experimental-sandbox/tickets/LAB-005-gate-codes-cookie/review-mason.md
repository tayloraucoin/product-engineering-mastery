# Review — mason on LAB-5

> Written by `yarn review:run mason LAB-5`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ac8c9770eee88ab3e18ed75f15f5ab6ff8054df532ee48803007d976028ea4b6
- as_built_sha256: 333cd8197f7c9a79dd90f222ffa68f4e18ac042d546b3d1d65d2e7c7bda22bd8
- head: 0026476d95103d8260efd115fd305d694c8d4d17
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T21:11:38Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-5`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-5 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — LAB-5 gate-codes-cookie (mason, fresh context)

Read: contract, `results.json`, `as-built.md`, the eight evidence logs, every shipped module under `apps/web/lib/sandbox/`, `apps/web/env.ts`, `next.config.ts`, `turbo.json`, `.env.example`, `apps/web/proxy.ts`, `packages/db/src/sandbox/gate.ts`, and `technical/gate.md`.

Evidence integrity: C1–C7 share one run of `yarn workspace web test` (exit 0, head `69dca23`); the log's `# tests 201` plus `# suites 29` is the 230 `results.json` records, so the count is consistent. C8's log is the `check-client-bundle` run at the same head.

### Criteria

**C1 — forgiving normalisation; everything else a wrong code. Met.** `code.ts:30-38` upper-cases only ASCII `[a-z]`, drops outside `0-9A-Z`, then maps `O→0`, `I|L→1`, then requires 16 symbols of `CODE_ALPHABET` (which excludes `U`). `code.test.ts:76-162` runs 500 seeded cases per property for forgiving spellings, one-symbol changes, 15/17 symbols and `U`, plus an exhaustive 10×16 sweep of non-ASCII stand-ins (`ı`, `ß`, `ſ`, Kelvin sign, full-width, Greek/Cyrillic look-alikes) and a fixed SHA-256 vector. The drop-before-upper-case ordering is what makes the `ß`/`ı` cases fail rather than invent symbols.

**C2 — generateCode. Met.** `code.ts:51-66` packs 10 `randomBytes` into 16 symbols, grouped by `formatCode`. `code.test.ts:165-182` asserts the four-group shape over 100 draws and 1,000 distinct codes each normalising to itself.

**C3 — cookie verification. Met.** `cookie.ts:57-82`: length cap before split, exactly five parts, constant-time MAC compare (`secret.ts:56-60`) before any field is trusted, then version, access-id shape, slug equality, seconds shape, future-issue and ≥30-day rejection. `cookie.test.ts:49-137` covers every single-character substitution at every position, foreign slug both directions, 30d/30d+/365d, future `issuedAt`, each missing and each emptied part, `v2`/`v0`/`V1`/empty version with a valid MAC, and MACs forged under the `email-link` and `throttle` labels.

**C4 — no database read before the cookie verifies. Met.** `access-check.ts:68-97` orders `getTeamMember()` → registry → cookie → `checkAccess`. `access.test.ts:84-174` drives 300 random values, 300 tampered values, 100 multi-cookie rounds, a foreign-slug cookie, an unknown slug holding a valid cookie for itself, expiry and no-secret — all against `checkAccess: NO_DATABASE`, which throws if reached. The unknown-slug branch (`access-check.ts:82`) returns before the cookie is even read, so the registry, not the database, answers for a slug that does not exist.

**C5 — who resolveViewer says is asking. Met.** `access.test.ts:177-296` proves team for developer and admin on open and closed slugs with a `readAccessCookies` that throws, `not-found` for the team on an unknown slug, gate when `checkAccess` returns null, `ended` on `closedOn !== null`, `reviewer` on open, and that a signed-in reviewer's user id reaches `checkAccess`. Closed is read from the registry config, which LAB-4 already refuses to accept with a future date.

**C6 — link token fills the email only. Met.** `link.ts:43-54` truncates to 128 bits under label `email-link`; `readLinkEmailWith:84-92` verifies the token and the registry before the database. `link.test.ts:37-146` covers every single-character tamper (asserting zero database calls each time), a cookie MAC and a whole cookie presented as tokens, foreign-slug and erased access, unknown slug with no database call, and `resolveViewerWith` handed only `?r=` returning `{kind:"gate"}` against a throwing stub. Origin comes from the passed site URL (`access.ts:118` passes `env.NEXT_PUBLIC_SITE_URL`), never the request host.

**C7 — noindex headers and secret length. Met, with a declared limit.** `robots.ts:17-20` holds exactly the two sources; `next.config.ts:52-54` returns it; `robots.test.ts:27-39` matches the import and the return and counts exactly one `headers` *definition* (the comment on `next.config.ts:51` no longer trips it). No robots file exists and `proxy.ts` mentions nothing of the sandbox — confirmed by reading `apps/web/proxy.ts` directly. `secret-check.ts:10-14` counts UTF-8 bytes and `env.ts:208-215` refines with it. The one gap — whether `withSentryConfig` overrides `headers` on the composed export — is named in as-built "Not verified" and handed to LAB-7's served check; the installed Sentry config sets no `headers`.

**C8 — secrets out of the bundle, registries agreed. Met.** `check-client-bundle` plants every non-`NEXT_PUBLIC_` name from both `.env.example` and `turbo.json`; `SANDBOX_SECRET`, `_LOCAL` and `_STAGING` are in both (`turbo.json:57-59`, `.env.example:155-157`) and in neither exclusion list, so they are among the 37 sentinels. The same run's `refuseDrift` (`tooling/check-client-bundle.ts:109-114`) is what proves the second clause; exit 0 covers both.

### Non-negotiables

All seven hold. Worth naming three I checked specifically: no new database function was added — `access-check.ts` and `access.ts` reach only LAB-3's gate group (`findLiveReviewerByCodeHash`, `createAccess`, `checkAccess`, `findAccessEmail`, all exported from `packages/db/src/sandbox/index.ts`); every thrown message is a fixed string that never echoes a code, cookie or token, and `grep` finds no `console`, logger or error-capture call anywhere in `apps/web/lib/sandbox`; and with the secret unset `isUsableSecret` fails every verify while `setAccessCookie` and `linkUrl` throw, with no fallback constant anywhere.

As-built claims I checked against code: the resolve order, the throwing cookie reader in the team tests, the registry-before-database order in `readLinkEmailWith`, the multi-cookie read added after warden's finding, and the `headers()` definition count all match the source.

### Findings

**Consider — `apps/web/lib/sandbox/access-check.ts:84-89`.** `.map(...).find(...)` verifies every presented `sandbox_access` value before selecting; a lazy `for` loop would stop at the first that verifies. Behaviour is identical (first in jar order wins), but a request carrying many cookies pays an HMAC for each. Each value is capped at 256 characters, so the amplification is small — raising it only because the loop is the cheaper shape and this is the hot path on every sandbox request.

**Consider — contract `non_negotiables[2]` ("Secure when deployed") vs `apps/web/lib/sandbox/access.ts:75`.** The shipped flag is `productionRuntime`, a strict superset of `deployed`. I accept the change: it is strictly stronger, it is recorded in `as-built.md:22`, and the cited surface was amended with attribution (`technical/gate.md:38`). The contract line is now the only statement left saying otherwise; a reader starting there will find a mismatch the as-built resolves.

**Consider — `as-built.md:14` vs `as-built.md:22`.** The first Deviations paragraph still says `accessCookieOptions(slug, deployed)` "takes `deployed` as an argument"; the later bullet and the code say `secure`, passed `productionRuntime` (`cookie.ts:90`). Second bullet supersedes the first, but the stale sentence should go.

**Consider — `results.json:123-137`.** `review:warden` is recorded at head `7f7a16f5`, before the fix commit the C1–C8 runs were taken at (`69dca23`); the fixes were warden's and mine. `yarn check-specs --strict` will flag it before merge, so this is a note on sequencing, not a defect: warden's re-run is the remaining step.

Nothing Blocking. No convention drift found in placement, naming, exports, boundaries or the env seam; the pure-core/request-binding split follows `team-check.ts`/`team.ts` and the billing ledger precedent the contract pointed at, and the two undeclared modules (`access-check.ts`, `secret-check.ts`) are both forced by real constraints and declared.

VERDICT: PASS
