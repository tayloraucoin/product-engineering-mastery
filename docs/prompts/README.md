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

Each file is a self-contained primer for a new thread, written in the captain's voice: the role assigned, the decision served, the ask, evidence rules, output shape, done criteria, and what is not wanted. Attach [`shared-context.md`](shared-context.md) and the named role prompt with every one.

## Investigation threads (run; outputs archived)

The fourteen primers that ran these threads were removed on 2026-10-01: their work lives in the outputs below. The originals are in git history (commit `19fc480`) and the owner's prompts folder.

| #   | Thread                                               | Model  | Primary role     | Consulted         | Output                                                                                                                      |
| --- | ---------------------------------------------------- | ------ | ---------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 01  | Paper vs. Figma vs. alternatives, Cursor Design Mode | Opus   | Plumb            | —                 | [`tools-per-loop.md`](../research/design-tools/tools-per-loop.md) → `docs/design/workflow.md`                          |
| 02  | Why Framer AI for marketing                          | Opus   | Vitrine          | —                 | [`framer-marketing-sites.md`](../research/design-tools/framer-marketing-sites.md)                                  |
| 03  | Staging branches for customer testing, honest A/B    | Opus   | Tally            | Mason (optional)  | [`staging-branches-customer-testing.md`](../research/process/staging-branches-customer-testing.md) → the runbook and metrics templates            |
| 04  | The world of design skills                           | Opus   | Plumb            | Threshold         | [`design-skills-adoption.md`](../research/design-tools/design-skills-adoption.md) → `docs/design/skills.md`            |
| 05  | Shape Up                                             | Sonnet | Compass          | —                 | [`shape-up.md`](../research/process/shape-up.md) → the cycle charter                                          |
| 06  | Shift Nudge and Matt D. Smith (two-phase)            | Fable  | Alembic → Vesper | Plumb             | [`shift-nudge-free-layer.md`](../research/courses/shift-nudge-free-layer.md), [`shift-nudge-curriculum.md`](../research/courses/shift-nudge-curriculum.md), [`shift-nudge-ui-checklist.md`](../research/courses/shift-nudge-ui-checklist.md)                                                                                     |
| 07  | animations.dev and a motion skill (two-phase)        | Opus   | Alembic → Vesper | Plumb             | [`kowalski-motion-inventory.md`](../research/courses/kowalski-motion-inventory.md), [`motion-skill.md`](../research/courses/motion-skill.md), `motion-skill-files/` (the skill bundle)                                                                                      |
| 08  | Refactoring UI review                                | Opus   | Vesper           | Plumb             | [`refactoring-ui-review.md`](../research/courses/refactoring-ui-review.md)                                      |
| 09  | Design+Code (Meng To) review                         | Opus   | Vesper           | Plumb             | [`design-plus-code-review.md`](../research/courses/design-plus-code-review.md)                                  |
| 10  | Product Talk Academy review                          | Opus   | Envoy            | Compass           | [`product-talk-academy-review.md`](../research/courses/product-talk-academy-review.md)                            |
| 11  | Newsletters, podcasts, people → `.md` extraction     | Opus   | Alembic          | —                 | [`_meta/extraction-guide.md`](../references/_meta/extraction-guide.md) (live, draft)                                        |
| 12  | Books → what's online, distillation                  | Opus   | Alembic          | —                 | [`_meta/books-plan.md`](../references/_meta/books-plan.md) (live, draft)                                                    |
| 13  | Laws of UX reference artifacts + input checklist     | Fable  | Plumb            | Vesper, Threshold | [`laws-of-ux-reference-layer.md`](../research/toolkit/laws-of-ux-reference-layer.md) → `docs/references/README.md` |
| 14  | The `.md` asset toolkit of the 1%                    | Fable  | Plumb            | Compass, Tally    | [`toolkit-map.md`](../research/toolkit/toolkit-map.md)                                                            |

## Toolkit phases

| #                                        | Phase                                   | Where                        | Role(s)                | Status                                                                      |
| ---------------------------------------- | --------------------------------------- | ---------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| [P-A](phases/consolidation-and-the-map.md)   | 1 — Consolidation and the map           | general thread               | Alembic → Plumb        | done; outputs in `docs/decisions/`, `docs/design/canon.md`, `docs/index.md` |
| [P-B](phases/practice-layer-and-docs-app.md) | 2 — The practice layer and the docs app | Claude Code                  | Plumb                  | done 2026-10-01 (`docs/decisions/changelog.md`)                             |
| [P-C](phases/demo-app-and-skills.md)         | 3 — The demo app and the skills         | Claude Code                  | Vesper → Plumb → Assay | next                                                                        |
| [P-D](phases/library-batches.md)             | 4 — Library batches (retargeting note)  | general threads              | Alembic                | after P-C; Laws of UX first                                                 |
| [P-E](phases/port-dry-run.md)                | 5 — Port dry-run                        | Claude Code, fresh directory | procedure              | after P-C                                                                   |
| [P-J](phases/engineering-layer.md)           | The engineering layer and the workflows | Claude Code, on `agent/PJ`   | Lorimer                | running; started by [`phases/engineering-layer-primer.md`](phases/engineering-layer-primer.md); runs before P-C         |

## Threads to commission (stubs; CF-29)

| #                                        | Thread                      | Primary role | When                                                        |
| ---------------------------------------- | --------------------------- | ------------ | ----------------------------------------------------------- |
| [P-F](threads/agent-context-architecture.md)  | Agent context architecture  | Plumb        | after P-C, before P-E                                       |
| [P-G](threads/measurement-layer.md)           | Measurement layer           | Tally        | when a product first instruments a feature                  |
| [P-H](threads/product-operating-artifacts.md) | Product operating artifacts | Compass      | when a product needs charter, positioning, opportunity tree |
| [P-I](threads/ai-evals.md)                    | AI evals                    | Tally        | when a product ships an AI surface                          |

## Conventions used in every prompt

- The role reads its role prompt and the shared context before the task; where a role prompt and an attached document disagree on fact, the document wins.
- Evidence is labeled verified / secondary / judgment; pricing and availability are dated; gaps are marked not found, never filled.
- Two-phase threads use Alembic first (distill, add nothing) and a craft role second (reason to a best answer, label every inference `[DIRECT]` / `[INFERRED]` / `[UNKNOWN]`).
- Reviews of educational material are done by the craft role and addressed to Plumb, who owns what enters the canon.
- The P-series reflect the rulings in `docs/decisions/conflicts.md`.

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`shared-context.md`](shared-context.md) | Attach to every primer-prompt thread as the standing briefing; fill the captain socket once per person. |
| [`phases/`](phases/README.md) | Open to run or re-read a phase of the toolkit build, each a self-contained primer for one thread. |
| [`threads/`](threads/README.md) | Open when a trigger fires that commissions one of the stub threads: agent context, measurement, product operating artifacts, AI evals. |
