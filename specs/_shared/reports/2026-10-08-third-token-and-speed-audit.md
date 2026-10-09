# Third token and speed audit, 2026-10-08

Track: audit, lens cost, speed and operator assurance, Q0, run as a decide-together conversation. Lead Lorimer; Tally consulted on counting, Crucible on every recommendation that removes or defers a check, Reeve on the order to Synapse. It extends `2026-10-06-token-and-speed-audit.md` and `2026-10-07-second-token-and-speed-audit.md` and re-uses their method; nothing they measured is re-derived, only checked against the new data. The operator delegated the open decisions to the thread on 2026-10-08 ("your call"); each is marked as the thread's call below.

## Verdict

The build conventions held where the money was: one ticket per thread, a median DEMO ticket at 0.55M weighted, 36 calls and 6 active minutes, against targets of 1.5 to 2M, 45 to 60 and 20 to 30, and calls over 200k context halved across the window. They are not ready to solidify. The tooling still enforces the old shape, so no DEMO ticket could start, nothing reads as built and no cost could be recorded; the decided Opus minimum never reached the file contracts are written from, so 10 of 17 builds ran on Sonnet; and nothing is proven: no hardening pass has run anywhere under PR-21, `yarn verify` was red on DEMO's own files, and 38 commits have never reached CI. Shaping is now the largest single cost: the Design-stage thread alone outspent the fifteen ordinary builds. Fix the tooling, harden DEMO once, then carry the conventions into Synapse.

## Counts by flag

| Flag   | Count |
| ------ | ----: |
| Black  |     0 |
| Red    |     2 |
| Orange |     4 |
| Yellow |     4 |
| Grey   |     4 |

## How this was measured

- **Sources.** Every `*.jsonl` under `~/.claude/projects/-Users-taylor-lighthouse-product-engineering-mastery*/`, main and subagent, with records timestamped from 2026-10-07 22:26 PDT to the start of this thread (2026-10-08 21:30 PDT), this thread excluded: 56 sessions. Read by script for counts only: one call per message id (each usage field at its largest), timestamps, usage, model, effort, tool names, the work-ids and repo paths in tool inputs, permission decisions, hook and system record types, and Claude Code's `cost-state` records. No transcript text is quoted. Also `git log 5e2f5aa..HEAD`, `yarn status --epic DEMO` and `--epic MIG`, `yarn cost --epic DEMO` and `--epic MIG`, `yarn verify`, `yarn budget`, the DEMO and WEB contracts, and the critic's evidence files.
- **Weights and points** are the first report's: input 1, cache write 1.25, cache read 0.1, output 5; one meter point is about 2.5M weighted [estimate; the meter was not read].
- **Dollars** are computed from usage at the list prices in `docs/research/engineering/model-selection-claude-code.md` with 5-minute cache writes [estimate]. Claude Code's own `cost-state` runs about 1.2 times higher where a session has one (1-hour cache writes): DEMO-8 $7.12 against $5.80.
- **Attribution.** Every DEMO build thread names its ticket in its title and first prompt and built only that ticket, so a thread is its ticket. Categories are the second audit's, by first tool; critic runs (forked general-purpose subagents) are counted as reviews.
- **Cross-check with `yarn cost`.** DEMO-8: `yarn cost` 63 calls and 1.6M, script 83 and 2.03M. DEMO-17: 382 and 8.4M against 413 and 9.22M. The gap is every call before a thread's first work command, which `yarn cost` drops; for DEMO-1 it saw 6 of 18 calls and for DEMO-4 2 of 25, and it gave DEMO-13's 88 calibration calls to DEMO-18 and DEMO-17's to DEMO-19, the drafts those threads wrote. The script's figures are used throughout.
- **Active time** is the sum of gaps of at most 15 minutes between a thread's records.

## The window in numbers

