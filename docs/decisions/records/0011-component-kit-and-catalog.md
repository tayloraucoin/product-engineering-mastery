---
title: "0011 — Two shelves: @pem/ui is the kit apps import, @pem/catalog is the shelf no app imports"
description: Read before adding a component from outside shadcn core, promoting a catalog item into @pem/ui, or changing what the component workshop shows.
layer: decisions
status: ruling
thread: CAT
role: Plumb
date: 2026-10-04
last_reviewed: 2026-10-04
supersedes:
load_when:
---

# 0011 — Two shelves: @pem/ui is the kit apps import, @pem/catalog is the shelf no app imports

## Context and problem

Taylor wants every shadcn component, the ecosystem's notable components and the best custom components from five earlier products in one place, browsable in the workshop and filterable by source, so a new product can pick with the code already there. The P-M research (2026-10-03) admitted only shadcn core, Base UI, Dice UI and tablecn, and found most other sources unverified for React 19 and full of canon tells (A-13, A-14). `@pem/ui` is what every app imports and every product duplicates, and one vendor per category holds across it.

## Considered options

1. Everything in `@pem/ui`.
2. Only the ruled sources, anywhere; nothing else kept.
3. Two shelves: the kit in `@pem/ui`, everything else in a package nothing imports, shown in the same workshop.

## Decision

Chosen: option 3. Option 1 would carry every vendor's dependencies and tells into every product and break one vendor per category. Option 2 throws away what Taylor asked to see and the custom work built five times over.

- **The kit.** `@pem/ui`: shadcn core on Base UI in the Vega style, in the house layout (EN-11), tokens only, a story per state.
- **The shelf.** `@pem/catalog`: shadcn blocks, ecosystem items by job, custom lifts, alternate tracks; upstream licence kept; mapped to house tokens on copy-in, or recorded link-only.
- **Boundary.** The boundaries lint's `catalog` element imports `config` and `ui`; nothing lists it, so no app or package imports it. Only the workshop reads it.
- **One workshop.** `@pem/ui`'s Storybook shows both; tags (`source:`, `verdict:`, `layer:`) filter the sidebar, and a provenance strip names each story's source, licence, upstream and verdict.
- **Promotion.** A shelf item enters the kit only by a ruling in `docs/design/component-sources.md`.

## Consequences

- **Buys:** one place to compare every option for a job, with the code and its provenance; the kit stays small, single-vendor and tell-free.
- **Costs:** the shelf is code no product exercises, kept current only when a ticket touches it; the workshop's test run covers it too.
- **Forecloses:** an app importing a catalog item directly; it copies or asks for a promotion.

## Revisit trigger

A product imports from the catalog by any route, or a year passes with no item promoted or copied from it.

## Amendment — 2026-10-04 (CAT-3, the CAT batch review)

- **Provenance is a panel, not a strip.** The workshop shows each story's source, verdict, layer, upstream, licence and adaptation in a Provenance panel beside Controls, read from `parameters.provenance` and the story's tags, so the canvas and its axe pass see only the component.
- **No workshop edge to the catalog.** `@pem/ui` taking `@pem/catalog` as a dependency would cycle with the catalog's own on `@pem/ui`, so the workshop reaches catalog stories by a stories glob, and `@pem/ui`'s test task lists the catalog's sources among its turbo inputs.
- **check-catalog holds every tag and the licence to the manifest**: a second or negated `source:`, `verdict:` or `layer:` tag, or a provenance licence unlike the source's, fails it.
