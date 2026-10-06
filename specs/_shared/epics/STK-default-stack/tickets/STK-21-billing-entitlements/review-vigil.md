# Review — vigil on STK-21

> Written by `yarn review:run vigil STK-21`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 955619bf166fa52b369b7aea05b6390e1daea475e3dc3fbabb693949c065baf9
- as_built_sha256: 5c5d4bba572b91bf7b364445e31797a4aa407f2a84bd241878b1dd8cdec5d2e2
- head: 6960357f87944bc738a0db53355b0a6c7a845f9f
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T03:48:20Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-21`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-21 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Vigil review — STK-21 billing-entitlements

**Verdict: Pass with conditions.** The three handlers, the service, the table and the runbook meet every criterion the contract names; two Should-fix findings concern how money-path outcomes are *classified for the operator*, not whether they are safe. C4 remains genuinely unverified and is correctly recorded as deferred.

Plan built from `contract.md` + `technical.md` (D-STK-11, D-STK-13) before reading the implementation. Code inspection only — I cannot run anything in this venue, so every item below is marked verified-in-code, runtime-required, or unverifiable.

---

## Criteria

**C1 — each default event reaches its handler file, which calls the service with the right user and entitlement. MET (verified in code + test evidence).**
Three handler files exist, one per event, registered in `handlers/map.ts:10-14` and bound to the real service in `handlers/index.ts:25-31`. `handlers.test.ts` drives each event through the real spine (`handleStripeWebhook`) with a signature from `Stripe.webhooks.generateTestHeaderString`, and asserts the exact input handed to the service. C1.log:1675-1717 shows all four C1 tests passing; C1.log:1759-1873 shows the service's 20 tests passing. No `not ok` anywhere in the log. The event→handler→service chain is proven; the service→Postgres chain is not (see C4).

**C2 — an event for a customer with no matching user changes no entitlement and logs once. MET (verified in code + test evidence).**
`entitlements.ts:145` and `:194-199` return `no-user` before any insert; `apply-entitlement.ts:50` logs `billing.no_user` once at warn through `createLogger("billing")`. `handlers.test.ts:187-200` asserts exactly one line, at warn, with the event type and id, and a 200. `entitlements.test.ts:104-110` and `:162-170` assert zero inserts, for both the metadata-null and metadata-present shapes. C1.log:1699, 1771, 1807.

**C3 — the full chain passes, check-stack finds every file the billing entry lists, check-migrations passes the entitlement migration. MET.**
C3.log:2 `exit: 0`; line 16 `check-stack — 16 module(s); nothing missing, nothing left behind`; line 17 `check-migrations: 3 migration(s) … none touch the auth schema`. I verified the manifest independently: `toolkit.json:389-397`'s seven `files` entries match `remove/billing.md:24-30` one for one, and `env`/`dependencies`/`boundaries` match the runbook's three sections — NN6 holds. The warn at C3.log:18 naming C3/C4/reviews as unproven is self-referential (verify ran *inside* the C3 run) and is the expected non-strict behaviour.

**C4 — `stripe listen` delivers a test event that changes a local user's entitlement end to end. NOT MET; correctly deferred.**
`results.json:43-54` records PASS with `deferred: true`, and `specs/_status.md:67` lists it under Operator checks — the sanctioned shape per `.claude/rules/specs.md`. `evidence/C4-operator.md` gives seven reproducible steps leading with `yarn db:setup:local`. This is the honest state, and the as-built says so plainly (`as-built.md:31`): the ordering guard, the unique customer link, the cascade and the deny policy are proven **as SQL text against a scripted driver, not by Postgres**. I checked that text by hand and it is sound — `on conflict … do update set … where` referencing the existing row unqualified-by-`excluded` is correct Postgres, `returning` yielding no row on a failed `setWhere` is what `stale` relies on, and the partial index predicate is valid. But sound-on-inspection is not run.

**Non-negotiables.** NN1 precondition: routed call 3 is answered (`technical.md:48`). NN2: one handler file per event, registered. NN3: verified by grep — the only writes to `billing_entitlements` anywhere in the repo are in `packages/services/src/billing/entitlements.ts`; no file under `apps/web/lib/billing/webhook/handlers/` imports `@pem/db`. NN4: `SystemContext` + `parseInput` before any query (`entitlements.ts:143`, `:189`), and `entitlements.test.ts:130-141` proves zero queries on malformed input. NN5, NN6: above.

---

## Findings

### Should-fix

**1. An unpaid second checkout — a user who thinks they just bought something — is reported as `stale` at info.**
`packages/services/src/billing/entitlements.ts:169` returns `{ outcome: "stale" }` for the delayed-payment-method case, which `apps/web/lib/billing/webhook/handlers/apply-entitlement.ts:66-67` logs as `billing.stale_event` at **info**. Expected per `docs/runbooks/remove/billing.md:71`, which defines the operator's alert set: every state where a verified event was acknowledged without changing an entitlement is named there (`event_invalid`, `customer_mismatch`, `no_user`) precisely because "someone may have paid and hold nothing." This state qualifies and is in none of them — it is filed under an event name that means "an older event arrived late," at the one level nobody alerts on. Nothing is written and the live entitlement is intact, so this is not Blocking; but when that user writes in, the support path has no signal. Suggest a distinct outcome (`pending-payment` or similar) and a line in the runbook's alert set. Owner: builder, with the runbook's author.

**2. A routine returning subscriber can raise a false "they may have paid twice" error.**
`packages/services/src/billing/entitlements.ts:203-213` raises `customer-mismatch`/`entitled-elsewhere` *before* the event's time is ever compared, and `apply-entitlement.ts:51-60` logs that at **error** with the message "they may have paid twice." Walk it: a user cancels at period end, re-subscribes through a new Checkout (new customer), the relink at `:173-180` moves their row off the old customer; weeks later `customer.subscription.deleted` for the old subscription lands, `linkedUser` no longer finds the old customer, metadata names the user, and the guard fires. The outcome is correct — nothing is overwritten — but an older event that the staleness guard would have dismissed silently instead pages the operator on the double-charge channel the runbook defines. Suggest comparing `occurredAt` against the row before classifying a mismatch, so a late event stays `stale`. Owner: builder.

### Consider

3. `packages/services/src/billing/entitlements.ts:95` — `ENTITLED_STATUSES as unknown as string[]` strips readonly through `unknown`; `[...ENTITLED_STATUSES]` does it without the hop, and `isEntitled` at `:266` already uses the clean cast. Two idioms for one thing, in the file that decides who is entitled.
4. `apps/web/lib/billing/webhook/handlers/subscription.ts:7` (`subscriptionInput`), `apply-entitlement.ts:19` (`stripeId`) and `:25` (`occurredAt`) are noun-named functions, against `.claude/rules/ts.md`'s verb-first rule.
5. `packages/db/src/billing/stripe-event-ledger.ts:87` — the prune materializes every deleted id via `.returning({ id })` to produce a count that `apps/web/lib/billing/webhook/ledger.ts:41` discards. The first prune after a month of traffic pays for that list.
6. `apps/web/lib/billing/webhook/handlers/checkout-session-completed.ts:23` — a `payment`-mode checkout returns with no `[billing]` line at all. Correct behaviour, invisible afterwards.
7. `packages/services/src/context.ts:43` — `SystemContext.db` is typed `RlsClient`, the same type the RLS-bridged client carries, in the one place RLS is deliberately absent. The `system: true` discriminator does the real work; the type name reads against it.

---

## Conversations

**The double-charge guard is silent toward the person it protects.** When a user who is still active completes a checkout that creates a second Stripe customer, the service correctly refuses to move their row (`entitlements.ts:154-159`) — they keep what they have rather than being stranded. But they are now being billed twice, the only trace is a log line, and nothing in the product tells them or refunds them. The guard is right; the follow-through is an operator runbook away. Is there an owner for the "we detected a probable double charge" response, or does that wait for the Checkout ticket?

**The Checkout route carries two unwritten requirements.** `as-built.md:35` tells the next builder to set `client_reference_id` and `subscription_data.metadata.user_id`. Reading the service, two more are load-bearing: reuse the user's existing Stripe customer rather than letting Stripe mint a new one, and refuse a second checkout while the user is entitled. Neither is written where a future builder will trip over it (the validator comments warn about client-supplied values, which is a different hazard). Worth a line in `remove/billing.md`'s "While billing is in use", or in the Checkout ticket's contract when it is drafted?

---

## Runtime checklist (ordered by risk)

Everything here is C4's deferred work; none of it is proven today.

1. `yarn db:setup:local`, then `yarn workspace @pem/db db:migrate` — this is the first execution of `0002_billing_entitlements` anywhere, including its partial index predicate and its RLS policy.
2. `yarn test:db` — the `billing_entitlements` deny test (`packages/db/test/stripe-event-ledger.test.ts:162-200`) and the prune test (`:140-160`) have never run. The deny test is the only runtime proof that a signed-in user cannot read or grant their own entitlement. If it fails, nothing may gate on `isEntitled`.
3. Steps 2-7 of `evidence/C4-operator.md`: the end-to-end `stripe listen` walk, confirming `active` at step 6 and `canceled` at step 7.
4. Beyond C4's script, two cheap probes while the CLI is attached: replay one delivery (`stripe events resend`) and confirm the row is unchanged and the response is 200 — the idempotency the tie rule at `entitlements.ts:123-132` depends on; and cancel-then-resubscribe on a fresh customer, to see whether finding 2's false alarm fires in practice.

Assumptions I worked under: `[ASSUMPTION: the precedence ladder was not supplied; I read enforced checks → design layer (n/a, no UI here) → accepted decisions D-STK-11/13/16 → contract and technical.md → craft judgment, and the deviations in as-built.md as logged departures rather than defects.]` `[ASSUMPTION: 0000/0001 migration and snapshot files appearing in the diff against main are STK-16's work on the shared branch, not this ticket's; I did not treat them as a rewrite of applied migrations.]` I reviewed only STK-21's paths and did not re-prove or re-review anything else on the branch.

VERDICT: PASS
