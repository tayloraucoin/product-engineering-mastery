---
target: specs/web/ux/demo/record-detail.md
status: approved
promoted:
design:
  file: https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0
  page: p-1-0
  artboards:
    - "record-detail / populated / 390 / light"
    - "record-detail / populated / 390 / dark"
    - "record-detail / populated / 1440 / light"
    - "record-detail / populated / 1440 / dark"
    - "record-detail / diff / 390 / light"
    - "record-detail / diff / 390 / dark"
    - "record-detail / diff / 1440 / light"
    - "record-detail / diff / 1440 / dark"
    - "record-detail / no-history / 390 / light"
    - "record-detail / no-history / 390 / dark"
    - "record-detail / no-history / 1440 / light"
    - "record-detail / no-history / 1440 / dark"
    - "record-detail / empty / 390 / light"
    - "record-detail / empty / 390 / dark"
    - "record-detail / empty / 1440 / light"
    - "record-detail / empty / 1440 / dark"
    - "record-detail / loading / 390 / light"
    - "record-detail / loading / 390 / dark"
    - "record-detail / loading / 1440 / light"
    - "record-detail / loading / 1440 / dark"
    - "record-detail / error / 390 / light"
    - "record-detail / error / 390 / dark"
    - "record-detail / error / 1440 / light"
    - "record-detail / error / 1440 / dark"
    - "record-detail / not-found / 390 / light"
    - "record-detail / not-found / 390 / dark"
    - "record-detail / not-found / 1440 / light"
    - "record-detail / not-found / 1440 / dark"
    - "record-detail / partial / 390 / light"
    - "record-detail / partial / 390 / dark"
    - "record-detail / partial / 1440 / light"
    - "record-detail / partial / 1440 / dark"
    - "record-detail / offline / 390 / light"
    - "record-detail / offline / 390 / dark"
    - "record-detail / offline / 1440 / light"
    - "record-detail / offline / 1440 / dark"
    - "record-detail / saved / 390 / light"
    - "record-detail / saved / 390 / dark"
    - "record-detail / saved / 1440 / light"
    - "record-detail / saved / 1440 / dark"
  locked: 2026-10-08
---

# Record detail — demo

## Job

Read one record and its terms, and see exactly what changed between versions. Done: the reader knows the current terms and the last change. (judgment)

**Entry:** a row. **Exit:** the table; the form (Edit); the dialog (Delete, D-DEMO-4).

## Layout and components

Demo shell; one `--container-3xl` column; the 1440 layout from `md` up.

- **Back:** 1440 `breadcrumb` "Records › <name>"; 390 a back link "Records" with a chevron.
- **Title row:** h1 name (`--text-2xl` semibold), status `badge`; `button` default "Edit" and `button` destructive (kit tint) "Delete" (order D-DEMO-21; 390 stacks under the title, Edit wide).
- **Fields:** "Owner", "Annual value", "Renews", "Last change", label over value; one row at 1440, 2 × 2 at 390.
- **Terms:** h2 "Terms", muted subtitle, `toggle-group` outline "Current" / "Compare" (`?view=compare`; `?state=diff` renders it). The document: numbered clauses as paragraphs, base size, `--spacing-3` apart, separators above and below.
- **Diff, P-1 `[OFF-KIT] Diff / inline`,** the same at both widths: one row per clause, `--spacing-3` side padding; a fixed 16px glyph slot, then the text. Same: empty slot, foreground. Removed: mono "−", muted text, struck through. Added: mono semibold "+", medium foreground on `--color-muted`, `--radius-sm`. A changed clause is removed then added; a summary line follows.
- **History:** h2 "History", then `item` rows for every version, newest first (D-DEMO-19): 1440 one line ("Version N", summary, date and author right); 390 two lines.
- Notices: kit `alert` where the part failed; saved: `toast`.

## States

Cell `x`: `captures/record-detail/x-{390,1440}[-dark].png`.

