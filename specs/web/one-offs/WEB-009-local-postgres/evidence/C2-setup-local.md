# WEB-9 C2 — yarn db:setup:local on this machine's own Postgres

Statement: on this machine's own Postgres (Postgres.app, 127.0.0.1:5432), `yarn db:setup:local` creates `pem_local`, applies the shim, the two migrations, the four setup files and the mirror marker, and a second run changes nothing.

How: run by the thread on 2026-10-05, outside the sandbox (Node reads `packages/db/.env.local`, which the sandbox denies and the thread never read), with the two `_LOCAL` URLs passed in the shell environment as `postgresql://127.0.0.1:5432/pem_local`, since the operator's env file still named Docker's address. No env value was printed. Docker's daemon was not running. The server answered `PostgreSQL 15.19 (Postgres.app)`; the connecting user is the Mac user, a superuser.

## First run (the database did not exist)

```
db:setup:local — local at 127.0.0.1:5432/pem_local (a Postgres on this machine, no Docker)
  database created
  shim applied: roles anon, authenticated, service_role; auth.users
  migrations applied
  setup 01_functions.sql
  setup 02_auth_triggers.sql
  setup 03_public_tables.sql
  setup 04_users_backfill.sql
  local auth mirror marked
db:setup:local — done; next: yarn test:db
```

## Second run, after the shim was corrected to Supabase's shape (a rerun changes nothing)

```
db:setup:local — local at 127.0.0.1:5432/pem_local (a Postgres on this machine, no Docker)
  database exists
  shim applied: roles anon, authenticated, service_role; auth.users
  migrations applied
  setup 01_functions.sql
  setup 02_auth_triggers.sql
  setup 03_public_tables.sql
  setup 04_users_backfill.sql
  local auth mirror marked
db:setup:local — done; next: yarn test:db
```

What differs between the runs is the one line `database created` / `database exists`; every other step is idempotent SQL (`create ... if not exists`, drizzle's journal, `create or replace`, `drop trigger if exists`, `on conflict do nothing`).
