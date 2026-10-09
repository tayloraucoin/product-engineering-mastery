# Review — record-form, round 1
Model: claude-opus-5-5
Read: .claude/skills/tk-ui-critic/SKILL.md; docs/design/canon-rubric.md; docs/design/canon.md §2 (lines 161–187, A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/record-form.md (there is no living specs/web/ux/demo/ copy); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/record-form.ts (keys)
Coverage: 48/48 files read; missing: none

Top 3
1. dirty at 390 (light and dark): the dialog's scrim stops at about y≈900. Below it, Terms, Save, Cancel and "Back to PEM" render at full strength, so a solid Save sits in the same capture as the solid destructive "Discard change". Make the overlay cover the whole page, or lock scroll so nothing below it can show (C-R03, C-R10).
2. submitting: the fields are not dimmed evenly. Annual value keeps a rest-strength border and value text while Vendor name, the selects and the date picker dim, so one field looks editable when it is not (C-R10).
3. loading: the skeleton leaves out the helper rows ("Optional." under Renewal date and the Terms helper), so the actions jump about 20–60px when content arrives. states.md asks for skeletons that copy the final layout (C-R10).

Lines
C-R01 PASS — all 48 expected captures are present and read; every finding below cites a region
C-R02 PASS — Save (or Retry save, or the dialog) is the single focal point; 390 reorders, with full-width Save on top and fields stacked, rather than shrinking 1440
C-R03 2 issues — dirty 390 light and dark show a solid Save outside the clipped scrim beside the solid destructive confirm
C-R04 2 issues — Terms clause text is 14px at 834/1440 (below 16px reading text); at 390, controls mix 16px (input, textarea) with 14px (select, date picker)
C-R05 PASS — every control has a visible label; optional fields say "Optional."; action labels are outcome verbs (Save, Retry save, Keep editing, Discard change)
C-R06 2 issues — the offline alert body wraps early, leaving an empty action gutter; the dirty dialog centres title and body but right-aligns its actions
C-R07 PASS — one surface, no nested cards; the only borders are the alerts and the top border above the actions that the spec calls for
C-R08 PASS — no off-token color, radius or shadow visible in the pixels; the token lint enforces the rest
C-R09 1 issue — the date picker's rest state uses a different grey from its sibling inputs (lighter border in light, raised fill in dark); errors carry text and an icon, never color alone
C-R10 4 issues — the dirty scrim is clipped at 390; Annual value is not dimmed in submitting; the loading skeleton omits helper rows; the date picker's rest state reads as a button, not an input (scored under C-R09)
C-R11 PASS — Annual value is right-aligned with tabular figures and the unit in its label "(USD)", including the negative -1,200 in invalid
C-R12 NOT RUN (no tk-motion review filed)
C-R13 PASS — every element has a stated job
C-R14 PASS — Geist is a declared, reasoned choice in DESIGN.md (not A-01); no accent stripes (A-05); labels sit above every field (A-16); pending is a button spinner, not a page spinner (A-18)
C-R15 N/A — no references file was loaded for this run
P-A01 1 issue — at 390 the breadcrumb "Records › Halvorsen Freight › Edit" becomes "‹ Halvorsen Freight", dropping two words in every key
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Blocking] C-R03 · dirty 390 light · lower page, about (0,900)–(390,1230) · the scrim and wash stop at y≈900, partway through the Terms textarea. Below it, a full-strength solid black "Save" (16,1090)–(374,1122) sits in the same capture as the solid destructive "Discard change" (41,460)–(349,493): two primary-styled actions. The rule allows one per view, with the destructive primary only inside its confirmation. The cause may be a fixed overlay sized to the 390 viewport; what renders is a live-looking primary beside the dialog.
- [Blocking] C-R03 · dirty 390 dark · same region, (0,900)–(390,1230) · the same clipped scrim: the solid light "Save" (16,1090)–(374,1122) shows at full contrast beside the solid pink "Discard change" (41,460)–(349,493).
- [Should-fix] C-R10 · dirty 390 light and dark · the Terms textarea, split at y≈900 · half the textarea is washed and half is at rest strength, so the page reads as partly interactive while a modal is open. The overlay must cover the whole document.
- [Should-fix] C-R10 · submitting 1440, 834 and 390 light · Annual value input, 1440 (432,406)–(712,442) · its border and "48,000" stay at rest darkness while Vendor name, Owner, Status, Renewal date and Terms are dimmed. The spec asks for all fields read-only and dimmed alike.
- [Should-fix] C-R10 · loading, all widths and themes · 1440 under Renewal date (728,444)–(1008,480) and under Terms (432,668)–(1008,700) · the skeleton has no "Optional." helper rows, so the action bar sits at y≈735 in loading against y≈798 when loaded. states.md asks that skeletons copy the final layout.
- [Should-fix] C-R09 · empty, error, offline and invalid, every width · Renewal date control, 1440 (728,406)–(1008,442) · in light its border is visibly lighter than the input and select borders beside it; in dark it carries a raised fill the other controls lack. That is one rest state in two greys, and it reads as a button rather than a field (Shift Nudge: inputs should look alike at rest).
- [Should-fix] C-R04 · every key except loading, 1440 and 834, light and dark · Terms textarea text, 1440 (443,550)–(930,645) · five lines of clause text at about 14px by eye. Reading text should be at least 16px; 390 already renders it at 16px.
- [Should-fix] C-R04 · every key except loading, 390, light and dark · control text · "Halvorsen Freight" and "48,000" in the inputs render at about 16px, while "Ana Okafor", "Active" and "14 Mar 2027" in the select and date picker render at about 14px. That is two text sizes for the same role in one form.
- [Should-fix] P-A01 · every key, 390 vs 1440, light and dark · back navigation, 390 (16,115)–(150,135) · the 1440 breadcrumb "Records › Halvorsen Freight › Edit" becomes "‹ Halvorsen Freight", so "Records" and "Edit" disappear. D-P01 says width changes layout, never words. The spec's D-DEMO-20 asks for this, but a spec cannot lower the severity; settle the conflict in DESIGN.md.
- [Consider] C-R06 · offline 1440 and 834, light and dark · alert body, 1440 (475,212)–(940,250) · "Save is off until / you reconnect." wraps at about 935px, leaving an empty gutter about 70px wide where no action exists.
- [Consider] C-R06 · dirty 1440 and 834, light and dark · dialog, 1440 (496,369)–(944,531) · the title and description are centred while "Keep editing" and "Discard change" are right-aligned: two alignment axes in one small dialog.

Not covered: the default view without ?state= (both /demo/records/new and /edit, including the `new` artboard's empty fields with Status "Draft"); hover and active on every control; focus on anything except "Keep editing" (visible in dirty); live validation clearing an error; aria-busy and aria-disabled behaviour; the dialog's opacity transition and reduced motion; skeleton shimmer; measured contrast, especially the disabled Owner/Status labels and the italic "Not loaded" in partial, the dimmed text in submitting, and the dark destructive-solid; the date-picker popover; scroll behaviour under the dirty dialog at 390.
Reason: two Blocking C-R03 findings at dirty 390, light and dark: the dialog's scrim is clipped, so a full-strength solid Save shows beside the solid destructive confirm.
Verdict: FAIL

