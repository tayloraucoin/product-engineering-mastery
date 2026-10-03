---
id: STK-16
size: small
objective: "Stripe billing in apps/web with one file per webhook event, keys by tier, removable by runbook."
slice_type: "Money; the risk is a wrong-mode key, a replayed event or an unverified webhook."
non_negotiables:
  - "stripe owned by apps/web in the boundaries lint."
  - "Keys and price ids resolve by tier (D-STK-3); the local webhook secret is picked when the code runs on localhost."
  - "The webhook route verifies the signature on the raw body, records the event id for idempotency, then dispatches."
  - "One handler file per event under lib/billing/webhook/handlers; the dispatcher is a map, not a switch."
  - "Entitlement changes are a service; the route never writes the database directly."
  - "yarn stripe:listen forwards to the local route."
  - "remove-billing.md and the manifest entry are complete."
devs_call: "Which three events the starter handles by default."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-11"
  - "D-STK-4"
  - "D-STK-13"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "apps/web/app/api/webhooks/stripe/**"
  - "apps/web/lib/billing/**"
  - "apps/web/env.ts"
  - "apps/web/package.json"
  - "packages/services/src/billing/**"
  - "packages/db/src/schema/billing/**"
  - "packages/db/migrations/**"
  - ".env.example"
  - "turbo.json"
  - "package.json"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/runbooks/remove-billing.md"
depends_on:
  - STK-13
  - STK-15
out_of_scope:
  - "Checkout and portal UI beyond redirect links."
  - "Stripe Connect, affiliates, tax."
criteria:
  - id: C1
    statement: "A webhook with a bad signature is rejected and a replayed event id is ignored."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Each default event reaches its handler file and the entitlement service with a signed synthetic event."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries pass with stripe owned by apps/web."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Types, migrations check and build pass."
    evidence: check
    command: "yarn verify"
  - id: C5
    statement: "stripe listen delivers a test event to the local route end to end."
    evidence: manual
    reason: "needs the Stripe CLI and a test account"
---

# Contract — STK-0 billing-stripe

## Notes

The audited repo's dispatcher, handlers, idempotency and entitlement shape is the reference; carry the shape, not its products.
