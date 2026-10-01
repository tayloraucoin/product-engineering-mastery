---
title: Decision record (template)
description: Fill when a decision's reason needs more than the one ledger line — a choice with real alternatives, a reversed ruling, or anything a later session might re-argue.
layer: decisions
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# [FILL: NNNN] — [FILL: the decision, stated as a claim]

> **Who fills:** the role that owns the decision (Plumb for the design layer and workflow, Compass for product, Tally for measurement, Mason for engineering).
> **When:** at the moment of the decision, never reconstructed later. A ledger line is enough when the reason fits on one line; write a record only when it does not (`docs/decisions/conflicts.md` CF-06).
> **Lives at:** `docs/decisions/records/NNNN-kebab-slug.md`, numbered in order, never renumbered. Add the ledger line or changelog entry that points here in the same change.
> **What the critic checks:** nothing. Records govern people and agents; the critic cites the rule a record produced, never the record.
> **Format:** MADR 4.0 minimal, plus a revisit trigger. The rejected option is the counter-example (example test, R14 §5).
> **Records are immutable once accepted.** Reversal is a new record whose `supersedes` names this one.

## Context and problem

[FILL: the situation as it was when decided, in two to five sentences. Name the constraint that forced a choice.]

## Considered options

1. [FILL: option A, one line]
2. [FILL: option B, one line]
3. [FILL: option C, or delete]

## Decision

Chosen: [FILL: option], because [FILL: the rule or evidence that decided it, cited].

## Consequences

- **Buys:** [FILL]
- **Costs:** [FILL]
- **Forecloses:** [FILL, or "nothing"]

## Revisit trigger

[FILL: the observable condition under which this is reopened. "None expected" is allowed; "when it feels wrong" is not.]
