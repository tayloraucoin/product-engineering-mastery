---
title: Calls only Taylor can make
description: Read when clearing blockers on the toolkit build or the library, to see each decision the reports leave to Taylor, the report's recommendation, and whether it still matters for a universal toolkit.
layer: decisions
status: draft
thread: P-A
role: Alembic
date: 2026-10-01
supersedes:
load_when:
---

# Calls only you can make

**Path.** [ASSUMPTION: `docs/decisions/only-you.md`]

**Owner column.**

- **"stated"**: the report names you, or says "your call", "Taylor's call" or "only you".
- **"spend"**: a purchase. You are implicitly the owner; the report does not say so.
- **"owner not stated"**: the report leaves the owner unclear.

Calls routed to Plumb, Threshold, Kurt, Karl or engineering are not in this file. They are listed in the notes.

## 1. Bears on the toolkit build

| #    | Call                                                                                | Report's recommendation                                                                                                | Src                  | Owner                                                            |
| ---- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| O-01 | Em dash in filenames                                                                | "Keep for human-browsed role files if you insist; never for paths agents construct"                                    | R14 §3               | stated ("if you insist")                                         |
| O-02 | Open threads 15–18 (Agent Context, Evals, Product Operating Artifacts, Measurement) | Primers written in R14 Appendix; thread 16 is DealReady-specific                                                       | R14 §6; Appendix     | owner not stated (commissioning)                                 |
| O-03 | PM role                                                                             | "formatting and EARS pass, or retires"                                                                                 | R14 §3               | owner not stated                                                 |
| O-04 | Onlook one-week trial                                                               | "one week, on one DealReady table and one Fybr panel; cost of being wrong is a week of polish done the slow way"       | R01 Open items       | stated ("[PROPOSED — needs sign-off]") — [product-bound] screens |
| O-05 | Confirm stack assumptions                                                           | TypeScript + React + Tailwind + shadcn/Radix + Storybook; "you already hold a Claude plan that includes Claude Design" | R01 Assumptions      | stated ("sign-off")                                              |
| O-06 | Confirm house voice and type set                                                    | "[ASSUMPTION: sentence case]"; "[ASSUMPTION: DealReady and Fybr each have a fixed type token set]"                     | R04 Conflicts Matrix | owner not stated                                                 |

## 2. Library

| #    | Call                                             | Report's recommendation                                                                                                      | Src              | Owner                  |
| ---- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------- |
| O-07 | Approve the source rubric and batch order        | Reply "go Batch 0", or give changes                                                                                          | R11 §6b T1       | stated                 |
| O-08 | Approve the books rubric, gate and weights       | Reply "approved" or name specific changes                                                                                    | R12b H1          | stated                 |
| O-09 | Connect the repo folder                          | "In the Claude desktop app, choose 'Add folder'"                                                                             | R11 T2; R12b H2  | stated (asked in both) |
| O-10 | Overlap ownership with the parallel thread       | Default "(a) Split by era"                                                                                                   | R12b H3          | stated                 |
| O-11 | Mom Test 2nd-edition beta                        | (a) include as short quotes labelled beta, or (b) exclude                                                                    | R12b H4          | stated                 |
| O-12 | Spot-check the first distillation                | "Pick three atoms and check each against its locator"                                                                        | R12b H8          | stated                 |
| O-13 | Read-in-full choices; reading; highlight exports | Use the read-priority column. Priority: Don't Make Me Think, Mom Test, DOET, then Creative Selection or Designing Interfaces | R12b H10, H9, H6 | stated                 |
| O-14 | Doshi thread capture; transcripts                | T3 "only if Batch 0's fetch fails"; T5a–T5e after the Batch 0 sweep; T7–T9 optional or skip                                  | R11 §6b–6d       | stated                 |

## 3. Purchases

| #    | Call                 | Report's recommendation                                                                                                                           | Src             | Owner                                            |
| ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------ |
| O-15 | Lenny's paid archive | "decide whether the $200/year Annual tier … is worth it, or run with the free starter pack only"                                                  | R11 T4; R12b H5 | stated                                           |
| O-16 | Refactoring UI       | "Buy The Essentials, $99 USD … Skip The Complete Package"; optionally the two free chapters first                                                 | R08 §7          | spend                                            |
| O-17 | Design+Code          | "One month of Pro ($99), after a free pass"; skip if the free pass already gives a working DESIGN.md extraction                                   | R09 Verdict; §6 | spend                                            |
| O-18 | Shift Nudge          | "buy PRO after the four free weeks, not now, and not VIP"; buy now only if "a DealReady table redesign [is] scheduled inside the next four weeks" | R06b §3         | spend                                            |
| O-19 | animations.dev       | "join the 2027 waitlist now"; buy only if "your own recordings still 'feel off'"                                                                  | R07b §4         | spend                                            |
| O-20 | Product Talk         | Skip Fundamentals; buy Interviews ($259) when interviews are booked; Recruiting only on two missed weeks; "call it by 9 Oct 2026"                 | R10 §1; §5      | stated ("you, before your cycle charter is set") |
| O-21 | Book copies          | Ebook where possible; priority by read score                                                                                                      | R12b H7         | stated                                           |
| O-22 | Paper Pro seat       | "$16 (annual) or $20 (monthly) … You; one seat."                                                                                                  | R01 §5          | spend                                            |

## 4. Product-bound (likely moot for a universal toolkit; kept, not dropped)

| #    | Call                                                                   | Report's recommendation                                                   | Src            | Owner                                |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------- | ------------------------------------ |
| O-23 | Explicit trust action in the diligence view                            | Needed before TTFTI can be measured; fallback `insight_exported` "weaker" | R03 §4.1; §7   | stated ("Taylor (product decision)") |
| O-24 | Sign off TTFTI v0.1; fill success and kill brackets                    | "[PROPOSED — needs sign-off]"; "the brackets are yours to set"            | R03 §4.1; §4.4 | stated                               |
| O-25 | Kurt's last-word split before the first table                          | Kurt decides whether to bet; Head of Product decides scope                | R05 §7         | stated (with Kurt)                   |
| O-26 | Confirm discovery assumptions; fill Envoy §7                           | "Fill Envoy's §7 for each product before the first interview"             | R10 §8         | stated                               |
| O-27 | DealReady site editor; Fybr domain; pricing form; Framer export answer | Open items checklist                                                      | R02 Open items | owner not stated                     |
| O-28 | Label 100 traces for the first eval set                                | "you (labels)"                                                            | R14 §4 step 5  | stated                               |
| O-29 | PostHog, Framer seats                                                  | as in ledger PU-04, PU-06                                                 | R02; R03       | spend                                |
