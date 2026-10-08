---
id: MIG-17
size: small
objective: "The layout probe answers which spine files exist, and session-start.ts and check-refs.ts read the spine from it instead of each checking the three paths themselves."
slice_type: "Repo tooling and a hook (tooling/hooks/**, a one-way door); the risk is a session-start line that changes at starter."
non_negotiables:
  - "probeLayout(root) gains `spine`: the subset of AGENTS.md, CLAUDE.md and docs/index.md that exists, in that order; node built-ins only."
  - "At starter session-start.ts prints byte for byte the line it prints today."
devs_call: "Whether check-refs.ts moves in the same ticket or only session-start.ts."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical/overlay.md"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - warden
focus: []
operator_review: false
planned_paths:
  - "tooling/lib/layout.ts"
  - "tooling/lib/layout.test.ts"
  - "tooling/hooks/session-start.ts"
  - "tooling/check-refs.ts"
depends_on:
  - MIG-1
  - MIG-2
out_of_scope:
  - "Anything else the probe answers."
criteria:
  - id: C1
    statement: "probeLayout reports the spine files that exist on a synthetic root with docs/index.md absent."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "The session-start fixtures and MIG-2's overlay spine cases still pass."
    evidence: check
    command: "yarn test:hooks"
---

# Contract — MIG-17 spine-from-probe

## Build notes

- **Approach:** from MIG-2's as-built (a deviation). MIG-2 put the existence check in `tooling/hooks/session-start.ts` (`SPINE.filter(existsSync)`) because `tooling/lib/layout.ts` was MIG-1's planned path, still under review. `tooling/check-refs.ts` (around line 50) carries the same three-path filter. Add `spine: string[]` to `RepoLayout` and read it in both places.
- **Per path:** `tooling/lib/layout.ts` and its unit case; `tooling/hooks/session-start.ts` keeps its fixture `root` context; `tooling/check-refs.ts` if the devs' call says so.
