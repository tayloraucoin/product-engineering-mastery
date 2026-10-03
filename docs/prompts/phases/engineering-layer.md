---
title: "PJ — Engineering layer: build prompt"
description: "Run in Claude Code (Lorimer) to write the engineering layer into the repo: tracked settings and hooks, the contract work loop and its checks, path rules, dependency and test policy, runbook amendments, and the engineering asset map."
layer: prompts
status: draft
thread: P-J
role: Lorimer
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: on request
---

# PJ — Engineering layer (Claude Code, Lorimer)

> **Amendments in force (2026-10-02, primer v2):**
> - **A1. Branch and commits.** This thread runs on branch `agent/PJ`, not `main`. Its work-id is `PJ`. Commit messages are `PJ: <step> <outcome>`, for example `PJ: J3 bash guard with fixtures`. `toolkit.json` carries `toolkitPrefixes: ["PEM", "PJ"]` (A4), so bash-guard admits this thread's own commits. Done criterion 7 reads: every commit starts with `PJ:`, the tree is clean, nothing is pushed, and `agent/PJ` is ready for Taylor to merge.
> - **A2. Hooks register when their script lands.** J2 writes `.claude/settings.json` with permissions and the sandbox only. Each hook is registered in the step that lands its script, after its fixtures pass: bash-guard in J3, results-gate in J5, stop-gate and session-start in J6. A hook is never registered to a script that does not exist. The native git hooks (A9) follow the same rule.
> - **A3. Verification sources.** For V1 to V7, use the installed version (`claude --version`) and the docs at code.claude.com, fetched now. Record each URL and the fetch date. Where the docs and observed behavior disagree, observed behavior wins; record both.
> - **Paths (2026-10-02).** The docs were regrouped after this prompt was filed (changelog, PR-12). Where the body says `docs/research/pj-engineering-layer-lorimer.md`, read `docs/research/engineering/engineering-layer-report.md`; where it says `docs/prompts/00-shared-context.md`, read `docs/prompts/shared-context.md`; `apps/web/specs/` is replaced by the A4 layout; folder landing pages are `README.md`, so `docs/references/index.md` is `docs/references/README.md`.
> - **A4 to A12** are in force as written in `docs/research/engineering/conventions-and-amendments.md` §2: specs layout and work-ids, contract fields, gates as checks, reviewers by risk, living UX truth, laws outside Claude Code, budget rows, the research exception, and the workflow layer (new step J14).
>
> Later rulings are added here as a blockquote, newest first. Each one is dated and names the ruling it applies. The body below is never rewritten.

**Venue.** Claude Code, deepest available model, in `~/lighthouse/product-engineering-mastery` on `main`, on a clean tree.

**Role.** You are Lorimer. Consult these seats by function, and don't co-pilot with them:
- Warden: settings and denies.
- Touchstone: evidence types and test strategy.
- Quartermaster: dependencies and stack templates.
- Usher: `toolkit.json`, `doctor` and the port runbook.
- Scribe: records, checks and the asset map.
- Mason: `oneWayDoors` and the boundaries lint.

**Attach:**
- `docs/prompts/00-shared-context.md`
- `docs/roles/engineering/lorimer-agent-harness-engineer.md`
- The PJ report, `pj-engineering-layer-lorimer.md`.

The report is the law for this thread:
- §2: rulings (a) to (i).
- §3: the asset checklist E-01 to E-55.
- §5: budget.
- §6: build order.
- §10: tests.

Where this prompt and the report disagree, the report wins. Say so in the changelog entry.

**Plan mode.** Enter plan mode before changing `docs/index.md`, anything in `docs/decisions/`, or the boundaries config (AGENTS.md requires it). Show the plan and wait for approval.

## Decision served

Give PEM an engineering layer in which one product engineer and a workforce of agents produce code that obeys the product's conventions. Enforcement comes through checks and hooks, not prose, inside the context budget, and the layer must be portable as a starter or as an overlay.

## The ask

Work in the order below. Each step lists its exit condition. Commit after each step with message `PJ-<step>: <outcome>`. Commit locally; never push.

### J0 — Verify, then measure (1.5 h)

1. **Read the installed Claude Code documentation and check V1 to V7** (report §8). Run `claude --version`, and read the bundled docs or `/help` output that is available offline.
   - Record each item as verified, with version and date, or as not as assumed.
   - For any item not as assumed, change the dependent mechanism before building it, and note the change in the changelog.
