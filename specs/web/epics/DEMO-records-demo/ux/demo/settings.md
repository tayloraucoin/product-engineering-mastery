---
target: specs/web/ux/demo/settings.md
status: approved
promoted:
design:
  file: https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0
  page: p-1-0
  artboards:
    - "settings / populated / 390 / light"
    - "settings / populated / 390 / dark"
    - "settings / populated / 1440 / light"
    - "settings / populated / 1440 / dark"
    - "settings / saved / 390 / light"
    - "settings / saved / 390 / dark"
    - "settings / saved / 1440 / light"
    - "settings / saved / 1440 / dark"
    - "settings / empty / 390 / light"
    - "settings / empty / 390 / dark"
    - "settings / empty / 1440 / light"
    - "settings / empty / 1440 / dark"
    - "settings / loading / 390 / light"
    - "settings / loading / 390 / dark"
    - "settings / loading / 1440 / light"
    - "settings / loading / 1440 / dark"
    - "settings / error / 390 / light"
    - "settings / error / 390 / dark"
    - "settings / error / 1440 / light"
    - "settings / error / 1440 / dark"
    - "settings / partial / 390 / light"
    - "settings / partial / 390 / dark"
    - "settings / partial / 1440 / light"
    - "settings / partial / 1440 / dark"
    - "settings / offline / 390 / light"
    - "settings / offline / 390 / dark"
    - "settings / offline / 1440 / light"
    - "settings / offline / 1440 / dark"
  locked: 2026-10-08
---

# Settings — demo

## Job

Change how the records product behaves for you, and see it take. Done: the change applied and was confirmed. (judgment)

**Entry:** the shell's Settings entry. **Exit:** stays; "Replay onboarding" goes to `/demo/welcome`; "Reset demo data" opens its confirm (`reset`).

## Layout and components

Demo shell; one `--container-xl` column; the 1440 layout from `md` up.

- h1 "Settings", muted subtitle. Three groups, each an h2, divided by `separator`. At 1440 each control sits right of its label and helper; at 390 the theme group and both Demo buttons stack under the label, and the switch stays inline.
- **Display:** "Theme", `toggle-group` outline (System, Light, Dark), the same state as the shell's `theme-toggle`; "Compact rows", `switch`, which tightens table and list rows [ASSUMPTION: half the row's vertical padding].
- **Records:** "Default sort", `radio-group`, three options; the table's default order.
- **Demo:** "Onboarding" with `button` outline "Replay onboarding"; "Demo data" with `button` destructive (kit tint) "Reset demo data".
- No Save button: each control applies on change and a `toast` confirms it. Values are remembered client-side with onboarding completion (D-DEMO-3); theme is kept on the device.
- **Reset confirm** (D-DEMO-13): the delete dialog's `confirm` layout (see `delete-dialog.md`) with its own words; confirm is solid destructive (P-2). Reset restores the 40 records and undoes edits and deletes; settings stay.
- Notices are kit `alert` in the group they concern; offline sits above Display.

## States

Cell `x`: `captures/settings/x-{390,1440}[-dark].png`.

| State     | Key       | What shows; what the person can do                                                              | Artboard                                                      |
| --------- | --------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| populated | (none)    | All groups; every control works                                                                 | `populated`                                                   |
| saved     | `saved`   | Default sort changed to renewal date; the toast confirms                                        | `saved`                                                       |
| empty     | `empty`   | Defaults; the subtitle says nothing has changed (D-DEMO-23)                                     | `empty`                                                       |
| loading   | `loading` | Header real; groups as skeletons of each width's final layout                                   | `loading`                                                     |
| error     | `error`   | Default sort reverted; destructive `alert` under the radios with Retry                          | `error`                                                       |
| partial   | `partial` | Records group replaced by an `alert` with Retry; Display and Demo work                          | `partial`                                                     |
| offline   | `offline` | Theme and Replay onboarding work; Compact rows, Default sort, Reset disabled, rows dimmed whole | `offline`                                                     |
| reset     | `reset`   | The reset confirm over settings; Cancel, Reset data                                             | — built from `delete-dialog/confirm`; first captured at build |

## Primary action

None fixed: the control being changed. In `reset`, "Reset data".

## Words

Gloss; canvas words except offline (D-DEMO-23).

- Subtitle: "Changes apply as you make them."; empty "Nothing changed yet. These are the defaults, and changes apply as you make them."
- Display: "Theme" ("System follows your device."), "System", "Light", "Dark"; "Compact rows" ("Fits more records on screen.").
- Records: "Default sort": "Vendor name, A to Z", "Renewal date, soonest first", "Annual value, highest first".
- Demo: "Onboarding" ("See the three-step welcome again.") "Replay onboarding"; "Demo data" ("Put back the 40 sample records and undo your edits.") "Reset demo data".
- Toasts: "Default sort saved" / "Records now open sorted by renewal date."; "Theme saved" / "Dark is on."; "Compact rows saved" / "Rows are now compact."; "Demo data reset" / "40 sample records are back."
- error: "Default sort did not save" / "It is back to Vendor name, A to Z." / "Retry".
- partial: "Records settings did not load" / "Display and Demo settings still work." / "Retry".
- offline: "You are offline" / "Settings show as last saved. Theme and Replay onboarding still work; other changes are off until you reconnect."
- reset: "Reset demo data?" / "All 40 sample records come back, and your edits and deletes are undone. Settings stay as they are." / "Cancel", "Reset data".

## Access

- Groups are `section`s named by their h2. Theme is a radio-style group named "Theme"; Compact rows a `switch` described by its helper; Default sort a `fieldset` with legend "Default sort".
- A change keeps focus on its control; toasts are `role="status"`; the error `alert` is `role="alert"`.
- Offline-disabled controls are `disabled` and described by the notice.
- The reset dialog follows `delete-dialog.md` Access; closing returns focus to "Reset demo data".

## Instrumentation

None (D-DEMO-24).

## Criteria

| ID                | When                                        | Then                                                                                                                | Evidence |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| C-DEMO-settings-1 | Theme, Compact rows or Default sort changes | It applies at once, a toast names it, and it survives a reload                                                      | test     |
| C-DEMO-settings-2 | Default sort is renewal date                | The table opens sorted by renewal date                                                                              | test     |
| C-DEMO-settings-3 | Replay onboarding                           | `/demo/welcome` opens at beat 1                                                                                     | test     |
| C-DEMO-settings-4 | Reset demo data, then Reset data            | 40 records and their fixture values return; Cancel changes nothing                                                  | test     |
| C-DEMO-settings-5 | `offline`                                   | Theme and Replay work; the other three are disabled and described                                                   | test     |
| C-DEMO-settings-6 | `error`                                     | Default sort shows the previous value; Retry tries again                                                            | test     |
| C-DEMO-settings-7 | Each key                                    | Renders at 390, 834 and 1440, light and dark, reduced motion, as captured (`reset` against its delete-dialog frame) | capture  |
| C-DEMO-settings-8 | Keyboard alone at 390                       | Change each control and reset the data                                                                              | manual   |

## Decisions and open items

D-DEMO-3, 7, 13, 16, 23, 24; P-2. Decided earlier: instant apply, no Save; reset reuses the delete dialog. Earlier text called the primary "Save changes"; superseded. None open.
