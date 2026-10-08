---
title: Migrate — the interview from the assess report, then the layer-1 steps that bring an existing repo under the practice
description: Follow when a repo that already exists, with its history and team, is brought under the practice in place. A cold session runs the preconditions and the read-only assessment, interviews the operator from the report (prefixes, conflicts, human lines, records, verify inputs), then walks the manifest on one branch, one commit per step, to the gap tickets, record 0001 and the printed branch name.
layer: runbooks
status: draft
thread: "MIG"
role: Usher
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when:
---

# Migrate

> **Who runs it:** an agent in Claude Code, opened in the target repo, with the operator answering questions and a toolkit checkout beside the target. On the deepest model available: the interview is design work, and a smaller model turns it into a checklist with no recommendations.
> **When:** a repo with a history is brought under the practice without a rewrite ([track](../../workflows/tracks/migrate.md)). The rule is move the way of working on day one; tech that cannot cross becomes a named gap with a plan.
> **Done means:** the end check exits 0, every layer-1 commit is on the migration branch, record 0001 is written, each gap is a drafted ticket under the target's migration epic, and the thread has printed the branch name and the follow-on prompts. The operator pushes and merges; the thread never does.
> **Status:** draft. Never run or rehearsed on a real repo. Until MIG-6 lands the listings, step 1's gate stops the interview on a report with unmeasured rows. Three desk walks were read against it on 2026-10-07 (synapse near, conscious-connections middle, taylor-aucoin far by Crucible; `specs/_shared/epics/MIG-codebase-migration/walks/`), and every stop they found is fixed below or named in MIG-10's as-built. The operator's first real run is a dry run on the near repo after the epic closes. Steps 0 and 8 use the `--check`, `--end` and `--protected` flags of `yarn migrate:assess`, which land in MIG-7; until then the command accepts `--json` only, and the two steps cannot run.

This folder holds the guide and what it hands out:

| File                               | What it is                                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| This file                          | The interview, then the layer-1 steps                                                                                                           |
| [`manifest.json`](manifest.json)   | Day one's file list: each path with `copy` or `derive` and the signal or ruling that includes it. Step 4 walks the copy entries, step 5 the rest |
| [`verify.md`](verify.md)           | Layer 2: the repo's own checks become one `verify` command, with the freeze recipes and the CI wiring (step 6)                                  |
| [`layer-3.md`](layer-3.md)         | Layer 3: the twelve ordered gap tickets, and the two prompts the run prints at its end (steps 7 and 9)                                          |

Every example below is synthetic: a repo called `acme-shop`, with the prefix `ACM`. The migration epic is named `MIG` in every target, never with the prefix from 11: `check-specs` refuses an epic whose prefix belongs to `toolkit.json`, and 11's prefix is in `toolkitPrefixes`. Gap tickets are `MIG-1`, `MIG-2` and so on. A target that already uses `MIG` as an app, toolkit or epic prefix takes another free three capitals for the epic, written once in `rulings.md`, and uses it wherever this guide says `MIG`. Paths are relative to the target's root unless they say "toolkit". `<toolkit>` is the toolkit checkout's path from the prompt.

## The paths

The assessment (step 1) scores the target's distance and names a path. The path never changes the steps; it changes which interview rounds are asked in full, the time box, and where layer 3 opens.

| Path   | Interview                                                                                                       | Time box (estimates)                                                                      | Layer 3 opens with                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Near   | Rounds 0, 1 and 5 in full; rounds 2 and 4 only for the rows the report lists                                    | One working day for layers 1 and 2                                                        | Part by part, from the drafted tickets                                                  |
| Middle | Adds round 2 (every conflict ruled) and round 4 (every record kind ruled); the records step (7) is timed on its own | One day for layer 1 with the records step as the last commit, layer 2 the next morning   | Part by part                                                                            |
| Far    | As middle, plus the single-app answers in round 1; CI is a hosted gap in round 5                                 | One day for layer 1; layer 2 the next day, without CI                                     | The restructure (root app into `apps/web`, workspaces, Turbo): its own epic, last        |

A non-JavaScript target runs layer 1 only; layers 2 and 3 are one drafted gap each (step 7).

## The interview

Ask after the report exists (step 1) and before anything is written (step 3). Nothing below is guessed: a prefix, a branch, a ruling or a destination the operator has not given is asked for.

**How to ask.**

- Use the question tool. Each question offers options, the recommended one first and marked "(Recommended)". The operator can always type their own answer.
- Ask in rounds, several questions per round, as many rounds as the report needs. A row the report settles is shown with its answer as the recommended option, so the operator confirms it in one click. A round whose rows the report leaves empty is skipped and said to be skipped.
- Every option says what will happen if it is chosen, and what it costs the team the morning after the merge.
- A ruling covers a whole hook or a whole permission rule, never one guard inside a hook. Splitting a hook per rule is a gap (step 7).
- Write the answers back as one table before step 3 and get a yes. That table is `rulings.md` in the migration epic and goes into record 0001 (step 8). The run's first stop is here.

### Round 0: from the prompt

The builder asked these once ([track](../../workflows/tracks/migrate.md), M1 to M3). Show them as one question with the three values filled in: "confirm all three as printed" (Recommended) or "change one"; never re-ask them blank:

