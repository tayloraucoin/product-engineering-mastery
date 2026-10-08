---
id: WEB-16
size: medium
objective: "Email addresses are normalised by one function, @pem/utils/email, the first module that turns packages/utils from a seam into a package, so the gate, erasure, the people list and grant-admin agree on one form."
slice_type: "A new workspace package on the personal-data path; the risk is an address matched in one form and stored in another, so a reviewer is refused or an erasure misses a person."
non_negotiables:
  - "normaliseEmail is pure: trim, then lower-case; no I/O, no environment, no framework (packages/utils/README.md)."
  - "packages/db keeps asserting the normalised form (EMAIL_NOT_NORMALISED) through isNormalisedEmail; it never normalises silently."
  - "@pem/utils imports only @pem/config, at the foundation layer of boundaries.js."
  - "No stored address changes; no migration."
devs_call: "Whether people.ts:234 (lower-case without trim) is a bug to fix here or a deliberate form; say which in as-built."
cites:
  - "D2"
truth_files: "none: no surface's behaviour changes"
qa: Q3
reviewers:
  - warden
focus:
  - "erasure and the gate: the same address matches before and after (warden)"
operator_review: false
planned_paths:
  - "packages/utils/package.json"
  - "packages/utils/tsconfig.json"
  - "packages/utils/eslint.config.mjs"
  - "packages/utils/src/email.ts"
  - "packages/utils/src/email.test.ts"
  - "packages/utils/README.md"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/engineering/codebase-conventions.md"
  - "apps/web/next.config.ts"
  - "apps/web/package.json"
  - "packages/db/package.json"
  - "apps/web/lib/sandbox/admin-data.ts"
  - "apps/web/lib/sandbox/admin-data-data.ts"
  - "apps/web/lib/sandbox/people.ts"
  - "apps/web/lib/sandbox/access-check.ts"
  - "apps/web/lib/sandbox/emails-used.ts"
  - "apps/web/app/admin/data/_components/erase-section.tsx"
  - "packages/db/src/sandbox/gate.ts"
  - "packages/db/src/sandbox/actions.ts"
  - "packages/db/src/sandbox/erasure.ts"
  - "packages/db/scripts/grant-admin.ts"
  - "yarn.lock"
depends_on: []
out_of_scope:
  - "Email format validation (zod stays in @pem/validators and lib/sandbox/validators.ts)."
  - "Any other module for @pem/utils."
criteria:
  - id: C1
    statement: "normaliseEmail trims and lower-cases; isNormalisedEmail is true only for its own output."
    evidence: test
    command: "yarn test --filter=@pem/utils"
  - id: C2
    statement: "The db sandbox suites pass with the assertions on isNormalisedEmail."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: "The web sandbox suites pass with every inline trim().toLowerCase() on an address replaced."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "@pem/utils resolves through its exports and imports nothing but @pem/config; .trim().toLowerCase() on an email identifier fails lint, naming normaliseEmail."
    evidence: check
    command: "yarn lint:boundaries"
---

# Contract — WEB-16 utils-normalise-email

## Build notes

- **Approach:** (audit: `specs/web/audits/2026-10-08-duplicated-logic.md`) follow "When it becomes a package" in `packages/utils/README.md` step by step, with `email.ts` as the first module; then replace the sites listed in the audit, D2.
- **Decisions that apply:** D-STK-1 (utils is a seam until its first module); codebase-conventions §1 (second consumer in another workspace extracts) and §4 (adding a package; utils is in the default stack, so no new record).
- **Interfaces:** `@pem/utils/email`: `normaliseEmail(value: string): string`, `isNormalisedEmail(value: string): boolean`.
- **Per path:** the utils files make the package; boundaries.js, toolkit.json and §4's row register it; next.config.ts adds it to transpilePackages; the rest call it.
- **Gotchas:** `packages/db/scripts/` runs on Node type stripping; the import must resolve there too. Run `yarn install` after adding the workspace.
- **Model:** Opus 5.5; the package scaffold has six registration points and a smaller model misses one.
