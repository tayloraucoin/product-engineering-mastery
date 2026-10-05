---
title: "Add the local Docker database — an add recipe"
description: "Follow when a project that runs its database hosted-only wants a local one: Supabase's Postgres in Docker, started by yarn db:local. Sets the tier back to local, picks the sign-in mode, starts, migrates and proves the database with yarn test:db, and says how to go back."
layer: runbooks
status: draft
thread: "PEM"
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Add the local Docker database

> **Module:** the local half of the database package: the Supabase CLI and its Postgres image, the scripts that start, reset and seed it, and the local auth mirror.
> **Run from:** step 5 of [`new-project/README.md`](../new-project/README.md) when the interview's D1 answer is "local, in Docker", or later, when a hosted-only project changes its mind.
> **Needs:** the database kept (not removed), and Docker running on the developer's machine.
> **Status:** draft, not yet run cold. The starter ships every file this recipe uses and runs none of it by default (WEB-8): the tier alone switches the local database on, so there is nothing to restore. Until it is on, `yarn db:local`, `yarn db:local:full`, `yarn db:local:reset` and `yarn test:db` refuse in their first line and name this recipe.

## What you get, and what it costs

| You get                                                                                                                                                  | It costs                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| A database on your own machine: migrations tried locally before any hosted project sees them                                                             | Docker installed and running, and about a minute for the first image download   |
| `yarn test:db`: the proofs that row-level security, the billing ledger and the reset really behave, which refuse any database that is not on the machine | The local port is open to your network unless Docker is told otherwise (step 6) |
| The local tier for every service: email logged and not sent, AI answered from recorded fixtures, nothing spent                                           | One more thing to start before the app                                          |

## Steps

1. **Name it.** `project_id` in `packages/db/supabase/config.toml` is the repo's folder name ([`rename.md`](../new-project/rename.md), part 4). Two repos with one id share one local database.
2. **Set the tier to local.** In the root `.env.example` and in `packages/db/.env.example`: `DATABASE_ENVIRONMENT=local`, and replace the comment line above it (this repo runs no local database by default) with one saying the database runs in Docker, started by `yarn db:local`. The `_LOCAL` database URLs are already filled with the local address, `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (a synthetic password, the CLI's default), and are read on the local tier only. Each developer makes the same one-line change in their two `.env.local` files.
3. **Pick how sign-in works locally.** There is no mode variable: the `_LOCAL` auth values decide.
   - **Mode A (Recommended): sign in on staging.** The `_LOCAL` auth values are the staging project's. Add `http://localhost:3000/auth/callback` to that project's redirect addresses. Each person who signs in is copied into the local database by the local auth mirror. Starts with `yarn db:local`.
   - **Mode B: everything local.** The whole Supabase stack runs in Docker. Starts with `yarn db:local:full`; the `_LOCAL` auth values are the ones the CLI's status command prints (the root `.env.example` names it), and `yarn db:seed-users` creates made-up users.
   - Skip this step when auth was removed.
4. **Start it.** `yarn db:local` (or `yarn db:local:full`). It stops with one clear line when Docker is not running. From an agent's sandbox it may need the operator's approval to reach Docker.
5. **Build the schema.** `yarn db:migrate`, then `yarn db:setup`. An agent stops for the operator's yes before each: they are commands that change a database.
6. **Close the port on a shared network.** The CLI publishes the database on every network interface, with the password above, and in Mode A it holds real staging email addresses. `yarn db:local` warns while this is so. To close it, set `"ip": "127.0.0.1"` in Docker's daemon settings, then `yarn db:stop` and start again.
7. **Write it down.** One line in the product's changelog, and the choice in the set-up record or a new one: who chose it, and which mode.

No entry in `toolkit.json` changes: the `db` entry already lists these files, and nothing was marked removed.

## Proof

1. `yarn db:local` ends on its "ready" line, naming the address and the mode.
2. `yarn test:db` exits 0.
3. `yarn web:dev`, then sign in (Mode A or B): the app shows the signed-in user, and the local `public.users` table holds their row.
4. `yarn check-stack` and `yarn verify` exit 0.
5. STK-11's operator check C4 (`specs/_status.md`, Operator checks) needs this database and can now be run; the first step of its C5, stopping the local database, applies only once this recipe has run.

## Day to day

- Stop: `yarn db:stop`. Stop and delete all its data: `yarn db:stop --no-backup`.
- Start clean without deleting users: `yarn db:local:reset`. It refuses every tier but local and every address but this machine.

## Going back to hosted only

`yarn db:stop --no-backup`, then undo step 2: `DATABASE_ENVIRONMENT=staging` in both example files and in each developer's two `.env.local` files, with the comment line restored from the toolkit's example files; then a line in the changelog.
