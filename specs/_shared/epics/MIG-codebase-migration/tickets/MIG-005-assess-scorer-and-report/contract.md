---
id: MIG-5
size: small
objective: "yarn migrate:assess <target> prints the distance report the interview opens with: seventeen scored signals in four groups, a total, the gate and the path, as markdown or --json, from node built-ins alone."
slice_type: "A new read-only tooling command and its scorer; the risk is a path threshold applied wrongly, or a report that writes into the target."
non_negotiables:
  - "tooling/migrate-assess.ts and everything it imports use node built-ins only, so node <toolkit>/tooling/migrate-assess.ts <target> runs from a cold session before anything is installed."
  - "It never writes under the target: it reads git ls-files (with --no-optional-locks, NUL-separated) and tracked files only."
  - "The seventeen signals are the rows S1, S2, C1 to C5, V1 to V5 and P1 to P5 of assess.md, each scored 0, 1 or 2 with its evidence; the thresholds are named constants: far on S1 = 2, a non-JavaScript repo, or a total of 22 or more; middle 16 to 21; near 15 or less."
  - "The --json output follows assess.md's data contract: target, commit, toolkitCommit, signals, total, path, gate, preconditions, conflicts, sdkImports, records, collisions, hygiene; sections this ticket does not fill are present and empty."
  - "This ticket implements the detectors for S1, S2 and C1 to C5; V and P detectors, the listings and hygiene come from MIG-6 behind the same signal interface, and until then those signals report not yet measured and score nothing."
  - "The scorer is unit-tested on the synthetic signal sets equal to assess.md's table: 14 near, 18 middle, 23 plus the gate far."
devs_call: "The file split under tooling/lib/assess/, the signal interface, the markdown layout, and how a signal's evidence is phrased."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T1"
  - "T8"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - vigil
focus: []
operator_review: false
planned_paths:
  - "tooling/migrate-assess.ts"
  - "tooling/migrate-assess.test.ts"
  - "tooling/lib/assess/**"
  - "package.json"
  - "docs/engineering/tooling.md"
depends_on: []
out_of_scope:
  - "The V and P detectors, the listings, hygiene and the three-repo capture: MIG-6."
  - "The --check preconditions: MIG-7."
  - "dependency-cruiser, knip, madge, or any dependency at all (beat in T1)."
  - "Filing the report in a target: the runbook's step (MIG-8)."
criteria:
  - id: C1
    statement: "Fed the synthetic signal sets of assess.md's table, the scorer returns total 14 and path near, total 18 and path middle, and total 23 with the gate and path far; a set with S1 = 2 and total 10 is far."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "On a scratch repo with workspaces and a turbo.json, the shape and checks detectors score S1 0, and C1 to C5 as assess.md defines for a CI chain, no tests, both scripts and a write-only format; on a single-app repo without turbo.json S1 scores 2."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "yarn migrate:assess <scratch> --json prints one JSON object with every top-level key of the data contract, and the target's working tree is byte for byte unchanged after the run."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "The markdown report names each signal with its score and evidence, the total, the path and the gate, and says which signals were not yet measured."
    evidence: test
    command: "yarn test:tooling"
  - id: C5
    statement: "No file under tooling/lib/assess/ or tooling/migrate-assess.ts imports anything but node: modules."
    evidence: test
    command: "yarn test:tooling"
  - id: C6
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — MIG-0 assess-scorer-and-report

## Build notes

- **Approach:** a thin CLI (`tooling/migrate-assess.ts`: parse `<target>` and `--json`, call the library, print) over `tooling/lib/assess/`: a `signals` module with one detector per signal id behind a common interface (`{ id, group, layer, measure(repo) => { value, score, evidence } }`), a `score` module with the constants and the path rule, a `report` module for markdown and JSON, and a `repo` module that lists tracked files once (`git --no-optional-locks ls-files -z`) and reads files on demand. Detectors here: S1 (`workspaces` in the root package.json and `turbo.json`), S2 (toolchain majors from `packageManager`, `engines.node`, the root and app dependency ranges against `docs/engineering/tech-stack.md`'s six), C1 (a `verify` script, else a CI file that chains checks), C2 (`.github/workflows/*.yml` or another CI file), C3 (a test runner dependency or script, and test files), C4 (type-check and lint scripts), C5 (a `--check` format script, write-only, none). Tests build scratch repos in `$TMPDIR` with `freshRepo()` and rewrite their files.
- **Decisions that apply:**
  - T1: "17 read-only signals in four groups (shape, checks, conventions, process), each scored 0, 1 or 2. Far: no workspaces and no `turbo.json` (the gate), not JavaScript, or a total of 22 or more. Middle: 16 to 21. Near: 15 or less. Synapse 14, CC 18, TA 23 plus the gate. Branch state, worktrees and large files are reported, never scored." If wrong: "The thresholds are constants; recalibrate after the synapse dry run."
  - assess.md, T1: "`yarn migrate:assess <target>` reads and never writes. It imports node built-ins only ... It prints a markdown report, and writes the same data as JSON with `--json`." The signal table's 0 / 1 / 2 column is the detector spec, row by row.
  - T8: "Build `migrate:assess` (node built-ins only, so it runs from a toolkit checkout)."
  - technical.md, Rabbit holes: "assess walks `git ls-files` only"; "Paths with spaces or em-dashes (CC): read NUL-separated."
- **Interfaces:** `yarn migrate:assess <target> [--json]` in package.json; the signal interface MIG-6 implements against; the data contract's JSON shape.
- **Per path:**
  - `tooling/migrate-assess.ts`: the CLI; MIG-7 adds `--check` here.
  - `tooling/lib/assess/**`: `repo`, `signals`, `score`, `report` (names are the builder's).
  - `tooling/migrate-assess.test.ts`: C1 to C5; names start with the criterion id.
  - `package.json`: the script.
  - `docs/engineering/tooling.md`: one entry for `migrate:assess`, scored as §2 says.
- **Gotchas:**
  - No `yaml`, no `@pem/*`, no `tooling/lib/docs.ts` (it imports `yaml`); C5 pins this.
  - The six toolchain majors are in `docs/engineering/tech-stack.md`; read them at build time and write them as constants with the date, since a target run has no toolkit docs.
  - Scores for signals MIG-6 owns are omitted from the total, and the report says so, so a half-built assess never prints a false near.
  - The sandbox denies reads of env files everywhere; a detector never opens one.
  - `package.json` is shared with MIG-4's script line; commit only your own lines.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to pull in a dependency for globbing or YAML and break the cold-session rule.
