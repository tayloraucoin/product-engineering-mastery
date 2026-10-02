---
title: "as-built.md (template): what shipped, written at close"
description: "Fill when a ticket's criteria are proven and before its reviewers run: what shipped against the contract, every deviation with its reason, migrations, test changes and what is not verified."
layer: engineering
status: draft
thread: P-J
role: Scribe
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# As-built — [FILL: id]

> **Who fills:** the builder, at close (`tk-close`), never a reviewer.
> **When:** after `yarn contract:run` and `yarn contract:record` have proven every non-review criterion, and before `yarn review:run`: reviewers read it. Editing it after a review resets that review to FAIL, so finish it first.
> **Lives at:** `as-built.md` in the ticket's folder, beside `contract.md` and `results.json`. Keep the eight headings exactly; delete this instruction block and the `[FILL]` markers.
> **What the check enforces:** `check-specs`: all eight sections; `applied:` in Migrations (`n/a`, `pending` or a date; `pending` shows as "code complete, migration pending", never done); every `manual` criterion named under Not verified; every criterion PASS with a run record once this file exists. Once merged it is immutable except the `applied:` value (`results-gate`, `check-specs` against `main`). A Test changes entry on a one-off requires `review:vigil`.
> **Filled example:** `specs/web/one-offs/` (P-C).

## Shipped against the contract

`[FILL: one line per criterion id: what shipped that meets it]`

## Deviations

`[FILL: each departure from the contract, with why; or "none"]`

## Ledger IDs

`[FILL: ledger lines this ticket added or relies on; or "none"]`

## Migrations

applied: n/a

## Test changes

`[FILL: every test deleted, skipped or weakened, with why; or "none"]`

## Not verified

`[FILL: each manual criterion by id, and anything no criterion proves; or "none"]`

## Model

`[FILL: the model id and Claude Code version that built this]`

## Next

`[FILL: one human line: what should happen next]`
