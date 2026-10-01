---
title: "Prompt 06 — Shift Nudge and Matt D. Smith: the \"we actually know this\" layer, then the best-answer curriculum"
description: Paste into a new general thread to distill Shift Nudge's public layer (phase 1, Alembic) and write the curriculum (phase 2, Vesper). Its run is archived at docs/research/06a-shift-nudge-free-layer-alembic.md.
layer: prompts
status: adopted
thread: "06"
role: Alembic
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 06 — Shift Nudge and Matt D. Smith: the "we actually know this" layer, then the best-answer curriculum

**Model:** Fable
**Inject:** Phase 1 — Alembic (Research Synthesizer): distill only what is public and direct, add nothing. Phase 2 — Vesper (Lead UX/UI Designer): write the curriculum from the distillation, reasoning to a best answer and labeling every inference. Send Phase 2 as a second message in the same thread after Phase 1 responds, and inject Vesper's role prompt with it.
**Attach with Phase 1:** `00-shared-context`, the Alembic role prompt, the Shift Nudge `sn-ui-checklist` SKILL.md, the Shift Nudge accessibility checklist, the screenshot of the Figma files access page (the list of free file names), and https://www.shiftnudge.com/resources.
**Attach with Phase 2:** the Vesper role prompt, plus the Phase 1 output (already in thread).
**Expected output:** Phase 1 — a faithful inventory of everything Shift Nudge and Matt D. Smith teach in public, with locators and `[NOT IN SOURCE]` where the paid material sits. Phase 2 — a curriculum document and study plan reconstructed to a best answer, with every inferred line marked.

---

## Message 1 — Phase 1 (Alembic)

Alembic — you're on this one. Read your role prompt and the shared context first. Your discipline is the whole point of this phase: nothing enters that isn't on the page.

**The decision this serves.** I intend to buy Shift Nudge ($1,997/yr; PRO has 85+ interface lessons, 21+ Claude Code lessons, a critique vault, and a weekly-critique VIP tier). Before I do, I want to know exactly what I can learn *now, for free, from direct sources* — so the purchase buys only what's behind the wall, and so the free layer becomes training material for my design layer and my critic. This phase is the inventory. It must be honest about the wall.

**The corpus, in hierarchy.** Primary: shiftnudge.com and every page under it (curriculum outline, module names, lesson titles, FAQ, resources page, the free Figma files list — I've attached a screenshot of the file names: before/after animation files, advanced interactive components, killer auto layout tutorial, Claude Code animated icons, ideal UI contrast scores, Opal camera packaging, COVID-19 isolation UI, box model animations, smart animated blobs, Lego design system, variants); the two attached checklists (UI checklist skill; accessibility checklist); Matt D. Smith's own site, newsletter archive, YouTube channel, and X/Twitter threads; his public talks and podcast appearances where a transcript exists. Secondary: student reviews and write-ups, only for what they *quote* him teaching, labeled as secondary.

**The ask.**

1. The public curriculum skeleton: every module and lesson title you can find on the site or in his public materials, in the order presented, with the locator. Mark what is only a title (`[TITLE ONLY]`) versus what has a public description or excerpt.
2. Every principle he states directly in public — on typography, spacing, layout, color, style, imagery, elements, product tactics, critique, and Claude Code — as atoms: source, locator, verbatim, gloss. The two checklists are rich primary material; atomize them fully, and note where the site's language and the checklists' language overlap so we don't double-count.
3. The free assets: for each of the free Figma files and any free videos or downloads, what it is, what it demonstrates, and what principle it appears to teach (from its own description only). Note which I should download and which you couldn't inspect.
4. Matt D. Smith himself: his stated background, the products and companies he's designed for, his stated philosophy of interface design, and the tools he says he uses — all from his own words, with locators.
5. The wall: a clear inventory of what is paid and unseen — the lesson bodies, the critique vault, the Claude Code lessons, the AI advisor — marked `[NOT IN SOURCE]` with nothing reconstructed. Also what is behind a paywall but partially visible (previews, samples).
6. Your separated synthesizer's notes: where the free layer is thickest, where it's thinnest, and which two or three secondary sources you'd trust to be quoting him accurately.

**Evidence rules.** Verbatim is verbatim; paraphrase is labeled. Counts of principles are counts of distinct sources. Do not infer what a lesson teaches from its title. Do not reconstruct paid material from reviews. If a reviewer quotes him, the quote is secondary and labeled.

**Output shape.** The curriculum skeleton; the atom table (this will be long — deliver it in batches if you must, with a running index); the free-assets table; the Matt D. Smith profile; the wall inventory; the notes. Run your provenance, paraphrase, gap, fidelity, and separation tests and say so.

**Done means** I can see exactly what I already have for free, with locators, and exactly where the wall is. Phase 2 will build on this and will not be allowed to touch anything you marked `[NOT IN SOURCE]` without labeling it as inference.

**Not wanted:** a summary of what Shift Nudge "is about," anything smoothed, or a single principle without a locator.

---

## Message 2 — Phase 2 (Vesper) — send after Phase 1 responds

Vesper — you're taking over from Alembic. Read your role prompt; the shared context is already in thread, and so is Alembic's inventory. Alembic was forbidden from filling gaps; you are permitted to reason to a best answer, on one condition: every inferred line is marked.

**The ask.** Write the curriculum as it most probably is, and the study plan I'd follow.

1. **The curriculum document.** Using the public skeleton and the atoms, reconstruct what each module most likely teaches — principle by principle — where the public material supports it. Three tags on every line: `[DIRECT]` (from an atom, cite it), `[INFERRED]` (your craft reasoning from the title, the surrounding public material, and interface-design convention — say the reasoning in a clause), `[UNKNOWN]` (can't be reconstructed responsibly; leave it). Where he states a principle in public, use his words; where the checklist already covers it, point at the checklist rather than restating. Never dress an inference as a quote.
2. **The free-first study plan.** Order the free material — checklists, free files, public videos, newsletter posts — into a sequence a product engineer would follow in four weeks, with the exercise for each (rebuild this free file, run this checklist against this screen of mine, apply this principle to DealReady's table view). Say what I'll be able to do at the end that I can't now.
3. **What the purchase actually buys.** From the wall inventory, the honest case: what is only behind the wall, what its likely value is to *my* practice (critique vault and weekly critique versus lessons on fundamentals I may already hold), and your recommendation — buy now, buy after the free layer is exhausted, or don't — with the reasoning.
4. **What enters my design layer.** The five to ten `[DIRECT]` principles that should become lines in `DESIGN.md` or `anti-patterns.md`, in the form Plumb requires: the principle, an example, a counter-example. And the lines from the UI checklist that Assay's rubric should adopt verbatim.

**Convergence.** Run your buildability and drift tests on the curriculum document: could I act on it without a follow-up question, and does anything in it read as generic design-course filler rather than this program's specific point of view? Cut what fails.

**Output shape.** The curriculum document (tagged line by line); the four-week plan as a table; the purchase case; the design-layer candidates. Prose where you're reasoning, structure where I'll act.

**Not wanted:** an inference presented as fact, a plan that requires the paid tier to start, or generic "learn typography" advice that isn't traceable to this program.
