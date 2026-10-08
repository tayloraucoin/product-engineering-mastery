---
id: MIG-2
size: small
objective: "A migrated team gets only the settings floor and the status hooks on merge; the operator's rows live in the local file and are checked by doctor; the session hook prints a spine of whatever files exist."
slice_type: "Agent permissions and a hook (one-way doors: tooling/check-settings.ts, tooling/hooks/**); the risk is a merge that hands a team the toolkit's whole policy (Risk 2), or a floor rule lost without a check failing."
non_negotiables:
  - "overlay-local (operator's ruling 2026-10-08; record 0012's amendment, EN-18): check-settings requires neither the floor nor the tracked file itself; yarn doctor alone checks the floor and the operator rows in the local file, and CI does not enforce the floor at that tier. Under the overlay tier check-settings requires in the tracked file exactly the floor: the env, secrets and key read denies, the database reset and drop denies, the git reset --hard, clean, branch -D and filter-branch denies, the publish and login denies, and the database asks; the git push deny is not required there."
  - "Under overlay check-settings requires session-start.ts and results-gate.ts registered in the tracked file, accepts bash-guard.ts and stop-gate.ts from either settings file, and fails as before on a tracked settings.local.json, a machine path or a disabled sandbox."
  - "At the starter tier check-settings is unchanged; every existing fixture passes as it did."
  - "yarn doctor fails under the overlay tiers when the local settings file lacks an operator row: the git push deny, bash-guard.ts or stop-gate.ts; at starter it only scans the file as today."
  - "session-start.ts's spine is the subset of AGENTS.md, CLAUDE.md and docs/index.md that exists, read through the probe, and its line stays under 600 characters."
  - "A ruling covers a whole hook or a whole permission rule; nothing here splits a hook per rule (settled)."
  - "The claim that Claude Code runs hooks registered in both settings files is proven by a fixture session on a scratch repo and the result is dated in the as-built; if it does not hold, the ticket stops and says so."
devs_call: "How the fixture runner tells an overlay fixture from a starter one (a name prefix or a field), the doctor message wording, and how the fixture session shows each hook fired (a marker file per hook is the simplest)."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T2"
  - "T3"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q3
reviewers:
  - warden
  - mason
focus:
  - "the floor: every deny and ask a team must keep is required under overlay, and nothing beyond the floor is (warden)"
  - "the local layer: doctor catches a missing operator row, since the local file is disposable (warden)"
  - "session-start.ts and check-settings.ts change nothing at starter (mason)"
operator_review: false
planned_paths:
  - "tooling/check-settings.ts"
  - "tooling/fixtures/settings/**"
  - "tooling/doctor.ts"
  - "tooling/hooks/session-start.ts"
  - "tooling/hooks/fixtures/session-start.json"
  - "tooling/overlay.test.ts"
depends_on:
  - MIG-1
out_of_scope:
  - "Writing any target's settings files or AGENTS.md: the runbook (MIG-8) derives them from the rulings this check enforces."
  - "Editing this repo's .claude/settings.json or its template (technical.md: not edited)."
  - "The per-rule guard split for a team: a layer 3 gap (layers-2-3.md, part 12)."
  - "bash-guard.ts and stop-gate.ts: no change (overlay.md); their registration moves by ruling at the run."
criteria:
  - id: C1
    statement: "An overlay fixture holding only the floor and the two team hooks passes; the same fixture with the git push deny added still passes."
    evidence: test
    command: "yarn check-settings"
  - id: C2
    statement: "An overlay fixture missing any one floor deny or ask fails, naming the rule; one missing session-start.ts or results-gate.ts fails, naming the hook; one registering bash-guard.ts only in a local file passes."
    evidence: test
    command: "yarn check-settings"
  - id: C3
    statement: "Every starter fixture passes or fails exactly as before this ticket, and this repo's tracked settings pass."
    evidence: check
    command: "yarn check-settings"
  - id: C4
    statement: "On the single-app scratch repo at tier overlay, doctor exits 1 naming each operator row missing from a local settings file given with --local-settings, and exits 0 when the file holds them."
    evidence: test
    command: "yarn test:tooling"
  - id: C5
    statement: "session-start.ts prints a line naming only the spine files that exist, under 600 characters, when docs/index.md is absent; the existing cases still pass."
    evidence: check
    command: "yarn test:hooks"
  - id: C6
    statement: "A scratch repo with session-start.ts registered in .claude/settings.json and stop-gate.ts in .claude/settings.local.json shows both hooks fired in one headless Claude Code session; the capture records the Claude Code version and the date."
    evidence: capture
    path: "specs/_shared/epics/MIG-codebase-migration/tickets/MIG-002-settings-floor-and-hook-spine/evidence/hooks-in-both-files.md"
  - id: C7
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
  - id: C8
    statement: "An overlay fixture with a tracked settings.local.json, one with a machine path, and one with the sandbox off each fail, naming the problem, as at starter."
    evidence: test
    command: "yarn check-settings"
  - id: C9
    statement: "doctor reports a busy or unbindable port 3000 or 3001 as a warning and still exits 0 on the single-app repo."
    evidence: test
    command: "yarn test:tooling"
  - id: C10
    statement: "Under overlay-local, check-settings passes a tracked file without the floor or the team hooks, and exits 0 as a subprocess on the single-app scratch repo with no tracked .claude/settings.json; there, doctor exits 1 naming each floor rule, team hook or operator row missing from the --local-settings file, and 0 when it holds them all."
    evidence: test
    command: "yarn test:tooling"
