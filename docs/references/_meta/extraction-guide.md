---
title: Reference Library Extraction Guide
thread: Prompt 11 — newsletters, podcasts, and people
role: Alembic (research synthesizer)
save_to: /docs/references/_meta/extraction-guide.md
created: 2026-09-30
status: draft
source_status: awaiting approval
decision_served: Build a traceable /docs/references library that Taylor's role prompts and skills can cite, and that he can read to build his own mental model, for product-side work on Viewpoint.AI / DealReady (trust UI) and Fybr (spatial UI).
description: Read before running a practitioner extraction batch, for the scoring rubric, file standards and verification steps.
layer: references
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when: library batch
---

# Reference Library Extraction Guide

This guide covers four things:

1. How every source in the inventory gets scored for priority.
2. The order extraction runs in.
3. The batches Claude runs without help.
4. The tasks only Taylor can do, each graded so the list sorts itself.

All scores are **judgment**, labeled as such. They rest on the dated inventory of 2026-09-30. Re-score any source when its access, transcript status, or relevance changes.

---

## 1. Priority rubric — sources

Each source is rated **0.0 to 7.0** on seven areas. The priority score is the weighted mean, also on the 0.0 to 7.0 scale.

| # | Area | Weight | The question it answers | 0.0 looks like | 3.5 looks like | 7.0 looks like |
|---|---|---|---|---|---|---|
| DR | Decision relevance | 25% | Does it change how Taylor works at DealReady (trust UI, provenance, evals) or Fybr (spatial UI, confidence, field use), or how his role prompts behave? | Unrelated to either seat | Adjacent (general product craft) | Directly governs a live decision or a role prompt |
| PD | Principle density | 20% | What share of the material states rules, workflows, frameworks, or concrete values, rather than news or opinion? | News or reaction | Mixed; principles must be dug out | Almost every paragraph is a usable atom |
| DU | Durability | 15% | How long until the material is stale? | Dated within weeks (model and tool reviews) | About 1 year (tool-specific workflows) | Multi-year (discovery, positioning, quality) |
| PT | Primacy and traceability | 15% | Is it the author's own words, on their own platform, with stable locators (URL, heading, timestamp)? | Secondary summary, no locators | Primary but hard to locate (video with no transcript, X thread) | Primary text with stable headings |
| AC | Access cost | 10% | How cheaply can the verbatim source be obtained? Higher means easier. | Paywalled, and Taylor has no access | Needs Taylor's hand (transcription or login) | Free and fetchable by Claude now |
| LL | Library leverage | 10% | How many role prompts or skills will cite it (Plumb, Assay, Compass, Envoy, Alembic, Gloss, Threshold, Tally, ui-critic, ui-diverge)? | None | One role | Three or more roles, or a core skill |
| UQ | Uniqueness | 5% | Does another thread cover it (books, motion, Shift Nudge, Design+Code, Product Talk Academy, skills, Laws of UX)? | Fully covered elsewhere | Partial overlap | Nothing else in the plan covers it |

**Formula:**
`priority = 0.25*DR + 0.20*PD + 0.15*DU + 0.15*PT + 0.10*AC + 0.10*LL + 0.05*UQ`

**Tiers:**

| Tier | Score | What happens |
|---|---|---|
| **A** | 6.0 and above | Extract first; full candidate list. |
| **B** | 5.0 to 5.9 | Extract; the candidate list may be trimmed to the top 5. |
| **C** | 4.0 to 4.9 | Extract only once transcripts or access are in hand; scope to 3 items or fewer. |
| **D** | Below 4.0 | Do not extract. Keep in the index as "inventoried, not extracted". |

### 1a. Scored sources (judgment, 2026-09-30)

