---
title: Books extraction plan (Prompt 12, Part 8.4 canon)
thread: "12 — books: what is online and which to read"
role: Alembic (distillation) with Claude as planner
date: 2026-09-30
status: draft
source_status: draft for approval
depends_on: Alembic inventory (Message 1, 2026-09-30)
description: Read before running a book distillation batch or a read-track capture kit.
layer: references
last_reviewed: 2026-10-01
supersedes:
load_when: library batch
---

# Books extraction plan

This plan turns the Message 1 inventory into a sequence of work. It has four parts:

1. The rubric.
2. The scored books.
3. Claude's batches, in order.
4. Your tasks, each graded.

Every score here is a judgment made from the inventory, not a verified fact. You can change any weight or score, and the rankings update if you do.

Out of scope: Refactoring UI (reviewed in another thread), and Laws of UX and Shape Up (inventory only, handled in other threads).

---

## 1. The rubric

### 1.1 Book areas (each scored 0.0 to 7.0)

| Code | Area | What 7.0 means | What 0.0 means |
|---|---|---|---|
| T | Online-layer thickness | The author has restated the whole framework online, in their own words | Only marketing copy exists |
| X | Access ease | Free and transcribed, and Claude's tools can fetch it | Paywalled, needs a login, or only on video with no transcript |
| R | Seat relevance | Directly shapes decisions at Viewpoint (trust UI, discovery, positioning) or Fybr (spatial UI, field conditions, self-serve) | Only general background |
| Q | Residue | Most of the value is in worked examples or a mental model only the long form builds | The online layer carries nearly all of it |
| U | Uniqueness vs. the parallel thread | Nothing overlaps with Lenny's, How I AI, Dive Club, or the other extracted bodies of work | The parallel thread already covers it |
| C | Read-time lightness | Short and fast (about 150 pages or less, or highly visual) | Long, dense, or a reference work (500+ pages) |

### 1.2 Two composite scores and one gate

- **Distill priority** = 0.30·T + 0.20·X + 0.25·R + 0.25·U
  - This answers: how worthwhile is it for Claude to build a faithful principles file from author-owned material?
- **Read priority** = 0.35·R + 0.40·Q + 0.25·C
  - This answers: how much would reading the book in full add to your own mental model?
  - It is an input to your decision, not a recommendation.
- **Thickness gate: T ≥ 4.0.**
  - Below 4.0 there isn't enough author-owned material to distill without inventing, whatever the other scores say.
  - Books below the gate go on the **read track**. Claude builds them a capture kit, not a distillation.

### 1.3 Task areas (each scored 0.0 to 7.0; the composite is the unweighted mean)

| Code | Area | What 7.0 means |
|---|---|---|
| Ub | Unblock | Everything after it waits on this |
| Ov | Only-you | Claude cannot do it or stand in for you (a decision, a purchase, a login, your own reading) |
| Lt | Lightness | Takes minutes |
| Ug | Urgency | Needed before the first batch |

For Claude's batches, Ov becomes **Yd (yield)**: how much usable reference material the batch produces.

---

## 2. Scored books

