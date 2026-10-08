---
id: WEB-20
size: small
objective: "apps/web follows EN-19: the root layout's theme toggle lives in apps/web/components/shell/, app/_components/ is gone, and the new folder carries the same sandbox import guard and assess credit as a route _components/."
slice_type: "A file move plus two tooling widenings; the risks are a guard that silently stops covering a folder components can now live in, and a stale path left in a runbook."
non_negotiables:
  - "The component's code is unchanged: path and import only."
  - "apps/web/app/_components/ no longer exists when this lands."
  - "The D-LAB-34 guard (no @pem/db/client or @pem/db/schema) covers apps/web/components/** as it covers the experimental and admin routes; no other boundaries edge changes."
  - 'Assess V4 counts a "use client" file under components/ as placed, as it does one under _components/.'
  - "No boundaries error is suppressed."
devs_call: "Whether the guard lists apps/web/components/** or only its domain sub-folders; the regex shape in V4."
cites:
  - "EN-19"
truth_files: "none: no behaviour changes; the toggle renders as before"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/_components/floating-theme-toggle.tsx"
  - "apps/web/components/shell/floating-theme-toggle.tsx"
  - "apps/web/app/layout.tsx"
  - "packages/config/eslint/boundaries.js"
  - "tooling/boundaries.test.ts"
  - "tooling/lib/assess/conventions.ts"
  - "tooling/migrate-assess-listings.test.ts"
  - "docs/runbooks/remove/experimental-sandbox.md"
  - "docs/runbooks/migrate/layer-3.md"
  - "docs/decisions/changelog.md"
depends_on: []
out_of_scope:
  - "The docs app's components (WEB-21)."
  - "Moving any route _components/ file: the importer map shows none misplaced."
  - "A structural check for importer locality (the research note's Enforcement section); a separate ticket if wanted."
criteria:
  - id: C1
    statement: "A probe under apps/web/components/ that imports @pem/db/client fails the boundaries lint with the D-LAB-34 message."
    evidence: test
    command: "yarn test:boundaries"
  - id: C2
    statement: "Assess V4 scores a tree whose client files sit in components/<domain>/ the same as one whose client files sit in _components/."
    evidence: test
    command: "yarn test:tooling --test-name-pattern V4"
  - id: C3
    statement: "The boundaries lint passes on the tree with the moved file."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "apps/web type-checks and builds with the toggle at its new path."
    evidence: check
    command: "yarn build"
---

# Contract — WEB-20 web-shell-components

## Build notes

- **Approach:** Move `floating-theme-toggle.tsx` with `git mv` to `apps/web/components/shell/` and change the root layout's import to `../components/shell/floating-theme-toggle`. Add `apps/web/components/${SOURCE_FILES}` to `SANDBOX_ROUTE_FILES`, rename the constant if the name no longer fits, and update its comment. Add a probe beside the existing D-LAB-34 probes. Widen V4's regex to `(^|\/)_?components\//`, add a case to the V4 test, and reword the layer-3 runbook's planned check to match.
- **Decisions that apply:**
  - EN-19: "A component is placed by its importer set: the route's `_components/`, then the section's deepest common `_components/`, then `apps/<app>/components/<domain>/` (chrome in `shell/`), then `@pem/ui` only when both apps import it …; no `app/_components/` at the app root and no type-named folders."
  - D-LAB-34: an experimental or admin route reaches sandbox data only through `apps/web/lib/sandbox`.
- **Interfaces:** none change. `FloatingThemeToggle` keeps its name and export.
- **Per path:**
  - The two toggle paths: the move.
  - `layout.tsx`: the import.
  - `boundaries.js`: the guard's file list.
  - `boundaries.test.ts`: the probe.
  - `conventions.ts` and its listings test: V4.
  - `remove/experimental-sandbox.md:72`: the new path.
  - `migrate/layer-3.md:96-97`: "a `_components/` or `components/` folder".
  - `changelog.md`: one line under the 2026-10-08 placement entry, or a new entry.
- **Gotchas:**
  - Editing `boundaries.js` changes what `apps/web` may import, so plan mode applies (CLAUDE.md).
  - V4 and its test were built by MIG-6. Widening them reopens nothing in MIG-6, and MIG-6's results are not re-run.
  - Tailwind v4 detects sources automatically from the app's root, so `components/` needs no `@source`. Confirm that the toggle's classes survive in the built CSS.
- **Model:** Sonnet 5.5 is enough for the move. Choose Opus 5.5 if the guard rename spreads past `boundaries.js`.
