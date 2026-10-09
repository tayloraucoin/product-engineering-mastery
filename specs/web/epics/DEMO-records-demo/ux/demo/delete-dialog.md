---
target: specs/web/ux/demo/delete-dialog.md
status: approved
promoted:
design:
  file: https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0
  page: p-1-0
  artboards:
    - "delete-dialog / confirm / 390 / light"
    - "delete-dialog / confirm / 390 / dark"
    - "delete-dialog / confirm / 1440 / light"
    - "delete-dialog / confirm / 1440 / dark"
    - "delete-dialog / deleting / 390 / light"
    - "delete-dialog / deleting / 390 / dark"
    - "delete-dialog / deleting / 1440 / light"
    - "delete-dialog / deleting / 1440 / dark"
    - "delete-dialog / error / 390 / light"
    - "delete-dialog / error / 390 / dark"
    - "delete-dialog / error / 1440 / light"
    - "delete-dialog / error / 1440 / dark"
    - "delete-dialog / partial / 390 / light"
    - "delete-dialog / partial / 390 / dark"
    - "delete-dialog / partial / 1440 / light"
    - "delete-dialog / partial / 1440 / dark"
    - "delete-dialog / offline / 390 / light"
    - "delete-dialog / offline / 390 / dark"
    - "delete-dialog / offline / 1440 / light"
    - "delete-dialog / offline / 1440 / dark"
  locked: 2026-10-08
---

# Delete dialog — demo

## Job

Stop a person from deleting the wrong record by accident, without slowing a deliberate delete. Done: the named record is gone and they are back on the table, or nothing happened. (judgment)

**Entry:** "Delete" on detail, reachable as `/demo/records/[id]?dialog=delete` (D-DEMO-4). **Exit:** confirm goes to `/demo/records?state=deleted`; cancel, Escape or the scrim returns to detail with focus on Delete.

## Layout and components

- Kit `alert-dialog` over the detail page, which renders as loaded (in `partial`, detail's `partial`, D-DEMO-18). Scrim: `--color-background` at 70%, dark tuned to dim as much (D-DEMO-16). No close button.
- **1440:** centred, `--container-md` wide, `--spacing-6` padding, `--radius-xl`, popover surface; title and body left-aligned; actions right-aligned: `button` outline "Cancel", then the confirm, solid destructive per P-2 (`[OFF-KIT P-2] Button / destructive solid`, D-DEMO-10), outermost (D-DEMO-21).
- **390:** still a centred modal, full width inside `--spacing-4` gutters; title and body centred; actions stacked full width, confirm on top.
- **Notices inside the dialog** (error, offline, partial): an icon and a text line under the body, never a bordered alert (D-DEMO-17). Error's icon and text use `--color-destructive`.
- **Deleting:** the confirm shows `spinner` and "Deleting" at its confirm width; both actions held.
- Settings' `reset` reuses this layout with its own words (D-DEMO-13).

## States

Cell `x`: `captures/delete-dialog/x-{390,1440}[-dark].png`.

| State    | Key        | What shows; what the person can do                                                                     | Artboard   |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| confirm  | (none)     | Names the record and what is lost; Cancel (focused), Delete record                                     | `confirm`  |
| deleting | `deleting` | Both actions held; the confirm reads "Deleting" with a spinner; Escape and scrim ignored               | `deleting` |
| error    | `error`    | The error line; the record untouched; Cancel, Retry delete                                             | `error`    |
| empty    | `empty`    | N/A: the dialog always names a record                                                                  | —          |
| loading  | `loading`  | N/A: the detail behind it loads first; `deleting` covers the wait                                      | —          |
| partial  | `partial`  | The name loaded, the terms did not; the body drops the version count; the line says the name is enough | `partial`  |
| offline  | `offline`  | Delete record disabled, the line says why; Cancel works                                                | `offline`  |

## Primary action

Delete record (destructive). Cancel is the default focus.

## Words

Gloss; canvas words except partial and offline (D-DEMO-18, D-DEMO-25).

- Title: "Delete <name>?", e.g. "Delete Halvorsen Freight?" (name from the records index, D-DEMO-20).
- Body: "The record, its terms and all 4 versions are removed. Demo data comes back when you reload." The count is the record's version total (D-DEMO-19); one version reads "its only version".
- Actions: "Cancel", "Delete record"; deleting "Deleting"; error "Retry delete".
- error: "Delete did not finish. Halvorsen Freight is unchanged. Retry, or cancel."
- partial: body "The record and its terms are removed. Demo data comes back when you reload."; line "The terms did not load. The name is enough to confirm."
- offline: "You are offline. Delete is off until you reconnect."

## Access

- `role="alertdialog"`, labelled by the title, described by the body. Focus is trapped; it starts on Cancel and returns to the Delete trigger on close.
- Escape and the scrim cancel, except while deleting.
- Deleting: both actions are `aria-disabled`, focus stays on the confirm, and a second press does nothing.
- The error line is `role="alert"`; offline Delete record is `aria-disabled` and described by its line.
- Motion: opacity only, in at 250ms, out at 200ms (motion tokens); opened by keyboard or with reduced motion, it appears at once (C-P11).

## Instrumentation

None (D-DEMO-24).

## Criteria

| ID                     | When                            | Then                                                                      | Evidence |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------- | -------- |
| C-DEMO-delete-dialog-1 | Delete on detail                | `?dialog=delete` is set, focus is on Cancel and stays inside the dialog   | test     |
| C-DEMO-delete-dialog-2 | Cancel, Escape or the scrim     | Detail stays, the record is unchanged, focus is on Delete                 | test     |
| C-DEMO-delete-dialog-3 | Delete record                   | `/demo/records?state=deleted` and the toast names the record              | test     |
| C-DEMO-delete-dialog-4 | `deleting`                      | A second press and Escape do nothing                                      | test     |
| C-DEMO-delete-dialog-5 | `offline`                       | Delete record is disabled and described; Cancel closes                    | test     |
| C-DEMO-delete-dialog-6 | `error`, then Retry delete      | The record was unchanged; the retry deletes it                            | test     |
| C-DEMO-delete-dialog-7 | `confirm` for Halvorsen Freight | The title names it and the body says "all 4 versions"                     | test     |
| C-DEMO-delete-dialog-8 | Each key                        | Renders at 390, 834 and 1440, light and dark, reduced motion, as captured | capture  |
| C-DEMO-delete-dialog-9 | Keyboard alone at 390           | Open, cancel, reopen, delete                                              | manual   |

## Decisions and open items

D-DEMO-4, 7, 10, 13, 16 to 21, 24, 25; P-2. Decided earlier: single confirm, no typed name; a dialog, not undo. None open.
