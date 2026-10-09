# Review — record-form, round 2
Model: claude-opus-5-5
Read: .claude/skills/tk-ui-critic/SKILL.md; docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20, to ## Changelog); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/record-form.md (there is no living specs/web/ux/ copy); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/record-form.ts (keys)
Coverage: 48/48 files read; missing: none

Top 3
1. dirty 390: the dialog's scrim stops at about y=900, so the page's solid Save (and the lower half of Terms) shows at full strength under an open modal. Either fix the overlay height or capture the viewport only, so the state shows what a person sees.
2. submitting: Annual value keeps its rest border while every sibling control dims, so "fields read-only and dimmed" reads as one field still live.
3. 390: the form shows values in two type sizes. The inputs and textarea are about 16px; the native selects and the date picker are about 14px.

Lines
C-R01 PASS — every finding below cites a key, width, theme and pixel box
C-R02 1 issue — partial: the heaviest block is the disabled Save, while the only action that moves forward (Retry) is an outline button
C-R03 PASS — one solid action per view (Save, Retry save, or the destructive confirm inside its dialog); the 390 dirty overlap is scored under C-R10 as a scrim and capture defect
C-R04 1 issue — the 390 control values use two sizes (about 16 and 14px); at most 4 sizes otherwise
C-R05 PASS — every input has a visible label above it; optional fields say "Optional."; actions use outcome verbs (Save, Retry save, Discard change, Keep editing)
C-R06 PASS — label to control and control to helper are about 12px; field groups are about 40px apart; nothing looks off the spacing scale
C-R07 1 issue — the date picker's rest look differs from the other text controls
C-R08 PASS — no color, radius or shadow seen that is outside the tokens
C-R09 1 issue — submitting light: the dimmed helpers and values look below AA by eye; needs a measured check
C-R10 2 issues — submitting does not dim Annual value; the dirty 390 scrim is incomplete; all 8 keys are captured, and focus is visible on "Keep editing"
C-R11 PASS — Annual value is right-aligned with tabular figures, and the unit sits in the label "(USD)"
C-R12 NOT RUN (no tk-motion review filed)
C-R13 PASS — every element has a stated job
C-R14 PASS — none of A-01 to A-20 seen. Geist is a reasoned choice (DESIGN.md), the alerts have no stripe, loading uses skeletons, and "Saving" shows only a real pending state
C-R15 N/A — no references file loaded
P-A01 PASS — each key keeps the same words and rows at 390, 834 and 1440. The breadcrumb becomes a back link and "Back to PEM" moves to the footer; both are layout changes the spec sets (D-DEMO-20)
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Should-fix] C-R10 · dirty 390 light and dark · the scrim's lower edge is at about y=900. Below it, Terms (16,900)-(374,1005), its helper, the solid "Save" (16,1089)-(374,1123) and "Cancel" render undimmed while the alert-dialog (16,337)-(374,563) is open. That puts two solid actions, "Discard change" and "Save", in one capture. A modal state should dim everything behind it. Make the overlay cover the full page, or have web:capture shoot the viewport for dialog states.
- [Should-fix] C-R10 · submitting 1440/834/390 light and dark · Annual value at 1440 (432,406)-(712,442) and at 390 (16,540)-(374,576) keeps its dark rest border. Vendor name, Owner, Status and Terms have dimmed borders, and Renewal date (728,406)-(1008,442) has almost none. The spec asks that all fields be read-only and dimmed alike.
- [Should-fix] C-R02 · partial 1440/834/390 light and dark · at 1440 the disabled solid "Save" (920,881)-(1007,915) is the heaviest block in greyscale, and "Retry" (937,187)-(995,219) is an outline button inside a neutral notice. The only step that unblocks the form does not have the focal weight, and components.md asks for a destructive alert with Retry as the solid action after a failed load.
- [Should-fix] C-R04 · all keys 390 light and dark · e.g. on empty 390, "Halvorsen Freight" (16,242)-(374,278), "48,000" (16,540)-(374,576) and the Terms placeholder (16,772)-(374,932) are about 16px, but "Ana Okafor" (16,342)-(374,378), "Active" (16,441)-(374,477) and "14 Mar 2027" (16,639)-(374,675) are about 14px. That makes two value sizes for one kind of content in one form; use one size for control values.
- [Should-fix] C-R09 · submitting 1440/834/390 light · the dimmed helpers "Optional." (728,456)-(786,472) and "Optional. Each save keeps a version you can compare." (432,712)-(777,728), and the dimmed field values, look below 4.5:1 on white by eye. They may be exempt if the form counts as inactive; needs a measured check.
- [Consider] C-R07 · every key except loading, 1440/834/390 light and dark · e.g. on empty 1440 the Renewal date control (728,406)-(1008,442) has a lighter border than Annual value (432,406)-(712,442) in light, and in dark a raised fill against the inputs' darker fill. Six controls, two rest styles.

Not covered: the default views without ?state= (/new and /edit); hover and active on every control; focus rings except on "Keep editing" in dirty; the date-picker popover and the open native selects; motion (including opacity-only on the dirty dialog) and reduced motion; measured contrast ratios; the focus move to the summary after a failed submit; the behaviour of the error-summary links; live re-validation; the beforeunload prompt.
Verdict: PASS

