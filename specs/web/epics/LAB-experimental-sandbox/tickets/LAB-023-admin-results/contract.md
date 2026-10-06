---
id: LAB-23
size: medium
objective: "The team reads every reviewer's latest review of one experiment on its Results tab, counted with n, so Taylor can choose a design without the numbers overstating the signal."
slice_type: "A read-only tally over guest rows (S25, door 4); the risk is a number that overstates: a mean, a percentage under 10 or across wordings, a superseded version or a team note counted."
non_negotiables:
  - "Reading rules (S25): one rating shows its label; across reviewers, counts per label with n; a % per label, and the median label on labelled scales, only at 10 or more answers on one wording version; never a mean, chart or hero number (A-09)."
  - 'Wording versions are counted apart by the version''s core_version: no count, % or median spans two; "Can''t judge yet" sits apart and is left out of n, % and median.'
  - "Only each reviewer's latest version counts; team notes (team_user_id set) appear in no count; replies count nowhere in beat 1."
  - "One team-only read in packages/db/src/sandbox/results.ts takes (db, viewer, { slug }), refuses a reviewer viewer, returns only that slug's rows, and has its isolation case."
  - "A pure module, apps/web/lib/sandbox/results.ts, produces every number and string, with the threshold as one constant (10); components render it and do no arithmetic."
  - 'Sections in results.md''s order with its Words verbatim; designs as glyph, name and config id; quotes exactly as written, attributed to the code''s label, trimmed only behind "Show all".'
  - "Tables carry a caption and th scope, sections are h2, quotes are blockquote, numbers right-aligned and tabular (C-P10); every results-* key registers in state.ts as team-only, on synthetic fixtures."
devs_call: "The read's SQL and return shape, the view model's shape, how a % is rounded, the component split, and how a failed read becomes the error state."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/admin/results.md"
  - "D-LAB-21"
  - "D-LAB-29"
  - "C-LAB-results-1"
  - "C-LAB-results-2"
  - "C-LAB-results-3"
  - "C-LAB-results-4"
  - "C-LAB-results-5"
  - "C-LAB-results-6"
  - "C-LAB-results-7"
  - "C-LAB-results-8"
truth_files: "none: the approved proposal ux/admin/results.md reaches specs/web/ux/admin/results.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
  - tally
focus:
  - "reading rules: no mean; % and median only at 10+ answers on one wording (tally)"
operator_review: true
planned_paths:
  - "apps/web/app/admin/experiments/[slug]/page.tsx"
  - "apps/web/app/admin/experiments/[slug]/_components/results-*.tsx"
  - "apps/web/lib/sandbox/results.ts"
  - "apps/web/lib/sandbox/results-data.ts"
  - "apps/web/lib/sandbox/results.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/results.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/**"
depends_on:
  - LAB-10
  - LAB-18
out_of_scope:
  - "The layout, header, stale line and tabs: LAB-10. The reviewer page: LAB-22. The team view: LAB-14."
  - "What a version records (answers, order shown, last design before the choice, changed-after-choosing flags): LAB-17, LAB-18."
  - "Exports, charts, means, significance tests: never (S25)."
  - "Beat 2's replies: beat 1 counts none."
criteria:
  - id: C1
    statement: 'With 3 reviewers rating one design, each label shows its count with "n = 3", and the output holds no "%", no median and no mean.'
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: 'With 10 answers on one wording version, a % per label and the median label appear with n; with 9 plus one "Can''t judge yet", neither appears and n is 9.'
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: 'With 10 answers on v1 and 2 on v2, the question shows two blocks under "Asked in two wordings; counted separately.", % and median in v1 only; with 6 and 6, no % or median anywhere, though the total is 12.'
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: 'A reviewer who sent 2 versions is counted once, from version 2; the summary reads "3 of 5 reviewers have sent a review · 41 views · latest versions · core v1" for the synthetic fixture.'
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "A slight preference for the first-seen design, and one for the last design viewed before choosing, are each flagged weak signal; a clear one, and a slight one for neither, are not."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: 'Team notes appear in no count; a comment left after the reviewer''s latest send counts under "Not triaged"; Combine, None of these and No preference show "—" for strength with their count in Total; one design hides Preference.'
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "The order log gives each reviewer's first design, last design before choosing, switches, minutes on each design, choice and changed after choosing, from the view events and the latest version."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "On the local database the results read returns, for one slug, each reviewer's latest version only, their view events and reviewer comments without team notes; no row from a second slug, and a reviewer viewer is refused."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C9
    statement: "Free-text answers render exactly as written, line breaks kept, each attributed to the code's label."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-023-admin-results/evidence/results-quotes.png"
  - id: C10
    statement: "Every results.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-023-admin-results/evidence/results-states.png"
  - id: C11
    statement: "With a screen reader a person moves through the sections by heading, hears each count with its header and n in the text, and hears each quote with its attribution."
    evidence: manual
    reason: "Needs a person with a screen reader. The builder checks captions, th scope, h2 and blockquote in the browser pane, then defers it."
