---
id: STK-21
size: small
objective: "The three default Stripe events change a user's entitlements through a service, and billing is removable by runbook."
slice_type: "Money; the risk is an entitlement written outside the service or granted to the wrong user."
non_negotiables:
  - "Precondition: Taylor answers routed call 3 (technical.md) before this ticket starts; declined, the services path is re-drafted with STK-13."
  - "One handler file per default event under apps/web/lib/billing/webhook/handlers, each registered in STK-16's map."
  - "Each handler calls the entitlement service; no handler or route writes the database directly."
  - "The entitlement service lives in packages/services/src/billing and takes ctx and validated input like every service."
  - "A handler for a customer with no matching user changes nothing and is logged through @pem/observability."
  - "remove/billing.md lists every file, variable and dependency; the manifest entry matches it."
devs_call: "Which three events the starter handles by default, and the entitlement table's columns."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-11"
  - "D-STK-13"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - vigil
  - warden
planned_paths:
  - "apps/web/lib/billing/webhook/handlers/**"
  - "packages/services/src/billing/**"
  - "packages/validators/src/billing/**"
  - "packages/db/src/schema/billing/**"
  - "packages/db/migrations/**"
  - "toolkit.json"
  - "docs/runbooks/remove/billing.md"
  - "packages/services/src/context.ts"
  - "packages/services/package.json"
  - "packages/validators/package.json"
  - "packages/db/src/schema/index.ts"
  - "packages/db/src/billing/**"
  - "packages/db/test/stripe-event-ledger.test.ts"
  - "apps/web/lib/billing/webhook/ledger.ts"
depends_on:
  - STK-16
out_of_scope:
  - "Checkout and portal UI beyond redirect links."
  - "Proration, trials and tax rules beyond what the three events carry."
  - "Any change to the route, signature check or dispatcher (STK-16)."
criteria:
  - id: C1
    statement: "Each default event, signed and synthetic, reaches its handler file, which calls the entitlement service with the right user and entitlement."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "An event for a customer with no matching user changes no entitlement and logs once."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The full chain passes, with check-stack finding every file the billing entry lists and check-migrations passing the entitlement migration."
    evidence: check
    command: "yarn verify"
  - id: C4
    statement: "stripe listen delivers a test event that changes a local user's entitlement end to end."
    evidence: manual
    reason: "needs the Stripe CLI and a test account"
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
qa: Q3
---

# Contract — STK-21 billing-entitlements

## Notes

Split from STK-16 at the Tickets gate (Vigil finding 11, size).
