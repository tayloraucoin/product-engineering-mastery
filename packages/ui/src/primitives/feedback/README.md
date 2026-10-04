# primitives/feedback

**The kind.** A person is told what happened or what is happening, or is interrupted to confirm.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, may import another primitive but nothing from `composed/`. Here that means the overlay or indicator itself: open, close, focus trap, position.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `dialog`, `alert-dialog`, `popover`, `tooltip`, `dropdown-menu` (S, CC); `toaster`, `spinner` (S).

**Where the line is.** An overlay that informs or asks to confirm is feedback (dialog, popover, tooltip, toast). A panel that slides in to hold content is `layout` (sheet, drawer). A composed menu with its trigger is `control`. A composed empty state with its copy and action is feedback (S; CC files it under display); the bare `empty` slot is `display`. Its other layer: `../../composed/feedback/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
