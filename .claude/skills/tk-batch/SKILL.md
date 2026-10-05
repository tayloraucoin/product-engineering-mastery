---
name: tk-batch
description: "Build one or more tickets start to finish in this thread, and keep going until each is done at its QA level: start, build, prove, fix what fails, prove again, review, report. Use whenever the operator names tickets to build, run, continue, finish or close, as in 'build STK-5 and STK-7' or 'finish STK-6'. No slash command is needed."
argument-hint: <id> [<id> …]
---

Take the named tickets to done. The operator runs many threads and reads only your last message, so the work is yours until it is finished. `docs/workflows/stages/build.md` is the full protocol; this is the short form.

## Yours, and the operator's

**Yours.** Every command. A command the sandbox blocks is run again unsandboxed. Every reversible choice: decide, note it as `[ASSUMPTION]`, go on. A dependency that is not built is built first, unless another thread has started it. A follow-up you discover is drafted as its own ticket (`yarn contract:init <EPIC | app> <slug> --from <draft> --draft`) and named in the report.

**The operator's, only these.** A choice that cannot be undone; spending money; scope that outgrows the ticket; a file agents cannot write (`.claude/settings.json`); a credential or an account; the merge. Ask everything in one message, each with a recommendation, and keep building whatever does not wait on the answer. If the prompt or contract names an involvement other than autonomous, also stop where it says.

**Not yours.** Another ticket's proofs, reviews or files. A stale proof on someone else's ticket is theirs; name it in the report if it blocks you.

## Where the work goes

The branch that is checked out. Only when the operator or the prompt says "on its own branch": `git worktree add .claude/worktrees/<name> -b agent/<name>` from the current branch, `yarn install` there, do everything there, and report `Branch: agent/<name>, ready for a pull request.` On "merge it back", merge it into the main checkout's branch and remove the folder and the branch. One branch per request, never one per ticket.

## Each ticket, in build order

1. **Start.** `yarn contract:init <EPIC | app> <slug>`, unless it has started. Read the contract: its Build notes, its QA level, reviewers and `focus` lines, and the one file it cites.
2. **Build** in small commits, `<id>: <outcome>`, staging only this ticket's paths; never `git add -A`.
3. **Prove at the level.**
   - Q1 and Q2: run each criterion's command once (criteria that share a command share the run). Do capture and manual checks yourself wherever a tool can.
   - Q3: `yarn contract:run <id>`, and `yarn contract:record <id> <criterion> --evidence <path>` for capture and manual criteria. A check that truly needs a person is recorded `--verdict deferred` with the steps to take.
   - Anything that fails: fix, commit, prove again. Give up on one failure only after three different fixes, and say what you tried.
4. **Write down what the level asks for.** An as-built at Q2 and Q3, or at Q1 when something deviated. Nothing else.
5. **Review at the level.** Q2: one subagent given the contract, the changed files and the reviewer's role, never your summary; its findings stay in the thread. Q3: `yarn review:run <role> <id>` for each confirmed reviewer, unsandboxed. A `focus` line is reviewed at the level it names. Fix black and red findings and cheap orange ones, prove again; draft the rest as follow-ups.

## Batch close

`yarn verify`, once. Fix a failure in this batch's files. A failure in a file another thread is editing is named in the report and left alone. Then `yarn truth:promote <EPIC>` when the epic has `ux/` proposals, and commit.

Never push or merge, and never edit `results.json` or a review file by hand.

## The closing report

Six lines at most, in this shape, and nothing else:

```
Done: <ids>.
Not done: <id>: <one line why>.
Needs you:
1. <a decision with a recommendation, or an action only a person can take>
To look at when you like: <operator checks handed over, drafted follow-ups>
What went wrong: <two lines at most>
```

Leave out any line that is empty. Never put a command for the operator to run in it. When everything is done and nothing waits: `Done: <ids>. Nothing needs you.`
