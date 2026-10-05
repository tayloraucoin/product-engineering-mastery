# primitives/control

**The kind.** A person operates it to act or to enter a value.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, may import another primitive but nothing from `composed/`. Here that means the bare input or trigger, with its states (hover, focus, disabled, invalid) and no copy of its own.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `button`, `input`, `textarea`, `checkbox`, `radio-group`, `select`, `switch`, `toggle-group` (S, CC); `tabs` (S); `slider` (CC). This repo's own, shadcn's Vega on Base UI (CAT-4, CAT-5, CAT-9): `button`, `input`, `textarea`, `checkbox`, `radio-group`, `switch`, `slider`, `select`, `native-select`, `toggle`, `input-otp`, `tabs`, `button-group`, `toggle-group`, `input-group`.

**Where the line is.** A row whose only job is to be chosen is control (`select-row`); a row that shows data is `display`, even when the whole row links somewhere (`list-row`). A composed menu with its trigger and items is control (`ellipses-menu`); the bare `dropdown-menu` it opens is `feedback`. An image cropper is control (S): a person operates it. Its other layer: `../../composed/control/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
