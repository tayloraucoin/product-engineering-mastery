---
id: STK-18
size: small
objective: "Sentry wired in apps/web behind the vendor-free reporter seam, scrubbed, tiered and removable."
slice_type: "Observability; the risk is personal data leaving the app or a build that fails without a token."
non_negotiables:
  - "Sentry data region ratified by Taylor before the org is created."
  - "@sentry/nextjs owned by apps/web; packages import no vendor."
  - "Every dataCollection category set explicitly; beforeSend strips cookies, body, headers and query; user is an opaque id."
  - "Local tier sends nothing by default; staging and production use separate projects and DSNs by tier."
  - "A build without SENTRY_AUTH_TOKEN skips upload and succeeds."
  - "No tracing, replay, logs, feedback or profiling."
  - "remove-error-monitoring.md and the manifest entry are complete."
devs_call: "Tunnel route on or off."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-12"
  - "D-STK-16"
  - "D-STK-13"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - assay
  - mason
  - threshold
  - vigil
  - warden
planned_paths:
  - "apps/web/instrumentation.ts"
  - "apps/web/instrumentation-client.ts"
  - "apps/web/sentry.server.config.ts"
  - "apps/web/sentry.edge.config.ts"
  - "apps/web/lib/error-reporting/**"
  - "apps/web/app/global-error.tsx"
  - "apps/web/app/page.tsx"
  - "apps/web/next.config.ts"
  - "apps/web/proxy.ts"
  - "apps/web/env.ts"
  - "apps/web/package.json"
  - ".env.example"
  - "turbo.json"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/runbooks/remove-error-monitoring.md"
  - "yarn.lock"
  - "docs/engineering/tech-stack.md"
  - "tooling/check-client-bundle.ts"
  - "tooling/boundaries.test.ts"
  - "specs/_shared/epics/STK-default-stack/technical.md"
depends_on:
  - STK-5
  - STK-12
out_of_scope:
  - "PostHog exception capture (P-G)."
  - "React Native wiring."
criteria:
  - id: C1
    statement: "beforeSend removes cookies, body, headers and query strings and reduces user to an id, on a synthetic event."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The reporter registers only when a DSN resolves; on local nothing registers."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries pass with @sentry/nextjs owned by apps/web."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "A build with no SENTRY_AUTH_TOKEN passes the full chain."
    evidence: check
    command: "yarn verify"
  - id: C5
    statement: "A thrown error on staging appears in the staging project with the commit release."
    evidence: manual
    reason: "needs the hosted project"
  - id: C6
    statement: "Following remove-error-monitoring.md on a scratch copy leaves grep for sentry empty and verify green."
    evidence: manual
    reason: "a removal rehearsal on a copy is done by a person"
  - id: review:assay
    statement: Assay reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run assay <id>
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
  - id: review:threshold
    statement: Threshold reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run threshold <id>
tier: 2
---

# Contract — STK-18 error-monitoring

## Notes

The wiring list is technical.md D-STK-12; the Technical stage read the vendor note and settled it there. Verify SDK version and dataCollection shapes on the day.
