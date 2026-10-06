---
id: STK-1
size: small
objective: Put the default-stack rulings on record so every later ticket builds under written law.
slice_type: Decision records and conventions; the risk is two documents stating opposite rules.
non_negotiables:
  - Record 0005 is not edited; record 0010 names it in supersedes.
  - Conventions rule 9 and the package table state the graph of D-STK-1 and nothing that is not yet built is described as built.
  - Each changed rule gets one ledger line and one changelog entry.
  - Use plan mode before editing docs/decisions.
devs_call: Wording, and how the not-yet-built packages are marked in the conventions table.
cites:
  - specs/_shared/epics/STK-default-stack/technical.md
  - D-STK-1
  - D-STK-2
  - D-STK-3
truth_files: "none: no living UX file covers the practice's own rules"
reviewers: []
planned_paths:
  - docs/decisions/records/0010-starter-ships-default-stack.md
  - docs/decisions/ledger.md
  - docs/decisions/changelog.md
  - docs/engineering/codebase-conventions.md
  - docs/engineering/tech-stack.md
  - docs/decisions/records/README.md
  - docs/_generated/directory-map.md
depends_on: []
out_of_scope:
  - Any file under apps, packages or tooling.
  - The README porting rule, which STK-3 rewrites with the guide.
  - AGENTS.md and docs/index.md.
criteria:
  - id: C1
    statement: Frontmatter and file names pass across docs, including the new record.
    evidence: check
    command: yarn lint:docs
  - id: C2
    statement: Every reference in ledger.md, codebase-conventions.md and tech-stack.md resolves (check-refs does not scan records or the changelog; C4 reads those).
    evidence: check
    command: yarn check-refs
  - id: C3
    statement: The generated directory map includes record 0010 and is current.
    evidence: check
    command: yarn directory-map --check
  - id: C4
    statement: Record 0010 states the decision, the options weighed and a revisit trigger; conventions rule 9, section 4 and section 5 agree with D-STK-1 and D-STK-3; and ledger.md and changelog.md each gain one entry per changed rule.
    evidence: manual
    reason: agreement between prose documents is a reading judgment
qa: Q1
---

# Contract — STK-1 rulings-on-record

## Notes

The rulings are Taylor's, listed in the epic's prompts/03-technical.md and decided in technical.md. Section 5 of the conventions gains the tier switch and the per-package scripts/env.ts reader. Name a package a later ticket builds by its ticket number only, never as present. `services` is still undecided as a package (technical.md, routed call 3): write it as undecided, not planned.
Leave the frontmatter description of codebase-conventions.md and tech-stack.md unchanged, so docs/engineering/README.md stays current.
