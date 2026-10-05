---
title: "Stage: Build"
description: "Open for a build thread, one ticket or a batch: the contract is the brief and the oracle, results are written only by tooling, the tier sets the review, and the thread ends on a short report."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Stage: Build (a ticket or a batch; the one-off's only stage)

## 1. Lead and support

No lead role: the thread is the builder, and the work loop in `AGENTS.md` governs it. The ticket's tier sets the review (PR-15):

| Tier | Planned paths                                                                                                                            | Review                                                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 0    | Docs and data only                                                                                                                       | None: its scripted criteria                                                                             |
| 1    | Code                                                                                                                                     | One `vigil` pass over the whole batch, at batch close                                                   |
| 2    | A one-way door: the database, schema, migrations, policies, SQL, auth, billing, webhooks, `proxy.ts`, `env.ts`, agent settings and hooks | The Tickets pre-flight, then `vigil` and the `toolkit.json` specialists on the ticket, in fresh context |

`contract:init` computes the tier; `tier:` in the contract, or `yarn contract:tier <id> <n>`, overrides it.

## 2. Venue

Claude Code, on the branch Taylor has checked out. Say which tickets to build ("build STK-5 and STK-7"); `tk-batch` takes them from there. One thread builds a batch in order; tickets with no dependency between them can run in parallel threads on the same branch. Add "on its own branch" when the work should be its own pull request (PR-17): the thread makes a separate folder and branch `agent/<id>` for it, leaves the shared checkout alone, and reports the branch as ready; "merge it back" folds it into the working branch.

## 3. Loads

| File                               | Reason                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `contract.md`                      | The brief and the oracle: Build notes, criteria, planned paths            |
| The one surface file it cites      | What the surface must do in every state                                   |
| `technical.md`, for an epic ticket | Placement and the data contract                                           |
| Path rules, as files are touched   | `ui.md`, `ts.md`, `testing.md`, `next.md`, `specs.md` fire on their globs |
| Never a `docs/research/` file      | A11; `check-specs` fails a kickoff that names one                         |

No interview. A question the contract cannot answer is an `[ASSUMPTION]` in the as-built. Only an open `[NEEDS DECISION]` a ticket waits on, or a change to a criterion, goes to Taylor: once, before the build, every question in one message with a recommendation.

## 4. The loop

Per ticket, in build order:

1. `yarn contract:init <APP|EPIC> <slug>`: it starts a contract drafted at the Tickets stage, or writes one from the template to fill and start with a second run. A dependency counts once its own criteria are PASS; its reviews never hold the next ticket.
2. Build inside the rails. A one-off that changes behaviour edits the truth file named in `truth_files` in the same branch.
3. `yarn contract:run <id>` for `test` and `check` criteria; `yarn contract:record <id> <criterion> --evidence <path>` for `capture` and `manual`.
4. The as-built, then a tier 2 ticket's reviews through `yarn review:run <role> <id>`.

Once per batch: the tier 1 review, `yarn verify`, `yarn status`, and the report.

The thread runs all of it and keeps going until `yarn status <id>` says nothing is left (PR-16): a failure is fixed and re-proven, a stale proof on any ticket is re-run, a blocked command is run again unsandboxed. What only a person can check is handed over as an operator check (`--verdict deferred`), which closes the ticket and lists the check in `specs/_status.md`. Set `operator_review: true`, or say so in the thread, when you want to look a ticket over yourself.

## 5. Writes

`results.json` (tooling only), `as-built.md` (Shipped against the contract, Deviations, Not verified, Next), review files, and the truth-file edit for a one-off.

## 6. Gate

During a build, `yarn check-specs` fails only on a defect (a broken contract, a hand-edited result) and warns on work in flight, so one ticket's open close never fails another's `yarn verify`. Before a merge, `yarn check-specs --strict`: every criterion PASS with a run record whose commit is not older than the ticket's own paths; every `review:*` recorded; the as-built complete. Then you: read the batch report, read a tier 2 ticket's `review-<role>.md`, and merge.

## 7. Handoff

The thread ends on the closing report in `tk-batch`'s shape, six lines at most: `Done`, `Not done`, `Needs you` (a decision with a recommendation, or an action only a person can take; never a `yarn` command), `To look at when you like` (operator checks and drafted follow-ups), `What went wrong`. When everything closed it is one line. The Stop hook checks only the files that thread edited.
