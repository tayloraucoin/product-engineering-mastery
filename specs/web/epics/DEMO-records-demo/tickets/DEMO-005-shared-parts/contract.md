---
id: DEMO-5
size: small
objective: "The three demo parts more than one surface wears exist once: the status badge (word plus shape), the P-1 Diff, and the confirm-dialog layout the delete dialog and the reset confirm share."
slice_type: "Shared presentational components inside one section; the risk is meaning by colour alone, a diff a screen reader cannot follow, or a confirm layout that breaks focus or the scrim."
non_negotiables:
  - "Status badge is a kit badge with word plus shape: Active filled dot, Expiring triangle outline, Draft dashed circle outline, Terminated cross destructive tint; never colour alone."
  - 'Diff renders one row per clause with a fixed 16px glyph slot: same empty slot; removed mono "−", muted, struck through, as del with hidden "Removed:"; added mono semibold "+" on --color-muted, --radius-sm, as ins with hidden "Added:"; glyphs aria-hidden; whole clauses only (P-4).'
  - "The confirm dialog is the kit alert-dialog with no close button: --container-md, --spacing-6 padding, --radius-xl at 1440; full width inside --spacing-4 gutters, centred text and stacked actions with the confirm on top at 390."
  - "The confirm is primary first in DOM and focus order, outermost at 1440 (D-DEMO-21), and wears DEMO-2's solid destructive variant; Cancel is the initial focus; the scrim is --color-background at 70%, dimming as much in dark."
  - "In-dialog notices are an icon and a text line, never a bordered alert (D-DEMO-17)."
  - "A pending confirm keeps its width; motion is opacity only, 250ms in and 200ms out on motion tokens, instant with reduced motion or a keyboard open."
devs_call: "Props shape, file split inside each part, and whether the Diff takes rows or two clause lists."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-10"
  - "D-DEMO-15"
  - "D-DEMO-16"
  - "D-DEMO-17"
  - "D-DEMO-21"
  - "P-1"
truth_files: "none: these parts render inside the surfaces, whose tickets carry the truth files"
qa: Q2
reviewers:
  - assay
focus:
  - "The Diff's accessible reading: del and ins with hidden labels, glyphs hidden, never colour alone (assay, Q2)"
operator_review: false
planned_paths:
  - "apps/web/app/demo/_components/status-badge.tsx"
  - "apps/web/app/demo/_components/diff.tsx"
  - "apps/web/app/demo/(shell)/_components/confirm-dialog.tsx"
depends_on:
  - DEMO-1
  - DEMO-2
out_of_scope:
  - "Where each part is used and its words: DEMO-7, DEMO-8, DEMO-9, DEMO-11, DEMO-12."
  - "Word-level marks inside a clause (P-4): out of bounds in this epic."
criteria:
  - id: C1
    statement: 'Halvorsen 4 against 3 renders in the Diff as del and ins rows with "Removed:" and "Added:" read aloud and no glyph in the accessibility tree.'
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-005-shared-parts/evidence/diff-a11y.txt"
  - id: C2
    statement: "All four badges, the Diff and the confirm dialog render at 390 and 1440, light and dark, matching the record-detail, records-table and delete-dialog captures."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-005-shared-parts/evidence/parts.png"
  - id: C3
    statement: "The token lint passes on the three parts."
    evidence: check
    command: "yarn lint"
---

# Contract — DEMO-5 shared-parts

## Build notes

- **Approach:** Three components placed by their importers (`technical/placement.md`): badge and Diff in `app/demo/_components/` (table, detail, welcome), confirm dialog in `(shell)/_components/` (detail, settings). The Diff takes DEMO-1's `diffClauses` output. Render C1 and C2 on a scratch page under the builder's control, never a shipped route, or wait for the first surface to mount them.
- **Decisions that apply:**
  - D-DEMO-10: "A live dialog's destructive confirm is solid (P-2); page triggers keep the tint."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-17: "A notice inside a dialog is an icon and a text line, never a bordered alert. (A-10)"
  - D-DEMO-21: "The primary is first in DOM and focus order; at 1440 the row is reversed and right-aligned (primary outermost), at 390 stacked on top."
  - P-1 and R3 (technical.md): build the Diff here, ruled a product primitive in `apps/web/docs/design/components.md`; whole clauses only.
- **Interfaces:** `StatusBadge({ status })`; `Diff({ rows })`; `ConfirmDialog({ open, title, body, notice, confirmLabel, pendingLabel, pending, confirmDisabled, onConfirm, onCancel })`, with Escape and the scrim ignored while pending.
- **Per path:** one file each, as planned.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; the Diff is `[OFF-KIT] Diff / inline` and the confirm `[OFF-KIT P-2] Button / destructive solid`. Captures: `ux/demo/captures/record-detail/diff-*`, `delete-dialog/confirm-*`, `records-table/populated-*`.
  - Focus returns to the trigger on close; the dialog owner passes the trigger ref.
  - No `Date.now()` or random ids in render; use React's `useId`.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to colour the diff rows without `del`/`ins` or hidden labels, which reads as colour alone (C-P07).
