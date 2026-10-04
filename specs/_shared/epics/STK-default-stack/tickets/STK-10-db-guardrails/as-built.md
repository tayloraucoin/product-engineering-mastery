# As-built — STK-10

## Shipped against the contract

- C1: `packages/db/scripts/reset-local-db.ts` (`yarn db:local:reset`) refuses `staging` and `production` before it resolves a URL, refuses a local URL that is not loopback before it connects, then empties `public` (every object no extension owns) and drizzle's journal in one transaction and reapplies the migrations and the setup SQL. `scripts/reset-local-db.test.ts` (in `yarn test`) spawns the script: with no URL set, a hosted tier is refused, not met by env.ts's "Set …" error; with unroutable hosted URLs set, it refuses in under 5 s and never names the host; a non-loopback local URL and a malformed tier are refused too.
- C2: `tooling/check-settings.ts` requires D-STK-18's six denies (`*db:reset*`, `*db:drop*`, `*drizzle-kit drop*`, `*supabase db reset*`, `*DROP SCHEMA*`, `*DROP DATABASE*`) and eight asks (`*db:migrate*`, `*db:push*`, `*db:seed*`, `*db:setup*`, `*db:local:reset*`, `*drizzle-kit migrate*`, `*drizzle-kit push*`, `*supabase db push*`), and fails any deny that would also match `yarn db:local:reset` (legacy `prefix:*` form included). Four new fixtures; the template carries the new ask.
- C3: `tooling/hooks/bash-guard.ts` denies a reset or drop (`db-destroy`: the scripts by name or as a turbo task, `drizzle-kit drop`, `supabase db reset`, `dropdb`, and `drop schema` or `drop database` in any case handed to `psql`, `pgcli` or `usql`, heredocs included) and answers `ask` (`db-change`) for migrate, push, seed, setup, the local reset, raw `drizzle-kit migrate|push`, `supabase db push`, `supabase migration up`, and the db scripts run by path. A deny anywhere in a command beats an ask. `tooling/test-hooks.ts` gains the `ask` expectation (exit 0, `permissionDecision: "ask"`, reason opening `bash-guard [rule]`); an ask rule needs an allow and an ask case. 37 new cases; the denial names the move: a migration for Taylor, or `yarn db:local:reset` for the local database.
- C4: `yarn test:tooling` passes.

## Deviations

- **The settings change is one line, applied by Taylor.** `.claude/settings.json` already held the contract's six denies and six asks (since PJ's J2). The only addition is the ask `Bash(*db:local:reset*)`, which the sandbox blocks agents from writing: committed in 6c214cd with Taylor's approval, then Taylor copied the template over the file on 2026-10-04 (9dd86e1; only `denyRead`'s line wrapping changed). C2 passed after it.
- **[ASSUMPTION] The local reset is asked, not denied.** D-STK-18 says reset refuses any tier but `local`, so a local reset exists; the objective says agents must ask before changing a database. It is named `db:local:reset` so no reset deny (`*db:reset*`) matches it, and check-settings keeps it that way.
- **[ASSUMPTION] "Before reading a URL" means before resolving one.** env.ts copies the URL variables into memory when it is imported, as it does for every db script; the refusal comes before `migrationUrl()` resolves, describes or connects to any of them.
- **The reset leaves `auth`, the mirror's marker schema and the `public` schema's own grants and default privileges as they are.** It drops objects, not the schema, so Supabase's grants survive.
- **Hook "ask" format**, verified 2026-10-04 against code.claude.com/docs/en/hooks: exit 0 with `hookSpecificOutput.permissionDecision: "ask"` and `permissionDecisionReason`, shown to the user. Whether a hook ask overrides a settings allow (`Bash(yarn *)`) is not stated there; the settings ask rules are the reason both layers carry the rule.
- **Paths added to `planned_paths`:** the two reset tests, both `package.json` files (the script), and `docs/runbooks/remove-supabase-database.md` (its script list now names `db:local:reset`).

## Not verified

- review:mason, review:vigil, review:warden: recorded by `yarn review:run` only.
- `packages/db/test/reset-local-db.test.ts` is in `yarn test:db`, not a criterion. It resets a migrated database holding a stray table, a stray enum, a note and a mirrored user, and checks that the stray objects and the note are gone, auth.users is kept, STK-11's setup backfill restores the user's public row, and the journal, the notes policies and both auth triggers are back. Taylor ran `yarn db:local && yarn test:db` on 2026-10-04: 15 of 15 pass, this test included (`evidence/test-db.txt`, as pasted).
- The guard is text analysis: a SQL file passed with `psql -f`, or a command held in a variable, is invisible to it. The settings rules and the reset's own tier refusal are the layers behind it.

## Next

Taylor reads the three `review-<role>.md` files and merges; STK-11 continues.