| Source | DR | PD | DU | PT | AC | LL | UQ | **Score** | Tier | Form |
|---|---|---|---|---|---|---|---|---|---|---|
| Hamel Husain (evals) | 7.0 | 6.5 | 6.0 | 6.5 | 6.5 | 5.5 | 6.0 | **6.4** | A | workflow |
| Anthropic engineering blog | 6.5 | 6.5 | 5.0 | 7.0 | 7.0 | 7.0 | 5.5 | **6.4** | A | principles |
| Teresa Torres (Product Talk blog) | 6.0 | 6.5 | 7.0 | 7.0 | 6.5 | 6.5 | 3.5 | **6.4** | A | glossary |
| Emil Kowalski (free essays) | 5.5 | 7.0 | 6.5 | 7.0 | 7.0 | 6.0 | 3.5 | **6.3** | A | values-and-examples |
| Anthropic frontend-aesthetics cookbook | 6.0 | 6.5 | 4.5 | 7.0 | 7.0 | 7.0 | 5.0 | **6.2** | A | values-and-examples |
| PostHog build mode (was Product for Engineers) | 6.0 | 6.0 | 5.5 | 7.0 | 7.0 | 5.5 | 6.0 | **6.1** | A | principles |
| Shreya Shankar | 6.0 | 5.5 | 6.5 | 7.0 | 6.5 | 4.5 | 6.0 | **6.0** | A | glossary |
| Marty Cagan (SVPG) | 5.5 | 5.5 | 6.5 | 7.0 | 7.0 | 6.0 | 4.0 | **6.0** | A | principles |
| Karri Saarinen (Linear) | 6.0 | 5.0 | 6.0 | 6.0 | 6.5 | 6.0 | 6.0 | **5.9** | B | principles |
| April Dunford | 5.0 | 6.0 | 6.5 | 6.5 | 6.0 | 4.5 | 4.0 | **5.7** | B | principles |
| Brian Balfour | 3.5 | 6.0 | 6.0 | 7.0 | 7.0 | 3.5 | 6.0 | **5.4** | B | glossary |
| Shreyas Doshi | 5.0 | 6.0 | 6.5 | 5.0 | 3.5 | 5.0 | 6.0 | **5.3** | B | glossary |
| Lenny's Newsletter + Podcast | 5.5 | 5.0 | 5.0 | 6.5 | 3.5 | 5.5 | 4.5 | **5.2** | B | principles |
| How I AI (Claire Vo) | 5.5 | 6.0 | 3.0 | 5.0 | 6.0 | 5.0 | 5.5 | **5.2** | B | workflow |
| Colin Matthews | 5.5 | 6.0 | 3.5 | 6.0 | 3.5 | 5.0 | 5.0 | **5.1** | B | workflow |
| Ryo Lu | 5.5 | 4.5 | 4.0 | 5.5 | 5.0 | 5.0 | 5.5 | **5.0** | B | principles |
| Just Now Possible (Torres) | 6.0 | 5.0 | 5.0 | 4.0 | 3.0 | 4.5 | 6.5 | **4.9** | C | workflow |
| Joey Banks | 4.0 | 5.5 | 4.5 | 6.0 | 5.0 | 4.0 | 5.0 | **4.8** | C | values-and-examples |
| Dive Club (Ridd) | 5.5 | 5.0 | 3.5 | 4.0 | 3.0 | 5.0 | 6.0 | **4.6** | C | workflow |
| Guillermo Rauch / v0 | 4.0 | 3.5 | 4.0 | 6.5 | 6.5 | 3.5 | 5.0 | **4.5** | C | principles |
| Figma Config 2026 (Field, Crisan) | 5.0 | 3.5 | 3.5 | 5.5 | 4.0 | 5.0 | 5.5 | **4.5** | C | glossary |
| Behind the Craft (Peter Yang) | 4.5 | 5.0 | 3.0 | 5.0 | 4.5 | 4.0 | 3.5 | **4.4** | C | workflow |
| DesignCourse (Gary Simon) | 3.0 | 4.5 | 5.0 | 3.0 | 2.5 | 3.0 | 2.5 | **3.5** | D | — |
| Juxtopposed | 2.5 | 3.5 | 4.0 | 3.0 | 2.5 | 3.0 | 4.0 | **3.1** | D | — |
| Theo (t3.gg) | 2.5 | 1.5 | 1.0 | 3.0 | 2.5 | 1.5 | 2.0 | **2.0** | D | — |
| Riley Brown | 1.5 | 1.0 | 0.5 | 3.0 | 2.5 | 1.0 | 1.5 | **1.5** | D | — |

**Routed elsewhere, not scored here:** Matt D. Smith (Shift Nudge thread), Meng To (Design+Code review), Paul Bakaus (skills thread), Loredana Crisan (folded into Config 2026 until an episode is found), Kowalski's animations.dev course (motion thread), and Torres's Product Talk Academy courses (Product Talk Academy review). Books by Cagan, Torres, Dunford, and Husain/Shankar go to the books thread.

