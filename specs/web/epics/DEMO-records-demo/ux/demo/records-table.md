---
target: specs/web/ux/demo/records-table.md
status: approved
promoted:
design:
  file: https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0
  page: p-1-0
  artboards:
    - "records-table / populated / 390 / light"
    - "records-table / populated / 390 / dark"
    - "records-table / populated / 1440 / light"
    - "records-table / populated / 1440 / dark"
    - "records-table / empty / 390 / light"
    - "records-table / empty / 390 / dark"
    - "records-table / empty / 1440 / light"
    - "records-table / empty / 1440 / dark"
    - "records-table / no-results / 390 / light"
    - "records-table / no-results / 390 / dark"
    - "records-table / no-results / 1440 / light"
    - "records-table / no-results / 1440 / dark"
    - "records-table / loading / 390 / light"
    - "records-table / loading / 390 / dark"
    - "records-table / loading / 1440 / light"
    - "records-table / loading / 1440 / dark"
    - "records-table / error / 390 / light"
    - "records-table / error / 390 / dark"
    - "records-table / error / 1440 / light"
    - "records-table / error / 1440 / dark"
    - "records-table / partial / 390 / light"
    - "records-table / partial / 390 / dark"
    - "records-table / partial / 1440 / light"
    - "records-table / partial / 1440 / dark"
    - "records-table / offline / 390 / light"
    - "records-table / offline / 390 / dark"
    - "records-table / offline / 1440 / light"
    - "records-table / offline / 1440 / dark"
    - "records-table / deleted / 390 / light"
    - "records-table / deleted / 390 / dark"
    - "records-table / deleted / 1440 / light"
    - "records-table / deleted / 1440 / dark"
  locked: 2026-10-08
---

# Records table — demo

## Job

Find one record among many by sorting and filtering, and open it. Done: the right record is open, or a new one started. (judgment)

**Entry:** `/demo` after onboarding; the shell's Records entry; detail's back link. **Exit:** a row opens `/demo/records/[id]`; "New record" opens the form.

## Layout and components

In the demo shell. The 1440 layout applies from `md` up; below, the 390 layout.

- **Header:** h1 "Records" (`--text-xl` semibold) over the subtitle (muted, both widths, D-DEMO-15); `button` default "New record" with a plus icon on the right.
- **Toolbar, 1440, one row:** `input` with a search icon ("Filter by vendor", 280px); `native-select` status; `native-select` owner; the count right-aligned (muted, tabular). **390:** search full width; the two selects 50/50; then the count left and a `native-select` "Sort" right (D-DEMO-14).
- **1440 table:** composed `data-table`, columns Vendor (medium), Owner (muted), Status, Annual value (USD) (right-aligned, tabular), Renews (muted, tabular), widths 3 : 2 : 1.33 : 1.67 : 2. Every header is a sort button; the sorted one shows its chevron, the rest show it on hover and focus. Row hover `--color-hover`. Default sort is the settings value (Vendor, A to Z).
- **Status** is a `badge`, word plus shape: Active (filled dot), Expiring (triangle, outline), Draft (dashed circle, outline), Terminated (cross, destructive tint).
- **390 list:** a `ul` of `item` rows that grow with wrapped text: vendor and badge, then "Tomas Reyes · 7,250 USD · renews 2 Nov 2026" (the columns as one line, the only wording change D-DEMO-15 allows).
- **Notices:** kit `alert`, between toolbar and table at both widths; `toast` for deleted; kit `empty` for both empties.
- URL: `?q=`, `?status=`, `?owner=`, `?sort=<column>-<asc|desc>`.

## States

Cell `x`: `captures/records-table/x-{390,1440}[-dark].png`.

