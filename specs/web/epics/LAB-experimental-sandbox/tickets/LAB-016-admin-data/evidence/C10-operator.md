# LAB-16 C10 — keyboard alone and a screen reader (operator check)

Re-walked on 2026-10-07 at eff9425 against `?state=data-page-success` and `data-tab-*`, keyboard only: "Reviewer's email", Enter on Find keeps the email out of the URL and moves focus to the result heading; Tab reaches the label checkbox (named by aria-labelledby "Also clear the label 'Ana Ruiz' on Pricing 2026"), Space ticks it, Tab, Enter opens the erase confirmation with focus on "Cancel". Unchanged from the walk below.

Walked by the builder on 2026-10-07 in the browser pane at 1440, on the local
database, with a synthetic team member (a scratch copy of `team.ts`; this
machine has no Supabase Auth) and synthetic rows on a scratch-only slug, so
no other thread's rows were touched. Keyboard only; focus read from
`document.activeElement` at each step:

1. The experiment's Data tab, as an admin: the counts line reads "Data walk
   holds: 3 access codes, 9 views, 6 comments, 2 reviews (3 versions), 1 team
   note." Focus in "Type data-walk to confirm"; typing `Data-walk` leaves
   "Delete data from 3 reviewers" disabled, its description "The button turns
   on when the text matches exactly." Typing `data-walk` enables it; Tab
   reaches it; Enter: toast "Data deleted from 3 reviewers", the tab reads
   "Data walk holds no reviewer data." and focus moves to that line.
2. The same tab as a developer: the counts and "Only an admin can delete
   this data.", with no field and no button.
3. `/admin/data`: focus in "Reviewer's email"; `Ana@Example.com` and
   Enter: the URL is unchanged, and focus moves to "ana@example.com: 1
   experiment, 2 comments, 1 review version, 3 views." Tab reaches the ticked
   checkbox "Also clear the label 'Ana Ruiz' on Data walk"; Tab, Enter on
   "Erase everything from ana@example.com" opens the alert dialog naming the
   counts and "This can't be undone.", with focus on Cancel. Tab, Enter:
   toast "Erased 2 comments, 1 review version and 3 views.", the field is
   empty and has focus, and the record's first row reads "Erased a reviewer:
   2 comments, 1 review version, 3 views".
4. `/admin/data?reviewer=<id>` for a code used with one email: "This code was
   used with 1 email." and the email with its own counts and button. An id
   that is no reviewer's: "Nothing is held for that email."

The database after step 3: ana's access, views, comments and version gone;
ben's kept on the same code; the ticked label "Erased reviewer", the code
live. The record rows hold the action, the slug (delete only), the team
member's email and counts.

For a person, with a real team session and a screen reader (VoiceOver):

- On an experiment's Data tab, confirm the counts line, "Type <slug> to
  confirm" and the button's description are read; delete with the keyboard
  alone and confirm the toast is announced and focus lands on the counts.
- On `/admin/data`, find an email: confirm the found line is read when focus
  moves to it, each "Also clear the label …" checkbox is read with its label
  and state, and the dialog's title and sentence are read with focus on
  Cancel.
- Erase, and confirm the toast is announced and focus returns to the empty
  "Reviewer's email" field.
- Read the record table: the caption "Record of actions" and the When, Who,
  What headers are read, and Newer or Older reach the next page when there
  are more than 50 rows.
