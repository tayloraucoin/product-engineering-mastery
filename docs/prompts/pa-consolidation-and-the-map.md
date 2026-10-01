---
title: P-A — Consolidation and the map (general Claude thread, Opus)
description: Paste into a general thread (Alembic, then Plumb) to consolidate thread outputs into the ledger, conflicts, canon, index and filing plan.
layer: prompts
status: adopted
thread: P-A
role: Alembic
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# P-A — Consolidation and the map (general Claude thread, Opus)

**Inject:** Alembic (message 1), then Plumb (message 2). **Attach:** `00-shared-context`; both role prompts; the role-authoring guide; the product-design role coverage report; every output from the fourteen threads — the toolkit map (14), the Plumb rulings (01, 04), the Tally report (03), the Compass charter (05), the Shift Nudge pair (06), the motion pair (07), the Refactoring UI review (08), the Design+Code review (09), the Product Talk review (10), the extraction guide (11), the books plan (12b), the Laws of UX set (13), the Framer investigation (02); and this plan (`toolkit-plan.md`) for the target layout.

**Message 1 — Alembic.**

Alembic — you're on this one. Read your role prompt and the shared context. This is extraction into a repo, not synthesis; nothing enters that isn't in the reports.

The decision this serves: a universal craft-toolkit repo is being built from fourteen threads of research, and every ruling, every canon line, and every file has to land in one known place before anything is written, so nothing is built twice and nothing is lost. The target layout is in the attached plan, §2.6.

The ask. (1) `docs/decisions/ledger.md`: every decision, ruling, verdict, or recommendation across the reports, one line each — the decision in the report's words, source file and section, the role that made it, its stated status (ruled / proposed / conditional / needs a human call), and what it displaces. Grouped by layer: workflow and tools, skills, design canon, product operating system, measurement, library, purchases. Product-specific decisions (anything about DealReady or Fybr) are kept but tagged `[product-bound]` so Plumb can strip or generalize them. (2) `docs/design/_candidates.md`: every line any report proposed for `DESIGN.md`, `tokens.md`, `anti-patterns.md`, `states.md`, or the critic rubric — verbatim, with source and target file, duplicates grouped not merged. (3) `docs/decisions/conflicts.md`: everywhere two reports disagree, both sides with sources, unresolved — including the toolkit map's proposed layout and build order against the plan's §2.6 and §3. (4) The filing plan: a table of every attached file → its target path and frontmatter values under the layout, with product-bound material flagged. (5) `only-you.md`: the calls the reports say only I can make, with their recommendations. Separated notes last.

Run your provenance, inflation, contradiction, and separation tests. Output the five files as fenced blocks with frontmatter per the plan's §2.7. Stop and wait.

**Message 2 — Plumb** (after message 1 returns).

Plumb — read your role prompt; Alembic's five files are in thread. The toolkit is universal: no product in it.

The ask. (1) Resolve `conflicts.md`, one ruling each with the rule cited and the losing argument acknowledged. Where the toolkit map and the plan disagree on layout or order, rule, and say why — the plan is an opinion, not law. (2) Merge `_candidates.md` into `docs/design/canon.md`: deduplicated, every line in your form (principle, example, counter-example), assigned to its target template, source tag kept, product-bound lines generalized or cut. Examples come from the demo app's intended surfaces (dense table, destructive dialog, empty state, onboarding) so the canon and the demo agree from day one. Caps: twelve principles, twenty anti-patterns, fifteen rubric lines. (3) Write `docs/index.md`: the map of the practice — the layers, what each holds, precedence between them, what loads always versus on trigger, and the context budget you recommend per build. (4) Strip the product from the product layer: `cycle-charter.template.md`, `variant-testing-runbook.md`, and the brief and package templates, with the DealReady and Fybr specifics replaced by `[FILL]` sockets and one line each on what goes in the socket. (5) The Phase 2 checklist: the exact files to write in Claude Code, in dependency order, each with its source.

Run your enforceability, displacement, and agent-readability tests on the canon and the index. Output: resolved conflicts, `canon.md`, `index.md`, the stripped templates, the checklist. Not wanted: a canon that keeps everything because every line had a good source, or an index longer than two screens.
