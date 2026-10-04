# primitives/navigation

**The kind.** A person moves between places with it: routes, sections, steps.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, imports no other component. Here that means the bare nav structure, with its active and collapsed states.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `sidebar`, `bottom-nav`, `breadcrumb`.

**Where the line is.** A tab set that switches panels on the same page is a `control` (`tabs`); one that changes the route is navigation. Its other layer: `../../composed/navigation/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
