# Tier 1 batch review: STK-23, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5), summarised by finding; the full reply is in the session transcript. It was given the contract, the cited `technical.md`, the as-built, the changed files, STK-22's folder and review, STK-8's coverage walker and both reference repos. It had no shell, so it judged the code by reading. What was done about each finding is under "Disposition".

---

## STK-23 (ui-kind-guide), tier 1 review

Verdict: **Pass with conditions.** No blocking issues; C1 to C3 hold on reading. The defect is in the guidance: on overlays, rows, cards and timestamps the tie-breaks contradict their own examples and the reference repos.

### Should-fix

1. **"Every overlay is feedback"** contradicts the layout READMEs, the table and both repos, which file sheet and drawer under layout and `ellipses-menu` under control.
2. **"A row clickable as a whole is control"** contradicts the cited display example `list-row`, which in Synapse takes `href`/`onClick`.
3. **"A card is layout"** contradicts the cited display example `insight-card`; Conscious Connections files every composed card under display.
4. **`timestamp`** is cited as typography, though the same README makes value-formatting text display, and Conscious Connections' `timestamp` imports `text`, which the primitive rule rejects.
5. **Most reference primitives, ported as they are, fail the primitive import rule** (input imports label, dialog imports button, sidebar imports six siblings), and nothing says what to do.
6. **Examples not in either repo** (`heading`, `breadcrumb`, `image`) are presented as from the audited repos.

### Notes

7. The `empty` pick holds only at the composed layer; both repos keep the `empty` primitive in display, and the display README's line would pull skeleton and alert out of display.
8. `image-cropper` is cited as media; Synapse files it under control.
9. Layout is defined as holding "no content of its own", but `error-page` and `success-screen` carry copy.
10. Duplicate table rows pass (set comparison).
11. A missing folder and a missing README give the same message; the as-built says three classes and lists two.
12. A group-level `README.md` would be rejected as "not a kind".
13. The README test case repeats the conforming-tree case.
14. `yarn budget` sizes only apps' nested `AGENTS.md`; the larger `packages/ui/AGENTS.md` may exceed the path-rules line unmeasured.
15. Tailwind's `@source "../"` scans the READMEs.
16. "Adding a component" doesn't say to add the new component to its kind README's examples.

## Disposition

- **S1, S2, S3, N7, N9:** fixed. The tie-breaks now read the same in `AGENTS.md` and every README: an overlay that informs or confirms is feedback, a panel that slides in is layout, a composed menu with its trigger is control; a row whose only job is to be chosen is control, a data row display even when it links; the bare card is layout, a data card display; the bare `empty` slot is display, a composed empty state feedback; skeleton and inline alert stay display. Layout's composed scope says it may carry a screen's copy.
- **S4:** fixed. `timestamp` and `heading` are gone from typography; text that formats a value is display.
- **S5:** fixed by relaxing STK-22's rule: a primitive may import another primitive, never a composed component; stories are exempt. Neither repo has a non-story primitive importing a composed one. A test covers the allowed case.
- **S6, N8:** fixed. Every example is tagged (S), (CC) or both and was checked by script against both trees and their kind folders; `tabs` is (S) only, `card` left the display examples, `image-cropper` moved to control.
- **N11:** fixed: a missing folder and a missing README have their own messages, and each has its own test.
- **N13:** the duplicate case was replaced (as-built, Test changes).
- **N14:** fixed. `tooling/budget.ts` counts nested `AGENTS.md` in `packages/`; `packages/ui/AGENTS.md` was cut to about 810 tokens, leaving examples to the READMEs. The line is 1,456 of 1,500.
- **N16:** fixed: step 5 adds the component to its kind README's examples.
- **N10, N12, N15:** carried. Duplicates are harmless, no layer README is planned, and the READMEs add a few unused utility classes at most.
