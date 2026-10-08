# Token and speed audit, 2026-10-05 to 2026-10-06

Track: audit, lens cost and speed, Q0. Lead Lorimer; Tally consulted on counting, Crucible on the cuts. Read-only: this file is the only write.

## Verdict

The machinery is sound but one loop in it is not: at Q3 every fix after a review PASS makes the review stale, a fresh reviewer then finds new orange items, and the builder goes round again, so two tickets took 17 headless reviews and about a quarter of the day's tokens to close from a state where both reviewers had already said PASS. Fix that loop and the habit of working in threads past 200k tokens, and the day's spend falls by roughly 40 percent without touching what Q3 proves; the hooks, the verify output and the builder interview are not where the money went.

**Extended on the evening of 2026-10-06** after the LAB build day: [Part 2](#part-2-the-lab-build-day-2026-10-06-0740-to-1756-pdt) answers whether the system became two to three times slower and heavier. Short form: per clock hour yes, because three build threads ran at once and each grew past 375k tokens; per unit of agent work no; per ticket about 2.5 times, two thirds of it from heavier tickets and two reviewers times two or three rounds on every Q3 ticket, one third from the context size. The review loop from R1 ran again: 26 headless reviews, every one PASS.

## Counts by flag

| Flag   | Count |
| ------ | ----: |
| Black  |     0 |
| Red    |     1 |
| Orange |     4 |
| Yellow |     3 |
| Grey   |     3 |

## How this was measured

- **Sources.** 52 transcript files under `~/.claude/projects/-Users-taylor-lighthouse-product-engineering-mastery*/`: 39 sessions and 13 subagent transcripts, read by script, counting only records timestamped from 2026-10-05 00:00 PDT (07:00Z) to the start of this audit (2026-10-06 07:40 PDT). Four of the 39 session files hold no API call in the window. Git log on `feature/conventions-setup` since 2026-10-04; `agent/LAB` is an ancestor of it at `79eba01` with no commits of its own, so its work appears as the LAB threads below. `results.json` and `review-*.md` for heads, models and times. `docs/engineering/tooling.md` for the hook and verify timings already measured.
- **One API response, one count.** Claude Code writes one transcript record per content block of a response, each carrying the same usage. A naive count gives 4,451 calls and 148M weighted tokens; counting once per message id gives 2,088 calls and 62.5M. Every number below is the de-duplicated one.
- **Weights.** To rank sinks across token kinds, tokens are weighted at list-price ratios: fresh input 1, cache write 1.25, cache read 0.1, output 5. "M equiv" means million weighted tokens. This is an estimate of cost, not the plan meter's formula, which is not public.
- **Usage points.** The operator's weekly meter rose 28 points between 2026-10-05 14:00 and 2026-10-06 14:00 PDT. The sessions in that window sum to 55.6M equiv, plus an estimated 9M for the headless reviewers that leave no transcript. So one point is about 2.3M equiv [estimate]. No other repo's project folder shows an API call in the window.
- **Time.** "Active" is the sum of gaps of at most 15 minutes between consecutive records. Command wall time is the gap between a Bash tool call and its result, foreground calls only. Hook time is the `durationMs` the harness records.
- **Chars to tokens** at 4 characters per token where a tool result is quoted by size.
- **Headless reviewers** (`yarn review:run`) run `claude -p --no-session-persistence` and leave no transcript. None appears in the project folders. Their cost is estimated from the 13 in-thread fresh-context reviewer subagents that do appear (0.16 to 0.25M equiv each, 5 to 16 calls) and the measured headless run time of 4.5 to 7 minutes (four foreground runs: 272, 363, 404 and 422 s): 0.3 to 0.6M equiv per run, midpoint 0.45M [estimate, low confidence].

## The window in numbers

| Measure                                  |                                             Value | How                                                                                       |
| ---------------------------------------- | ------------------------------------------------: | ----------------------------------------------------------------------------------------- |
| API calls                                |                                             2,088 | one per message id                                                                        |
| Human turns                              |                                               146 | user records that are not tool results                                                    |
| Cache-read tokens                        |                                            394.6M | summed usage                                                                              |
| Cache-write tokens                       |                                             10.7M | summed usage                                                                              |
| Output tokens                            |                                             1.86M | summed usage                                                                              |
| Fresh uncached input                     |                                            10,000 | summed usage; everything else hits the cache                                              |
| Weighted total                           |                                       62.5M equiv | weights above                                                                             |
| Of which after PR-19 landed (14:00 PDT)  |                                       55.6M (89%) | timestamp split                                                                           |
| Active time, all threads                 |                                            15.1 h | gaps of 15 min or less                                                                    |
| Calls with context over 200k             |                                         745 (36%) | input + cache read + cache write per call                                                 |
| Cache-read tokens carried by those calls |                                        224M (57%) | same                                                                                      |
| Context above 200k, summed over calls    |                  79.8M tokens, 8.0M equiv (12.8%) | per-call excess                                                                           |
| Full-context re-writes after an idle gap |          15 calls, 3.9M tokens, 4.9M equiv (7.8%) | cache write over 60k in one call, first call excluded; 14 of 15 followed a gap over 5 min |
| Compactions                              |                                                 0 | none in the window; the 1M-context models never compacted                                 |
| Session floor (first call's cache write) | median 29.5k tokens; 44 starts, 1.6M equiv (2.6%) | first assistant record per transcript                                                     |

### Where the tokens went, by activity

Attribution is by session, from the first prompt, the title and the ticket ids in tool inputs. Non-overlapping; sums to the total.

| Activity                                                                                              | M equiv | Share | Confidence                               |
| ----------------------------------------------------------------------------------------------------- | ------: | ----: | ---------------------------------------- |
| Builds and closes (five threads; STK-17, 18, 21, 24, 25, 26, WEB-8, WEB-9)                            |    18.1 |   29% | high                                     |
| of which the Q3 review loop on STK-18 and STK-21, builder side only                                   |     8.4 |   13% | high (segments between review:run calls) |
| plus headless reviewers, outside the transcripts (21 runs)                                            |    ~9.5 |   n/a | estimate, low                            |
| STK-20 cold dry run, as four subagents of the build thread                                            |     8.4 |   13% | high                                     |
| One 640k-token conversation thread (95 calls, 8 human turns, 19 h span)                               |     7.7 |   12% | high                                     |
| LAB epic: three shaping threads and eight parallel contract-drafting threads                          |    14.6 |   23% | high                                     |
| PEM practice and tooling docs threads, 13:00 to 15:00 PDT on 10-05                                    |     8.6 |   14% | high                                     |
| Audits and questions (an audit of two other repos with four subagents, this audit, six small threads) |     4.6 |    7% | high                                     |
| Builder interview (one `tk-prompt` session, 31 calls, 5 question rounds, 30 min)                      |     0.7 |    1% | high                                     |

### Where the hours went

Of 15.1 active hours across all threads, the waits on commands and hooks were:

| Wait                            | Runs | Wall    | Median | Note                                                                                           |
| ------------------------------- | ---: | ------- | -----: | ---------------------------------------------------------------------------------------------- |
| `yarn verify` run directly      |   55 | 62 min  |   76 s | 23 outputs truncated by the harness, 1.5 MB kept out of context                                |
| `yarn contract:run`             |   37 | 65 min  |  124 s | each runs the ticket's commands; `yarn verify` is a criterion on STK-18, STK-21, STK-26, WEB-8 |
| `yarn test` and workspace tests |   65 | 17 min  |    9 s |                                                                                                |
| `yarn review:run`, foreground   |    4 | 25 min  | ~6 min | 13 more ran in the background in the build thread, about 80 min overlapped                     |
| `yarn status`                   |   33 | 4 min   |  2.5 s |                                                                                                |
| SessionStart hook               |   38 | 3.0 min |  4.7 s | 150 tokens into context each                                                                   |
| Stop hook                       |   82 | 7.5 min |  5.5 s | 0 blocks in the window; its message goes to the person, not the model                          |

Foreground waits total about 2.9 h, 19 percent of active time. The two verify families alone are 2.1 h.

## Findings

### Red

**R1. At Q3, a review PASS does not end the review.** Where: `tooling/review-run.ts` (the review binds the contract and as-built hashes), `tooling/check-specs.ts` and `tooling/status.ts` (a Q3 review goes stale when a planned path or the as-built changes), `docs/workflows/qa-levels.md` and `.claude/skills/tk-batch/SKILL.md` (fix black, red and cheap orange, then "prove again"; nothing says whether to review again). What happens: the reviewer returns PASS with orange and yellow findings; the builder fixes some, which changes planned-path files or the as-built; the status line the hooks print now lists the review as left to do; the builder re-runs the reviewer; a fresh context finds different orange items; repeat.

What it cost in the window, measured in the one build thread (`1f88b3cf`, 293 calls, 2.6 h):

| Ticket | Headless runs in window | Verdicts                               | Builder-side tokens between runs | Wall     |
| ------ | ----------------------: | -------------------------------------- | -------------------------------: | -------- |
| STK-18 |              5 (Warden) | PASS, PASS, PASS, PASS, PASS           |                       5.0M equiv | ~62 min  |
| STK-21 | 12 (Vigil + Warden × 6) | round 2 Warden FAIL; the other 11 PASS |                       3.4M equiv | ~104 min |

Plus 17 headless runs at an estimated 0.45M each, 7.6M equiv [estimate]. Together about 16M equiv, a quarter of the day, roughly 7 usage points, to take two tickets from "both reviewers PASS" to closed. The thread's context grew from 142k to 484k over the loop, so each later round's builder-side call cost three times an early one.

What each round found, from the commit messages and the counts of findings in the review files the builder read (Blocking / Should-fix / Consider):

- STK-18 round 3 (0/1/3): per-tier Sentry project with no fallback to production's; replay, feedback and profiling dropped by name; tags and transaction scrubbed. Round 4 (0/1/5): thread frames lose locals; nested data-collection keys guarded; the as-built edited. Round 5 (0/1/3): release-health sessions dropped; logentry scrubbed; the as-built corrected. Round 6 (0/1/3): integration names checked against the SDK's factories; server_name dropped. Round 7 (0/0/2): closed; one Consider became STK-27. Two more Warden rounds ran on 2026-10-04, before the window.
- STK-21 round 1: Vigil (0/5/3), Warden (0/4/3), nine fixes in two commits. Round 2 (1/2/0), the only FAIL: a checkout relinking a user still entitled elsewhere; a legitimate re-review. Round 3 (0/4/0), round 4 (0/4/0), round 5 (0/2/0), round 6 (0/1/0): the last Should-fix (the runbook's alerting line) was fixed without a seventh run.

Could a round have been avoided? Rounds after a PASS were driven by orange and yellow findings, which the rule already routes to follow-ups unless cheap; what the rule does not say is that fixing them must not trigger a re-review, and the staleness check says the opposite. Every run after the first found different orange items on code the previous run had passed: that is reviewer variance, not builder failure, and no number of rounds converges it. Of the 11 post-PASS runs, none returned a Blocking. A first review told it was the only pass would plausibly have listed more per run; that is judgment, not measured. Smallest fix: a PASS is final for its round; fixes to orange and yellow findings re-prove (`contract:run`) and do not re-review; a FAIL earns one re-review; a third run needs the operator. Measured from the transcript segments and the review-file reads; confidence high on the mechanism and the counts, medium on which specific round each re-run was triggered by the as-built edit versus habit.

### Orange

**O1. Threads past 200k tokens, and resuming them after a break.** Where: every thread; worst the conversation thread `4a30d9c1` (title in the session folder: a workflow review), 95 calls over 8 human turns and 19 hours, context 209k at its first call and 640k at its last, 7.7M equiv (12.3 percent of the day) for 180k tokens of output. Across the window 745 calls ran above 200k and carried 57 percent of all cache reads; the excess above 200k is 8.0M equiv. Resuming a large thread after more than five minutes re-writes the whole context as cache: 15 such calls, 3.9M tokens, 4.9M equiv, 14 of them after an idle gap. One resume of the 640k thread cost 0.8M equiv before any work. Smallest fix: a rule and a hook line. The rule: a new thread per ticket or batch, and a fresh thread instead of resuming any thread over 200k after a break; the ticket folder is the hand-off, so continuity costs the 29.5k floor plus re-reading, about 0.1M equiv. The hook line: the Stop hook already reads the transcript; have it print the last call's context size and, above 200k, one sentence recommending a fresh thread. Measured from per-call usage; confidence high.

**O2. The STK-20 cold dry run ran as subagents inside the Q3 build thread.** Where: `1f88b3cf`, subagents `acc423` (179 calls, 4.0M equiv) and `ab6333` (155 calls, 3.7M), plus a fix agent (0.7M) and the STK-18 removal rehearsal (0.35M): 8.4M equiv, 13 percent of the day, one commit (`0079371`: 21 stops, 61 minutes). The two cold agents are each as expensive as a mid-size thread, and their hand-backs landed in a parent context already at 450k, where the 20 calls that followed cost 1.6M. Smallest fix: a dry run or any sub-task expected to exceed about 50 calls is its own thread from a builder prompt, at the model and QA level the operator picks, never a subagent of a Q3 build. Saving per dry run: the parent's post-hand-back cost, 1 to 2M equiv [estimate], and the option of a smaller model. Measured from the subagent transcripts; confidence high on cost, medium on the saving.

**O3. `yarn verify` as a criterion command, against a rule that already exists in prose.** Where: `.claude/rules/specs.md` and `docs/engineering/templates/contract.template.md` have said since 2026-10-03 (PR-15, `a9c0638`) that `yarn verify` is never a criterion; `checkCommand` in `tooling/lib/specs.ts` only checks that the script exists, so nothing enforces it. STK-18 C4 and STK-21 C3 were drafted hours before the rule; STK-26 C2 and WEB-8 C3 were drafted on 2026-10-05, two days after it, and carry it anyway. `tooling/contract.ts` runs each distinct command once per `contract:run`. In the window 92 runs of the 101-second chain or its subsets, 2.1 hours of waiting: 37 `contract:run` (median 124 s) and 55 direct `yarn verify` (median 76 s). The batch close runs it once more, and the stop gate's scoped `verify:fast` is on top. Token cost is under 1 percent (see G2). Smallest fix: the rule becomes a check: `contract:init` and `check-specs` refuse `yarn verify` as a criterion command, since the batch close proves it once; criteria name the specific check instead. A prose rule that two contracts broke within 48 hours is the case for the check. Saving: about an hour per day of the window, 4 to 7 minutes per `contract:run` on a ticket that carries it. Measured from tool-call gaps; confidence high.

**O4. Nothing records its own token cost.** Where: `tooling/review-run.ts` parses the headless result for `modelUsage` to get the model name and discards the usage; the closing report in `tk-batch` has no cost line; the review file header has `runner`, `model`, `at` and no cost. This audit had to reconstruct everything from raw transcripts, and the first pass over-counted by 2.4 times because the transcript's per-block records are not documented as duplicates. Smallest fix: `review:run` writes the reviewer's input, cache-read, cache-write and output tokens and its seconds into the review file header and the run record; the closing report ends with one line: calls, context at close, cache-read and output tokens for this thread. Saving: none directly; it makes R1, O1 and O2 measurable next week. Confidence high.

### Yellow

**Y1. The reviewer prompt invites ranging beyond the diff.** Where: the prompt in `tooling/review-run.ts` lists the changed files but also says to check the as-built's claims against the code and to read the cited surface; the role body is 17 to 19 KB of persona. The final review files cite 8 to 14 files each with line numbers, several outside the planned paths (`packages/env/src/pick.ts`, `packages/observability/src/error-reporter.ts`, `packages/db/test/rls.test.ts`). Runs take 4.5 to 7 minutes. The reviewers' own transcripts do not exist, so how much they read is not measured. Smallest fix: scope the prompt to the planned-path diff and the criteria, one hop out along imports to confirm a Blocking, and say it is the only pass unless it FAILs. Saving per run 0.1 to 0.2M equiv and 1 to 3 minutes [estimate, low confidence]; the real saving is fewer rounds (R1).

**Y2. `yarn status --brief` on every start and stop.** 120 hook runs at 4.4 to 5.8 s, 10.5 minutes in the window; 33 explicit runs more. Tokens: 150 per session start, about 6k in all. Smallest fix: the Stop hook skips the status call when the tree is unchanged, or caches it for a minute. Saving about 5 minutes a day, no tokens. Measured from hook durations; confidence high. Not worth its own thread; bundle with O1's hook line.

**Y3. Eight parallel drafting threads each paid the floor and re-read the brief.** The LAB contract-drafting threads (`62f4096e`, `6f795566`, `7901363d`, `7f9332d1`, `8e9168d2`, `eafe302e`, `fb365461`, `fd9a4ca8`) cost 6.7M equiv for 279 calls; each paid the 29.5k floor and read about 36k tokens of the same brief, technical and UX files: roughly 0.65M equiv of duplication, 1 percent. Parallel threads are not the sink; their per-call context is (mean 150 to 200k). No fix recommended beyond O1.

### Grey

**G1. Hooks are not a token sink.** SessionStart put 12.9k characters into context across 38 sessions; the Stop hook blocked nothing in the window, and its message never reaches the model; bash-guard denied 35 commands at about 60 tokens each. Total well under 0.1 percent. Hypothesis rejected. Their cost is Y2's seconds.

**G2. Verify and test output read back into context is not a sink.** 59 direct verify calls returned 49k characters in total: the harness truncates large tool output to a 2 KB preview and a saved file (23 truncations, 1.5 MB kept out), and `contract:run` writes logs to files and prints one line per criterion. The agent re-read 13 saved outputs, 412k characters, about 0.13M equiv to write and perhaps 0.5M resident: under 1 percent. Hypothesis rejected as stated; the proposal to write output to a file and print a tail is already the behaviour. The cost of verify is time (O3).

**G3. The builder interview is cheap.** The one pure `tk-prompt` session: 31 calls, 0.7M equiv, five question rounds, 30 minutes. The 26 question-tool calls in the window sit in eight sessions. No change.

## Hypotheses, tested

| Hypothesis                                                          | Verdict                   | Number                                                                                             |
| ------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| Q3 review loops are the main sink                                   | Confirmed                 | ~16M equiv of 62.5M (builder 8.4M measured, headless ~7.6M estimated); 16 of 17 runs returned PASS |
| Large single-thread contexts multiply every turn's cost             | Confirmed                 | 36% of calls over 200k carry 57% of cache reads; excess 8.0M; idle re-writes 4.9M                  |
| Verify and test output read back is a steady drain                  | Rejected                  | under 1%; the harness truncates; the drain is 2.1 h of wall                                        |
| Session-start and stop-gate pay seconds and tokens on every session | Seconds yes, tokens no    | 10.5 min per day; under 0.1% of tokens                                                             |
| The headless reviewer reads too much of the repo                    | Not measurable; plausible | 8 to 14 files cited per review, several outside the planned paths; 4.5 to 7 min per run            |
| Formed here: a PASS does not end the review at Q3                   | Confirmed                 | 11 post-PASS runs, 0 Blocking found by them                                                        |
| Formed here: resuming a big thread after a break re-writes it       | Confirmed                 | 14 of 15 full re-writes followed a gap over 5 min; 4.9M equiv                                      |

## Per ticket since PR-19

| Ticket | First commit to close (wall)                                    | Commits | Reviewer runs                                            | Re-proves (`contract:run` and record commits)                | Tokens attributable [estimate]                                                    |
| ------ | --------------------------------------------------------------- | ------: | -------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| STK-18 | 2026-10-04 18:54 to 2026-10-05 19:51, 24 h 57 min               |      27 | 7 Warden (2 before the window, 5 in it)                  | C1 to C6 recorded once at close; the removal rehearsed twice | 5.0M builder-side in the loop + ~2.3M headless; 4.8M by ticket id across sessions |
| STK-21 | 2026-10-05 19:11 to 21:05, 1 h 54 min                           |      11 | 12 (Vigil and Warden, six rounds)                        | C1 to C3 recorded twice (re-recorded after the round-6 fix)  | 3.4M builder-side + ~5.4M headless; 4.0M by ticket id                             |
| STK-20 | open; one commit 2026-10-05 21:07 (dry run 1: 21 stops, 61 min) |       1 | none (Q1, no reviewers)                                  | C1 to C4 unproven                                            | 8.4M in subagents + 2.2M by ticket id in parents                                  |
| STK-24 | 2026-10-05 18:59 to 19:05, 6 min                                |       3 | 1 in-thread Warden subagent (0.25M)                      | C1 once                                                      | 1.2M                                                                              |
| STK-25 | 18:42 to 18:48, 6 min                                           |       4 | none                                                     | C1 once                                                      | 0.3M                                                                              |
| STK-26 | 18:46 to 18:56, 10 min                                          |       6 | 1 in-thread Warden subagent (0.22M)                      | C1, C2 once                                                  | 0.8M                                                                              |
| WEB-8  | 15:33 to 15:48, 15 min                                          |      13 | 1 headless Warden (363 s)                                | C1, C2, C5 proven twice (after review fixes); C3 re-recorded | 1.0M + ~0.45M headless                                                            |
| WEB-9  | 18:41 to 18:58, 17 min                                          |       7 | 1 in-thread Warden subagent (0.24M)                      | C1, C4, C5 proven twice                                      | 0.8M                                                                              |
| STK-17 | 2026-10-04 18:54 to 2026-10-05 14:59, 20 h                      |      14 | 4 rounds; 2 headless Warden in the window (404 s, 422 s) | C1 to C4 recorded twice                                      | 1.6M + ~0.9M headless                                                             |

One Q3 review round costs, measured in the build thread: 12 to 18 minutes of wall (a 6-minute headless run, then fix, prove and commit), 0.25 to 2.0M equiv builder-side depending on the context size (median about 1.0M at 300 to 450k), and 0.45M per headless reviewer [estimate]: 1.3 to 1.5M equiv, about 0.6 usage points, per round. Tickets with no headless review closed in 6 to 17 minutes each.

## Ranked sinks

1. The Q3 review loop after PASS: about 16M equiv (26 percent, half of it estimated), 2.8 h of the two tickets' wall.
2. Context above 200k and idle re-writes: 12.9M equiv (21 percent); the 640k thread is 7.7M of it.
3. The STK-20 dry run inside the build thread: 8.4M (13 percent).
4. Verify as a criterion: 2.1 h of waiting, under 1 percent of tokens.
5. Everything else named in the brief (hooks, status, interview, output read-back): under 2 percent combined.

## The cuts, ranked, with Crucible's attack

Each cut names its saving per Q3 ticket in tokens and hours, both estimates, what it loses, and whether it is prose, a check or hook, or a prompt.

**C1. A PASS is final for its round.** Rule in prose (`qa-levels.md`, `tk-batch`, `stages/build.md`) and a change in a check (`check-specs`, `status`, `review-run.ts`). After a review PASS, fixes to Should-fix and Consider findings re-prove with `contract:run` and do not re-review; the as-built and planned-path hashes no longer reset a PASS; a FAIL earns exactly one re-review; a third run of the same reviewer on one ticket needs the operator's word, written into the contract as a `focus` line. Saving per Q3 ticket: 3 to 6M equiv (1.5 to 3 usage points) and 45 to 60 minutes, from STK-18's four avoidable rounds and STK-21's three. Loses: the orange findings of rounds 3 and later get drafted as follow-ups instead of fixed before close; the operator's read of the review file becomes the place they are weighed.

Crucible. Steelman: Q3 exists for money, auth and personal data; several late-round findings were real leak paths (release-health sessions, server_name, locals in thread frames, the superseded-subscription guard); a cap trades security for tokens. Attack: those findings were graded Should-fix by the reviewer who found them, and the rule already routes orange to follow-ups; what the cap removes is the re-review, not the fix, and in the window 0 of 11 post-PASS runs found a Blocking. Second-order risk: builders stop updating the as-built to avoid staleness; retired by hashing the contract alone. Pre-mortem: in eighteen months Q3 is a rubber stamp because one run of a variance-prone reviewer is treated as final; retired by C3 (the reviewer told it is the only pass) and C4 (the cost per run on record, so a second reviewer is chosen over a second round when it is cheaper). Falsifier: a round-three-or-later run that returns a Blocking an earlier PASS missed. Verdict: survives with changes: the cap is per reviewer, a FAIL resets it, and the operator can raise it per ticket.

**C2. A fresh thread at 200k, and heavy sub-work in its own thread.** Rule in prose (`tk-batch`, `stages/build.md`, `branches.md`) and a change in a hook (`stop-gate.ts`). One thread per ticket or batch; any thread over 200k is closed, not resumed, after a break; a sub-task expected to pass about 50 calls (a dry run, a cold rehearsal, a long review) is its own thread from a builder prompt. The Stop hook prints the last call's context size and, above 200k, one sentence recommending a fresh thread; it already reads the transcript, so this is about twenty lines. Saving per Q3 ticket: 2 to 4M equiv when the ticket would otherwise close in a thread past 300k; across the window 12.9M. Loses: the thread's memory of why; the ticket folder carries the what, and `tk-batch` already starts from it.

Crucible. Steelman: long threads hold judgment a fresh thread rebuilds, and fragmenting work into threads taxes the one operator's attention. Attack: a rebuild costs the 29.5k floor plus re-reading, about 0.1M equiv, against 81k equiv per call at 640k; and the biggest offender was the operator's own conversation thread, which no `tk-batch` rule reaches, so prose alone fails and the hook line is the part that matters. Success attack: if every ticket gets a thread, the operator reads more closing reports; the six-line report is the mitigation and already exists. Falsifier: fresh threads re-doing proofs or re-reading more than the excess they save; C4's per-thread line will show it within a week. Verdict: survives with the hook line; the prose rule alone does not.

**C3. The reviewer prompt is scoped and single-pass.** Change to a prompt (the prompt text in `review-run.ts`). It says: this is the only review unless you FAIL it, so list every finding now; judge the planned-path diff against the criteria and non-negotiables; follow imports one hop from the diff to confirm a Blocking, no further; Should-fix and Consider findings become follow-ups and do not reopen the review. Saving per headless run: 0.1 to 0.2M equiv and 1 to 3 minutes [estimate, low confidence]; the real saving is the rounds it prevents together with C1. Loses: the reviewer's freedom to chase a smell across the repo.

Crucible. Steelman: a security reviewer who reads only the diff misses the call site that makes the diff dangerous; the same day's changelog entry on reviewer rows reaching `rls.ts` and `policies.ts` shows the house values ranging. Attack: "diff plus one hop along imports" is not "diff only", and the 8 to 14 files the final reviews cite are mostly inside that radius already. Falsifier: a scoped review missing a Blocking a ranging one finds; cheap to test by running both prompts once on STK-21 and diffing findings, about 1M equiv. Verdict: survives with the one-hop wording and that one calibration run before the prompt ships.

**C4. Record the cost.** Change in a check (`review-run.ts`, about 15 lines) and one prose line (`tk-batch` report shape). `review:run` writes the reviewer's tokens by kind and its seconds into the review file header and the run record; the closing report ends with one line: calls, context at close, cache-read and output tokens for this thread. Saving: none directly; it is the instrument C1 to C3 are judged by. Loses: one more line in a six-line report. Crucible: friction only; keep it to one line and do not add a dashboard.

**C5. `yarn verify` is not a criterion, enforced.** Change in a check only (`contract.ts` init and `check-specs`); the prose already exists in `.claude/rules/specs.md` and the contract template and was broken twice in two days. Criteria name the specific check; the batch close runs the chain once. Saving per Q3 ticket: 4 to 7 minutes per `contract:run` that carried it, about an hour a day in the window. Loses: nothing proven; the close still runs the chain. Crucible: no attack worth the ink; the only risk is a ticket whose criterion genuinely is "the whole chain passes", and the close covers it.

**Judged and not recommended.**

- Writing `contract:run` and verify output to a file with only a tail printed: already the behaviour (G2); no token saving left to take.
- Smaller batch sizes: no evidence. The batch thread closed STK-24, STK-25, STK-26 and WEB-9 in 6 to 17 minutes each; its cost was the review loop and the context, not the ticket count.
- Removing or thinning the hooks for tokens: they cost under 0.1 percent (G1). Y2's status skip is seconds only and rides along with C2's hook change.
- Cutting the builder interview: 1 percent (G3).

## What was not examined

- The headless reviewers themselves: `--no-session-persistence` leaves no transcript, so their token cost is an estimate from in-thread reviewer subagents and run times, never a measurement.
- Sessions before 2026-10-05 00:00 PDT, including STK-18's first two Warden rounds and STK-17's first three on 2026-10-04.
- The usage meter's formula; the weights here are list-price ratios and the points-per-token mapping is an estimate.
- The quality of each review finding; they were counted by grade, not judged.
- Cursor and Codex sessions (none found), CI minutes, cold `yarn verify` times, and anything under `docs/research/`.
- Subagent transcripts of sessions that started before the window and ran into it: none were found, but the search was by folder, not by content.

## Builder dumps

One per recommended change, ready to paste into the prompt builder.

**Dump 1, for C1.** One-off track, Q2 (one fresh-context reviewer, Vigil, findings in the thread). "At Q3 a review PASS is final for its round. Change `tooling/check-specs.ts`, `tooling/status.ts` and `tooling/lib/specs.ts` so a recorded `review:<role>` PASS is not reset by a later change to the as-built or to planned-path files; it is reset only by a change to the contract's criteria. Change `tooling/review-run.ts` so a second run of the same reviewer on one ticket is allowed only when the recorded verdict is FAIL, and a third run at all needs `--operator` with a reason that is written into the review file. Amend `docs/workflows/qa-levels.md`, `docs/workflows/stages/build.md` and `.claude/skills/tk-batch/SKILL.md`: after a PASS, black and red findings cannot exist by definition; orange findings are fixed when cheap and re-proven with `yarn contract:run`, never re-reviewed; yellow and grey become drafted follow-ups; a FAIL earns one re-review; the operator raises the cap per ticket with a `focus` line. Add fixtures to the contract-loop tests for: PASS then as-built edit stays PASS; FAIL then fix allows one run; third run refused without `--operator`. Evidence this responds to: `specs/_shared/reports/2026-10-06-token-and-speed-audit.md`, finding R1 (17 headless runs on STK-18 and STK-21, 16 PASS, about 16M weighted tokens). Changelog entry; ledger line, since other threads will cite it."

**Dump 2, for C2 and Y2.** One-off track, Q1. "Make large contexts visible and discourage resuming them. In `tooling/hooks/stop-gate.ts`, read the last assistant record's usage from the transcript the hook already opens, and append to the `systemMessage` one clause: `context about N k tokens`; above 200k add `start a fresh thread for the next ticket; resuming this one after a break re-writes the whole context`. Keep the whole message under the existing limit. While there: skip the `yarn status --brief` call when the tree fingerprint is unchanged, reusing the last printed status (Y2, 5.5 s per stop). Add fixtures in `tooling/hooks/fixtures/stop-gate.json` for a transcript at 150k and one at 450k. Amend `.claude/skills/tk-batch/SKILL.md`, `docs/workflows/stages/build.md` and `docs/workflows/branches.md` with the thread rule: one thread per ticket or batch; a thread over 200k is closed, not resumed, after a break; a sub-task expected to pass about 50 calls (a dry run, a cold rehearsal) is its own thread from a builder prompt, at the model and QA level the operator picks, never a subagent of a Q3 build. Evidence: the audit's O1, O2 and Y2 (745 calls over 200k carried 57 percent of cache reads; 15 full re-writes after idle gaps, 4.9M weighted; the STK-20 dry run as subagents, 8.4M). Changelog entry."

**Dump 3, for C3.** One-off track, Q1, with one calibration run before the change is kept. "Scope the headless reviewer. In `tooling/review-run.ts` `reviewTicket`, rewrite the generated prompt: this is the only review pass unless it FAILs, so list every finding now, graded Blocking, Should-fix or Consider with file and line; judge the planned-path changes against the criteria and non-negotiables; follow imports one hop from a changed file only to confirm a Blocking; Should-fix and Consider findings become follow-ups and do not reopen the review; the as-built is a claim to check inside the changed files, not an invitation to read the repo. Keep the VERDICT contract. Before keeping the change, run the old and the new prompt once each on STK-21 (`yarn review:run warden STK-21` in a detached worktree at `6960357`) and record both review files and their token usage beside this ticket's as-built; keep the new prompt only if it finds every Blocking the old one finds. Evidence: the audit's Y1 and R1. Changelog entry."

**Dump 4, for C4.** One-off track, Q1. "Record the cost of a review and of a thread. In `tooling/review-run.ts`, keep the `usage` and `modelUsage` fields of the headless JSON result and write `tokens_input`, `tokens_cache_read`, `tokens_cache_write`, `tokens_output` and `seconds` into the review file header and into the `review:<role>` run record in `results.json`; `tooling/lib/specs.ts` and the contract-loop fixtures learn the new fields; `yarn status <id>` prints them. In `.claude/skills/tk-batch/SKILL.md`, the closing report gains one last line, `Cost: <calls> calls, <context at close> context, <cache-read> read, <output> out`, read from the harness's session usage tool when present, otherwise left out. Evidence: the audit's O4 (no cost is recorded anywhere; the audit's first count was 2.4 times too high). Changelog entry."

**Dump 5, for C5.** One-off track, Q1. "`yarn verify` is not a criterion command. In `tooling/contract.ts`, `contract:init` refuses a criterion whose command is `yarn verify` with the message that the batch close proves the chain once and the criterion should name the specific check; `tooling/check-specs.ts` warns on existing contracts that carry it (STK-18 C4, STK-21 C3, STK-26 C2, WEB-8 C3 stay as history; frozen criteria are not rewritten). The rule already stands in `.claude/rules/specs.md` and `docs/engineering/templates/contract.template.md`; change no prose, add the check that makes it law, and a fixture in the contract-init tests. Evidence: the audit's O3 (92 runs of the 101-second chain in one day, 2.1 hours of waiting). Changelog entry."

## Part 2: the LAB build day (2026-10-06 07:40 to 17:56 PDT)

The operator's question: since the LAB code landed, work feels two to three times slower and more token-hungry, the reviews feel heavy, and extra reviewers seem to be getting added. Measured the same way as Part 1 over the 10.3 hours since Part 1's window closed: 18 session files and 12 subagent transcripts, 1,244 API calls counted once per message id, the LAB contracts, review files and their git history, and the plan meter read from the app at 17:56 PDT (weekly 79 percent, Fable 39 percent).

### Verdict for Part 2

Per clock hour, yes: the weekly meter rose 25 points in 10 hours today against 28 in the previous 24, and 56 percent of today's tokens fell in the two hours when three build threads ran at once, each past 375k tokens of context. Per unit of agent work, no: tokens per active thread-hour rose 15 percent and tokens per criterion proven fell. Per ticket, about 2.5 times: LAB tickets carry 5 to 13 criteria against 2 to 6 for the STK tickets of Part 1, and every Q3 LAB ticket got two reviewers and two or three rounds, 26 headless reviews in all, every one PASS. No reviewer was added by the tooling; the Tickets gate named them by hand, beyond the toolkit map on 10 of 28 contracts, and the operator confirmed the table in three question rounds.

### Counts by flag, Part 2

| Flag   | Count |
| ------ | ----: |
| Black  |     0 |
| Red    |     1 |
| Orange |     3 |
| Yellow |     2 |
| Grey   |     2 |

### The two windows side by side

| Measure                                     | Part 1 (10-05 00:00 to 10-06 07:40 PDT) |                                  Part 2 (10-06 07:40 to 17:56 PDT) |
| ------------------------------------------- | --------------------------------------: | -----------------------------------------------------------------: |
| API calls (one per message id)              |                                   2,088 |                                                              1,244 |
| Cache-read tokens                           |                                  394.6M |                                                             326.8M |
| Cache-write tokens                          |                                   10.7M |                                                               6.0M |
| Output tokens                               |                                   1.86M |                                                              0.87M |
| Weighted, measured                          |                             62.5M equiv |                                                        45.3M equiv |
| Headless reviewers, outside transcripts     |               ~9.5M (21 runs, estimate) | ~13M (27 to 29 runs plus one pre-flight of 26 contracts, estimate) |
| Active thread-hours                         |                                  15.1 h |                                                              9.5 h |
| Weighted per active hour                    |                                    4.1M |                                                               4.7M |
| Meter points consumed                       |                                      28 |                                                                 25 |
| Weighted per meter point, headless included |                             ~2.6M equiv |                                                        ~2.3M equiv |
| Calls over 200k context                     |                               745 (36%) |                                                          712 (57%) |
| Cache reads carried by calls over 200k      |                                     57% |                                                                81% |
| Context above 200k, summed                  |                      8.0M equiv (12.8%) |                                                  12.6M equiv (28%) |
| Tickets closed                              |                         8 (STK and WEB) |                                              9 of 10 (LAB-1 to 10) |
| Criteria proven                             |                                     ~26 |                                                                ~75 |

The meter and the weighted count agree to within 15 percent across the two windows at about 2.5M weighted tokens per point. That is the first independent check on the weights, and it holds.

### Burn by hour

| Hour (PDT) | Calls | Weighted | Threads active | What ran                                                    |
| ---------- | ----: | -------: | -------------: | ----------------------------------------------------------- |
| 07         |   103 |     4.3M |              6 | this audit, STK-20 dry runs 2 and 3, the LAB Tickets gate   |
| 08         |    85 |     2.4M |              3 |                                                             |
| 09         |    34 |     1.0M |              1 |                                                             |
| 10         |    46 |     2.4M |              4 | LAB Tickets gate, pre-flight                                |
| 11         |   207 |     5.1M |              4 | LAB-1 to 4 start                                            |
| 12         |    85 |     2.8M |              3 | LAB-1 to 3 review rounds                                    |
| 13         |   403 |    11.8M |             10 | LAB-5 to 10 in three threads, MIG frame, builder interviews |
| 14         |   255 |    13.6M |              5 | LAB-7 to 10 review rounds and captures                      |
| 17 to 18   |    40 |     1.9M |              3 | a builder interview, this audit                             |

The 13:00 and 14:00 hours are 25.4M, 56 percent of the window, at 5 to 6 meter points an hour. Part 1's whole day averaged 1.2 points an hour. That is the two to three times the operator felt, and it is parallelism times context size, not a slower machine.

### Where the tokens went

| Activity                                                              | M equiv | Share | Note                                                                                         |
| --------------------------------------------------------------------- | ------: | ----: | -------------------------------------------------------------------------------------------- |
| LAB-8, 9, 10 build thread (`83617170`) and its two reviewer subagents |    15.1 |   33% | 299 calls, context 219k at the first review and 650k at the end; 24 capture images read back |
| LAB-5, 6, 7 build thread (`b5c6706f`)                                 |     8.1 |   18% | 209 calls, 479k at the end                                                                   |
| LAB-1, 2, 3 build thread (`89734604`)                                 |     5.0 |   11% | 163 calls, 375k at the end                                                                   |
| LAB-4 thread and its in-thread reviewer                               |     1.6 |    4% | 66 calls, 179k; closed in 8 minutes                                                          |
| STK-20 cold dry runs 2 and 3, as subagents of the Part 1 build thread |     7.1 |   16% | the parent resumed at 556k; the cold agent ran 149 calls                                     |
| LAB shaping and Tickets gate (`c05d770f`)                             |     2.7 |    6% | 55 calls at 400k, 19 human turns                                                             |
| MIG epic frame and its five subagents                                 |     2.1 |    5% |                                                                                              |
| This audit                                                            |     1.3 |    3% |                                                                                              |
| Three builder interviews                                              |     1.1 |    2% |                                                                                              |
| Other small threads                                                   |     0.7 |    2% |                                                                                              |
| Headless reviewers, outside the transcripts                           |     ~13 |   n/a | estimate, see below                                                                          |

### Findings, Part 2

**R2 (Red). The review loop from R1 ran on every Q3 LAB ticket, and the first thread made three rounds its standard.** Where: the same mechanism as R1; the review files' git history shows every round. Rounds, headless runs and verdicts, with Should-fix counts per round:

| Ticket      | Reviewers     |                                                                            Rounds |                       Headless runs | Verdicts  | Should-fix per round (mason / warden) |
| ----------- | ------------- | --------------------------------------------------------------------------------: | ----------------------------------: | --------- | ------------------------------------- |
| LAB-1       | mason, warden |                                                                                 3 |                                   6 | all PASS  | 1, 2, 2 / 1, 1, 0                     |
| LAB-2       | mason, warden |                                                                                 3 |                                   6 | all PASS  | 2, 2, 1 / 1, 2, 0                     |
| LAB-3       | mason, warden |                                                                                 3 |                                   6 | all PASS  | 1, 1, 2 / 2, 1, 1                     |
| LAB-5       | mason, warden |                                                                                 2 |                                   4 | all PASS  | 1, 0 / 2, 0                           |
| LAB-6       | warden        |                                                                                 2 |                                   2 | all PASS  | 2, 0                                  |
| LAB-7       | assay, warden |               1 recorded, 1 to 2 more attempted (one ran 601 s in the foreground) |                          2 recorded | PASS      | assay 0 / warden 1                    |
| LAB-9       | mason, warden | 0 recorded; two attempts stopped early (criteria unproven, then the thread ended) |                                   0 | none      | ticket left "closing"                 |
| LAB-4 (Q2)  | mason         |                                                                                 1 |                  in-thread subagent | PASS      |                                       |
| LAB-8 (Q2)  | assay, warden |                                                                                 2 | two in-thread subagents, two rounds | both PASS |                                       |
| LAB-10 (Q2) | assay         |                                                                                 1 |                  in-thread subagent | PASS      |                                       |

26 recorded headless runs, 0 FAIL, 0 Blocking. The Should-fix counts do not fall with rounds (LAB-1 mason 1, 2, 2; LAB-3 mason 1, 1, 2): a fresh reviewer finds different orange items each time, as in Part 1. In the LAB-1 to 3 thread the rounds are named first, second and final in the commit messages: the loop has become a protocol. Builder-side cost of the loops, from the segments between review invocations: the LAB-1 to 3 thread spent 36 minutes and 1.0M before its first review and 70 minutes and 4.0M in rounds (80 percent of the thread); the LAB-8 to 10 thread spent 17 minutes and 2.6M building LAB-8 and then 37 minutes and 6.5M on LAB-8's Q2 review-and-fix cycle alone, at 433k of context. One round of two reviewers in the 650k thread cost 2.1M builder-side plus about 0.9M headless, about 1.2 meter points. Smallest fix: C1 from Part 1, now worth more: at two reviewers and two to three rounds per Q3 ticket, holding LAB-1 to 7 to one PASS each would have saved 19 headless runs (about 8.6M) and roughly 10M builder-side, about 7 of today's 25 points [estimate]. Measured from review-file history and transcript segments; confidence high.

**O5 (Orange). Three tickets per thread, with captures, grows a thread to 650k before the third ticket starts.** Where: the three build threads ended at 375k, 479k and 650k; 712 of the window's 1,244 calls ran above 200k and carried 81 percent of its cache reads; the excess above 200k is 12.6M equiv, 28 percent of the window (Part 1: 13 percent). Each later ticket in a batch pays for the earlier ones' transcript on every call: LAB-9 and LAB-10 cost 7.3M and 3.6M by ticket id against 1.4M for LAB-1, and LAB-9 is still open. The parent of the STK-20 dry runs resumed at 556k. Smallest fix: C2 from Part 1, sharpened: one ticket per thread for UI tickets with captures, and a thread is closed after a ticket's review PASS rather than carried into the next ticket. Measured from per-call usage; confidence high.

**O6 (Orange). Q2 tickets carry two reviewers, against the level's definition.** Where: `docs/workflows/qa-levels.md` defines Q2 as one reviewer in fresh context; six LAB contracts at Q2 name two (LAB-8, 11, 12, 14, 17, 23), and LAB-8 ran both, twice, inside a 433k thread. Against the toolkit map, 10 of 28 LAB contracts name a reviewer the map does not suggest for their planned paths (LAB-3, 5, 6, 9 add a second; LAB-15, 16 and 25 name two or three where the map suggests none; LAB-4, 17, 24 add Mason; LAB-20 Warden), and the map's Threshold suggestion on eight UI tickets is never taken. `technical.md` line 46 says the Tickets stage names these reviewers by hand because no map row covers `apps/web/lib/sandbox/`; the Tickets thread put the table to the operator in three question rounds, so the choice is the operator's, informed by the gate's recommendation. `contract:init` adds nothing beyond the contract's list (Vigil only when a Q3 contract names nobody; never triggered here). Smallest fix: `contract:init` and `contract:qa` refuse a second reviewer at Q2 unless a `focus` line names what the second one looks at, and the gate's table shows the map's suggestion beside its own so the operator sees each hand-added seat. Measured from the contracts and the toolkit map; confidence high on the counts, medium on how the table was presented.

**O7 (Orange). The staleness nag reaches every thread, and it names closed tickets.** Where: `yarn status --brief`, printed by the SessionStart and Stop hooks into every session (13 starts and 42 stops in this window), currently opens with LAB-5, a closed ticket, listing C1 to C4 as "evidence changed after it was recorded"; `yarn check-specs --strict` lists LAB-8's C1 to C6 and C9 the same way, LAB-9 C7 stale, and LAB-7's contract over the 2,500-token cap. The evidence logs are git-ignored and were rewritten by a later run; no code changed. PR-19 ruled that below a merge nothing goes stale and that only `check-specs --strict` looks; the brief line looks anyway, and it is what invites a thread to re-prove another thread's closed work (Part 1's R1 mechanism, and `tooling.md`'s own warning about check-specs). Smallest fix: the brief line lists only tickets in build and never evidence-log staleness; strict staleness is read once, before a merge, by the operator. Measured by running both commands now; confidence high.

**Y4 (Yellow). The STK-20 dry run ran twice more as subagents of a 556k thread.** 7.1M, 16 percent of the window; runs 2 and 3 found 11 and 8 stops. The same shape as Part 1's O2; the fix is the same (its own thread, a smaller model where the operator agrees).

**Y5 (Yellow). The Vigil pre-flight of 26 contracts.** One run of about 8 minutes at 10:22 PDT after two attempts that stopped at once; it reads the brief, 22 UX proposals, the technical notes and 26 contracts. Estimated 1 to 1.5M equiv. It is one run per epic and found real problems, so it earns its cost; noted because two failed attempts preceded it and nothing recorded why.

**G4 (Grey). Capture images.** 34 screenshots were read back into the build threads (24 in the LAB-8 to 10 thread), about 1,500 tokens each, 51k tokens in all. Small on their own; each then rides in a 400k to 650k context. The 49 capture commands took 35 minutes of wall.

**G5 (Grey). LAB contracts already obey the verify rule.** No LAB criterion names `yarn verify`; 113 name `yarn workspace web test`. `contract:run` therefore took a median 35 s in this window against 124 s in Part 1. The 18 direct `yarn verify` runs (33 minutes, median 101 s, one at 717 s) were batch closes and the stop gate.

### The operator's three perceptions, tested

| Perception                                      | Verdict                                                                   | Number                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two to three times slower and more token-hungry | True per clock hour at peak; false per unit of work; 2.5 times per ticket | 5 to 6 points an hour at 13:00 to 15:00 against 1.2 average yesterday; 4.7M against 4.1M per active hour; median LAB ticket 2.5M against 1.0M for STK, with 2 to 3 times the criteria |
| The review process is heavy                     | True                                                                      | 26 headless runs plus ~13M estimated, plus ~16M builder-side in the loops: about half of today's spend went to reviews that all returned PASS                                         |
| Extra reviewers are being added                 | True by hand at the Tickets gate, not by tooling                          | 10 of 28 contracts name a reviewer beyond the map; 6 Q2 tickets name two reviewers against the level's definition; the operator confirmed the table                                   |

### What Part 2 changes in the cuts

- **C1 stands and is now the largest saving.** Today's 26 PASS runs would have been 7 under it. Add to Dump 1: the first review of LAB-1 to LAB-7 as the test corpus, and the rule that a Should-fix count that does not fall across rounds is the signal to stop, not to continue.
- **C2 stands, sharpened:** one ticket per thread when the ticket has captures; a batch thread closes after each PASS. Add to Dump 2: the three LAB threads' end contexts as the evidence.
- **C6, new: Q2 is one reviewer, enforced.** Change in a check (`contract.ts` init and qa) and one line in the Tickets stage. Saving per Q2 ticket: one reviewer run, 0.2 to 0.5M in-thread, plus its fix cycle. Loses: a second lens on a Q2 ticket, which is what a `focus` line or Q3 is for. Crucible: steelman, a UI ticket on an auth gate wants both Assay and Warden; attack, that ticket is Q3 or carries a focus line, and LAB-8's second reviewer found no Blocking in two rounds; falsifier, a Q2 ticket whose second reviewer finds a Blocking the first missed. Survives.
- **C7, new: the brief line stops nagging about closed tickets and evidence logs.** Change in a check (`status.ts` brief, and `check-specs` warnings outside `--strict`). Saving: none directly in tokens; it removes the prompt that starts R1's loop in other threads. Crucible: steelman, a stale proof on a closed ticket is a real merge risk; attack, the merge is where `--strict` runs and the operator reads it, and today's stale lines came from rewritten logs, not from code; falsifier, a merged ticket whose stale proof hid a regression, none in two days. Survives.

### Not examined in Part 2

- The headless reviewers' own transcripts, as before.
- Whether the operator's confirmation of the LAB reviewer table was given row by row or as a whole; only that three question rounds mentioned reviewers or QA.
- What rewrote LAB-5's and LAB-8's evidence logs after their records; the logs are git-ignored and carry no author.
- Anything after 17:56 PDT on 2026-10-06.

### Builder dumps added

**Dump 6, for C6.** One-off track, Q1. "Q2 means one reviewer. In `tooling/contract.ts`, `contract:init` and `contract:qa` refuse a contract at Q2 with more than one reviewer unless a `focus` line names what the second reviewer examines, with a message that points at `docs/workflows/qa-levels.md`; `check-specs` warns on the six LAB drafts that carry two (LAB-11, 12, 14, 17, 23 and the closed LAB-8 stays as history). In `docs/workflows/stages/tickets.md` (or wherever the Tickets gate's QA table is specified), the table shows the toolkit map's suggestion beside the proposed reviewers so the operator sees every seat added by hand. Fixture in the contract-init tests. Evidence: the audit's O6. Changelog entry."

**Dump 7, for C7.** One-off track, Q1. "The brief status line orients a thread on its own work and never re-opens another's. In `tooling/status.ts`, `--brief` lists tickets in build (open, closing) and omits closed and migration-pending tickets; it never reports evidence-log staleness, and it reports code staleness only for Q3 tickets with `--strict`. `tooling/check-specs.ts` without `--strict` stops warning about evidence logs that changed after their record (they are git-ignored and rewritten by every run). Fixtures in `tooling/fixtures/specs/`. Amend `docs/engineering/tooling.md`'s status and check-specs entries. Evidence: the audit's O7 (the line currently opens with a closed ticket's rewritten logs and is printed into every session start and stop). Changelog entry."