| Book | T | X | R | Q | U | C | Distill | Read | Track |
|---|---|---|---|---|---|---|---|---|---|
| The Mom Test | 5.0 | 5.5 | 5.5 | 5.0 | 6.5 | 6.5 | **5.60** | 5.55 | Distill |
| Continuous Discovery Habits | 6.5 | 5.5 | 6.0 | 4.0 | 4.0 | 5.0 | **5.55** | 4.95 | Distill |
| Creative Selection | 4.5 | 5.5 | 5.0 | 5.5 | 6.5 | 5.0 | **5.33** | 5.20 | Distill |
| Obviously Awesome | 5.5 | 5.0 | 5.5 | 3.5 | 2.5 | 5.5 | 4.65 | 4.70 | Distill (only what the parallel thread doesn't cover) |
| Good Strategy/Bad Strategy | 5.0 | 4.0 | 5.0 | 5.0 | 4.0 | 4.0 | 4.55 | 4.75 | Distill |
| Inspired (2nd ed.) | 4.5 | 3.5 | 5.0 | 4.0 | 2.5 | 4.0 | 3.92 | 4.35 | Distill (conditional, one SVPG file) |
| Empowered | 4.0 | 3.5 | 4.0 | 4.0 | 3.0 | 3.5 | 3.65 | 3.88 | Distill (conditional, same SVPG file) |
| The Design of Everyday Things | 2.0 | 5.0 | 5.5 | 6.5 | 6.5 | 3.5 | gated | 5.40 | Read (kit includes a glossary built from Norman's preface) |
| Don't Make Me Think, Revisited | 1.5 | 5.0 | 5.5 | 5.5 | 6.5 | 6.5 | gated | **5.75** | Read |
| Designing Interfaces (3rd ed.) | 1.0 | 2.0 | 6.0 | 6.5 | 7.0 | 2.0 | gated | 5.20 | Read, as a reference (selected pattern chapters) |
| Build | 2.5 | 3.0 | 4.0 | 4.5 | 3.5 | 4.0 | gated | 4.20 | Read |
| Transformed | 3.5 | 3.5 | 2.0 | 4.5 | 2.5 | 3.5 | gated | 3.38 | Read (lowest seat relevance) |

Notes on the scores [judgment]:

- **Read priority:** Don't Make Me Think and The Mom Test top it because they are short and relevant, not because they are the deepest books.
- **Designing Interfaces:** it scores high on residue but low on lightness because it is a pattern catalogue. That argues for reading the chapters that match Viewpoint's dense tables and Fybr's map views, not reading it cover to cover.
- **Transformed:** it is about moving large organisations to a product model. That is far from a seed-stage seat, so R is 2.0.
- **Page counts** behind C are approximate and were not re-verified.

---

## 3. Claude's batches (run in this order)

Each batch ends by delivering files, then stops for the next go-ahead. Alembic's ten convergence tests run on every distillation file before delivery, and the file says which tests ran.

| # | Batch | Ub | Yd | Feasibility | Ug | Score |
|---|---|---|---|---|---|---|
| B0 | Verification sweep | 6.5 | 4.0 | 6.0 | 7.0 | 5.88 |
| B1 | Library scaffolding | 6.5 | 3.5 | 7.0 | 6.5 | 5.88 |
| B2 | Tier 1 distillations | 4.0 | 6.5 | 5.5 | 5.0 | 5.25 |
| B5 | Read-track capture kits | 5.0 | 4.0 | 6.5 | 4.0 | 4.88 |
| B6 | Independent verification | 3.0 | 5.5 | 6.0 | 4.5 | 4.75 |
| B3 | Tier 2 distillations | 3.0 | 5.0 | 5.0 | 4.0 | 4.25 |
| B4 | SVPG framework file | 2.5 | 4.5 | 3.5 | 3.0 | 3.38 |

The score order and the run order differ because B6 verifies whatever has shipped by then. It runs after B2, and again after B3 and B4.

### B0 — Verification sweep (inventory v1.1)

Goal: close the gaps from Message 1 before anything is distilled from them.

- Open and identify the Don't Make Me Think 3rd-edition sample chapter PDF (which chapter it is).
- Open designinginterfaces.com and record which edition its patterns match.
- Find the McKinsey Quarterly "The perils of bad strategy" URL and settle its month.
- Capture the URLs for the Decoder and Tim Ferriss interviews with Fadell.
- **SVPG archive:** list it article by article, with dates, tagged to Inspired, Empowered or Transformed. This is the condition for B4.
- **Continuous Discovery Habits book club:** check the paywall status of each monthly guide, and whether chapters 11 and 12 are published.
- Pin exact dates for the Lenny's episodes: Cagan 2022, Rumelt, Torres 2022, and the Summit talk.
- Search Lenny's for Krug, Norman, Kocienda and Singer.
- Search Dive Club, Behind the Craft and PostHog for any of the authors.

Output: `inventory-v1.1-delta.md`, listing only the items that changed, each with its URL and date.

### B1 — Library scaffolding

- `/docs/references/books/README.md`: an index covering both tracks, with the status of each book.
- `_template-distillation.md`: frontmatter (source list with ranks, edition, date range, decision served, tests run), then these sections in order: atom table, glossary, framework in the author's own structure, `[NOT IN SOURCE]` list, book-era vs. later contradictions, synthesizer's notes.
- `_template-capture-kit.md`: the official table of contents copied from the publisher or author page, with an empty atom table per chapter. Chapter content is not inferred from titles.
- `overlap-ledger.md`: for each author, which library owns which episode or post (your ruling in H3).

### B2 — Tier 1 distillations

Files, in order:

1. `product/fitzpatrick-mom-test.md`
2. `product/torres-continuous-discovery-habits.md`
3. `taste/kocienda-creative-selection.md` (glossary plus a demo-loop framework)

Rules:

- Sources are author-owned only.
- The NotebookLM audio on Product Talk is excluded as a source of Torres's words.
- For The Mom Test beta text, follow your ruling in H4.
- Delivered one file at a time. After the first file, wait for H8 before sending the other two.

### B3 — Tier 2 distillations

- `product/dunford-obviously-awesome.md`
  - Holds the book's framework and glossary only.
  - Dunford's newer material (Sales Pitch, the 2026 advanced-positioning post) is linked to the parallel thread, not duplicated.
- `product/rumelt-good-strategy-bad-strategy.md`
  - Holds the kernel, the hallmarks of bad strategy, and the sources of power.
  - A separate dated addendum covers The Crux (the crux, the strategy foundry).

### B4 — SVPG framework file (runs only if B0 finds a thick enough archive)

- `product/cagan-svpg-product-model.md` covers Inspired and Empowered.
- Co-authors are attributed.
- Shifts between Cagan's book-era and later positions are dated.
- Transformed is included only where SVPG articles restate it. Otherwise it goes on the read track.

### B5 — Read-track capture kits

One kit each for:

- The Design of Everyday Things (plus a glossary built only from Norman's preface: affordance, signifier, mapping, feedback, conceptual model)
- Don't Make Me Think, Revisited
- Designing Interfaces (chapter list tagged by which seat it touches)
- Build
- Transformed

These are structure only. Each is filled in by your reading (H9) or your exported highlights (H6), and becomes a full distillation afterwards.

### B6 — Independent verification

- A separate agent with fresh context, which has not seen the drafting, re-runs the provenance, paraphrase, fidelity and gap tests on each file.
- It re-fetches 20% of the locators at random.
- Findings go back as a list of corrections. The files aren't marked done until the corrections are applied.

---

## 4. Your tasks (graded)

| # | Task | Ub | Ov | Lt | Ug | Score | Blocks |
|---|---|---|---|---|---|---|---|
| H1 | Approve the rubric, gate, and weights | 7.0 | 6.5 | 7.0 | 7.0 | **6.88** | Everything |
| H2 | Pick the target repo and connect the folder | 6.5 | 7.0 | 6.5 | 6.5 | **6.62** | Where B1 onward land |
| H3 | Rule on overlap ownership with the parallel thread | 5.5 | 6.5 | 6.5 | 6.0 | **6.12** | B1 ledger, B3 |
| H4 | Rule on the Mom Test 2nd-edition beta | 3.0 | 6.5 | 7.0 | 4.0 | 5.12 | B2 file 1 |
| H7 | Get copies of the read-track books | 5.0 | 6.5 | 4.5 | 4.5 | 5.12 | H9 |
| H8 | Spot-check the first distillation for fidelity | 5.0 | 5.5 | 5.0 | 5.0 | 5.12 | Rest of B2 |
| H6 | Export highlights from books you've already read | 4.0 | 7.0 | 5.0 | 3.5 | 4.88 | Speeds up B5 and H9 |
| H10 | Decide which books to read in full | 4.0 | 7.0 | 6.0 | 2.5 | 4.88 | Which kits get used |
| H5 | Unlock paywalled sources | 4.5 | 6.5 | 4.0 | 4.0 | 4.75 | Parts of B0, B2, B3 |
| H9 | Read and capture atoms (read track) | 6.0 | 7.0 | 1.0 | 3.0 | 4.25 | Read-track distillations |

### H1 — Approve the rubric, gate, and weights (about 5 min)

Reply with one of:

- "approved"
- specific changes: a weight, a score, or the T ≥ 4.0 gate. For example: "raise R to 0.35 for distill" or "Designing Interfaces R is 6.5".

### H2 — Pick the target repo and connect the folder (about 5 min)

1. Decide where `/docs/references/books/` lives: the Viewpoint repo, the Fybr repo, or a personal knowledge repo.
2. In the Claude desktop app, choose "Add folder" and connect that repo's folder, so files are written straight into it.

Until you do, files come to you as downloads and copies go into this Project.

### H3 — Rule on overlap ownership (about 5 min)

Pick one rule:

- **(a) Split by era** (the default I'd assume if you don't pick): this library owns what the author put out as the book's framework, and the parallel thread owns everything they said after the book.
- **(b) Books own everything:** this library owns all of the author's content on these frameworks, and the parallel thread links to it.
- **(c) Parallel thread owns all Lenny's content:** book files only link to Lenny's episodes, never extract from them.

The authors this affects: Cagan, Torres, Dunford, Rumelt, Fadell.

### H4 — Rule on the Mom Test 2nd-edition beta (about 2 min)

Pick one:

- **(a) Include it:** beta text as short quotations only, labelled "2nd-ed beta, may change".
- **(b) Exclude it:** the file reflects only the author's talks and material from the 2013 edition era.

### H5 — Unlock paywalled sources (15 to 30 min, and possibly money)

Only for material you already have or choose to buy.

1. Tell me which of these you subscribe to:
   - Lenny's Newsletter (paid tier)
   - Product Talk (if book-club guides turn out to be paywalled)
   - Stratechery
2. For each item, either save the page text as a `.md` file into the connected folder, or sign in once in the Claude browser pane so I can read it there.

Items:

- Lenny's Reads "A guide to advanced B2B positioning" (2026-03-10)
- Any paywalled transcripts of the Cagan, Rumelt or Fadell episodes
- The Stratechery interview with Fadell (2022-05-05)

### H6 — Export existing highlights (10 to 20 min per book)

1. For any corpus book you've already read, export your Kindle, Apple Books or Readwise highlights to `.md` or `.csv`.
2. Put the files in the connected folder or attach them here.

Your highlights become atoms with page or location references. They are book text, so they are used as short quotations only.

### H7 — Get copies of the read-track books (about 15 min, plus cost)

1. For whichever books you decide to read (H10), get a copy: buy it, borrow it from the library, or use a subscription.
2. If you can, get the ebook, because its highlights can be exported (H6).

Priority by read score:

1. Don't Make Me Think, Revisited
2. The Mom Test
3. The Design of Everyday Things
4. Creative Selection or Designing Interfaces (tied)

### H8 — Spot-check the first distillation (about 20 min)

1. Open `fitzpatrick-mom-test.md` from B2.
2. Pick three atoms and check each against its locator.
3. Reply "calibrated" or list what was off.

This checks the self-run tests before the other two Tier 1 files are sent.

### H9 — Read and capture atoms (hours per book; this is your mental-model work)

1. Read with the B5 capture kit open.
2. For each passage worth keeping, log one row: page, verbatim quote or labelled paraphrase, one-line gloss.
3. Hand the kit back. I turn it into a distillation that keeps your locators.

### H10 — Make the read-in-full calls (about 10 min, any time)

- Use the read-priority column in section 2, plus each book's residue note in the inventory.
- Tell me which books you'll read, which you'll skim as a reference, and which you'll skip.
- Unread books keep their distillation or capture kit as their only entry in the library.

---

## 5. Sequence at a glance

1. **Now:** you do H1, H2 and H3 (15 min total). Then I run B0 and B1.
2. **Next:** you do H4. I run B2 file 1. You do H8. I finish B2, then run B6.
3. **In parallel:** you do H5 and H6 whenever convenient. I run B3, then B4 if the condition is met, then B6.
4. **Your pace:** you do H10, H7 and H9. I run B5, then convert filled kits into distillations as they come back.

## 6. Assumptions

- `[ASSUMPTION: the library lives at /docs/references/books/ with subfolders craft/, product/, taste/, as the Message 1 file plan proposed]`
- `[ASSUMPTION: without an H3 ruling, rule (a) split by era applies]`
- `[ASSUMPTION: batching overrides Prompt 12's "stop after each title" for Claude's batches, except for the H8 checkpoint after the first file]`
- `[ASSUMPTION: all scores are Claude's judgment from the Message 1 inventory and change when B0 corrects it]`
