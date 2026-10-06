# Review — mason on LAB-1

> Written by `yarn review:run mason LAB-1`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 863a59148797fa54c42b204eac568f6e99028198a4c51d3de5dd0198d4387e45
- as_built_sha256: 71778c4c3c8ab7dc152f36b36658a7ab57ecebb1f12452b13a2e9b9b71e504a9
- head: 34d619b7603f4a093f0e993806b5e1e2788ca144
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-06T18:41:58Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-1`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-1 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C1.log (sha256 29837fb6b3f4)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C2.log (sha256 8fab0f7e663f)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C3.log (sha256 8fab0f7e663f)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C4.log (sha256 8fab0f7e663f)
   - C5 check: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-001-sandbox-schema/evidence/C5.log (sha256 bd8dc6637c5f)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): packages/db/migrations/0000_example_schema.sql, packages/db/migrations/0001_stripe_events.sql, packages/db/migrations/0002_billing_entitlements.sql, packages/db/migrations/0003_sandbox_schema.sql, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/migrations/meta/0002_snapshot.json, packages/db/migrations/meta/0003_snapshot.json, packages/db/migrations/meta/_journal.json, packages/db/src/schema/index.test.ts, packages/db/src/schema/index.ts, packages/db/src/schema/sandbox/accesses.ts, packages/db/src/schema/sandbox/actions.ts, packages/db/src/schema/sandbox/columns.ts, packages/db/src/schema/sandbox/comments.ts, packages/db/src/schema/sandbox/gate-attempts.ts, packages/db/src/schema/sandbox/review-versions.ts, packages/db/src/schema/sandbox/reviewers.ts, packages/db/src/schema/sandbox/view-events.ts, packages/db/test/sandbox/schema.test.ts.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — LAB-1 sandbox-schema (mason, fresh context)

**Verdict up top: PASS.** The seven tables, the composite cascade, the identity and author checks, the deny-all policies and the forward-only migration all hold. Every as-built claim I checked against the code is true, including the two I expected to be loose (frontmatter added to the three `technical/` detail files does match `technical.md:2-3`, and `bytea` is defined once, not duplicated).

### Criteria

**C1 — met.** `packages/db/src/schema/index.test.ts:49-98` asserts the exact set of seven `sandbox_` names (`deepEqual` on the sorted list, so an eighth table would fail), `schema === undefined` for each, exactly one policy per table named `<table>_all_denied`, `for: "all"`, `to: authenticatedRole`, `using`/`withCheck` both `false`; no `reviewer|access|label|display` column and no FK on `sandbox_actions`; exactly four columns and no FK on `sandbox_gate_attempts`; no default on the comment and version ids; `parent_id` present with no FK. The migration agrees (`0003_sandbox_schema.sql:84-105` and the seven policies at `:127-133`). All seven files carry `...serviceOnlyPolicies(name)` last, and all seven are exported from `src/schema/index.ts:11-17`. C1.log subtests 24-27 pass, exit 0.

**C2 — met.** Checks are in SQL, not application code: slug at `0003:14,40,61,79,93`, identity at `0003:28`, one-author at `0003:64`, body ≤ 2000 at `0003:63`. `test/sandbox/schema.test.ts:148-249` refuses each by *named constraint* (the `refused` helper at `:136` asserts `constraint_name`), covering seven malformed slugs including the empty string, a 49-character slug, a bad slug on `sandbox_actions`, both-and-neither identity, two authors / none / `reviewer_id` without `access_id`, and a 2,001-character body — and takes the 48-character boundary case (`:174-175`). C2.log subtests 1-4 pass.

**C3 — met.** The cascade is structural: `(access_id, reviewer_id) → sandbox_accesses(id, reviewer_id)` and `(reviewer_id, slug) → sandbox_reviewers(id, slug)`, both `on delete cascade`, on all three child tables (`0003:108-114`), with the two uniques as targets (`0003:13,27`). `schema.test.ts:251-302` deletes one access and asserts the other access's view, comment and version survive, the reply to the erased root survives (`parent_id` has no FK), the reviewer stays, and that deleting the reviewer leaves zero. The deviation to composite keys is stricter than the contract asked for, not looser: under MATCH SIMPLE a team note (all three columns null) escapes both keys, which is the intended shape.

**C4 — met, with the evidence gap below.** `src/rls.ts:61` switches to `set local role authenticated`, so the policies genuinely apply rather than running as an RLS-bypassing owner; rows are inserted through the singleton first (`:305-320`), so the empty reads are meaningful. Select, update and delete return nothing on all seven tables for both `user` and `admin`.

**C5 — met.** `check-migrations` scans every file in the directory and reported `4 migration(s) … none touch the auth schema`, exit 0; `0003` references only `public.*`. Forward-only and correctly numbered: journal idx 3, `when` 1791310212020 > 0002's 1791253971852, and `0003_snapshot.prevId` = `0002_snapshot.id` (`0ac19aae-…`), which is the evidence that no earlier migration was regenerated. No `sandbox` DDL appears in 0000-0002.

### Findings

**Should-fix**

- `packages/db/test/sandbox/schema.test.ts:348-378` — C4 says "writes no row of any sandbox table", but insert refusal is proven on only four of the seven (`sandbox_reviewers`, `sandbox_comments`, `sandbox_actions`, `sandbox_gate_attempts`). `sandbox_accesses`, `sandbox_view_events` and `sandbox_review_versions` get update and delete coverage but no insert attempt. The policy is `FOR ALL … WITH CHECK (false)` and C1 asserts that policy on all seven, so this is incomplete proof rather than an open door — but at Q3 on personal data the criterion's "any" should be literal. Three more `assert.rejects` calls close it.

**Consider**

- `packages/db/test/sandbox/schema.test.ts:348` — the four RLS insert assertions are bare `assert.rejects` with no predicate, so a rejection for an unrelated reason would also pass. The file already has the named-constraint helper at `:136`; asserting the RLS error code would make these as specific as the C2 proofs.
- `packages/db/src/schema/sandbox/actions.ts:47` — only `at` is indexed, though the record of actions is read per experiment. Reversible, and indexes are the dev's call per the contract; worth adding when LAB-16 or the admin log queries it.
- `packages/db/src/schema/sandbox/columns.ts:16` — `slugIsValid` interpolates via `sql.raw`. Safe here because both operands are module constants, but this is a function agents will copy; one line in the doc comment saying the arguments must stay literals would keep a future call site from passing a value.

### Notes, not findings

Proofs were run at `ebff4de`; `HEAD` is `34d619b`, whose message says it carries only `results.json` and `as-built.md`. I confirmed no sandbox code exists outside the planned paths (`sandbox` appears in exactly the eleven expected files), but this venue is read-only, so staleness remains `yarn check-specs --strict`'s gate before the merge. The `tests: 67` / `tests: 37` headers in the evidence logs are the harness counting suites alongside tests (59+8, 30+7), not a builder defect.

VERDICT: PASS
