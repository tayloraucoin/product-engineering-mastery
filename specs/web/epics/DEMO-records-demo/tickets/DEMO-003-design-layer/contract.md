---
id: DEMO-3
size: small
objective: "The demo's design layer exists at apps/web/docs/design/, filled from the canon, the approved UX files and the real code, so each template sits beside its filled example in the docs app."
slice_type: "Docs that tighten the canon for one product; the risk is restating the canon (nothing lives in two places) or loosening a rule the critic then enforces."
non_negotiables:
  - "Six files plus refs/, one per template in docs/design/templates/, each holding deltas from the canon only, cited by canon ID (C-P, A-, C-R), never restated."
  - "components.md rules P-1 Diff as a product primitive at app/demo/_components/diff.tsx, moving to @pem/ui only when apps/docs imports it (R3), and records DEMO-2's solid destructive variant by its name."
  - "states.md lists every surface's keys exactly as the six approved ux/demo/ States tables give them."
  - "The product's share of the design layer stays within about 1,700 tokens across DESIGN, tokens, components, anti-patterns and states (docs/index.md)."
  - "Templates stay blank; nothing is written inside docs/."
devs_call: "Each file's wording and order within its template, which refs to annotate, and how coverage-gaps.md phrases the open questions."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-9"
  - "D-DEMO-15"
  - "P-1"
  - "P-3"
  - "P-4"
  - "P-5"
truth_files: "none: the design layer is a docs layer, not a living UX file"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/docs/design/**"
  - "docs/_generated/directory-map.md"
depends_on:
  - DEMO-2
out_of_scope:
  - "Any change to canon.md, canon-rubric.md or the templates."
  - "The critic's procedure and calibration: DEMO-13."
criteria:
  - id: C1
    statement: "Every new file has valid frontmatter and a correct name."
    evidence: check
    command: "yarn lint:docs"
  - id: C2
    statement: "The always-loaded and per-build budgets still pass with the product design layer counted."
    evidence: check
    command: "yarn budget"
  - id: C3
    statement: "In the docs app, each template opens beside its filled example, and states.md's keys match the six States tables."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-003-design-layer/evidence/docs-pair.png"
---

# Contract — DEMO-3 design-layer

## Build notes

- **Approach:** Fill each template in `docs/design/templates/` for this app: `DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, `coverage-gaps.md`, and `refs/` (annotated reference set per `templates/refs/README.md`). Read the approved `ux/demo/` files for the facts; read the real preset and `@pem/ui` for tokens and components. Write deltas only. Then run `yarn directory-map`.
- **Decisions that apply:**
  - D-DEMO-9: "Dark drawn per artboard: Paper tokens have no modes."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - P-1: "`Diff` primitive: anatomy in `record-detail.md`. Drawn off-kit (`[OFF-KIT] Diff / inline`)." R3 rules it a product primitive in this app.
  - P-3: "Record why Geist is `--font-sans`, or choose another face. (near A-01)" Ruled by Taylor at the Tickets gate, 2026-10-08: keep Geist and record why in `DESIGN.md`.
  - P-4: "Whether the Diff marks changed words inside a clause." R3: whole clauses only in this epic.
  - P-5: "A rubric line: one state keeps the same content and words across breakpoints (D-DEMO-15)." Ruled by Taylor at the Tickets gate, 2026-10-08: the line lives in `apps/web/docs/design/` (a product may tighten), not in `canon-rubric.md`; the critic applies it.
- **Interfaces:** none in code. `apps/web/AGENTS.md` already names this folder, so the UI rule loads it.
- **Per path:** `DESIGN.md` voice, density and the P-3 ruling; `tokens.md` the P-2 token and any product role; `components.md` job to component, P-1, P-2, forbidden patterns; `anti-patterns.md` product tells beyond A-01 to A-20; `states.md` the key table; `coverage-gaps.md` open questions; `refs/` the annotated set; `directory-map.md` regenerated.
- **Gotchas:** `.claude/rules/ui.md` will load these files on every UI build after this lands; the budget is the hard limit, so a line the canon already holds is cut, not shortened. Never open the research shelf.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to restate the canon, which breaks the budget and puts a rule in two places.
