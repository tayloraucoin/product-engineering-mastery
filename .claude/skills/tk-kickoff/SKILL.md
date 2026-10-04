---
name: tk-kickoff
description: "Start one drafted ticket without building it: run contract:init to set its tier and reviewers and freeze its criteria on the operator's branch. Use only when Taylor asks to start or kick off a ticket and nothing more; to build a ticket, use tk-batch, which starts it too."
argument-hint: <APP | app | EPIC> <slug>
---

Start one ticket. `yarn contract:init` enforces every gate; a refusal is the next instruction, not an obstacle.

1. **The contract is complete.** No `[FILL]` markers; `yarn check-specs` names anything else.
2. **Start it.** Run `yarn contract:init <APP | app | EPIC> <slug>`. It refuses a cited file that is not `status: approved` or holds `[NEEDS DECISION — BLOCKING]`, a dependency whose own criteria are not all PASS on this branch, a tier 2 epic ticket without its pre-flight PASS line, and the protected branch. It then writes the ticket's `tier:` and reviewers (PR-15), freezes the criteria and writes every result at FAIL, on the branch the operator has checked out. To change the tier afterwards: `yarn contract:tier <id> [0 | 1 | 2]`.
3. **Go on to build it** through `tk-batch`, unless Taylor asked only for the start.

Other tickets may be building on the same branch (PR-14): commit only your own planned paths, never `git add -A`.