---

## 2. Ground rules for every extraction

### What Claude can and cannot produce

- **Atoms are labeled paraphrase (P)**, each carrying an exact locator: the URL plus the heading or section, or a timestamp.
- **Verbatim is capped.** Claude includes at most one short verbatim anchor (under 15 words) per source per batch. The anchor is reserved for wording that is itself the point, such as a coined term's defining sentence.
- **Numbers and specs are exact.** Durations, easing curves, and thresholds are reproduced exactly as the source states them.
- **Longer verbatim capture is Task T7** (optional), done by Taylor in his local copy.
- **Fetched pages pass through a summarizing step.** Every file therefore goes through the independent verification in Section 4 before it is marked done.
- **The shell cannot reach most websites.** It can reach GitHub, which matters for Lenny's free starter repo and the Anthropic cookbook notebook. It cannot reach YouTube or X, so those items go to Taylor.

### Standing Alembic rules (from the role prompt)

- Nothing enters that was not in the source.
- Gaps are marked `[NOT IN SOURCE]`.
- Contradictions are recorded with both dates.
- "Taught" is kept separate from "only named".
- Inference goes only in a short, separate synthesizer's-notes section.
- No emoji.

---

## 3. File standards

### 3a. Folder layout

```
/docs/references/
  _meta/
    INDEX.md                  # every file: path, score, tier, coverage, last_extracted, review_by
    extraction-guide.md       # this file
    templates.md              # frontmatter + section skeletons below
    sweep-results.md          # Batch 0 output: resolved URLs, transcript status per item
  _raw/
    transcripts/<source>/<yyyy-mm-dd>-<slug>.txt   # Taylor-supplied, untouched
    captures/<source>/<slug>.md                     # saved page text, if any
  anthropic/  ai-building/  product/  design/  design-engineering/
```

### 3b. Frontmatter (every file)

```yaml
---
source: 
authors: []
source_type: blog | newsletter | podcast | video | paper | thread | docs
form: principles | workflow | values-and-examples | glossary
priority_score: 0.0
tier: A | B | C
canonical_url: 
items:
  - title: 
    url: 
    published: 
    accessed: 
    transcript_source: official | youtube-captions | hand | n/a
date_range: 
last_extracted: 
review_by:            # +90 days for tool/workflow sources, +365 for durable thinkers
coverage: "x of y candidates; missing: ..."
access: free | paywalled | mixed (paywalled portion: ...)
verification: "verifier sampled n/N atoms, n pass, yyyy-mm-dd"
overlaps_with: []
exclusions: []        # items deliberately not mined, with reason
---
```

### 3c. Atom IDs

Every atom gets a stable ID, `<slug>-<nn>` (for example `torres-12` or `hamel-04`). Role prompts and skills then cite atoms by ID, as in `[ref: hamel-04]`. IDs are never reused. If an atom is retracted, its ID is marked as retracted rather than deleted.

### 3d. Body skeleton, by form

Every file opens and closes the same way:

- **Opening:** "What this source is", in two lines.
- **Middle:** the form-specific table below.
- **Closing sections, in this order:**
  - Contradictions (each with both dates)
  - Taught vs only named
  - `[NOT IN SOURCE]` list
  - Synthesizer's notes: separate and short, covering where the source is strongest, what it does not cover, and which library file to read it beside.

**Principles file:**

| ID | Atom (P or V) | Locator | Scope and caveats the source attaches | Published |
|---|---|---|---|---|

**Workflow file:**

| ID | Step | Action (P) | Tools named | Input → output | Locator (timestamp or heading) |
|---|---|---|---|---|---|

A workflow file also carries three extra sections: preconditions, failure modes the source names, and what the source's demo skipped.

**Values-and-examples file:**

| ID | Value (P) | Concrete spec, exact | Context the source limits it to | Example given | Locator |
|---|---|---|---|---|---|

**Glossary file:**

| ID | Term | Definition (P) | First use (locator, date) | Related terms | Locator |
|---|---|---|---|---|---|

---

## 4. Process per batch

