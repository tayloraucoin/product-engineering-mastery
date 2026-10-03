---
title: "0010 — The starter ships the default stack, and a product is made by duplicating the repo, then removing"
description: Read before adding, removing or placing a workspace package, reading an environment variable, or porting this repo into a product.
layer: decisions
status: ruling
thread: STK
role: Mason
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes: docs/decisions/records/0005-two-packages-and-boundaries-lint.md
load_when:
---

# 0010 — The starter ships the default stack, and a product is made by duplicating the repo, then removing

## Context and problem

Record 0005 started this repository with two packages, `@pem/config` and `@pem/ui`, and conventions rule 9 held that a package, folder or module is created by its first real consumer. A product therefore copied selected pieces from here and rebuilt the database, auth, billing, email, environment and logging layers by hand, from whichever product repo did them last. On 2026-10-03 Taylor ruled that the starter ships the default stack instead, that a product is made by duplicating the whole repo and removing what it does not keep, and that one tier switch selects every backing service (the STK epic's `prompts/03-technical.md`, rulings 1 to 3). The epic's `technical.md` turned those rulings into D-STK-1 (the package graph), D-STK-2 (this record) and D-STK-3 (the tier switch).

## Considered options

1. Keep record 0005: two packages, no empty seams, and a product copies selected pieces.
2. The starter ships the default stack, each module removable by a runbook; a product duplicates the repo, then removes.
3. Shared `@lighthouse/*` packages that every product depends on.

## Decision

Chosen: option 2, because Taylor ruled it (rulings 1 to 3, 2026-10-03), and because option 1 keeps producing what record 0001's revisit trigger warns of: one convention fix applied to several repos by hand. Option 3 stays rejected for record 0001's reason: brand and schema isolation are worth more than shared code at two or three products.

- **Package graph (D-STK-1).** Low to high: `config → constants, env, brand, observability → validators → db → auth → email, ai → services → api → ui → apps`. A package imports only packages below it. `utils`, `types` and `hooks` ship as folders holding only a README that states their convention; each becomes a package with its first module. There is no `lib` or `helpers` package. Whether `services` is its own package or folders inside `api` is undecided (`technical.md`, routed call 3).
- **Seams (D-STK-2).** Conventions rule 9 becomes: a seam ships with a default consumer or a README that states its convention.
- **Porting (D-STK-2).** The README's rule "copies selected pieces, never the demo app" becomes "duplicate, then remove". STK-3 rewrites the README with the new-project guide.
- **Tech stack (D-STK-2).** The "Deliberately absent" table in `docs/engineering/tech-stack.md` is retired row by row: the ticket that lands a module deletes its row.
- **Tier switch (D-STK-3).** `DATABASE_ENVIRONMENT`, `local | staging | production`, default `local`, never defaulting to production. Suffixes: `_LOCAL`, `_STAGING`; unsuffixed is production. `@pem/env` holds the pure per-tier picker and never reads `process.env`. Each app's `env.ts` (t3-env, zod) and each package's `scripts/env.ts` are the only readers. Where the code runs is derived, never set.

Every module named here is built by its own STK ticket. Until that ticket merges, a document names the module by its ticket number and never as present.

## Consequences

- **Buys:** a product starts with database, auth, billing, email, AI, logging and error monitoring already wired to the house conventions. Each module's removal is a written, checked procedure, so a product removes what it does not need instead of rebuilding what it does. A wrong tier is one variable, checked at boot.
- **Costs:** this repo carries code its own demo barely uses, kept current against vendor releases. Each module needs a manifest entry and a removal runbook (STK-2, STK-3), and a removal that leaves files behind is a defect someone has to catch.
- **Forecloses:** record 0005's two-package starter, and "no empty seams" as a rule. A product's own code is still placed by the "who imports this?" count (conventions §1).

## Revisit trigger

The removal dry-run on a duplicate (STK-20), or any later product port, finds a removed module's file, variable or dependency still present after its runbook ran. Or one product removes more than half the default modules.
