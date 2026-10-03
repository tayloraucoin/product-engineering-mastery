Venue: Claude Code, in product-engineering-mastery, branch agent/STK

# STK research 3 — Users in a local database when sign-in runs on a hosted project

**Model:** deepest available. A smaller model will describe the patches without finding why each was needed.

**Role.** Read `docs/roles/engineering/warden-security-privacy-engineer.md` first, with `docs/prompts/shared-context.md`. You are Warden: this is an authentication seam, and a shortcut here becomes a hole in production.

**Support.** Mason (`docs/roles/engineering/mason-cto-principal-dev.md`), consulted for where the code lives and what the migration set may contain only. Millwright (`docs/roles/engineering/millwright-platform-engineer.md`), consulted for running Supabase locally only. Consult, never co-pilot.

**Attached.**

| File                                                                  | Reason                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/brief.md`                      | Knowledge gap 3, the question as asked                |
| `specs/_shared/epics/STK-default-stack/research/prior-repos-audit.md` | The database and auth rows: what each repo patched in |
| `docs/workflows/templates/research-note.template.md`                  | What this thread writes                               |

**Sources in the product repos (read-only; never open a `.env` file other than `.env.example`).**

| Repo                                                                                                      | Read                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/Users/taylor/lighthouse/synapse`                                                                        | `packages/db/src/local-dev/ensure-local-user-from-supabase-auth.ts`; `packages/db/migrations/0000_*.sql` (the hand-edited `auth` stub); `packages/db/src/schema/auth.ts`; `packages/db/supabase/setup/01_init_functions.sql` (`handle_new_user`); `packages/db/scripts/seed-users.ts`; `packages/db/SETUP.md`; `packages/auth/src/` |
| `/Users/taylor/lighthouse/conscious-connections/conscious-connections`                                    | `packages/db/src/local-dev/ensure-dev-*.ts`; `packages/db/SETUP.md` section 3 (the trap and Options A to C); `packages/db/scripts/seed-users.ts`                                                                                                                                                                                    |
| `/Users/taylor/lighthouse/_archive/cho-ventures/cho-verse` (read from `main` with `git show main:<path>`) | `packages/db/src/ensure-local-user-from-supabase-auth.ts`; `packages/db/prisma.config.ts` (the shadow bootstrap of `auth`)                                                                                                                                                                                                          |

**The owner's constraint.** Taylor works alone most of the time and prefers sign-in against the hosted staging project while data is local: nothing differs when it goes to production, and it costs nothing. A team needs a setup that depends on nobody's hosted accounts. Both must work, and the mimicry must live in one dedicated, named file, not spread across migrations, seeds and scripts.

**Decision served.** The one supported design for local users in the starter's `@pem/db` and `@pem/auth`, and whether the Supabase CLI (`supabase start`) is the default local setup, an option, or absent. Taylor decides; the Technical stage acts on it.

**The ask.**

1. Reconstruct the problem exactly: with a local Postgres and hosted sign-in, which objects are missing locally (the `auth` schema, `auth.users`, roles, `auth.uid()`, the new-user trigger), and what breaks at each: migrations, foreign keys, policies, first sign-in, seeds.
2. List every patch the three repos applied, with file and line, what it fixes and what it costs to keep (for example, a migration that must be re-edited after every regenerate).
3. Design the clean form for mode A, local data with hosted staging sign-in: one module that owns the local `auth` stub and the user mirror; how it is applied without hand-editing a generated migration; the guard that makes it impossible to run against staging or production.
4. Design mode B, fully local with `supabase start`, as of the CLI version current today, dated: what the mimicry module becomes (ideally nothing), what `config.toml` holds, how seeded users are created, and what it costs in setup time and machine resources.
5. Say how one repo supports both modes behind the tier switch without two code paths in application code.
6. List every file and variable the design adds, and which of them are deleted when Supabase Auth is removed from a product, when the Supabase database is removed, and when both are.
7. Recommend the default mode. Give the revisit trigger.

**Writes.** `specs/_shared/epics/STK-default-stack/research/local-auth-users.md`, from `docs/workflows/templates/research-note.template.md`.

**Gate.** The note names one design with its file list, or says what was not found. Taylor reads it.

**Handoff.** Print: "Research note written. Next: `prompts/03-technical.md`, in a new thread."

**Evidence rules.** Code read from the repos is verified, with path and line. Supabase CLI and Drizzle behaviour comes from their docs, dated and versioned. Label each claim verified, secondary or judgment. Not found is marked, never filled.

**Not wanted.**

- Any edit outside the research note: no code, no migrations, no change to the product repos.
- A replacement auth vendor; removal is covered by the guide, not here.
- A design that needs a secret committed or a production credential on a developer machine.
- Reading or printing the contents of any `.env` file.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example. Every claim about tool behaviour carries the version and date it was verified on.
