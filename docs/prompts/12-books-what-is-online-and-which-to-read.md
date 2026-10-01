---
title: "Prompt 12 — The books: what can be distilled from what's online, and which I should actually read"
description: Paste into a new general thread to inventory and distill books into the reference library. Its live output is in docs/references/_meta/.
layer: prompts
status: adopted
thread: "12"
role: Alembic
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 12 — The books: what can be distilled from what's online, and which I should actually read

**Model:** Opus
**Inject:** Alembic (Research Synthesizer) for the distillation; the final "which to read" ruling is addressed to me and framed by Compass's and Vesper's criteria, but Alembic does not make it — I do, from the inventory.
**Attach:** `00-shared-context`, the Alembic role prompt, textbook Part 8.4 (the book list).
**Expected output:** Message 1 — per book, an honest inventory of what is legitimately available online (the author's own excerpts, talks, essays, and interviews that carry the book's ideas) and what only the book carries. Message 2 onward — distillation files for the books where the online layer is thick enough to be worth it. Then I decide which to read in full.

---

## Message 1 — the inventory (send first)

Alembic — you're on this one. Read your role prompt and the shared context first. This thread may run long.

**The decision this serves.** The textbook lists a canon of books. For each, I want to know how much of its substance the author has put online in their own words — talks, essays, interviews, sample chapters, their newsletter — because that layer can be distilled into reference files without me reading the book, and it tells me which books have a residue that only reading delivers. From your inventory I'll choose which to read in full for my own mental model. You inventory and distill; you don't recommend.

**The corpus.**
- *Craft:* Refactoring UI (being reviewed separately in another thread — skip it here); Don't Make Me Think (Krug); The Design of Everyday Things (Norman); Laws of UX (Yablonski — being handled in another thread; inventory it here but don't distill); Designing Interfaces (Tidwell, Brewer, Valencia).
- *Product:* Inspired, Empowered, and Transformed (Cagan and SVPG); Continuous Discovery Habits (Torres); The Mom Test (Fitzpatrick); Shape Up (Singer — free online; being reviewed separately; inventory only); Obviously Awesome (Dunford); Good Strategy / Bad Strategy (Rumelt).
- *Taste:* Build (Fadell); Creative Selection (Kocienda).

**The ask, for this message.**

1. Per book: edition and date; the author's own online material that carries the book's ideas — sample chapters, the author's blog or newsletter posts that restate the book's arguments, recorded talks and interviews, the author's own summaries. URLs, dates, and an estimate of how much of the book's substance each covers. Distinguish the author's material (primary) from other people's summaries (secondary — inventory the two or three most-cited, labeled, but do not use them for distillation).
2. Per book: your estimate, labeled as judgment and separated, of the *residue* — what the book delivers that the online layer can't (the worked examples, the mental model built by the long form, the exercises), stated as a claim about coverage, not a recommendation to read.
3. The distillation shortlist: the books where the author's online layer is thick enough that a faithful principles file is possible without the text, with the proposed file path and form. And the books where it isn't, so I know the only way in is reading.
4. Where a book's best ideas already appear in a newsletter or podcast being extracted in the other thread (Torres, Cagan, Dunford, Rachitsky's interviews with them), note the overlap so the two libraries don't duplicate.

**Evidence rules.** Author's own words only for distillation. Copyright: short quotations for reference, never reproduction of chapters. Summaries by others are inventoried, not mined.

**Output shape.** The per-book inventory table; the residue notes (separated, labeled judgment); the distillation shortlist with file plan; the overlap notes. Stop and wait.

---

## Message 2 onward — distillation, per approved book

Go. Distill [book title] from the inventoried author material only. Produce the `.md` file at the planned path, frontmatter included: every principle, framework, and definition as an atom with its locator (URL, talk timestamp, or sample-chapter page); the author's terms preserved as their glossary; the frameworks reconstructed only to the extent the author lays them out online, with `[NOT IN SOURCE]` where the book presumably continues; contradictions between the author's book-era and later positions dated. Separated notes: what this file cannot give me that the book would, so my read-in-full decision is informed.

Run your provenance, paraphrase, fidelity, and gap tests and say so. Then stop and wait for the next title.

**Not wanted:** a Blinkist-style summary, a recommendation to read or skip, or a "framework" filled in from someone else's summary of the book.
