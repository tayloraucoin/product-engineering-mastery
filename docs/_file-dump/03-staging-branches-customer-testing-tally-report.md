# Customer variant testing and honest A/B at seed scale

**Role:** Tally (Metrics Analyst) · **Prompt:** 03 · **Date:** 2026-09-30 · **Products:** DealReady (Viewpoint.AI), Fybr self-serve

Labels used throughout: **[verified YYYY-MM-DD]** = primary source read on that date · **[secondary: who]** = named practitioner or press · **[judgment]** = mine · **[ASSUMPTION: ...]** = stack or scale fact I don't have, routed at the end · **[PROPOSED — needs sign-off]** = a definition you have to approve before it counts.

---

## 1. Verdict

1. **Neither product can run an A/B test that means anything this quarter. Don't build for one.** The unit that matters for DealReady is the deal room, not the user. Even an effect large enough to double a conversion needs about 38 deal rooms per arm, and a 50 percent relative lift needs about 96 per arm (PostHog's own formula, section 5). Design-partner scale is single-digit to low-double-digit rooms. [ASSUMPTION: under 20 active deal rooms, and under 20 Fybr sites, in any 4-week window.]
2. **The mechanism is one PostHog feature flag per variant, running on production and targeted at named accounts.** The customer tests the variant inside their real product, with their real data, under their normal login. Getting in and getting out are both a flag condition you edit. No new URL exists that could be forwarded.
3. **Preview deployments are for the team, never for customers with real data.** They're for internal critique (Assay, Plumb), run on seeded data behind Vercel Authentication. A preview URL connected to production data is a confidential deal room sitting on a link that can be forwarded.
4. **For DealReady, the variant reads production data behind the flag. Never a staging copy of a deal room.** Every copy of a data room is one more place a confidentiality breach can come from. It also can't test the thing being measured, which is trust in real claims about a real company.
5. **"It worked" means a pre-registered decision rule plus full qualitative coverage, not a p-value.** At this scale you can watch every exposed session. So the readout pairs each number with the replays and five conversations and states which result would have killed the variant. Inconclusive is a legitimate outcome and gets recorded as one.
6. **Tooling stays PostHog, on pay-as-you-go with billing limits.** The reason isn't paid usage. The free plan keeps recordings for only 1 month and allows only 1 project. Pay-as-you-go keeps the same free allowances, keeps recordings for 90 days, and allows 6 projects [verified 2026-09-30]. A readout log that links replays needs them to still exist next month. Don't buy group analytics yet (section 3.4).

---

## 2. Mechanics: four ways a named customer gets a variant

Prices and limits are as read on 2026-09-30.

| | **A. Preview deployment per branch** | **B. Flag, named-account targeting (production)** | **C. Cohort-gated rollout (production)** | **D. Labs / beta opt-in surface** |
|---|---|---|---|---|
| **How the customer gets in** | You send a URL. With Vercel Authentication (on by default for new projects since 2023-11-02 [verified]), they need a Vercel account with access to the deployment. Otherwise you use a Shareable Link (query-string access, "Anyone with the link"; Hobby allows one link per account in total) [verified, docs updated 2026-08-28], or Password Protection. | You add their `org_id` (or email) to the flag's release condition. They see the variant on their next page load. Nothing to click. | Same as B, but the condition is a cohort (for example, a static "design partners" cohort) or a percentage of one. | They toggle it on in a Labs panel. PostHog Early Access Features creates the linked flag and adds an enrollment condition when they opt in [verified 2026-09-30]. |
| **How their data is protected** | Worst of the four. The preview has its own env vars: pointed at production, confidential data sits on a forwardable URL; pointed at staging, it's seeded data and tests nothing real. | The same auth, tenant isolation and authorization as production. The variant is a code path inside the existing app. | Same as B. | Same as B. Opting in never widens data access. |
| **How they get out** | Revoke the link: set Share to "Only people with access" and remove individually shared users [verified]. The deployment keeps existing. | Remove the condition, or turn the flag off. Takes effect on next evaluation. | Remove them from the cohort, or set the rollout to 0. | They toggle it off. You can also move the feature to Draft or Concept, which removes the enrollment condition from the flag [verified]. |
| **Exposure logging** | Nothing by default. The events you get are from a different deployment and need an environment property, or a separate PostHog project. | Automatic `$feature_flag_called` [verified]. Add a custom exposure event at the moment the variant renders (section 4.3). | Same as B. | Same as B, plus the enrollment state. |
| **Run cost** | Password Protection is $20/mo per protected project on Pro and not available on Hobby. Vercel Authentication and Shareable Links carry no add-on charge [verified, docs updated 2026-09-15]. Vercel seat pricing not re-verified. | Flag requests: 1M/mo free; experiments are billed with flags [verified]. No infrastructure. | Same as B. | Same as B, plus building the Labs panel (a few `getEarlyAccessFeatures` / `updateEarlyAccessFeatureEnrollment` calls) or enabling the prebuilt widget (`opt_in_site_apps: true`) [verified]. |
| **Measurement problem** | You can't compare against anything, because nobody on production is on the preview. | None structural. Assignment isn't random, so the readout compares within an account (section 4.4). | Percentage rollouts become randomization later, once scale allows. | **Self-selection.** Opt-ins are enthusiasts, so their numbers are not comparable to non-opt-ins. Also JS web SDK only, and **no support for Groups** [verified]. |
| **Gotcha** | Deployment Protection requires authentication for every request, including Routing Middleware [verified]. Server-to-server fetches using `VERCEL_URL` break under protection. | Flags must be evaluated after `identify()`. Bootstrap them server-side to avoid flicker (section 4.3). | Cohorts can't be built from groups [verified]. | An opt-in or opt-out **overrides every other release condition** on the flag [verified]. So "roll back for everyone except X" does not work while opt-ins exist. Turn the flag off instead. |

