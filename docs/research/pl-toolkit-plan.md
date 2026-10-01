---
title: "The craft toolkit: regrouped plan"
description: Read only to trace a phase, a layout opinion, or the PL source code the ledger and conflicts cite; its prompts live in docs/prompts/.
layer: research
status: archived
thread: PL
role:
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# The craft toolkit: regrouped plan (1 Oct 2026)

> What this is: the plan for turning the research into a universal boilerplate repo — Turborepo, Next.js, a `packages/` directory on your existing convention, a docs app that renders the library, and a demo app the skills are proven against. No product is in scope. Where I give an opinion on directory layout, the reason is attached and the alternative is named; you make the call. Each prompt says whether it runs in a general Claude thread or in Claude Code.

---

## 1. The end deliverable, restated

One repo. Clone it, and a product team (or you, alone, with agents) has:

- **The practice, in files agents read:** `CLAUDE.md` layering, roles, skills, the design-layer templates, the brief and package and readout templates, the rulings that decide which tool does which job.
- **The library, in files agents load on demand:** Laws of UX by family, the canons from the course reviews, distilled practitioners and books — each with a trigger description so only what a task needs gets loaded.
- **A browsable view of all of it** — the docs app — so you (and anyone you hand it to) can read the practice as a site instead of a file tree.
- **Proof it works** — a demo app with enough real screens to exercise every rubric line, every state in the matrix, and every skill. The critic runs against it in CI. If the demo passes, the toolkit is real.

The test of done: clone into a fresh directory, follow `README.md`, and within a morning the critic is scoring the demo app and the docs site is serving the library. The engineering side (conventions, the engineering departments) gets its own prompt later, on your instruction; the structure below leaves it room without pre-building it.

## 2. Directory organization — opinions and why

### 2.1 Where the markdown source lives: root `docs/`, consumed by `apps/docs`

**Opinion:** keep all human-and-agent-read markdown in a root `docs/` directory, and have `apps/docs` read from it (content directory configured to `../../docs`, or a symlink). Not inside `apps/docs/content/`.

**Why:** the docs app is a view. The source of truth should have paths that don't change if you swap the docs framework, and that look the same in a product repo that clones the toolkit but may not ship the docs app at all. Role prompts, `CLAUDE.md`, and every primer prompt reference paths like `docs/design/DESIGN.md`; burying those under an app couples the practice to a renderer. The role-authoring guide already assumes `docs/roles/<category>/`, so this keeps the convention you have.

**The alternative:** content inside `apps/docs/content/`, with `CLAUDE.md` pointing there. Simpler for the docs framework's defaults; worse for every other consumer. Only choose it if the framework fights a custom content path.

### 2.2 The docs app framework

**Opinion:** Fumadocs (App Router, MDX, sidebar from the file tree, search built in) over Turborepo's bare default docs app, which is just an empty Next.js app. Nextra is the other credible choice; Fumadocs fits App Router more naturally in 2026.

**Why:** the library's value is navigation — task type → the three files to load — and a framework with a file-tree sidebar, frontmatter-driven metadata, and search gives you that for free. The frontmatter schema in §2.6 is designed to double as the docs app's page metadata, so one set of fields serves both agents and the site.

### 2.3 Where roles live, and how agents get them

**Opinion:** the canonical role prompt stays a markdown file in `docs/roles/<department>/`, authored per the guide. For roles that run as subagents inside Claude Code (Assay as the evaluator is the obvious one; Alembic as a synthesis subagent is the second), add a thin `.claude/agents/<name>.md` that carries the subagent frontmatter and embeds or references the role body.

**Why:** one source of truth per role. The guide's whole discipline — scope decision, seven sections, 160-line cap — is about the authored file; the agent definition is packaging. If the two drift, the agent is wrong, so the agent file should be generated from the role (a small script in `tooling/`), not hand-maintained.