1. **Fetch.** Pull each item in the batch, section by section. Record the published date and the accessed date.
2. **Atomize.** One observation per row, with a locator on every row. Solution language stays inside the atom; scope limits go in the caveat column.
3. **Structure.** Keep the author's own order and terms. Do not regroup by Claude's categories.
4. **Mark.** Record contradictions, `[NOT IN SOURCE]` gaps, taught vs only named, and paywalled exclusions.
5. **Self-test.** Run the provenance, paraphrase, contradiction, gap, fidelity, separation, and decision tests from the Alembic role prompt, plus a staleness check that every item is dated.
6. **Independent verify.** A fresh subagent that has not seen the drafting samples the atoms and re-fetches each locator:
   - Sample size: at least 20% of atoms per file, and never fewer than 5.
   - Each sampled atom is marked pass or fail.
   - A file ships only at a 95% pass rate or better.
   - Failures are fixed or struck, and the verification line in the frontmatter is filled in.
7. **Deliver.** The batch's `.md` files are sent (or written straight into the connected folder, per Task T2), and INDEX.md is updated.
8. **Stop.** Claude waits for the go-ahead on the next batch.

---

## 5. Batches Claude runs alone

The order follows tier first, then how self-servable each batch is. Each batch starts only on Taylor's go.

| Batch | Sources (score) | Candidate items | Self-servable | Depends on Taylor | Output files |
|---|---|---|---|---|---|
| **0: Setup and sweep** | All | n/a | 100% | None | `_meta/INDEX.md`, `_meta/templates.md`, `_meta/sweep-results.md`, and the final transcription list |
| **1: Anthropic** | Engineering blog (6.4), cookbook (6.2) | 6 posts + 1 notebook | 100% | None | `anthropic/engineering-blog.md`, `anthropic/frontend-aesthetics-cookbook.md` |
| **2: Evals** | Hamel Husain (6.4), Shreya Shankar (6.0) | 3 to 5 posts + 1 paper + 4 posts | 100% | None | `ai-building/hamel-husain.md`, `ai-building/shreya-shankar.md` |
| **3: Discovery core** | Torres blog (6.4), Cagan (6.0) | 8 + 10 | 100% | None | `product/teresa-torres.md`, `product/marty-cagan.md` |
| **4: Craft values** | Kowalski (6.3), Saarinen (5.9), Joey Banks (4.8) | 6 + 4 + 2 | about 90% | T8 only if the Baseline issues turn out to be paywalled | `design-engineering/emil-kowalski.md`, `design/karri-saarinen.md`, `design-engineering/joey-banks.md` |
| **5: Product engineering** | PostHog build mode (6.1), Lenny free starter subset (5.2) | 6 + whatever overlaps in the starter pack | 100% for these | T4 for the paid Lenny archive | `product/posthog-build-mode.md`, `product/lenny-rachitsky.md` (partial) |
| **6: Positioning and frameworks** | Dunford (5.7), Balfour (5.4), Doshi (5.3) | 6 + 5 to 7 + 1 thread and 1 transcript | about 80% | T3 (Doshi thread) | `product/april-dunford.md`, `product/brian-balfour.md`, `product/shreyas-doshi.md` |
| **7: Workflows** | How I AI (5.2), Colin Matthews (5.1), Lenny paid remainder | 6 + 3 + selected | about 50% | T4 (Lenny access) | `ai-building/how-i-ai.md`, `ai-building/colin-matthews.md`, completing the Lenny file |
| **8: Transcript-dependent** | Ryo Lu (5.0), Just Now Possible (4.9), Dive Club (4.6), Config 2026 (4.5) | 3 to 5 + 3 + 4 + 2 | about 20% | T-list in Section 6 | `design/ryo-lu.md`, `ai-building/just-now-possible.md`, `design/dive-club.md`, `design/figma-config-2026.md` |
| **9: Optional tail** | Rauch (4.5), Behind the Craft (4.4) | 2 + 3 | about 80% | None | Only if approved after Batch 8 |
| **Not extracted** | DesignCourse, Juxtopposed, Theo, Riley Brown | — | — | — | INDEX entries only |

### Batch 0 in detail

Batch 0 runs first because it shrinks Taylor's workload.

**1. Resolve the NOT FOUND URLs.** These are:
- Linear Method
- Doshi's original LNO post
- Lenny's evergreen product-sense and PRD posts
- The Figma Config 2026 keynote, and the MCP / Code-to-Canvas sessions
- The Dive Club episode with Loredana Crisan
- The dates of the Dive Club Patrick Morgan, Grok Bot, and Kyle Zantos episodes
- Hamel Husain's LLM-as-a-Judge post and "A Field Guide to Improving AI Products"

