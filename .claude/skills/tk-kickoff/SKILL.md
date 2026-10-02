---
name: tk-kickoff
description: "Start a drafted ticket: check its contract, dependencies and gates, run contract:init to freeze the criteria and create the branch, then state the planned paths. Manual: run it as /tk-kickoff."
disable-model-invocation: true
argument-hint: <APP | app | EPIC> <slug>
---

Start one ticket. `yarn contract:init` enforces every gate below; this skill only puts them in order, so a refusal is the next instruction, not an obstacle.

1. **The contract is complete.** Open the ticket's `contract.md` (or draft it first with `/tk-contract`). No `[FILL]` markers; `yarn check-specs` names anything else.
2. **Its gates hold.** Every cited surface file is `status: approved` and holds no `[NEEDS DECISION — BLOCKING]` (A6). Every `depends_on` ticket has merged. For an epic ticket, `tickets/_preflight.md` holds a PASS line for it against this contract; if the contract changed since, the gate runs again (`yarn review:run vigil <EPIC>`, which Taylor runs when the sandbox cannot reach Claude).
3. **Start it.** Run `yarn contract:init <APP | app | EPIC> <slug>` again. It adds a `review:<role>` criterion per reviewer the planned paths require, freezes the criteria, writes every result at FAIL and switches to `agent/<id>`. It refuses while another item is open on the current branch.
4. **State the planned paths** back, with what each will hold, before writing code. A path you discover later goes into `planned_paths`, and a new criterion only through `yarn contract:add <id> …`.
5. **Build in small commits,** each `<id>: <outcome>`. Never push. `yarn status <id>` says what is left at any time.

End with the branch name, the reviewers, and the first criterion you will prove.
