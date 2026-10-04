---
title: "Stage: Tickets"
description: "Open at an epic's tickets level, to cut the approved spec into contracts a build thread can prove, with reviewers computed, dependencies ordered and a kickoff prompt per ticket."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Stage: Tickets (epic level 5)

## 1. Lead and support

Lead: Reeve (`docs/roles/operations-strategy/reeve-project-manager.md`), with Mason for the cut. Vigil (`docs/roles/engineering/vigil-qa.md`) runs the pre-flight at the gate, in its own context.

## 2. Venue

Claude Code, on `agent/<EPIC>`.

## 3. Loads

| File                                              | Reason                                                   |
| ------------------------------------------------- | -------------------------------------------------------- |
| `technical.md` and the approved `ux/` files       | What each ticket cites                                   |
| `docs/engineering/templates/contract.template.md` | What this stage writes (J5)                              |
| `.claude/rules/specs.md`                          | The contract fields and caps, as the check enforces them |
| `yarn status --epic <EPIC>`                       | What already exists and the build order                  |

## 4. Authoring rules

Adapted from the owner's earlier ticket system; the spec-system guide is filed when Taylor attaches it. Until then:

- One ticket cites one surface file and the criterion IDs it builds; citing more needs a `waiver:` with the reason (A5).
- A ticket is under half a day by default; a bigger one is split, never padded.
- Every criterion names its evidence type (`test`, `check`, `capture`, `manual`); UI criteria default to `capture`.
- Reviewers are computed from planned paths against `toolkit.json`, and Vigil joins every epic ticket (A7).
- Start with at most three tickets per thread; the ceiling is re-measured on the first epic.
- The model recommendation for each build thread states the failure mode of choosing down.

## 5. Writes

One `tickets/<EPIC>-<n>-<slug>/contract.md` per ticket through `yarn contract:init <EPIC> <slug> --from <draft> --draft`, which allocates the number and starts nothing (the build thread starts it); `tickets/_preflight.md`, written by `yarn review:run vigil <EPIC>` with one PASS or FAIL line per ticket, bound to that contract's hash; and one kickoff prompt per ticket in `prompts/NN-build-<id>.md`, ending with the standard's kickoff block.

## 6. Gate

Vigil's pre-flight line per ticket (built from the spec before any code: seats, unhappy paths, instrumentation, the promises the ticket touches), and `yarn check-specs` green on every contract. `contract:init` for an epic ticket refuses without its PASS line (A13.2).

## 7. Handoff

Print the build order from `yarn status --epic <EPIC>` and the first ticket's kickoff prompt; say: open a new thread per ticket, in that order; tickets with no dependency between them run in parallel on the operator's branch.
