---
name: tk-close
description: "Close a ticket: prove every criterion through tooling, write the as-built, run the reviewers in fresh context, promote truth, and leave the branch ready for Taylor to merge. Use when a build prompt or Taylor says to close a ticket, or when yarn status <id> shows only proofs, the as-built and reviews left."
argument-hint: <id>
---

Close one ticket, in this order. Only tooling writes results; never edit `results.json`, a review file or a merged as-built.

1. **Green first.** Commit the code (`<id>: <outcome>`), staging only your planned paths: other tickets may share the branch (PR-14). Then run `yarn verify`. Fix what fails before proving anything: a proof records the commit it ran on, and a later change makes it stale.
2. **Prove.** `yarn contract:run <id>` runs every `test` and `check` criterion. Record each `capture` and `manual` criterion against its evidence file: `yarn contract:record <id> <criterion> --evidence <path>`. `yarn status <id>` lists what is left, with the reason for each.
3. **Write the as-built** at `as-built.md` in the ticket folder, from `docs/engineering/templates/as-built.template.md`, before any review: reviewers read it, and editing it afterwards resets their verdicts. Every deviation with its reason; every `manual` criterion under Not verified; `applied:` under Migrations; test changes, or "none".
4. **Review.** For each `review:<role>` criterion, run `yarn review:run <role> <id>`. It runs the reviewer headless with read-only tools on a prompt built from the contract, results and evidence, never your summary, and records the verdict. It needs the Anthropic API: from the sandbox, re-run it unsandboxed; if the `claude` CLI is not logged in, stop and tell Taylor. A FAIL verdict lists findings: fix them, re-prove what changed, and run the review again.
5. **Truth.** For an epic ticket, run `yarn truth:promote <EPIC>`, then reconcile each promoted truth file with the as-built's Deviations. A one-off has already edited its `truth_files`.
6. **Done.** `yarn status <id>` shows nothing left and `yarn check-specs` is clean. Commit the as-built, results, reviews and evidence (`<id>: as-built and reviews`).

End with the branch name, the reviewers' verdicts with the paths of their review files for Taylor to read, and anything not verified. Never push: Taylor pushes and merges. `yarn pr:body` lands in J8; until then, the as-built is the PR's description.
