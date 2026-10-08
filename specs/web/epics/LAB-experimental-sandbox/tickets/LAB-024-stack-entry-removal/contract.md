---
id: LAB-24
size: small
objective: "A product repo can drop the experimental sandbox from step 4 of new-project: toolkit.json lists it as a removable stack entry, and its runbook undoes every shared edit and proves it gone."
slice_type: "Stack entry and removal runbook (door 5); the risk is a removal that leaves a shared edit behind, drops the record of actions unwarned, or edits an applied migration."
non_negotiables:
  - 'toolkit.json stack["experimental-sandbox"] holds exactly placement.md''s files, env SANDBOX_SECRET, dependencies [], boundaries ["web-sandbox"], locked false and the runbook path; no new field.'
  - "docs/runbooks/remove/experimental-sandbox.md has billing.md's sections, run as SITE-9's phases: a git tag as a STOP gate, delete, edit, migrate, verify, then the operator's steps."
  - "It lists every shared edit placement.md names, each with its exact file, and ends with a zero-hit git grep over apps/, packages/ and tooling/ that excludes applied migrations."
  - "Tables go by a new forward migration from yarn db:generate; no applied migration is edited; the warning that sandbox_actions goes with the tables, and how to export it first, sits before that step."
  - "developer leaves APP_ROLES only when no other feature reads it; the runbook gives the grep that decides, and says holders fall back to user through roleOf with no data change forced."
  - "It documents LAB-9's yarn workspace @pem/db db:grant-admin <email> as kept (admin predates LAB) and the 404 check on /experimental/<slug> and /admin/experiments, before and after."
  - "new-project/README.md gains the part's row and its place in the removal order: before auth and database, which it needs."
devs_call: "The runbook's wording, the exact grep pattern within those terms, and the row's cost and caveat wording."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/placement.md"
  - "D-LAB-39"
  - "D-LAB-43"
truth_files: "none: a stack entry and a runbook; no living UX file changes"
qa: Q2
reviewers:
  - mason
focus:
  - "check-stack proves every shared edit is undone (mason)"
operator_review: false
planned_paths:
  - "toolkit.json"
  - "docs/runbooks/remove/experimental-sandbox.md"
  - "docs/runbooks/remove/README.md"
  - "docs/runbooks/new-project/README.md"
  - "docs/_generated/directory-map.md"
depends_on:
  - LAB-1
  - LAB-2
  - LAB-3
  - LAB-4
  - LAB-5
  - LAB-6
  - LAB-7
  - LAB-8
  - LAB-9
  - LAB-10
  - LAB-11
  - LAB-12
  - LAB-17
out_of_scope:
  - "Removing the sandbox from this repo: the runbook is proven in a throwaway duplicate only."
  - "Applying any migration to a hosted project, or deleting a host's variables: the operator's steps, written into the runbook."
  - "Changes to check-stack or toolkit.json's entry fields."
  - "Beat 2's files: they sit inside the listed folders, so the entry already covers them."
criteria:
  - id: C1
    statement: "With the entry present, yarn check-stack exits 0: every listed file exists, and the entry's shape, boundaries element and runbook path are accepted."
    evidence: check
    command: "yarn check-stack"
  - id: C2
    statement: "The runbook's frontmatter and file name pass."
    evidence: check
    command: "yarn lint:docs"
  - id: C3
    statement: "Every path and link in the runbook and the new-project row resolves."
    evidence: check
    command: "yarn check-refs"
  - id: C4
    statement: "In a throwaway worktree, after the runbook end to end with the entry marked removed, yarn check-stack exits 0, the zero-hit grep prints nothing, check-types and lint:boundaries pass, and the generated migration drops the seven sandbox_ tables and nothing else."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-024-stack-entry-removal/evidence/removal-checks.png"
  - id: C5
    statement: "In that worktree, /experimental/pricing-2026 shows the gate before removal, and it and /admin/experiments return the app's 404 after."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-024-stack-entry-removal/evidence/removal-404.png"
