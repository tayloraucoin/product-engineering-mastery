# WEB-9 C3 — yarn test:db against the own Postgres

Statement: `yarn test:db` passes against that database: row-level security, the local auth mirror, the reset and the Stripe event ledger.

How: run by the thread on 2026-10-05 right after C2, outside the sandbox, with the same two `_LOCAL` URLs in the shell environment. The first run, before the shim matched Supabase's shape, failed three of twenty-one tests (the shim's timestamp defaults filled columns a mirrored row must leave null; the `supabase_auth_admin` login role was missing; one RLS test hard-coded Docker's `postgres` user instead of reading the connection's own role). The shim and that one assertion were corrected (the assertion now also checks the restored role is not the bridge's), and the run below is the result. The full TAP log is not committed; its first lines and its summary are.

```
test:db — local tier: running test/ against the local database, one file at a time
TAP version 13
...
  # Subtest: the mirror on a marked database without auth.identities
  ok 1 - the mirror on a marked database without auth.identities
  # Subtest: the guard inside the INSERT
  ok 2 - the guard inside the INSERT
  # Subtest: empties public, keeps auth, and rebuilds the schema and setup
  ok 3 - empties public, keeps auth, and rebuilds the schema and setup
  # Subtest: the bridge
  ok 4 - the bridge
  # Subtest: the setup SQL
  ok 5 - the setup SQL
  # Subtest: an owner-private policy
  ok 6 - an owner-private policy
  # Subtest: the Stripe event ledger
  ok 7 - the Stripe event ledger
  # tests 21
  # suites 6
  # pass 21
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
```
