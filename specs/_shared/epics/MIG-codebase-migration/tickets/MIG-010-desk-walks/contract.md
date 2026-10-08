---
id: MIG-10
size: small
objective: "Three desk walks read the runbook against synapse (near), conscious-connections (middle) and taylor-aucoin (far, walked by Crucible) and every stop they find is fixed in the runbook, so the operator's synapse dry run starts from a procedure that has been walked."
slice_type: "Readings of a procedure against real repos' facts; the risk is a walk that assumes instead of reads, or a stop found and left in the text."
non_negotiables:
  - "A walk is a reading: nothing runs in any of the three repos and nothing is written there; the facts come from the brief's Evidence, MIG-6's capture and read-only looks at the repos."
  - "Each walk follows the runbook step by step and records, per step: what the step would do in this repo, the stop or question it would raise, the ruling the interview would need, the gaps it would draft, and a time estimate labelled as one."
  - "The taylor-aucoin walk is authored by Crucible in fresh context with the role injected and filed byte for byte; the other two by the builder."
  - "Every stop any walk finds is either fixed in docs/runbooks/migrate/ in this ticket or listed as a drafted follow-up in the as-built with the reason it waits."
  - "The walks live at specs/_shared/epics/MIG-codebase-migration/walks/<repo>.md with the date, the repo's commit, and the assess path they read as."
  - "The synapse walk times the records step on its own and names the base branch the real run uses (feature/workflow, pushed 2026-10-06)."
devs_call: "The walk file's section order, how much of each step's text is quoted, and the order the two builder walks are done in."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T5"
  - "T7"
truth_files: "none: readings and runbook fixes; no living UX file changes"
qa: Q2
reviewers:
  - crucible
focus:
  - "the far walk is Crucible's own, written before reading the other two, and its stops are checked against the runbook text, not the builder's summary (crucible)"
operator_review: false
planned_paths:
  - "specs/_shared/epics/MIG-codebase-migration/walks/**"
  - "docs/runbooks/migrate/**"
  - "docs/workflows/tracks/migrate.md"
depends_on:
  - MIG-9
  - MIG-6
out_of_scope:
  - "Running or rehearsing the procedure on any of the three repos (settled); the synapse dry run is the operator's, after the epic closes."
  - "Recalibrating the thresholds or changing the manifest: follow-ups, with the walk as evidence."
  - "Promoting any repo's UX spec to living truth (a layer 3 gap)."
criteria:
  - id: C1
    statement: "walks/synapse.md walks every runbook step against synapse's facts, with per-step stops, rulings, gaps and estimates, and times the records step on its own."
    evidence: manual
    reason: "a reading; its evidence is the file"
  - id: C2
    statement: "walks/conscious-connections.md does the same for the middle path, including the conflict round and the records round, and names the spaced and em-dashed paths as a read-NUL-separated step."
    evidence: manual
    reason: "a reading; its evidence is the file"
  - id: C3
    statement: "walks/taylor-aucoin.md is Crucible's, in fresh context, walks the far path (single-app overlay, CI as a hosted gap, the restructure as the last layer-3 epic) and lists its stops."
    evidence: manual
    reason: "a reading by another role; its evidence is the file and the as-built's note of who wrote it"
  - id: C4
    statement: "Every stop the three walks list is fixed in the runbook text or named as a drafted follow-up in the as-built; the runbook's status line says three desk walks were read and when."
    evidence: manual
    reason: "a cross-check of three readings against the text"
  - id: C5
    statement: "The runbook files still pass the docs lint after the fixes."
    evidence: check
    command: "yarn lint:docs"
  - id: C6
    statement: "Every path and script the fixed runbook names still exists."
    evidence: check
    command: "yarn check-refs"
---

# Contract — MIG-0 desk-walks

## Build notes

- **Approach:** read MIG-6's capture first, then walk. For synapse and conscious-connections, one file each, a section per runbook step in order, with the five fields per step and a closing list of stops and the fixes made. For taylor-aucoin, spawn a fresh-context agent with `docs/roles/operations-strategy/crucible-devils-advocate.md` injected, hand it the runbook files, `verify.md`, `layer-3.md`, the brief's far-case Evidence paragraph and the TA capture, and ask for the walk in the same section order; file what comes back byte for byte. Then fix every stop in the runbook (MIG-8 and MIG-9's files are planned paths here), re-run the docs checks, and write the status line. New-project's desk walk is the precedent: it "found four things" and its two dry runs stopped 32 times (brief, Risk 10).
- **Decisions that apply:**
  - brief.md, Metric: "Inside the epic the bar is the desk walks: synapse (near), conscious-connections (middle) and taylor-aucoin (far, walked by Crucible as the runbook's reviewer)."
  - brief.md, By when: "the operator's synapse run after the epic closes is a dry run: its stops are fixed in the runbook, as new-project's were. The clock is timed on the second repo, conscious-connections."
  - T5 and layer-1.md: the records mapping the synapse walk times ("the synapse desk walk times this step on its own", Risk 4).
  - T7 and layers-2-3.md: the far path's layer 2 (no runner: `node --test` plus a smoke test; no CI: a drafted gap) and layer 3 part 11 (the root app into `apps/web`, its own epic, last).
  - assess.md: synapse near (14), conscious-connections middle (18), taylor-aucoin far (gate and 23); the middle path "adds the conflict round (P1) and the records round".
- **Interfaces:** three markdown files under `walks/`; edits to the runbook text.
- **Per path:**
  - `specs/_shared/epics/MIG-codebase-migration/walks/synapse.md`, `conscious-connections.md`, `taylor-aucoin.md`: the readings.
  - `docs/runbooks/migrate/**`: the fixes and the status line.
  - `docs/workflows/tracks/migrate.md`: only if a walk finds the track's questions wrong.
- **Gotchas:**
  - Read-only looks at the repos are allowed; the brief's Evidence already holds most facts with paths, cite them rather than re-reading at length.
  - The walks folder is not `tickets/`, so `check-specs` ignores it; it is also not `research/`, so a later thread may load it.
  - Synapse's `main` is 92 commits behind `feature/workflow`; the walk's precondition step must fail with `main` and pass with `feature/workflow`, and say so.
  - Conscious-connections' `AGENTS.md` forbids branches, PRs and tests during slice work; the walk's conflict round shows the ruling for each line.
  - Crucible has no generated subagent; inject the role into a fresh general agent. Never summarise its walk; file it whole.
  - Examples inside the runbook fixes stay synthetic; the walks themselves name the real repos, as the brief does.
- **Model:** Fable 5.1 (`claude-fable-5-1`), for the walks and for Crucible. A smaller model tends to walk the happy path and find nothing.
