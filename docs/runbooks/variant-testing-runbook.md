---
title: Variant testing at small scale (runbook)
description: "Follow when a variant needs to reach named customers, or before claiming a change \"worked\": mechanism, data source, exposure, pre-registered rule, guardrails, qualitative pairing, and when a real experiment becomes possible."
layer: runbooks
status: draft
thread: "03"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: metrics, spec
---

# Variant testing at small scale

> **Who runs it:** the shaper (brief, decisions); Tally (measurement sections, sign-offs); engineering (build, QA).
> **Tool:** the mechanics below are written for PostHog, the ruled tool. `[FILL: flag and analytics tool, if not PostHog]` — map each step and note any capability it lacks.

## 1. Default: a flagged trial, not an experiment

Below the thresholds in §8, no window answers a lift question. Run a flagged trial with a pre-registered rule (§5) and full qualitative coverage (§7). Inconclusive is a legitimate outcome and is recorded as inconclusive.

## 2. Mechanism

|                                                       | Use                                                                                         | Never                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **A.** Preview deployment per branch                  | Internal critique on seeded data, behind deployment protection                              | With real customer data: that puts confidential data on a forwardable URL |
| **B.** Flag targeted at named accounts, in production | Default now: the customer sees the variant in their real product                            | —                                                                         |
| **C.** Cohort or percentage rollout                   | Once more than 10 active accounts; becomes randomization later                              | —                                                                         |
| **D.** Opt-in labs surface                            | "What enthusiasts do", never a causal lift. An opt-in overrides every other flag condition. | As a lift measure                                                         |

## 3. Where the variant's data comes from

- The variant reads production data, behind the flag, through the same authorization path. Never a staging copy of `[FILL: customer data unit]` (the confidential object a customer works in).
- Seeded data is for critic screenshots, instrumentation QA, and demos without a real account.
- **Variants that change what a model writes** run in shadow mode: compute both outputs, keep the current one as the record, compare offline. A variant never changes a record a user already verified.
- **Variants that change a computed value** run side by side, with the old result authoritative, until the difference is inside `[FILL: tolerance]` — the error band the domain owner signs off.

## 4. Exposure path (what engineering builds)

1. One flag per variant, multivariate (`control`, `test`). Release condition: `[FILL: account identifier property]` is one of the named accounts. Everyone else gets `control`.
2. Set the account identifier as a person property on `identify()`, and call `identify()` before any flag is evaluated.
3. Evaluate server-side and bootstrap the client with the same distinct ID, so the view doesn't flicker.
4. Set `advanced_feature_flags_dedup_per_session: true`.
5. Fire a custom exposure event when the variant actually renders, carrying `$feature/<flag-key>`. Choose it as the experiment's exposure criterion.
6. Multiple exposures: "Exclude from analysis".
7. Turn the test-account filter on, and include your own team's and demo accounts. At n=10, your own sessions are the largest segment.
8. Replay masking: inputs and all text masked by default. Unmask only UI chrome marked `data-record="true"`. Add `ph-no-capture` to any pane showing customer content.
9. Preview and staging send to a separate analytics project, or load no analytics.

**Property hygiene.** Opaque IDs only. Never put a name, title, content or filename in an event property.

## 5. Pre-registered rule (written in the package before the flag flips)

> **Hypothesis:** `[FILL: change]` cuts `[FILL: metric ID from docs/metrics/definitions.md]` without raising `[FILL: guardrail]`.
> **Cohort and window:** `[FILL: named accounts]`, two full weeks, `[FILL: start date]` to `[FILL: end date]`.
> **Comparison:** within each account, against that account's own prior 4 weeks. With no prior data, this run sets the baseline and cannot be graded as a win.
> **Ship if all hold:** `[FILL: primary condition, in at least N of M accounts]`; no guardrail breach; `[FILL: qualitative condition, e.g. 4 of 5 debriefs]`.
> **Kill immediately if:** `[FILL: the one event that proves harm]`; errors double; `[FILL: qualitative kill]`.
> **Otherwise:** iterate.