### Recommendation per product

| Product | Now (design partners) | When there are more than 10 active accounts | Never |
|---|---|---|---|
| **DealReady** | **B.** One flag per variant, with the condition `org_id in [named orgs]`. Tell each partner in writing that they're on a variant and that sessions are recorded with content masked. | **D** as the standing Labs surface for concept or beta interest, with **C** percentage rollouts behind it. Labs results are read as "what enthusiasts do", never as a causal lift. | **A** with production data. |
| **Fybr** | **B** for design-partner sites, plus a correctness guardrail (section 4.6). **A** is fine for prospect demos on a seeded demo site. | **C.** A Labs surface suits surveyors less than investors [judgment]: field users won't go looking for settings. | **A** with a client's site data. |

---

## 3. Where the variant's data comes from: the ruling

### 3.1 Ruling for DealReady: production data behind a flag

The variant runs in production, reads the customer's real deal room, and uses the same authorization path. Four reasons:

1. **The metric requires it.** Time to first trusted insight measures trust in claims about a real company the investor knows. On seeded data the investor has no stake and no prior knowledge to check claims against. A seeded run measures how fast someone clicks, not trust. [judgment]
2. **Every copy of a deal room is another way to breach confidentiality.** A staging copy means another database, another set of credentials, another backup, and possibly another region. It likely also breaches the terms the founder shared the room under. [judgment; the contract terms are unverified, routed to Kurt]
3. **Preview deployments inherit whatever environment variables you give them.** If any preview environment currently points at the production database, that's a live exposure regardless of this decision. [ASSUMPTION: unknown. Engineering checks this week.]
4. **The flag path costs nothing in isolation.** Tenant isolation is already the thing production has to get right, and the variant is just a different view over the same authorized query.

### 3.2 Where staging with seeded data is the right call

| Use | Why seeded data is right here |
|---|---|
| Assay/UI Critic screenshots, and every state in `states.md` | You need empty, error and 500-document states on demand. Real rooms don't provide them. |
| Instrumentation QA (runbook step 4) | Events can be fired and checked without touching a customer. |
| Prospect demos (no deal room yet) | There is nothing real to show. |
| **Variants that change what the model writes** (new extraction model, new claim schema) | Don't run these as a user-facing variant. Run them in **shadow mode** on production: compute both outputs, keep the current one as the record, write the new one to separate tables, and compare offline. A variant must never change the record an investor has already verified. [judgment] |

### 3.3 The Fybr equivalent

Same ruling: the variant runs on production behind a flag. Survey sites are the client's data. One difference: a Fybr variant that changes a **computed volume** changes a number the client may report as inventory. Any variant touching the computation runs side by side, with the old result authoritative, until the difference sits inside a tolerance Karl signs off (section 4.6).

