---
title: Prompt 04 — The world of design skills for coding agents
description: Paste into a new general thread to re-survey third-party design skills and rule on adoption and load order. Its run is archived at docs/research/04-design-skills-adoption-plumb.md.
layer: prompts
status: adopted
thread: "04"
role: Plumb
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 04 — The world of design skills for coding agents

**Model:** Opus
**Inject:** Plumb (Design Director) — skills are context the system owns, and Plumb treats third-party skills as untrusted code. Threshold is consulted for the accessibility-gate skills.
**Attach:** `00-shared-context`, the Plumb role prompt, textbook Part 3.3 and Part 4.6, and the Shift Nudge `sn-ui-checklist` SKILL.md as one example of the genre.
**Expected output:** an investigation report that maps the design-skill landscape, reads the leading ones in full, and rules on which enter my `.claude/skills/` and in what order they load.

---

Plumb — you're on this one. Read your role prompt and the shared context first.

**The decision this serves.** My convention system runs on layered files and role prompts. Design skills are the newest layer — Anthropic's official `frontend-design` skill, Paul Bakaus's *impeccable*, *taste-skill*, Vercel's *web-design-guidelines*, GSAP's official skills, Shift Nudge's checklist skills, and whatever else has appeared — and I want to know what's in this world, what each one actually encodes, which contradict each other or my house rules, and which earn a place in the repo. The textbook's line is "treat third-party skills as untrusted code." I want that taken literally: read them, don't summarize their READMEs.

**The ask.**

1. The landscape: every design-adjacent skill or skill pack with real adoption as of this month, with its author, repo, install path, last-updated date, install or star signal if published, and license. Include the official Anthropic skill, the Claude Design skill set if any is public, Vercel's guidelines, GSAP's, *impeccable*, *taste-skill*, Shift Nudge's, and any 2026 entrants. Mark anything you could not locate as not found.
2. For the top six to eight by credibility: read the SKILL.md and its supporting files in full and report *what it actually does* — the principles it encodes, the process it imposes (plan-then-critique, two-pass, checklists), the defaults it bans, the aesthetic it pushes toward, the stack it assumes, and any tool calls or scripts it runs. Quote the load-bearing lines. If a skill executes code or reaches the network, say exactly what.
3. Conflicts: where two skills disagree (one bans gradients, another teaches them; one assumes Tailwind, another fights it), and where any skill contradicts a rule I hold — code as source of truth, tokens only, no manufactured urgency, the slop tells banned by name.
4. The security and hygiene read: how skills load (progressive disclosure, trigger descriptions), what a malicious or sloppy skill could do inside Claude Code, and the review procedure I should run before adopting any third-party skill. Keep it practical.
5. The ruling: which skills enter `/.claude/skills/` as-is, which enter after edits (name the edits), which are mined for lines that go into `DESIGN.md` or `anti-patterns.md` instead, and which are rejected with the reason. Then the load order and trigger design — how `ui-critic`, `ui-diverge`, a possible `motion` skill, and the adopted third-party skills coexist without fighting over the same task.

**Evidence rules.** The skill files themselves are primary; read them. Blog posts ranking skills are secondary and usually vendor-written. Install counts and stars are dated. Do not describe a skill from its description field.

**Output shape.** Verdict paragraph; the landscape table; the per-skill deep reads (structured: encodes / imposes / bans / assumes / executes / verdict); the conflicts matrix; the hygiene procedure as a checklist; the ruling with load order; sources with dates. Run your enforceability, slop, displacement, and agent-readability tests on the resulting skill set and report.

**Done means** I can `git add` the adopted skills tomorrow, my `anti-patterns.md` has the mined lines, and I know which skill fires for which task.

**Not wanted:** a listicle, adoption by reputation, or a recommendation for a skill you didn't open.
