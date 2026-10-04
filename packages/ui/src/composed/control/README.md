# composed/control

**The kind.** A person operates it to act or to enter a value.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a control with a job: a label, options, copy or behaviour for one use.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `theme-toggle` (here), `search-field`, `segmented-control`, `date-field`, `time-field`, `chip-picker`, `ellipses-menu`, `oauth-button`.

**Where the line is.** A row that is clickable as a whole is a control (`select-row`); a row that only shows data is `display`. A menu or popover that opens over the page is `feedback`, even when it holds controls. Its other layer: `../../primitives/control/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
