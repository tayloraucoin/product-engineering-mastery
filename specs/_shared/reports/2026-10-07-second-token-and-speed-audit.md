# Second token and speed audit, 2026-10-07

Track: audit, lens cost, speed and operator assurance, Q0, run as a decide-together conversation. Lead Lorimer; Tally consulted on counting, Crucible on every cut that removes a check or a review, Reeve on the new stage. Read-only: this file and one changelog entry are the only writes. It extends `2026-10-06-token-and-speed-audit.md` and re-uses its method; nothing that report measured is re-derived, only checked against the new data.

## Verdict

The eight changes of 10-06 landed and did what they said, and the operator still cannot tell the difference, because they trimmed the review loop and the hooks while leaving the shape of a ticket alone. A LAB ticket still spends 60 percent of its calls on proofs, captures, status, commits and reviews, and 48 percent of its in-thread tokens carrying context, and the shaping and harness threads ran on Fable at 2.7 times the price per token. Per criterion a ticket costs what it cost on 10-06. The lever left is the shape: build first, look, then harden on the operator's word, one ticket per thread, on the model the ticket names. That roughly halves a LAB-size epic's tokens and thread-hours and lets the operator see the work after a third of the spend, with every proof and review still run once, on code that has stopped moving.

## Counts by flag

| Flag   | Count |
| ------ | ----: |
| Black  |     0 |
| Red    |     2 |
| Orange |     4 |
| Yellow |     3 |
| Grey   |     4 |

## How this was measured

- **Sources.** 185 transcript files under `~/.claude/projects/-Users-taylor-lighthouse-product-engineering-mastery*/` (the main folder and eleven worktree folders), read by script for counts only: records once per message id, timestamps, usage fields, tool names, repo paths in tool inputs, tool-result sizes, hook records and Claude Code's own `cost-state` records. No transcript text was read or quoted. Also `results.json` and `review-*.md` for the nine runs that carry cost fields, the LAB and MIG contracts, `git log` since 2026-10-06 23:45 (127 commits), `yarn budget`, `git check-ignore` and `git ls-files`, and `tooling/verify-fast.ts` for what the stop gate covers.
- **Windows.** P1 and A are the first report's two windows, re-counted as a check: P1 gives 2,085 calls and 61.7M against the report's 2,088 and 62.5M, A gives 1,242 and 44.0M against 1,244 and 45.3M, both within 3 percent, so the method matches. B is new: 2026-10-06 17:56 PDT to 2026-10-07 22:26 PDT, the time since Part 2 closed.
- **Weights and points** are the first report's: fresh input 1, cache write 1.25, cache read 0.1, output 5; one weekly meter point is about 2.5M weighted [estimate, checked twice there; the meter was not read for this audit].
- **Attribution to a ticket** is by segment: a call belongs to the ticket most recently named in a work command (contract:run, record, init, qa, review:run, a commit message) or a spec-file edit in its thread; calls before any such command belong to none. Labelled estimate where it matters.
- **Attribution to an activity** is by the first tool a call used: edits, code reads and text are build; contract:run, record, tests, lint, types and capture commands are proofs; browser-pane calls are captures; review:run, reviewer subagents and reads of review and evidence files are reviews; yarn status and check-specs are status; git is git; Read of docs, roles or spec files is re-reading.
- **Headless reviewers** leave no transcript. Nine runs since 10-06 carry cost fields; the 26 earlier LAB runs are estimated at the measured rate per reviewer.
- **Claude Code's own cost figure** (`cost-state.totalCostUSD`, list prices) is read per session and compared with the weighted count to get a price per weighted token by model.

## The window in numbers