| Measure                                  |            Value | Note                                                      |
| ---------------------------------------- | ---------------: | --------------------------------------------------------- |
| API calls                                |            3,614 | one per message id                                        |
| Weighted                                 |            92.8M | about 37 points [estimate]                                |
| Dollars at list                          |       about $254 | [estimate]                                                |
| Headless reviews                         |                0 | no `review:run` in the window                             |
| Calls over 200k context                  |        852 (24%) | 52% in the second audit's window B                        |
| Weighted above 200k                      |            10.5M | 7.2M of it in one thread, the Design stage                |
| Full cache re-writes after an idle gap   | 5, 1.7M weighted | 13 in window B                                            |
| Permission prompts the operator answered |               41 | mostly questions in shaping threads; none in a DEMO build |
| Hook denials / Stop-hook blocks          |           22 / 7 | one retry call each                                       |

By work: DEMO builds 29.7M; DEMO shaping 28.5M; the model calibration 9.2M; convention rulings (EN-19 with WEB-20 and 21, the `lib/sandbox` split, webhooks, the Paper workflow, the Synapse note, the migration audit) 8.3M; the second audit's close and its four harness tickets 7.6M; the docs redesign 3.6M; MIG rulings and briefs 2.0M; LAB notes 1.9M; the duplicated-logic audit with WEB-15 1.7M.

## The operator's questions, answered

**a. Per ticket.** All 17 DEMO tickets were built, one thread each, on medium effort, with one or two operator turns.

| Ticket                             | QA  | Criteria | Model          | Calls (main+sub) | Weighted | Context at close | Active min |
| ---------------------------------- | --- | -------: | -------------- | ---------------: | -------: | ---------------: | ---------: |
| DEMO-1                             | Q2  |        5 | Sonnet 5.5     |               18 |     0.48 |             125k |          4 |
| DEMO-2                             | Q2  |        3 | Sonnet 5.5     |               10 |     0.15 |              88k |          1 |
| DEMO-3                             | Q1  |        3 | Opus 5.5       |               48 |     0.85 |             161k |          6 |
| DEMO-4                             | Q2  |        5 | Sonnet 5.5     |               25 |     0.44 |             123k |          4 |
| DEMO-5                             | Q2  |        3 | Sonnet 5.5     |               36 |     0.51 |             115k |          5 |
| DEMO-6                             | Q2  |        5 | Sonnet 5.5     |               18 |     0.29 |             100k |          4 |
| DEMO-7                             | Q2  |        8 | Opus 5.5       |               56 |     1.31 |             192k |         13 |
| DEMO-8                             | Q2  |        9 | Opus 5.5       |               83 |     2.03 |             243k |         12 |
| DEMO-9                             | Q2  |        8 | Sonnet 5.5     |               45 |     1.12 |             173k |         11 |
| DEMO-10                            | Q2  |        9 | Opus 5.5       |               62 |     1.58 |             233k |         12 |
| DEMO-11                            | Q2  |        8 | Sonnet 5.5     |               59 |     1.44 |             186k |         10 |
| DEMO-12                            | Q2  |        9 | Sonnet 5.5     |               27 |     0.51 |             135k |          5 |
| DEMO-13                            | Q2  |        6 | Sonnet → Opus  |          108+237 |     8.27 |             283k |         23 |
| DEMO-14                            | Q2  |        4 | Sonnet 5.5     |               29 |     0.47 |             123k |          4 |
| DEMO-15                            | Q2  |        3 | Sonnet 5.5     |             27+1 |     0.50 |             118k |          3 |
| DEMO-16                            | Q2  |        5 | Opus 5.5       |               33 |     0.55 |             126k |          8 |
| DEMO-17                            | Q2  |        5 | Opus 5.5       |          124+289 |     9.22 |             310k |         28 |
| WEB-15, in the audit thread        | Q1  |        3 | Opus 5.5       |               77 |     1.65 |             204k |         18 |
| WEB-20 and 21, in the EN-19 thread | Q1  |        7 | Opus 5.5, high |           120+22 |     3.52 |             284k |         41 |

