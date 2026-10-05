---
paths:
  - "specs/**"
---

# Specs: tickets, contracts, proofs

- A ticket folder is `specs/<app>/one-offs/<APP-n>-<slug>/` or `specs/<app>/epics/<EPIC>-<slug>/tickets/<EPIC-n>-<slug>/`, created by `yarn contract:init`, never by hand. Also under `specs/<app>/`: `explorations/<slug>/`, `audits/` and `reports/`, written by their tracks (`docs/workflows/tracks/`).
- `contract.md` frontmatter follows `docs/engineering/schemas/contract.schema.json`: criteria each with an evidence type (`test` | `check` | `capture` | `manual`) and a yarn script, path or reason; one cited surface (more needs `waiver:`); `truth_files` or `none: <reason>`; the QA level, reviewers and `focus` lines the operator confirmed (`docs/workflows/qa-levels.md`). The body's Build notes say what to build. At most 2,500 tokens. `yarn verify` is never a criterion: it runs once at batch close.
- **Proof follows the level.** Q1 and Q2: run each criterion's command once and report it; no ledger. Q3: `results.json`, written only by `yarn contract:run`, `contract:record` and `review:run`; never edit it. A check only a person can make is recorded `--verdict deferred` and listed under Operator checks in `specs/_status.md`.
- **A ticket's proofs are its own.** Never re-prove or re-review another ticket. A commit to a shared file reopens nothing; a Q3 ticket's proofs are checked for staleness once, by `yarn check-specs --strict`, before a merge.
- `as-built.md` (the template's four sections) is written at Q2 and Q3, or when something deviated.
- Not written: prompt files, committed evidence logs, review files below Q3.
- `specs/<app>/ux/` is the living truth; an epic's own `ux/` holds proposals that mirror those paths, with `target:`, `status:` and `promoted:` in their frontmatter.
- **Until the tooling change lands (PR-19):** contracts carry `tier:` in place of the QA level. Read tier 0 and 1 as Q1 (Q2 when the contract names a reviewer) and tier 2 as Q3, and every ticket still has a `results.json`: run `yarn contract:run <id>` for your own ticket only.
