# Review — warden on LAB-6

> Written by `yarn review:run warden LAB-6`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 314f5b48d3b5f37154f54a4d12571f1cb2159afe59fdbd06132716cbf02d8ed0
- as_built_sha256: 9bb6f33df6d8a0e57a8219eeb328ea62f02d7ffbc36e791d73ec8a64f88ee051
- head: 0026476d95103d8260efd115fd305d694c8d4d17
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T21:11:38Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-6`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-6 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C1.log (sha256 c74d52182463)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C2.log (sha256 c74d52182463)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C3.log (sha256 75bd96a6df28)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C4.log (sha256 75bd96a6df28)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C5.log (sha256 75bd96a6df28)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C6.log (sha256 75bd96a6df28)
   - C7 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C7-steps.md (sha256 d6aa29157cbd)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): apps/web/lib/sandbox/throttle.test.ts, apps/web/lib/sandbox/throttle.ts, packages/db/src/sandbox/gate.ts, packages/db/src/sandbox/index.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/roles.test.ts, packages/db/test/sandbox/schema.test.ts, packages/db/test/sandbox/throttle.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/gate.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — network key. Met.** `networkKeyOf` (`apps/web/lib/sandbox/throttle.ts:109-133`) keeps IPv4 whole and cuts IPv6 to four hextets joined in hex with `::/64`. I traced `expandIPv6` (`throttle.ts:70-98`) against the cases that matter for a key: the label is deterministic per /64 and injective across /64s (four fixed components, `:`-joined, hex can't contain the separator), so compressed, expanded, upper-case and embedded-IPv4 spellings of one /64 collapse to one key and a neighbouring /64 cannot. The `::ffff:` fold to IPv4 is detected on the expanded hextets, not on text (`throttle.ts:120-128`). One detail done right: the zone id is stripped *after* `isIP` (`throttle.ts:118`), which is necessary because Node's `isIP` accepts a `%zone` suffix. Untrusted, missing or malformed gives null. The test pins the derivation to `sandboxMac(secret, "throttle", "b:<id>"/"n:<address>")` (`throttle.test.ts:112-121`), so a changed label or input shape fails — that is the assertion that makes this criterion load-bearing rather than descriptive. Eight subtests `ok` (C1.log:1409-1459).

**C2 — a lock refuses even a correct code; every slug alike. Met.** `withGateThrottle` (`throttle.ts:200-206`) reads both keys' locks and returns before `attempt()`. The test drives LAB-5's real `grantAccessWith` (`access-check.ts:139`) over a stub database and asserts `lookups` is empty on a locked key with the live code (`throttle.test.ts:253-264`). Slug parity is asserted three ways — wrong code, never-issued well-formed code, and a lock reached across five slugs blocking a sixth — comparing results, rows and call sequences, not just the verdict (`throttle.test.ts:268-336`). A locked network key refuses a fresh browser (`throttle.test.ts:338-356`). Six subtests `ok` (C1.log:1464-1502).

**C3 — counts, locks, window on the local database. Met.** 4 leave the browser key open and the 5th locks it for 15 minutes; 29 leave the network key open and the 30th locks; an expired window restarts at 1; a success clears the browser row only (`packages/db/test/sandbox/throttle.test.ts:57-151`). Six subtests `ok` (C3.log:472-508).

**C4 — ten concurrent count ten. Met.** The upsert computes the reset, the count and the lock in SQL from the existing row (`packages/db/src/sandbox/gate.ts:251-272`), so there is no read-then-write. Ten parallel failures return 1–10 distinct and the row holds 10 (C3.log:515-527).

**C5 — no raw key, no plain SHA-256, retention. Met.** The table is four columns and no foreign key, in the schema (`gate-attempts.ts:16-29`) and in the migration (`migrations/0003_sandbox_schema.sql:98-104`), with RLS enabled and a deny-all policy for `authenticated` and none for `anon` (`0003:106`, `134`; `packages/db/src/policies.ts:88-96`) — the control is in the data layer, not in the query author's discipline. The test recomputes the app's HMAC independently and checks no row carries the id, the address or either SHA-256 (`throttle.test.ts:193-221`). A still-locked row survives the prune, an expired one does not (`throttle.test.ts:223-248`).

**C6 — isolation coverage. Met.** The three exports join `GATE_GROUP` (`registry.ts:23-31`) and are filed `gate` with `exactKeys` return assertions and fixed-message refusals (`isolation.test.ts:526-662`). The guard independently enforces gate-group membership and arity 2 (`registry.ts:73-76`), so a scoped read cannot be filed here. Guard plus six case tests `ok` (C3.log:162, 277-307).

**C7 — not verified, properly deferred.** Reason in the contract, `--verdict deferred` in `results.json`, steps that include the spoofing probe and name the fallback if it fails (`evidence/C7-steps.md:8-9`), and the entry is on the operator list at `specs/_status.md:89` — so the one assumption the network counter rests on cannot be quietly forgotten.

Evidence counts reconcile: `results.json` reports TAP tests plus suites (201+29=230, 85+13=98). Nothing is inflated.

## Non-negotiables

All seven hold. Two deserve naming. The thresholds live in one constant pinned by test (`throttle.ts:35-38`), and the generic `limit/windowMs/lockMs` parameters on the database primitive have exactly one caller, which spreads that constant. More importantly, `trusted` is `deployed` and not `productionRuntime` (`throttle.ts:105-107`; `env.ts:96,103`): `deployed` derives from `VERCEL_ENV`, so on a production build served off Vercel the network counter does not run at all rather than running on a header the client chooses. That is the difference between this feature and a remote lockout primitive aimed at a stranger's office, and it is placed at the only layer that can hold it.

## As-built claims checked

The deviations are accurate. The cookie set did move to LAB-7, and the wiring is better than the contract's sketch: `browserId = existingBrowserId ?? newBrowserId()` (`apps/web/app/experimental/[slug]/actions.ts:57`) keys *this* try with the freshly minted id, so the first wrong try counts instead of being lost to the bootstrap, and `markFailedTry` sets the cookie only on failure (`actions.ts:80-83`), so a successful reviewer carries no extra identifier.

I checked the claim the contract's "at most 30 minutes" depends on, since a lock that extends itself would break the retention cap. It cannot: a refused try returns before recording (`throttle.ts:204`), and a *counted* failure can only follow an expired lock, by which point the window has also expired, so `next` resets to 1, falls below `limit`, and the `greatest(…)` branch is not taken (`gate.ts:252, 269`). The prune also cannot drop a running lock — `greatest(window_ends_at, coalesce(locked_until, window_ends_at))` keeps any future `locked_until` (`gate.ts:191`), which is the one place a bug here would have silently unlocked an attacker.

No logging of an address, a browser id or a key anywhere in `apps/web/lib/sandbox` or `packages/db/src`; the action's only log line is a bare `sandbox.gate_failed` (`actions.ts:104`).

## Findings

**Consider — the lock check is not atomic with the attempt.** `apps/web/lib/sandbox/throttle.ts:203-206`: requests in flight together all pass `readGateLock` before any of them records, so a burst of N parallel tries yields N code lookups regardless of the limit, and the lock only bites the next arrival. The counting itself is atomic (C4), so nothing is lost; the threshold is simply exceeded by the in-flight count. Impact is negligible as shipped — gate.md's own reasoning is that 80 random bits cannot be guessed online, and the throttle is defence in depth. Worth recording because it stops being negligible if this wrapper is ever reused for a guessable secret.

**Consider — nothing signals that the network counter is off.** `throttle.ts:113` with `actions.ts:66-69`: when `deployed` is false the network key is silently null. That is the sanctioned fallback, but a production runtime on a non-Vercel host would lose a control with no startup warning and no runtime signal, leaving the browser counter alone against a cookie-dropper. The smallest sufficient fix is one line logged once when `productionRuntime` is true and `deployed` is false, naming only that the network counter is off. Until then, C7 on the operator list is the detection mechanism, which is adequate for the first deploy and not for a later move off the platform.

## Recorded residuals I confirmed, and do not refile

The self-asserted browser id (`throttle.ts:43,51-53`), the HMAC's dependence on the secret not leaking alongside the table, and the full-table prune on every write (`gate.ts:186-193`) are all recorded in the as-built with their reasoning, and each holds up. Separately, the timing difference between a real and an unknown slug is a consequence of gate.md's "an unknown slug never reaches the database" together with its explicit ruling that a slug is named like a title you would not mind leaking — a decision on the record, not a finding against this ticket. The throttle itself treats the two identically, which is what the focus asked.

No Blocking findings. Keys are stored only as HMACs, and an unknown slug counts and locks exactly like a real one.

VERDICT: PASS
