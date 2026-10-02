---
title: "Engineering layer — rulings, asset map, budget and build order (PJ, Lorimer)"
description: "Read only to trace an engineering-layer ruling (conflicts (a) to (i) and the records on adoption tiers, the work loop and agent permissions), the reason behind a row in docs/engineering/index.md, or a methodology verdict after Crucible's review."
layer: research
status: archived
thread: P-J
role: Lorimer
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# Engineering layer: rulings, asset map, budget and build order

This is message 3 of the PJ thread, captained by Lorimer.
- **Inputs:** message 1 (research, methodology table, inventory, conflicts), message 2 (Crucible's review), and the attached state reports and role files.
- **Labels:** verified, secondary, judgment and not found, as in message 1.
- **Assumptions:** written `[ASSUMPTION: …]` wherever I proceed without a fact. They are collected in §11.

## 0. Summary

- **The layer is 55 assets, and most of them are checks, hooks and generated views, not prose.**
  - Always-on context drops from 3,320 to about 3,260 tokens (estimate; measured in the build).
  - Three AGENTS.md sections move to path rules. That pays for the new work-loop section, the SessionStart status line and the evaluator listing.
  - The layer also fits the existing budget table without amendment. The amendment in §5 fixes gaps that were already there.
- **The unit of work becomes a contract.**
  - The contract holds testable criteria.
  - `results.json` starts at FAIL and is written only by tooling.
  - An immutable `as-built.md` is written at close.
  - There is no tasks.md, no PROGRESS and no DEVIATIONS. Status is generated.
  - A slice (half a day or less) needs only the contract. A bet keeps brief and package.
- **Crucible landed most of message 2. I changed the design for each finding that landed:**
  - Porting gets two adoption tiers (starter, overlay) and one layout file.
  - The package is no longer the default path.
  - Every freshness ritual becomes a check or is named as unguarded.
  - Four "ours is better" claims are downgraded to needs-evidence.
  - Two verdicts flip (Conventional Commits, DORA).
- **Build size and order.**
  - PJ is about 54 focused hours. The core (J0 to J7, about 30 hours) delivers the work loop. The rest can trail into P-C.
  - PJ runs before P-C, so the demo is built through the loop it is meant to prove.
  - Two investigations get their own threads: the spine A/B, and migrations with disposable databases.

## 1. Crucible's review: conceded and held

**Conceded, with the change it forced:**

1. **All-or-nothing porting (Fatal-if-true): conceded in full.**
   - The checks assume Taylor owns the repo. Two of the three live seats are someone else's.
   - Change: two adoption tiers (record 0010, proposed).
     - **Starter** is the full toolkit, for products Taylor owns.
     - **Overlay** is the minimum harness for a repo he doesn't own. It carries the AGENTS.md block, settings, hooks, the work loop and `yarn doctor`, and drops the frontmatter lint, the budget over host docs, and the design canon unless the host opts in.
     - **Overlay-local** is the same harness kept entirely in gitignored files (`.claude/settings.local.json`, `CLAUDE.local.md`) for repos where he can't commit harness files.
   - Every hard-coded path moves into one root file, `toolkit.json`.
   - Crucible's test 1 runs inside PJ (J13) before anything else depends on the port.
2. **Package weight: conceded.**
   - The package is eleven sections. A half-day fix had no path except a waiver, and a rule waived daily is not a rule.
   - Change: the contract is the unit for every item. Brief and package are only for bets.
   - Crucible's test 3 (classify 40 past items) is step J0. Its number sets how AGENTS.md describes the default, not whether the slice path exists.
3. **Rituals rot: conceded in full.** The base rate is three repos out of three. Every ritual Crucible listed now has a check, or a named reason it has none:
   - revisit triggers → E-44
   - model-upgrade reruns → E-54
   - manifest hashes → E-46
   - stale role text → E-45
   - rule frontmatter → E-13
   - "Left to go" → generated (ruling (i))
   - the cool-down maintenance ritual → named in §10 as unguarded
4. **My top kill-shot misfired: conceded.**
   - Gloaguen et al. measured task success on SWE-bench-style issues. PEM's purpose is conformance.
   - Change: no always-on section is deleted on the strength of that paper. The spine A/B (own thread, primer AB) is the test, and it can falsify both my claim and the toolkit's.
5. **"Ours is better" without outcome evidence: conceded for all four claims** (AGENTS size discipline, MADR revisit triggers, roles against BMAD, weight against Spec Kit). Each now states the evidence that would prove it (§7).
6. **Shape Up cycles in borrowed cadences: conceded.** The engineering layer references no cycle fact. It depends only on appetite, through the slice/bet size split. The cycle charter stays product-bound and optional.
7. **Copy-not-share multiplies drift: conceded as Serious, not solved here.**
   - Vendoring is P-F's scope, and P-F gets an amendment (item D in §8).
   - Interim mechanism: every file a port copies carries a provenance line (`source: pem@<sha>`), so drift is at least detectable.
8. **Conventional Commits and DORA flips: conceded.**
   - The commit convention that survives is the one with a consumer: `<work-id>: <outcome>`, read by `pr:body` and `status`.

**Held, with the reason:**

1. **Role sprawl as a runtime cost.**
   - Roles load on request and cost zero always-on tokens.
   - The real cost is authoring attention, and that part I accept: this layer adds no engineering role file and exactly one subagent, generated from an existing role.
   - Whether an injected role beats a plain session becomes arm D of the spine A/B.
2. **Five decision files are friction.**
   - Not this layer's ruling.
   - The engineering layer adds no decision file (an as-built is a work record, not a decision record), and it makes the existing records checkable (E-44, E-45).
3. **Multi-tool parity as cost: partly held.**
   - Keeping AGENTS.md canonical costs nothing extra. Verifying parity across tools does.
   - Ruling: Claude Code is the only verified tool. AGENTS.md says the others are unverified. Hooks, which are Claude Code-only, carry rules the other tools will not see. That loss is accepted and stated.
4. **Byte preservation: out of scope.** The layer adds the hash check (E-46), which turns the claim into a check.

## 2. Rulings on conflicts (a) to (i)

Each ruling gives: the ruling, the rule it rests on, the mechanism, the losing side's best argument in one line, and the revisit trigger. Proposed conflict IDs are CF-50 to CF-58. The build verifies the next free numbers.

### (a) Brief and package against spec, plan, tasks and contract

- **Ruling:** No tasks.md and no plan.md.
  - Every work item, slice or bet, has a contract file, `specs/<id>-<slug>/contract.md`.
    - It holds criteria, each with an evidence type and a command or path.
    - It holds planned paths (the old "state the paths before implementing" rule, now a field), one-way doors touched, out of scope, and dependencies.
  - Size decides the other artifacts:
    - A **slice** (half a day or less) is the contract alone.
    - A **bet** keeps brief and package, and its contract cites the package's EARS criteria by ID rather than restating them.
  - For bets only, the evaluator reviews the contract before build ("contract go"). Slices skip the agreement step.
- **Rule:** the builder never grades itself; done is a check, not a claim; one fact, one home (a bet's criteria live in its package, a slice's in its contract).
- **Mechanism:**
  - `check-specs.ts` validates the contract schema.
  - `contract:init` writes results at FAIL.
  - `tk-contract` drafts contracts.
- **Losing side:** an explicit task list keeps a long-running agent from wandering between steps, and both Spec Kit and Kiro ship one.
- **Revisit:**
  - If J0 finds that more than 70% of past items were under half a day, AGENTS.md names the slice as the default.
  - If, across three bets, contract-go shows no fewer critic rounds or reopenings than bets without it on the current model, drop the agreement step and keep default-FAIL.

### (b) What replaces DEVIATIONS, PROGRESS and three-place closure

- **Ruling:** each fact gets one home.

  | Fact | Home |
  |---|---|
  | Done-ness | `results.json`, written only by tooling |
  | Departures from the contract | the "Deviations" section of `as-built.md`, immutable after merge |
  | Decisions taken during build | the ledger, as today |
  | Status across items | generated: `yarn status`, `specs/_status.md` |
  | The chronological deviation list | generated: `yarn status --deviations` |

  - Closure is one act: `as-built.md` lands, and `check-specs` validates it against the results.
  - "Code complete, migration pending" is its own state, never "done".
- **Rule:** one fact, one home; anything that can be generated is never hand-kept.
- **Mechanism:**
  - `check-specs.ts`: closure, immutability, results-to-contract match.
  - Status drift check in `yarn verify`.
  - SessionStart status line.
- **Losing side:** a single append-only DEVIATIONS file is one chronological read of every departure, cheaper than opening many folders. (`status --deviations` generates that read.)
- **Revisit:** if generated status disagrees with reality twice (harness log), the schema is wrong, not the view.

### (c) Role-file authority ladder against the index's precedence

- **Ruling:** `docs/index.md` §Precedence is the only authority ladder.
  - Any ladder inside a role body describes reading order at most.
  - Every generated subagent's banner carries one line naming the index as governing.
  - Role refinements 22a to 22f replace their ladders with a pointer.
  - The "package first" instinct survives as reading order. Under the index, a package may request an exception and never grants one.
- **Rule:** one fact, one home; enforced checks outrank prose.
- **Mechanism:** `gen-agents.ts` banner line (E-31), checked by `gen:agents --check`.
- **Losing side:** the attached package is the most specific statement of intent, so for the work in hand it should outrank general law.
- **Revisit:** none expected.

### (d) Permissions, sandbox and shell-command conventions

- **Ruling:** a tracked `.claude/settings.json` per repo, with no machine paths. It is derived from CC's evidence-tested set (5,254 replayed commands) and scoped to the repo.

  | Setting | Contents |
  |---|---|
  | Sandbox | On. Network allowlist: localhost, package registries, GitHub. A vendor is added with a ledger line at first use. |
  | Deny | push; reset --hard; clean -fdx; branch -D; filter-branch; recursive deletes outside the repo; npm publish and login; reads of `.env*`, `secrets/`, `*.pem`, `~/.ssh`, `~/.aws`; destructive database commands |
  | Ask | `gh pr create` and `gh pr merge`; deploy CLIs; database migrate against anything not disposable |
  | Allow | yarn scripts, local git, read-only tools |

  - The shell-construct bans move out of auto-memory into `bash-guard.ts`, whose denial messages state the fix.
  - `settings.local.json` stays gitignored and disposable, and `yarn doctor` scans it for secrets and rule growth.
  - The machine-wide file keeps only preferences and the universal denies. Taylor removes CC's hard-coded `additionalDirectories` (a machine action, held in §11).
- **Rule:** permissions are configured, not accumulated; the sandbox is the boundary; a rule in a check is a law.
- **Mechanism:** settings file, `check-settings.ts` (required denies present, no absolute paths, local file untracked), `bash-guard.ts`, `doctor.ts`.
- **Losing side:** one machine-wide file serves every repo and never drifts between copies.
- **Removal condition:** delete the construct bans in `bash-guard.ts` if the installed Claude Code matches compound commands per segment (verification V3).

### (e) Branch and push policy

- **Ruling:**
  - Agents commit only on `agent/<work-id>` branches (worktrees fine). They never commit on main and never push.
  - Taylor pushes, opens one PR per work item, and merges.
  - He reads every one-way-door tier in full before merging. The classifier (E-34) tells him which tier a PR is in.
  - No long-lived feature branches. An item that outlives its appetite goes to the circuit breaker, not to a longer branch.
  - In overlay, the host repo's policy wins, and the allowed branch pattern comes from `toolkit.json`.
- **Rule:** small batches (DORA 2025, verified in message 1); the human holds one-way doors; risk tiering needs PRs as the unit.
- **Mechanism:** settings deny on push; `bash-guard.ts` blocks commits on main and commits whose message lacks a work-id; remote branch protection is a port-runbook step for products with a remote.
- **Losing side:** with one human and no second reviewer, a long branch reviewed in batches costs less ceremony than a PR per item.
- **Revisit:** if the median PR overhead per item exceeds 10 minutes across 20 items, allow agents to push to `agent/*` and open draft PRs, with a ledger line and a settings change.

### (f) Database and migration guardrails

- **Ruling:**
  - The agent authors migrations.
  - The agent may apply them only to a disposable database it can reset: a local container or a branch database. This lets it verify its own database criteria, which ends the recurring "Not verified: AC 1 to 11".
  - A human applies to any shared or hosted database.
  - Applied migrations are immutable. Migration paths are a one-way-door tier.
  - Status shows "code complete, migration pending" until `as-built.md` records `applied:`.
  - The rule file, migration check and settings entries are created with the first database (no empty seams). The universal destructive-database denies ship now.
- **Rule:** scrutiny is proportional to irreversibility; verify what you build.
- **Mechanism:** settings deny/ask; `check-migrations.ts` (applied files unchanged against main); the `applied:` field read by `check-specs`.
- **Losing side:** any agent apply, even to a local database, normalizes the action, and the local database has drifted before (CC).
- **Answer in the ruling:** disposable means reset on every run.
- **Revisit:** first database; primer M (§8).

### (g) A PR template and a kickoff contract

- **Ruling: no hand-filled PR checklist.**
  - `yarn pr:body <id>` generates the body from the contract, results, as-built and risk tier.
  - `.github/pull_request_template.md` is a five-line pointer to that command.
  - The old ten pre-accept items are mapped:
    - The checkable ones are already checks: lint, boundaries, types, build, tokens.
    - The judgment ones go to the evaluator, through contract criteria.
- **Ruling: the pasted kickoff contract becomes `tk-kickoff`,** a manual skill backed by hooks and `contract:init`.
  - `contract:init` creates the folder, the FAIL results and the branch in one command, so the skill is a convenience, not a requirement (a fresh-session finding, §10).
  - "Do not start the next item": `contract:init` refuses to start a second active item on the same branch.
- **Rule:** a template is a request unless something checks it; prose that could be a check is a check.
- **Mechanism:** `pr-body.ts`, `risk-tier.ts`, `contract:init`.
- **Losing side:** a visible checklist puts the same questions in front of the reviewer every time, and generated text gets skimmed.
- **Revisit:** if a one-way-door PR merges without its tier being read, add one required checkbox for that tier only.

### (h) Tests during slices

- **Ruling:** proof comes from contract criteria during the item. Every criterion declares one evidence type:

  | Evidence type | Use for |
  |---|---|
  | `test` (unit or integration) | logic, data, money, auth |
  | `check` | lint, types, boundaries, tokens |
  | `capture` (Playwright `?state=` capture) | UI that QA may still change |
  | `manual` | human checks, with a reason; reported as not verified |

  - UI criteria default to `capture`. That honours the old reason for "no tests during slices" (tests thrown away after QA) without skipping proof.
  - Weakening a test (deletion, `.skip`, `.only`, fewer assertions) requires a "Test changes" line in `as-built.md`.
- **Rule:** acceptance criteria are executable; the builder never grades itself.
- **Mechanism:** contract schema (evidence type required); `contract:run` executes `test` and `check` criteria; `check-test-weakening.ts` (lands with P-C's test stack).
- **Losing side:** tests written before human QA pin a UI that QA will change, so slices pay twice.
- **Revisit:** if `capture`-evidenced UI criteria regress after merge at the same rate as `manual` ones over 20 items, the captures prove nothing and Touchstone re-rules.

### (i) Batch reports and "Left to go"

- **Ruling:**
  - "Left to go" is generated. `yarn status <id>` prints remaining criteria, pending migrations and not-verified items.
  - The Stop hook prints it at the end of any session that changed files, and batch reports end with it.
  - One human line, "Next:", lives in `as-built.md`.
  - The memory-only rule is deleted from auto-memory (Taylor action, §11).
- **Rule:** rules live in the repo; anything that can be generated is generated.
- **Mechanism:** `status` script, `stop-gate.ts`.
- **Losing side:** a hand-written list carries judgment about risk and order that a generated list cannot.
- **Revisit:** none expected.

## 3. The engineering layer: working checklist

Column key:
- **Reader:** A = agent, H = human, T = tooling only.
- **Tier:** always / path / trigger / request / event (hook) / never.
- **Budget:** tokens when loaded; "0" means never loaded into an agent's context.
- **Scope:** U = universal, P = product-bound, U+P = universal template, product fill.
- **Effort:** focused hours.
- **Filled example:** the demo app (`apps/web`) unless a reason is written.

### 3.1 Spine and layout

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-01 | `AGENTS.md` § Work loop (4 lines) | Unit of work is a contract; size picks artifacts; done is results plus as-built; bets are judged by `vigil` | A | always | +150 | Lorimer | `budget.ts` caps; fresh-session test; hooks carry the checkable half | none: spine | U (overlay block for hosts) | Code starts from a one-liner and "Complete" is declared in prose | 1 |
| E-02 | `AGENTS.md` cuts | Tooling notes to E-06/E-07; docs rules to E-08; delete "never load docs/research" (the index already says Never); delete "use yarn, never npm" (bash-guard teaches it); replace Start-here item 5 with the work loop | A | always | −510 | Lorimer | `budget.ts` | none | U | Budget breached when the work loop lands | 0.5 |
| E-03 | `CLAUDE.md` +2 lines | Hook denials are instructions to follow; `vigil` in the subagent line | A | always | +45 | Lorimer | 20-line cap | none | U | Agent retries denied commands with variants (judgment; tested in AB) | 0.25 |
| E-04 | `docs/index.md` amendments | Engineering row in Layers; budget rows (§5); delete the Library batch row; merge the two trigger bullets; "Always" line names hook output | A | always | ±0 lines (+40 tokens) | Lorimer; Plumb signs the UI row | `budget.ts` parses the table | none | U | Directory map has no engineering purpose; path rules uncounted | 0.5 |
| E-05 | `toolkit.json` (root) | One home for layout facts: tier, design-layer path, specs dir, work prefix, verify commands, `oneWayDoors` globs, migrations dir, branch pattern | T | never | 0 | Usher; `oneWayDoors` by Mason | Schema validated by every tooling script; missing key fails loudly | `docs/engineering/templates/toolkit.template.json` → PEM's own root file | U+P | `budget.ts` hard-codes apps/web; port blocked | 3 |

### 3.2 Path rules

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-06 | `.claude/rules/next.md` (`apps/*/**`, `**/next.config.*`) | Next 16 differences, moved from AGENTS | A | path | ≤150 | Turner | E-13; load test | none | U | Pre-16 patterns written | 0.25 |
| E-07 | `.claude/rules/turbo.md` (`**/turbo.json`) | Turborepo note, moved from AGENTS | A | path | ≤80 | Millwright | E-13; load test | none | U | Stale turbo.json syntax | 0.1 |
| E-08 | `.claude/rules/docs.md` (`docs/**`) | The two docs rules no lint can carry: never fill a template inside `docs/`; how to change the practice | A | path | ≤150 | Scribe | `lint:docs` carries the rest with messages | none | U (starter) | Filled templates in docs; unlogged amendments | 0.25 |
| E-09 | `.claude/rules/specs.md` (`specs/**`, `apps/*/specs/**`) | Contract fields, evidence types, as-built sections | A | path | ≤300 | Lorimer | `check-specs.ts`; `results-gate.ts` | none | U | Malformed contracts; as-built rewritten | 0.5 |
| E-10 | `.claude/rules/testing.md` (amend) | Add evidence types and the "Test changes" rule | A | path | ≤250 | Touchstone | `check-test-weakening.ts` | none | U | Silent `.skip` | 0.25 |
| E-11 | `.claude/rules/deps.md` (`**/package.json`, `.yarnrc.yml`) | Add the tech-stack row before the dependency | A | path | ≤150 | Quartermaster | `check-deps.ts`; Yarn age gate | none | U | Untracked dependencies, day-zero versions | 0.25 |
| E-12 | `.claude/rules/db.md` (migrations, schema) | Author, apply only to disposable DB, never edit applied | A | path | ≤300 | Mason; Warden on denies | settings deny/ask; `check-migrations.ts` | `docs/engineering/templates/db-rule.template.md` → none: demo has no database | P | Migrations edited in place or applied to shared DB | at first DB |
| E-13 | Rule-frontmatter lint (extend `lint-frontmatter.ts`) | `.claude/rules/*.md` may carry only `paths` (verified: the only field Claude Code reads) | T | never | 0 | Lorimer | CI | none | U | Decorative fields imply loading that never happens | 0.25 |

### 3.3 Settings, sandbox, hooks, doctor

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-14 | `.claude/settings.json` (tracked) | Deny/ask/allow, sandbox plus network allowlist, hook registration; no machine paths | T (Claude Code) | config | 0 | Lorimer; Warden rules denies | It is the enforcement; guarded by E-15 | `docs/engineering/templates/settings.template.json` → PEM's own file | U (overlay: merged, or local-only) | Prompt fatigue, then a widened local file with a secret in it (happened) | 3 |
| E-15 | `tooling/check-settings.ts` | Required denies present, no `Bash(*)`, no absolute paths, local file untracked | T | never | 0 | Warden | CI | none | U | A permission widened silently | 1 |
| E-16 | `tooling/hooks/bash-guard.ts` (PreToolUse, Bash) | Blocks npm/npx/pnpm, push, commit on main, commit without work-id, `$(`, backticks, heredocs; every message states the fix | A (messages) | event | ≤60 per denial | Lorimer | It is the enforcement; fixtures run in `yarn verify` | none | U | Push and branch drift; untraceable commits; parser prompts | 3 |
| E-17 | `tooling/hooks/results-gate.ts` (PreToolUse, Write/Edit/MultiEdit) | Denies direct edits to `results.json` and to merged `as-built.md` (except `applied:`) | A | event | ≤60 | Lorimer | Fixtures in verify | none | U | Builder grades itself | 1 |
| E-18 | `tooling/hooks/stop-gate.ts` (Stop) | If files changed: run `yarn verify:fast` (≤20 s) and block once on failure, honouring the loop guard; always print the generated "Left to go" | A+H | event | ≤300 on failure | Lorimer; Touchstone sets runtime | Runtime asserted in a fixture | none | U | "Done" with red types; Left-to-go lives in memory | 3 |
| E-19 | `tooling/hooks/session-start.ts` (SessionStart) | Prints `yarn status --brief`, truncated to 600 characters | A | always (event) | ≤150 | Lorimer | Truncation in code; declared allowance counted by `budget.ts` | none | U | Stale queue pointers (all three old repos); 30k-token kickoff reads | 1 |
| E-20 | `package.json` scripts | `verify:fast`, `status`, `contract:init`, `contract:run`, `contract:record`, `pr:body`, `doctor`, `test:hooks` | A+H | never | 0 | Usher | Hooks and CI call the same scripts humans do | none | U | Human and agent paths diverge | in rows |
| E-21 | `tooling/doctor.ts` | Node/Yarn/corepack, `toolkit.json` valid, hooks runnable, local-settings secret scan and rule count, ports | A+H | request | output ≤200 | Usher | Exits non-zero when broken | none | U | Folklore setup; secret in local settings | 2 |

### 3.4 Work loop

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-22 | `docs/engineering/templates/contract.template.md` | Unit of work: id, size, objective, criteria (id, statement or package EARS ref, evidence type, command or path), planned paths, one-way doors, out of scope, depends on | A+H | request (template); path (filled, via E-09) | filled ≤600 | Lorimer; Touchstone on evidence types | `check-specs.ts` schema | → `apps/web/specs/_example/contract.md` (P-C) | U | No testable done; tasks.md creep | 2 |
| E-23 | `docs/engineering/schemas/results.schema.json` plus `contract:init`, `contract:run`, `contract:record` | Results start FAIL. `run` executes `test`/`check` criteria; `record` requires an evidence file for `capture`/`manual`. `init` creates folder, results and branch. | T (A via status) | never | ≤200 if read | Lorimer, Touchstone | Schema plus E-17 | → `apps/web/specs/_example/results.json` (P-C) | U | Hand-kept PROGRESS | 4 |
| E-24 | `docs/engineering/templates/as-built.template.md` | Shipped against contract, deviations with why, ledger IDs, migrations (`applied: pending` or date), test changes, not verified, model, Next | A+H | request; read by status | ≤500 | Scribe (form), Lorimer | `check-specs`: sections; immutable after merge except `applied` | → `apps/web/specs/_example/as-built.md` (P-C) | U | DEVIATIONS sprawl; "Complete" with migrations unrun | 1.5 |
| E-25 | `tooling/check-specs.ts` | Schema, results-to-contract IDs, closure, immutability, status drift | T | never | 0 | Lorimer | CI | none | U | Three-place closure by hand | 4 |
| E-26 | `specs/_status.md` (generated) | One view of every item's state; replaces PROGRESS and build-order | H (A via E-19) | never | 0 | generated | Drift check in verify | generated | U | Stale queues | in E-25 |
| E-27 | `.claude/skills/tk-contract/` (manual) | Draft a contract from a package or a one-line request; classify size; flag grep-based criteria | A | request (listing 0, V4) | body ≤1,500 | Lorimer | REGISTRY row; `disable-model-invocation` | none | U | Inconsistent contracts | 2 |
| E-28 | `.claude/skills/tk-kickoff/` (manual) | Contract present (and agreed for bets), dependencies done, `contract:init`, state planned paths | A | request | ≤1,000 | Lorimer | REGISTRY row; hooks back every step | none | U | Kickoff pasted from memory | 1.5 |
| E-29 | `.claude/skills/tk-close/` (manual) | `verify`, `contract:run`, delegate to `vigil`, write as-built, `status`, `pr:body` | A | request | ≤1,200 | Lorimer | REGISTRY row; `check-specs` | none | U | Closure skipped | 1.5 |
| E-30 | `.claude/agents/vigil.md` (generated from Vigil, `subagent: true`, tools Read, Grep, Glob) | Fresh-context evaluator of a contract against evidence files and code; never sees the builder's summary; no Bash, so no hook needed to restrict it | A | listing always; body on delegation | listing ≤60; body ≤3,000 | Lorimer (generation); Vigil content (22c) | `gen:agents --check` | none | U | Bets self-graded | 0.5 (+22c) |
| E-31 | `tooling/gen-agents.ts` (amend) | Banner line: `docs/index.md` §Precedence governs any ladder in this body | T | never | +20 per agent body | Lorimer | `gen:agents --check` | none | U | Role ladders override the index | 0.5 |

### 3.5 Commits, branches, review

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-32 | Commit convention `<work-id>: <outcome>` (agents only; Taylor's own commits are free) | Traceability; consumed by `pr:body` and `status` | A | none: taught by the hook message | 0 | Lorimer | E-16 | none | U | Untraceable history | in E-16 |
| E-33 | Branch policy `agent/<work-id>`, no push, one PR per item | See ruling (e) | A+H | none | 0 | Mason (policy), Lorimer (mechanism) | Settings deny; E-16; remote protection via port runbook | none | U; remote protection P | Main 78 commits behind (Synapse) | in E-16 |
| E-34 | `tooling/risk-tier.ts` | Classifies a diff against `oneWayDoors` | T, H | never | 0 | Mason | Used by `pr:body` and CI label | none | U | Every diff read equally, or none | 1.5 |
| E-35 | `tooling/pr-body.ts` and `.github/pull_request_template.md` (5 lines) | Generated PR body: contract, results, as-built, tier | H | never | 0 | Lorimer | CI on products with a remote: body has the generated marker and work-id | none | U | Hand checklists nobody fills | 2 |

### 3.6 Tests

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-36 | `docs/engineering/test-strategy.md` | Risk shape picks test type; evidence types; tiers with runtime budgets (hook ≤20 s, PR ≤10 min, nightly); flake policy; synthetic fixtures | A+H | request (E-10 points to it) | ≤1,500 | Touchstone | The gates it names | `docs/engineering/templates/test-strategy-delta.template.md` → `apps/web/docs/engineering/test-strategy.md` (P-C; product deltas only) | U+P | Tests chosen by habit | 2 |
| E-37 | `tooling/check-test-weakening.ts` | Diff against main: removed tests, `skip`/`only`/`todo`, fewer assertions need a "Test changes" line | T | never | 0 | Touchstone | CI | none | U | Agents delete failing tests | 2 (P-C) |
| E-38 | Test stack (Vitest or Node runner, Playwright captures) | Ledger plus tech-stack rows | H | never | 0 | Quartermaster, Touchstone | `check-deps` | none | U | No `contract:run` target | folded into P-C |

### 3.7 Dependencies and stack

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-39 | `docs/engineering/dependency-policy.md` | Add, bump and pin rules; minimum release age; one vendor per category; upgrade cadence; ruling format | A+H | request (E-11 points to it) | ≤1,000 | Quartermaster | E-40, E-41 | none | U | Résumé-driven dependencies | 1.5 |
| E-40 | `.yarnrc.yml` age gate (`npmMinimalAgeGate`, 3 days proposed; key verified in message 1, Yarn docs) | Waits out the window when compromised versions spread | T | never | 0 | Quartermaster, Warden | Yarn itself | none | U | Day-zero worm exposure (Shai-Hulud class) | 0.25 |
| E-41 | `tooling/check-deps.ts` | Every dependency has a tech-stack row; exact pins respected | T | never | 0 | Quartermaster | CI | none | U | Untracked dependencies | 2 |
| E-42 | `docs/engineering/tech-stack.md` (amend) | Add owner, expiry condition and ruling ID columns | A+H | request | existing | Quartermaster | E-41 | none | U+P | Pins with no expiry | 1 |
| E-43 | `docs/engineering/templates/stack-scorecard.template.md` and `market.template.md` [ASSUMPTION: these are the Prompt 17 stack files] | Per-part scorecard; dated market file with `review_by` | A+H | request | n/a | Quartermaster | E-44 warns on past `review_by` | → none: the demo's stack is the toolkit's own | U templates, P filled | Stack chosen by reputation; stale prices believed | 1.5 |

### 3.8 Decisions and docs integrity

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-44 | Record frontmatter `revisit:` (kind `date`, `version`, `path` or `none`; value) plus `tooling/check-revisit.ts` | Revisit triggers become checks; fired ones warn in verify and list in `status` | T, H | never | 0 | Scribe | CI warn | `decision.template.md` (amend) | U | Triggers never fire | 3 |
| E-45 | `tooling/check-refs.ts` | Repo paths named in AGENTS, rules, generated agents and skills must exist; warns on `npm run`/`npx` in docs code blocks | T | never | 0 | Scribe, Lorimer | CI | none | U | Stale role text in subagents (happened) | 2 |
| E-46 | Manifest hash check | Filed bodies still match `filing-manifest.json` | T | never | 0 | Scribe | CI | none | U (starter) | Byte preservation asserted, not checked | 0.5 |
| E-47 | Boundaries lint: remediation messages and a no-disable rule | Errors say what to do; suppressing a boundaries error fails | A (messages) | on lint | ≤50 per error | Mason | ESLint | none | U | Suppressed boundary errors | 1 (item B) |
| E-48 | `docs/engineering/codebase-conventions.md` (amend) | Reconcile the `_components/` rule with AGENTS; one spelling | A+H | request | existing | Mason | none: placement content; E-47 carries the checkable part | none | U | Two rules for one placement | 0.5 |

### 3.9 Runbooks and harness

| ID | Path | Purpose | Reader | Tier | Budget | Owner | Enforcement point | Template → filled example | Scope | Without it | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E-49 | `docs/runbooks/port.md` (new; README port section moves here) | Starter, overlay and overlay-local steps, each timed; trial log | A+H | request | ≤1,500 | Usher | `yarn doctor` passes in the ported repo; timings logged | filled by J13 and P-E | U | Port by archaeology | 3 |
| E-50 | `docs/runbooks/onboard-agent.md` (amend) | Settings test, hook fixtures, work-loop walk, fresh-session test | H | request | existing | Lorimer | Changelog line per run | none | U | Harness changes unproven | 0.5 |
| E-51 | `docs/runbooks/release.template.md` (amend) | Work-id, tier, migration apply sets `applied:`, flag-removal date | H | request | existing | Millwright | `check-specs`: not done while `applied: pending` | none | U | Migrations forgotten after merge | 0.5 |
| E-52 | Incident runbook | Deferred. Trigger: first production user. The postmortem template exists. | H | none | 0 | Millwright, Warden | Trigger as a ledger line | none | P | n/a until users exist | 0 now |
| E-53 | `docs/engineering/harness-log.md` | Recurring agent mistake → mechanism, or "accepted: why" → date; append-only | A+H | request | n/a | Lorimer | Lint: each row has a mechanism or an acceptance | none | U+P | The same correction made forever | 0.5 |
| E-54 | `.claude/harness-baseline.json` | Model IDs the harness suite last passed on, with date | T | never | 0 | Lorimer | Warn when an as-built's `model:` is not in the baseline: run onboard-agent | none | U | Model-upgrade reruns never happen | 1 |
| E-55 | `docs/engineering/index.md` plus `tooling/check-asset-map.ts` | This checklist in the repo; the check fails any row missing owner, tier, budget or enforcement (or a `none: reason`) | A+H | request | ≤2,500 when read | Lorimer | CI | none | U | Assets without owners; Taylor's done criterion left as prose | 1.5 |

**Deliberately not built, each with its trigger:**

| Item | Trigger or reason |
|---|---|
| Doc-gardening agent and scheduled cleanup | Forge 22b plus a measured cleanup load |
| AI PR approval | A second reviewer, or AI approval being considered |
| Renovate or Dependabot | First product with a remote |
| commitlint | No consumer |
| Mutation testing | First one-way-door module with tests |
| Stacked PRs | Rejected outright |
| Onboard-human runbook | First contractor |
| Kill-switch hook | First unattended scheduled run |
| C4 and DORA as assets | Rejected outright |

## 4. Gap table

| Area | Have | Missing | Redundant | Misplaced | Ahead |
|---|---|---|---|---|---|
| Agent context | AGENTS 64 lines, CLAUDE shim, index, three path rules, budget in CI | Work loop; next, turbo, docs, specs, deps rules; SessionStart status | "Never load docs/research" in both AGENTS and index | Tooling notes and docs rules in always-on | Budget held by CI. Not proven better (AB) |
| Permissions and sandbox | Machine settings (CC lineage); tracked files in CC and Synapse | Tracked PEM settings; `check-settings`; `doctor` | Per-repo copies drifting | Shell rules in auto-memory; global file hard-codes CC's path | Evidence-replay method (5,254 commands) |
| Hooks | None | bash-guard, results-gate, stop-gate, session-start | n/a | Every hook-able rule lives as prose | n/a |
| Work artifacts | Brief, package (EARS), cycle charter | Contract, results, as-built, status view, closure check, slice path | DEVIATIONS, PROGRESS, build-order, three-place closure (old repos) | Done-ness as prose | Results writable only through tooling (judgment: stricter than cwc's evidence gate) |
| Review | UI critic loop; severity scale | Behavior evaluator; risk-tier classifier; generated PR body | Three overlapping pre-accept checklists (Synapse) | n/a | Path tiers match Ona and Rewind. A match, not a lead. |
| Tests | `testing.md` rule | Strategy; evidence types; weakening check; test stack | n/a | "No tests during slices" in old repos | Evidence type per criterion (judgment) |
| Dependencies and stack | `tech-stack.md` pins and absences; record 0003 | Dependency policy; age gate; `check-deps`; scorecard and market templates | n/a | n/a | n/a |
| Decisions | Ledger; records with revisit field; changelog; conflicts | Revisit check; ref check; manifest check | n/a | n/a | Revisit field. Unproven until one fires. |
| Porting | P-E prompt; README port section | Port runbook with tiers; `toolkit.json`; overlay | n/a | Port steps in README | n/a |
| Harness maintenance | onboard-agent runbook | Harness log; model baseline; upgrade check; asset-map check | n/a | Rituals stated as prose in the index | n/a |

## 5. Budget check

### 5.1 Always-on

Estimates use the measured 3,320 and its parts (AGENTS 1,586, CLAUDE 235, index 1,270, subagent listing about 229). The build measures with `yarn budget`.

| Part | Now | After | Change |
|---|---|---|---|
| `AGENTS.md` | 1,586 | about 1,226 | −510 (E-02), +150 (E-01) |
| `CLAUDE.md` | 235 | about 280 | +45 (E-03) |
| `docs/index.md` | 1,270 | about 1,310 | +40 (E-04, line count unchanged at 79/80) |
| Subagent listing | about 229 | about 289 | +60 (`vigil`) |
| Skill listing | 0 | 0 | Manual skills only (verify V4) |
| SessionStart output | 0 | ≤150 | Declared allowance, truncated in code |
| **Total** | **3,320** | **about 3,255** | Under the 4,000 cap with about 745 headroom |

### 5.2 Per build

The engineering layer fits the current table:
- The contract rides the "brief and package" line: ≤600 for a slice, in place of brief and package. For a bet it cites EARS IDs rather than restating them.
- Path rules ride lines that `budget.ts` does not count today.

That uncounted gap predates this layer. So does the canon overflow, where record 0009's own revisit trigger (about 3,800 tokens) has already fired at 3,856.

Proposed amendment to the `docs/index.md` budget table, exact text `[PROPOSED — needs sign-off: Plumb for the UI row]`:

```markdown
| Build                   | Loads                                                                                                                                  | Cap (tokens) |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| UI build                | always 4,000 + design layer 5,500 + brief, package and contract 2,000 + path rules 1,000 + references 1,000 + one skill body 1,500 | 15,000       |
| Non-UI build            | always 4,000 + path rules and nested `AGENTS.md` 1,500 + brief, package and contract 1,500                                             | 7,000        |
| Critic pass (forked)    | `canon-rubric.md` and canon §2 + brief and package + ≤3 exemplars (screenshots excluded)                                               | 6,000        |
| Evaluator pass (forked) | evaluator body 3,000 + contract and cited package criteria 1,500 + evidence index 500 (no builder summary; evidence files on demand)    | 5,000        |
```

Also in `docs/index.md`:
- Delete the Library batch row. It is not in the repo budget, so it fails the deletion test.
- Amend the "Always" line to read: "…the skill and subagent listings, and SessionStart hook output (≤150)."

Notes on the amendment:
- References (1,000) and skill body (1,500) are capped below Plumb's earlier proposal while neither file exists yet. A cap on an unwritten file costs nothing.
- If Plumb prefers 2,000 for the skill body, the references line drops to 500 instead.
- **Non-UI worst case:** path rules are ts about 300, testing about 250, next about 150, specs about 300, deps about 150, totalling about 1,150, under 1,500. The database rule (≤300) arrives with the first database and still fits.
- **Evaluator worst case:** `vigil`'s body is about 2,600 tokens (Vigil is roughly the Mason file's length, judgment). Under 3,000.

## 6. Build order

PJ runs before P-C. P-C then builds the demo through the loop, which produces the filled examples and the test stack.

| Step | What | Depends on | Owner | Effort (h) | Phase |
|---|---|---|---|---|---|
| J0 | Verify V1 to V7 against the installed Claude Code; Crucible test 3 (classify 40 past items in Synapse and taylor-aucoin) | none | Lorimer | 1.5 | PJ core |
| J1 | `toolkit.json`; refactor `budget.ts`, `lint-frontmatter.ts`, `directory-map.ts` to read it | J0 | Usher | 3 | PJ core |
| J2 | `settings.json`, `check-settings`, `doctor` | J0 | Lorimer, Warden | 4 | PJ core |
| J3 | `bash-guard` plus fixtures plus `test:hooks` | J1, J2 | Lorimer | 3 | PJ core |
| J4 | Spine moves, work loop, new path rules, rule-frontmatter lint, index amendments | J1 | Lorimer (Plumb signs UI row) | 2 | PJ core |
| J5 | Contract and as-built templates, results schema, `contract:*`, `results-gate`, `check-specs`, `status` | J1, J3 | Lorimer, Touchstone, Scribe | 8 | PJ core |
| J6 | `stop-gate`, `session-start`, `verify:fast` | J5 | Lorimer | 3 | PJ core |
| J7 | `tk-contract`, `tk-kickoff`, `tk-close` plus REGISTRY rows; `vigil` generation plus banner | J5, J6 | Lorimer | 5 | PJ core |
| J8 | `risk-tier`, `pr:body`, PR template | J1, J3, J5 | Mason, Lorimer | 3.5 | PJ trailing |
| J9 | Dependency policy, age gate, `check-deps`, tech-stack amendment, stack templates, `deps.md` | J1 | Quartermaster | 5 | PJ trailing |
| J10 | `check-revisit`, `check-refs`, manifest check, boundaries messages and no-disable | J1 | Scribe, Mason | 6.5 | PJ trailing |
| J11 | Test strategy, `testing.md` amendment (weakening check waits for P-C) | J5 | Touchstone | 2.5 | PJ trailing |
| J12 | Harness log, baseline, `check-asset-map`, `docs/engineering/index.md`, runbook amendments, port runbook; fresh-session test run | all | Lorimer, Usher, Millwright | 4.5 | PJ trailing |
| J13 | Crucible test 1: port trial into a scratch copy of Synapse (starter, then overlay), timings into the port runbook | J1 to J12 | Usher | 2.5 | PJ trailing |
| after | P-C builds the demo through the loop; filled examples; test stack; weakening check | PJ core | Vesper, Plumb, Assay, Touchstone | per P-C | P-C |
| after | Spine A/B (primer AB) | P-C demo or Synapse tasks | Tally, Lorimer, Touchstone | 4 plus runs | own thread |
| after | P-F and P-E with amendments D and O; primer M at first database | as listed | per prompt | per prompt | P-F, P-E |

Totals: core 29.5 hours, trailing 24.5 hours.

If time is short, cut the trailing steps, never J5. J5 is the step that changes how work is done; the others make it cheaper to keep right.

## 7. Methodology verdicts after Crucible

| Methodology | Message 1 | Crucible | Final | Where it lives |
|---|---|---|---|---|
| AGENTS.md spec | Adopt; ours better on size | Adopt stands; size claim needs evidence | Adopt the filename and home; the size claim waits on AB | E-01 to E-03 |
| CLAUDE.md / memory | Adapt | Stands | Adapt: rule frontmatter is `paths` only | E-13 |
| OpenAI harness | Adapt | Stands, narrowed | Remediation-text messages and generated freshness; no cleanup program, no doc-gardening agent, no self-merge | E-16, E-47, E-26 |
| Anthropic harness | Adapt | Default-FAIL stands; contract needs evidence | Default-FAIL, stricter (tooling-only writes); contract agreement for bets only, with revisit trigger | ruling (a) |
| Spec Kit | Reject; ours better on weight | Reject stands; weight claim flips | Reject; the package is no longer the default; slice path added | ruling (a) |
| Kiro | Reject tool | Stands | Reject the tool; EARS kept | package template |
| OpenSpec | Reject | Needs evidence | Needs evidence: overlay trial asks whether a delta proposal beats a contract on brownfield | item O |
| BMAD | Reject; ours better on roles | Reject stands; roles claim flips | Reject; role value measured in AB arm D | primer AB |
| Tessl | Reject | Stands | Reject | n/a |
| Conventional Commits | Adapt | Flips | Reject; `<id>: <outcome>` is kept because it has a consumer | E-32 |
| Trunk-based | Adopt in principle | Stands; really conflict (e) | Adopt through (e) | E-33 |
| Stacked PRs | No verdict | Reject | Reject | n/a |
| Google review guide | Adapt, provisional | Needs evidence | Not commissioned: judgment items enter through contract criteria | n/a |
| PostHog, Linear | No verdict | Stands | Not commissioned | n/a |
| MADR | Ours better | Needs evidence | Keep records; make triggers checkable; claim stands only after a trigger fires | E-44 |
| Diátaxis | No verdict | Stands | Not commissioned | n/a |
| C4 | No verdict | Stands | Reject as an asset | n/a |
| DORA | Adopt as checklist | Flips | Reject as an asset; small batches live in (e) | ruling (e) |
| Shape Up | Keep | Needs evidence | The layer depends on appetite only; the cycle stays product-bound and optional | ruling (a) |
| Risk-tiered approval | Adapt | Conditional on (e) | Classifier now, to tell Taylor what to read; AI approval not adopted | E-34 |
| Boundary lint | Adopt | Stands | Adopt, plus messages and no-disable | E-47 |
| Mutation testing | No verdict | Stands | Defer, with trigger | §3 not-built list |
| Changesets | Reject | Stands | Reject until the first published package | n/a |

## 8. Investigation checklist

| ID | Topic | Question | Role | Thread | Tier |
|---|---|---|---|---|---|
| V | Claude Code behaviors this layer depends on | See the V1 to V7 list below | Lorimer | folded: PJ J0 | B |
| AB | Spine conformance A/B | Does always-on and path-rule context raise conformance on this stack, and which sections earn their tokens? | Tally, Lorimer, Touchstone | own thread | A |
| M | Migrations and disposable databases | Which migration linter, apply flow and disposable-database method let agents verify database criteria without touching shared data? | Quartermaster, Mason, Warden | own thread, at first database | A |
| O | Overlay adoption | What is the smallest harness that runs green in a repo Taylor doesn't own, including local-only? Does an OpenSpec-style delta beat a contract for brownfield work? | Usher | folded: P-E amendment | B |
| D | Vendoring and drift across products | How does a toolkit fix reach N products without hand-patching, using the provenance lines E-49 introduces? | Lorimer | folded: P-F amendment | A |
| B | Boundary-lint messages | Can eslint-plugin-boundaries carry per-rule remediation text, or does that need a structural test? | Mason | folded: PJ J10 | C |
| T | Test stack | Vitest against the Node test runner; Playwright capture harness; Storybook interaction tests | Touchstone, Quartermaster | folded: P-C | B |
| S | Secrets and supply chain | Age-gate key and version on Yarn 4.13; secret scanning in a local-only repo | Warden | folded: PJ J9 | B |
| R | Unresearched methodologies (Google eng-practices, PostHog, Linear, Diátaxis, C4) | none | none | not commissioned: no gap in this layer names them | none |

**Verification V1 to V7 (folded into J0):**
1. The Stop hook input carries a loop-guard flag, and exit code 2 feeds stderr back to the agent.
2. SessionStart stdout enters context.
3. Permission rules match compound commands per segment.
4. `disable-model-invocation: true` removes a skill from the listing.
5. Sandbox configuration keys and network allowlist syntax.
6. The project-directory variable is available in hook commands.
7. PreToolUse fires for subagent tool calls.

### Primer AB — Spine conformance A/B

**Assignment.**
- Tally leads measurement, I own the arms, and Touchstone owns the scoring harness.
- Crucible reviews the design before a single run. This thread exists because my top kill-shot in message 1 was under-fitted, and the toolkit's claim is equally untested.

**Decision served.**
- Whether each always-on section (layers table, directory-map pointer, precedence, work loop) and each path rule keeps its tier.
- The first measured basis for the budget caps.

**Ask.**
1. Choose 16 conformance-sensitive tasks: 12 from Synapse history (placement, tokens, boundaries, naming, env reads, contracts) and 4 from the demo once P-C lands. Write each as a fixed one-line prompt with an expected-paths fixture.
2. Four arms, each in fresh sessions on the same model, two seeds each:
   - A: the full spine and rules.
   - B: commands-only AGENTS.md, no index, no rules.
   - C: A minus the layers table and the directory-map pointer.
   - D: A plus an injected Mason role.
3. Score mechanically: lint, boundary and token violations; type errors; placement against the fixture; contract criteria passed; tokens used; wall time. Human blind scoring only for placement disagreements.
4. Pre-register the decision rule. A section keeps its tier only if removing it adds at least one violation per four tasks. Report counts and intervals. No significance claims at this n.

**Evidence rules.**
- Your own runs are primary. Gloaguen and Lulla are context only, never verdicts.
- Date the model and Claude Code version on every run.

**Output shape.** Run log; violations table by arm; keep, move or delete per section; the exact budget-table amendment, with method.

**Done criteria.**
- Every always-on section has a verdict tied to a count.
- `yarn budget` passes after the moves.
- The run is reproducible from the committed fixtures.

**Not wanted.**
- SWE-bench proxies.
- LLM-judged "quality" scores.
- More than 16 tasks before the first readout.
- Any always-on line added because it "should help".

### Primer M — Migrations and disposable databases

**Assignment.**
- Quartermaster leads.
- Mason rules on the one-way doors.
- Warden threat-models the agent's database access.
- Touchstone owns how database criteria are proven.
- Trigger: the first product that needs a database.

**Decision served.** The contents of `.claude/rules/db.md`, `check-migrations.ts`, the settings additions, the disposable-database method and the release runbook's apply steps. Ruling (f) set the rule; this thread sets the mechanisms.

**Ask.**
1. Postgres migration linters: what each catches, current version, with dates.
2. Expand-contract and online migration practice, from primary engineering posts with team and date.
3. Disposable-database options for agents: a container per worktree, Supabase branching, Neon branching. Compare reset time, cost, synthetic seeding and network rules.
4. How to detect an edit to an applied migration under the chosen migration tool.
5. Permission and sandbox rules that tell a disposable connection from a shared one.

**Evidence rules.** Vendor docs are dated feature facts, never verdicts. Named team posts are primary. Label every claim and mark what is not found.

**Output shape.** Ruling; `db.md`; check spec; settings delta; runbook steps; one migration taken end to end on a disposable database.

**Done criteria.**
- An agent applies and verifies a migration on a disposable database.
- A deliberately edited applied migration fails CI.
- An apply against a shared database is denied by settings.

**Not wanted.**
- An ORM debate (that is the stack scorecard's job).
- Tooling sized for scale this toolkit does not have.

## 9. Assumptions about the build

- `[ASSUMPTION: Node 22 runs .ts hook scripts with type stripping, as tooling/*.ts runs today.]`
- `[ASSUMPTION: V1 to V7 hold. Each mechanism that depends on one is built only after J0 confirms it, and replaced or dropped if not.]`
- `[ASSUMPTION: the work prefix is per product, from toolkit.json; PEM's is PEM.]`
- `[ASSUMPTION: 3 days for the age gate. Quartermaster may change it.]`

## 10. Test results across the proposed layer

These are desk results, labeled as such. J12 runs them for real and records the results in the changelog.

### 10.1 Deletion test (every always-on line touched)

| Line | Verdict | Named mistake if deleted |
|---|---|---|
| Work loop: every change has a contract | Keep | Agent codes from a one-liner and declares "Complete" in prose (CC, taylor-aucoin) |
| Work loop: size picks artifacts | Keep | Brief and package for a half-day fix, or no contract on a bet |
| Work loop: done is results plus as-built | Keep | Done declared in chat. The Stop hook catches red checks, not missing criteria. |
| Work loop: bets judged by `vigil` | Keep | Never delegates, so bets are self-graded |
| Draft: "results.json is written by tooling" | Deleted | The results-gate message teaches it in one round-trip |
| Draft: "hooks enforce yarn, push, branches, commits" | Moved to CLAUDE.md | Claude-only fact; one home |
| "Never load docs/research" in AGENTS | Deleted | The index's Never tier says it, and both files are always loaded |
| "Use yarn, never npm or pnpm" | Deleted | `bash-guard` teaches it; the Commands table shows yarn |
| Tooling notes (Next, Turbo) | Moved to path rules | No mistake possible on docs, spec or tooling work |
| Docs rules (5 bullets) | Moved to `docs.md`, cut to 2 | Three are lint-enforced with messages |
| CLAUDE.md hook line | Keep, labeled judgment | Agent retries denied commands with variants. Tested in AB. |
| SessionStart status | Keep | Stale queue pointers; 30k-token kickoff reads (CC) |
| `vigil` listing | Keep | Without it the agent cannot delegate |

### 10.2 Budget test

- Always-on: about 3,255 against 4,000. Pass.
- Non-UI worst case: about 1,150 for path rules against 1,500. Pass.
- UI build: fits the current table, because the contract rides an existing line. The pre-existing canon overflow is flagged for Plumb; it is not caused by this layer.
- Evaluator: about 4,600 against 5,000. Pass.

### 10.3 Mechanism test (every failure seen twice or more in the old repos)

| Recurring failure (source) | Mechanism now, or reason none |
|---|---|
| Stale entry points and queues (all three repos) | Generated status, SessionStart line, drift check |
| "Complete" with migrations unrun (taylor-aucoin) | `applied:` field; "code complete" state; release runbook step |
| Three-place closure skipped (CC) | One place; `check-specs` |
| npm in docs and commands (taylor-aucoin, about 30 docs) | `bash-guard`; `check-refs` warns on npm in docs |
| Push and branch drift (Synapse, taylor-aucoin) | Push denied; commit on main blocked; remote protection in the port runbook |
| Local settings accumulation and a secret (taylor-aucoin) | `doctor` scan; `check-settings` forbids tracking the local file |
| "Left to go" only in memory (Synapse) | Generated by `status` and the Stop hook |
| Grep criteria broken by the agent's own comments (Synapse) | Partial: `tk-contract` flags grep evidence and prefers `check` commands. Residual risk named. |
| Stale role text in subagents (PEM) | `check-refs` over generated agents; banner line |
| Rules living in auto-memory (all three) | None possible: no check can see memory. Taylor moves them into the repo once (§11). |
| Agents can't verify database criteria (Synapse) | Disposable-database ruling (f); mechanism lands with primer M |
| Docs worded for Cursor (CC) | None: a one-time cleanup in old repos. The starter has no such text; overlay doesn't touch host docs. |

### 10.4 Fresh-session test (desk walk; real run in J12)

- **Brief:** "Add a filter by status to the records table."
- **Predicted path:**
  1. Always-on: CLAUDE.md, AGENTS.md, index, SessionStart line showing no active item.
  2. The work loop says to draft a contract, so the agent opens the contract template (request tier).
  3. It classifies the work as a slice.
  4. It reads the table component, and `ui.md`, `ts.md` and `next.md` fire.
  5. It writes the contract with planned paths and runs `contract:init`, which creates the branch.
  6. It builds and runs `contract:run`. The Stop hook prints what is left.
- **Should never open:** `docs/research/`, roles, references (unless a critique is asked for).
- **Desk finding:** manual skills can't be invoked by the agent. So `contract:init` must create the branch itself, and the work loop must work without `tk-kickoff`. Both are now in E-23 and ruling (g).

### 10.5 Least-privilege, provenance and trigger tests

- **Least privilege:** `vigil` has Read, Grep and Glob, with no write and no shell. Hooks write nothing except through the scripts they call. Pass.
- **Provenance:** no third-party skill, hook or server is added. The cwc patterns are re-implemented, not vendored. Pass.
- **Trigger test:** no model-invocable skill is added, so the listing count is unchanged. Not applicable.

## 11. Held for sign-off

| Item | Who signs |
|---|---|
| UI budget row | Plumb |
| Record 0010 (adoption tiers; narrows record 0001's scope without superseding it) | Taylor |
| Moving the auto-memory workflow rules into the repo, then deleting them from memory | Taylor |
| Removing CC's `additionalDirectories` from the machine-wide settings | Taylor |
| Generating `vigil` before refinement 22c (interim body; the banner neutralizes its old ladder) | Taylor |
| Confirming that "stack decision files (from Prompt 17)" means Quartermaster's scorecard and market files | Taylor |
