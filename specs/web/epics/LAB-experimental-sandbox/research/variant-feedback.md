# Client Design Reviews: A Standard Question Set, Variant-Bias Controls, and the Comments/Form Split

**Bottom line:** Use five standard closing questions in every review: goal fit on an item-specific 5-point scale, an explicit invitation to name blockers, triage of the reviewer's own pins, a gap check, and a forced-choice decision state. For multi-variant reviews, add a per-variant rating that must be completed before a preference question unlocks, then the preference with "none / combine / no preference" options, then strength and reasons. Showing alternatives is itself the best-evidenced debiasing step, because one design shown alone gets inflated ratings and fewer criticisms.\[1\] Randomising the first variant only spreads order bias fairly across variants; it does not remove it for an individual client.\[2\]

## TL;DR

- **Standard core (every review, identical wording):** goal fit (5-point, item-specific anchors), "what would stop you approving this as it stands?" (free text), triage of the reviewer's own pins (must / should / fine either way, plus "most important"), "anything missing?" (free text), and next step (forced choice). Only the goal text shown with Q1 and at most one targeted question are review-specific. [JUDGMENT, format choices backed by Saris et al. 2010 and Tohidi et al. 2006, VERIFIED]
- **Variants:** first rate each variant on the same goal-fit scale, then ask the forced-choice preference (including "combine", "none of these" and "no preference"), then strength, then "why", then "what would you carry over from the other(s)?" Showing three designs instead of one lowered ratings and cut positive comments significantly (Tohidi et al., CHI 2006) [VERIFIED].\[1\] Order effects in sequential choice are large. In Mantonakis et al. 2009 (Psychological Science; participants unknowingly tasted the same wine 2–5 times), "the first wine was chosen with approximately .70 probability in the two-option sets", against .50 by chance [VERIFIED]. And "randomization cannot reduce potential order effects, but it does give candidates an equal chance" of the favoured positions (Bruine de Bruin 2005) [VERIFIED].\[2\]
- **Comments vs form:** pins hold located, one-issue-per-pin problems and questions. The form holds the overall judgment, priorities, preference and sign-off, and plays the reviewer's own pins back for triage instead of asking them to recall or retype. Cued retrospective reporting draws out more information than uncued recall (van Gog et al. 2005) [VERIFIED, adjacent task].\[3\] No study of client design reviews with toggled variants was found.

## Key Findings

1. **A design shown on its own gets inflated praise.** Tohidi, Buxton, Baecker & Sellen (CHI 2006, doi 10.1145/1124772.1124960) ran 48 participants. A design seen alone scored higher than the same design seen among three (Circular 9.08 vs 8.13, p = .004; Linear 7.92 vs 6.89, p = .014; Tabular 8.83 vs 8.39, p = .064, on 10-point scales). Positive comments were significantly lower for every design when seen in a group of three. [VERIFIED]\[4\]
   - The authors attribute this to participants not wanting to disappoint the experimenter, after Wiklund et al.: subjects "don't want to hurt the feelings of the person conducting the test." [VERIFIED as their stated interpretation]\[4\]
   - For a paying client looking at the designer's own work, this pressure is plausibly stronger. [JUDGMENT]
2. **Users find problems; they don't design solutions.** The same paper found usability testing "is not an effective vehicle for soliciting constructive suggestions… It is a means to identify problems, not provide solutions." Participants who saw several designs did produce "borrowed" suggestions, taking ideas from one variant to another. [VERIFIED]\[4\]
   - Design implication: ask for problems and blockers, and ask "what would you carry over", not "how would you fix it". [JUDGMENT]
3. **Order effects in sequential evaluation are real, and randomisation does not remove them for an individual.**
   - Mantonakis, Rodero, Lesschaeve & Hastie (Psychological Science 2009, 20(11):1309–1312; n = 142; participants unknowingly tasted the same wine 2–5 times) found that "the first wine was chosen with approximately .70 probability in the two-option sets" (chance is .50). Among knowledgeable tasters there was also a recency effect: "the last wine was chosen with approximately .30 probability in the four-option and five-option sets." [VERIFIED]
   - Bruine de Bruin (Acta Psychologica 2005, 118:245–260) reports serial-position effects in jury evaluations and states that randomization does not reduce them; it only equalises each candidate's chance of a favoured position. [VERIFIED]\[2\]
