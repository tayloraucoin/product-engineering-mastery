---
title: New project — the components prompt, run after the UX spec exists
description: Open from step 7 of the new-project guide, once the product has a UX spec. Holds the prompt for the thread that reads the spec, decides which components of the kit and the catalog the product keeps, removes the rest safely, writes the product's component inventory, then checks the kit under the brand or prints the branding prompt.
layer: runbooks
status: draft
thread: "PEM"
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Components

> **When:** after the UX spec exists under `specs/web/ux/`. Before that there is nothing to decide against, and a thread would keep or delete by taste.
> **Lead:** Turner. **Support:** Vesper for what the spec means, Plumb for any component the spec needs and the kit lacks.
> **Printed by:** the set-up thread at step 7 of [`README.md`](README.md).

## What the thread works on

- **The kit, `packages/ui/`.** What apps import. Sixty-four components in the plan on 2026-10-05, each a folder under `src/primitives/` or `src/composed/`, each with one entry in the package's `exports`. Layout rules: `packages/ui/AGENTS.md`.
- **The shelf, `packages/catalog/`.** Twenty-eight items, nearly all blocks, that nothing imports. A product takes an item by copying it, then removes the shelf with [`remove/catalog.md`](../remove/catalog.md).
- **The plan, `packages/catalog/manifest.json`.** One entry per component in both, with its layer, kind and source. `yarn check-catalog` holds the tree to it while the shelf exists.
- **The first cut by kind of product:** "Starter kits by profile" in [`component-sources.md`](../../design/component-sources.md).

## Why the order matters

1. **The shelf goes before the kit is thinned.** Shelf items import kit components, and the manifest checks both. Once the shelf's recipe has run, the manifest is gone and a kit component is removed by deleting its folder and its export.
2. **Leaves before what they hold up.** A dialog imports the button. A component is deleted only when nothing kept imports it.
3. **A dependency goes last,** when no kept file imports it. Several components bring their own: the chart, the carousel, the calendar, the command menu, the data table, the one-time-code input, the resizable panels.

## The prompt

Print this block whole, with the angle brackets filled.

```text
Venue: Claude Code, in <the new repo's folder>, on the branch that is checked out.
Model: the deepest available (Fable 5.1 today). A smaller model deletes by name and misses what imports what.

Role: Turner (design engineer) leads. Support: Vesper reads the UX spec with you; Plumb rules when the spec needs a component the kit lacks.

Context. <Product> was started from the product-engineering toolkit and now has its UX spec at <specs/web/ux/, or where it is>. The repo still holds the whole starter kit (packages/ui) and the shelf of extra components (packages/catalog). Your job is to cut both down to what this product's UX needs, safely, and to write the product's component inventory.

Read first: docs/runbooks/new-project/components.md (the order and the reasons), the UX spec (every overview and surface file), packages/ui/AGENTS.md, packages/catalog/README.md and manifest.json, docs/design/component-sources.md ("Starter kits by profile" and "Job index"), docs/design/templates/components.template.md, docs/runbooks/remove/catalog.md.

Do this, in order:

1. Inventory. From the UX spec, list every job a person does on every surface and the component that serves it. Write it as apps/web/docs/design/components.md from the template: one row per job, the component, its variant, and the surfaces that use it.

2. Decide. Put every entry of manifest.json in one table with one verdict each:
   - keep: the inventory names it, or a kept component imports it.
   - take from the shelf: a catalog item the inventory names. Say where it goes: into the web app's own components when one surface uses it, into the kit when two do (Plumb rules on a promotion).
   - delete: nothing in the inventory or in a kept component uses it.
   - missing: the inventory needs it and neither the kit nor the shelf has it. Do not build it here: write it into the product's coverage-gaps.md.
   When in doubt, keep. A deleted component is restored by copying its folder from the toolkit; a missing one costs a build thread.

3. Show me the table and wait for my yes. Use the question tool: confirm all, or change some. This is the one stop.

4. The shelf. Copy each "take from the shelf" item to where the table says, keeping its licence header, and give it a story. Then follow docs/runbooks/remove/catalog.md from top to bottom. yarn check-stack and yarn verify must pass before step 5.

5. The kit. For each "delete", leaves first:
   - confirm nothing kept imports it: search packages/ui/src and apps for its export name and its folder name;
   - delete its folder under packages/ui/src/<layer>/<kind>/;
   - delete its "./<name>" entry from exports in packages/ui/package.json;
   - delete its name from the examples in that kind's README.
   After every five or so, run yarn check-ui-layout, yarn check-types and yarn test, so a wrong cut is found near where it was made.

6. Dependencies. For each dependency of packages/ui that no kept file imports any more: remove it from packages/ui/package.json, from the ui entry's dependencies in toolkit.json, and its row from docs/engineering/tech-stack.md. Then yarn install.

7. Brand. If apps/web/docs/design/DESIGN.md exists, the brand is in: run yarn contrast-audit, open the workshop (yarn ui:storybook), look at every kept component in light and dark, and list anything that reads wrong under the brand as a finding, with the token it points at. Change no token here. If that file does not exist, the brand is still the placeholder: print the prompt from docs/runbooks/new-project/branding.md for me to run in its own thread, and say so in your report.

Boundaries: packages/ui, packages/catalog, the files the catalog recipe names, the web app's own components for shelf items, toolkit.json's ui entry, tech-stack.md, and the two design-layer files named above. No new dependency. No new component. Never push. Commit as "<work-id>: components cut to the UX spec".

Done when: yarn check-ui-layout, yarn check-stack, yarn test, yarn lint:boundaries and yarn build pass, then one yarn verify; every row of the inventory names a component that exists; and your report, six lines at most, gives the counts (kept, taken from the shelf, deleted, missing), the dependencies removed, and each decision that waits for me.
```

## What the thread leaves behind

- `apps/web/docs/design/components.md`, the product's inventory, which later build threads and the critic read.
- A kit that holds only what the inventory names, with its stories.
- No shelf, unless the operator chose to keep it.
- Rows in the product's `coverage-gaps.md` for each component the spec needs and nothing supplies.
