# composed/control

**The kind.** A person operates it to act or to enter a value.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a control with a job: a label, options, copy or behaviour for one use.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `theme-toggle` (here); `search-field`, `segmented-control`, `ellipses-menu` (S, CC); `date-field`, `chip-picker`, `select-row`, `large-target-row`, `image-cropper` (S).

**Where the line is.** A row whose only job is to be chosen is control (`select-row`); a row that shows data is `display`, even when the whole row links somewhere (`list-row`). A composed menu with its trigger and items is control (`ellipses-menu`); the bare `dropdown-menu` it opens is `feedback`. An image cropper is control (S): a person operates it. Its other layer: `../../primitives/control/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