4. **Item-specific scales beat agree/disagree.** Saris, Revilla, Krosnick & Shaeffer (Survey Research Methods 2010, doi 10.18148/srm/2010.v4i1.2682) document acquiescence bias in agree/disagree items, and their results "attest to the superiority of questions with IS response options." [VERIFIED]\[5\] So "How well does this meet…" with labelled degrees beats "I am satisfied with this design: agree/disagree". [JUDGMENT]
5. **Asking for reasons can shift preferences; asking after a choice invites rationalisation.**
   - Wilson & Schooler (JPSP 1991, 60(2):181–192, Study 1): students rated jams that Consumer Reports had ranked. Controls' preferences correlated .55 with the experts; for those asked to analyse their reasons, "the mean correlation in the reasons condition was significantly lower (M = .11), t(47) = 2.53, p = .02." [VERIFIED]
   - Mather, Shafir & Johnson (Psychological Science 2000, 11(2):132–138): when people remember past choices, they distort the options' features in favour of the one they chose. [VERIFIED]\[6\]
   - So collect the preference before the "why", treat the "why" as qualitative colour rather than as the cause of the choice, and capture per-variant judgments before the choice is made. [JUDGMENT]
6. **Practitioner guidance agrees.** Nielsen Norman Group (Megan Chan, "Testing Visual Design," 13 Dec 2024) advises: show 2–3 variations; differences must be "immediately detectable to a nondesigner"; overly similar versions cause the "query effect", where users make up answers; "counterbalance or randomize the order"; and numerical ratings need larger samples and quantitative analysis. [SECONDARY]\[7\]

## 1. Recommended question set

### 1a. Single-version standard core (closing form)

| # | Exact wording | Response format | Why this format | Decision it informs | Standard vs review-specific | Evidence label |
|---|---|---|---|---|---|---|
| Q1 | "How well does this design meet the goals below?" (2–3 goals from the brief shown above the question) | 5-point item-specific, every point labelled: Not at all well / Slightly well / Moderately well / Very well / Extremely well. Optional "Can't judge yet". | Item-specific labels avoid agree/disagree acquiescence. A labelled 5-point scale is easy for a single client. Report it as that one client's rating, never averaged into a score or trended as a KPI across clients. | Continue the direction vs rework it | Wording standard; goal text review-specific | Format: VERIFIED (Saris et al. 2010). Rest: JUDGMENT |
| Q2 | "What, if anything, would stop you approving this as it stands?" | Free text, plus a checkbox "Nothing — I'd approve it" | Explicitly invites a "no", which counters the politeness inflation Tohidi measured. The checkbox makes "no blockers" a deliberate claim rather than a blank. | The list of blockers for the next iteration | Standard | Rationale VERIFIED (Tohidi 2006, inflation); wording JUDGMENT |
| Q3 | "Here are the comments you left. For each, choose: Must change / Should change / Fine either way. Then pick the one that matters most." | Forced choice per pin (3 options) plus a single-select "most important"; pin text editable in place | Recognition from their own pins, not recall; no retyping; separates must-fix from nice-to-have | Priority order of change requests | Standard (content generated from pins) | Cueing benefit VERIFIED in an adjacent task (van Gog et al. 2005); structure JUDGMENT |
| Q4 | "Is anything missing that you expected to see?" | Free text, optional | Catches scope gaps that pins can't, because pins attach only to things that exist | Scope / backlog | Standard | JUDGMENT |
| Q5 | "What should happen next?" | Forced choice, single: Approve as is / Approve once my must-change items are done / I need another round before deciding / Rethink the direction | Turns the review into a workflow state. Includes two negative options so a "no" is as easy to give as a "yes". | Sign-off state; whether to schedule another round | Standard | JUDGMENT |
| (Q6, optional) | One targeted question tied to the open decision, e.g. "How clearly does the pricing table show the differences between plans?" | 5-point item-specific (Not at all clearly … Extremely clearly) | One concept, item-specific; at most one per review to cap burden | The specific open design decision | Review-specific | JUDGMENT |

**Excluded from the core:** "Do you like it?" (NN/g advises against asking whether people like a design [SECONDARY]);\[7\] multi-item satisfaction batteries (burden); and NPS. NPS is dismissed because one client's likelihood to recommend an unfinished design does not correspond to any decision in this flow, and a single response cannot support the score's percentage arithmetic [JUDGMENT]. The SEQ ("Overall, how difficult or easy was the task to complete?", 7-point, endpoints labelled; MeasuringU [SECONDARY]) is worth adding only when the client actually performs a task in a prototype.\[8\] It does not fit a visual review.

