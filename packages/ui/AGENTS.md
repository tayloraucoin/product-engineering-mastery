# packages/ui — the shared web components

Package-local rules only. The root `AGENTS.md`, `docs/index.md` and the design layer govern everything not said here; this file never restates them.

## Layout

The house layout, carried from Synapse and Conscious Connections. `yarn check-ui-layout` enforces it and holds the two lists below.

```
src/
  primitives/<kind>/<name>/   generic building blocks
  composed/<kind>/<name>/     assemblies with an opinion
  providers/<name>/           context providers (theme)
  hooks/                      shared hooks, from the first one
  lib/                        helpers (cn)
  styles/globals.css          the Tailwind source registration
```

- **Kinds:** `control`, `display`, `feedback`, `layout`, `media`, `navigation`, `typography`. A new kind is added to `KINDS` in `tooling/check-ui-layout.ts` and to this line in the same change.
- **Primitive or composed.** A primitive is product-agnostic, owns no copy and imports no other `@pem/ui` component: the shadcn level (`button`). A composed component owns copy or behaviour for one use, or imports a primitive (`theme-toggle`).
- **A component is a folder:** `<name>.tsx`, `index.ts`, and `<name>.stories.tsx` beside them (STK-8). A `cva()` lives in `<name>.variants.ts`, never in the component file. A composed component's user-facing strings live in `copy.ts`.

## Exports

- One subpath per component, named for the component, not its folder: `@pem/ui/button` → `src/primitives/control/button/index.ts`. Moving a component inside the package never changes its subpath.
- Imports inside the package are relative; workspace packages by name.
- Re-slotting shadcn output: place each added file under `primitives/<kind>/<name>/` and split its `cva()` out before committing.
