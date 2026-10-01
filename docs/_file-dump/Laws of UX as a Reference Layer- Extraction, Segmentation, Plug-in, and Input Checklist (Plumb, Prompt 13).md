# Laws of UX as a Reference Layer: Extraction, Segmentation, Plug-in, and Input Checklist (Plumb, Prompt 13)

Ruling: split Laws of UX into one file per law, grouped in five family folders under /docs/references/laws-of-ux/. A task-type index picks at most three files per task, and a separate provenance file is never loaded by builders. That way a table view loads only its two or three laws, and Assay can cite a law by file and rubric line ID.

## TL;DR

- **Structure ruling:** use one file per law (about 40 lines, 500 tokens or fewer), arranged in five family folders and routed by index.md. Each file also has a `load_when` trigger in its frontmatter as a fallback. This delivery contains the index, all ten cognition-and-load and motor-and-time files, and one extra file (Flow), plus a batch plan for the remaining 19.
- **Provenance verdict:** lawsofux.com listed 30 laws as of 2026-09-30. Three of those laws have popular statements that go beyond the research:
  - Choice Overload: a 2010 meta-analysis of 50 experiments found a mean effect of "virtually zero".\[1\]
  - Zeigarnik: a 2025 meta-analysis concluded the memory effect "lacks universal validity".\[2\]
  - Miller's 7±2: Yablonski himself warns against using it as a limit.\[3\]

  Parkinson's Law comes from a humorous 1955 essay, not a study.\[4\] Tesler's Law comes from an interview. For Doherty, I could not confirm either the journal venue or the 400 ms figure in the text I could read.
- **What else belongs in the layer:** acquire NN/g's ten heuristics, NN/g's response-time limits, the GOV.UK error and form patterns, and a small set of Tognazzini principles that Nielsen does not already cover. Four gaps need new threads, with primers below: WCAG 2.2 plus APG (Threshold), platform HIGs, GIS and field map conventions, and dense tables and diffs. Anthropic's frontend-aesthetics cookbook goes to thread 04. Shneiderman, Baymard and Growth.Design are ruled out because they would push more useful material out of the agent's context.

## Key Findings

1. **What the site lists today (read 2026-09-30).** The lawsofux.com home page lists 30 entries:\[5\]
   - Aesthetic-Usability Effect
   - Choice Overload
   - Chunking
   - Cognitive Bias
   - Cognitive Load
   - Doherty Threshold
   - Fitts's Law
   - Flow
   - Goal-Gradient Effect
   - Hick's Law
   - Jakob's Law
   - Law of Common Region
   - Law of Proximity
   - Law of Prägnanz
   - Law of Similarity
   - Law of Uniform Connectedness
   - Mental Model
   - Miller's Law
   - Occam's Razor
   - Paradox of the Active User
   - Pareto Principle
   - Parkinson's Law
   - Peak-End Rule
   - Postel's Law
   - Selective Attention
   - Serial Position Effect
   - Tesler's Law
   - Von Restorff Effect
   - Working Memory
   - Zeigarnik Effect

   A banner on the home page says the updated poster's "Additions include Paradox of the Active User, Selective Attention, Cognitive Bias, and more".\[5\] Treat those three as the recent additions. The site does not give dates for when they were added [NOT IN SOURCE]. The page footer reads "Laws of UX © Jon Yablonski 2026", and the site is licensed CC BY-NC-ND 4.0.\[5\] That licence is why the files below quote only single statements and paraphrase everything else with labels. Nothing in this delivery is an adaptation of his text.
2. **The book (verified, dated).** *Laws of UX, 2nd Edition* is published by O'Reilly under ISBN 9781098146962.\[6\]
   - O'Reilly's listing dates it January 2024 and gives 186 pages. Booktopia lists the paperback as 6 February 2024 with 168 pages.\[7\]\[8\] The two page counts conflict, and I have not resolved which is correct.
   - The book page on lawsofux.com lists what is new in the 2nd edition: "New Concepts" (Paradox of Choice, Complexity Bias, Flow) and "New Considerations" (The Human Factor, Accessibility, Paradox of the Active User, Personalization).\[9\] Complexity Bias does not have a page on the site, so it is [NOT IN SOURCE] for this extraction.
   - The public preview of Chapter 1 states Jakob's Law slightly differently from the site ("…other sites, and they prefer your site…").\[10\]\[11\] Use the site's wording.
3. **Where the popular statements go beyond the research.** In each case the source is cited.
   - **Choice overload.** Scheibehenne, Greifeneder and Todd (2010, *Journal of Consumer Research* 37(3):409–425, doi:10.1086/651235) pooled "63 conditions from 50 published and unpublished experiments (N = 5,036)" and found "a mean effect size of virtually zero but considerable variance between studies".\[1\]
   - **Zeigarnik.** Ghibellini and Meier (2025, *Humanities and Social Sciences Communications* 12, 962, doi:10.1057/s41599-025-05000-w) report an average effect of d_z = 0.15 and conclude that "the Ovsiankina effect represents a general tendency, whereas the Zeigarnik effect lacks universal validity."\[2\]\[12\]
   - **Miller.** The site's first takeaway reads: "Don't use the 'magical number seven' to justify unnecessary design limitations."\[3\]
   - **Parkinson.** The site itself calls the source "a humorous essay published in The Economist in 1955".\[4\]
   - **Tesler.** The site grounds it in an interview with Tesler in Dan Saffer's *Designing for Interaction*, and it prints Tognazzini's counter-claim on the same page.\[13\]
   - **Postel.** The rule is network-protocol guidance. RFC 9413, "Maintaining Robust Protocols" (M. Thomson and D. Schinazi, IAB, published 27 June 2023, doi:10.17487/RFC9413), says the robustness principle "has been interpreted in a variety of ways. While some interpretations help ensure the health of the Internet, others can negatively affect interoperability over time."\[14\]\[15\] It also warns that "Overapplication of the robustness principle therefore encourages a chain reaction that can create interoperability problems over time."\[16\]
   - **Doherty.** The site names the *IBM Systems Journal*.\[17\] The copies I could find present it as an IBM paper dated November 1982, and a note derived from the book cites "IBM technical report GE20-0752-0".\[18\]\[19\] The reproduced text's headline result is about response times under one second.\[20\] I did not find the 400 ms figure in the text I could read.
4. **Anthropic skills mechanics (verified 2026-09-30).** Claude Platform Docs describe three levels of loading:
   - Level 1, metadata: loaded "Always (at startup)" at "~100 tokens per Skill".\[21\]
   - Level 2, the SKILL.md body: loaded "When Skill is triggered", at "Under 5k tokens".\[21\]
   - Level 3, bundled files: loaded as needed.

   The only required frontmatter fields are `name` and `description`.\[21\] Anthropic's "Skill authoring best practices" page in the Claude Platform Docs adds two directly relevant rules: "Keep SKILL.md body under 500 lines for optimal performance" and "Keep references one level deep from SKILL.md." It also says to put a table of contents in "reference files longer than 100 lines", and it caps `name` at 64 characters and `description` at 1,024.\[22\] That is why the index below is a single hop from the ui-critic SKILL.md.
