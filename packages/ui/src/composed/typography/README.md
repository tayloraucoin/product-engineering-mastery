# composed/typography

**The kind.** A person reads it as styled text: the type scale, applied.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means rare: neither audited repo has one here.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `coach-markdown` (CC files it under display; rendered markdown is typography here).

**Where the line is.** Text that formats a value (a time, a number) is `display` (`time-text`, `big-number`); CC's `timestamp` is that kind of component. A primitive here may import another typography primitive (an eyebrow built on `text`). Its other layer: `../../primitives/typography/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