| Measure                                 | P1 (10-05 00:00 to 10-06 07:40) |          A (10-06 07:40 to 17:56) |               B (10-06 17:56 to 10-07 22:26) |
| --------------------------------------- | ------------------------------: | --------------------------------: | -------------------------------------------: |
| API calls, one per message id           |                           2,085 |                             1,242 |                                        3,046 |
| Weighted, measured                      |                           61.7M |                             44.0M |                                        97.6M |
| Headless reviewers, outside transcripts |                ~9.5M [estimate] | ~23M [estimate, revised from 13M] | ~7.8M [8 measured, 2 partial, 2 calibration] |
| Cache-read tokens                       |                          391.8M |                            326.0M |                                       648.6M |
| Output tokens                           |                            1.8M |                              0.9M |                                         2.8M |
| Active thread-hours                     |                            14.3 |                               8.7 |                                         19.1 |
| New threads                             |                              30 |                                10 |                                           30 |
| Human turns                             |                                 |                                   |                 66; 21 of 30 threads had one |
| Calls over 200k context                 |                       735 (35%) |                         710 (57%) |                                  1,577 (52%) |
| Cache reads carried by those calls      |                             56% |                               81% |                                          73% |
| Context above 200k, summed              |                      7.9M (13%) |                       12.6M (29%) |                                  16.3M (17%) |
| Full re-writes after an idle gap        |                              13 |                                 8 |        13 of 17, 4.4M tokens, ~5.5M weighted |
| Session floor, median first cache write |                           28.8k |                             34.7k |                   28.8k; 1.24M in all (1.3%) |
| Compactions                             |                               0 |                                 0 |                                            0 |
| Meter points [estimate]                 |                             ~28 |                               ~27 |                                          ~42 |

B closed LAB-11, 12, 13, 17, 21, 24 and 25, brought LAB-9, 15 and 16 to closing, closed MIG-4 to 7 and built MIG-1, 2, 8, 9, 10 and 12. About 12M of B (5 points) was the harness work itself: WEB-12, the reviewer calibration and five one-off threads, all on Fable. LAB as a whole, both days, is about 102M weighted and 41 points [in-thread measured, headless estimated], which is consistent with the operator's experience of two days and a weekly budget.

### Where the tokens went, window B, by what the call did

| Activity                                                              | M weighted | Share | Calls |
| --------------------------------------------------------------------- | ---------: | ----: | ----: |
| Build: edits, code reads, text, shell                                 |       34.8 |   36% | 1,074 |
| Proofs: contract:run and record, tests, lint, types, capture commands |       21.5 |   22% |   589 |
| Browser-pane calls (captures and checks) and other tools              |       11.4 |   12% |   328 |
| Git calls and commits                                                 |        8.7 |    9% |   260 |
| Status and check-specs                                                |        6.3 |  6.5% |   162 |
| Subagents other than reviewers (explore, general)                     |        5.2 |    5% |   274 |
| Reviews and their paperwork, in thread                                |        4.1 |    4% |   100 |
| Reviewer subagents (Q2)                                               |        2.7 |    3% |   168 |
| Re-reading spec files                                                 |        1.6 |  1.6% |    53 |
| Re-reading conventions and roles                                      |        0.9 |  0.9% |    26 |
| Questions to the operator                                             |        0.5 |  0.5% |    12 |

### Where the hours went, window B (foreground command waits, outliers over 30 minutes excluded)

| Wait                              |                Runs |         Wall |                                 Median | Note                                                     |
| --------------------------------- | ------------------: | -----------: | -------------------------------------: | -------------------------------------------------------- |
| Capture commands                  |                 157 |      112 min |                                    6 s | p90 120 s; plus 276 browser-pane calls                   |
| Other shell                       |                 514 |       87 min |                                    3 s |                                                          |
| `yarn contract:run` and `record`  |                  88 |       79 min |                                   48 s | about 7 runs per ticket                                  |
| Lint and types                    |                 210 |       58 min |                                    8 s |                                                          |
| `yarn status` and `check-specs`   |                 212 |       52 min |                                    9 s | about 7 per ticket                                       |
| `yarn test` and workspace tests   |                 101 |       44 min |                                    9 s |                                                          |
| Database commands                 |                  50 |       43 min |                                    7 s | one 11-hour wait excluded                                |
| Git                               |                 374 |       45 min |                                    3 s |                                                          |
| `yarn review:run`                 |                  47 |       35 min |                                   11 s | most refused or backgrounded; a full run is 5 to 7.5 min |
| `yarn contract:init`, `qa`, `add` |                  63 |       20 min |                                  9.5 s |                                                          |
| `yarn verify`                     |                  34 |        9 min |                                   12 s | every run stopped at step 1: the standing red            |
| SessionStart hook                 |                  36 |        4 min |                                    7 s | 150 tokens into context each                             |
| Stop hook                         | 285 stops, 74 timed | 11 min timed | 8 s on a changed tree, 0.3 s unchanged | blocked 20 stops on a red `verify:fast`                  |

Foreground waits total 10.5 of 19.1 active hours (55 percent). On 10-06 they were 4.9 of 8.7 (56 percent), with `yarn verify` at 18 runs, 34 minutes and a 102-second median when it was green.

