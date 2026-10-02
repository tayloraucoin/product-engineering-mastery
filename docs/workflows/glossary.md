---
title: "Workflow glossary"
description: "Read when a term in the workflows, a stage file or a hook message is unfamiliar; one line per term, plus old words from the previous spec system mapped to new ones."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Workflow glossary

One line per term, grouped by system. If a term needs more than a line, it links to where it lives.

## The work

| Term | Meaning |
|---|---|
| **One-off** | A single ticket that changes something that already exists. A side quest. |
| **Epic** | A folder of tickets that share one problem, one UX proposal and one set of technical notes. A campaign. |
| **Ticket** | One unit of buildable work, sized to fit one build thread. Its folder holds a contract, results and an as-built record. |
| **Work-id** | A ticket's name. `WEB-41` for a one-off (app prefix), `OB2-3` for an epic ticket (epic prefix). Scripts allocate the numbers. |
| **Epic prefix** | Two to five capitals or digits naming one epic (`OB2`). Unique in the repo. |
| **Level** | One stage of an epic: Frame, Research, UX, Technical, Tickets, Build. Each runs in its own thread. |
| **Gate** | The test a level must pass before the next one starts. A check where possible; otherwise you. |
| **Brief** | The epic's problem statement: who has the problem, why now, the appetite, what is out, and the knowledge gaps. |
| **Appetite** | How much time the problem is worth. Set before the solution, it shapes how big the solution may be. |
| **Research note** | The output of an optional research thread, saved in the epic's `research/` folder. |
| **Living UX truth** | `specs/<app>/ux/`: always describes how the app works now. |
| **Surface file** | One screen, flow step or component: layout, every state, accessibility, and criteria with IDs. |
| **Area overview** | The frame, routes and decision log for one area of the app (onboarding, settings). |
| **Proposal** | An epic's version of a surface file, which becomes truth when its tickets ship. |
| **Promotion** | The scripted step that copies a shipped proposal into the living truth. |
| **Technical notes** | Mason's `technical.md`: placement, data contract, one-way doors, calls routed to you. |

## The proof

| Term | Meaning |
|---|---|
| **Contract** | A ticket's definition of done: criteria, how each is proven, planned paths, what it cites, what's out of scope, what it depends on, and who reviews it. |
| **Criterion** | One checkable statement in a contract. |
| **Evidence type** | How a criterion is proven: `test` (an automated test), `check` (lint, types, boundaries), `capture` (a screenshot of a UI state) or `manual` (a human check, reported as not verified). |
| **`results.json`** | Each criterion's PASS or FAIL. It starts at FAIL, and only scripts write it, each with a run record. |
| **Run record** | Proof stamped into each result: the command, its exit code, the time and an evidence hash. |
| **As-built** | The closing record: what shipped, deviations and why, migrations, test changes, what wasn't verified, and the next step. Frozen after merge. |
| **Reviewer** | A role that checks a ticket in fresh context, chosen by what the ticket touches. |
| **Vigil** | The QA evaluator. It runs as a read-only subagent and never sees the builder's summary. |
| **Assay** | The UI critic. It scores rendered UI against the canon rubric. |
| **One-way door** | A change that's hard to undo: schema, migrations, auth, billing, package boundaries, public API shape. |
| **Risk tier** | The classifier's label for a diff, based on which one-way doors it touches. |

## The physics

| Term | Meaning |
|---|---|
| **Hook** | A script Claude Code runs automatically before or after an agent action. It can block the action and say why. |
| **Check** | A script in `yarn verify`, the git hooks or CI that fails when a rule is broken. |
| **Path rule** | A file in `.claude/rules/` that loads only when the agent touches matching files. |
| **Skill** | A packaged instruction set. The `tk-` skills are manual: they run only when you type their slash command. |
| **Subagent** | A role run in its own fresh context with limited tools (Vigil, Assay). |
| **Settings and sandbox** | `.claude/settings.json`: what the agent may never do, must ask about, or may do freely. |
| **`toolkit.json`** | The one file that says where things live in this repo: apps, prefixes, specs root, reviewer map. |
| **Always-on** | What loads in every session (`AGENTS.md`, `CLAUDE.md`, `docs/README.md`, listings, the status line), kept under about 3,400 tokens. |
| **Budget** | The token caps for each kind of thread, held by `yarn budget`. |
| **Status** | Generated views of every item's state: `yarn status`, `specs/_status.md`. |
| **Left to go** | The generated list of what remains on the active ticket, printed when a session stops. |
| **Markers** | `[PROVISIONAL]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[ASSUMPTION: …]`. A blocking marker stops tickets that cite it. |

## The flow

| Term | Meaning |
|---|---|
| **Prompt builder** | The front door. You brain dump into it and it prints a ready prompt: route, venue, lead and support roles, files to attach. |
| **Prompt standard** | The checklist every printed prompt is checked against. |
| **Stage file** | One file per level telling the agent who leads, what to load, how to interview, what to write, the gate and the handoff. |
| **Handoff prompt** | The next level's prompt, written by the level that just finished into the epic's `prompts/` folder. |
| **Venue** | Where a prompt runs: Claude Code, or a general Claude thread. Every prompt states it on its first line. |
| **Tier** | How the toolkit is adopted in a repo. Starter: the full toolkit. Overlay: a minimum harness in a repo you don't own. Overlay-local: the same, kept in ignored files. |

## Old words, new words

For anyone who used the previous spec system.

| Old | New |
|---|---|
| Founder brief | The prompt the builder prints |
| UX handoff | The epic's `ux/` proposal, then the living truth |
| Slice spec / ticket file | Contract |
| `00-build-order.md` | `yarn status --epic <EPIC>`, generated |
| `PROGRESS.md` | `results.json` plus generated status |
| `DEVIATIONS.md` | The Deviations section of each as-built |
| `TECHNICAL-DECISIONS.md` | Decision logs and the ledger |
| Three-place closure | One act: the as-built lands and `check-specs` validates it |
| Kickoff contract paste | The kickoff prompt plus `contract:init` |
| "Left to go" at batch end | Printed by the Stop hook |
| No tests during slices | Every criterion names its evidence type; UI defaults to capture |
| Slice / bet (report language) | One-off ticket / epic |
