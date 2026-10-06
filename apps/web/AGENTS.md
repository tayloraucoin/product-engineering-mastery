# apps/web — the demo app

App-local rules only. The root `AGENTS.md` and `docs/index.md` govern everything not said here; this file never restates them.

## What this app is

A small, deliberately generic records product that exists to prove the toolkit: a dense table with sort and filter, a record detail with a diffable document, a form with validation, settings, a destructive-action dialog, and a three-beat onboarding (`docs/prompts/archive/phases/demo-app-and-skills.md`). Built in Phase 3; today it is the scaffold's single page. It is never a mock of a real client, and it holds no real customer data.

## The filled examples live here

Every template in `docs/` has its filled example for this app, so the pair sits side by side in the docs app:

| Template                                                | Filled example                                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `docs/design/templates/*.template.md`                   | `apps/web/docs/design/` (`DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, `coverage-gaps.md`, `refs/`) |
| `docs/product/brief.template.md`, `package.template.md` | `specs/web/epics/<EPIC>-<slug>/brief.md`; a ticket's contract in `specs/web/one-offs/` or the epic's `tickets/` (A4 layout)       |

For UI work in this app, the design layer is `docs/design/canon.md` plus `apps/web/docs/design/`. Until Phase 3 writes the latter, the canon alone governs.

## App rules

- **Every state is reachable by URL:** `?state=empty|loading|error|partial|offline` on every route, light and dark, with reduced motion honored. A state the critic cannot reach is a state that was not built.
- **Fixtures only.** Seeded, realistic, in-register copy; never lorem, never real customer data (`docs/design/workflow.md`, the data rule).
- **Components come from `@pem/ui`.** A component only this app uses lives in the route's `_components/`; a second consumer moves it to `@pem/ui` (engineering conventions §1).
- Dev server: `yarn web:dev` (port 3000).
