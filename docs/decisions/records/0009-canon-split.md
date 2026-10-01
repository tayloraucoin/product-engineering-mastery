---
title: 0009 — The canon splits in two, the builder's law in canon.md and the critic's rubric in canon-rubric.md
description: Read before changing what loads on UI work or in the critic pass, or before moving lines between canon.md and canon-rubric.md.
layer: decisions
status: ruling
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0009 — The canon splits: builder law in `canon.md`, the rubric in `canon-rubric.md`

Amends `conflicts.md` CF-20 ("the rubric lives in `canon.md` §3") and the critic row of the budget in `docs/index.md`. Approved by the owner on 2026-10-01.

## Context and problem

`yarn budget` measured canon v0.1 at about 4,900 tokens. `docs/index.md` gives the whole design layer 5,000 and means a product's own layer to get about 1,700 of it, so the canon was crowding out the product layer it exists to sit under. Every UI build loaded the full canon, but a builder uses only §1 (principles) and §2 (anti-patterns): §3 (the rubric, about 870 tokens) serves the critic, and §4 (what the merge cut, about 270) serves the maintainer.

## Considered options

1. Raise the design-layer cap and leave the canon whole.
2. Split by reader: `canon.md` keeps §1–§2 for builders; the rubric moves to `canon-rubric.md` for the critic; §4 moves to this record.
3. Thin the canon: move each principle's Target, Enforced-by and Sources lines out.

## Decision

Chosen: option 2, because it removes tokens nobody on the builder path reads, without weakening a rule or separating a principle from its sources (option 3 would). Rule IDs do not change, so every C-P, A- and C-R citation in the practice still resolves. The critic loads `canon-rubric.md` plus canon §2, whose tells C-R14 checks by ID. §4 is provenance of the v0.1 merge, so it lives here, below.

This also settles how record 0006 applies after filing: archived reports in `docs/research/` stay byte for byte, while live practice files that arrived through the dump (`canon.md`, `index.md`, `ledger.md`, `conflicts.md`, the templates) change only through their changelog with the owner's sign-off, as this split does. The filing manifest records their state at filing; git history records every change since.

## Consequences

- **Buys:** about 1,140 tokens off every UI build; a critic file that carries only what the critic reads.
- **Costs:** two files to keep in step; the rubric no longer sits beside the principles it scores (each C-R row names its C-P lines, which keeps the link).
- **Does not fully close the budget gap.** Builder canon measures about 3,800 tokens with its frontmatter and preamble, leaving about 1,200 of the design layer's 5,000 for a product layer, not the 1,700 the index allots. Closing the rest is an index amendment, raised separately.
- **Forecloses:** nothing.

## Revisit trigger

The critic needs a principle's full text to score it, or the canon grows past about 3,800 tokens again.

## Appendix — what the v0.1 merge cut, and why (moved from canon §4)

- **Product-bound, cut.** Field-mode target size and thumb-zone tokens; the DealReady/Fybr motion decisions; provenance and measurement lines; R07b M11 (camera).
- **Merged.** Shift Nudge's "cut repeated units" goes into C-P03's counter-example. Interactive-states candidates merge into C-P07. Neutrals, radius and elevation merge into C-P06. Copy lines merge into C-P09.
- **Routed.**
  - Rebuilt native controls (R08 B5) → the accessibility auditor's criteria.
  - Hover scale on cards and rows → `tk-motion` catalog.
  - Model-defaults note (R09 #5) → a section of the anti-patterns template, not an entry.
  - Prompting-checklist amendments (R09) → `docs/design/workflow.md`.
- **Marketing register, cut until a marketing layer exists.** Clone modes; Framer template tells; the "10x Conversion" claim; spectacle packs beyond A-12.
- **Displaced.** About 34 candidate principles became 12; 25 anti-pattern groups became 20; about 45 rubric candidates became 15. The losing lines stay in `_candidates.md` (filed under `docs/research/` as archived) as provenance.
