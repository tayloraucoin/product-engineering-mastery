---
title: Prompt 13 — Laws of UX as reference artifacts for AI threads and Claude Code, plus the input checklist
description: Paste into a new general thread to rebuild the Laws of UX reference layer and its input checklist. Its run is archived at docs/research/13-laws-of-ux-reference-layer-plumb.md.
layer: prompts
status: adopted
thread: "13"
role: Plumb
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 13 — Laws of UX as reference artifacts for AI threads and Claude Code, plus the input checklist

**Model:** Fable
**Inject:** Plumb (Design Director) owns the reference layer and rules on structure and adoption; Vesper is consulted on application; Alembic's discipline applies to the extraction (every law traced to its source and its original study).
**Attach:** `00-shared-context`, the Plumb role prompt, textbook Part 5.4 (critique rubric inputs: Nielsen's heuristics, Laws of UX, WCAG).
**Expected output:** a set of segmented reference documents — one per law or law-family — structured so an agent can load only what a task needs, plus a checklist of the other inputs the reference layer should include and primer prompts for any threads needed to acquire them.

---

Plumb — you're on this one. Read your role prompt and the shared context first. Alembic's rules apply to the extraction: nothing enters that isn't in the source; every law carries its provenance.

**The decision this serves.** My critic, my screen designer, and my coding agents all need a shared vocabulary of interaction principles they can cite — "this fails Hick's law at the point of decision" is a finding; "too many options" is an opinion. Laws of UX (Jon Yablonski; lawsofux.com and the O'Reilly book, 2nd edition) is the obvious backbone, but a single 30-law document is too much for every task and too thin for any. I want it segmented so an agent loads the two laws a table view needs and not the twenty it doesn't, and I want to know what else belongs in the reference layer beside it.

**The ask.**

1. **The extraction.** From lawsofux.com (primary; the book's public samples where available), every law: its statement in Yablonski's words, its origin (the researcher, the year, the original study or paper — verify the citation exists and say if the popular statement overstates the research), the takeaways he lists, and his examples. `[NOT IN SOURCE]` for anything only in the book. Where a law is contested or has been weakened by replication or scope critiques (be careful here — cite the critique, don't invent one), note it as a caveat with its source.
2. **The segmentation design.** Propose the structure: one file per law, or per family (heuristics of perception — Gestalt laws; cognition and load — Hick, Miller, cognitive load; motor and time — Fitts, Doherty; memory and emotion — peak-end, Zeigarnik, von Restorff, serial position; expectation — Jakob's law, aesthetic-usability, Tesler). Each file carries: frontmatter (name, family, one-line trigger description of *when a task should load it* — this is what lets an agent decide), the law, the provenance, the caveats, the application rules for interface work (`[DIRECT]` from Yablonski, `[INFERRED]` from you, labeled), a "how to detect a violation" section Assay can use, and two worked applications — one for a trust-dense diligence screen (DealReady), one for a map-first field tool (Fybr). Then an index file that maps common task types (table, form, onboarding, navigation, error state, dashboard, map interaction) to the laws to load.
3. **How it plugs in.** Where these files live (`/docs/references/laws-of-ux/`), how `ui-critic` and `frontend-design` and the role prompts reference them (by trigger description, by task-type index, or both), and the load-order note so they don't crowd out the design layer itself. Keep each file short enough that loading three of them costs less than one page of `DESIGN.md`.
4. **The input checklist.** Beyond Laws of UX, what else the reference layer should hold for interaction and craft principles, as a checklist I can collect against — with a one-line reason and the source for each. I expect at least: Nielsen's ten usability heuristics (NN/g, primary); WCAG 2.2 success criteria organized by the same trigger-description pattern (Threshold's domain — note the handoff); Gestalt principles if not already covered; the platform HIGs (Apple, Material) for convention rulings; Anthropic's frontend-aesthetics cookbook; the Shift Nudge checklists already in hand; Refactoring UI's canon rules (from that thread); the motion law (from the animations thread); Growth.Design's psychology case studies if they carry citable principles; and anything else you'd rule in. For each: acquire directly, route to an existing thread, or needs a new thread.
5. **Primer prompts for acquisition threads.** For each checklist item marked "needs a new thread," write the primer prompt in this same captaining voice — assignment, decision served, corpus, ask, evidence rules, output shape, done criteria, not wanted — with the role to inject. Keep each to a page.

**Evidence rules.** lawsofux.com is primary for the statements; the original studies are primary for provenance and must be located, not assumed. Critiques must be cited or omitted. Yablonski's text is quoted briefly, not reproduced.

**Output shape.** The verdict on structure; the reference files as fenced blocks ready to save (or, if too long for one response, the index plus the first family, with the batch plan for the rest); the plug-in note; the input checklist as a table; the acquisition primer prompts. Run your swap, enforceability, displacement, and agent-readability tests on the resulting reference set and say what you found.

**Done means** the folder exists, Assay can cite a law by file, and I have the checklist and the prompts to fill the rest of the reference layer.

**Not wanted:** one long document, a law without its origin verified, a caveat invented for balance, or a worked application that would fail the swap test.
