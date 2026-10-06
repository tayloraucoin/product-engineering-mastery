---
target: specs/web/ux/admin/access-codes.md
status: approved
promoted:
---

# Access codes — admin

## Job

Make a code for one person, hand it over once, and stop it when needed. Done: the reviewer has a live code and a link, and the team knows which codes are live.

## Layout and components

- The experiment's "Access codes" tab. The primary action is "Make a code" (C-P02).
- **Table** (`data-table`). Columns:
  - Label. An empty label is refused: "Enter who this code is for."
  - Display name (collaborate experiments only, D-LAB-16).
  - Emails used. Flagged "2 emails used with this code" when more than one was typed. Flagged "Email differs from the label" only when the label is itself an email address and the typed one differs, ignoring case. A label that is a name is never compared or flagged. (S7: the gate never compares; `/admin` shows the mismatch.)
  - Last used.
  - Status: "Live" or "Revoked", a word.
  - Actions in a row menu: "Replace code", and "Revoke code" when live.
- **Make a code** (`Dialog`):
  - "Label" is required, with the hint "Who is it for? A name or an email."
  - On collaborate experiments, "Display name" is required, with the hint "Other reviewers in this review see this name."
  - Button: "Make code".
  - Then the dialog shows the code **once** (S6):
    - the code in a read-only, monospace field with "Copy code";
    - the link with "Copy link";
    - the line "Copy this code now. It won't be shown again. Send the link and the code separately."
    - Button: "Done". Closing by Escape or Done is the same, and the code is gone from the page.
- **Replace code** (D-LAB-23), a `Dialog`:
  - On a live code it reads "Replace Ana Ruiz's code? Their current code stops working. Their comments and review stay theirs." On a revoked code: "Give Ana Ruiz a new code? Their comments and review stay theirs."
  - Button: "Replace code". It then shows the new code once, as above.
  - On a revoked row this is how the reviewer is brought back.
- **Revoke code:**
  - The `AlertDialog` reads "Revoke Ana Ruiz's code? They won't be able to open the review again. Anything they've sent stays."
  - Button: "Revoke code" (destructive, primary in the dialog only).
  - Toast: "Code revoked". It takes effect on the reviewer's next page load (S10).
- **On a closed experiment:** "Make a code" and "Replace code" are disabled, with the reason "This experiment is closed." Revoke stays available.
- Developers and admins both see every action (S3). Each action is recorded (S12c) without naming the reviewer (D-LAB-28).

## States

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| empty | `codes-empty` | One line and the primary | Make a code | "No codes yet. Make one for each person who should review this." |
| loading | `codes-loading` | A static skeleton of the table | Wait | — |
| error | `codes-error` | A line | Reload | "Couldn't load codes. Reload the page." |
| partial | `codes-partial` | The table; "—" where "Emails used" failed | Read | — |
| offline | `codes-offline` | The last render; actions disabled | Reconnect | "You're offline. Codes can't be changed until you're back." |
| success | `codes-success` | The table | All actions | — |
| shown once | `codes-shown-once` | The dialog with the code | Copy, Done | as Layout |
| copied | `codes-copied` | The button reads "Copied" for 2 seconds | — | "Copied" |
| make failed | `codes-make-error` | A line in the dialog | Retry | "The code wasn't made. Try again." |
| closed | `codes-closed` | The make and replace actions disabled with the reason | Revoke | "This experiment is closed." |
| mismatch | `codes-mismatch` | "Emails used" flagged | Read | "2 emails used with this code", or "Email differs from the label" |

## Words

The strings are above. "Label" is private to the team. "Display name" is seen by other reviewers in collaborate mode only.

## Access

- The dialogs trap focus. On the shown-once step, focus moves to "Copy code".
- On copy, announced politely: "Code copied."
- The code field is named "Access code for Ana Ruiz". Row menus are named "Actions for Ana Ruiz".
- With reduced motion, dialogs fade with opacity only.

## Instrumentation

None. The code is never logged, and is never shown again after the dialog closes.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-codes-1 | A code is made | It is shown once; after closing, no page or response holds it in clear | test |
| C-LAB-codes-2 | A code is revoked | The reviewer's next request is refused; their sent data stays | test |
| C-LAB-codes-3 | A code is replaced | The old code fails, the new one opens, and the reviewer's pins and review are still theirs | test |
| C-LAB-codes-4 | A collaborate experiment | A display name is required; a private experiment hides the field | test |
| C-LAB-codes-5 | A closed experiment | Make and Replace are disabled with the reason | capture |
| C-LAB-codes-6 | Keyboard alone with a screen reader | Make, copy, revoke and replace are completable | manual |
| C-LAB-codes-7 | Each `?state=` key | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-16, D-LAB-23, D-LAB-28. None open.
