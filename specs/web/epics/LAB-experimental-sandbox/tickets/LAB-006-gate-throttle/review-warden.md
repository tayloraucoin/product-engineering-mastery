# Review — warden on LAB-6

> Written by `yarn review:run warden LAB-6`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 314f5b48d3b5f37154f54a4d12571f1cb2159afe59fdbd06132716cbf02d8ed0
- as_built_sha256: 8a40e5c28bf44f574d9a262734c12352860bb26100fb8ac7a5c7564ec6ee210c
- head: 916a6a1be395973776e65a8ad6af21f91e718eb3
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T20:49:52Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-6`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-6 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C1.log (sha256 ec2d394a293a)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C2.log (sha256 ec2d394a293a)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C3.log (sha256 74da13d48bc3)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C4.log (sha256 74da13d48bc3)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C5.log (sha256 74da13d48bc3)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C6.log (sha256 74da13d48bc3)
   - C7 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C7-steps.md (sha256 d6aa29157cbd)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): apps/web/lib/sandbox/throttle.test.ts, apps/web/lib/sandbox/throttle.ts, packages/db/src/sandbox/gate.ts, packages/db/src/sandbox/index.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/roles.test.ts, packages/db/test/sandbox/schema.test.ts, packages/db/test/sandbox/throttle.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/gate.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — LAB-6 gate-throttle (warden, fresh context)

Read: contract, `results.json`, as-built, all seven evidence files, the ten changed paths, `technical/gate.md`. Also read, as dependencies the claims rest on: `secret.ts`, `access-check.ts`, `viewer.ts`, `schema/sandbox/gate-attempts.ts`, `env.ts`, `packages/env/src/site-url.ts`.

### Criteria

**C1 — network key shape. Met.** `networkKeyOf` (`throttle.ts:102-126`) gates on `isIP` before parsing, keeps IPv4 whole, and cuts IPv6 to its first four hextets. I traced `expandIPv6` by hand for the compressed, expanded, embedded-IPv4 and mapped forms: `2001:db8:1:2:a:b:192.0.2.1` and `2001:db8:1:2::` both land on `2001:db8:1:2::/64`, and `::ffff:203.0.113.7` reduces to `203.0.113.7`. The `!trusted` and non-string early return gives no key. Tests cover six spellings of one /64, three mapped forms, multi-hop headers, and eleven malformed values (`C1.log:1067-1121`, 8/8 ok). Thresholds are pinned as one constant and `withGateThrottle` reads `GATE_THROTTLE` directly, so a caller cannot override them.

**C2 — locks, every slug alike. Met, with a weak spot.** `withGateThrottle:196-197` reads both locks and returns before `attempt()`, so a locked key refuses a correct code; the test asserts `lookups` is empty after a `LIVE_CODE` try during a lock, using LAB-5's real `grantAccessWith`. A lock reached across five slugs blocks three others, a locked network refuses a fresh browser, success clears the browser key only. See finding 1 on what the unknown-vs-real case actually exercises.

**C3 — counts, locks, window. Met.** Against real Postgres: 4 open then the 5th locking to +15m, 29 open then the 30th locking, a reset to 1 past the window, and the subtle case of a window expiring under a running lock (restart at 1, lock preserved). I checked the upsert SQL: drizzle qualifies `${t.failures}` to the table, so bare references in `ON CONFLICT DO UPDATE` read the existing row, and `greatest(locked_until, …)` with a NULL returns the non-null. Correct.

**C4 — ten concurrent failures count ten. Met.** `recordGateFailure:254-274` is one `insert … on conflict do update … returning` inside a transaction; concurrent upserts serialize on the row lock and the UPDATE re-reads the committed row, so there is no read-then-write. Ten parallel calls return 1–10 with the row at 10, and the past-limit variant has six carrying the lock.

**C5 — what a row holds. Met.** The table has exactly `key_hash, failures, window_ends_at, locked_until` and no foreign keys; no row holds a raw browser id, a raw address, or either's plain SHA-256; the prune test shows an expired row removed by the next write to a different key while a still-locked row survives.

**C6 — isolation coverage. Met in the current tree; evidence predates a later commit.** All three exports are in `GATE_GROUP` (`registry.ts:23-31`), filed as `gate`, arity 2, each with cases asserting exact return keys (`lockedUntil`; `failures, lockedUntil`; `cleared`) and a fixed refusal carrying no input. The guard passes in `C3.log:148-165`. Note that `C3.log` was produced at `d999235` and does not contain LAB-9's `withRoleChangeLock` cases, which are in `isolation.test.ts` now — so the recorded run is not of the file I read. The claim still holds by inspection; `check-specs --strict` should re-run it before a merge. Not re-proven here, per a ticket's proofs being its own.

**C7 — Vercel's first hop. Correctly deferred.** No hosted deployment exists; `C7-steps.md` gives a concrete two-part check (network lock from a known address, then a spoofed header) and a fallback instruction if it fails. Recorded `--verdict deferred` with the operator's dated note.

No logging of an address, cookie or key anywhere in `apps/web/lib/sandbox` (grepped). `THROTTLE_INPUT_INVALID` is a fixed string, and the only other throw names the variable, never its value. Interpolations into raw SQL are drizzle-bound parameters, and limits are validated as positive safe integers first.

### Findings

**Should-fix** — `apps/web/lib/sandbox/throttle.test.ts:257-278`. The unknown-slug-vs-real-slug comparison uses the code `"WRONG"`, which `normaliseCode` rejects, so *neither* path reaches `findLiveReviewerByCodeHash`. The case this criterion and my assigned focus are about — a well-formed 16-symbol code that simply was never issued — is exactly the case where the two paths diverge internally (real slug performs a lookup, unknown slug returns before any database call per `access-check.ts:137`). Add that case: identical result, identical rows, and `lookups` non-empty for the real slug and empty for the unknown one. The equality being asserted today is the equality that was never in doubt.

**Should-fix** — `specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/as-built.md:16`. "`readBrowserId` refuses any cookie value this app did not mint" overstates the control. `throttle.ts:51-53` tests only the shape `/^[A-Za-z0-9_-]{22}$/`, so any client-chosen 22-character base64url string is accepted as a browser key. The security effect is nil — a client can discard the cookie anyway, so a chosen value is just another counter they own, and a victim's value is 128 unguessable bits — but a later ticket reading that sentence could treat the cookie as authenticated. Reword to "refuses any value not shaped like one this app mints."

**Consider** — `apps/web/lib/sandbox/throttle.ts:102-106`. `trusted` is a bare boolean, and the only record that it must be `env.ts`'s `deployed` is prose in the as-built. `deployed` is the right signal (`env.ts:95-96`, `VERCEL_ENV ∈ {production, preview}`, platform-set), but `productionRuntime` (`env.ts:103`) is true off Vercel and sits one identifier away, and LAB-7's contract has no criterion naming the argument. Wired to the wrong one, the network key becomes client-controlled: an adversary who has a slug from a mail log sets `x-forwarded-for` to a reviewer's /64, spends 30 requests, and denies every reviewer behind that network the gate for 15 minutes — with a correct code in hand — while keying their own tries to random values to escape counting. Either narrow the parameter to take `platformEnv: string | undefined` and call `isDeployed` inside, or have LAB-7 add a criterion pinning `trusted = deployed`.

**Consider** — `apps/web/lib/sandbox/throttle.ts:193-197`. With no `sandbox_gate` cookie and no trusted address, `keyHashes` is empty, `readGateLock` early-returns, and the failure loop records nothing: a cookie-discarding client is not throttled at all. `gate.md:49` sanctions this and 80 bits of code space make brute force a non-threat, but it means C7's stated fallback ("set `trusted` to false", `C7-steps.md:9`) leaves the gate effectively unthrottled against anyone who drops cookies. Worth naming in the as-built's residual risk so the fallback is chosen with that understood.

**Consider** — `packages/db/src/sandbox/gate.ts:186-193`. `pruneGateAttempts` runs a full-table `DELETE` on an unindexed `greatest(window_ends_at, coalesce(locked_until, window_ends_at))` predicate on every failure and every clear. Free at gate volume; easy to forget later. And because pruning is write-triggered only, the last expired row survives indefinitely once tries stop — 30 minutes bounds when a row *becomes* deletable, not how long it is held.

**Consider** — `packages/db/test/sandbox/throttle.test.ts:195-201`. The db test recomputes the app's MAC by hand (it cannot import from `apps/`), and nothing asserts that `throttleKeys` output equals `sandboxMac(secret, SANDBOX_MAC_LABELS.throttle, "b:"+id)`: `throttle.test.ts:83-111` checks only 32 bytes, no raw substring, not a plain SHA-256, and that the kinds differ. The literal `"throttle"` appears only in `secret.ts:21`. A change to the label or the input shape would leave both tests green while the non-negotiable's named derivation quietly changed. One equality assertion in `throttle.test.ts` closes it.

### Residual risk, for the record

An HMAC over an IPv4 address or a /64 resists a table-only leak, not a table-plus-secret leak: with `SANDBOX_SECRET` in hand the IPv4 space is enumerable in minutes. D-LAB-33 chose HMAC knowingly, row lifetime is ≤30 minutes, and the row carries no slug and no feedback link, so the worst recoverable fact is "someone at this network got a code wrong recently." That is the right trade for a short-lived abuse counter; it is not stronger than that, and "never raw" in the non-negotiable should not be read as irreversible.

No Blocking findings. The two non-negotiables I was asked to focus on hold: keys reach the table only as HMACs under a labelled derivation, and the counters are global, so an unknown slug counts, locks and reaches no other table exactly as a real one does.

VERDICT: PASS
