---
title: "Product templates"
description: "Read when deciding what to build or how a product team runs: what each product template is, the moment it is filled, who fills it, and which the workflows use today (the brief) versus keep for later."
layer: product
status: adopted
thread: P-B
role: Compass
date: 2026-10-01
last_reviewed: 2026-10-05
supersedes:
load_when: spec, discovery
---

# Product templates

**What this is.** Blank forms for the product side of the work: deciding which problem is worth solving, and how a team decides. A product repo copies a template and fills it at the path the template names. This repo builds no product, so nothing here is filled in it (CF-07, CF-13).

**Come here when.** You are starting an epic and need to write its brief, or a product team is setting up how it plans and names things.

**Start with.** [`brief.template.md`](brief.template.md). It is the only one the workflows use today.

## The four templates

| Template | What it is, in plain words | The moment it is filled | Who fills it | Used today? |
| --- | --- | --- | --- | --- |
| [`brief.template.md`](brief.template.md) | One page on the problem, before any solution: who has it, what they do today instead, the number that should move, the evidence for and against, and how much time it is worth. | The first stage of an epic, Frame. Its "go" decides whether the work goes any further. | Compass leads the Frame thread and interviews the person who owns the product, who approves it. Tally helps when success is a number. | **Yes.** The Frame stage writes it to `specs/<app>/epics/<EPIC>-<slug>/brief.md` ([`frame.md`](../workflows/stages/frame.md)). |
| [`cycle-charter.template.md`](cycle-charter.template.md) | The rules for working in fixed time cycles: cycle length, the three appetite sizes, who sits at the betting table, what happens to unfinished work, how cool-down is spent. | Once, when a team adopts fixed cycles, before the first one. | Compass, with the person who has the last word on what gets built. | **Kept for later.** This repo works in tickets and epics without cycles; the Technical stage only borrows the charter's time limit if one exists. |
| [`glossary.template.md`](glossary.template.md) | One name for each thing users see, the names that are banned, and the identifier used in code and events. | Before the first UX spec names a user-facing object; again whenever two names for one thing turn up. | Gloss owns it; Compass proposes product nouns; Tally checks event names against it. | **Kept for later.** No stage loads it yet; the first product with user-facing nouns (the demo, in Phase 3) will. Not to be confused with [`docs/workflows/glossary.md`](../workflows/glossary.md), which defines the workflow's own terms. |
| [`package.template.md`](package.template.md) | The "shaped bet" from Shape Up: a solution sketch, rabbit holes, non-goals, states, criteria and instrumentation in one file, for a betting table to accept or reject. | After the brief's "go", at least a day before the betting table. | The shaper, a builder, Tally (instrumentation) and the design director (exceptions). | **Not used by the workflows.** Still cited by Recipe A, the critic's input, two runbooks and the measurement templates. See below. |

The measurement templates (events, metric definitions, experiment, readout) live in [`../measurement/`](../measurement/README.md). Templates for a product charter, roadmap, positioning, opportunity tree and discovery ledger wait for the research prompt [P-H](../prompts/research/product-operating-artifacts.md). In a product repo, discovery notes live in `docs/discovery/`.

## The package duplicates three files the workflows already write

Every section of the package has a home in the epic flow:

| Package section | Where the workflows put it now |
| --- | --- |
| The problem, the appetite, non-goals (the Frame interview's scope round) | the brief |
| Breadboard and sketch (routes, surfaces, layout), states, acceptance criteria, instrumentation | the UX spec: [`ux-overview.template.md`](../design/templates/ux-overview.template.md) and [`ux-surface.template.md`](../design/templates/ux-surface.template.md) |
| Rabbit holes, and the builder's "possible in this appetite?" check | the technical file: [`technical.template.md`](../engineering/templates/technical.template.md) |
| Expected action, job lines for media and motion, annotated references, rubric additions, day-7 edge cases, flag key | no home yet |

**Recommendation (Compass's judgment, for Taylor's ruling): retire the package; do not delete it yet.**

1. Move the rows with no home into the UX surface template (expected action, job lines, references, rubric additions, edge cases; Plumb owns it) and the flag key into the technical template (Mason).
2. Then repoint what still cites `package.md` to the brief, the surface file and the technical file:
   - Recipe A step 2 in [`docs/design/README.md`](../design/README.md)
   - the critic's input in [`canon-rubric.md`](../design/canon-rubric.md)
   - [`release.template.md`](../runbooks/release.template.md)
   - [`variant-testing.md`](../runbooks/variant-testing.md)
   - the events, experiment and readout templates
   - the Product row and UI-build budget line in [`docs/index.md`](../index.md)
3. Mark the template `superseded` with a pointer once nothing cites it, and record the ruling in the ledger.

Until then, one shaped piece of work is described in two places, and the two will drift.

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`brief.template.md`](brief.template.md) | Fill when a problem is a candidate for a bet, before any solution work; the brief passes the "Frame go" gate and decides whether shaping starts. |
| [`cycle-charter.template.md`](cycle-charter.template.md) | Fill when a product team adopts fixed-time cycles; read before shaping, betting, or deciding whether unfinished work ships. Sets rhythm, appetites, the betting table, the circuit breaker, cool-down and discovery cadence. |
| [`glossary.template.md`](glossary.template.md) | Fill when a product names an object users see, or when two names for one thing appear in copy, code or events; one name per object, everywhere. |
| [`package.template.md`](package.template.md) | Fill after "Frame go" to make a framed problem buildable; the package goes to the betting table and is what builders, the critic and the measurement owner work from. |
