---
title: "PJ conventions locked by Taylor, and amendments A4 to A12"
description: "Read only to trace a convention Taylor locked for the engineering layer on 2026-10-02, or the text of amendments A4 to A12 that the PJ build prompt points to."
layer: research
status: archived
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when:
---

# PJ conventions locked, and amendments A4 to A12

This file comes from the teach-back thread (Usher, consulting Lorimer). It does three things:
- It records every preference call Taylor locked.
- It holds the amendment text that `docs/prompts/pj-engineering-layer.md` points to.
- It lists what is held for sign-off and what stays open.

The report `docs/research/pj-engineering-layer-lorimer.md` is still the law. Where an amendment below changes something the report specified, the amendment wins for this thread.

## 1. Locked conventions (2026-10-02)

"Default" means the report's or build prompt's own default, kept. "Changed" and "New" point to the amendment that carries them.

| # | Decision | Taylor's choice | Source |
|---|---|---|---|
| 1 | Work-ids | One-offs use the app's prefix (`WEB-41`). Epics get their own prefix (`ONB`), and epic tickets use it (`ONB-3`). Scripts allocate numbers. | Changed: A4 |
| 2 | Agent commit messages | `<work-id>: <outcome>`. Taylor's own commits are unconstrained. | Default |
| 3 | One-off or epic | Epic when the work needs more than one ticket, adds a surface, has no living UX file covering it, or the problem is unsettled. Otherwise one-off. Each ticket keeps its `size` field. | Changed: A4, A12 |
| 4 | Contract agreement before build | For epic tickets, the Tickets stage gate (Vigil pre-flight) replaces per-ticket contract-go. One-offs skip it. | Changed: A7, A12 |
| 5 | PR unit | One PR per ticket. A dependent ticket starts only after its predecessor merges. | Default |
| 6 | Push | Agents never push. Taylor pushes and merges. | Default |
| 7 | Disposable database | Decided at the first database (primer M). The universal destructive-database denies ship now. | Default |
| 8 | Evidence types | UI criteria default to `capture`. `manual` criteria are reported as not verified. Review criteria (A7) must pass before closure. | Default, plus A7 |
| 9 | Bash guard | The report's list. Construct bans are removed if V3 shows per-segment matching. | Default |
| 10 | Stop hook | Runs `verify:fast`, blocks once on failure, always prints what is left. | Default |
| 11 | SessionStart line | Kept, truncated to 600 characters. | Default |
| 12 | Dependency age gate | 3 days. | Default |
| 13 | Where specs live | Root `specs/`, one folder per app, plus `specs/_shared/` for cross-app work. | Changed: A4 |
| 14 | `vigil` generation | Generate now with the interim body and the banner line. | Default |
| 15 | Budget rows | The rows in A10. | Changed: A10 |
| 16 | Run order | Stop after J7. If cleared, J14 runs next, then J8 to J13. | Default, plus A12 |
| 17 | Product truth | `specs/<app>/ux/` is the living source of truth for how the app works now. Epics propose changes; shipping promotes them. | New: A8 |
| 18 | Before UX | A Frame stage writes a problem-and-appetite brief. An optional Research stage runs when there are real knowledge gaps. | New: A12 |
| 19 | Prompt builder placement | The front door only. After that, each stage writes the next stage's prompt. | New: A12 |
| 20 | Prompt builder form | A file in `docs/workflows/` plus a thin `/tk-prompt` skill pointing to it. | New: A12 |
| 21 | Tools | Claude Code is primary. Cursor must work, so every law also runs at commit time and in CI, not only in Claude Code hooks. | New: A9 |
| 22 | Extra reviewers | Computed from what a ticket touches. Roles without a subagent get a written review prompt. | New: A7 |
| 23 | Research files in prompts | Allowed in Frame, Research and UX prompts, labeled, only when nothing distilled covers the topic. Never in build threads. | New: A11 |
| 24 | Every printed prompt | Opens with a venue line: Claude Code, or general Claude thread. | New: A12 |
| 25 | Reading docs | GitHub and the docs app. Folder README versus index is decided separately (§4). | Held |
| 26 | PEM remote | A GitHub remote is coming. Until it exists, "merge" means a local merge of `agent/<id>` into `main`. | Note |
| 27 | Report §11, "Prompt 17" | Proceed on the assumption that it means Quartermaster's scorecard and market templates. | Default |

