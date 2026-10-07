---
epic: MIG
walk: conscious-connections
path: middle
walked_by: the builder (MIG-10)
date: 2026-10-07
repo_commit: 162faefa
toolkit_commit: d7db912
---

# Desk walk — conscious-connections (middle)

> Walked by the MIG-10 builder on 2026-10-07, after the synapse walk, reading `docs/workflows/tracks/migrate.md`, `docs/runbooks/migrate/README.md`, `verify.md`, `layer-3.md` and `manifest.json` at toolkit commit `d7db912` against `~/lighthouse/conscious-connections/conscious-connections` at commit `162faefa` on `fix/beta-qa-fixes`. Read as **middle** (the technical notes score it 18 of 34; the gate passes), which "adds the conflict round (P1) and the records round, with the records step timed on its own". Nothing ran in the repo and nothing was written there: the facts come from the brief's Evidence paragraph, the technical notes, a read-only `yarn migrate:assess` capture run from the toolkit today (seven of seventeen signals, so "path: not decided" until MIG-6 lands), and read-only looks through `git --no-optional-locks`, every path read NUL-separated (`ls-files -z`), because this repo has 57 tracked doc paths with spaces and 173 with an em-dash.

## Facts this walk reads from

- **Branches.** `fix/beta-qa-fixes` is `162faefa` and equals `origin/fix/beta-qa-fixes`; no upstream configured. `main` equals `origin/main`, 28 commits behind, 0 ahead, last moved 2026-08-12. Twelve `claude/*` branches, nine `feature/*` (one spelled `featue/affiliate-crm`), one `fix/*`. Seven worktrees under `.claude/worktrees/` (about 17 GB, per the brief), two detached. **The tree is dirty:** ` D docs/roles/role-authoring-guide.md`, an unstaged deletion of a tracked file. Node 22.22.2; `.nvmrc`.
- **The harness files.** `.gitignore` lines 49 and 52: `.claude/*` with `!.claude/settings.json`, as synapse. The tracked `settings.json` holds the same shape as synapse's: an `allow` list (`yarn`, `npx tsx|eslint|prettier|tsc`, `corepack`, `tsc`, `eslint`, `prettier`, `turbo`, `curl`, `wget`), `deny` (`db:reset`, `db:drop`, `supabase db reset`, `drizzle-kit drop`), `ask` (`db:migrate|push|seed|setup`, `drizzle-kit migrate|push`), no hooks, and a tracked `sandbox` block whose network allowlist includes `api.anthropic.com`. Untracked beside it: `settings.local.json`, a `.bak` of it, `PERMISSIONS-AUDIT.md`, `launch.json`.
- **Instruction files.** `AGENTS.md` 184 lines; `CLAUDE.md` is `@AGENTS.md`; nested `apps/marketing/AGENTS.md` (9 lines) and `apps/toolkit/AGENTS.md` (153 lines, opening with the vendor `nextjs-agent-rules` block, then "v1 scope guardrails" and "product non-negotiables"), each with a one-line `CLAUDE.md`. The conflicts: line 33 "No git branches or PRs as part of slice work; commit to the working branch", line 34 "No tests during slices". Other human lines: "Never scaffold `apps/dating/` or `apps/mobile/`", "`docs/archive/**` is read-only history", the append-only logs, migrations append-only with a human review, never hand-edit the generated map, the Commands table (verify "matches CI"), a "Key docs" table that names `docs/ux/ux-design-handoff-v1.3.md` as "product behavior, source of truth; §11 Rationale Log is binding" and `docs/decisions/` as "ratified decisions + decision-queue reports".
- **Scripts.** Root: `build`, `dev`, `lint`, `check-types` through Turbo; `lint:boundaries` `eslint . --max-warnings 0` at the root; `format` write-only; the host's own `contrast-audit`, `directory-map`, `docs:check-links`; `marketing:*`, `toolkit:*`, `ui:*`, `all:*`, `db:*`. Per workspace: the two apps lint with plain `eslint`, the packages with `eslint . --max-warnings 0`; `check-types` is `next typegen && tsc --noEmit`; `marketing`'s `build` is `yarn content:check && next build --webpack`, `toolkit`'s `yarn emoji-data && next build --webpack`. ESLint 9.39.4, TypeScript 5.9.2, Next 16.2.6. Root `tsconfig.json` is references with `files: []`; `strict: true` in `packages/config/tsconfig/base.json`. `turbo.json` names `**/.env` and `**/.env.*local` in `globalDependencies`, 65 `globalEnv` keys, and a `test` task (`cache: false`) that no package defines. No `components.json`.
- **CI.** `.github/workflows/ci.yml`: push to `main` and pull requests; `fetch-depth: 2`; Corepack, `.nvmrc`, `yarn install --immutable`; `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` with no step env; `TURBO_TOKEN` and `TURBO_TEAM` on the job.
- **Shape.** Apps `marketing` and `toolkit` (Next), `dating` and `mobile` (README-only seams). Twelve `@cc/*` packages, `ai` among them. SDKs: `stripe` and `resend` in `marketing`; `@supabase/*` in `auth`, `api`, `db`; `ai` and `@ai-sdk/anthropic` in `ai`. Env readers: `apps/marketing/env.ts`, `apps/toolkit/env.ts`, `packages/auth/src/env.ts`; 48 other files read `process.env` (assess.md). Migrations `packages/db/migrations/0000_…` to `0003_…`, Drizzle names. Two `vercel.json` (one per app). No tracked file over 10 MB (the largest are three 1 MB font files).
- **Docs.** 428 tracked markdown files under `docs/`, 12 with frontmatter. `docs/specs/`: 206 files in four domains (`conflict-resolution` 162, `resources` 29, `affiliate-crm` 12, `ip-security` 2), the batch folders named `batch-2—minimum-lovable-product/` and so on; four `TECHNICAL-DECISIONS.md`, three `DEVIATIONS.md`, three `PROGRESS.md`, `spec-system-guide.md`. `docs/archive/` 74 files (`claude-design-handoff/Conscious Connections Design System/…`, the spaced paths; `ux/ux-design-handoff-v1.0` to `v1.2`). `docs/roles/` 34 em-dashed role prompts in six department folders plus `role-authoring-guide.md` (no frontmatter on any). `docs/decisions/` two loose files (an MLP progress report, a checkpoints review). `docs/ux/` 12 files: `ux-design-handoff-v1.3.md` (its heading: "UX Design Handoff Document (Canonical Source of Truth) v1.3"), `brand-ethos.md`, a call-session handoff, six dated proposals and amendments. Two more UX handoffs inside spec domains (`affiliate-crm-ux-handoff-v0.1.md`, `resources-ux-handoff-v1.0.md`). `docs/architecture/` 14 (a generated `directory-map.md`), `developer-guides/` 15, `ai-guides/` 9, `science/` 14, `build-instructions/` 14, `user-research/` 9, `copy-reviews/` 5, `qa/` 3, `docs/README.md` the host's index.

