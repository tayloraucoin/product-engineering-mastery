# primitives/typography

**The kind.** A person reads it as styled text: the type scale, applied.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, may import another primitive but nothing from `composed/`. Here that means a text style with its variants (size, weight, tone) bound to tokens.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `text` (S, CC); `eyebrow` (CC).

**Where the line is.** Text that formats a value (a time, a number) is `display` (`time-text`, `big-number`); CC's `timestamp` is that kind of component. A primitive here may import another typography primitive (an eyebrow built on `text`). Its other layer: `../../composed/typography/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
