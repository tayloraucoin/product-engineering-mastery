---
id: STK-25
size: small
objective: "Form controls draw their boundary with a token that meets 3:1 against the page, in both themes."
slice_type: "Accessibility of the token layer; the risk is a control nobody can find at low vision, or every hairline turned heavy."
non_negotiables:
  - "A new role token for a control's boundary; --border stays the decorative hairline."
  - "The contrast audit gains the boundary against background, light and dark, at 3:1."
  - "The sign-in field uses the new token; no raw value."
devs_call: "The token's name and its lightness in each theme."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-17"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - "packages/config/tailwind/preset.css"
  - "tooling/contrast-audit.ts"
  - "tooling/contrast-audit.test.ts"
  - "apps/web/app/auth/sign-in/_components/email-field.tsx"
depends_on:
  - STK-12
out_of_scope:
  - "An input component in @pem/ui; that waits for a second consumer."
criteria:
  - id: C1
    statement: "The contrast audit passes with the control-boundary pair at 3:1 or more in light and dark."
    evidence: check
    command: "yarn contrast-audit"
  - id: C2
    statement: "The sign-in field's unfocused boundary is visible at 3:1 in both themes."
    evidence: manual
    reason: "needs a person's eyes on the rendered field until P-C's captures land"
qa: Q1
---

# Contract — STK-25 control-boundary-token

## Notes

Drafted from STK-12's threshold review (F1): the email field's 1px --border is 1.26:1 light and 1.31:1 dark against an equal fill.
