---
target: specs/web/ux/admin/people.md
status: approved
promoted:
---

# People — admin

## Job

An admin sees who has signed up and gives or removes the developer and admin roles. It must never be possible to leave the app with no admin. Done: the right people hold the right role, and each change is recorded (S2, S12c).

## Layout and components

- **Admins only** (S2). A developer gets a 404 (`shell.md`). Heading: "People". There is no primary action.
- **A line under the heading:** "Changes take effect at their next sign-in, or within the hour." `[ASSUMPTION: the role rides in the session token and refreshes within an hour; Mason confirms the wording at Technical (door 1).]`
- **Filter:** an `Input` labelled "Find by email".
- **Table** (`data-table`, paginated at 50). Columns: Email, Role, Signed up, Last sign-in.
  - The Role column is a `Select` per row with "User", "Developer" and "Admin".
  - Your own row is marked "(you)".
- **Changing a role** asks for confirmation (`AlertDialog`) that names the consequence:
  - To admin: "Make ana@example.com an admin? Admins open every experiment, read every review and change anyone's role." Button: "Make admin".
  - To developer: "Make ben@example.com a developer? Developers open every experiment and read every review, but can't change roles or delete an experiment's data." Button: "Make developer". (Reflects D-LAB-26.)
  - To user: "Remove ben@example.com's developer role? They'll lose access to experiments and Admin." (It says "admin role" when they are an admin.) Button: "Remove role".
  - Cancel reverts the select. On success the toast names the outcome: "ana@example.com is now an admin.", "ben@example.com is now a developer." or "ben@example.com's role was removed."
- **Last-admin guard** (S2): when you are the only admin, your own select is disabled, with the reason tied to it: "You're the only admin. Make someone else an admin first." The server refuses the same change regardless.
- **Demoting yourself** when another admin exists: the confirmation adds "You'll lose access to People." After it, you land on Experiments, or on the 404 if you removed every role.

## States

| State               | Key                   | What shows                               | What the person can do | Copy                                                        |
| ------------------- | --------------------- | ---------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| empty               | `people-empty`        | Only you                                 | Read                   | "Only you so far. People appear here once they sign up."    |
| loading             | `people-loading`      | A static skeleton of the table           | Wait                   | —                                                           |
| error               | `people-error`        | A line                                   | Reload                 | "Couldn't load people. Reload the page."                    |
| partial             | `people-partial`      | The table; "—" where last sign-in failed | Read                   | —                                                           |
| offline             | `people-offline`      | The last render; selects disabled        | Reconnect              | "You're offline. Roles can't be changed until you're back." |
| success             | `people-success`      | The table                                | Change roles           | —                                                           |
| filtered to nothing | `people-filter-empty` | A line                                   | Clear the filter       | "No one matches that email."                                |
| last admin          | `people-last-admin`   | Own select disabled, with the reason     | —                      | as Layout                                                   |
| change failed       | `people-change-error` | Select reverted; toast                   | Retry                  | "The role wasn't changed. Try again."                       |

## Words

The strings are above. Role names are capitalised in the select and lowercase in sentences.

## Access

- The table has the caption "People". Each select is named "Role for ana@example.com".
- The disabled select keeps its reason in `aria-describedby`.
- The filter announces its result count politely: "3 people match."
- Dialogs trap focus, and focus returns to the select.

## Instrumentation

None. Each change is recorded on the Data page: who, what, when (S12c). Role changes name the team member, never a reviewer (D-LAB-28).

## Criteria

| ID             | When                                                                                | Then                                                                | Evidence |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------- |
| C-LAB-people-1 | An admin makes a user a developer                                                   | The role is written, the change is recorded, and the toast names it | test     |
| C-LAB-people-2 | The only admin tries to remove their own role, in the UI or by a direct action call | It is refused                                                       | test     |
| C-LAB-people-3 | A developer calls any People action                                                 | It is refused, and the page is a 404                                | test     |
| C-LAB-people-4 | A role change                                                                       | It requires confirmation naming the consequence                     | capture  |
| C-LAB-people-5 | Keyboard alone with a screen reader                                                 | Filter, change a role and confirm                                   | manual   |
| C-LAB-people-6 | Each `?state=` key                                                                  | It renders at 390, 834 and 1440, light and dark                     | capture  |

## Decisions and open items

D-LAB-26, D-LAB-28. Routed to Technical: the timing line (door 1).
