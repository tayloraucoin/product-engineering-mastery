---
id: STK-5
size: small
objective: "Shared constants, a logger with one convention, a vendor-free error-reporter seam and the README-only seams."
slice_type: "Foundation packages; the risk is a grab-bag package or a logger that leaks data."
non_negotiables:
  - "@pem/constants and @pem/observability import nothing above config."
  - "createLogger has one call shape and never logs secrets, request bodies or personal data."
  - "registerErrorReporter with a no-op default; logger.error hands the error to it."
  - "Analytics is a typed stub with no vendor."
  - "packages/utils, packages/types and packages/hooks hold only a README stating their convention and when they become packages."
  - "No misc, helpers or lib module anywhere."
devs_call: "Logger output format and the constant files' names."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-1"
  - "D-STK-12"
  - "D-STK-16"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/constants/**"
  - "packages/observability/**"
  - "packages/utils/README.md"
  - "packages/types/README.md"
  - "packages/hooks/README.md"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/engineering/codebase-conventions.md"
  - "docs/engineering/tech-stack.md"
depends_on:
  - STK-2
out_of_scope:
  - "PostHog or any analytics vendor (P-G)."
  - "Sentry wiring (STK-18)."
criteria:
  - id: C1
    statement: "logger.error passes the error, tags and user id to the registered reporter and swallows a reporter failure."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A log call with a secret-like key (password, token, authorization) is redacted."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries pass with the two packages at the foundation layer."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Each of the three README seams states its folder's convention and the module that turns it into a package."
    evidence: manual
    reason: "a convention statement is a reading judgment, and no docs lint scans packages/"
  - id: C5
    statement: "Types and build pass."
    evidence: check
    command: "yarn verify"
---

# Contract — STK-5 constants-observability

## Notes

The README seams are folders without package.json; boundaries gain a row only when a package exists.
