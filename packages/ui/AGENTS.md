# packages/ui — the shared web components

Package-local rules only. The root `AGENTS.md`, `docs/index.md` and the design layer govern everything not said here; this file never restates them.

## Layout

The house layout of Synapse and Conscious Connections; `providers/<name>/` as a folder is this repo's own. `yarn check-ui-layout` enforces the folders, the files a component needs, where `cva` lives, the two primitive rules below and the `exports` targets; whether a component is generic enough to be a primitive stays judgment.

```
src/
  primitives/<kind>/<name>/   generic building blocks
  composed/<kind>/<name>/     assemblies with an opinion
  providers/<name>/           context providers (theme)
  hooks/                      DOM-bound hooks only, from the first one
  lib/                        helpers (cn)
  styles/globals.css          the Tailwind source registration
```

- **Kinds** are the closed list `KINDS` in `tooling/check-ui-layout.ts`, named only there; the check prints it when a folder is not a kind. A new kind is added there.
- **Hooks** that touch no DOM go to the `hooks` package (D-STK-1), not here.
- **Primitive or composed.** A primitive is product-agnostic, has no `copy.ts` and imports no other component: the shadcn level (`button`). A composed component owns copy or behaviour for one use, or imports a primitive (`theme-toggle`).
- **A component is a folder:** `<name>.tsx`, `index.ts`, and `<name>.stories.tsx` beside them (STK-8). A `cva()` lives in `<name>.variants.ts`, never in any other file. A composed component's user-facing strings live in `copy.ts`.

## Exports

- One subpath per component, named for the component, not its folder: `@pem/ui/button` → `src/primitives/control/button/index.ts`. Moving a component inside the package never changes its subpath.
- Imports inside the package are relative; workspace packages by name.
- Re-slotting shadcn output: place each added file under `primitives/<kind>/<name>/` and split its `cva()` out before committing.
