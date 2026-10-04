---
id: STK-9
size: small
objective: "@pem/db on Drizzle and Supabase with policies beside tables, the bridge and the setup SQL."
slice_type: "Schema and data layer; the risk is a query that bypasses row-level security or a migration touching auth."
non_negotiables:
  - "drizzle-orm and drizzle-kit pinned exact per tech-stack.md; schema at src/schema/<domain>/<table>.ts with policies from three factories beside each table."
  - "All user-scoped queries go through the bridge in src/rls.ts; the singleton db is used only by the API context and seeds."
  - "authUsers is imported from drizzle-orm/supabase and never exported; the migration set holds no DDL against auth."
  - "Runtime uses the transaction pooler with prepare off; migrations use the session pooler."
  - "supabase/setup SQL is idempotent and applied in order by db:setup."
  - "migrationsDir is set in toolkit.json, and yarn verify runs yarn check-migrations."
  - "yarn test:db runs the database integration tests against the local Supabase image and fails, never skips, when the image is absent; yarn test excludes them."
devs_call: "Domain names of the example schema (one users table, one owned table)."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-5"
  - "D-STK-16"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - mason
  - vigil
  - warden
planned_paths:
  - "packages/db/**"
  - "toolkit.json"
  - "package.json"
  - "turbo.json"
  - ".env.example"
  - "apps/web/next.config.ts"
  - "packages/config/eslint/boundaries.js"
  - "docs/engineering/tech-stack.md"
  - "docs/runbooks/remove-supabase-database.md"
  - "docs/engineering/codebase-conventions.md"
  - "yarn.lock"
depends_on:
  - STK-4
out_of_scope:
  - "The local-user mirror and config.toml (STK-11)."
  - "Agent settings (STK-10)."
  - "Any product schema."
  - "Starting the Supabase image in CI."
criteria:
  - id: C1
    statement: "yarn test:db against the local image shows the bridge setting app.user_id, app.user_role and the role for the transaction, and an owner-private policy hiding another user's row; the log shows every test executed, none skipped."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-9-db-package/evidence/test-db.txt"
  - id: C2
    statement: "check-migrations fails on a migration with DDL against auth and passes the generated set."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Boundaries pass with postgres and drizzle-kit owned by db."
    evidence: check
    command: "yarn lint:boundaries"
  - id: C4
    statement: "Types, build and the full chain pass."
    evidence: check
    command: "yarn verify"
  - id: C5
    statement: "db:generate on the example schema produces no auth objects."
    evidence: manual
    reason: "drizzle-kit runs against a database; its output is read by a person"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — STK-9 db-package

## Notes

Integration tests run only under yarn test:db, against the image db:local starts; an absent image is a failure naming db:local, never a skip. Fill the removal runbook's file list.
