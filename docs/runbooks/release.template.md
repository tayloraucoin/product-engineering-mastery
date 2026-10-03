---
title: Release (template) — from merged to read
description: Fill for every release behind a flag, from the deploy through the 48-hour replay review to the flag's removal; the checklist for Recipe A's ship step.
layer: runbooks
status: adopted
thread: "14"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: metrics
---

# Release — [FILL: feature], [FILL: YYYY-MM-DD]

> **Who fills:** the builder for the technical checks; Tally for events and the rollout plan; the shaper for the replay review and the decision.
> **When:** on the day of deploy (charter day 8), then at 48 hours, then at the flag's removal.
> **Lives at:** `specs/<feature>/release.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** the critic pass recorded below must be clean before deploy (C-R01–C-R15, at most 3 rounds).

## Before deploy

- [ ] Package linked: `specs/[FILL]/package.md`
- [ ] Critic pass clean: round `[FILL]`, report `[FILL: link]`
- [ ] Flag `[FILL: key]` created; description carries the rollback trigger (`variant-testing.md` §9)
- [ ] Every event in the package's instrumentation table verified in staging with seeded data (runbook step 4)
- [ ] Replay masking verified on one recording; no customer content visible
- [ ] Pre-registered rule dated before the flag flips: [`experiment.md`](../measurement/metrics/experiment.template.md)

## Rollout

| Step     | Target                                         | Date     | Guardrails read |
| -------- | ---------------------------------------------- | -------- | --------------- |
| `[FILL]` | `[FILL: named accounts / cohort / percentage]` | `[FILL]` | `[FILL]`        |

## Within 48 hours

- [ ] Every exposed session watched; one line each in the replay log
- [ ] Guardrails read against their breach levels
- [ ] Support mentions logged verbatim

## Close

- [ ] Readout written ([`readout.template.md`](../measurement/metrics/readout.template.md)); outcome recorded against the pre-registered rule
- [ ] Ship: flag at 100%, then flag and dead code removed within 2 weeks. Kill: flag off, code removed. Iterate: new package, flag `-v2`.
- [ ] Changelog entry in the product's `CHANGELOG.md`
