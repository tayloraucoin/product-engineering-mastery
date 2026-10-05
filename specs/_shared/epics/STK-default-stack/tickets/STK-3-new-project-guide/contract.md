---
id: STK-3
size: small
objective: Give an agent holding a briefing the steps to turn a duplicate of this repo into a configured product repo.
slice_type: Runbooks; the risk is a step that names a file or command that does not exist.
non_negotiables:
  - The guide follows D-STK-14 in order and ends on yarn check-stack and yarn verify.
  - Each of the six removal runbooks has the same sections; files to delete, files to edit, variables, dependencies, boundaries entries, vendor-side steps, verify.
  - A runbook for a module not yet built says so and lists nothing invented; its file list is filled by the ticket that builds the module.
  - There is one runbook for Supabase Auth and one for the Supabase database, and each says what changes when both are removed.
  - The README porting rule becomes duplicate, then remove, and points to the guide; new-project/README.md replaces the planned port.md (J12), whose pending entry stays, reworded to "superseded by docs/runbooks/new-project/README.md (STK-3)", because byte-preserved prompts still name it.
  - port-dry-run.md and engineering-layer.md change only by a dated amendment block, never in place.
devs_call: Wording and the order of steps inside a runbook.
cites:
  - specs/_shared/epics/STK-default-stack/technical.md
  - D-STK-13
  - D-STK-14
truth_files: "none: runbooks are not UX truth"
reviewers:
  - vigil
planned_paths:
  - docs/runbooks/new-project/README.md
  - docs/runbooks/remove/supabase-auth.md
  - docs/runbooks/remove/supabase-database.md
  - docs/runbooks/remove/billing.md
  - docs/runbooks/remove/api.md
  - docs/runbooks/remove/ai.md
  - docs/runbooks/remove/error-monitoring.md
  - README.md
  - docs/prompts/phases/port-dry-run.md
  - docs/prompts/phases/engineering-layer.md
  - tooling/refs-pending.json
  - docs/runbooks/README.md
  - docs/_generated/directory-map.md
depends_on:
  - STK-1
  - STK-2
out_of_scope:
  - Any module's code.
  - Running a port; STK-20 does the dry-run.
criteria:
  - id: C1
    statement: Frontmatter and file names pass for the seven new runbooks.
    evidence: check
    command: yarn lint:docs
  - id: C2
    statement: Every path and command the runbooks reference resolves or is listed as pending with its ticket.
    evidence: check
    command: yarn check-refs
  - id: C3
    statement: The generated directory map lists the new runbooks and is current.
    evidence: check
    command: yarn directory-map --check
  - id: C4
    statement: A reader holding only the guide and a one-paragraph briefing can name every step and the check that ends it.
    evidence: manual
    reason: followability by a cold reader is a reading judgment until the dry-run ticket times it
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
---

# Contract — STK-3 new-project-guide

## Notes

No module is built yet, so every removal runbook names its module, its ticket number from technical.md and the shared section headings, and nothing else; the ticket that builds a module fills its runbook. Never open the epic's research notes.
