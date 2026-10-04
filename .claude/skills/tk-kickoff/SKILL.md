---
name: tk-kickoff
description: "Start a drafted ticket: check its contract, dependencies and gates, run contract:init to freeze the criteria on the operator's branch, then state the planned paths. Use when a build prompt or Taylor says to start, kick off or build a ticket that has a contract.md and no results.json yet."
argument-hint: <APP | app | EPIC> <slug>
---

Start one ticket. `yarn contract:init` enforces every gate below; this skill only puts them in order, so a refusal is the next instruction, not an obstacle.

1. **The contract is complete.** Open the ticket's `contract.md` (or draft it first with `/tk-contract`). No `[FILL]` markers; `yarn check-specs` names anything else.
2. **Its gates hold.** Every cited surface file is `status: approved` and holds no `[NEEDS DECISION — BLOCKING]` (A6). Every `depends_on` ticket has its as-built on this branch, merged or stacked beneath it; never wait for a merge. For an epic ticket, `tickets/_preflight.md` holds a PASS line for it against this contract; if the contract changed since, the gate runs again (`yarn review:run vigil <EPIC>`, which Taylor runs when the sandbox cannot reach Claude).
3. **Start it.** Run `yarn contract:init <APP | app | EPIC> <slug>` again. It adds a `review:<role>` criterion per reviewer the planned paths require, freezes the criteria and writes every result at FAIL, on the branch the operator has checked out; it never creates or switches one, and refuses only the protected branch. Other tickets may be building on the same branch in parallel (PR-14): commit only your own planned paths, never `git add -A`.
4. **State the planned paths** back, with what each will hold, before writing code. A path you discover later goes into `planned_paths`, and a new criterion only through `yarn contract:add <id> …`.
5. **Build in small commits,** each `<id>: <outcome>`. Never push. `yarn status <id>` says what is left at any time.

End with the branch name, the reviewers, and the first criterion you will prove.
