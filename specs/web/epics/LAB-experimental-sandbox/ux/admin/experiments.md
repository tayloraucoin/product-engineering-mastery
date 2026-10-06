---
target: specs/web/ux/admin/experiments.md
status: approved
promoted:
---

# Experiments — admin

## Job

See every experiment, which ones are open, how far each review has got, and which closed ones still hold reviewers' data. Done: the team opens the one they need, or notices data they should delete (gap 4).

## Layout and components

- Heading "Experiments". Below it, when any apply, one plain-text line (D-LAB-24): "2 closed experiments still hold reviewers' data." There is no primary action: experiments are made in code (S13).
- **Table:** the composed `data-table`.
- **Columns:**
  - Title, linking to the experiment's Results.
  - Status: "Open" or "Closed", a word, not a colour (C-P05).
  - Designs: a count.
  - Reviewers, e.g. "5 codes · 2 sent".
  - Last activity: the latest reviewer view, comment or send (team activity excluded, D-LAB-14), as a relative date, e.g. "3 days ago", with the exact date on hover and focus.
  - Data held.
- Numbers are right-aligned and tabular (C-P10).
- **Default sort:** open experiments first, by last activity, then closed experiments by close date. Sortable by Title, Status and Last activity.
- **Data held** (gap 4, Warden, D-LAB-24):
  - A closed experiment still holding guest data shows "Holds data from 3 reviewers · closed 34 days ago", with "Delete data", which links to the experiment's Data tab.
  - It shows from the day of close.
  - The days are counted from the close date in the config (D-LAB-25).
  - It is plain text with an icon and no alarm colour: status, not urgency (A-19).
  - Open experiments, and closed ones holding no guest data, show "—".
  - The same line shows at the top of that experiment's own page, under its heading.
- "Delete data" shows to admins only (D-LAB-26). Developers see the marker without the link.

## States

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| empty | `expts-empty` | One line, no table, no header count | Read | "No experiments yet. Each one is a folder in the code; the demo experiment shows the shape." |
| loading | `expts-loading` | A static skeleton of five rows in the final columns | Wait | — |
| error | `expts-error` | A line in place of the table | Reload | "Couldn't load experiments. Reload the page." |
| partial | `expts-partial` | The table, with "—" where a count failed, plus a line above it | Reload | "Some counts didn't load. Reload to try again." |
| offline | `expts-offline` | The last render, plus a line above it | Reconnect | "You're offline. This list may be out of date." |
| success | `expts-success` | The full table | Open, sort | — |
| stale data | `expts-stale` | The header count and row markers | Delete (admin) | as Layout |
| developer | `expts-developer` | Markers without "Delete data" | Open | — |

## Words

The strings are above. "Reviewers" counts codes made. "sent" counts reviewers with at least one version.

## Access

- The table has a caption, "Experiments". Column headers are `th` with sort state (`aria-sort`).
- The header count is plain text, not a live region.
- Each row's title link is the row's one Tab stop, plus "Delete data" where shown. Rows are not clickable as a whole.
- The marker's icon is `aria-hidden`; the text carries the meaning.

## Instrumentation

None.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-expts-1 | Two experiments, one open and one closed | Both list with their status words and counts | test |
| C-LAB-expts-2 | A closed experiment holds guest data | The row marker shows days since the config's close date, and the header counts it | test |
| C-LAB-expts-3 | A closed experiment's data was deleted | No marker; the header count drops | test |
| C-LAB-expts-4 | A developer views a stale row | The marker shows without "Delete data" | test |
| C-LAB-expts-5 | Keyboard alone | Sort, open an experiment, reach "Delete data" | manual |
| C-LAB-expts-6 | Each `?state=` key | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-24, D-LAB-25, D-LAB-26. None open.
