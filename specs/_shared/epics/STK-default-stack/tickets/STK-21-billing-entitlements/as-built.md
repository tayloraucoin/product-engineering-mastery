# As-built — STK-21

## Shipped against the contract

- C1: three handler files under `apps/web/lib/billing/webhook/handlers/`, one per default event, registered in `map.ts` and bound to the real service in `index.ts`. Each reads its verified event and calls the entitlement service with the user and state the event names (`handlers.test.ts`, signed synthetic events through `handleStripeWebhook`).
- C2: an event whose customer matches no user changes nothing; the service answers `no-user` and the handler logs `[billing] billing.no_user` once, with the event's type and id (`handlers.test.ts`, `entitlements.test.ts`).
- C3: `yarn verify` passes, `check-stack` finding the billing entry's new paths and `check-migrations` passing `0002_billing_entitlements`.
- NN1, NN3: handlers take the service as a dependency and never import the database; the only writes to `billing_entitlements` are in `packages/services/src/billing/entitlements.ts`.
- NN4: the service takes a `SystemContext` and raw input, and validates the input with `@pem/validators/billing` before any query.
- NN6: `remove/billing.md` and the `billing` entry in `toolkit.json` list the new files, exports, edits and the table; the retention section covers both tables.

## Deviations

- [ASSUMPTION] The devs_call, the three events: `checkout.session.completed` (links the user to the customer; `active` when paid, `incomplete` otherwise; payment-mode checkouts ignored), `customer.subscription.updated` (status, price, period end) and `customer.subscription.deleted` (`canceled`).
- [ASSUMPTION] The devs_call, the table: `billing_entitlements` with `user_id` (primary key, cascade on user delete), `stripe_customer_id` (unique), `stripe_subscription_id`, `price_id`, `status` (Stripe's), `current_period_end`, `stripe_event_at` and `updated_at`. `isEntitled` reads `active` and `trialing` as entitled.
- [ASSUMPTION] The table is service-only (`serviceOnlyPolicies`): a user who could write their own row could grant themselves the plan. There is no read yet; the first gate reads the signed-in user's own row, never an id a caller passes (the service's comment says so).
- [ASSUMPTION] The user comes from the checkout the app creates: `client_reference_id`, and `subscription_data.metadata.user_id` so a subscription event that beats its checkout still finds the user. A customer already linked to one user is never moved to another (`customer-mismatch`, logged as an error).
- [ASSUMPTION] Ordering: every write is an upsert guarded by the event's `created` time, so a retry rewrites the same row and a late, older event changes nothing (`stale`), except that a late subscription event fills a plan or period still empty, since the checkout carries neither.
- A subscription's `metadata.user_id` that is not a uuid is read as no user rather than rejecting the event, so a cancellation is never dropped over a field the customer link makes unneeded.
- [ASSUMPTION] An event the validator refuses (a malformed `client_reference_id`, say) is logged as an error and acknowledged, since Stripe would resend the same object for three days; a database failure is still retried (500).
- `SystemContext` (`packages/services/src/context.ts`) is new: a context with no user, running on the singleton outside row-level security, for a caller whose source is proven another way. NN4 says the service takes ctx "like every service"; a webhook has no signed-in user, so this is the context it takes.
- STK-16 promised this ticket the ledger's retention: `pruneStripeEvents` deletes `processed` rows older than 30 days, run best-effort after each processed delivery in `ledger.ts`, on a partial index (`stripe_events_processed_at_idx`) so it never scans the table.
- From Vigil's review: the fixes above (metadata, late fill, no unscoped read, the index), a deny test for `billing_entitlements` in `yarn test:db`, `handlers/deps.ts` renamed `apply-entitlement.ts`, and C4's steps lead with `yarn db:setup:local`. Left as recorded: one row per user, so a second subscription overwrites the first (a product selling seats or add-ons reshapes the table), and a customer link that disagrees with the subscription's metadata wins silently.
- Planned paths added: `packages/services/src/context.ts`, both packages' `package.json`, `packages/db/src/schema/index.ts`, `packages/db/src/billing/**`, `packages/db/test/stripe-event-ledger.test.ts` and `apps/web/lib/billing/webhook/ledger.ts`.
- Out of scope, as the contract says: creating the Checkout session (the app must set `client_reference_id` and the metadata), the portal, and gating any feature on `isEntitled`.

## Not verified

- C4 (manual, deferred): needs the Stripe CLI, a test account and the local database. Steps in `evidence/C4-operator.md`.
- The prune's and the entitlements deny's integration tests are written and typecheck but have not run: no local database was up, so `yarn test:db` had nothing to reach.

## Next

Taylor prepares a local database and runs C4; a product adds the Checkout route that sets `client_reference_id` and `subscription_data.metadata.user_id`.

## Migrations

applied: pending

`0002_billing_entitlements` creates `billing_entitlements` with RLS and a service-only policy; no tier has run it yet.
