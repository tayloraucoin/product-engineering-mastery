# composed/media

**The kind.** A person watches or listens to it: images, video, audio.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means a player or gallery built from media primitives.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `image-gallery`, `audio-scrubber`, `waveform` (CC).

**Where the line is.** An image cropper is `control` (S): a person operates it. An icon or a logo is not media: an icon is passed into the component that uses it, and the brand mark comes from `@pem/brand`. Its other layer: `../../primitives/media/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