**2. Sweep for transcripts before anyone transcribes by hand.** Check these for official transcripts:
- Product Talk's Just Now Possible episode pages
- Dive Club's deep-dive pages
- The a16z episode on Simplecast
- The UX Tools episode page
- How I AI's read pages, to see whether they are verbatim transcripts or written adaptations

Anything that turns up an official transcript drops off Taylor's list.

**3. Clone Lenny's free starter repo** (the publisher's own repo on GitHub). Map its 10 posts and 50 transcripts against the candidate list, so Task T4 only covers what is actually missing.

**4. Try the Doshi X thread once.** If the fetch fails, which is likely, T3 stands.

**5. Create INDEX.md and templates.md.** Then publish `sweep-results.md` with a final transcription list: confirmed URLs, confirmed lengths, and confirmed missing transcripts.

---

## 6. Tasks only Taylor can do (graded)

### 6a. Task rubric

Each task is rated 0.0 to 7.0 on four areas. The score is the plain mean.

| Area | Question | 0.0 | 7.0 |
|---|---|---|---|
| **Unblock value (UV)** | How much library output waits on this? | Nothing waits on it | A whole A or B file waits on it |
| **Yield per minute (YM)** | How many usable atoms per minute of Taylor's time? | Hours of work for a few atoms | Minutes of work for many atoms |
| **Irreplaceability (IR)** | Can Claude do it instead? | Claude can do it | Only Taylor can (login, YouTube, X, a purchase, a decision) |
| **Decay (DC)** | Does waiting make it harder or staler? | No cost to waiting | Content may vanish or date soon |

### 6b. Do now (no dependency on Batch 0)

