# primitives/media

**The kind.** A person watches or listens to it: images, video, audio.

**At this layer.** Primitive: product-agnostic, no `copy.ts`, imports no other component. Here that means one media element with its loading, missing and aspect-ratio states.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `full-bleed-image`, `optional-image`.

**Where the line is.** An icon or a logo is not media: an icon is passed into the component that uses it, and the brand mark comes from `@pem/brand`. Its other layer: `../../composed/media/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
