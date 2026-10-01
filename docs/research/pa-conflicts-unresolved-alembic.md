---
title: Conflicts between reports — unresolved
description: Read only to trace a ruling in docs/decisions/conflicts.md back to the unresolved positions Alembic recorded.
source_description: Read before ruling on any design-layer line, layout path, skill, cadence or schema, to see where two reports or a report and the plan disagree. Both sides are quoted with sources; nothing here is resolved.
layer: research
source_layer: decisions
status: archived
source_status: draft
thread: P-A
role: Alembic
date: 2026-10-01
supersedes:
load_when:
last_reviewed: 2026-10-01
---

# Conflicts (unresolved)

Each entry gives the claim, each side verbatim with its source, and what would resolve it where a report says so. No compromise readings. Source codes are as in the ledger.

## A. Repo layout and build order — toolkit map (R14) against the plan (PL §2.6, §2.7, §3)

**CF-01 — The root agent file.**

- PL §2.6: "`CLAUDE.md` # root agent context: precedence, where things are, load rules"; P-B: "Root `CLAUDE.md` for real".
- R14 §1.1: "`/AGENTS.md` … Cross-tool contract" plus a "`/CLAUDE.md`" shim starting with `@AGENTS.md`, because "Claude silently ignores `AGENTS.md` whenever a `CLAUDE.md` exists".

**CF-02 — What loads always.**

