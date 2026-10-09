---
id: DEMO-2
size: small
objective: "@pem/ui gains a solid destructive button variant and a --destructive-foreground token, light and dark, so a live dialog's destructive confirm can be solid while page triggers keep the tint."
slice_type: "A kit variant and a token in shared packages; the risk is contrast below AA in one theme, or drift into the existing tint variant every page trigger already wears."
non_negotiables:
  - "One new buttonVariants variant (Plumb names it); the existing destructive tint is unchanged byte for byte."
  - "A --destructive-foreground token in preset.css with light and dark values, exposed as --color-destructive-foreground; no raw colour anywhere else."
  - "The pair destructive / destructive-foreground passes yarn contrast-audit in both themes."
  - "No new export from @pem/ui and no change to any packages/*/package.json (R2: a variant, not an export)."
  - "The button story shows the new variant beside the tint, light and dark."
devs_call: "The variant's name (Plumb's call, recorded in the story and DEMO-3's components.md), its hover and focus treatment within the motion and ring tokens, and the raw step it maps to."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-10"
  - "P-2"
truth_files: "none: a kit variant changes no living UX file; the three dialogs that wear it record it in theirs"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/primitives/control/button/button.variants.ts"
  - "packages/ui/src/primitives/control/button/button.stories.tsx"
  - "packages/config/tailwind/preset.css"
  - "tooling/contrast-audit.ts"
depends_on: []
out_of_scope:
  - "Using the variant in the delete dialog, the form's dirty dialog and the reset confirm: DEMO-5, DEMO-10, DEMO-11."
  - "Recording the ruling in the design layer: DEMO-3."
criteria:
  - id: C1
    statement: "yarn contrast-audit lists the destructive-foreground on destructive pair and passes it in light and dark."
    evidence: check
    command: "yarn contrast-audit"
  - id: C2
    statement: "The token lint passes on the variant and the story: no raw colour, spacing or duration."
    evidence: check
    command: "yarn lint"
  - id: C3
    statement: "The button story renders the solid destructive variant beside the tint, at rest, hover and focus, in light and dark."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-002-destructive-solid/evidence/button-destructive.png"
---

# Contract — DEMO-2 destructive-solid

## Build notes

- **Approach:** Add one variant to `buttonVariants`, solid `bg-destructive text-destructive-foreground`, with hover and focus mirroring `default`'s on the destructive hue. Add `--destructive-foreground` to both theme blocks of `preset.css` and map it in the `@theme` block, then teach `contrast-audit` the pair if it does not find it on its own.
- **Decisions that apply:**
  - D-DEMO-10: "A live dialog's destructive confirm is solid (P-2); page triggers keep the tint."
  - P-2: "A solid destructive button variant for a dialog's confirm; `@pem/ui` `destructive` is a tint only."
  - R2 (technical.md, Taylor's ratified by Taylor at the Tickets gate, 2026-10-08): it lands in `@pem/ui` in wave 1, before the delete dialog, the form's dirty dialog and the reset confirm. One `buttonVariants` variant plus a `--destructive-foreground` token, light and dark, through `yarn contrast-audit`. No new export.
- **Interfaces:** `buttonVariants({ variant: "<name>" })`; the Tailwind colour `destructive-foreground`.
- **Per path:** `button.variants.ts`, the variant; `button.stories.tsx`, the story; `preset.css`, the token in light, dark and `@theme`; `contrast-audit.ts`, the pair only if it is not picked up.
- **Gotchas:**
  - `--destructive` is `--red-800` in light and `--red-300` in dark, so the foreground likely flips between near-white and near-black; check, do not assume.
  - `packages/ui/**` suggests Assay and Threshold in `toolkit.json`; the focus ring must stay visible on the solid fill in both themes.
  - The capture is the Storybook story; name the story so DEMO-3 can link it.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to edit the tint variant in place, which restyles every page trigger the canvas drew tinted.
