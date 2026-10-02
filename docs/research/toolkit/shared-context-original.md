---
title: Shared context — attach to every thread (original, product-bound)
description: Read only to trace the SC source code the ledger cites; superseded by the universal docs/prompts/00-shared-context.md (CF-42).
layer: research
status: archived
thread: SC
role:
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Shared context — attach to every thread alongside the role prompt

> Paste or attach this with each primer prompt. It is the standing briefing every role reads before the task; it is deliberately short so it never crowds out the role prompt or the sources.

## Who is captaining

Taylor Aucoin — product engineer, ~10 years founding-engineer work, TypeScript almost exclusively, AI-native build practice (layered convention files plus defined role prompts for coding agents). Two live seats right now:

- **Head of Product at Viewpoint.AI / DealReady** — an investor due-diligence tool. Trust UI is the product: provenance on every AI claim, diffable documents, audit trails, dense-but-calm tables, keyboard-first. Seed stage.
- **Product engineer on contract at Fybr** — the latest self-serve version of their GIS-focused stockpile-measurement software. Spatial UI is the product: map-first layouts, measurement confidence and units always visible, progressive disclosure for novices versus surveyors, performance on large datasets, exportable reports. Field conditions (glare, gloves, one hand) are real.

The goal across both: operate as a top-tier product engineer leaning heavily product-side — judgment, taste, discovery, verification, narrative — with generation treated as cheap and selection treated as the job.

## The mental model in force — the three loops

1. **Divergent loop** (explore many directions): best on a canvas — Figma, Paper, Stitch, Claude Design — where directions can be compared side by side.
2. **Convergent loop** (make one direction real): best in code, with Claude Code or Cursor, against the design system.
3. **Polish loop** (the last 10 percent of feel): spatial direct manipulation — Cursor Design Mode, Figma as a scalpel, Paper/Pencil edits, or hand-tuned code.

Prompting is strong at loop 2, adequate at loop 1, and bad at loop 3. The "prompt lottery" is what happens when prompting is used for all three.

## Recipe A — code-first product engineer (the default workflow)

1. **Frame** (10 min): `/specs/<feature>/brief.md` — job-to-be-done, user, metric, constraints, non-goals, required states.
2. **References** (10 min): 3–6 annotated screenshots in `refs/`.
3. **Diverge** (15–30 min): Claude Code builds 3 distinct directions as isolated routes or Storybook stories, using a design skill, forcing a different layout strategy for each. Optionally the same brief in Stitch or Claude Design.
4. **Capture** (optional): push directions and states into Figma via Code to Canvas for async stakeholder critique.
5. **Converge**: implement the chosen direction using only design-system components and tokens; any new primitive needs a justification in the PR.
6. **Verify** (the multiplier): a UI Critic subagent uses Playwright to screenshot 3 breakpoints and every state, scores against a rubric (hierarchy, spacing, contrast/a11y, state coverage, `DESIGN.md` fit, slop tells). The builder fixes; cap at 2–3 rounds.
7. **Polish** (human, spatial): Cursor Design Mode or direct edits for spacing, motion, copy.
8. **Ship** behind a PostHog flag with the brief's events; review replays within 48 hours.

## Prompting checklist for UI (in force)

Direct with principles, not pixel specs · ban the slop tells in `CLAUDE.md` (Inter everywhere, purple-to-white gradients, 4-card grids, weak hover states) · always attach references · list the states explicitly · constrain the vocabulary (only `@/components/ui`, only tokens, no raw hex) · ask for divergence on one axis · iterate with annotated screenshots, not prose · separate generate and critique passes into different roles · reset context between directions · timebox the lottery (after three failed prompts, hand-edit or fix the design-system gap).

## The design layer being built (target file plan)

```
/docs/design/DESIGN.md         # principles, voice, density, motion
/docs/design/tokens.md         # token table + usage rules
/docs/design/components.md     # when to use which; forbidden patterns
/docs/design/anti-patterns.md  # slop tells + product no-gos
/docs/design/states.md         # required state matrix
/docs/design/refs/             # annotated reference screenshots
/.claude/skills/ui-critic/     # rubric + Playwright procedure
/.claude/skills/ui-diverge/    # "3 directions" procedure
/specs/<feature>/brief.md
```

## The product-design department (role prompts available)

Compass (product strategist) · Tribune (customer advocate) · Envoy (user researcher) · Vesper (UX/UI designer) · Vitrine (web designer) · **Plumb** (design director — owns `DESIGN.md`, rejects off-system work) · **Assay** (UI critic — screenshots and rubric, never writes code) · **Gloss** (content designer) · **Threshold** (accessibility auditor) · **Alembic** (research synthesizer — distills sources, adds nothing) · **Tally** (metrics analyst).

Each thread injects one primary role. Where the role prompt and an attached document disagree on fact, the document wins; where both are silent, the role's judgment fills the gap. Roles route what isn't theirs rather than absorbing it.

## Standing evidence rules for every investigation thread

- Prefer primary sources (the vendor's own docs and changelogs, the author's own site, the course's own pages) over comparisons, listicles, and aggregators. Vendor-written comparisons are feature facts, never verdicts.
- Date every claim about pricing, availability, or capability; these change monthly in this category.
- Label each claim: verified (primary source, dated) / secondary (who said it) / judgment (yours).
- Mark what could not be found as not found. Never fill a gap with what is probably true.
- No emoji, ever.
