---
title: "Prompt archive"
description: "Open only to trace a ruling back to the prompt that asked for it: the one-time phase prompts that built this repo, and the investigation threads before them. A duplicated project deletes this folder."
layer: prompts
status: archived
thread:
role: Plumb
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Prompt archive

**What this is.** History. The prompts here built this toolkit once, in order, and are kept so a ruling can be traced to the prompt that asked for it. They are not templates and are never run on another project.

**Come here when.** You are tracing why a file, rule or folder exists and want to read what the thread that made it was asked to do.

**A duplicated project deletes this folder.** Its prompts describe building this repo, not the new product. Keep [`../shared-context.md`](../shared-context.md) and [`../research/`](../research/README.md).

## Phases

The phase prompts in [`phases/`](phases/README.md), kept byte for byte ([record 0006](../../decisions/records/0006-file-naming-and-filing.md)). Paths inside them are the paths of the day they were written.

| Id | Phase | Where it ran | Role(s) | Status |
| --- | --- | --- | --- | --- |
| [P-A](phases/consolidation-and-the-map.md) | 1 — Consolidation and the map | general thread | Alembic → Plumb | done; outputs in `docs/decisions/`, `docs/design/canon.md`, `docs/index.md` |
| [P-B](phases/practice-layer-and-docs-app.md) | 2 — The practice layer and the docs app | Claude Code | Plumb | done 2026-10-01 (`docs/decisions/changelog.md`) |
| [P-C](phases/demo-app-and-skills.md) | 3 — The demo app and the skills | Claude Code | Vesper → Plumb → Assay | next |
| [P-D](phases/library-batches.md) | 4 — Library batches (retargeting note) | general threads | Alembic | after P-C; Laws of UX first |
| [P-E](phases/port-dry-run.md) | 5 — Port dry-run | Claude Code, fresh directory | procedure | after P-C |
| [P-J](phases/engineering-layer.md) | The engineering layer and the workflows | Claude Code, on `agent/PJ` | Lorimer | running; started by [`phases/engineering-layer-primer.md`](phases/engineering-layer-primer.md); runs before P-C |

## Investigation threads

Fourteen threads ran before the phases. Their prompts were removed on 2026-10-01 (the originals are in git history at commit `19fc480`); what they produced is on the research shelf.

| # | Thread | Model | Primary role | Consulted | Output |
| --- | --- | --- | --- | --- | --- |
| 01 | Paper vs. Figma vs. alternatives, Cursor Design Mode | Opus | Plumb | — | [`tools-per-loop.md`](../../research/design-tools/tools-per-loop.md) → `docs/design/workflow.md` |
| 02 | Why Framer AI for marketing | Opus | Vitrine | — | [`framer-marketing-sites.md`](../../research/design-tools/framer-marketing-sites.md) |
| 03 | Staging branches for customer testing, honest A/B | Opus | Tally | Mason (optional) | [`staging-branches-customer-testing.md`](../../research/process/staging-branches-customer-testing.md) → the runbook and metrics templates |
| 04 | The world of design skills | Opus | Plumb | Threshold | [`design-skills-adoption.md`](../../research/design-tools/design-skills-adoption.md) → `docs/design/skills.md` |
| 05 | Shape Up | Sonnet | Compass | — | [`shape-up.md`](../../research/process/shape-up.md) → the cycle charter |
| 06 | Shift Nudge and Matt D. Smith (two-phase) | Fable | Alembic → Vesper | Plumb | [`shift-nudge-free-layer.md`](../../research/courses/shift-nudge-free-layer.md), [`shift-nudge-curriculum.md`](../../research/courses/shift-nudge-curriculum.md), [`shift-nudge-ui-checklist.md`](../../research/courses/shift-nudge-ui-checklist.md) |
| 07 | animations.dev and a motion skill (two-phase) | Opus | Alembic → Vesper | Plumb | [`kowalski-motion-inventory.md`](../../research/courses/kowalski-motion-inventory.md), [`motion-skill.md`](../../research/courses/motion-skill.md), `motion-skill-files/` (the skill bundle) |
| 08 | Refactoring UI review | Opus | Vesper | Plumb | [`refactoring-ui-review.md`](../../research/courses/refactoring-ui-review.md) |
| 09 | Design+Code (Meng To) review | Opus | Vesper | Plumb | [`design-plus-code-review.md`](../../research/courses/design-plus-code-review.md) |
| 10 | Product Talk Academy review | Opus | Envoy | Compass | [`product-talk-academy-review.md`](../../research/courses/product-talk-academy-review.md) |
| 11 | Newsletters, podcasts, people → `.md` extraction | Opus | Alembic | — | [`_meta/extraction-guide.md`](../../references/_meta/extraction-guide.md) (live, draft) |
| 12 | Books → what's online, distillation | Opus | Alembic | — | [`_meta/books-plan.md`](../../references/_meta/books-plan.md) (live, draft) |
| 13 | Laws of UX reference artifacts + input checklist | Fable | Plumb | Vesper, Threshold | [`laws-of-ux-reference-layer.md`](../../research/toolkit/laws-of-ux-reference-layer.md) → `docs/references/README.md` |
| 14 | The `.md` asset toolkit of the 1% | Fable | Plumb | Compass, Tally | [`toolkit-map.md`](../../research/toolkit/toolkit-map.md) |

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`phases/`](phases/README.md) | Open to read what a phase of this repo's own build was asked to do; one-time primers kept byte for byte, never run on another project. |
