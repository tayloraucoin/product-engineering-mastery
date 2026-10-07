# Reviewer prompt calibration, 2026-10-07

Track: one-off, Q1, no ticket; the builder thread alone. Decides the audit's cut C3 (`2026-10-06-token-and-speed-audit.md`, finding Y1): the headless reviewer prompt in `tooling/review-run.ts` is scoped and single-pass, kept only if a calibration run shows it misses no Blocking the open-ended prompt finds.

## Verdict

**The new prompt is kept in full.** Run once each as Warden on STK-21 at `6960357`, the old prompt and the new prompt both returned PASS with no Blocking finding, so the new prompt missed none. What the calibration cannot show: whether the new prompt would catch a Blocking that exists, since neither run found one, and whether the finding sets would hold across runs, since each prompt ran once and the audit's R1 measured reviewer variance between runs of the same prompt. The saving per run stays an estimate: one pair of runs, 0.04M weighted tokens and 7 seconds apart, is inside that variance.

## Method

- **Target.** Two detached worktrees at `6960357` (STK-21's round-5 state), one per prompt, under this thread's scratchpad. STK-21's criteria were proven again there (`yarn contract:run STK-21`: C1 and C2 PASS on 276 tests, C3 PASS in 163 s; C4 recorded deferred against the same `C4-operator.md` the round-5 reviewer read), so each reviewer read genuine run records and evidence logs at that head.
- **Old prompt.** `tooling/review-run.ts` as committed at `6960357`, unchanged at HEAD before this change.
- **New prompt.** The same file with this change's prompt block applied by the same script that edits the checkout. The other hunks landing in `review-run.ts` that day (the cost fields of C4, the cap of C1) were not in the worktrees: the worktrees run the tooling of `6960357`, so no `--operator` flag existed or was needed there. [ASSUMPTION: the brief expected the cap to have landed first; at the time of the runs it had not, and the cap does not change what the reviewer reads.]
- **Cost capture.** The worktrees' copies of `review-run.ts` carried three extra lines, never committed: they save the headless result's raw JSON (`claude -p --output-format json`) to a file. The cost fields below are that JSON's `usage` and `modelUsage`, read directly, since prompt 1's cost fields were not in the tree when the runs started. Weighted tokens use the audit's weights: input 1, cache write 1.25, cache read 0.1, output 5.
- **Runner.** `claude 2.1.232 (Claude Code)`, model `claude-opus-5[1m]`, the Warden role file appended as the system prompt (no generated `warden` subagent exists), tools Read, Grep and Glob. Both runs started at 2026-10-07T05:54:45Z (2026-10-06 22:54 PDT) and ran in parallel.
- **Grades are the reviewer's.** Nothing below is regraded. The matching of findings across runs is the builder's reading, labeled as judgment.
- **A first attempt failed.** Both prompts were first run at 2026-10-07T02:59:55Z; each died after 39 turns on the account's session limit ("You've hit your session limit, resets 10:50pm (America/Vancouver)") with no verdict: old 202 s, 2,452,480 cache-read, 244,466 cache-write, 13,139 output tokens; new 248 s, 3,480,942 cache-read, 248,060 cache-write, 16,738 output tokens. Those partial runs are not the calibration and are recorded only so the spend is on the record.

## Cost of each run

| Field                              |           Old prompt |           New prompt |
| ---------------------------------- | -------------------: | -------------------: |
| Started (UTC)                      | 2026-10-07T05:54:45Z | 2026-10-07T05:54:45Z |
| Verdict                            |                 PASS |                 PASS |
| Turns                              |                   43 |                   36 |
| Wall seconds (`duration_ms`)       |                363.5 |                356.2 |
| Input tokens                       |                   26 |                   27 |
| Cache-write tokens                 |              262,783 |              250,545 |
| Cache-read tokens                  |            3,256,192 |            3,036,854 |
| Output tokens                      |               24,594 |               24,618 |
| Weighted (M equiv)                 |                0.777 |                0.740 |
| `total_cost_usd` as the CLI prints |                 4.87 |                 4.64 |

Difference: 0.037M weighted (4.8 percent) and 7 seconds in the new prompt's favour, from one pair of runs. The audit's estimate for C3 was 0.1 to 0.2M and 1 to 3 minutes per run [estimate, low confidence]; this pair does not confirm it, and one pair cannot refute it. Both runs cost more than the audit's midpoint of 0.45M per headless run (its estimate was made without any measurement; this is the first).

## Findings of each run, with the reviewer's grade

### Old prompt (open-ended): 0 Blocking, 2 Should-fix, 3 Consider

| #   | Grade      | Finding                                                                                                                                                                | Where the reviewer points                                                |
| --- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| O1  | Should-fix | `SystemContext.db` is typed `RlsClient`, so an unscoped transaction wears the RLS-scoped type; helpers typed on `RlsTransaction` cannot tell them apart                | `packages/services/src/context.ts:42,49`; `packages/db/src/rls.ts:27-30` |
| O2  | Should-fix | The user-to-payment binding (`client_reference_id`, `metadata.user_id` set server-side) is trusted in code comments only; Payment Links make the field client-settable | `validators/src/billing/billing.ts:26-28,51-54`; `remove/billing.md:71`  |
| O3  | Consider   | A refused second checkout is returned as `stale` and logged as a retry                                                                                                 | `entitlements.ts:169`; `apply-entitlement.ts:66-67`                      |
| O4  | Consider   | `past_due` cuts access before Stripe's dunning retries run                                                                                                             | `validators/src/billing/billing.ts:19`                                   |
| O5  | Consider   | A canceled row keeps its Stripe ids for the life of the account; no retention equivalent to the 30-day ledger prune                                                    | `remove/billing.md:67`                                                   |

Files the old run says it read beyond the planned paths: `handle.ts` and `dispatch.ts` (the STK-16 spine), the policy factory, the RLS bridge (`packages/db/src/rls.ts`), and the cited surface in full.

### New prompt (scoped, single-pass): 0 Blocking, 3 Should-fix, 4 Consider

| #   | Grade      | Finding                                                                                                                                                                                | Where the reviewer points                                                                                  |
| --- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| N1  | Should-fix | The as-built's gate for the unproven deny policy names the wrong event: exposure starts when `0002` is applied, not when a gate reads `isEntitled`; make `yarn test:db` a precondition | `as-built.md:31,39-41`; `packages/db/test/stripe-event-ledger.test.ts:162`                                 |
| N2  | Should-fix | The provenance constraint on the user-naming fields lives where the next builder (the Checkout route) will not read it; carry it as a non-negotiable and a runbook line                | `validators/src/billing/billing.ts:27-28,51-54`; `entitlements.ts:154-159,194-200`; `remove/billing.md:69` |
| N3  | Should-fix | `billing_entitlements` has no retention schedule for a canceled row                                                                                                                    | `remove/billing.md:65-67`; `entitlements.ts:154`                                                           |
| N4  | Consider   | A deliberate no-op reports itself as `stale`                                                                                                                                           | `entitlements.ts:169`; `apply-entitlement.ts:66-67`                                                        |
| N5  | Consider   | The same-second tie always resolves toward entitlement                                                                                                                                 | `entitlements.ts:127`                                                                                      |
| N6  | Consider   | `ENTITLED_STATUSES` is cast two ways in one file                                                                                                                                       | `entitlements.ts:95,266`                                                                                   |
| N7  | Consider   | `billing.event_invalid` logs an error built from an untrusted object                                                                                                                   | `apply-entitlement.ts:45`                                                                                  |

Every file the new run cites is a planned path, the cited surface's named line (`technical.md:48`), or an evidence file; it names no file outside them.

## The diff of findings (builder's matching, labeled as judgment)

| Old  | New        | Reading                                                                                                                                                      |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| O2   | N2         | The same finding, the same grade: the server-side provenance of the user-naming fields must be carried to the Checkout ticket and the runbook                |
| O3   | N4         | The same finding, the same grade: the `stale` outcome hides a second checkout                                                                                |
| O5   | N3         | The same finding; the old run graded it Consider, the new run Should-fix                                                                                     |
| O1   | none       | Found only by the old prompt, at a planned path (`context.ts`) with one hop to `rls.ts`; the new prompt's scope allowed it and the reviewer did not raise it |
| O4   | none       | Found only by the old prompt, at a planned path                                                                                                              |
| none | N1         | Found only by the new prompt: a wrong claim in the as-built, checked inside the changed files                                                                |
| none | N5, N6, N7 | Found only by the new prompt, all at planned paths                                                                                                           |

Blocking findings missed by the new prompt: none, because the old prompt found none. Warden was not consulted: the brief reserved the consult for a Blocking the old prompt found and the new one missed, and there was none.

Two things the diff says about the scope rule rather than about STK-21. The old run spent part of its budget on the STK-16 spine and the RLS bridge and brought back one Should-fix from that reading (O1 sits at a planned path, but its argument is the `rls.ts` contract); the new run never left the planned paths and spent the same output budget on more findings inside them, including the as-built error (N1) the old run did not catch. Neither run's extra findings were Blocking, which is what the single-pass rule depends on: everything below Blocking becomes a follow-up either way.

## What this does not settle

- Whether the new prompt catches a real Blocking: no run in this calibration or in the audit's window (0 of 11 post-PASS runs) has produced one, so the falsifier the audit named (a later run returning a Blocking an earlier PASS missed) stays open.
- The saving per run: one pair, 4.8 percent apart, inside between-run variance. Prompt 1's cost fields now record every run; a figure comes from those records, not from this pair.

## Appendix A: the old prompt's review, verbatim

- contract_sha256: 955619bf166fa52b369b7aea05b6390e1daea475e3dc3fbabb693949c065baf9
- as_built_sha256: 5c5d4bba572b91bf7b364445e31797a4aa407f2a84bd241878b1dd8cdec5d2e2
- head: 6960357f87944bc738a0db53355b0a6c7a845f9f
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-07T05:54:47Z
- verdict: PASS

I've read the contract, results, as-built, all four evidence files, every changed file in the ticket's planned paths, the STK-16 spine the handlers sit on (`handle.ts`, `dispatch.ts`), the policy factory, the RLS bridge, and the cited surface (`technical.md`, D-STK-11/13).

#### Criteria

**C1 — each default event reaches its handler, which calls the service with the right user and entitlement: met.**
Three handler files exist, one per event (`checkout-session-completed.ts`, `customer-subscription-updated.ts`, `customer-subscription-deleted.ts`), registered in `map.ts:10-14` and bound to the real service in `index.ts:25-31`. The tests drive real `Stripe.webhooks.generateTestHeaderString` signatures through `handleStripeWebhook` (`handlers.test.ts:23-42`), and `handle.ts:89-110` verifies the signature and livemode before any handler runs, so "signed and synthetic" is accurate rather than a stand-in for the spine. Evidence `C1.log` records `ok 5`, `ok 7`, `ok 8` for the three types plus the payment-mode skip, exit 0, 276 tests at HEAD `6960357`.

**C2 — an event for a customer with no matching user changes nothing and logs once: met.**
Service side: `completeCheckout` returns `no-user` before any insert when the user row is absent (`entitlements.ts:145`), and `syncSubscription` does the same when neither the customer link nor valid metadata names a user (`entitlements.ts:193-199`); both tests assert zero inserts (`entitlements.test.ts:104-110`, `162-170`). Handler side: one `log.warn("billing.no_user")` through `@pem/observability` (`apply-entitlement.ts:50`), with the test asserting exactly one line and its tags (`handlers.test.ts:187-200`, `ok 9` in the log). NN5 is satisfied.

**C3 — the full chain, check-stack and check-migrations: met.**
`C3.log` exit 0: `check-stack — 16 module(s); nothing missing, nothing left behind` against a `billing` entry that now lists all six new paths (`toolkit.json:388-403`), and `check-migrations: 3 migration(s) … none touch the auth schema`. The `warn STK-21 … C3/C4/review:* not PASS` line at `C3.log:18` is the expected mid-close state, not a failure.

**C4 — `stripe listen` end to end: not verified, correctly recorded.**
Recorded `--verdict deferred` with a concrete operator script (`C4-operator.md:12-25`) that leads with `yarn db:setup:local`. The as-built says plainly what this leaves unproven: `0002` has met no Postgres, so the ordering guard, the unique customer link, the cascade and the deny policy are proven as SQL text only. That is the honest framing, and `yarn test:db` carries the deny test waiting for it (`packages/db/test/stripe-event-ledger.test.ts:162-200`).

Non-negotiables hold: no handler or route touches the database (handlers take `BillingHandlerDeps`, `apply-entitlement.ts:12-16`); the only writes to `billing_entitlements` in product code are in the service; the service takes a context and raw input and validates before any query (`entitlements.ts:143`, `189`, proven by `entitlements.test.ts:130-141`); the table is `serviceOnlyPolicies` with RLS on and every user operation denied (`0002_billing_entitlements.sql:13-16`), with anon denied by RLS default; `remove/billing.md` and the manifest agree.

#### Findings

**Should-fix — the unscoped transaction wears the RLS-scoped type.** `packages/services/src/context.ts:42` types `SystemContext.db` as `RlsClient`, whose contract reads "Runs `callback` in one transaction, as the context's user, under RLS" (`packages/db/src/rls.ts:27-30`), but `createSystemContext` returns `{ execute: (callback) => db.transaction(callback) }` (`context.ts:49`) with no `set_config` and no `set local role`. The `system: true` tag added last round guards the context seam; it does not reach helpers typed on the transaction itself — `userExists` (`entitlements.ts:62`) and `currentLink` (`entitlements.ts:72`) take `RlsTransaction` and cannot tell a bridged transaction from an unscoped one. No live path today, since both helpers are private and the only `SystemContext` is built in the webhook. The adversary is the next refactor: the first shared `getRow(tx: RlsTransaction, …)` helper reused from a system caller reads across users with nothing complaining. Put the control in the type, not the comment — a distinct `UnscopedClient`/`SystemTransaction` in `@pem/db/rls` that `RlsTransaction` is not structurally assignable to.

**Should-fix — the user-to-payment binding is trusted in code comments, not where the next builder reads.** The only thing tying an entitlement to a person is `client_reference_id` (`checkout-session-completed.ts:26`) and `subscription_data.metadata.user_id` (`subscription.ts:19`). Both are trustworthy only if the checkout-creating route — out of scope here, and not yet written — sets them server-side from the session. That requirement currently lives in three comments (`validators/src/billing/billing.ts:26-28` and `:51-54`, `checkout-session-completed.ts:3-7`), and the one operator-facing section about running billing, `docs/runbooks/remove/billing.md:71` ("While billing is in use"), does not carry it. The path matters because Stripe Payment Links accept `client_reference_id` as a URL query parameter: an attacker who pays through such a link naming a victim's uuid links that victim's row to the attacker's Stripe customer. If a later ticket adds a portal link keyed on the row's `stripe_customer_id`, the victim opens a portal onto the attacker's payment method, invoices and billing address, and the attacker holds the switch on the victim's plan. Record the constraint in the runbook and on the epic's technical surface, naming Payment Links as the way that field becomes client-settable, so the ticket that creates the checkout inherits it rather than rediscovering it.

**Consider — a refused second checkout is logged as a retry.** When an unpaid checkout for a second subscription declines to downgrade a live one, the service returns `stale` (`entitlements.ts:169`), which the handler logs as `billing.stale_event` at info (`apply-entitlement.ts:66-67`). Nothing is stale: someone started a second subscription while holding one, and it is indistinguishable in the logs from an ordinary Stripe redelivery. Give it its own outcome and event, as `superseded` got, so it is countable when a double-charge question arrives.

**Consider — `past_due` cuts access the same hour.** `ENTITLED_STATUSES` is `active` and `trialing` (`validators/src/billing/billing.ts:19`), so a renewal that fails on an expired card drops the plan immediately, before Stripe's dunning retries have run. Strict is the safe direction and no attacker benefits, but the person who pays loses access while Stripe is still trying their card. Worth a recorded product call on a grace period rather than leaving it as a side effect of the allowlist.

**Consider — a canceled row keeps its Stripe ids for the life of the account.** `docs/runbooks/remove/billing.md:67` states the lifecycle honestly (cascade on user delete, erasure answered in Stripe), and `stripe_events` has a 30-day prune, but `billing_entitlements` has no equivalent: a subscription canceled years ago still holds the customer, subscription and price ids. Note in the retention section whether a product in a strict regime should clear those ids once the dispute window closes, keeping only the status needed to recognise a returning subscriber.

The as-built's claims check out against the code, including each item it attributes to the previous review rounds: `system: true`, the metadata-names-a-linked-user mismatch (`entitlements.ts:200-213`), the subscription-matched late fill (`entitlements.ts:244-257`), the three alertable log events and the `reason` tag (`billing.md:71`), and the `current_period_end` comment that no longer promises post-cancellation access (`schema/billing/entitlements.ts:32`). Nothing here is Blocking. One standing condition, already named in the as-built: the first gate that reads `isEntitled` must not ship until C4 step 1 has run `yarn test:db` against Postgres, since the deny policy, the cascade and the unique customer link have so far only been read as SQL.

VERDICT: PASS

## Appendix B: the new prompt's review, verbatim

- contract_sha256: 955619bf166fa52b369b7aea05b6390e1daea475e3dc3fbabb693949c065baf9
- as_built_sha256: 5c5d4bba572b91bf7b364445e31797a4aa407f2a84bd241878b1dd8cdec5d2e2
- head: 6960357f87944bc738a0db53355b0a6c7a845f9f
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-07T05:54:47Z
- verdict: PASS

Read everything in order. Judgment follows.

#### Criteria

**C1 — met.** `handlers.test.ts` sends each of the three events as a signed synthetic payload through the real spine (`handleStripeWebhook`), not a stubbed dispatcher, and asserts the exact service input: user, customer, subscription, status, price, period end and the event's `created` time (`handlers.test.ts:101,145,171`). `map.ts:10-14` registers one file per event; `index.ts:25-31` binds the real service. Evidence `C1.log` exit 0, 276 tests, `# fail 0` in every suite, including the 44-test web suite and the 27-test services suite. Two extra cases earn their place: a payment-mode checkout calls nothing, and an unnamed `payment_status` reads as unpaid (`checkout-session-completed.ts:30-32` is an allowlist).

**C2 — met.** `C1.log:1992` records "an event for a customer with no matching user changes nothing and logs once", asserting exactly one `warn` line carrying the event type and id. The service side is proven separately for the checkout path and both subscription paths with no insert issued (`entitlements.test.ts:104,162`).

**C3 — met.** `C3.log` exit 0 at the recorded head, with `check-stack — 16 module(s); nothing missing, nothing left behind` (line 16) and `check-migrations: 3 migration(s)… none touch the auth schema` (line 17). The warn at line 18 is the expected mid-close notice, not a failure. The new partial index arrives in `0002`, not by editing the applied `0001` — correct migration discipline.

**C4 — not met, legitimately deferred.** Recorded `--verdict deferred` with the reason the contract itself states, and the as-built says plainly what that costs: the ordering guard, the unique customer link, the cascade and the deny policy are proven as SQL text against a scripted database, never by Postgres. That is an honest recorded deferral, not a hidden gap — see finding 1 for the one correction it needs.

**Non-negotiables.** All six hold. NN1: routed call 3 ratified (`technical.md:48`). NN3 verified by grep, not by the claim — the only non-test writer of `billing_entitlements` anywhere in the repo is `packages/services/src/billing/entitlements.ts`. NN4: `SystemContext` carries `system: true` and `ServiceContext` requires `userId`/`role`, so neither type can be passed where the other is taken (`context.ts:39-43`). NN6: I compared both lists line by line — all seven file entries, three variable names, one dependency and one boundary name match `toolkit.json:388-403`. Out of scope respected: `handle.ts` and `dispatch.ts` are untouched, and no Checkout route exists anywhere.

#### Findings

**1. Should-fix — the recorded gate for the unproven deny policy names the wrong event.** `as-built.md:31` says a C4 step-1 failure "blocks the first gate that reads `isEntitled`." Exposure begins earlier than that: the moment `0002_billing_entitlements` is applied to a tier holding real users, the table exists and `authenticated` reaches it, whether or not any gate reads it. If `serviceOnlyPolicies` emits anything but the migration's `USING (false) WITH CHECK (false)` under a live Supabase role set, a signed-in user writes their own row and grants themselves the plan. The deny test is written and strong — it asserts a user can neither read their own row nor update nor insert one (`packages/db/test/stripe-event-ledger.test.ts:162`) — it has simply never run. Make `yarn test:db` a precondition of applying `0002` anywhere but local, and say so at `as-built.md:31` and in its Migrations section (`as-built.md:39-41`).

**2. Should-fix — the provenance constraint on the user-naming fields lives only where the next builder will not read it.** `packages/validators/src/billing/billing.ts:54`. Adversary: a signed-in user who learns another user's uuid, which Supabase ids plausibly surface in app URLs or payloads. Path: a future Checkout route that takes the user id from the request → `subscription_data.metadata.user_id` → the metadata branch at `entitlements.ts:194-200` creates or relinks the victim's row to the attacker's customer → the victim's own paid checkout is then refused `entitled-elsewhere` (`entitlements.ts:154-159`), and when the attacker cancels, the victim loses a plan they paid for. Impact: a named person is denied an entitlement they bought, and an attacker steers someone else's billing state. The constraint is written twice (`billing.ts:27-28`, `:51-53`, and `as-built.md:17`) — but the Checkout route is a separate ticket and loads neither. Carry it where that builder will read it: a non-negotiable on the Checkout ticket, and a line in `docs/runbooks/remove/billing.md` under "While billing is in use" (line 69). Not Blocking: the route does not exist, nothing is applied, and the metadata branch earns its keep handling an update that beats its checkout.

**3. Should-fix — `billing_entitlements` has no retention schedule for a canceled row.** `docs/runbooks/remove/billing.md:67` gives the table only "deleted with the user," while `stripe_events` immediately above it (line 65) carries a 30-day prune. A user who subscribes, cancels and keeps their account retains a pointer to their Stripe customer, subscription and plan indefinitely. The answer may legitimately be "kept indefinitely, because the returning-subscriber path reads it" — that path is real (`entitlements.ts:154`). Either way it should be a decision with a reason rather than a silence.

**4. Consider — a deliberate no-op reports itself as `stale`.** `entitlements.ts:169` returns `{outcome: "stale"}` when an unpaid checkout names a second subscription while a live one entitles the user, which `apply-entitlement.ts:66-67` logs at info as `billing.stale_event`, outside the runbook's alert list. The condition is benign, but it is the signature of a user starting a second checkout — exactly what an operator would hunt for when investigating a double charge — filed under another name. A distinct outcome or a reason tag would make it findable.

**5. Consider — the same-second tie always resolves toward entitlement.** `entitlements.ts:127`. A granting event wins a tie; an ending one loses it. Stripe's `created` is second-granular, so a genuinely non-entitling state sharing a second with a granting event leaves the user holding the plan until the next subscription event. The bias favors the paying user and the reachable cases are narrow, but "money flows the user's way on a tie" is a standing decision that belongs in the record, not only in a code comment.

**6. Consider — `ENTITLED_STATUSES` is cast two ways in one file.** `as unknown as string[]` at `entitlements.ts:95` and `as readonly string[]` at `:266`. The double cast disables the type checker on the set that decides who holds a plan; one typed helper would serve both call sites.

**7. Consider — `billing.event_invalid` logs an error built from an untrusted object.** `apply-entitlement.ts:45`. Nothing on this path is sensitive content and `@pem/observability` redacts and scrubs (17 passing tests, `C1.log:153`), so the ceiling is a Stripe id or a malformed `client_reference_id` in an error log. Worth one look that the issue list carries field names and not received values, since this is the only log line here assembled from Stripe's payload.

Nothing I found is exploitable in the changed files as they stand: the table is service-only, unapplied, has no read API, and the one writer validates before it queries. The two Should-fix items are both about a protection written in the wrong place for who needs to read it next.

VERDICT: PASS

## Appendix C: the new prompt, as the reviewer received it

    Venue: Claude Code, headless, started by `yarn review:run warden STK-21`. You have Read, Grep, Glob only: you cannot edit or run anything.

    You are warden, reviewing ticket STK-21 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

    This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

    Read, in this order:
    1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
    2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/results.json. Each criterion's run record and evidence file.
    3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
    4. The evidence:
       - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C1.log (sha256 849c60a6c87a)
       - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C2.log (sha256 849c60a6c87a)
       - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C3.log (sha256 f1d8b4a6e01e)
       - C4 manual: specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/evidence/C4-operator.md (sha256 71ad87a067e8)
    5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/lib/billing/webhook/handlers/apply-entitlement.ts, apps/web/lib/billing/webhook/handlers/checkout-session-completed.ts, apps/web/lib/billing/webhook/handlers/customer-subscription-deleted.ts, apps/web/lib/billing/webhook/handlers/customer-subscription-updated.ts, apps/web/lib/billing/webhook/handlers/handlers.test.ts, apps/web/lib/billing/webhook/handlers/index.ts, apps/web/lib/billing/webhook/handlers/map.ts, apps/web/lib/billing/webhook/handlers/subscription.ts, apps/web/lib/billing/webhook/ledger.ts, docs/runbooks/remove/billing.md, packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/0002_billing_entitlements.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/0002_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/src/billing/stripe-event-ledger.ts, packages/db/src/schema/billing/entitlements.ts, packages/db/src/schema/billing/stripe-events.ts, packages/db/src/schema/index.ts, packages/db/test/stripe-event-ledger.test.ts, packages/services/package.json, packages/services/src/billing/entitlements.test.ts, packages/services/src/billing/entitlements.ts, packages/services/src/context.ts, packages/validators/package.json, packages/validators/src/billing/billing.ts, toolkit.json. Judge these changes against the criteria and the non-negotiables.
    6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Read only the parts the contract names (D-STK-11, D-STK-13), not the whole file.

    Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

    For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

    Your last line must be exactly one of:
    VERDICT: PASS
    VERDICT: FAIL
