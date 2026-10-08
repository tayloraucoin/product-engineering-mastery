---
title: "Does Sonnet 5.5 build a contracted ticket in this repo as well as Opus 5.5? The calibration pairs, measured"
description: "Read only to trace why a ticket build's minimum and recommended model are both Opus 5.5: the calibration protocol of model-selection-claude-code.md run on three sibling pairs (LAB-19, LAB-27, LAB-30), hardened blind, with measurements, the thresholds applied and what the sample cannot say."
layer: research
status: archived
thread: model-selection-calibration
role: Vigil
date: 2026-10-08
last_reviewed: 2026-10-08
supersedes:
load_when: never
---

# Does Sonnet 5.5 build a contracted ticket in this repo as well as Opus 5.5?

## Answer

Not well enough to be the floor. On the two pairs that ran as the protocol specifies (LAB-19, a UI ticket, and LAB-30, a backend ticket, each built once by Opus 5.5 and once by Sonnet 5.5 at medium effort from base 115df1e), both Sonnet siblings passed every criterion command, broke no non-negotiable and cost 28 to 29 percent of their Opus sibling at list price (measured), but each drew four to six more hardening findings than its Opus sibling, and each left a criterion clause with no test behind it (measured). Applied as written, with the two definitions below that were set after the data was seen, the note's thresholds give:

| Default | Verdict | The threshold that decided it |
| --- | --- | --- |
| Build default | **Stays Opus 5.5** | "No more than one extra finding of any severity" fails on both pairs: +5 on LAB-19, +4 net on LAB-30 (measured). Cost passes on both. |
| Build minimum | **Rises from Sonnet 5.5 to Opus 5.5** | "Two or more extra hardening findings" fires on both pairs (measured); no non-negotiable was broken by a Sonnet sibling. |
| UI default | **Stays Opus 5.5** | LAB-19's Sonnet sibling recorded no canon deviation, but fails the extra-findings condition above. |
| Inconclusive | No | The minimum rule fired on both valid pairs, so no third pair is required. |

Decided by the operator in the audit thread on 2026-10-08: the verdict as drafted, a ledger line for the minimum (PR-22), and the repeat run below recorded as an optional follow-up. The default text in `docs/workflows/prompt-builder.md` §6 and `docs/workflows/stages/tickets.md` §6 is the operator's to apply; the thread printed it and changed neither file.

Opus is not clean either: LAB-30's Opus sibling broke non-negotiable 2 under the reading the operator ruled ("a load past the cap is still written"), and its own blind reviewer passed it on the other reading (measured). The thresholds test only Sonnet, so this has no rule; it weakens "Opus is the safe floor" without reversing it (judgment, Tally consult).

## How it was run

- **Design.** The protocol in `model-selection-claude-code.md` ("Calibration protocol"). The operator built three tickets twice each and handed over six worktrees labelled A1, A2 (LAB-19), B1, B2 (LAB-27) and C1, C2 (LAB-30), all on base 115df1e, keeping the model mapping until hardening ended. The brief named four siblings; the operator added the C pair during the thread.
- **Labels.** The protocol's "ticket A, backend; ticket B, UI" is reversed in the operator's labels: LAB-19 (pair A) is the UI ticket, so the UI rule applies to pair A [ASSUMPTION, stated at the start of the thread].
- **Hardening, blind.** `docs/workflows/stages/harden.md` §4 per sibling, at each ticket's level: `contract:run` (and `contract:init` where the build thread had not run it), captures once (LAB-19 C4: the four `sent-*` keys at 390, 834 and 1440, light and dark, from a scratch copy whose `team.ts` returns a synthetic admin for a cookie), the as-built, and one review per seat in fresh context, read-only, on Opus 5.5: Assay for LAB-19 (Q2), `yarn review:run` Mason and Warden for LAB-27 (Q3, review files record `claude-opus-5-5`), Mason for LAB-30 (Q2). Each LAB-27 and LAB-30 sibling ran `test:db` on its own scratch database (`pem_calib_*`), never `pem_local`. Vigil led and wrote the verification plan from each contract before reading any sibling's code; reviewers got the contract and the evidence, never the lead's reading.
- **No fixes.** The brief forbade building either ticket in the thread, so no finding was fixed and "rework rounds to pass" is an estimate.
- **The mapping**, revealed after the passes, from the original commits' co-author trailers, cross-checked against the `model` field of every call in each build thread and the thread's timestamps against its commit (measured).
- **Cost.** Each sibling's build thread from its first record to its build commit; one call per message id, each usage field at its largest, synthetic records excluded, the repo's weights (input 1, cache write 1.25, cache read 0.1, output 5), as `tooling/cost.ts` counts. List price at 2026-10-08 from the parent note's Evidence table: Opus 5.5 $4 / $20, cache write $5, cache read $0.20; Sonnet 5.5 $2 / $10, cache write $2.50, cache read $0.10 per million.

