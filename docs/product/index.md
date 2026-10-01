---
title: The product layer — templates and gates
description: Read when shaping work or setting up a product's operating rhythm, to see which template to fill, who fills it, which gate it passes, and what the critic checks it against.
layer: product
status: adopted
thread: P-B
role: Compass
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: spec, discovery
---

# The product layer

Templates only; the toolkit carries no product (CF-07, CF-13). A product repo fills them at the paths below. The demo app's filled example of the brief lands at `apps/web/specs/_example/` in Phase 3.

| Template                                                 | Fills into                      | Who fills                                                                     | When                                     | Gate       | What the critic checks                                                                                         |
| -------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| [`cycle-charter.template.md`](cycle-charter.template.md) | `docs/product/cycle-charter.md` | Compass with the decision-maker                                               | once, before cycle 1                     | —          | Nothing; it governs people, not pixels                                                                         |
| [`brief.template.md`](brief.template.md)                 | `specs/<feature>/brief.md`      | the shaper, with Compass                                                      | before shaping                           | "Frame go" | Nothing directly. The critic scores the build, and the build is specified by the package                       |
| [`package.template.md`](package.template.md)             | `specs/<feature>/package.md`    | the shaper; a builder; Tally (instrumentation); Plumb (constraint exceptions) | after "Frame go", 24h before the table   | "Bet"      | States, Expected action, Job lines and Verification, against `canon.md` §3 plus the package's rubric additions |
| [`glossary.template.md`](glossary.template.md)           | `docs/product/glossary.md`      | Gloss                                                                         | before the first package names an object | —          | C-R05; strings using a banned term                                                                             |

Measurement templates (events, metric definitions, readout, experiment) live in [`docs/metrics/`](../metrics/events.template.md); the variant-testing procedure is a runbook ([`variant-testing-runbook.md`](../runbooks/variant-testing-runbook.md)).

Product charter, roadmap, positioning, opportunity solution tree and discovery-ledger templates wait for thread P-H (CF-13). In a product repo, discovery observations live in `docs/discovery/`; in the toolkit, `docs/research/` holds archived reports only.