The fifteen ordinary tickets (12.2M) split build 38%, proofs 29%, captures and the thread's own screenshots 15%, git 5%, status 3%, re-reading 2%, other 9%: LAB's shares at about a sixth of the size. The two critic tickets (17.5M) are 65% critic runs.

| Measure                 | LAB (second audit)               | Target          | DEMO                                      |
| ----------------------- | -------------------------------- | --------------- | ----------------------------------------- |
| Weighted per ticket     | median 3.6M                      | 1.5–2M          | median 0.55M, mean 1.75M                  |
| Calls per ticket        | 115–160                          | 45–60           | median 36                                 |
| Active minutes          | about 40 before the first review | 20–30           | median 6, max 28                          |
| Context at close        | 217k–595k                        | well under 200k | median 135k; 4 of 17 over 200k            |
| Weighted per criterion  | 0.43M whole, about 0.24M build   |                 | 0.30M; 0.14M without DEMO-13 and 17       |
| Seconds per call        | 22.6                             |                 | 11.4 (154 active minutes, 808 main calls) |
| Status calls per ticket | about 7                          | 2               | 2.2                                       |

Met: every build-pass target on the median. The second audit's estimate of 35M for a 20-ticket build pass holds exactly (29.7M for 17), but 59% of it is the two critic tickets. Not comparable: DEMO is fixtures only, Q1 and Q2, no database, no auth, no Q3, and its screens were drawn first on the Paper canvas; with no hardening run, LAB's "60 percent of calls after the build" has no DEMO counterpart.

**b. The build pass's shape, 17 DEMO threads.**

| Rule (tk-batch, build.md)              | Expected         | Found                                                                                      | Failed by                  |
| -------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| `contract:init`                        | one, succeeds    | 19 calls in 12 threads, 0 succeeded; 5 threads never ran it                                | mechanism (R1)             |
| `contract:built`                       | one              | 2 calls (DEMO-5), no effect                                                                | mechanism                  |
| `contract:run` / `contract:record`     | 0                | 0 / 3 (DEMO-6)                                                                             | prose, once                |
| `review:run`, headless review          | 0                | 0                                                                                          | held                       |
| Assay in thread on UI tickets          | 6 (DEMO-7 to 12) | 0; no read of the rubric or the Assay role                                                 | prose                      |
| `yarn verify` / whole `yarn test`      | 0 / 0            | 1 (DEMO-6) / 0                                                                             | prose, once                |
| `yarn status` / `check-specs`          | 2 / 0            | 37 / 0                                                                                     | held within one per thread |
| Captures                               | the thread's own | 66 browser-pane calls in 8 threads; 21 `web:capture` runs, 20 in capture or critic tickets | held                       |
| Five lines and links                   | 17               | 2 of 17 at six lines or fewer, median 16; links on 4 of 6 surface tickets                  | prose                      |
| Cost line                              | none in a build  | 0 `yarn cost` runs; one Cost line printed with no source (DEMO-5)                          | prose                      |
| Model as the row names; never switched | Opus 5.5 (PR-22) | 10 Sonnet, 7 Opus; DEMO-13 switched Sonnet to Opus on the operator's second turn           | the source file (O2)       |
| Commits                                | one per outcome  | 23 commits for 17 tickets                                                                  | held                       |

**c. One ticket per thread.** DEMO: 17 threads, 17 tickets, no inherited context by the segment method. Two other threads built more than one ticket (Y1). DEMO-17 changed six earlier tickets' files, as its contract asked. Five threads resumed after the shared pause of Y4, with 3 full cache re-writes (1.7M weighted).

**d. Models, whole window.**

| Model      | Calls | Weighted | Dollars    | Where                                                                 |
| ---------- | ----: | -------: | ---------- | --------------------------------------------------------------------- |
| Opus 5.5   | 2,872 |    74.4M | about $200 | 7 DEMO builds, DEMO shaping, audits, rulings                          |
| Sonnet 5.5 |   602 |    12.8M | about $19  | 10 DEMO builds (10.0M, about $15), calibration builds, chats          |
| Fable 5.1  |    72 |     4.5M | about $32  | the second audit's close, the Paper workflow ruling, the Synapse note |
| Opus 5     |    65 |     0.9M | about $3   | the LAB-27 calibration build                                          |
| Haiku 5.5  |     3 |     0.1M |            | DEMO-15's trigger-test subagent                                       |

