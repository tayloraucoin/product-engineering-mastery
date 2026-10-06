# Review — mason on STK-16

> Written by `yarn review:run mason STK-16`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 3c622be5458969cab8d59d00a42254d4d0568bb717d787b62a6ecc65f73d5535
- as_built_sha256: f5943ff0ae8cc154b8e377ac8150c402d1e96311fd5ff3b6311f1735c3eefaa4
- head: bd92ecda60efee045413017ab20879db71836484
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T03:53:33Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-16`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-16 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — STK-16 billing-stripe (mason)

**Verdict up top: PASS.** No Blocking findings. Three Should-fix, five Consider.

Reviewed as a one-way door (billing, schema, migration, SDK ownership): full read of every changed source file, not a sample. The migration is unapplied (`as-built.md:44`), so the door is still open.

### Criteria

| # | Statement | Evidence | Code | Met |
|---|---|---|---|---|
| C1 | Bad signature rejected, replay ignored | `C1.log` exit 0; four subtests ok, each asserting `store.calls` is empty — "nothing read or written" is asserted, not just narrated | `handle.ts:82-99` (400 before any ledger call), `handle.ts:115-118` (replay → 200 `duplicate`) | yes |
| C2 | Signed event reaches its mapped handler via a fixture map | `C2.log:1154` ok; call order asserted `claim → mark` per event | `dispatch.ts:27-34`, `handle.test.ts:172-200` | yes |
| C3 | No handler → 2xx, dispatched nowhere | `C3.log:1248,1254` ok; ledger untouched (`deepEqual(store.calls, [])`) | `handle.ts:103-106`; `Object.hasOwn` guard at `dispatch.ts:31`, probed with `constructor` | yes |
| C4 | Throwing handler → retryable 5xx, not recorded | `C4.log:1435,1441` ok; the retry is run and only then does the row read `processed` | `handle.ts:124-147`, `RETRYABLE_STATUS` 500 at `handle.ts:27` | yes |
| C5 | Boundaries pass, `stripe` owned by `apps/web` | `C5.log` exit 0; probes ok 20, 21, 46 in `C6.log` | `boundaries.js:134` + `ownerName()` at `:138-140`; `tooling/boundaries.test.ts:101-111, 231-234` | yes |
| C6 | Types, build, full chain incl. check-migrations | `C6.log` exit 0; `check-migrations: 2 migration(s)`; journal registers `0001_stripe_events` | `migrations/meta/_journal.json:12-18`, `0001_stripe_events.sql` | yes |

`C6.log:54` warns about STK-16's own C6 and reviews — self-referential, expected mid-close. No `not ok` in any log.

Non-negotiables all hold: tiered keys and price id (`env.ts:226-228`), claim-before-dispatch and mark-after-success (`handle.ts:110,142`), map not switch, `stripe:listen` → `localhost:3000/api/webhooks/stripe` (`package.json:60`), manifest entry at `toolkit.json:364-376`. The as-built's claims check out against the code, including the honest disclosure at `as-built.md:30` about the swept index.

### Should-fix

**1. `apps/web/env.ts:117-119` — the webhook secret keys off `deployed`, not `productionRuntime`.** Off Vercel, `STRIPE_WEBHOOK_SECRET_LOCAL` is always read, so a production build on any other host ignores the tier's endpoint secret and every real delivery 400s (or 500s when the local variable is unset). It fails closed — an unverified event is never processed — which is why this is not Blocking. But `env.ts:91-96` defines `productionRuntime` for exactly this distinction, and STK-18 was corrected the same way one ticket ago (`?state=error` held off by `productionRuntime`, not the tier). Use `productionRuntime` here; the tradeoff is that a local `next build && next start` smoke test then needs the tiered variable set. Also reconcile the contract's wording ("runs on localhost") with whichever condition lands — they are not the same predicate.

**2. `docs/runbooks/remove-billing.md:17` — now false.** "The module is not built, so every list below is empty" no longer holds: the route, dispatcher, table, SDK ownership and three variables shipped. D-STK-19 (`technical.md:32`) is explicit — "the ticket that makes a line untrue updates it." The contract defers *completing* the runbook to STK-21; that does not license leaving a false sentence behind. Minimum: fix line 17 and fill Files, Variables, Dependencies and Boundaries from `toolkit.json:364-376`; leave the entitlement steps to STK-21.

**3. `packages/db/test/stripe-event-ledger.test.ts` never ran** (`as-built.md:34`, disclosed). C1–C4 run against an in-memory ledger the builder wrote to the same contract, so a divergence between that model and the SQL at `stripe-event-ledger.ts:31-51` — the `onConflictDoUpdate`/`setWhere` claim, the lease takeover, the deny-all policy — would pass every criterion. I read the SQL and the migration (`0001_stripe_events.sql:10-11`) and they are right, and `serviceOnlyPolicies` is proven elsewhere, so the risk is low. Still: `yarn db:local` then `yarn test:db` before STK-21 builds entitlements on this table. Operator action — I cannot run it.

### Consider

4. `apps/web/proxy.ts:50-51` — the matcher excludes Sentry's tunnel but not `/api/webhooks/stripe`. A cookie-less POST costs no Supabase round-trip, so this is cheap today, but a webhook has no session to refresh; keep the money path off the auth seam.
5. `apps/web/lib/billing/stripe.ts:18-33` — `getStripe`, `billingConfigured` and `stripePriceId` have no consumer until STK-21. The file earns its keep by anchoring the ownership C5 proves; noting only that it is a seam built one ticket early.
6. Extension drift in one folder: `handle.ts:24` and the test import `./dispatch.ts`; `ledger.ts:18` and `route.ts:11-13` drop it. Agents copy whichever they meet first.
7. `route.ts:10-13` uses `../../../../env` where the sibling AI route uses `@/` (`C6.log:419`). Four-deep relative paths break on a move.
8. `packages/db/src/schema/billing/stripe-events.ts` — one row per event, forever, no retention. Lookups are by primary key so no index is wanted; a pruning step or a documented "keep forever" belongs in STK-21's runbook.

The dispatcher, the claim/mark/release split and the fail-closed unhappy paths are the right shape, and `handle.ts` is genuinely framework-free, as its header claims — the route hands in bytes and gets back a status. That is the part worth copying ten more times.

VERDICT: PASS