---

# Contract — MIG-0 settings-floor-and-hook-spine

## Build notes

- **Approach:** `check-settings.ts` reads the tier through `loadToolkit()` and keeps two lists: the floor (tracked, except at overlay-local: EN-18) and the starter-only extras (today's `REQUIRED_DENIES` minus the floor is only the two `git push` rules; `REQUIRED_HOOKS` splits into team hooks and operator hooks). The fixture runner gains overlay fixtures: each fixture says which tier it is judged at. `doctor.ts` adds, under the overlay tiers, a check that the local file (or `--local-settings <file>`) holds each operator row, reusing `bashRuleMatches` for the push deny and the hook-script scan it already does for the tracked file. `session-start.ts` replaces its `SPINE` constant with the files that exist. The fixture session (C6) is the one manual-shaped step: build a scratch repo with the two hooks split across the files, each hook a one-line script that appends its name to a marker file, run `claude -p "say ok"` in it, and read the marker.
- **Decisions that apply:**
  - T2: "The floor is tracked; everything else is ruled team or operator (local)."
  - layer-1.md, Settings: "The interview rules each policy team (`.claude/settings.json`, tracked) or operator (`.claude/settings.local.json`, gitignored). The floor is never offered and is always tracked, except under `overlay-local`, where it goes to the operator's local file and `yarn doctor` checks it …" Default rulings: deny `git push`, `bash-guard.ts`, `stop-gate.ts`, sandbox and allow list are operator; the database asks, `session-start.ts` and `results-gate.ts` are team.
  - layer-1.md, Floor check: "`check-settings` under overlay checks the floor in the tracked file. `yarn doctor` checks the operator's local file holds the operator rows." That is `overlay`; `overlay-local` is EN-18 (non-negotiable 1).
  - technical.md, Rabbit holes: "[ASSUMPTION: both run; proven with a fixture session at the overlay ticket]."
  - overlay.md, `session-start.ts` row: "The spine is the three files that exist. Layer 1 writes all three; the probe covers a run stopped part-way."
- **Interfaces:** `checkSettings(settings, tier)` or an equivalent second argument; a documented fixture naming rule; `yarn doctor --local-settings <file>` gains the overlay rows check. No new package.json script.
- **Per path:**
  - `tooling/check-settings.ts`: the floor and the tier split; hook registrations read from both files under overlay.
  - `tooling/fixtures/settings/**`: overlay pass and fail cases for C1 and C2, named after their criterion.
  - `tooling/doctor.ts`: the operator-rows check (C4).
  - `tooling/hooks/session-start.ts`: the spine from the probe (MIG-1's `tooling/lib/layout.ts`, node built-ins only).
  - `tooling/hooks/fixtures/session-start.json`: one case with `docs/index.md` absent.
  - `tooling/overlay.test.ts`: C4 (doctor as a subprocess on the single-app repo) and the floor-only settings case.
- **Gotchas:**
  - `.claude/settings.local.json` is gitignored and absent in CI, so check-settings never requires anything to be in it; only doctor does, on a machine.
  - This repo's `.claude/settings.json` and `docs/engineering/templates/settings.template.json` are not edited; the sandbox also denies writes to the settings file.
  - `session-start.json` cases run with `PEM_HOOK_FIXTURE_CONTEXT`; the absent-spine case needs a root where `docs/index.md` is missing, so write it into `$TMPDIR` in the fixture or give the hook a context field, the runner's existing pattern.
  - The headless session for C6 needs the `claude` binary and runs outside the sandbox; if the sandbox blocks it, hand the exact command to the operator as an operator check with `--verdict deferred` rather than inventing the result.
  - `yarn check-settings` runs the fixtures first, then the tracked file: C1 to C3 share that one command.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to widen the floor to today's whole list, which is Risk 2 in code.