- PL P-B: "the load rules (always: index, DESIGN; …)" and "the slop tells by name" in root `CLAUDE.md".
- SC: "ban the slop tells in `CLAUDE.md`".
- R14 §3 Misplaced: "Design bans loaded always-on — Pays UI tokens on backend tasks → `.claude/rules/ui.md` with `paths`".
- R14 §3 Redundant: "anti-patterns.md is canonical; the others point to it".
- R14 §1.5: DESIGN.md loads "Via `ui.md` path rule".

**CF-03 — Size limit on the agent file.**

- PL P-B Not wanted: "a `CLAUDE.md` over a hundred lines".
- R14 §2: "`AGENTS.md` (120 lines) + `CLAUDE.md` shim (20 lines)" inside a 4,000-token always-on budget.

**CF-04 — Path-scoped rules.**

- R14 §1.1–1.2: `.claude/rules/{ts,ui,testing}.md` with `paths:`.
- PL §2.6: `.claude/` holds `skills/`, `agents/`, `settings.json`, with no `rules/`.

**CF-05 — The map file.**

- PL §2.6: `docs/index.md` ("the map").
- R14 §1.1: `docs/README.md` plus `yarn directory-map` ("Human index"), and `docs/agent-context/LOADING.md` ("Human-only table of what loads when").
- RG §3: "update the `roles/` section of `docs/README.md`".

**CF-06 — Decision records.**

- PL §2.6: `docs/decisions/ledger.md` ("every ruling, one line, status"), `conflicts.md`, `changelog.md`.
- R14 §1.6: `docs/decisions/NNNN-<slug>.md` ("One decision per file; status; supersedes"; MADR).
- R05 charter 14: "Changes go through the decision log" (no format given).

**CF-07 — Where specs live.**

- PL §2.6: "don't put `specs/` at the root of the toolkit … the toolkit ships the template and one example inside the demo app" (`apps/web/specs/_example/brief.md`).
- R14 §1.6: `specs/<feature>/brief.md`, `plan.md`, `tasks.md`.
- SC Recipe A: "`/specs/<feature>/brief.md`".
- R05 charter 4: "`/specs/<feature>/brief.md`".

**CF-08 — Shape of the brief.**

- R05 charter 4: one file, "in two parts" (Frame plus Package).
- PL §2.6: two files, `brief.template.md` and `package.template.md`.
- SC Recipe A: "job-to-be-done, user, metric, constraints, non-goals, required states".
- R14 §1.6: "Problem, who, outcome, appetite, risk, UX states, EARS, open questions", plus §3 "'expected action' … and an event-plan table referencing event IDs".

**CF-09 — Where metrics live.**

- R14 §1.7: `docs/metrics/events.md`, `definitions.md`, `CHANGELOG.md`, `templates/`. Tally: "metric definitions are a public API".
- PL §2.6: `docs/product/readout.template.md`, `event-plan.template.md`; no metrics layer.
- R03 §4.6: Fybr's metric "gets the same treatment: a v0.1 definition in the Fybr brief".

**CF-10 — Evals.**

- R14 §1.10 and §4 step 5: an `evals/` layer and a first eval set ("The largest product risk").
- PL §2.6 and §3: no evals layer or phase.

**CF-11 — Runbooks.**

- R14 §1.9: `docs/runbooks/` (release, incident plus postmortem, onboard-human, onboard-agent, weekly).
- PL §2.6: `docs/product/variant-testing-runbook.md` only; port runbook in `README.md` (P-E).

**CF-12 — Design-layer files.**

- R14 §1.5: `docs/design/` holds DESIGN.md, tokens, components, states, anti-patterns, `exemplars/`, `coverage-gaps.md`, `refs/`, `workflow.md`, `tool-rulings.md`, and these are project-bound (§2 table: "DESIGN.md, tokens, components, exemplars, coverage gaps" are project-bound).
- PL §2.4 and §2.6: `docs/design/templates/*.template.md` plus a filled example in `apps/web/docs/design/`, plus `README.md`, `workflow.md`, `skills.md`, `canon.md`. Exemplars sit in the ui-critic skill (P-C: "Three pass and three fail calibration exemplars").

**CF-13 — Product layer.**

- R14 §1.6: per-product `docs/product/<product>/charter.md`, `roadmap.md`, `positioning.md`, `ost.md`; `docs/product/glossary.md`; `docs/research/ledger.md`.
- PL §2.6: `docs/product/` holds templates only (`cycle-charter`, `brief`, `package`, `readout`, `event-plan`) plus `variant-testing-runbook.md`. `docs/research/` holds "the raw reports, archived". R14's `docs/research/ledger.md` is the atomic-observation ledger, a different use of the same folder name.

**CF-14 — References layout.**

- PL §2.6: `docs/references/{laws-of-ux, canons, practitioners, books}` plus `README.md`.
- R11 §3a: `{_meta, _raw, anthropic, ai-building, product, design, design-engineering}`.
- R12b §6: `books/{craft, product, taste}`.
- R14 §1.8: adds `wcag22/`, `conventions/`, `map-ui/`, `dense-ui/`.

**CF-15 — Index files for references.**

- PL §2.6: `docs/references/README.md`, "task type → files to load".
- R13: `laws-of-ux/index.md`, a router capped at three files.
- R11 §3a: `_meta/INDEX.md` ("every file: path, score, tier, coverage, last_extracted, review_by").

**CF-16 — Frontmatter schemas (five).**

- PL §2.7: title, description, layer, status (draft \| ruling \| adopted \| superseded \| archived), thread, role, date, supersedes, load_when.
- R14 §2: "`owner`, `last_reviewed` and `load_when`", in frontmatter or "a leading HTML comment".
- R11 §3b: source, authors, source_type, form, priority_score, tier, canonical_url, items, date_range, last_extracted, review_by, coverage, access, verification, overlaps_with, exclusions.
- R13 law files: name, family, laws, load_when, budget, source.
- R12b: title, thread, role, date, status, depends_on.

**CF-17 — Em dashes in filenames.**

- RG §3: "using an em dash (`—`), not a hyphen".
- PL §2.7: role files keep `Name—kebab-title-role-prompt.md`; research files use `NN-slug—role.md`.
- R14 §3: "a tokenization and grep hazard for agents [J] … Keep for human-browsed role files if you insist; never for paths agents construct".

**CF-18 — House skill names.**

- SC and PL §2.6: `.claude/skills/ui-critic/`, `ui-diverge/`, `motion/`.
- R04 Load order: "Prefix house skills (for example `plumb-ui-critic`)".
- R14 §1.4: `plumb-ui-critic/`, `plumb-ui-diverge/`, `ui-code-lint/`.
- R07b §5: "rename the folder and `name` to `plumb-motion`".

**CF-19 — Where third-party skills go.**

- PL §2.6: `.claude/skills/_adopted/` ("third-party, pinned, with the review note").
- R04 and R14 §1.4: `.claude/skills/shadcn/` (pinned) and `.claude/skills/ui-code-lint/` (a house-edited copy of Vercel's guidelines). Whether ui-code-lint is "adopted" or "house" is not stated in either.

**CF-20 — Roles, agents and the critic.**

- PL §2.3: "the agent file should be generated from the role (a small script in `tooling/`), not hand-maintained". The role is canonical and the ui-critic skill is authored separately (P-C).
- R14 §1.3: `.claude/agents/<name>.md` "Thin wrappers (tools, model, a pointer to the role body)".
- R14 §3: "The skill's body is Assay; the role file becomes the skill's reference."

**CF-21 — Folder for universal-form roles.**

- RG §2 and §3: universal roles go in `docs/roles/universal/`.
- PL §2.6: `product-design/ # Compass … Tally`. SC's department list includes Alembic and Tally.
- Alembic's prompt is universal in form (title has no project; §7 is "Intake").

**CF-22 — Package manager.**

- PL §3 Phase 0: "Turborepo with yarn". RG §3: "`yarn directory-map`".
- R04: `pnpm dlx skills add`, "`pnpm exec shadcn info --json`", "`Bash(pnpm exec playwright *)`".

**CF-23 — Path globs against the monorepo.**

- R04 shadcn: "`paths: components/**, app/**, src/**`". R07b motion SKILL.md: "`paths: components/**, app/**, src/**, styles/**`".
- PL §2.6: code lives under `apps/web/` and `packages/ui/`.
- R14 §1.2: `ui.md` (`**/*.tsx`, `packages/ui/**`).

**CF-24 — What the toolkit repo is.**

- PL intro and §2.5: "No product is in scope"; a generic demo app proves the toolkit; built first.
- R14 §2: personal toolkit `taylor-toolkit/` holds universal assets only, vendored into project repos. §4 step 8: "Personal toolkit repo extraction … Only after two projects have proven the assets".
- R14 has no demo app. Its proof run is "give a fresh session only the repo and one brief" for DealReady tables and forms (§5).

**CF-25 — Build order.**

- R14 §4:
  1. Agent context plus budget CI.
  2. Design layer plus domain stories plus lint.
  3. Decisions, glossary, charter.
  4. Metrics files.
  5. DealReady eval set.
  6. Runbooks.
  7. Positioning, OST, ledger.
  8. Toolkit extraction.
  9. References.
- PL §3:
  - Phase 0: scaffold.
  - Phase 1: consolidate.
  - Phase 2: practice layer plus docs app.
  - Phase 3: demo, skills, CI.
  - Phase 4: library.
  - Phase 5: port dry-run.
- Absent from PL: budget CI, metrics files, evals, runbooks. Absent from R14: docs app, demo app, port dry-run. Toolkit extraction is R14's step 8 and PL's starting premise.

**CF-26 — Where the canon lives.**

- PL §2.6: `docs/design/canon.md` ("the merged canon") and `docs/references/canons/{refactoring-ui, shift-nudge, design-plus-code, motion-law}`.
- R07b §1: "The canonical copy is `motion/references/law.md`".
- R14 §3: "anti-patterns.md is canonical" for slop bans.

**CF-27 — Where thread rulings live.**

- PL §2.6: `docs/design/workflow.md` (from 01), `docs/design/skills.md` (from 04), raw reports archived in `docs/research/`.
- R14 §1.5: `docs/design/tool-rulings.md` ("Adopt, mine, defer rulings with dates"); §3: "Thread rulings (04, 13) living in chat outputs … → `docs/design/tool-rulings.md`, `docs/references/*/PROVENANCE.md`".

**CF-28 — Home of the extraction guide.**

- R11 frontmatter: "`save_to: /docs/references/_meta/extraction-guide.md`" (a live guide).
- PL §2.6: thread outputs go to `docs/research/` with `status: archived`.

**CF-29 — Scheduled threads.**

- R14 §6 and Appendix: new threads 15–18.
- PL §3: "Then: the engineering-side prompt, on your instruction", with no 15–18.

## B. Skills

**CF-30 — Motion trigger.**

- R04 trigger table: "manual: `/motion <component>`", `disable-model-invocation: true`.
- R07b §5: "I recommend model-invocable … the 'don't animate' gate has to fire when an agent reaches for motion unprompted".

**CF-31 — frontend-design.**

- R04: "do not install. Mine it."
- R13 How It Plugs In: "**frontend-design and ui-diverge.** Point these at the index only, and only for the layout step."

**CF-32 — GSAP.**

- R04: "deferred … until the motion skill picks a library".
- R07b §5: "close the deferral as **rejected for DealReady and Fybr**".

**CF-33 — Anthropic frontend-aesthetics cookbook.**

- R13 Input Checklist: "Route to thread 04".
- R04 (thread 04's output): no treatment of the cookbook found.
- R11 §5 Batch 1: extracts `anthropic/frontend-aesthetics-cookbook.md`.

## C. Design canon

**CF-34 — Motion line in DESIGN.md.**

- R04: "100–150 ms for feedback and 150–300 ms for state changes" (labeled secondary, via impeccable).
- R07b §5: replace with "Durations come from motion tokens and stay at 300ms or less. Exits run at about 80% of the entrance."

**CF-35 — Modal and drawer duration.** The contradiction originates in Kowalski's own sources.

- R07a A22: "modals/drawers 200–300ms". A23: "200–500ms". Vaul: 500ms.
- R07a (f): "adopt the stricter 200–300ms for DealReady and keep 500ms only for Vaul-style mobile sheets".
- R07b values.md: "pointer and keyboard surfaces use 250ms, and only touch sheets that follow a drag use 500ms".
- Scope differs: one report says DealReady, the other says house-wide.

**CF-36 — Warm neutrals.**

- R08 §6 R10: "DealReady on a warm, low-chroma neutral ramp (start from shadcn's Stone or Taupe base)"; cites "Vesper's 'warm neutrals, never gray.'"
- R04 anti-patterns, Cream background: "the neutral surface token at chroma toward the brand hue, not toward warmth by default."

**CF-37 — Default typeface.**

- R04 "Inter everywhere"; R08 B4 "A neutral sans picked as the safe default"; R09 rejects "Inter, Geist, and Manrope".
- R06b §1.2: Shift Nudge's "Start With System Fonts" reads as "System fonts are the default and a custom face is a deliberate later step" ([INFERRED] from the title) — "Worth reconciling".

**CF-38 — 16px floor.**

- R06a T6 (SK): "unless there is a strong accessibility-aware reason not to".
- R06a T15 (AX): "Primary body copy no smaller than 16px" (no exception).
- R06b §4: proposed split between reading text and tabular data.

**CF-39 — Job lists.**

- R07b L1, motion: "Feedback … State change … Spatial relationship … Continuity".
- R09 C-2, motion: "state, causality, hierarchy, continuity or spatial change".
- R09 C-1, elements: "information, state, action, hierarchy, meaning".
- R06b, IIDS 10: "Motion clarifies relationships and supports continuity".

**CF-40 — Severity scale.**

- R13 and R07b: "Blocking / Should-fix / Consider".
- R14 §1.2: "Vercel P0 to P3 severity".

**CF-41 — Google's DESIGN.md.**

- R09 §6: "I lean yes for `DESIGN.md` only".
- R01 §1 Stitch: "our `DESIGN.md` is a governing law with examples and counter-examples; Stitch's is a token/rules file for generation. Same name, different job; don't let one overwrite the other."

**CF-42 — Loop tools: shared context against ruling 01.**

- SC: divergent loop "best on a canvas — Figma, Paper, Stitch, Claude Design"; Recipe A step 3 "Optionally the same brief in Stitch or Claude Design"; polish loop "Cursor Design Mode, Figma as a scalpel".
- R01: Stitch on the ignore list; Claude Design "never as a loop tool"; Design Mode is "a pointer"; Figma-as-scalpel "lands in the wrong place".

## D. Product operating system and measurement

**CF-43 — Discovery cadence.**

- R05 charter 12: "Three customer conversations a week".
- R10 §6: DealReady "three a week is the target; set a **floor of two**"; Fybr "two conversations a week".

**CF-44 — Readout cadence.**

- R05 charter 11: a readout each cool-down (every two weeks).
- R14 §1.7: "Weekly written readout".
- R03 §6 and §5.2: a readout per variant window, plus "Recheck the thresholds once a quarter".

**CF-45 — Event naming.**

- R03 §4.2: "`object_action`, snake_case, past tense" (e.g. `insight_verified`).
- R14 Primer 18 and §1.7: PostHog's "`category:object_action` with present-tense verbs" as "the default candidate".

## E. Library

**CF-46 — Author overlap between practitioners and books.**

- R11 §5: Torres → `product/teresa-torres.md`; Cagan → `product/marty-cagan.md`; Dunford → `product/april-dunford.md`.
- R12b: `torres-continuous-discovery-habits.md`, `cagan-svpg-product-model.md`, `dunford-obviously-awesome.md`.
- Ownership is unruled (R12b H3).
- R11 §1a also routes "Husain/Shankar" books to the books thread; R12b's corpus has no Husain/Shankar book.

**CF-47 — Kowalski extracted twice.**

- R07a: full inventory (thread 07).
- R11 §1a: routes the animations.dev course to the motion thread, but §5 Batch 4 extracts `design-engineering/emil-kowalski.md` from the free essays (Tier A, 6.3).

**CF-48 — How much verbatim.**

- R11 §2: "at most one short verbatim anchor (under 15 words) per source per batch".
- AL §3.3: source distillations "quote principles in their words with locators".
- R07a and R06a: verbatim atoms throughout.

**CF-49 — Product sections in references.**

- R13: every law file has DealReady and Fybr sections, and the CI lint "fails if a file lacks … both a DealReady and a Fybr section".
- PL intro: "No product is in scope."

## F. Purchases

No disagreement between reports was found. The purchase lines sequence compatibly (R08 §4).