| #  | Confirms                                                      | Sets                                                              |
| -- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| 01 | The target's path and the toolkit checkout's path             | Every command below; the toolkit commit in record 0001            |
| 02 | The protected branch: where merged work lives (the branch recent work merges into, Recommended only when it already contains the commit the migration branch is cut from; a branch that does not is stale however recent its merges, and the pushed work branch is Recommended instead; the deploy branch is never Recommended: fast-forwarded and pushed by the operator first, it deploys) | `protectedBranch`; the `--protected` argument of every check      |
| 03 | The migration branch's name, created by the operator from 02  | The branch every step commits on; the name printed at the end     |

### Round 1: names and layout

| #  | Question                                                              | Options                                                                                                                                                                                                                                                   | Sets                                                                                     |
| -- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 11 | The repo-wide prefix that opens every commit and names shared work?   | Two or three capitals from the repo's name, as `ACM` for `acme-shop` (Recommended). The operator's own.                                                                                                                                                   | `toolkitPrefixes`; the commit prefix only; the migration epic is always `MIG-migration` (see the note under the example repo); every commit message   |
| 12 | The apps and their ticket prefixes?                                   | From the report's shape row: one app per workspace folder that holds a `package.json`, its prefix from the folder's name (Recommended; a folder holding only a README is a seam, not an app). For a single app, `web` at path `.` with prefix `WEB` (Recommended on the far path). The operator's own.                                       | `apps` in `toolkit.json`; the specs root's `specs/<app>/` folders                        |
| 13 | Can harness files be committed to this repo?                          | Yes: tier `overlay` (Recommended; the floor and the team hooks are tracked). No: tier `overlay-local` (a client repo whose `.claude/` the team does not own; every setting goes to the operator's local file, and the record says the floor is unenforced).  | `tier` in `toolkit.json`; which settings file round 2 writes to                          |
| 14 | The branch pattern and the migrations folder?                         | `branchPattern` is the work-id hooks' firing line: every branch matching it needs a work-id prefix on each commit, once the hooks are live. Keep `agent/{id}` unless the repo's own convention has an id slot (a pattern like `feature/{id}` would govern every feature branch, the protected branch included). The migrations folder the report found (Recommended). "No migrations" sets `migrationsDir` to `null`.                                                                                                 | `branchPattern`, `migrationsDir`                                                         |
| 15 | The time box for today?                                               | The path's box from the table above (Recommended). The operator's own.                                                                                                                                                                                    | When step 7 waits for the next day, and when a freeze becomes a gap (`verify.md`)         |

### Round 2: conflicts and settings

22, 23 and 24 are asked on every path. 21 is asked once per conflict the report lists, so a repo with none (a solo repo often has none) skips it, whatever its path; on the near path the settings table is confirmed in one click. 24 is skipped, and said to be skipped, when the target tracks no `.claude/settings.json`.

| #  | Question                                                                 | Options                                                                                                                                                                                                                                                                                                                                                                                                             | Sets                                                                                   |
| -- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 21 | For each conflict the report lists (a line in the target's instruction files against a toolkit policy): which stands? | The policy stands; the line is not carried, and record 0001 cites this ruling (Recommended when the policy is in the floor, or when the hook that enforces it is ruled operator in 22, so the team never meets it). The line stands; the policy is ruled operator in 22 and the line goes to House rules (Recommended for "no branches during slices" where a team ships that way). | The human-line destinations in round 3; the settings rows in 22                        |
| 22 | Each policy below: team (tracked `.claude/settings.json`) or operator (`.claude/settings.local.json`, gitignored)? | Show the table below filled with its default rulings and ask "confirm all" or "change some". The floor is not offered: it is always tracked.                                                                                                                                                                                                                                                                         | The two settings files (step 5)                                                        |
| 23 | Which hosts may the operator's sandbox reach?                            | The hosts the report's SDK listing implies (Stripe, Supabase, Resend, Anthropic, OpenAI as present), plus the package registry (Recommended). Fewer, named. A sandbox block the target already tracks keeps its own list (24).                                                                                                                                                                                       | The network allowlist in the operator's local file, or the tracked block 24 kept         |
| 24 | The target's own tracked `.claude/settings.json`: what happens to each block it holds (`allow`, `deny`, `ask`, `sandbox`, `env`, `hooks`)? | Show each block as one row. Kept in the tracked file, with the floor's rows added beside it (Recommended for every block that tightens or only allows: the team's `allow` list is why its agents run unprompted, its database rows are its own, and a sandbox block it tracked on purpose stays tracked). Moved to the operator's local file (for a block holding a machine path, or one the team never meant to share). Dropped, cited in record 0001 (for a row the floor already denies in other words). Nothing in the host's file is overwritten by default. | Step 4 keeps the old file; step 5.4 merges each block as ruled                          |

The settings table for 22, with the default ruling per policy:

| Policy                                                                                                                                                                              | Default ruling                                                                                                           | What the other choice costs                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Floor: deny reads of env files, secrets and keys; deny database resets and drops; deny `git reset --hard`, `git clean`, `git branch -D`, `git filter-branch`; deny publish and login; ask on migrate, push, seed and setup database commands | Team, not offered                                                                                                        | —                                                                                                         |
| Deny `git push`                                                                                                                                                                     | Operator, for the run, always. Team only when the team says so                                                           | Team: no teammate's agent can push; some teams ship that way                                              |
| `session-start.ts` and `results-gate.ts` hooks                                                                                                                                      | Team. They print status and guard results files under the specs root; a teammate never meets them outside a ticket folder | Operator: a teammate's agent never sees the spine line                                                    |
| `bash-guard.ts` (the work-id prefix on commits, no commit on the protected branch, Yarn only, the database guards)                                                                  | Operator. Team after the merge-side week passes                                                                          | Team on day one: every teammate's agent refuses a commit without the prefix the morning after the merge   |
| `stop-gate.ts` (`verify:fast` at every stop)                                                                                                                                        | Operator. Team after the merge-side week                                                                                 | Team on day one: every teammate's stop blocks on the first red check                                      |
| Sandbox and network allowlist; the allow list                                                                                                                                       | Operator                                                                                                                 | Team: a machine path in a tracked file                                                                    |
| "No tests during slices" and "no branches or pull requests" against the contract loop                                                                                               | The operator rules in 21; an overruled line is not carried into `AGENTS.md`                                              | —                                                                                                         |

### Round 3: the repo's own instruction lines

The report lists conflicts, not every line. Before this round, read the old `AGENTS.md`, `CLAUDE.md` and every nested instruction file, and cut the toolkit lines first: any line a hook or check now enforces, then the commands table (the target's replaces it). A block a tool wrote between its own markers (`<!-- BEGIN:nextjs-agent-rules -->` and the like) is neither. In a nested file it stays between its markers, untouched. In the root `AGENTS.md`, which step 5 rewrites, it is carried into the new file between its markers when the tool that writes it is installed and configured to (the installed version has the generator), and dropped when it is not; either way it is listed in record 0001 as vendor-owned. What remains is the human-written lines. Show them as one table, each with a recommended destination, and ask "confirm all" or "change some". A global human line is never trimmed silently.

| #  | Question                                                                 | Options                                                                                                                                                                                                                                                                                                                                                                                       | Sets                                                      |
| -- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 31 | For each human-written line: where does it go, verbatim?                 | `AGENTS.md` "House rules" (Recommended when it is global and still true). The nested `AGENTS.md` of the folder it is about (Recommended when it names one folder). `.claude/rules/house-<topic>.md` with `paths:` (Recommended when it is about one file type, as "the interface wins over the atmosphere" is about UI files). Not carried: overruled in round 2, or replaced by the practice (Recommended for a line that describes a process step the work loop, the records or `verify` now do, as "verify the way CI does: `yarn lint && …`" or "one `DEVIATIONS.md` line per divergence"), cited in record 0001. A line that names a path round 4 moves is carried with the new path: the one edit a human line takes, noted in record 0001. A script the line names for agents in place of another (`build:agent` for `build`) is the script 51 maps.           | Step 5's spine and path rules; 51's mapping                             |
| 32 | When House rules would push the spine past its caps: what gives?         | The caps are `yarn budget`'s, and tokens bind before lines: the always-on row (`AGENTS.md`, `CLAUDE.md`, `docs/index.md`, every model-invocable skill description and every subagent description, together at most 4,000 tokens; the toolkit's own spine fills it, so a target has room only for what it cuts) and the 100-line and 20-line caps. Cut more toolkit lines first: anything a hook or check enforces, the role and skill listings, the boundaries section where no boundaries exist yet, the toolkit's "Current work" and demo lines (Recommended; the caps are unchanged under overlay, and a global human line is never demoted to a path rule). Then a diagnostic section (known traps, post-mortems) becomes a pointer line to the kept `docs/decisions/imported/<file>-<date>.md`, verbatim rules staying in place; a rule is never reduced to a pointer. Then any human line that is about one file type moves to a house rule with `paths:`. Then a host skill's description is cut to one line, or the skill takes `disable-model-invocation: true` in its frontmatter when it is a vendor skill the operator invokes by name. Last, the operator names lines to cut, each cited in record 0001. | The always-on row and the line counts step 5 checks with `yarn budget` |
| 33 | The agent-readability brief for the proof in step 5?                     | One line of work that needs a fact found only in the old file, written by the operator (Recommended: the operator knows which rule the team relies on). The agent proposes one from the moved lines.                                                                                                                                                                                         | Step 5's proof                                            |
| 34 | For each nested `AGENTS.md` over `yarn budget`'s nested row (the heaviest nested file plus the path rules, at most 1,500 tokens): what stays? | Its placement, route and commands lines stay; the rest (product non-negotiables, scope guardrails, long walkthroughs) moves verbatim to one docs file under that folder (`<folder>/docs/product-rules.md`, Recommended) that the nested file links in one line, and record 0001 lists the move. The operator's own split. Nothing is cut. Skipped, and said to be skipped, when no nested file is over the row. | Step 5.1; the nested row step 5 checks with `yarn budget` |

### Round 4: records and collisions

Asked in full on the middle and far paths. On the near path, only the kinds the report lists. Every body is kept byte for byte; moves are `git mv`, so history follows. When the report found no UX spec (P4 scored 2), ask first, before 41's rows: which file or files are the product's UX spec today, or "none"? The target's own instruction files usually name it (Recommended: the file they call the source of truth). A named file is a UX spec for 41; "none" means no import and no promotion gap, and record 0001 says so.

| #  | Question                                                                    | Options                                                                                                                                                                                                                                                                                                                                                                                                  | Sets                                                        |
| -- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 41 | For each record kind the report lists: the default mapping, or stay in place indexed? | The default from the table below (Recommended). Stay in place, indexed in `docs/index.md` only. The operator's own words. For the UX spec: the folder whole by one `git mv`, when the spec's folder holds only UX material and its own index calls it the UX source (the promotion reads all of it), or the named files only. Precedence: the cited-record row below is the default for any record a kept human line or an in-flight spec folder links; a move of a cited record, whole folder or file, is the operator's override, and only then do 31's new-path edit and step 7's link check apply.                                                                                                                                                                                                                                                                       | Step 7's moves and index lines                              |
| 42 | For each collision (a practice path that already exists in the target, as `docs/decisions/` or `docs/roles/`): what happens to the host's files? | They stay, and the practice's files land beside them; `gen:agents` and the docs lint skip a file without the practice's frontmatter (Recommended when no file or seat name clashes: a host role file for a seat the practice also has, as a second Mason prompt, is a clash). The host's folder moves whole to `docs/decisions/imported/<folder>/` by `git mv` first (Recommended when names clash file for file). Stop and rule file by file.             | Step 4's copy order                                         |
| 43 | When does the records step run, given the team keeps committing?            | Now, inside the time box (Recommended on the near path). As the last commit of the day (Recommended on the middle and far paths). As a drafted gap, the moves deferred to a quiet window the team names.                                                                                                                                                                                                 | Step 7's timing                                             |

The default mapping per kind:

| Kind                                           | Day one                                                                                                              | Indexed in                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| UX spec, any version                           | Moved to `specs/<app>/_imported/ux/`, outside `ux/`, so no agent reads it as living truth; the whole folder when 41 ruled so | `docs/index.md`; the promotion gap (layer 3, part 9)         |
| Decision log (a `TECHNICAL-DECISIONS.md`)      | Moved to `docs/decisions/imported/<area>-technical-decisions.md`                                                     | One ledger line per file. Entry-by-entry indexing is a gap   |
| Deviation log (a `DEVIATIONS.md`)              | Stays with its spec folder                                                                                           | `docs/index.md`                                              |
| Closed spec folders, ticket files, progress logs | Stay in place, untouched. In-flight work finishes in its own format; new work uses the practice                    | `docs/index.md`, one line per track                          |
| Guides (how-to, design-system notes)           | Stay in place. A line an agent must obey becomes a path-rule pointer to the guide, never a copy                      | `docs/index.md`; design notes feed the design-layer gap      |
| Host role prompts                              | Stay. `gen:agents` reads only files with the practice's frontmatter                                                  | —                                                            |
| Generated maps the host's own script owns      | Stay. The practice's `directory-map` skips under overlay                                                             | —                                                            |
| A UX spec or decision log that is cited      | Stays in place, indexed, when a kept human line (round 3) or an in-flight spec folder's files link it by relative path; only an uncited record moves. After the moves, `grep` the host docs for relative links whose target moved and list them in record 0001 | `docs/index.md`                                              |
| An archive the host marks read-only            | Stays whole, untouched; a superseded spec version inside it is not moved                                             | `docs/index.md`, one line for the folder                     |
| The old instruction files                      | Copied to `docs/decisions/imported/<file>-<date>.md` in step 4, before the spine is rewritten                        | Record 0001                                                  |

### Round 5: the verify inputs and the live team

| #  | Question                                                                   | Options                                                                                                                                                                                                                                                                       | Sets                                                              |
| -- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 51 | Which of the repo's scripts is each of lint, boundaries, types, test, build and format, and does `build` read environment files? | The names read from the root `package.json` (Recommended, shown filled; where the repo has a second build script with its own dist directory for agents, as `build:agent`, that is the build `verify` runs, so the run never shares a `.next` with the operator's dev server; the plain one stays the deploy's). "None" for a check the repo does not have; `verify.md` says what each absence becomes. A `build` that reads `.env` files (a Next app with hosted SDKs usually does) cannot run under the floor's read deny in a sandboxed session: it runs unsandboxed with the operator's yes, in step 6 and at every later `yarn verify`. The same yes covers every Turbo task when `turbo.json` names env files in `globalDependencies` or a task's `inputs`, since Turbo reads them to hash before any task runs. | The mapping in step 6; how `build` and the Turbo tasks are run    |
| 52 | Where does CI run these today?                                             | The workflow file the report found (Recommended; step 6 replaces its chained steps with one `yarn verify` step under the same triggers). None: CI is a drafted gap and a hosted step, since it needs repo settings and secrets.                                                | Step 6's CI edit, or a gap in step 7                               |
| 53 | A freeze that touches more than about 50 files: last commit of the day, or a gap? | Last commit of the day, in a window the team names (Recommended when the team is small or the window exists). A drafted gap, with the count in its Build notes.                                                                                                      | `verify.md`'s live-team rule                                      |
| 54 | Who runs the first hosted steps: the push, the first CI run, the merge?    | The operator, by name (Recommended when they own the remote). Another person, by name. A credential is never typed into the thread.                                                                                                                                           | Step 9's hand-over lines; record 0001                             |

Write the answer table to `specs/_shared/epics/MIG-migration/rulings.md`, with the date and the report's commit, and get a yes. Then step 3.

## The steps

Each step ends on a check, and a failed check is fixed before the next step starts. Each step is one commit, opening with the prefix from 11 (`ACM: migrate step 4, the copied files`), so a wrong step is reverted alone. From step 5 on, `yarn verify:fast` runs at the end of every step too. Note when each step starts and ends: step 9 reports the minutes. Never push, never merge, never touch the protected branch.

A step marked **Operator** is hosted or irreversible and stops for the operator's own hands; the thread says so and waits, or hands the item over in step 9.

### 0. Preconditions

From the toolkit checkout, with the target's path and the protected branch from round 0:

```sh
cd <toolkit>
yarn migrate:assess <target> --check --protected <protected-branch>
```

It exits 1 with each failure and its fix, all in one run: a dirty tree (untracked files included), a detached HEAD or the protected branch checked out, a migration branch already ahead of its fork point, a protected branch with no remote copy, behind it or ahead of it (it must equal `origin/<branch>`; an upstream is never read, since it may be unset), a protected branch that does not hold the fork point, an existing `toolkit.json` or a tracked `.claude/settings.local.json`, or Node below 22.18. Each fix is the operator's: the thread never commits, stashes, pushes or deletes to clear one. **Operator:** a stale protected branch is fixed by the operator's own fetch and merge, outside the thread.

**Proof:** the command exits 0. Nothing has been written in the target.

### 1. The report

```sh
cd <toolkit>
yarn migrate:assess <target>
```

It reads and never writes: every read goes through `git ls-files`, so no worktree, no env file and nothing outside the index. The report prints the total of the seventeen signals, the gate, the path and why, a table per group with each score and its evidence, and the listings the interview rules on: the policy conflicts with their file and line, the SDK importers with the reviewer glob that matches each or "none", the records by kind, the practice paths that already exist, and the hygiene lines (branch state, worktrees, tracked files over 10 MB).

A report with a `not yet measured` row in P1, P3, P4 or V5, or an empty listing the tool has not built, is not the interview's opening document: an empty listing would be read as "none" and its rounds skipped. Build that listing by hand with the commands this guide names (the instruction files read whole for conflicts, `git ls-files -z` for the record kinds and collisions, a `grep` for the SDK importers), or wait for the tool, and say which in the thread.

Hold the text in the thread; it is filed in step 2, once round 1 has named the prefix. Read the hygiene lines to the operator: a tracked file over 10 MB is documented and never rewritten; a worktree is never removed by the thread.

**Proof:** the report is in the thread with its path and total, the hygiene lines have been read out, and `git status` in the target is still clean.

### 2. The interview

As soon as 11 names the prefix, file the report byte for byte as `specs/_shared/epics/MIG-migration/assess.md`, making the folder by hand. Then run the rest of the rounds from it, and write `rulings.md` beside it.

**Proof:** the filed `assess.md` is byte for byte the text held from step 1 (`diff` against that text prints nothing; a fresh run would differ once the epic folder exists); `git status` in the target shows only that new folder; the operator has said yes to the answer table, and the table names a value for every row this guide's steps read: 01 to 03, 11 to 15, every conflict and policy row, every human line, every record kind and collision, 51 to 54.

### 3. Commit 1: the layout file and the dependencies

In the target, on the migration branch:

1. Write `toolkit.json` from the toolkit's `docs/engineering/templates/toolkit.template.json`: `tier` from 13; `specsRoot` `specs`; `apps` from 12 (for a single app, `{ "web": { "path": ".", "prefix": "WEB", "designLayer": null } }`); `toolkitPrefixes` `["<P>"]`; `verify` naming `yarn verify` and `yarn verify:fast` (the scripts land in step 6 and step 5); `migrationsDir` and `branchPattern` from 14; `protectedBranch` from 02; `reviewers` as the template's rows whose globs match a tracked file (for a single app at `.`, the template's `apps/*/app/` prefix is rewritten to the app's path before matching, and a row whose target a later step tracks, `.claude/settings.json` and `tooling/hooks/**`, is kept), plus one `imports` row per SDK family the report lists (Stripe to mason, warden and chancery; auth SDKs to mason and warden; email to warden; AI SDKs listed only, no row); `stack` `{}`.
2. In the root `package.json`, add every script from the toolkit's own `package.json` whose command names a file step 4 copies, under the same name, because the copied docs name them and `check-refs` will look for each (a script the target already has under that name keeps the target's command, the toolkit's is not added, and the name goes in record 0001; `directory-map` is the usual one, and the practice's skips under overlay anyway): `contract:init`, `contract:run`, `contract:record`, `contract:add`, `contract:qa`, `review:run`, `status`, `spec:init`, `specs:archive`, `truth:promote`, `check-settings`, `check-reviewers`, `check-specs`, `check-refs`, `check-test-weakening`, `test:hooks`, `budget`, `gen:agents`, `doctor`, `hooks:install`, `lint:docs`, `directory-map`, `verify:fast`, `check-types:tooling`. Add the devDependencies `yaml`, plus `typescript` and `@types/node` where absent. Then `yarn install`.
3. Commit `toolkit.json`, `package.json` and `yarn.lock` only: `ACM: migrate step 3, toolkit.json and the toolkit's dependencies`.

The hooks are not registered yet, so this commit runs under plain git. From step 5 on, the bash guard checks the prefix.

**Proof:** `node -e "JSON.parse(require('fs').readFileSync('toolkit.json','utf8'))"` exits 0, `git show --stat HEAD` lists exactly those three files, and `yarn install` was clean.

### 4. Copy

Walk [`manifest.json`](manifest.json) in order and take every entry whose `mode` is `copy` and whose `when` the report or a ruling satisfies (`always`; `signal:next`, `signal:turbo`, `signal:components-json`, `signal:ci` from the report; `ruling:*` from the table). Copy byte for byte from the toolkit checkout at the commit round 0 named; a path ending in `/` is a folder, copied whole.

Before the first copy, keep the old instruction files: `cp AGENTS.md docs/decisions/imported/agents-md-<date>.md` and the same for `CLAUDE.md`, each nested instruction file and a tracked `.claude/settings.json` (`claude-settings-json-<date>.md`, the JSON in a fence), making the folder. The spine and the settings are rewritten in step 5, and the record points here.

Order inside the step: the collision rulings from 42 first (a host folder moved whole by `git mv`), then the path rules, the practice docs, the skills, the tooling, the decisions README. A copy that would overwrite a host file the interview did not rule on stops: add the file to 42's table, get the ruling, go on.

Three corrections to the manifest, made here until MIG-3 carries them [ASSUMPTION]: `tooling/tsconfig.json` extends `@pem/config/tsconfig/base.json`, a workspace package no target has, so replace its `extends` line with the `compilerOptions` of the toolkit's `packages/config/tsconfig/base.json`, merged under the file's own options; and copy `tooling/check-reviewers.ts` and `tooling/check-test-weakening.ts` from `<toolkit>` byte for byte, since step 3 added their scripts and step 5's proof runs them, and the manifest's tooling group lacks both.

A fourth, for a target whose root `tsconfig.json` includes `**/*.ts` or whose ESLint config ignores nothing under `tooling/`: the copied tooling imports with `.ts` extensions, which that type check rejects (TS5097) and that lint rules and the format script then rewrite. Add `tooling` to the root `tsconfig.json` `exclude`, `tooling/**` to the lint config's ignores, and `tooling/` to the format ignore file, in this same commit. A target whose type check already ignores `tooling` needs none of these.

Then `yarn gen:agents`, which writes `.claude/agents/` from the copied roles and skips a host role file without the practice's frontmatter.

Before the commit, the ignore rules: `git check-ignore -v .claude/rules .claude/skills .claude/agents tooling docs` names every copied path the target's `.gitignore` swallows (a repo that tracks its `settings.json` alone usually has `.claude/*` with one negation, which hides the rules, the skills and the agents). Add a negation per hidden folder (`!.claude/rules/`, `!.claude/skills/`, `!.claude/agents/`) under the existing rule in `.gitignore`, in this same commit.

Commit: `ACM: migrate step 4, the copied files`.

**Proof:** for every copied entry but `tooling/tsconfig.json`, `diff -r <toolkit>/<path> <path>` prints nothing, or only `Only in <target>/…` lines for host files that already sat in a copied folder (`docs/roles/`, `docs/decisions/`); `git ls-files .claude/rules .claude/skills .claude/agents tooling` lists every copied file after `git add`; `yarn gen:agents --check` exits 0; `yarn check-types:tooling` exits 0 in the target.

### 5. Derive

Take every manifest entry whose `mode` is `derive`, in this order. Each is written from the rulings, never copied.

1. **The human lines (round 3).** Place each line verbatim where 31 said: House rules, a nested `AGENTS.md`, or a `.claude/rules/house-<topic>.md` with `paths:` globs. Create the nested file or the rule where none exists. A nested file 34 split: move its ruled sections verbatim to the docs file, leave one link line in their place, bodies untouched.
2. **The spine.** `AGENTS.md`: the toolkit's contract with its commands table replaced by the target's scripts (51), its "Start here" items 1 and 2 rewritten for the target, and a "House rules" section holding the lines from 1; at most 100 lines. `CLAUDE.md`: `@AGENTS.md`, `@docs/index.md` and the Claude-only lines; at most 20. `docs/index.md`: the target's own map, with the layers table listing what step 4 installed and the target's own docs folders by name, and the "What loads when" and "Budget per build" sections copied from the toolkit's file unchanged, because `yarn budget` reads its caps there.
3. **The path rules.** From the toolkit's `ui.md`, `ts.md`, `testing.md` and, by signal, `next.md` and `turbo.md`: the same body with the `paths:` globs rewritten to the target's folders (the single app's globs start at the root). `next.md` is written for the major the target runs (the `next` range in `package.json` and the installed version): the toolkit's body states Next 16 facts (`proxy.ts` in place of `middleware.ts`, the bundled docs folder, the agent-rules generator switched off), so for another major each sentence not true of it is dropped and the major is named at the top. `ui.md` keeps the canon and says, in one line, that the repo's own components and tokens are the vocabulary until layer 3 lands the preset and the kit.
4. **The settings (22, 23, 24).** The tracked `.claude/settings.json`: the target's own blocks as 24 ruled them (kept rows stay in the file, in their blocks), then the `permissions` block of the toolkit fixture `tooling/fixtures/settings/overlay-c1-pass-floor-only.json` (the floor) merged in, a row the host already has written once, then each row exactly as 22 ruled it, taken from a named source: the two team hooks from the same fixture's `hooks` block; the push deny, the bash guard and the stop gate from `tooling/fixtures/settings/overlay-c2-pass-operator-rows-local.json` (the operator rows as `doctor` expects them). Each goes to this file when ruled team and to the local file when ruled operator, nothing by default. The operator's `.claude/settings.local.json` (an existing one is read first and merged, additions only, with the diff shown): the rows ruled operator, the sandbox with 23's hosts, and the allow list; add `.claude/settings.local.json` to `.gitignore` when it is not there. Under `overlay-local`, everything goes to the local file and the tracked file is not written.
5. **The specs root.** `specs/_shared/epics/MIG-migration/brief.md` from the copied `docs/product/brief.template.md`, three lines pointing at `assess.md` and `rulings.md`; `specs/<app>/ux/` for each app, holding only a `.gitkeep` until promotion (git tracks no empty folder); then `yarn status`, which writes `specs/_status.md`. The migration epic is made by hand, not by `yarn spec:init`, because its two files already exist.
6. **The decisions scaffold.** `docs/decisions/ledger.md` and `docs/decisions/changelog.md`, each with its heading and no rows yet; the record itself is step 8.
7. **The pending references.** Write `tooling/refs-pending.json` as `{}` first; `check-refs` reads it before anything else. The copied docs link files that stay in the toolkit (the tracks link their runbooks, `new-project/` and `migrate/`; others link references or templates the manifest leaves out) and name scripts the target does not have. Run `yarn check-refs` and sort each missing reference into the file with where it lands: a path that stays in the toolkit, `"stays in the toolkit"`; `yarn verify` and `yarn test`, `"step 6"`; a script a layer-3 part brings (`lint:boundaries`, `check-stack`, `check-ui-layout`, `check-client-bundle`, the database scripts, `shadcn`, `ui:storybook`), `"layer 3, part N"`; a toolkit-only script (`migrate:assess`), `"stays in the toolkit"`. Only a script whose tooling file step 4 copied is a step-3 miss, added to `package.json`. Nothing in the target is invented to satisfy a link.
8. **Verify, fast.** The `verify:fast` script landed in step 3, so the stop gate has something to run; the full `verify` is step 6.
9. **The git hooks.** `yarn hooks:install` writes local git config and reaches only this clone; when the sandbox refuses the write, the thread runs it once unsandboxed with the operator's yes. `doctor` only warns when it has not run, so this step is the check that it did.
10. **The `shadcn` skill.** The manifest lists `.claude/skills/shadcn/` on `signal:components-json`, and the toolkit does not hold that skill yet (`docs/design/skills.md` installs it in Phase 3). Skip the entry and say so in record 0001; nothing is invented.

Commit: `ACM: migrate step 5, the spine, rules, settings and specs root from the rulings`. From here the bash guard, if ruled operator, is live in this session.

**Proof:** `yarn check-settings`, `yarn doctor`, `yarn budget` (the always-on row, the nested row and the line caps: a red row goes back to 32 or 34, never to a cap), `yarn check-refs`, `yarn check-specs`, `yarn check-reviewers` and `yarn verify:fast` exit 0 in the target; every `paths:` glob in `.claude/rules/` matches at least one tracked file (`git ls-files -z | tr '\0' '\n' | grep`, NUL-separated because a path may hold a space or an em-dash), except a rule for files the repo does not have yet (`testing.md` before step 6's smoke test), which is named and checked again after step 6; and the agent-readability test (the toolkit's `docs/runbooks/onboard-agent.md` §5) passes with 33's brief: a fresh session given only `CLAUDE.md` names the file holding the moved line. Record the brief and the answer in `rulings.md`.

### 6. Verify: layer 2

Follow [`verify.md`](verify.md) with 51 to 53: every one of the repo's own checks runs once on the base commit; a check that passes enters `verify` as written; one that fails is frozen by its recipe or becomes a drafted gap; the toolkit's checks follow; a failing build stops the run. Where 52 named a workflow, its chained steps become one `yarn verify` step under the same triggers, in one commit. **Operator:** the first CI run, after the operator's push. Where 52 said none, CI is a gap in step 7 and a hosted step.

Commit: `ACM: migrate step 6, verify over the repo's own checks`, and one more for the CI edit when there is one.

**Proof:** `yarn verify` exits 0 in the target, and the CI file's diff, when there is one, changes only the steps and keeps the triggers.

### 7. The records moves and the gap tickets

Run at the time 43 ruled: now, or as the last commit of the day. On the middle and far paths, note its start and end on their own.

1. **The moves (41).** For each kind with a move: `git mv "<old>" "<new>"`, every path quoted, bodies untouched; a list of paths is read NUL-separated (`git ls-files -z`), never split on whitespace, because a host's paths may hold spaces or em-dashes. Then the index lines: one line per moved file (or per folder moved whole) in `docs/index.md` under a "Records from before the practice" heading, and one ledger line per decision log. A human line carried in step 5 that named a moved path now carries the new one (31). Where the host has its own link checker (`docs:check-links` or the like), run it once here and list what the moves broke in record 0001; nothing is rewritten to satisfy it.
2. **The gaps.** Each named gap is a drafted ticket under the migration epic: `yarn contract:init MIG <slug> --draft`, one per gap, with Build notes that hold the layer, what did not cross and why, the plan (a recipe path or the steps), the conflict-risk flag with the trigger to start, and an estimate labelled as one. The twelve layer-3 parts, in their order, are drafted from [`layer-3.md`](layer-3.md); the day's own gaps join them: the promotion of the imported UX spec, entry-by-entry indexing of the decision logs, the per-rule guard split for a team, a frozen check left out of `verify`, CI where none exists, and layers 2 and 3 whole for a non-JavaScript target.

Commit: `ACM: migrate step 7, the records moved and the gaps drafted`.

**Proof:** `git log --follow` on one moved file shows its old history; `yarn status` lists every drafted ticket under "Drafted"; `yarn check-specs` exits 0.

### 8. Record 0001, and the end check

Fill the toolkit checkout's `docs/decisions/decision.template.md` (not in the manifest; read it from `<toolkit>`) as record 0001, `records/0001-adopt-the-practice.md` under the target's `docs/decisions/`: the rulings table from `rulings.md`, the toolkit's remote and commit, the conflicts ruled and which way, each human line not carried and why, the record kinds and where each went, the settings rows ruled operator (the doctor check is their guard), and the id of every drafted gap. Add its ledger line and the first changelog entry.

Then, from the toolkit checkout:

```sh
cd <toolkit>
yarn migrate:assess <target> --check --end --protected <protected-branch>
```

It skips the clean-tree, ahead-of-fork and `toolkit.json` rules, and still fails on a detached HEAD, a protected branch moved or unpushed since the start, a tracked local settings file, or Node below 22.18. **Operator:** a protected branch that moved during the day is the operator's rebase or merge, in their own hands; the thread stops and says so.

Commit: `ACM: migrate step 8, record 0001`.

**Proof:** the end check exits 0, `yarn verify` exits 0, and `git status` shows a clean tree.

### 9. Print the branch and the prompts

Print, each in its own block so it can be copied whole:

1. The migration branch's name from 03, with the commit count and `git log --oneline <protected-branch>..HEAD`.
2. The hand-over to the person named in 54, one line each: the push, the first CI run, the merge, and any hosted step a gap named (CI creation and secrets, branch protection, a hosted migration, a vendor dashboard, a coverage service). Where the host builds previews on push (a `vercel.json`, a deploy workflow), the push itself starts a preview build: say so.
3. The two follow-on prompts from [`layer-3.md`](layer-3.md): the layer-3 opening prompt, and the living-truth promotion prompt.

Report to the operator in eight lines or fewer: the path and the total, the minutes per step, each `[ASSUMPTION]` made, the gaps drafted by id, what waits for them, and the prompts printed.

**Proof:** the three blocks are in the thread, and nothing was pushed (`git status -sb` shows the branch with no upstream, or an upstream with every commit ahead).

## What stops for the operator

- Every fix a precondition names (step 0), and a protected branch that moves during the day (step 8).
- The yes on the answer table (step 2) and, on "check in at gates", the start of the records step (step 7).
- Every push and merge; the first CI run; creating CI, its secrets and branch protection (steps 6 and 9).
- A copy that would overwrite a host file no ruling covers (step 4).
- The yes to run `yarn hooks:install` (step 5) and a `build` that reads `.env` files (step 6) unsandboxed.
- A freeze over about 50 files (53), a hosted database migration, a vendor dashboard, a coverage service, and removing a worktree or a tracked large file: never done by the thread.

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`layer-3.md`](layer-3.md) | Open from step 7 of the migrate guide to draft the gap tickets, and from step 9 to print the prompts. Lists layer 3's twelve parts in order, each as a drafted ticket's Build notes (layer, what did not cross, plan, conflict risk and trigger, estimate), the hosted steps that stop for the operator, and the two prompts that open layer 3 part by part and promote the imported UX spec. |
| [`manifest.json`](manifest.json) | A `json` file; see the notes above. |
| [`verify.md`](verify.md) | Open from step 6 of the migrate guide, with the verify inputs answered. Maps the repo's own checks, then the toolkit's, into one verify command; runs each once on the base commit; freezes a failing check by kind (ESLint bulk suppressions, tagged ts-expect-error lines with a count ratchet, expected-fail markers, a literal-path node test) or leaves it as a gap; the live-team rule; the CI edit. |
