---
title: "When does Sonnet 5.5 execute a well-specified ticket as well as Opus 5.5, when does it not, and when does Fable 5.1 earn its price?"
description: "Per-kind minimum and recommended Claude model for Claude Code threads in this repo, with failure modes of choosing down, price verification, context and effort effects, and a two-ticket calibration protocol."
layer: research
status: archived
thread: model-selection
role: Alembic
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when: never
---
# For Claude Code work in a repo like this, when does Sonnet 5.5 execute a well-specified ticket as well as Opus 5.5, when does it not, and when does Fable 5.1 earn its price?

## Answer

Sonnet 5.5 matches Opus 5.5 on well-scoped, settled-design execution at roughly half the cost, but that evidence comes from Anthropic's own benchmarks and small practitioner runs, none at this repo's 200k to 500k context, and none in this repo; it falls behind Opus 5.5 wherever the work needs judgment (shaping, fresh-context review, research and audits), and Fable 5.1 earns its price only where Anthropic itself places it: when Opus 5.5 at xhigh or max effort still falls short on long-horizon or ambiguous work, which no source shows for this repo's ticket sizes (judgment, built on the verified sources in the Evidence table).\[1\] Anthropic positions Sonnet 5.5 as strongest at "well-scoped everyday tasks" and states Opus 5.5 "remains clearly stronger at complex, open-ended work requiring sustained judgment" (verified, anthropic.com/claude-sonnet-5-5, 2026-09-28).\[2\]\[3\] An independent code-review evaluation found Sonnet 5.5 caught 6 of 13 hard known bugs at 41.2% actionable precision against Opus 5.5's 8 of 13 at 66.7% (CodeRabbit, 2026-09-28).\[4\] The defensible position today: keep Opus 5.5 as the recommended build model until the calibration protocol below runs, set Sonnet 5.5 at medium effort as the provisional build minimum, keep Opus 5.5 as the floor for review, shaping and research, and treat Fable 5.1 as an escalation rather than a default [PROPOSED]. All user-supplied list prices check out against Anthropic's pricing page except three points: Haiku 5.5's price holds only for prompts up to 100k tokens, Fable 5.1 cache reads are one fortieth of input rather than one twentieth, and Sonnet 5.5 cache reads were halved to $0.10 on 2026-10-07.\[5\]\[6\]\[7\]\[8\]