## Round 0 (M1 to M3)

- **Would do here:** M1 the two paths. M2: the repo's recent merges do not show (the last commit is "Stuff", 2026-09-08, on a fix branch; `main` has not moved since August), so the recommendation falls to "for a solo repo with no merges: the pushed branch the work lives on", `fix/beta-qa-fixes`, pushed and equal to its remote. M3: the convention is `feature/<name>` or `fix/<name>`; `feature/migrate`, created by the operator from `fix/beta-qa-fixes`.
- **Stop or question:** the protected branch is a fix branch whose name says it is temporary. The runbook's 02 is built for this ("for a solo repo, the pushed branch the work lives on") and `main` would fail step 0's fork-point rule (its tip is 28 commits behind the fork). The operator may prefer to fast-forward `main` first; M2 says that deploys, and two `vercel.json` files say the apps deploy from Vercel. Either answer is a ruling, not a stop.
- **Ruling needed:** 02 = `fix/beta-qa-fixes` (recommended: nothing is deployed, and the end check compares against it). 03 = `feature/migrate`.
- **Gaps drafted:** none.
- **Estimate:** 5 minutes, an estimate.

## Round 1: names and layout

- **Would do here:** 11 prefix: `CC` (the packages are `@cc/*`); 12 apps: two, `marketing` at `apps/marketing` (prefix `MKT`) and `toolkit` at `apps/toolkit` (prefix `TK`); `dating` and `mobile` are README-only seams and the host's `AGENTS.md` forbids scaffolding them, so they are not apps in `toolkit.json`. 13: `overlay`. 14: `branchPattern` `feature/<slug>` (`fix/<slug>` too), `migrationsDir` `packages/db/migrations`. 15: the middle box, one day for layer 1 with the records step as the last commit, layer 2 the next morning.
- **Stop or question:** 12's recommendation ("one app per workspace folder") offers four folders, two of which are seams. The report's shape row lists workspace folders; the session must leave two out, and the human line that says why ("never scaffold `apps/dating/` or `apps/mobile/`") is in round 3, after this question. The order is survivable (the operator knows), but the question's text could say that a folder holding only a README is not an app. Also: a two-letter prefix (`CC`) and `TK` for an app called "toolkit", which is also what this toolkit calls itself; a note for record 0001, not a stop.
- **Ruling needed:** 11 `CC`; 12 two apps with `MKT` and `TK` (or the operator's own); 13 to 15 as recommended.
- **Gaps drafted:** none.
- **Estimate:** 10 minutes, an estimate.

## Round 2: conflicts and settings

- **Would do here:** the middle path asks 21 in full, once per listed conflict: lines 33 and 34. Both lines exist because this repo was worked solo with an agent committing to the working branch; the conflict table's second option ("the line stands; the policy is ruled operator in 22 and the line goes to House rules") is written for a team that ships that way, which this repo does not. Recommend "the policy stands" for both, cited in record 0001. 22: the defaults. 23: Supabase, Stripe, Resend, Anthropic hosts and the registry (the tracked sandbox already lists most of them).
- **Stop or question:** as synapse, round 2 has no row for the host's tracked `.claude/settings.json` (an allow list, its own database rows, a tracked sandbox block with `api.anthropic.com`), which 5.4 overwrites. The same fix applies. One more: the host's `deny` list lacks the floor's `DROP SCHEMA` and `DROP DATABASE` rows and the floor's git denies; the floor adds them. Nothing in the host's rows loosens the floor, so merging is safe.
- **Ruling needed:** 21 twice (policy stands); 24 (the host's blocks kept beside the floor's rows); 22 and 23 as recommended.
- **Gaps drafted:** the per-rule guard split (part 12) only if the guard is ruled team.
- **Estimate:** 20 minutes, an estimate.

## Round 3: the repo's own instruction lines

- **Would do here:** read three `AGENTS.md` files, cut the toolkit lines (the Commands table, the verify-the-way-CI-does line, the "mark complete" loop). Human lines to place: the two seams, the archive is history, the append-only logs (replaced by the practice's records: not carried), migrations append-only with a human review (House rules), never hand-edit the map (House rules; the map stays the host's), the Key docs table (its paths change in round 4), `apps/toolkit/AGENTS.md`'s guardrails and non-negotiables (nested, already there), the vendor Next.js block at the top of that nested file.
- **Stop or question:** the same two caps as synapse, harder here: `apps/toolkit/AGENTS.md` is 153 lines, so `yarn budget`'s nested row (1,500 tokens) fails in step 5's proof, and the always-on row is over before House rules reach ten lines. And a third: the vendor block (`<!-- BEGIN:nextjs-agent-rules --> … <!-- END -->`) is neither a toolkit line nor a human one; 31 has no destination for a block a tool writes and rewrites on upgrade. Carried verbatim into House rules it would be duplicated by the toolkit's `next.md` path rule; dropped, the next `next` upgrade writes it back into the nested file anyway.
- **Ruling needed:** 31 for about fifteen root lines (House rules for the seams, migrations and the map; not carried for the old loop lines; the Key docs rows become `docs/index.md` lines, with the moved paths); 32 by tokens; 34 for `apps/toolkit/AGENTS.md` (keep the route and scope lines; move the non-negotiables verbatim to `apps/toolkit/docs/product-rules.md`, linked in one line); the vendor block stays in place untouched, listed in record 0001 as vendor-owned.
- **Gaps drafted:** none.
- **Estimate:** 45 minutes, an estimate.

## Round 4: records and collisions

- **Would do here:** asked in full. 41 per kind: the UX spec (the report's P4 says "not found by name": no `specs/<app>/ux/`, and no tracked markdown is named `ux-spec`; the heading of `docs/ux/ux-design-handoff-v1.3.md` says it is the canonical source of truth); decision logs (four `TECHNICAL-DECISIONS.md`, plus the host's `docs/decisions/` folder, which P3 counts as a record kind in a foreign format); deviation logs (three); closed spec folders (four domains, 122 ticket files, the batch folders); guides (`developer-guides`, `ai-guides`, `architecture`, `build-instructions`, `science`, `user-research`, `copy-reviews`, `qa`); host roles (34); the generated map; `docs/archive/` (74 files the host calls read-only history). 42 per collision: `docs/decisions/` (two loose files; the toolkit derives `ledger.md` and `changelog.md` and copies `records/README.md`, no name clash: stay beside) and `docs/roles/` (34 em-dashed files and a guide; the toolkit's role files are lowercase hyphenated, its READMEs sit in department folders the host also has but without READMEs: stay beside). 43: the last commit of the day (recommended on the middle path).
- **Stop or question:** three. (a) When the report finds no UX spec by name (P4 = 2), 41's UX row has nothing to rule on, and the runbook never asks the operator to name one; followed literally, the day ends with no imported UX spec and no promotion gap for a product whose `AGENTS.md` names its source of truth in a table. (b) The archive: 74 files under `docs/archive/`, three of them older UX handoffs, many with spaced paths; no kind in 41's table is "archive", so the session must choose between "guides" (stay) and "UX spec, any version" (move three files out of a folder the host calls read-only). (c) The paths: every `git mv`, every `diff -r` and every index line in this repo meets spaces and em-dashes (the roles, the batch folders, the archive); step 7 says `git mv <old> <new>` with no word about quoting, and step 5's glob proof pipes `git ls-files | grep`, which is fine for matching but a loop over it breaks on spaces.
- **Ruling needed:** 41: the operator names `docs/ux/ux-design-handoff-v1.3.md` as the UX spec (one file moves to `specs/toolkit/_imported/ux/`; the two spec-domain handoffs are named too, or stay as closed-spec material); the four decision logs move; `docs/decisions/`'s two files stay beside; `docs/archive/` stays whole, indexed as one line (recommended: the host rules it read-only, and `.claude/rules/docs.md` would say the same). 42: stay beside, both. 43: last commit of the day.
- **Gaps drafted:** the promotion (part 9); entry-by-entry indexing of four logs (part 12).
- **Estimate:** 25 minutes, an estimate.

## Round 5: the verify inputs and the live team

- **Would do here:** 51: lint `lint`, boundaries `lint:boundaries`, types `check-types`, test none (the `test` task in `turbo.json` runs nothing), build `build`, format write-only; `build` reads env files: `apps/*/env.ts` validate at build, and CI runs `yarn build` with no secrets and passes, so the apps tolerate an empty environment [secondary: read `apps/toolkit/env.ts` at the run]. 52: `.github/workflows/ci.yml`. 53: no freeze expected at base; the records step is the one touching many paths and 43 already put it last. 54: Taylor.
- **Stop or question:** as synapse, Turbo's `globalDependencies` hash env files under the floor's read deny, for every task, not only `build`. The `test` task in `turbo.json` with no package script: section 3.3 adds a root `test` script, and `turbo run test` is not what `verify` calls, so no conflict; the stale task is a line in record 0001.
- **Ruling needed:** 51 as filled; the env yes if the hash fails sandboxed; 52; 54.
- **Gaps drafted:** none at this round.
- **Estimate:** 10 minutes, an estimate.

## Step 0: preconditions

- **Would do here:** `yarn migrate:assess <target> --check --protected fix/beta-qa-fixes`. Rule 1 fails today: the tree has an unstaged deletion of `docs/roles/role-authoring-guide.md`. The fix line is the operator's: commit the deletion, or restore the file, outside the thread. Then rules 2 to 7 pass: `feature/migrate` off `fix/beta-qa-fixes` is at its fork point; `fix/beta-qa-fixes` equals `origin/fix/beta-qa-fixes` (by `refs/remotes/`, since no upstream is configured); the fork point is its tip; no `toolkit.json`; the local settings file is untracked; Node 22.22.2. With `--protected main` the run fails rule 5 (`main` does not hold the fork point) and the fix says to name the branch work merges into.
- **Stop or question:** the seven worktrees are reported under hygiene in step 1 and never touched; they do not fail a precondition, which is right. The unstaged deletion is the one real stop, and the runbook's text handles it ("the thread never commits, stashes, pushes or deletes to clear one").
- **Ruling needed:** the operator's fix for the dirty tree.
- **Gaps drafted:** none.
- **Estimate:** 5 minutes, an estimate, plus the operator's commit.

## Step 1: the report

- **Would do here:** the capture today prints S1 0, S2 0, C1 1, C2 0, C3 2, C4 0, C5 1 and "not yet measured" for the rest; the full report prints 18, middle, lines 33 and 34, the SDK importers (26 unmatched: Stripe and Resend in `marketing`, Supabase in three packages, the AI SDK in `ai`), the records (four decision logs, three deviation logs, `docs/decisions/`), the collisions (`docs/decisions/`, `docs/roles/`), and the hygiene lines: a dirty tree, seven worktrees, no file over 10 MB. The session reads the worktree line out and never removes one.
- **Stop or question:** none in the text; the "not decided" path is MIG-6's.
- **Ruling needed:** none.
- **Gaps drafted:** none.
- **Estimate:** 5 minutes, an estimate.

## Step 2: the interview

- **Would do here:** file `specs/_shared/epics/CC-migration/assess.md` byte for byte, run rounds 1 to 5, write `rulings.md`, get the yes; on the middle path the table is longer (two conflict rows, nine record kinds, two collisions).
- **Stop or question:** none found beyond the rounds' own.
- **Ruling needed:** the yes.
- **Gaps drafted:** none.
- **Estimate:** 115 minutes for the rounds together, an estimate.

## Step 3: commit 1

- **Would do here:** `toolkit.json` with two apps, `CC` prefix, `fix/beta-qa-fixes` protected, the template's matching rows (`apps/*/app/api/**`, `apps/*/app/**/*.tsx`, `packages/ui/**`, `**/migrations/**`, `**/schema/**`, `**/auth/**`, `**/env.ts`, `**/proxy.ts`, `**/webhooks/**` if `marketing` has a Stripe webhook route, `.claude/settings.json`, `tooling/hooks/**`), `imports` rows for Stripe (mason, warden, chancery), the auth SDKs (mason, warden) and Resend (warden); AI listed only. The 24 scripts, three devDependencies, `yarn install`, three files committed.
- **Stop or question:** the script-name collision again: `directory-map` and, by name, `contrast-audit` (the toolkit's is starter-only and not in step 3's list, so only `directory-map` collides). The host's wins.
- **Ruling needed:** none.
- **Gaps drafted:** none.
- **Estimate:** 20 minutes, an estimate.

## Step 4: copy

- **Would do here:** keep the three old `AGENTS.md` and three `CLAUDE.md` files (and, by the round-2 fix, the tracked `settings.json`) under `docs/decisions/imported/`; the collision rulings first (stay beside: nothing moves); then the copies: `docs/roles/` lands six department READMEs beside 34 em-dashed host files; `docs/decisions/records/README.md` lands in a folder holding two host files; `gen:agents` skips every host role (no frontmatter). `diff -r` per copied entry; `check-types:tooling`.
- **Stop or question:** the `.gitignore` trap, exactly as synapse (lines 49 and 52): the path rules, skills and agents are ignored and never committed. Fixed by the same step-4 text. And the quoting: `diff -r <toolkit>/docs/roles docs/roles` reports the 34 host files as "only in" the target, which is noise, not a failure; the proof says `diff -r` "prints nothing", which it will not for a folder that holds host files beside the copies. The proof needs "prints nothing but `Only in <target>` lines for host files".
- **Ruling needed:** none.
- **Gaps drafted:** none.
- **Estimate:** 35 minutes, an estimate.

## Step 5: derive

- **Would do here:** as synapse, with two apps: `specs/marketing/ux/` and `specs/toolkit/ux/` (each needing a `.gitkeep`), `next.md` and `turbo.md` by signal, no `shadcn` (no `components.json`), the settings merged with the host's blocks, `refs-pending.json` seeded, `hooks:install` with the yes. The glob proof: `.claude/rules/ui.md`'s globs match `apps/*/app/**` and `packages/ui/**`; `testing.md` matches nothing until step 6 (named and re-checked).
- **Stop or question:** `yarn budget` fails on the always-on tokens and on `apps/toolkit/AGENTS.md` until round 3's rulings are applied (fixed by 32 and 34). The glob proof's `git ls-files | grep` is safe (no loop); the step's text now says `-z` where a loop reads paths.
- **Ruling needed:** none new.
- **Gaps drafted:** none new.
- **Estimate:** 100 minutes, an estimate.

## Step 6: verify (layer 2)

- **Would do here:** the next morning (the middle path's box). The base run at `162faefa` in a detached worktree: `lint`, `lint:boundaries`, `check-types`, `build` (the apps build with an empty environment in CI, so the base build runs; if it needs `.env.local` for `content:check`, the operator copies it). CI was green on `main` in August and nothing says the fix branch fails, so the expected table is four "enters as written" rows plus the root smoke test. The CI edit: one `yarn verify` step; no step env to keep here; `fetch-depth` raised for the diff checks or their skip read.
- **Stop or question:** the Turbo-shaped recipes (3.1 per workspace, 3.2 the shared base) as synapse, with one more wrinkle: the two apps lint with plain `eslint` and the packages with `--max-warnings 0`, so a freeze would behave differently per workspace; the per-workspace suppression handles both. Not expected at base.
- **Ruling needed:** 51's env yes if the hash fails; 52; the checkout depth.
- **Gaps drafted:** parts 3 and 10.
- **Estimate:** 80 minutes, an estimate.

## Step 7: the records moves and the gap tickets

- **Would do here:** as the last commit of the day (43). Moves: `git mv "docs/ux/ux-design-handoff-v1.3.md" specs/toolkit/_imported/ux/`; four `git mv` for the decision logs, each path quoted (`"docs/specs/conflict-resolution/TECHNICAL-DECISIONS.md"` has no space, but the rule is every path quoted, and a loop over `git ls-files` is `-z`). Index lines: one for the imported spec, three for the deviation logs, four for the domains (one line per track, the batch folders inside named by the domain's README), one for `docs/archive/` whole, eight for the guide folders, one for the host roles, one for the map, two for the host's `docs/decisions/` files; four ledger lines. The host's `yarn docs:check-links` run once, its failures listed in record 0001. Then the gaps: parts 1 (Next 16.2.6 and the rest match: skipped), 2, 3, 5 (48 readers: high risk), 6 (26 importers, four families: billing, auth, email, AI), 8 (180 of 390), 9, 10, 12; part 4 and 7 skipped (V1 and V2 are 0); part 11 does not apply; the promotion and the indexing.
- **Stop or question:** the spaced and em-dashed paths are the step's own risk, and the runbook's text did not name quoting or `-z`; fixed. The archive kind was missing from 41's table; fixed as a row ("an archive the host calls read-only: stays whole, one index line").
- **Ruling needed:** 41 and 43 as above.
- **Gaps drafted:** about ten tickets.
- **Estimate for the records moves, timed on their own:** 30 minutes, an estimate: five `git mv`, about 25 index and ledger lines, the link check read once, one commit, `git log --follow`. **The gap tickets:** 90 minutes, an estimate (ten drafts; part 6 alone names four families). **Step 7 together:** 120 minutes, an estimate.

## Step 8: record 0001 and the end check

- **Would do here:** the record with the two conflicts, the lines not carried, the vendor block, the kinds and where each went, the archive, the skipped parts, the operator rows, the gap ids; the ledger line and changelog entry; `--check --end --protected fix/beta-qa-fixes`.
- **Stop or question:** none found; the end check fails only if the operator pushed to the fix branch during the day.
- **Ruling needed:** none.
- **Gaps drafted:** none.
- **Estimate:** 35 minutes, an estimate.

## Step 9: print the branch and the prompts

- **Would do here:** `feature/migrate` with nine or ten commits over `fix/beta-qa-fixes`; the hand-over to Taylor (push, the first CI run, the merge into `fix/beta-qa-fixes`, and the fast-forward of `main` whenever the operator deploys); the layer-3 opening prompt for part 2 or 6 and the promotion prompt for `specs/toolkit/_imported/ux/` (one file, v1.3, moved 2026-10-07; the two spec-domain handoffs named beside it).
- **Stop or question:** none found.
- **Ruling needed:** none.
- **Gaps drafted:** none.
- **Estimate:** 10 minutes, an estimate.

## Stops found

Ranked. The ones synapse already found are listed once more by number only where this repo adds a mechanism.

1. **Serious. `README.md` round 4 (41): the report finds no UX spec by name and the interview never asks for one.** This repo's `AGENTS.md` names `docs/ux/ux-design-handoff-v1.3.md` as the source of truth; P4 scores 2 and 41 has no row to rule, so no spec is imported and no promotion gap is drafted. Fixed: a P4 of 2 asks the operator to name the UX spec's file or files, or "none", before 41's rows.
2. **Serious. `README.md` step 4 and `verify.md`: the host's ignore rules, tracked settings, Turbo-shaped lint and the token caps.** Synapse stops 1 to 4; the same lines, the same fix. This repo adds `apps/toolkit/AGENTS.md` at 153 lines and a tracked sandbox block with `api.anthropic.com`, which the floor would silently drop.
3. **Serious. `README.md` step 7 and step 5's proof: paths with spaces and em-dashes.** 57 and 173 tracked doc paths; `git mv <old> <new>` unquoted and a loop over `git ls-files` break on them. Fixed: step 7 quotes every path and reads any list NUL-separated (`git ls-files -z`), and step 5's glob proof says the same; the assess command already reads `-z`.
4. **Friction. `README.md` round 4 (41): no row for an archive.** 74 files the host calls read-only history, three of them old UX handoffs. Fixed: a row, "an archive the host marks read-only: stays whole, one index line; a superseded spec version inside it is not moved".
5. **Friction. `README.md` round 3 (31): a vendor-written block has no destination.** The `nextjs-agent-rules` block that `next` writes and rewrites. Fixed: 31 says a vendor block between its markers stays where it is, untouched and uncounted, listed in record 0001 as vendor-owned.
6. **Friction. `README.md` round 1 (12): a workspace folder holding only a README is offered as an app.** `apps/dating` and `apps/mobile`. Fixed: 12's recommendation excludes a folder with no `package.json`.
7. **Friction. `README.md` step 4's proof: `diff -r` on a folder that now holds host files beside the copies prints "Only in" lines.** Fixed: the proof accepts `Only in <target>` lines for host files and nothing else.
8. **Friction, not a runbook change. The protected branch is a `fix/*` branch.** M2's solo-repo option names it; `main` fails the fork-point rule; the operator's later fast-forward of `main` deploys. Recorded for the dry run's prompt.

## Verdict

Survives with changes, for conscious-connections. The middle path's additions (every conflict ruled, every record kind ruled, the records step last and timed) are the right additions for this repo: its process distance is in the records (four decision logs, a `docs/decisions/` folder, an archive, a spec that is not called one) and in two instruction files written for a solo agent. The text now asks for the spec by name, has a row for the archive, and reads paths safely. Step 0 fails today on the unstaged deletion, which is the operator's one-line fix, and passes with `fix/beta-qa-fixes` as the protected branch.

- **Layer 1 (steps 0 to 5, 7 and 8, the interview included):** about 8 hours 10 minutes, an estimate; the records moves 30 minutes of that, timed on their own. One working day with no slack, which is why the middle path puts layer 2 the next morning.
- **Layer 2 (step 6):** about 80 minutes, an estimate.
- **Together:** about 9 hours 30 minutes, an estimate, across the day and the next morning. This is the repo the clock is timed on (brief, By when); the estimate is the number the clock will be read against.
