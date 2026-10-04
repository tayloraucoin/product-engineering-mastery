# composed/feedback

**The kind.** A person is told what happened, what is happening, or is interrupted to confirm.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a message or confirmation with its copy and its actions.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `empty-state`, `loading-text`, `save-status`, `region-retry`, `discard-dialog`, `typed-confirm-dialog`, `autosave-banner`.

**Where the line is.** Every overlay that opens over the page is feedback, as in both audited repos. An empty state is feedback (it says why nothing is here), not `display`. Its other layer: `../../primitives/feedback/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
