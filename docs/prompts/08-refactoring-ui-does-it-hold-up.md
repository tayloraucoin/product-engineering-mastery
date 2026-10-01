---
title: "Prompt 08 — Refactoring UI: does it hold up in 2026, and is it worth doing in the era of AI?"
description: Paste into a new general thread to review Refactoring UI for the canon and the purchase decision. Its run is archived at docs/research/08-refactoring-ui-review-vesper.md.
layer: prompts
status: adopted
thread: "08"
role: Vesper
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 08 — Refactoring UI: does it hold up in 2026, and is it worth doing in the era of AI?

**Model:** Opus
**Inject:** Vesper (Lead UX/UI Designer) reviews the craft on its merits; the verdict is addressed to Plumb, who decides what enters the canon.
**Attach:** `00-shared-context`, the Vesper role prompt, textbook Part 2.1 and Part 8.1 (the Refactoring UI row).
**Expected output:** an in-depth review that answers three questions with evidence — does it hold up, is it worth my time when an agent can apply its rules for me, and how much of it is real teaching — ending in a canon ruling for Plumb.

---

Vesper — you're on this one. Read your role prompt and the shared context first.

**The decision this serves.** Refactoring UI (Adam Wathan and Steve Schoger, 2018; ~$99–149; 218-page PDF plus videos; 30,000+ copies) is the textbook's "highest-ROI visual primer for engineers" and the first item on my study plan. It is also eight years old, written before Tailwind ate the world and before agents could apply its rules on request. I want to know whether to spend the money and the hours, whether an agent with the rules is a substitute for me holding them, and — most importantly — which of its rules should become law in my design layer.

**The ask.**

1. What it teaches, chapter by chapter, from the book's own table of contents and any public samples (the free preview chapter, the authors' public tips on X, Schoger's public "hot tips," Wathan's public talks). Every principle you can source directly, with a locator; principles you know from having read it but can't point at, labeled `[FROM MEMORY]` so I can weight them.
2. Does it hold up? Test the principles against 2026 reality: which are timeless (hierarchy, spacing systems, the "start with too much white space" rule, color system construction, shadows as elevation), which have been absorbed into the defaults of Tailwind and shadcn so that a modern stack gives you them for free, and which have aged (specific palette advice, pre-variable-font typography, anything that predates dark mode and reduced motion as defaults). Be specific and cite the rule.
3. Is it worth doing in the era of AI? Argue it properly. If an agent equipped with the rules produces on-system output, what does *I* holding the rules buy — selection, critique, the ability to tell why a generated screen is wrong? Which of its rules would you expect an agent to apply well from a skill, and which require the eye it trains? Where does it sit relative to Shift Nudge (deeper, paid) and to the free checklists I already have?
4. How much is real teaching versus a catalogue of tips? Distinguish the parts that build a mental model (a way of seeing) from the parts that are a list of moves. Say what a reader can *do* after it that they couldn't before, and how long that takes.
5. The canon ruling, addressed to Plumb: the ten to fifteen rules that should become lines in `DESIGN.md`, `tokens.md`, or `anti-patterns.md`, each in the required form — principle, example, counter-example — and the rules Assay's rubric should adopt. Plus the purchase verdict: buy, skim the free material and skip, or read it once and move on.

**Evidence rules.** The book's own site, samples, and the authors' own public posts are primary. Reviews are secondary and named. Label memory as memory. Do not reproduce the book's text beyond short quotations for the purpose of review.

**Output shape.** Verdict up top; the chapter map with sourced principles; the holds-up analysis as a table (rule, status: timeless / absorbed / aged, evidence); the AI-era argument in prose; the teaching-versus-tips assessment; the canon ruling with the rules in Plumb's form; the purchase verdict; sources with dates. Run your drift test on the rules you're proposing — anything that would produce a generic dashboard is out.

**Done means** Plumb can add the rules to the design layer without reading the book, and I know whether to spend the evening on it.

**Not wanted:** a book report, praise without a test, or a canon list padded with rules the stack already enforces.
