# composed/layout

**The kind.** A person doesn't notice it: it arranges, frames or reveals other components and holds no content of its own.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a frame for a whole screen or step, with its slots and copy.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `screen-frame`, `auth-frame`, `step-frame`, `responsive-sheet`, `error-page`, `success-screen`.

**Where the line is.** A card is layout (Synapse's choice; Conscious Connections files it under display). A sheet or drawer that slides over the page is layout; a dialog that interrupts is `feedback`. Its other layer: `../../primitives/layout/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
