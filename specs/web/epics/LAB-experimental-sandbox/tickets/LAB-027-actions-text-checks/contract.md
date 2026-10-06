---
id: LAB-27
size: small
objective: "sandbox_actions refuses free text in action and a malformed target_email in SQL, as counts already is, and the slug check helper has a verb-first name."
slice_type: "Schema hardening on the one sandbox table erasure never reaches; the risk is an email written into a kept row."
non_negotiables:
  - "One forward migration from yarn db:generate, numbered after the branch's latest; no applied migration edited."
  - "action matches ^[a-z]+(-[a-z]+)*$ in a SQL check; target_email is null unless action is role-change, and then lower-case with an @."
  - "slugIsValid in packages/db/src/schema/sandbox/columns.ts is renamed verb-first (buildSlugCheck), every caller updated."
devs_call: "The exact check SQL and the new name."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md"
truth_files: "none: schema only"
qa: Q3
reviewers:
  - mason
  - warden
focus: []
operator_review: false
planned_paths:
  - "packages/db/src/schema/sandbox/**"
  - "packages/db/migrations/**"
  - "packages/db/test/sandbox/schema.test.ts"
depends_on:
  - LAB-1
  - LAB-3
out_of_scope:
  - "recordAction's code checks: LAB-3 has them."
criteria:
  - id: C1
    statement: "On the local database, an action with free text or an email as action, or a target_email on any action but role-change, is refused by a named check."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C2
    statement: "The new migration touches no auth-schema object."
    evidence: check
    command: "yarn check-migrations"
---

# Contract — LAB-27 actions-text-checks

## Build notes

- From the LAB-1 final review (mason, should-fix): `action` and `target_email` are unconstrained text on `sandbox_actions`, which is kept forever and outside every cascade. `counts` was closed in SQL for that reason (`sandbox_actions_counts_check`); close these two the same way, matching LAB-3's `recordAction` rules (`ROLE_CHANGE_ACTION`).
- Also from that review: `slugIsValid` is the only `xIsY` name in the repo and returns SQL, not a boolean; rename it verb-first.
