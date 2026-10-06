# Review — warden on STK-16

> Written by `yarn review:run warden STK-16`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d874b6df3d5cfc74b9e48668fc27a128b90107279ec073eb86899ecb11f8e1db
- as_built_sha256: 717785f033ae506d9e465d8128a1a514622e3515d93780cf50e415773272a549
- head: f47897ca3cec2a6fe3667a417d0061ae1a26206c
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T04:22:21Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-16`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-16 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C1.log (sha256 795f60b4fd66)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C2.log (sha256 b10405aa29a3)
   - C3 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C3.log (sha256 650ad304cc5f)
   - C4 test: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C4.log (sha256 733f13f0a572)
   - C5 check: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C5.log (sha256 a3da1f9fe745)
   - C6 check: specs/_shared/epics/STK-default-stack/tickets/STK-16-billing-stripe/evidence/C6.log (sha256 7f5fcf7ac861)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/api/webhooks/stripe/route.ts, apps/web/env.ts, apps/web/lib/billing/stripe.ts, apps/web/lib/billing/webhook/dispatch.ts, apps/web/lib/billing/webhook/handle.test.ts, apps/web/lib/billing/webhook/handle.ts, apps/web/lib/billing/webhook/handlers/index.ts, apps/web/lib/billing/webhook/ledger.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/tech-stack.md, docs/runbooks/remove-billing.md, package.json, packages/config/eslint/boundaries.js, packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/package.json, packages/db/src/billing/stripe-event-ledger.ts, packages/db/src/schema/billing/stripe-events.ts, packages/db/src/schema/index.ts, packages/db/test/stripe-event-ledger.test.ts, tooling/boundaries.test.ts, tooling/check-client-bundle.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I have what I need. Both prior Should-fix items are fixed in code; one Consider turned out to be assigned to a contract that doesn't carry it.

## Criteria

**C1 — bad signature rejected, replayed id ignored: met.** `handle.ts:82-99` rejects a missing `stripe-signature` and a failed `constructEventAsync` with 400 before any read or write; `handle.ts:124-127` answers 200 `duplicate` once the ledger holds the id as `processed`. Seven tests cover a forged secret, a body changed after signing, no header, replay, a live claim, a wrong-mode event and no configured secret, each asserting `seen` and `store.calls` are empty (`handle.test.ts:85-221`). C1.log exit 0, 203 tests, the suite at lines 843-1374, no `not ok` in any evidence file. Stripe's 300 s timestamp tolerance is not overridden, so a captured delivery cannot be replayed outside the window either.

**C2 — signed event reaches its mapped handler through a fixture map: met.** `handle.test.ts:225-256` sends two signed types to two fixture handlers and asserts the call order `claim, mark, claim, mark` — the id is recorded only after the handler returns, matching `handle.ts:134` then `151`.

**C3 — unmapped type acknowledged 2xx, dispatched nowhere: met.** `handle.ts:111-115` returns 200 `ignored` before the ledger is touched; `dispatch.ts:31` uses `Object.hasOwn`, so `constructor` is not a handler (`handle.test.ts:277-291`). Not writing an ignored event is sound: there is nothing to make idempotent.

**C4 — throwing handler gets a retryable 5xx, id not recorded: met.** `handle.ts:133-148` logs, releases the claim and returns 500; the test proves the retry then runs the handler and reaches `processed` (`handle.test.ts:295-325`), and an unwritable ledger is 500 too. The release failing is itself caught (`handle.ts:139-146`), leaving the lease to lapse.

**C5 — boundaries pass with stripe owned by apps/web: met.** `boundaries.js:134` pins `stripe: "app-web"`, and `ownerName` (`:138-140`) renders an app owner as `apps/web`. `tooling/boundaries.test.ts:101-111` and `:242-244` probe the ban from `@pem/services` and `@pem/db` and the pass from `apps/web/lib/billing`; C6.log tests 20, 21 and 48 show all three. C5.log exit 0. No client component imports billing — the only two `"use client"` files in the app are unrelated.

**C6 — types, build, full chain, check-migrations: met.** C6.log exit 0, with `check-migrations: 2 migration(s) … none touch the auth schema` and `check-stack — 16 module(s)`. The in-log warning at line 26 naming C6 as "last run exited 1" is the snapshot `check-specs` took mid-run, before the record was written. `0001_stripe_events.sql` is additive and unapplied.

Non-negotiables all hold: keys and price ids by tier with the live/test prefix guard at the env seam (`env.ts:182-190`, proven in C1.log:83-136); the local webhook secret keyed on `productionRuntime` (`env.ts:119`), so `yarn web:dev` reads `_LOCAL` and a production build on any host reads the tier's; `yarn stripe:listen` to the local route (`package.json:60`); the `billing` manifest entry with its five file paths and an existing runbook (`toolkit.json:364-377`). The webhook is off the session proxy (`proxy.ts:50`), so the money path never waits on the auth seam. Card data never touches this infrastructure: the ledger holds an event id, a type and two timestamps, and the payload stays in Stripe. Every `STRIPE_*` name gets a planted sentinel scanned out of client chunks (`check-client-bundle.ts:88-89`), with `sk_test_` for the one env.ts validates by prefix.

A prober can still tell a configured endpoint (400) from an unconfigured one (500), but that split is forced: a 400 would make Stripe stop retrying. The response body no longer names configuration, which is the part that was in the team's gift.

## Findings

**Should-fix — `packages/db/src/schema/billing/stripe-events.ts:10-11`: the retention control is promised here and owed to a contract that does not carry it.** The schema comment and `docs/runbooks/remove-billing.md:63` both state that STK-21 prunes `processed` rows older than 30 days. STK-21's contract has no such criterion, non-negotiable or hint of one (`specs/_shared/epics/STK-default-stack/tickets/STK-21-billing-entitlements/contract.md:6-50`); its planned paths would allow the work, but nothing requires it, and criteria are frozen once cut. The adversary here is not an attacker but the subpoena and the breach: each row points, through Stripe, at one person's payment, so this is an indirect-identifier set kept for ever once handlers land. Low impact per row, unbounded in time, and the control evaporates silently the day STK-21 closes. Fix with `yarn contract:add STK-21` naming the prune, or record the retention as an accepted risk with a revisit trigger. Not blocking: no criterion of this ticket covers retention, and the data class does not justify holding the merge.

**Consider — `apps/web/lib/billing/webhook/handle.ts:78`: the unconfigured log misdescribes its own rule.** It reads "`STRIPE_WEBHOOK_SECRET_LOCAL` off a deployment", but the predicate is now `productionRuntime` (`env.ts:119`) — a deployment *or* any production build. An operator debugging 500s on a non-Vercel production host would follow this line to the wrong variable. One phrase.

**Consider — `apps/web/app/api/webhooks/stripe/route.ts:19`: the whole body is read before verification.** Vercel caps the request body, so exposure is bounded there; off Vercel nothing caps it and an unauthenticated POST makes the process materialize an arbitrary string. Same caveat as the finding above — if non-Vercel hosting is ever supported, bound the length before reading.

**Consider — `packages/db/test/stripe-event-ledger.test.ts:137`: the only RLS proof for this table sits outside every automated run.** That test is what proves a signed-in user, admin role included, reads and writes nothing; it runs only under `yarn test:db` (`packages/db/package.json:44`), which needs the local image, and the as-built records honestly that Docker was down. Nothing is exposed today — the policy is two reviewable lines (`0001_stripe_events.sql:10-11`: RLS on, deny-all for `authenticated`, no policy for `anon`) and the migration is unapplied — but route this file into whatever job runs `test:db` before the table exists anywhere. Until then the policy is reviewed, not proven.

**Consider — `apps/web/lib/billing/webhook/dispatch.ts:5-6`: the handler contract asks for idempotency but not for quiet errors.** `handle.ts:136` hands the caught error to `log.error`, which reaches Sentry; the scrubber redacts known personal-data keys, but a handler that interpolates a customer email or id into a message hands it to the vendor as free text. One line in this doc comment gives STK-21 something to build against.

Nothing here is a wrong-mode key, an unverified webhook, a replay that double-charges, or a private line reaching the wrong screen. Idempotency is correct under concurrency — the claim is taken before dispatch, the processed mark follows the handler, a stale lease is taken over rather than deadlocking — and the table is closed to users at the data layer.

VERDICT: PASS
