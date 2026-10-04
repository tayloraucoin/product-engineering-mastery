---
name: tk-close
description: "Close one ticket that is already built: prove its criteria through tooling, write the as-built, run the reviews its tier calls for, and report in the batch report's shape. Use when Taylor says to close or wrap up a single ticket; for several tickets, or one not built yet, use tk-batch."
argument-hint: <id>
---

Close one ticket. Only tooling writes results; never edit `results.json`, a review file or a merged as-built. Do not stop to ask about anything reversible.

1. **Commit** the code (`<id>: <outcome>`), staging only this ticket's paths: other tickets share the branch (PR-14).
2. **Prove.** `yarn contract:run <id>`, and `yarn contract:record <id> <criterion> --evidence <path>` for each `capture` and `manual` criterion. `yarn status <id>` lists what is left, with the reason for each. A proof goes stale when the ticket's own planned paths change after it: re-run it.
3. **Tier.** A ticket started before PR-15 has no `tier:` line: run `yarn contract:tier <id>`, which computes it and drops the review criteria its tier does not call for.
4. **As-built**, from `docs/engineering/templates/as-built.template.md`: four short sections. Editing it later does not reset a review.
5. **Review by tier.** Tier 0: none. Tier 1: one `vigil` subagent, handed the contract, the results file and the changed files, never your summary; save its reply as `review-batch.md` in the ticket folder. Tier 2: `yarn review:run <role> <id>` for each `review:` criterion, unsandboxed. Fix a Blocking finding, re-prove, and review again.
6. **Record.** `yarn status`, `yarn truth:promote <EPIC>` when the epic has `ux/` proposals, then commit (`<id>: as-built and reviews`). `yarn check-specs --strict` names anything this ticket still owes; another ticket's lines are not yours.

End with the closing report from `tk-batch`: `Done`, `Not done`, `Needs you`, `What went wrong`, and nothing else. Never push: Taylor pushes and merges.