## Evidence

### What each sibling was built with

| Sibling | Ticket | Model on every call | Effort | Claude Code | Source |
| --- | --- | --- | --- | --- | --- |
| A1 | LAB-19, UI, Q2 | `claude-opus-5-5` | medium | 2.1.293 | thread in the `lab-19-opus` worktree, cut at its build commit bd19aa9 (measured) |
| A2 | LAB-19 | `claude-sonnet-5-5` | medium | 2.1.293 | trailer "Claude Sonnet 5.5" on 7427276; thread records (measured) |
| B1 | LAB-27, schema, Q3 | `claude-sonnet-5-5` | medium | 2.1.232 | thread in the `lab-27-sonnet` worktree (measured) |
| B2 | LAB-27 | `claude-opus-5` | **high** | 2.1.232 | trailer "Claude Opus 5 (1M context)" on 8de08df; thread records (measured) |
| C1 | LAB-30, backend, Q2 | `claude-opus-5-5` | medium | 2.1.293 | trailer "Claude Opus 5.5" on 7809d70; thread in `lab-30-opus` (measured) |
| C2 | LAB-30 | `claude-sonnet-5-5` | medium | 2.1.293 | trailer "Claude Sonnet 5.5" on 197fd20; thread records (measured) |

Pair B breaks the protocol on model (Opus 5, not 5.5), effort (high, not medium) and version (2.1.232, below the 2.1.284 the protocol names), so it is not scored. It serves one purpose: its two siblings' code is functionally identical, so its reviews measure reviewer noise.

### Cost and pace (measured)

| | A1 Opus | A2 Sonnet | C1 Opus | C2 Sonnet | B1 Sonnet | B2 Opus 5 |
| --- | --- | --- | --- | --- | --- | --- |
| Calls | 58 | 27 | 34 | 21 | 29 | 49 |
| Tool calls, failed | 58, 3 | 31, 0 | 33, 4 | 20, 1 | 29, 3 | 48, 2 |
| Input / cache write / cache read / output | 116 / 126,853 / 7,115,687 / 38,276 | 54 / 99,538 / 3,116,464 / 21,489 | 68 / 79,543 / 3,368,076 / 20,145 | 42 / 58,213 / 1,784,094 / 10,478 | 58 / 99,475 / 2,280,935 / 11,850 | 98 / 111,657 / 4,065,846 / 26,647 |
| Weighted tokens | 1,061,631 | 543,568 (51.2%) | 537,029 | 303,608 (56.5%) | 411,745 | 679,489 |
| List price | $2.82 | $0.78 (27.5%) | $1.47 | $0.43 (29.1%) | $0.60 | not priced [NOT IN SOURCE] |
| Peak context | 170,398 | 143,592 | 123,088 | 97,844 | 99,477 | 111,843 |
| Wall clock, first record to build commit | 7.4 min | 5.1 min | 6.2 min | 4.6 min | 17.1 min | 32.4 min |

- `yarn cost <id>` attributed only 2, 1, 3, 2, 9 and 32 of these calls to the ticket (measured): it counts a call from the first work command that names the ticket, and a build thread names it at its commit. The table uses the same rules on the whole build thread.
- B1's build thread also ran the epic's Tickets-gate pre-flight headless, which `contract:init` required to start LAB-27; for B2 the audit thread ran it. Neither run is in the table.
- A second Opus 5.5 thread of 9 calls in the `lab-30` worktree drove a terminal and wrote no code; it is not counted as a build (measured: tool names only).

### Hardening findings, consolidated per sibling (measured from the blind reviews and the lead's pass)

| | A1 Opus | A2 Sonnet | C1 Opus | C2 Sonnet | B1 Sonnet | B2 Opus 5 |
| --- | --- | --- | --- | --- | --- | --- |
| Criteria failed | 0 of 5 | 0 of 5; C1's focus clause and C5's reload clause have no test | 0 of 2 | 0 of 2; the action-layer not-counted path has no test | 0 of 2 | 0 of 2 |
| Non-negotiables broken | 0 | 0 | **1** (NN2: a load past the cap writes nothing) | 0 | 0 | 0 |
| Black or Red | 0 | 0 | 0 | 0 | 0 | 0 |
| Orange | 0 | 2 | 1 | 1 | 2 | 1 |
| Yellow or Grey | 0 | 3 | 3 | 7 | 6 | 6 |
| Findings its pair sibling lacks | 0 | 5 | 2 | 6 | n/a | n/a |
| Canon deviations (Assay) | none | none | n/a | n/a | n/a | n/a |
| Edits outside planned paths | 5 files | the same 5 | 2 files | the same 2 | 1 file | the same 1 |
| Review verdict | Assay PASS | Assay PASS | Mason PASS | Mason PASS | Mason PASS, Warden PASS | Mason PASS, Warden PASS |
| Fix rounds to pass (estimate) | 0 | 1 | 1 | 1 | 1 | 1 |

