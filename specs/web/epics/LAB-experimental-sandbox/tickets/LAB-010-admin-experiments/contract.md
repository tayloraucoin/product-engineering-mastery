---
id: LAB-10
size: small
objective: "The team sees every experiment with its status, counts and last activity, and which closed ones still hold reviewers' data; each experiment opens under one layout with its title, status, stale line and tabs."
slice_type: "A list and a layout over per-slug counts (gap 4, D-LAB-24 to 26); the risk is a marker that miscounts days or hides held data, a count that crosses slugs, or a Delete data link a developer can reach."
non_negotiables:
  - "Counts come from one team-only function in packages/db/src/sandbox/ that returns numbers and one date per slug, never a label, email or row, with its isolation case in packages/db/test/sandbox/; a reviewer viewer is refused."
  - "Days since close count from the config's closedOn in Europe/London (LAB-4's time.ts), never from a row or a UTC date; the marker shows from the day of close."
  - "Last activity is the latest reviewer view, comment or send; team notes and team visits never count (D-LAB-14)."
  - "Delete data renders for admins only, on the row and under the experiment's heading, and links to /admin/experiments/<slug>/data; a developer sees the marker without it."
  - "apps/web/app/admin/experiments/[slug]/layout.tsx calls requireTeamPage, then findExperiment; an unknown slug is notFound() before any database read."
  - "Tabs Results, Reviewers, Access codes, Data, in that order, each its own route with aria-current; each tab's page belongs to its own ticket."
  - "experiments.md's Words verbatim; status is a word, never colour alone; numbers right-aligned and tabular; the marker has no alarm colour (A-19)."
devs_call: "The pure module's shape, the query's SQL, sorting inside data-table, the relative-date helper, and how a failed count becomes the partial state."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/admin/experiments.md"
  - "D-LAB-24"
  - "D-LAB-25"
  - "D-LAB-26"
  - "C-LAB-expts-1"
  - "C-LAB-expts-2"
  - "C-LAB-expts-3"
  - "C-LAB-expts-4"
  - "C-LAB-expts-5"
  - "C-LAB-expts-6"
truth_files: "none: the approved proposal ux/admin/experiments.md reaches specs/web/ux/admin/experiments.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/admin/experiments/page.tsx"
  - "apps/web/app/admin/experiments/_components/**"
  - "apps/web/app/admin/experiments/[slug]/layout.tsx"
  - "apps/web/app/admin/experiments/[slug]/page.tsx"
  - "apps/web/app/admin/experiments/[slug]/_components/**"
  - "apps/web/lib/sandbox/admin-experiments.ts"
  - "apps/web/lib/sandbox/admin-experiments-data.ts"
  - "apps/web/lib/sandbox/admin-experiments.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/**"
  - "packages/db/test/sandbox/**"
depends_on:
  - LAB-3
  - LAB-4
  - LAB-8
out_of_scope:
  - "Each tab's page: Results LAB-23, Reviewers LAB-22, Access codes LAB-15, Data LAB-16. Deleting data: LAB-16."
  - "Making experiments: they are code (S13)."
  - "The shell, the nav and the guards: LAB-8."
  - "A scheduled purge: out of bounds until D-LAB-24's 90-day trigger."
criteria:
  - id: C1
    statement: "One open and one closed experiment list with title, Open or Closed, the design count and \"5 codes · 2 sent\", open first by last activity, then closed by close date."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "A closed experiment with 3 reviewers holding data shows \"Holds data from 3 reviewers · closed 34 days ago\" on its row and under its heading, and the header line counts it."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "Once its data is deleted the row shows \"—\" and the header count drops; with none left the header line is absent."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "A developer sees the marker on the row and under the heading without \"Delete data\"; an admin's links to /admin/experiments/<slug>/data."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "On the local database the stats function returns, per slug, codes made, reviewers with a version, the latest reviewer view, comment or send (team notes excluded) and reviewers holding data, as numbers and one date only; slugs never mix and a reviewer viewer is refused."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C6
    statement: "Days since close use the London date: at 23:30 UTC in summer a closedOn of the London day before counts 1, never 0 or 2, and the day of close shows the marker."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "An unknown slug under /admin/experiments/ gives not-found with a database stub that throws when called never called; a known slug gives the title, status word and the four tabs in order."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "With keyboard alone: sort, open an experiment, reach \"Delete data\"."
    evidence: manual
    reason: "Needs a person at a keyboard; there is no end-to-end runner (technical.md). The builder walks it in the browser pane first, then hands it over with --verdict deferred."
  - id: C9
    statement: "Every experiments.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-010-admin-experiments/evidence/expts-states.png"
