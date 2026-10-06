# As-built — STK-16

## Shipped against the contract

- C1: `handleStripeWebhook` (`apps/web/lib/billing/webhook/handle.ts`) verifies the signature on the raw body with `Stripe.webhooks.constructEventAsync`. A missing header, a wrong secret, a body changed after signing, or an event whose `livemode` is not the tier's gets 400, with nothing read or written. An event id the ledger holds as `processed` gets 200 `duplicate`, and its handler does not run again (`handle.test.ts`, signed with `generateTestHeaderString`).
- C2: the dispatcher is a typed map, `WebhookHandlers` (`dispatch.ts`), with one entry per event type, each handler narrowed to its own event. `handlers/index.ts` holds the app's map, which stays empty until STK-21. A fixture map in the test sends each signed event to its own handler, and only then marks the id processed.
- C3: a type with no entry gets 200 `ignored`, without touching the ledger. A type named like an object property (`constructor`) is not a handler: the lookup uses `Object.hasOwn`.
- C4: a handler that throws gets `RETRYABLE_STATUS` (500). Its claim is released and the id is never marked processed, so the retry runs the handler. A ledger that cannot be written also gets 500.
- C5: `stripe: "app-web"` is in `SDK_OWNERS`. A ban now names an app owner as `apps/web` (`ownerName`). `tooling/boundaries.test.ts` checks that importing `stripe` fails from `@pem/services` and `@pem/db` and passes from `apps/web/lib/billing`.
- C6: `packages/db/migrations/0001_stripe_events.sql` creates `stripe_events` with RLS and a service-only policy, and `check-migrations` passes. The full `yarn verify` chain runs at batch close.
- Non-negotiables:
  - `env.ts` picks `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` by tier, and refuses a key whose prefix does not fit the tier, through `keyModeProblem` (D-STK-4).
  - Under `yarn web:dev`, `STRIPE_WEBHOOK_SECRET_LOCAL` is always the secret read; anything that may serve real users (`productionRuntime`: a deployment or any production build) reads the tier's.
  - `yarn stripe:listen` forwards to `localhost:3000/api/webhooks/stripe`.
  - `toolkit.json` has a `billing` entry (unlocked, runbook `remove/billing.md`). The runbook now lists this ticket's files, edits, variables, dependency, boundaries row and vendor steps; STK-21 adds its own.

## Deviations

- devs_call, the processed-event table: `stripe_events` has the columns `id` (Stripe's event id, the primary key), `type`, `status` (`processing` | `processed`, with a check constraint), `claimed_at` and `processed_at`.
  - The route claims the id before dispatch. It marks the id `processed` only after the handler succeeds, and deletes the claim when the handler throws.
  - A live claim gives a second delivery 409, so one event is never handled twice at once.
  - A claim older than the 600 s lease is taken over (route `maxDuration` 60).
- devs_call, the retryable status: 500 for a failed handler, a failed ledger write, or a missing signing secret; 409 for an event already in flight. Stripe retries any non-2xx for three days.
- [ASSUMPTION] An event with no handler is not written to the ledger; there is nothing to make idempotent.
- [ASSUMPTION] One `STRIPE_PRICE_ID` per tier is the starter's single plan. STK-21 or the product adds more.
- [ASSUMPTION] `stripe` is 22.6.2, not 23.0.0, because 23.0.0 is still under the week-long age gate.
- [ASSUMPTION] The ledger's SQL lives in `@pem/db` (`@pem/db/stripe-event-ledger`), so `apps/web` needs no `drizzle-orm` import. The billing `boundaries` entry lists `stripe`, its `SDK_OWNERS` key, since billing has no element of its own. The migration is not in the manifest's `files`: removal drops the table with a new migration and never deletes an applied one (STK-21's runbook).
- `tooling/check-client-bundle.ts` plants `sk_test_`-prefixed sentinels for `STRIPE_SECRET_KEY`, so the key guard passes the sentinel build.
- Review fixes (all six reviews passed; these are their Should-fixes):
  - The event's `livemode` must match the tier (chancery): a signing secret carries no mode.
  - A missing secret answers `failed`, naming no configuration (warden).
  - The webhook secret keys on `productionRuntime`, not `deployed` (mason, warden, assay).
  - `remove/billing.md` no longer claims the module is unbuilt (assay, mason).
  - The ledger test is in the manifest (assay).
  - `/api/webhooks/stripe` is off the session proxy (chancery, vigil, mason).
  - Retention is stated: STK-21 prunes `processed` rows older than 30 days, and the runbook answers erasure (chancery, warden, mason).
  - The route imports through `@/`.
- Left for the operator: C6's command is `yarn verify`, which `.claude/rules/specs.md` keeps out of criteria (assay, vigil). The frozen criteria can only grow, so the contract stays as cut.
- Planned paths were added for `apps/web/lib/billing/**`, `packages/db/src/billing/**`, the schema index, `packages/db/package.json`, the ledger test, the boundaries test, the bundle check, `tech-stack.md`, `yarn.lock`, `remove/billing.md` and `apps/web/proxy.ts`.
- The spine landed in `3ceeb8e`, under an STK-14 message, after a `git commit` in a parallel thread swept the shared index. `50fd186` carries the formatting fix-ups under STK-16. History was left alone.

## Not verified

- `packages/db/test/stripe-event-ledger.test.ts` (claim, replay, live and stale claims, release, RLS) typechecks but has not run: Docker was not running here, so `yarn test:db` had no local image.
- No real Stripe event has been forwarded by `yarn stripe:listen`; the Stripe CLI and a test account are Taylor's. Vigil's runtime checklist (review-vigil.md) is the script for it.
- review:assay, review:chancery, review:mason, review:threshold, review:vigil and review:warden are recorded by `yarn review:run`.

## Next

With the local image up, run the ledger test, then forward one test event through `stripe listen` before STK-21 adds the handlers.

## Migrations

applied: pending

`0001_stripe_events` creates `stripe_events`; no tier has run it yet.