- **A2's extras:** four files fail `prettier --check`, so `yarn verify` would be red; the two untested clauses; focus dropped after "Change your answers"; equal spacing between heading, body and buttons; deps shaped as `findAccessEmail` and `accountEmail` rather than the build notes' `recordedEmail`.
- **C2's extras:** the untested action-layer path; a cap of 30 switches a minute that may drop real fast comparison; a result that says `counted: false` without why; a duplicated result type; a test's headroom computed from all-time rows; a misplaced constant. **C1's:** the non-negotiable break; the surface's "a view per page load" line now overstated. Shared by both: the cap count scans every row of the access; `last_design` is per reviewer, not per access.
- **Edits outside planned paths** were the same files on both sides of every pair and were forced by where the code already lives (the contracts' planned paths missed `review-data.ts`, `review-send.ts`, `review-view.ts`, `page.tsx` and a test fixture for LAB-19; a test fixture and the package barrel for LAB-30), except B's move of two constants into the schema module, which Mason accepted as one source of truth (measured, judgment on "forced").
- **Reviewer noise, from pair B:** on functionally identical code, each sibling's two reviewers returned 9 and 8 findings, and graded the same issue (the hosted migration validating existing rows) Should-fix on one side and Consider on the other (measured, n = 1). LAB-30's non-negotiable break was passed by its own reviewer and named by the epic's pre-flight before either build (measured): variance reaches substantive calls, not only counts.

### Definitions set after the data was seen (post hoc, 2026-10-08)

1. **High severity** is Black or Red, the review scale's Blocking (`docs/workflows/qa-levels.md`). Neither valid Sonnet sibling had one. If Orange counted, both would fail that condition too, and the verdict would not change.
2. **An edit outside planned paths** counts only beyond what the Opus sibling of the same pair also made. Read literally, every sibling, Opus included, fails both the default's "zero out-of-path edits" and the minimum's "edits outside planned paths", which discriminates nothing; the defect is in the contracts' planned paths (judgment, Tally consult).

### Thresholds applied (pairs A and C)

| Condition (build default) | LAB-19 (A2 vs A1) | LAB-30 (C2 vs C1) |
| --- | --- | --- |
| Passes all criteria within one more rework round | criterion commands pass; two clauses unproven; +1 round (estimate) | commands pass; one clause unproven; 0 extra rounds (estimate) |
| Zero non-negotiable violations | yes | yes |
| Zero out-of-path edits (definition 2) | yes | yes |
| No high-severity finding Opus lacked (definition 1) | yes | yes |
| No more than one extra finding of any severity | **no, +5** | **no, +4 net** |
| At most 60% of Opus's weighted tokens | yes, 51.2% (27.5% at list price) | yes, 56.5% (29.1%) |

Build minimum: "two or more extra hardening findings" fires on both. UI default: A2 has no canon deviation Opus lacked, but fails the conditions above.

### Tally's consult (judgment, in the thread)

The four-to-six-finding gaps, both in the same direction, exceed the one-finding, one-grade noise pair B shows (estimate), but most of Sonnet's extras are Yellow or Grey, where reviewers disagree most (judgment). Whether a gap of that kind is worth a 70 percent saving at list price is a value call for the operator, not something the counts settle (judgment). In money, the saving would have been about $1 to $2 per build of a ticket this size (measured on these pairs).

## Not found

- **Run-to-run variance per model.** Each ticket was built once per model; whether five extra findings is a habit or a bad draw is unmeasured. Optional follow-up, decided by the operator: rebuild LAB-19 once on each model, about $3.60 at list price (estimate, from this pair).
- **Behaviour at 200k tokens of context or more.** The protocol expected 200k or more; peaks were 98k to 170k (measured). The risk the parent note named at this repo's context sizes is still untested.
- **A valid Opus 5.5 sibling for LAB-27.** Pair B's Opus side ran Opus 5 at high effort on Claude Code 2.1.232.
- **Opus 5's list price** [NOT IN SOURCE]; the parent note prices Opus 5.5, Sonnet 5.5, Fable 5.1 and Haiku 5.5 only.
- **The live sent view after a real send** (LAB-19): until LAB-20 binds the mailer, every live send shows the partial body; focus on arrival is verified from code in both siblings, not in a capture.
- **LAB-30's ledger.** Its Tickets-gate pre-flight is FAIL ("a load is never refused" has no criterion), so `contract:init` refuses it; its criteria were run directly and recorded here, not in `results.json`.

## Promote to library

No. It is one repo's measurement on two valid pairs, with two definitions chosen after the data, and its own Not found names the two runs that would make it general (a repeat pair, and a ticket that reaches 200k context). Promote, together with the parent note, if a repeat pair confirms the direction.
