---
name: tk-batch
description: "Build one or more tickets start to finish in this thread, and keep going until each is closed: start, build, prove, fix what fails, re-prove, as-built, reviews. Use whenever Taylor names tickets to build, run, continue, finish or close, as in 'build STK-5 and STK-7' or 'finish STK-6', or hands over work that has a ticket. No slash command is needed."
argument-hint: <id> [<id> …]
---

Take the named tickets to closed. Taylor runs many threads at once and reads only your last message, so the work is yours until it is finished: you run every command, fix every failure and re-run, and stop only for what a person alone can do.

## What is yours, and what is Taylor's

**Yours, always.** Every `yarn` command, including `contract:run`, `contract:record`, `review:run`, `verify` and `status`. A command the sandbox blocks is run again unsandboxed, without asking. A stale proof on any ticket, yours or not, is re-run (`yarn contract:run <id>`): re-proving is not editing another ticket's work. A dependency that is not built is added to this batch and built first, unless another thread has started it. Every reversible choice: decide, write it under Deviations as `[ASSUMPTION]`, go on. A follow-up you discover is drafted as its own ticket (`yarn contract:init <EPIC | app> <slug> --from <draft> --draft`) and named in the report; build it now only when it blocks this work. Never offer a task chip.

**Taylor's, only these.** A choice that cannot be undone (a vendor, a data region, a shipped schema or public API name); spending money; scope that outgrows the ticket; a file agents cannot write (`.claude/settings.json`); a credential or an account; the merge. Ask everything in one message, each with a recommendation, and keep building whatever does not wait on the answer.

**Never in the report:** a `yarn` command for Taylor to run.

## Each ticket, in build order

1. **Start.** `yarn contract:init <EPIC | app> <slug>`, unless it has started. Clear a refusal yourself where you can.
2. **Read** the contract, its Build notes and the file it cites. A ticket cut before PR-15 may have `prompts/NN-build-<id>.md`: read the files in its Attached table and ignore the rest.
3. **Build** in small commits, `<id>: <outcome>`, staging only this ticket's paths; never `git add -A`. A path the contract does not plan is added to `planned_paths` first.
4. **Prove, and loop.** `yarn contract:run <id>`. Anything that fails: fix, commit, run again, until every `test` and `check` criterion is PASS. Give up on one failure only after three different fixes, and then say what you tried.
5. **Capture and manual criteria.** Do the check yourself wherever a tool can: the browser preview, a script, a query. Record it with `yarn contract:record <id> <criterion> --evidence <path>`. Only when it truly needs a person (their account, their eyes on a new surface, a real device) hand it over: write the evidence file as the steps to take and what should be seen, and record it with `--verdict deferred`. It no longer holds the ticket and is listed under Operator checks in `specs/_status.md`.
6. **As-built**, from `docs/engineering/templates/as-built.template.md`: four short sections.
7. **Review by tier** (`tier:` in the contract). Tier 0: none. Tier 2: `yarn review:run <role> <id>` for each `review:` criterion, unsandboxed; fix a Blocking finding, re-prove, run it again, until PASS. Tier 1: with the batch, below.

## Batch close

1. **Tier 1 review.** One `vigil` subagent for the batch's tier 1 tickets: hand it the contract paths, the results files and the list of files changed, never your summary. Save its reply to `<epic or app folder>/_batch-review-<YYYY-MM-DD>.md`. Fix Blocking and cheap Should-fix findings and re-prove.
2. **`yarn verify`, once.** Fix a failure in this batch's files and re-prove. A failure in a file another thread is editing right now is left to that thread and named in the report; anything else that is broken, fix.
3. **Record.** `yarn status`, `yarn truth:promote <EPIC>` when the epic has `ux/` proposals, then commit (`<EPIC>: batch close`).

A ticket is closed when `yarn status <id>` says "Left to go: none". Do not end the turn before that unless something on Taylor's list above stops you. Never push or merge, and never edit `results.json` or a review file by hand.

## The closing report

Six lines at most, in this shape, and nothing else: no account of the work, no list of what passed.

```
Done: <ids>.
Not done: <id>: <one line why>.
Needs you:
1. <a decision with a recommendation, or an action only a person can take>
To look at when you like: <operator checks handed over, and drafted follow-up tickets, by id>
What went wrong: <two lines at most>
```

Leave out any line that is empty. When everything closed and nothing waits: `Done: <ids>. Nothing needs you.`