## The operator's nine points, answered

**1. Thread size and re-learning.** Both of the first report's claims hold, and the theory that longer threads would be cheaper is contradicted. Re-learning is under 3 percent of a window (floors 1.3 percent, convention and role reads 0.9, spec reads 1.6). Carrying context is a third to a half of a ticket. The split of LAB's in-thread spend (20 tickets with 15 or more calls, 73.4M, 171 criteria, 0.43M per criterion):

| Component                                                                  | M weighted | Share |
| -------------------------------------------------------------------------- | ---------: | ----: |
| Session floors (about 25 threads)                                          |        0.9 |  1.2% |
| Re-reading conventions, roles and spec files                               |        1.1 |  1.5% |
| Build                                                                      |       29.3 |   40% |
| Proofs (contract:run, tests, lint, capture commands)                       |       21.0 |   29% |
| Browser-pane capture driving, window B only                                |        9.1 |   12% |
| Reviews and their paperwork, in thread                                     |        3.8 |    5% |
| Status and check-specs                                                     |        2.2 |    3% |
| Git calls and commits                                                      |        6.2 |    8% |
| Cross-cutting: context inherited from an earlier ticket in the same thread |       23.5 |   32% |
| Cross-cutting: a ticket's own context growth                               |       11.4 |   16% |

The three-ticket threads of 10-06 spent 18.9M of 32.4M (58 percent) carrying earlier tickets' transcripts; the one-ticket threads of 10-07 spent 4.6M (11 percent) on that but still ended at 217k to 595k and paid 9.4M for their own growth. Per criterion the days cost the same: 0.44M against 0.41M.

**2. Tooling weight.** Hooks: about 150 tokens per thread start, under 0.01 percent; 7 seconds per start, 8 per stop on a changed tree, 0.3 unchanged; the Stop hook blocked 20 stops. What weighs is the thread's own habit of calling the tooling: status and check-specs 212 times (6.3M, 52 minutes), git 374 times (8.7M, 45 minutes), contract:init, qa and add 63 times (20 minutes). Per-ticket cost is visible today only for the nine headless reviews with cost fields. No closing report in the transcripts carries the Cost line the skill specifies, although the harness's usage tool was called 13 times; thread and ticket cost had to be rebuilt from transcripts again.

**3. Reviews.** About a third of LAB's total, and 43 percent of in-thread spend falls after the first review call (31.9M of 73.4M), most of it re-proving, re-capturing and fixing.

| Reviewer                 | Runs | M weighted |      Per run | Verdicts                | Source                              |
| ------------------------ | ---: | ---------: | -----------: | ----------------------- | ----------------------------------- |
| Warden, headless         |   17 |       12.8 | 0.57 to 0.81 | 17 PASS, 1 failed start | 3 measured, 14 at the measured rate |
| Mason, headless          |   14 |       12.6 | 0.86 to 0.99 | 14 PASS                 | 3 measured, 11 at the measured rate |
| Assay, headless          |    3 |        1.2 | 0.36 to 0.49 | 3 PASS                  | 2 measured                          |
| Assay, Q2 subagent       |    9 |        2.7 |  0.27 median | 9 PASS                  | measured                            |
| Vigil, Q2 subagent (MIG) |    6 |        0.9 |  0.15 median | PASS                    | measured                            |

The first report estimated 0.45M per headless run from in-thread subagents; the measured runs cost 0.36 to 0.99M and 5 to 7.5 minutes, so its Part 2 headless figure of about 13M was closer to 23M. Blocking findings across 35 headless and 15 subagent LAB runs: zero. FAILs: LAB-17 Mason in thread, WEB-12 Vigil. The PASS cap holds at Q3; at Q2 nothing enforces it and LAB-12, MIG-1, MIG-4 and MIG-9 ran their reviewer two or three times.

**4. A per-ticket token log.** Every transcript holds what is needed (usage per call, ticket ids in tool inputs), the Stop hook already parses that file, and this audit's attribution is about 200 lines of script. Nothing writes it to the ticket folder.

**5. What is extra, against the spec-system guide.** The guide's ticket had one thread, a kickoff block, `check-types` and the build, closure in three files, and the model named with the failure mode of choosing down.

