---
paths:
  - "specs/**"
---

# Specs: contracts, results, as-builts

- A ticket folder is `specs/<app>/one-offs/<APP-n>-<slug>/` or `specs/<app>/epics/<EPIC>-<slug>/tickets/<EPIC-n>-<slug>/`, created by `yarn contract:init`, never by hand. It holds `contract.md`, `results.json` and, at close, `as-built.md`.
- `contract.md` frontmatter follows `docs/engineering/schemas/contract.schema.json`: criteria each with an evidence type (`test` | `check` | `capture` | `manual`) and a yarn script, path or reason; one cited surface (more needs `waiver:`); `truth_files` or `none: <reason>`; `reviewers` computed. At most 1,000 tokens.
- `results.json` is written only by `yarn contract:run`, `contract:record` and `review:run`; criteria grow only through `contract:add`. Never edit it.
- `as-built.md` (template's eight sections) is written before the reviews run; editing it resets them. Merged, it is immutable except `applied:`.
- `specs/<app>/ux/` is the living truth; an epic's own `ux/` holds proposals that mirror those paths, with `target:`, `status:` and `promoted:` in their frontmatter.
