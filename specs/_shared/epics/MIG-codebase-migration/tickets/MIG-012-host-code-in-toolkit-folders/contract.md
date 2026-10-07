---
id: MIG-12
size: small
objective: "On a single-app overlay repo, verify:fast checks host code that sits in a folder named like a toolkit folder (docs/, tooling/, .github/), or names it as not run, instead of dropping it silently."
slice_type: "Repo tooling under the overlay tier; the risk is a host edit that verify:fast neither checks nor names, so a broken file reads as green."
non_negotiables:
  - "verify-fast.ts excludes from product code only the paths the toolkit installs (the manifest's copy and derive paths, docs/runbooks/migrate/manifest.json) and the specs root; any other changed file under a code root is linted and type-checked as product code."
  - "When the manifest is absent, a changed code file under tooling/ or docs/ that is not toolkit-owned is named as not run, never dropped."
  - "At the starter tier nothing changes: the app code roots are apps/* and packages/*, which hold no toolkit folder."
devs_call: "How verify-fast reads the manifest (folder entries as prefixes) and the not-run wording."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical/overlay.md"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "tooling/verify-fast.ts"
  - "tooling/overlay.test.ts"
depends_on:
  - MIG-1
  - MIG-3
out_of_scope:
  - "The stop gate showing not-run lines on a pass (a hook change, raised with MIG-2)."
criteria:
  - id: C1
    statement: "On the single-app repo, a type error in a host file docs/site/page.ts fails verify:fast naming the type-check step; an edit under tooling/ that the manifest installs runs only the tooling step."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — MIG-12 host-code-in-toolkit-folders

## Build notes

- **Approach:** found in MIG-1's mason review (finding 6, yellow). `verify-fast.ts` treats `tooling/`, `docs/`, `.claude/`, `.github/` and the specs root as never product code, so with an app at `.` a host's own TypeScript under `docs/` is neither checked nor named. Read the manifest (MIG-3) and exclude only its paths; fall back to naming the file as not run when there is no manifest.
- **Per path:** `tooling/verify-fast.ts`, the `rootOf` exclusion; `tooling/overlay.test.ts`, one case on `singleAppRepo()`.
