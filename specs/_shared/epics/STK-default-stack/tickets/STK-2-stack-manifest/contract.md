---
id: STK-2
size: small
objective: Give every stack module a manifest and a check, so removing one provably leaves nothing behind.
slice_type: Repo tooling; the risk is a check that passes while leftovers remain.
non_negotiables:
  - The stack block lives in toolkit.json and is read through tooling/lib/toolkit.ts.
  - A module entry carries files, env, dependencies, boundaries, locked and runbook.
  - check-stack fails on a present module with a missing file, and on a removed module with any file, variable or dependency still present.
  - A locked module cannot be marked removed.
  - A locked module's runbook is null; C5 checks only non-null runbook paths.
  - yarn verify runs check-stack.
  - The manifest lists only modules that exist today; later tickets add their own.
devs_call: The entry's exact field names and how a module is marked removed.
cites:
  - specs/_shared/epics/STK-default-stack/technical.md
  - D-STK-13
truth_files: "none: repo tooling has no living UX file"
reviewers: []
planned_paths:
  - toolkit.json
  - package.json
  - tooling/check-stack.ts
  - tooling/check-stack.test.ts
  - tooling/lib/toolkit.ts
  - tooling/fixtures/stack/**
  - docs/engineering/templates/toolkit.template.json
  - tooling/lib/scratch-repo.ts
  - tooling/check-refs.test.ts
depends_on: []
out_of_scope:
  - Writing any module's code or its removal runbook.
  - Deleting files; the check reports and never removes.
criteria:
  - id: C1
    statement: A fixture with a present module missing a listed file fails, naming the module and the file.
    evidence: test
    command: yarn test:tooling
  - id: C2
    statement: A fixture with a removed module that still has a listed file, an env name in .env.example or turbo.json, or a dependency in any package.json fails, naming each leftover.
    evidence: test
    command: yarn test:tooling
  - id: C3
    statement: A fixture marking a locked module removed fails.
    evidence: test
    command: yarn test:tooling
  - id: C4
    statement: A fixture entry missing any of files, env, dependencies, boundaries, locked or runbook fails, naming the field.
    evidence: test
    command: yarn test:tooling
  - id: C5
    statement: A fixture whose runbook path does not exist fails, naming the path.
    evidence: test
    command: yarn test:tooling
  - id: C6
    statement: Tooling types pass.
    evidence: check
    command: yarn check-types:tooling
  - id: C7
    statement: The full verify chain passes with check-stack in it.
    evidence: check
    command: yarn verify
tier: 1
---

# Contract — STK-2 stack-manifest

## Notes

Name each test after its criterion (C1 to C5). Follow the fixture pattern of tooling/check-specs.ts. Today's modules are config and ui only.
check-stack treats a missing .env.example as no variables present; STK-4 creates it.
