---
title: Changelog — amendments to the practice
description: Read before changing any practice file, to see what changed, when, why, and which ledger updates and open items are waiting for sign-off.
layer: decisions
status: adopted
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# Changelog

Amendments to files in the practice, newest first (CF-06). A ruling's one-line form is in [`ledger.md`](ledger.md); a reason that needs more than a line is a [record](records/). Each layer file also keeps its own changelog section (`canon.md`, `workflow.md`, `skills.md`).

## 2026-10-02 — PJ: the engineering layer (Lorimer), in progress on `agent/PJ`

One entry for the whole thread, added to step by step. Baseline before any change (`yarn budget`, commit `eef5b86`): always-on 3,320 of 4,000 tokens; `AGENTS.md` 64 lines, `CLAUDE.md` 13, `docs/index.md` 79; UI build 7,399 of 15,000; non-UI build 4,234 of 7,000; critic pass 2,043 of 6,000.

### Filed (Phase 1)

- **Intake.** The inputs arrived in `docs/_files_dump/` and are committed as received in `3e58eae`, with the engineering role files from the eng-roles thread. Every move below is in `docs/_generated/filing-manifest.json`, which now carries a `source_commit` per entry; bodies are verified by hash.
- **Archived, byte for byte:** the PJ report ([`pj-engineering-layer-lorimer.md`](../research/pj-engineering-layer-lorimer.md)) and the owner's conventions with amendments A4 to A12 ([`pj-conventions-locked.md`](../research/pj-conventions-locked.md)). `docs/research/` is already ignored by Prettier as a folder, so neither needed its own ignore line.
- **Prompts:** the build prompt ([`pj-engineering-layer.md`](../prompts/pj-engineering-layer.md)), whose "Amendments in force" blockquote now carries A1 to A3 and the pointer to A4 to A12 (its only body change), and the primer ([`pj-primer.md`](../prompts/pj-primer.md)), frontmatter prepended. The primer named no home for itself; `docs/prompts/` is judgment. `docs/prompts/pj-*.md` is added to `.prettierignore`.
- **Mason.** The revised role arrived as a thread output holding research, deltas, the role file in a fence, and a diff. The output is archived whole at [`eng-roles-mason-role-revision.md`](../research/eng-roles-mason-role-revision.md) (authoring role not recorded in the source, so `role` is empty). Its Part 3 fence, byte for byte, replaces [`mason-cto-principal-dev.md`](../roles/engineering/mason-cto-principal-dev.md); the file name is unchanged, and the status moves from `adopted` to `draft` as authored.
- **Ten engineering roles added** as received (Atlas, Lorimer, Millwright, Quartermaster, Scribe, Sexton, Touchstone, Turner, Usher, Wainwright), all `draft`, none a subagent.
- **Not filed yet:** the four workflow docs. They use the layer value `workflows`, which lands in J4 after plan-mode approval (A12). They stay in `3e58eae` and are filed from there.
- **Optional inputs absent, skipped:** message 1 (research), message 2 (Crucible's review), and `spec-system-guide.md`. The tickets stage file (J14) will be written without the spec guide.
- **Rule named (precedence rung 2).** The report and the conventions file are this thread's law and live in `docs/research/`, the Never tier. They are read here on the owner's explicit instruction. The same instruction covers writing this entry without plan mode; the records, ledger and conflicts changes at close go through plan mode.

### J0 — PJ verification (2026-10-02)

Installed: Claude Code 2.1.232 (`claude --version`), macOS, this machine. Sources fetched 2026-10-02: [hooks](https://code.claude.com/docs/en/hooks), [permissions](https://code.claude.com/docs/en/permissions), [sandboxing](https://code.claude.com/docs/en/sandboxing), [skills](https://code.claude.com/docs/en/skills). Every result below is **verified from the docs, not yet observed**: J0 changes no file but this one, so no hook exists to observe. Each is observed when its hook or setting lands (A2), and observed behavior wins (A3). The docs describe behavior up to v2.1.248, which is newer than the installed build.

| #   | Assumption                                          | Result                 | What the docs say                                                                                                                                                                                                                                                                                                                                                               |
| --- | --------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Stop input carries a loop guard; exit 2 feeds back  | verified               | `stop_hook_active` is true when the turn is already continuing because of a stop hook. On exit 2 Claude receives stderr as the reason. Claude Code also ends the turn after eight consecutive stop-hook continuations.                                                                                                                                                          |
| V2  | SessionStart stdout enters context                  | verified               | Plain-text stdout is added as a system reminder, capped at 10,000 characters. Matchers: `startup`, `resume`, `clear`, `compact`, `fork`. From v2.1.248, stdout that looks like JSON and fails to parse is dropped.                                                                                                                                                              |
| V3  | Permission rules match compound commands by segment | verified               | An allow rule must match every subcommand. Deny and ask rules apply when any subcommand matches, including inside `$(…)`, a subshell or a loop body. Separators: `&&`, `\|\|`, `;`, `\|`, `\|&`, `&`, newlines.                                                                                                                                                                 |
| V4  | `disable-model-invocation: true` leaves the listing | verified               | The docs' table: "Description not in context, full skill loads when you invoke". The J7 `/context` measurement stays, because the same page also says the listing always holds every skill name.                                                                                                                                                                                |
| V5  | Sandbox keys and allowlist syntax                   | verified, with a limit | `sandbox.enabled`, `autoAllowBashIfSandboxed`, `allowUnsandboxedCommands`, `excludedCommands`, `failIfUnavailable`, `filesystem.{allowWrite,denyWrite,allowRead,denyRead}`, `network.{allowedDomains,deniedDomains}`; hosts with a `*.` wildcard. **The sandbox covers shell commands only.** Read, Edit, Write and WebFetch follow permission rules, and hooks run outside it. |
| V6  | Project-directory variable in hook commands         | verified               | `${CLAUDE_PROJECT_DIR}` is a path placeholder and is exported to the hook process. The docs recommend exec form (`command` plus `args`) whenever a placeholder is used.                                                                                                                                                                                                         |
| V7  | PreToolUse fires for subagent tool calls            | verified               | Settings hooks run inside subagents; the input carries `agent_id` and `agent_type`.                                                                                                                                                                                                                                                                                             |

**Mechanisms changed by these results, before they are built:**

- **Construct bans dropped (V3; ruling (d)'s removal condition, convention 9).** `bash-guard` does not block `$(`, backticks or heredocs. Deny rules already reach inside them.
- **`bash-guard` parses the git subcommand; it does not prefix-match.** The permissions page states that `Bash(git push *)` stops `git push origin main` and not `git -C . push` or `git -c … push`, and that a Bash deny rule "isn't a security boundary". The guard therefore tokenizes the command, skips git's global options, and tests the subcommand, with a fixture for each bypass form. The settings deny stays as the second layer.
- **Secret reads need two entries (V5).** A `Read(...)` deny stops the Read tool; `sandbox.filesystem.denyRead` stops `cat` in the shell. J2 writes both, and `check-settings` requires both.
- **`results-gate` matches `Edit|Write`.** `MultiEdit` does not appear in the hooks reference. A shell redirect can still write `results.json` without passing that hook, so the gate against self-grading is A9's run record and evidence hash in `check-specs`, with `bash-guard` denying a redirect into a results file as the first line.
- **Stop hook output (V1; convention 10).** A Stop hook's stdout goes only to the debug log, and `additionalContext` continues the turn. So `stop-gate` blocks once with `decision: "block"` and a `reason` when `verify:fast` fails, and otherwise shows "Left to go" to the person through `systemMessage`, which does not continue the turn. The agent sees "Left to go" at the next SessionStart, not at every stop.
- **`session-start` prints plain text** that never opens with `{` (V2).
- **Hooks register in exec form** (V6): `node` with `${CLAUDE_PROJECT_DIR}/tooling/hooks/<name>.ts` as an argument.
- **A9: no change.** None of V1 to V7 touches the native git hooks. `core.hooksPath` is unset in this repo today, so `yarn hooks:install` has nothing to displace.

**Crucible test 3: size of the last 40 work items.**

- **Method.** `git -C <repo> log --no-merges` with dates and `--shortstat`, read-only, on 2026-10-02: the 20 most recent items in `~/lighthouse/synapse` and the 20 most recent in `~/lighthouse/taylor-aucoin`. An item is a work-id (commits sharing `PREFIX-n`), or a single commit where there is none. Its size bound is the time from the previous commit to the item's last commit. A gap over 12 hours gives no bound, and the item is counted as not determinable. This bounds agent wall-clock time; it does not measure a person's effort, and it cannot see shaping done outside the repo.
- **Counts.** Under half a day: 32 (Synapse 18, taylor-aucoin 14; the longest bound is 2 h 43 min). Half a day to two days: 0. Over two days: 0. Not determinable: 8 (Synapse 2, taylor-aucoin 6).
- **Reading.** 32 of 40 is 80%, above the report's 70% line even if all eight unknowns were large. But 30 of the 40 carry an epic's prefix (`DAY`, `RUN`, `PIPE`, `FIN`, `REV`): the small items are tickets inside epics, not standalone fixes. Under A4 and A12, small does not mean one-off.
- **Consequence for J4.** The work loop names a ticket of under half a day as the default size, and routes between one-off and epic by the A12 rule, never by size. The exact lines go through the J4 plan.

### J0 follow-ups (owner's review, 2026-10-02)

- **Outside the primer's scope, on Taylor's explicit instruction.** The ten engineering role files and Mason's role revision in `3e58eae` were added by Taylor and filed at Taylor's instruction. The primer names none of them; no PJ step authored or changed a role body.
- **Phase 1 deviation.** The primer asks for one filing commit. Phase 1 took two: `3e58eae` (intake as received) and `d614076` (filing). The intake commit is red under `yarn verify` by design, because the dump's names and the unfiled Mason output fail the docs lint until they are filed. History is not rewritten.
- **The dump is gone from the index.** `git ls-files docs/_files_dump` prints nothing, and the folder does not exist on disk.
- **Tools observed in Claude Code 2.1.232** (the `init` event of a headless session, this machine, 2026-10-02): `Edit`, `Write` and `NotebookEdit` exist; `MultiEdit` does not. `results-gate` (J5) matches `Edit|Write|NotebookEdit`.
- **Primer Phase 0 step 3: amendments that change the report without saying so.** Five, none blocking, each with the default this thread proceeds on:
  1. _The thread's law sits in the Never tier._ The report and the conventions file live in `docs/research/`, and A11's own exception excludes build threads. Default: read on the owner's instruction (precedence rung 2), named above.
  2. _Review criteria are `manual` yet gate closure._ Ruling (h) reports `manual` criteria as not verified; A7 makes `review:*` criteria `manual` and fails closure while one is FAIL. Default: a recorded verdict with a run record counts as verified; settled in the pre-J5 plan.
  3. _A4 moves P-C's filled examples to root `specs/`_, and nothing amends the P-C prompt or the `apps/web/specs` wording in `AGENTS.md`, `.claude/rules/ui.md` and `apps/web/AGENTS.md`. Default, now instructed: the J4 plan shows those diffs, and the close adds an amendment note to the P-C prompt.
  4. _A9 makes `yarn doctor` fail when the git hooks are not installed_, but `doctor` lands in J2 and the hooks later; A9 does not list J2. Default: `doctor` gains that check in the step that lands the hooks (A2's rule).
  5. _`docs/index.md` has one line of headroom_ (79 of 80). The report's edits net zero lines; A12's Workflows row takes the last one, and the A11 exception must fit inside an existing line. The J4 plan shows the arithmetic.

### J1 — layout file (E-05, in A4's shape)

- **`toolkit.json`** at the root, from [`toolkit.template.json`](../engineering/templates/toolkit.template.json). Keys: `tier`, `specsRoot`, `apps` (web: `WEB`; docs: `DOC`), `toolkitPrefixes` (`PEM`, `PJ`), `verify`, `migrationsDir` (null), `branchPattern`, `reviewers`. **Differs from the report and the build prompt, by amendment:** `workPrefix`, `specsDirs` and `designLayer` are replaced by `specsRoot` and the `apps` map (A4), and `oneWayDoors` by `reviewers` (A7).
- **`reviewers` is a draft.** Its 24 rows are drawn from Mason's one-way doors (schema, migrations, authorization, billing, package boundaries, public API shape) and Warden's concerns (auth, the environment seam, access policies, personal data, webhooks, payments, agent permissions), plus Assay, Threshold and Chancery rows from A7's table. Each row carries `status: draft` until its owner rules it. A Mason row is a one-way door. Vigil has no rows: A7 assigns Vigil by rule (every epic ticket, and any one-off touching a one-way door), not by path. Threshold's "new surface or component" cannot be said in a glob; its rows match every surface and component until the classifier (J8) can see added files.
- **`tooling/lib/toolkit.ts`** validates the file and exits 1 with each problem naming its key and the fix. Unknown keys fail, so a leftover `workPrefix` cannot linger. Prefixes must be unique across apps and toolkit prefixes.
- **Scripts read it.** `budget.ts` takes the design layer, the nested `AGENTS.md` and the brief-and-package example from it, sized by the heaviest app; its output is unchanged. `lint-frontmatter.ts` and `directory-map.ts` held no app path; they now load the file, and skip themselves in the overlay tiers, which leave a host's docs alone.
- **Exit, both met.** `apps/web` appears nowhere under `tooling/`. With `specsRoot` removed, `yarn verify` fails at the docs lint with `"specsRoot" is missing; copy it from docs/engineering/templates/toolkit.template.json and fill it in`.

### J2 — settings, their check, and doctor (E-14, E-15, E-21)

- **`.claude/settings.json`**, tracked, equal to [`settings.template.json`](../engineering/templates/settings.template.json). Permissions and the sandbox only; no hook is registered until its script lands (A2).
  - _Deny:_ push; `reset --hard`; `clean`; `branch -D`; `filter-branch`; npm publish and login (also through yarn); `rm -rf` of `/` and `~`; destructive database commands; reads of `.env*`, `secrets/`, `*.pem`, `~/.ssh`, `~/.aws`.
  - _Ask:_ `gh pr create` and `merge`; `vercel`; database migrate, push and seed; `yarn dlx`.
  - _Allow:_ yarn scripts, corepack, `node tooling/*`, local git.
  - _Sandbox:_ on, with unsandboxed retries left to ask. Network: localhost, the npm and Yarn registries, GitHub. Writes outside the repo: the Yarn caches only.
- **Built differently from the report, with reasons.**
  - `git clean` is denied in every form, not only `-fdx`; flag order makes the narrow rule miss.
  - `yarn dlx` asks. `Bash(yarn *)` would otherwise auto-approve running a remote package.
  - `sandbox.network.allowLocalBinding` is true. Without it the dev servers in the Commands table cannot bind `:3000` and `:3001` from a sandboxed shell (observed: `EPERM`).
  - `turbo.json` passes `TMPDIR` through (`globalPassThroughEnv`). The sandbox points `TMPDIR` at its writable directory; Turborepo's strict mode stripped it, so Yarn inside a task fell back to `/tmp` and `yarn verify` failed on `docs:build` (observed). Read in the installed Turborepo 2.11.6 docs before the change.
- **The limit on V5, stated.** The sandbox restricts shell commands and the processes they start, and nothing else. The Read, Edit and Write tools, WebFetch, MCP servers and hooks run outside it and answer to permission rules. The network allowlist does not limit WebFetch. A Bash deny rule matches command text and is not a boundary. GitHub is on the allowlist, so a push that slips every rule is stopped only by the absence of a remote and credentials; that gap is accepted and named here.
- **Correction to J0.** J0 said a secret needs two entries. The settings reference says `Read` deny rules are added to the sandbox's lists, so one rule reaches both, and the session's own sandbox report showed them merged. The explicit `denyRead` for `~/.ssh` and `~/.aws` stays as a second layer, and `check-settings` requires both.
- **V3 observed: as assumed.** In this session (Claude desktop app, Code tab, auto mode), after the settings went live, on 2026-10-02: `git status && git push` was denied, and `git log --oneline -1; git push` was denied. Also denied: `echo "$(git push)"` and `git -C . push`. The construct bans stay dropped. Two limits on this observation: the denial message does not name the rule or the file it came from, and a control compound with no push in it was refused by the auto-mode classifier, a separate layer, so the control rests on the many `&&` commands this session ran before and after.
- **Found by running under the new settings, for later steps.** The sandbox write-protects `.claude/settings.json`, `.claude/skills/` and `.git/config` and `.git/hooks` from the shell. So settings and skills are edited through the Edit tool, never a script, and `yarn hooks:install` (A9, `core.hooksPath`) is a step for a person or an approved unsandboxed command. The pre-J5 plan carries this.
- **`tooling/check-settings.ts`**, in `yarn verify`. Fails on a missing required deny, an allow rule that admits every shell command, a machine path, the sandbox off, a hook registered to a missing script, or a tracked `settings.local.json`. It runs its six fixtures first.
- **`tooling/doctor.ts`** (`yarn doctor`): Node, Yarn, corepack, `toolkit.json`, hook scripts present, local-settings credential shapes and rule count, dev ports. A busy or blocked port warns; it does not fail.
- **Exit, all met.** `yarn verify` runs `check-settings` and passes inside the sandbox. The fixture with the push denies removed fails with `permissions.deny is missing Bash(git push)`. `yarn doctor` exits 0 on this machine, and exits 1 on the fixture local-settings file that holds a synthetic key-shaped string.

## 2026-10-01 — Directory map, file by file (owner requested)

- **`docs/_generated/directory-map.md`** now gives every file under `docs/` its one line, its frontmatter `description`, grouped by folder. Each folder carries its purpose, taken from the Layers table in `docs/index.md` or from the folder's own `index.md`. Rows link to the files. It is generated, never hand-written, so each definition lives once, in the file's own frontmatter. `yarn directory-map --check` fails CI when the map is stale.
- **Not in `docs/index.md`**, which loads in every session (at most 80 lines and part of the 4,000-token always-on budget). A 118-row matrix there would break both caps and keep a second copy of every description in always-on context. The index gains one pointer line after the Layers table; the docs app lists the map under Start.
- **Docs app:** Start entries show their file name (`The practice — map (index.md)`), and nav links are set at 13px.

## 2026-10-01 — Investigation primers removed; docs sidebar

- **Primers 01–14 removed** from `docs/prompts/` at the owner's request: they ran the investigation threads, and their outputs live in `docs/research/` and the practice files built from them. `docs/prompts/index.md` keeps the thread-to-output table, without links. The originals are in git history (`19fc480`) and the owner's prompts folder. `00-shared-context.md` and P-A to P-I stay, because the Phase 3 and 4 threads attach them.
- **Docs app sidebar.**
  - It is a full-height panel: sticky, scrolling on its own, with the muted surface, a right border and search pinned at the top.
  - Every layer group and sub-folder is a native `<details>` accordion. The ones that hold the current page open; the reader's toggles are otherwise kept.
  - shadcn's Sidebar was considered and not used. It is an app shell (a provider, cookie state, a mobile sheet), more than collapsible folders need. Phase 3 decides where shadcn lives (`@pem/ui`, per `docs/design/skills.md`).

## 2026-10-01 — Canon split and ledger updates (owner approved)

- **Canon v0.2 ([record 0009](records/0009-canon-split.md)).** `canon.md` keeps §1 (principles) and §2 (anti-patterns) for builders. The rubric moves unchanged to [`canon-rubric.md`](../design/canon-rubric.md), except that C-R14 names canon §2. The v0.1 cut list moves into record 0009. Rule IDs are unchanged. Amends CF-20 (with a note on CF-20 in `conflicts.md`) and the critic row of the budget in `docs/index.md`. References updated in `CLAUDE.md`, `.claude/rules/ui.md`, `docs/design/{index,workflow,skills}.md`, the `DESIGN` template, `docs/product/index.md`, prompt P-C and `tooling/budget.ts`.
- **Ledger.** The twelve held status updates are applied. Each keeps its earlier value after "Was:", with the date and the ruling. New sections cover §8 (practice, PR-01 to PR-11) and §9 (engineering records 0001 to 0005, EN-01 to EN-05), plus the source codes CF and REC. The ledger is now `adopted`, owned by Plumb; Alembic's status and role are kept as `source_*`.
- **Filing rule clarified (record 0009, PR-05).** Archived reports stay byte for byte. Live files that came through the dump change only through their changelog with the owner's sign-off. The filing manifest records their state at filing; git history has every change since.
- **Budget gap, smaller but still open.** Builder canon measures about 3,860 tokens, leaving about 1,140 of the design layer's 5,000 for a product layer, against the 1,700 `docs/index.md` allots. `yarn budget` warns and passes. `[PROPOSED — needs sign-off]` Amend the index's UI-build row to design layer 5,500 and one skill body 2,000 (total unchanged at 15,000; the largest planned skill body, `tk-motion`, is well under 2,000). Cost of being wrong: a skill body over 2,000 tokens would have to be split.

## 2026-10-01 — Phase 2: the practice layer (P-B), practice v0.1

Written by Plumb in Claude Code from the Phase 1 outputs. The checklist it followed is archived at [`pa-phase-2-checklist-plumb.md`](../research/pa-phase-2-checklist-plumb.md); every item is done unless listed under "Open" below.

### Filed

- The 37 files in `docs/_file-dump/` filed per the filing plan and `conflicts.md` (CF-05, CF-14, CF-17, CF-28, CF-48), the dump folder removed. Bodies are byte-identical to commit `f61ac1b`, verified by hash; frontmatter normalized per [record 0006](records/0006-file-naming-and-filing.md). Every move is listed in `docs/_generated/filing-manifest.json`.
- Message-2 outputs went live unchanged: [`docs/index.md`](../index.md), [`canon.md`](../design/canon.md), [`conflicts.md`](conflicts.md), the brief, package and cycle-charter templates, and the variant-testing runbook. Alembic's working files (`_candidates`, unresolved conflicts, filing plan) and the Phase 2 checklist are archived in `docs/research/` (`pa-*`).
- The two live procedures (thread 11, thread 12b) went to `docs/references/_meta/` as `draft` (CF-28).
- All 28 role prompts and the coverage report renamed to ASCII kebab-case (CF-17); the coverage report is now `docs/roles/product-design/index.md`. Role bodies unchanged; frontmatter added. `mason-cto-principal-dev.md` corrects the original filename's "principle".
- Primers 01–14 copied from the prompts folder with bodies unchanged; P-A to P-E taken verbatim from the plan's §4, with an "amendments in force" note added to P-C and P-D; P-F to P-I written as stubs (CF-29). The plan and the original shared context are archived (`pl-toolkit-plan.md`, `00-shared-context-original.md`).

### Written

- Agent context: `AGENTS.md` rewritten as the ≤100-line contract (CF-01–03); `CLAUDE.md` shim; `.claude/rules/{ui,ts,testing}.md` with monorepo globs (CF-04, CF-23); the app-level example `apps/web/AGENTS.md` and its `CLAUDE.md`.
- Enforcement: `tooling/lint-frontmatter.ts`, `tooling/budget.ts`, `tooling/gen-agents.ts`, `tooling/directory-map.ts`, and `@pem/config/eslint/tokens` (applied to `apps/web` and `packages/ui`), all in `yarn verify` and CI.
- Decisions: `decision.template.md` (MADR-minimal), records 0001–0005 migrated from the scaffold's `TECHNICAL-DECISIONS.md`, and records 0006–0008.
- Design: `index.md`, `workflow.md` (ruling 01), `skills.md` (ruling 04), and the seven templates in `templates/`.
- Product, metrics, evals, runbooks: `product/index.md`, `glossary.template.md`, four metrics templates, three evals templates, `onboard-agent.md`, `release.template.md`, `postmortem.template.md`.
- References: the router `docs/references/index.md` (laws rows generalized from thread 13; CF-15, CF-49). Prompts: `00-shared-context.md` rewritten universal (CF-42), `index.md`. Skills: `.claude/skills/REGISTRY.md` (empty).
- Subagents: `.claude/agents/{assay,alembic,tally,compass}.md`, generated (record 0008).
- Docs app: frontmatter rendered, sidebar grouped by `layer`, MiniSearch over a build-time index of every file, `research/` and `_generated/` out of the sidebar but searchable (record 0007).

### Schema and convention amendments

- **`layer` gains `engineering`** for `docs/engineering/` (the scaffold's conventions and tech stack, moved from `docs/architecture/`). CF-16's enum had no home for them; the engineering side's own thread will decide whether it keeps this layer.
- **Role frontmatter gains** `subagent`, `subagent_tools`, `subagent_disallowed_tools`, `subagent_model` (record 0008), and `extends` for extensions.
- **`last_reviewed` is optional** in the lint. CF-16 added it, and the ledger, `only-you.md` and the filed reports predate it.
- **`thread` is always a string.** YAML reads `thread: 05` as the integer 5; filed values were quoted with their text unchanged (record 0006, rule 5).
- **The role-authoring guide** amended per checklist item 11: ASCII filenames, department folders, `index.md` landings, project extensions in product repos, frontmatter and the subagent opt-in, Conscious Connections references generalized.
- **`docs/README.md` removed** (CF-05); `docs/index.md` is the one map.
- **Turborepo's managed agent block turned off** (`"agentGuidance": false` in `turbo.json`); its warning is one line in `AGENTS.md`, as Next's is (`agentRules: false`).

### Ledger amendments held for sign-off

> **Applied 2026-10-01** after owner approval; see the entry above.

`ledger.md` is filed byte-for-byte as Alembic wrote it, because the owner asked that no dump file change in this pass. Checklist item 9 asks for these status updates; they apply the rulings in `conflicts.md` and go into the ledger when the owner approves:

| ID    | Today                                      | Becomes                                                                                     | Per   |
| ----- | ------------------------------------------ | ------------------------------------------------------------------------------------------- | ----- |
| SK-03 | conditional (GSAP and AccessLint deferred) | GSAP: ruled, rejected for product UI, deferred for marketing; AccessLint: still conditional | CF-32 |
| SK-10 | ruled (motion manual-only)                 | superseded by SK-15                                                                         | CF-30 |
| SK-15 | proposed (motion model-invocable)          | ruled, conditional on the trigger test                                                      | CF-30 |
| SK-17 | proposed (`plumb-motion`)                  | superseded: `tk-motion`                                                                     | CF-18 |
| SK-18 | proposed (GSAP rejected for two products)  | ruled, generalized to product UI                                                            | CF-32 |
| DC-07 | proposed (tabular type minimum)            | ruled with the minimum `[PROPOSED — needs sign-off]` at 12px                                | CF-38 |
| DC-09 | needs call (system fonts vs. Inter)        | ruled: the tell is the unexamined default                                                   | CF-37 |
| DC-10 | proposed (replace the motion line)         | ruled; R04's motion line retired                                                            | CF-34 |
| DC-22 | needs call (Google DESIGN.md format)       | ruled: no conformance; generate an export if a tool needs it                                | CF-41 |
| WT-45 | needs call (em-dash filenames)             | ruled: ASCII everywhere; owner veto stands                                                  | CF-17 |
| PO-25 | proposed (per-file decision records)       | ruled in part: ledger index + records + changelog                                           | CF-06 |
| ME-28 | proposed (PostHog naming)                  | not adopted; R03's v0.1 stands                                                              | CF-45 |

New ledger lines to add at the same time: the naming and filing convention (record 0006), the docs renderer (0007), generated opt-in subagents (0008), and the schema amendments above.

### Agent-readability test (run last, per P-B)

Fresh sessions were given only `CLAUDE.md` and its imports, and a one-line brief.

- **Round 1.** UI brief: "Add a bulk-archive action to the records table in the demo app." Non-UI brief: "Instrument record exports in the demo app and define an export-rate metric we can read after the next release."
  - **Passed on the core question.** Both named the right files in the right order and with the right reasons: the canon and the product design layer for UI work, the metrics layer for instrumentation, the path rules, and the critic handed the package and the evidence (never the builder's summary). Both put `docs/research/` under "never".
  - **Holes found, fixed in `AGENTS.md` and `CLAUDE.md`:**
    - The current phase was unstated, while `docs/index.md` lists the `tk-*` skills in the present tense.
    - There was no rule that feature work starts from a package, and no path for filled copies in the demo.
    - Three subagents had no stated purpose.
    - The design layer's file names were missing.
    - Nothing said there is no test suite yet.
- **Round 2,** same UI brief, after the fixes.
  - **Passed.** The session stops first to ask whether the records table exists (Phase 3) and whether there is a package or a waiver, then names the same load order.
  - Its two remaining wording ambiguities were fixed: "package" as in brief-and-package versus workspace package, and Recipe A living in `docs/design/index.md`.
- **Open, outside this phase:** archive semantics and analytics transport are product decisions for a package; the Next.js docs and `workflow.md` have no line in the index's budget table.

### Open

- **Resolved in part 2026-10-01 by the canon split (entry above).** **The canon and the budget disagree.** `canon.md` estimates at about 4,900 tokens; `docs/index.md` gives the whole design layer 5,000, of which a product's own layer should get about 1,700. `yarn budget` passes today with no product layer, prints the shortfall as a warning, and will fail when the demo's design layer lands in Phase 3. A builder needs canon §1–§2 (about 3,500); §3 (rubric, about 870) and §4 (cut list, about 270) serve the critic and the maintainer. `[PROPOSED — needs sign-off]` Split the canon: `canon.md` keeps §1–§2 for builders, and the rubric moves to a critic-only file the critic skill loads (amends CF-20 and the index's load table). Cost of being wrong: one more file to keep in step, and the rubric is no longer beside the principles it scores.
- **Role bodies are not all universal yet.** The coverage report (`product-design/index.md`) still names DealReady and Fybr; Drummer is bound to one client's sales funnel; Compass, Tribune and Envoy keep their "fill §7" sockets. CF-21 says every toolkit role is universal, so these need a universalization pass (a new thread, or Phase 4).
- **Brief template critic line.** The P-B ask wants every template to say what the critic checks it against; `brief.template.md` (filed unchanged) does not. `docs/product/index.md` carries the answer (nothing directly; the critic scores the package). Add the line to the template when the owner allows edits to filed files.
- **Owner calls still open:** the tabular type minimum (CF-38, with the accessibility auditor), the Onlook trial (WT-07), whether the repo may go public (CF-48; it decides whether `06a`, `07a` and `13` stay in `docs/research/`), and the rest of [`only-you.md`](only-you.md).
- **Phase 3 owns:** the skills, the demo's filled design layer and `specs/_example/`, the critic CI, shadcn and Storybook in `apps/web`, and Assay's Bash access under a guard (record 0008).

## 2026-10-01 — v0 (Phase 0 scaffold)

- The Turborepo scaffold: `apps/web`, `apps/docs`, `@pem/config`, `@pem/ui`, records 0001–0005.