5. **NN/g heuristics wording.** NN/g's primary page says that in 2020 "we slightly refined the language of the definitions" and that the heuristics "have remained relevant and unchanged since 1994."\[23\] I found no 2024 rewording on NN/g, so it is marked not found. The only 2024 item is Jakob Nielsen's anniversary post "How I Developed the 10 Usability Heuristics" on UX Tigers (dated 15 February 2024 in The Decision Lab's citation).\[24\] It opens "2024 marks the 30-year anniversary of the 10 usability heuristics" and is a history, not a revision.\[24\]\[25\] In a separate UX Tigers post, "The 10 Usability Heuristics Reimagined", Nielsen says the canonical list is "the same now as in 1994".\[26\]

## Verdict on Structure

Use one file per law, filed in five family folders, with a single index that routes task types to at most three files. A family file bundles five or six laws, and a table view needs perhaps two of them, so the agent pays for twenty laws it does not need. That is the problem the brief asked me to solve, just shrunk. A single 30-law document fails the budget outright. The families still earn their place, as folders and as the `family` field in frontmatter: they make batch acquisition possible, and they tell Assay which related laws to check next. Full provenance goes to a separate PROVENANCE.md. Builders never load it; Alembic and Assay open it only when a finding is disputed. Each law file keeps just one provenance line and one caveat line. The index is the primary router because it is deterministic. The `load_when` trigger in each file is the fallback for tasks the index does not list.

## The Extraction (all 30 laws on lawsofux.com, read 2026-09-30)

Key to the table:
- "Statement" quotes Yablonski's headline sentence, shortened with ellipses where it is long.
- "Takeaways" are paraphrased [PARAPHRASE] and give the number of takeaways on the page.
- "Examples" lists what I captured this pass. [NOT CAPTURED] means I did not retrieve it this pass, which is different from [NOT IN SOURCE].

| Law | Statement (Yablonski, verbatim, short) | Origin as the site gives it | Takeaways [PARAPHRASE] | Examples on site |
|---|---|---|---|---|
| Aesthetic-Usability Effect | "Users often perceive aesthetically pleasing design as design that's more usable." | Kurosu & Kashimura, Hitachi Design Center, 1995; 26 ATM UI variations, 252 participants | (3) Attractive design makes people believe it works better; they tolerate minor issues; it can hide problems during testing | [NOT CAPTURED]\[27\] |
| Choice Overload | "The tendency for people to get overwhelmed when they are presented with a large number of options…" | Term introduced by Alvin Toffler, *Future Shock*, 1970 | (3) Too many options hurts decisions and how people feel about the whole experience; allow side-by-side comparison; prioritise content, and offer search and filtering | [NOT CAPTURED]\[28\] |
| Chunking | "…broken down and then grouped together in a meaningful whole." | Miller 1956, "The Magical Number Seven, Plus or Minus Two" | [NOT CAPTURED]. The 2018 site article describes chunking as grouping related information visually into small distinct units | [NOT CAPTURED]\[10\]\[29\] |
| Cognitive Bias | "A systematic error of thinking or rationality in judgment…" | Tversky & Kahneman, 1972 (from the subagent's reading of the page) | (2+) Heuristics speed up decisions but bias judgement; knowing your biases does not remove them | Confirmation bias (subagent)\[30\] |
| Cognitive Load | "The amount of mental resources needed to understand and interact with an interface." | Sweller, late 1980s; the site says the 1988 publication is titled "Cognitive Load Theory, Learning Difficulty, and Instructional Design" | (3) Overload means details get missed; defines intrinsic load; defines extraneous load | [NOT CAPTURED]\[31\] |
| Doherty Threshold | "Productivity soars when a computer and its users interact at a pace (<400ms)…" | Doherty & Thadani, 1982, "IBM Systems Journal" per the site | (5) Give feedback within 400 ms; use perceived performance; animate during waits; progress bars make waits tolerable; deliberately adding delay can increase perceived value and trust | [NOT CAPTURED]\[17\] |
| Fitts's Law | "The time to acquire a target is a function of the distance to and size of the target." | Paul Fitts, 1954 | (3) Touch targets large enough, spaced apart, and placed where they are easy to reach | [NOT CAPTURED]\[32\] |
| Flow | "…fully immersed in a feeling of energized focus…" | Csikszentmihalyi, 1975 (subagent) | (3) Balance challenge against skill; too hard frustrates, too easy bores; give feedback on what has been done | [NOT CAPTURED]\[33\] |
| Goal-Gradient Effect | "The tendency to approach a goal increases with proximity to the goal." | Clark Hull, 1932; Hull 1934 rat alley; the text quotes Kivetz et al. | (3) Users speed up near the end; artificial progress motivates; show progress clearly | [NOT CAPTURED]\[34\] |
| Hick's Law | "The time it takes to make a decision increases with the number and complexity of choices." | Hick and Hyman, 1952 | (5) Cut choices where response time is critical; break tasks into steps; highlight recommended options; onboard progressively; do not simplify to the point of abstraction | Slack's progressive onboarding\[35\] |
| Jakob's Law | "Users spend most of their time on other sites…" | Coined by Jakob Nielsen; the 2018 site article dates it to 2000 | (3) Expectations transfer between similar products; lean on existing mental models; when redesigning, let users keep the familiar version for a limited time | Analog vs digital controls; form controls; YouTube 2017 redesign opt-in\[5\]\[10\]\[36\] |
| Law of Common Region | "…sharing an area with a clearly defined boundary." | Gestalt grouping principles (no person or year given) | (3) Common region shows structure; a border creates it; so does a background | [NOT CAPTURED]\[5\]\[37\]\[38\] |
| Law of Proximity | "Objects that are near, or proximate to each other, tend to be grouped together." | [NOT CAPTURED] | [NOT CAPTURED] | [NOT CAPTURED]\[5\]\[39\] |
| Law of Prägnanz | "…interpret ambiguous or complex images as the simplest form possible…" | Max Wertheimer, 1910, flashing railroad lights | (3) The eye looks for simplicity; simple figures are processed and remembered better; complex shapes are simplified into one form | [NOT CAPTURED]\[13\]\[38\] |
| Law of Similarity | "…perceive similar elements as a complete picture, shape, or group…" | "Gestalt psychologists" (no person or year) | (2+) Elements that look alike are read as related; make links distinct from body text (subagent) | [NOT CAPTURED]\[40\] |
| Law of Uniform Connectedness | "Elements that are visually connected are perceived as more related…" | [NOT CAPTURED] | (3) Connect related functions with colour, lines or frames; or use an explicit connector such as a line or arrow; use connection to show context | [NOT CAPTURED]\[5\]\[41\] |
| Mental Model | "A compressed model based on what we think we know about a system…" | [NOT CAPTURED] | (4) People apply models they already hold; match those models; good UX comes from alignment; close the gap through research | E-commerce product cards, carts, checkout\[42\] |
| Miller's Law | "The average person can only keep 7 (plus or minus 2) items in their working memory." | George Miller, 1956 | (3) Do not use seven to justify limits; chunk; capacity varies with prior knowledge and context | [NOT CAPTURED]\[3\] |
| Occam's Razor | "Among competing hypotheses that predict equally well, the one with the fewest assumptions should be selected." | William of Ockham (no year given) | (2+) Avoid complexity from the start; remove elements until nothing more can go without losing function (subagent) | [NOT CAPTURED]\[43\] |
| Paradox of the Active User | "Users never read manuals but start using the software immediately." | Mary Beth Rosson and John Carroll, 1987, *Interfacing Thought* | (3) Users want to finish the task in front of them; learning the system would save them time later; put guidance in context, e.g. tooltips | [NOT CAPTURED]\[44\] |
| Pareto Principle | "…roughly 80% of the effects come from 20% of the causes." | Vilfredo Pareto (land ownership observation) | (2+) Outputs are unevenly distributed; focus effort where it helps most users (from a flashcard copy, not the page) | [NOT CAPTURED]\[45\]\[46\] |
| Parkinson's Law | "Any task will inflate until all of the available time is spent." | C. Northcote Parkinson, humorous essay in *The Economist*, 1955; reprinted 1958 | (3) Keep task time to what users expect; finishing faster than expected improves the experience; use autofill | [NOT CAPTURED]\[4\] |
| Peak-End Rule | "…how they felt at its peak and at its end…" | Kahneman, Fredrickson, Schreiber, Redelmeier, 1993 | (3) Attend to the peaks and the ending; design the most helpful moments for delight; negative experiences are recalled more vividly | Mailchimp send confirmation; Uber wait-time design\[47\]\[48\]\[49\] |
| Postel's Law | "Be liberal in what you accept, and conservative in what you send." | Jon Postel; TCP robustness principle quoted | (4) Tolerate varied user actions and input; anticipate access and capability differences; the more you plan for, the more resilient the design; accept varied input, translate it, bound it, give feedback | [NOT CAPTURED]\[5\]\[50\] |
| Selective Attention | "…focusing our attention only to a subset of stimuli…" | Broadbent, filter theory, 1958 (subagent) | [NOT CAPTURED] | [NOT CAPTURED]\[51\] |
| Serial Position Effect | "Users have a propensity to best remember the first and last items in a series." | Term attributed to Ebbinghaus | (2) Put the least important items in the middle; put key actions at the far left and right | Apple, Electronic Arts, Nike mentioned without detail\[5\]\[48\]\[52\] |
| Tesler's Law | "…for any system there is a certain amount of complexity which cannot be reduced." | Larry Tesler, Xerox PARC, mid-1980s; interview in Saffer's *Designing for Interaction* | (4) Some complexity cannot be designed away; move it off users; do not design for an idealised rational user; put guidance in context | [NOT CAPTURED]\[5\]\[13\]\[53\] |
| Von Restorff Effect | "…the one that differs from the rest is most likely to be remembered." | Hedwig von Restorff, 1933 | (4) Make key items distinct; use emphasis sparingly so items do not compete or read as ads; do not rely on colour alone; take care with motion | [NOT CAPTURED]\[5\]\[54\] |
| Working Memory | "A cognitive system that temporarily holds and manipulates information needed to complete tasks." | Term coined by Miller, Galanter and Pribram (1960s); Atkinson & Shiffrin, 1968 | (3+) Support recognition over recall (visited links, breadcrumbs); put the memory burden on the system (e.g. comparison tables) | Visited links, breadcrumbs, comparison tables\[55\] |
| Zeigarnik Effect | "People remember uncompleted or interrupted tasks better than completed tasks." | Bluma Zeigarnik (1900–1988); no year on the page | (3) Signal that more content exists; show progress, including artificial progress (subagent) | [NOT CAPTURED]\[56\] |

## The Reference Files

### Folder layout

```text
/docs/references/laws-of-ux/
  index.md                      (router; loaded by any UI task)
  PROVENANCE.md                 (never loaded by builders; Alembic/Assay on dispute)
  cognition/        hicks-law.md  millers-law.md  cognitive-load.md
                    choice-overload.md  chunking.md  working-memory.md
  motor-time/       fittss-law.md  doherty-threshold.md  parkinsons-law.md
                    goal-gradient.md  flow.md
  perception/       [BATCH 2] proximity, similarity, common-region,
                    uniform-connectedness, pragnanz, selective-attention
  memory-emotion/   [BATCH 2] peak-end, zeigarnik, von-restorff, serial-position
  expectation/      [BATCH 3] jakobs-law, mental-model, aesthetic-usability,
                    teslers-law, postels-law, occams-razor, pareto,
                    paradox-active-user, cognitive-bias
```

### index.md

```markdown
---
name: laws-of-ux-index
family: index
laws: [router]
load_when: "Any UI build, critique, or variation task. Read this first, then load at most 3 law files for the task type. Never load a whole family."
budget: "<= 80 lines, <= 900 tokens"
precedence: "DESIGN.md > brief.md > states.md / anti-patterns.md > law files"
---

# Laws of UX index

Load order: DESIGN.md, then /specs/<feature>/brief.md, then this index, then up to 3 law files.
DESIGN.md wins on any conflict. A law file never overrides a token, component rule, or anti-pattern.
Cite findings as: Fails <Law> [<RULE-ID>] at <element>: <evidence>. Fix: <fix>.

| Task type | Load (max 3) | Why these |
|---|---|---|
| Table / claims table | cognition/working-memory, cognition/chunking, cognition/hicks-law | compare in view; grouped IDs; row actions |
| Document diff / compare | cognition/working-memory, cognition/chunking, [B2] memory-emotion/von-restorff | both states visible; changes distinct |
| Audit trail / log | cognition/chunking, cognition/working-memory, [B2] perception/proximity | grouped by day/actor; no recall |
| Form | cognition/chunking, motor-time/parkinsons-law, [B3] expectation/postels-law | sections; prefill; tolerant input |
| Data entry (repeated) | motor-time/fittss-law, motor-time/flow, motor-time/parkinsons-law | targets; unbroken run; prefill |
| Onboarding | cognition/hicks-law, motor-time/goal-gradient, [B3] expectation/paradox-active-user | fewer first choices; true progress |
| Navigation | cognition/hicks-law, [B3] expectation/jakobs-law, [B2] memory-emotion/serial-position | known patterns; ends of lists |
| Search / filter | cognition/choice-overload, cognition/hicks-law, motor-time/doherty-threshold | narrowing; response pace |
| Dashboard | cognition/cognitive-load, cognition/chunking, [B2] memory-emotion/von-restorff | extraneous load; one salient item |
| Map interaction | motor-time/fittss-law, motor-time/doherty-threshold, cognition/cognitive-load | handles/gloves; pan latency; panel load |
| Long-running process / loading | motor-time/doherty-threshold, motor-time/goal-gradient, [B2] memory-emotion/peak-end | ack <400 ms; true progress; ending |
| Error state | [B3] expectation/postels-law, [B2] memory-emotion/peak-end, cognition/working-memory | tolerant input; recovery moment; no recall |
| Destructive action | motor-time/fittss-law, [B2] memory-emotion/von-restorff, cognition/hicks-law | spacing; distinct; one clear choice |
| Settings | cognition/hicks-law, [B3] expectation/teslers-law, cognition/choice-overload | defaults; who carries complexity |
| Empty state | [B3] expectation/paradox-active-user, motor-time/goal-gradient, cognition/hicks-law | act-first guidance; one next step |
| Report / export | cognition/choice-overload, [B2] memory-emotion/peak-end, cognition/chunking | comparable templates; the ending |

Not listed? Match the task to each file's `load_when` line. Still ambiguous: load none and flag to Plumb.
[B2]/[B3] files are not yet written; skip them until they land. Do not improvise their content.
```

### cognition/hicks-law.md

```markdown
---
name: hicks-law
family: cognition-and-load
laws: [Hick's Law]
load_when: "A user must pick one action from a set of known options at a decision point: row actions, command menus, commit/confirm steps, mode pickers."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/hicks-law/ (read 2026-09-30)"
---
# Hick's Law
Yablonski: "The time it takes to make a decision increases with the number and complexity of choices."
Provenance: Hick 1952, QJEP 4(1):11-26, doi:10.1080/17470215208416600; Hyman 1953, JEP 45(3):188-196, doi:10.1037/h0056940. Flag: OVERSTATED framing (site calls them a 1952 "team"; two separate papers). DOIs recalled, spot-check.
Caveat [SECONDARY, Wikipedia "Hick's law", 2026-09-30]: models choice among learned options; reading an unfamiliar list is linear scanning, where Hick does not apply.

## Rules
- [DIRECT] Where response time is critical, reduce the options shown.
- [DIRECT] Highlight a recommended option when one exists.
- [DIRECT] Split multi-decision tasks into steps; do not simplify into abstraction.
- [INFERRED] Cite Hick only for choices among known options. For unfamiliar lists, cite Chunking or Serial Position. Reason: scope caveat.
- [INFERRED] Hide by frequency, never delete, for expert users. Reason: takeaway 5.

## Detect (Assay)
- LUX-HICK-01 Blocking: critical-path decision (commit, export, delete, confirm measurement) shows peer options at equal weight, no default, where the brief names one expected action.
- LUX-HICK-02 Should-fix: rare actions sit at the same level as the frequent one on a per-row or per-feature control.
- LUX-HICK-03 Consider: recommended option exists but is not the keyboard default.

## DealReady
Pass: each claims-table row shows one inline action, "Open source" (jumps to cited passage, Enter key); Flag, Dispute, Copy citation, Export live in the row menu.
Fail: six equal icon buttons on each of 400 rows.

## Fybr
Pass: after the stockpile outline closes, "Measure volume" is primary; base-surface method is preset to the site's last method, labelled and editable.
Fail: four equal buttons plus a mandatory method dropdown before a novice, in glare, can measure.
```

### cognition/millers-law.md

```markdown
---
name: millers-law
family: cognition-and-load
laws: [Miller's Law]
load_when: "A spec, comment, or finding justifies a count limit (menu items, tabs, layers, filters) by '7 plus or minus 2'. This file exists mainly to stop that misuse."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/millers-law/ (read 2026-09-30)"
---
# Miller's Law
Yablonski: "The average person can only keep 7 (plus or minus 2) items in their working memory."
Provenance: Miller 1956, Psychological Review 63(2):81-97, doi:10.1037/h0043158 (recalled, spot-check). Flag: OVERSTATED as popularly used. Yablonski's own takeaway 1: do not use "the magical number seven" to justify design limits; his 2018 article says Miller's focus was chunking.
Caveat: Cowan 2001, BBS 24(1):87-114, doi:10.1017/S0140525X01003922, argues capacity nearer 4 chunks (recalled, spot-check). Capacity varies with prior knowledge and context (site takeaway 3).

## Rules
- [DIRECT] Never cap item counts by citing 7 plus or minus 2.
- [DIRECT] Chunk content so it can be processed and remembered.
- [INFERRED] Assay does not accept "fails Miller's law" as a count finding. Re-cite as Chunking, Working Memory, or Hick. Reason: the number is not a design limit.

## Detect (Assay)
- LUX-MILL-01 Should-fix: a brief, spec, or code comment justifies a limit with 7 plus or minus 2 or "magical number" (grep-able).
- LUX-MILL-02 Should-fix: a list was truncated to meet an arbitrary count and hides items the task needs.

## DealReady
Pass: the claim-type filter lists every type in the diligence taxonomy, grouped by category and type-to-search.
Fail: the spec caps the filter at seven types "per Miller", hiding the Regulatory category.

## Fybr
Pass: the layer panel groups layers by survey date and type, collapsible.
Fail: the panel is limited to seven layers, so the surveyor cannot show a third survey date.
```

### cognition/cognitive-load.md

```markdown
---
name: cognitive-load
family: cognition-and-load
laws: [Cognitive Load]
load_when: "Deciding what to show or hide on a working surface: dashboards, measurement panels, dense tables, any screen where elements compete with the primary task."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/cognitive-load/ (read 2026-09-30)"
---
# Cognitive Load
Yablonski: "The amount of mental resources needed to understand and interact with an interface."
Provenance: Sweller 1988, "Cognitive load during problem solving: Effects on learning", Cognitive Science 12(2):257-285, doi:10.1207/s15516709cog1202_4 (recalled, spot-check). Flag: CITATION MISMATCH. Site names the 1988 work "Cognitive Load Theory, Learning Difficulty, and Instructional Design"; that title appears to be a later Sweller paper (not verified this pass).
Caveat [INFERRED]: theory built for instructional design; transfer to UI is by analogy.

## Rules
- [DIRECT] Remove extraneous elements that do not help users understand content.
- [DIRECT] Intrinsic load (goal-relevant information) is kept, not cut.
- [INFERRED] In trust UI, provenance is intrinsic. Reduce its visual cost; never remove it to look calm. Reason: DealReady's product is the citation.

## Detect (Assay)
- LUX-CLOAD-01 Blocking: goal-relevant information (source, units, confidence) removed or hidden to reduce clutter.
- LUX-CLOAD-02 Should-fix: decorative or non-task elements compete with the primary task region.
- LUX-CLOAD-03 Consider: secondary metrics visible by default that the brief does not name.

## DealReady
Pass: each claim shows a compact citation chip ("[3] p.14"); Space or hover reveals the passage.
Fail A: full quoted passages inline, rows six lines tall. Fail B: citations hidden for a "clean" table.

## Fybr
Pass: the measurement panel shows volume, units, confidence, base surface; point count and processing log sit under Details.
Fail: twelve metrics on screen while the user is drawing the toe line.
```

### cognition/choice-overload.md

```markdown
---
name: choice-overload
family: cognition-and-load
laws: [Choice Overload]
load_when: "Users choose among complex, non-obvious alternatives (templates, plans, methods) where they may lack a prior preference; search and filter design."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/choice-overload/ (read 2026-09-30)"
---
# Choice Overload
Yablonski: "The tendency for people to get overwhelmed when they are presented with a large number of options..."
Provenance: site credits the term to Toffler, Future Shock, 1970. Popular study: Iyengar & Lepper 2000, JPSP 79(6):995-1006, doi:10.1037/0022-3514.79.6.995 (recalled, spot-check). Flag: CONTESTED.
Caveat: Scheibehenne, Greifeneder & Todd 2010, JCR 37(3):409-425, doi:10.1086/651235: 50 experiments, N = 5,036, mean effect "virtually zero", high variance. Moderators (complex set, hard task, uncertain preference, effort-minimising goal) per secondary summaries of Chernev et al.

## Rules
- [DIRECT] Offer side-by-side comparison when a decision needs it.
- [DIRECT] Prioritise what is shown; give search and filtering to narrow.
- [INFERRED] Cite only when the moderators are present. Expert users with clear preferences are weak cases; cite Hick or Cognitive Load instead. Reason: meta-analysis.

## Detect (Assay)
- LUX-CHOV-01 Should-fix: a choice among complex alternatives with no comparison attributes and no recommendation, for a user the brief marks as novice.
- LUX-CHOV-02 Consider: long option lists without search or filter.

## DealReady
Pass: export offers three report templates, side by side, showing which include claims, citations, audit log.
Fail: fourteen templates named by internal code.

## Fybr
Pass: in novice mode, base-surface methods appear as a comparison with a one-line "use when" and one recommended; surveyor mode shows all.
Fail: an unexplained dropdown of method names for a first-time user.
```

### cognition/chunking.md

```markdown
---
name: chunking
family: cognition-and-load
laws: [Chunking]
load_when: "Long strings or long sequences a user must read, compare, or transcribe: IDs, hashes, coordinates, audit logs, long forms."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/chunking/ (read 2026-09-30)"
---
# Chunking
Yablonski: "...broken down and then grouped together in a meaningful whole."
Provenance: Miller 1956, Psychological Review 63(2):81-97, doi:10.1037/h0043158 (recalled, spot-check). Flag: VERIFIED as origin of the term per site.
Caveat: none located. Site takeaways [NOT CAPTURED this pass]; the 2018 site article describes chunking as grouping related information into small distinct units.

## Rules
- [DIRECT] Group related information into small, distinct, visually grouped units.
- [INFERRED] Chunk by the user's unit of meaning (document, section, clause; site, stockpile, survey), not by layout convenience.
- [INFERRED] Strings compared or transcribed are grouped with a monospace face and a copy control.

## Detect (Assay)
- LUX-CHNK-01 Should-fix: an ID, hash, or coordinate longer than about 8 characters shown unbroken where the user must compare or read it aloud.
- LUX-CHNK-02 Should-fix: a flat sequence of more than a screen of events with no grouping.
- LUX-CHNK-03 Consider: a long form without sections.

## DealReady
Pass: the diff header shows the document hash in four-character monospace groups with copy; the audit trail groups by day, then actor.
Fail: a flat 800-event audit log and 64-character hashes compared by eye.

## Fybr
Pass: coordinates display grouped digits with the unit adjacent ("E 512 334.20 m").
Fail: "512334.2012" with no unit or grouping, read off a sunlit tablet.
```

### cognition/working-memory.md

```markdown
---
name: working-memory
family: cognition-and-load
laws: [Working Memory]
load_when: "Any task that asks users to compare, remember, or carry values across views: diffs, version compare, multi-step review, survey-to-survey change."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/working-memory/ (read 2026-09-30)"
---
# Working Memory
Yablonski: "A cognitive system that temporarily holds and manipulates information needed to complete tasks."
Provenance: site: term coined by Miller, Galanter & Pribram (1960s); Atkinson & Shiffrin 1968 "short-term store". Flag: PARTIALLY VERIFIED (site names decade and authors; primary records not located this pass).
Caveat: none located.

## Rules
- [DIRECT] Support recognition over recall; mark what has been viewed.
- [DIRECT] Put the memory burden on the system; carry information across screens; comparison tables.
- [INFERRED] In any compare task, both states are visible at once. Reason: toggling forces recall.

## Detect (Assay)
- LUX-WMEM-01 Blocking: a compare task shows one state at a time (tab toggle, separate page).
- LUX-WMEM-02 Should-fix: reviewed/unreviewed state not marked in a review queue.
- LUX-WMEM-03 Should-fix: a value from a previous step must be retyped or remembered.

## DealReady
Pass: document diff shows v3 and v4 side by side (or inline) with synced scroll; claims show viewed and verified marks.
Fail: v3 and v4 in tabs, the analyst flipping to spot a changed covenant.

## Fybr
Pass: survey compare shows this month's and last month's outline on the map with the volume delta in the panel.
Fail: the user recalls last month's volume from an exported PDF.
```

### motor-time/fittss-law.md

```markdown
---
name: fittss-law
family: motor-and-time
laws: [Fitts's Law]
load_when: "Placing or sizing pointer or touch targets: map handles, field-mode buttons, adjacent destructive actions, one-handed layouts."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/fittss-law/ (read 2026-09-30)"
---
# Fitts's Law
Yablonski: "The time to acquire a target is a function of the distance to and size of the target."
Provenance: Fitts 1954, JEP 47(6):381-391, doi:10.1037/h0055392 (recalled, spot-check). Flag: VERIFIED as origin.
Caveat [SECONDARY, Wikipedia "Fitts's law", 2026-09-30]: models rapid aimed movement to visible targets; multiple formulations exist. [INFERRED] Does not measure keyboard efficiency.

## Rules
- [DIRECT] Targets large enough to select accurately; ample spacing; placed where easy to reach.
- [INFERRED] Sizes come from DESIGN.md tokens, never from this file. WCAG target-size minimums are Threshold's.
- [INFERRED] In keyboard-first flows, cite Flow or NN/g flexibility, not Fitts.

## Detect (Assay)
- LUX-FITT-01 Blocking: in field or one-hand mode, the primary action is below the field target token or outside the thumb zone named in DESIGN.md.
- LUX-FITT-02 Should-fix: a destructive target adjacent to a frequent target without the spacing token.
- LUX-FITT-03 Consider: the action for the item under attention is far from it.

## DealReady
Pass: in the claim review panel, Accept and Dispute sit directly under the cited passage.
Fail: Accept sits top-right, forcing travel across a 1440 px screen after every claim.

## Fybr
Pass: one-handed field mode puts Drop point and Undo in the bottom thumb zone, glove-sized, Undo apart from Finish.
Fail: small vertex handles and Finish beside Delete stockpile.
```

### motor-time/doherty-threshold.md

```markdown
---
name: doherty-threshold
family: motor-and-time
laws: [Doherty Threshold]
load_when: "Any action whose result takes time: AI claim checks, search, volume computation, map pan/zoom on large data, exports."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/doherty-threshold/ (read 2026-09-30)"
---
# Doherty Threshold
Yablonski: "Productivity soars when a computer and its users interact at a pace (<400ms)..."
Provenance: Doherty & Thadani, "The Economic Value of Rapid Response Time", IBM, Nov 1982. Flag: PARTIALLY VERIFIED. Site says IBM Systems Journal; copies found present an IBM paper (a book-derived note cites report GE20-0752-0). The text read stresses sub-second response; 400 ms not located.
Caveat [INFERRED]: 1980s mainframe transaction data; web latency transfer is analogical.

## Rules
- [DIRECT] Give system feedback within 400 ms; use perceived performance; show progress during waits.
- [INFERRED] Acknowledge within budget even when the result is not ready.
- [INFERRED] Ruled out for DealReady: Yablonski's takeaway to add delay for perceived value. Fabricated latency is a trust violation.

## Detect (Assay)
- LUX-DOHE-01 Blocking: a critical-path action shows no visible acknowledgement within 400 ms (Playwright trace).
- LUX-DOHE-02 Blocking (DealReady): an artificial delay or fake "analysing" state.
- LUX-DOHE-03 Should-fix: a long operation shows an indeterminate spinner with no stage and no cancel.

## DealReady
Pass: "Verify citation" marks the row checking at once, then streams the matched passage.
Fail: nothing for six seconds, then the result.

## Fybr
Pass: volume run on a large cloud locks the outline at once, shows staged progress, map stays pannable.
Fail: a frozen map under a spinner.
```

### motor-time/parkinsons-law.md

```markdown
---
name: parkinsons-law
family: motor-and-time
laws: [Parkinson's Law]
load_when: "Forms and setup flows where the system already knows values the user would otherwise re-enter; time expectations for tasks."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/parkinsons-law/ (read 2026-09-30)"
---
# Parkinson's Law
Yablonski: "Any task will inflate until all of the available time is spent."
Provenance: C. Northcote Parkinson, humorous essay, The Economist, 1955; reprinted in Parkinson's Law: The Pursuit of Progress (John Murray, 1958), per site. Flag: OVERSTATED as a law; ESSAY, NOT A STUDY.
Caveat: "Timeless demonstrations of Parkinson's first law", doi:10.3758/BF03210823, reports an individual-level demonstration with two exact replications; its reference list includes "Beyond Parkinson's law: A failure to replicate". Evidence mixed. [INFERRED] The UX reading (user task time) extends the essay's bureaucratic claim.

## Rules
- [DIRECT] Keep task time within what users expect; use autofill.
- [INFERRED] Never cite Parkinson alone above Consider. Pair with Working Memory for re-entry findings.

## Detect (Assay)
- LUX-PARK-01 Should-fix (cite with LUX-WMEM-03): the user re-enters a value the system already holds.
- LUX-PARK-02 Consider: a long task shows no expected duration.

## DealReady
Pass: a new diligence memo pre-fills company, round, and data room from the deal record, each editable.
Fail: a blank form asking for the deal name already in context.

## Fybr
Pass: a new survey inherits site, units, coordinate system, and base-surface method from the last survey there, each visible.
Fail: the surveyor re-selects the coordinate system every visit.
```

### motor-time/goal-gradient.md

```markdown
---
name: goal-gradient
family: motor-and-time
laws: [Goal-Gradient Effect]
load_when: "Multi-step flows and progress displays: onboarding, review queues, capture walks, processing stages."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/goal-gradient-effect/ (read 2026-09-30)"
---
# Goal-Gradient Effect
Yablonski: "The tendency to approach a goal increases with proximity to the goal."
Provenance: Hull 1932, Psychological Review 39(1):25-43, doi:10.1037/h0072640; Kivetz, Urminsky & Zheng 2006, JMR 43(1):39-58, doi:10.1509/jmkr.43.1.39 (both recalled, spot-check). Flag: VERIFIED as origin; site Origins text reads as quoted from Kivetz et al.
Caveat [INFERRED]: human evidence is from reward programs (purchase acceleration, "illusionary goal progress"); faking progress in a trust product misleads.

## Rules
- [DIRECT] Show clear progress toward completion.
- [DIRECT, RESTRICTED] Yablonski endorses artificial progress. [INFERRED] Banned in DealReady; allowed in Fybr only as a real head start (e.g. steps already done by import).

## Detect (Assay)
- LUX-GOAL-01 Blocking (DealReady): a progress figure counts items not actually complete.
- LUX-GOAL-02 Should-fix: a multi-step flow with no progress indication.
- LUX-GOAL-03 Consider: equal-width steps hiding that one step holds most of the effort.

## DealReady
Pass: "31 of 48 claims verified" counts only claims with a source-confirmed status.
Fail: the bar starts at 20 percent "to motivate".

## Fybr
Pass: walk-around capture shows perimeter coverage from the GPS track.
Fail: a three-step stepper where step 2 is 80 percent of the work.
```

### motor-time/flow.md

```markdown
---
name: flow
family: motor-and-time
laws: [Flow]
load_when: "Repetitive expert loops: keyboard-first review, vertex editing, bulk triage; deciding novice versus expert modes."
budget: "<= 40 lines, <= 500 tokens"
source: "https://lawsofux.com/flow/ (read 2026-09-30)"
---
# Flow
Yablonski: "...fully immersed in a feeling of energized focus..."
Provenance: Csikszentmihalyi, 1975 per site (read via subagent). Primary work not located this pass. Flag: NOT VERIFIED (primary).
Caveat [INFERRED]: flow research concerns optimal experience broadly; it predicts no latency or layout value. Use for challenge-skill fit and interruption, not speed numbers.

## Rules
- [DIRECT] Match challenge to skill; too hard frustrates, too easy bores.
- [DIRECT] Give feedback on what was done and accomplished.
- [INFERRED] Expert loops never interrupt per item (no modal per accept); confirm in batches or make undoable.
- [INFERRED] Novice and expert modes are the challenge-skill lever; state which mode a screen serves.

## Detect (Assay)
- LUX-FLOW-01 Should-fix: a modal or focus loss after each item in a repeated expert loop.
- LUX-FLOW-02 Should-fix: a repeated action has no keyboard path in a keyboard-first product.
- LUX-FLOW-03 Consider: a screen serves novice and expert with one density and no mode.

## DealReady
Pass: j/k move between claims, a accepts, d disputes, focus stays in the table, undo in the toast.
Fail: a confirm dialog after every accept.

## Fybr
Pass: surveyor mode edits vertices continuously with undo; novice mode offers guided steps.
Fail: a "save vertex?" prompt after each drag.
```

### Batch plan for the remaining 19 files

- **Batch 2 (next session): perception and memory-emotion, 10 files.** proximity, similarity, common-region, uniform-connectedness, pragnanz, selective-attention, von-restorff, serial-position, peak-end, zeigarnik. Before writing them, fetch the Proximity, Selective Attention and Prägnanz pages directly, because their takeaways were not captured. The Zeigarnik file must carry the Ghibellini and Meier 2025 caveat and route "resume where you left off" rules to the Ovsiankina finding.\[2\] The Peak-End file needs a scope check: I found no cited critique this pass, so it ships without one rather than with an invented one.
- **Batch 3: expectation and systems, 9 files.** jakobs-law, mental-model, aesthetic-usability, teslers-law, postels-law, occams-razor, pareto, paradox-active-user, cognitive-bias.
  - Postel must cite RFC 761 §2.10 and RFC 9413 (June 2023).
  - Aesthetic-usability must cite Kurosu and Kashimura 1995 (CHI '95 Companion, pp. 292–293, doi:10.1145/223355.223680, confirmed in Crossref).\[57\] It should also note that the effect concerns *perceived* ease of use; some retellings, such as Shopify's partner blog, misstate it as a correlation with "actual ease of use".\[27\]\[58\]
  - For Common Region and Uniform Connectedness, check whether they come from Palmer's work in the 1990s rather than classical Gestalt. This is Plumb's lead only and is not yet verified.

## The Provenance Table (save as /docs/references/laws-of-ux/PROVENANCE.md)

Flag key:
- **V**: the record was seen live this pass (Crossref, publisher or index page).
- **R**: the record was supplied by the research subagent without a live check. Spot-check the DOI before relying on it.
- **O**: the popular statement goes beyond the source.
- **C**: contested by later evidence.
- **E**: the source is an essay, interview or coinage, not a study.
- **NF**: the original was not located this pass.

| Law | Original source | Flag | Note |
|---|---|---|---|
| Aesthetic-Usability | Kurosu & Kashimura 1995, "Apparent usability vs. inherent usability", CHI '95 Companion pp. 292–293, doi:10.1145/223355.223680; Tractinsky, Katz & Ikar 2000, *Interacting with Computers* 13(2):127–145, doi:10.1016/S0953-5438(00)00031-X | V (Kurosu), R (Tractinsky), O in retellings | Two-page companion paper; concerns perceived usability\[57\] |
| Choice Overload | Toffler 1970 (term); Iyengar & Lepper 2000, JPSP 79(6):995–1006, doi:10.1037/0022-3514.79.6.995 | R, C | Scheibehenne et al. 2010, doi:10.1086/651235 (V): mean effect "virtually zero"\[1\] |
| Chunking | Miller 1956, *Psych. Review* 63(2):81–97, doi:10.1037/h0043158 | R | |
| Cognitive Bias | Tversky & Kahneman 1972 per site | NF (primary not located) | Year taken from the site via subagent\[30\] |
| Cognitive Load | Sweller 1988, *Cognitive Science* 12(2):257–285, doi:10.1207/s15516709cog1202_4 | R, title mismatch on site | Instructional-design origin |
| Doherty Threshold | Doherty & Thadani, "The Economic Value of Rapid Response Time", IBM, Nov 1982 | Partially V, O | Venue and 400 ms not confirmed in the text read\[20\] |
| Fitts's Law | Fitts 1954, JEP 47(6):381–391, doi:10.1037/h0055392 | R | |
| Flow | Csikszentmihalyi 1975 per site | NF (primary) |\[33\] |
| Goal-Gradient | Hull 1932, *Psych. Review* 39(1):25–43, doi:10.1037/h0072640; Kivetz, Urminsky & Zheng 2006, JMR 43(1):39–58, doi:10.1509/jmkr.43.1.39 | R | Human evidence comes from reward programs |
| Hick's Law | Hick 1952, QJEP 4(1):11–26, doi:10.1080/17470215208416600; Hyman 1953, JEP 45(3):188–196, doi:10.1037/h0056940 | R, O | Site's "team, 1952" framing is inaccurate; scope limited to known options |
| Jakob's Law | Coined by Jakob Nielsen (2000 per Yablonski's 2018 article) | E, NF (original Nielsen column not located) | A coinage, not a study\[10\] |
| Common Region | "Gestalt psychologists" per site | NF | Possible Palmer origin; lead only, unverified\[37\] |
| Proximity | [NOT CAPTURED] | NF | |
| Prägnanz | Wertheimer, 1910 insight per site | NF (primary) | The subagent notes the formal paper dates to 1923; unverified\[38\]\[59\] |
| Similarity | "Gestalt psychologists" per site | NF | |
| Uniform Connectedness | [NOT CAPTURED] | NF | Possible Palmer & Rock origin; lead only, unverified |
| Mental Model | [NOT CAPTURED] | NF | |
| Miller's Law | Miller 1956, doi:10.1037/h0043158; counterpoint Cowan 2001, BBS 24(1):87–114, doi:10.1017/S0140525X01003922 | R, O | Yablonski warns against the misuse himself |
| Occam's Razor | William of Ockham per site | E | Philosophical principle\[43\] |
| Paradox of the Active User | Carroll & Rosson 1987, in *Interfacing Thought*, MIT Press, pp. 80–111 (subagent; page range recalled) | R | Book chapter, no DOI |
| Pareto Principle | Vilfredo Pareto per site | E, NF (primary) | An observation, not a UX study\[45\] |
| Parkinson's Law | Parkinson 1955, *The Economist* essay; book 1958 | E, O | Empirical test doi:10.3758/BF03210823 (V, index page); mixed evidence\[4\]\[60\] |
| Peak-End Rule | Kahneman, Fredrickson, Schreiber & Redelmeier 1993, *Psych. Science* 4(6):401–405, doi:10.1111/j.1467-9280.1993.tb00589.x | R | No cited critique located; none added |
| Postel's Law | RFC 760 and RFC 761 (Postel, Jan 1980), https://www.rfc-editor.org/rfc/rfc761 | R | Protocol guidance. RFC 9413 (Thomson & Schinazi, IAB, 27 June 2023, doi:10.17487/RFC9413) warns that "Overapplication of the robustness principle" creates "interoperability problems over time". An earlier version appears in IEN 111 (1979), per a secondary source\[14\]\[16\]\[61\] |
| Selective Attention | Broadbent 1958 per site (subagent) | NF (primary) |\[51\] |
| Serial Position | Ebbinghaus (term) per site; Murdock 1962, JEP 64(5):482–488, doi:10.1037/h0045106 | R | |
| Tesler's Law | Tesler interview in Saffer, *Designing for Interaction* | E | Tognazzini's counterpoint appears on the site itself\[13\] |
| Von Restorff | von Restorff 1933, *Psychologische Forschung* 18:299–342, doi:10.1007/BF02409636 | V |\[54\]\[62\] |
| Working Memory | Miller, Galanter & Pribram (1960s); Atkinson & Shiffrin 1968 per site | NF (primary) |\[55\] |
| Zeigarnik | Zeigarnik 1927, *Psychologische Forschung* 9:1–85, doi:10.1007/BF02409755 | R, C | Ghibellini & Meier 2025 (V): "lacks universal validity"\[2\] |

## How It Plugs In

- **Location.** Files live in /docs/references/laws-of-ux/, using the layout above. PROVENANCE.md sits in the same folder but is excluded from default loading.
- **Load order.**
  1. DESIGN.md
  2. The brief
  3. states.md and anti-patterns.md, as the task needs them
  4. index.md
  5. At most three law files

  DESIGN.md wins every conflict. A law file can justify a finding but can never override a token, a component rule or an anti-pattern. If a law file seems to contradict DESIGN.md, Assay files that as a Consider finding addressed to Plumb, not as a defect in the build.
- **Routing: both methods, with a fixed order of precedence.** The task-type index routes first, and it is what the role prompts name. The `load_when` line in each file is the fallback for task types the index does not list. Assay may also use it to check whether a law it wants to cite actually applies to the screen.
- **ui-critic skill.** Put one line in /.claude/skills/ui-critic/SKILL.md: "Before scoring, read /docs/references/laws-of-ux/index.md and load at most three law files for the task type. Cite rule IDs (e.g. LUX-HICK-01)." Keeping this one hop from SKILL.md follows Anthropic's progressive-disclosure model: the metadata is always loaded at about 100 tokens, the body loads on trigger and stays under 5k tokens, and bundled files load as needed.\[21\] The ui-critic `description` should say it scores UI screenshots against DESIGN.md and Laws of UX rule IDs, so that it triggers on critique tasks. [INFERRED] Claude Code reads the law files from the repo by path, like any project file, because they sit outside the skill directory. Check on the first run that the reads actually happen.
- **frontend-design and ui-diverge.** Point these at the index only, and only for the layout step. Aesthetic skills never load law files for choosing type or colour; that is thread 04's territory.
- **Role prompts.**
  - Assay: "Findings cite a rule ID; a finding without one is Consider at most."
  - Vesper: "Before handing off a screen, list the laws the index loads for its task type and state how each is met."
  - Threshold: "Law files never set WCAG thresholds; target size, contrast and focus come from your files."
- **Size budget.**
  - Each law file: 40 lines or fewer, 500 tokens or fewer.
  - index.md: 80 lines or fewer, 900 tokens or fewer.
  - Three law files therefore come to 1,500 tokens or fewer, which is less than one DESIGN.md page as defined in the Assumptions list.
  - A CI lint enforces this: it counts lines and tokens, and fails if a file lacks `load_when`, lacks at least one rule ID, or lacks both a DealReady and a Fybr section.
  - The delivered files are close to the budget but have not been measured by a tokenizer. The first lint run is what confirms them.

## The Input Checklist

"URL status" means one of two things. **Fetched** means I retrieved the page on 2026-09-30. **Known** means the URL is from Plumb's knowledge and was not fetched this pass; the acquiring thread must verify and date it.

| Item | One-line reason | Primary source URL (status) | Disposition |
|---|---|---|---|
| Nielsen's 10 usability heuristics | Heuristic-level vocabulary Assay cites next to the laws; covers error recovery and help, which Laws of UX lacks | https://www.nngroup.com/articles/ten-usability-heuristics/ (fetched via search 2026-09-30; language refined 2020, heuristics unchanged since 1994; no 2024 rewording found) | Acquire directly: one file per heuristic in the same pattern, same index\[23\]\[26\] |
| NN/g response-time limits (0.1 / 1 / 10 s) | Gives Doherty the NN/g response-time limits a practitioner can check against | https://www.nngroup.com/articles/response-times-3-important-limits/ (known) | Acquire directly: a section of doherty-threshold.md, not a new file |
| NN/g complex-applications heuristics | Dense-application variants of the heuristics that fit DealReady and Fybr | https://www.nngroup.com/articles/usability-heuristics-complex-applications/ (fetched via search 2026-09-30) | Acquire directly, as examples inside the heuristic files\[63\] |
| WCAG 2.2 success criteria, trigger-description pattern | Threshold's domain; same `load_when` pattern so the index can route to it | https://www.w3.org/TR/WCAG22/ (known) | Needs a new thread (Primer A), led by Threshold |
| ARIA Authoring Practices Guide | Keyboard patterns (grid, listbox, dialog) behind DealReady's keyboard-first table | https://www.w3.org/WAI/ARIA/apg/ (known) | Needs a new thread (folded into Primer A) |
| Gestalt principles | Already covered by the perception family on lawsofux.com | https://lawsofux.com/law-of-common-region/ (fetched via search) | Covered by Batch 2; do not acquire separately. Closure and Continuity are named on the site's Origins text but have no pages; ruled out\[37\]\[40\] |
| Apple HIG and Material Design 3 | Convention rulings (Jakob's Law needs a named convention to point to) | https://developer.apple.com/design/human-interface-guidelines/ ; https://m3.material.io/ (known) | Needs a new thread (Primer B) |
| Anthropic prompting for frontend aesthetics | Anti-slop direction for the aesthetic layer | https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics (fetched via search 2026-09-30) | Route to thread 04 |
| Shift Nudge UI and accessibility checklists | Already in hand | [held by thread 06] | Route to thread 06; accessibility items cross-checked by Threshold |
| Refactoring UI canon rules | Visual hierarchy and spacing rules | [held by thread 08] | Route to thread 08 |
| Motion law (animations.dev / Emil Kowalski) | Motion timing; overlaps Doherty's animation takeaway | [held by thread 07] | Route to thread 07; Doherty defers to it on motion |
| Growth.Design case studies | Narrative walkthroughs that restate the same psychology principles secondhand | Not fetched | Ruled out (it would displace primary sources); inventory only in thread 11 |
| Tognazzini, First Principles of Interaction Design | Adds a few items Nielsen does not have (latency reduction, anticipation, protect users' work); counterpoint to Tesler | https://asktog.com/atc/principles-of-interaction-design/ (known) | Acquire directly, only the items Nielsen does not already cover, 5 files at most |
| Shneiderman, Eight Golden Rules | Almost entirely covered by Nielsen's heuristics | https://www.cs.umd.edu/users/ben/goldenrules.html (known) | Ruled out; named here so nobody adds it by accident |
| GOV.UK Design System patterns | Tested error-summary, error-message and question-page conventions | https://design-system.service.gov.uk/ (known) | Acquire directly: error summary, error message, validation, question pages only |
| Baymard Institute | Checkout-specific and paywalled | https://baymard.com/ (known) | Ruled out unless Fybr self-serve adds a purchase flow; revisit then |
| GIS and map UI conventions | Map-first layout, measurement display, field conditions | Esri Calcite: https://developers.arcgis.com/calcite-design-system/ ; Mapbox docs: https://docs.mapbox.com/ (known) | Needs a new thread (Primer C) |
| Dense data-table and diff guidance | DealReady's core surfaces; Laws of UX says nothing on table density | NN/g data-table articles (URL to locate) | Needs a new thread (Primer D) |
| Laws of UX book (2nd ed., O'Reilly, Jan/Feb 2024) | Book-only concepts (Complexity Bias) | https://www.oreilly.com/library/view/laws-of-ux/9781098146955/ (fetched via search) | Route to thread 12, inventory only; book-only content stays [NOT IN SOURCE] |
| .md toolkit placement | Where these files sit among other .md conventions | [thread 14] | Route to thread 14 |

## Acquisition Primer Prompts

### Primer A: WCAG 2.2 and APG as trigger-routed reference files

```markdown
Model tier: Opus-class (standards interpretation; errors are costly).
Inject (role): Threshold, accessibility auditor. Alembic discipline governs extraction.
Attach: /docs/references/laws-of-ux/index.md, one delivered law file (as the format), DESIGN.md.
Expected output: fenced .md files for /docs/references/wcag22/ plus an index, ready to save.

Assignment: Turn WCAG 2.2 success criteria and the ARIA APG patterns DealReady and Fybr use into one-file-per-criterion references with the same frontmatter as Laws of UX.
Decision served: Assay and Threshold need to cite "fails 2.5.8 Target Size (Minimum) [WCAG-258-01]" instead of "too small", and the index must route WCAG files by task type.
Corpus: W3C WCAG 2.2 Recommendation (primary, date the version); Understanding WCAG 2.2 documents; ARIA APG patterns: grid, listbox, combobox, dialog, disclosure, tabs.

The ask:
1. Verify the current WCAG 2.2 Recommendation date and any errata; list criteria new in 2.2.
2. Select the criteria the index task types trigger (table, form, error state, destructive action, map interaction, loading, navigation). Justify each exclusion.
3. For each: frontmatter (name, level, task triggers, load_when), criterion in W3C words (short quote), testable conditions, rule IDs with Blocking / Should-fix / Consider, one DealReady and one Fybr application.
4. APG: grid pattern for the claims table (keyboard map), dialog for destructive confirms. Mark where APG is guidance, not conformance.
5. Map field conditions (glare, gloves) to criteria and state where WCAG says nothing.
6. Extend index.md rows; state the 3-file cap still holds across both folders.

Evidence rules: W3C is primary; quote briefly; date everything; label verified / secondary / judgment; mark not found.
Output shape: verdict paragraph; files; index delta; list of criteria excluded, with reasons; assumptions.
Done means: Assay can cite a WCAG rule ID by file, and Threshold's acceptance criteria reference the same IDs.
Not wanted: all 86 criteria copied; conformance advice outside the triggered set; restated WCAG prose.
```

### Primer B: Platform conventions (Apple HIG, Material Design 3)

```markdown
Model tier: Sonnet-class.
Inject (role): Envoy (researcher), reviewed by Plumb.
Attach: index.md; a Jakob's Law stub; DESIGN.md.
Expected output: fenced .md convention files in /docs/references/conventions/.

Assignment: Extract the conventions that decide Jakob's Law rulings for DealReady (web, keyboard-first) and Fybr (tablet and phone in the field).
Decision served: "violates Jakob's Law" must name the convention it breaks, with a source.
Corpus: Apple Human Interface Guidelines (developer.apple.com/design/human-interface-guidelines); Material Design 3 (m3.material.io). Date each page read.

The ask:
1. List conventions that matter for: tables/lists, sheets and side panels, destructive confirmation, undo, toasts/snackbars, map controls, touch target guidance, dark/outdoor modes.
2. For each: platform, rule in its words (short quote), URL, date read, where Apple and Material disagree.
3. Rule which platform governs each Fybr surface, with reasons.
4. Give rule IDs Assay can cite, with severity.
5. Flag conventions that conflict with DESIGN.md; DESIGN.md wins, and say so.

Evidence rules: vendor pages only; date every claim; no third-party summaries.
Output shape: verdict; convention files; conflict table; assumptions.
Done means: every Jakob's Law finding can name a convention file and rule ID.
Not wanted: visual style guidance, iconography catalogs, platform marketing language.
```

### Primer C: GIS and map-first field UI conventions

```markdown
Model tier: Opus-class (thin, scattered sources).
Inject (role): Envoy, with Tribune consulted for surveyor versus novice needs.
Attach: index.md; fittss-law.md and doherty-threshold.md as format; Fybr brief if one exists.
Expected output: fenced .md files for /docs/references/map-ui/.

Assignment: Build the map-UI reference Laws of UX lacks: map-first layout, measurement and unit display, confidence display, layer control, and field conditions.
Decision served: Fybr screens need citable rules for units always visible, confidence shown, and glove / glare / one-hand use.
Corpus: Esri Calcite Design System and ArcGIS Field Maps documentation; Mapbox documentation; any published research on outdoor display readability and gloved touch input (locate, cite with DOI).

The ask:
1. Locate and date primary pages for map control placement, scale/units display, measurement tools, and layer lists.
2. Locate research on sunlight readability and gloved touch accuracy; report whether any gives numbers usable in DESIGN.md tokens.
3. Write per-rule files with load_when, rules labelled [SOURCE] or [INFERRED], rule IDs with severity, and Fybr plus one non-Fybr counterexample.
4. Say what the sources do not cover (uncertainty display for volumes) and mark it not found.

Evidence rules: vendor docs and papers primary; date all; no listicles; mark gaps.
Output shape: verdict; files; gaps list; assumptions.
Done means: a Fybr map screen can be critiqued with cited rule IDs for units, confidence, and field conditions.
Not wanted: GIS analysis methods, cartographic style theory, vendor feature comparisons.
```

### Primer D: Dense data tables and document diff

```markdown
Model tier: Sonnet-class.
Inject (role): Envoy, reviewed by Vesper.
Attach: index.md; working-memory.md and chunking.md as format; DealReady claims-table brief.
Expected output: fenced .md files for /docs/references/dense-ui/.

Assignment: Acquire citable guidance for dense-but-calm tables, provenance display, and document diff.
Decision served: DealReady's core surfaces need rules beyond Laws of UX: row density, column alignment, sort/filter affordances, inline versus side-by-side diff.
Corpus: NN/g articles on data tables and complex applications (locate and date); design-system table documentation from at least two public systems (name and date them); any HCI research on diff presentation (locate or mark not found).

The ask:
1. Locate primary sources; date each.
2. Extract rules for: density modes, numeric alignment, sticky headers, row actions, selection, keyboard navigation (defer to Threshold's APG grid file), diff layouts.
3. Write rule files with rule IDs and severity; DealReady application plus a non-DealReady counterexample.
4. State conflicts between sources and rule on them with reasons.

Evidence rules: primary only; date all; label; mark not found.
Output shape: verdict; files; conflict rulings; assumptions.
Done means: Assay can score the claims table and diff view with cited table and diff rule IDs.
Not wanted: component code, visual styling, generic "clean tables" advice.
```

## Convergence Test Results

- **Swap test: passes for the eleven delivered files, with one known weak spot.** Every application names a DealReady surface (citation chip, claims-table row actions, v3/v4 diff, verified-claim count, memo prefill) or a Fybr surface (base-surface method, toe line, glove thumb zone, coordinate units, survey compare), and none of them would read the same in another product. The weak spot is Fybr's base-surface method selection, which rests on an assumption about Fybr's feature set. See the assumptions list.
- **Enforceability test: passes, with limits.** There are 31 rule IDs across eleven files, and each has a severity.
  - Grep or CI can catch: LUX-MILL-01, the budget lint, and missing sections.
  - Playwright traces can catch: LUX-DOHE-01 and LUX-DOHE-03.
  - Assay scoring screenshots can catch: most of the rest.
  - Still needs judgement: LUX-HICK-01 depends on the brief naming an "expected action", so briefs must name one. LUX-FITT-01 depends on DESIGN.md defining field target and thumb-zone tokens, and those do not exist yet.
- **Displacement test: named, and the damage is limited.** Three law files cost at most 1,500 tokens, which is less than one DESIGN.md page under the stated assumption. What they push out is the rest of the laws, which is intended. They also crowd the context shared with DESIGN.md, which is why DESIGN.md loads first and wins. The checklist displaces Shneiderman, Baymard, Growth.Design and the Gestalt Closure and Continuity entries, and all of those are named as ruled out. Nielsen's heuristics add up to ten more routable files, so the three-file cap per task counts heuristics and laws together.
- **Agent-readability test: passes for delivered files, fails for [B2]/[B3] rows until those land.** Given DESIGN.md, a brief, the index and three files, a coding agent can apply the rules and Assay can cite them. The index tells agents to skip unwritten files and not improvise them. The remaining risk is in the rules that need tokens (LUX-FITT-01) and the rules that need the brief to name the expected action (LUX-HICK-01).

## Recommendations

1. Create the folder and the eleven files now. Add the CI lint for line and token budgets and required sections before Batch 2.
2. Spot-check every DOI flagged R against Crossref before PROVENANCE.md is treated as verified. Do Hick, Fitts, Miller and Sweller first, because Assay will cite those most.
3. Add two tokens to DESIGN.md: a field-mode target size and a one-hand thumb zone. Also add a rule that briefs must name the expected action at each decision point. Without these, LUX-FITT-01 and LUX-HICK-01 cannot be enforced.
4. Run Batch 2 next, then Batch 3. Start Primer A (Threshold) in parallel, because WCAG rows share the index.
5. Record two rulings in anti-patterns.md: no artificial latency and no artificial progress in DealReady. Both overrule takeaways Yablonski publishes, and anti-patterns.md is the right place for that.

## Assumptions

- [ASSUMPTION: one DESIGN.md page = about 60 lines, about 1,600 tokens; the 1,500-token cap for three law files is set against this.]
- [ASSUMPTION: Fybr's self-serve product lets the user choose among more than one base-surface method; if not, the Hick and Choice Overload Fybr applications need a different decision point.]
- [ASSUMPTION: DealReady rows have a "source" jump, verification status and a row menu, as the standing briefing's "provenance on every AI claim" implies.]
- [ASSUMPTION: Claude Code reads repository files outside the skill directory when SKILL.md names their path; verify on the first ui-critic run.]
- [ASSUMPTION: the token counts per file are estimates until the lint runs.]
- [ASSUMPTION: "known" URLs in the checklist are still live; each acquiring thread verifies and dates them.]

## Caveats

- For about half the laws I read the lawsofux.com pages through search-result extracts, and some takeaways reached me through the research subagent. Those are marked, and anything missing is [NOT CAPTURED], not filled in.
- Most original-study DOIs came from the subagent's recall, not a live lookup. Only von Restorff and Kurosu & Kashimura were confirmed in Crossref, and Scheibehenne and Ghibellini & Meier were confirmed on index or publisher pages.
- The Hick and Fitts scope caveats rest on Wikipedia, a secondary source, and are labelled as such.
- I found no cited critique of the Peak-End Rule this pass, so none is included.

## Sources (all accessed 2026-09-30 unless noted)

- lawsofux.com home page (30-law list, poster banner, © 2026, CC BY-NC-ND 4.0), and law pages as returned by search: Hick, Miller, Fitts, Doherty, Cognitive Load, Choice Overload, Chunking, Working Memory, Goal-Gradient, Parkinson, Jakob, Mental Model, Tesler, Postel, Aesthetic-Usability, Serial Position, Von Restorff, Common Region, Uniform Connectedness, Prägnanz, Peak-End, Paradox of the Active User, Selective Attention, Zeigarnik, Flow.
- lawsofux.com/book/ (2nd edition new concepts and considerations); lawsofux.com/articles/2018/the-psychology-of-design/.
- O'Reilly, *Laws of UX, 2nd Edition* listing (January 2024, 186 pp.) and Chapter 1 preview; Booktopia (paperback 6 February 2024, 168 pp., ISBN 9781098146962); jonyablonski.com 2nd edition announcement (2024).
- Scheibehenne, Greifeneder & Todd 2010, Semantic Scholar record, doi:10.1086/651235; Chernev et al. 2010 commentary PDF (chernev.com).
- Ghibellini & Meier 2025, nature.com/articles/s41599-025-05000-w (published 1 July 2025).
- Doherty & Thadani 1982 reproduction (Jim Elliott's Mainframe Blog, © IBM 1982, 1997); PMC3540488 reference to the paper; book-derived note citing IBM GE20-0752-0 (Obsidian Publish, secondary).
- "Timeless demonstrations of Parkinson's first law", link.springer.com, doi:10.3758/BF03210823.
- Crossref records (via subagent): doi:10.1007/BF02409636 (von Restorff 1933); doi:10.1145/223355.223680 (Kurosu & Kashimura 1995).
- RFC 9413, "Maintaining Robust Protocols", M. Thomson and D. Schinazi, IAB, 27 June 2023, doi:10.17487/RFC9413 (rfc-editor.org).
- Claude Platform Docs, Agent Skills overview (progressive disclosure levels, required fields); Anthropic, "The Complete Guide to Building Skills for Claude" (PDF); Claude Platform Docs, "Skill authoring best practices" (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices: SKILL.md body under 500 lines, references one level deep, table of contents over 100 lines, name 64 and description 1,024 character limits).
- Claude Cookbook, "Prompting for frontend aesthetics" (platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics); authorship and October 2025 date per aidesigner.ai (secondary).
- NN/g, "10 Usability Heuristics for User Interface Design" (2020 update note); NN/g, "10 Usability Heuristics Applied to Complex Applications".
- Jakob Nielsen, "How I Developed the 10 Usability Heuristics" (uxtigers.com/post/usability-heuristics-history, 2024) and "The 10 Usability Heuristics Reimagined" (uxtigers.com).
- Wikipedia, "Hick's law", "Fitts's law", "Robustness principle", "Parkinson's law" (secondary, scope notes only).
- Shopify partners blog "UX laws" (example of the aesthetic-usability misstatement, secondary).

## Sources

1. [\[PDF\] Can There Ever Be Too Many Options? A Meta-Analytic Review of Choice Overload](https://www.semanticscholar.org/paper/Can-There-Ever-Be-Too-Many-Options-A-Meta-Analytic-Scheibehenne-Greifeneder/07775d812c00a97aaa57b55596b39e26b8baaa0b)
2. [Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects](https://www.nature.com/articles/s41599-025-05000-w)
3. [Miller’s Law](https://lawsofux.com/millers-law/)
4. [Parkinson’s Law](https://lawsofux.com/parkinsons-law/)
5. [Home | Laws of UX](https://lawsofux.com/)
6. [Laws of UX 2nd edition](https://www.vitalsource.com/products/laws-of-ux-jon-yablonski-v9781098146924)
7. [Laws of UX by Jon Yablonski](https://www.booktopia.com.au/laws-of-ux-jon-yablonski/book/9781098146962.html)
8. [Laws of UX, 2nd Edition \[Book\]](https://www.oreilly.com/library/view/laws-of-ux/9781098146955/)
9. [Book](https://lawsofux.com/book/)
10. [The Psychology of Design](https://lawsofux.com/articles/2018/the-psychology-of-design/)
11. [www.oreilly.com](https://www.oreilly.com/library/view/laws-of-ux/9781098146955/ch01.html)
12. [Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects](https://colab.ws/articles/10.1057/s41599-025-05000-w)
13. [Tesler’s Law](https://lawsofux.com/teslers-law/)
14. [Robustness principle](https://en.wikipedia.org/wiki/Robustness_principle)
15. [RFC 9413: Maintaining Robust Protocols | RFC Editor](https://www.rfc-editor.org/info/rfc9413/)
16. [RFC 9413 - Maintaining Robust Protocols](https://datatracker.ietf.org/doc/html/rfc9413)
17. [Doherty Threshold](https://lawsofux.com/doherty-threshold/)
18. [The Economic Value of Rapid Response Time](https://www.are.na/block/8372721)
19. [Doherty Threshold - Moses Second Brain - Obsidian Publish](https://publish.obsidian.md/mosessecondbrain/Obsidian+Publish/Doherty+Threshold)
20. [Jim Elliott's Mainframe Blog: The Economic Value of Rapid Response Time](https://jlelliotton.blogspot.com/p/the-economic-value-of-rapid-response.html)
21. [Agent Skills - Claude Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
22. [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
23. [10 Usability Heuristics for User Interface Design - NN/G](https://www.nngroup.com/articles/ten-usability-heuristics/)
24. [Nielsen's Heuristics - The Decision Lab](https://thedecisionlab.com/reference-guide/design/nielsens-heuristics)
25. [How I Developed the 10 Usability Heuristics](https://jakobnielsenphd.substack.com/p/usability-heuristics-history)
26. [The 10 Usability Heuristics Reimagined](https://jakobnielsenphd.substack.com/p/the-10-usability-heuristics-reimagined?open=false)
27. [Aesthetic-Usability Effect](https://lawsofux.com/aesthetic-usability-effect/)
28. [Choice Overload](https://lawsofux.com/choice-overload/)
29. [Chunking](https://lawsofux.com/chunking/)
30. [Cognitive Bias](https://lawsofux.com/cognitive-bias/)
31. [Cognitive Load](https://lawsofux.com/cognitive-load/)
32. [Fitts’s Law](https://lawsofux.com/fittss-law/)
33. [Flow](https://lawsofux.com/flow/)
34. [Goal-Gradient Effect](https://lawsofux.com/goal-gradient-effect/)
35. [Hick’s Law](https://lawsofux.com/hicks-law/)
36. [Jakob’s Law](https://lawsofux.com/jakobs-law/)
37. [Law of Common Region](https://lawsofux.com/law-of-common-region/)
38. [Law of Prägnanz](https://lawsofux.com/law-of-pr%C3%A4gnanz/)
39. [Law of Proximity](https://lawsofux.com/law-of-proximity/)
40. [Law of Similarity](https://lawsofux.com/law-of-similarity/)
41. [Law of Uniform Connectedness](https://lawsofux.com/law-of-uniform-connectedness/)
42. [Mental Model](https://lawsofux.com/mental-model/)
43. [Occam’s Razor](https://lawsofux.com/occams-razor/)
44. [Paradox of the Active User](https://lawsofux.com/paradox-of-the-active-user/)
45. [Pareto Principle](https://lawsofux.com/pareto-principle/)
46. [UX Principles Flashcards in R B's \*UX Collection](https://www.brainscape.com/flashcards/ux-principles-13134779/packs/16671458)
47. [Peak-End Rule](https://lawsofux.com/peak-end-rule/)
48. [Serial Position Effect](https://lawsofux.com/serial-position-effect/)
49. [Peak-End Rule](https://lawsofux.com/articles/2020/peak-end-rule/)
50. [Postel’s Law](https://lawsofux.com/laws/postels-law/)
51. [Selective Attention](https://lawsofux.com/selective-attention/)
52. [Laws of UX #4 : Cognitive Bias](https://community.algostudio.net/laws-of-ux-4-cognitive-bias/)
53. [Tesler’s Law](https://lawsofux.com/articles/2024/teslers-law/)
54. [Von Restorff Effect](https://lawsofux.com/von-restorff-effect/)
55. [Working Memory](https://lawsofux.com/working-memory/)
56. [Zeigarnik Effect](https://lawsofux.com/zeigarnik-effect/)
57. <https://api.crossref.org/works?query.bibliographic=Kurosu+Kashimura+Apparent+usability+vs+inherent+usability&rows=2&select=DOI,title,volume,page,issued,container-title>
58. [ux laws](https://www.shopify.com/partners/blog/ux-laws)
59. [What is the Law of Prägnanz? — updated 2026](https://ixdf.org/literature/topics/law-of-praegnanz)
60. [link.springer.com](https://link.springer.com/article/10.3758/BF03210823)
61. [Jon Postel](https://en.wikipedia.org/wiki/Jon_Postel)
62. <https://api.crossref.org/works?query.bibliographic=Restorff+1933+Wirkung+von+Bereichsbildungen+im+Spurenfeld&rows=2&select=DOI,title,volume,page,issued,container-title>
63. [10 Usability Heuristics Applied to Complex Applications - NN/G](https://www.nngroup.com/articles/usability-heuristics-complex-applications/)
