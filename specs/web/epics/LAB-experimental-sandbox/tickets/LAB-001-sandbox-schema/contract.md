---
id: LAB-1
size: small
objective: "The seven sandbox_ tables exist in @pem/db, service-only, with one forward migration, so every later LAB ticket reads and writes a fixed shape."
slice_type: "Schema and migration on personal data (one-way doors 2 and 6); the risk is a shape that lets erasure miss a copy, or a migration that must later be rewritten."
non_negotiables:
  - "Seven tables, each prefixed sandbox_, one file each under packages/db/src/schema/sandbox/, exported from schema/index.ts, each carrying serviceOnlyPolicies."
  - "No experiments table: slug is text, checked in SQL against ^[a-z0-9]+(-[a-z0-9]+)*$ and at most 48 characters."
  - "Accesses reference their reviewer with on delete cascade; every view, reviewer comment and review version references both reviewer_id and access_id, cascading from the access."
  - "Check constraints: an access holds exactly one of email or user_id; a comment holds exactly one author (reviewer_id with access_id, or team_user_id)."
  - "sandbox_actions has no reviewer column of any kind; sandbox_gate_attempts has no slug and no foreign key."
  - "Comment and version ids have no default (the browser mints them); comments.parent_id ships now, with no foreign key."
  - "One forward migration from yarn db:generate, numbered after the branch's latest; no applied migration edited, no DDL on the auth schema."
devs_call: "Column names beyond those data-contract.md names, indexes, jsonb typing of anchor, answers, triage and counts, and whether team_user_id and actor_user_id reference public.users."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md"
  - "D-LAB-36"
  - "D-LAB-37"
truth_files: "none: schema only; no living UX file changes"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "deleting an access cascades to every view, comment and version that came through it (warden)"
  - "sandbox_actions and sandbox_gate_attempts hold no reviewer column and no slug link (warden)"
  - "the migration is forward-only and numbered after the branch's latest (mason)"
operator_review: false
planned_paths:
  - "packages/db/src/schema/sandbox/**"
  - "packages/db/src/schema/index.ts"
  - "packages/db/src/schema/index.test.ts"
  - "packages/db/migrations/**"
  - "packages/db/test/sandbox/schema.test.ts"
depends_on: []
out_of_scope:
  - "Query functions and the Viewer type: LAB-3."
  - "The developer role: LAB-2."
  - "Label and emails-used scrubbing on erasure: LAB-16, in code, not SQL."
  - "Applying the migration to any hosted project: the operator's step (no staging project exists)."
criteria:
  - id: C1
    statement: "The schema exports seven sandbox_ tables, each in public with service-only policies; sandbox_actions has no reviewer column and sandbox_gate_attempts no slug and no foreign key."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C2
    statement: "On the local database after the migration, a bad or over-long slug, an access with both or neither of email and user_id, and a comment with two authors or none are each refused."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: "Deleting one access removes every view, comment and review version that came through it, and keeps the same reviewer's rows from their other access."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C4
    statement: "A bridged user (user, admin) reads and writes no row of any sandbox table."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "The new migration touches no auth-schema object."
    evidence: check
    command: "yarn check-migrations"
---

# Contract — LAB-1 sandbox-schema

## Build notes

- **Approach:** one file per table in `packages/db/src/schema/sandbox/`, each with a header comment on purpose and retention, modelled on `packages/db/src/schema/billing/stripe-events.ts` (checks in `check()`, `...serviceOnlyPolicies(name)` last). Export all seven from `schema/index.ts`. Generate with `yarn db:generate`, then read the SQL for every cascade, check and unique. The existing `src/schema/index.test.ts` already asserts public schema and policies on every export; C1 adds the sandbox specifics. C2 to C4 sit in `test/sandbox/schema.test.ts`, on the pattern of `test/stripe-event-ledger.test.ts` (migrate, then insert as the singleton, then try the bridge).
- **Decisions that apply:**
  - D-LAB-36 (R4): "Seven `sandbox_` tables keyed by slug; variant tag and `parent_id` on comments from beat 1; hard delete; codes rotated in place; a record with no reviewer column; erasure by access row, scrubbing labels and emails used."
  - D-LAB-37 (R5): "The reviewer is the reviewer row (one code at a time); each gate entry records its email or user id per device, and every row carries both."
  - D-LAB-28: "The record of actions never names a reviewer or an email."
  - Threads (data-contract.md): "`parent_id` has no foreign key, a reply always points at its root (one level), and a reply copies its root's `design` and `anchor`." Beat 2 adds no migration.
- **Interfaces:** `sandboxReviewers`, `sandboxAccesses`, `sandboxViewEvents`, `sandboxComments`, `sandboxReviewVersions`, `sandboxActions`, `sandboxGateAttempts`, with the columns in data-contract.md's Tables section, plus their `$inferSelect` types.
- **Per path:**
  - `schema/sandbox/<table>.ts`: one table each, kebab-case file names.
  - `schema/index.ts`: seven export lines.
  - `migrations/`: the generated SQL and its `meta/` snapshot.
  - `test/sandbox/schema.test.ts`: C2 to C4, test names starting with the criterion id.
- **Gotchas:**
  - `agent/LAB` is behind `feature/conventions-setup`, which already holds `0002_billing_entitlements.sql`. If the branch is not synced when you start, ask the operator before generating, or the numbers collide.
  - `code_hash` is `bytea`, unique, unsalted (gate.md: SHA-256 of the normalised code). `code_version` is an integer starting at 1.
  - `kind` on views is `load` or `switch`. On comments it is null or one of `problem`, `question`, `suggestion`, `keep`. `body` is at most 2,000 characters, as a SQL check.
  - Version `number` is unique per reviewer. `design` is the config's design id as text, never a foreign key.
  - `sandbox_gate_attempts.key_hash` is a `bytea` primary key. Rows expire within 30 minutes, deleted in code by LAB-6.
  - `test:db` runs on the local database only (Postgres.app; Docker is down). Never point it at a hosted project.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to miss a cascade path or put a default on a client-minted id.