**The alternative:** author roles directly as `.claude/agents/` files. Fewer files, but it ties the corpus to one harness and breaks the "inject at the start of any thread" use in general Claude threads, which is most of how you use them.

### 2.4 Templates versus filled examples

**Opinion:** every artifact the toolkit teaches exists twice: a blank `*.template.md` with inline instructions, and one filled example from the demo app. `docs/design/templates/DESIGN.template.md` and `apps/web/docs/design/DESIGN.md`.

**Why:** a template alone leaves an agent guessing what "good" looks like; an example alone gets copied with the demo's content left in. The pair is also how the docs app teaches: template on one page, example on the next. And the filled example is the thing the critic's rubric actually points at when it runs against the demo.

### 2.5 The demo app

**Opinion:** a small, deliberately generic product — not a mock of any client — with just enough surface to exercise the whole rubric and state matrix. Something like a records app: a dense table with sort and filter, a detail view with a diffable document, a form with validation, a settings page, a dialog with a destructive action, an onboarding sequence. Five or six routes, every state in `states.md` reachable by URL parameter so the critic can capture it, Storybook for the components.

**Why:** the critic needs real pixels in real states at real breakpoints, and the motion skill needs real transitions. A generic product keeps the demo portable and keeps client material out of a public-ish boilerplate. Choosing surfaces that are universally hard (dense tables, destructive confirmations, empty and error states) means the demo proves the toolkit on the things that go wrong everywhere, not on a marketing page.

### 2.6 The layout

```
<toolkit>/
  README.md                          # what this is; the port runbook; the timing log
  CHANGELOG.md
  CLAUDE.md                          # root agent context: precedence, where things are, load rules
  turbo.json  package.json  …        # your monorepo convention

  apps/
    web/                             # the demo app (Next.js, Tailwind, shadcn)
      docs/design/                   # the FILLED design layer for the demo (the example pair)
      specs/_example/brief.md        # one filled brief
      .storybook/
      CLAUDE.md                      # nested: app-level conventions, points up to root
    docs/                            # Fumadocs app rendering ../../docs

  packages/                          # your existing convention; I'd expect at least:
    ui/                              # shadcn components + tokens as CSS variables
    config/                          # eslint, tsconfig, tailwind preset
    (anything else your convention already has)

  docs/                              # THE PRACTICE — source of truth, rendered by apps/docs
    index.md                         # the map: what's here, how layers relate, precedence
    decisions/
      ledger.md                      # every ruling, one line, status
      conflicts.md                   # resolved, rule cited
      changelog.md                   # amendments to the practice itself
    roles/
      role-authoring-guide.md
      product-design/                # Compass … Tally
      universal/
      _extensions/                   # Name_ext—<mode>.md (the HUMAN-HAND pattern)
    design/
      README.md                      # the three loops, Recipe A, how the layer is used
      workflow.md                    # tools per loop (from ruling 01)
      skills.md                      # adoption ruling + load order (from ruling 04)
      canon.md                       # the merged canon, Plumb's form, by target file
      templates/
        DESIGN.template.md  tokens.template.md  components.template.md
        anti-patterns.template.md  states.template.md  refs/README.md
    product/
      cycle-charter.template.md      # from 05 (the Fybr/DealReady specifics stripped)
      brief.template.md  package.template.md
      readout.template.md  event-plan.template.md
      variant-testing-runbook.md     # from 03, product names stripped
    references/
      README.md                      # task type → files to load
      laws-of-ux/                    # from 13
      canons/                        # refactoring-ui, shift-nudge, design-plus-code, motion-law
      practitioners/                 # from 11, batch by batch
      books/                         # from 12
    prompts/
      00-shared-context.md
      01…14, P-A…P-E, README.md
    research/                        # the raw reports, archived, frontmatter status: archived
      01-tools-per-loop—plumb.md …

  .claude/
    skills/
      ui-critic/  ui-diverge/  motion/
      _adopted/                      # third-party, pinned, with the review note
    agents/                          # generated from docs/roles for subagent use
    settings.json

  tooling/
    gen-agents.ts                    # docs/roles → .claude/agents
    directory-map.ts                 # your existing convention
```

