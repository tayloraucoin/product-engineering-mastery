---
title: Prompt 03 — Staging branches for customers to test interfaces, and honest A/B at seed scale
description: Paste into a new general thread to re-derive how a variant reaches named customers and what "it worked" can mean at small scale. Its run is archived at docs/research/03-staging-branches-customer-testing-tally.md.
layer: prompts
status: adopted
thread: "03"
role: Tally
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 03 — Staging branches for customers to test interfaces, and honest A/B at seed scale

**Model:** Opus
**Inject:** Tally (Metrics Analyst) primary. If you want the infrastructure side answered in the same thread, add your architecture seat (Mason) as consulted; otherwise Tally routes the build questions to engineering in the report.
**Attach:** `00-shared-context`, the Tally role prompt, textbook Part 3.5 and Part 6 (analytics consolidation, small-n guidance).
**Expected output:** an investigation report ending in an operating procedure: how a customer gets to see and test a variant interface, how exposure is controlled, what gets measured, and what "it worked" can honestly mean at our scale.

---

Tally — you're on this one. Read your role prompt and the shared context first.

**The decision this serves.** On both products I want customers to try interface variants before they become the interface — a DealReady investor testing a new diligence view on a real deal room, a Fybr surveyor testing a new measurement flow on a real site — and I want to read whether the variant worked without lying to myself about significance. I need the mechanics (branches, previews, flags, cohorts) and the measurement discipline (what to instrument, what the numbers can say at seed scale) decided together, because every team I've seen decide them separately ends up with a preview URL nobody measured or a dashboard nobody trusts.

**What I already hold.** PostHog is the working assumption for flags, replays, funnels, and experiments (1M events/mo free); Statsig went to OpenAI then Amplitude in 2026; the textbook's stance is "at seed traffic, rely on flags plus qualitative observation rather than pretend-significant A/B tests" and "pair every number with a replay or a conversation." Stack is TypeScript, likely Next.js on Vercel-style preview deployments. Verify any of that you rely on.

**The ask.**

1. The mechanics of letting a named customer test a variant, laid out as options with their costs: preview deployments per branch (Vercel-style, with auth and data implications), feature flags with per-user or per-account targeting, cohort-gated rollouts, and a "labs" or "beta" opt-in surface inside the product. For each: how the customer gets in, how their data is protected (a diligence deal room is confidential; a survey site is a client's), how they get out, and what it costs to run.
2. Where the variant's data comes from — production data behind a flag versus a staging environment with seeded data — and the trust and safety consequences of each for DealReady specifically. Say which you'd choose and why.
3. The measurement discipline: what an event plan for a variant test looks like (events, properties, the primary metric, guardrails, exposure logging), how exposure is recorded so the readout can say who saw what, and what the pre-registered success condition looks like when the honest answer is "we'll never reach significance in this window." Give the qualitative pairing plan — replays, five conversations, a support pattern — that replaces the p-value at our scale.
4. When a real experiment *is* possible: the traffic and effect-size thresholds where an A/B test starts to mean something, the minimum window, and how to set it up in PostHog (or name the better tool with evidence). Include how to avoid the classic small-n failures — peeking, Tuesday effects, segment mix shifts, definition drift.
5. The operating procedure: a one-page runbook from "we have a variant" to "we shipped or killed it," with owners, artifacts (the brief's event plan, the flag config, the readout), and the two questions every readout must answer — what moved, and what this scale cannot tell us.

**Evidence rules.** PostHog's and Vercel's own docs are primary and dated. Practitioner accounts of small-n experimentation are secondary and named. Anything about pricing or limits is dated. Where a mechanism depends on our stack and you don't know it, label the assumption and route the question to engineering.

**Output shape.** Verdict; the mechanics comparison as a table with a recommendation per product; the data-source ruling; the measurement section with a sample event plan for one real feature (pick DealReady's "time to first trusted insight" flow); the experiment thresholds; the runbook; sources with dates. Run your definition, pre-registration, plausibility, and pairing tests and say what you found.

**Done means** engineering can build the exposure path from your report without a call, and I can write the first variant's brief with its event plan and success condition tonight.

**Not wanted:** a lecture on statistical power without the "so at our scale, do this instead" paragraph; a tool tour; or a runbook that assumes traffic we don't have.
