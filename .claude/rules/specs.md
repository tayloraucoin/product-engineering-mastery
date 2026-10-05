---
paths:
  - "specs/**"
---

# Specs: contracts, results, as-builts

- A ticket folder is `specs/<app>/one-offs/<APP-n>-<slug>/` or `specs/<app>/epics/<EPIC>-<slug>/tickets/<EPIC-n>-<slug>/`, created by `yarn contract:init`, never by hand. It holds `contract.md`, `results.json` and, at close, `as-built.md`.
- `contract.md` frontmatter follows `docs/engineering/schemas/contract.schema.json`: criteria each with an evidence type (`test` | `check` | `capture` | `manual`) and a yarn script, path or reason; one cited surface (more needs `waiver:`); `truth_files` or `none: <reason>`; `tier` and `reviewers` computed (0: none; 1: one review per batch; 2: pre-flight and reviewers on the ticket). The body's Build notes say what to build. At most 2,500 tokens.
- `results.json` is written only by `yarn contract:run`, `contract:record`, `contract:tier` and `review:run`; criteria grow only through `contract:add`. Never edit it. `yarn verify` is never a criterion: it runs once at batch close.
- `as-built.md` (template's four sections; Migrations and Test changes when there are any) is written before the reviews run. Merged, it is immutable except `applied:`.
- A `manual` criterion only a person can check is recorded with `--verdict deferred`: it stops holding the ticket and is listed under Operator checks in `specs/_status.md`. `operator_review: true` in a contract adds one for Taylor's own look. A closed ticket's proofs are frozen: a later change to a shared file does not reopen it.
- `yarn check-specs` warns on work in flight (a stale proof, a ticket still closing); `--strict` fails on it, before a merge.
- `specs/<app>/ux/` is the living truth; an epic's own `ux/` holds proposals that mirror those paths, with `target:`, `status:` and `promoted:` in their frontmatter.
