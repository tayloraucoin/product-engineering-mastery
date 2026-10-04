# composed/display

**The kind.** A person reads it: it shows a value, a status or an identity, and nothing happens when it is operated.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a display assembled for one kind of data, often from a primitive plus copy.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `list-row`, `tag`, `category-chip`, `big-number`, `time-text`, `page-header`, `insight-card`.

**Where the line is.** If it tells the person what just happened or why nothing is here, it is `feedback`. If it only arranges other components, it is `layout`. Its other layer: `../../primitives/display/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
