# primitives/typography

**The kind.** A person reads it as styled text: the type scale, applied.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, imports no other component. Here that means a text style with its variants (size, weight, tone) bound to tokens.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `text`, `heading`, `eyebrow`, `timestamp`.

**Where the line is.** A component that only renders text in a fixed style is typography; one that formats a value (a time, a number) for display is `display` (`time-text`, `big-number`). Its other layer: `../../composed/typography/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