Two things I'd push back on if you were inclined the other way: don't put `specs/` at the root of the toolkit (it's a per-product artifact; the toolkit ships the template and one example inside the demo app), and don't let `docs/research/` grow without the `archived` status on every file — it's the part of the tree agents should never load by accident.

### 2.7 Naming and frontmatter

- Kebab-case everywhere; role files keep the guide's `Name—kebab-title-role-prompt.md` form; research outputs use `NN-slug—role.md` so the prompt number and the author role are both visible.
- `*.template.md` for blanks. Underscore prefix for generated or meta (`_extensions/`, `_adopted/`, `_example/`).
- Frontmatter on every doc, serving both agents and the docs app:

```yaml
title:            # human title (the long thread titles go here, not in filenames)
description:      # one line — this is the agent's trigger description AND the docs sidebar blurb
layer:            # decisions | roles | design | product | references | prompts | research
status:           # draft | ruling | adopted | superseded | archived
thread:           # prompt number, if it came from one
role:             # authoring role
date:
supersedes:       # path, if any
load_when:        # for references: the task types that should load this file
```

`description` is the load-bearing field: it's what lets an agent decide whether to open the file and what the docs app shows in the sidebar. Write it as a trigger, not a summary.

### 2.8 Emoji

Not inside the repo — agents glob it, prompts reference paths in it, and the git history should be grep-able. Use them on the Finder folder above the repo (`🧰 Product Engineer/` holding `toolkit/`, `📥 inbox/` for raw thread outputs, `📎 attachments/` for the drag-into-a-thread set) or as Finder custom icons on the repo's subfolders via Get Info, which gives the same visual without touching the path.

---

## 3. The phases

### Phase 0 — Scaffold (you, in Claude Code; no primer needed)

You set up the monorepo basics. For the later prompts to assume a known shape, the scaffold should have: Turborepo with yarn; `apps/web` (Next.js App Router, Tailwind, shadcn initialized, Storybook, Playwright installed); `apps/docs` (Fumadocs or your pick, content path pointed at `../../docs`); `packages/ui` and `packages/config` per your convention; empty `docs/`, `.claude/skills/`, `.claude/agents/`, `tooling/`; and a root `CLAUDE.md` with one line: "practice lives in `docs/`; read `docs/index.md` first." Commit that as the baseline so every later step is a diff.

### Phase 1 — Consolidate (general Claude thread)

**Deliverables:** `docs/decisions/ledger.md`, `conflicts.md` (resolved), `docs/design/canon.md` (merged), `docs/index.md` (the map), and the file-by-file filing plan for the twenty outputs into the layout above. **Prompt P-A.**

### Phase 2 — The practice layer (Claude Code, in the repo)

**Deliverables:** every template in `docs/design/templates/` and `docs/product/`; `workflow.md` and `skills.md` from the rulings; roles filed; `tooling/gen-agents.ts` producing `.claude/agents/`; root `CLAUDE.md` written for real; the docs app rendering all of it with working sidebar and search. **Prompt P-B.**

### Phase 3 — The demo app and the skills (Claude Code, in the repo)

**Deliverables:** the demo app's routes and states; its filled design layer (the example pair); `ui-critic`, `ui-diverge`, `motion` installed and run against the demo; the calibration set; adopted third-party skills pinned; a CI job that runs the critic on the demo and fails on a Blocking finding. **Prompt P-C.** This is the phase that proves the toolkit.

### Phase 4 — The library (general Claude threads, batched)

**Deliverables:** `docs/references/` populated — Laws of UX filed from 13, canons from 06/07/08/09, then practitioners (11) and books (12) one batch per week. These prompts already exist; **P-D** is the short retargeting note that goes with each batch so files land with the right frontmatter and path.

### Phase 5 — The port dry-run (Claude Code, fresh directory)

**Deliverables:** clone the toolkit into an empty directory, follow `README.md` cold, time every step, fix what breaks, write the port runbook and timing log into the README. **Prompt P-E.** After this, the toolkit is ready for whatever product comes next — and that's the first moment any product enters the picture.

Then: the engineering-side prompt, on your instruction.

---

## 4. The primer prompts

### P-A — Consolidation and the map (general Claude thread, Opus)

**Inject:** Alembic (message 1), then Plumb (message 2). **Attach:** `00-shared-context`; both role prompts; the role-authoring guide; the product-design role coverage report; every output from the fourteen threads — the toolkit map (14), the Plumb rulings (01, 04), the Tally report (03), the Compass charter (05), the Shift Nudge pair (06), the motion pair (07), the Refactoring UI review (08), the Design+Code review (09), the Product Talk review (10), the extraction guide (11), the books plan (12b), the Laws of UX set (13), the Framer investigation (02); and this plan (`toolkit-plan.md`) for the target layout.

**Message 1 — Alembic.**

Alembic — you're on this one. Read your role prompt and the shared context. This is extraction into a repo, not synthesis; nothing enters that isn't in the reports.

The decision this serves: a universal craft-toolkit repo is being built from fourteen threads of research, and every ruling, every canon line, and every file has to land in one known place before anything is written, so nothing is built twice and nothing is lost. The target layout is in the attached plan, §2.6.

The ask. (1) `docs/decisions/ledger.md`: every decision, ruling, verdict, or recommendation across the reports, one line each — the decision in the report's words, source file and section, the role that made it, its stated status (ruled / proposed / conditional / needs a human call), and what it displaces. Grouped by layer: workflow and tools, skills, design canon, product operating system, measurement, library, purchases. Product-specific decisions (anything about DealReady or Fybr) are kept but tagged `[product-bound]` so Plumb can strip or generalize them. (2) `docs/design/_candidates.md`: every line any report proposed for `DESIGN.md`, `tokens.md`, `anti-patterns.md`, `states.md`, or the critic rubric — verbatim, with source and target file, duplicates grouped not merged. (3) `docs/decisions/conflicts.md`: everywhere two reports disagree, both sides with sources, unresolved — including the toolkit map's proposed layout and build order against the plan's §2.6 and §3. (4) The filing plan: a table of every attached file → its target path and frontmatter values under the layout, with product-bound material flagged. (5) `only-you.md`: the calls the reports say only I can make, with their recommendations. Separated notes last.

Run your provenance, inflation, contradiction, and separation tests. Output the five files as fenced blocks with frontmatter per the plan's §2.7. Stop and wait.

**Message 2 — Plumb** (after message 1 returns).

Plumb — read your role prompt; Alembic's five files are in thread. The toolkit is universal: no product in it.

The ask. (1) Resolve `conflicts.md`, one ruling each with the rule cited and the losing argument acknowledged. Where the toolkit map and the plan disagree on layout or order, rule, and say why — the plan is an opinion, not law. (2) Merge `_candidates.md` into `docs/design/canon.md`: deduplicated, every line in your form (principle, example, counter-example), assigned to its target template, source tag kept, product-bound lines generalized or cut. Examples come from the demo app's intended surfaces (dense table, destructive dialog, empty state, onboarding) so the canon and the demo agree from day one. Caps: twelve principles, twenty anti-patterns, fifteen rubric lines. (3) Write `docs/index.md`: the map of the practice — the layers, what each holds, precedence between them, what loads always versus on trigger, and the context budget you recommend per build. (4) Strip the product from the product layer: `cycle-charter.template.md`, `variant-testing-runbook.md`, and the brief and package templates, with the DealReady and Fybr specifics replaced by `[FILL]` sockets and one line each on what goes in the socket. (5) The Phase 2 checklist: the exact files to write in Claude Code, in dependency order, each with its source.

Run your enforceability, displacement, and agent-readability tests on the canon and the index. Output: resolved conflicts, `canon.md`, `index.md`, the stripped templates, the checklist. Not wanted: a canon that keeps everything because every line had a good source, or an index longer than two screens.

---

### P-B — The practice layer and the docs app (Claude Code, in the repo, Opus)

**Inject:** Plumb. **Attach:** `00-shared-context`; Plumb role prompt; the role-authoring guide; P-A's outputs (`ledger.md`, `conflicts.md`, `canon.md`, `index.md`, the stripped templates, the filing plan, the checklist); rulings 01 and 04; all role prompt files; the primer prompts bundle. The repo is open; the scaffold from Phase 0 is committed.

Plumb — you're in the toolkit repo. Read your role prompt, the shared context, and `docs/index.md` from the consolidation thread. The scaffold is committed; you're writing the practice into it.

The ask. (1) File everything per the filing plan: roles into `docs/roles/`, prompts into `docs/prompts/`, research into `docs/research/` with `status: archived`, decisions into `docs/decisions/`. Frontmatter per §2.7 on every file, `description` written as a trigger. (2) Write the templates: `docs/design/templates/*` with inline instructions and a pointer to the filled example that Phase 3 will create; `docs/product/*` from the stripped versions. Each template's instructions say who fills it (which role), when, and what the critic checks it against. (3) `docs/design/workflow.md` from ruling 01 and `docs/design/skills.md` from ruling 04 — product references generalized, the tool-per-loop table and the load order kept exact. (4) `tooling/gen-agents.ts`: reads `docs/roles/**`, emits `.claude/agents/<name>.md` with the subagent frontmatter (name, description as trigger, tools allowed — Assay gets no write tools) and the role body. Run it; commit the output; document that the agents directory is generated. (5) Root `CLAUDE.md` for real: precedence ladder, the load rules (always: index, DESIGN; on trigger: references by `load_when`; never: research), the slop tells by name, the vocabulary constraint, and the pointer to the skills. Nested `apps/web/CLAUDE.md` as the app-level example. (6) Wire the docs app: content path to `docs/`, sidebar grouped by `layer`, search working, frontmatter rendered. Exclude `research/` from the sidebar by default but keep it searchable. Run it and confirm every page renders.

Run your agent-readability test last: a fresh Claude Code session given only `CLAUDE.md` and a one-line brief should be able to say which files it would load and why. Output: the commit, the list of files written, the docs app running, the test result. Not wanted: templates that are really examples with the content left in, or a `CLAUDE.md` over a hundred lines.

---

### P-C — The demo app and the skills (Claude Code, in the repo, Opus)

**Inject:** Plumb for the demo's design layer; Assay as the evaluator persona for the critic; Vesper for the demo's screens. **Attach:** `00-shared-context`; the three role prompts; `docs/design/canon.md`, the templates, `workflow.md`, `skills.md`; the motion skill from Prompt 07 (`motion-skill.zip`); the Laws of UX index from 13; the Shift Nudge `sn-ui-checklist` SKILL.md; the Anthropic harness-design post. Repo open with Phase 2 committed.

This phase proves the toolkit. Three roles in sequence; keep their outputs separate.

The ask. (1) **Vesper — the demo app.** A small generic records product in `apps/web`: a dense table with sort and filter, a record detail with a diffable document view, a form with validation, a settings page, a destructive-action dialog, a three-beat onboarding. Every state in `states.template.md` reachable by URL parameter (`?state=empty|loading|error|partial|offline`), light and dark, reduced-motion honored. Stories for every component. Real copy in-register, no lorem. Spec each screen before building it, in the template's handoff form. (2) **Plumb — the filled example pair.** `apps/web/docs/design/*` — the demo's own `DESIGN.md`, tokens, components, anti-patterns, states, and six annotated refs — filled from the canon and the real codebase, so template and example sit side by side in the docs app. Plus `apps/web/specs/_example/brief.md`. (3) **Assay — the critic.** `/.claude/skills/ui-critic/`: trigger description, the Playwright procedure (390/834/1440, light/dark, reduced-motion, every `?state=`, focus visible) as a parameterized script, the rubric (Assay §3.3 spine + canon rubric lines + anti-patterns by name + Laws of UX loaded by task-type index), the review format, the round cap, the hands-off guard. Three pass and three fail calibration exemplars captured from the demo itself, annotated by rubric line. (4) `ui-diverge` (the three-directions procedure, one axis forced per direction, each as an isolated route) and `motion` (from 07, placed in the load order `skills.md` set). Adopted third-party skills into `_adopted/`, pinned, with their review notes. (5) **Run it.** Critic against every demo route; fix the findings by hand; run round two; show both reviews. Then run `ui-diverge` on one screen and show the three directions. (6) CI: a workflow that builds the demo, runs the critic, and fails on any Blocking finding; stores the screenshot set as an artifact.

Output: the demo running, the example pair, the skills, the calibration set, both reviews, the diverge output, the CI run green. Not wanted: a demo that only has happy paths, or a critic that passes a state it never captured.

---

### P-D — Library batches (general Claude threads; the retargeting note)

The prompts for 11 (practitioners), 12 (books), and 13 (Laws of UX) already exist and already run as batches with Alembic. Add this paragraph to the top of each batch message so files land correctly:

> Target repo layout: files go under `docs/references/<practitioners|books|laws-of-ux>/` with the frontmatter schema attached (title, description-as-trigger, layer: references, status, thread, role, date, load_when). `load_when` lists the task types that should load this file — table, form, onboarding, navigation, error state, dashboard, map, critique, spec, discovery, positioning, metrics. Deliver each file as a fenced block with its path on the first line. The `docs/references/README.md` index is updated in the same batch: add each new file under its task types.

Order: file the Laws of UX set and the four canons first (they're done — one short Alembic session to add frontmatter and the index entries), then one practitioner batch and one book batch per week.

---

### P-E — The port dry-run and the README (Claude Code, fresh directory, Sonnet is enough)

**Inject:** none — this is a procedure, not a judgment call; Plumb reviews the result. **Attach:** the toolkit repo URL.

Clone the toolkit into an empty directory and follow `README.md` as a stranger would, timing every step: install, run the docs app, run the demo, run the critic on the demo, run `gen-agents`, fill one template from the instructions alone. Stop at every step where the README was wrong, missing, or assumed something; log it. Fix the README (not the stranger) and repeat until a cold run completes without a stop. Then write the port runbook into the README: what a product repo copies (templates, skills, roles, `CLAUDE.md`), what it generates (its own design layer, its `_ext` roles), what it never copies (the demo, the research), and the timing log from the clean run.

Output: the README with the runbook and timings, and the list of fixes made. Not wanted: a README that explains the toolkit's philosophy — `docs/index.md` does that; the README gets you running.

---

## 5. Sequence and effort

| Phase | Where | Owner | Rough effort |
|---|---|---|---|
| 0 Scaffold | Claude Code | you | half a day |
| 1 Consolidate | general thread | Alembic → Plumb | one thread, two messages; an hour of your review |
| 2 Practice layer + docs app | Claude Code | Plumb | one long session |
| 3 Demo + skills + CI | Claude Code | Vesper → Plumb → Assay | one to two long sessions |
| 4 Library | general threads | Alembic | one batch per week, ongoing |
| 5 Port dry-run | Claude Code | procedure | an afternoon |

Phase 3 is the one that matters; phases 1 and 2 exist so it has something to run against. If time is short, cut the library's pace, never the demo's coverage.
