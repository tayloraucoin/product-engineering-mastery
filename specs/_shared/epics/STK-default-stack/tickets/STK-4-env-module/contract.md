---
id: STK-4
size: small
objective: "One tier switch resolves every environment value, validated once per app."
slice_type: "Environment seam; the risk is a secret reaching a browser bundle or a production key on a local tier."
non_negotiables:
  - "DATABASE_ENVIRONMENT defaults to local; production is never a default."
  - "@pem/env is pure: it never reads process.env."
  - "apps/web/env.ts is the app's only process.env reader; next.config.ts collapses NEXT_PUBLIC_* names only."
  - "A Stripe key whose prefix does not match the tier fails validation."
  - "The site URL is localhost whenever the code runs outside a deployment."
  - ".env.example lists every variable with a comment saying what breaks without it; turbo.json lists the same names."
  - "yarn verify runs yarn test and yarn check-client-bundle."
devs_call: "File layout inside packages/env and the exact zod shapes."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-3"
  - "D-STK-4"
  - "D-STK-16"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/env/**"
  - "apps/web/env.ts"
  - "apps/web/lib/env/**"
  - "apps/web/next.config.ts"
  - ".env.example"
  - "turbo.json"
  - "package.json"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "AGENTS.md"
  - "docs/engineering/codebase-conventions.md"
  - "tooling/check-client-bundle.ts"
  - "tooling/check-client-bundle.test.ts"
  - "tooling/fixtures/client-bundle/**"
depends_on:
  - STK-2
out_of_scope:
  - "Vendor keys beyond the picker's generic shape; Stripe, Supabase and Sentry variables arrive with their tickets."
  - "Env pull or sync tooling."
criteria:
  - id: C1
    statement: "The picker returns the local, staging and production value for each tier and the unsuffixed value when a tier value is absent."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A live-mode Stripe key on local or staging, and a test-mode key on production, fail validation with the variable named."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries pass with @pem/env placed below every package that reads it."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Types pass across apps and packages."
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "check-client-bundle fails a fixture client chunk holding a server-only sentinel, and fails when no build output exists."
    evidence: test
    command: "yarn test:tooling"
  - id: C6
    statement: "The full chain passes; its bundle check builds apps/web with each server-only variable set to a unique sentinel and finds none in a client chunk."
    evidence: check
    command: "yarn verify"
---

# Contract — STK-4 env-module

## Notes

Carry the generic picker from the audited repos' connection-env.ts, re-scoped. The root `yarn test` script exists; this ticket adds it to verify. Update the AGENTS.md line that says no app reads environment variables.
