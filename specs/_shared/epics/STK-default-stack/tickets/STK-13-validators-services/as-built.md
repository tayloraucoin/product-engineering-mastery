# As-built — STK-13

Built under routed call 3 as ratified on 2026-10-03 (technical.md, "Calls routed to Taylor" 3): `@pem/services` is its own package.

## Shipped against the contract

- C1: `packages/services/src/notes/notes.ts` exports `createNote`, `getNote` and `listNotes`, each `(ctx, input)`. Tests in `notes.test.ts` run against a fake ctx (`src/test-context.ts`) whose db answers through drizzle's `pg-proxy` driver as scripted:
  - No row, as row-level security returns for another user's note: `getNote` throws `NotFound`.
  - Postgres's `42501`, the policy refusal: `createNote` throws `Forbidden`, whether bare or wrapped by drizzle.
  - Further tests check that the insert's owner is the caller, the list's order and limit, and that a fault that is no domain error is not turned into one.
  - The policies themselves are STK-9 C1's proof.
- C2: `packages/validators/src/notes/notes.ts` defines `createNoteInput`, `getNoteInput`, `listNotesInput` and `noteOutput`, once. `fieldErrors` maps a zod error to `{ field: messages }`.
  - `notes.test.ts` (validators): an empty, blank or over-long body fails on `body`; a malformed id on `id`; a limit out of range on `limit`.
  - The services suite: each service throws `Invalid` with `fields` naming that one field, and no query runs.
- C3: `boundaries.js` adds `validators` (`config`) and `services` (`config`, `validators`, `db`). `TRANSPORT_FREE` bans `next`, `react`, `react-dom` and `@trpc/*` in `services`, on top of the SDK bans. `tooling/boundaries.test.ts` gains eight probes:
  - `next/server`, `react` and `@trpc/server` are refused in services.
  - `services → auth`, `validators → db` and `db → services` are refused.
  - services may import validators, db, drizzle-orm and zod, and the app may import services.
- C4: `yarn verify` runs the types and the build.
- Non-negotiables:
  - **ctx** (`src/context.ts`): `ServiceContext = { userId, role, db: RlsClient }`. `createServiceContext(db, { userId, role })` scopes the runtime client through `@pem/db/rls`.
  - **Errors** (`src/errors.ts`): `NotFound`, `Forbidden`, `Conflict` and `Invalid`, all extending `DomainError` with a `code`. `toDomainError` maps `42501` to Forbidden and `23505` to Conflict, reading through drizzle's wrapper to its cause.
  - **One domain:** notes, on STK-9's `notes` table, for STK-14 and STK-16.
- devs_call:
  - Service names are verb plus noun (`createNote`, `getNote`, `listNotes`).
  - Each service takes raw `input: unknown` and parses it itself, so no transport can skip validation.
  - ctx carries `userId` and `role`, the field names of `AuthContext` and `RlsContext`.
- Versions: `zod` 4.6.5, pinned exact in both packages, and `drizzle-orm` 0.45.2, exact in services (verified 2026-10-04). Manifest entries `validators` and `services` were added, both locked. Conventions §4 rows are now built, and the tech-stack's "Validation" absence row is gone.

## Deviations

- **[ASSUMPTION] Services may not import `@pem/auth`**, though the graph puts auth below them. The transport turns the request's `AuthContext` into a ctx, so no service needs Supabase. A product that needs it adds the edge.
- **`@pem/services` imports `drizzle-orm`** to build queries on the RLS transaction. D-STK-16 pins no owner for it; `postgres` and `drizzle-kit` stay `db`'s.
- **drizzle 0.45.2 wraps every query error in its own error, with the driver's as `cause`** (seen in this ticket's test on 2026-10-04). `toDomainError` walks up to three causes for the Postgres code.
- **`notes.createdAt` and `updatedAt` are returned as `Date`.** A transport serializes them; STK-14's tRPC transformer decides how.
- **Paths added to `planned_paths`:** `docs/engineering/tech-stack.md`, `tooling/boundaries.test.ts` and `yarn.lock`.

## Not verified

- The services against the real database. C1 fakes the db by design; STK-9 C1 proves the policies on the local image. STK-14's procedures will be the first real callers.

## Next

STK-14 builds `@pem/api`: each procedure calls one service with `createServiceContext(getDb(…), authContext)` and maps `DomainError.code` to a tRPC code.
