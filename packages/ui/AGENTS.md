# packages/ui — the shared web components

Package-local rules only; the root `AGENTS.md`, `docs/index.md` and the design layer govern the rest.

## Layout

The house layout of Synapse and Conscious Connections (`providers/<name>/` as a folder is ours). `yarn check-ui-layout` enforces it; whether a component is generic enough to be a primitive stays judgment.

```
src/
  primitives/<kind>/<name>/   generic building blocks
  composed/<kind>/<name>/     assemblies with an opinion
  providers/<name>/           context providers (theme)
  hooks/                      DOM-bound hooks only (others: the hooks package, D-STK-1)
  lib/                        helpers (cn)
  styles/globals.css          Tailwind source registration and the base layer
.storybook/                   the workshop (STK-8)
```

- **Primitive:** product-agnostic, no `copy.ts`, imports nothing from `composed/` (another primitive is fine: a dialog uses the button). **Composed:** owns copy or behaviour for one use, or imports a primitive.
- **A component is a folder:** `<name>.tsx`, `index.ts`, `<name>.stories.tsx` (one story per state, titled `<Layer>/<Kind>/<Name>`; a provider's `Providers/<Name>`). A `cva()` lives only in `<name>.variants.ts`; a composed component's strings in `copy.ts`.

## Kinds

Every kind is a folder in both layers. Its `README.md` gives examples from the audited repos and where the line falls with its neighbours: read it before filing there. This table and `KINDS` in `tooling/check-ui-layout.ts` must match.

| Kind         | A person…                                                    |
| ------------ | ------------------------------------------------------------ |
| `control`    | operates it to act or enter a value                          |
| `display`    | reads it: a value, a status, an identity                     |
| `feedback`   | is told what happened, or interrupted to confirm             |
| `layout`     | sees other components through it: arranged, framed, revealed |
| `media`      | watches or listens to it                                     |
| `navigation` | moves between places with it                                 |
| `typography` | reads it as styled text                                      |

Tie-breaks: an overlay that informs or confirms is `feedback`, a panel that slides in to hold content is `layout`, a composed menu with its trigger is `control`. A row whose only job is to be chosen is `control`; a data row is `display`, even when it links. The bare `card` is `layout`, a card for one kind of data `display`. The bare `empty` slot is `display`, a composed empty state `feedback`. Text that formats a value is `display`.

## Adding a component

1. **Look first** in `src/*/*/` and `package.json` `exports`; extend before adding. A component one app uses stays in its `_components/` until a second consumer (codebase-conventions §1).
2. **Choose the layer, then the kind** by the table; read that kind's `README.md`.
3. **Create** `src/<layer>/<kind>/<name>/` with the files above. Import inside the package by relative path.
4. **Export** `"./<name>"` in `package.json`, `types` and `default` both at its `index.ts`. The subpath never names the folder, so a move inside the package changes no import.
5. **Add its name** to the kind README's examples.
6. **Prove:** `yarn check-ui-layout` and `yarn test`.

Porting from shadcn or a reference repo: split out the `cva()`; a primitive that imports a composed component is composed. A new kind goes into `KINDS`, this table, and a folder with a README in both layers, in one commit.
