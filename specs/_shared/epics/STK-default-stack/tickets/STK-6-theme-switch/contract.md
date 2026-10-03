---
id: STK-6
size: small
objective: "Light and dark mode switch by class with three token layers, and a toggle in @pem/ui."
slice_type: "Design tokens; the risk is a raw colour outside the preset or a flash of the wrong theme."
non_negotiables:
  - "preset.css has three layers: raw scale, semantic names, shadcn bridge; dark overrides under .dark."
  - "No hex or oklch literal outside preset.css; the tokens lint still passes."
  - "next-themes unpatched, class strategy, system as an option, no flash on load."
  - "The toggle is a @pem/ui component with a story for each state."
  - "Both apps keep rendering with no visual regression beyond the dark class."
devs_call: "Toggle placement and the raw scale's naming."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-17"
  - "D-STK-1"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/config/tailwind/preset.css"
  - "packages/config/eslint/tokens.js"
  - "packages/ui/src/theme/**"
  - "packages/ui/src/theme-toggle/**"
  - "packages/ui/package.json"
  - "apps/web/app/layout.tsx"
  - "apps/web/app/globals.css"
  - "apps/docs/app/layout.tsx"
  - "apps/docs/app/globals.css"
  - "docs/design/**/tokens.md"
depends_on:
  - STK-1
out_of_scope:
  - "Brand colours (STK-7): this ticket keeps the current neutral palette."
  - "Storybook setup (STK-8); the stories land when it exists."
criteria:
  - id: C1
    statement: "Tokens lint passes with no raw colour outside preset.css."
    evidence: check
    command: "yarn lint"
  - id: C2
    statement: "Types and build pass for both apps with the provider mounted."
    evidence: check
    command: "yarn verify"
  - id: C3
    statement: "The demo home renders in dark mode through the toggle."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-6-theme-switch/evidence/dark.png"
  - id: C4
    statement: "The demo home renders in light mode through the toggle."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-6-theme-switch/evidence/light.png"
  - id: C5
    statement: "No flash of the wrong theme on a hard reload in dark mode."
    evidence: manual
    reason: "a load-time flash is not captured by a still image"
---

# Contract — STK-0 theme-switch

## Notes

The audited repos' preset shows the three-layer shape; carry the shape, not their palettes. Check whether the product design layer's tokens.md must change and list it if so.
