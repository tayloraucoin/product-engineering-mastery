# Review — vigil on STK-16

> Written by `yarn review:run vigil STK-16`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 3c622be5458969cab8d59d00a42254d4d0568bb717d787b62a6ecc65f73d5535
- as_built_sha256: f5943ff0ae8cc154b8e377ac8150c402d1e96311fd5ff3b6311f1735c3eefaa4
- head: bd92ecda60efee045413017ab20879db71836484
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T03:53:33Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-16`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-16 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C1.log (sha256 e33ef3300d44)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C2.log (sha256 97a5bb80c552)
   - C3 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C3.log (sha256 fc8d43e204cc)
   - C4 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C4.log (sha256 82530c4c4e1a)
   - C5 check: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C5.log (sha256 143a7713c1b5)
   - C6 check: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C6.log (sha256 354b4726a112)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/api/webhooks/stripe/route.ts, apps/web/env.ts, apps/web/lib/billing/stripe.ts, apps/web/lib/billing/webhook/dispatch.ts, apps/web/lib/billing/webhook/handle.test.ts, apps/web/lib/billing/webhook/handle.ts, apps/web/lib/billing/webhook/handlers/index.ts, apps/web/lib/billing/webhook/ledger.ts, apps/web/package.json, docs/engineering/tech-stack.md, package.json, packages/config/eslint/boundaries.js, packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/package.json, packages/db/src/billing/stripe-event-ledger.ts, packages/db/src/schema/billing/stripe-events.ts, packages/db/src/schema/index.ts, packages/db/test/stripe-event-ledger.test.ts, tooling/boundaries.test.ts, tooling/check-client-bundle.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-16 billing-stripe (vigil)

**Verdict: Pass with conditions.** Every criterion is met by its named evidence; no finding is Blocking. Two Should-fixes and the runtime checklist below must be carried into STK-21, not dropped.

I built the checklist from `contract.md` + `technical.md` (D-STK-3, D-STK-4, D-STK-11, D-STK-13, D-STK-16) before reading the implementation. Evidence logs contain no `not ok` and no `# fail` greater than zero anywhere.

### Criterion by criterion

