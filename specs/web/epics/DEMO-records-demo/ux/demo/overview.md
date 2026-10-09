---
target: specs/web/ux/demo/overview.md
status: approved
promoted:
---

# Demo — overview

## Frame

A skeptical evaluator (1440 laptop, 390 spot-check) with an afternoon walks a small records product: find, read what changed, edit, set, delete, onboard, flipping `?state=`, dark and reduced motion. Taylor walks it to measure PEM v1 before Synapse. Synthetic fixtures only. (judgment, brief)

## Routes and surfaces

| #   | Route                                          | Surface            | Entry                         | Exit                              |
| --- | ---------------------------------------------- | ------------------ | ----------------------------- | --------------------------------- |
| 1   | `/demo/welcome`                                | `onboarding.md`    | `/demo` first visit; settings | `/demo/records`                   |
| 2   | `/demo/records`                                | `records-table.md` | `/demo`; nav; detail back     | detail (row), form (New record)   |
| 3   | `/demo/records/[id]`                           | `record-detail.md` | a row                         | table, form (Edit), delete dialog |
| 4   | `/demo/records/new`, `/demo/records/[id]/edit` | `record-form.md`   | New record; Edit              | detail (saved), origin (cancel)   |
| 5   | `/demo/records/[id]?dialog=delete`             | `delete-dialog.md` | detail Delete                 | table (deleted), detail (cancel)  |
| 6   | `/demo/settings`                               | `settings.md`      | nav                           | stays; onboarding (replay)        |

`/demo` renders nothing: it redirects to `/demo/welcome` until onboarding is finished or skipped, then to `/demo/records`. Every route takes `?state=empty|loading|error|partial|offline` plus its own keys. Home gets one text link to `/demo` (D-DEMO-2).

## Navigation and shell

Every `/demo` route but onboarding has the demo shell (D-DEMO-5): a 56px top bar with a bottom border, side padding `--spacing-8` (1440) or `--spacing-4` (390). Left: "Records demo" (sm semibold, not a link), then nav "Records" and "Settings". Right at 1440: "Back to PEM" (muted text link to `/`) and the composed `theme-toggle`. At 390 the toggle follows the nav and "Back to PEM" is an underlined foot link at the end of `main`, in every state (D-DEMO-16). The current entry takes the `--color-muted` pill and `aria-current="page"` (C-P07). The nav is a `nav` named "Demo"; content is `main`; a "Skip to content" link comes first. Toasts: kit `toast`, bottom-right at 1440, full width at 390, no action.

## Design

Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0` (kit page `Components`), locked 2026-10-08 by Taylor: every state at 390 and 1440, light and dark, captured as `captures/<surface>/<state>-<width>[-dark].png`. Critic round 3 had no black or red.

## Decision log

All 2026-10-08. 12 to 14: Taylor's handoff rulings; 15 to 25 settle critic amber and green.

- **D-DEMO-1** Scope is P-C parts 1 to 6; this area is part 1. (brief)
- **D-DEMO-2** Every route under `/demo`; home gets one text link. (brief)
- **D-DEMO-3** Onboarding completion is remembered client-side; no account.
- **D-DEMO-4** The delete dialog is `?dialog=delete` on detail. (C-P08)
- **D-DEMO-5** The demo has its own shell, not the admin sidebar.
- **D-DEMO-6** Records are synthetic vendor contracts with versioned terms.
- **D-DEMO-7** Writes are fixture-local and reset on reload (keeps tickets below Q3).
- **D-DEMO-8** Direction A: top bar, one centred column, inline diff, history below. Taylor.
- **D-DEMO-9** Dark drawn per artboard: Paper tokens have no modes.
- **D-DEMO-10** A live dialog's destructive confirm is solid (P-2); page triggers keep the tint.
- **D-DEMO-11** Onboarding's illustrated dialog is inert and keeps the tint. (C-R02)
- **D-DEMO-12** Onboarding skip is hidden wherever the primary already goes to records (beat-3, empty, error). Canvas over intent; Taylor.
- **D-DEMO-13** Settings "Reset demo data" confirm is key `reset`, built from the delete-dialog confirm artboards with its own words; first captured at build. Taylor.
- **D-DEMO-14** At 390 the table's sort line is a kit `native-select` named "Sort". Intent over canvas; Taylor.
- **D-DEMO-15** One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only.
- **D-DEMO-16** The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens.
- **D-DEMO-17** A notice inside a dialog is an icon and a text line, never a bordered alert. (A-10)
- **D-DEMO-18** Delete-dialog `partial` sits over detail `partial` (terms not loaded), and its words say so.
- **D-DEMO-19** History lists every version, newest first; the Halvorsen Freight fixture has four.
- **D-DEMO-20** A record's name comes from the records index; only the body loads, so a loading or failed record can be named.
- **D-DEMO-21** The primary is first in DOM and focus order; at 1440 the row is reversed and right-aligned (primary outermost), at 390 stacked on top.
- **D-DEMO-22** On the table's `error`, Retry is the solid primary and New record drops to outline. (C-P02)
- **D-DEMO-23** Settings `empty` holds (the canvas draws defaults with a note); offline words name everything that still works.
- **D-DEMO-24** No product events: the brief's signal is a pass list, no metric ID; analytics is a stub.
- **D-DEMO-25** Gloss's word fixes on the canvas are listed in each file's Words.
- **P-1 [PROPOSED, to Plumb]** `Diff` primitive: anatomy in `record-detail.md`. Drawn off-kit (`[OFF-KIT] Diff / inline`).
- **P-2 [PROPOSED, to Plumb]** A solid destructive button variant for a dialog's confirm; `@pem/ui` `destructive` is a tint only.
- **P-3 [PROPOSED, to Plumb]** Record why Geist is `--font-sans`, or choose another face. (near A-01)
- **P-4 [PROPOSED, to Plumb]** Whether the Diff marks changed words inside a clause.
- **P-5 [PROPOSED, to Plumb]** A rubric line: one state keeps the same content and words across breakpoints (D-DEMO-15).

## Open

None.
