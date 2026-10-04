Venue: Claude Code, in product-engineering-mastery, on the branch checked out

# STK close-out — finish the tickets started before PR-15

Close STK-1, STK-2, STK-4, STK-6 and STK-9, in that order, under the rules of PR-15 (`docs/decisions/changelog.md`, 2026-10-03). Use `tk-batch`, treating each ticket as already started. Do not stop to ask; end on the closing report and nothing else.

**What changed for these tickets.**

- `yarn check-specs` only warns on a ticket still closing, so a `yarn verify` criterion no longer fails on its own ticket or on another's. Run those criteria last, after every other step for all five tickets is committed.
- A dependency counts once its own criteria are PASS. D-STK-16 to D-STK-19 and the `@pem/services` package are ratified (`technical.md`).
- Reviews follow the tier. An as-built edit no longer resets a review.

**Per ticket.**

1. `yarn status <id>` for what is left.
2. `yarn contract:tier <id>`: writes the tier and drops the review criteria that tier does not call for. Expected: STK-1 tier 0; STK-2 and STK-6 tier 1; STK-4 and STK-9 tier 2.
3. Finish any build work left (STK-6 and STK-9 are still open; STK-9 has uncommitted files under `packages/db/` and needs its database variables declared in `turbo.json`). Commit only that ticket's paths.
4. `yarn contract:run <id>` for every criterion except the `yarn verify` one; record `capture` and `manual` criteria.
5. Write the as-built if there is none. An existing as-built stays as it is.

**Then, once.**

1. The `yarn verify` criteria: `yarn contract:run STK-2 C7`, `STK-4 C6`, `STK-6 C2`, `STK-9 C4`. Fix a failure in these tickets' files; report any other.
2. Tier 2 reviews, unsandboxed: `yarn review:run <role> <id>` for each `review:` criterion left on STK-4 and STK-9.
3. One `vigil` subagent for STK-2 and STK-6 together, saved to `tickets/_batch-review-<date>.md`.
4. `yarn status`, `yarn check-specs --strict` (report what it still names), commit `STK: batch close`.

**Not wanted.** A push or a merge. A new branch or worktree. Work on any other ticket. A question about anything reversible.
