---
id: STK-8
size: small
objective: "Storybook opens on localhost with one command, themed and branded, with its checks in verify."
slice_type: "Developer tooling; the risk is a workshop that drifts from the app's CSS or breaks verify."
non_negotiables:
  - "Storybook lives in packages/ui; yarn ui:storybook opens it on port 6006."
  - "The current Storybook major and its Vite-based Next.js framework, versions verified and dated in the as-built."
  - "Preview loads the app's globals.css, the .dark class toolbar and fonts and assets from @pem/brand, never an app's public folder."
  - "Every @pem/ui component has a story per state; a component without a story fails the check."
  - "Interaction and accessibility checks run in yarn verify."
devs_call: "Addon set and story title grammar."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-10"
  - "D-STK-17"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/ui/.storybook/**"
  - "packages/ui/package.json"
  - "packages/ui/src/**/*.stories.tsx"
  - "package.json"
  - "turbo.json"
  - ".gitignore"
  - "docs/engineering/tech-stack.md"
  - "docs/design/**/components.md"
depends_on:
  - STK-7
out_of_scope:
  - "Visual regression or hosted deployment."
  - "New components beyond the button, toggle and theme provider."
criteria:
  - id: C1
    statement: "The story checks (interaction and accessibility) pass for every story."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The full chain passes with the story checks in it."
    evidence: check
    command: "yarn verify"
  - id: C3
    statement: "The button story renders in dark mode in the workshop."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-8-component-workshop/evidence/button-dark.png"
  - id: C4
    statement: "yarn ui:storybook opens on localhost:6006 within a minute on a warm cache."
    evidence: manual
    reason: "a dev server start is timed by a person"
---

# Contract — STK-0 component-workshop

## Notes

Verify versions on the day; the audited repos are on 8.6 with react-vite, which the as-built must not restate as current.