| ID | Verdict | Basis |
|---|---|---|
| C1 | **Met** | `handle.test.ts:85-169` — wrong-secret, tampered-body and no-header deliveries each return 400 with `store.calls` empty (nothing read or written), and the replay returns 200 `duplicate` with the handler seen once. `handle.ts:82-99` verifies on the raw string via `constructEventAsync` before any ledger call. C1.log:1374 `ok 1`. **DB-level idempotency is code-verified, not runtime-verified** — see Should-fix 1. |
| C2 | **Met** | `dispatch.ts:22-34` is a typed map, not a switch; `handlers/index.ts:17` holds the app's (empty) map. The fixture map in `handle.test.ts:173-199` sends two types to their own handlers and asserts the call order `claim → mark` per id — the contract's "through a fixture map" is exactly what ran. C2.log:1381. |
| C3 | **Met** | `handle.ts:102-106` returns 200 `ignored` before any ledger call; `handlerFor` guards with `Object.hasOwn`, so `constructor` is not a handler (`handle.test.ts:215-224`). Ledger untouched is asserted, not assumed. C3.log:1413, 1424. |
| C4 | **Met** | `handle.ts:124-139` releases the claim and returns `RETRYABLE_STATUS` (500); `handle.test.ts:228-256` proves the id is not marked, the row is gone, and the retry runs the handler to completion. A failed ledger write is retryable too (`handle.ts:111-114`). C4.log:1451. |
| C5 | **Met** | `boundaries.js:134` `stripe: "app-web"`; `ownerName` (`:138-140`) renders `apps/web`. `tooling/boundaries.test.ts:101-111` proves the ban from `@pem/services` and `@pem/db`, `:232-234` proves `apps/web/lib/billing` passes. C5.log exit 0 (empty body is eslint's silent pass — thin evidence on its own, but the probe tests in C6.log:233,239,389 carry it). |
| C6 | **Met, with a shape objection** | C6.log: prettier, `lint:docs`, `check-stack` (16 modules), `check-migrations` (2 migrations, none touch `auth`), 157 tooling tests, `check-types` 15/15, `build` ✓ `Compiled successfully`, exit 0. Migration `0001_stripe_events.sql` enables RLS with a service-only policy. See Should-fix 2 on the command used. |

**Non-negotiables:** all seven hold. Tier-keyed secret/price (`env.ts:226-228`) with wrong-mode refusal (`:180-188`); local webhook secret off a deployment (`:117-119`); verify → record → dispatch with nothing else written to the DB (`route.ts:18-33` imports only `databaseLedger`); processed only after success (`handle.ts:141-149`); map not switch; `stripe:listen` forwards to `localhost:3000/api/webhooks/stripe` (`package.json:60`); manifest entry complete with `remove-billing.md`, which exists (`toolkit.json:364-376`).

**As-built claims I checked and found true:** `setWhere` is a real drizzle option, not invented (`drizzle-orm/pg-core/query-builders/insert.d.ts:66`) — this was the likeliest stale-API failure and it is clean; `stripe` 22.6.2 has its `tech-stack.md:57` row with the age-gate note; the db test is genuinely outside `yarn test` (`packages/db/package.json:43-44`), so the 193/194 counts never included it; `0000_example_schema.sql` was not rewritten by this ticket (no stripe content, journal additive).

### Findings

**Should-fix 1 — the idempotency SQL has never executed.** `packages/db/test/stripe-event-ledger.test.ts` (whole file; as-built:34). Every DB-level claim — a live claim returning `in-flight`, a stale claim taken over, RLS closing the table to a signed-in user — rests on a test that did not run, so the money path's "never handled twice" is proven only against the in-memory stand-in in `handle.test.ts:40-62`, written by the same hand as the SQL. The contract chose `yarn test` as C1/C4's oracle and the epic put this behind `test:db`, so this is not a failed criterion; it is an open edge that must close before STK-21 gives handlers something to do twice. Owner: builder, with Docker up.

**Should-fix 2 — C6 uses a command the rules forbid as a criterion.** `contract.md:77-79` sets C6's command to `yarn verify`; `.claude/rules/specs.md` says "`yarn verify` is never a criterion: it runs once at batch close" — and the as-built itself says so (`as-built.md:10`). The artifact is a self-referential proof: `C6.log:54` records "STK-16 … C6 (last run exited 1)" inside the very log that records C6 as PASS. The log does prove the criterion's substance; the shape invites a later reader to misread line 54 as a failure. Owner: contract author — `check-types` + `build` + `check-migrations` would state the same claim without the recursion.

**Consider 1 — the webhook passes through the session proxy.** `apps/web/proxy.ts:50-52`. The matcher excludes `_next/static` and Sentry's tunnel because they "carry no session"; a Stripe delivery carries none either, yet every delivery runs `updateSession` first, putting an auth-path dependency in front of the money path. No cookies means no work in practice, but nobody has watched a real delivery traverse it.

**Consider 2 — a failed `markProcessed` holds the event for the full lease.** `handle.ts:141-147` with `STRIPE_EVENT_LEASE_SECONDS = 600` (`stripe-event-ledger.ts:16`). The handler succeeded, the mark failed, so Stripe's first several retries all get 409 and recovery waits out 600 s before the handler re-runs. Defensible (it is the safe side of the trade) but worth stating as a chosen number, not an accident.

**Consider 3 — the harness's test count is not stable.** `results.json:15,28,41,54` records 193, 194, 194, 194 tests for four runs of the identical `yarn test` at the identical HEAD. Since `contract:run` FAILs a test criterion that matched zero tests, that counter is load-bearing; interleaved turbo output appears to lose a line. Owner: harness, not this ticket.

### Conversations

The webhook secret is keyed on `deployed` (`env.ts:117-119`), i.e. on `VERCEL_ENV`, while the file itself notes that "a guard that must hold off Vercel reads `productionRuntime`, not `deployed`". A production build on a non-Vercel host would therefore read `STRIPE_WEBHOOK_SECRET_LOCAL` and ignore the tier's real endpoint secret. D-STK-3 and `codebase-conventions.md:123` sanction exactly this reading, and it fails closed (500 `unconfigured`, retried, never a forged event accepted), so I am not filing it. The question for whoever owns the stack: is non-Vercel production a supported target, and if it ever becomes one, does this line change with it?

Second, `dispatch.ts:5-6` and `handlers/index.ts:10-12` require each handler to write idempotently because the at-least-once window above is real. Today that requirement is a comment. STK-21 adds the first handlers that can double-grant an entitlement — is there appetite for a check or a shared upsert seam rather than prose?

### Runtime checklist (ordered by risk)

1. Start the local image and run `yarn test:db` — the six ledger tests, especially the live claim, the stale takeover and the RLS denial.
2. `yarn stripe:listen`, forward one real test event, confirm 200 through the proxy and one `stripe_events` row ending `processed`.
3. Forward the same event id twice and confirm the second answers `duplicate` with no handler re-run.
4. With a temporary throwing handler, confirm 500, no row left behind, and Stripe's retry succeeding.
5. Unset `STRIPE_WEBHOOK_SECRET_LOCAL` and confirm 500 `unconfigured`, logged, with nothing read.
6. Re-run `yarn check-specs` before merge: C1–C5 were fresh at `C6.log:54`, but four sibling tickets share this branch and I cannot verify freshness from files alone.

**Assumptions:** [ASSUMPTION] C5's empty log body is eslint's silent pass, not a truncated capture. [ASSUMPTION] The `0000_*` and `meta/` diffs against main belong to the in-flight STK-9, since 0001 is additive and the journal is intact.

VERDICT: PASS
