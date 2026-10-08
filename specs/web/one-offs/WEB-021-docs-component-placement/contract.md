---
id: WEB-21
size: small
objective: "apps/docs follows EN-19: its shell (sidebar, nav, search) lives in apps/docs/components/shell/, the doc page's renderer and frontmatter panel live beside the page in [[...slug]]/_components/, and app/_components/ is gone."
slice_type: "A file move across five components in one app; the risk is a broken relative import or a lost Tailwind class that only the built reader shows."
non_negotiables:
  - "Components' code is unchanged: paths and imports only."
  - "apps/docs/app/_components/ no longer exists when this lands."
  - "sidebar.tsx, docs-nav.tsx and search.tsx sit together in apps/docs/components/shell/; markdown.tsx and frontmatter-panel.tsx sit in apps/docs/app/[[...slug]]/_components/."
  - "The reader renders the same: sidebar, search, a doc page with its frontmatter panel."
devs_call: "The order of the moves; nothing else."
cites:
  - "EN-19"
truth_files: "none: apps/docs is the toolkit's reader and has no living UX file"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/docs/app/_components/**"
  - "apps/docs/components/shell/**"
  - "apps/docs/app/[[]...slug[]]/_components/**"
  - "apps/docs/app/[[]...slug[]]/page.tsx"
  - "apps/docs/app/layout.tsx"
  - "docs/decisions/changelog.md"
  - "tooling/refs-pending.json"
depends_on: []
out_of_scope:
  - "apps/web (WEB-20)."
  - "Records 0004 and 0007, which name the old markdown path as history and are immutable."
  - "Any change to what the components render."
criteria:
  - id: C1
    statement: "The tree type-checks with the moved files."
    evidence: check
    command: "yarn check-types"
  - id: C2
    statement: "apps/docs builds every page statically from the moved components."
    evidence: check
    command: "yarn build"
  - id: C3
    statement: "A doc page in the built reader shows the sidebar, the search field and the frontmatter panel as before the move."
    evidence: capture
    path: "specs/web/one-offs/WEB-021-docs-component-placement/evidence/c3-reader.png"
---

# Contract — WEB-21 docs-component-placement

## Build notes

- **Approach:** `git mv` each file. Fix the imports in `layout.tsx`, which imports the sidebar, and `[[...slug]]/page.tsx`, which imports the markdown renderer and the frontmatter panel. The shell files keep their relative imports to each other. Fix every `../lib/` or `@/` import the deeper or shallower path changes. Remove the empty folder.
- **Decisions that apply:**
  - EN-19: "… then the section's deepest common `_components/`, then `apps/<app>/components/<domain>/` (chrome in `shell/`) …; no `app/_components/` at the app root and no type-named folders."
  - §1's worked example names `apps/docs/app/[[...slug]]/_components/markdown.tsx`, and §6's names `apps/docs/components/shell/docs-nav.tsx`. This ticket makes both true.
- **Interfaces:** none change. Component names and exports stay as they are.
- **Per path:**
  - `components/shell/`: `sidebar`, `docs-nav`, `search`.
  - `[[...slug]]/_components/`: `markdown`, `frontmatter-panel`.
  - `layout.tsx` and `page.tsx`: the imports.
  - `changelog.md`: one line that the move landed.
- **Gotchas:**
  - `tooling/refs-pending.json` holds the two target paths §1 and §6 name ("lands in WEB-21"). Remove both entries in this ticket.
  - The planned-path globs escape the brackets as `[[]...slug[]]` (WEB-11's `matchesGlob` note).
  - Check whether `apps/docs/turbo.json`'s build `inputs` name `app/**` only. If they do, add `components/**`, or the cached build will miss edits to the shell.
  - Tailwind v4 detects sources automatically from the app's root. Confirm that the sidebar's classes survive in the built CSS.
- **Model:** Sonnet 5.5 is enough: a mechanical move with a build to prove it.
