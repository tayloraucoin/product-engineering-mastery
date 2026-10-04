---
title: "The prompt standard: what every printed prompt carries"
description: "Read before writing or checking any prompt that opens a thread, by the prompt builder, a stage file or a person: the checklist a prompt must pass, and the venue line it opens with."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# The prompt standard

> **In one line:** a prompt is a contract for one thread. It says where it runs, who plays, what is attached and why, what decision it serves, what it must write, what passes it, and what is not wanted. The builder and every stage file check their output against this list before printing it, and report the check.

Distilled from `docs/prompts/shared-context.md`, the shape of the PJ prompts (decision served, ask, evidence rules, done criteria, not wanted), the founder-brief shape (role, support, attached, deliverable, should include, process), and the kickoff block for build threads.

## The checklist

A prompt passes when every row holds. The builder prints this table filled in under the prompt.

| #   | Item            | What passes                                                                                                                                                                                                                                                             |
| --- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Venue line      | The first line is `Venue: Claude Code, in <repo>` or `Venue: general Claude thread`. The operator picks the branch; a prompt names one only when the ticket must stay apart. Nothing precedes it.                                                                       |
| 2   | Role            | Names one lead role by file path (`docs/roles/<department>/<name>.md`) and says to read it first with `docs/prompts/shared-context.md`. Build threads name no lead role.                                                                                                |
| 3   | Support         | Names each supporting role and the one function it is consulted for. "Consult, never co-pilot."                                                                                                                                                                         |
| 4   | Attached        | Every file to read, each with one reason, each within the stage's load budget. Paths are exact and exist. A `docs/research/` file appears only in a Frame, Research or UX prompt, labelled `[research: <why>]`, and only when nothing distilled covers the topic (A11). |
| 5   | Decision served | One sentence: what the thread decides or produces, and who acts on it.                                                                                                                                                                                                  |
| 6   | The ask         | Numbered steps, each ending in something checkable. Interview stages say "numbered rounds, each question with a recommended default; nothing invented silently; open items carry a marker".                                                                             |
| 7   | Writes          | Exact output paths and the template each comes from.                                                                                                                                                                                                                    |
| 8   | Gate            | What passes the thread: a check by name, or "you".                                                                                                                                                                                                                      |
| 9   | Handoff         | What the thread prints at the end: the next prompt and its path, or the merge instruction.                                                                                                                                                                              |
| 10  | Evidence rules  | Verified, secondary or judgment labels; dates on tool behaviour and prices; not found is marked, never filled.                                                                                                                                                          |
| 11  | Not wanted      | The three to five things this thread must not do.                                                                                                                                                                                                                       |
| 12  | Markers         | Uses `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` as the only open markers.                                                                                                                                                       |
| 13  | Model           | Names the model, and for build threads the failure mode of choosing a smaller one.                                                                                                                                                                                      |
| 14  | Standing rules  | No emoji; synthetic data in every example; every claim about tool behaviour carries the version and date it was verified on.                                                                                                                                            |

## The kickoff block (build threads only)

A ticket's kickoff prompt ends with this block, filled in:

```
Kickoff
- Ticket: <id>, in <folder>; contract at contract.md (read it first; it is the oracle)
- Branch: the operator's; first move: yarn contract:init <APP|EPIC> <slug> (run twice when no contract is drafted yet: write, fill, start)
- Cites: <one surface file>; truth files: <paths or none: reason>
- Tier and reviewers: computed by contract:init; build and close without stopping (tk-batch), ending on its closing report
- Do not: edit results.json; commit on main; push; widen settings; create or switch branches; commit another ticket's files
- Done: results all PASS with run records, as-built written, status shows nothing left
```

## Load budgets by stage

The map's budget table (`docs/index.md`) caps build threads. Shaping threads are not capped yet (A10); each stage file states its own list and reasons, and the first epic measures them.

| Stage     | Loads, beyond the role and the shared context                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Frame     | brief template; the area's living truth; any earlier epic on the area; at most 2 research files                               |
| Research  | the research-note template; the brief's gap list; the sources the gap names                                                   |
| UX        | canon; the product's DESIGN file; at most 3 references; states and components templates; the area's truth; the research notes |
| Technical | approved UX files; codebase conventions; the tech stack; the reviewer rows in `toolkit.json`                                  |
| Tickets   | technical notes; the approved UX files; the contract template; `yarn status --epic`                                           |
| Build     | the contract; the one cited surface; path rules fire on touch; never a research file                                          |
