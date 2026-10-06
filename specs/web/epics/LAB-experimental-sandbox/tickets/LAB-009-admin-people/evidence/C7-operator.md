# LAB-9 C7 — keyboard and screen reader (operator check)

Walked by the builder on 2026-10-06 in the browser pane at 1440, against
`/admin/people?state=people-success` with a synthetic admin (a scratch copy
of `team.ts`; this machine has no Supabase Auth, so no real sign-in exists):

1. The filter has a visible label, "Find by email"; typing announces
   "N people match." through a polite live region.
2. "Role for ben@example.com" (a combobox) opens with Enter; ArrowDown and
   Enter pick "Admin". The confirmation opens with focus on "Cancel" and reads
   "Make ben@example.com an admin? Admins open every experiment, read every
   review and change anyone's role."
3. Escape closes it; the select reads "Developer" again and focus is back on
   "Role for ben@example.com".
4. Again, Tab to "Make admin", Enter: here the change fails (no Auth API),
   the toast reads "The role wasn't changed. Try again.", the select reverts
   and focus returns to it.
5. Wiring read from the DOM: the table's caption is "People"; under
   `people-last-admin` your own select is disabled and its
   `aria-describedby` points at "You're the only admin. Make someone else an
   admin first."

For a person, with VoiceOver or NVDA and a real admin session:

- Filter by part of an email and hear the count.
- Change a role with the keyboard alone, hear the dialog's question in full,
  confirm, and hear the toast; focus must land back on that row's select.
- With only one admin, reach your own select and hear its reason.
