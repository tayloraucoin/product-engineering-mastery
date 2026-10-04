# As-built — STK-9

## Shipped against the contract

- C1: `test/rls.test.ts` (`yarn test:db`) migrates the local image, applies the setup SQL twice, creates two synthetic auth users, and checks that the bridge sets `app.user_id`, `app.user_role` and `authenticated` for the transaction only, that an owner-private policy hides and write-protects another user's note (an admin role included), and that a user reads only their own account row. An absent image fails in `before`, naming `yarn db:local`; nothing skips. Captured at batch close (`evidence/test-db.txt`): 6 of 6 pass against `supabase/postgres:17.11.0.003`, none skipped. The absent-image path was also observed earlier the same day, with Docker stopped: the `before` hook failed naming `yarn db:local` and all 6 tests were cancelled, none passed.
- C2: `scripts/auth-ddl.ts` flags any statement that creates, alters, drops, grants, comments, triggers, indexes or writes in `auth`, and allows only a foreign key to `auth.users` and a call to an argument-free auth function. `yarn check-migrations` runs it over `toolkit.json`'s `migrationsDir`; its tests fail a synthetic auth trigger and pass the generated set.
- C3: `packages/config/eslint/boundaries.js` adds the `db` element (may import `config`, `env`) and `SDK_OWNERS`: `postgres` and `drizzle-kit` may be imported only inside `packages/db`; anywhere else `no-restricted-imports` names the owner. `yarn lint:boundaries` passes.
- C4: `yarn verify` now runs `yarn check-migrations` after `check-stack`; run once at batch close.
- C5: `evidence/C5.md`: the generated migration holds one reference to `auth`, the foreign key from `public.users`, and no auth object; a re-run of `db:generate` finds no schema change.
- The rest of D-STK-5, by non-negotiable: `drizzle-orm` 0.45.2, `drizzle-kit` 0.31.10 and `postgres` 3.4.9 pinned exact; `src/schema/<domain>/<table>.ts` with policies from three factories in `src/policies.ts` (`ownerPrivatePolicies`, `ownerRowPolicies`, `serviceOnlyPolicies`); the bridge in `src/rls.ts`; the runtime client on the transaction pooler with `prepare: false`, migrations on the session pooler (`src/connection.ts` refuses the wrong port on a hosted tier); `supabase/setup/01` to `03`, idempotent, applied in order by `yarn db:setup`; `scripts/env.ts` the package's only `process.env` reader. The `toolkit.json` `db` entry and `docs/runbooks/remove-supabase-database.md` are filled.

## Deviations

- **devs_call, settled:** the example domains are `account/users` (one row per auth user, owner-row policies) and `notes/notes` (owner-private).
- **The local image is `supabase/postgres:17.11.0.003`, run by `yarn db:local` through Docker**, not the Supabase CLI: Mode A of D-STK-6 needs only the database. Pinned in `tech-stack.md`.
- **SDK ownership is enforced with `no-restricted-imports`, not a boundaries element rule.** eslint-plugin-boundaries 6.0.2 lets every third-party import through the `isUnknown` rule; per-element `no-restricted-imports` overrides are exact and name the owner in the message. Each later ticket adds its SDK to `SDK_OWNERS`.
- **`apps/*` may import every package**, as `boundaries.js` already allowed; the conventions table now says so instead of listing names.
- **`.env.example` was appended to without being read.** The repo's permission rules deny reading `.env*` files, so the six names (`DATABASE_URL`, `DATABASE_MIGRATION_URL`, each with `_LOCAL` and `_STAGING`) went in with `cat >>` after `check-client-bundle` showed none was there (Taylor's instruction, 2026-10-03). Each carries a comment saying what breaks without it; the `_LOCAL` values are the local image's synthetic URL. `check-client-bundle --plan` then reported no drift from `turbo.json`.
- **No `transpilePackages` entry in `apps/web/next.config.ts`:** no app imports `@pem/db` yet; STK-12 or STK-14 adds it with the first importer.
- **Tooling harness fix, made under STK-2:** the `db` entry is the first with a non-null runbook, and `toolkit.json` validation failed in every scratch-repo tooling test until the harness wrote each stack runbook (`tooling/lib/scratch-repo.ts`, `tooling/check-refs.test.ts`).

## Not verified

- C5 is a reading of generated SQL (`evidence/C5.md`).
- The setup SQL has run only through the integration test's `before`, never against a hosted Supabase project.

## Migrations

applied: pending

`migrations/0000_example_schema.sql` (`users`, `notes`, eight policies) and `supabase/setup/01` to `03`. Not applied to staging or production.

## Next

STK-10 adds the database guardrails and STK-11 the local auth mirror.
