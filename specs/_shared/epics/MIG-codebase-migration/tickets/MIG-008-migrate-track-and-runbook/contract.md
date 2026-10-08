---
id: MIG-8
size: small
objective: "A cold Claude Code session can open a migration from the track file and walk layer 1 from the runbook: the preconditions, the assess report, the interview rounds, and numbered steps that each end on a check, through the manifest to the records and the gap tickets."
slice_type: "Practice docs (a track and a runbook); the risk is a step a cold session cannot run from the text alone, or a settings or records step that re-decides what the interview already ruled."
non_negotiables:
  - "docs/workflows/tracks/migrate.md follows the track files' shape (when it applies, stages, cast and QA, the builder's own questions, how it ends) and has its row in docs/workflows/tracks/README.md's table; the row says the track hands the work to the runbook."
  - "docs/runbooks/migrate/README.md opens with who runs it, when, what done means and a status line, then the interview in rounds, then the numbered layer-1 steps; it has its row in docs/runbooks/README.md's use-case table."
  - "Every numbered step ends on a check a person or agent can run or read (a command, a file state, or a question with a yes); every hosted step stops for the operator and says so."
  - "The interview covers, from the assess report: the protected branch and the migration branch, prefixes and apps, each P1 conflict ruled team or operator per whole hook or rule, each record kind's mapping, each global human instruction line's destination, and the verify mapping's inputs; each question has a recommended answer and uses the question tool."
  - "Layer 1's steps follow layer-1.md: commit 1 (toolkit.json, devDependencies, yarn.lock), the manifest walk (copy, then derive), settings from the rulings, the spine with House rules and the caps kept, the records moves by git mv last, each gap a drafted ticket under the target's migration epic, record 0001 in the target, the --check --end run, and the branch name printed; never a push, a merge or a touch of the protected branch."
  - "The runbook never runs or rehearses against any real repo in this ticket; the desk walks are MIG-10."
  - "No install script, no type-freeze script (appetite cuts); the manifest walk is prose."
devs_call: "Round and step numbering, the wording of questions and recommendations, the form of the interview's answer table, and whether the records and human-line rulings are one round or two."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T2"
  - "T4"
  - "T5"
truth_files: "none: practice docs; no living UX file changes"
qa: Q2
reviewers:
  - crucible
focus:
  - "walk it as taylor-aucoin, the far repo: a single app, no CI, no tests, SDKs everywhere, a dirty tree and an 80-line CLAUDE.md; every stop the walk finds is a finding (crucible)"
operator_review: false
planned_paths:
  - "docs/workflows/tracks/migrate.md"
  - "docs/workflows/tracks/README.md"
  - "docs/runbooks/migrate/README.md"
  - "docs/runbooks/README.md"
depends_on:
  - MIG-2
  - MIG-3
  - MIG-4
  - MIG-6
  - MIG-7
out_of_scope:
  - "Layer 2 (the verify mapping and freezes) and layer 3 (the gap tickets) and the follow-on prompts: MIG-9, linked from the steps."
  - "The manifest's contents: MIG-3; this README walks it."
  - "docs/index.md, the canon and any decision record: not touched (T9)."
  - "Harness files for other agent tools beyond AGENTS.md (settled)."
criteria:
  - id: C1
    statement: "The two new files carry valid frontmatter and names."
    evidence: check
    command: "yarn lint:docs"
  - id: C2
    statement: "Every path, yarn script and skill the track and runbook name exists."
    evidence: check
    command: "yarn check-refs"
  - id: C3
    statement: "The generated folder tables are current, with the two new rows."
    evidence: check
    command: "yarn directory-map --check"
  - id: C4
    statement: "Each numbered step's last line is a check, each hosted step is marked as the operator's, and each interview question offers a recommended answer; read step by step and listed in the as-built."
    evidence: manual
    reason: "prose structure; no script reads it"
  - id: C5
    statement: "The always-on budget is unchanged: the track and runbook load on request only."
    evidence: check
    command: "yarn budget"
