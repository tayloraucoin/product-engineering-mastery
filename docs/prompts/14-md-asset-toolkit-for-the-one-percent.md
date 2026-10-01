---
title: "Prompt 14 — The `.md` asset toolkit of the 1% of 1%: what belongs in the repo, and the checklist to build it"
description: Paste into a new general thread to re-map which .md assets the toolkit carries and the build order. Its run is archived at docs/research/14-toolkit-map-plumb.md.
layer: prompts
status: adopted
thread: "14"
role: Plumb
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 14 — The `.md` asset toolkit of the 1% of 1%: what belongs in the repo, and the checklist to build it

**Model:** Fable
**Inject:** Plumb (Design Director) primary, for the design and workflow layers; Compass consulted for the product-side artifacts (briefs, PRD shapes, decision logs, fit signatures); Tally consulted for the measurement artifacts. One thread, Plumb captains and routes.
**Attach:** `00-shared-context`, the Plumb role prompt (and Compass and Tally if you want them consulted in-thread), the role-authoring guide, the product-design role coverage report, textbook Part 4.7, Part 5, and Part 7, and the outputs of Prompts 04 and 13 if they exist by the time you run this.
**Expected output:** an analysis of what `.md` assets — convention files, specs, skills, references, role prompts, runbooks, templates — a top-tier product engineer's repo and toolkit should hold in 2026; a gap analysis against what I have; and a checklist of investigation topics, each with its owner and whether it needs a thread of its own.

---

Plumb — you're on this one. Read your role prompt, the shared context, and the coverage report first. You captain this thread; route the product-side and measurement questions to Compass and Tally and integrate their answers.

**The decision this serves.** My convention system is the thing that lets one product engineer ship like a team: layered `CLAUDE.md` files, role prompts, skills, and now a design layer. I want the complete map of what the best-run AI-native product repos carry in markdown — not just design — so I can see what I'm missing, what I have that's redundant, and what to build next in what order. The output is the plan for the toolkit itself.

**What I already hold.** The role-authoring guide and a department of eleven roles; Recipe A and the three loops; the target design layer (`DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, `refs/`, `ui-critic`, `ui-diverge`, `specs/<feature>/brief.md`); the brief template from the textbook (problem, who, outcome metric, appetite and non-goals, riskiest assumption, UX with states, EARS acceptance criteria, open questions); the four-phase spec-driven flow (Specify, Plan, Tasks, Implement) mapped to my PM, Architect, Tech Lead, and builder roles.

**The ask.**

1. **The map.** Every category of `.md` asset a top-tier AI-native product repo should hold, organized by layer: *agent context* (root and nested `CLAUDE.md`, `AGENTS.md`, progressive-disclosure rules); *conventions* (code, commit, review, testing, naming); *roles* (the department, extensions, the authoring guide); *skills* (house and adopted third-party, load order, trigger design); *design layer* (as above, plus workflow and tool rulings); *product layer* (brief and PRD templates, decision log, roadmap pins, positioning one-pager, fit signatures, Opportunity Solution Tree, research ledger, glossary); *measurement layer* (event taxonomy, metric definitions, readout template, rollout and experiment plans); *references* (the laws, heuristics, canons, and distilled sources being built in other threads); *runbooks* (release, incident, onboarding a contractor, onboarding an agent, the weekly rituals); *evals* (for the AI surfaces of DealReady — graded test sets, rubrics, the harness). For each asset: what it's for, who reads it (human, agent, both), when it loads, and what goes wrong without it. Cite real, public examples of teams that publish theirs (Anthropic's engineering posts and cookbook, Spec Kit's structure, PostHog's handbook, Linear's and Vercel's public guidelines, any published `CLAUDE.md` or `AGENTS.md` conventions with adoption), dated.
2. **The principles of the toolkit.** How the layers relate — precedence, progressive disclosure, what lives in the repo versus the project versus the personal toolkit that travels between clients (DealReady, Fybr, my own products); what is universal versus project-bound (the role guide's distinction, applied to every asset type); how assets stay current (owners, changelogs, pruning cadence); and how to keep the whole thing from crowding out the work — a budget in lines or tokens per loaded context, with your recommendation.
3. **The gap analysis.** Against what I hold: what's missing, what's redundant, what's in the wrong layer, and what I have that is ahead of the published examples. Be blunt.
4. **The build order.** The assets to build first, second, third, by leverage and by dependency, with the owner role for each and an estimate of effort.
5. **The investigation checklist.** For every asset or principle where the right answer needs research rather than judgment — what a good eval set looks like for a diligence AI, how teams structure `AGENTS.md` at scale, what the best decision-log format is, how to version a metric taxonomy — a checklist row: the topic, the question it must answer, the role to inject, whether it's a thread of its own or folds into an existing one (name it), and the model tier you'd assign. Where it's a thread of its own, write the primer prompt in this captaining voice (assignment, decision served, ask, evidence rules, output shape, done criteria, not wanted), one page each.

**Evidence rules.** Public repos, handbooks, and engineering posts are primary and dated. Claims about what "top teams do" need a named team and a source. Anything you'd recommend on judgment is labeled as judgment.

**Output shape.** The map as a table per layer; the principles in prose; the gap analysis as a table (have / missing / redundant / misplaced / ahead); the build order; the checklist as a table; the primer prompts appended. Run your enforceability, displacement, and agent-readability tests across the proposed toolkit and say what you found.

**Done means** I have the toolkit's table of contents, the order to build it in, and the prompts to open the threads that fill it — and nothing in it exists because a listicle said so.

**Not wanted:** a directory tree with no reasons, an inventory that ignores context budget, or an asset recommended because it appears in someone else's repo without saying what it's for here.
