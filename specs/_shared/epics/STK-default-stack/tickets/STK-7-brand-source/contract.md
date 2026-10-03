---
id: STK-7
size: small
objective: "One source of truth for the brand: name, URLs, contact, assets and theme colours."
slice_type: "Brand assets; the risk is a hard-coded brand value somewhere a product forgets to change."
non_negotiables:
  - "@pem/brand exports brand.ts and serves logos and fonts from packages/brand/assets."
  - "No brand string, hex or asset path in a manifest, layout, email or story; all read @pem/brand."
  - "A test fails when brand.ts theme colours differ from preset.css."
  - "Fonts load once, through next/font from the package's files."
  - "The guide's set-the-brand step edits brand.ts and assets only."
devs_call: "Asset file formats and the icon generation approach."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-9"
  - "D-STK-16"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/brand/**"
  - "apps/web/app/manifest.ts"
  - "apps/web/app/layout.tsx"
  - "apps/web/app/icon.svg"
  - "apps/web/app/opengraph-image.tsx"
  - "apps/web/public/**"
  - "packages/config/eslint/boundaries.js"
  - "toolkit.json"
  - "docs/runbooks/new-project.md"
depends_on:
  - STK-6
  - STK-3
out_of_scope:
  - "Multi-brand support."
  - "Email templates (STK-15) and stories (STK-8); they read the package when they land."
criteria:
  - id: C1
    statement: "brand.ts theme colours equal the preset's values, and the test fails when one changes."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Boundaries pass with @pem/brand at the foundation layer."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C3
    statement: "Build passes with manifest, metadata and icons read from @pem/brand."
    evidence: check
    command: "yarn verify"
  - id: C4
    statement: "The manifest and the Open Graph image show the brand name and colours."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-7-brand-source/evidence/og.png"
---

# Contract — STK-7 brand-source

## Notes

Use placeholder assets for the starter; a product replaces them in the guide's brand step.