---

# Contract — LAB-23 admin-results

## Build notes

- **Approach:**
  - `packages/db/src/sandbox/results.ts`: `readResults(db, viewer, { slug })`, team-only. It returns reviewers (id, label, first design), each one's latest version (`distinct on (reviewer_id) … order by number desc`), view events and reviewer comments (id, design, kind, created time). Register its isolation case in LAB-3's registry, or the coverage guard fails.
  - `lib/sandbox/results.ts` (pure): `tallyResults(config, data)` returns the summary line, the under-10 line and the seven sections as strings and numbers. `results-data.ts` (`server-only`) binds the db and LAB-8's team member. Model the seam on LAB-10's `admin-experiments.ts` and `admin-experiments-data.ts`.
  - `[slug]/page.tsx` replaces LAB-10's placeholder. `_components/results-*.tsx` render the model on `Table` and `Collapsible`. The offline line is the only client leaf.
- **Decisions that apply:**
  - D-LAB-21: "A rating changed after choosing is allowed and marked", because "Choice-supportive memory, logged".
  - D-LAB-29: "`/admin` also says 'design'; 'version' means only a review send ('version 2 of 3')".
  - S25 (brief): "A percentage, and a median for the labelled scales, are added once a question has at least 10 answers on the same wording version, always shown with n." "No mean is shown on a labelled scale: its points are ordered but not evenly spaced." "A slight preference that matches the first-seen or last-seen variant is flagged as weak signal."
  - D-LAB-14 (experimental/overview.md): "Team visits are not counted in views or the order log."
  - R6 (D-LAB-38): "`/admin/experiments/<slug>` is Results."
  - R2 (D-LAB-34): "Isolation is proven by tests."
- **Interfaces:** `readResults` and its row types; `tallyResults`, `RESULTS_MIN_N = 10`, `medianLabel(labels, answers)`; the `results-*` state keys.
- **Per path:**
  - `page.tsx`, `_components/results-*.tsx`: the sections, the states, "See them on the page" to `/experimental/<slug>?design=<id>`, names to `…/reviewers/<reviewer-id>`.
  - `results.ts`, `results-data.ts`, `results.test.ts`: the tally and C1 to C7, test names starting with the criterion id.
  - `state.ts`: the ten keys.
  - `packages/db`: the read, its export, its isolation case and C8.
- **Gotchas:**
  - The wording version is the version row's `core_version`. `[ASSUMPTION: config questions carry no version of their own, so each answer counts under its version's core_version.]`
  - Count per question: 9 answers plus one "Can't judge yet" is n = 9, under 10.
  - `[ASSUMPTION: with an even n whose two middle answers differ, the median reads "between Moderately well and Very well"; never an interpolated point.]`
  - Last design before choosing comes from the version (LAB-18 stores it), never re-derived from events. First-seen is `first_design`.
  - `[ASSUMPTION: time on a design is the gap from each load or switch to that reviewer's next event, capped at 30 minutes; the last event counts nothing. "41 views" counts load events.]`
  - "Not triaged" is a reviewer comment whose id is absent from the latest version's `triage`.
  - Web tests run only from `lib/**/*.test.ts`, so every string the criteria name lives in the pure module. `test:db` runs only locally. Fixtures are synthetic (`pricing-2026`, invented labels).
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model adds an "average rating" column or computes % over all versions, which is the overstatement S25 forbids.
