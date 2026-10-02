---
title: Primer prompts — index and run order
description: Read when starting a new thread or a toolkit phase, to pick the primer, the role to inject, what to attach, and what it depends on.
layer: prompts
status: adopted
thread:
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# Primer prompts

Each file is a self-contained primer for a new thread, written in the captain's voice: the role assigned, the decision served, the ask, evidence rules, output shape, done criteria, and what is not wanted. Attach [`00-shared-context.md`](00-shared-context.md) and the named role prompt with every one.

## Investigation threads (run; outputs archived)

The fourteen primers that ran these threads were removed on 2026-10-01: their work lives in the outputs below. The originals are in git history (commit `19fc480`) and the owner's prompts folder.

| #   | Thread                                               | Model  | Primary role     | Consulted         | Output                                                                                                                      |
| --- | ---------------------------------------------------- | ------ | ---------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 01  | Paper vs. Figma vs. alternatives, Cursor Design Mode | Opus   | Plumb            | —                 | [`01-tools-per-loop-plumb.md`](../research/01-tools-per-loop-plumb.md) → `docs/design/workflow.md`                          |
| 02  | Why Framer AI for marketing                          | Opus   | Vitrine          | —                 | [`02-framer-marketing-sites-vitrine.md`](../research/02-framer-marketing-sites-vitrine.md)                                  |
| 03  | Staging branches for customer testing, honest A/B    | Opus   | Tally            | Mason (optional)  | [`03-…-tally.md`](../research/03-staging-branches-customer-testing-tally.md) → the runbook and metrics templates            |
| 04  | The world of design skills                           | Opus   | Plumb            | Threshold         | [`04-design-skills-adoption-plumb.md`](../research/04-design-skills-adoption-plumb.md) → `docs/design/skills.md`            |
| 05  | Shape Up                                             | Sonnet | Compass          | —                 | [`05-shape-up-compass.md`](../research/05-shape-up-compass.md) → the cycle charter                                          |
| 06  | Shift Nudge and Matt D. Smith (two-phase)            | Fable  | Alembic → Vesper | Plumb             | `06a`, `06b`, `06c` in `docs/research/`                                                                                     |
| 07  | animations.dev and a motion skill (two-phase)        | Opus   | Alembic → Vesper | Plumb             | `07a`, `07b`, `07c` (the skill bundle)                                                                                      |
| 08  | Refactoring UI review                                | Opus   | Vesper           | Plumb             | [`08-refactoring-ui-review-vesper.md`](../research/08-refactoring-ui-review-vesper.md)                                      |
| 09  | Design+Code (Meng To) review                         | Opus   | Vesper           | Plumb             | [`09-design-plus-code-review-vesper.md`](../research/09-design-plus-code-review-vesper.md)                                  |
| 10  | Product Talk Academy review                          | Opus   | Envoy            | Compass           | [`10-product-talk-academy-review-envoy.md`](../research/10-product-talk-academy-review-envoy.md)                            |
| 11  | Newsletters, podcasts, people → `.md` extraction     | Opus   | Alembic          | —                 | [`_meta/extraction-guide.md`](../references/_meta/extraction-guide.md) (live, draft)                                        |
| 12  | Books → what's online, distillation                  | Opus   | Alembic          | —                 | [`_meta/books-plan.md`](../references/_meta/books-plan.md) (live, draft)                                                    |
| 13  | Laws of UX reference artifacts + input checklist     | Fable  | Plumb            | Vesper, Threshold | [`13-laws-of-ux-reference-layer-plumb.md`](../research/13-laws-of-ux-reference-layer-plumb.md) → `docs/references/index.md` |
| 14  | The `.md` asset toolkit of the 1%                    | Fable  | Plumb            | Compass, Tally    | [`14-toolkit-map-plumb.md`](../research/14-toolkit-map-plumb.md)                                                            |

## Toolkit phases

| #                                        | Phase                                   | Where                        | Role(s)                | Status                                                                      |
| ---------------------------------------- | --------------------------------------- | ---------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| [P-A](pa-consolidation-and-the-map.md)   | 1 — Consolidation and the map           | general thread               | Alembic → Plumb        | done; outputs in `docs/decisions/`, `docs/design/canon.md`, `docs/index.md` |
| [P-B](pb-practice-layer-and-docs-app.md) | 2 — The practice layer and the docs app | Claude Code                  | Plumb                  | done 2026-10-01 (`docs/decisions/changelog.md`)                             |
| [P-C](pc-demo-app-and-skills.md)         | 3 — The demo app and the skills         | Claude Code                  | Vesper → Plumb → Assay | next                                                                        |
| [P-D](pd-library-batches.md)             | 4 — Library batches (retargeting note)  | general threads              | Alembic                | after P-C; Laws of UX first                                                 |
| [P-E](pe-port-dry-run.md)                | 5 — Port dry-run                        | Claude Code, fresh directory | procedure              | after P-C                                                                   |
| [P-J](pj-engineering-layer.md)           | The engineering layer and the workflows | Claude Code, on `agent/PJ`   | Lorimer                | running; started by [`pj-primer.md`](pj-primer.md); runs before P-C         |

## Threads to commission (stubs; CF-29)

| #                                        | Thread                      | Primary role | When                                                        |
| ---------------------------------------- | --------------------------- | ------------ | ----------------------------------------------------------- |
| [P-F](pf-agent-context-architecture.md)  | Agent context architecture  | Plumb        | after P-C, before P-E                                       |
| [P-G](pg-measurement-layer.md)           | Measurement layer           | Tally        | when a product first instruments a feature                  |
| [P-H](ph-product-operating-artifacts.md) | Product operating artifacts | Compass      | when a product needs charter, positioning, opportunity tree |
| [P-I](pi-ai-evals.md)                    | AI evals                    | Tally        | when a product ships an AI surface                          |

## Conventions used in every prompt

- The role reads its role prompt and the shared context before the task; where a role prompt and an attached document disagree on fact, the document wins.
- Evidence is labeled verified / secondary / judgment; pricing and availability are dated; gaps are marked not found, never filled.
- Two-phase threads use Alembic first (distill, add nothing) and a craft role second (reason to a best answer, label every inference `[DIRECT]` / `[INFERRED]` / `[UNKNOWN]`).
- Reviews of educational material are done by the craft role and addressed to Plumb, who owns what enters the canon.
- The P-series reflect the rulings in `docs/decisions/conflicts.md`.
