---
target: specs/web/ux/admin/data.md
status: approved
promoted:
---

# Data — admin

## Job

Remove reviewers' data, in full, when it is no longer needed or when someone asks. Show who has done what. Done: what was asked to go is gone, with no copies left, and the record shows it happened without holding the person (S27, S28, S12c).

## Layout and components

**Two places.**

**1. An experiment's Data tab: deleting an experiment's data.**

- **Admins only, open or closed** (D-LAB-26, amends S3).
- It opens with the counts: "Pricing 2026 holds: 5 access codes, 41 views, 23 comments, 4 reviews (7 versions), 6 team notes." For a closed experiment, the stale-data line shows above them (`experiments.md`).
- **Admin.** The consequence is named: "Deletes every access code, view, comment, review and team note for Pricing 2026. The experiment stays in the code, empty. This can't be undone." While the experiment is open, this is added: "It's open: reviewers lose access at once."
- **Confirm:** a `Field` labelled "Type pricing-2026 to confirm", then the button "Delete data from 5 reviewers" (destructive, primary here), or "Delete this experiment's data" when only team notes are held. Team notes alone count as data held. It is enabled only on an exact match.
- **Toast:** "Data deleted from 5 reviewers". It is a hard delete, with no undo.
- **Developer:** the counts, plus "Only an admin can delete this data." There is no field and no button.

**2. Nav-level Data page.** Heading "Data". Two sections.

- **Erase a reviewer** (S28; developers and admins, S3):
  - An `Input` labelled "Reviewer's email", with "Find".
  - Opened from `reviewer.md` (by reviewer id, never the email in a URL), the page instead lists each email used with that code, each with its own held counts and its own "Erase everything from …" button, under the line "This code was used with 2 emails. Each is erased separately."
  - The result shows what is held across all experiments: "ana@example.com: 2 experiments, 14 comments, 3 review versions, 41 views." A signed-in reviewer is matched by account email (S8).
  - **What else goes** (D-LAB-27):
    - The email is removed from every "Emails used" list.
    - A code used only by this email is revoked, and its label becomes "Erased reviewer".
    - A label that holds this email is replaced the same way.
    - A label that is a name is listed with a checkbox, ticked: "Also clear the label 'Ana Ruiz' on Pricing 2026". A cleared label becomes "Erased reviewer".
  - **Confirm** (`AlertDialog`): it names the counts and adds "This can't be undone." Button: "Erase everything from ana@example.com".
  - **Toast:** "Erased 14 comments, 3 review versions and 41 views." It is a hard delete, not anonymised (S28). Beat 2 replies are included (`threads.md`).
- **Record of actions** (D-LAB-3, S12c):
  - A table, newest first, paginated at 50. Columns: When, Who (the team member's email), What.
  - What reads, for example: "Made a code on Pricing 2026", "Revoked a code on Pricing 2026", "Replaced a code on Pricing 2026", "Made ben@example.com a developer", "Deleted data from 5 reviewers on Pricing 2026", "Erased a reviewer: 14 comments, 3 review versions, 41 views".
  - **It never names a reviewer or holds their email** (D-LAB-28).
  - Read-only. Nothing in it can be edited or deleted from here.

## States

Keys starting `data-tab-` are on an experiment's Data tab; keys starting `data-page-` are on `/admin/data`. Where a row lists both, both pages have it.

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| nothing held | `data-tab-empty` | Counts are zero; no delete | — | "Pricing 2026 holds no reviewer data." |
| loading | `data-tab-loading`, `data-page-loading` | A static skeleton | Wait | — |
| error | `data-tab-error`, `data-page-error` | A line | Reload | "Couldn't load this. Reload the page." |
| partial | `data-tab-partial` | The counts that loaded; "—" elsewhere; delete disabled | Reload | "Some counts didn't load, so deleting is paused. Reload to try again." |
| offline | `data-tab-offline`, `data-page-offline` | Actions disabled | Reconnect | "You're offline. Nothing can be deleted until you're back." |
| deleted | `data-tab-deleted` | The toast; the counts now zero | — | "Data deleted from 5 reviewers" |
| developer | `data-tab-developer` | Counts, plus the admin-only line | — | "Only an admin can delete this data." |
| no match | `data-page-no-match` | A line | Try another | "Nothing is held for that email." |
| erase found | `data-page-erase-found` | Counts, labels and the button | Erase | as Layout |
| from a reviewer | `data-page-reviewer` | Each email used with the code, with its counts and button | Erase each | "This code was used with 2 emails. Each is erased separately." |
| erased | `data-page-erased` | The toast; the field emptied | Find another | "Erased 14 comments, 3 review versions and 41 views." |
| action failed | `data-tab-action-error`, `data-page-action-error` | Toast; nothing changed | Retry | "Nothing was deleted. Try again." |
| record empty | `data-page-record-empty` | A line | — | "No actions recorded yet." |
| record | `data-page-success` | The erase section and the record table | Find, read | — |

## Words

The strings are above. The confirmation word is the slug, exactly.

## Access

- The typed-confirmation field states its rule in its label. The button's disabled reason is tied to it.
- Dialogs trap focus. After an erase, focus returns to the email field, emptied.
- The record table has the caption "Record of actions".
- Counts are text, never colour.

## Instrumentation

Every deletion, erasure, code action and role change writes one record row: who, what and when, with counts only (S12c, D-LAB-28).

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-data-1 | An admin deletes an experiment's data | Every code, view, comment, version and team note for it is hard-deleted; one record row has counts | test |
| C-LAB-data-2 | A developer calls the delete action | It is refused; the page shows no button | test |
| C-LAB-data-3 | An email is erased | Every view, comment, version and reply from it, across experiments, is gone; no label or "Emails used" holds it | test |
| C-LAB-data-4 | Any record row | It contains no reviewer email and no code label | test |
| C-LAB-data-5 | The confirmation text doesn't match | The delete button stays disabled | test |
| C-LAB-data-6 | Keyboard alone with a screen reader | Find, erase, delete and read the record | manual |
| C-LAB-data-7 | Each `?state=` key | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-3, D-LAB-26, D-LAB-27, D-LAB-28. None open.
