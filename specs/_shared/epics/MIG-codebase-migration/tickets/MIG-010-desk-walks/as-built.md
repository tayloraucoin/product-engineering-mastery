# As-built — MIG-10

## Shipped against the contract

- C1: `walks/synapse.md` walks round 0 to round 5 and steps 0 to 9 against synapse at `4d511ef`, five fields per section, 14 stops ranked, the records moves timed on their own (35 minutes, an estimate), and names `feature/workflow` (pushed 2026-10-06) as the base: step 0 passes with it and fails rule 5 with `main`.
- C2: `walks/conscious-connections.md` does the same for the middle path at `162faefa`, with the conflict round (lines 33 and 34 ruled) and the records round in full, the records step last and timed (30 minutes, an estimate), and names the 57 spaced and 173 em-dashed paths as a quoted, NUL-separated step (stop 3 there; step 7 and step 5's proof fixed).
- C3: `walks/taylor-aucoin.md` is Crucible's, written in a fresh general agent with `docs/roles/operations-strategy/crucible-devils-advocate.md` injected whole, handed the track, the three runbook files, the manifest, the brief's far-case paragraph and the stand-in capture, told not to open `walks/`; filed byte for byte (193 lines, 13 stops, two Fatal-if-true). It walks the single-app overlay, CI as a hosted gap and the restructure as the last layer-3 epic.
- C4: every stop the three walks list is fixed in `docs/runbooks/migrate/README.md`, `verify.md`, `layer-3.md` or `docs/workflows/tracks/migrate.md` (commits 8ffcf99 and 5958b20), except the four below that are not runbook text; the status line says three desk walks were read on 2026-10-07.
- C5: `yarn lint:docs` reports nothing on the runbook or track files (its one problem is `docs/research/ui-patterns/working-dashboards.md`, committed 110cd6e, not this ticket's).
- C6: `yarn check-refs` resolves every reference in the 133 live files after the fixes.

## Deviations

- [ASSUMPTION] MIG-6's capture does not exist (the ticket is a draft). The walks read a read-only `yarn migrate:assess` run from the toolkit at `d7db912` on the three repos today (seven of seventeen signals; `git status` identical before and after in each repo) as the stand-in, labelled so in each walk, with the technical notes' scores for the rest. Crucible's stop 2 (an unmeasured report read as "none") follows from this and is fixed as a gate in step 1 until MIG-6 lands.
- [ASSUMPTION] Walk section order: a facts list, round 0 to round 5, step 0 to step 9, each with the five fields (would do, stop or question, ruling needed, gaps drafted, estimate), then ranked stops and a verdict. The two builder walks were written synapse first, conscious-connections second; Crucible's ran in parallel and read neither.
- The ticket has not started: `yarn contract:init MIG desk-walks` refuses because MIG-9 and MIG-6 have not started on this branch (as MIG-8 and MIG-9 recorded). Every criterion's command was run by hand; `contract:run` and `contract:record` have not run.
- Not fixed in the runbook, named here instead: (1) MIG-7's remote-copy rule must compare `refs/remotes/origin/<protected>`, never `@{upstream}` (synapse's `feature/workflow` and conscious-connections' `fix/beta-qa-fixes` are pushed with no upstream configured); the step-0 text now says so. (2) The manifest's `shadcn` skill row and its `tooling/tsconfig.json` derive entry are MIG-3's (the runbook skips the skill and edits the tsconfig in place). (3) Crucible's stop 7, the always-on budget: the runbook's fix is a pointer line for diagnostic sections and the cut order in 32; whether the cap itself should count a target's imported House rules differently is a Mason question for the dry run, not a runbook line. (4) Crucible's stop 6 is fixed by 14's wording; the hooks' matching in `tooling/lib/work-ids.ts` is unchanged. (5) Synapse stop 14 and conscious-connections stop 8 (the protected branch is a work branch, not `main`) are covered by the rewritten 02 and M2, keyed on whether the branch holds the fork point.
- Review (Crucible, Q2, PASS): two oranges fixed (the vendor block's rule now differs for a nested file and the rewritten root file; 41 states the precedence between the cited-record row and a folder-whole move), one yellow fixed (02 and M2 recommend a merge target only when it holds the fork point), two greys noted here.

## Not verified

- C1 to C4 are manual: the evidence is the three walk files and the runbook diff. The reviewer checks the stops against the runbook text, never this summary.
- Nothing has run against a real repo. Steps 0 and 8 still need MIG-7's flags; the full report needs MIG-6.

## Next

The operator's synapse dry run, after the epic closes, from a prompt that names `feature/workflow` as the protected branch; its stops fix the runbook as these did.