---

# Contract — LAB-10 admin-experiments

## Build notes

- **Approach:**
  - `packages/db/src/sandbox/experiments.ts`: `listExperimentStats(db, viewer, { slugs })`, team-only, one grouped query per table. Register its isolation case in LAB-3's registry, or the coverage guard fails.
  - `lib/sandbox/admin-experiments.ts` (pure): `experimentRows(configs, stats, role, now)` gives rows, sort, markers and the header line; `experimentHeader(config, stats, role, now)` gives the layout's title, status, stale line and tabs. `admin-experiments-data.ts` (`server-only`) binds the db and LAB-8's team member. Model the seam on `apps/web/lib/billing/webhook/handle.ts`; tests sit under `lib/`.
  - `experiments/page.tsx` replaces LAB-8's placeholder. `[slug]/layout.tsx` renders the header and tabs. `[slug]/page.tsx` is Results (R6) and LAB-23's: add a one-line placeholder naming LAB-23 only if it has not landed.
- **Decisions that apply:**
  - D-LAB-24: "Gap 4: the stale-data marker shows from the day of close, and the Experiments header counts such experiments. 'Not enough' means any closed experiment still holding guest data 90 days after close, which brings back the pinned scheduled purge."
  - D-LAB-25: "The config records the date an experiment closed."
  - D-LAB-26: "Only an admin deletes an experiment's data, open or closed. Developers see the counts, not the button. Erasing a reviewer stays open to developers."
  - D-LAB-22 (overview.md): "Each experiment is a page with tabs; the nav is Experiments, People, Data."
  - D-LAB-14 (experimental/overview.md): "Team visits are not counted in views or the order log."
  - R10 (D-LAB-41): "`Europe/London` ... one constant. The config's `closedOn` is an ISO date or null, one field, so closed always has a date."
  - R6 (D-LAB-38): "`/admin/experiments/<slug>` is Results."
- **Interfaces:** `listExperimentStats` returning `{ slug, codes, sent, lastActivityAt, reviewersHoldingData }[]`; `experimentRows`, `experimentHeader`, `daysSinceClose(closedOn, now)`.
- **Per path:**
  - `page.tsx`, `_components/`: the list on the composed `data-table`, its states and the header line.
  - `[slug]/layout.tsx`, `[slug]/_components/`: heading, status word, stale line, tabs.
  - `state.ts`: the `expts-*` keys as `team`, on synthetic fixtures.
  - `packages/db`: the function, its export, its isolation case and C5.
- **Gotchas:**
  - `[ASSUMPTION: a closed experiment holds guest data while any reviewer row remains on its slug, since a label may be an email; LAB-16's delete removes them all.]` "Codes" counts reviewer rows, revoked included.
  - `[ASSUMPTION: singular and same-day forms: "1 closed experiment still holds reviewers' data.", "closed 1 day ago", "closed today".]`
  - Count days between London calendar dates, not by dividing milliseconds.
  - Activity times come from rows (`at`, `client_created_at`, `created_at`); team notes have `team_user_id` and are skipped.
  - The layout's `params` is a promise in Next 16: await it, then guard with the concrete path.
  - Fixtures are synthetic: `pricing-2026` and an invented closed slug.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model counts days in UTC, or reads the slug's rows before checking the registry.
