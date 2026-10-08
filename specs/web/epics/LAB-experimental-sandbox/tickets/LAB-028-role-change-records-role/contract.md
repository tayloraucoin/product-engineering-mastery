---
id: LAB-28
size: small
objective: "Each role-change row in the record of actions says which role the team member was given, so the Data page reads 'ana@example.com made ben@example.com a developer', not only that a role changed."
slice_type: "The record of actions (S12c, D-LAB-28) on the one kept sandbox table; the risk is free text or a reviewer's data reaching a row erasure never touches."
non_negotiables:
  - "The new role is one of APP_ROLES, from a closed list in recordAction and in SQL; never free text."
  - "Only a role-change row carries it, as only a role-change row carries target_email (LAB-3, LAB-27)."
  - "LAB-9's changeRoleAs passes it; nothing else in People changes."
devs_call: "Three action names (role-change-user, -developer, -admin) or one new column; the migration's shape if a column."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md"
truth_files: "none: the record's shape only; LAB-16 renders it"
qa: Q3
reviewers:
  - mason
  - warden
focus: []
operator_review: false
planned_paths:
  - "packages/db/src/sandbox/actions.ts"
  - "packages/db/src/schema/sandbox/actions.ts"
  - "packages/db/migrations/**"
  - "packages/db/test/sandbox/**"
  - "apps/web/lib/sandbox/people-data.ts"
  - "apps/web/lib/sandbox/people.ts"
  - "apps/web/lib/sandbox/people.test.ts"
depends_on:
  - LAB-9
  - LAB-27
out_of_scope:
  - "Rendering the record: LAB-16."
criteria:
  - id: C1
    statement: "On the local database, recordAction writes a role-change row with the new role, refuses any role outside APP_ROLES or on another action, and the SQL check refuses the same."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C2
    statement: "An admin making a user a developer records one row naming the team member and 'developer'."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — LAB-28 role-change-records-role

## Build notes

- From LAB-9's build: `recordAction` takes only `role-change` with a `targetEmail`, and `counts` from a closed list, so a role change records who and whose, not which role.
- Decide the shape at Technical or in this ticket's devs_call; LAB-27's SQL checks on `action` and `target_email` must still hold.
