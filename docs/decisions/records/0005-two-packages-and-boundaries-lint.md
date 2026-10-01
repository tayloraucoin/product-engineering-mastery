---
title: "0005 — Start with two packages — `@pem/config` and `@pem/ui` — and the boundaries lint wired from day one"
description: Read before adding a workspace package or changing the import-boundary lint.
layer: decisions
status: ruling
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0005 — Start with two packages — `@pem/config` and `@pem/ui` — and the boundaries lint wired from day one

> Migrated from the scaffold's `TECHNICAL-DECISIONS.md` into the house record format (`conflicts.md` CF-06). Wording unchanged; sections renamed.

## Context and problem

Synapse has eleven packages; most exist for a database, auth, and an API this repository does not have. `create-turbo` ships `ui`, `eslint-config`, and `typescript-config`.

## Considered options

1. A — `config` + `ui`.
2. B — `config` only.
3. C — the full Synapse layer set as empty packages.

## Decision

A. `config` follows the house pattern of folding ESLint, Prettier, Tailwind, and tsconfig into one package with subpath exports. `ui` is justified by placement law: both apps import `buttonVariants` and `cn`. C would be empty seams. The boundaries lint costs one file now and is the enforcement every later package is born under.

## Consequences

Buys the full shape of the house monorepo at its smallest size. Costs nothing a later package will not need anyway.

## Revisit trigger

A third module with two consumers that does not belong in `ui` — that is the next package.
