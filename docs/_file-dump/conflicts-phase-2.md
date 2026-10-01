---
title: Conflicts — resolved
description: Read before changing a path, schema, skill, cadence or canon line that two threads disagreed on; each conflict has one ruling, the rule it rests on, and the losing argument.
layer: decisions
status: ruling
thread: P-A
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# Conflicts — resolved

Each entry gives the ruling, the rule it rests on, and what the losing side had right. Source codes are as in `ledger.md`. The plan (PL) is weighed as an opinion, not as law.

## A. Repo layout and build order

**CF-01 — Root agent file.**

- **Ruling:** `AGENTS.md` is the contract. `CLAUDE.md` is a shim containing `@AGENTS.md`, `@docs/index.md`, and Claude-only lines.
- **Rule:** the system lives where the product is built. This toolkit is copied into repos that more than one agent works in, and Claude reads only `CLAUDE.md` when both files exist (R14, verified against the docs).
- **Losing:** PL's single `CLAUDE.md` is simpler. That holds for a Claude-only repo, which this is not meant to stay.

**CF-02 — What loads always.**

- **Ruling:** Always-on is `AGENTS.md`, the shim, `docs/index.md` and the skill listing. The design layer loads by path, through `.claude/rules/ui.md` on UI files. Slop tells are named once, in `canon.md` §2 (and in a product's `anti-patterns.md`), and `AGENTS.md` points there.
- **Rule:** displacement, and "the same rule living in two places" is refused.
- **Losing:** PL and SC, which want the tells visible on every task. On non-UI work they are noise, and on UI work the path rule loads them anyway.

**CF-03 — Size caps.**

- **Ruling:** `AGENTS.md` ≤100 lines, shim ≤20, `docs/index.md` ≤80 lines. Always-on total ≤4,000 tokens, enforced by `tooling/budget.ts`.
- **Rule:** enforceability. The token budget is the real contract; the line caps keep each file honest.
- **Losing:** R14's 120 lines. The extra 20 aren't needed once the map lives in `index.md`.

**CF-04 — Path-scoped rules.**

- **Ruling:** adopt `.claude/rules/{ui,ts,testing}.md` with `paths:`, and add them to the layout.
- **Rule:** displacement. UI law should cost nothing on backend work.
- **Losing:** PL's fewer moving parts.

**CF-05 — The map.**

- **Ruling:** one map, `docs/index.md`. No `docs/README.md`.
  - `LOADING.md` folds into the index's load table, which `budget.ts` reads.
  - `directory-map.ts` writes `docs/_generated/directory-map.md`, which is a listing, not a map.
  - RG's "update `docs/README.md`" becomes `docs/index.md`.
- **Rule:** one rule, one place.
- **Losing:** R14's hand-kept per-file token counts. Those now come from CI output.

**CF-06 — Decision records.**

- **Ruling:** three files with three jobs.
  - `ledger.md`: the index, one line per decision.
  - `records/NNNN-slug.md` (from `decision.template.md`, MADR-minimal): only for decisions whose reason needs more than a line.
  - `changelog.md`: amendments to files.
- **Rule:** every ruling is recorded with its reason. A one-liner has no room for a large reason, and 150 per-file records aren't readable.
- **Losing:** R14's per-file-only scheme, and PL's ledger-only scheme.

**CF-07 — Specs.**

- **Ruling:** no root `specs/` in the toolkit. The templates live in `docs/product/`; the example lives in `apps/web/specs/_example/`. Product repos use root `specs/<feature>/`, and the port runbook says so.
- **Rule:** the toolkit carries no product work.
- **Losing:** path parity between toolkit and product, which the runbook preserves on paper.

**CF-08 — Brief and package.**

- **Ruling:** two templates, `brief.template.md` (frame, the "Frame go" gate) and `package.template.md` (clarity, the "Bet" gate). They are filled into `specs/<feature>/brief.md` and `package.md`. There is no `spec.md` and no `tasks.md`; builders own scopes (R05). The fields merge SC, R05 and R14; see the templates.
- **Rule:** two checkpoints need two artifacts (Singer, via R05). R14's "one file" was about brief versus `spec.md`, which this keeps.
- **Losing:** R05's single file. It has fewer files, but the frame is approved before the package exists.

**CF-09 — Metrics.**

- **Ruling:** `docs/metrics/` is its own layer: events, versioned definitions (both series kept), readout and experiment templates. The package's event plan cites event IDs. Definitions never live in a brief. PL's two product-layer templates move here.
- **Rule:** "metric definitions are a public API" (Tally, via R14). A brief retires when its feature ships.
- **Losing:** R03's definition-in-the-brief, which is convenient once and lost the next time.

**CF-10 — Evals.**

- **Ruling:** `docs/evals/` ships three templates (surface card, failure-mode catalog, binary judge) and nothing filled, because the demo has no AI surface. Skill trigger tests live with each skill, at `.claude/skills/<name>/tests/triggers.md`, so they vendor with it.
- **Rule:** universal assets go in the toolkit and cases go in products (R14's own §2 split).
- **Losing:** R14 step 5's urgency. It is real, but it is product work.

**CF-11 — Runbooks.**

- **Ruling:** `docs/runbooks/` holds four files: `onboard-agent.md`, `variant-testing-runbook.md`, `release.template.md`, `postmortem.template.md`. Weekly rituals are cut, because the charter's cool-down already covers them. Human onboarding goes into README's port runbook.
- **Rule:** displacement.
- **Losing:** R14's five runbooks.

**CF-12 — Design-layer files.**

- **Ruling:** PL's template-plus-filled-example pair stands.
  - Add `coverage-gaps.template.md`.
  - Exemplars live only in the critic skill's calibration set.
  - No `tool-rulings.md` (see CF-27).
  - `docs/design/README.md` becomes `index.md` (see CF-15).
- **Rule:** the example test, and one place per artifact.
- **Losing:** R14's builder-readable exemplars. Builders get their examples from the canon instead.

**CF-13 — Product layer.**

- **Ruling:** ship the cycle-charter, brief, package and glossary templates now. Product charter, roadmap, positioning, OST and discovery-ledger templates wait for thread P-H. In the toolkit, `docs/research/` means archived reports; product repos keep observations in `docs/discovery/`.
- **Rule:** the canon is curated, not accumulated. No template ships for unresearched work.
- **Losing:** R14's full product layer: the right shape, without earned content.

**CF-14 — References layout.**

- **Ruling:** `docs/references/{index.md, laws-of-ux/, canons/, practitioners/, books/, _meta/}`.
  - `practitioners/` and `books/` are flat, one file per person or book; subject lives in `load_when`.
  - Sibling folders (`wcag22`, `conventions`, `map-ui`, `dense-ui`) arrive with their threads.
  - No `_raw/` in the repo: transcripts stay in the inbox outside it.
- **Rule:** subject folders collide (Torres is both "product" and "books"), and third-party transcripts don't belong in a shared repo.
- **Losing:** R11's and R12b's browse-by-subject. The docs app does that from frontmatter.

**CF-15 — Routers.**

- **Ruling:** one router, `docs/references/index.md`, maps each task type to at most 3 files across all reference folders.
  - The `laws-of-ux/index.md` table becomes the router's laws rows.
  - Every folder's landing page is `index.md`, per Fumadocs.
  - No `_meta/INDEX.md`; status lives in frontmatter.
  - The critic's R13 line now points at `docs/references/index.md`.
- **Rule:** one place. R13's own cap already counts across sources.
- **Losing:** R13's self-contained folder, which is portable but drifts as a second router.

**CF-16 — Frontmatter.**

- **Ruling:** PL §2.7 is the base schema everywhere, with these changes.
  - `role` means the owning role, and `last_reviewed` is added.
  - The `layer` enum gains `metrics`, `evals`, `runbooks`.
  - References add `source`, `source_type`, `review_by`, `verification`, `coverage`, `exclusions`.
  - Law files add `family`, `laws`, `budget`.
  - R11's `priority_score` and `tier` stay in `_meta`.
  - HTML-comment metadata is rejected, because the docs app can't read it.
  - Enforced by `tooling/lint-frontmatter.ts`.
- **Rule:** enforceability.
- **Losing:** R14's zero-token comments. About 40 tokens per loaded file is accepted.

**CF-17 — Filenames.**

- **Ruling:** ASCII kebab-case for every path, roles included (`alembic-research-synthesizer.md`, `01-tools-per-loop-plumb.md`). The em-dash title moves into `title`.
- **Rule:** enforceability. `gen-agents.ts` and the primer prompts construct these paths, and shells and grep break on the em dash.
- **Losing:** RG's convention and its visual distinction. This overrides a convention you set; your veto stands.

**CF-18 — House skill names.**

- **Ruling:** prefix `tk-`: `tk-ui-critic`, `tk-ui-diverge`, `tk-motion`, `tk-ui-code-lint`.
- **Rule:** R04's anti-shadowing reason. The prefix belongs to the house, not to a role; the critic is Assay's and motion is Vesper's.
- **Losing:** shorter unprefixed names, which any personal skill could shadow.

**CF-19 — Third-party skills.**

- **Ruling:** flat `.claude/skills/<name>/`, with no `_adopted/` level. Claude Code documents skills at `.claude/skills/<name>/SKILL.md`, and a nested level is undocumented `[verify in Phase 2]`. Third-party skills keep their names (`shadcn`), with provenance in `.claude/skills/REGISTRY.md`. Vercel's lint, edited and pinned, is now ours: `tk-ui-code-lint`, with a provenance header.
- **Rule:** the source of truth has to load.
- **Losing:** PL's visible separation, which `REGISTRY.md` provides instead.

**CF-20 — Roles, agents, critic.**

- **Ruling:** `gen-agents.ts` generates `.claude/agents/` from `docs/roles/`.
  - The rubric lives in `canon.md` §3.
  - `tk-ui-critic` holds the procedure and reads the canon.
  - The Assay role holds the judgment and points to both.
- **Rule:** one source per thing; hand-written wrappers drift.
- **Losing:** R14's "the skill's body is Assay". It merges persona into procedure, and general threads lose an injectable role.

**CF-21 — Role folders.**

- **Ruling:** in the toolkit every role is universal, so folders are departments: `docs/roles/product-design/` (Alembic included), later `engineering/`. Project extensions live in product repos at `docs/roles/_extensions/`. RG is amended accordingly.
- **Rule:** RG's `universal/` folder served a repo that mixed both kinds.
- **Losing:** RG's rule. It was right for its repo.

**CF-22 — Package manager.**

- **Ruling:** yarn. R04's commands become `yarn shadcn …`, `yarn playwright …`, `yarn dlx skills add …`.
- **Rule:** the nearest local rule is your convention.
- **Losing:** R04's pnpm, which appeared in examples, not as a decision.

**CF-23 — Globs.**

- **Ruling:** written against the monorepo: `apps/*/app/**`, `apps/*/src/**`, `packages/ui/**`, `**/*.tsx`. `onboard-agent.md` verifies that every rule and skill fires on a demo file.
- **Rule:** enforceability.
- **Losing:** nothing. The originals assumed a single-app repo.

**CF-24 — What the repo is.**

- **Ruling:** PL. The toolkit is built first and proven on the generic demo. Kept from R14: vendor with provenance headers, never symlink, and personal scope holds preferences only.
- **Rule:** the demo exercises every rubric line and state on day one (PL §2.5).
- **Losing:** R14's "only after two projects have proven the assets". The risk is real: demo-proven is not product-proven. It is mitigated by Phase 5 and by a pruning review, recorded in the changelog, after the first product port.

**CF-25 — Build order.**

- **Ruling:** PL's phases, with R14's enforcement-first order inside Phase 2. Agent context, budget CI and frontmatter lint come before any practice file. Metrics, evals and runbook templates join Phase 2. Product steps leave the toolkit.
- **Rule:** "enforcement and evals before more prose" (R14), applied to the part a toolkit can do.
- **Losing:** R14's product-first steps 1–9, and PL's prose-first Phase 2.

**CF-26 — Canon versus law files.**

- **Ruling:** `canon.md` is the universal floor. A product's `DESIGN.md` inherits it and may tighten it, never loosen it. The motion law stays canonical in `.claude/skills/tk-motion/references/law.md`; C-P11 points to it. No `canons/motion-law.md`. `canons/` holds source distillations, which are references, not law.
- **Rule:** one rule, one place; law and source are different things.
- **Losing:** PL's motion-law canon, which would have duplicated `law.md`.

**CF-27 — Where tool rulings live.**

- **Ruling:** `workflow.md` and `skills.md`, each with dated rulings and a changelog. No `tool-rulings.md`.
- **Losing:** R14's single file, which would be a third place for the same rulings.

**CF-28 — Live procedures.**

- **Ruling:** R11 and R12b go to `docs/references/_meta/extraction-guide.md` and `books-plan.md`, status `draft` until you approve them. They are not archived.
- **Losing:** PL's archive-everything rule, which is right for finished reports only.

**CF-29 — New threads.**

- **Ruling:** renumber to avoid the existing `prompts/15`:
  - **P-F** agent context: after Phase 3 and before Phase 5, because multi-tool parity matters at port.
  - **P-G** measurement layer.
  - **P-H** product artifacts.
  - **P-I** AI evals, generalized from DealReady.

  You commission each.

- **Losing:** R14's numbering and its DealReady framing.

## B. Skills

**CF-30 — Motion trigger.**

- **Ruling:** `tk-motion` is model-invocable, with R07b's narrow description and paths, on condition that it passes its trigger test (fires on at most 1 of 5 non-motion tasks). If it fails, it becomes manual-only and the critic carries the motion line.
- **Rule:** the law must sit upstream of generation. An agent reaching for a transition unprompted is exactly when the "don't" has to be loaded.
- **Losing:** R04's manual-only, which avoids hijacking. The trigger test is the guard.

**CF-31 — frontend-design.**

- **Ruling:** R04 stands; it is not installed. R13's line becomes "`tk-ui-diverge` reads `docs/references/index.md` for the layout step."
- **Losing:** R13, which was written before R04's rejection was applied.

**CF-32 — GSAP.**

- **Ruling:** rejected for product UI. Deferred for marketing sites, which have no layer in the toolkit yet.
- **Rule:** no new library without justification. CSS plus `motion/react` covers the whole catalog (R07b).
- **Losing:** R04's deferral, whose condition has now been met.

**CF-33 — Frontend-aesthetics cookbook.**

- **Ruling:** it is a reference, extracted in R11 Batch 1 to `practitioners/anthropic-frontend-aesthetics.md`. Anything it proposes for the canon enters by amendment.
- **Losing:** R13's routing to thread 04, which never covered it.

## C. Canon

**CF-34 — Motion line.**

- **Ruling:** R07b's line (C-P11). R04's line is retired.
- **Rule:** primary sources outrank secondary ones; R04 labeled its own line secondary.
- **Losing:** R04's shorter numeric line.

**CF-35 — Dialog duration.**

- **Ruling:** 250ms for dialogs and sheets opened by pointer (0ms by keyboard, per L3). 500ms only for touch sheets following a drag. This applies house-wide.
- **Losing:** R07a's version, which was scoped to DealReady.

**CF-36 — Neutrals.**

- **Ruling:** neutrals are tinted, with the temperature chosen per product and stated in tokens. Warmth is not a default. Cream and paper surfaces stay a tell (A-06).
- **Losing:** R08's warm example (product-bound), and any reading of R04 as "never warm".

**CF-37 — Typeface.**

- **Ruling:** the tell is the unexamined default, not any one face. Tokens declare the typeface with a one-line reason. A system stack chosen for a reason passes; Inter, Geist or Manrope picked because they were there fails (A-01). Lint: `font-family` only from tokens.
- **Losing:** R09's flat list of banned faces.

**CF-38 — Type floor.**

- **Ruling:** reading text is ≥16px. Tabular data may go down to a declared minimum, `[PROPOSED — needs sign-off with the accessibility auditor]` 12px, and must pass zoom at 200% and 400%. Cost of being wrong: a table that fails low-vision users, which the zoom test exists to catch.
- **Losing:** AX's no-exception floor, which makes dense tables impossible.

**CF-39 — Job lists.**

- **Ruling:** two lists for two scopes.
  - Elements name one of information, state, action, hierarchy, meaning (C-P12).
  - Motion names one of feedback, state change, spatial relationship, continuity (C-P11; rubric M1).

  R09's "causality" folds into feedback and state; its "hierarchy" folds into L19.

- **Losing:** R09's five-way motion list.

**CF-40 — Severity.**

- **Ruling:** Blocking / Should-fix / Consider everywhere.
- **Rule:** one scale, and it is the one the critic, the Laws of UX files and the motion review already use.
- **Losing:** R14's P0–P3, which is finer but used nowhere.

**CF-41 — Google's DESIGN.md format.**

- **Ruling:** R01. The house `DESIGN.md` does not conform. If a sanctioned tool ever needs that format, generate an export; never hand-maintain one.
- **Losing:** R09's interoperability lean.

**CF-42 — Tools per loop.**

- **Ruling:** R01 supersedes SC's tool lists. The universal `00-shared-context` is rewritten in Phase 2 from `workflow.md`.
- **Losing:** SC, which predates ruling 01.

## D. Product operating system and measurement

**CF-43 — Discovery cadence.**

- **Ruling:** a charter socket for target and floor, defaulting to target 3 and floor 2.
- **Losing:** R05's single number. A thin week then reads as failure instead of the floor holding.

**CF-44 — Readout cadence.**

- **Ruling:** one readout per cycle, in cool-down. Each variant window closes with its own readout. Thresholds are rechecked quarterly. The weekly readout is cut.
- **Losing:** R14's weekly readout. At two-week cycles and small n it doubles the ceremony without new data.

**CF-45 — Event names.**

- **Ruling:** R03's v0.1 stands: `object_action`, snake_case, past tense; a category prefix is optional. A change goes through P-G as a versioned amendment that keeps both series.
- **Rule:** the measurement owner's shipped convention outranks an untested candidate.
- **Losing:** PostHog's present-tense recommendation, which is documented but untested here.

## E. Library

**CF-46 — Author overlap.**

- **Ruling:** split by era. `books/` owns the book's framework; `practitioners/` owns the author's later work; each links the other. Husain and Shankar go in `practitioners/` until a book entry exists. Your H3 call can override this.

**CF-47 — Kowalski.**

- **Ruling:** convert R07a into `practitioners/emil-kowalski.md` (frontmatter and atom IDs only, no re-extraction). R11 drops Kowalski from Batch 4.

**CF-48 — Verbatim.**

- **Ruling:** R11's cap governs every file in the repo: one verbatim anchor under 15 words per source per file, everything else labeled paraphrase, numbers exact. Archived reports heavy with third-party text (06a, 07a, 13) stay out of the repo if it is or may become public; they go to the inbox instead. A private repo may archive them.
- **Rule:** a toolkit headed into other repos cannot carry other people's text (Laws of UX is CC BY-NC-ND).
- **Losing:** AL's "in their words", which is kept within the cap. Whether the repo is public is your call.

**CF-49 — Product sections in references.**

- **Ruling:** cut. Each law file's applications become Example and Counter-example on demo surfaces. The lint clause becomes "has both Example and Counter-example."
- **Losing:** R13's product specificity. The demo is specific enough to keep the swap test honest.
