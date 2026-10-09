---
target: specs/web/ux/demo/record-form.md
status: approved
promoted:
design:
  file: https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0
  page: p-1-0
  artboards:
    - "record-form / new / 390 / light"
    - "record-form / new / 390 / dark"
    - "record-form / new / 1440 / light"
    - "record-form / new / 1440 / dark"
    - "record-form / edit / 390 / light"
    - "record-form / edit / 390 / dark"
    - "record-form / edit / 1440 / light"
    - "record-form / edit / 1440 / dark"
    - "record-form / invalid / 390 / light"
    - "record-form / invalid / 390 / dark"
    - "record-form / invalid / 1440 / light"
    - "record-form / invalid / 1440 / dark"
    - "record-form / submitting / 390 / light"
    - "record-form / submitting / 390 / dark"
    - "record-form / submitting / 1440 / light"
    - "record-form / submitting / 1440 / dark"
    - "record-form / empty / 390 / light"
    - "record-form / empty / 390 / dark"
    - "record-form / empty / 1440 / light"
    - "record-form / empty / 1440 / dark"
    - "record-form / loading / 390 / light"
    - "record-form / loading / 390 / dark"
    - "record-form / loading / 1440 / light"
    - "record-form / loading / 1440 / dark"
    - "record-form / error / 390 / light"
    - "record-form / error / 390 / dark"
    - "record-form / error / 1440 / light"
    - "record-form / error / 1440 / dark"
    - "record-form / partial / 390 / light"
    - "record-form / partial / 390 / dark"
    - "record-form / partial / 1440 / light"
    - "record-form / partial / 1440 / dark"
    - "record-form / offline / 390 / light"
    - "record-form / offline / 390 / dark"
    - "record-form / offline / 1440 / light"
    - "record-form / offline / 1440 / dark"
    - "record-form / dirty / 390 / light"
    - "record-form / dirty / 390 / dark"
    - "record-form / dirty / 1440 / light"
    - "record-form / dirty / 1440 / dark"
  locked: 2026-10-08
---

# Record form — demo

## Job

Create a record or change one, with validation that says what is wrong before it costs anything. Done: the record is saved and the person sees it. (judgment)

**Entry:** "New record" (`/demo/records/new`); "Edit" (`/demo/records/[id]/edit`). **Exit:** save goes to detail `saved`; cancel goes back where they came from.

## Layout and components

Demo shell; one `--container-xl` column; the 1440 layout from `md` up.

- **Back:** 1440 `breadcrumb` "Records › New record" or "Records › <name> › Edit"; 390 a back link to "Records" or "<name>". h1 "New record" or "Edit <name>" (D-DEMO-20).
- **Fields,** kit `field` with `label`, errors below the control: Vendor name (`input`, full width); Owner and Status (`native-select`, side by side); Annual value (USD) (`input`, right-aligned, tabular, `inputmode="numeric"`) and Renewal date (composed `date-picker`), side by side; Terms (`textarea`, 160px minimum). 390 stacks all.
- **Rules:** Vendor name, Owner and Annual value (a whole number, 0 or more) are required; Renewal date and Terms are optional. New defaults: Status "Draft", the rest empty.
- **Error summary:** destructive `alert` at the top of the fields; each named field is a link to it.
- **Actions:** 1440 under a top border, right-aligned: `button` ghost "Cancel", `button` default "Save" (D-DEMO-21). 390 full width, Save on top. Not sticky.
- **Dirty dialog:** `alert-dialog`, `--container-md`: outline "Keep editing", solid destructive "Discard change" (P-2, D-DEMO-10).

## States

Cell `x`: `captures/record-form/x-{390,1440}[-dark].png`.

