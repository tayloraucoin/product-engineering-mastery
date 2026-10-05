---
title: "Stage: Tickets"
description: "Open at an epic's tickets level, to cut the approved spec into contracts a build thread can build from the ticket alone, grouped into batches and waves, each with its own QA level, reviewers and focus for the operator to confirm."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# Stage: Tickets (epic level 5)

## 1. Lead and support

Lead: Reeve (`docs/roles/operations-strategy/reeve-project-manager.md`), with Mason for the cut. Vigil (`docs/roles/engineering/vigil-qa.md`) pre-flights the Q3 tickets at the gate, in its own context.

## 2. Venue

Claude Code, on the operator's branch.

## 3. Loads

| File                                              | Reason                                                   |
| ------------------------------------------------- | -------------------------------------------------------- |
| `technical.md` and the approved `ux/` files       | What each ticket builds on                               |
| `docs/engineering/templates/contract.template.md` | What this stage writes                                   |
| `.claude/rules/specs.md`                          | The contract fields and caps, as the check enforces them |
| `docs/workflows/qa-levels.md`                     | The levels, and how reviewers and focus are chosen       |
| `yarn status --epic <EPIC>`                       | What already exists and the build order                  |

## 4. Authoring rules

- **The ticket is the whole brief.** Its Build notes hold the approach, the text of each decision it builds on, the interfaces, a line per planned path, the gotchas and the model. A builder needs the ticket and `technical.md`, nothing else. Detail that only this ticket needs lives here, never in `technical.md`.
- One ticket cites one surface file and the criterion IDs it builds; citing more needs a `waiver:` with the reason.
- State the slice type (what kind of work, what class of failure it risks), the non-negotiables, what is the builder's call, and what is out of scope with where it lives instead.
- Every criterion is observable and names its evidence type (`test`, `check`, `capture`, `manual`); UI criteria default to `capture`. The edge case that makes the ticket risky has its own criterion. `yarn verify` is never a criterion.
- A ticket is under half a day by default; a bigger one is split, never padded.
- **Every ticket gets its own QA level, reviewers and focus** (`qa-levels.md`). Recommend from what the ticket touches, using the reviewer map in `toolkit.json` as evidence; name a focus wherever one part carries the risk ("the webhook handler: every event type handled").
- **Group for efficiency.** A batch is the tickets one thread builds in order because they share context. A wave is the batches that can run at the same time because nothing depends between them.
- Start with at most three tickets per authoring thread; a thin ticket costs more than a second thread.
- Every open `[NEEDS DECISION]` a ticket waits on is put to the operator at this gate, in one batch, so no build thread stops on one.

## 5. Writes

One `tickets/<EPIC>-<n>-<slug>/contract.md` per ticket through `yarn contract:init <EPIC> <slug> --from <draft> --draft`, which allocates the number and starts nothing. No kickoff prompt file: the contract is the brief.

## 6. Gate

1. `yarn check-specs` green on every contract.
2. **The ticket table,** put to the operator once as a question: a row per ticket with its QA level, reviewers, focus, batch and wave, and a rough cost for the whole (an estimate). The operator confirms all, or changes rows.
3. For Q3 tickets, Vigil's pre-flight from the spec before any code: seats, unhappy paths, the promises the ticket touches. Its findings are fixed in the contracts before the build.

## 7. Handoff

Print the build order as waves and batches, and say: tell a thread "build <ids>" for each batch; batches in the same wave can run in parallel threads.
