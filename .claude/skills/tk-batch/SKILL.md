---
name: tk-batch
description: "Build one or more tickets start to finish in this thread: start each, build, prove, write the as-built, review by tier, then one verify and one short report. Use whenever Taylor names tickets to build, run, continue, finish or close, as in 'build STK-5 and STK-7' or 'finish STK-6', with or without a build prompt. No slash command is needed."
argument-hint: <id> [<id> …]
---

Take the named tickets from wherever each stands to closed, without stopping to ask. Taylor runs many threads at once: decide what is yours to decide, and save Taylor's attention for the closing report.

## Before any code

1. **Order.** `yarn status --epic <EPIC>` prints the build order; follow it within the batch. A ticket whose dependency is neither built nor in this batch is skipped and reported; the rest go on.
2. **Decisions, once.** Read each contract and the file it cites. If a ticket in the batch waits on an open `[NEEDS DECISION]`, ask Taylor every such question in one message, each with a recommendation, then build the tickets that do not wait while the answer is out. Anything reversible is never a question: assume, label it `[ASSUMPTION]` in the as-built, go on.

## Each ticket, in order

1. **Start.** `yarn contract:init <EPIC | app> <slug>`, unless it has started. It writes the ticket's tier and reviewers. A refusal you can clear (a dependency in this batch, a stale file) you clear; one you cannot goes in the report.
2. **Read** the contract, its Build notes and the file it cites. A ticket cut before PR-15 may have `prompts/NN-build-<id>.md`: read the files in its Attached table and ignore the rest of it.
3. **Build** in small commits, `<id>: <outcome>`, staging only this ticket's paths; never `git add -A`. A path the contract does not plan is added to `planned_paths` first.
4. **Prove.** `yarn contract:run <id>`; `yarn contract:record <id> <criterion> --evidence <path>` for each `capture` and `manual` criterion. A failure is fixed and re-run. After three tries at the same failure, stop that ticket and report it.
5. **As-built**, from `docs/engineering/templates/as-built.template.md`: four short sections.
6. **Review by tier** (`tier:` in the contract). Tier 0: none. Tier 2: `yarn review:run <role> <id>` for each `review:` criterion (unsandboxed; it calls Claude); fix a Blocking finding, re-prove, run it again. Tier 1: reviewed with the batch, below.

## Batch close

1. **Tier 1 review.** One `vigil` subagent for all the batch's tier 1 tickets: hand it the contract paths, the results files and the list of files changed, never your summary. Save its reply to `<epic or app folder>/_batch-review-<YYYY-MM-DD>.md`. Fix Blocking findings and re-prove; carry Should-fix findings into the report.
2. **`yarn verify`, once.** A failure in this batch's files is fixed, and the ticket it belongs to re-proven. A failure in a file another thread owns is left alone and reported.
3. **Record.** `yarn status`, `yarn truth:promote <EPIC>` when the epic has `ux/` proposals, then commit (`<EPIC>: batch close`).

Never push or merge, edit `results.json` or a review file, or change another ticket's files.

## The closing report

This is all Taylor reads. Use exactly this shape, and nothing else: no account of the work, no list of checks that passed.

```
Done: <ids>.
Not done: <id>: <one line why>.
Needs you:
1. <the action, with the exact command; or the yes/no question, with a recommendation>
What went wrong: <three lines at most>
```

Leave out any line that is empty. When everything closed, the report is `Done: <ids>. Nothing needs you.`