## 2. Amendments in force (2026-10-02, conventions file)

> **A4. Specs layout, apps and work-ids.** Changes J1, J3 and J5.
>
> **Layout.** Specs live under the root `specs/`, one folder per app named in `toolkit.json`, plus `specs/_shared/` for work that spans apps:
>
> ```
> specs/
> ├─ _status.md                         generated
> ├─ _shared/                           cross-app truth and epics
> └─ <app>/
>    ├─ ux/                             LIVING TRUTH (A8)
>    │  ├─ _global/                     architecture, navigation, shell, decisions.md
>    │  └─ <area>/                      overview.md plus one file per surface
>    ├─ epics/<EPIC>-<slug>/
>    │  ├─ brief.md
>    │  ├─ research/                    optional
>    │  ├─ prompts/                     NN-<stage>.md, written by the builder and stages
>    │  ├─ ux/                          proposed files, mirroring truth paths
>    │  ├─ technical.md                 or technical/ when split
>    │  └─ tickets/<EPIC>-<n>-<slug>/   contract.md, results.json, as-built.md
>    └─ one-offs/<APP>-<n>-<slug>/      contract.md, results.json, as-built.md
> ```
>
> This replaces the flat `specs/<id>-<slug>/`. P-C's filled examples move from `apps/web/specs/_example/` to `specs/web/one-offs/` and `specs/web/epics/`.
>
> **`toolkit.json`.** Replace `workPrefix`, `specsDirs` and `designLayer` with:
> - `specsRoot`: `"specs"`
> - `apps`: a map of `{ name: { path, prefix, designLayer } }`
> - `toolkitPrefixes`: `["PEM", "PJ"]` (A1's list)
>
> `oneWayDoors` is subsumed by `reviewers` (A7).
>
> **Work-ids.**
> - One-off: `<APP>-<n>`.
> - Epic: `<EPIC>`, 2 to 5 uppercase letters or digits, unique in the repo.
> - Epic ticket: `<EPIC>-<n>`.
> - Numbers are allocated by script, never typed.
>
> **Branches.** `agent/<EPIC>` for shaping work. `agent/<id>` for each ticket.
>
> **bash-guard.** Admits a commit whose work-id prefix is a toolkit prefix, an app prefix, or an epic prefix that exists on disk. `check-specs` fails duplicate prefixes.
>
> **Scripts.**
> - `spec:init <app|_shared> <EPIC> <slug>` creates the epic folder from templates and the branch `agent/<EPIC>`. It refuses a prefix already in use.
> - `contract:init <APP|EPIC> <slug>` allocates the next number, creates the ticket folder in the right place, creates the branch, and writes results at FAIL. It keeps the refusal of a second active item on one branch.
> - `status --epic <EPIC>` adds the epic's critical path and the build order generated from each contract's `depends_on`.
>
> **J5 exit, added.**
> - A duplicate-prefix fixture fails.
> - `contract:init` allocates sequential IDs.
> - The throwaway cycle runs once for an epic ticket and once for a one-off.

> **A5. Contract fields and size.** Changes J5 (E-22, E-25).
>
> The contract template adds these fields:
>
> | Field | Contents |
> |---|---|
> | `slice_type` | One line: what kind of work this is, and what class of failure it risks |
> | `non_negotiables` | At most seven, each one line |
> | `devs_call` | What the builder decides freely |
> | `cites` | Surface files, decision IDs and criterion IDs from those files |
> | `truth_files` | Living UX files this ticket changes, or `none: <reason>` |
> | `reviewers` | Computed (A7) |
>
> **Sizes.**
> - A filled contract is at most 1,000 tokens. E-22 said 600.
> - A ticket cites at most one surface file. Citing more needs a `waiver:` line with a reason.
> - `check-specs` enforces both, with messages that say to split the ticket.

> **A6. Gates are checks.** Changes J5.
>
> `contract:init` refuses to start a ticket when any file it cites:
> - lacks `status: approved` in its frontmatter, or
> - contains `[NEEDS DECISION — BLOCKING]`.
>
> A plain `[NEEDS DECISION]` in a cited file is listed by `status` and does not block. Every refusal names the file and the fix. Fixtures cover both refusals and one pass.

> **A7. Reviewers by risk.** Changes J1, J5, J7 and J8.
>
> **The map.** `toolkit.json` gains `reviewers`: a list of `{ glob, role, why }`. Mason drafts the one-way-door rows and Warden the security rows, in `toolkit.template.json`.
>
> | Reviewer | When |
> |---|---|
> | Vigil | Every epic ticket, and any one-off touching a one-way door |
> | Assay | Any ticket whose planned paths touch UI globs |
> | Mason | Schema, migrations, package boundaries, public API shape |
> | Warden | Auth, secrets, personal data, permissions |
> | Threshold | A new surface or a new interactive component |
> | Chancery | Consent, terms, billing copy and other legal exposure |
>
> **How reviews become criteria.** `contract:init` adds one criterion per reviewer, named `review:<role>`, with evidence type `manual`.
>
> **Checks.**
> - `check-specs` fails a contract whose reviewers omit a role its planned paths require.
> - Closure fails while any `review:*` criterion is FAIL.
> - At close, `risk-tier` runs on the actual diff. Any reviewer it adds is written into the contract's results as a new `review:*` criterion.
>
> **How reviewers run.** `tk-close` forks `vigil` and Assay as subagents. For roles with no generated subagent, it writes `review-<role>.md` into the ticket folder: a ready-to-run prompt with the venue line. The review's verdict is recorded with `contract:record`.
>
> **Exit.**
> - A fixture contract with an auth path and no Warden fails.
> - A fixture diff touching auth adds `review:warden`.

> **A8. Living UX truth and promotion.** Changes J5. Documented in J14.
>
> **Truth.** `specs/<app>/ux/` always describes how the app works now.
> - `_global/` holds architecture, navigation, the shell and the app-wide decision log.
> - Each area is a folder. Each surface is a file.
>
> **Proposals.** An epic's `ux/` holds only the files it adds or changes, mirroring truth paths. Each file's frontmatter carries:
> - `target:` its truth path
> - `status:` `draft` or `approved`
> - `promoted:` empty until promoted
>
> **Promotion.** `truth:promote <EPIC>` copies each epic surface file whose citing tickets have all merged to its target and stamps `promoted:`. The promoting agent then reconciles the truth file with those tickets' as-built Deviations, and the PR diff shows the result. `tk-close` runs it for the ticket's surfaces. Truth files are never immutable. An epic's files freeze once promoted (immutability check against `main`).
>
> **One-offs.** A one-off that changes behavior lists its `truth_files` and edits them in the same PR.
>
> **Checks.** `check-specs`, at warn level, flags:
> - any epic surface whose citing tickets have all closed and which has no `promoted:` date
> - any one-off whose diff touches UI globs while `truth_files` is `none`
>
> **Scope here.** PJ ships the mechanism with fixtures. The demo app's truth tree is created in P-C.

> **A9. Laws that hold outside Claude Code.** Changes J5, J6 and J12.
>
> Claude Code hooks stay the first line of enforcement. So that Cursor sessions and humans meet the same laws:
>
> **Run records.** `contract:run` and `contract:record` write a run record into each result:
> - the command and its exit code
> - a timestamp
> - the evidence path and its SHA-256
>
> `check-specs` rejects a PASS with no run record, or with an evidence hash that no longer matches.
>
> **Native git hooks.** These live in `tooling/git-hooks/`:
> - `pre-commit` runs `check-specs` on staged spec files and checks results integrity.
> - `commit-msg` requires a work-id, but only on `agent/*` branches.
>
> `yarn hooks:install` installs them by setting `core.hooksPath`. `yarn doctor` fails when they are not installed. No third-party hook manager is added.
>
> **Accepted gaps.** Rules that only a Claude Code hook can carry (no push, shell constructs) are recorded in the harness log as accepted gaps for other tools. They stay there until P-F settles multi-tool loading. `AGENTS.md` stays canonical; Cursor reads it. Generating Cursor rules is P-F's scope.
>
> **Exit.**
> - A fixture hand-written PASS with no run record fails `check-specs`.
> - A `commit-msg` fixture on an `agent/` branch with no work-id fails.
> - The same message on a non-agent branch passes.

> **A10. Budget rows.** Changes J4 and J5.
>
> These caps are pre-authorized. Any other cap raise still stops the build.
>
> | Build | Loads | Cap |
> |---|---|---|
> | UI build | always 4,000 + design layer 5,500 + contract and cited spec 3,500 + path rules 1,000 + references 1,000 + one skill body 1,500 | 16,500 `[PROPOSED — needs sign-off: Plumb]` |
> | Non-UI build | always 4,000 + path rules and nested `AGENTS.md` 1,500 + contract and cited spec 3,500 | 9,000 |
> | Critic pass | unchanged at 6,000, with "brief and package" read as "the cited surface file" | 6,000 |
> | Evaluator pass | body 3,000 + contract and cited spec 3,500 + evidence index 500 | 7,000 |
>
> The UI row is held exactly as the build prompt holds it: the current row stays until Plumb signs.
>
> **Spec file caps**, enforced by `check-specs` with a message that says to split:
>
> | File | Cap (tokens) |
> |---|---|
> | Surface file | 2,000 |
> | Area overview | 1,500 |
> | `technical.md` (otherwise split into `technical/`) | 2,000 |
> | Contract | 1,000 |
>
> **Shaping threads** (Frame, Research, UX, Technical, Tickets) are not capped now. Revisit trigger: the first epic, when their measured loads are recorded in the harness log.

> **A11. Research files in shaping prompts.** Changes J4. Plan mode, since it touches `docs/index.md`.
>
> `docs/index.md`'s Never tier for `docs/research/` gains one exception. A prompt written by the prompt builder or a stage file for a Frame, Research or UX thread may attach a research file when no distilled file covers the topic. The attachment carries the label `[research: <why>]`. Research files are never attached in Technical, Tickets or build threads.
>
> `check-specs` fails any contract or ticket kickoff prompt that names a `docs/research/` path. Add one ledger line for the exception.

> **A12. Workflow layer.** New step J14, run after J7 and before J8 when cleared.
>
> **Filing (in J4, after plan-mode approval).** The four attached workflow docs go into `docs/workflows/` as `index.md`, `one-off.md`, `epic.md` and `glossary.md`. Add `workflows` to the frontmatter lint's layer list. In J14, correct only factual mismatches with what was built (command names, paths), with one changelog line each.
>
> **Stage files.** Write these in `docs/workflows/stages/`: `frame.md`, `research.md`, `ux.md`, `technical.md`, `tickets.md`, `build.md`. Each is at most 1,500 tokens and has these sections:
> 1. Lead and support (roles by file).
> 2. Venue: Claude Code or general Claude thread.
> 3. Loads: exact paths, each with one reason, within budget.
> 4. Interview protocol (Frame and UX). Unlimited questions in numbered rounds, each with a recommended default. Nothing invented silently. Open items carry markers. The file states that this overrides the role's default intake behavior.
> 5. Writes: paths and templates.
> 6. Gate: what enforces it, a check name or "you".
> 7. Handoff. Write the next stage's prompt to the epic's `prompts/NN-<stage>.md`, print it, and tell the person to open a new thread with it. The Tickets stage writes one kickoff prompt per ticket.
>
> `tickets.md` adapts the authoring rules of `spec-system-guide.md` (if filed) to contracts: the pre-flight check, the three-ticket starting ceiling (re-measured at the first epic), and the model recommendation that states the failure mode of choosing down.
>
> **`docs/workflows/prompt-builder.md`.**
> - Input: a brain dump.
> - Reads: the directory map, the roles index, the references router, the prompts index, `toolkit.json`, `specs/_status.md`, the stage files and the prompt standard.
> - Decides: one-off or epic (the routing rule in `index.md`), the app, the stage, the lead and support roles, files to attach (one reason each, within the stage's budget), research gaps, and the venue.
> - Writes: it prints the prompt and, for epics, saves it under `prompts/`.
> - Checks its own output against the prompt standard and reports that check.
>
> **The skill.** A manual skill `.claude/skills/tk-prompt/` (`disable-model-invocation: true`) whose body is a pointer to `prompt-builder.md`. Give it a REGISTRY row and measure its listing cost.
>
> **`docs/workflows/prompt-standard.md`.** A checklist distilled from:
> - `00-shared-context.md`
> - the PJ prompts' shape (decision served, ask, evidence rules, done criteria, not wanted)
> - the founder-brief shape (role, support, attached, deliverable, should include, process)
> - the kickoff block
>
> Every printed prompt opens with a venue line.
>
> **Templates.** Each uses the instruction-blockquote header.
> - `docs/design/templates/ux-overview.template.md` and `ux-surface.template.md`: status draft, Plumb signs.
> - `docs/engineering/templates/technical.template.md`
> - `docs/workflows/templates/research-note.template.md`
>
> **Index.** Add a Workflows row to `docs/index.md` within 80 lines, without raising the cap. If it doesn't fit, stop and propose a cut.
>
> **Docs app.** Check whether `apps/docs` renders Mermaid code fences. If it doesn't, add a held item ("Mermaid in the docs app needs a dependency ruling"), and add no package.
>
> **J14 exit.**
> - `lint:docs` passes.
> - Every stage file is within its cap.
> - The changelog records one desk walk each of a one-off and an epic through the builder, naming the files it chose for the example "redesign onboarding for the web app".

## 3. Held for sign-off

| Item | Who signs |
|---|---|
| UI budget row (A10) | Plumb |
| Record 0010, adoption tiers | Taylor |
| New record: specs layout, work-ids and living UX truth (A4, A8) | Taylor |
| UX overview and surface templates (A12) | Plumb |
| Folding `package.template.md` into brief, UX tree and technical notes for epics, and adding a "Knowledge gaps" section to `brief.template.md` | Product-layer owner (Compass) |
| Moving auto-memory workflow rules into the repo, then deleting them from memory | Taylor (action) |
| Removing CC's `additionalDirectories` from machine-wide settings | Taylor (action) |
| `vigil` interim body before refinement 22c | Taylor |

## 4. Open items, each with its trigger

| Item | Trigger |
|---|---|
| Cursor parity for path rules and hook-only rules | P-F |
| Mermaid rendering in the docs app | A dependency ruling (Quartermaster) |
| A README or index in every docs folder, generated from frontmatter, for GitHub and the docs app | A separate Scribe task after PJ |
| Generated subagents for Warden, Threshold and Chancery | The third written review prompt for the same role |
| Shaping-thread budgets; the three-ticket ceiling | The first epic |
| Disposable-database mechanisms | The first database (primer M) |
| Remote branch protection and PR flow on PEM | When the GitHub remote is added (port runbook step) |

## 5. Line for the Claude Code primer

Apply `docs/research/pj-conventions-locked.md` §2 (amendments A4 to A12) before executing any J-step. Where it changes what the report specifies, the amendment wins and the changelog says so.
