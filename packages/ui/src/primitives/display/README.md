# primitives/display

**The kind.** A person reads it: it shows a value, a status or an identity, and nothing happens when it is operated.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, imports no other component. Here that means a small visual unit with variants and no copy.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `badge`, `avatar`, `label`, `kbd`, `skeleton`, `table`, `helper-text`.

**Where the line is.** If it tells the person what just happened or why nothing is here, it is `feedback`. If it only arranges other components, it is `layout`. Its other layer: `../../composed/display/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
