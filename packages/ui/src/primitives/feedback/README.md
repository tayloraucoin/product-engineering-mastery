# primitives/feedback

**The kind.** A person is told what happened, what is happening, or is interrupted to confirm.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, imports no other component. Here that means the overlay or indicator itself: open, close, focus trap, position.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `dialog`, `alert-dialog`, `popover`, `tooltip`, `dropdown-menu`, `toaster`, `spinner`.

**Where the line is.** Every overlay that opens over the page is feedback, as in both audited repos. An empty state is feedback (it says why nothing is here), not `display`. Its other layer: `../../composed/feedback/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
