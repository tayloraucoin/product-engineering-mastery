# composed/navigation

**The kind.** A person moves between places with it: routes, sections, steps.

**At this layer.** Composed: owns copy or behaviour for one use, or imports a primitive. Here that means an app's or site's navigation with its items and copy.

**Examples** from the audited repos, Synapse `@syn/ui` (S) and Conscious Connections (CC): `app-header` (S); `app-site-nav`, `step-nav`, `admin-shell` (CC).

**Where the line is.** Tabs that switch panels on the same page are `control` (`tabs`); tabs that change the route are navigation. Its other layer: `../../primitives/navigation/`.

**Adding one.** Follow "Adding a component" in [`packages/ui/AGENTS.md`](../../../AGENTS.md): a folder `<name>/` here with `<name>.tsx`, `index.ts` and `<name>.stories.tsx`, an `exports` entry in `package.json`, and the component's name added to the examples above as this repo's own.
