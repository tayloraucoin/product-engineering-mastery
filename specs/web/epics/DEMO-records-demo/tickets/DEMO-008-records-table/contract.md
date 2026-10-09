---
id: DEMO-8
size: small
objective: "An evaluator finds one record among 40 by filtering and sorting a dense table (a list at 390), opens it or starts a new one, and every table state is reachable by ?state=."
slice_type: "A data table with URL-held filter and sort; the risk is URL and UI drifting apart, sort semantics a screen reader cannot hear, or a state that changes words between widths."
non_negotiables:
  - '1440 is a real table with a visually hidden caption "Records"; every header is a sort button in its th with aria-sort; the vendor cell is the row''s link. 390 is a ul of item rows, each one link named by its vendor, with the Sort native-select (D-DEMO-14).'
  - "?q, ?status, ?owner and ?sort are parsed in records/_lib/query.ts and changed with router.replace; an invalid value reads as absent; an absent sort reads the prefs cookie's default on the server, so there is no flash."
  - "The count is aria-live polite; Clear filters clears all three and returns focus to the search input; sort and filter re-render in place with no motion (A-14)."
  - "On error Retry is the solid primary and New record drops to outline (D-DEMO-22); on offline New record is disabled with aria-describedby on the notice."
  - 'partial shows "Not loaded" for Owner on Halvorsen Freight, Kestrel Cloud Hosting and Pellow Cleaning; deleted shows the store''s lastEvent, else Greyfold Security, and focus goes to the h1.'
  - "Status is DEMO-5's badge; Compact rows (prefs) halves each row's vertical padding [ASSUMPTION carried from settings.md]."
  - "Words are records-table.md's Words verbatim at both widths; the 390 one-line meta is the only wording change."
devs_call: "The table's composition from the kit data-table, the list row layout within the captures, and query.ts's internal shape."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/records-table.md"
  - "D-DEMO-14"
  - "D-DEMO-15"
  - "D-DEMO-22"
  - "C-DEMO-records-table-1"
  - "C-DEMO-records-table-2"
  - "C-DEMO-records-table-3"
  - "C-DEMO-records-table-4"
  - "C-DEMO-records-table-5"
  - "C-DEMO-records-table-6"
  - "C-DEMO-records-table-7"
  - "C-DEMO-records-table-8"
  - "C-DEMO-records-table-9"
truth_files: "none: the approved proposal ux/demo/records-table.md reaches specs/web/ux/demo/records-table.md through yarn truth:promote DEMO once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/demo/(shell)/records/page.tsx"
  - "apps/web/app/demo/(shell)/records/_components/table/**"
  - "apps/web/app/demo/(shell)/records/_lib/query.ts"
  - "apps/web/app/demo/(shell)/records/_lib/query.test.ts"
  - "apps/web/lib/demo/surfaces/records-table.ts"
  - "apps/web/e2e/demo/records-table.spec.ts"
depends_on:
  - DEMO-4
  - DEMO-5
  - DEMO-6
out_of_scope:
  - "The delete flow that leads to deleted: DEMO-12. Pagination and real latency: out of bounds (D-DEMO-7)."
criteria:
  - id: C1
    statement: 'query.ts parses and rebuilds every filter and sort, reads invalid values as absent, and builds "Vendor contains "Zephyr" and status is Terminated." and "12 of 40 records".'
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "Setting a vendor, status or owner filter updates rows and count, puts it in the URL, and a reload restores it."
    evidence: test
    command: "yarn web:e2e e2e/demo/records-table.spec.ts"
  - id: C3
    statement: "A header at 1440 or the Sort select at 390 reorders rows with aria-sort and ?sort= matching; with the prefs default renews-asc and no ?sort= the table opens soonest renewal first."
    evidence: test
    command: "yarn web:e2e e2e/demo/records-table.spec.ts"
  - id: C4
    statement: "Choosing a row, by its link or anywhere on the row, opens /demo/records/<id>."
    evidence: test
    command: "yarn web:e2e e2e/demo/records-table.spec.ts"
  - id: C5
    statement: 'Clear filters on no-results clears all filters, shows "40 records" and focuses the search input.'
    evidence: test
    command: "yarn web:e2e e2e/demo/records-table.spec.ts"
  - id: C6
    statement: 'On offline New record is disabled and described by the notice, and filters still work; on partial the same three records show "Not loaded" at 390 and 1440 and the notice says 3.'
    evidence: test
    command: "yarn web:e2e e2e/demo/records-table.spec.ts"
  - id: C7
    statement: "On deleted the record is gone, the count reads 39, the toast names it and focus is on the h1."
    evidence: test
    command: "yarn web:e2e e2e/demo/records-table.spec.ts"
  - id: C8
    statement: "Every records-table key renders at 390, 834 and 1440, light and dark, reduced motion, matching its captures."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-008-records-table/evidence/states.png"
  - id: C9
    statement: "With keyboard alone at 390 a person filters, sorts and opens a record."
    evidence: manual
    reason: "A keyboard journey at phone width is judged by a person at Seen."
---

# Contract — DEMO-8 records-table

## Build notes

- **Approach:** `records/page.tsx` (server) reads `searchParams` and the prefs cookie, resolves the key and the query, and passes them to a client view; the view filters and sorts the store's index. `e2e/demo/records-table.spec.ts` names tests by criterion id; its run output is the evidence for C2 to C7. At start, before `contract:init` freezes the criteria, re-point those criteria to `evidence: test` with `command: "yarn web:e2e e2e/demo/records-table.spec.ts"` (Taylor, Tickets gate, 2026-10-08); the script exists by then (DEMO-6).
- **Decisions that apply:**
  - D-DEMO-14: "At 390 the table's sort line is a kit `native-select` named "Sort". Intent over canvas; Taylor."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-22: "On the table's `error`, Retry is the solid primary and New record drops to outline. (C-P02)"
- **Interfaces:** `/demo/records?q=&status=&owner=&sort=<column>-<asc|desc>&state=`; `parseRecordsQuery`, `buildFilterWords` in `query.ts`; registry entry `records-table` (keys `empty`, `no-results`, `loading`, `error`, `partial`, `offline`, `deleted`).
- **Per path:** `page.tsx` server read; `_components/table/**` table, list, toolbar, notices; `query.ts` and its test (C1); `surfaces/records-table.ts`; the e2e spec.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; captures `specs/web/epics/DEMO-records-demo/ux/demo/captures/records-table/`. Fix drift in code, never on the canvas.
  - From `md` up the 1440 layout applies (834 takes it). Fixed clock, explicit locales, no `Date.now()` or random values in render. A designed `error` never throws. Root carries `data-demo-state`.
  - Column widths 3 : 2 : 1.33 : 1.67 : 2 become tokens or fractions, never raw px. Value and Renews are tabular; value right-aligned.
  - Loading: controls disabled with their labels, skeletons at final size, no shimmer.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to hold filters in component state and mirror them to the URL, which drifts on back and reload.