| Step a PEM ticket takes that the guide's does not |                         Tokens |                              Minutes | What it buys                                          |
| ------------------------------------------------- | -----------------------------: | -----------------------------------: | ----------------------------------------------------- |
| Builder interview                                 |             0.7M per interview |                                   30 | track, QA, cast settled before work (first report G3) |
| Tickets gate with Vigil pre-flight                |  1 to 1.5M per epic [estimate] |                                    8 | contract defects found before build (first report Y5) |
| SessionStart and Stop hooks                       |           150 tokens per start |                  7 s start, 8 s stop | orientation; no red file left behind                  |
| `contract:init`, `qa`, `add`                      |          about 0.3M per ticket |                         9.5 s median | the folder and frozen criteria                        |
| `contract:run` and `record`                       |     in proofs, 29% of a ticket | 48 s median, about 7 runs per ticket | results.json, evidence files                          |
| Captures through the browser pane                 | 9.1M in B, 36 images read back |                    157 runs, 112 min | state proof; Assay's input                            |
| As-built                                          |              under 1M per epic |                     a few per ticket | the guide's DEVIATIONS.md, per ticket                 |
| Headless Q3 reviews                               |             0.36 to 0.99M each |                             5 to 7.5 | fresh-context specialist check                        |
| Q2 subagent review                                |              0.15 to 0.3M each |                               2 to 4 | the same, lighter                                     |
| `yarn status` and `check-specs`                   |                      6.3M in B |                                   52 | orientation; generated `_status.md`                   |
| Per-criterion commits                             |                      8.7M in B |                                   45 | fine history                                          |
| `yarn verify` at close                            |               101 s when green |                      34 min on 10-06 | CI parity                                             |

**6. Model choice.** No contract or table row names a minimum. 41 of 51 LAB and MIG contracts name a model in their build notes: 36 Opus 5.5, 3 Fable 5.1, 2 Sonnet 5.5. In B, Opus threads were 62.5M weighted and Fable threads 22.7M; Claude Code's own meter prices them at $195 and $184: $3.12 against $8.32 per weighted million, 2.7 times. The Fable threads were the harness work, the decide-together threads and MIG-8 to 10. Builds ran on Opus; shaping and harness ran on the most expensive model and took half the money for a quarter of the tokens. The research note filed on 10-07 (`docs/research/engineering/model-selection-claude-code.md`) concludes: Opus 5.5 recommended for builds until a calibration runs, Sonnet 5.5 at medium effort the provisional build minimum, Opus 5.5 the floor for review, shaping and research, Fable 5.1 an escalation and never a default; it also corrects two prices this report carried (Fable cache reads are one fortieth of input; Sonnet 5.5 cache reads halved to $0.10 on 2026-10-07).

**7. verify and test.** Verify, tests and contract:run together are 11 percent of active time in B and 15 percent on 10-06. Verify looks cheap in B only because it was red at step 1 all week. The Stop hook's scoped `verify:fast` covers Prettier, lint and types on affected workspaces and their dependents, boundaries and tooling types; it does not run tests, the build or the repo hygiene checks. The one break that costs redo work is another workspace's tests broken by a shared change, and it happened once: LAB-11's two failing web tests stalled LAB-15 and LAB-16 for about 12 hours and cost a re-prove thread (3.2M, 40 minutes); it surfaced through contract:run, not verify. CI runs `yarn verify` only on pull requests and pushes to main; this branch has had neither, so CI gated nothing this week.

**8. Sharing with teammates.** Confirmed: `.claude/*` is ignored, then `settings.json`, `rules/` (8 files), `agents/` (5) and `skills/` (2) are negated and tracked, 17 files; `settings.local.json`, `CLAUDE.local.md`, `launch.json` and `worktrees/` stay local. `AGENTS.md` (58 lines) is canonical; `CLAUDE.md` (10 lines) is a shim. The gap is tool parity, not git: hooks, skills and subagents are Claude Code only; the floor every tool gets is `AGENTS.md`, the rules folder and `yarn verify`.

**9. A hardening track.** Designed as a stage, below (R9). A LAB ticket's build before any review is about 2.1M and 45 to 60 active minutes [measured, 41.4M over 20 tickets]; a build-only pass of 45 to 60 calls at a smaller context is 1.5 to 2M and 20 to 30 minutes [estimate].

## Findings

### Red

