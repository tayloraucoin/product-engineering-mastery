---
title: "Migrate, layer 3 — the twelve ordered gap tickets, and the prompts the run prints at its end"
description: "Open from step 7 of the migrate guide to draft the gap tickets, and from step 9 to print the prompts. Lists layer 3's twelve parts in order, each as a drafted ticket's Build notes (layer, what did not cross, plan, conflict risk and trigger, estimate), the hosted steps that stop for the operator, and the two prompts that open layer 3 part by part and promote the imported UX spec."
layer: runbooks
status: draft
thread: "MIG"
role: Mason
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when:
---

# Layer 3: the conventions, part by part

> **Open from:** step 7 of [the guide](README.md) to draft the tickets, and step 9 to print the prompts.
> **In one line:** layer 3 is never run on day one. Each part is a drafted ticket under the target's migration epic, in this order, started only when the operator says. Dependencies come first and the parts that rewrite many files come last. None is a codemod: a part's plan is steps a later ticket builds, with the live team in mind.

The example repo is `acme-shop`, prefix `ACM`, epic `MIG-migration`.

## How a part becomes a ticket

For each part below, in order:

```sh
yarn contract:init MIG <slug> --draft
```

Then fill the drafted `contract.md`'s Build notes with the five items from the part's block: **Layer**, **What did not cross**, **Plan**, **Conflict risk** (the flag and the trigger that starts the part), **Estimate** (labelled as an estimate). Its objective is the part's first line; its `qa` is `Q1` unless the block says otherwise (parts 2 and 6 say Q3: schema, money, auth and personal data are Q3 by `AGENTS.md`); its `planned_paths` are the plan's paths. A part the target already satisfies (the report scored it 0) is skipped and the skip is one line in record 0001.

The conflict-risk flag is **high** when the part touches more than about 50 files, or a file the team edits daily (`package.json`, the lint config, the root layout). A high-risk part runs in a window the team names, as the day's last commit, and never alongside a release.

Day one's own gaps are drafted first, from the guide's step 7, then these twelve. The ids are whatever `contract:init` gives; record 0001 lists them.

## The twelve parts

### 1. Toolchain majors

- **Layer:** 3, part 1 (signal S2). Also pins `strict` before any TypeScript 6 upgrade.
- **What did not cross:** the toolchain is off the house set in one or more majors (Yarn 4, Node 22, TypeScript 5, Next 16, React 19, Tailwind 4), as the report's S2 row lists.
- **Plan:** one major per commit, within a stated window and after the minimum release age, each followed by `yarn verify`. Before any TypeScript 6 upgrade, `strict` is written explicitly in `tsconfig.json` at its current value (layer 2, 3.2, step 1 did this where the type check was frozen); TypeScript 6 defaults it to true, and an unpinned repo fails every file at once. Next 15 to 16 follows the framework's own upgrade guide, in its own commit.
- **Conflict risk:** high for a framework major (`package.json`, the lockfile, every route that the major renames). Trigger: a quiet window the team names; never the week of a release.
- **Estimate:** half a day per major; a framework major one to two days. Estimates.

### 2. Database and migrations

- **Layer:** 3, part 2. Q3, with Mason and Warden (schema).
- **What did not cross:** the toolkit's migration check and local database conventions. `migrationsDir` stays the existing folder; nothing moves.
- **Plan:** install the migration check (`check-migrations`, modelled on `packages/db/scripts/check-migrations.ts`), which scans migration contents for DDL against the auth schema and never reads names, so Drizzle's random file names need no rename. Add it to `verify`. A local database follows the operator's choice: their own Postgres (the default), hosted only, or Docker through `docs/runbooks/add/docker-local-database.md` only when Docker is chosen. **Operator:** any hosted migration.
- **Conflict risk:** low (one script, one `verify` step). Trigger: the first ticket that writes a migration under the practice.
- **Estimate:** half a day. An estimate.

