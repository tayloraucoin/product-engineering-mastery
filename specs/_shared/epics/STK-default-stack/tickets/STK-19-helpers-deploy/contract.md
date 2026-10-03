---
id: STK-19
size: small
objective: "Phone testing over the LAN, the contrast audit on the preset, and a Vercel config for the workspace build."
slice_type: "Developer and deploy tooling; the risk is a stale helper nobody runs."
non_negotiables:
  - "yarn web:dev:local binds all interfaces and prints the LAN URLs; allowedDevOrigins reads the helper."
  - "yarn contrast-audit fails on a token pair under the WCAG AA ratio and runs in verify."
  - "apps/web/vercel.json installs with corepack and builds through turbo with the web filter."
  - "CI runs the same verify as local."
devs_call: "Helper file names."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-19"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "tooling/local-dev-origins.ts"
  - "tooling/print-local-urls.ts"
  - "tooling/contrast-audit.ts"
  - "tooling/contrast-audit.test.ts"
  - "package.json"
  - "apps/web/next.config.ts"
  - "apps/web/vercel.json"
  - ".github/workflows/ci.yml"
  - "README.md"
depends_on:
  - STK-6
out_of_scope:
  - "Hosting choices beyond Vercel."
  - "Preview-deployment env matrices; the guide documents the Vercel variable table."
criteria:
  - id: C1
    statement: "The contrast audit fails a fixture pair below 4.5:1 and passes the preset."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "The full chain passes with the audit in it."
    evidence: check
    command: "yarn verify"
  - id: C3
    statement: "A phone on the same network opens the dev server at the printed URL."
    evidence: manual
    reason: "needs a second device"
---

# Contract — STK-0 helpers-deploy

## Notes

Port the two helpers from the audited repos into tooling/, re-scoped; they are repo scripts, not a package.
