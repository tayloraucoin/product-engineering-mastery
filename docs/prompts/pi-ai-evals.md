---
title: "P-I — AI evals"
description: Commission when a product ships an AI surface that makes claims to users, to fill the eval templates with real failure modes, judges and a CI gate.
layer: prompts
status: draft
thread: P-I
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# P-I — AI evals

> **Stub — commission before running.** Renumbered from the Toolkit Map's primer 16 (`docs/research/14-toolkit-map-plumb.md`, Appendix) per `conflicts.md` CF-29, with product names generalized. Sharpen the ask against the repo as it stands when you commission it.

**Model:** deepest available. **Inject:** Tally leads measurement; Assay owns rubric grading; Compass picks the surface; Plumb captains. **Attach:** `00-shared-context`, those role prompts, `docs/evals/*.template.md`, the product's traces.

**Decision served.** Which surface to evaluate first, its failure modes, its pass bar, and the CI gate that blocks a release.

**Ask.**

1. Choose the surface with Compass; the default candidate is whichever surface makes claims with sources.
2. Error analysis on at least 100 real or realistic traces (synthetic labeled as synthetic).
3. Binary failure modes, starting from `failure-modes.template.md`'s set.
4. Grading that separates answer correctness from source correctness, with span-level citation precision and recall.
5. Judge validation: 30 to 50 Pass and 30 to 50 Fail human labels per judge in dev and test.
6. The harness, its cost per run, and the postmortem fields for an AI incident.

**Done criteria.** Every judge has measured true-positive and true-negative rates; the suite runs in CI with a stated cost; a deliberately broken citation fails the gate.

**Not wanted.** Generic "helpfulness" or "hallucination" scores, Likert scales, public benchmarks presented as the product's own quality, tooling before the failure modes exist.
