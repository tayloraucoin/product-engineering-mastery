---
id: MIG-11
size: small
objective: "Record 0012, Adoption tiers, puts the overlay tiers on the record, two ledger lines carry the imports field and the zero-match rule, and the changelog entry closes the epic."
slice_type: "Decision records and the ledger (plan mode required for docs/decisions/records/); the risk is a record that restates the tooling instead of ruling, or a ledger line nobody will cite."
non_negotiables:
  - "docs/decisions/records/0012-adoption-tiers.md follows decision.template.md and records: starter, overlay and overlay-local as the only adoption modes; overlay leaves host docs alone; the tracked floor and the operator's local layer; the probe as the one home for layout facts beyond toolkit.json; the exit, a repo leaves overlay for starter only when layer 3 is done."
  - "The record is written in plan mode, by this ticket, as CLAUDE.md requires for docs/decisions/records/."
  - "Two ledger lines, in the ledger's house format: reviewer rows take imports; check-reviewers fails a zero-match row under overlay; each cites REC 0012 or the MIG ticket that built it."
  - "One changelog entry, newest first, naming what the epic changed: the probe and overlay edits, the settings floor and local layer, the manifest, reviewer imports and check-reviewers, migrate:assess with --check, the track and runbook, the desk walks, and this record; the follow-up tickets drafted in the epic (MIG-12 to MIG-17) are named as drafted, never as shipped."
  - "docs/index.md, docs/design/canon.md and every workspace-package boundary are untouched (T9)."
  - "Nothing lives in two places: the record rules, the changelog lists, the ledger lines point."
devs_call: "The record's considered options and consequences wording, the ledger section the two lines join, and the changelog entry's length."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T9"
truth_files: "none: decision records; no living UX file changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "docs/decisions/records/0012-adoption-tiers.md"
  - "docs/decisions/records/README.md"
  - "docs/decisions/ledger.md"
  - "docs/decisions/changelog.md"
depends_on:
  - MIG-10
  - MIG-4
  - MIG-2
out_of_scope:
  - "Any change to toolkit.json, the tooling or the runbook: built by the earlier tickets; the record describes what shipped."
  - "A record for the reviewer imports field on its own: a ledger line suffices (T9)."
  - "Re-numbering or editing any existing record (records are immutable)."
criteria:
  - id: C1
    statement: "The record carries valid frontmatter, the next free number 0012, and the records folder table lists it."
    evidence: check
    command: "yarn lint:docs"
  - id: C2
    statement: "The generated tables are current with the new record."
    evidence: check
    command: "yarn directory-map --check"
  - id: C3
    statement: "Every path the record, the ledger lines and the changelog entry name in a live file exists; the changelog and records are history and are not scanned."
    evidence: check
    command: "yarn check-refs"
  - id: C4
    statement: "The record holds the five rulings, the considered options, consequences and a revisit trigger; the two ledger lines and the changelog entry are present; the thread entered plan mode before writing the record, noted in the as-built."
    evidence: manual
    reason: "prose and a process fact; no script reads them"
---

# Contract — MIG-0 adoption-tiers-record

## Build notes

- **Approach:** enter plan mode first (the CLAUDE.md rule for `docs/decisions/records/`); the plan is the record's outline. Then copy `docs/decisions/decision.template.md` to `0012-adoption-tiers.md`, fill Context (the tiers existed in `tooling/lib/toolkit.ts` and two scripts with no record; the engineering-layer report proposed them as "record 0010, proposed", a number later taken by the default stack), Considered options (a ledger line only; a second light tooling copy; the three tiers with the probe), Decision (the five rulings), Consequences, Revisit trigger (a product repo that needs a fourth mode, or layer 3 done in a product repo). Add the two ledger lines to the ledger section the builder judges right (section 8, Practice, or 9/10, Engineering), in that table's columns. Write the changelog entry at the top of `changelog.md` dated the day of writing, in the style of the 2026-10-06 and 2026-10-07 entries. Run `yarn directory-map` so the records README table picks the file up.
- **Decisions that apply:**
  - T9: "Record 0012, 'Adoption tiers', written in plan mode by its ticket. Two ledger lines. No workspace-package boundary changes; neither `docs/index.md` nor the canon is touched." Beat: "A ledger line only (too easy to forget once product repos carry the tier)."
  - overlay.md, T9: the five things the record records, verbatim above; "it is hard to undo once product repos carry the tier, so it is a record, not a ledger line. Plan mode is required (CLAUDE.md); its ticket writes it, this thread does not." Ledger lines: "Reviewer rows take `imports`; `check-reviewers` fails a zero-match row under overlay. Changelog: one entry at the epic's close."
  - brief.md, Risk 9: "The overlay tiers already exist in the tooling and were proposed in the engineering-layer report ... no decision record documents them."
  - docs rule: "To change the practice: amend the file, add a ledger line or a changelog entry, and a record only when the reason needs more than one line. Nothing lives in two places."
- **Interfaces:** one record, two ledger rows, one changelog entry.
- **Per path:**
  - `docs/decisions/records/0012-adoption-tiers.md`: the record, `layer: decisions`, `status: ruling`, `role: Mason`, `thread: "MIG"`.
  - `docs/decisions/records/README.md`: regenerated table only.
  - `docs/decisions/ledger.md`: two rows.
  - `docs/decisions/changelog.md`: one entry at the top.
- **Gotchas:**
  - The sandbox hook blocks direct writes to protected files; if the record path is refused, do what the denial says.
  - `check-refs` skips `changelog.md` and `records/` (history), but the ledger is live: every path in the two lines must exist.
  - The record names what shipped, by the MIG ticket ids, and never a path in a product repo.
  - The engineering-layer report that first proposed the tiers lives under the research folder; the contract and the as-built never name that path (A11). The record may name it in prose, since records are history and are not scanned.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to write the record as a description of the code rather than a ruling with options.
