---
id: STK-16
size: small
objective: "The Stripe webhook spine in apps/web: keys by tier, a verified and idempotent route, and a dispatcher whose unhappy paths are safe."
slice_type: "Money; the risk is a wrong-mode key, a replayed event, an unverified webhook or an endless retry."
non_negotiables:
  - "stripe owned by apps/web in the boundaries lint."
  - "Keys and price ids resolve by tier (D-STK-3); the local webhook secret is picked when the code runs on localhost."
  - "The webhook route verifies the signature on the raw body, records the event id for idempotency, then dispatches; it writes nothing else to the database."
  - "The event id is recorded as processed only after its handler succeeds."
  - "The dispatcher is a map from event type to a handler file under lib/billing/webhook/handlers, not a switch."
  - "yarn stripe:listen forwards to the local route."
  - "The manifest entry lists this ticket's files; STK-21 completes it with remove-billing.md."
devs_call: "The processed-event table's columns and the retryable status code."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-11"
  - "D-STK-4"
  - "D-STK-13"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - assay
  - chancery
  - mason
  - threshold
  - vigil
  - warden
planned_paths:
  - "apps/web/app/api/webhooks/stripe/**"
  - "apps/web/lib/billing/webhook/**"
  - "apps/web/env.ts"
  - "apps/web/package.json"
  - "packages/db/src/schema/billing/**"
  - "packages/db/migrations/**"
  - ".env.example"
  - "turbo.json"
  - "package.json"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
depends_on:
  - STK-13
out_of_scope:
  - "The default event handlers and the entitlement service (STK-21)."
  - "Checkout and portal UI beyond redirect links."
  - "Stripe Connect, affiliates, tax."
criteria:
  - id: C1
    statement: "A webhook with a bad signature is rejected and a replayed event id is ignored."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A signed synthetic event reaches the handler its type maps to, through a fixture map."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "An event type with no handler is acknowledged with a 2xx and dispatched nowhere."
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "A handler that throws gets a retryable 5xx, and its event id is not recorded as processed."
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Boundaries pass with stripe owned by apps/web."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C6
    statement: "Types, build and the full chain pass, including check-migrations on the processed-event migration."
    evidence: check
    command: "yarn verify"
  - id: review:assay
    statement: Assay reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run assay <id>
  - id: review:chancery
    statement: Chancery reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run chancery <id>
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:threshold
    statement: Threshold reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run threshold <id>
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
tier: 2
---

# Contract — STK-16 billing-stripe

## Notes

Split from the original billing ticket at the Tickets gate; STK-21 carries the handlers and entitlements. The audited repo's dispatcher and idempotency shape is the reference; carry the shape, not its products.
