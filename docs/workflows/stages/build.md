---
title: "Stage: Build"
description: "Open for one ticket's build thread, one-off or epic: the contract is the oracle, results are written only by tooling, reviewers run in fresh context, and the thread ends when status shows nothing left."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Stage: Build (a ticket; the one-off's only stage)

## 1. Lead and support

No lead role: the thread is the builder, and the work loop in `AGENTS.md` governs it. Reviewers run at close in fresh context: `vigil` (every epic ticket; a one-off touching a one-way door, or whose `truth_files` is not `none`, or with a Test changes line), `assay` on UI, and the rows in `toolkit.json`. Specialists are consulted by function only when the contract names one.

## 2. Venue

Claude Code, on `agent/<id>`.

## 3. Loads

| File                               | Reason                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `contract.md`                      | The oracle: criteria, evidence types, planned paths                       |
| The one surface file it cites      | What the surface must do in every state                                   |
| `technical.md`, for an epic ticket | Placement and the data contract                                           |
| Path rules, as files are touched   | `ui.md`, `ts.md`, `testing.md`, `next.md`, `specs.md` fire on their globs |
| Never a `docs/research/` file      | A11; `check-specs` fails a kickoff that names one                         |

No interview. A question the contract cannot answer is an `[ASSUMPTION]` in the as-built, or, if it would change a criterion, a stop and a message to Taylor.

## 4. The loop

1. `yarn contract:init <APP|EPIC> <slug>`: it starts a contract drafted at the Tickets stage, or writes one from the template to fill and start with a second run; state the planned paths before writing code.
2. Build inside the rails. A one-off that changes behaviour edits the truth file named in `truth_files` in the same branch.
3. `yarn contract:run <id>` for `test` and `check` criteria; `yarn contract:record <id> <criterion> --evidence <path>` for `capture` and `manual`.
4. `/tk-close`: drafts `as-built.md`, forks the reviewers through `yarn review:run <role> <id>`, records their verdicts, runs `yarn status <id>`.

## 5. Writes

`results.json` (tooling only), `as-built.md` (Shipped against the contract, Deviations, Ledger IDs, Migrations, Test changes, Not verified, Model, Next), review files, and the truth-file edit for a one-off.

## 6. Gate

`yarn check-specs`: every criterion PASS with a run record whose commit is not older than the diff; every `review:*` recorded; the as-built complete. Then you: read `review-<role>.md` (the review file proves a review ran, not that it was independent; your read is the boundary), read the tier `yarn pr:body <id>` names, and merge.

## 7. Handoff

The Stop hook prints "left to go". When it is empty, the thread says: push `agent/<id>`, open the PR with `yarn pr:body <id>`, merge; for an epic ticket, `yarn truth:promote <EPIC>` runs at close when every citing ticket has merged.
