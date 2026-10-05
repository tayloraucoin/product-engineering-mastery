---
title: "Remove billing — a removal runbook"
description: "Follow from step 4 of new-project/README.md when the briefing drops Billing (Stripe); delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes:
load_when:
---

# Remove billing

> **Module:** Stripe in the web app (D-STK-11: the webhook route, its dispatcher and one handler per event, with idempotency), the entitlement service, and the `stripe` SDK, owned by the web app (D-STK-16).
> **Built by:** STK-16 built the webhook spine (route, dispatcher, ledger, keys, SDK ownership), which the lists below cover; STK-21 adds the handlers and entitlements, and its lines. Nothing here is guessed ahead of the code.
> **Run from:** step 4 of [`new-project/README.md`](../new-project/README.md).

## Files to delete

From the module's `files` list in `toolkit.json`:

- `apps/web/app/api/webhooks/stripe/` (the route)
- `apps/web/lib/billing/` (the client, the dispatcher, the handler map, the ledger binding and their tests)
- `packages/db/src/schema/billing/` (the `stripe_events` table)
- `packages/db/src/billing/` (the ledger's writes)
- `packages/db/test/stripe-event-ledger.test.ts`

STK-21 adds the handlers' and entitlements' files.

## Files to edit

- `packages/db/src/schema/index.ts`: delete the `billing/stripe-events.ts` re-export.
- `packages/db/package.json`: delete the `./stripe-event-ledger` export.
- `apps/web/env.ts`: delete the `STRIPE_*` raw reads, `stripeWebhookSecret`, the three schema entries and their `runtimeEnv` lines, and the `keyModeProblem` import if nothing else uses it.
- `apps/web/proxy.ts`: delete `api/webhooks/stripe|` from the matcher.
- `tooling/check-client-bundle.ts`: delete the `STRIPE_SECRET_KEY` entry in `SENTINEL_PREFIX`.
- `tooling/boundaries.test.ts`: delete the STK-16 probes (`stripe` from services, db and `apps/web/lib/billing`).
- `package.json`: delete the `stripe:listen` script.
- `docs/engineering/tech-stack.md`: delete the `stripe` row.
- `packages/db/migrations/`: never delete an applied migration. Run `yarn db:generate` after the schema edit; it writes a migration that drops `stripe_events`.

## Variables

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRICE_ID`, each with its `_LOCAL` and `_STAGING` forms: delete them from `.env.example`, `turbo.json`'s `globalEnv` and every host's environment.

## Dependencies

`stripe` in `apps/web/package.json`; then `yarn install`.

## Boundaries entries

`stripe`: delete `stripe: "app-web"` from `SDK_OWNERS` in `packages/config/eslint/boundaries.js` (D-STK-16). Billing has no element of its own.

## Vendor-side steps

- In each Stripe account (test and live), delete the webhook endpoint that points at `/api/webhooks/stripe` (Developers, Webhooks), so Stripe stops retrying deliveries to a route that is gone.
- Roll the secret key if it lived anywhere but the host's environment.

## Retention and erasure

`stripe_events` keeps an event id, its type and two timestamps, never the payload. Each row still points, through Stripe, at a person's payment, so it is personal data held indirectly. An erasure request is answered in Stripe, which holds the event; the row here holds nothing of the person's beyond that pointer, and the prune below removes it. Have counsel confirm this reading once the product has users in a jurisdiction. STK-21 adds the prune of `processed` rows older than 30 days, well past Stripe's three-day retry window.

## Verify

1. In `toolkit.json`, set `"removed": true` on the `billing` entry in `stack`.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
