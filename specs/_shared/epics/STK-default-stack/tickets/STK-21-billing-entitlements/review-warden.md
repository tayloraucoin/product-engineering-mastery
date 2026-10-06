# Review — warden on STK-21

> Written by `yarn review:run warden STK-21`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 955619bf166fa52b369b7aea05b6390e1daea475e3dc3fbabb693949c065baf9
- as_built_sha256: 5c5d4bba572b91bf7b364445e31797a4aa407f2a84bd241878b1dd8cdec5d2e2
- head: 6960357f87944bc738a0db53355b0a6c7a845f9f
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T03:55:29Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-21`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-21 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C1.log (sha256 5494c38cf5c6)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C2.log (sha256 5494c38cf5c6)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C3.log (sha256 e3029232ff42)
   - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C4-operator.md (sha256 71ad87a067e8)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): apps/web/lib/billing/webhook/handlers/apply-entitlement.ts, apps/web/lib/billing/webhook/handlers/checkout-session-completed.ts, apps/web/lib/billing/webhook/handlers/customer-subscription-deleted.ts, apps/web/lib/billing/webhook/handlers/customer-subscription-updated.ts, apps/web/lib/billing/webhook/handlers/handlers.test.ts, apps/web/lib/billing/webhook/handlers/index.ts, apps/web/lib/billing/webhook/handlers/map.ts, apps/web/lib/billing/webhook/handlers/subscription.ts, apps/web/lib/billing/webhook/ledger.ts, docs/runbooks/remove/billing.md, packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/0002_billing_entitlements.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/0002_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/src/billing/stripe-event-ledger.ts, packages/db/src/schema/billing/entitlements.ts, packages/db/src/schema/billing/stripe-events.ts, packages/db/src/schema/index.ts, packages/db/test/stripe-event-ledger.test.ts, packages/services/package.json, packages/services/src/billing/entitlements.test.ts, packages/services/src/billing/entitlements.ts, packages/services/src/context.ts, packages/validators/package.json, packages/validators/src/billing/billing.ts, toolkit.json.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — each default event reaches its handler, which calls the service with the right user and entitlement: met.**
Three handler files exist, one per event (`checkout-session-completed.ts`, `customer-subscription-updated.ts`, `customer-subscription-deleted.ts`), each registered in `handlers/map.ts:11-13` and bound to the real service in `handlers/index.ts:25-31`, which the route imports (`apps/web/app/api/webhooks/stripe/route.ts:12`). `handlers.test.ts` drives signed synthetic events through the real spine (`handleStripeWebhook`) and asserts the exact service input, including the payment-mode skip and the `paid` allowlist. The evidence log shows those tests running green (C1.log:1675, :1717) and the 20 service tests behind them (C1.log:1759-1873), exit 0, 275 tests, head `6960357`.

**C2 — no matching user changes nothing and logs once: met.**
`completeCheckout` returns `no-user` before any insert when `userExists` fails (`entitlements.ts:145`), `syncSubscription` when neither the customer link nor the metadata names a user (`entitlements.ts:193-199`); both paths assert zero inserts in `entitlements.test.ts:109,168`. The handler logs exactly one `billing.no_user` line through `@pem/observability` (`apply-entitlement.ts:50`), asserted at C1.log:1699. See finding 1 on where that line goes.

**C3 — full chain, check-stack and check-migrations: met.** `yarn verify` exit 0 (C3.log:1-5); `check-stack — 16 module(s); nothing missing, nothing left behind` (:16) and `check-migrations: 3 migration(s)` (:17), with `0002_billing_entitlements` journaled (`meta/_journal.json:19-25`). The `warn STK-21 … not PASS` line at :18 is run ordering, not a failure.

**C4 — `stripe listen` end to end: not verified, correctly deferred.** Recorded `--verdict deferred`, listed under Operator checks (`specs/_status.md:67`), steps written and leading with `yarn db:setup:local`.

**Non-negotiables.** NN2 (one file per event, registered) ✓. NN3 — no handler or route touches the database: the only `@pem/db` imports under `apps/web/lib/billing` are the STK-16 ledger binding (`ledger.ts:10-16`), and `billingEntitlements` is written only in `packages/services/src/billing/entitlements.ts` ✓. NN4 — service in `packages/services/src/billing`, takes a context and validates before any query (`entitlements.ts:143,189`) ✓. NN5 ✓. NN6 — the runbook's file, edit, variable, dependency and boundary lists match the `billing` entry in `toolkit.json:388-403`, and cover this ticket's additions (`context.ts`, both `package.json` exports, `schema/index.ts`, migrations) ✓.

**As-built claims I checked against the code and found accurate:** service-only policy on the table (`entitlements.ts:42` → migration `0002:13,16`), the ordering guard and the tie rule (`entitlements.ts:123-132`), the late fill scoped to the same subscription (`:244-251`), `customer-mismatch` carrying its reason and the id that reason names (`:45-60,147-159,206-213`), `system: true` on the context (`context.ts:41`), the prune on a partial index (`stripe-events.ts:45-47`). The "Not verified" section is honest: the deny and prune tests are written (`packages/db/test/stripe-event-ledger.test.ts:140,162`) and have not met Postgres.

## Findings

**Should-fix — `billing.no_user` is documented as an alerting event but is logged at a level no alerting channel reads.**
`apps/web/lib/billing/webhook/handlers/apply-entitlement.ts:50` logs it with `log.warn`. `packages/observability/src/logger.ts:59-60` shows `warn` only prints; only `error` calls `reportError` (`:61-74`), and no Sentry console integration is configured. So `docs/runbooks/remove/billing.md:71` — "Alert on three log events: `billing.event_invalid`, `billing.customer_mismatch` and `billing.no_user`. Each means … someone may have paid and hold nothing" — promises an alert for a line that reaches stdout and nothing else. Actor: no adversary, an app bug or a dropped `client_reference_id`. Impact: a person is charged by Stripe, holds no entitlement, and nobody is paged. The other two events are at `error` and do reach the reporter. Smallest fix at the strongest layer: raise `no_user` to `log.error` (`handlers.test.ts:195` asserts the level and would move with it), or, if the noise is the reason it was left at `warn` — the runbook itself says it is expected now and then — say in the runbook that this one is alerted from the log stream, not the error reporter, so the operator configures the drain. Either closes it; silently documenting an alert the code cannot raise does not.

**Consider — `SystemContext.db` is typed `RlsClient` though it never bridges to a user.**
`packages/services/src/context.ts:42` declares `db: RlsClient`, and `:49` builds it as a bare `db.transaction(callback)` with no `set local role` and no `app.user_id`. The `system: true` marker stops the two contexts being passed for each other, but one level down the unscoped client is structurally the scoped one, so a future helper taking `db: RlsClient` would accept it and run outside row-level security without a type error. No such helper exists today (the only consumers are the two context fields). A brand on `RlsClient`, or a distinct `SystemClient` type, would make the seam hold on its own.

**Consider — `billing_entitlements` has no retention beyond the user's lifetime, and the runbook does not say why.**
`packages/db/src/schema/billing/entitlements.ts:18-43` keeps the customer id, subscription id, plan, status and period end indefinitely after cancellation; `docs/runbooks/remove/billing.md:67` states the cascade and the erasure path but names no retention period. There is a real reason to keep it — the returning-subscriber relink in `entitlements.ts:154,172` reads the ended row — and the data is minimal. Worth one line in the retention section saying the row outlives the subscription deliberately and why, so a product porting this does not read the silence as an oversight and does not keep it by accident.

No Blocking findings: the writes are confined to the service, the table denies every user role at the data layer, the wrong-user paths are guarded and tested, and nothing logs a customer id, a subscription id or a validator's input value.

VERDICT: PASS
