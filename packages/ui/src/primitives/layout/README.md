# primitives/layout

**The kind.** A person sees other components through it: it arranges, frames or reveals them.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, may import another primitive but nothing from `composed/`. Here that means a container with spacing, surface and reveal behaviour, and no content of its own.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `separator`, `sheet`, `collapsible` (S, CC); `card`, `drawer` (S); `section`, `flex` (CC). This repo's own, shadcn's Vega (CAT-7, CAT-9, CAT-10): `card`, `separator`, `aspect-ratio`, `scroll-area`, `resizable`, `collapsible`, `accordion`, `drawer`, `sheet`, `field`, `message-scroller`.

**Where the line is.** A panel that slides in to hold content is layout (sheet, drawer), in both repos; an overlay that informs or asks to confirm is `feedback`. The bare `card` surface is layout (S); a card built for one kind of data is `display`. Its other layer: `../../composed/layout/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
