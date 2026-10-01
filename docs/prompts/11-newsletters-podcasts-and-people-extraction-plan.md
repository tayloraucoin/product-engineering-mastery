---
title: "Prompt 11 — Newsletters, podcasts, and people: what to extract into `.md` for training prompts"
description: Paste into a new general thread to inventory and batch-extract newsletters, podcasts and people into the reference library. Its live output is in docs/references/_meta/.
layer: prompts
status: adopted
thread: "11"
role: Alembic
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 11 — Newsletters, podcasts, and people: what to extract into `.md` for training prompts

**Model:** Opus
**Inject:** Alembic (Research Synthesizer) — this is distillation of public bodies of work into traceable reference material, and the rule is "add nothing."
**Attach:** `00-shared-context`, the Alembic role prompt, textbook Part 8.2 (newsletters and podcasts), Part 8.3 (YouTube), and Part 8.5 (people to follow).
**Expected output:** Message 1 — an extraction inventory: what exists per source, what is worth extracting, in what form, and which videos I should transcribe by hand. Message 2 onward — the extraction itself, in batches, as `.md` files with locators. This thread has permission to run long; no time constraint.

---

## Message 1 — the inventory (send first; do not extract yet)

Alembic — you're on this one. Read your role prompt and the shared context first. This thread has no time constraint. Your job in this message is to build the inventory so that the extraction that follows is scoped and doesn't drown; do not start extracting until I say go.

**The decision this serves.** I want a library of `.md` reference files — faithful distillations of what the best product and design practitioners have written and said — that my role prompts and skills can cite, and that I can read for my own mental model. The library is only useful if every line is traceable, so the extraction is Alembic's job and not a summarizer's. First I need to know what's out there and what's worth the effort.

**The corpus.** From the textbook's §8.2, §8.3, and §8.5:

- *Newsletters and podcasts:* Lenny's Newsletter and Podcast; How I AI (Claire Vo); Dive Club (Ridd); Behind the Craft (Peter Yang); Product for Engineers (PostHog); Just Now Possible (Teresa Torres).
- *YouTube:* How I AI; Dive Club; Figma's official channel (Config 2026 keynote and the MCP / Code-to-Canvas sessions); Theo (t3.gg, selectively); Riley Brown (trend feed only); DesignCourse (Gary Simon); Peter Yang; Juxtopposed.
- *People with written bodies of work:* Lenny Rachitsky, Claire Vo, Peter Yang, Teresa Torres, Marty Cagan, Shreyas Doshi, Brian Balfour, April Dunford; Emil Kowalski, Ryo Lu, Joey Banks, Ridd, Matt D. Smith, Meng To, Paul Bakaus, Karri Saarinen, Dylan Field, Loredana Crisan; Guillermo Rauch, Colin Matthews, Hamel Husain, Shreya Shankar; and Anthropic's engineering blog and frontend-aesthetics cookbook as a primary source.

**The ask, for this message.**

1. For each source: what it is, where its archive lives, roughly how large it is, whether it's free or paywalled (and what portion), whether transcripts exist for audio and video, and the date range of its useful material. Mark what you could not reach.
2. For each source: the extraction candidates — the specific posts, episodes, threads, or talks most worth distilling for a product engineer leaning product-side, with a one-line reason each. Cap it: the ten best per large source, fewer for small ones. Prefer material that states principles, workflows, or rules over material that reports news.
3. The form each extraction should take: a *principles file* (atoms with locators, for a thinker with a stable point of view — Cagan, Torres, Dunford, Doshi), a *workflow file* (step-by-step, for the screen-share formats — How I AI, Dive Club), a *values-and-examples file* (for the design engineers — Kowalski, Banks, Smith), or a *glossary file* (for someone who coined the terms the field uses). Say which per source.
4. The transcription list: every video or episode where no transcript exists and the content is worth it, with the URL, length, and why — so I can transcribe by hand and hand you the text.
5. The proposed file plan: the folder and filename per source (`/docs/references/<domain>/<person-or-source>.md`), the frontmatter fields each file carries (source, URL, date range, last extracted, coverage), and the batch order you propose — most load-bearing first.
6. Your separated notes: where you expect the highest yield, where the corpus is mostly news and not worth it, and where a person's best material is actually in a book rather than online (route that to the books thread).

**Evidence rules.** Primary archives only; no third-party summaries of a newsletter as a substitute for the newsletter. Paywalled material is inventoried as paywalled, not reconstructed. Dates on everything.

**Output shape.** The source table; the candidates per source; the form per source; the transcription list; the file plan and batch order; the notes. Stop there and wait.

---

## Message 2 onward — extraction, in batches (send after you approve the plan; repeat per batch)

Go. Batch [N]: [name the sources from the approved batch order]. Attached: [any transcripts I produced by hand for this batch].

For each source in this batch, produce the `.md` file per the approved form and frontmatter, as a fenced block ready to save at the planned path. Every principle, rule, workflow step, or value is an atom with a locator (URL plus section, timestamp, or thread position); verbatim is verbatim and paraphrase is labeled; contradictions between a person's earlier and later positions are noted as contradictions with both dates; anything referenced but not accessible is `[NOT IN SOURCE]`. Keep the synthesizer's notes section separate and short — where the person's thinking is strongest, what they *don't* cover, and which other file in the library they should be read beside.

Run your provenance, paraphrase, inflation, fidelity, and separation tests before delivering the batch, and list the files delivered with their coverage so I can keep the index. Then stop and wait for the next batch.

**Not wanted, in any batch:** a summary of someone's "philosophy" in your words, a paraphrase presented as a quote, or a file that would embarrass me if its subject read it and checked the locators.