Every thread kept one effort value throughout. Fable fell from $184 in window B to about $32. Sonnet tickets were the smaller ones (median 0.49M against Opus's 1.58M), so DEMO says nothing about which model is cheaper per unit of work (Tally).

**e. The Seen step.** Unmeasured: the brief's operator notes were not filled in. Wave 3 committed between 19:54 and 20:11 PDT and wave 4 started at 20:26 and 20:32; no thread was told "harden". Four closings (DEMO-5, 6, 14, 15) carry "run `yarn …`" wording; counted, not read, so whether a command was handed to the operator is unconfirmed. No DEMO build thread raised a permission prompt.

**f. The critic and the design skills.**

| Item                                         | Cost             | Result                                                                                                                                                                                       |
| -------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tk-ui-critic, built and calibrated (DEMO-13) | 8.27M, 23 min    | 13 critic runs on Sonnet (3.15M), then 9 Assay runs on Opus (2.27M) after the switch; 3 planted defects FAIL, 3 surfaces PASS, a dropped capture FAILs; must-invoke tests "not yet observed" |
| Void pass (DEMO-17)                          | 6 runs, about 2M | the worktree lacked the epic's untracked brief and UX files                                                                                                                                  |
| Round 1                                      | 6 runs, about 2M | 46 findings, 7 Blocking; 16 fixed, 30 to DEMO-18 to 23 or G-04                                                                                                                               |
| Round 2                                      | 6 runs, about 2M | 0 new Blocking, 7 new lower findings, one severity drift on unchanged pixels; 5 PASS, delete-dialog FAIL on 18 missing captures                                                              |
| tk-ui-diverge (DEMO-14)                      | 0.47M, 4 min     | manual only; trigger tests in the skill                                                                                                                                                      |
| tk-motion (DEMO-15)                          | 0.50M, 3 min     | trigger test 5 of 5 and 0 of 5, run by one Haiku subagent against a four-skill listing, kept in the ticket's evidence; model-invocable, it took the always-on load to 4,079 of 4,000         |
| Critic CI (DEMO-16)                          | 0.55M            | never ran: nothing pushed since 12:50                                                                                                                                                        |

A critic run costs about 0.33M per surface, 2M per six-surface round [measured].

**g. The duplicated-logic audit and the WEB one-offs.** The audit cost 1.65M, 77 calls and 18 minutes on Opus 5.5, including WEB-15's build in the same thread. WEB-14 to 19 came from it; WEB-20 and 21 came from the EN-19 ruling, not this audit. Built: WEB-15, 20 and 21, each open with its criteria unrecorded. Not built: WEB-14 and 16 to 19. Four of the eight contracts call Sonnet "enough". Reeve [judgment]: outside DEMO is right; they fix the sandbox and the packages, not the demo. WEB-14 and WEB-16 before Synapse, which copies those packages and WEB-16 carries personal data; WEB-17 to 19 after.

**h. The instrument.** No thread ran `yarn cost`. It was not reachable: the build pass has no Cost line by rule; `--record` stops at "has not started; nothing to record into" (`tooling/cost.ts:515`) because `contract:init` was refused; and attribution starts at the first work command.

**i. Verify and tests.** Three `yarn verify` runs in the window, 19 to 46 seconds each; a green run takes about 101, so none finished [estimate from duration]. Run in this thread: red at step 1 in 11 seconds, 8 files failing `format:check`, all committed by DEMO-1, DEMO-14 and DEMO-15. `apps/web/lib/demo/states.test.ts` fails C3 at HEAD; the fix sat uncommitted in the tree. `yarn budget`: four rows over (always-on 4,079 of 4,000; design layer 5,078 of 5,000; brief and package 5,718 of 2,000; UI build 16,769 of 15,000). Stop hook: 7 blocked stops.

Past the format step, with this thread's Prettier fix in the tree, each remaining verify step was run on its own: `test`, `lint`, `check-types`, `build` and twelve others pass; seven fail. `lint:docs`: `docs/research/ui-patterns/docs-readability.md`, an untracked intake file, has no frontmatter. `check-refs`: `apps/web/docs/design/coverage-gaps.md` exists (DEMO-3) and is still listed in `tooling/refs-pending.json`. `check-specs`: stray empty `.claude/` folders under `specs/web/`, `specs/web/epics/DEMO-records-demo/tickets/` and `specs/web/epics/LAB-experimental-sandbox/tickets/` (created 13:43), and as-builts for MIG-2, 8, 9, 10 and 11, which never started. `test:tooling`: three contrast-audit tests fail (C1, items 168 to 170). `budget`: the four rows above. `lint:boundaries`: `eslint-disable turbo/no-undeclared-env-vars` lines in `apps/web/e2e/capture.capture.ts` and `apps/web/playwright.config.ts` (DEMO-6) name a rule the boundaries config does not load; DEMO-8 met the same and removed its own.

**j. What is unmeasured.**

| What                                    | What would settle it                                                   | Cost [estimate]       |
| --------------------------------------- | ---------------------------------------------------------------------- | --------------------- |
| Hardening DEMO, and its cost per ticket | Harden DEMO-1 to 17 after R1's fix, `yarn cost --record` at each close | 14–20M, 6–8 points    |
| Sonnet against Opus on DEMO             | Hardening findings per ticket by model; uncontrolled                   | none beyond the above |
| The Seen step's own time                | The operator notes each walk's start and stop                          | none                  |
| Shaping cost per epic                   | Count Synapse's shaping the same way                                   | none                  |
| The meter                               | Read it before and after the hardening pass                            | none                  |
| Why wave 3 paused 2 hours together      | The operator's account                                                 | none                  |

The sample is one epic of one kind, built in one evening.

## Findings

### Red

**R1. The tooling refuses the build pass it was built for.** Where: `tooling/contract.ts:425-443`; `tooling/cost.ts:515`. `contract:init` starts a dependent ticket only when every criterion of its predecessor is recorded PASS, which the build pass forbids. 19 init calls in 12 threads were refused; 5 threads skipped init; all 23 DEMO tickets read draft; "built" never shows; `yarn cost --record` has nothing to write into. Every Synapse epic would repeat it. Smallest fix: the gate accepts a predecessor with `built_at`. Measured.

**R2. Nothing is proven, green or on record.** No hardening pass has run under PR-21 on any ticket; `yarn verify` red at step 1 on DEMO's files; the web suite red at HEAD on a test fix left uncommitted; four budget rows over; the epic's brief, technical notes, UX files and five contracts untracked (and the cause of a voided critic pass); 38 commits never pushed, so CI, including DEMO-16's critic job, gated nothing. Measured.

### Orange

**O1. Shaping costs as much as building.** DEMO's six shaping threads: 28.5M against 29.7M of builds. The Design-stage thread: 21.8M, 263 Paper calls, context to 836k before a compaction, 274 calls over 200k, 7.2M weighted above 200k. The Design stage (ruled the same day) has no thread rule. Measured.

**O2. PR-22 is in the ledger and not in the source.** `docs/workflows/prompt-builder.md:138` still says "minimum Sonnet 5.5"; every DEMO contract and WEB-17 to 21 say the same; 10 of 17 builds ran on Sonnet. The calibration's rule predicts four to six extra hardening findings per Sonnet ticket (two pairs). Measured; the consequence is unmeasured until hardening.

**O3. The critic tickets are 59% of build spend.** 17.5M; about 3.2M of Sonnet critic runs redone on Opus; about 2M voided by untracked spec files; round 2 confirmed fixes and found no new Blocking. Measured.

**O4. The build pass's Assay step and its close are not followed.** Assay on 0 of 6 UI tickets; closings median 16 lines; links on 4 of 6 surface tickets; one Cost line with no source. Measured.

### Yellow

**Y1. Two threads built more than one ticket:** EN-19 with WEB-20 and 21 (3.52M, 41 min, 284k at close); the duplicated-logic audit built WEB-15, against "an audit never fixes".

**Y2. `yarn cost` misattributes** (see How this was measured), first found by the calibration and still open.

**Y3. Small breaks:** DEMO-6's verify and three records; 37 status calls; DEMO-13's mid-thread model switch; three demo files left modified and uncommitted.

**Y4. Wave 3 paused together** from 17:19 to 19:20 PDT, no permission prompt or API error at the pause: 2 h 44 m of wall clock for 10 to 13 active minutes each.

### Grey

**G1.** Every build-pass target met on the median. **G2.** One ticket per thread held for DEMO; calls over 200k fell from 52 to 24 percent. **G3.** Fable from $184 to about $32. **G4.** Hooks: 22 denials, 7 blocked stops, about one retry call each.

## Recommendations, as decided

Savings are per epic of DEMO's size against this epic's 58.2M (shaping and builds) [estimate].

**1. The start gate reads "built" (R1, Y2).** `contract:init` accepts a predecessor with `built_at`; `yarn cost` attributes a thread from its first prompt or title when it names one ticket, and a draft written in a thread does not take the thread's calls; the seventeen built DEMO tickets are started and marked built in dependency order, each with its cost block. Q2, Opus 5.5. Saving: none; it makes the convention work and the instrument honest. Removal condition: none while dependencies exist.

**2. Green the branch (R2).** Done in this thread's working tree: Prettier on the eight files, the stranded `states.test.ts` fix. Not committed: the auto-mode classifier refused the commit as a shared-resource change; the operator decides. The epic's 20 text files to commit; its 192 Design-stage captures (15 MB, against a 34 MB tracked tree) [NEEDS DECISION; the thread's call: commit them, since the build and critic stages read them and a fresh checkout lacks them]. The six other verify reds (refs-pending, the stray `.claude/` folders, the contrast-audit tests, DEMO-6's disable lines, the budget rows via recommendation 7; MIG's as-builts via step 8 of the order) go to one Q1 one-off; the intake file's frontmatter is the operator's. Push so CI runs once.

**3. PR-22 into the source (O2).** `prompt-builder.md` §6 and `tickets.md` §6 carry Opus 5.5 as a ticket build's minimum and recommended; the model line in the unbuilt contracts (DEMO-18 to 23, WEB-14, 16 to 19) follows. Saving: none in tokens; it restores a decided rule. Removal condition: a calibration that moves the minimum.

**4. The Design stage gets the thread rule (O1).** One surface per thread, closed past 200k; canvas screenshots scaled down and taken only after a change. Saving: about 7M of the 21.8M, the weighted spend above 200k [estimate]. Loses: one thread's sight of every surface at once, which the overview file holds.

**5. The critic: one round, then a re-check of only the surfaces whose Blocking findings were fixed; the epic's files are committed at the Tickets handoff (O3).** Saving: about 2M per epic, plus the voided pass. Loses: round 2's lower findings on unchanged surfaces.

Crucible. Steelman: round 2 found seven findings round 1 missed and showed the critic drifting a grade on the same pixels; a second full round is how the drift is seen. Attack: none of the seven was Blocking, every one went to a follow-up ticket rather than a fix, and the drift is a calibration finding that one more round per epic will not cure; the re-check still runs where a Blocking was fixed. Falsifier: a hardening Assay or a later critic run that returns a Blocking on a surface the single round passed; one such in the next epic restores the second full round. Survives.

**6. Assay leaves the build pass; the close stays five lines (O4).** `build.md` §4, `tk-batch`, `qa-levels.md`'s phase table: the build pass has no review; the critic and the hardening review are the UI's checks. Saving: none measured, because the step was never run; it removes a rule nobody followed. Loses: an early design read on each UI ticket.

Crucible. Steelman: a design defect found at build is fixed by the thread that wrote it, in context, for pennies; found by the critic, it costs a fix pass on a surface the operator already saw. Attack: on DEMO the step ran on none of six UI tickets and the critic still found all seven Blocking findings in one round across six surfaces, at 2M; a prose step that is skipped every time buys nothing and teaches threads that rules are optional. Falsifier: hardening on DEMO's UI tickets returns more than one Blocking that the critic's round did not raise; then Assay returns to the build pass as a mechanism (a check that reads its output), not prose. Survives.

**7. tk-motion's listing fits the budget (R2).** Its description shortened until always-on is at or under 4,000, and its trigger test re-run against the real listing on Opus 5.5, kept in the skill. Saving: about 80 tokens on every session.

**8. Harden DEMO before Synapse (R2, j).** After 1 and 3: build DEMO-18 and DEMO-19 (the captures hardening needs), then harden DEMO-1 to 17 in wave order, one thread each, Opus 5.5; the last runs `yarn verify`, `check-specs --strict` and `truth:promote DEMO`. DEMO-20 to 23 after Synapse starts. Cost: 14–20M, 6–8 points [estimate]. Buys: the second half measured once before Synapse inherits it, and the Sonnet-and-Opus comparison for free.

**9. The WEB one-offs.** Harden WEB-15, 20 and 21 (Q1: `contract:run` once). Build and harden WEB-14 and WEB-16 before Synapse. WEB-17, 18 and 19 deferred until after Synapse's migration.

Crucible. Steelman: each deferred one-off is a helper the next sandbox ticket will write again, and the audit's whole point was that nothing tells an agent the helper exists. Attack: the next sandbox work is not before Synapse; the two that touch packages Synapse copies are kept; deferral costs at most a few duplicated lines. Falsifier: a ticket built before they land writes a fifth copy of the date formatters or the team guard; then they move ahead of the next sandbox ticket. Survives.

**10. "Solidified."** [ASSUMPTION: DEMO hardened and `yarn verify` green, the branch pushed and merged to main by the operator, then MIG's migration of Synapse begins.]

**Not recommended.** Raising the always-on cap (the fix is the file); returning per-ticket proving to the build pass (the build half met every target); a smaller model for hardening reviews (the calibration's evidence holds the floor).

## Reeve's order to Synapse

1. The start-gate and cost-attribution ticket (recommendation 1), with the DEMO backfill.
2. The prose change set (recommendations 3 to 7), in parallel with 1.
3. The operator: commit the green-up and the epic's text files; decide the captures. Then the green-the-branch one-off, in parallel with 1 and 2; then push.
4. Build DEMO-18, then DEMO-19.
5. Harden WEB-15, 20, 21; build WEB-14 and WEB-16, in parallel with 6.
6. Harden DEMO-1 to 17 in wave order; the last closes the epic and runs verify.
7. Harden WEB-14 and WEB-16.
8. MIG: reconcile its status (MIG-2, 8, 9 and 10 carry as-builts and read draft), then its critical path MIG-1, 2, 8, 9, 10, 11.
9. The operator merges to main.
10. Synapse's migration starts.

## What was not examined

- The meter; the 2.5M-per-point mapping is the first report's.
- Transcript text, so whether a closing handed the operator a command, and what the 13 Sonnet critic runs in DEMO-13 were for, are inferred from patterns and timing.
- The quality of DEMO's code; only the critic's findings were counted.
- Anything under `docs/research/` beyond the two model-selection notes' Answer tables.
- Sessions after 2026-10-08 21:30 PDT.

## Decisions

Decided in this thread on 2026-10-08: the operator delegated the open questions to the thread; all ten recommendations stand as the thread's calls, with the Design-stage captures [NEEDS DECISION] and the commit of the green-up left to the operator. Prompts were printed in the thread and never saved. The decision log is in `docs/decisions/changelog.md`, entry "2026-10-08 — PEM: the third token and speed audit, decided".