### 1b. Multi-variant additions

| # | Exact wording | Response format | Why | Decision informed | Standard? | Evidence label |
|---|---|---|---|---|---|---|
| V1 (per variant, before any comparison) | "How well does [neutral label] meet the goals below?" | Same 5-point scale as Q1, one per variant; locked until that variant has been viewed | Rating each variant on its own before comparing means every variant gets judged before a choice can colour memory. The same scale lets you set this variant's rating against the single-version core. | Whether any variant clears the bar at all | Standard | Choice-supportive memory VERIFIED (Mather et al. 2000); sequencing JUDGMENT |
| V2 (per variant, optional) | "What is the main weakness of [label]?" | Free text, one line | Multiple variants make criticism easier to give; capture it per variant | Fixes to the chosen variant | Standard | VERIFIED (Tohidi 2006: more critical with alternatives); wording JUDGMENT |
| V3 (unlocks after all V1s) | "Which version would you take forward?" | Forced choice, single: [label A] / [label B] / [label C] / Combine elements (say which below) / None of these / No preference — any would work. Variant options in randomised order; nothing pre-selected. | Forced choice gives a clear decision. "None" and "no preference" stop the client inventing a preference (NN/g's query effect). "Combine" captures the borrowing Tohidi observed. | Which direction to develop | Standard | Query effect SECONDARY (NN/g 2024); borrowing VERIFIED (Tohidi); option randomisation SECONDARY (Lyssna docs, Krosnick-based practice) |
| V4 | "How strong is that preference?" | 3-point: Slight / Clear / Strong | Separates a coin flip from a mandate without false precision | Whether to keep the runner-up alive | Standard | JUDGMENT |
| V5 (after V3) | "What made you choose that one?" | Free text, optional | Asked after the choice so reason-giving doesn't reshape the preference. Treat it as qualitative rationale, not as the cause. | Which attributes to protect | Standard | VERIFIED (Wilson & Schooler 1991; Mather et al. 2000); placement JUDGMENT |
| V6 | "Is there anything from the other version(s) you'd want carried into it?" | Free text, optional | Turns comparison into concrete, located changes | Merge list | Standard | VERIFIED (Tohidi: "borrowed" suggestions arose only with multiple designs) |

**Standard vs review-specific, explicitly:** every question above is fixed wording. Only the goal text shown with Q1/V1, the variant labels, and the optional Q6 change per review. [JUDGMENT]

## 2. Biases when toggling between variants, and mitigations

| Bias | What happens | Evidence | Mitigation in the flow | Mitigation evidence level |
|---|---|---|---|---|
| Single-design inflation / politeness to the designer | Higher ratings, fewer criticisms when one design is shown | VERIFIED: Tohidi 2006. Dell et al., "Yours is better!" (CHI 2012, doi 10.1145/2207676.2208589; 450 interviews in Bangalore): "respondents are about 2.5x more likely to prefer a technological artifact they believe to be developed by the interviewer, even when the alternative is identical" [VERIFIED as stated in the abstract] | Show alternatives where feasible; Q2 explicitly invites blockers; the designer is not present while the form is filled in | Alternatives: VERIFIED. The others: JUDGMENT |
| Primacy / anchoring on the first seen | First option favoured; later options judged relative to earlier ones | VERIFIED: Mantonakis 2009; Bruine de Bruin & Keren 2003 (OBHDP) on direction-of-comparison order effects.\[9\] Tversky & Kahneman's anchoring work was not re-checked in this research and is not relied on here. | Randomise which variant loads first, per review (never let the designer choose it); log the first variant | Randomisation is VERIFIED as standard practice (NN/g; Lyssna, Maze, UserTesting docs), but it equalises bias across variants rather than removing it (Bruine de Bruin 2005, VERIFIED)\[2\] |
| Recency / novelty of the last seen | Last option favoured, especially by experts in longer sequences | VERIFIED: Mantonakis 2009 (knowledgeable tasters), Bruine de Bruin 2005 (later performers scored higher).\[10\]\[11\] A "novelty of the last variant" effect specific to design toggling: not found | Free toggling with every variant reachable at all times; per-variant ratings while each is on screen; log the last variant viewed and the toggle count | JUDGMENT |
| Response-order bias in the preference list | Earlier listed options chosen more often in visual lists | VERIFIED: Krosnick & Alwin 1987 (POQ 51:201–219), primacy in visually presented lists, as summarised in Krosnick & Presser's handbook chapter\[12\]\[13\] | Randomise the order of variant options in V3; keep "Combine / None / No preference" anchored at the bottom | Lyssna anchors "Other/None" outside randomisation (docs, as accessed Oct 2026): SECONDARY practice\[14\] |
| Default-selected variant | A pre-selected option may get chosen by default | Specific study for design review: not found | Nothing pre-selected in V3; no "recommended" badge | JUDGMENT |
| Labelling effects (A/B, 1/2, named variants) | Ordinal labels may imply ranking; descriptive names may carry valence | Primary study: not found | Neutral, non-ordinal labels (e.g. colour or shape tokens), randomised per review. Maze hides variant names from participants (docs)\[15\] | JUDGMENT |
| Acquiescence | Tendency to agree | VERIFIED: Saris et al. 2010\[5\] | Item-specific scales; no agree/disagree items | VERIFIED |
| Reasons-analysis | Explaining reasons can shift preferences | VERIFIED: Wilson & Schooler 1991\[16\] | Preference (V3) before reasons (V5); reasons optional | Placement: JUDGMENT |
| Choice-supportive memory | After choosing, people recall the chosen option as better | VERIFIED: Mather, Shafir & Johnson 2000\[17\] | Collect V1/V2 per variant before V3 unlocks; don't let V1 be edited after V3 (or log the edits) | JUDGMENT |
| Query effect / indistinguishable variants | Client invents a preference between near-identical versions | SECONDARY: NN/g 2024\[7\] | Only send variants that differ visibly; offer "No preference" | SECONDARY |

**What randomisation can and cannot do at n = 1–3** [VERIFIED principle, JUDGMENT application]:
- With one client, randomising the first variant cannot cancel an order effect. That client is still biased toward whatever they happened to see first or last.
- What it does is stop the bias from consistently favouring the variant the designer would have shown first (often their favourite).
- Across many reviews over time, the logs let you check whether first-seen or last-seen variants win more often than chance. That is a retrospective check, never a per-review correction.
- Record per review: first variant, last variant viewed before V3, view time per variant, toggle count, and time from first view to V3.
- Treat a narrow "Slight" preference that coincides with the first-seen or last-seen variant as weak signal. [JUDGMENT]
- Lyssna shows all options together at choice time ("shown your criteria along with all of the design options").\[18\] Putting the variants side by side at the preference step, where layout permits, removes reliance on memory. [VERIFIED for Lyssna's behaviour; design use JUDGMENT]

## 3. Comments vs closing form

**Pinned comments hold:** located, element-level reactions, one issue per pin; questions ("what happens when…?"); change requests; praise worth protecting. Ask for the problem, not the fix, because users are better at identifying problems than prescribing solutions (Tohidi 2006, VERIFIED).\[4\] Optionally the pin can carry a one-tap type tag (Problem / Question / Suggestion / Keep this) [JUDGMENT]. In variant reviews, each pin is automatically tagged with the variant it was placed on [JUDGMENT].

**The closing form holds:** overall goal fit (Q1/V1), blockers (Q2), priorities across pins (Q3), gaps (Q4), preference (V3–V6), and the sign-off state (Q5). Pins can't express these because they are about the whole design and need a deliberate, end-of-session judgment. [JUDGMENT]

**How the form plays pins back** [structure JUDGMENT; evidence noted]:
- List every pin with a thumbnail crop of its location and its text, editable in place. Never ask the client to retype or remember.
  - Basis: cued retrospective reporting, where people were shown a replay of their own activity, "resulted in a higher number of codes… than did retrospective reporting" (van Gog, Paas, van Merriënboer & Witte 2005, J. Exp. Psych: Applied 11(4):237–244) [VERIFIED].\[3\]
  - Caveat: the cue there was eye-movement and keystroke replay in problem-solving, not written comments in a review.\[3\]
- For each pin: Must change / Should change / Fine either way. Then a single "most important" pick, plus "delete / merge with…" to clean up duplicates.
- Ask Q1 *before* showing the pin list. Seeing a long list of problems could drag down the overall rating; asking Q1 first keeps it a holistic judgment. Ask Q2 *after* triage so blockers can reference the pins. [JUDGMENT; no study found on this specific ordering]
- Expect the overall rating to be dominated by the worst and the final moments.
  - Basis: "evaluations are often dominated by the discomfort at the worst and at the final moments of episodes" (Kahneman, Fredrickson, Schreiber & Redelmeier 1993, Psychological Science 4(6):401–405) [VERIFIED].\[19\]\[20\] Patients' total-pain judgments correlated with peak pain and with the last 3 minutes (Redelmeier & Kahneman 1996, Pain 66(1):3–8, PMID 8857625) [VERIFIED].\[21\]\[22\]
  - The domain is pain, not design review, so this is an analogy [JUDGMENT]. It is a reason to show the pins (the whole session) back before the sign-off question.
- Concurrent vs retrospective reporting: van den Haak, de Jong & Schellens (Behaviour & Information Technology 2003, 22(5):339–351) found the two "reveal comparable sets of usability problems" but surface them differently [VERIFIED].\[23\] This supports keeping both channels, pins during the session and the form after, rather than choosing one. [JUDGMENT]

## 4. How tools structure this (one line each; as accessed October 2026 unless dated)

- **Figma comments:** pins placed on the canvas or in prototype presentation view, attached to top-level frames, with replies, resolve and a "show resolved" toggle. No closing questionnaire or variant-preference feature found in the help centre. [VERIFIED, help.figma.com "Comment on prototypes" / "View and manage comments", Oct 2026]\[24\]\[25\]\[26\]
- **Maze:** the Variant Comparison block takes up to 5 variants, with "Exclusive" (each participant randomly sees one) or "Alternating" ("Participants see all variants in a randomized order") distribution. Variant names are hidden from participants, and follow-up blocks (Opinion Scale, Multiple Choice, Open Question) form the questionnaire. Block order itself cannot be randomised. [VERIFIED, help.maze.co, Oct 2026]\[15\]\[27\] A 2023-era Useberry blog says "Maze does not offer preference testing"; this conflicts with current Maze docs and is likely outdated. [SECONDARY]\[28\]
- **Lyssna (formerly UsabilityHub):** the preference test shows all options together with the criteria, and "By default, the order is automatically randomized for each participant" (can be disabled). Optional follow-up questions can be randomised. "None of the above/Other" are anchored outside randomisation in select questions.\[14\]\[18\] A built-in "no preference" option in preference tests was not found. [VERIFIED, help.lyssna.com, Oct 2026]
- **UserTesting:** "Balanced comparison" creates Part A and Part B whose order "alternates for each contributor". For 3+ concepts the docs prescribe duplicating tests and moving a concept before or after the balanced block. Questions can be placed before and after. [VERIFIED, help.usertesting.com, Oct 2026]\[29\]\[30\]
- **Vercel comments:** pinned comments on preview deployments via the Vercel Toolbar (GA 20 Dec 2022), enabled by default on preview deployments on all plans. All commenters need a Vercel account, and external commenters can be invited on Pro/Enterprise. A PR check flags unresolved threads, and reviewers get an email when their comment is resolved.\[31\]\[32\]\[33\]\[34\] No closing form or variant-preference feature found. [VERIFIED, vercel.com/docs/comments and changelog, Oct 2026]
- **InVision:** CEO Michael Shenkman announced the shutdown in an email to users on 5 Jan 2024: "we have made the difficult decision to discontinue InVision's design collaboration services (including prototypes, DSM, etc) at the end of 2024." The last day of access was 31 Dec 2024, so it is no longer relevant. [SECONDARY, Fast Company (Emily Price)]
- **Marker.io:** on-site widget captures an annotatable screenshot plus a configurable "Guest form" (fields mirrored from Jira/Asana etc., required fields supported) per report. This is a per-issue form, not a closing questionnaire; no variant feature found. [VERIFIED, help.marker.io, Oct 2026]\[35\]\[36\]\[37\]\[38\]
- **BugHerd, Pastel, Markup.io, Frame.io, Zeplin, Abstract, Useberry (as a product), UXtweak, Optimal Workshop, Userlytics, PickFu, Helio:** not checked in this research; no claims made.

## Recommendations

1. Ship Q1–Q5 as a fixed template, with Q6 as an optional review-specific slot. Change wording only with a version number, so answers stay comparable across reviews. [JUDGMENT]
2. For variant reviews:
   - Randomise the first-loaded variant and the order of options in V3.
   - Use neutral labels and pre-select nothing.
   - Lock V3 until every variant has been viewed and rated (V1).
   - Offer Combine / None / No preference.
   - Log first/last/dwell/toggles. [mixed; see table]
3. Prefer sending 2–3 visibly different variants over one when the decision is genuinely open; it is the best-evidenced way to get honest criticism. Don't send fake alternatives: if the client can't tell them apart, you get the query effect. [VERIFIED (Tohidi) / SECONDARY (NN/g)]\[1\]\[7\]
4. Report results as one client's judgment: quote the free text, show ratings as labels, not means, and never fold a single client's preference into a "% preferred". [JUDGMENT]

## Caveats

- No evidence was found that is specific to client (paying stakeholder) reviews of in-progress designs with toggled variants. Every transfer from lab, wine tasting, jury and survey research is an inference. [JUDGMENT]
- Tohidi et al. used students, paper prototypes and a moderated session with n = 12 per condition.\[4\] The effect is clear but small-sample. [VERIFIED details; JUDGMENT on transfer]
- Tool behaviour changes often; all tool lines reflect docs as accessed October 2026.

## Not found / open gaps

- A study of order, recency or novelty effects when a viewer freely toggles between UI variants (as opposed to fixed sequences): not found.
- Evidence on variant labelling effects (A/B vs 1/2 vs names) in design preference: not found.
- Evidence on default-selected options in a design-preference question: not found.
- Evidence on whether showing a reviewer their own written comments (rather than activity replay) improves closing judgments: not found. The closest evidence is van Gog et al. 2005.
- The optimal order of overall rating vs pin triage in a closing form: not found.
- Whether Lyssna offers a "no preference" choice in preference tests: not found.
- Any closing questionnaire in Figma or Vercel comments: not found.
- Tversky & Kahneman (1974) anchoring, Krosnick 1991 (satisficing), Dow et al. on parallel prototyping as it applies to reviewers: Tversky & Kahneman not re-verified here. Dow et al. 2010 (ACM TOCHI 17(4)) was verified to exist and finds parallel prototyping gives designers better results, more divergence and self-efficacy, but it concerns designers, not reviewers' answers, so it is not used as evidence for question design.\[39\]\[40\]
- The 12 additional tools listed above: not researched.

## Sources

1. [Getting the right design and the design right](https://dl.acm.org/doi/10.1145/1124772.1124960)
2. [Save the last dance for me: unwanted serial position effects in jury evaluations - PubMed](https://pubmed.ncbi.nlm.nih.gov/15698823/)
3. <https://research.ou.nl/ws/files/22752169/Uncovering_the_problem_solving_process_c.pdf>
4. <https://www.billbuxton.com/rightDesign.pdf>
5. [Comparing Questions with Agree/Disagree Response Options to Questions with Item-Specific Response Options](https://ojs.ub.uni-konstanz.de/srm/article/view/2682)
6. [Misremembrance of options past: Source Monitoring and Choice - Princeton University](https://collaborate.princeton.edu/en/publications/misremembrance-of-options-past-source-monitoring-and-choice/)
7. [Testing Visual Design: A Comprehensive Guide](https://www.nngroup.com/articles/testing-visual-design/)
8. [10 Things To Know About The Single Ease Question (SEQ)](https://measuringu.com/seq10/)
9. [Order effects in sequentially judged options due to the direction of comparison - ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0749597803000803)
10. [Order effects in the results of song contests: Evidence from ...](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/C03D0D5AA384362736FE1EB59A75516C/S1930297500006288a.pdf/order-effects-in-the-results-of-song-contests-evidence-from-the-eurovision-and-the-new-wave.pdf)
11. [Order in Choice - Antonia Mantonakis, Pauline Rodero, Isabelle Lesschaeve, Reid Hastie, 2009](https://doi.org/10.1111/j.1467-9280.2009.02453.x)
12. [1 Question and Questionnaire Design Jon A. Krosnick Stanford University and](https://web.stanford.edu/dept/communication/faculty/krosnick/docs/2009/2009_handbook_krosnick.pdf)
13. [Response-Order Effects in Course Evaluations: Primacy, Recency & Fixes](https://edu.koji.so/docs/response-order-effects-primacy-recency-course-evaluation)
14. [Question types in unmoderated studies](https://help.lyssna.com/en/articles/10103942-question-types-in-unmoderated-studies)
15. [Variant comparison with Maze](https://help.maze.co/articles/5771909542-variant-comparison-with-maze)
16. [Thinking Too Much: Introspection Can Reduce the Quality ...](http://bear.warrington.ufl.edu/brenner/mar7588/Papers/wilson-schooler-jpsp-1991.pdf)
17. [Remembering chosen and assigned options](https://link.springer.com/article/10.3758/BF03194400)
18. [Preference test sections](https://help.lyssna.com/en/articles/4952946-preference-test-sections)
19. [When More Pain Is Preferred to Less: Adding a Better End - Daniel Kahneman, Barbara L. Fredrickson, Charles A. Schreiber, Donald A. Redelmeier, 1993](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1993.tb00589.x)
20. [When More Pain Is Preferred to Less: Adding a Better End](<https://www.ius.uzh.ch/dam/jcr:5ae9adc9-61ec-4174-b37c-4b752f36c23b/Kahnemann%20et%20al.%20-%20When%20More%20Pain%20is%20Preferred%20to%20Less%20(1993).pdf>)
21. [Patients' memories of painful medical treatments: real-time and retrospective evaluations of two minimally invasive procedures](<https://journals.lww.com/pain/abstract/10.1016/0304-3959(96)02994-6~patients-memories-of-painful-medical-treatments-real-time?redirectionsource=fulltextview>)
22. [Patients' memories of painful medical treatments: real-time and retrospective evaluations of two minimally invasive procedures - PubMed](https://pubmed.ncbi.nlm.nih.gov/8857625/?dopt=Abstract)
23. [Retrospective vs. concurrent think-aloud protocols: Testing the usability of an online library catalogue](https://research.utwente.nl/en/publications/retrospective-vs-concurrent-think-aloud-protocols-testing-the-usa/)
24. [Comment on prototypes](https://help.figma.com/hc/en-us/articles/360039824594-Comment-on-prototypes)
25. [View and manage comments](https://help.figma.com/hc/en-us/articles/360041547593-View-and-manage-comments)
26. [How to Add Comment in Figma for Collaborative Design Review](https://figmafy.com/how-to-add-comment-in-figma/)
27. [Changing the order of blocks in a study](https://help.maze.co/hc/en-us/articles/360052722873-Changing-the-order-of-blocks-in-a-maze)
28. [Comparing UX Testing Platforms: Randomization - Useberry](https://www.useberry.com/blog/comparing-ux-testing-platforms-randomization/)
29. [Balanced comparison for the Classic experience](https://help.usertesting.com/hc/en-us/articles/11880445536541-Balanced-comparison)
30. [Balanced Comparison with multiple concepts](https://help.usertesting.com/hc/en-us/articles/13588748183197-Balanced-Comparison-with-multiple-concepts)
31. [Using Vercel comments to improve the Next.js 13 documentation - Vercel](https://vercel.com/blog/using-vercel-comments-to-improve-the-next-js-13-documentation)
32. [Comments on Preview Deployments are now generally available - Vercel](https://vercel.com/changelog/comments-on-preview-deployments-are-now-generally-available)
33. [Comments Overview](https://vercel.com/docs/comments)
34. [Preview deployments for retail campaign review](https://vercel.com/kb/guide/preview-deployments-retail-campaign-review)
35. [How to integrate Marker.io into your web app](https://help.marker.io/en/articles/5546520-how-to-integrate-marker-io-into-your-web-app)
36. [Forms](https://help.marker.io/en/articles/4406960-forms)
37. [Marker.io](https://wordpress.org/plugins/marker-io/)
38. [Marker.io](https://wordpress.com/plugins/marker-io)
39. [Parallel Prototyping Leads to Better Design Results, More Divergence, and Increased Self-Efficacy.](https://spdow.ucsd.edu/publication/parallel-prototyping-leads-to-better-design-results-more-divergence-and-increased-self-efficacy/)
40. [Parallel Prototyping](https://www.humanfactors.com/newsletters/parallel_prototyping.html)