| Kind of work | Minimum model | Recommended model | Failure mode of choosing down | Evidence label |
| --- | --- | --- | --- | --- |
| Executing a detailed ticket (code, with tests) | Sonnet 5.5 at medium effort [PROPOSED, provisional until calibration] | Opus 5.5 at medium (default) now; switch to Sonnet 5.5 at medium if calibration passes [NEEDS DECISION] | Choosing Sonnet 5.5: at low effort it may report a change done without running checks;\[9\] at max effort it made out-of-scope edits (FrontierCode); behaviour at 200k to 500k context is unmeasured. Choosing below Sonnet (Haiku 5.5): price rises fivefold above 100k prompt tokens, and no source tests Haiku as a main build model\[4\]\[10\]\[11\] | verified (Anthropic docs) + secondary (practitioner runs) + judgment (threshold) |
| UI work judged against a design canon | Sonnet 5.5 at medium [PROPOSED] | Opus 5.5 at medium or high | Choosing Sonnet 5.5: human-judged web development preference trails Opus 5.5 (Code Arena WebDev); no source measures fidelity to a supplied design canon, so canon drift is the unmeasured risk\[12\] | verified (Anthropic claims) + secondary (arena ranks) + judgment |
| Shaping (framing, UX spec, technical notes, cutting tickets) | Opus 5.5 at high | Opus 5.5 at high or xhigh; escalate to Fable 5.1 when Opus at xhigh falls short on an ambiguous or multi-sitting problem | Choosing Sonnet 5.5: weaker "sustained judgment" per Anthropic;\[3\] a wrong framing passes every downstream check because tickets then encode it | verified (Anthropic positioning) + judgment |
| Fresh-context review | Opus 5.5 at medium | Opus 5.5 at high (CodeRabbit's Opus 5.5 review on its 13-case Signal set: Standard caught 8/13 at 66.7% precision, Max 10/13 at 52.0%; counting comments outside the changed lines, both caught 10 of 13) | Choosing Sonnet 5.5: fewer known bugs caught and lower precision (6/13 at 41.2% vs 8/13 at 66.7%); missed findings are invisible to the harness\[4\] | secondary (independent evaluation, dated) + judgment |
| Research and audits | Opus 5.5 at medium | Opus 5.5 at high or xhigh; Fable 5.1 only for multi-session deep research after an Opus attempt falls short | Choosing Sonnet 5.5: Sonnet 5.5 system card reports it more prone to hallucination than Opus 5.5 (secondary report of card);\[13\] choosing Fable 5.1 up: in Anthropic's own sourced-report test Fable 5.1 never cleared the no-invented-figures bar\[14\] | verified (Anthropic test) + secondary + judgment |

## Evidence

Source hierarchy (stated): Tier 1, Anthropic primary documents (anthropic.com announcements, platform.claude.com docs and release notes, code.claude.com docs, claude.com blog by the Claude Code team, system cards). Tier 2, independent evaluators publishing their own dated measurements (METR, CodeRabbit, wmedia.es runs, Arena changelog, Toloka Arena, BenchLM's Design Arena snapshot). Tier 3, aggregators, press, forums and vendor blogs restating others (labelled secondary). Tier 2 is labelled secondary in the table because it is not Anthropic primary; it outranks Tier 3. Distinct sources cited: 15 Anthropic primary documents and 19 secondary sources. Retrieval note: pages were retrieved on 2026-10-08 by the research run's clock; the note carries the operator's date of 2026-10-07, and the Anthropic release notes already show an 2026-10-08 entry.

### Anthropic documentation

| Claim | Source (dated) | Label | Note |
| --- | --- | --- | --- |
| Fable 5.1 lists at $10 in / $50 out; 5m cache write $12.50; cache hits $0.25\[8\]\[15\] | Anthropic pricing page, retrieved 2026-10-08 | verified | Matches repo price. Cache hit is 0.025x input (one fortieth), not one twentieth\[6\] |
| Opus 5.5 lists at $4 / $20; 5m cache write $5; cache hits $0.20\[14\] | Anthropic pricing page, retrieved 2026-10-08 | verified | Matches repo price. Cache hit is 0.05x (one twentieth)\[6\] |
| Sonnet 5.5 lists at $2 / $10; 5m cache write $2.50; cache hits $0.10\[3\]\[7\] | Anthropic pricing page, retrieved 2026-10-08; release notes 2026-10-07 | verified | Cache read cut from $0.20 to $0.10 on 2026-10-07.\[5\]\[6\] Launch page, AWS blog and CodeRabbit still show $0.20 (stale after 2026-10-07) |
| Haiku 5.5 lists at $0.10 / $0.50 for prompts up to 100k tokens; $0.50 / $2.50 above 100k; cache hits $0.01 / $0.05 | Anthropic pricing page, retrieved 2026-10-08; launched 2026-10-07 per release notes | verified\[5\]\[6\] | Disagreement with repo: the repo's $0.10 / $0.50 omits the 100k tier. Build threads at 200k to 500k would pay the upper tier |
| Cache read multiplier is 0.1x on most models, 0.05x on Opus 5.5 and Sonnet 5.5, 0.025x on Fable 5.1 and Mythos 5.1\[5\]\[16\] | Anthropic pricing page, retrieved 2026-10-08 | verified\[6\] | Repo's "about one twentieth" is correct for Opus 5.5 and Sonnet 5.5 only |
| Opus 5.5 and Sonnet 5.5: 1M context window, 128K max output; Sonnet 5.5 default effort high on the Platform; Opus 5.5 default medium, adaptive thinking always on\[17\]\[18\] | platform.claude.com model overview pages for each, retrieved 2026-10-08 | verified | Fable 5.1 and Mythos 5.1 also 1M context, 128k max output (release notes, 2026-09-01)\[5\]\[19\]\[20\]\[21\] |
| Sonnet 5.5 is "strongest at well-scoped everyday tasks, fixing bugs" and has "a sharp eye for design"; Opus 5.5 remains clearly stronger at complex, open-ended work requiring sustained judgment\[3\] | anthropic.com/claude-sonnet-5-5, 2026-09-28 | verified\[2\]\[4\] | Quote used for this source: "Opus 5.5 remains clearly stronger at complex, open-ended work requiring sustained judgment." |
| Sonnet 5.5 vs Opus 5.5 at launch: Terminal-Bench 4.0 70.6% vs 66.4%; FrontierCode 1.1 46.2% (Max) and 52.1% (Xhigh) vs 54.4%; CursorBench 4.0 55.5% vs 57.8%\[3\] | anthropic.com/claude-sonnet-5-5, 2026-09-28 | verified | Vendor-run. Opus 5.5 Terminal-Bench at xhigh. Sonnet scores lower at Max than Xhigh on FrontierCode\[4\] |
| Sonnet 5.5 "complements Opus 5.5 best when running at lower effort settings"; at higher settings it can perform comparably at similar cost\[3\] | anthropic.com/claude-sonnet-5-5, 2026-09-28 | verified | Sonnet's cost advantage depends on low or medium effort |
| Early tester (Creator): confident letting Sonnet 5.5 implement when Opus 5.5 sets architecture\[3\] | anthropic.com/claude-sonnet-5-5, 2026-09-28 | verified (Anthropic-published testimonial) | Customer quote chosen by vendor; supports the shaping-then-execute split |
| Opus 5.5 vs Fable 5.1 at launch: Terminal-Bench 4.0 66.4% vs 55.8%; FrontierCode 54.4% vs 50.3%; CursorBench 57.8% vs 51.8%\[14\] | anthropic.com/claude-opus-5-5, 2026-09-22 | verified | Opus results at max effort unless noted. Anthropic says the real-world gap is "narrower than these scores suggest"\[14\]\[22\]\[23\] |
| In Anthropic's sourced-report test, 16 of 18 Opus 5.5 reports cleared the no-invented-figures bar; neither Fable 5.1 nor Opus 5 cleared it in any attempt\[14\] | anthropic.com/claude-opus-5-5, 2026-09-22 | verified | Single internal test; most relevant datapoint for research and audits |
| Opus 5.5 and Fable 5.1 rewrote HAProxy from C to Rust; both passed nearly all regression tests; Opus finished in 9.5 hours vs 12, at 51% less cost\[14\] | anthropic.com/claude-opus-5-5, 2026-09-22 | verified | Long-horizon coding where Fable did not earn its price |
| When Opus 5.5 safeguards intervened in benchmarks, biology and frontier LLM development tasks were completed by Opus 5\[14\] | anthropic.com/claude-opus-5-5, 2026-09-22 | verified | Relevant if repo work touches LLM R&D: fallback can change the model mid-thread\[14\] |
| Fable 5.1 and Mythos 5.1 are the same underlying model with different safeguards; Mythos 5.1 is restricted to trusted-access programs (cyber, life sciences)\[24\] | anthropic.com/claude-fable-and-mythos-5-1, 2026-09-01 (search result text) | verified | Confirms repo background fact. Export-control suspension dates [NOT IN SOURCE] |
| "Most workloads start with Claude Opus 5.5"; move to Fable 5.1 if evals at xhigh or max still fall short on demanding reasoning or long-horizon agentic work\[1\] | platform.claude.com choosing-a-model, retrieved 2026-10-08 | verified\[1\] | The matrix lists Sonnet 5.5 for "everyday coding" and Fable 5.1 for "multistep deep research"\[1\] |
| Tuning effort "is often a better lever than switching models"\[1\] | platform.claude.com choosing-a-model, retrieved 2026-10-08 | verified\[1\] | Same page as above; quote counted once for this source above, this row paraphrased |
| Fable models are "suited to tasks larger than a single sitting"; hand them ambiguous problems such as root-cause investigation and architecture decisions | code.claude.com/docs/en/model-config, retrieved 2026-10-08 | verified | Claude Code's own Fable guidance\[25\] |
| On the Anthropic API the `sonnet` alias resolves to Sonnet 5.5, `opus` to Opus 5.5; on Bedrock and Google Cloud `sonnet` resolves to Sonnet 4.5 | code.claude.com/docs/en/model-config, retrieved 2026-10-08 | verified | Pin full model IDs in tickets; an alias can silently select an older model on some providers\[25\] |
| Sonnet 5.5 requires Claude Code v2.1.284+, Opus 5.5 v2.1.280+, Fable 5.1 v2.1.257+ | code.claude.com/docs/en/model-config, retrieved 2026-10-08 | verified | Version gate for calibration runs\[25\] |
| `opusplan` uses Opus in plan mode and Sonnet for execution\[26\]\[27\] | code.claude.com/docs/en/model-config, retrieved 2026-10-08 | verified | An existing built-in form of the shape-on-Opus, build-on-Sonnet split\[25\] |
| Fable requests flagged by safety classifiers (most often cyber and biology) trigger automatic model fallback | code.claude.com/docs/en/model-config, retrieved 2026-10-08 | verified | Record actual model used per thread in calibration\[25\] |
| Model choice sets capability; effort sets how much work is done (files read, verification, steps) | claude.com blog, Lydia Hallie, 2026-07-07 | verified | Diagnostic quote: "If Claude has all the pertinent context, clearly tried, and still got it wrong" means move up a model; skipped files or tests mean raise effort\[28\] |
| Sonnet 5.5 effort for agentic coding: start at medium for well-specified tasks, high for harder or longer ones; xhigh or max only where evals show gain; set max_tokens to 128,000\[9\] | platform.claude.com effort doc, retrieved 2026-10-08 | verified\[21\] | Same guidance repeated in What's new in Sonnet 5.5 (retrieved 2026-10-08)\[7\] |
| Opus 5.5 defaults to medium; Fable 5.1 defaults to high;\[1\]\[19\] effort applies to all output tokens including tool calls; lower effort means fewer, terser tool calls | platform.claude.com effort doc, retrieved 2026-10-08 | verified | Default effort differs across the three models; compare at pinned effort\[21\] |
| Sonnet 5.5 at low effort "sometimes reports a change as done without running a check"; a suggested system-prompt paragraph makes skipped checks rare\[9\] | Prompting Claude Sonnet 5.5, platform.claude.com, retrieved 2026-10-08 (page undated) | verified | Harness-addressable failure mode\[4\] |
| Sonnet 5.5 occasionally calls a declared tool by a case-variant name or passes a slightly renamed parameter\[9\] | Prompting Claude Sonnet 5.5, retrieved 2026-10-08 | verified | Tool-use reliability caveat; harness can normalise |
| Sonnet 5.5 does not support forced tool use (tool_choice any/tool returns 400)\[7\] | What's new in Claude Sonnet 5.5, retrieved 2026-10-08 | verified | Matters only for custom harness API calls\[5\] |
| Changing /model or /effort mid-session busts the prompt cache in Claude Code | claude.com "Maximizing the value of your Claude Code sessions", undated | verified (undated) | Pick model and effort at thread start\[29\] |
| Sonnet 5.5 and Opus 5.5 system cards list only ProgramBench under long context\[30\]\[31\] | Sonnet 5.5 system card, 2026-09-28 (table of contents); Opus 5.5 system card contents via search result | secondary (contents seen by research subagent, figures not read in the card) | No Anthropic MRCR or needle-style score found for any of the three models |

### Independent benchmarks

| Claim | Source (dated) | Label | Note |
| --- | --- | --- | --- |
| Code review, 13 hard known-bug cases: Sonnet 5.5 6/13, 41.2% actionable precision; Opus 5.5 Standard 8/13, 66.7%; Opus 5.5 Max 10/13 at 52.0% precision; against Sonnet 5 (4/13), Sonnet 5.5 took about half the wall-clock time and cost about 60% less per review at list prices | CodeRabbit (Hendrik Krack), 2026-09-28; Opus 5.5 figures from CodeRabbit's Opus 5.5 review (Gowtham Kishore Vijay) | secondary (independent, own measurement) | CodeRabbit flags 13 cases as small; the 13 are real OSS PRs (Elasticsearch, Puma, vLLM, Cilium, axios, Next.js). The half-time and 60% savings are relative to Sonnet 5, not Opus 5.5. Strongest datapoint for fresh-context review |
| METR: Opus 5.5 "likely provides slightly higher productivity uplift than Fable 5.1"; still has qualitative weaknesses on hard long-horizon tasks | METR predeployment summary, 2026-09-22 | secondary (independent evaluator) | No time-horizon number for 5.5 models found\[32\] |
| SWE-bench Pro: Opus 5.5 89.9%, Sonnet 5.5 81.3% (Anthropic system-card runs);\[33\]\[34\] Scale's standardized leaderboard had no Opus 5.5 entry | morphllm, checked 2026-09-28; CodingFleet, 2026-10-02 | secondary | Vendor-run figures, not comparable to Scale standardized scores\[35\]\[36\] |
| ProgramBench (long context, up to 1M tokens): Sonnet 5.5 79.7%, Opus 5.5 91.2%\[13\]\[37\] | apidog and kingy.ai citing Sonnet 5.5 system card (card dated 2026-09-28) | secondary | Not confirmed in the card itself; largest reported Sonnet-Opus gap among long-context rows |
| Toloka Arena multi-turn tool use, composite pass^5: Opus 5.5 77.3, Fable 5.1 74.0, Sonnet 5.5 68.7 | Toloka blog, as of 2026-09-29 | secondary | Only dated tool-use benchmark found that covers all three\[38\] |
| Code Arena WebDev, Arena snapshot of 2026-10-01: claude-opus-5.5-max first at 1815 (±16); Sonnet 5.5 at xhigh third at 1786, a 29-point gap; Sonnet 5.5 at high 1699, fourth (2026-09-29) | Arena on X, 2026-10-01, via remio.ai; Arena changelog | secondary | Human preference for generated web apps, not design-canon fidelity |
| Design Arena Website Elo: Opus 5.5 1361, Fable 5.1 1319 | BenchLM, verified 2026-09-30 | secondary\[39\] | Sonnet 5.5 score [NOT IN SOURCE] in the retrieved snapshot |
| Context Arena 8-needle MRCR: Opus 5 (not 5.5) 91.3% at 128K but 45.7% averaged across 1M | GitHub issue citing contextarena.ai, fetched 2026-10-04 | secondary | Predecessor model only; used as a context-size warning, not a 5.5 measurement\[40\] |
| Artificial Analysis index: Opus 5.5 above Sonnet 5.5 above Fable 5.1 at top settings;\[41\] at low effort Fable 5.1 leads Opus 5.5 | vallettasoftware and emergent.sh, dates [NOT IN SOURCE] | secondary | Numbers withheld here because the sources are undated\[42\]\[43\] |

### Practitioner reports

| Claim | Source (dated) | Label | Note |
| --- | --- | --- | --- |
| 48 Claude Code runs on an 11-file PHP repo (bug fix, rename, script, refactor): Sonnet 5.5 medium 12/12 for $0.88 total; Opus 5.5 medium 12/12 for $1.91; Sonnet 5.5 at high bought nothing over medium | wmedia.es, 2026-09-29 | secondary (practitioner, own runs) | Small tasks with small context; does not test 200k to 500k threads. Author: Opus edge on judgment-heavy work "is Anthropic's claim"\[2\] |
| Same harness: Opus 5.5 12/12 for $1.82 vs Fable 5.1 12/12 for $5.47; Opus 5.5 high same as medium | wmedia.es, about 2026-09-23 (date inferred from the 2026-09-29 post's reference to "six days ago") | secondary | Fable did not earn its price on small scoped tasks\[44\] |
| Base44: across 118 app builds, Sonnet 5.5 matched Opus 5 quality in 3.6 iterations vs 7.7, fewest failed tool calls\[3\] | anthropic.com/claude-sonnet-5-5, 2026-09-28 (customer quote) | secondary (vendor-selected testimonial) | Compared with Opus 5, not Opus 5.5 |
| Opus 5.5 vs Fable 5.1, 5 runs per test: Opus 5.5 got 13 of 15 runs right at 22% less cost; Fable 5.1 got all 15 and finished 40% faster, but took a problematic shortcut to pass one test; in the concurrency test Opus 5.5 ran out of room twice and returned nothing | The New Stack, "Claude Opus 5.5 vs. Fable 5.1: One overthinks, the other cuts corners", exact date [NOT IN SOURCE] | secondary | A case where Fable earned its price, with a shortcut caveat |
| Claude Code security benchmark: Opus 5.5 reaches 68.7% FuncPass and 33.5% SecPass, behind Fable 5.1 on both (87.2% / 37.4%); Opus 5.5 ran a median of 2.2 minutes for $116 in total | Endor Labs (Luca Compagna), 2026-09-24 | secondary | Contradicts Anthropic's benchmark ordering |
| Hacker News readers read Anthropic's charts as Sonnet 5.5 at high+ offering little over Opus 5.5 at low; Sonnet's niche is low or medium effort and subagent work | HN Sonnet 5.5 thread and apidog summary, dates [NOT IN SOURCE] | secondary | Consistent with Anthropic's own lower-effort framing\[13\]\[45\] |
| Practitioners put the start of long-context degradation at about 125k to 150k tokens regardless of window | GitHub issue citing Matt Pocock and Geoffrey Huntley, 2026-10-04 | secondary | Model-agnostic claim; not measured on 5.5 models\[40\] |
| Sonnet 5.5 system card finds it more honest under pressure than Opus 5.5 but more prone to hallucination | apidog summary of system card (card 2026-09-28) | secondary | Not read in the card directly\[13\] |

### Context size and effort setting

| Claim | Source (dated) | Label | Note |
| --- | --- | --- | --- |
| Cache reads make up the majority of agentic and coding work costs\[14\] | anthropic.com/claude-opus-5-5, 2026-09-22 | verified | At 200k to 500k context, the cache-read rate drives cost\[46\] |
| At a 300k-token cached context with 5k fresh input and 3k output per turn, a turn costs about $0.07 on Sonnet 5.5, $0.14 on Opus 5.5, $0.275 on Fable 5.1 | Computed from Anthropic pricing page, retrieved 2026-10-08 | judgment (estimate) | [ASSUMPTION: turn shape]. Fable/Opus about 2.0x per turn on this shape; repo's measured 2.7x implies more output or cache writes on Fable threads |
| Effort levels on Sonnet 5.5 are recalibrated; do not carry Sonnet 5 settings over\[7\]\[9\] | platform.claude.com effort doc, retrieved 2026-10-08 | verified | Re-sweep effort per model\[21\] |
| Per-message effort change via API preserves the prompt cache on Opus 5.5, Sonnet 5.5, Fable 5.1\[9\] | platform.claude.com effort doc, retrieved 2026-10-08 | verified\[21\] | Contrast with Claude Code cache-bust behaviour (see Contradictions) |

### Harness compensation (Lorimer consult)

| Claim | Source (dated) | Label | Note |
| --- | --- | --- | --- |
| Path rules and pre-edit hooks can block the out-of-scope edits Sonnet 5.5 made at max effort | Lorimer consult, 2026-10-07; failure mode from anthropic.com/claude-sonnet-5-5, 2026-09-28 | judgment | Compensable |
| A stop hook that requires the ticket's checks to have run compensates for "done without a check" at low effort | Lorimer consult; failure mode from Prompting Claude Sonnet 5.5 | judgment | Compensable; Anthropic also supplies a prompt paragraph for it\[9\] |
| Tool-name case mismatches can be normalised by the harness | Lorimer consult; failure from Prompting Claude Sonnet 5.5 | judgment | Compensable |
| A fresh read-only evaluator catches only what it finds; a weaker reviewer's misses pass every check | Lorimer consult; catch rates from CodeRabbit, 2026-09-28 | judgment | Not compensable by harness; set review model floor at Opus 5.5 |
| Wrong framing in shaping is encoded into tickets and then passes acceptance criteria | Lorimer consult | judgment | Not compensable; this is why shaping's floor is Opus 5.5 |
| Long-context recall loss cannot be checked away; it can only be avoided by smaller context per thread (tickets at most 2,500 tokens, fresh threads) | Lorimer consult | judgment | Partly compensable by keeping threads short |
| Research fabrication can be caught by a citation-checking evaluator, as in Anthropic's own graded report test | Lorimer consult; test design from anthropic.com/claude-opus-5-5, 2026-09-22 | judgment | Compensable for invented figures; not for missed sources |

## How context size and the effort setting change the answer

Context size. All three models have a 1M-token window and 128k max output (verified, Anthropic model pages and release notes, retrieved 2026-10-08),\[5\]\[17\]\[18\]\[19\] and no long-context surcharge appears in the model pricing table for Sonnet 5.5, Opus 5.5 or Fable 5.1 (verified, pricing page, retrieved 2026-10-08); only Haiku 5.5 is tiered at 100k.\[6\] So at 200k to 500k, the price question is decided by cache-read rates: Sonnet 5.5 $0.10, Opus 5.5 $0.20, Fable 5.1 $0.25 per million (verified).\[5\]\[6\]\[14\]\[15\] As context grows, Fable's premium over Opus shrinks on the cached share (1.25x rather than 2.5x) and Sonnet's discount against Opus stays at 2x after the 2026-10-07 cut (judgment, arithmetic). Capability at that size is the weak point of this note: no Anthropic MRCR, needle-style or Fiction.LiveBench figure was found for any of the three models; the only long-context rows found are ProgramBench up to 1M (Sonnet 5.5 79.7% vs Opus 5.5 91.2%, secondary citing the 2026-09-28 card) and a predecessor's Context Arena drop from 91.3% at 128K to a 45.7% average across 1M (Opus 5, secondary, 2026-10-04).\[13\]\[37\]\[40\] Judgment: the larger the build thread's context, the less the small-task practitioner evidence for Sonnet 5.5 transfers, and the more the calibration must be run at this repo's real context sizes. The cheapest lever is keeping threads short, not changing model.

Effort. Anthropic's Claude Code guidance is to use each model's default effort for most tasks, raise effort when Claude skipped files or tests, and move up a model when it had context, tried, and still failed (verified, claude.com blog, 2026-07-07).\[28\] For Sonnet 5.5 the Platform guidance is medium for well-specified agentic coding and high for harder or longer tasks (verified, effort doc, retrieved 2026-10-08).\[9\]\[21\] Effort changes the Sonnet-versus-Opus answer directly: Anthropic says Sonnet 5.5 complements Opus best at lower effort and costs about the same at higher settings (verified, 2026-09-28),\[3\] and Sonnet 5.5 scored lower at Max than Xhigh on FrontierCode because of timeouts and out-of-scope edits (secondary reports of the launch footnote, 2026-09-28).\[11\]\[47\] So: Sonnet 5.5 only pays off at low or medium; low invites skipped checks, so medium is the floor; if a ticket seems to need Sonnet at xhigh or max, run Opus 5.5 instead (judgment). On small tasks, high effort bought nothing over medium for either Sonnet 5.5 or Opus 5.5 (secondary, wmedia.es, 2026-09-29).\[2\]\[44\] Pin effort explicitly with `--effort` per thread, because the Claude Code default for Sonnet 5.5 is reported inconsistently (see Contradictions), and set it at thread start, because changing /effort or /model mid-session busts the cache in Claude Code (verified, claude.com article, undated).\[29\]

## Calibration protocol [PROPOSED]

Design. Pick two upcoming tickets already cut to contract (at most 2,500 tokens, acceptance criteria, non-negotiables, planned paths, interfaces, build notes): ticket A, backend code with tests; ticket B, UI work judged against the design canon. Each is expected to run at 200k tokens of context or more. Build each twice from the same base commit in fresh threads: once with `claude --model claude-sonnet-5-5 --effort medium`, once with `claude --model claude-opus-5-5 --effort medium` (full IDs, not aliases; Claude Code v2.1.284 or later). Same harness, hooks, path rules and checks for both siblings. Do not switch model or effort mid-thread. Harden each sibling with the same fresh-context, read-only Opus 5.5 evaluator at high effort, blind to which model built it. [ASSUMPTION: the repo's "weighted token" is tokens weighted by list price per category; if not, state the repo's weighting in the result.]

What to measure per sibling.
- Calls: tool calls, turns, failed tool calls, check runs.
- Weighted tokens: input, cache writes, cache reads, output, each weighted at the 2026-10-08 list prices (Sonnet 5.5 cache read $0.10, not the $0.20 on the launch page), plus peak context size.
- Hardening findings: count and severity from the blind evaluator, acceptance criteria failed, non-negotiables violated, edits outside planned paths, rework rounds to pass.
- Model actually used per request (from `modelUsage` in headless output), to catch fallback.\[25\]
- Wall-clock time.

Thresholds that move each default [PROPOSED].
- Build default moves from Opus 5.5 to Sonnet 5.5 if, on both tickets, Sonnet's sibling passes all acceptance criteria within one more rework round than Opus, has zero non-negotiable violations and zero out-of-path edits, has no high-severity hardening finding Opus lacked, has no more than one extra finding of any severity, and costs at most 60% of Opus's weighted tokens.
- Build minimum rises from Sonnet 5.5 to Opus 5.5 if either Sonnet sibling violates a non-negotiable, edits outside planned paths, or has two or more extra hardening findings.
- UI default moves to Sonnet 5.5 only if ticket B passes on the conditions above and the evaluator records no canon deviation that Opus's sibling lacked.
- Anything in between is inconclusive: run a third pair before changing defaults [NEEDS DECISION on budget].
- Review floor drops below Opus 5.5 only after a separate test that shows a Sonnet 5.5 reviewer finds at least as many seeded findings as Opus 5.5 on the same diffs; not part of this protocol.
- Fable 5.1 becomes recommended for shaping or research only if an Opus 5.5 thread at xhigh has to be re-run or re-shaped on the same problem, and a Fable 5.1 sibling then succeeds at no more than the repo's measured 2.7x cost per weighted token.
Caveat: two pairs are a small sample; one practitioner saw the same model's pass rate move between 9/12 and 11/12 on repeat days (wmedia.es, 2026-09-29),\[2\] so treat a single-ticket difference as noise (judgment).

## Contradictions between sources

- Claude Code default effort for Sonnet 5.5. Anthropic's launch page says Claude Code and the apps default to Medium and the Platform to High (2026-09-28),\[3\] and a practitioner probe found Sonnet 5.5 at medium in Claude Code (wmedia.es, 2026-09-29).\[2\]\[4\] A secondary site quotes the Claude Code docs as "high on every model that supports effort, except that Opus 5.5 defaults to medium" (claudefa.st, undated).\[48\]\[49\] Unresolved; pin effort explicitly.
- Sonnet 5.5 cache-read price. $0.20 on the launch page (2026-09-28), the AWS blog and CodeRabbit (2026-09-28), against $0.10 on the pricing page and release notes from 2026-10-07.\[3\]\[4\]\[5\]\[6\]\[7\] Not a conflict of fact but of date; the earlier figures are stale.
- Repo prices against Anthropic. Repo: Haiku 5.5 $0.10 / $0.50 (cached 2026-10-06); Anthropic: $0.10 / $0.50 up to 100k prompt tokens, $0.50 / $2.50 above (pricing page, retrieved 2026-10-08). Repo: cache reads about one twentieth of input; Anthropic: one twentieth on Opus 5.5 and Sonnet 5.5, one fortieth on Fable 5.1, one tenth on Haiku 5.5 (pricing page, retrieved 2026-10-08).\[5\]\[6\]\[16\] The Fable, Opus and Sonnet input and output prices agree.
- Opus 5.5 against Fable 5.1. Anthropic's launch table puts Opus 5.5 ahead on every published row (2026-09-22),\[14\] and METR expects slightly higher uplift from Opus 5.5 (2026-09-22).\[23\]\[32\] Endor Labs' Claude Code security benchmark (2026-09-24) puts Fable 5.1 ahead on both functional and secure code (87.2% / 37.4% against Opus 5.5's 68.7% / 33.5%), and in The New Stack's test (undated) Fable 5.1 got all 15 runs right to Opus 5.5's 13, though Fable took a shortcut on one test. Anthropic itself says the real gap is narrower than its scores suggest.\[14\]
- Sonnet 5.5 against Opus 5.5 on coding. Sonnet 5.5 leads Terminal-Bench 4.0 70.6% to 66.4% (Anthropic, 2026-09-28), while the same page says Opus is clearly stronger on sustained judgment,\[3\] and CodeRabbit measured a wider review gap than the benchmarks imply (2026-09-28).\[2\]\[4\]
- Deep research. Anthropic's model matrix suggests Fable 5.1 for "multistep deep research" (choosing-a-model, retrieved 2026-10-08), but Anthropic's own sourced-report test had Fable 5.1 fail the no-invented-figures bar in every attempt while Opus 5.5 cleared it 16 of 18 times (2026-09-22).\[1\]\[14\]
- WebDev Arena. One source puts Fable 5.1 at 1762 as the top WebDev Arena score (LogRocket, September 2026); Arena's 2026-10-01 snapshot puts claude-opus-5.5-max first at 1815 and Sonnet 5.5 at xhigh third at 1786 (Arena on X, via remio.ai). Different snapshots; not comparable.
- Prompt cache and effort changes. Claude Code says /effort changes bust the cache (claude.com article, undated); the API effort doc says per-message effort changes preserve it (retrieved 2026-10-08).\[9\]\[21\]\[29\] Different surfaces; in Claude Code threads, treat effort as fixed per thread.

## Not found

- Any Anthropic-published MRCR v2, needle-style, Graphwalks or Fiction.LiveBench score for Sonnet 5.5, Opus 5.5 or Fable 5.1 [NOT IN SOURCE]; the Fable 5.1 system card's long-context section was located but not read.
- Independent Terminal-Bench leaderboard entries, Aider polyglot, LiveCodeBench, tau-bench, BFCL or IFEval-type scores for the three models [NOT IN SOURCE].
- A METR time-horizon number for Opus 5.5, Sonnet 5.5 or Fable 5.1 [NOT IN SOURCE].
- Any benchmark of fidelity to a supplied design system or design canon [NOT IN SOURCE]; arena scores measure preference only.
- Any practitioner measurement of Sonnet 5.5 against Opus 5.5 at 200k to 500k tokens of context in Claude Code [NOT IN SOURCE].
- Any source measuring instruction following on precise specs for Sonnet 5.5 specifically; the "literal instruction following" guidance found is for Sonnet 5, not 5.5 [NOT IN SOURCE].\[50\]
- A Claude Code docs statement fetched directly giving Sonnet 5.5's Claude Code default effort [NOT IN SOURCE]; only the launch page and secondary quotes.
- Dates of the Fable 5 / Mythos 5 access suspension (2026-06-12) and restoration (2026-07-01) for US export controls [NOT IN SOURCE]; the 2026-06-09 Fable 5 release date appears only in secondary sources.
- A dated Design Arena or Code Arena score for Sonnet 5.5 with an exact Elo from a primary arena page [NOT IN SOURCE].

## Promote to library

No. The answer rests on Anthropic claims and small external runs published within two weeks of the releases, a Sonnet 5.5 price changed on 2026-10-07, and no build in this repo on Sonnet 5.5; its central recommendation is to run the calibration protocol. Promote after the two calibration pairs are measured and the build and UI defaults are settled, with the results attached.

## Sources

1. [Choosing the right model](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
2. [Sonnet 5.5 vs Opus 5.5 in Claude Code: the same work at half the cost, and faster | wmedia.es](https://wmedia.es/en/tips/claude-code-sonnet-5-5-vs-opus-5-5-benchmark)
3. [Introducing Claude Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5)
4. [Sonnet 5.5 vs Opus 5.5 Code Review Benchmarks](https://www.coderabbit.ai/blog/sonnet-5-5-model-review)
5. [Claude Platform release notes](https://platform.claude.com/docs/en/release-notes/overview)
6. [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
7. [What's new in Claude Sonnet 5.5](https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5)
8. [Claude Fable 5.1: API, Pricing & Benchmarks](https://atoms.dev/models/claude-fable-5-1)
9. [Prompting Claude Sonnet 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5)
10. [Claude Haiku 5.5 Cuts Prices to Rock-Bottom Levels, Pushing Small AI Model Competition Into the 1-Cent Era](https://eu.36kr.com/en/p/4016451771158408)
11. [Claude Sonnet 5.5 review: benchmarks, real costs, and the verdict](https://www.eesel.ai/blog/claude-sonnet-5-5-review)
12. [Claude Sonnet 5.5 takes third place on Code Arena’s WebDev leaderboard](https://cryptobriefing.com/claude-sonnet-5-5-code-arena-webdev/)
13. [Claude Sonnet 5.5 vs Opus 5.5: Half the Price, How Close ...](https://apidog.com/blog/claude-sonnet-5-5-vs-opus-5-5/)
14. [Introducing Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5)
15. [Claude Fable 5.1: Pricing, 1M Context, and Coding Agent Fit](https://agent.space/blog/claude-fable-5-1-coding-agents)
16. [Claude Fable 5.1: Pricing, Effort Levels and What Changed](https://cruxdigits.nl/blog/claude-fable-5-1-pricing-effort-levels/)
17. [Claude Opus 5.5 - Claude Platform Docs](https://platform.claude.com/docs/en/models/opus-5-5/overview)
18. [Claude Sonnet 5.5 - Claude Platform Docs](https://platform.claude.com/docs/en/models/sonnet-5-5/overview)
19. [Claude Fable 5.1 - Claude Platform Docs](https://platform.claude.com/docs/en/models/fable-5-1/overview)
20. [Claude Fable 5.1 & Mythos 5.1: 75% Cheaper Cache \[2026\]](https://shattered.io/claude-fable-5-1-mythos-5-1-launch-2026/)
21. [Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
22. [Claude Opus 5.5 vs. Fable 5.1: One overthinks, the other cuts corners - The New Stack](https://thenewstack.io/claude-opus-5-5-vs-fable-5-1/)
23. [Claude Opus 5.5 matches Fable 5.1 performance at lower cost and promises less "Claudish" writing](https://the-decoder.com/claude-opus-5-5-matches-fable-5-1-at-40-percent-lower-cost-as-anthropic-promises-to-fix-claudish-writing/)
24. [Introducing Claude Fable 5.1 and Claude Mythos 5.1 \\ Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-1)
25. <https://code.claude.com/docs/en/model-config>
26. [Claude Code Models: How to Configure and Switch in 2026](https://fast.io/resources/claude-code-models-configuration-guide/)
27. [Model configuration - Claude Documentation](https://cld-docs.onlinetool.cc/en/docs/claude-code/model-config.html)
28. [Claude Code effort level and model selection | Claude | Claude by Anthropic](https://claude.com/blog/claude-model-and-effort-level-in-claude-code)
29. [Maximizing the value of your Claude Code sessions](https://claude.com/resources/articles/maximizing-the-value-of-your-claude-code-sessions)
30. [System Card: Claude Opus 5.5 September 22, 2026 anthropic.com](https://www-cdn.anthropic.com/fc1b44717c85dc068bc6ba5024219938094694bd/Claude%20Opus%205.5%20System%20Card.pdf)
31. [System Card: Claude Sonnet 5.5 September 28, 2026 anthropic.com](https://www.anthropic.com/claude-sonnet-5-5-system-card)
32. [Summary of METR's predeployment evaluation of Claude Opus 5.5](https://metr.org/blog/2026-09-22-claude-opus-5-5/)
33. [Claude Opus 5.5 for AI Agents: Fable-Level, 40% Less](https://beam.ai/agentic-insights/claude-opus-5-5-ai-agents)
34. [Claude Sonnet 5.5 Benchmarks: Anthropic's Numbers, ...](https://apidog.com/blog/claude-sonnet-5-5-benchmarks/)
35. [SWE-bench Pro Leaderboard (September 2026): Every Model Score, Benchmarks, and Price per Point](https://www.morphllm.com/swe-bench-pro)
36. [SWE-bench Pro Leaderboard: Opus 5.5 at 89.9%, Sonnet 5.5 at 81.3% · CodingFleet Blog](https://codingfleet.com/blog/swe-bench-pro-leaderboard-2026/)
37. [Claude Sonnet 5.5: Specs, Benchmarks, Pricing and the Real Cost per Task](https://kingy.ai/blog/claude-sonnet-5-5-specs-benchmarks-pricing/)
38. [Claude models explained: Opus, Sonnet, Haiku, and Fable Guide](https://toloka.ai/blog/claude-models-explained/)
39. [Design Arena Website Leaderboard & Scores — September 2026](https://benchlm.ai/benchmarks/designarenawebsite)
40. [perf: cut what reaches the orchestrator's context across plugin skills, hooks and agents · Issue #6322 · melodic-software/claude-code-plugins](https://github.com/melodic-software/claude-code-plugins/issues/6322)
41. [Claude Sonnet 5.5 takes third place on Arena’s Agent Arena leaderboard](https://cryptobriefing.com/claude-sonnet-5-5-agent-arena-third/)
42. [Best LLM for Coding 2026: Opus 5.5 vs GPT-6 Sol](https://vallettasoftware.com/blog/post/claude-opus-5-vs-fable-5-vs-gpt-5-6-sol)
43. [Claude Fable 5.1 vs Opus 5.5: Benchmarks, Cost & Verdict](https://emergent.sh/learn/claude-fable-5-1-vs-opus-5-5)
44. [Opus 5.5 vs Fable 5.1 vs Opus 5: the same tasks at a third of the cost](https://wmedia.es/en/tips/claude-code-opus-5-5-vs-fable-5-1-vs-opus-5-benchmark)
45. [Sonnet 5.5](https://news.ycombinator.com/item?id=49881850)
46. [Claude Opus 5.5: Pricing, Benchmarks and Breaking Changes](https://www.digitalapplied.com/blog/claude-opus-5-5-launch-pricing-benchmarks-2026)
47. [Claude Sonnet 5.5: Faster Everyday Coding Beside Opus 5.5](https://llm-stats.com/blog/research/claude-sonnet-5-5-launch)
48. [Claude Code Model vs Effort: Which Setting to Change](https://claudefa.st/blog/guide/development/model-vs-effort)
49. [How to Use Opus 5.5 in Claude Code: Best Practices](https://claudefa.st/blog/guide/development/opus-5-5-best-practices)
50. [Prompting Claude Sonnet 5 - Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5)
