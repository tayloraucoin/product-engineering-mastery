---
title: Tooling — every check, hook and script
description: Read when deciding which checks, hooks and scripts to keep, or when a tooling message needs explaining; what runs when, its measured cost, and a verdict for each entry.
layer: engineering
status: draft
thread: tooling-reference
role: Scribe
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# Tooling — every check, hook and script

What runs, when it runs, what it costs to live with, and whether it earns its place. There is one entry for every script in `package.json`, every file in `tooling/` (tests and fixtures aside) and every agent and git hook. The commands are documented in their own file headers; this file judges them. Where this file and the code disagree, the code is right and this file is stale.

The scores come from the Scribe seat, and the cost to an agent from Lorimer's (cost in tokens, retries and loops). Both are judgment, labeled as such. Times are measured unless marked _estimate_.

**Changing in the workflow overhaul.** `tooling/contract.ts`, `tooling/check-specs.ts`, `tooling/review-run.ts`, `tooling/status.ts`, `tooling/truth-promote.ts`, `tooling/hooks/results-gate.ts` and `tooling/lib/specs.ts` are being rewritten by another thread. Their entries describe them as they stood on 2026-10-05, and each carries the marker **[changing in the workflow overhaul]**.

## 1. What runs when

| Moment                                  | What runs                                                                                                                                                                                                                                                                                                                                                                                     | Measured cost                                                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every Bash call by an agent             | The `permissions` deny, ask and allow lists in `.claude/settings.json`, then the sandbox, then the PreToolUse hook `tooling/hooks/bash-guard.ts`                                                                                                                                                                                                                                              | bash-guard: 65 ms per call; silent on allow                                                                                                                                      |
| Every Edit, Write or NotebookEdit       | PreToolUse hook `tooling/hooks/results-gate.ts`; it exits at once outside `specs/`                                                                                                                                                                                                                                                                                                            | 64 ms per call                                                                                                                                                                   |
| Session start                           | SessionStart hook `tooling/hooks/session-start.ts`: the spine's commit plus `yarn status --brief`, and a fingerprint of the tree                                                                                                                                                                                                                                                              | 5.4 s; 603 characters, about 150 tokens, into context                                                                                                                            |
| Session stop (every turn end)           | Stop hook `tooling/hooks/stop-gate.ts`. If the tree is unchanged it reuses the status line stored at the last stop and runs nothing else. Otherwise it calls `yarn status --brief` for the person and, when the session edited files, runs `yarn verify:fast` scoped to them, blocking the stop once on failure. Every stop's message ends with the thread's context size from the transcript | unchanged tree: 0.3 s (measured 2026-10-06; the status call is skipped); changed tree: 5.7 s for the status call (measured 2026-10-06) plus the scoped steps (_estimate_ 3–10 s) |
| `yarn verify:fast`                      | Up to 9 steps, each run only if the changed files reach it (`tooling/verify-fast.ts`)                                                                                                                                                                                                                                                                                                         | unscoped on this branch: 31.1 s, 1,507 changed files                                                                                                                             |
| `yarn verify`                           | 23 steps in a fixed order; it stops at the first failure ([table below](#verify-step-by-step))                                                                                                                                                                                                                                                                                                | 101 s with a warm Turbo cache; about 121 KB of output                                                                                                                            |
| CI (push to `main`, every pull request) | `yarn verify`, the same command (`.github/workflows/ci.yml`)                                                                                                                                                                                                                                                                                                                                  | as `yarn verify`, plus install                                                                                                                                                   |
| At commit, agent in Claude Code         | bash-guard's commit rules: none on the protected branch, and the message opens with a work-id                                                                                                                                                                                                                                                                                                 | inside the 65 ms                                                                                                                                                                 |
| At commit, native git hooks             | `tooling/git-hooks/commit-msg` and `tooling/git-hooks/pre-commit`, **only after `yarn hooks:install`**. Not installed in this checkout: `core.hooksPath` is unset, and `yarn doctor` warns about it                                                                                                                                                                                           | nothing today                                                                                                                                                                    |
| On demand                               | The contract loop, status, generators, doctor, dev servers, database scripts                                                                                                                                                                                                                                                                                                                  | per entry                                                                                                                                                                        |

### Verify, step by step

Each step was timed once on 2026-10-05, on `agent/STK-3` at `b274a6b` with other threads' edits in the tree. Steps 1–13, 15–17, 19 and 21–22 ran in the agent sandbox. The Turbo steps (`test`, `lint`, `check-types`, `build`) failed inside the sandbox at the time, because `turbo.json` then hashed every `.env.local` as a global dependency and the sandbox hides those files, so they were timed outside it; the same day's change (changelog 2026-10-05, EN-15) moved that hashing to `web#build` alone. All four were Turbo cache hits (`build`: one of two tasks), so their cold times are estimates. A cold `--force` run was not allowed in this session.

| #   | Step                         |   Seconds | Output (lines / bytes) | Note                                                                                                                            |
| --- | ---------------------------- | --------: | ---------------------: | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `yarn format:check`          |       6.0 |                 2 / 66 | whole repo                                                                                                                      |
| 2   | `yarn lint:docs`             |       0.5 |                 1 / 85 | 193 files                                                                                                                       |
| 3   | `yarn check-settings`        |       0.5 |                 1 / 72 | 12 fixtures first                                                                                                               |
| 4   | `yarn test:hooks`            |       8.9 |                5 / 403 | 147 cases, one Node process each                                                                                                |
| 5   | `yarn check-refs`            |       2.0 |                1 / 989 | 113 live files                                                                                                                  |
| 6   | `yarn check-stack`           |       0.6 |                 1 / 68 | 16 modules                                                                                                                      |
| 7   | `yarn check-migrations`      |       0.9 |                 1 / 88 | 2 migrations                                                                                                                    |
| 8   | `yarn check-specs`           |       9.9 |             14 / 3,454 | 26 fixtures first; 13 warnings about other tickets                                                                              |
| 9   | `yarn check-test-weakening`  |       0.7 |                 1 / 73 | 10 fixtures first                                                                                                               |
| 10  | `yarn contrast-audit`        |       0.5 |             59 / 5,169 | prints every passing pair                                                                                                       |
| 11  | `yarn check-ui-layout`       |       0.5 |                 1 / 20 |                                                                                                                                 |
| 12  | `yarn check-catalog`         |       0.5 |                 1 / 57 | 92 entries                                                                                                                      |
| 13  | `yarn test:tooling`          |      41.3 |           994 / 36,811 | 164 tests; the slowest step                                                                                                     |
| 14  | `yarn test`                  |       0.7 |         1,693 / 66,063 | full cache hit; Turbo replays every log. Cold: about 30 s (_estimate_; `@pem/ui`'s Vitest run took 26.7 s on its last real run) |
| 15  | `yarn budget`                |       0.6 |             16 / 1,131 | always-on at 3,996 of 4,000 tokens                                                                                              |
| 16  | `yarn gen:agents --check`    |       0.5 |                6 / 337 | 5 agents                                                                                                                        |
| 17  | `yarn directory-map --check` |       0.6 |                3 / 434 | **failed**: two runbook folders another thread is moving have no README                                                         |
| 18  | `yarn lint`                  |       0.7 |             26 / 1,296 | full cache hit. Cold: 20–40 s (_estimate_)                                                                                      |
| 19  | `yarn lint:boundaries`       |       4.4 |                  0 / 0 | silent on pass                                                                                                                  |
| 20  | `yarn check-types`           |       0.7 |             30 / 1,596 | full cache hit. Cold: 15–30 s (_estimate_)                                                                                      |
| 21  | `yarn check-types:tooling`   |       1.3 |                  0 / 0 |                                                                                                                                 |
| 22  | `yarn check-client-bundle`   |       9.9 |                1 / 139 | its own production build of `apps/web`                                                                                          |
| 23  | `yarn build`                 |       8.8 |             77 / 3,112 | `web` cached, `docs` rebuilt. Cold: 20–30 s (_estimate_)                                                                        |
|     | **Total**                    | **≈ 101** | **≈ 2,930 / ≈ 121 KB** | about 30,000 tokens if an agent reads it all                                                                                    |

What the measurements say:

- **Two steps produce 85% of verify's output.** `yarn test` (66 KB) replays every package's full log even on a cache hit. `yarn test:tooling` (37 KB) prints TAP for 164 tests. On a pass, neither needs more than a summary line.
- **`yarn test:tooling` is 41 s of verify's 101 s, and the contract-loop tests are nearly all of it.** Run one at a time, the four `tooling/contract-*.test.ts` files take 88 s between them: `contract-run` 39.4 s, `contract-init` 25.2 s, `contract-review` 14.0 s, `contract-git` 9.6 s. The other ten test files take 6 s together. All four are tests of code the overhaul is rewriting.
- **Every session start and every stop pays for `yarn status --brief`** (5.8 s), including a stop where nothing changed.
- **An agent's `yarn verify` failed in the sandbox at step 14**, every time, until `turbo.json` stopped hashing every `.env.local` as a global dependency (changelog 2026-10-05, EN-15). What stays outside the sandbox is step 23 on a machine with a `.env.local` in `apps/web`; the `verify` entry says why.
- **The native git hooks are not installed here**, so the commit-time protection is bash-guard's alone.

## 2. How to read an entry

Each entry gives what the tool is, its area of the codebase, its trigger, four scores, pros and cons, and a verdict. Scores run from 0.0 to 7.0:

- **Importance:** how bad its removal would be. 7 means a defect class (a leaked secret, a broken build, a lost guard on an irreversible action) would pass unguarded. 0 means nothing is lost.
- **Token cost:** what an agent pays to live with it: output it must read, retries it causes, loops it forces. 0 means silent and never in the way. 3 means about a screen of output, or one retry now and then. 5 means thousands of tokens, or a fix loop. 7 means it dominates a session.
- **Wall time:** seconds on someone's path. 0 means under 0.3 s, or run only by a person on purpose; 1 under 1 s; 2 is 1–3 s; 3 is 3–8 s; 4 is 8–15 s; 5 is 15–30 s; 6 is 30–60 s; 7 is over a minute. A hook that runs on every call moves up one band.
- **Standard:** 7 means industry standard (Prettier, ESLint, tsc), and 0 means built for this house alone. This is not part of the net score. It tells you how much of the upkeep is this repo's alone.

**Net** in [§4](#4-weakest-first) is importance minus the mean of token cost and wall time.

## 3. Entries

### 3.1 Agent hooks (`.claude/settings.json`)

#### bash-guard

- **What:** a PreToolUse hook that tokenizes every Bash command an agent runs, and blocks npm, npx and pnpm, any `git push`, commits on `main` or without a work-id, shell writes to results, review and merged as-built files, and database resets and drops. It asks Taylor first before a migrate, push, seed or setup.
- **Area:** agent permissions; git; the contract records; the database (`tooling/hooks/bash-guard.ts`, `tooling/lib/work-ids.ts`).
- **Trigger:** every Bash tool call in Claude Code.
- **Scores:**
  - Importance **6.0**: the deny list in `.claude/settings.json` matches prefixes, so `git -C . push`, `sh -c 'git push'` and `/usr/bin/git push` get past it; this hook catches them.
  - Token cost **1.5**: it is silent on allow. A denial is at most about 60 tokens (enforced by `yarn test:hooks`) and names the command to run instead. A compound command it cannot parse costs a rewrite.
  - Wall time **1.0**: 65 ms per call, on every call.
  - Standard **2.0**: PreToolUse guards are a documented Claude Code pattern; a 906-line shell lexer is not.
- **Pros:**
  - Catches the bypass forms.
  - Every denial says what to do next.
  - 120 fixture cases across 9 rules.
- **Cons:**
  - 906 lines to maintain, the largest file after `tooling/lib/specs.ts`.
  - By its own header it is text analysis and never a boundary.
  - The `results-write`, `review-write` and `as-built-write` rules guard records the overhaul is replacing.
- **Verdict:** **keep but simplify.** Keep `package-manager`, `push`, `commit-on-main` and the database rules. Move the three record-write rules with the overhaul. Re-decide `commit-work-id` together with the commit-msg hook ([below](#commit-msg)).

#### results-gate

**[changing in the workflow overhaul]**

- **What:** a PreToolUse hook that blocks an agent's Edit or Write to a `results.json`, a ticket's `review-<role>.md`, `_preflight.md`, the generated `_status.md`, or a merged `as-built.md` (except its `applied:` line). The denial names the `yarn` command that writes the file instead.
- **Area:** the specs tree, `specs/` (`tooling/hooks/results-gate.ts`).
- **Trigger:** every Edit, Write and NotebookEdit call; it exits at once for any path outside `specs/`.
- **Scores:**
  - Importance **3.5**: it stops the builder from grading itself by hand, but check-specs' run records and hashes are the real boundary; this is the first line.
  - Token cost **1.0**: silent almost always; a denial is about 48 tokens.
  - Wall time **1.0**: 64 ms per edit call.
  - Standard **1.0**: the hook mechanism is standard, the rules are house.
- **Pros:**
  - Cheap.
  - The message names the right command.
- **Cons:**
  - It guards file names the overhaul is changing.
  - A second copy of the same law lives in bash-guard.
- **Verdict:** **keep until the overhaul lands**, then rewrite it against the new records or drop it if the new loop has no hand-protected files.

#### session-start

- **What:** a SessionStart hook that prints one line of at most 600 characters into the agent's context: the commit the spine files were last changed in, and `yarn status --brief`. It also records a fingerprint of the working tree, so stop-gate can tell later whether the session changed anything.
- **Area:** the agent spine (`AGENTS.md`, `CLAUDE.md`, `docs/index.md`) and the specs status (`tooling/hooks/session-start.ts`).
- **Trigger:** every session start, resume, clear and compaction.
- **Scores:**
  - Importance **3.0**: useful orientation, not a guard; without it an agent starts blind to what is in flight, and stop-gate loses its baseline.
  - Token cost **2.0**: about 150 tokens per session. In this session the line was cut off part-way through one ticket's list of stale files, so most of the 600 characters went on file paths.
  - Wall time **3.0**: 5.4 s, nearly all of it `yarn status --brief` (5.8 s on its own).
  - Standard **3.0**: SessionStart context hooks are documented; the content is house.
- **Pros:**
  - An agent learns when its instructions changed underneath it.
  - The status is generated, not remembered.
- **Cons:**
  - Slow.
  - The brief spends its characters on file lists instead of ids and counts.
- **Verdict:** **keep but simplify.** The brief should be ticket ids and counts. Status should be fast enough that a session start does not wait 5 s for it.

#### stop-gate

- **What:** a Stop hook that, whenever the tree changed since the last green check, runs `yarn verify:fast` over the files this session edited (read from its transcript). On failure it blocks the stop once with up to 1,000 characters of output, so the agent fixes its own files before it reports done, and it never blocks twice in a row or judges another thread's files. Every stop's message to the person ends with the thread's context size, read from the usage fields of the transcript's last assistant record; above 200k it says to start a fresh thread for the next ticket (audit O1; it informs, never blocks). On an unchanged tree it reuses the status line stored beside the fingerprint at the last stop instead of calling `yarn status --brief` (audit Y2).
- **Area:** whatever the session edited (`tooling/hooks/stop-gate.ts`, `tooling/hooks/session-state.ts`).
- **Trigger:** every turn end in Claude Code.
- **Scores:**
  - Importance **5.0**: the only check between an agent's edit and its "done" inside the session; CI catches it later, after the thread has moved on.
  - Token cost **3.0**: about 250 tokens on a failure, and one forced fix loop (bounded by the once-only rule).
  - Wall time **4.0**: an unchanged tree costs 0.3 s, the fingerprint and the stored status line (measured 2026-10-06); a changed tree pays 5.7 s for `yarn status --brief` (measured 2026-10-06), the scoped checks add 3–10 s (_estimate_), and 8.9 s more when hook files were touched.
  - Standard **3.0**: verify-before-stop is a known harness pattern; the scoping by transcript is house.
- **Pros:**
  - Catches formatting, lint and type breaks while the agent still holds the context.
  - It is safe in a shared checkout.
- **Cons:**
  - On a changed tree the status call is most of its cost, for a message only the person sees; on a shared tree another thread's edit counts as a change.
  - It reads the transcript format, which can change under it.
- **Verdict:** **keep but simplify.** The status call now runs only on a changed tree (2026-10-06); what is left is making `--brief` itself fast (see status).

#### session-state

- **What:** the helper behind the two hooks above. It hashes HEAD, `git status` and `git diff HEAD` into one fingerprint per session, and stores it in the OS temp folder, never in the repo, with the status line stop-gate last printed for that tree beside it, so an unchanged stop reuses the line (audit Y2).
- **Area:** the hooks (`tooling/hooks/session-state.ts`).
- **Trigger:** imported by session-start and stop-gate.
- **Scores:**
  - Importance **3.0**: without it stop-gate cannot tell "nothing changed", and would run checks on every stop.
  - Token cost **0.0**: no output.
  - Wall time **0.5**: one `git diff HEAD` per start and stop, 0.2 s on this branch (measured 2026-10-06); it grows with the size of the uncommitted diff.
  - Standard **1.0**: house.
- **Pros:**
  - 69 lines, Node built-ins only.
- **Cons:**
  - On a shared tree another thread's edit changes the fingerprint, so "changed" often means "someone changed something".
- **Verdict:** **keep.**

### 3.2 Native git hooks

#### commit-msg

- **What:** a git commit-msg hook that, on an agent branch (`agent/<id>`), refuses a message that does not open with a work-id such as `PEM:` or `STK-9:`. It covers what bash-guard covers, but for Cursor, Codex and people.
- **Area:** git history (`tooling/git-hooks/commit-msg`, `tooling/git-hooks/commit-msg.ts`, `tooling/lib/work-ids.ts`).
- **Trigger:** every `git commit`, but only once `yarn hooks:install` has set `core.hooksPath`. It is not set in this checkout.
- **Scores:**
  - Importance **1.0**: as installed today it does nothing. Installed, it guards a naming convention that CI never checks.
  - Token cost **0.5**: one line on failure.
  - Wall time **0.5**: one Node start per commit (_estimate_ 0.1 s).
  - Standard **4.0**: commit-message hooks (commitlint) are common.
- **Pros:**
  - The one cover for agents other than Claude Code.
- **Cons:**
  - Dead until installed.
  - A second home for bash-guard's commit rule.
- **Verdict:** **candidate to remove,** unless Cursor or Codex sessions start committing here, in which case install it and keep it.

#### pre-commit

- **What:** a git pre-commit hook that runs `tooling/check-specs.ts --skip-fixtures` when a commit stages anything under `specs/`. It reads the working tree, not the staged snapshot.
- **Area:** the specs tree (`tooling/git-hooks/pre-commit`, `tooling/git-hooks/pre-commit.ts`).
- **Trigger:** a commit that stages a `specs/` file, once `yarn hooks:install` has run. It has not run in this checkout.
- **Scores:**
  - Importance **1.0**: not installed. Installed, it repeats a check that `yarn verify` and CI already run, and because it reads the working tree it judges other threads' uncommitted files.
  - Token cost **2.0**: installed, it would print today's 13 warnings (about 860 tokens) on every such commit.
  - Wall time **3.0**: _estimate_ 4–6 s per commit, check-specs without its fixtures.
  - Standard **4.0**: pre-commit hooks are common; this content is house.
- **Pros:**
  - In a single-thread repo it would catch a bad record before the commit.
- **Cons:**
  - Wrong snapshot.
  - Duplicate gate.
  - Slow commits in a shared tree.
- **Verdict:** **candidate to remove.**

#### hooks:install

- **What:** `yarn hooks:install` points `core.hooksPath` at `tooling/git-hooks/` so the two hooks above run. The sandbox makes `.git/config` read-only, so a person runs it once.
- **Area:** git configuration (`tooling/hooks-install.ts`).
- **Trigger:** by hand, once per clone.
- **Scores:**
  - Importance **1.0**: it exists only for the two hooks above.
  - Token cost **0.0**: one line.
  - Wall time **0.0**: instant, run once.
  - Standard **3.0**: a hooksPath installer is a lighter version of husky.
- **Pros:**
  - No hook-manager dependency.
- **Cons:**
  - Never run here.
  - `yarn doctor` carries a warning for it.
- **Verdict:** **candidate to remove** with the hooks; keep it if commit-msg is kept.

### 3.3 The two verify commands

#### verify

- **What:** `yarn verify` chains the 23 checks of [§1](#verify-step-by-step) with `&&`, so the first failure stops it. CI runs exactly this command, so local and CI cannot drift.
- **Area:** the whole repo.
- **Trigger:** by hand or by an agent before a ticket closes; CI on every pull request and every push to `main`.
- **Scores:**
  - Importance **7.0**: it is the merge gate.
  - Token cost **6.0**: about 121 KB (about 30,000 tokens) of output on a pass, measured. Inside the agent sandbox it failed at `yarn test` every time until 2026-10-05 (EN-15); now only step 23 can fail there, and only on a machine with a `.env.local` in `apps/web`.
  - Wall time **7.0**: 101 s with a warm Turbo cache, measured; 3–4 minutes cold (_estimate_).
  - Standard **5.0**: one verify script mirrored by CI is standard. Ten of its 23 steps are house checks.
- **Pros:**
  - One command, one truth.
  - The cheap checks mostly come first.
- **Cons:**
  - Loud.
  - Sandbox-hostile at step 23 on a machine with a `.env.local` in `apps/web`: `web#build` hashes that file on purpose (`apps/web/turbo.json`), because Next loads it inside the task, where `globalEnv` cannot see it, and the bundle embeds the collapsed `NEXT_PUBLIC_*` values. The sandbox hides the file, so that one step then runs outside it; no other step reads an env file.
  - About 40% of its time is the contract-loop tests.
- **Verdict:** **keep but simplify.** Quiet `yarn test` and `yarn test:tooling` on a pass. Move the contract-loop tests out of the default run, or into CI only, when the overhaul replaces them. Name the one remaining sandbox failure (`build` with a `.env.local` in `apps/web`) in the error.

#### verify:fast

- **What:** `yarn verify:fast` runs only the checks that the changed files reach: Prettier on changed files, Turbo lint and types on affected workspaces, the boundaries lint on changed code, tooling types, the docs lint, the settings check, the hook fixtures, and (unscoped only) check-specs and budget. It is the stop gate's engine; stop-gate scopes it to the session's files.
- **Area:** whatever changed (`tooling/verify-fast.ts`).
- **Trigger:** stop-gate on every stop with edits; by hand.
- **Scores:**
  - Importance **4.0**: without it stop-gate has nothing affordable to run.
  - Token cost **2.0**: one summary line on a pass; the last 25 lines of the failing step on a failure.
  - Wall time **6.0**: unscoped it took 31.1 s on this branch (1,507 changed files against `main`), most of a full verify. Scoped by the stop gate it is _estimated_ at 3–10 s.
  - Standard **2.0**: affected-only checking is Turbo's idea; the step selection is house.
- **Pros:**
  - Prints each step's time.
  - It fails fast.
  - It reads the format globs from `yarn format:check`, so the two cannot disagree.
- **Cons:**
  - On a long-lived branch the unscoped mode stops being fast.
  - It silently skips steps whose inputs did not change.
- **Verdict:** **keep.**

### 3.4 The checks inside `yarn verify`

#### format:check

- **What:** `yarn format:check` runs Prettier over every `.ts`, `.tsx`, `.md`, `.mjs` and `.css` file and fails on any that are not formatted. The fix is `yarn format`.
- **Area:** every source and markdown file.
- **Trigger:** verify step 1; verify:fast on changed files.
- **Scores:**
  - Importance **4.0**: unformatted diffs bury real changes in review.
  - Token cost **0.5**: two lines on a pass; a file list on a failure.
  - Wall time **3.0**: 6.0 s over the whole repo.
  - Standard **7.0**: Prettier.
- **Pros:**
  - Standard, and fixed by one command.
- **Cons:**
  - Whole-repo every run.
- **Verdict:** **keep.**

#### lint:docs

- **What:** `yarn lint:docs` checks every markdown file under `docs/` for its name (record 0006) and its frontmatter schema (required keys, layer, status, a description of at most 400 characters). It also checks that `.claude/rules/` files carry only `paths`.
- **Area:** `docs/`, `.claude/rules/` (`tooling/lint-frontmatter.ts`).
- **Trigger:** verify step 2; verify:fast when `docs/`, `.claude/rules/` or `toolkit.json` change.
- **Scores:**
  - Importance **4.0**: frontmatter feeds the directory map, the budget and the generated agents, and a description is a load trigger.
  - Token cost **0.5**: one line on a pass; one line per problem, with the fix.
  - Wall time **1.0**: 0.5 s.
  - Standard **1.0**: frontmatter linting exists elsewhere; this schema is house.
- **Pros:**
  - The enforceable copy of record 0006.
- **Cons:**
  - None worth naming.
- **Verdict:** **keep.**

#### check-settings

- **What:** `yarn check-settings` fails when `.claude/settings.json` loses a required deny or ask rule, allows every shell command, turns the sandbox off, holds a machine path, drops a hook registration or points at a missing hook script. It runs 12 fixtures first, to prove the check itself still bites.
- **Area:** agent permissions (`tooling/check-settings.ts`, `docs/engineering/templates/settings.template.json`).
- **Trigger:** verify step 3; verify:fast when the settings or the check change.
- **Scores:**
  - Importance **5.5**: the permission boundary is the one place where a quiet deletion is most dangerous, and no other check would notice.
  - Token cost **0.5**: one line.
  - Wall time **1.0**: 0.5 s.
  - Standard **1.0**: house.
- **Pros:**
  - Cheap.
  - Every failure says which rule is missing.
- **Cons:**
  - Its required list is a second copy of the deny list, kept in step by hand.
- **Verdict:** **keep.**

#### check-reviewers

- **What:** `yarn check-reviewers` fails, under the overlay tiers, when a reviewer row in `toolkit.json` matches no tracked file by its glob or by its `imports` list, naming the row. A row that reaches nothing seats nobody, so the change it was written for ships at a lower QA level unnoticed (MIG T6). At `starter` it prints that it is skipped and exits 0: a starter's rows are seats for modules not built yet. Import rows are matched by the same scanner `suggestReviewers` uses (`tooling/lib/specs.ts`), which reads static imports, re-exports, `require` and `import()` and never a name in a comment or a string.
- **Area:** the reviewer map (`tooling/check-reviewers.ts`, `toolkit.json`, `docs/engineering/templates/toolkit.template.json`).
- **Trigger:** verify, right after check-settings.
- **Scores:**
  - Importance **3.5**: in a migrated repo it is the only guard on a glob that stopped matching; in this repo, at `starter`, it does nothing yet.
  - Token cost **0.5**: one line, or one line per dead row.
  - Wall time **1.0**: 0.5 s at `starter`; the overlay pass over this repo's 1,786 tracked files took 0.2 s more (measured 2026-10-07).
  - Standard **0.5**: house.
- **Pros:**
  - Names the row to correct or delete.
  - Reads tracked source files only; an env file is never opened.
- **Cons:**
  - Skipped in this repo, so its overlay path is proven only by its tests.
- **Verdict:** **keep.**

#### test:hooks

- **What:** `yarn test:hooks` runs each of the four agent hooks against its fixture file: 147 synthetic inputs, each with the answer it must produce. It also fails a hook whose median run exceeds 200 ms, or whose denial exceeds about 60 tokens.
- **Area:** `tooling/hooks/` (`tooling/test-hooks.ts`, `tooling/hooks/fixtures/`).
- **Trigger:** verify step 4; verify:fast when hook files change.
- **Scores:**
  - Importance **5.0**: the hooks run on every call. A broken guard either blocks everything or nothing, and both fail silently.
  - Token cost **0.5**: five lines.
  - Wall time **4.0**: 8.9 s, one Node process per case.
  - Standard **2.0**: testing hooks with fixtures is good practice; the harness is house.
- **Pros:**
  - Holds the hooks to a speed and message-length budget, not just correctness.
- **Cons:**
  - 9 s in every verify for files that rarely change.
- **Verdict:** **keep but simplify.** Run the cases in parallel, or only when `tooling/hooks/` changed (verify:fast already does this).

#### check-refs

- **What:** `yarn check-refs` checks that every markdown link, repo path in a code span, `yarn <script>` name and `/tk-*` skill name in the live docs exists. A reference to something a later phase lands goes in `tooling/refs-pending.json`, a list that may only shrink.
- **Area:** the spine, `.claude/`, `docs/` minus byte-preserved bodies (`tooling/check-refs.ts`).
- **Trigger:** verify step 5.
- **Scores:**
  - Importance **4.0**: agents follow paths literally; a dead one is a wasted search or an invented file.
  - Token cost **1.0**: one line, but almost 1 KB, because it lists every pending reason on every pass.
  - Wall time **2.0**: 2.0 s.
  - Standard **2.0**: link checkers are standard; checking script and skill names is house.
- **Pros:**
  - It caught the audit-day class of defect (docs naming a tool that did not exist).
- **Cons:**
  - The pending list is a hand-kept file of 40 entries.
- **Verdict:** **keep.** Print a count, not the reasons.

#### check-stack

- **What:** `yarn check-stack` compares the stack modules listed in `toolkit.json` with the tree, and fails when a present module is missing a listed file. It also fails when a removed module leaves a file, an environment variable in `.env.example` or `turbo.json`, or a dependency behind.
- **Area:** the default stack's modules (`tooling/check-stack.ts`, `toolkit.json`).
- **Trigger:** verify step 6.
- **Scores:**
  - Importance **3.5**: it makes the removal runbooks provable; it matters most in a product repo that drops a module.
  - Token cost **0.5**: one line.
  - Wall time **1.0**: 0.6 s.
  - Standard **0.5**: house.
- **Pros:**
  - Reports, never removes.
  - It names the leftover.
- **Cons:**
  - Another place to update when a module gains a file.
- **Verdict:** **keep.**

#### check-migrations

- **What:** `yarn check-migrations` reads every migration in `packages/db/migrations`. It fails when one acts on Supabase's `auth` schema (D-STK-5).
- **Area:** the database (`packages/db/scripts/check-migrations.ts`).
- **Trigger:** verify step 7.
- **Scores:**
  - Importance **4.0**: an applied migration is a one-way door, and the auth schema belongs to Supabase.
  - Token cost **0.5**: one line.
  - Wall time **1.0**: 0.9 s.
  - Standard **1.5**: migration linters exist (squawk); this rule is house.
- **Pros:**
  - Tiny and exact.
- **Cons:**
  - It checks one rule, not migration safety in general.
- **Verdict:** **keep.**

#### check-specs

**[changing in the workflow overhaul]**

- **What:** `yarn check-specs` checks the specs tree: layout and ids, each contract against its schema, results against frozen criteria, every PASS against its run record (a review PASS goes stale only when the criteria change, WEB-12), closure, immutability against `main`, spec-file caps and drift in `_status.md`. It runs its fixtures first, and `--strict` turns the in-flight warnings into failures. Staleness is `--strict`'s question alone (PR-19; the audit's C7): only `--strict` reads a rewritten evidence log, or at Q3 a later commit to a planned path; without it neither is a warning, since `contract:run` rewrites its git-ignored logs on every run and a warning there invited a thread to re-prove another thread's closed work. A `results.json` that contradicts itself (a PASS with no run record, a failing exit, the wrong command, zero tests) fails at every level. A fixture's `case.json` may carry `lenient` to pin what the tree says without `--strict` and in the brief line.
- **Area:** `specs/` (`tooling/check-specs.ts`, `tooling/lib/specs.ts`, `tooling/fixtures/specs/`).
- **Trigger:** verify step 8; verify:fast unscoped; the pre-commit hook if installed.
- **Scores:**
  - Importance **6.0**: today it is the boundary behind "done is results.json": without it a PASS is a claim in a file.
  - Token cost **5.0**: on this tree it prints 13 warnings (about 860 tokens) on every verify. Each one names a `yarn` command to re-prove another thread's ticket, which invites an agent to do that work.
  - Wall time **4.0**: 9.9 s, a large part of it the fixtures.
  - Standard **0.0**: house.
- **Pros:**
  - The run-record idea (command, exit, commit and evidence hash) is sound and cheap to verify.
- **Cons:**
  - The loudest house check.
  - 433 lines plus 1,251 in `tooling/lib/specs.ts`.
  - It re-proves itself against its fixtures on every run.
- **Verdict:** **keep the run-record integrity; let the overhaul cut the rest.** Run its fixtures in `yarn test:tooling`, not in every check, and print warnings as a count with one example.

#### check-test-weakening

- **What:** `yarn check-test-weakening` compares the branch with its merge-base on `main`. It fails on a deleted test file or fixture, fewer test or assert calls in a file, more `.skip` or `.only`, or a fixture case flipped from deny to allow, unless an as-built's "Test changes" section or a `Test-changes:` commit trailer says so.
- **Area:** every test file and tooling fixture (`tooling/check-test-weakening.ts`).
- **Trigger:** verify step 9.
- **Scores:**
  - Importance **4.5**: weakening a test to reach green is a known agent failure, and this is the only check that sees it.
  - Token cost **1.0**: one line; a finding asks for a written reason, not a fix loop.
  - Wall time **1.0**: 0.7 s.
  - Standard **1.0**: house; mutation testing is the industry's heavier answer.
- **Pros:**
  - Cheap, with an honest escape hatch.
- **Cons:**
  - It counts calls, so a rename can trip it (its fixtures cover the common case).
- **Verdict:** **keep.**

#### contrast-audit

- **What:** `yarn contrast-audit` computes the WCAG 2.2 contrast of 57 token pairs in `packages/config/tailwind/preset.css`, in light and dark. It fails any text pair under 4.5:1 and any focus-ring or control-boundary pair under 3:1.
- **Area:** the design tokens (`tooling/contrast-audit.ts`).
- **Trigger:** verify step 10.
- **Scores:**
  - Importance **4.0**: a contrast regression in a token reaches every surface at once.
  - Token cost **3.0**: it prints all 59 lines (about 1,300 tokens) on a pass.
  - Wall time **1.0**: 0.5 s.
  - Standard **3.0**: contrast checking is standard practice; the preset parser is house.
- **Pros:**
  - Exact numbers.
  - It caught the destructive button at 3.99:1 (CAT batch review).
- **Cons:**
  - Loud on success.
- **Verdict:** **keep but simplify.** Print failures and a count.

#### check-ui-layout

- **What:** `yarn check-ui-layout` holds `@pem/ui` to the folder law in `packages/ui/AGENTS.md`: kinds as folders, and each component in its kind's folder under `primitives/` or `composed/` with its own files. It also keeps `cva` in variants files, keeps primitives from importing composed components, and checks that every `exports` target exists.
- **Area:** `packages/ui` (`tooling/check-ui-layout.ts`).
- **Trigger:** verify step 11.
- **Scores:**
  - Importance **2.5**: a misfiled component is a nuisance, not a defect.
  - Token cost **0.5**: one line.
  - Wall time **1.0**: 0.5 s.
  - Standard **0.5**: house.
- **Pros:**
  - Cheap.
  - It turns a written layout into a check.
- **Cons:**
  - Another list (the kinds) kept in step with `packages/ui/AGENTS.md`.
- **Verdict:** **keep.**

#### check-catalog

- **What:** `yarn check-catalog` derives each component's state (planned, present, storied, link-only) from `packages/catalog/manifest.json` and the tree. It fails on a malformed entry, a story that disagrees with its entry, an unlisted story, or a stale `STATUS.md`; `--write` rewrites `STATUS.md`.
- **Area:** `packages/ui`, `packages/catalog` (`tooling/check-catalog.ts`).
- **Trigger:** verify step 12; `--ticket` by the CAT tickets.
- **Scores:**
  - Importance **3.0**: it keeps the catalog honest while it is being filled.
  - Token cost **0.5**: one line.
  - Wall time **1.0**: 0.5 s.
  - Standard **0.5**: house.
- **Pros:**
  - Generated status, never typed.
- **Cons:**
  - Tied to one epic's lifetime.
- **Verdict:** **keep** while the catalog grows. It is a removable stack module with its own removal runbook.

#### test:tooling

- **What:** `yarn test:tooling` runs every `tooling/**/*.test.ts` with Node's test runner: 164 tests. Four files drive the contract loop through scratch git repos in `$TMPDIR`; the rest test the boundaries lint, the token lint, the preset, the age gate and the checks above.
- **Area:** `tooling/`, `packages/config/eslint/`, the preset.
- **Trigger:** verify step 13.
- **Scores:**
  - Importance **5.0**: it is what keeps the checks themselves from rotting.
  - Token cost **5.0**: 994 lines (37 KB, about 9,000 tokens) of TAP on a pass.
  - Wall time **6.0**: 41.3 s, the slowest step. Run one at a time, the four contract-loop files take 88 s and the other ten take 6 s.
  - Standard **4.0**: `node:test` is standard; the scratch-repo harness is house.
- **Pros:**
  - No mocks.
  - Real git and a real filesystem.
- **Cons:**
  - Most of its cost tests code the overhaul is replacing.
- **Verdict:** **keep but simplify.** Use a summary reporter in verify. Let the overhaul's tests replace the four contract files, and hold them to a time budget.

#### test

- **What:** `yarn test` runs each workspace's `test` task through Turbo. That is 195 Node tests across the packages and `apps/web`, and 382 Storybook-driven Vitest tests in `@pem/ui`.
- **Area:** `apps/web`, `packages/*`.
- **Trigger:** verify step 14.
- **Scores:**
  - Importance **6.5**: the product's own unit tests.
  - Token cost **6.0**: 66 KB (about 16,000 tokens) on a full cache hit, because Turbo replays every log. It runs inside the agent sandbox: its inputs hold no env file.
  - Wall time **4.0**: 0.7 s when fully cached (measured); about 30 s cold (_estimate_).
  - Standard **7.0**: Turbo, `node:test`, Vitest.
- **Pros:**
  - Cached.
  - Standard.
- **Cons:**
  - The loudest step in verify.
- **Verdict:** **keep but simplify.** Run it with Turbo's errors-only log output inside verify.

#### budget

- **What:** `yarn budget` reads the caps from the "Budget per build" table in `docs/index.md` and fails when the always-on files, a design layer, a skill body, the path rules or any build's load exceeds its cap. Token counts are characters ÷ 4.
- **Area:** the agent context: the spine, `.claude/`, `docs/design/` (`tooling/budget.ts`).
- **Trigger:** verify step 15; verify:fast unscoped.
- **Scores:**
  - Importance **5.0**: it is the only thing holding the always-on context down, and it stands at 3,996 of 4,000 today.
  - Token cost **1.0**: 16 lines.
  - Wall time **1.0**: 0.6 s.
  - Standard **0.5**: house; few repos measure their agent context at all.
- **Pros:**
  - The table in `docs/index.md` is the contract, so prose and check cannot drift.
- **Cons:**
  - An estimate, not a tokenizer.
  - At 4 tokens of headroom, every always-on edit now trips it.
- **Verdict:** **keep.**

#### gen:agents

- **What:** `yarn gen:agents` writes `.claude/agents/<name>.md` from each role in `docs/roles/` whose frontmatter says `subagent: true`, and deletes stale ones. With `--check` (verify step 16) it fails on drift instead.
- **Area:** `docs/roles/`, `.claude/agents/` (`tooling/gen-agents.ts`).
- **Trigger:** by hand after a role changes; verify step 16 as `--check`.
- **Scores:**
  - Importance **4.0**: a subagent that drifts from its role is a silent review defect (record 0008).
  - Token cost **0.5**: six lines.
  - Wall time **1.0**: 0.5 s.
  - Standard **1.0**: house.
- **Pros:**
  - One source per role.
- **Cons:**
  - None worth naming.
- **Verdict:** **keep.**

#### directory-map

- **What:** `yarn directory-map` writes `docs/_generated/directory-map.md` (every file under `docs/`, one line from its description) and the "In this folder" table at the foot of every folder's `README.md`. With `--check` (verify step 17) it fails if either is out of date, or if a folder has no README.
- **Area:** `docs/` (`tooling/directory-map.ts`).
- **Trigger:** by hand after any doc's description changes; verify step 17 as `--check`.
- **Scores:**
  - Importance **2.0**: the map is for people. Agents never load it, so drift costs a stale listing and nothing more.
  - Token cost **2.0**: it fails on any description edit, new file or new folder until someone regenerates. It is failing right now on another thread's runbook move.
  - Wall time **1.0**: 0.6 s.
  - Standard **1.0**: generated indexes are standard; committing them and failing CI on them is a choice.
- **Pros:**
  - Never hand-kept.
  - Every folder gets a README.
- **Cons:**
  - The most frequent reason a docs-only change fails verify, for an artifact no agent reads.
- **Verdict:** **keep the generator, simplify the check.** Have `apps/docs` render the map, or regenerate it in CI, instead of failing verify on it.

#### lint

- **What:** `yarn lint` runs each workspace's ESLint through Turbo with `--max-warnings 0`, using the shared configs in `packages/config/eslint/`: `base.js` (JavaScript and TypeScript rules, Turbo's undeclared-env rule) and `next.js` or `react-internal.js` (React, hooks, Next core-web-vitals). `apps/web`, `packages/ui` and `packages/catalog` also apply `tokens.js`, the token lint that bans raw colours, lengths, durations and palette utilities.
- **Area:** `apps/*`, `packages/*`.
- **Trigger:** verify step 18; verify:fast on affected workspaces.
- **Scores:**
  - Importance **5.5**: code quality, plus the design system's "only tokens" law (canon C-P06), which nothing else enforces.
  - Token cost **1.0**: 26 lines on a cache hit; each finding is one line with its fix.
  - Wall time **3.0**: 0.7 s cached (measured); 20–40 s cold (_estimate_).
  - Standard **6.5**: ESLint and its plugin configs are standard; the token rule is house.
- **Pros:**
  - The token lint's messages cite the canon rule and the fix.
- **Cons:**
  - Cold runs are slow.
- **Verdict:** **keep.**

#### lint:boundaries

- **What:** `yarn lint:boundaries` runs ESLint once from the root with `eslint.config.mjs`, which loads only the import-graph rules in `packages/config/eslint/boundaries.js` (resolved through `packages/config/eslint/workspace-resolver.cjs`). The graph says apps import packages, packages never import apps, each layer imports only its declared lower layers, and each vendor SDK has one owner.
- **Area:** every import in `apps/*` and `packages/*`.
- **Trigger:** verify step 19; verify:fast on changed code.
- **Scores:**
  - Importance **6.0**: the package boundary is architecture law, and an upward import grows silently.
  - Token cost **0.0**: silent on pass.
  - Wall time **3.0**: 4.4 s.
  - Standard **4.0**: eslint-plugin-boundaries is an established plugin; the zone map is house.
- **Pros:**
  - An undeclared edge is denied by default.
- **Cons:**
  - 344 lines of zone map, a one-way door that needs a Mason review to change.
- **Verdict:** **keep.**

#### test:boundaries

- **What:** `yarn test:boundaries` runs `tooling/boundaries.test.ts` on its own. It lints 52 probes as text through the root ESLint config.
- **Area:** the boundaries lint.
- **Trigger:** by hand; not in verify.
- **Scores:**
  - Importance **0.5**: `yarn test:tooling` already runs the same file in every verify.
  - Token cost **0.5**: a short TAP run.
  - Wall time **0.0**: run on purpose; 1.1 s.
  - Standard **4.0**: a plain `node --test` alias.
- **Pros:**
  - A quick way to run one file.
- **Cons:**
  - A script name for something `node --test <file>` already does.
- **Verdict:** **candidate to remove.**

#### check-types

- **What:** `yarn check-types` runs `tsc --noEmit` in each workspace through Turbo. It is the type check for `apps/*` and `packages/*`; `tooling/` has its own.
- **Area:** `apps/*`, `packages/*`.
- **Trigger:** verify step 20; verify:fast on affected workspaces.
- **Scores:**
  - Importance **6.5**: type errors are the cheapest bugs to catch.
  - Token cost **1.0**: 30 lines on a cache hit.
  - Wall time **3.0**: 0.7 s cached (measured); 15–30 s cold (_estimate_).
  - Standard **7.0**: tsc.
- **Pros:**
  - Standard and cached.
- **Cons:**
  - None worth naming.
- **Verdict:** **keep.**

#### check-types:tooling

- **What:** `yarn check-types:tooling` runs `tsc -p tooling` against `tooling/tsconfig.json`. Node runs the `.ts` files in `tooling/` by stripping their types without checking them, so this is their only type check.
- **Area:** `tooling/`.
- **Trigger:** verify step 21; verify:fast when tooling changes.
- **Scores:**
  - Importance **4.5**: without it a type error in a hook ships and fails at run time.
  - Token cost **0.0**: silent on pass.
  - Wall time **2.0**: 1.3 s.
  - Standard **6.0**: tsc.
- **Pros:**
  - Cheap.
- **Cons:**
  - None worth naming.
- **Verdict:** **keep.**

#### check-client-bundle

- **What:** `yarn check-client-bundle` builds `apps/web` with every server-only variable set to a unique sentinel, then fails if any sentinel appears in a browser chunk or a prerendered page. It also fails when `turbo.json` and `.env.example` disagree on the variable names.
- **Area:** `apps/web`, the environment seam (`tooling/check-client-bundle.ts`).
- **Trigger:** verify step 22.
- **Scores:**
  - Importance **6.0**: a server secret in a browser bundle is a security incident, and nothing else would see it.
  - Token cost **0.5**: one line.
  - Wall time **4.0**: 9.9 s; it is a second production build of `apps/web`, on top of `yarn build`.
  - Standard **1.0**: house; bundle secret-scanning is uncommon.
- **Pros:**
  - It proves the absence of a leak instead of assuming it.
- **Cons:**
  - A second build in every verify.
- **Verdict:** **keep.**

#### build

- **What:** `yarn build` runs every workspace's production build through Turbo. Today that is the two Next.js apps, `apps/web` and `apps/docs`.
- **Area:** `apps/*`.
- **Trigger:** verify step 23; by hand.
- **Scores:**
  - Importance **6.5**: a broken build is the last thing to learn at deploy.
  - Token cost **1.5**: 77 lines.
  - Wall time **4.0**: 8.8 s with `web` cached and `docs` rebuilt (measured); 20–30 s cold (_estimate_).
  - Standard **7.0**: Turbo and Next.js.
- **Pros:**
  - Standard.
- **Cons:**
  - Last in verify, so a build break is found after everything else has run.
  - `web#build` hashes `apps/web/.env*` (`apps/web/turbo.json`), the one place an env file feeds a cached output; the sandbox hides that file, so on a machine with a `.env.local` in `apps/web` this step alone runs outside the sandbox (EN-15).
- **Verdict:** **keep.**

### 3.5 Generators and setup run by hand

#### format

- **What:** `yarn format` runs Prettier in write mode over the same globs `yarn format:check` checks. It is the fix for a format failure.
- **Area:** every source and markdown file.
- **Trigger:** by hand.
- **Scores:**
  - Importance **3.0**: the fix for format:check; without it each file is formatted by hand.
  - Token cost **0.5**: a file list.
  - Wall time **0.0**: run on purpose (about 6 s).
  - Standard **7.0**: Prettier.
- **Pros:**
  - Standard.
- **Cons:**
  - It rewrites every file, other threads' files included, in a shared tree.
- **Verdict:** **keep.**

#### doctor

- **What:** `yarn doctor` checks that a machine is ready: Node and Yarn versions, corepack, `toolkit.json`, every registered hook script, the native git hooks, `.claude/settings.local.json` for secrets and accumulated rules, and the dev ports. Warnings never fail it.
- **Area:** the machine (`tooling/doctor.ts`).
- **Trigger:** by hand, after a clone or when something is odd.
- **Scores:**
  - Importance **2.5**: a convenience for onboarding.
  - Token cost **0.5**: a dozen lines.
  - Wall time **0.0**: 0.3 s, run on purpose.
  - Standard **3.0**: doctor commands are a common pattern.
- **Pros:**
  - Each failure prints its fix.
  - It reports a secret by kind, never by value.
- **Cons:**
  - Its git-hook warning shows on every run in this checkout.
- **Verdict:** **keep.**

#### migrate:assess

- **What:** `yarn migrate:assess <target> [--json]` prints how far a repo is from the practice, the report a migration's interview opens with: seventeen signals in four groups (shape, checks, conventions, process), each scored 0, 1 or 2 with its evidence, a total, the gate and the path (near, middle or far). It reads the target's tracked files through `git ls-files` and writes nothing there. Node built-ins only, so it runs from a toolkit checkout before the target installs anything. A signal whose detector has not landed is reported as not yet measured and left out of the total.
- **Area:** a target repo, read only (`tooling/migrate-assess.ts`, `tooling/lib/assess/`).
- **Trigger:** by hand, at the start of a migration (MIG epic).
- **Scores:**
  - Importance **3.0**: without it the interview starts from impressions, and a far repo can be walked down the near path.
  - Token cost **1.0**: about 45 lines, read once per migration.
  - Wall time **0.0**: run on purpose; 0.2 s on a 2,315-file repo.
  - Standard **1.0**: distance reports are common; the signals and thresholds are house.
- **Pros:**
  - Every score carries its evidence, and the thresholds are named constants.
  - Never walks a worktree or opens an env file.
- **Cons:**
  - The thresholds are calibrated on three repos.
- **Verdict:** **keep.**

### 3.6 The contract loop

#### contract:init

**[changing in the workflow overhaul]**

- **What:** `yarn contract:init` allocates the next ticket id and writes `contract.md` from the template. Run again on the filled contract, it checks the gates (decisions, pre-flight, dependencies), sets the tier and the required reviewers, freezes the criteria and writes every result at FAIL.
- **Area:** `specs/` (`tooling/contract.ts`, `tooling/lib/specs.ts`, `docs/engineering/templates/contract.template.md`).
- **Trigger:** the start of every ticket that has a contract, run by an agent.
- **Scores:**
  - Importance **5.0**: it is the start of the loop the repo runs on today.
  - Token cost **3.0**: a two-call ritual, and gate failures send the agent back to the contract.
  - Wall time **1.0**: _estimate_ under 1 s per call.
  - Standard **0.0**: house.
- **Pros:**
  - Criteria cannot shift after work starts.
- **Cons:**
  - 846 lines in `tooling/contract.ts` for five subcommands.
- **Verdict:** **keep until the overhaul lands.**

#### contract:run

**[changing in the workflow overhaul]**

- **What:** `yarn contract:run` runs a ticket's test and check criteria on a committed tree, and for each one records the command, exit code, time, HEAD, evidence log and the log's hash. It refuses while a planned path is dirty, and a lock serialises runs in one checkout.
- **Area:** `specs/`, plus whatever the criteria run (`tooling/contract.ts`).
- **Trigger:** by an agent to prove a ticket.
- **Scores:**
  - Importance **5.5**: the only writer of a test or check PASS with a run record behind it.
  - Token cost **4.0**: on a shared tree, other threads' dirty files block it, and the commit loop it demands costs turns. Criteria that run `yarn verify` bring verify's whole output.
  - Wall time **7.0**: it runs every criterion's command; one `yarn verify` criterion alone is over 100 s.
  - Standard **0.0**: house.
- **Pros:**
  - Evidence is tied to a commit and a hash.
- **Cons:**
  - Slow, and hostile to a shared checkout (see the shared-tree hygiene the threads follow).
- **Verdict:** **keep the run record; let the overhaul decide the rest.**

#### contract:record

**[changing in the workflow overhaul]**

- **What:** `yarn contract:record` records a capture or manual criterion against an evidence file. With `--verdict deferred` it hands a check only a person can do to Taylor; it then appears under Operator checks in `_status.md`.
- **Area:** `specs/` (`tooling/contract.ts`).
- **Trigger:** by an agent for evidence no command produces.
- **Scores:**
  - Importance **4.0**: the only route for screenshots and manual checks into results.
  - Token cost **1.0**: one line.
  - Wall time **0.5**: _estimate_ under 1 s.
  - Standard **0.0**: house.
- **Pros:**
  - Operator checks are visible in one list.
- **Cons:**
  - A deferred check reads as closed.
- **Verdict:** **keep until the overhaul lands.**

#### contract:add

**[changing in the workflow overhaul]**

- **What:** `yarn contract:add` adds a criterion, or a `review:<role>` criterion, at FAIL. It is the only way the frozen set grows.
- **Area:** `specs/` (`tooling/contract.ts`).
- **Trigger:** by hand or by an agent when scope grows.
- **Scores:**
  - Importance **2.5**: rare, but the alternative is hand-editing frozen results.
  - Token cost **0.5**: one line.
  - Wall time **0.5**: _estimate_ under 1 s.
  - Standard **0.0**: house.
- **Pros:**
  - Growth is recorded, never silent.
- **Cons:**
  - A long argument list.
- **Verdict:** **keep until the overhaul lands.**

#### contract:qa

**[changed in the workflow overhaul, PR-19: replaces `contract:tier`]**

- **What:** `yarn contract:qa <id> <Q0 | Q1 | Q2 | Q3> [--reviewers <role,role>]` sets a started ticket's QA level and reviewers as the operator asked. Nothing is computed. At Q3 each reviewer gets a `review:<role>` criterion; below Q3 the review criteria are dropped and the review happens in the thread.
- **Area:** `specs/` (`tooling/contract.ts`).
- **Trigger:** by an agent when the operator raises or lowers a ticket's level, or changes who reviews it.
- **Scores:**
  - Importance **3.0**: it decides how much review a change gets.
  - Token cost **0.5**: one line.
  - Wall time **0.5**: _estimate_ under 1 s.
  - Standard **0.0**: house.
- **Pros:**
  - The tier comes from paths, not from the builder's opinion.
- **Cons:**
  - All 24 reviewer globs in `toolkit.json` are still marked draft.
- **Verdict:** **keep until the overhaul lands.**

#### contract:built

- **What:** `yarn contract:built <id>` records `built_at` in `results.json` once the ticket's code is committed: the ticket reads "built" in `yarn status`, `_status.md` and the brief line until any criterion is recorded at or after that time, so a build pass awaiting harden is not mistaken for open work (audit R9). `contract:run` on a built ticket proceeds as on an open one, and every writer of `results.json` keeps the field.
- **Area:** `specs/` (`tooling/contract.ts`, `tooling/lib/specs.ts`).
- **Trigger:** by an agent at the end of a build pass.
- **Scores:**
  - Importance **2.0**: a status word; nothing is guarded by it.
  - Token cost **0.5**: one line.
  - Wall time **0.5**: _estimate_ under 1 s.
  - Standard **0.0**: house.
- **Pros:**
  - The hardening stage has its word without a new file.
- **Cons:**
  - A ticket marked built and then edited still reads built until a proof is recorded.
- **Verdict:** **keep while the hardening stage runs.**

#### cost

- **What:** `yarn cost <id>` and `yarn cost --epic <EPIC>` read the transcript folders Claude Code keeps for this repo and its worktrees (`~/.claude/projects/<slug>*`, or under `CLAUDE_CONFIG_DIR`) and print one line: calls, weighted tokens by category, cache read and output, context at the last main-thread call, threads touched, and the headless review runs on record with their cost. Rules, each named in the line: one call per message id across files (a resumed session's copies count once; a record with no usage or a `<synthetic>` error record is not a call); weights input 1, cache write 1.25, cache read 0.1, output 5 [model-blind estimate, not the meter]; a call belongs to the ticket last named in its thread by a work command or a spec-file edit, a resumed thread inheriting the ticket its copied history named [estimate]; category by the call's first tool, a reviewer subagent's calls as reviews; headless runs are a floor, the last run per review in `results.json`, outside the weighted total. The epic line adds how many calls belong to no ticket. Not a cost in money, and not a fair comparison across tickets built on different models. It keeps only usage, ids, timestamps, tool names and matched work-ids, never transcript text. `--record` writes the result as a `cost` block in `results.json` at close; `tk-batch`'s Cost line reads it (audit R4).
- **Area:** `specs/` and the transcript folders outside the repo (`tooling/cost.ts`; fixture `tooling/fixtures/specs/cost-transcripts/`).
- **Trigger:** by an agent at a ticket's close, unsandboxed (the folder is outside the repo).
- **Scores:**
  - Importance **2.5**: the only per-ticket cost on record; nothing breaks without it.
  - Token cost **1.0**: one line.
  - Wall time **1.0**: 1.9 s over this repo's transcripts (measured 2026-10-07).
  - Standard **0.0**: house.
- **Pros:**
  - Every ticket's cost sits in its folder, by the audits' own counting rule.
- **Cons:**
  - Attribution and the category of a call are heuristics; headless runs before the last per review are not on record.
  - Depends on Claude Code's transcript format, which is not a published interface.
- **Verdict:** **keep until the harness exposes per-session usage in the transcript's own folder** (R4's removal condition).

#### spec:init

- **What:** `yarn spec:init` starts an epic: `specs/<app>/epics/<EPIC>-<slug>/` with `brief.md` from the brief template and empty `prompts/`, `ux/` and `tickets/` folders. It refuses the protected branch and a prefix already in use.
- **Area:** `specs/` (`tooling/spec-init.ts`).
- **Trigger:** by hand or by an agent at the start of an epic.
- **Scores:**
  - Importance **2.5**: easy to do by hand; its value is the unique prefix.
  - Token cost **0.5**: one line.
  - Wall time **0.0**: run on purpose.
  - Standard **0.0**: house.
- **Pros:**
  - 72 lines.
- **Cons:**
  - The overhaul's list leaves it out, but it writes the epic layout the overhaul is rewriting (judgment).
- **Verdict:** **keep;** check it against the overhaul's layout.

#### review:run

**[changing in the workflow overhaul]**

- **What:** `yarn review:run` starts a reviewer as `claude -p` with Read, Grep and Glob only, prompted from the contract, results and evidence index rather than the builder's words, and records its verdict as `review-<role>.md` and `review:<role>`. Its `vigil <EPIC>` form pre-flights an epic's drafted tickets. Since 2026-10-07 (the audit's C3) the ticket prompt is single-pass and scoped: it tells the reviewer this is the only pass unless it FAILs, so every finding is listed now; it judges the planned-path changes against the criteria and non-negotiables; it follows an import one hop out of a changed file only to confirm a Blocking; Should-fix and Consider findings become follow-ups and never reopen the review; the as-built is a claim to check inside the changed files. Calibrated once against the open-ended prompt, both run as Warden on STK-21 at `6960357`: `specs/_shared/reports/2026-10-07-reviewer-prompt-calibration.md`.
- **What it records of the cost (2026-10-06, the audit's O4 and Y5):** the headless result's `usage` is kept, and `tokens_input`, `tokens_cache_read`, `tokens_cache_write`, `tokens_output` and `seconds` (the process's wall clock, measured by the script) are written into the review file's header and the `review:<role>` run record; the pre-flight file's header carries the same five. A guard that stops a ticket review before the reviewer runs appends `{ at, reason }` to the criterion's `refused` list in `results.json`; one that stops the pre-flight adds a `- refused: <at>: <reason>` line to `_preflight.md`'s header, kept across later runs. `yarn status <id>` prints one line per recorded review with its cost, and one per refused attempt. The field names have one home, `COST_FIELDS` in `tooling/lib/specs.ts`, and the schema is `docs/engineering/schemas/results.schema.json`.
- **Area:** `specs/`, the generated subagents (`tooling/review-run.ts`).
- **Trigger:** by an agent for each reviewer the operator confirmed on a Q3 ticket (PR-19); below Q3 a review happens in the thread, without this command.
- **Scores:**
  - Importance **5.0**: the builder never grades its own work, and the reviewer's tools are read-only by construction.
  - Token cost **6.0**: each review is a full model session (_estimate_ tens of thousands of tokens per role per ticket, billed). It needs the network, so it runs outside the sandbox. A PASS is final for its round (WEB-12): a planned-path or as-built change no longer reruns it, only a criteria change does; a second run is allowed only after a FAIL and a third needs `--operator "<reason>"`.
  - Wall time **7.0**: _estimate_ minutes per review.
  - Standard **1.0**: model-as-reviewer is emerging practice; this wiring is house.
- **Pros:**
  - The separation of builder and judge is structural, not requested.
- **Cons:**
  - The most expensive tool in the repo per use.
  - By its own header, it proves a review ran, not that the review was independent.
- **Verdict:** **keep the principle; let the overhaul decide when it runs.**

#### status

**[changing in the workflow overhaul]**

- **What:** `yarn status` regenerates `specs/_status.md` from the specs tree. `yarn status <id>` prints what is left on one item, and is, with `check-specs --strict`, the one place a rewritten evidence log or (at Q3) a later commit is shown. `--brief` prints one line for the hooks: the tickets in build (open, built, proven, closing) and the drafts; it omits closed and migration-pending tickets and never reads staleness, so a rewritten log never moves a closed ticket back into the line (PR-19; the audit's C7). `--deviations` and `--epic` print the as-built deviations and an epic's build order. A ticket `yarn contract:built` marked reads "built" (code in, criteria unrecorded, awaiting harden) until a criterion is recorded after it (audit R9), and `yarn status <id>` prints the cost block `yarn cost <id> --record` wrote (R4).
- **Area:** `specs/` (`tooling/status.ts`).
- **Trigger:** by hand; `--brief` by session-start on every start and by stop-gate on every stop where the tree changed (an unchanged stop reuses the stored line).
- **Scores:**
  - Importance **4.0**: the generated answer to "what is in flight", read by both hooks.
  - Token cost **2.0**: its brief line goes into every session's context.
  - Wall time **3.0**: 5.2 s for `--brief` alone (measured 2026-10-06), paid at every session start and every stop on a changed tree.
  - Standard **0.0**: house.
- **Pros:**
  - Never hand-kept.
- **Cons:**
  - Slow for a status line.
  - It recomputes staleness across every ticket each time.
- **Verdict:** **keep, and make `--brief` fast** in the overhaul.

#### truth:promote

**[changing in the workflow overhaul]**

- **What:** `yarn truth:promote` copies an epic's approved UX proposals into the living truth under `specs/<app>/ux/` once every ticket citing them is closed. It stamps each promoted proposal with the date.
- **Area:** `specs/` (`tooling/truth-promote.ts`).
- **Trigger:** by hand when an epic ships.
- **Scores:**
  - Importance **1.0**: never run: no proposal in the repo carries a `promoted:` date, and no app has a `ux/` folder yet.
  - Token cost **0.5**: one line.
  - Wall time **0.0**: run on purpose; _estimate_ under 1 s.
  - Standard **0.0**: house.
- **Pros:**
  - 89 lines.
- **Cons:**
  - Untested in real use.
- **Verdict:** **candidate to remove;** hand it to the overhaul.

### 3.7 Dev servers and app scripts

Scores here are one line each: importance, token cost, wall time, standard, each with its reason.

#### dev

- **What:** `yarn dev` starts both apps' dev servers through Turbo (`web` on :3000, `docs` on :3001). It runs until stopped.
- **Area:** `apps/*`.
- **Trigger:** by a person; agents use the browser pane's launcher instead.
- **Scores:** importance **3.0** (the everyday way to see both apps) · token **0.0** (a person reads its output) · wall **0.0** (long-running on purpose) · standard **7.0** (Turbo and Next.js).
- **Pros:**
  - Standard.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### web:dev

- **What:** `yarn web:dev` starts the `apps/web` dev server alone, on :3000. It runs until stopped.
- **Area:** `apps/web`.
- **Trigger:** by a person or the preview launcher.
- **Scores:** importance **3.0** (the demo app's dev loop) · token **0.0** (a person reads its output) · wall **0.0** (long-running on purpose) · standard **7.0** (Turbo and Next.js).
- **Pros:**
  - Standard.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### web:dev:local

- **What:** `yarn web:dev:local` prints the LAN addresses a phone can open (`tooling/print-local-urls.ts`). It then starts the web dev server bound to every interface.
- **Area:** `apps/web`, testing on a real phone.
- **Trigger:** by a person.
- **Scores:** importance **1.5** (phone testing only) · token **0.0** (a person reads its output) · wall **0.0** (long-running on purpose) · standard **2.0** (house wiring around a Next.js flag).
- **Pros:**
  - One command for a fiddly setup.
- **Cons:**
  - The dev server answers on the whole network while it runs.
- **Verdict:** **keep.**

#### print-local-urls

- **What:** `tooling/print-local-urls.ts` prints `http://<lan-ip>:<port>` for each LAN address of the machine. `yarn web:dev:local` runs it before it starts the server.
- **Area:** `apps/web` dev.
- **Trigger:** `yarn web:dev:local`.
- **Scores:** importance **1.0** (a convenience) · token **0.0** (a person reads it) · wall **0.0** (milliseconds) · standard **1.0** (house).
- **Pros:**
  - 26 lines.
- **Cons:**
  - None.
- **Verdict:** **keep** while `web:dev:local` exists.

#### local-dev-origins

- **What:** `tooling/local-dev-origins.ts` lists the machine's LAN IPv4 addresses for `allowedDevOrigins` in `apps/web/next.config.ts`. Without it, Next.js 16 blocks a phone's client JavaScript in dev and the page never hydrates.
- **Area:** `apps/web` dev configuration.
- **Trigger:** every `apps/web` dev or build start, through `apps/web/next.config.ts`.
- **Scores:** importance **2.0** (phone testing breaks without it) · token **0.0** (no output) · wall **0.0** (microseconds) · standard **2.0** (a house helper for a Next.js setting).
- **Pros:**
  - It never throws.
  - A failure yields an empty list.
- **Cons:**
  - An app imports from `tooling/` by relative path, an edge the boundaries lint does not model.
- **Verdict:** **keep;** consider moving it into `apps/web`, so the app does not reach into `tooling/`.

#### web:build

- **What:** `yarn web:build` runs the production build of `apps/web` alone. It is `yarn build` filtered to one app.
- **Area:** `apps/web`.
- **Trigger:** by hand.
- **Scores:** importance **2.0** (`yarn build` covers it) · token **1.0** (the build log) · wall **0.0** (run on purpose; _estimate_ 10–20 s cold) · standard **7.0** (Turbo and Next.js).
- **Pros:**
  - Faster than building both apps.
- **Cons:**
  - A second name for a Turbo filter.
- **Verdict:** **keep;** it costs nothing to have.

#### docs:dev

- **What:** `yarn docs:dev` starts the `apps/docs` dev server on :3001. It renders `docs/` in a browser.
- **Area:** `apps/docs`.
- **Trigger:** by a person.
- **Scores:** importance **2.0** (reading the practice in a browser) · token **0.0** (a person reads its output) · wall **0.0** (long-running on purpose) · standard **7.0** (Turbo and Next.js).
- **Pros:**
  - Standard.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### docs:build

- **What:** `yarn docs:build` runs the production build of `apps/docs` alone. It is `yarn build` filtered to one app.
- **Area:** `apps/docs`.
- **Trigger:** by hand.
- **Scores:** importance **1.5** (`yarn build` covers it) · token **1.0** (the build log) · wall **0.0** (run on purpose; 8.8 s, measured inside `yarn build`) · standard **7.0** (Turbo and Next.js).
- **Pros:**
  - A quick check of the docs app.
- **Cons:**
  - A second name for a Turbo filter.
- **Verdict:** **keep.**

#### ui:storybook

- **What:** `yarn ui:storybook` starts Storybook for `@pem/ui` on :6006. It is the component workshop where the kit and the catalog are browsed by source.
- **Area:** `packages/ui`, `packages/catalog`.
- **Trigger:** by a person.
- **Scores:** importance **3.0** (the only place to browse the catalog) · token **0.0** (a person reads its output) · wall **0.0** (long-running on purpose) · standard **6.0** (Storybook).
- **Pros:**
  - Standard tool.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### shadcn

- **What:** `yarn shadcn` runs the shadcn CLI inside `@pem/ui`. It copies a component in from a ruled registry.
- **Area:** `packages/ui`.
- **Trigger:** by hand or by an agent adding a component (the `shadcn` skill).
- **Scores:** importance **2.5** (the sanctioned copy-in path) · token **0.5** (a short CLI log) · wall **0.0** (run on purpose) · standard **6.0** (the shadcn CLI).
- **Pros:**
  - Runs in the right package.
- **Cons:**
  - Copies code that the token lint then makes someone clean.
- **Verdict:** **keep.**

#### stripe:listen

- **What:** `yarn stripe:listen` forwards Stripe's test-mode webhooks to `localhost:3000/api/webhooks/stripe`, so billing can be exercised locally. It needs the Stripe CLI.
- **Area:** billing in `apps/web`.
- **Trigger:** by a person.
- **Scores:** importance **2.0** (local billing tests) · token **0.0** (a person reads its output) · wall **0.0** (long-running on purpose) · standard **6.5** (the Stripe CLI).
- **Pros:**
  - One line to remember instead of a URL.
- **Cons:**
  - None.
- **Verdict:** **keep.**

### 3.8 Database scripts (`@pem/db`)

All of these forward to `packages/db`. bash-guard and the permissions ask before `db:migrate`, `db:setup`, `db:seed-users` and `db:local:reset` (D-STK-18), and block any other reset or drop.

#### test:db

- **What:** `yarn test:db` runs `packages/db/test/` against a real local Postgres, one file at a time. The files cover the row-level security policies, the local auth mirror, the reset script and the Stripe event ledger. On any tier but local it exits in its first line, naming both ways to get a local database, before a test file loads.
- **Area:** `packages/db`.
- **Trigger:** by hand, after `yarn db:setup:local` on the developer's own Postgres, or with Docker's running (`docs/runbooks/add/docker-local-database.md`). It is not in verify or CI.
- **Scores:** importance **4.0** (the only proof the SQL and its policies work on a real database) · token **1.5** (a TAP run) · wall **0.0** (run on purpose; _estimate_ 5–20 s) · standard **6.0** (`node:test` against a real database).
- **Pros:**
  - No mocks.
- **Cons:**
  - It proves only what someone remembered to run.
- **Verdict:** **keep.**

#### db:local

- **What:** `yarn db:local` starts the local Supabase database through the Supabase CLI. The database is off by default: on any tier but local it refuses in its first line, naming the add recipe. It warns when the port is bound beyond loopback (EN-13).
- **Area:** `packages/db`.
- **Trigger:** by a person or an agent before database work.
- **Scores:** importance **3.5** (the local database the other scripts need) · token **1.0** (a startup log) · wall **0.0** (run on purpose) · standard **5.0** (the Supabase CLI, wrapped).
- **Pros:**
  - It warns on network exposure.
- **Cons:**
  - The CLI publishes the port on every interface.
- **Verdict:** **keep.**

#### db:local:full

- **What:** `yarn db:local:full` starts the full local Supabase stack, auth included, not just Postgres. Auth work needs it. Like `db:local`, it refuses any tier but local in its first line.
- **Area:** `packages/db`, `packages/auth`.
- **Trigger:** by a person, for auth work.
- **Scores:** importance **2.5** (auth work needs it) · token **1.0** (a startup log) · wall **0.0** (run on purpose) · standard **5.0** (the Supabase CLI, wrapped).
- **Pros:**
  - One command for the full stack.
- **Cons:**
  - Heavier than most work needs.
- **Verdict:** **keep.**

#### db:stop

- **What:** `yarn db:stop` stops the local Supabase stack. With `--no-backup` it also wipes the local data, including any mirrored staging emails.
- **Area:** `packages/db`.
- **Trigger:** by a person.
- **Scores:** importance **2.5** (also the way to wipe mirrored personal data) · token **0.0** (one line) · wall **0.0** (run on purpose) · standard **6.0** (`supabase stop`).
- **Pros:**
  - The plain CLI.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### db:local:reset

- **What:** `yarn db:local:reset` rebuilds the local database from the migrations. It refuses an unset tier and anything but a local database, and bash-guard asks first.
- **Area:** `packages/db`.
- **Trigger:** by a person, or an agent with approval.
- **Scores:** importance **2.0** (the one sanctioned reset) · token **0.5** (a short log) · wall **0.0** (run on purpose) · standard **3.0** (a house script).
- **Pros:**
  - Local only.
- **Cons:**
  - Destructive by nature.
- **Verdict:** **keep.**

#### db:generate

- **What:** `yarn db:generate` runs `drizzle-kit generate`. It writes a new migration from the schema.
- **Area:** `packages/db`.
- **Trigger:** by an agent or a person after a schema change.
- **Scores:** importance **4.0** (the only sanctioned way to write a migration) · token **0.5** (a short log) · wall **0.0** (run on purpose) · standard **7.0** (drizzle-kit).
- **Pros:**
  - Standard.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### db:migrate

- **What:** `yarn db:migrate` applies pending migrations to the database the tier names; an unset tier, or a hosted tier with no URL of its own, is refused in one line. bash-guard and the permissions both ask first.
- **Area:** `packages/db`.
- **Trigger:** by a person, or an agent with approval.
- **Scores:** importance **4.0** (applying a migration is a one-way door) · token **0.5** (a short log) · wall **0.0** (run on purpose) · standard **5.0** (drizzle migrations, wrapped).
- **Pros:**
  - The tier picks the database.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### db:setup

- **What:** `yarn db:setup` prepares a new database for the app: the migrations plus the setup the app expects. It asks first.
- **Area:** `packages/db`.
- **Trigger:** by a person, for a new environment.
- **Scores:** importance **3.0** (one command per new environment) · token **0.5** (a short log) · wall **0.0** (run on purpose) · standard **3.0** (a house script).
- **Pros:**
  - Repeatable.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### db:setup:local

- **What:** `yarn db:setup:local` prepares a Postgres on this machine as the local tier's database, with no Docker and no Supabase project: it creates the database the `_LOCAL` URL names, applies `packages/db/supabase/local-shim.sql` (the roles and the `auth.users` table Supabase's own image provides), then the migrations and the setup SQL, and marks the database as a local auth mirror target. Idempotent. It refuses an unset or hosted tier and any URL that is not this machine before connecting, and it asks first.
- **Area:** `packages/db`.
- **Trigger:** by a person, or an agent with approval, once per machine; again after `yarn db:generate` adds a migration (`yarn db:migrate` does that too).
- **Scores:** importance **4.0** (the default local database; without it the local tier has nothing to connect to) · token **0.5** (a short log) · wall **0.0** (run on purpose; _estimate_ 2–5 s) · standard **3.0** (a house script).
- **Pros:**
  - No Docker, no account: Postgres.app or Homebrew and one command.
- **Cons:**
  - The shim is a stand-in for Supabase's auth schema: sign-in itself needs a Supabase project (Mode A) or Docker's full stack (Mode B).
- **Verdict:** **keep.**

#### db:seed-users

- **What:** `yarn db:seed-users` creates synthetic users in the local database. It asks first.
- **Area:** `packages/db`, `packages/auth`.
- **Trigger:** by a person.
- **Scores:** importance **2.0** (test users for local work) · token **0.5** (a short log) · wall **0.0** (run on purpose) · standard **3.0** (a house script).
- **Pros:**
  - Synthetic data only.
- **Cons:**
  - None.
- **Verdict:** **keep.**

### 3.9 Shared libraries in `tooling/lib/`

#### lib/docs.ts

- **What:** the markdown and frontmatter reader, the file lister and the repo root that most tooling scripts share. It also holds the token estimate (characters ÷ 4) that every budget uses.
- **Area:** `tooling/lib/docs.ts`, imported by 30 tooling files.
- **Trigger:** imported.
- **Scores:** importance **4.0** (lint:docs, budget, gen:agents, directory-map and check-refs all stand on it) · token **0.0** (no output) · wall **0.0** (a library) · standard **1.0** (house, over the `yaml` package).
- **Pros:**
  - One home for the token estimate.
- **Cons:**
  - The estimate is coarse.
- **Verdict:** **keep.**

#### lib/git.ts

- **What:** the read-only git facts the loop needs: the base ref, the merge-base, changed and dirty files, and a file's contents on a ref. It also names the native hooks path.
- **Area:** `tooling/lib/git.ts`, imported by 10 files.
- **Trigger:** imported.
- **Scores:** importance **4.0** (verify:fast, check-specs, check-test-weakening and check-refs need it) · token **0.0** (no output) · wall **0.0** (a library) · standard **1.0** (house).
- **Pros:**
  - Read-only by rule.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### lib/toolkit.ts

- **What:** loads and validates `toolkit.json` (apps, prefixes, specs root, reviewers, stack modules). It fails loudly and names the missing key.
- **Area:** `tooling/lib/toolkit.ts`, imported by 12 scripts.
- **Trigger:** imported.
- **Scores:** importance **5.0** (every layout fact comes through it) · token **0.0** (no output unless a key is missing) · wall **0.0** (a library) · standard **1.0** (house).
- **Pros:**
  - One home for layout facts.
- **Cons:**
  - 368 lines, a third of them the stack validator.
- **Verdict:** **keep.**

#### lib/work-ids.ts

- **What:** which work-ids a commit may open with (the toolkit, app and epic prefixes), and whether a branch is an agent branch. It uses Node built-ins only, so the hooks start fast.
- **Area:** `tooling/lib/work-ids.ts`, used by bash-guard and both git hooks.
- **Trigger:** imported.
- **Scores:** importance **3.0** (the commit rule's one home) · token **0.0** (no output) · wall **0.0** (a library) · standard **1.0** (house).
- **Pros:**
  - One law for both hook families.
- **Cons:**
  - It goes if the commit-work-id rule goes.
- **Verdict:** **keep** while the commit rule stays.

#### lib/specs.ts

**[changing in the workflow overhaul]**

- **What:** the work loop's model: where tickets and epics live, the contract and results shapes, evidence types, tiers and reviewers. It also holds the staleness rule and the hashing behind every recorded PASS.
- **Area:** `tooling/lib/specs.ts`, imported by the five contract-family scripts, spec-init and check-test-weakening.
- **Trigger:** imported.
- **Scores:** importance **5.0** (the whole loop reads the tree through it) · token **0.0** (no output of its own) · wall **0.0** (a library; its callers carry the time) · standard **0.0** (house).
- **Pros:**
  - One home for the layout and the staleness rule.
- **Cons:**
  - 1,251 lines, the largest file in `tooling/`.
- **Verdict:** **rewritten by the overhaul.**

#### lib/json-schema.ts

- **What:** a dependency-free validator for the subset of JSON Schema the toolkit's schema files use. It refuses any keyword it does not support.
- **Area:** `tooling/lib/json-schema.ts`. Its only importer is `tooling/lib/specs.ts`.
- **Trigger:** imported by check-specs and the contract loop.
- **Scores:** importance **2.5** (contracts and results are checked against `docs/engineering/schemas/`) · token **0.0** (no output) · wall **0.0** (a library) · standard **2.0** (JSON Schema is standard; a hand-rolled validator is not, and record 0003 rules out the dependency).
- **Pros:**
  - No dependency.
- **Cons:**
  - 128 lines that ajv would replace.
- **Verdict:** **keep while lib/specs.ts uses it.** Its only consumer is changing, so the overhaul decides.

#### lib/scratch-repo.ts

- **What:** the contract loop's test harness. It builds a scratch git repo in `$TMPDIR` with a copy of `tooling/`, and runs the loop's scripts as subprocesses, with a fixture script standing in for the reviewer.
- **Area:** `tooling/lib/scratch-repo.ts`, used by the four contract tests and `tooling/check-refs.test.ts`.
- **Trigger:** imported by `yarn test:tooling`.
- **Scores:** importance **2.5** (the contract tests need it) · token **0.0** (no output of its own) · wall **5.0** (its scratch repos are why the four contract tests take 88 s run one at a time) · standard **1.0** (house).
- **Pros:**
  - Real git, no mocks.
- **Cons:**
  - The slowest harness in the repo.
- **Verdict:** **keep while the contract tests exist;** its users are changing.

### 3.10 Configuration files in `tooling/`

#### tooling/package.json

- **What:** it marks `tooling/` as an ES module package. Node therefore runs every `.ts` file there as ESM.
- **Area:** `tooling/package.json`.
- **Trigger:** every `node tooling/…` call.
- **Scores:** importance **3.0** (without it every import in `tooling/` breaks) · token **0.0** (no output) · wall **0.0** (none) · standard **6.0** (a standard `type` field).
- **Pros:**
  - Four lines.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### tooling/tsconfig.json

- **What:** the TypeScript settings for `tooling/`: NodeNext modules, `.ts` imports allowed, no emit. `yarn check-types:tooling` checks the folder against them.
- **Area:** `tooling/tsconfig.json`.
- **Trigger:** `yarn check-types:tooling`.
- **Scores:** importance **3.0** (the tooling type check reads it) · token **0.0** (no output) · wall **0.0** (none) · standard **6.0** (a standard tsconfig over the shared base).
- **Pros:**
  - Extends the shared base.
- **Cons:**
  - None.
- **Verdict:** **keep.**

#### tooling/refs-pending.json

- **What:** the references check-refs lets stay missing, each with the phase that lands it: 40 entries today. An entry that now exists fails the check, so the list only shrinks.
- **Area:** `tooling/refs-pending.json`.
- **Trigger:** `yarn check-refs`.
- **Scores:** importance **2.0** (it lets the docs name planned work without failing verify) · token **0.5** (check-refs prints its reasons on every pass) · wall **0.0** (none) · standard **0.5** (house).
- **Pros:**
  - It only shrinks.
- **Cons:**
  - Seven entries are stale ruling text "held for Taylor (PR-05)", waiting on a person rather than a phase.
- **Verdict:** **keep.** Clear the seven PR-05 entries when Taylor rules on them.

## 4. Weakest first

Net = importance − (token cost + wall time) ÷ 2, lowest first. A low net with a high importance (verify, contract:run) means simplify. A low net with a low importance means cut.

<!-- tooling-table -->

|   # | Entry                     | Importance | Token | Wall |  Net | Verdict                                                      |
| --: | ------------------------- | ---------: | ----: | ---: | ---: | ------------------------------------------------------------ |
|   1 | pre-commit                |        1.0 |   2.0 |  3.0 | -1.5 | candidate to remove                                          |
|   2 | review:run †              |        5.0 |   6.0 |  7.0 | -1.5 | keep the principle; let the overhaul decide when it runs     |
|   3 | test:tooling              |        5.0 |   5.0 |  6.0 | -0.5 | keep but simplify                                            |
|   4 | lib/scratch-repo.ts       |        2.5 |   0.0 |  5.0 |  0.0 | keep while the contract tests exist                          |
|   5 | verify:fast               |        4.0 |   2.0 |  6.0 |  0.0 | keep                                                         |
|   6 | contract:run †            |        5.5 |   4.0 |  7.0 |  0.0 | keep the run record; let the overhaul decide the rest        |
|   7 | test:boundaries           |        0.5 |   0.5 |  0.0 |  0.3 | candidate to remove                                          |
|   8 | commit-msg                |        1.0 |   0.5 |  0.5 |  0.5 | candidate to remove                                          |
|   9 | directory-map             |        2.0 |   2.0 |  1.0 |  0.5 | keep the generator, simplify the check                       |
|  10 | session-start             |        3.0 |   2.0 |  3.0 |  0.5 | keep but simplify                                            |
|  11 | verify                    |        7.0 |   6.0 |  7.0 |  0.5 | keep but simplify                                            |
|  12 | truth:promote †           |        1.0 |   0.5 |  0.0 |  0.8 | candidate to remove                                          |
|  13 | hooks:install             |        1.0 |   0.0 |  0.0 |  1.0 | candidate to remove                                          |
|  14 | print-local-urls          |        1.0 |   0.0 |  0.0 |  1.0 | keep                                                         |
|  15 | docs:build                |        1.5 |   1.0 |  0.0 |  1.0 | keep                                                         |
|  16 | web:dev:local             |        1.5 |   0.0 |  0.0 |  1.5 | keep                                                         |
|  17 | web:build                 |        2.0 |   1.0 |  0.0 |  1.5 | keep                                                         |
|  18 | status †                  |        4.0 |   2.0 |  3.0 |  1.5 | keep, and make `--brief` fast                                |
|  19 | stop-gate                 |        5.0 |   3.0 |  4.0 |  1.5 | keep but simplify                                            |
|  20 | check-specs †             |        6.0 |   5.0 |  4.0 |  1.5 | keep the run-record integrity; let the overhaul cut the rest |
|  21 | test                      |        6.5 |   6.0 |  4.0 |  1.5 | keep but simplify                                            |
|  22 | contract:built            |        2.0 |   0.5 |  0.5 |  1.5 | keep while the hardening stage runs                          |
|  23 | cost                      |        2.5 |   1.0 |  1.0 |  1.5 | keep until the harness exposes per-session usage             |
|  24 | db:local:reset            |        2.0 |   0.5 |  0.0 |  1.8 | keep                                                         |
|  25 | db:seed-users             |        2.0 |   0.5 |  0.0 |  1.8 | keep                                                         |
|  26 | tooling/refs-pending.json |        2.0 |   0.5 |  0.0 |  1.8 | keep                                                         |
|  27 | check-ui-layout           |        2.5 |   0.5 |  1.0 |  1.8 | keep                                                         |
|  28 | docs:dev                  |        2.0 |   0.0 |  0.0 |  2.0 | keep                                                         |
|  29 | local-dev-origins         |        2.0 |   0.0 |  0.0 |  2.0 | keep                                                         |
|  30 | stripe:listen             |        2.0 |   0.0 |  0.0 |  2.0 | keep                                                         |
|  31 | contract:add †            |        2.5 |   0.5 |  0.5 |  2.0 | keep until the overhaul lands                                |
|  32 | db:local:full             |        2.5 |   1.0 |  0.0 |  2.0 | keep                                                         |
|  33 | contrast-audit            |        4.0 |   3.0 |  1.0 |  2.0 | keep but simplify                                            |
|  34 | doctor                    |        2.5 |   0.5 |  0.0 |  2.3 | keep                                                         |
|  35 | shadcn                    |        2.5 |   0.5 |  0.0 |  2.3 | keep                                                         |
|  36 | spec:init                 |        2.5 |   0.5 |  0.0 |  2.3 | keep                                                         |
|  37 | check-catalog             |        3.0 |   0.5 |  1.0 |  2.3 | keep                                                         |
|  38 | format:check              |        4.0 |   0.5 |  3.0 |  2.3 | keep                                                         |
|  39 | db:stop                   |        2.5 |   0.0 |  0.0 |  2.5 | keep                                                         |
|  40 | lib/json-schema.ts        |        2.5 |   0.0 |  0.0 |  2.5 | keep while lib/specs.ts uses it                              |
|  41 | contract:qa †             |        3.0 |   0.5 |  0.5 |  2.5 | keep until the overhaul lands                                |
|  42 | migrate:assess            |        3.0 |   1.0 |  0.0 |  2.5 | keep                                                         |
|  43 | results-gate †            |        3.5 |   1.0 |  1.0 |  2.5 | keep until the overhaul lands                                |
|  44 | check-refs                |        4.0 |   1.0 |  2.0 |  2.5 | keep                                                         |
|  45 | db:setup                  |        3.0 |   0.5 |  0.0 |  2.8 | keep                                                         |
|  46 | format                    |        3.0 |   0.5 |  0.0 |  2.8 | keep                                                         |
|  47 | session-state             |        3.0 |   0.0 |  0.5 |  2.8 | keep                                                         |
|  48 | check-reviewers           |        3.5 |   0.5 |  1.0 |  2.8 | keep                                                         |
|  49 | check-stack               |        3.5 |   0.5 |  1.0 |  2.8 | keep                                                         |
|  50 | test:hooks                |        5.0 |   0.5 |  4.0 |  2.8 | keep but simplify                                            |
|  51 | dev                       |        3.0 |   0.0 |  0.0 |  3.0 | keep                                                         |
|  52 | lib/work-ids.ts           |        3.0 |   0.0 |  0.0 |  3.0 | keep                                                         |
|  53 | tooling/package.json      |        3.0 |   0.0 |  0.0 |  3.0 | keep                                                         |
|  54 | tooling/tsconfig.json     |        3.0 |   0.0 |  0.0 |  3.0 | keep                                                         |
|  55 | ui:storybook              |        3.0 |   0.0 |  0.0 |  3.0 | keep                                                         |
|  56 | web:dev                   |        3.0 |   0.0 |  0.0 |  3.0 | keep                                                         |
|  57 | db:local                  |        3.5 |   1.0 |  0.0 |  3.0 | keep                                                         |
|  58 | contract:init †           |        5.0 |   3.0 |  1.0 |  3.0 | keep until the overhaul lands                                |
|  59 | check-migrations          |        4.0 |   0.5 |  1.0 |  3.3 | keep                                                         |
|  60 | contract:record †         |        4.0 |   1.0 |  0.5 |  3.3 | keep until the overhaul lands                                |
|  61 | gen:agents                |        4.0 |   0.5 |  1.0 |  3.3 | keep                                                         |
|  62 | lint:docs                 |        4.0 |   0.5 |  1.0 |  3.3 | keep                                                         |
|  63 | test:db                   |        4.0 |   1.5 |  0.0 |  3.3 | keep                                                         |
|  64 | check-test-weakening      |        4.5 |   1.0 |  1.0 |  3.5 | keep                                                         |
|  65 | check-types:tooling       |        4.5 |   0.0 |  2.0 |  3.5 | keep                                                         |
|  66 | lint                      |        5.5 |   1.0 |  3.0 |  3.5 | keep                                                         |
|  67 | db:generate               |        4.0 |   0.5 |  0.0 |  3.8 | keep                                                         |
|  68 | db:migrate                |        4.0 |   0.5 |  0.0 |  3.8 | keep                                                         |
|  69 | check-client-bundle       |        6.0 |   0.5 |  4.0 |  3.8 | keep                                                         |
|  70 | build                     |        6.5 |   1.5 |  4.0 |  3.8 | keep                                                         |
|  71 | lib/docs.ts               |        4.0 |   0.0 |  0.0 |  4.0 | keep                                                         |
|  72 | lib/git.ts                |        4.0 |   0.0 |  0.0 |  4.0 | keep                                                         |
|  73 | budget                    |        5.0 |   1.0 |  1.0 |  4.0 | keep                                                         |
|  74 | lint:boundaries           |        6.0 |   0.0 |  3.0 |  4.5 | keep                                                         |
|  75 | check-types               |        6.5 |   1.0 |  3.0 |  4.5 | keep                                                         |
|  76 | check-settings            |        5.5 |   0.5 |  1.0 |  4.8 | keep                                                         |
|  77 | bash-guard                |        6.0 |   1.5 |  1.0 |  4.8 | keep but simplify                                            |
|  78 | lib/specs.ts †            |        5.0 |   0.0 |  0.0 |  5.0 | rewritten by the overhaul                                    |
|  79 | lib/toolkit.ts            |        5.0 |   0.0 |  0.0 |  5.0 | keep                                                         |

† Changing in the workflow overhaul.