---

# Contract — MIG-0 migrate-track-and-runbook

## Build notes

- **Approach:** model both files on the new-project pair: `docs/workflows/tracks/new-project.md` (the track opens the work and points at the runbook) and `docs/runbooks/new-project/README.md` (interview rounds as tables with options, recommended first; numbered steps each ending on a check; a status line naming the dry runs). The runbook's order: 0 preconditions (`yarn migrate:assess <target> --check --protected <branch>`, from the toolkit checkout); 1 the report (`yarn migrate:assess <target>`, filed byte for byte as the target's `assess.md`); 2 the interview, rounds from the report; 3 commit 1; 4 the manifest walk (copy entries, then derive entries in the spine, path rules, settings, layout, specs root, decisions order); 5 the human lines; 6 the verify mapping (link `verify.md`, MIG-9); 7 records moves and the gap tickets (`yarn contract:init <P> <slug> --draft` per gap, Build notes from layer-1.md's gap shape); 8 record 0001 and the `--check --end` run; 9 print the branch and the follow-on prompts (link MIG-9). Write the path for each adoption path (near, middle, far) as differences in the interview rounds and time boxes, not as three runbooks.
- **Decisions that apply:**
  - T2: "Derive the spine, path rules, `toolkit.json` (overlay), settings and `verify`. The floor is tracked; everything else is ruled team or operator (local). Human lines move verbatim to root, a nested file or a path rule; toolkit lines are cut first; caps unchanged." If wrong: "One commit per step; revert that step."
  - T4: "Commit 1 holds `toolkit.json` and the dependency changes. Push is denied in the operator's settings."
  - T5: "Move and index UX specs (to `specs/<app>/_imported/ux/`) and decision logs, bodies byte for byte. Closed specs, deviations, guides, maps and host roles stay in place, indexed. A named gap with a plan is a drafted ticket under the target's migration epic."
  - layer-1.md: the Settings table (default rulings per policy), the four destinations for a human line, the T5 table (day one and indexed-in per record kind), and the gap ticket's five Build-notes items.
  - assess.md, Path thresholds: "Near: the short interview; layer 3 opens part by part. Middle: adds the conflict round (P1) and the records round, with the records step timed on its own (Risk 4). Far: single-app overlay; CI is a hosted gap."
  - brief.md, settled: "the repo's own convention winning over `agent/{id}`; one commit per step; never a push, a merge or a touch of the protected branch."
- **Interfaces:** two markdown files and two table rows; no code.
- **Per path:**
  - `docs/workflows/tracks/migrate.md`: the track; its builder questions are the runbook's round 0 (target path, protected branch, migration branch name), asked once.
  - `docs/workflows/tracks/README.md`: one row above the generated marker.
  - `docs/runbooks/migrate/README.md`: the interview and the steps; the folder's file table lists `manifest.json` (MIG-3) and the MIG-9 files as "lands in MIG-9" until they exist.
  - `docs/runbooks/README.md`: one row in the use-case table above the generated marker.
- **Gotchas:**
  - `yarn check-refs` fails on a path or script named in a code span that does not exist; the MIG-9 files do not exist yet, so name them in plain words or add them to `tooling/refs-pending.json` with "lands in MIG-9" and remove the entry in MIG-9.
  - Everything below the generated marker in both READMEs is rewritten by `yarn directory-map`; edit above it, then run the generator.
  - Frontmatter: `layer: workflows` for the track, `layer: runbooks` for the runbook, `status: draft`, `thread: "MIG"` quoted.
  - The old instruction files are copied to `docs/decisions/imported/<file>-<date>.md` before the spine is rewritten (T5); write that step before the spine step.
  - Every example in the text is synthetic (a repo called `acme-shop`, a prefix `ACM`), never one of the three repos.
- **Model:** Fable 5.1 (`claude-fable-5-1`). The interview is design work; a smaller model turns it into a checklist with no recommendations.
