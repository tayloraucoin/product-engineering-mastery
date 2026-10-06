---
id: CAT-4
size: medium
objective: "The kit can take any shadcn Base-track component through one repeatable path (the pinned CLI into a staging folder, then the house layout on tokens), proven on the Button, and the manifest lists every shadcn component the epic will bring, by ticket."
slice_type: "Dependencies, the shadcn configuration and global CSS; the risk is an install writing outside its folder or a dependency arriving without its row."
non_negotiables:
  - "Every new dependency is pinned exactly and has its tech-stack.md row before it lands: shadcn 4.21.0, @base-ui/react 1.8.0, lucide-react 1.48.0, tw-animate-css 1.4.0, each at least a week old."
  - "shadcn/tailwind.css is ejected once into packages/ui/src/styles/ (CS-06) without the shimmer utilities (A-14); nothing imports it from the package."
  - "Nothing stays in src/_shadcn/: the CLI stages there and every file moves to primitives/ or composed/ (check-ui-layout)."
  - "The Button keeps buttonVariants and every variant and size apps/web and apps/docs use today."
  - "The Button's classes pass the token lint: elevation and motion through their tokens, no cn package (CS-05)."
  - "Every planned shadcn entry is in the manifest with its ticket; sonner (CS-04) and form (the form library is not chosen) are not."
devs_call: "Story names, the alias layout in components.json, and which ticket each later entry belongs to."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-2"
  - "D-CAT-7"
truth_files: "none: no living UX file covers the starter's kit"
reviewers: []
operator_review: false
planned_paths:
  - "packages/ui/package.json"
  - "packages/ui/components.json"
  - "packages/ui/tsconfig.json"
  - "packages/ui/src/styles/**"
  - "packages/ui/.storybook/vitest.config.ts"
  - "packages/ui/src/primitives/control/button/**"
  - "packages/catalog/manifest.json"
  - "packages/catalog/STATUS.md"
  - "package.json"
  - "yarn.lock"
  - "toolkit.json"
  - "docs/engineering/tech-stack.md"
  - "docs/design/component-sources.md"
  - "tooling/refs-pending.json"
depends_on:
  - CAT-3
out_of_scope:
  - "Every shadcn component but the Button (CAT-5 onward)."
criteria:
  - id: C1
    statement: "The Button is shadcn's Vega button on Base UI in the house layout, storied per variant, size and state with source:shadcn and verdict:kit; every shadcn entry of the epic is in the manifest and STATUS.md is current."
    evidence: check
    command: "yarn check-catalog --ticket CAT-4"
  - id: C2
    statement: "The Button's stories pass their interactions and axe, and every other story still passes."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The kit and both apps type-check against the new Button."
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "The Button and the ejected CSS pass the token lint and every package's lint."
    evidence: check
    command: "yarn lint"
  - id: C5
    statement: "@pem/ui keeps the house layout, with no staging folder left."
    evidence: check
    command: "yarn check-ui-layout"
  - id: C6
    statement: "Each new dependency's pin matches its tech-stack row and toolkit.json's ui module lists it."
    evidence: check
    command: "yarn check-stack"
  - id: C7
    statement: In the running workshop, selecting source:shadcn narrows the sidebar to the shadcn kit stories and source:custom to the custom ones (batch review S5).
    evidence: capture
    path: specs/_shared/epics/CAT-component-catalog/tickets/CAT-4-shadcn-setup/evidence/C7-source-filter.md
qa: Q1
---

# Contract — CAT-4 shadcn-setup

## Build notes

- **Approach:** pin the four dependencies with their rows; `packages/ui/components.json` (`style: base-vega`, `iconLibrary: lucide`, aliases under `@pem/ui/_shadcn`, with the matching `paths` in tsconfig) and a `shadcn` script in @pem/ui and at the root (`yarn shadcn …`, A1); eject `shadcn/tailwind.css` into `src/styles/shadcn.css`, minus shimmer, imported by `globals.css` with `tw-animate-css`; run `yarn shadcn add button` into `src/_shadcn/`, move it to `primitives/control/button/`, split the cva, rewrite `cn` to the package's own, map tokens per `component-sources.md`, write the stories; enter every shadcn entry in the manifest.
- **Decisions that apply:** D-CAT-1 (CS-02 Base UI, CS-03 Vega, CS-04 Toast, CS-05 cn, CS-06 eject, CS-10 lucide); D-CAT-2 (the kit's path); the copy-in mapping (CS-11 to CS-13).
- **Interfaces:** `@pem/ui/button` keeps `Button` and `buttonVariants`; variants `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`; sizes `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`. Root script `yarn shadcn`.
- **Per path:** listed above; `component-sources.md` gains the import steps.
- **Gotchas:** the CLI may add the `cn` package and edit `globals.css`; diff both after every run and revert what CS-05 and CS-06 forbid. The CLI reaches ui.shadcn.com only under a per-command network approval.
- **Model:** any current model.
