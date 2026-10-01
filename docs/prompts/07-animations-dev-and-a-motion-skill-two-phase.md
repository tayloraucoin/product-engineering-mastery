---
title: "Prompt 07 — animations.dev and Emil Kowalski: the known layer, then a motion and micro-interaction skill"
description: Paste into a new general thread to distill Emil Kowalski's public motion work (phase 1, Alembic) and write the motion skill (phase 2, Vesper). Its run is archived at docs/research/07b-motion-skill-vesper.md.
layer: prompts
status: adopted
thread: "07"
role: Alembic
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 07 — animations.dev and Emil Kowalski: the known layer, then a motion and micro-interaction skill

**Model:** Opus
**Inject:** Phase 1 — Alembic (Research Synthesizer). Phase 2 — Vesper (Lead UX/UI Designer), with the output addressed to Plumb for adoption into `.claude/skills/`. Send Phase 2 as a second message after Phase 1 responds.
**Attach with Phase 1:** `00-shared-context`, the Alembic role prompt, https://animations.dev/, https://emilkowal.ski/ (his writing, the two free lessons available via the waitlist, his open-source components such as Sonner and Vaul, and his public talks).
**Attach with Phase 2:** the Vesper role prompt, plus the Phase 1 output (in thread), and — if it exists by then — the Plumb ruling on skills from Prompt 04 so the new skill fits the load order.
**Expected output:** Phase 1 — a faithful inventory of what animations.dev and Emil Kowalski teach in public. Phase 2 — a `motion` skill (SKILL.md plus supporting reference files) that tells an agent when, where, and how to use motion and micro-interactions, with every inferred rule labeled.

---

## Message 1 — Phase 1 (Alembic)

Alembic — you're on this one. Read your role prompt and the shared context first. Same discipline as always: nothing enters that isn't on the page.

**The decision this serves.** Motion is the craft layer I most lack in code, and the textbook rates animations.dev as the elite motion course, taught by a design engineer from Vercel and now Linear's web team. Enrollment is closed until 2027, so the question is what can be learned now from his public work — and whether it's enough to build a motion skill for my agents. This phase inventories what he actually says and shows.

**The corpus, in hierarchy.** Primary: animations.dev (the course page, the curriculum outline, module and lesson titles, any free lessons or samples, the waitlist's free lessons if you can reach them); emilkowal.ski (every blog post and essay — his writing on easing, springs, duration, when not to animate, the "feel" of interfaces is exactly what I want atomized); his open-source libraries' docs and READMEs (Sonner, Vaul, and others — the design decisions he documents there are primary teaching); aiforui.dev (whatever is public); his public talks and podcast appearances with transcripts. Secondary: student write-ups and course reviews, only for what they quote him teaching, labeled.

**The ask.**

1. The public curriculum skeleton of animations.dev: modules, lessons, order, with locators. `[TITLE ONLY]` where only a title is visible.
2. Every principle he states directly, as atoms — on easing curves and which to use when, springs versus durations, timing values he recommends, enter versus exit asymmetry, what should never animate, reduced motion, performance (transforms and opacity versus layout), choreography and stagger, the relationship between motion and hierarchy, and anything he says about "taste" or "feel." Verbatim with locators. His open-source READMEs and blog posts will carry most of these; atomize them fully.
3. The worked examples: every public demo, component, or code sample he shows, with what it demonstrates and the specific values used (durations, easings, spring parameters) if visible in source. These are the most reusable atoms; be exhaustive.
4. Emil Kowalski himself: stated background, roles, philosophy, tools, in his own words.
5. The wall: the paid lesson bodies and anything unseen, marked `[NOT IN SOURCE]`, nothing reconstructed.
6. Separated notes: where the public layer is thick (I expect the blog and the libraries), where it's thin, and which secondary sources you'd trust.

**Evidence rules.** Verbatim is verbatim. Specific numeric values (a 200ms duration, a cubic-bezier, a spring stiffness) are quoted with their source and context — a value pulled from one demo is not "his recommendation" unless he says so. Do not infer a lesson's content from its title.

**Output shape.** Skeleton; atom table (batched, with a running index); worked-examples table with values; profile; wall inventory; notes. Run your provenance, paraphrase, gap, and separation tests and say so.

**Not wanted:** general animation theory from elsewhere, values presented as his without a locator, or a summary of "his approach" in your words.

---

## Message 2 — Phase 2 (Vesper) — send after Phase 1 responds

Vesper — you're taking over. Read your role prompt; the inventory is in thread. You may reason to a best answer; every inference is labeled.

**The ask.** Build a `motion` skill for my agents — the thing that answers "should this move, and if so, how" — and tell me what I still need the course for.

1. **The motion law**, as a set of rules an agent can apply, each tagged `[DIRECT]` (cite the atom), `[INFERRED]` (your craft reasoning, stated), or `[CONVENTION]` (widely held practice you're importing from outside his work — name where from). Cover: *when to animate* (state change, spatial relationship, feedback, continuity) and *when not to* (decoration, attention-seeking, anything on a high-stress path); *how* (easing families and when each fits, springs versus durations, duration ranges by distance and importance, enter/exit asymmetry, stagger and choreography rules, transform-and-opacity-only performance rule); *reduced motion* as a designed equivalent, not a removal; and the micro-interaction catalog — hover, press, focus, toggle, expand, dismiss, toast, drawer, list reorder, loading, success — with the recommended treatment for each.
2. **The skill itself**, in Claude Code skill format: a `SKILL.md` with a trigger description that fires on UI-building and UI-review tasks involving motion, the progressive-disclosure structure (short main file, reference files for the catalog and the values table), and the two-pass procedure — decide whether it should move, then decide how. Include the values table (durations, easings, spring parameters) with each value's provenance tag. Include a short "motion review" section Assay can call as a rubric line.
3. **The product application.** For DealReady (trust UI — calm, dense, keyboard-first) and Fybr (spatial UI — map interactions, measurement feedback, field conditions), the three motion decisions that matter most in each, with the treatment and the reason.
4. **What the course still buys.** From the wall inventory: what only the paid lessons would add, and whether to join the 2027 waitlist.
5. **Adoption note to Plumb.** Where this skill sits in the load order relative to `frontend-design`, `ui-critic`, and any adopted third-party motion skill (GSAP's), and what in `DESIGN.md`'s motion section it should replace or extend.

**Convergence.** Run your state test (reduced motion designed), alarm test (nothing that could escalate an activated user on a high-stress path), and buildability test (could an agent apply each rule without a question). Cut what fails.

**Output shape.** The motion law (tagged); the skill files as fenced code blocks ready to save; the product application; the course case; the note to Plumb.

**Not wanted:** a values table with no provenance, motion rules that would fail the alarm test on a diligence screen, or a skill that can't say when *not* to animate.