| State          | Key          | What shows; what the person can do                                                  | Artboard     |
| -------------- | ------------ | ----------------------------------------------------------------------------------- | ------------ |
| populated      | (none)       | Version 4, five clauses, four versions; Edit, Delete, Compare                       | `populated`  |
| diff           | `diff`       | Compare on: version 4 against 3, then the summary                                   | `diff`       |
| single version | `no-history` | Version 1 only; Compare disabled, the subtitle says why                             | `no-history` |
| empty          | `empty`      | Kit `empty` for the document, no toggle; history says none yet                      | `empty`      |
| loading        | `loading`    | Every block a skeleton at final size, toggle and history too                        | `loading`    |
| error          | `error`      | 1440 back names the record (D-DEMO-20); destructive `alert`: Retry, Back to records | `error`      |
| not found      | `not-found`  | Breadcrumb "Not found"; heading, body, outline Back to records                      | `not-found`  |
| partial        | `partial`    | Fields and history; an `alert` with Retry for the document; Compare disabled        | `partial`    |
| offline        | `offline`    | Readable; Edit, Delete disabled; `alert` above Terms                                | `offline`    |
| saved          | `saved`      | Annual value 52,000 USD, Last change "Just now by you", a toast                     | `saved`      |

## Primary action

Edit; Delete is secondary.

## Words

Gloss; canvas words, 1440 wording (D-DEMO-15).

- Last change: "3 days ago by Ana Okafor".
- Subtitles: "Version 4, current since 5 Oct 2026"; diff "Version 4 (current) compared with version 3", summary "2 clauses changed, 1 added"; no-history "Version 1, the only version. Compare needs two."; partial "Version 4. Compare needs the terms."
- History: "Version 4" "Payment to 45 days, notice to 60 days, fuel surcharge added" "5 Oct 2026, Ana Okafor"; "Version 3" "Liability cap set to annual value" "12 Aug 2026, Tomas Reyes"; "Version 2" "Services limited to the two depots" "3 Feb 2026, Tomas Reyes"; "Version 1" "First version of the terms" "14 Mar 2025, Ana Okafor".
- empty: "No terms yet" / "Add the contract terms with Edit. Each save keeps a version you can compare." History: "No versions yet. The first save of terms creates version 1."
- error: "This record did not load" / "The demo data request failed. Retry, or go back to records." / "Retry", "Back to records".
- not-found: "No record with this link" / "Nothing matches rec_9f2c. It may have been deleted, and demo data resets when you reload." / "Back to records".
- partial: "The terms document did not load" / "The record's fields are complete and you can still edit them." / "Retry".
- offline: "You are offline" / "This record stays readable. Edit and Delete are off until you reconnect."
- saved toast: "Halvorsen Freight saved" / "Annual value updated. Terms are unchanged, so no new version."

## Access

- Breadcrumb: `nav` "Breadcrumb". Toggle group name: "Terms view".
- Diff rows are `del` and `ins`, each with a visually hidden "Removed:" or "Added:"; the glyph is `aria-hidden`. Glyph and strike mark change, never colour alone (C-P07).
- Disabled Compare, Edit, Delete: `aria-disabled`, described by subtitle or notice.
- Saved: toast `role="status"`, focus on the h1. A closed dialog returns focus to Delete.

## Instrumentation

None (D-DEMO-24).

## Criteria

| ID                     | When                        | Then                                                                      | Evidence |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------- | -------- |
| C-DEMO-record-detail-1 | Compare is chosen           | Version 4 against 3 shows; the URL has `?view=compare`; Current returns   | test     |
| C-DEMO-record-detail-2 | The diff renders            | Rows are `del`/`ins` with "Removed:"/"Added:"; glyphs `aria-hidden`       | test     |
| C-DEMO-record-detail-3 | `no-history` or `partial`   | Compare is disabled and described                                         | test     |
| C-DEMO-record-detail-4 | Halvorsen Freight opens     | History lists versions 4 to 1, newest first                               | test     |
| C-DEMO-record-detail-5 | `offline`                   | Edit and Delete are disabled and described by the notice                  | test     |
| C-DEMO-record-detail-6 | Edit; Delete; an unknown id | The edit route; `?dialog=delete`; `not-found`                             | test     |
| C-DEMO-record-detail-7 | Each key                    | Renders at 390, 834 and 1440, light and dark, reduced motion, as captured | capture  |
| C-DEMO-record-detail-8 | Keyboard alone at 390       | Compare, Current, Edit, Delete, cancel                                    | manual   |

## Decisions and open items

D-DEMO-4, 6, 15, 16, 19, 20, 21, 24, 25; P-1, P-4. Decided earlier: inline diff; default compares current with the one before. None open.
