# primitives/layout

**The kind.** A person doesn't notice it: it arranges, frames or reveals other components and holds no content of its own.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, imports no other component. Here that means a container with spacing, surface and reveal behaviour.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `card`, `separator`, `sheet`, `drawer`, `collapsible`, `section`, `flex`.

**Where the line is.** A card is layout (Synapse's choice; Conscious Connections files it under display). A sheet or drawer that slides over the page is layout; a dialog that interrupts is `feedback`. Its other layer: `../../composed/layout/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
