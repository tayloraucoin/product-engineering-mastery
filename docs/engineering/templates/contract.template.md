---
title: "contract.md (template): the unit of work"
description: "Fill when any change starts, one-off or epic ticket: the testable criteria with their evidence types, the planned paths and the one surface it cites. yarn contract:init writes it from this file."
layer: engineering
status: draft
thread: P-J
role: Lorimer
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# Contract — [FILL: id] [FILL: slug]

> **Who fills:** the builder for a one-off; Reeve, with Mason, for an epic ticket at the Tickets stage. `contract:init` computes `id` and `reviewers`; never type them.
> **When:** before any code. Run `yarn contract:init <APP | app | EPIC> <slug>` once to get this file in its folder, fill it, then run the same command again: it freezes the criteria, writes every result at FAIL and creates the branch `agent/<id>`. An epic's Tickets stage adds `--draft` and starts nothing.
> **Lives at:** `specs/<app>/one-offs/<APP>-<n>-<slug>/contract.md`, or `specs/<app>/epics/<EPIC>-<slug>/tickets/<EPIC>-<n>-<slug>/contract.md`. The fields below become the file's frontmatter; delete this instruction block.
> **What the check enforces:** `check-specs`, against `docs/engineering/schemas/contract.schema.json`: every field present; at most 1,000 tokens and seven non-negotiables (split the ticket otherwise); at most one surface file in `cites` without a `waiver`; every `test` and `check` command a `package.json` script run through `yarn`; the reviewers its planned paths require (`toolkit.json`); no `docs/research/` path; the criteria unchanged since init (add one with `yarn contract:add`). `contract:init` refuses a cited file that is not `status: approved` or holds `[NEEDS DECISION — BLOCKING]`, and an epic ticket without its pre-flight PASS.
> **Evidence types:** `test` for logic, data, money and auth (a `command`; its runner must report at least one passing test, so name tests after their criterion; a name pattern appended to a script whose last word is a file glob does not filter); `check` for lint, types, boundaries and tokens (a `command`); `capture` for UI, through `?state=` (a `path`); `manual` for a human check (a `reason`; reported as not verified). UI criteria default to `capture`.
> **Filled example:** `specs/web/one-offs/` and `specs/web/epics/` (P-C builds the demo through this loop).

## Fields

```yaml
id: "[FILL: computed by contract:init]"
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "[FILL: one line: what changes for whom]"
slice_type: "[FILL: what kind of work this is, and the class of failure it risks]"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
reviewers: [] # computed by contract:init from planned_paths and toolkit.json
planned_paths:
  - "[FILL: repo paths or globs this ticket will change]"
depends_on: [] # work-ids that must merge first
out_of_scope:
  - "[FILL: what this ticket will not do]"
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: test
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's test]"
  - id: C2
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
```

## Notes

`[FILL: optional. Context the builder needs that no cited file holds, in a few lines. Never the plan of work: the criteria are the plan.]`
