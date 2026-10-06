# As-built — WEB-8

## Shipped against the contract

- C1: `requireTier()` in `packages/db/scripts/env.ts` refuses an unset or empty `DATABASE_ENVIRONMENT`, naming the variable, `packages/db/.env.example` and its default (staging); every resolver calls it on demand, so importing a script throws nothing. Test: `scripts/tier-guard.test.ts` spawns the seven scripts with an empty environment and asserts exit 1, one line of stderr, and no `54322` anywhere in the output.
- C2: `requireLocalTier(command)` in `scripts/supabase-cli.ts`, first in `preflight`, so `db:local` and `db:local:full` print "needs the local database (Docker)" and the add recipe before any `docker` call; `db:local:reset` refuses in its own first line, naming Docker and the recipe; the new `scripts/test-db.ts` wraps `node --test` for `test:db` with the same guard, so no test file loads on a hosted tier. `db:migrate` and `db:setup` on staging with only `_LOCAL` URLs set refuse naming `DATABASE_MIGRATION_URL_STAGING`; with a wrong-pooler staging URL they name that URL and never the local one. Same test file; PATH is emptied, so a stray `docker` call would surface as a different message.
- C3: `yarn verify` with no Docker daemon is the close run, recorded as `evidence/C3-verify-no-docker.md` beside Docker's own "cannot connect" line.
- C4: handed to the operator (`evidence/C4-operator.md`), with the three commands and what each must print.
- C5: `yarn check-types` passes.
- The defaults and the docs: both example files set `DATABASE_ENVIRONMENT=staging` under one comment line (no local database by default; the add recipe adds one); the `_LOCAL` URLs stay filled and are read on the local tier only. The new-project guide (round D, step 5, the desk walk), the add recipe, the remove runbook, the tech stack, the conventions and the tooling reference describe hosted-only as the default and point at the add recipe. One bullet under the Docker ruling in the changelog.

## Deviations

- Part 0, the migrations to staging, did not run: the operator has no staging project yet and said so. STK-9 and STK-16 stay migration-pending; nothing on a hosted tier was touched.
- `packages/db/README.md` and `packages/db/AGENTS.md`, named by the prompt, do not exist. The package is described in the tech stack, the conventions and the tooling reference, which were updated instead; no file was invented.
- `tooling/doctor.ts` is unchanged: it probes ports 3000 and 3001 only and never expected the database port.
- STK-11's C4 and C5 evidence files were not rewritten: they carry recorded hashes and their `results.json` is merged (E-24), so an edit fails `check-specs` as tampered. The add recipe's proof names them instead, and the closing report tells the operator.
- `[ASSUMPTION]` The `_LOCAL` URLs stay filled rather than emptied, as Quartermaster's call, labelled as judgment: the value is the CLI's own default and the code's constant, a hosted tier never reads it, and leaving it makes the add recipe one line. The guide's step 5 now says "nothing to do".
- `[ASSUMPTION]` "Exits cleanly" means one line on stderr and exit 1. A command that needs Docker never exits 0 on another tier, so a skipped privacy proof cannot read as a pass.
- EN-08's "default `local`" now holds for the apps alone. No ledger line: the Docker ruling's own wording did not change; the changelog bullet records the narrowing.
- C5's first `contract:run` failed inside the sandbox: `turbo.json` lists every `.env*local` as a global dependency, and the sandbox denies reading the operator's new `packages/db/.env.local`, so turbo could not hash it. Re-run outside the sandbox. No env value was read or printed by the thread.

## Not verified

- C3 is manual because `yarn verify` is never a criterion; its close run is the evidence.
- C4 needs the Docker daemon, which neither the sandbox nor this machine has running.
- The add recipe and the guide have still not been run cold (STK-20).
- `db:seed-users` on a hosted tier: it refuses an unset tier (C1) and a non-loopback auth URL as before; no new test covers the hosted-tier refusal.

## Next

Operator: run C4 on the local tier once Docker is up, and decide whether STK-11's deferred checks should be re-recorded if the tooling ever admits an edit to deferred evidence.
