---
title: "0003 — The toolchain is pinned to the house set — TypeScript 5.9.2, Node 22, ESLint 9 — not `create-turbo`'s current TypeScript 7 / Node 24 / ESLint 10"
description: Read before bumping TypeScript, Node or ESLint, or when create-turbo's defaults disagree with the house pins.
layer: decisions
status: ruling
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0003 — The toolchain is pinned to the house set — TypeScript 5.9.2, Node 22, ESLint 9 — not `create-turbo`'s current TypeScript 7 / Node 24 / ESLint 10

> Migrated from the scaffold's `TECHNICAL-DECISIONS.md` into the house record format (`conflicts.md` CF-06). Wording unchanged; sections renamed.

## Context and problem

The repository was written by hand from the Synapse layout instead of scaffolded. `create-turbo` currently generates TypeScript 7, Node ≥ 24, and ESLint 10. Synapse recorded the same choice on 2026-09-04 (its INF-1 decision): `typescript-eslint` 8.x supports `< 5.10`, and `drizzle-kit` and Storybook 8 are validated against 5.9.

## Considered options

1. A — the scaffold's versions.
2. B — the house versions.

## Decision

B. A starter that pins different versions than the products it seeds becomes a second source of truth for what compiles.

## Consequences

Buys known-good tooling shared with the product repos. Costs TypeScript 7's compile speed, which does not matter at this size.

## Revisit trigger

The product repos bump TypeScript; this repository follows in the same week.
