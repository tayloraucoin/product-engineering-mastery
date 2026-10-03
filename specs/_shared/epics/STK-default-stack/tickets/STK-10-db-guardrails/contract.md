---
id: STK-10
size: small
objective: "Agents cannot reset or drop a database and must ask before changing one."
slice_type: "Agent permissions; the risk is a destructive command on a hosted tier."
non_negotiables:
  - ".claude/settings.json denies db:reset, db:drop, drizzle-kit drop, supabase db reset, DROP SCHEMA and DROP DATABASE."
  - "It asks before db:migrate, db:push, db:seed, db:setup and raw drizzle-kit migrate or push."
  - "reset-local-db refuses any tier but local before reading a URL."
  - "check-settings and the hook tests cover the new rules."
  - "The denial message names the right move."
devs_call: "Rule wording inside the settings file."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-18"
truth_files: "none: no living UX file covers the starter's own stack"
reviewers: []
planned_paths:
  - ".claude/settings.json"
  - "tooling/check-settings.ts"
  - "tooling/hooks/**"
  - "tooling/test-hooks.ts"
  - "tooling/fixtures/**"
  - "packages/db/scripts/reset-local-db.ts"
  - "docs/engineering/templates/settings.template.json"
depends_on:
  - STK-9
out_of_scope:
  - "Network allowlist changes."
  - "Permissions for any other vendor."
criteria:
  - id: C1
    statement: "reset-local-db exits before connecting when the tier is staging or production."
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The settings file passes check-settings with the new deny and ask rules."
    evidence: check
    command: "yarn check-settings"
  - id: C3
    statement: "The hook tests cover a denied reset and an asked migrate."
    evidence: check
    command: "yarn test:hooks"
  - id: C4
    statement: "Tooling tests pass."
    evidence: test
    command: "yarn test:tooling"
---

# Contract — STK-0 db-guardrails

## Notes

The sandbox blocks agents from writing .claude/settings.json; the builder drafts the change and Taylor applies it, which the as-built records.
