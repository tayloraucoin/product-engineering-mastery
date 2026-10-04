# composed/navigation

**The kind.** A person moves between places with it: routes, sections, steps.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means an app's or site's navigation with its items and copy.

**Examples** from the audited repos (Synapse `@syn/ui`, Conscious Connections): `app-header`, `app-site-nav`, `step-nav`, `admin-shell`.

**Where the line is.** A tab set that switches panels on the same page is a `control` (`tabs`); one that changes the route is navigation. Its other layer: `../../primitives/navigation/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, and an `exports` entry in `package.json`.
