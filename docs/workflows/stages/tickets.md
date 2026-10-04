---
title: "Stage: Tickets"
description: "Open at an epic's tickets level, to cut the approved spec into contracts a build thread can build and prove from the ticket alone, with tiers computed and dependencies ordered."
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
- The ticket is the whole brief (PR-15): its Build notes hold the approach, the text of each decision it builds on, the interfaces, a line per planned path, the gotchas and the model. A builder, or a person checking what the builder was told, needs no other file. `technical.md` stays the source for a decision that spans tickets.
- `yarn verify` is never a criterion; it runs once at batch close. A criterion proves the ticket's own work.
- A ticket is under half a day by default; a bigger one is split, never padded.
- Every criterion names its evidence type (`test`, `check`, `capture`, `manual`); UI criteria default to `capture`.
- The tier is computed from planned paths (`stages/build.md` §1); set `tier:` to raise or lower it. Only a tier 2 ticket carries reviewers, computed from `toolkit.json` (A7).
- Start with at most three tickets per thread; the ceiling is re-measured on the first epic.
- Every open `[NEEDS DECISION]` a ticket waits on is put to Taylor at this gate, in one batch, so no build thread stops on one.

## 5. Writes

One `tickets/<EPIC>-<n>-<slug>/contract.md` per ticket through `yarn contract:init <EPIC> <slug> --from <draft> --draft`, which allocates the number and starts nothing (the build thread starts it); and `tickets/_preflight.md`, written by `yarn review:run vigil <EPIC>` with one PASS or FAIL line per ticket. No per-ticket kickoff prompt: the contract is the brief.

## 6. Gate

`yarn check-specs` green on every contract, and Vigil's pre-flight PASS line for each tier 2 ticket (built from the spec before any code: seats, unhappy paths, instrumentation, the promises the ticket touches). `contract:init` refuses a tier 2 epic ticket without its PASS line (A13.2); a contract edited after its PASS is noted, not refused.

## 7. Handoff

Print the build order from `yarn status --epic <EPIC>` as batches: each batch is the tickets whose dependencies the earlier batches build. Say: tell a thread "build <ids>"; batches with no dependency between them run in parallel threads on the operator's branch.
