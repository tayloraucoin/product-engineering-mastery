---
title: "Stage: Build"
description: "Open for a build thread, one ticket or a batch, with or without a formal ticket: the QA level sets the proof, the review and the paperwork, and the thread ends on a short report."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-06
supersedes:
load_when: on request
---

# Stage: Build (a ticket, a batch, or work with no ticket)

Shared by the epic, one-off, bug and product-spec tracks.

## 1. Lead and support

No lead role: the thread is the builder, and the work loop in `AGENTS.md` governs it. The QA level the operator confirmed sets everything else ([`../qa-levels.md`](../qa-levels.md)):

| Level | Proof                                                       | Review                                                              | Written down                                 |
| ----- | ----------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| Q0    | The stop check                                              | None                                                                | Nothing                                      |
| Q1    | The builder runs the criteria; one `yarn verify` at the end | None                                                                | An as-built only when something deviated     |
| Q2    | Same as Q1                                                  | One reviewer in fresh context; findings return in the thread        | A short as-built                             |
| Q3    | Recorded proofs, frozen at close                            | The confirmed specialists, each in fresh context; review files kept | The contract, the as-built, the review files |

A `focus` line in the contract or the prompt raises one named part to a higher level without raising the rest. The operator can raise or lower a level at any time by saying so.

## 2. Venue

Claude Code, on the branch the operator has checked out, unless the prompt says "on its own branch" ([`../branches.md`](../branches.md)). Say which tickets to build ("build STK-5 and STK-7"), or paste a prompt for work with no ticket. One thread builds a batch in order; batches with no dependency between them can run in parallel threads. A thread ends before the batch does when one of these says so:

- Give a ticket with captures a thread of its own.
- End the thread after a ticket's review PASS: run the batch close, report, and leave the next ticket in the batch to a fresh thread.
- Close a thread past 200k tokens of context after a break instead of resuming it; the ticket folder is the hand-off.
- Give a sub-task expected to pass about 50 calls (a dry run, a cold rehearsal, a long review) its own thread from a builder prompt, never a subagent of a Q3 build.

## 3. Loads

| File                                 | Reason                                                               |
| ------------------------------------ | -------------------------------------------------------------------- |
| `contract.md`, or the printed prompt | The brief: what to build, the criteria, the level, the focus         |
| The one surface file it cites        | What the surface must do in every state                              |
| `technical.md`, for an epic ticket   | Only what every ticket in the epic shares                            |
| Path rules, as files are touched     | `ui.md`, `ts.md`, `testing.md`, `next.md`, `specs.md` on their globs |
| Never a `docs/research/` file        | Research is distilled before a build starts                          |

How often the thread stops follows the involvement the operator chose. **Autonomous:** a question the brief cannot answer becomes an `[ASSUMPTION]` in the report or the as-built. **Check in at gates:** the thread stops with its plan and file list before building, and with what it built before closing. **Decide together:** each meaningful choice is put to the operator with a recommendation. In every mode, what only a person can do goes to the operator in one message.

## 4. The loop

Per ticket, in build order:

1. **Start.** With a ticket: `yarn contract:init <APP | EPIC> <slug>`. Without one: restate the criteria from the prompt in the thread.
2. **Build** in small commits labelled with the work id. Work that changes behaviour updates the living UX file in the same change, or writes it when none exists.
3. **Prove at the level.** With a ticket: `yarn contract:run <id>` runs each distinct command once (criteria that share a command share the run) and notes pass or fail in `results.json`; a check that needs a person is handed over as an operator check. Below Q3 that file is a status note and nothing in it goes stale; at Q3 it is the ledger. Without a ticket: run the commands and say what passed.
4. **Fix and prove again** until the criteria pass. Give up on one failure only after three different fixes, and say what was tried.
5. **Write down what the level asks for,** and nothing more.
6. **Review at the level.** Q2: one subagent given the brief, the changed files and the reviewer's role, never the builder's summary. Q3: `yarn review:run <role> <id>` per confirmed specialist. Black and red findings are fixed and re-proven; cheap orange ones too; the rest become drafted follow-ups. A review PASS is final for its round: after it, orange findings are fixed when cheap and re-proven with `yarn contract:run`, never re-reviewed; a FAIL earns one re-review; a third run of the same reviewer on one ticket needs the operator's word (`--operator "<reason>"`; the reason is recorded as a `focus` line in the contract). A Should-fix count that does not fall across rounds says stop.

Once per batch: `yarn verify`, then the report.

## 5. What does not happen

- A commit to a shared file never reopens another ticket. Only a Q3 ticket's proofs are recorded, and they are checked for staleness once, before a merge.
- Evidence logs are not committed.
- No prompt file, no per-ticket kickoff file, no review file below Q3.

## 6. Gate

`yarn verify` green for the batch. For Q3 tickets, `yarn check-specs --strict` before a merge: every criterion recorded as passing, every confirmed review recorded, the as-built complete. Then the operator merges.

## 7. Handoff

The closing report, six lines at most: `Done`, `Not done`, `Needs you` (a decision with a recommendation, or an action only a person can take; never a command to run), `To look at when you like` (operator checks and drafted follow-ups), `What went wrong`. When everything closed it is one line.
