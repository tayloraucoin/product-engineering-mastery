# STK-11 C4 — operator check (deferred)

Statement: a fresh db:reset in mode A ends with a signed-in staging user's row in the local public.users.

Why deferred: it needs STK-12's request seam, which calls `applyLocalAuthMirror`, and a person signing in on staging. Neither exists in this thread.

What is already proven (C1, `test-db.txt`): the mirror inserts id and email into a marked Mode A database, and the trigger creates the public.users row. After public loses the row, as `db:local:reset` does, setup's `04_users_backfill.sql` restores it. On 2026-10-04 Taylor ran `yarn db:local:reset`, and it applied all four setup files.

The check, once STK-12 lands:
1. `yarn db:local` (Mode A), then `yarn db:local:reset`.
2. Sign in on hosted staging through the app on localhost.
3. `select id, email from public.users` on 127.0.0.1:54322 shows the signed-in user.
4. Record the result here, with the date and the user's id.