| ID | Task | How | Time | UV | YM | IR | DC | **Score** |
|---|---|---|---|---|---|---|---|---|
| **T1** | Approve or adjust the rubric weights and batch order | Reply "go Batch 0", or give changes | 5 min | 7.0 | 7.0 | 7.0 | 3.0 | **6.0** |
| **T2** | Connect the repo folder so Claude writes files directly into `/docs/references` | In the Claude desktop app, "+" then "Add folder", and pick the repo root | 2 min | 5.0 | 7.0 | 7.0 | 2.0 | **5.3** |
| **T3** | Capture the Doshi framework thread (only if Batch 0's fetch fails) | Open https://x.com/shreyas/status/1399061782560350208, expand the full thread, and copy all posts with their numbers into `_raw/captures/doshi/framework-thread-2021-05-30.md`, with the URL and capture date at the top | 15 min | 5.0 | 6.0 | 6.0 | 4.0 | **5.3** |
| **T4** | Decide on Lenny archive access | (a) Already a paid subscriber: download the LennysData.com export, or connect its MCP here. (b) Not subscribed: decide whether the $200/year Annual tier (as listed on 2026-09-30, which also includes Product Pass) is worth it, or run with the free starter pack only. This is a purchase decision, so it is Taylor's call. | 10 min | 5.5 | 5.0 | 7.0 | 3.0 | **5.1** |

### 6c. Transcripts: do only after Batch 0 confirms no official transcript exists

Scores are provisional until the sweep lands.

| ID | Item | URL | Length | UV | YM | IR | DC | **Score** |
|---|---|---|---|---|---|---|---|---|
| **T5a** | Figma Config 2026, MCP / Code-to-Canvas session | Found in Batch 0 | TBD | 6.0 | 5.5 | 6.5 | 3.5 | **5.4** |
| **T5b** | Dive Club, agent interaction patterns (Grok Bot) | Found in Batch 0 (listed at dive-club.beehiiv.com) | TBD | 6.0 | 5.5 | 6.5 | 2.5 | **5.1** |
| **T5c** | Just Now Possible, AI support agent at Lorikeet (regulated industries) | https://www.producttalk.org/just-now-possible/ | about 60 min | 6.0 | 5.0 | 6.5 | 2.5 | **5.0** |
| **T5d** | Dive Club, custom prototyping environment (Patrick Morgan) | Found in Batch 0 | TBD | 5.5 | 5.5 | 6.5 | 2.5 | **5.0** |
| **T5e** | Dive Club, Kyle Zantos (2 episodes) | Found in Batch 0 | TBD | 5.0 | 5.0 | 6.5 | 3.0 | **4.9** |
| **T5f** | Figma Config 2026 keynote (Dylan Field) | Found in Batch 0 | 72 min | 5.0 | 3.5 | 6.5 | 3.5 | **4.6** |
| **T5g** | Dive Club, Nate Parrott, "How a Side Project Became Claude Design" | https://open.spotify.com/episode/18EQ5UubtYXaCCqRscLH8b | 53 min | 5.0 | 4.5 | 6.5 | 2.5 | **4.6** |
| **T5h** | Just Now Possible, Ramble for Todoist at Doist | https://www.producttalk.org/just-now-possible/ | about 60 min | 4.5 | 5.0 | 6.5 | 2.5 | **4.6** |
| **T5i** | Just Now Possible, Creating Aha! Builder | https://www.producttalk.org/ | about 60 min | 4.0 | 4.5 | 6.5 | 2.5 | **4.4** |
| **T5j** | UX Tools, Ryo Lu | https://www.uxtools.co/episodes/the-designer-who-cloned-himself-with-cursor | TBD | 4.5 | 4.5 | 6.0 | 2.0 | **4.3** |
| **T5k** | a16z, Ryo Lu | https://ai-a16z.simplecast.com/episodes/ryo-lu-cursor-ai-turns-designers-to-developers-X5LMtncw | TBD | 4.5 | 4.0 | 6.0 | 2.0 | **4.1** |

**Cutoff suggestion (judgment):** do T5a through T5e, which cover 5 or 6 transcripts. Everything at 4.6 or below is optional and can wait until after Batch 8's first pass.

### 6d. Optional or skip

| ID | Task | Score | Note |
|---|---|---|---|
| **T7** | Verbatim capture for A-tier files | **3.5** (UV 3.0, YM 3.0, IR 7.0, DC 1.0) | Only if you want longer verbatim quotes than Claude's anchors. Paste the lines into a `V` column in your local copy, keeping the same atom ID. |
| **T8** | Joey Banks Baseline issues, if paywalled | **3.8** (UV 3.5, YM 4.0, IR 6.5, DC 1.0) | Only if Batch 4 finds the issues gated. |
| **T9** | Behind the Craft paid episodes | **3.3** (UV 2.0, YM 3.0, IR 7.0, DC 1.0) | Skip unless you subscribe for other reasons. |

### 6e. Transcript handover spec

Each transcript goes in one file per episode. Put it at `_raw/transcripts/<source>/<yyyy-mm-dd>-<slug>.txt`, or attach it in the chat under that same name.

The top of each file carries this header block:

```
source: Dive Club
title: 
url: 
published: yyyy-mm-dd
length: 
captured: yyyy-mm-dd
method: youtube-transcript | <transcriber tool name> | manual
speakers: Ridd; <guest>
```

Rules for the body:

- **Keep timestamps.** They are the locators. Every atom from a video cites one.
- **Keep speaker labels** if the tool gives them.
- **Do not clean up.** Filler words and errors are fine, because Claude marks unclear passages `[UNCLEAR mm:ss]` rather than guessing.
- **Check YouTube first.** Before running a transcriber, open the video, click "...more", then "Show transcript". If captions exist, copy them with timestamps on. That takes about 2 minutes and costs nothing.

---

## 7. Run order at a glance

1. **Taylor:** T1 approve. T2 connect folder.
2. **Claude:** Batch 0, setup and sweep, which produces the final transcription list.
3. **Claude:** Batches 1 to 3, the A-tier sources, all self-served. Meanwhile, **Taylor:** T3 (if needed), T4, and T5a to T5e.
4. **Claude:** Batches 4 to 6.
5. **Claude:** Batch 7, once Lenny access is settled.
6. **Claude:** Batch 8, once transcripts land.
7. **Both:** decide on Batch 9 and on any optional tasks.
8. **Ongoing:** INDEX.md `review_by` dates drive re-extraction, at 90 days for tool and workflow sources and 365 days for durable thinkers.

---

## Assumptions

- [ASSUMPTION: Weights favour decision relevance and principle density because the library exists to feed role prompts; if the priority is Taylor's own reading, raise DU and lower LL.]
- [ASSUMPTION: Taylor does not currently hold a paid Lenny subscription; if he does, T4 drops to a 5-minute export and Batch 7 moves earlier.]
- [ASSUMPTION: The files belong in the same repo as `/docs/design/`; if the library lives elsewhere, T2 points at that folder instead.]
