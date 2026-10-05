---
id: CAT-2
size: small
objective: "The preset carries every colour role, radius step, elevation level and motion token shadcn's Vega style needs, and the token lint judges design values rather than variant selectors, so shadcn components can enter @pem/ui on tokens."
slice_type: "Design tokens and their enforcing lint; the risk is a token added without its contrast pair, or a lint loosened past the canon's intent."
non_negotiables:
  - "Raw values live only in preset.css; every new role is set under :root and again under .dark, and exposed through the @theme bridge."
  - "Every new text pair is in contrast-audit's PAIRS and passes AA in both themes."
  - "The tk-motion duration and easing values enter verbatim, under their own names."
  - "The lint still rejects every raw design value it rejected before, except an arbitrary value made only of variables, --spacing(), keywords or relative units; it now also rejects shadow-xs and shadow-2xs."
  - "Variant selectors (data-[…]:, has-[…]:, aria-[…]:) are never reported."
  - "Each new ruling (CS-11 elevation, CS-12 motion, CS-13 lint) gets one ledger line and the changelog an entry."
devs_call: "The placeholder values, the radius steps above lg, and the lint's internal structure."
cites:
  - "specs/_shared/epics/CAT-component-catalog/technical.md"
  - "D-CAT-1"
  - "D-CAT-2"
truth_files: "none: no living UX file covers the starter's tokens"
reviewers: []
operator_review: false
planned_paths:
  - "packages/config/tailwind/preset.css"
  - "packages/config/eslint/tokens.js"
  - "tooling/contrast-audit.ts"
  - "tooling/contrast-audit.test.ts"
  - "tooling/token-lint.test.ts"
  - "tooling/preset-tokens.test.ts"
  - "apps/web/app/opengraph-image.tsx"
  - "docs/design/component-sources.md"
  - "docs/decisions/ledger.md"
  - "docs/design/canon.md"
  - "docs/decisions/changelog.md"
depends_on:
  - CAT-1
out_of_scope:
  - "Brand values: every new value is a neutral placeholder that P-K retunes."
  - "Any component; CAT-4 onward."
criteria:
  - id: C1
    statement: "Every audited pair, the new card, popover, secondary, sidebar and destructive pairs included, passes WCAG AA in light and dark."
    evidence: check
    command: "yarn contrast-audit"
  - id: C2
    statement: "The preset defines every colour role, radius step, elevation level and motion token Vega needs; the token lint passes and fails one case per rule, ignores variant selectors, and rejects shadow-xs."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "apps/web and @pem/ui still lint clean under the refined token lint."
    evidence: check
    command: "yarn lint"
  - id: C4
    statement: "Every existing story still passes its axe and interaction checks on the new preset."
    evidence: test
    command: "yarn test"
tier: 1
---

# Contract — CAT-2 shadcn-roles

## Build notes

- **Approach:** extend the preset's three layers; add the elevation levels and the tk-motion tokens; rewrite the token lint's class-string rules as one small ESLint rule that splits each class into variant prefix and utility and judges only the utility; add the copy-in mapping to `component-sources.md`.
- **Decisions that apply:** D-CAT-2 (shadcn core enters `@pem/ui` on tokens); the approved addendum of 2026-10-04: elevation `shadow-control` (was xs), `shadow-raised` (sm), `shadow-overlay` (md), `shadow-floating` (lg); motion tokens verbatim from tk-motion's values, used as `duration-(--motion-duration-*)` and `ease-(--motion-ease-*)`; an arbitrary value is banned when it holds a px, rem, em, ms or s literal (1px and 2px hairlines allowed) or a cubic-bezier.
- **Interfaces:** utilities `bg-card`, `bg-popover`, `bg-secondary`, `bg-destructive`, `border-input`, `bg-sidebar*`, `bg-chart-1` to `-5`, `rounded-xl` to `-4xl` on the house radius, `shadow-control|raised|overlay|floating`; CSS variables `--motion-*`.
- **Per path:** preset (the tokens); `tokens.js` (the rule); contrast-audit and its fixture (new pairs); `token-lint.test.ts` (one pass and one fail per rule, named C2); `preset-tokens.test.ts` (every name Vega uses is defined, named C2); `component-sources.md` (copy-in mapping table); ledger and changelog.
- **Gotchas:** the contrast fixture must define every audited token or the audit fails it; alpha borders from shadcn's dark theme become solid raw steps (the audit reads no alpha).
- **Model:** any current model.
