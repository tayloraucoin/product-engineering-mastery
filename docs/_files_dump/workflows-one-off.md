---
title: "Workflow: the one-off"
description: "Read when a piece of work is a single ticket that changes something that already exists, or when teaching someone the day-to-day loop: five moves from brain dump to merge."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# The one-off: a side quest

> **In one line:** brain dump into the builder, paste its prompt into a new thread, and the agent writes a contract, builds, proves it with scripts and closes it. You merge.

New to the terms? See [`glossary.md`](glossary.md). The big picture is in [`index.md`](index.md).

## Is it really a one-off?

All four must be true. If any one fails, it's an epic ([`epic.md`](epic.md)), and the builder will tell you so.

- [ ] It fits in one ticket, one build thread.
- [ ] It adds no new surface.
- [ ] A living UX file already covers what is changing, or nothing user-facing changes.
- [ ] The problem is settled: you know what "fixed" looks like.

Example: "The records table needs a filter by status." That's a one-off: it's an existing table, a known behavior, and one ticket.

## The five moves

| Move | You | The agent | Physics (what makes it hold) |
|---|---|---|---|
| **1. Brain dump** | Open any Claude Code thread, type `/tk-prompt` (or tag `docs/workflows/prompt-builder.md`) and say what you want | Routes it as a one-off, picks the app, files and model, and prints a kickoff prompt | The prompt is checked against the prompt standard |
| **2. Kick off** | Open a new thread and paste the prompt | Drafts the contract, then runs `yarn contract:init web fix-filter` | Creates `specs/web/one-offs/WEB-41-fix-filter/`, the branch `agent/WEB-41` and every criterion at FAIL. Refuses if another item is active on the branch. |
| **3. Build** | Nothing, or answer a question | Writes the code. If behavior changes, edits the living truth file named in the contract. | Path rules load as files are touched. Hooks block npm, pushing, committing on `main`, and editing results by hand. |
| **4. Prove and close** | Type `/tk-close`, or tell it to close | Runs `contract:run` and `contract:record`, writes the as-built, calls reviewers | Only scripts flip results. Reviewers are chosen by what was touched. The Stop hook prints "Left to go". |
| **5. Merge** | Push `agent/WEB-41`, open the PR (`yarn pr:body WEB-41` writes the description), read it, merge | Nothing; agents never push | The risk tier tells you how closely to read. `check-specs` validates closure. |

Exact command spellings settle in the build. This file is corrected if they differ.

## What the contract looks like

A short file, at most 1,000 tokens. For the filter example:

- **Objective:** Filter the records table by status.
- **Slice type:** UI behavior on an existing surface; the risk is a broken empty state.
- **Criteria:**
  - C1: Selecting a status shows only matching rows. Evidence: `capture`.
  - C2: The URL keeps the filter on reload. Evidence: `test`.
  - C3: Lint, types and build pass. Evidence: `check`.
- **Planned paths:** the table component and its query.
- **Truth files:** `specs/web/ux/records/table.md` gains the filter.
- **Reviewers:** Assay, because it's UI.
- **Out of scope:** saved filters. **Depends on:** nothing.

## What you'll see

Illustrative wording; the real messages come from the hooks.

| Moment | On screen |
|---|---|
| Session opens | `Active: none. Next: nothing queued.` |
| Agent tries `npx` | Denied: "use yarn dlx, or the script in package.json" |
| Agent edits `results.json` | Denied: "results are written by `yarn contract:run WEB-41`" |
| Session stops | `WEB-41 left to go: C1 capture missing; review:assay pending.` |

## Boss fights

Things that stop the agent, and the right move each time.

| Blocked | Why | Right move |
|---|---|---|
| npm, npx, pnpm | One package manager | yarn |
| git push | Only you push | Commit; you push later |
| Commit on `main`, or without a work-id | Every change is traceable | Commit on `agent/WEB-41` as `WEB-41: <outcome>` |
| Hand-editing results | The builder never grades itself | `contract:run` or `contract:record` |
| Closing with a review pending | Fresh eyes are required | Run the review; record its verdict |

## Explain it back

> "Brain dump into the builder, paste its prompt into a new thread. The agent writes a short contract where every check starts failing, gets its own branch, builds, and only scripts can mark checks passed. It updates the living UX file if behavior changed, the right reviewer looks with fresh eyes, and I push and merge."
