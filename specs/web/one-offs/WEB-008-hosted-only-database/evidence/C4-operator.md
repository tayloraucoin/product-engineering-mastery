# WEB-8 C4 — operator check (deferred)

Statement: with `DATABASE_ENVIRONMENT=local` and the Docker database up, `yarn test:db` passes: the local path is unchanged.

Why deferred: `yarn test:db` needs the Docker daemon. The build sandbox has none, and on this machine `docker version` answered "Cannot connect to the Docker daemon" on 2026-10-05, so the thread could not start the database. What the thread proved instead (C1, C2, `yarn workspace @pem/db test`): every script and the test wrapper refuse an unset or hosted tier before touching Docker or a URL, and the integration test files still carry their own local-tier and loopback checks.

The check, on a machine with Docker running and `packages/db/.env.local` on the local tier (as yours is today):

1. `yarn db:local`. Its first line must not be a refusal; it ends on the "ready" line naming `127.0.0.1:54322`.
2. `yarn db:migrate`, then `yarn db:setup`. Each asks first; the first printed line of each must say `local`.
3. `yarn test:db`. Its first line is `test:db — local tier: running test/ against the Docker database, one file at a time`, and the run ends with `# fail 0` across the four files (row-level security, the local auth mirror, the reset, the Stripe event ledger).
4. Record the result here, with the date and the test count the runner printed.
