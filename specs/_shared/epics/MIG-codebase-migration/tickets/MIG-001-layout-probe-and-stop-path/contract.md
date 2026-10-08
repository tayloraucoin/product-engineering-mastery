---
id: MIG-1
size: small
objective: "The stop gate and the budget run on a single-app repo with no Turbo: one layout probe in tooling/lib answers every layout question, and a step the tooling cannot run is named, never passed in silence."
slice_type: "Repo tooling under the overlay tier; the risk is a stop that blocks on a missing Turbo (Risk 1), or a verify step skipped without a word so a broken target reads as green."
non_negotiables:
  - "tooling/lib/layout.ts imports node built-ins only and answers hasTurbo (and which of lint and check-types turbo.json defines), workspaces, codeRoots, hasSpecsRoot and scripts; it is the one home for layout facts beyond toolkit.json."
  - "verify-fast.ts runs its Turbo step only when hasTurbo and both tasks exist; otherwise ESLint on the changed files under codeRoots when an ESLint config exists, plus the repo's type-check script once."
  - "Every toolkit step in verify-fast.ts runs only when its script exists in the root package.json; a step it cannot run is named in the output as not run and never counted as passed."
  - "budget.ts takes its example files from the probe, skips and names absent ones, and reads nested AGENTS.md files under codeRoots; the caps are unchanged."
  - "At the starter tier nothing changes: this repo's fixtures and yarn verify are the regression guard."
  - "tooling/overlay.test.ts builds the single-app scratch repo through one helper in tooling/lib/scratch-repo.ts, reused by MIG-2 and MIG-3, and runs verify:fast, stop-gate.ts, results-gate.ts and budget.ts as subprocesses, with and without a specs root."
  - "No hook file is edited: session-start.ts is MIG-2's."
devs_call: "The probe's export names and return shape, how verify-fast finds the ESLint config and the type-check script, the fixture helper's name and options, and how the test file is organised."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T3"
  - "T8"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - mason
focus:
  - "the stop path: verify-fast never blocks on a missing Turbo and never passes a step it did not run (mason)"
  - "a third review round after two FAILs, approved by the operator 2026-10-07: the round-2 fixes (mason)"
operator_review: false
planned_paths:
  - "tooling/lib/layout.ts"
  - "tooling/lib/layout.test.ts"
  - "tooling/verify-fast.ts"
  - "tooling/budget.ts"
  - "tooling/overlay.test.ts"
  - "tooling/lib/scratch-repo.ts"
depends_on: []
out_of_scope:
  - "The spine probe in session-start.ts and the settings floor: MIG-2."
  - "The manifest, check-refs, gen-agents and the contract:init then status case: MIG-3."
  - "check-reviewers and its zero-match case: MIG-4, in its own test file."
  - "A monorepo-without-Turbo fixture (overlay.md: not a separate fixture) and any second adoption mode (settled)."
criteria:
  - id: C1
    statement: 'The probe reports hasTurbo false with no turbo.json and true with the tasks turbo.json defines; workspaces is [] without the key; codeRoots is ["."] for a single app at the root; scripts lists the root package.json script names.'
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "On the single-app scratch repo, verify:fast exits 0 on a clean edit and exits 1 on a type error, naming the type-check step."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "On the same repo, stop-gate.ts exits 0 with no block decision after a clean edit, and the verify:fast output it ran names each toolkit step that did not run."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "A toolkit step whose script is absent, and a Turbo task missing from turbo.json, are each named as not run in verify:fast's output, and neither is counted as passed."
    evidence: test
    command: "yarn test:tooling"
  - id: C5
    statement: "budget.ts exits 0 on the scratch repo and names the example files it skipped; results-gate.ts exits 0 with no decision when the specs root is absent."
    evidence: test
    command: "yarn test:tooling"
  - id: C6
    statement: "Tooling types pass with the probe and the edited scripts."
    evidence: check
    command: "yarn check-types:tooling"
  - id: C7
    statement: "The starter is unchanged: the budget passes here with the same report."
    evidence: check
    command: "yarn budget"
  - id: C8
    statement: "The starter is unchanged: every hook fixture still passes."
    evidence: check
    command: "yarn test:hooks"
---

# Contract — MIG-0 layout-probe-and-stop-path