2. **Run Crucible's test 3.**
   - Classify the last 40 work items in `~/lighthouse/synapse` and `~/lighthouse/taylor-aucoin`, read-only with `git -C <repo> log`, by size: under half a day, half a day to two days, over two days.
   - Record the counts and the method.
   - If more than 70% are under half a day, AGENTS.md (J4) names the slice as the default work size.

**Exit:**
- A dated "PJ verification" entry in `docs/decisions/changelog.md` with V1 to V7 results and the J0 counts.
- No repo files changed except the changelog.

### J1 — Layout file (E-05) (3 h)

1. Create `toolkit.json` at the root from a new template `docs/engineering/templates/toolkit.template.json`, with keys:
   - `tier`
   - `workPrefix`
   - `designLayer`
   - `specsDirs`
   - `verify` (with `full` and `fast` commands)
   - `oneWayDoors` (globs, drafted with Mason's list: schema, migrations, auth, billing, package boundaries, public API shape)
   - `migrationsDir` (null)
   - `branchPattern` (`agent/{id}`)
2. Validate it with a small schema in `tooling/lib/`.
3. Refactor `budget.ts`, `lint-frontmatter.ts` and `directory-map.ts` to read paths from it. Delete every hard-coded `apps/web` path.

**Exit:**
- `rg -n "apps/web" tooling/` returns only comments or fixtures.
- Removing a required key makes `yarn verify` fail with a message naming the key.

### J2 — Settings, check, doctor (E-14, E-15, E-21) (4 h)

1. **Write tracked `.claude/settings.json` per ruling (d):** deny, ask and allow lists; the sandbox with network allowlist (localhost, package registries, GitHub); hook registration for J3, J5 and J6. Hooks are registered now; their scripts land in their steps.
   - Hook commands invoke `node` on files in `tooling/hooks/`, using the project-directory variable confirmed in V6.
   - Use a template at `docs/engineering/templates/settings.template.json`.
2. **Update `.gitignore`** so `.claude/settings.json` stays tracked and `settings.local.json` stays ignored.
3. **Write `tooling/check-settings.ts`:** required denies present, no `Bash(*)`, no absolute paths, local file not tracked.
4. **Write `tooling/doctor.ts` and the `yarn doctor` script.**

**Exit:**
- `yarn verify` runs `check-settings`.
- A fixture with the push deny removed fails it.
- `yarn doctor` exits 0 on this machine. It exits non-zero on a fixture local-settings file that contains a key-shaped string.

### J3 — Bash guard (E-16, E-32, E-33) (3 h)

1. **Write `tooling/hooks/bash-guard.ts`** (PreToolUse, Bash). It blocks:
   - npm, npx and pnpm
   - git push
   - commit while on main
   - commit whose message doesn't start with a work-id matching `workPrefix`
   - `$(`, backticks and heredocs (unless V3 removed the need)
   Every denial message states the exact command to use instead.
2. **Add fixtures** in `tooling/hooks/fixtures/` (JSON hook inputs with expected exit codes) and a `yarn test:hooks` runner. Include it in `yarn verify`.

**Exit:**
- `yarn test:hooks` passes, with at least one allow and one deny fixture per rule.
- Each run of the guard takes under 200 ms (measured and recorded).

### J4 — Spine moves (E-01 to E-04, E-06 to E-11, E-13) (2 h)

**Plan mode first** (this touches `docs/index.md`).

1. **AGENTS.md cuts (E-02):**
   - Move "Tooling notes" to `.claude/rules/next.md` and `.claude/rules/turbo.md`.
   - Move the docs rules to `.claude/rules/docs.md`, keeping only the two that no lint carries.
   - Delete "Never load `docs/research/`" (the index says it) and "Use yarn, never npm or pnpm" (the guard teaches it).
   - Replace Start-here item 5 with a four-line "Work loop" section (E-01, report §10.1).
2. **CLAUDE.md:** add the hooks line and `vigil` to the subagent line.
3. **New path rules** `specs.md` and `deps.md`; amend `testing.md`. Each carries only a `paths` key.
4. **Extend `lint-frontmatter.ts`** so any other key in `.claude/rules/*.md` fails.
5. **`docs/index.md`:**
   - Add the Engineering row to the Layers table.
   - Delete the Library batch row.
   - Merge the two trigger bullets.
   - Amend the "Always" line for hook output.
   - Add the Evaluator pass row.
   - Hold the UI row amendment as `[PROPOSED — needs sign-off]` in the changelog's held list, and leave the current UI row in place until Plumb signs.

**Exit:**
- `yarn budget` reports always-on ≤ 3,400 tokens and `docs/index.md` ≤ 80 lines.
- `yarn lint:docs` passes.
- A fixture rule file carrying a `description` key fails the lint.

### J5 — Work loop (E-22 to E-26, E-17) (8 h)

1. **Templates:** `contract.template.md` and `as-built.template.md` in `docs/engineering/templates/`, with the instruction-blockquote header the design templates use (Who fills / When / Lives at / What the check enforces / Filled example).
2. **Schema:** `docs/engineering/schemas/results.schema.json`.
3. **Scripts:**
   - `contract:init <id> <slug>`: creates `specs/<id>-<slug>/`, a FAIL `results.json` and branch `agent/<id>`. It refuses if another item is active on the current branch.
   - `contract:run <id>`: executes `test` and `check` criteria and records the results.
   - `contract:record <id> <criterion> --evidence <path>`: for `capture` and `manual` criteria; requires the evidence file to exist.
   - `status [<id>] [--brief] [--deviations]`
4. **Hook:** `tooling/hooks/results-gate.ts` (PreToolUse, Write/Edit/MultiEdit) denies direct edits to `results.json`, and to any merged `as-built.md` except its `applied:` field.
5. **Check:** `tooling/check-specs.ts` covers schema, results-to-contract IDs, closure, immutability against `main`, and drift of the generated `specs/_status.md`.
6. **Fixtures:** under `tooling/fixtures/specs/`, include a hand-edited results file, an as-built missing a section, an edited merged as-built, and a criterion with no evidence type.

**Exit:**
- Every fixture fails `check-specs` with a message that names the fix.
- A full `contract:init` → `contract:run` → `as-built` → `status` cycle on a throwaway item in a scratch branch passes `yarn verify`.
- The scratch branch is deleted afterwards.

### J6 — Stop and SessionStart hooks (E-18, E-19) (3 h)

1. **Add `verify:fast`:** lint and format on changed files, plus type checks for affected workspaces.
2. **`stop-gate.ts`:**
   - Runs `verify:fast` only if the session changed files.
   - Blocks at most once, honouring the loop guard confirmed in V1.
   - Always prints `status <active id>`.
3. **`session-start.ts`:** prints `status --brief`, truncated to 600 characters.
4. **Teach `budget.ts`** to count the declared 150-token allowance.

**Exit:**
- `verify:fast` runs in ≤ 20 s on PEM (measured and recorded).
- Hook fixtures cover the block-once path.
- `yarn budget` still shows always-on ≤ 3,400.

### J7 — Skills and evaluator (E-27 to E-31) (5 h)

1. **Write three manual skills** with `disable-model-invocation: true` and bodies within budget: `tk-contract`, `tk-kickoff`, `tk-close`. Each gets a REGISTRY row with every column filled. The `/context` cost column is measured.
2. **Set the Vigil role's frontmatter** to `subagent: true` with `subagent_tools: [Read, Grep, Glob]`. This is held for sign-off as an interim body before refinement 22c.
3. **Amend `gen-agents.ts`** to add the banner line naming `docs/index.md` §Precedence as governing. Run `yarn gen:agents`.

**Exit:**
- `gen:agents --check` passes.
- `.claude/agents/vigil.md` lists exactly those three tools and carries the banner line.
- `/context` shows no listing entry for the three manual skills; otherwise record the cost and fix it.

### J8 to J13 — Trailing steps

Run these in order if time allows. If not, list the remainder in the changelog as open.

- **J8: risk tier, PR body, PR template (E-34, E-35).**
  - Exit: `risk-tier` classifies fixture diffs touching a migration glob and a docs file into the right tiers. `pr:body` renders the throwaway item from J5.
- **J9: dependency policy, age gate, `check-deps`, tech-stack columns, stack templates (E-39 to E-43).**
  - Before writing `.yarnrc.yml`, confirm the age-gate key against Yarn 4.13's own docs.
  - Exit: adding an untracked dependency in a fixture fails `check-deps`. Yarn refuses an install younger than the gate (demonstrated, or the documentation reference recorded).
- **J10: `check-revisit`, `check-refs`, manifest hash check, boundaries messages and no-disable rule (E-44 to E-47).**
  - Exit:
    - Records 0001 to 0009 gain a structured `revisit:` field, added as frontmatter keys per record 0006's rules, with bodies untouched.
    - A fixture record with a past date warns.
    - A fixture generated agent naming a missing path fails `check-refs`.
    - A tampered filed body fails the manifest check.
    - An `eslint-disable` on a boundaries rule fails.
- **J11: test strategy and `testing.md` amendment (E-36).** The weakening check waits for P-C's test stack.
  - Exit: the file passes `lint:docs` and names a runtime budget for every tier.
- **J12: asset map and runbooks (E-49 to E-55).**
  - Write `docs/engineering/index.md` from report §3, one row per asset with every column. Write `tooling/check-asset-map.ts`. Write `harness-log.md` and `.claude/harness-baseline.json`. Amend the onboard-agent and release runbooks. Write `docs/runbooks/port.md` and point the README to it.
  - Then run the fresh-session test from report §10.4 for real and record the `/context` summary.
  - Exit:
    - `check-asset-map` fails a fixture row missing an owner.
    - The fresh-session result is in the changelog: files opened in order, and anything opened that should not have been.
- **J13: port trial (Crucible test 1).**
  - Copy Synapse to a scratch directory outside the repo. Apply the starter tier, then reset and apply the overlay tier.
  - Time every step and count every check that had to be disabled or rewritten.
  - Exit:
    - Timings and counts are in `docs/runbooks/port.md` under "Trial log".
    - If more than half the checks had to be disabled in the starter tier, record 0010 states that the starter is for greenfield products only.

## Filing and records

1. **File the report** at `docs/research/pj-engineering-layer-lorimer.md`, byte-identical, using the filing rules in record 0006. Add its manifest entry and a "Filed verbatim" ignore line.
2. **Add conflict entries** for rulings (a) to (i) to `docs/decisions/conflicts.md`, using the next free CF numbers. Each entry has Ruling, Rule and Losing.
3. **Write records** from `decision.template.md`, using the next free numbers:
   - Adoption tiers and `toolkit.json` (marked `[PROPOSED — needs sign-off]` until Taylor signs).
   - The work loop (contract, tooling-written results, as-built; no tasks.md, PROGRESS or DEVIATIONS).
   - Agent permissions, hooks and branch policy.
4. **Add ledger lines** (EN prefix) for every other ruling and for the methodology verdict table, citing the report.
5. **Add one changelog entry** for the step-by-step changes. Its held list carries: the UI budget row, record 0010, the `vigil` interim body, and the confirmation of the "Prompt 17" assumption.

## Evidence rules

- A claim about tool behavior carries the version and date it was verified on, in this repo, on this machine.
- If a mechanism can't be built as the report specifies, build the closest mechanical equivalent, record the gap, and never substitute a prose rule silently.
- No emoji, ever. Synthetic data only in fixtures.

## Done criteria (mechanical)

1. `yarn verify` exits 0, and it includes: `check-settings`, `test:hooks`, `check-specs`, `check-refs`, `check-asset-map`, `check-deps`, `check-revisit` (warn level), the manifest check, and the rule-frontmatter lint.
2. `yarn budget`: always-on ≤ 3,400 tokens; `AGENTS.md` ≤ 100 lines, `CLAUDE.md` ≤ 20, `docs/index.md` ≤ 80; every build row within its cap.
3. Every fixture listed in J1 to J10 produces its expected exit code.
4. `docs/engineering/index.md` passes `check-asset-map`: every asset has an owner, a tier, a budget and an enforcement point, or a written `none: <reason>`.
5. Measured and recorded: guard ≤ 200 ms per call; `verify:fast` ≤ 20 s.
6. Changelog entries exist for the J0 verification, the J12 fresh-session run and the J13 trial. Conflicts, records, ledger and manifest are updated.
7. `git status` is clean, no commit was pushed, and every commit message starts with `PJ-`.

## Not wanted

- A directory tree with no reasons. Every new file traces to an E-row.
- Any always-on line without a deletion-test justification in the changelog.
- Prose rules where the report specifies a check or a hook.
- Third-party skills, hooks or packages added in this thread (the cwc patterns are re-implemented, not vendored).
- Changes to filed thread bodies, canon content or role bodies beyond frontmatter keys the report names.
- Raising any cap to make a step pass. Fix the file, or stop and report.