**R1. The second half of a ticket is as large as the first, and it buys zero Blocking findings.** Where: every LAB thread; `qa-levels.md` and `tk-batch` (review at the level, then re-prove). What happens: after the first review call a LAB ticket spends 31.9M of 73.4M on fixes, re-proves and re-captures; headless reviews cost 0.36 to 0.99M each (twice the first report's estimate); 35 headless and 15 subagent LAB runs returned no Blocking. Smallest fix: the hardening stage (R9) runs every proof and review once, on code the operator has approved. Measured; confidence high on the counts, medium on the per-run estimate for the 26 unmeasured runs.

**R2. Context is still half of a ticket.** Where: every thread. The batch threads of 10-06 paid 58 percent of LAB spend carrying earlier tickets; the one-ticket threads of 10-07 still ended at 217k to 595k. The 10-06 rule reached captures only. Smallest fix: one ticket per thread, always, and the build pass out of the proof-and-capture loop so the thread stays small (R1, R9). Measured by segment; confidence high.

### Orange

**O1. Fable ran the harness and the shaping.** Half of B's money on a quarter of its tokens: $184 against $195 at list prices [measured, Claude Code's cost records]. No prompt or table names a minimum model. Smallest fix: the model column with minimum, recommended and failure mode, and Fable never a default (R6).

**O2. Threads orient seven times per ticket.** 212 status and check-specs calls, 374 git calls in B: 15 percent of tokens and 1.6 hours. Smallest fix: `tk-batch` says once at start, once at close, one commit per outcome (R2 in the cuts).

**O3. The branch is red, so nothing is provable, and CI gates nothing.** 34 verify runs in B all stopped at `format:check` on untracked intake files; `lint:docs` and `directory-map` fail on `docs/research/ui-patterns/`. No pull request has been opened, so CI's promise has not run. Smallest fix: the operator files or ignores the intake; verify moves to the end of hardening (R7).

**O4. Captures are the heaviest proof.** 157 capture commands, 276 browser-pane calls, 36 images read back, 112 minutes and about 9M in B, repeated after each review round. Smallest fix: captures once, at hardening (R9); in the build pass the thread's own screenshots serve Assay (R3).

### Yellow

**Y1. Resumed threads after a break.** 13 full re-writes after gaps over five minutes, 4.4M tokens, about 2 points, after the Stop hook began saying not to. The hook informs; one ticket per thread removes the reason to resume.

**Y2. The LAB brief is four times its cap.** `yarn budget`: brief and package 8,492 tokens against 2,000; the UI build 17,976 against 15,000. Every UI thread that attached it paid about 8k tokens per call. Open item: the settled decisions belong in the product layer; the brief returns to the template's shape.

**Y3. No thread has written its Cost line.** 0 closing reports carry it; the usage tool was called 13 times. The instrument from C4 exists for reviews only. Smallest fix: `yarn cost <id>` (R4).

### Grey

**G1. Hooks are still not a token sink.** Under 0.01 percent; seconds only, and the Stop hook blocked 20 red stops. Hypothesis rejected again.

**G2. Re-learning is under 3 percent.** Floors 1.3 percent, convention and role reads 0.9, spec reads 1.6. The first report's 1 percent holds within its scope.

**G3. The harness reaches teammates on checkout.** 17 tracked files under `.claude/`; the gap is tool parity, documented in R8.

