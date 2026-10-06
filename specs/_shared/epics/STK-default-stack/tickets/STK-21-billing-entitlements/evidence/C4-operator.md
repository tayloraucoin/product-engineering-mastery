# C4: stripe listen delivers a test event that changes a local user's entitlement end to end

Handed to the operator: it needs the Stripe CLI signed in to a Stripe test account, and a local database (`0002_billing_entitlements` has not been applied anywhere yet; the agent's machine had no database running on 2026-10-05).

## What the agent checked (2026-10-05, stripe 22.6.2)

- Each default event, signed with `Stripe.webhooks.generateTestHeaderString` and sent through `handleStripeWebhook`, reaches its own handler file, which calls the entitlement service with the user and state the event names (`apps/web/lib/billing/webhook/handlers/handlers.test.ts`).
- The service's queries, against a scripted database: a paid checkout links the user and makes them `active`; an older event is `stale`; a customer with no matching user, or linked to another user, changes nothing (`packages/services/src/billing/entitlements.test.ts`).
- The prune's integration test typechecks; it runs with `yarn test:db`.

## Steps for the operator

1. Prepare the local database: `yarn db:setup:local` on your own Postgres (no Docker needed), or `yarn db:local` with Docker. Then `yarn workspace @pem/db db:migrate` (applies `0001` and `0002`) and `yarn test:db`: the ledger tests, the prune and the entitlements deny included, pass.
2. Sign up a local user through `/auth/sign-in` on the local tier, and note their id from `public.users`.
3. In `apps/web/.env.local`: `STRIPE_SECRET_KEY_LOCAL` (an `sk_test_` key), and leave `yarn stripe:listen` to print `STRIPE_WEBHOOK_SECRET_LOCAL`; set it. Start `yarn web:dev` and `yarn stripe:listen`.
4. Create a test subscription Checkout for that user, with the same id in both places the handler reads:
   `stripe checkout sessions create --mode subscription -d "line_items[0][price]=<STRIPE_PRICE_ID_LOCAL>" -d "line_items[0][quantity]=1" -d "client_reference_id=<user id>" -d "subscription_data[metadata][user_id]=<user id>" --success-url http://localhost:3000`
   Open the returned `url`, pay with card `4242 4242 4242 4242`.
5. Watch `stripe listen` forward `checkout.session.completed` and `customer.subscription.updated` with 200s.
6. In the database: `select status, stripe_customer_id, price_id, current_period_end from billing_entitlements where user_id = '<user id>'` shows `active`.
7. Cancel it: `stripe subscriptions cancel <sub id>`. The row's status becomes `canceled`.

## What should be seen

- Step 6: one row, `active`, with the customer and price. Step 7: `canceled`. Record both with the date.
