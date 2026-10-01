---
title: "0001 — This repository is both the conventions reference and the product starter, named `product-engineering-mastery`"
description: Read when deciding whether something belongs in this repository, or how it relates to the product repos it seeds.
layer: decisions
status: ruling
thread: scaffold
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0001 — This repository is both the conventions reference and the product starter, named `product-engineering-mastery`

> Migrated from the scaffold's `TECHNICAL-DECISIONS.md` into the house record format (`conflicts.md` CF-06). Wording unchanged; sections renamed.

## Context and problem

Synapse and Conscious Connections share one convention set, copied by hand between them. A third product would copy it again. The owner also wants to study the conventions in a browser.

## Considered options

1. A — a starter only (`product-engineering-starter`), cloned and discarded.
2. B — a reference repository that is also the clone source (`product-engineering-mastery`).
3. C — extract shared `@lighthouse/*` packages that every product depends on.

## Decision

B. The repository's lasting value is as the smallest correct example of the conventions; cloning it is the second use. C is rejected for now for the same reason Synapse rejected it: brand and schema isolation are worth more than shared code at two or three products.

## Consequences

Buys one place where the conventions live in their smallest working form. Costs keeping it current as the product repos learn things. Forecloses nothing.

## Revisit trigger

A convention fix that has to be applied to three repos by hand.