**G4. The eight changes did what they said.** The Q3 PASS cap refused the runs it should (WEB-12's walk); the status skip and context line print; review costs are on record; no LAB criterion names `yarn verify`. Their effect on a ticket's shape was nil, which is why the operator felt nothing.

## Hypotheses, tested

| Hypothesis (the operator's)                         | Verdict                                         | Number                                                                               |
| --------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Re-learning conventions is a large share of an epic | Rejected                                        | under 3% of a window                                                                 |
| Longer threads with more tickets would be cheaper   | Rejected                                        | batch threads paid 58% of LAB spend carrying earlier tickets; one-ticket threads 11% |
| The first report's "context size is the sink"       | Confirmed again                                 | 52 to 57% of calls over 200k carried 73 to 81% of cache reads                        |
| The first report's "re-reading about 1%"            | Confirmed                                       | 0.9% conventions and roles; 2.5% with spec files                                     |
| Tooling and hooks make each ticket heavy            | Hooks no; the thread's calls to the tooling yes | 15% of tokens, 1.6 h in B                                                            |
| Reviews are a big part of the cost                  | Confirmed                                       | about a third of LAB; 43% of in-thread spend after the first review                  |
| The system always chooses the most expensive model  | Half right                                      | builds on Opus; harness and shaping on Fable, half the money                         |
| verify and test are heavy                           | 11 to 15% of active time; verify red all week   | 34 runs stopped at step 1                                                            |
| The harness is hidden from git                      | Rejected                                        | 17 tracked files                                                                     |
| A hardening phase would be more practical           | Confirmed by the shape of the spend             | 60% of a ticket's calls are after-build work                                         |

## Per ticket

| Ticket          | QA  | Criteria | Window | Threads | Calls | M weighted |     Build | Hardening (proofs, reviews, status, git) | Inherited context | Headless runs | Captures |  Active min |
| --------------- | --- | -------: | ------ | ------: | ----: | ---------: | --------: | ---------------------------------------: | ----------------: | ------------: | -------: | ----------: |
| LAB-1           | Q3  |        5 | A      |       5 |    83 |        2.1 |       0.7 |                                      1.4 |               0.6 |             3 |        0 |             |
| LAB-2           | Q3  |        5 | A      |       2 |    59 |        2.2 |       1.1 |                                      1.1 |               1.4 |             3 |        0 |             |
| LAB-3           | Q3  |        5 | A      |       1 |    31 |        1.2 |       0.5 |                                      0.7 |               0.9 |             1 |        0 |             |
| LAB-4           | Q2  |        6 | A      |       3 |    54 |        1.2 |       0.5 |                                      0.6 |               0.3 |             2 |        0 |             |
| LAB-5           | Q3  |        8 | A      |       4 |    66 |        2.2 |       1.0 |                                      1.2 |               0.6 |             2 |        1 |             |
| LAB-6           | Q3  |        7 | A      |       2 |    81 |        3.2 |       1.6 |                                      1.1 |               2.4 |             1 |        6 |             |
| LAB-7           | Q3  |       13 | A      |       3 |    55 |        2.6 |       0.9 |                                      1.6 |               2.0 |             4 |        7 |             |
| LAB-8           | Q2  |        9 | A      |       4 |   151 |        6.8 |       2.9 |                                      3.2 |               2.4 |             1 |        7 |             |
| LAB-9           | Q3  |        8 | A      |       3 |   136 |        6.2 |       1.9 |                                      2.5 |               4.7 |             5 |       16 | 36 (B part) |
| LAB-10          | Q2  |        9 | A      |       2 |    68 |        4.4 |       1.9 |                                      1.9 |               3.6 |             0 |        3 |             |
| LAB-11          | Q2  |       11 | B      |       4 |   132 |        5.0 |       1.8 |                                      2.6 |               0.3 |             0 |       18 |          90 |
| LAB-12          | Q2  |       11 | B      |       3 |   160 |        6.8 |       3.3 |                                      2.0 |               0.0 |             0 |       17 |          79 |
| LAB-13          | Q2  |        9 | B      |       2 |    61 |        2.6 |       1.4 |                                      0.9 |               1.4 |             0 |        6 |          20 |
| LAB-15          | Q3  |       10 | B      |       4 |   147 |        6.1 |       2.2 |                                      2.7 |               0.5 |             3 |       11 |          89 |
| LAB-16          | Q3  |       11 | B      |       3 |   135 |        4.0 |       1.6 |                                      1.6 |               1.0 |             4 |       20 |          67 |
| LAB-17          | Q2  |       12 | B      |       2 |   144 |        5.8 |       2.3 |                                      1.9 |               0.0 |             0 |        9 |          58 |
| LAB-18          | Q2  |       11 | B      |       2 |    98 |        3.2 |       0.7 |                                      1.0 |               0.0 |             0 |       10 |          32 |
| LAB-21          | Q2  |        8 | B      |       2 |    79 |        2.1 |       0.8 |                                      1.0 |               0.1 |             0 |       18 |          36 |
| LAB-24          | Q2  |        5 | B      |       4 |   124 |        3.1 |       0.9 |                                      1.9 |               0.2 |             0 |        7 |          43 |
| LAB-25          | Q3  |        8 | B      |       2 |    68 |        2.2 |       1.2 |                                      1.0 |               1.0 |             2 |        0 |          34 |
| MIG, 10 tickets |     |       60 | B      |         |   362 |       14.3 | 4.0 (28%) |                                8.9 (62%) |               5.9 |             4 |       11 |     8 to 87 |

Headless reviewers are outside these figures. LAB tickets built one per thread in B took 115 to 160 calls at an average of 22.6 seconds per call, including waits; the build before the first review is about half of that.

## Ranked sinks

1. The second half of a ticket (proofs re-run, captures re-taken, fixes after review, headless runs): about 60M of LAB's 102M, half of it estimated.
2. Context carried: 23.5M inherited plus 11.4M own growth, 48 percent of in-thread LAB spend.
3. Fable on harness and shaping threads: half of B's money on a quarter of its tokens.
4. The thread's own calls to status, check-specs and git: 15 percent of B's tokens, 1.6 hours.
5. Verify, tests and contract:run: 11 to 15 percent of active time; verify red all week.
6. Hooks, re-reading, floors, the interview: under 5 percent combined.

## The cuts, ranked, with Crucible's attack

Savings are per LAB-size epic (20 built tickets) against this week's about 102M weighted, 41 points and 35 thread-hours. Each cut names its mechanism and its removal condition.

**R9. The hardening stage: Build, Seen, Harden, under the existing QA levels.** A new shared stage file `docs/workflows/stages/harden.md`; the epic's level 6 becomes three beats and the one-off gets the same three moves with Harden optional; `tk-batch` learns "harden <ids>" so any ticket with a contract can be hardened whenever the operator says so. Build (Q1 shape, one thread per ticket, the model the row names): build, the ticket's own tests and the affected workspace's suite, `check-types`, the UX truth updated, Assay in-thread on UI tickets from the thread's own screenshots; no ledger, no captures, no as-built, no headless review; ends with five lines and the dev-server links. Seen: the operator walks the running surface and `?state=`, gathers any stakeholder approval, iterates by "fix" or a follow-up ticket, then says "harden". Harden (the ticket's confirmed level, one thread per ticket, Opus): `contract:run` and `record` once, captures once, as-built, one review per seat, and the epic's last hardening thread runs `yarn verify` and `check-specs --strict`. Tooling: no new script; `status` gains the word "built" for a ticket whose code is in and whose criteria are unrecorded; `contract:qa` already raises a level. Saving: the build pass about 35M and 14 points in 13 to 15 thread-hours, the hardening pass about 30M and 12 points, against 102M and 41 [estimate]. Loses: nothing is proven or merge-ready until the operator says harden; findings arrive once, late; CI stays red for the epic unless the branch is cleared first. Removal condition: a ticket whose build pass is as cheap as its hardening, which would mean the proofs had become free.

Crucible. Steelman: iteration on unproven code is how regressions compound, and a surface that looks right can hide a leak path the operator cannot see from a browser; LAB's gate and roles are exactly the auth and personal-data work Q3 exists for. Attack: the ledger and the reviews still run, once, on code that has stopped moving, which is when they are worth most; what the stage removes is proving each intermediate state the operator was about to change anyway, and this week those intermediate proofs and rounds found zero Blocking. The real risk is the Seen step: an approval from a stakeholder's screenshot instead of a walk makes the hardening reviewer the first eyes on behaviour. Falsifier: a hardening pass that FAILs on a ticket the operator marked seen, more than once in an epic; then the build pass regains the ticket's own capture. Verdict: survives, with the walk as the condition.

Reeve, on order. The Tickets gate prints the execution table (order, wave, depends on, minimum and recommended model, hardens later). The operator opens one build thread per ticket in wave order; each ends with five lines and the links. The operator walks, approves with whoever must approve, and names the tickets to harden. One hardening thread per ticket, Opus, in the same order; the last names itself as the epic's close and runs verify. The operator merges. Nothing waits on a review until the operator says so.

**R1. One ticket per thread, always, and the execution table.** Prose in `tk-batch`, `stages/build.md`, `stages/tickets.md` §7. Saving: 15 to 20M on a batch day; about 4M on a day already run one ticket per thread. Loses thread memory across tickets, which the ticket folder holds. Removal condition: a model whose per-call price no longer scales with context. Crucible: friction only; the first report's C2 attack stands.

**R3. Reviews belong to hardening, one run per seat; Q2 gets the one-run rule.** Assay in the build pass on UI tickets, in thread, advisory; Warden early only the first time a door path (`technical.md`) is built; Mason, Warden and Threshold at hardening; at Q2 one subagent run per ticket, no second without the operator's word. Saving: reviews from about 35M to 14M, 9 points [estimate from measured per-run costs]. Loses the second lens on tickets off the door paths.

Crucible. Steelman: several Should-fix findings were real leak paths, and a builder alone did not find them. Attack: every one was graded below Blocking by the reviewer who found it, and in 50 LAB runs none was Blocking; deferring the review batches those findings into one pass per seat on code that has stopped moving, which is cheaper and no less fresh. Second-order risk: the operator's eye becomes the only check for days, and a leak path ships to a preview. Falsifier: a hardening review that returns a Blocking on code the operator had approved as seen; one such finding in the next epic retires the cut to UI-only deferral. Survives.

**R2. Threads orient once.** `tk-batch`: `yarn status` at start and at close, no mid-ticket check-specs, one commit per outcome. Saving: about 8M and 2 hours of waits. Loses finer history. Not a check removal.

**R7. Verify once, by the epic's last hardening thread; tests by scope.** Build threads never run `yarn verify` or `yarn test` whole; the build pass ends with the ticket's tests and the affected workspace's suite; the Stop hook's scoped check stays. The standing red is cleared first. Saving: 1 to 2 hours of waits per epic. Loses: hygiene reds found late, minutes to fix.

Crucible. Steelman: verify is cheap insurance; per ticket it catches a cross-ticket break while the thread that caused it still exists. Attack: this week verify caught nothing because it was red before any thread started; the catching was done by the scoped check (20 blocked stops) and by contract:run (LAB-11's tests). The class that costs redo work, another workspace's tests, is covered by the affected suite at each build close. Falsifier: one break per epic that the scoped check and the affected suite both missed; then verify returns to once per hardened ticket. Survives.

**R6. The model column, from the research note.** Every ticket row and every printed prompt names a minimum and a recommended model with the failure mode of choosing down. Defaults [PROPOSED, from `docs/research/engineering/model-selection-claude-code.md`]: executing a ticket, minimum Sonnet 5.5 at medium effort, recommended Opus 5.5 at medium until the calibration passes; UI against the canon, minimum Sonnet 5.5, recommended Opus 5.5; shaping, review, research and audits, Opus 5.5 floor; Fable 5.1 an escalation when Opus at xhigh falls short, never a default, and never for harness or decide-together threads. Effort pinned at thread start. The calibration runs as its own one-off: two tickets, Sonnet and Opus siblings, the note's thresholds. Saving: about $110 of this window's $380 at list price from the Fable rule alone; the Sonnet saving is unknown until the calibration. Removal condition: the calibration moves the defaults.

**R4. A per-ticket cost log.** `yarn cost <id>` reads the transcripts as this audit did and writes a `cost` block into `results.json` at close (calls, weighted tokens, by category, context at close, headless runs); `tk-batch`'s Cost line reads it. Q1, buildable on Sonnet. Saving: none; the instrument. Removal condition: the harness exposes per-session usage to the agent in the transcript's own folder.

**R8. Teammates: a checkout table and a doctor row.** `docs/runbooks/onboard-agent.md` gets one table (tracked on checkout, local to set up, Claude-only against every tool) and `yarn doctor` names any missing local item. Q0.

**Judged and not recommended.**

- Thinning the hooks: under 0.01 percent of tokens, and the Stop hook caught 20 red stops.
- Raising the budget caps: the fix for Y2 lands in the brief, never the cap.
- A hardening track: a track is a kind of work; hardening is how every build track ends, so it is a stage.
- Verify once per hardened ticket: 101 s times 20 against a redo risk the affected suite already covers; the operator can raise it per epic.
- A smaller model for reviews: the research note's evidence (a Sonnet 5.5 reviewer caught 6 of 13 seeded bugs against Opus 5.5's 8) keeps the floor at Opus.

## What was not examined

- The meter itself; the 2.5M-per-point mapping is the first report's, and Fable threads may consume it faster than their weighted count suggests.
- Headless reviewers' own transcripts (none exist); the 26 unmeasured LAB runs are estimated from the nine measured ones.
- The quality of review findings; counted by grade, not judged.
- Sessions after 2026-10-07 22:26 PDT, and anything under `docs/research/` other than the model-selection note the operator filed for this audit.
- Whether an in-thread Assay given a thread's own screenshots judges as well as one given recorded captures; the hardening pass re-captures either way.

## Decisions

Decided by the operator in this thread on 2026-10-07: all nine recommendations accepted; R6 sharpened by the research note filed the same evening; prompts grouped as one prose change set, one tooling change, one teammates note and one calibration, printed in the thread and never saved. The decision log is in `docs/decisions/changelog.md`, entry "2026-10-07 — PEM: the second token and speed audit's findings, decided".
