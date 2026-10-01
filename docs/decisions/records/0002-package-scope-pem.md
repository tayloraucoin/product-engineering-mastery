---
title: "0002 — Packages use the `@pem/*` scope"
description: Read when cloning the toolkit into a product and renaming the workspace scope.
layer: decisions
status: ruling
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0002 — Packages use the `@pem/*` scope

> Migrated from the scaffold's `TECHNICAL-DECISIONS.md` into the house record format (`conflicts.md` CF-06). Wording unchanged; sections renamed.

## Context and problem

The house pattern is a short product scope (`@syn`, `@cc`). `create-turbo` defaults to `@repo`.

## Considered options

1. A — `@pem` (product-engineering-mastery).
2. B — `@starter`.
3. C — `@repo`.

## Decision

A. It follows the house pattern, so the repository reads like the products it seeds. A clone renames it with one find-and-replace (README, "Starting a new product").

## Consequences

Buys consistency with the product repos. Costs one rename per clone, which every option except C would also cost, and C still gets renamed in practice.

## Revisit trigger

None expected.
