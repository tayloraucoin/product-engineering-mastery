---
id: LAB-29
size: small
objective: "LAB-8's route scan fails the build when any admin-only /admin action, not only People's, is written without { adminOnly: true }."
slice_type: "A guard on the admin-only actions (D-LAB-26); the risk is a later edit dropping the flag from the Data tab's delete, which the database function would still refuse, but only after a developer reached it."
non_negotiables:
  - "The admin-only actions are named in one place the scan reads, never a second list kept by hand in the test."
  - "Synthetic files that drop the flag fail the same scan, as the scan's other rules do."
devs_call: "Where the list of admin-only actions lives: a path list in admin-nav.ts, or a marker the scan finds in the action file."
cites:
  - "apps/web/lib/sandbox/admin/admin-routes.test.ts"
truth_files: "none: a test-only guard"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/sandbox/admin/admin-routes.test.ts"
  - "apps/web/lib/sandbox/admin/admin-nav.ts"
depends_on:
  - LAB-16
out_of_scope:
  - "Changing who may delete: D-LAB-26 stands."
criteria:
  - id: C1
    statement: "The scan fails app/admin/experiments/[slug]/data/actions.ts if deleteExperimentData drops { adminOnly: true }, and passes it as built."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — admin-only-actions-scan

## Build notes

- From LAB-16's build: `admin-routes.test.ts` requires `{ adminOnly: true }` only for files under `people/`. LAB-16's delete action passes it, and `admin-data.test.ts` pins that one file by regex, since the scan is LAB-8's file and outside LAB-16's paths.
- Widen the rule so every admin-only action is held, then drop LAB-16's single-file regex if it is now redundant.