Every count in a readout carries its interval next to it (Wilson). Example: 4 of 6 is roughly 30–90%.

**Name the confounders in advance:** learning effect (first versus later use); size of the unit; model or algorithm version mid-window; facilitated sessions, tagged and reported separately.

## 6. Guardrails (read daily; these may kill early)

| Guardrail                                           | Breach                          |
| --------------------------------------------------- | ------------------------------- |
| `[FILL: the misuse your change could cause]` (rate) | above baseline                  |
| Errors in the view ÷ views                          | doubles against control         |
| p75 render time                                     | above `[FILL: ms]` or 30% worse |
| Support messages reporting confusion                | any                             |

## 7. Qualitative pairing (what replaces the p-value)

- Watch every exposed session within 48 hours. Log one line per session (unit, time to outcome, where they stalled, anything surprising) and link the replay. Recording retention must outlast the readout.
- Hold five 20-minute story-based conversations in week 2, at most 2 per account.
- Log every inbound mention of the change verbatim.
- Canvas or WebGL surfaces aren't captured by replay. Pair them with a live screen-share; this is mandatory, not optional.

## 8. When a real experiment becomes possible (all four must hold)

1. Units in the window ≥ the per-arm N at an MDE you'd act on (50% or less), within 6 weeks. Use the sizing formula `N per arm = 16 × variance / d²`.
2. At least 100 exposures. Below that, sample-ratio-mismatch (SRM) and running-time checks don't run.
3. Whole weeks only, at least 2.
4. The practitioner floor: thousands of active users, and only for large effects.

Recheck these thresholds once a quarter in the readout. When they hold:

- Choose the stopping rule in advance: either a fixed horizon, or frequentist with sequential testing. Bayesian is not a license to peek.
- If the SRM indicator fires, stop and fix the wiring before reading anything.

## 9. Steps

| #   | Step                                                                                                                                        | Owner                                       | Gate to the next step                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| 1   | Package with hypothesis, metric ID, event plan, guardrails, cohort, window, ship and kill rules, "what this scale can't tell us"            | shaper; Tally drafts the measurement fields | Rules written before any code                      |
| 2   | Plausibility: flagged trial or experiment (§8)?                                                                                             | Tally                                       | One line recorded in the package                   |
| 3   | Build: variant behind the flag; events; exposure event; masking; test-account filter                                                        | engineering                                 | PR links the package                               |
| 4   | Instrumentation QA on staging with seeded data; watch one replay for leaked content                                                         | engineering; Tally signs off                | No customer exposure until it passes               |
| 5   | Internal critique on a protected preview                                                                                                    | critic; design director                     | Fixes merged                                       |
| 6   | Open to named accounts; tell them in writing (variant, window, masked recording, how to opt out)                                            | shaper                                      | Rollback trigger written into the flag description |
| 7   | Run the window: guardrails daily; primary metric unread until close; replays within 48h; conversations in week 2                            | shaper                                      | Window closes on its date                          |
| 8   | Readout                                                                                                                                     | Tally drafts; shaper interprets             | Answers the two questions in §10                   |
| 9   | Decide: ship (100%, then remove the flag and dead code within 2 weeks), kill (flag off, code removed), or iterate (new package, flag `-v2`) | `[FILL: decision-maker]`                    | Outcome recorded against the pre-registered rule   |

**Flag description** (mirrored in the package):

```
flag: <key> | variants: control, test
target: <account property> in [..] | everyone else: control
exposure: <custom event>, test accounts filtered, multi-exposure excluded
window: YYYY-MM-DD to YYYY-MM-DD
rollback trigger: <kill rule>
package: specs/<feature>/package.md | metric: <ID vN>
```

## 10. Every readout answers two questions, in order

1. **What moved?** Each number with its count, denominator, segment and interval, plus the replay or quote that explains it. Movement without an explanation is reported as unexplained.
2. **What can't this scale tell us?** Two to four lines, each paired with the cheapest way to find out.

If nothing moved, the readout says so in two lines and stops.
