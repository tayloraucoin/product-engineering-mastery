---
id: CAT-1
size: small
objective: "Put the component-sourcing rulings on record so the kit and the catalog are built under written law."
slice_type: "Decision records and design law; the risk is the skills ruling and the new sources file stating different registry rules."
non_negotiables:
  - "skills.md edit A2 is replaced, not appended to, and SK-05's ledger status names CS-08 with its earlier value after Was:."
  - "Each ruling CS-01 to CS-10 gets one ledger line; record 0011 carries the two-shelves reason."
  - "component-sources.md holds each fact once and points to the research for evidence, never restating it."
  - "Use plan mode before editing docs/decisions (approved 2026-10-04)."
devs_call: "Wording, and which parts of the research's job index and starter kits component-sources.md keeps."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-9"
truth_files: "none: no living UX file covers the practice's own rules"
reviewers: []
operator_review: false
planned_paths:
  - "docs/design/component-sources.md"
  - "docs/design/skills.md"
  - "docs/design/README.md"
  - "docs/decisions/ledger.md"
  - "docs/decisions/changelog.md"
  - "docs/decisions/records/0011-component-kit-and-catalog.md"
  - "docs/decisions/records/README.md"
  - "docs/_generated/directory-map.md"
depends_on: []
out_of_scope:
  - "Any file under apps, packages or tooling."
  - "The shadcn skill itself, which arrives in Phase 3 with A1 to A6 applied."
  - "AGENTS.md and docs/index.md."
criteria:
  - id: C1
    statement: "Frontmatter and file names pass across docs, including component-sources.md and record 0011."
    evidence: check
    command: "yarn lint:docs"
  - id: C2
    statement: "Every reference in the ledger and the design files resolves."
    evidence: check
    command: "yarn check-refs"
  - id: C3
    statement: "The generated directory map and folder indexes include the new files and are current."
    evidence: check
    command: "yarn directory-map --check"
qa: Q1
---

# Contract — CAT-1 rulings-and-filing

## Build notes

- **Approach:** the P-M research was filed by its own intake commit; write `docs/design/component-sources.md` as Plumb's distillation in the shape of `skills.md` (ruling table, per-source notes, the review deltas for registries, the job index pointer, the starter kits); amend `skills.md` A2 with the research's A2 text adapted to CS-08; add ledger section 11 "Components" with CS-01 to CS-10; set SK-05's status; write record 0011; add a changelog entry.
- **Decisions that apply:** D-CAT-1 (the rulings, approved by Taylor 2026-10-04): Base UI single base; Vega; Toast not sonner; `cn` rewritten to `@pem/ui/cn`; `shadcn/tailwind.css` ejected; two shelves; registry access by per-command approval and commit-pinned GitHub addresses; catalogue by job; lucide-react.
- **Interfaces:** none.
- **Per path:** `component-sources.md` (new design file, `load_when: on request`); `skills.md` (A2 text and changelog line); ledger, changelog, record 0011 and the records README index; generated indexes.
- **Gotchas:** `load_when` on component-sources.md must not put it in any build's load list (the UI build budget is 15,000).
- **Model:** any current model.
