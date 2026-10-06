# composed/layout

**The kind.** A person sees other components through it: it arranges, frames or reveals them.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a frame for a whole screen, step or panel, with its slots; it may carry that screen's copy.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `screen-frame`, `auth-frame`, `step-frame`, `responsive-sheet`, `action-row-sheet`, `error-page` (S); `success-screen`, `drawer-dialog`, `side-channel-drawer` (CC).

**Where the line is.** A panel that slides in to hold content is layout (sheet, drawer), in both repos; an overlay that informs or asks to confirm is `feedback`. The bare `card` surface is layout (S); a card built for one kind of data is `display`. Its other layer: `../../primitives/layout/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
