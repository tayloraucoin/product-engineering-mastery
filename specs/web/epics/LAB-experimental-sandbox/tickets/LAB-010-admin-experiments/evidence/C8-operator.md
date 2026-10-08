# LAB-10 C8 — keyboard alone (operator check)

Walked by the builder on 2026-10-06 in the browser pane at 1440, against
`/admin/experiments?state=expts-stale` with a synthetic admin (a scratch copy
of `team.ts`; this machine has no Supabase Auth):

1. The Tab order after the shell is: the sort buttons Title, Status and Last
   activity; then each row's title link, followed by "Delete data" on the two
   closed experiments that still hold reviewers' data. Rows are not clickable
   as a whole.
2. Title's sort button, pressed, sets `aria-sort="ascending"` on its header
   and orders the rows A to Z; pressed again, descending.
3. A title link opens `/admin/experiments/<slug>`: the heading, the status
   word and the tabs Results, Reviewers, Access codes, Data, with Results
   `aria-current="page"`.
4. "Delete data" links to `/admin/experiments/<slug>/data` (LAB-16 builds
   that page).

For a person, with a real admin session and a closed experiment holding data:

- Sort by each column with the keyboard alone and confirm the focus ring at
  each stop.
- Open an experiment from its title and reach "Delete data" under its heading.
- Repeat as a developer: no "Delete data" anywhere.
