---
id: STK-22
size: small
objective: "@pem/ui is laid out as the house repos lay it out: primitives/<kind>/<name>/ and composed/<kind>/<name>/, with a check that keeps it so."
slice_type: "Package structure; the risk is a moved file breaking an app import, or the layout drifting again with nothing to catch it."
non_negotiables:
  - "src/ holds only primitives/, composed/, providers/, hooks/, lib/ and styles/; a component is a folder <kind>/<name>/ with <name>.tsx and index.ts."
  - "Kinds are a closed list (control, display, feedback, layout, media, navigation, typography), named once, in the check."
  - "A cva() definition lives in <name>.variants.ts, never in the component file; a composed component's user-facing strings live in copy.ts."
  - "Public subpaths are unchanged (@pem/ui/button, /cn, /theme, /theme-toggle, /styles/globals.css): neither app's imports change."
  - "yarn check-ui-layout runs in yarn verify and names the offending path."
  - "The layout rule is written once, in packages/ui/AGENTS.md; codebase-conventions points to it."
devs_call: "Where the theme constants sit inside providers/theme/, and the check's message wording."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-1"
  - "D-STK-10"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/ui/src/**"
  - "packages/ui/package.json"
  - "packages/ui/AGENTS.md"
  - "packages/ui/CLAUDE.md"
  - "tooling/check-ui-layout.ts"
  - "tooling/check-ui-layout.test.ts"
  - "tooling/budget.ts"
  - "package.json"
  - "docs/engineering/codebase-conventions.md"
  - "docs/decisions/ledger.md"
  - "docs/decisions/changelog.md"
depends_on:
  - STK-6
out_of_scope:
  - "Stories and Storybook (STK-8); they land beside each component as <name>.stories.tsx."
  - "New components, a shadcn landing zone or components.json; they arrive with their first consumer."
criteria:
  - id: C1
    statement: "The layout check fails, naming the path, on a stray top-level folder, an unknown kind, a component folder without <name>.tsx or index.ts, a cva() in a component file, and an export whose target is missing; it passes a conforming tree."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "@pem/ui's own tree passes the layout check."
    evidence: check
    command: "yarn check-ui-layout"
  - id: C3
    statement: "Types pass for both apps and @pem/ui with the moved paths."
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "Lint, including the tokens rule, passes for every workspace."
    evidence: check
    command: "yarn lint"
  - id: C5
    statement: "Both apps build against the moved package."
    evidence: check
    command: "yarn build"
tier: 1
---

# Contract — STK-22 ui-layout

## Build notes

- **Approach:** move, don't rewrite. The audited repos (Synapse `@syn/ui`, Conscious Connections) both keep `src/primitives/<kind>/<name>/` and `src/composed/<kind>/<name>/`, plus `providers/`, `hooks/`, `lib/`, `styles/`. STK-6 shipped `src/button/`, `src/theme/` and `src/theme-toggle/` flat. Re-slot them, keep the public subpaths, add the check.
- **Primitive or composed:** a primitive is generic and product-agnostic, owns no copy, and imports no other `@pem/ui` component (the shadcn level). A composed component is an assembly with an opinion: it owns copy or behaviour for one use, or imports a primitive.
- **Decisions that apply:** D-STK-1: "`config → … → api → ui → apps`" (ui sits just below the apps). D-STK-10: "Storybook in `packages/ui`, stories beside components".
- **Interfaces:** no export changes. `@pem/ui/theme` still exports `ThemeProvider`, `useTheme`, `THEMES` and `Theme`; `@pem/ui/theme-toggle` exports `ThemeToggle`; `@pem/ui/button` exports `Button`, `buttonVariants` and `ButtonProps`. New root script `check-ui-layout`, added to `verify` before `test:tooling`.
- **Per path:**
  - `packages/ui/src/primitives/control/button/`: `button.tsx`, `button.variants.ts` (the `cva`), `index.ts`.
  - `packages/ui/src/composed/control/theme-toggle/`: `theme-toggle.tsx`, `copy.ts` (the three labels), `index.ts`.
  - `packages/ui/src/providers/theme/`: `theme-provider.tsx`, `themes.ts`, `index.ts`.
  - `packages/ui/src/lib/cn.ts`, `packages/ui/src/styles/globals.css`: unchanged (`@source "../"` still covers `src/`).
  - `packages/ui/package.json`: `exports` targets re-pointed; keys unchanged.
  - `packages/ui/AGENTS.md` (+ `CLAUDE.md` shim `@AGENTS.md`): the folder grammar, the primitive/composed test, the kinds, where stories go. Package-local rules only.
  - `tooling/check-ui-layout.ts`: walks `packages/ui/src` and `package.json` `exports`; exits 1 with one line per problem. Takes a root argument so the test can point it at a temp tree.
  - `tooling/check-ui-layout.test.ts`: one `node:test` case per failure class plus a passing tree, built in `$TMPDIR`.
  - `package.json`: the script and its place in `verify`.
  - `tooling/budget.ts`: the `packages/ui` probe path moves to a legal layout path (review N10).
  - `docs/engineering/codebase-conventions.md` §4: one line pointing to `packages/ui/AGENTS.md` for the internal layout.
  - `docs/decisions/ledger.md` (EN-11), `changelog.md`: the amendment.
- **Gotchas:** relative imports inside the package change depth (`../lib/cn` becomes `../../../lib/cn`). `check-refs` may cite old paths in closed tickets' review files; those are records and are not edited. `hooks/` stays absent until its first hook; the check allows it, it does not require it.
- **Model:** any current model; this is a mechanical move plus a small check.