### 3.4 Why not group analytics yet

PostHog flags can target a whole organization as a group. But group analytics is a **paid add-on**, and once enabled it bills **all identified events**, not only grouped ones. It also caps you at 5 group types [verified 2026-09-30; the add-on price wasn't readable from the pricing page, so not found].

A person property does the same targeting for free: set `org_id` on `identify()` and target on it. What you give up is randomizing at org level, and you aren't randomizing yet. Revisit when a C-style percentage rollout across organizations is planned. [judgment]

---

## 4. Measurement discipline

### 4.1 The metric: Time to first trusted insight (TTFTI), v0.1 [PROPOSED — needs sign-off]

| Field | Definition |
|---|---|
| **Meaning** | How long it takes, after a deal room's documents become analyzable, for the investor to first confirm an AI claim **after checking its source**. |
| **Formula (primary)** | Per deal room: `t(first insight_verified where source_opened_before = true) − t(first data_room_ingest_completed)`. Report the **median across deal rooms**. |
| **Formula (companion, always reported alongside)** | **Reach rate** = deal rooms with a trusted insight within 7 days of ingest ÷ deal rooms with ingest completed in the window. |
| **Why two numbers** | A median over rooms that reached trust hides rooms that never did. A variant can "improve" the median by losing its slow rooms. Neither number travels without the other. |
| **Denominator** | Deal rooms whose ingest completed inside the window. Excludes internal orgs, demo rooms and test accounts (PostHog test-account filter on). |
| **Segment** | Org, deal stage (Series A vs B+), sector, first deal room for this investor vs later, variant. |
| **Window** | 7 days from ingest. Rooms still short of trust at day 7 are censored and counted as not reached. |
| **Direction** | TTFTI down is better. Reach rate up is better. |
| **Version** | v0.1, 2026-09-30. Changes only through a logged amendment that keeps both series. |
| **Dependency** | [ASSUMPTION: the diligence view has an explicit trust action, such as verify, pin, or add to memo.] If it doesn't, the metric can't be measured, and adding that action is a product decision to make before build. The fallback proxy is `insight_exported`, which is weaker and would be labeled as such. |

### 4.2 Sample event plan: DealReady diligence view v2

Event grammar: `object_action`, snake_case, past tense. [ASSUMPTION: no existing taxonomy. This becomes v0.1 of it.]

| Event | Trigger | Properties | Feeds | Owner |
|---|---|---|---|---|
| `data_room_ingest_completed` | Server, when the last document in the initial batch finishes processing | `deal_room_id`, `org_id`, `document_count`, `ingest_duration_ms`, `failed_document_count` | TTFTI start, reach denominator, ingest-failure guardrail | Eng (backend) |
| `diligence_view_viewed` | Client, when the diligence view mounts with data (**this is the exposure event**) | `deal_room_id`, `org_id`, `$feature/dealready-diligence-view-v2` (= `control` / `test`), `insight_count` | Exposure | Eng (frontend) |
| `diligence_view_rendered` | Client, on first contentful render of the insight list | `deal_room_id`, `render_ms`, `insight_count` | Latency guardrail | Eng (frontend) |
| `insight_viewed` | Client, when an insight is expanded or focused | `deal_room_id`, `insight_id`, `claim_type`, `model_version`, `citation_count` | Diagnostic only | Eng (frontend) |
| `insight_source_opened` | Client, when the investor opens a claim's cited source | `deal_room_id`, `insight_id`, `source_document_id`, `open_method` (`click` / `keyboard`) | `source_opened_before` flag on the next event | Eng (frontend) |
| `insight_verified` | Client, on the explicit trust action | `deal_room_id`, `insight_id`, `claim_type`, `model_version`, `source_opened_before` (bool), `seconds_since_ingest` | **TTFTI** and the blind-acceptance guardrail | Eng (frontend) |
| `insight_flagged_incorrect` | Client, when the investor marks a claim wrong | `deal_room_id`, `insight_id`, `claim_type`, `model_version`, `reason` (enum) | Correction guardrail | Eng (frontend) |
| `$exception` | Automatic (PostHog error tracking) | as captured | Error guardrail | Eng |

**Property hygiene (confidentiality rule).** Opaque IDs only. Never put a company name, document title, claim text or file name in any event property. The analytics store must be safe to breach. [judgment]

### 4.3 The exposure path: what engineering builds (no call needed)

1. **Flag.** Key `dealready-diligence-view-v2`, multivariate (`control`, `test`), release condition: person property `org_id` is one of `[named org ids]`. Everyone else gets `control`.
2. **Set `org_id` as a person property on `identify()`,** and call `identify()` **before** any flag is evaluated. PostHog's SRM guidance names flag-before-identify as a cause of skew [verified]. Enable flag persistence across authentication steps if any flag is read pre-login.
3. **Evaluate server-side in Next.js and bootstrap the client** with those values and the same distinct ID. Otherwise the view flickers from control to test on load. The distinct ID and person properties must match between server and client [verified].
4. **Set `advanced_feature_flags_dedup_per_session: true` in `posthog.init`.** The web SDK deduplicates `$feature_flag_called` per identity across sessions by default, so a returning user who checked the flag before launch may never show as exposed [verified].
5. **Fire `diligence_view_viewed` with `$feature/dealready-diligence-view-v2`** when the view actually mounts. In the experiment's exposure criteria, choose **Custom event → `diligence_view_viewed`** ("Include people when"). Someone who loaded the app but never opened the view isn't exposed. Custom exposure events **must** carry the `$feature/<flag-key>` property [verified].
6. **Handle multiple exposures with "Exclude from analysis"** (PostHog's recommended setting) [verified].
7. **Turn the test-account filter on,** and put Viewpoint's own org and demo orgs in it. At n=10, Taylor's own sessions would be the biggest segment.
8. **Replay masking.** On the web, inputs are masked by default but **text is not** [verified]. Set:
   ```ts
   session_recording: {
     maskAllInputs: true,
     maskTextSelector: "*",
     maskTextFn: (text, el) => el?.dataset?.record === "true" ? text : "*".repeat(text.trim().length),
     maskCapturedNetworkRequestFn: (r) => { if (r.name) r.name = r.name.split("?")[0]; return r },
   }
   ```
   Add `data-record="true"` only to UI chrome (labels, buttons, headings of the view itself). Add `ph-no-capture` to the document viewer pane. Masking runs in the browser, so masked data never leaves it [verified]. Because of the `maskTextFn` above, nothing marked `data-record` may contain deal-room content.
9. **Preview and staging.** Either don't load PostHog there, or send those events to a separate PostHog project. Pay-as-you-go allows 6 projects; the free plan allows 1 [verified].

### 4.4 The pre-registered success condition when significance is out of reach

Written into the brief before the flag flips. This is the template filled for diligence view v2; the brackets are yours to set.

> **Hypothesis.** Showing each claim's source excerpt inline (v2) cuts the time to the first trusted insight, without raising the number of claims accepted unchecked.
> **Cohort and window.** Named orgs [A, B, C]. All deal rooms ingested from [start date] for **two full weeks** (14 days, Monday to Sunday twice).
> **Comparison.** Within each org: v2 rooms against that org's own rooms from the prior 4 weeks on v1. If no prior rooms exist, this run establishes the baseline and **cannot** be graded as a win. Record it that way.
> **Ship if all hold:**
> 1. Reach rate is at least the org's baseline, and median TTFTI is lower, in at least 2 of 3 orgs.
> 2. The blind-acceptance rate (`insight_verified` with `source_opened_before = false`, divided by all `insight_verified`) is not higher than baseline, and replay review finds **zero** verified-but-incorrect claims caused by the new UI.
> 3. In at least 4 of 5 debrief conversations, the investor can say where a claim they trusted came from, without prompting.
> 4. No guardrail breach (section 4.5).
>
> **Kill immediately if:** one verified-but-incorrect claim is traced to the v2 layout; or the error rate in the view doubles against v1; or 2 or more of the 5 conversations report trusting the product less.
> **Otherwise:** iterate. Inconclusive is recorded as inconclusive, never as "trending positive."

**What this rule can honestly claim.** "In these three firms, over these two weeks, v2 did not break trust and looked faster, and here is what we watched." It cannot claim a lift estimate. For scale: 4 of 6 rooms reaching trust has a 95 percent interval of roughly **30 to 90 percent**. 5 of 5 is still only **57 to 100 percent** (Wilson intervals, computed). Readouts state the interval next to the count so nobody rounds 4 of 6 up to "67 percent."

**Known confounders, named now so they can be checked later:**
- **Learning effect.** An investor's second deal room is faster regardless of UI. Compare first-room-to-first-room where possible, and segment on first room vs later.
- **Deal size.** A 30-document room isn't a 400-document room. Report `document_count` beside every time.
- **Model version.** A model change mid-window invalidates the window. `model_version` is on every insight event for this reason.
- **Facilitation.** A room Taylor walked the investor through is tagged and reported separately.

### 4.5 Guardrails (read in every readout)

| Guardrail | Definition | Breach |
|---|---|---|
| Blind acceptance | `insight_verified` with `source_opened_before = false` ÷ all `insight_verified`, per room | Rises above the v1 baseline |
| Correction rate | `insight_flagged_incorrect` ÷ `insight_viewed`, per room | Doubles against v1 (read with replays: a rise can mean the investor is looking harder, which is good) |
| Errors | `$exception` in the view ÷ `diligence_view_viewed` | Doubles against v1 |
| Latency | p75 `render_ms` | Above [2,000] ms, or 30 percent worse than v1 |
| Support | Messages to Taylor or Kurt about the view, logged by hand in the readout | Any message reporting confusion about where a claim came from |

### 4.6 The qualitative pairing plan (what replaces the p-value)

| Signal | Rule | Owner |
|---|---|---|
| **Replays** | Watch **every** exposed session within 48 hours; at this scale that's possible, so do it. Log each as one line: room, time to first trusted insight, where they stalled, whether they opened sources, and anything surprising. Link the replay; that's why 90-day retention matters. | Taylor |
| **Five conversations** | 20 minutes each, story-based ("walk me through the last claim you trusted and how you knew"), inside the window's second week. At most 2 per org. | Taylor |
| **Support pattern** | Every inbound mention of the view goes into the readout's log, verbatim. | Taylor, Kurt |
| **Fybr addendum** | Replays **won't show the map**. Canvas and WebGL aren't captured by default and aren't covered by DOM masking; if enabled they record at 4 fps [verified]. So for Fybr, pair the replays (which show the panels around the map) with a live screen-share or ride-along. Add a **correctness guardrail**: the variant's computed volume against the authoritative computation, with the difference inside Karl's tolerance, checked on every measurement. | Taylor; Karl signs off the tolerance |

For Fybr, the metric that matters (self-serve time-to-first-measurement, and trial-to-paid) gets the same treatment: a v0.1 definition in the Fybr brief, measured from site created to first measurement exported. Trial-to-paid can't be read in a two-week window at all (section 5), so it's a quarterly number only.

---

## 5. When a real experiment becomes possible

### 5.1 The arithmetic

PostHog sizes experiments with `N per variant = 16 × variance / d²`, at 80 percent power and 95 percent confidence, where for a conversion metric variance = p(1−p) and d = MDE × baseline. The default MDE is 30 percent [verified 2026-09-30]. Their worked example (10 percent baseline, 20 percent MDE, 3,600 per variant) reproduces exactly with the script used for this table.

| Scenario | Unit | Baseline | Relative MDE | Per arm | Total |
|---|---|---|---|---|---|
| DealReady reach rate | deal room | 40% | 30% | 267 | 534 |
| DealReady reach rate | deal room | 40% | 50% | 96 | 192 |
| DealReady reach rate doubles | deal room | 30% | 100% | 38 | 76 |
| Fybr trial-to-paid | trial account | 15% | 30% | 1,008 | 2,016 |
| Fybr first measurement within the trial | trial account | 50% | 30% | 178 | 356 |

[ASSUMPTION: the baselines are placeholders. Replace them with the first 4 weeks of real data.]

### 5.2 The thresholds

A controlled experiment starts to mean something when **all four** of these hold [judgment built on the sources cited]:

1. **Units in the window ≥ the table's per-arm N at an MDE you'd act on (50 percent or less), inside 6 weeks.** For DealReady that's roughly 100 or more new deal rooms per arm in 6 weeks. For Fybr it's hundreds of trial starts.
2. **At least 100 exposures.** Below that, PostHog's own validity checks don't run. SRM detection needs at least 100 total exposures, and automatic running-time estimates need 1 day plus 100 exposures [verified].
3. **Whole weeks, at least 2.** This is the "Tuesday" failure: day-of-week mix moves B2B behavior. Kohavi's typical cycle is about two weeks at 50 percent exposure [secondary: AB Tasty interview with Ronny Kohavi].
4. **The practitioner floor.** Kohavi et al.'s guidance for startups is "at least thousands of active users", and then only for the larger effects startups chase [verified: KDD 2013 paper]. In later interviews he puts the practical start at tens of thousands of users, and puts detecting about 5 percent effects at about 200,000 [secondary: AB Tasty; Medium summary of a Kohavi talk].

**So at our scale, do this instead:** named-account flags, a pre-registered decision rule, full replay coverage, five conversations. Recheck the thresholds once a quarter in the readout. The first product likely to cross them is Fybr's trial funnel, not anything in DealReady. [judgment]

### 5.3 Setting it up in PostHog when you do cross them

1. Create the experiment; this creates its flag. Participant type is **Persons**. Choose a **group** type (paid add-on) only if the change affects the whole org (group tests are the right design when one user's change affects coworkers, at much lower power [secondary: PostHog blog, 2023-04-28]).
2. Exposure criteria: the custom view event (section 4.3), test accounts filtered, multiple exposures excluded.
3. Primary metric: one funnel metric; guardrails as secondary metrics.
4. Set the MDE and read the running-time calculator **before** launch (manual mode for drafts) [verified].
5. **Pick the stopping rule in advance.** Fixed horizon: no reading the primary metric until the date. Or, if you will look, choose frequentist **with sequential testing**, which PostHog describes as giving always-valid p-values bounded by alpha however often you check [verified: PostHog best-practices doc]. Treat Bayesian as no license to peek [judgment].
6. Watch the SRM indicator (chi-squared, p < 0.001) [verified]. If it fires, stop and fix the wiring before reading any result.

**Better tool?** No. Statsig (acquired by OpenAI in 2025 for $1.1B; in May 2026 Amplitude took over its brand, customers and platform while the team stayed at OpenAI [secondary: MarTech, Convert, both May 2026; Amplitude's own announcement not read]) is strongest in warehouse-native, high-volume statistics. That's irrelevant below the thresholds above. PostHog keeps events, flags, replays and experiments in one place, and pairing is the job here.

### 5.4 The classic small-n failures and the guard for each

| Failure | Guard |
|---|---|
| **Peeking** (stop the moment it looks significant). In Miller's example, stopping at 5 percent significance or after 150 observations produced false positives **26.1 percent** of the time [secondary: Evan Miller, 2010]. | Fixed window in the brief. Guardrails may kill early; the primary metric is not read until the end. Sequential testing if you must look. |
| **Tuesday effect** | Whole weeks only. Report day-of-week if the window is short. |
| **Segment mix shift** | Named-account targeting guarantees one, so compare within an org, never pooled across orgs. Report `document_count`, stage and first-room status beside every number. |
| **Definition drift** | Freeze the metric version for the window. Any change is a logged amendment and both series are kept. `model_version` is on every insight event. |
| **Internal traffic** | Test-account filter on from day one. At n=10 it's the biggest single contaminant. |
| **Silent exposure loss** | `advanced_feature_flags_dedup_per_session: true`, identify before evaluating, bootstrap flags [verified]. |

---

## 6. Runbook: from "we have a variant" to "shipped or killed"

| # | Step | Owner | Artifact | Gate to next step |
|---|---|---|---|---|
| 1 | **Brief.** Hypothesis, the user, the metric (with its version), event plan, guardrails, cohort, window, success rule, kill rule, and "what this scale can't tell us." | Taylor writes; Tally drafts the measurement sections | `/specs/<feature>/brief.md` | The success and kill rules are written **before** any code. |
| 2 | **Plausibility call.** Experiment or flagged trial? Run the section 5.2 test. | Tally | One line in the brief: "Flagged trial: N≈[x] rooms in window; a controlled test needs [y]." | Decision recorded. |
| 3 | **Build.** Variant behind the flag; events as specified; exposure event; masking; test-account filter. | Eng (DealReady: Marco/Taras; Fybr: Taylor, with Karl on system design) | PR with the event-plan checklist ticked; flag config (below) | The PR links the brief. |
| 4 | **Instrumentation QA** on staging with seeded data: every event arrives with its properties (Live events view), exposure fires once per session, and one replay is watched to confirm no deal-room text is visible. | Eng runs; Tally signs off | QA note in the PR | **No customer exposure until this passes.** |
| 5 | **Internal critique** on a protected preview or staging. | Assay/Plumb, Taylor | Critique notes | Fixes merged. |
| 6 | **Open to named customers.** Add orgs to the flag; tell them in writing (variant, window, masked recording, how to opt out); book debriefs. | Taylor | Flag config updated; consent line sent | Rollback trigger written in the flag description. |
| 7 | **Run the window.** Check guardrails daily (these may kill early). Don't read the primary metric. Watch every replay within 48 hours. Hold five conversations in week 2. | Taylor | Replay log; conversation notes | Window closes on the pre-set date. |
| 8 | **Readout.** Tally drafts, Taylor interprets. | Tally, Taylor | Entry in the running readout log | Answers the two questions below. |
| 9 | **Decide and clean up.** Ship: move to 100 percent, then **remove the flag and dead code within 2 weeks**. Kill: flag off, code removed. Iterate: new brief, new flag version (`-v3`). Record the outcome against the pre-registered rule. | Taylor decides (with Kurt for DealReady, Mike for Fybr) | Outcome line in the brief and the log | Flag removed or archived. |

**The flag config artifact** (written in the flag's description field and mirrored in the brief):

```
flag: dealready-diligence-view-v2 | variants: control, test
target: person.org_id in [..] | everyone else: control
exposure: diligence_view_viewed (custom), test accounts filtered, multi-exposure excluded
window: YYYY-MM-DD to YYYY-MM-DD (14 days)
rollback trigger: any verified-incorrect claim traced to v2 | $exception rate x2 | p75 render_ms > 2000
brief: /specs/diligence-view-v2/brief.md | metric: TTFTI v0.1
```

**Every readout answers two questions, in this order:**
1. **What moved?** Each number with its count, denominator, segment and interval, and the replay or quote that explains it. A movement without a why is reported as unexplained, not as a finding.
2. **What can't this scale tell us?** Two to four lines, each paired with the cheapest way to find out (another window, five more rooms, a new event, a ride-along).

If nothing moved, the readout says so in two lines and stops.

---

## 7. Routed to engineering and others (stack facts I don't have)

| Question | Why it matters | To |
|---|---|---|
| Does any Vercel preview environment currently point at the production database? | If yes, that's a live confidentiality exposure now, independent of this work. | DealReady eng (Marco/Taras), **this week** |
| Where does `org_id` live, and is it available at `identify()`? Which auth provider? | Targeting rule and exposure path, steps 1–2. | DealReady eng |
| Is the diligence view server-rendered (App Router, server components)? | Bootstrapping approach, step 3. | DealReady eng |
| Does an explicit trust action (verify / pin / add to memo) exist? | TTFTI can't be measured without one. | Taylor (product decision), then eng |
| PostHog region (US Virginia or EU Frankfurt [verified options]) vs. what design-partner agreements say about data location | Replays and events leave the app, even masked. | Kurt / counsel |
| Recording-consent language for design partners | Masked replay is still recording. Say so up front. | Kurt |
| A reverse proxy for PostHog | PostHog says ad blockers can cut capture, and a proxy typically raises event capture by 10–30 percent [verified]. At n=10, losing one investor's events is losing 10 percent of the sample. | Eng |
| Fybr volume tolerance for side-by-side computation | Correctness guardrail. | Karl |

---

## 8. Convergence tests

| Test | Result |
|---|---|
| **Definition** | Pass for TTFTI v0.1: formula, events, denominator, segment, window and direction are all present. It's marked PROPOSED and depends on the trust-action assumption. Fybr's metric is named, but its definition belongs in the Fybr brief. **Partial.** |
| **Pre-registration** | Pass as a template. It only counts once the brackets are filled and dated before the flag flips. |
| **Denominator** | Pass. Every figure in this report carries its base. Placeholder baselines are labeled as assumptions. |
| **Plausibility** | Pass, and it's the headline: at design-partner scale, no window answers a lift question. The plan says what it does instead. |
| **Confounder** | Pass. Learning effect, deal size, model version, facilitation, day-of-week, mix shift and internal traffic are all named in advance. |
| **Pairing** | Pass by design: every exposed session watched, five conversations, the support log. For Fybr, the map isn't replayable, so the screen-share is mandatory rather than optional. |
| **Guardrail** | Pass. Five guardrails with breach levels, plus Fybr's correctness guardrail. |
| **Segment** | Pass. Within-org comparison; first room vs later; stage; document count. |
| **Staleness** | Pass. Metric v0.1 dated 2026-09-30; every vendor fact is dated. |
| **Two-lines** | Built into the readout rule. |

**Assumptions in force:** under 20 active deal rooms or sites in any 4-week window · no existing event taxonomy · Next.js on Vercel · the diligence view has, or will get, an explicit trust action · placeholder baselines (40 percent reach; Fybr 15 and 50 percent) until 4 weeks of real data exist.

---

## Sources

**Primary (read 2026-09-30)**
- [PostHog pricing](https://posthog.com/pricing): free allowances, free vs pay-as-you-go projects and retention, US/EU regions.
- [PostHog: Early access feature management](https://posthog.com/docs/feature-flags/early-access-feature-management): stages, override behavior, JS-only, no Groups.
- [PostHog: Group analytics](https://posthog.com/docs/product-analytics/group-analytics): paid add-on, billing on all identified events, 5 group types.
- [PostHog: Experiment exposures](https://posthog.com/docs/experiments/exposures): `$feature_flag_called`, custom exposure, dedup setting, multiple-exposure handling, SRM at 100 exposures and p < 0.001.
- [PostHog: Running time and sample size](https://posthog.com/docs/experiments/sample-size-running-time): formula, 30 percent default MDE, 1 day plus 100 exposures.
- [PostHog: Experiments best practices](https://posthog.com/docs/experiments/best-practices): peeking, sequential testing.
- [PostHog: Session replay privacy controls](https://posthog.com/docs/session-replay/privacy): masking defaults and config.
- [PostHog: Canvas recording](https://posthog.com/docs/session-replay/canvas-recording): off by default, not DOM-masked, 4 fps.
- [PostHog: Bootstrap feature flags](https://posthog.com/docs/feature-flags/bootstrapping): flicker, server-to-client distinct ID matching.
- [Vercel: Deployment Protection](https://vercel.com/docs/deployment-protection) (docs updated 2026-09-15): methods, plans, Password Protection pricing.
- [Vercel: Sharable Links](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links) (docs updated 2026-08-28).
- [Vercel changelog: Deployment Protection on by default](https://vercel.com/changelog/deployment-protection-is-now-enabled-by-default-for-new-projects) (2023-11-02).
- [Kohavi et al., "Online Controlled Experiments at Large Scale," KDD 2013](https://www.exp-platform.com/Documents/2013%20controlledExperimentsAtScale.pdf).

**Secondary (named)**
- [Evan Miller, "How Not To Run an A/B Test"](https://www.evanmiller.org/how-not-to-run-an-ab-test.html) (2010-04-18).
- [AB Tasty, 1,000 Experiments Club interview with Ronny Kohavi](https://www.abtasty.com/blog/1000-experiments-club-ronny-kohavi/).
- [Medium summary of Ronny Kohavi on A/B testing](https://medium.com/@shenjiejie2017/lessons-from-ronny-kohavi-on-a-b-testing-039aabed6543).
- [PostHog blog, "When and how to run group-targeted A/B tests"](https://posthog.com/product-engineers/running-group-targeted-ab-tests) (2023-04-28).
- [MarTech, "Amplitude and Statsig deal raises questions for customers"](https://martech.org/amplitude-and-statsig-deal-raises-questions-for-customers/) (May 2026).
- [Convert, "Statsig moves to Amplitude"](https://www.convert.com/blog/a-b-testing/statsig-moves-to-amplitude/) (May 2026).

**Not found:** the price of PostHog's group analytics add-on (the pricing calculator didn't render) · current Vercel Pro seat price (not re-verified) · Amplitude's own announcement of the Statsig takeover (only press coverage read).
