# primitives/control

**The kind.** A person operates it to act or to enter a value.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, imports no other component. Here that means the bare input or trigger, with its states (hover, focus, disabled, invalid) and no copy of its own.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `button`, `input`, `textarea`, `checkbox`, `radio-group`, `select`, `switch`, `slider`, `tabs`, `toggle-group`.

**Where the line is.** A row that is clickable as a whole is a control (`select-row`); a row that only shows data is `display`. A menu or popover that opens over the page is `feedback`, even when it holds controls. Its other layer: `../../composed/control/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
