---
target: specs/web/ux/experimental/team-layer.md
status: approved
promoted:
---

# Team layer — experimental

## Job

A signed-in developer or admin sees what every reviewer pointed at, in place and design by design, and leaves the team's own notes. Done: they know where reviewers agree and have written down what to do about it. This file adds to `experiment.md`, `pins.md` and `pin-list.md`. Everything there holds unless changed here.

## Layout and components

- **No gate, no closing review** (S5, S18). Team visits record no views and no switches (D-LAB-14).
- **First design:** the first in the config, not random.
- **Bar changes:**
  - A "Team view" label at its start, in plain muted text, so the team remembers reviewers see something else.
  - **Reviewer filter:** a `Select` labelled "Reviewer", with "All reviewers", then each code's label in label order, then "Team notes".
  - The design switcher is the design filter, because pins draw only on their own design (D-LAB-13).
  - "Finish review" is replaced by a plain link, "Results", to the experiment's Results tab in `/admin`. It is not primary-styled, and the page has no primary.
  - On a closed experiment, "Closed" shows beside the label as a word, not a colour.
- **Reviewer pins:**
  - Each keeps its reviewer's number. The popover header reads "Ana Ruiz · comment 3 · Problem", with the text and time, and no Edit or Delete. The team never changes a reviewer's words; erasure in `/admin` is the only removal (S28).
  - With "All reviewers", numbers can repeat, and each pin's accessible name says whose it is.
- **Team notes** (S18):
  - A square marker with "T" and a number, e.g. "T2", in the same inverse neutral tokens. The shape, not colour, tells them apart (C-P05). T-numbers are shared across the team, per experiment. A note's author is the team member's email, the only name the team has.
  - The same composer as a reviewer's, with no type.
  - Each team member edits and deletes only their own notes. Notes can be added and edited after close (D-LAB-15).
  - Kept out of every client tally, and never shown to reviewers (private mode; beat 2 in `threads.md`).
- **List:** titled "Comments". Grouped by design, then by reviewer, with "Team notes" last. The filter applies.

## States

| State               | Key                 | What shows                                  | What the person can do              | Copy                                                                                                                                                                                    |
| ------------------- | ------------------- | ------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| empty               | `team-empty`        | No reviewer pins                            | Add a team note; go to Access codes | "No comments from reviewers yet. Share an access code from Access codes to start."                                                                                                      |
| loading             | `team-loading`      | As `experiment.md` loading; filter disabled | Wait                                | "Loading comments"                                                                                                                                                                      |
| error               | `team-error`        | As `experiment.md`                          | Retry                               | "Couldn't load comments. Retry"                                                                                                                                                         |
| partial             | `team-partial`      | Some team notes unsent                      | Retry                               | "1 not sent yet · Retry"                                                                                                                                                                |
| offline             | `team-offline`      | As `experiment.md`                          | Keep noting                         | as `experiment.md`                                                                                                                                                                      |
| success             | `team-success`      | All pins for the filter                     | Filter, read, note                  | —                                                                                                                                                                                       |
| filtered to nothing | `team-filter-empty` | Line in the list                            | Change the filter                   | One reviewer: "Ana Ruiz hasn't left comments on the Square design." All reviewers: "No comments from reviewers on the Square design." Team notes: "No team notes on the Square design." |
| closed              | `team-closed`       | "Closed" in the bar; all pins               | Read, add notes                     | "Closed"                                                                                                                                                                                |

## Words

The strings are above. Pin names: "Comment 3 by Ana Ruiz, Problem, on Pricing table"; "Team note 2 by taylor@example.com, on Pricing table". The bar's count follows the filter ("Comments 4").

## Access

- The filter is a native-behaving select named "Reviewer". On change, announced politely: "Showing 4 comments from Ana Ruiz on this design."
- The pins region is named "Comments on this design".
- Everything else is as `pins.md` and `pin-list.md`.

## Instrumentation

None. Team activity is not recorded as views (D-LAB-14).

## Criteria

| ID           | When                                     | Then                                                                                   | Evidence |
| ------------ | ---------------------------------------- | -------------------------------------------------------------------------------------- | -------- |
| C-LAB-team-1 | A developer or admin opens an experiment | All reviewers' pins for the shown design draw; no closing review link                  | test     |
| C-LAB-team-2 | The filter is set to one reviewer        | Only their pins draw and list                                                          | test     |
| C-LAB-team-3 | A team note is saved                     | It is stored as team, is absent from every client tally, and is invisible to reviewers | test     |
| C-LAB-team-4 | A team member opens a reviewer's pin     | No edit or delete control exists                                                       | test     |
| C-LAB-team-5 | The experiment is closed                 | The team still views it and can add notes; reviewers cannot add                        | test     |
| C-LAB-team-6 | A team member visits                     | No view or switch is recorded                                                          | test     |
| C-LAB-team-7 | Each `?state=` key                       | It renders at 390, 834 and 1440, light and dark                                        | capture  |

## Decisions and open items

D-LAB-14, D-LAB-15. None open.
