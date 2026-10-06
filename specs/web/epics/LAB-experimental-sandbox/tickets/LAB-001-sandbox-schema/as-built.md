# As-built — LAB-1

## Shipped against the contract

- C1: seven tables, one file each in `packages/db/src/schema/sandbox/` (`reviewers`, `accesses`, `view-events`, `comments`, `review-versions`, `actions`, `gate-attempts`), plus `columns.ts` for the shared slug check and a `bytea` custom type. All exported from `schema/index.ts`, each ending in `serviceOnlyPolicies`. `src/schema/index.test.ts` asserts the seven names, public schema, exactly one `<table>_all_denied` policy for all to `authenticated` with `false` both ways, no reviewer, access or label column and no foreign key on `sandbox_actions`, exactly four columns and no foreign key on `sandbox_gate_attempts`, no default on the comment and version ids, and `parent_id` with no foreign key.
- C2: `test/sandbox/schema.test.ts` shows each of these refused by its named constraint: seven bad slugs, a 49-character slug (one of 48 is accepted), a bad slug on `sandbox_actions`, an access with both or neither of email and user id, and a comment with both authors, no author, or a reviewer id with no access id. A 2,001-character body is refused too.
- C3: deleting one access removes its view, comment and version, and keeps the same reviewer's rows from a second access. A reply whose root was erased survives. Deleting the reviewer leaves nothing.
- C4: as `user`, `developer` and `admin` through the bridge, every one of the seven tables reads empty, every update and delete touches no row, and a well-formed insert is refused with 42501 (row-level security). Every table holds rows during the test, including a team note and an action written by the same user.
- C5: `yarn check-migrations` passes: four migrations, none touching the auth schema. `0003_sandbox_schema.sql` came from `yarn db:generate`, numbered after `0002_billing_entitlements`, and no applied migration was edited.

## Deviations

- **Composite keys (the dev's call on columns, made stricter).** Each view, reviewer comment and version references `(access_id, reviewer_id)` → `sandbox_accesses (id, reviewer_id)` and `(reviewer_id, slug)` → `sandbox_reviewers (id, slug)`, both `on delete cascade`, in place of separate single-column keys. A row therefore cannot claim another reviewer's access or another slug. Two uniques serve as targets: `sandbox_reviewers_id_slug_key` and `sandbox_accesses_id_reviewer_key`. A team note has null in all three columns, so under MATCH SIMPLE neither key applies to it.
- `team_user_id` → `public.users` on delete cascade: an account's deletion takes its team notes. `sandbox_accesses.user_id` → `public.users` on delete cascade: deleting a signed-in reviewer's account erases their accesses, and the rows through them. `actor_user_id` has no foreign key, so the record of actions outlives the account.
- `first_design` and `last_design` are nullable, because the first design is drawn on the first visit (experiment.md), not when the reviewer is created.
- jsonb is typed with `$type`: `SandboxAnchor`, `SandboxAnswers` (`Record<string, unknown>`, typed by the review tickets), `SandboxTriage`, `SandboxActionCounts`. `triage` is not null, with no default.
- `[ASSUMPTION]` The detail files `technical/data-contract.md`, `gate.md` and `placement.md` had no frontmatter, so `contract:init` refused to start the ticket. They now carry `epic: LAB` and `status: approved`, the status of their parent `technical.md`.
- **After the first reviews (mason, warden, both PASS):**
  - C4 now attempts an insert into all seven tables, not four. It asserts the RLS error code rather than any rejection, and covers `developer`.
  - `SandboxActionCounts` takes only the names in `SANDBOX_ACTION_COUNT_NAMES`, so no count key can be built from an erased email. A later ticket that needs a new name adds it there. No SQL check is possible (warden).
  - `slugIsValid` notes that `sql.raw` is safe only with its module constants.
  - Not changed: an index on `sandbox_actions (slug, at)` waits for LAB-16 or the admin log to query it, so migration 0003 stays as reviewed.
- **The local database had drifted.** It held a pre-review draft of `0002` (journal `when` 1791252457055, before the committed file's 1791253971852, and no `stripe_events_processed_at_idx`), so the migrator replayed 0002 and failed. It held no rows anywhere (`public` and `auth.users` at 0), so `yarn db:local:reset` rebuilt it from the committed migrations before the proofs ran.

## Migrations

- applied: n/a (the local database only; no hosted project exists. The operator applies it to a hosted project.)

## Not verified

- `review:mason` and `review:warden` are manual criteria, recorded by `yarn review:run`.
- Behaviour under concurrent writes: no criterion asks for it. Erasure's label and email scrubbing is LAB-16's job.

## Next

LAB-3 builds `@pem/db/sandbox` on these tables. Points the reviews raised for later tickets:

- LAB-16 decides whether `display_name` is cleared when a reviewer is revoked and relabelled. It also asserts that its erasure's `sandbox_actions` row holds no key or value matching the erased email.
- LAB-25 resolves a reply's root only inside the rows already scoped to the viewer, never by looking up the browser-minted `parent_id` directly.
- The 2 KB `anchor` cap (LAB-12) and any `triage` cap (LAB-17) are enforced in their write paths; the database bounds only `body`.
