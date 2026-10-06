---
target: specs/web/ux/admin/results.md
status: approved
promoted:
---

# Results — admin

## Job

Read what every reviewer said about one experiment and choose a direction from here alone (the brief's metric). Done: Taylor can say which design goes forward, what must change, and how strong the signal is, without overstating it.

## Layout and components

- The experiment's default tab. One column, with sections headed in this order. Built from `Table` (display) and `Collapsible` for long quotes. **No charts, no means, no hero numbers** (A-09; S25).
- **Summary line:** "3 of 5 reviewers have sent a review · 41 views · latest versions · core v1".
- **Under 10 answers on a question**, one line under the summary: "Percentages and medians appear once a question has 10 answers."
- **Reading rules (S25, Envoy):**
  - One reviewer's rating shows as its label.
  - Across reviewers, each label shows its count, with n.
  - At 10 or more answers on the same wording version, a percentage per label is added, and for labelled scales the median label, always with n.
  - Never a mean.
  - Answers on different wording versions are counted apart. A percentage is computed within one version only.
- **Sections** (each design shown as glyph, name and config id: "● Circle · pricing-annual-first"):
  1. **Preference:**
     - A table with rows per design, then Combine, None of these and No preference. Columns: Slight, Clear, Strong, Total, then "%" once 10 or more. Combine, None of these and No preference have no strength: their strength cells show "—" and their count sits in Total.
     - Below it, the reviewers flagged **weak signal** (S25): "Ana Ruiz: slight, matches first seen".
     - The whole Preference section is hidden for one-design experiments.
  2. **Goal fit:** a table per design (or one table for one design). Rows are the five labels; columns are Count and, once 10 or more, "%". "Can't judge yet" sits apart with its own count, and is left out of n, the percentages and the median. "Median: Very well" at 10 or more.
  3. **Next step:** the four options, with counts.
  4. **Blockers:** each answer quoted as written, attributed to the code's label, then "Nothing, I'd approve it: 2".
  5. **In their words:** weakness per design, reasons for the choice, carry-over, combine and none answers, what is missing, the targeted question, and extra questions. Each is quoted and attributed. Scale questions follow the reading rules.
  6. **Comments by design:**
     - Per design: counts by type, and by triage (Must change, Should change, Fine either way, and "Not triaged" for comments left after the reviewer's latest send).
     - Then each reviewer's "matters most", quoted with the place.
     - "See them on the page" opens the team view filtered to that design.
     - Team notes are never counted.
  7. **Order log:** a table per reviewer with first design, last design before choosing, switches, time on each design (minutes, tabular), choice, and "changed after choosing" (D-LAB-21).
- Every reviewer's name links to `reviewer.md`. Numbers are right-aligned and tabular (C-P10).

## States

| State         | Key                     | What shows                                     | What the person can do | Copy                                                    |
| ------------- | ----------------------- | ---------------------------------------------- | ---------------------- | ------------------------------------------------------- |
| empty         | `results-empty`         | The summary and one line; no sections          | Go to Access codes     | "No reviews sent yet. 2 reviewers have opened it."      |
| no reviewers  | `results-no-reviewers`  | One line                                       | Make a code            | "No one has been sent a code yet." Link: "Access codes" |
| loading       | `results-loading`       | A static skeleton of the sections              | Wait                   | —                                                       |
| error         | `results-error`         | A line                                         | Reload                 | "Couldn't load results. Reload the page."               |
| partial       | `results-partial`       | Some reviewers sent; the summary says how many | Read                   | —                                                       |
| offline       | `results-offline`       | The last render, plus a line                   | Reconnect              | "You're offline. These results may be out of date."     |
| under 10      | `results-under-10`      | Counts with n only                             | Read                   | as Layout                                               |
| 10 or more    | `results-10-plus`       | Counts, "%" and median, with n                 | Read                   | —                                                       |
| mixed wording | `results-mixed-version` | The question's counts split by core version    | Read                   | "Asked in two wordings; counted separately."            |
| success       | `results-success`       | All sections                                   | Read, follow links     | —                                                       |

## Words

The strings are above. The team word is "design" (D-LAB-29). Quotes are shown exactly as written, never trimmed except with "Show all".

## Access

- Each table has a caption. Headers are `th` with scope. Counts are announced with their header. "n = 7" is written out in text, not only in a column.
- Quotes are `blockquote` with an attribution.
- Section headings are `h2`, so a screen reader user moves through them by heading.

## Instrumentation

None.

## Criteria

| ID              | When                                               | Then                                                               | Evidence |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------ | -------- |
| C-LAB-results-1 | 3 reviewers rated one design                       | Counts per label with "n = 3"; no "%", no median, no mean anywhere | test     |
| C-LAB-results-2 | 10 reviewers on one wording                        | "%" and the median label appear with n                             | test     |
| C-LAB-results-3 | Answers on two wording versions                    | Counted apart; no percentage spans versions                        | test     |
| C-LAB-results-4 | A reviewer sent 2 versions                         | Only version 2 is counted                                          | test     |
| C-LAB-results-5 | A slight preference matching the first-seen design | Flagged weak signal                                                | test     |
| C-LAB-results-6 | Team notes exist                                   | They appear in no count                                            | test     |
| C-LAB-results-7 | Free-text answers                                  | Quoted exactly, attributed to the code's label                     | capture  |
| C-LAB-results-8 | Each `?state=` key                                 | It renders at 390, 834 and 1440, light and dark                    | capture  |

## Decisions and open items

D-LAB-21, D-LAB-29. None open.