| State          | Key          | What shows; what the person can do                                                                                 | Artboard     |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ | ------------ |
| populated      | (none)       | 40 records; filter, sort, open, New record                                                                         | `populated`  |
| empty          | `empty`      | Heading and subtitle; `empty` with one New record; no toolbar, count or header button                              | `empty`      |
| filtered empty | `no-results` | Filters kept, "0 of 40 records", the active filters in words; Clear filters                                        | `no-results` |
| loading        | `loading`    | Controls disabled with their labels; count and rows are skeletons at final size, no shimmer                        | `loading`    |
| error          | `error`      | No toolbar or table; destructive `alert` with Retry (solid, D-DEMO-22); New record outline                         | `error`      |
| partial        | `partial`    | Halvorsen Freight, Kestrel Cloud Hosting and Pellow Cleaning show "Not loaded" for Owner at every width; rows open | `partial`    |
| offline        | `offline`    | All rows readable, filters and sort work; New record `disabled`, the notice says why                               | `offline`    |
| deleted        | `deleted`    | The deleted row is gone, the count drops by one, a toast names it                                                  | `deleted`    |

## Primary action

New record (Retry on `error`). Opening a row is navigation, not a button.

## Words

Gloss; canvas words, 1440 wording at both widths.

- Header: "Records", "Vendor contracts, synthetic demo data", "New record". Count: "40 records"; filtered "12 of 40 records".
- Toolbar: "Filter by vendor", "All statuses", "All owners", "Sort". Sort options, each column both ways: "Vendor, A to Z", "Annual value, highest first", "Renews, soonest first", and their reverses.
- Cells: "Not set" (renewal), "Ended 1 Aug 2026", "Not loaded". At 390: "renewal not set", "ended 1 Aug 2026", "Owner not loaded".
- empty: "No records yet" / "Each record is one vendor contract: its owner, value, renewal date and terms."
- no-results: "No records match these filters" / "Vendor contains "Zephyr" and status is Terminated." (built from the active filters) / "Clear filters".
- error: "Records did not load" / "The demo data request failed. Retry, or reload the page." / "Retry".
- partial: "Some owners did not load" / "3 records show "Not loaded" for Owner. Those rows still open, and the rest of each record is complete."
- offline: "You are offline" / "These records are the last ones loaded and stay readable. New record is off until you reconnect."
- deleted toast: "<Vendor> deleted" / "Demo data resets when you reload." With the bare key, the fixture deletes Greyfold Security.

## Access

- A real `table` with a visually hidden caption "Records". Sort headers are buttons in `th` with `aria-sort`. The vendor cell is the row's link; a row click forwards to it. At 390 each row is one link named by its vendor.
- The count is `aria-live="polite"`. Clear filters returns focus to the search input.
- Error alert `role="alert"`; partial, offline and toast `role="status"`. Offline New record is `disabled` with `aria-describedby` on the notice.
- Sort and filter re-render in place with no motion (A-14). On `deleted`, focus goes to the h1.

## Instrumentation

None (D-DEMO-24).

## Criteria

| ID                     | When                                     | Then                                                                      | Evidence |
| ---------------------- | ---------------------------------------- | ------------------------------------------------------------------------- | -------- |
| C-DEMO-records-table-1 | A vendor, status or owner filter is set  | Rows and count update; the URL carries it; a reload restores it           | test     |
| C-DEMO-records-table-2 | A header (1440) or the Sort select (390) | Rows reorder; `aria-sort` and `?sort=` match                              | test     |
| C-DEMO-records-table-3 | A row is chosen                          | Its detail opens                                                          | test     |
| C-DEMO-records-table-4 | Clear filters on `no-results`            | All filters clear, "40 records", focus on search                          | test     |
| C-DEMO-records-table-5 | `offline`                                | New record is disabled and described by the notice; filters still work    | test     |
| C-DEMO-records-table-6 | `partial` at 390 and 1440                | The same three records show "Not loaded"; the notice gives the count      | test     |
| C-DEMO-records-table-7 | A delete is confirmed                    | `deleted`: row gone, count 39, the toast names the record                 | test     |
| C-DEMO-records-table-8 | Each key                                 | Renders at 390, 834 and 1440, light and dark, reduced motion, as captured | capture  |
| C-DEMO-records-table-9 | Keyboard alone at 390                    | Filter, sort and open a record                                            | manual   |

## Decisions and open items

D-DEMO-6, 14, 15, 16, 22, 24. Decided earlier: sort and filter in the URL; no pagination. None open.
