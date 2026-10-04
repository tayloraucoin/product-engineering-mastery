# packages/ui — the shared web components

Package-local rules only. The root `AGENTS.md`, `docs/index.md` and the design layer govern everything not said here; this file never restates them.

## Layout

The house layout of Synapse and Conscious Connections; `providers/<name>/` as a folder is this repo's own. `yarn check-ui-layout` enforces the folders, the files a component needs, where `cva` lives, the two primitive rules below, the kind folders and their READMEs, and the `exports` targets; whether a component is generic enough to be a primitive stays judgment.

```
src/
  primitives/<kind>/<name>/   generic building blocks; every kind folder exists, with a README
  composed/<kind>/<name>/     assemblies with an opinion; same kind folders
  providers/<name>/           context providers (theme)
  hooks/                      DOM-bound hooks only, from the first one
  lib/                        helpers (cn)
  styles/globals.css          the Tailwind source registration and the base layer
.storybook/                   the workshop (STK-8): config, story runner, coverage check
```

- **Hooks** that touch no DOM go to the `hooks` package (D-STK-1), not here.
- **Primitive or composed.** A primitive is product-agnostic, has no `copy.ts` and imports no other component: the shadcn level (`button`). A composed component owns copy or behaviour for one use, or imports a primitive (`theme-toggle`).
- **A component is a folder:** `<name>.tsx`, `index.ts`, and `<name>.stories.tsx` beside them, one story per state, titled `<Group>/<Kind>/<Name>` (`Primitives/Control/Button`); a provider's is `Providers/<Name>`. `yarn test` runs each story's interactions and axe, and fails a component without a story. A `cva()` lives in `<name>.variants.ts`, never in any other file. A composed component's user-facing strings live in `copy.ts`.

## Kinds

Pick the kind by what a person does with the component. Each kind folder's `README.md` gives the scope at its layer, examples from the audited repos, and where the line falls with its neighbours. This table and `KINDS` in `tooling/check-ui-layout.ts` list the same kinds; the check fails when they differ.

| Kind         | A person…                                        | Primitives, e.g.                                                        | Composed, e.g.                                            |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| `control`    | operates it to act or enter a value              | button, input, checkbox, select, switch, tabs                           | theme toggle, search field, segmented control, date field |
| `display`    | reads it; nothing happens when it is operated    | badge, avatar, label, kbd, skeleton, table                              | list row, tag, big number, page header                    |
| `feedback`   | is told what happened, or interrupted to confirm | dialog, alert dialog, popover, tooltip, dropdown menu, toaster, spinner | empty state, save status, loading text, confirm dialog    |
| `layout`     | doesn't notice it; it arranges other components  | card, separator, sheet, drawer, collapsible, section                    | screen frame, auth frame, responsive sheet, error page    |
| `media`      | watches or listens to it                         | image                                                                   | image gallery, audio scrubber                             |
| `navigation` | moves between places with it                     | sidebar, bottom nav, breadcrumb                                         | app header, step nav, site nav                            |
| `typography` | reads it as styled text                          | text, heading, eyebrow, timestamp                                       | rendered markdown                                         |

Tie-breaks, where the audited repos disagree or a component fits two rows: every overlay that opens over the page is `feedback`; a row clickable as a whole is `control`; an empty state is `feedback`; a card is `layout`; tabs that change the route are `navigation`.

## Adding a component

1. **Look first.** List `src/*/*/` and the `exports` in `package.json`; extend an existing component (a variant, a prop) before adding one. A component one app uses stays in that app's `_components/`; it moves here at its second consumer (codebase-conventions §1).
2. **Choose the layer**, primitive or composed, by the test above, then **the kind** by the table. Read that kind folder's `README.md`.
3. **Create the folder** `src/<layer>/<kind>/<name>/` (kebab-case) with `<name>.tsx`, `index.ts` (named exports) and `<name>.stories.tsx` (one story per state). Add `<name>.variants.ts` for a `cva()`, and `copy.ts` for a composed component's strings. Import inside the package by relative path.
4. **Export it:** add `"./<name>"` to `package.json` `exports`, with `types` and `default` both pointing at `./src/<layer>/<kind>/<name>/index.ts`.
5. **Prove it:** `yarn check-ui-layout` and `yarn test`.

A new kind is one commit: add it to `KINDS`, to the table above, and as a folder with a `README.md` under both `primitives/` and `composed/`.

## Exports

- One subpath per component, named for the component, not its folder: `@pem/ui/button` → `src/primitives/control/button/index.ts`. Moving a component inside the package never changes its subpath.
- Imports inside the package are relative; workspace packages by name.
- Re-slotting shadcn output: place each added file under `primitives/<kind>/<name>/` and split its `cva()` out before committing.
