# primitives/navigation

**The kind.** A person moves between places with it: routes, sections, steps.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, may import another primitive but nothing from `composed/`. Here that means the bare nav structure, with its active and collapsed states.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `sidebar`, `bottom-nav` (S, CC). This repo's own, shadcn's Vega (CAT-8, CAT-10, CAT-11): `navigation-menu`, `breadcrumb`, `menubar`, `pagination`, `sidebar`.

**Where the line is.** Tabs that switch panels on the same page are `control` (`tabs`); tabs that change the route are navigation. Its other layer: `../../composed/navigation/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
