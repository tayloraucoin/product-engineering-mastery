---
id: STK-11
size: small
objective: "Users exist in a local database while sign-in runs on hosted staging, through one guarded file; fully local is one config away."
slice_type: "Authentication seam; the risk is a write to a hosted auth.users or a stub that drifts from Supabase."
non_negotiables:
  - "supabase CLI pinned exact; db:local starts the database container only; db:local:full starts the stack."
  - "packages/db/src/local-auth-mirror.ts is the only writer to auth.users; it never reads process.env."
  - "The INSERT itself refuses when auth.identities exists or the marker table is absent."
  - "applyLocalAuthMirror refuses a non-loopback host."
  - "db:seed-users refuses when the auth URL is not loopback."
  - "config.toml disables CLI migrations and seeds; Drizzle owns public."
  - "The _LOCAL auth variables select the mode; there is no mode variable."
devs_call: "Marker table name and the per-process cache of mirrored ids."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-6"
  - "D-STK-3"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers:
  - mason
  - vigil
  - warden
planned_paths:
  - "packages/db/src/local-auth-mirror.ts"
  - "packages/db/src/local-auth-mirror.test.ts"
  - "packages/db/test/**"
  - "packages/db/scripts/**"
  - "packages/db/supabase/config.toml"
  - "packages/db/supabase/setup/04_users_backfill.sql"
  - "packages/db/supabase/.gitignore"
  - "packages/db/package.json"
  - "toolkit.json"
  - "package.json"
  - ".env.example"
  - "turbo.json"
  - "docs/runbooks/remove-supabase-auth.md"
  - "docs/runbooks/remove-supabase-database.md"
  - "docs/runbooks/new-project.md"
  - "docs/engineering/tech-stack.md"
  - "yarn.lock"
depends_on:
  - STK-9
out_of_scope:
  - "The @pem/auth request seam that calls the mirror (STK-12)."
  - "Replaying staging sign-ups, deletions or hooks locally."
criteria:
  - id: C1
    statement: "yarn test:db against the local image shows the mirror inserting id and email only, upserting on email change, and inserting zero rows when auth.identities exists or the marker is absent; none skipped."
    evidence: capture
    path: "specs/_shared/epics/STK-default-stack/tickets/STK-11-local-auth-mirror/evidence/test-db.txt"
  - id: C2
    statement: "applyLocalAuthMirror and db:seed-users refuse a non-loopback target before connecting."
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Types and the full chain pass."
    evidence: check
    command: "yarn verify"
  - id: C4
    statement: "A fresh db:reset in mode A ends with a signed-in staging user's row in the local public.users."
    evidence: manual
    reason: "needs a staging sign-in by a person"
  - id: C5
    statement: "Following remove-supabase-database.md on a scratch copy leaves grep for drizzle and supabase empty and verify green."
    evidence: manual
    reason: "a removal rehearsal on a copy is done by a person"
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
tier: 2
---

# Contract — STK-11 local-auth-mirror

## Notes

The design is settled in technical.md D-STK-6; the research behind it is not attached to a build thread. Both removal runbooks get their Supabase file lists here, and the manifest entries list this ticket's files.
