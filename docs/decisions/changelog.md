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
