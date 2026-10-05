# composed/display

**The kind.** A person reads it: it shows a value, a status or an identity.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a display assembled for one kind of data, often a primitive plus copy.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `list-row`, `tag`, `big-number`, `time-text` (S); `page-header`, `insight-card`, `person-profile-card` (CC). This repo's own, shadcn's recipes (CAT-11): `data-table`.

**Where the line is.** A row that links to its record is still display (`list-row`); a row whose only job is to be chosen is `control`. A card built for one kind of data is display (`insight-card`); the bare `card` surface is `layout` here, though CC files it under display. Skeletons, the `empty` slot and an inline alert stay display, as in both repos; a composed message with its own copy about what happened is `feedback`. Its other layer: `../../primitives/display/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