### 3. Tests beyond the smoke test

- **Layer:** 3, part 3.
- **What did not cross:** tests. Layer 2 left one smoke test (or markers over the repo's own failing tests).
- **Plan:** the runner question first, as its own ticket if the repo has none (the smoke test runs on `node:test`; a change is a decision, not a drift). Then tests arrive with each feature ticket under the contract loop. Coverage thresholds, once there is coverage to measure: set them rounded down from the first measurement, with an auto-update that only floors. Patch coverage needs a hosted service: **Operator**, and stops.
- **Conflict risk:** low per ticket; the thresholds commit touches CI. Trigger: the third feature ticket with tests, or the operator's call.
- **Estimate:** a day for the runner and the first real tests; thresholds an hour once measured. Estimates.

### 4. Boundaries lint

- **Layer:** 3, part 4 (signal V1).
- **What did not cross:** the layer graph check, `packages/config/eslint/boundaries.js`.
- **Plan:** write the target's element graph (apps import packages; packages never import apps; apps never import each other; the module folders by name; for a root app before part 11, the top-level folders are the elements), install the config, run `yarn eslint . --suppress-all` so today's violations are frozen in `eslint-suppressions.json` (layer 2, 3.1), and add the lint to `verify`. In the target the graph is a Mason one-way door: the ticket is Q2 with Mason, and the graph is a decision record.
- **Conflict risk:** medium (the lint config; the suppressions file touches every violating file's row, not the files). Trigger: part 1 done where ESLint was below 9.24.0; otherwise any time.
- **Estimate:** half a day for the graph, an hour to install. Estimates.

### 5. Env seam

- **Layer:** 3, part 5 (signal V3).
- **What did not cross:** one `process.env` reader per workspace and the tier picker (`docs/engineering/codebase-conventions.md` §5). The report counts the files that read `process.env` elsewhere.
- **Plan:** adopt the repo's existing environment reader where it has one (the report's V3 row names it) or create `env.ts` in each app from the convention, with the tier picker; a lint rule against `process.env` outside `env.ts`, installed with suppressions so the count only falls; then one ticket per module folder that moves its reads behind `env.ts`. `env.ts` is a Warden row in `toolkit.json` from the day it exists.
- **Conflict risk:** high when the count is over 25 (every reader is a file the team edits). Trigger: the lint with suppressions can land any time; the moves follow part 6's module order.
- **Estimate:** half a day for the seam and the rule; the moves a day per 25 files. Estimates.

### 6. SDK seams

- **Layer:** 3, part 6 (signal V5). Q3 per family: billing with Mason, Warden and Chancery; auth with Mason and Warden; email with Warden; AI at Q2 with Mason.
- **What did not cross:** money, auth, email and AI calls behind their module folders. The report lists every importer no reviewer glob matches.
- **Plan:** one ticket per SDK family, in this order: billing, auth, email, AI. Each module's remove recipe is the checklist of what conformant looks like, read backwards: the files, variables, dependencies and boundaries names it would delete are what the module must own (`docs/runbooks/remove/billing.md`, `docs/runbooks/remove/supabase-auth.md`, `docs/runbooks/remove/supabase-database.md`, `docs/runbooks/remove/ai.md`, `docs/runbooks/remove/api.md`, `docs/runbooks/remove/error-monitoring.md`). When a module conforms, its `stack` entry is added to `toolkit.json`, and `check-stack` is installed into `verify` with the first entry. A module the toolkit never had gets an add recipe written the first time, under `docs/runbooks/add/README.md`. Until a family conforms, its `imports` reviewer row (from step 3) keeps every change at the right QA level. **Operator:** vendor dashboards (Stripe webhooks, Supabase settings) when a seam changes an endpoint.
- **Conflict risk:** high per family (the call sites). Trigger: the operator opens one family at a time; billing first because it is money.
- **Estimate:** one to two days per family. Estimates.

### 7. Token preset and token lint

- **Layer:** 3, part 7 (signal V2).
- **What did not cross:** the token preset (`packages/config/tailwind/preset.css`) and the lint that refuses raw colour, spacing, radius, shadow, font and duration values. The report counts the raw values and the files that hold them.
- **Plan:** install the preset beside the repo's own Tailwind config, mapping the repo's existing colours onto the preset's semantic names in one commit; install the token lint with suppressions, so today's raw values are frozen and new ones fail; then one ticket per file cluster that replaces raw values with tokens. `ui.md` drops its "the repo's own components and tokens" line when the preset lands.
- **Conflict risk:** medium (the lint is suppressions; the preset touches the Tailwind config; the replacements touch UI files the team edits). Trigger: after part 9's design layer names the tokens, or earlier for the lint alone.
- **Estimate:** half a day for the preset and lint; the replacements half a day per ten files. Estimates.

### 8. `"use client"` placement

- **Layer:** 3, part 8 (signal V4).
- **What did not cross:** Server Components by default, with a client leaf placed by its importers (codebase-conventions §1). The report gives the share of client files outside one.
- **Plan:** a check with a baseline first: a script that lists every `"use client"` file outside a `_components/` or `components/` folder and compares the count to a committed baseline, ratcheting down as 3.2's count does. The moves come late, one route at a time, each its own ticket, and never as a sweep.
- **Conflict risk:** high for the moves (every moved file is one the team edits); low for the check. Trigger: the check any time; the moves after part 9 settles each surface's states.
- **Estimate:** two hours for the check; a route an hour to move. Estimates.

### 9. Design layer and living truth

- **Layer:** 3, part 9 (signals P4 and V2).
- **What did not cross:** the product's design files (`DESIGN.md`, `tokens.md`, `components.md`, `states.md`, `anti-patterns.md`, `coverage-gaps.md` from `docs/design/templates/`) and the living truth: the UX spec imported to `specs/<app>/_imported/ux/` is read by no agent until it is promoted to `specs/<app>/ux/`.
- **Plan:** the promotion is the UX-spec work the new-project runbook hands to its own thread on the deepest model, and this is the same: the second prompt below opens it. The design files follow in their own thread, from the imported design notes the records round indexed. Neither is written shallow in the migration thread.
- **Conflict risk:** low in code (specs and docs only). Trigger: the operator opens the promotion thread; the first UI ticket under the practice should wait for it.
- **Estimate:** one to three days for the promotion, by the spec's size; a day for the design files. Estimates.

### 10. Format-all commit

- **Layer:** 3, part 10 (signal C5).
- **What did not cross:** the read-only format check in `verify` (layer 2 left it out while `format` writes).
- **Plan:** one commit, in a quiet window the team agrees: `yarn format` over the repo, then add a `format:check` script and put it first in `verify`. Nothing else in the commit, so a rebase across it is a re-format and never a merge.
- **Conflict risk:** high by definition (every file). Trigger: the window; after every open branch the team cares about has merged.
- **Estimate:** an hour, plus the wait for the window. An estimate.

### 11. Shape (far path only)

- **Layer:** 3, part 11 (signal S1).
- **What did not cross:** workspaces and Turbo. The app sits at the repo root; `toolkit.json` says `"path": "."`.
- **Plan:** its own epic in the product repo, opened through the prompt builder, last: the root app moves into `apps/web`, workspaces and `turbo.json` arrive, `toolkit.json`'s app path changes, every path rule's globs change, and `verify` gains the Turbo steps. It is last because every path in the repo changes, and every earlier part's baselines are re-derived in the move commit: `eslint-suppressions.json` is keyed by path and does not follow a moved file, so the commit re-runs `yarn eslint . --suppress-all` and the per-rule totals must not rise; the tagged type lines and `type-baseline.count` move with their files.
- **Conflict risk:** high (every file). Trigger: the operator's call, after parts 1 to 10 that the repo wants, in a window with no open branches.
- **Estimate:** two to three days. An estimate.

### 12. Leftovers from day one

- **Layer:** 3, part 12.
- **What did not cross:** entry-by-entry indexing of the imported decision logs (day one indexed each file with one ledger line), and the per-rule split of the bash guard for a team (day one ruled the whole hook).
- **Plan:** the indexing: one ledger line per entry in each imported log, citing the file and heading, bodies untouched. The split: the guard's rules as separate hooks a team can register one at a time, built in the toolkit first and installed here after the merge-side week passes.
- **Conflict risk:** low. Trigger: the merge-side week passed (the split); any quiet hour (the indexing).
- **Estimate:** half a day each. Estimates.

## Hosted steps that stop for the operator

Named once here; every part above that meets one says **Operator** at the point.

- Every push and merge.
- The first CI run; creating CI, its secrets and branch protection.
- Any hosted database migration.
- Vendor dashboards: Supabase, Stripe webhooks, Vercel environment variables.
- Any coverage or monitoring service.
- Removing worktrees or tracked large files. A large tracked file is documented and never rewritten: moving it to LFS rewrites history, which is out of bounds.

## The prompts the run prints

Step 9 prints both, each in its own block so it can be copied whole, with the placeholders filled from the run. They are printed, never saved as files in the target.

**The layer-3 opening prompt** (one per part the operator opens, starting with the first drafted part the repo needs):

```text
Venue: Claude Code, in <target>, on a branch the operator creates from <protected-branch>.
Model: the deepest available (Fable 5.1 today). A part's plan is a judgment about a live team; a smaller model turns it into a sweep.
Toolkit checkout: <toolkit path>. The recipes and checks a part cites (remove recipes, the boundaries config, the preset, the migration check) live there, not in this repo.

Build <MIG-NNN> (layer 3, part <n>: <part title>).

It is a drafted ticket under specs/_shared/epics/MIG-migration/. Its Build notes hold the layer, what did not cross, the plan, the conflict-risk flag with its trigger, and an estimate. Read them, then the assess report (assess.md) and the rulings (rulings.md) beside it, and record 0001.
The trigger in the Build notes has been met: <how>. The window, if the risk is high: <the window the team named>.
Never a codemod or a bulk rewrite; the plan's steps, one commit each, yarn verify after each. A baseline or suppressions file only falls.
Stop for the operator at every hosted step the ticket names, and before any commit that touches more than about 50 files.
Done when: the ticket's criteria pass, yarn verify exits 0, and the as-built names what the next part needs.
```

**The living-truth promotion prompt** (printed when the records round imported a UX spec):

```text
Venue: Claude Code, in <target>, on the branch that is checked out.
Model: the deepest available (Fable 5.1 today). A smaller model writes screens and misses states.

/tk-prompt

Build the prompt for: promoting the imported UX spec of <app> to living truth, before any UI ticket runs under the practice.
Track: product spec. Lead: Vesper. Support: Compass for what the product is for today, Gloss for the words.
What exists: the imported spec at specs/<app>/_imported/ux/ (<n> files, <versions or areas>, moved byte for byte on <date>), the deviation logs beside their old spec folders (indexed in docs/index.md), and the code as it is now, which has moved since the spec was written.
The work: read the imported spec against the code, surface by surface; write specs/<app>/ux/ from docs/design/templates/ux-overview.template.md and ux-surface.template.md, one overview per area and one file per surface, every reachable state named; where the code and the spec disagree, the code's behaviour is written as the truth and the disagreement is listed for the operator, never silently resolved.
The imported files are not edited or deleted; the promotion gap ticket (<MIG-NNN>) is closed by this thread's as-built.
Done when: a build thread could build any surface from its file without asking a question, and the design-layer thread (layer 3, part 9) can list every token and component the product needs from it.
```