---

# Contract — LAB-24 stack-entry-removal

## Build notes

- **Approach:**
  - Add the entry to `toolkit.json` beside `billing` and `ai`.
  - Write the runbook on `docs/runbooks/remove/billing.md`'s sections (Files to delete, Files to edit, Variables, Dependencies, Boundaries entries, Vendor-side steps, Retention and erasure, Verify) and `ai.md`'s detail for a boundaries element. Order them as SITE-9's four phases: tag, remove, verify, operator.
  - Build the edit list from the code as it stands: grep each shared file for what LAB added. Never copy it from contracts.
  - `depends_on` narrowed to the built tickets (operator, 2026-10-07): LAB-13, 14 and 18 to 23 were drafts and LAB-15 and 16 red on another ticket's test, and every one of their planned paths sits inside the entry's six folders, so none adds a shared edit. A later ticket that does adds its own row to this runbook.
  - Prove it in a detached worktree of the branch (`git worktree add --detach`), then delete that worktree. Run `yarn directory-map` for the listing.
- **Decisions that apply:**
  - D-LAB-39 and D-LAB-43 (R7): "`apps/web` plus `@pem/db`; no new package; server actions only, with no route handler or tRPC. Stack entry `experimental-sandbox`. Removal undoes every shared edit except applied migrations (dropped by a new migration) and `developer` while another feature reads it."
  - placement.md: "`sandbox_actions` rows: Dropped with the tables; the runbook says so before the drop, since the record goes too."
  - placement.md: "Roles held in `app_metadata`: Stay. `admin` predates LAB."
  - S30 (brief): "a removal runbook at `docs/runbooks/remove/experimental-sandbox.md`, shaped after Kryshan's SITE-9: phases, a zero-hit grep, a 404 check, and the operator's manual steps." The entry depends on `db`, `auth` and `email`; `email` is locked.
- **Interfaces:** the `experimental-sandbox` stack entry; the runbook; one row in new-project's parts table.
- **Per path:**
  - `toolkit.json`: the entry.
  - `remove/experimental-sandbox.md`: the runbook.
  - `remove/README.md`, `_generated/directory-map.md`: regenerated listing only.
  - `new-project/README.md`: the part's row and its place in the order.
- **Shared edits the runbook undoes** (per placement.md; confirm each in the code):
  - `apps/web/next.config.ts`: the noindex headers.
  - `apps/web/env.ts`: the `SANDBOX_SECRET` reads.
  - `turbo.json` and `.env.example`: the variable.
  - `packages/db/src/schema/index.ts`: seven exports.
  - `packages/db/package.json`: `./sandbox`.
  - `boundaries.js`: `web-sandbox`, with its `tooling/boundaries.test.ts` probes.
  - `rls.ts`, conditionally, with LAB-2's role tests.
  - Kept, and said so: the `@pem/ui` sidebar option (LAB-8, backward-compatible) and `db:grant-admin` (LAB-9).
  - Also: `specs/<app>/ux/experimental/` and `ux/admin/` once promoted.
- **Gotchas:**
  - check-stack reads only files, variables and dependencies (verified 2026-10-06, `tooling/check-stack.ts` header). The other shared edits are proven by the zero-hit grep, plus types and boundaries in C4. Say both in the runbook's Verify.
  - Grep terms: `sandbox`, `SANDBOX_`, `app/experimental`, `app/admin`, `pricing-2026`. Exclude `packages/db/migrations/` and `specs/`. Never grep for bare `admin`: `adminProcedure` predates LAB.
  - Removal order: the sandbox goes before auth and database. Email is locked.
  - `[ASSUMPTION: placement.md's "a script to clear the value" is met by naming the Auth admin API per holder, as LAB-9's script reaches it. No new script, since the cut names only LAB-9's.]`
  - C4 and C5 run on the local tier only, never a hosted project. Fixtures are synthetic.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model copies the edit list from contracts instead of the code, or deletes a migration to "clean up".
