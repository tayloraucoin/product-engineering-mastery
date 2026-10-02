---
paths:
  - "specs/**"
---

# Specs: contracts, results, as-builts

- A ticket folder is `specs/<app>/one-offs/<APP-n>-<slug>/` or `specs/<app>/epics/<EPIC>-<slug>/tickets/<EPIC-n>-<slug>/`, created by `yarn contract:init`, never by hand. It holds `contract.md`, `results.json` and, at close, `as-built.md`.
- `contract.md` fields: `id`, `size`, `objective`, `slice_type`, `non_negotiables` (at most seven), `devs_call`, `criteria` (each with an `id`, a statement, an evidence type `test` | `check` | `capture` | `manual`, and a command or path), `planned_paths`, `cites` (one surface file; more needs a `waiver:` line), `truth_files` (or `none: <reason>`), `reviewers` (computed), `depends_on`, `out_of_scope`. At most 1,000 tokens.
- `results.json` is written only by `yarn contract:run` and `yarn contract:record`. Never edit it.
- `as-built.md` sections: Shipped against the contract, Deviations, Ledger IDs, Migrations (`applied:`), Test changes, Not verified, Model, Next. Once merged it is immutable except `applied:`.
- `specs/<app>/ux/` is the living truth; an epic's own `ux/` holds proposals that mirror those paths, with `target:`, `status:` and `promoted:` in their frontmatter.