## Build notes

- **Approach:** write the probe first, with unit tests on synthetic roots in `$TMPDIR` (C1). Then thread it through `verify-fast.ts`: the Turbo step's `when` reads `hasTurbo` and the two tasks; a new fallback step runs `yarn eslint --max-warnings 0 <changed code>` only when an ESLint config exists at a code root, and the type-check script once; every toolkit step's `when` also requires its script name in `scripts`. Steps whose `when` is false because the script or task is missing are printed as `not run: <name> (<reason>)` at the end, distinct from steps skipped because nothing changed. Then `budget.ts`: its example and probe paths come from `codeRoots` and the app paths, absent ones are listed as skipped. Last, the fixture: a helper in `scratch-repo.ts` that turns `freshRepo()` into a single-app overlay repo (no `workspaces`, no `turbo.json`, the app at the root, `toolkit.json` at tier `overlay` with `apps.web.path` `"."`, a `prettier --write` format script, no CI, no specs root), and `tooling/overlay.test.ts` driving the scripts and hooks as subprocesses.
- **Decisions that apply:**
  - T3: "One probe, `tooling/lib/layout.ts`, read by 11 scripts and 3 hooks. Starter unchanged. Proven by `tooling/overlay.test.ts` on a single-app scratch repo." Beat: "A check in each script; a separate light tooling copy (a second mode)."
  - T8: "Build `migrate:assess` ... and `check-reviewers`, plus the overlay edits."
  - overlay.md, `verify-fast.ts` row: "Turbo step only when `hasTurbo` and the tasks exist. Otherwise ESLint on the changed files under `codeRoots` (when an ESLint config exists), plus the repo's type-check script once. Each toolkit step runs only when its script exists. A step it cannot run is named in the output and never silently passed."
  - overlay.md, `budget.ts` row: "Example files from the probe, with absent ones skipped and named; nested files under `codeRoots`; caps unchanged."
- **Interfaces:** `tooling/lib/layout.ts` exports one probe function taking the repo root and returning `{ hasTurbo, turboTasks, workspaces, codeRoots, hasSpecsRoot, scripts }` (names are the builder's); `scratch-repo.ts` exports the single-app helper. No new package.json script.
- **Per path:**
  - `tooling/lib/layout.ts`: the probe; node built-ins only, so MIG-2 can import it from a hook.
  - `tooling/lib/layout.test.ts`: C1, on synthetic roots written in `$TMPDIR`; test names start with the criterion id.
  - `tooling/verify-fast.ts`: the `when` conditions, the ESLint fallback, the "not run" lines.
  - `tooling/budget.ts`: example files and nested `AGENTS.md` discovery from the probe.
  - `tooling/lib/scratch-repo.ts`: the single-app helper, beside `freshRepo()`.
  - `tooling/overlay.test.ts`: C2 to C5; MIG-2 and MIG-3 add their cases here.
- **Gotchas:**
  - `tooling/lib/work-ids.ts` already exports `readLayout` (toolkit.json facts for the hooks). Do not merge or rename it; the new probe answers filesystem facts and gets a different name.
  - `verify-fast.ts` spawns `yarn <script>`. The scratch repo's `yarn install` brings no devDependencies, so give the fixture a `check-types` script that runs `tsc -p .` through a symlink to this repo's `node_modules/typescript`, as `useScratchRepo()` already does for `yaml`; the format step with no Prettier is a natural "not run" case.
  - Hooks resolve their root from `CLAUDE_PROJECT_DIR`; set it to the scratch repo when spawning `stop-gate.ts` and `results-gate.ts`. The stop gate reads the session's edited files from a transcript (PR-15); see `tooling/hooks/fixtures/stop-gate.json` and `tooling/hooks/fixtures/transcripts/` for the shape it expects, and write a synthetic one in the scratch repo.
  - `getBaseRef` reads `protectedBranch`; the scratch repo has `main` and the `work` branch, so verify-fast's changed set is the branch diff.
  - Keep the "not run" wording short: the stop gate relays verify-fast output inside a 1,000-character reason.
  - `yarn test:tooling` runs every tooling test; another ticket's red test blocks the proof. Report it, never fix their file.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to make the fallback step pass when a binary is missing, which is the exact failure this ticket retires.
