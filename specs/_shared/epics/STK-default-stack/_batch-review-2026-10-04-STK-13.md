# Batch review — STK-13, 2026-10-04

Vigil subagent, fresh context, handed the contract, results, evidence and the changed-file list. Its reply, as returned:

STK-13 tier 1 batch review: validators and services. Judged from the files only. It passes, with two Should-fix items, both stale docs, and five Consider items.

## Criteria

- **C1: met.** `packages/services/src/notes/notes.test.ts` runs against the fake ctx in `test-context.ts`, which answers through drizzle's pg-proxy driver.
  - An empty answer makes `getNote` throw `NotFound` (lines 22-32).
  - A 42501 error makes `createNote` throw `Forbidden`, bare (lines 34-43) or wrapped by drizzle (lines 45-52).
  - All of these pass in C1.log and again in C4.log. The policy itself is left to STK-9 C1, as the contract says.
- **C2: met.**
  - `packages/validators/src/notes/notes.test.ts` names `body`, `id` and `limit` as the failing field.
  - The services test (lines 81-100) shows `Invalid.fields` holds exactly that one key, and that no query runs (`ctx.calls.length === 0`).
- **C3: met.**
  - In `boundaries.js`, `PACKAGE_IMPORTS.services` is `config, validators, db` (line 90).
  - `TRANSPORT_FREE` bans `next`, `react`, `react-dom` and `@trpc/*` in services (lines 105-106 and 149-166).
  - C3.log exits 0. The boundaries probes in C4.log (tests 4-9) show `next/server`, `react` and `@trpc/server` refused in services, and the allowed imports still passing.
- **C4: met.** C4.log runs the whole of `yarn verify` and exits 0. Lint, check-types and build were turbo cache hits, which is legitimate: turbo keys each cached result on its inputs.

## Non-negotiables

- **Precondition (routed call 3): met.** technical.md line 48 records it as ratified on 2026-10-03, and the as-built cites it.
- **Own package, no `next`, `@trpc/*` or `react`: met.** A grep of `packages/services/src` finds only `drizzle-orm`, `zod`, `@pem/db/*` and `@pem/validators/*` imports, and the lint enforces the ban.
- **ctx holds user, role and the RLS-scoped db: met.** `context.ts` lines 11-30: `createServiceContext` builds the scoped db through `createRlsClient`, which checks the user id and role before any query runs.
- **Typed errors from one module: met.** `errors.ts` defines `NotFound`, `Forbidden`, `Conflict` and `Invalid` on `DomainError`. `toDomainError` maps 42501 to Forbidden and 23505 to Conflict.
- **Each shape defined once: met.** The services import the schemas and the `NoteOutput` type from `@pem/validators/notes`. `noteColumns` in `notes.ts` is a column selection, not a second copy of the shape.
- **One domain with create, read and list: met.** `createNote`, `getNote` and `listNotes`.

The two logged deviations are acceptable: services may not import `@pem/auth` (a tighter graph than D-STK-1 allows), and services owns its `drizzle-orm` import. Neither is a defect.

## Findings

**Blocking:** none.

**Should-fix**

1. **`docs/engineering/tech-stack.md` line 44 is now false.** It says `drizzle-orm` is pinned exact in "`@pem/db` only", but `packages/services/package.json` line 28 now depends on `drizzle-orm` 0.45.2. `.claude/rules/deps.md` requires the row to name the owner. Fix: "exact in `@pem/db` and `@pem/services`". Owner: the builder.
2. **The database removal runbook is now wrong.** `docs/runbooks/remove-supabase-database.md` line 59 says no other workspace lists `@pem/db` or `drizzle-orm`. `@pem/services` now lists both and imports `@pem/db/schema` and `@pem/db/rls`.
   - Following the runbook (toolkit.json `db`: `locked: false`) would leave services unable to compile, and `yarn check-stack` would flag both dependencies as leftovers (`tooling/check-stack.ts`, around line 192).
   - D-STK-19 says the ticket that makes a line untrue updates it. Fix: add a services step to the runbook (rewrite or remove the example domain).
   - Not Blocking: nobody runs this runbook until a product removes the database, and STK-20's dry-run would catch it. Owner: the builder, or STK-20.

**Consider**

3. **The singleton ban is not enforced.** `codebase-conventions.md` line 99 says a service "never reaches the unscoped database singleton", but the `services → db` edge also allows importing `getDb` from `@pem/db/client`. `context.ts` line 8 needs only a type import from there, so a lint rule could ban value imports of `@pem/db/client` in services and still allow `import type`.
4. **`listNotes` relies on RLS alone** (`notes.ts` lines 77-91). That is correct under `ownerPrivatePolicies`, but this file is the pattern products copy. On a table with `ownerRowPolicies` (admins read every row), the same code would return everyone's rows to an admin, while its doc comment says "the caller's notes". An explicit `where ownerId = ctx.userId` filter, or a note on the pattern, would close that.
5. **`createNote` throws `NotFound("The note was not saved.")` when no row comes back** (`notes.ts` line 51). Under RLS, an insert whose returned row the select policy hides raises 42501, so the branch is effectively unreachable; if it fires, NotFound is the wrong kind for a failed write.
6. **Some validator messages leak into what a user sees.**
   - `listNotesInput.limit` (`validators/src/notes/notes.ts` lines 31-38) uses zod's default messages for `int()` and `min(1)`.
   - "Keep the note under 10,000 characters" is slightly wrong: exactly 10,000 is allowed.
   - A non-object input such as `null` becomes `Invalid` with the key `_`, so the message reads "Check _: …" (`parse-input.ts` line 17).
7. **C4's command breaks a house rule.** `.claude/rules/specs.md` says "`yarn verify` is never a criterion", yet the contract uses it as C4's command. The proof covers more than the criterion asks; future contracts should name `yarn check-types` and `yarn build`.

## Not verified

- The services against the real database. The as-built says so; STK-14 will be the first real caller.
- Dynamic `import()` of a transport in services: `no-restricted-imports` does not cover it. Theoretical; nothing in the code does it.

VERDICT: PASS
