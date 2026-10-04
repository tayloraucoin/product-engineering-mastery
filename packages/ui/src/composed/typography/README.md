# composed/typography

**The kind.** A person reads it as styled text: the type scale, applied.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means rare: text with a job, such as rendered markdown with its own copy.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `coach-markdown` (filed under display in Conscious Connections; put it here).

**Where the line is.** A component that only renders text in a fixed style is typography; one that formats a value (a time, a number) for display is `display` (`time-text`, `big-number`). Its other layer: `../../primitives/typography/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