| State      | Key               | What shows; what the person can do                                                    | Artboard     |
| ---------- | ----------------- | ------------------------------------------------------------------------------------- | ------------ |
| new        | (none on `/new`)  | Empty fields, Status Draft                                                            | `new`        |
| edit       | (none on `/edit`) | Fields from the record                                                                | `edit`       |
| invalid    | `invalid`         | Summary and two field errors; input kept; Save stays enabled                          | `invalid`    |
| submitting | `submitting`      | Fields read-only and dimmed, Cancel disabled, Save pending with a spinner, same width | `submitting` |
| empty      | `empty`           | Edit with no terms: Terms blank, its helper says so                                   | `empty`      |
| loading    | `loading`         | Edit: h1 real; labels as text, controls as skeletons; Save disabled, Cancel works     | `loading`    |
| error      | `error`           | Input kept; destructive `alert` above the actions; primary "Retry save"               | `error`      |
| partial    | `partial`         | `alert` with Retry at top; Owner and Status disabled, "Not loaded"; Save disabled     | `partial`    |
| offline    | `offline`         | `alert` at top; fields editable, input kept in the page; Save disabled                | `offline`    |
| unsaved    | `dirty`           | Leaving with changes opens the dirty dialog                                           | `dirty`      |

## Primary action

Save ("Retry save" on `error`).

## Words

Gloss; canvas words except as noted (D-DEMO-25).

- Labels and placeholders: "Vendor name" ("The vendor's trading name"), "Owner" ("Choose an owner"), "Status", "Annual value (USD)" (no placeholder: the canvas's muted "0" read as a value), "Renewal date" ("Pick a date", helper "Optional."), "Terms" ("Type or paste the clauses, one per line").
- Terms helper: new "Optional. Saving with terms creates version 1."; edit "Optional. Each save keeps a version you can compare."; empty "Optional. This record has no terms yet; saving with terms creates version 1."
- Errors: "Enter the vendor's name.", "Choose an owner.", "Enter a value of 0 or more."
- Summary: "2 fields need a change before saving" / "Vendor name and Annual value. Nothing you entered is lost." (count and names built).
- submitting: "Saving". error: "Save did not finish" / "Your changes are still here. Retry the save, or cancel to leave them." / "Retry save".
- partial: "Owner and Status did not load" / "Save is held until they load, so nothing is overwritten." / "Retry"; field value "Not loaded".
- offline: "You are offline" / "Your changes stay on this page until you leave or reload. Save is off until you reconnect." (was "stay on this device", against D-DEMO-7).
- dirty: "Leave without saving?" / "You changed Annual value. Leaving discards that change." (several: "You changed 2 fields. Leaving discards those changes.") / "Keep editing", "Discard change".

## Access

- Each control has its `label`; an error is `aria-describedby` with `aria-invalid`.
- Validation runs on submit first, then live on a field once it has erred. A failed submit moves focus to the summary (`role="alert"`, `tabindex="-1"`). No shake (A-13).
- Submitting: the form is `aria-busy`; Save is `aria-disabled`, so a second press does nothing.
- Disabled Save and the partial selects are described by the notice.
- The dirty dialog opens for in-app leaving (Cancel, back, nav); focus starts on "Keep editing"; Escape keeps editing. Reload or close uses the browser's own `beforeunload`.

## Instrumentation

None (D-DEMO-24).

## Criteria

| ID                   | When                          | Then                                                                      | Evidence |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------- | -------- |
| C-DEMO-record-form-1 | Save on an empty new form     | Summary has focus, three field errors show, nothing typed is lost         | test     |
| C-DEMO-record-form-2 | An erred field is corrected   | Its error clears without another submit                                   | test     |
| C-DEMO-record-form-3 | Save is pressed twice quickly | One save happens                                                          | test     |
| C-DEMO-record-form-4 | A valid save                  | Detail `saved` opens; changed terms add a version                         | test     |
| C-DEMO-record-form-5 | Leaving with changes          | The dialog opens; Keep editing returns; Discard leaves                    | test     |
| C-DEMO-record-form-6 | `partial`; `offline`          | Save is disabled and described; offline input stays editable              | test     |
| C-DEMO-record-form-7 | Each key                      | Renders at 390, 834 and 1440, light and dark, reduced motion, as captured | capture  |
| C-DEMO-record-form-8 | Keyboard alone at 390         | Fill, fix an error, save                                                  | manual   |

## Decisions and open items

D-DEMO-7, 10, 16, 20, 21, 24, 25; P-2. Decided earlier: validate on submit, then live per erred field. None open.
