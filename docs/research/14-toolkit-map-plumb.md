---
title: The Toolkit Map
description: Read when deciding what layers the toolkit holds, the context budget, or build order.
layer: research
status: archived
thread: "14"
role: Plumb
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# The Toolkit Map: What an AI-Native Product Repo Carries in Markdown, and What to Build Next (Plumb, Sept 30, 2026)

Plumb's ruling: your toolkit is ahead of published practice on roles and design judgment, and behind on three things: an evals layer for DealReady, a measurement layer that lives in files rather than inside Tally's prompt, and enforcement. Enforcement is the biggest gap. Almost nothing you hold can fail a build today. So build enforcement and evals before you write any more prose. The strongest dated evidence in 2026 points the same way. Gloaguen et al. (arXiv:2602.11988, v2 Jun 23, 2026) found that "providing context files does not generally improve task success rates, while increasing inference cost by over 20% on average." Vercel's published product-design system pairs a thin skill with linters, evals and a human-reviewed update loop, and is not a thicker document.\[1\]

## TL;DR

- **What to hold.** Ten layers, about 45 assets. Only four files should load in every session: root `AGENTS.md`, a Claude shim `CLAUDE.md`, the skill listing, and auto memory. Everything else loads by file path, by trigger or by explicit invocation. Recommended budget: about 4,000 tokens always on and about 14,000 tokens per UI task. Both figures are judgment, anchored on Anthropic's "under 200 lines per CLAUDE.md" and on the Gloaguen et al. cost finding.
- **The gaps, bluntly.** Missing entirely: evals, event taxonomy and metric definitions as files, decision-log template, glossary, runbooks, lint and hook enforcement. Redundant: the Assay role versus the `ui-critic` skill, the PM role versus Compass, `brief.md` versus Spec Kit's `spec.md`, and slop bans in three places. Misplaced: product and metric facts stored inside role prompts, and design bans loaded always-on for backend work. Ahead of published practice: the role precedence rule, both-series metric versioning, the "what the data can't say" readout, and separating the critic from the generator with capped rounds.
- **Build order.** (1) Agent-context contract plus budget lint, (2) design layer with Storybook domain stories and token lint, (3) decision log and glossary, (4) event taxonomy and metric definitions, (5) first DealReady eval set, (6) runbooks, (7) product narrative artifacts. Four new threads open with the primers appended: 15 Agent Context Architecture, 16 DealReady Evals, 17 Product Operating Artifacts, 18 Measurement Layer.

Labels used throughout:
- [V] means verified against a primary source, in this thread or an earlier one.
- [S] means secondary or aggregator.
- [J] means judgment.
- [NF] means not found or not verified in this thread.

---

## Key Findings

1. **Context files are not free, and they don't reliably help.** [V]
   - Gloaguen, Mündler, Müller, Raychev and Vechev (arXiv:2602.11988, v1 Feb 12, 2026; v2 Jun 23, 2026) found that "providing context files does not generally improve task success rates, while increasing inference cost by over 20% on average," and that "repository overviews, although popular and recommended by model providers, are not helpful." They conclude that human-written context files "should describe only minimal requirements."
   - A second study (Lulla, Mohsenimofidi, Galster, Zhang, Baltes and Treude, arXiv:2601.20404, ICSE JAWs 2026) tested 10 repos and 124 PRs on OpenAI Codex and found AGENTS.md files gave "lower median runtime (Δ28.64%) and reduced output token consumption (Δ16.58%), while maintaining a comparable task completion behavior"; output quality was "beyond the scope of this paper." [V]
   - What this means: the always-on layer earns its place through speed and consistency, not correctness. Correctness comes from checks.
2. **Claude Code now reads `AGENTS.md` natively, but not when a `CLAUDE.md` exists.** [V, code.claude.com/docs/en/memory, fetched Sept 30, 2026]
   - "An `AGENTS.md` and a `CLAUDE.md`... Claude reads: Your `CLAUDE.md` files only." Native reading requires v2.1.277 or later.\[2\]
   - The documented bridge is a `CLAUDE.md` that starts with `@AGENTS.md`.\[2\]
   - Imports "don't reduce its context cost, because imported files also load at launch." Only path-scoped rules and subdirectory files defer loading.\[2\]\[3\]
3. **Instructions are context, not configuration.** [V, same doc] "Claude treats them as context, not enforced configuration.\[4\] To block an action regardless of what Claude decides, use a PreToolUse hook."\[2\] Any rule that matters and can be checked mechanically belongs in a hook, lint rule or test, not in markdown.
4. **Vercel published the closest analogue to your design layer** ("Teaching agents product design at Vercel," John Phamous, Jun 25, 2026). [V]
   - Structure: a repository `AGENTS.md` that decides when to load the skill, a skill-local `AGENTS.md` for load order and governance, and `SKILL.md` for the workflow.\[1\]
   - Supporting folders: `references/`, `exemplars/`, `coverage-gaps.md`, and eval fixtures with `before/` and `after/`.\[1\]
   - Governing rule: "Keep deterministic checks mechanical. Keep judgment in prose."\[1\]
   - It is the strongest public confirmation of your architecture. It also shows what you lack: linters, exemplars, coverage gaps and evals.
5. **Spec Kit resolves the constitution at runtime; it does not copy it.** [V, github/spec-kit docs/upgrade.md, main branch, Sept 30, 2026] "Plan, tasks, and analyze read `.specify/memory/constitution.md` live on every run, and analyze is the dedicated drift checker."\[5\] Adopt the idea: one canonical source that other files point to. Don't adopt the directory layout (the textbook agrees).
6. **For a diligence AI, grade the answer and the source separately.** [V, subagent]
   - Harvey's BigLaw Bench (Aug 29, 2024) scores "What % of correct statements does the model support with an accurate source?" separately from answer quality.\[6\]
   - Internally Harvey requires a source that "links to a specific piece of text within a source document" (Sep 23, 2024).\[7\]
   - ALCE (arXiv:2305.14627) defines citation recall and citation precision per statement using an entailment check.\[8\]
   - This is the shape of DealReady's eval set.

---

## 1. The Map

Each table lists an asset's purpose, reader (H human, A agent, B both), when it loads, what fails without it, and dated public precedent. The folder under `specs/` follows the textbook ruling: take Spec Kit's phases, not its directories.

### 1.1 Agent context

| Asset | Path | For | Reader | Loads | Without it | Public precedent |
|---|---|---|---|---|---|---|
| Cross-tool contract | `/AGENTS.md` | Commands, layout, boundaries, pointers to layers. Tool-agnostic so Cursor, Codex and contractors get the same rules | A | Every session, via `@AGENTS.md` import | Each tool drifts; a contractor on Cursor gets no house rules | agents.md: "no required fields"; popular sections are overview, build and test, code style, testing, security [V, accessed Sept 30, 2026].\[9\] Adoption: the Linux Foundation's Agentic AI Foundation release (Dec 9, 2025) states "AGENTS.md has already been adopted by more than 60,000 open source projects and agent frameworks including Amp, Codex, Cursor, Devin, Factory, Gemini CLI, GitHub Copilot, Jules and VS Code" [V] |
| Claude shim | `/CLAUDE.md` | `@AGENTS.md`, plus Claude-only lines: subagent names, plan-mode zones, hook notes | A | Every session | Claude silently ignores `AGENTS.md` whenever a `CLAUDE.md` exists\[2\] | Claude Code memory docs [V, Sept 30, 2026] |
| Nested context | `apps/*/AGENTS.md`, `packages/ui/AGENTS.md` | Package-local invariants, such as the ingest pipeline's provenance contract | A | On demand, when a file in that directory is read\[2\] | Root file bloats, or local invariants are lost | OpenAI Codex repo reported with 88 nested AGENTS.md files [S, aggregators];\[10\]\[11\] InfoQ, Aug 2025: "dozens" [S]\[12\] |
| Path-scoped rules | `.claude/rules/<topic>.md` with `paths:` | Conventions that apply to one file type | A | When Claude reads a matching file | Conventions load always-on or not at all | Docs: `paths` "is the only field Claude Code reads from a rule" [V]\[2\] |
| Local overrides | `CLAUDE.local.md` (gitignored) | Sandbox URLs, personal test data\[2\] | A | Every session, you only | Personal noise committed to client repos | Docs [V] |
| Directory map | `docs/README.md` plus `yarn directory-map` | Human index; agents consult it when routing | B | Explicit read | Orphaned files; duplicate assets | Your role guide (have) |
| Loading ledger | `docs/agent-context/LOADING.md` | Human-only table of what loads when, with a token count per file | H | Never loaded | Nobody can explain the context bill | [J] Nothing public at this granularity [NF] |

### 1.2 Conventions

| Asset | Path | For | Reader | Loads | Without it | Public precedent |
|---|---|---|---|---|---|---|
| TypeScript code | `.claude/rules/ts.md` (`**/*.{ts,tsx}`) | Only the non-default rules: strictness, error shape, module boundaries | A | Path | Agent defaults to generic style | Anthropic best practices: keep only lines whose removal would cause mistakes [S, via summaries of code.claude.com/docs/en/best-practices]\[13\]\[14\] |
| UI code | `.claude/rules/ui.md` (`**/*.tsx`, `packages/ui/**`) | "Only @/components/ui, only tokens, no raw hex"; points to DESIGN.md | A | Path | Slop bans cost tokens on backend tasks | Vercel: design-system rules "stay with their owners"; the skill routes rather than duplicates [V, Jun 25, 2026]\[1\] |
| Testing | `.claude/rules/testing.md` (`**/*.test.ts`) | Test pyramid, fixtures, Playwright conventions | A | Path | Tests that assert implementation, not behavior | [J] |
| Naming | Folded into `ts.md` and `events.md` | File, component and event names | A | Path | Inconsistent names across agents | PostHog event naming: see 1.7 [V] |
| Commit and PR | `.github/pull_request_template.md` plus a commitlint config | Conventional Commits, linked brief, screenshots at 3 breakpoints | B | At PR time | Unreviewable agent PRs | Conventional Commits [NF, not verified this thread]; the check itself should be commitlint, not prose [J] |
| Review | `docs/conventions/review.md` | What a reviewer (human or Assay) blocks on, severity scale | B | Explicit | Nits and blockers treated alike | Vercel P0 to P3 severity with "file/line..., canonical source, user consequence, and smallest concrete fix" [V]. Google engineering practices [NF]\[1\] |

### 1.3 Roles

| Asset | Path | For | Reader | Loads | Without it | Public precedent |
|---|---|---|---|---|---|---|
| Authoring guide | `docs/roles/README.md` (have) | Skeleton, scope, intake contract, precedence | H | Never at runtime | Role sprawl, inconsistent prompts | No public equivalent this rigorous [NF] |
| Department | `docs/roles/<category>/*.md` (have, 33) | Judgment per function | A | On injection | Nothing | [J] |
| Extensions | `Name_ext—<project>.md` (have) | Project-bound deltas | A | With the role | Project facts leak into universal roles | [J] |
| Subagent wrappers | `.claude/agents/<name>.md` | Thin wrappers (tools, model, a pointer to the role body) so Assay and Tally run in their own context | A | Invoked | Roles only work pasted into chat; no context isolation | Anthropic context engineering: sub-agents "with clean context windows" (Sep 29, 2025) [V snippet, S detail]\[15\]\[16\] |

### 1.4 Skills

| Asset | Path | For | Reader | Loads | Without it | Public precedent |
|---|---|---|---|---|---|---|
| House skills | `.claude/skills/plumb-ui-critic/`, `plumb-ui-diverge/`, `ui-code-lint/` | Repeatable procedures | A | Description always; body on trigger | Procedures stuffed into CLAUDE.md | Docs: "If an entry is a multi-step procedure... move it to a skill" [V]\[2\] |
| Adopted skills | `.claude/skills/shadcn/` (pinned) | Vendor procedures | A | As above | [n/a] | Thread 04 ruling [V] |
| Skill registry | `.claude/skills/REGISTRY.md` | Source, commit pin, hygiene-review date, measured `/context` cost, trigger phrases, owner | H | Never | Unknown provenance; shadowing surprises | "Agent Skills in the Wild": 26.1% of 31,132 skills had a vulnerability (arXiv:2601.10338) [V, thread 04] |
| Trigger tests | `evals/skills/<skill>.md` | 5 prompts that must trigger and 5 that must not | B | CI or manual | Skills that never fire, or always fire | [J] Vercel's `copywriting-eval/` is the nearest analogue [V]\[1\] |

### 1.5 Design layer (Plumb's own)

| Asset | Path | For | Reader | Loads | Without it | Public precedent |
|---|---|---|---|---|---|---|
| DESIGN.md | `docs/design/DESIGN.md` | Taste made executable; the constitution for UI | B | Via `ui.md` path rule | Generic output; passes the swap test for nobody | Spec Kit `constitution.md` read live [V]\[5\] |
| tokens.md | `docs/design/tokens.md` | Human rationale; the canonical values live in code | B | Path rule, summary only | Raw hex; drift | [J] |
| components.md | `docs/design/components.md` | Which component for which job | B | Path rule | Wrong component, right style | Vercel `product-judgment.md` plus component guide [V]\[1\] |
| states.md | `docs/design/states.md` | Every reachable state per surface | B | Brief and critic | Happy-path-only UI | Vercel: "Design every reachable state" [V]\[1\] |
| anti-patterns.md | `docs/design/anti-patterns.md` (17 entries) | House no-gos with a counter-example each | B | Path rule and critic | Slop | Thread 04 [V] |
| exemplars/ | `docs/design/exemplars/pr-<name>.md` | Shipped decisions worth repeating, and mistakes to avoid | B | Critic few-shot | Critic score drift | Vercel `exemplars/` [V]; textbook: Anthropic calibrated its evaluator with few-shot examples [S]\[1\] |
| coverage-gaps.md | `docs/design/coverage-gaps.md` | Areas with no standard yet | B | Critic and brief | Agents invent a standard where none exists | Vercel `coverage-gaps.md` [V]\[1\] |
| refs/ | `docs/design/refs/` | 3 to 6 annotated references per brief | B | Brief | Divergence without direction | Recipe A (have) |
| workflow.md | `docs/design/workflow.md` | Recipe A as a runbook, with round caps | B | Explicit | The loop lives in your head | [J] |
| tool-rulings.md | `docs/design/tool-rulings.md` | Adopt, mine, defer rulings with dates | H | Never | Rulings get re-argued | Thread 04 output (have in thread, not in repo) |
| Storybook stories | `packages/ui/**/*.stories.tsx` | Domain components: provenance chip, diff, measurement with units and confidence | B | Critic and agent reads | Prose cannot pin a component; agents reinvent it | Thread 04 remaining gap [V] |

### 1.6 Product layer (Compass consulted)

Compass's position, integrated here: every product fact currently inside the Compass §7 socket moves into files, and the role keeps only judgment. This follows your own precedence rule, "attached documents win over the role on fact."

| Asset | Path | For | Reader | Loads | Without it | Public precedent |
|---|---|---|---|---|---|---|
| Brief (= Specify output) | `specs/<feature>/brief.md` (have) | Problem, who, outcome, appetite, risk, UX states, EARS, open questions | B | Every feature task | Agents build the wrong thing well | Linear: specs "1-2 pages"; "Short specs are more likely to be read" [V, linear.app/method, accessed Sept 30, 2026]\[17\]\[18\] |
| Plan and tasks | `specs/<feature>/plan.md`, `tasks.md` | Architect and Tech Lead outputs | A | Implement phase | Builders improvise architecture | Spec Kit `plan-template.md` has a Constitution Check gate [V]\[19\] |
| PRD template | None. The brief is the PRD at seed stage | [n/a] | [n/a] | [n/a] | [n/a] | [J] PostHog uses RFCs, including a "New Product RFC template," for work over 2 to 3 weeks [V, posthog.com/handbook]\[20\]\[21\] |
| Charter | `docs/product/<product>/charter.md` | Thesis, business model, customer map, forbidden list, fit signatures, phase | B | Compass and brief tasks | Product facts duplicated per role | Kiro `product.md` steering file loads by default [S, kiro.dev docs]\[22\]\[23\] |
| Decision log | `docs/decisions/NNNN-<slug>.md` | One decision per file; status; supersedes | B | Grep on demand | Decisions re-litigated by every agent session | MADR 4.0.0 (released 2024-09-17) with minimal and bare templates; fields status, date, deciders, consulted, informed [V]\[24\]\[25\] |
| Roadmap pins | `docs/product/<product>/roadmap.md` | Now / next / later, and what is pinned against change | B | Compass | Scope creep via agent enthusiasm | Linear: roadmap, then projects, then cycles [S]\[26\] |
| Positioning one-pager | `docs/product/<product>/positioning.md` | Category, alternative, differentiator, proof; the human writes the thesis sentence | H (A for copy tasks) | Gloss and marketing tasks | Copy drifts from narrative | [NF] no primary source checked this thread |
| Opportunity Solution Tree | `docs/product/<product>/ost.md` | Outcome, opportunities, solutions, assumption tests | H | Compass | Solutions without opportunities | Teresa Torres [NF, not verified this thread] |
| Research ledger | `docs/research/ledger.md` plus `obs/` | Atomic observations: verbatim quote, timestamp, source ID | B | Alembic and Envoy | Synthesis without traceability | Textbook Part 5 (Dovetail; Abridge) [S] |
| Glossary | `docs/product/glossary.md` | Canonical nouns: "data room," "finding," "stockpile," "volume" | B | Path rule for copy files | Three names for one object | Vercel `glossary.md` [V]\[1\] |

### 1.7 Measurement layer (Tally consulted)

Tally's position, integrated here: the metric definitions are a public API, so they must live in a versioned file with a changelog, and not in Tally's prompt. Every brief's event plan references that file by ID.

| Asset | Path | For | Reader | Loads | Without it | Public precedent |
|---|---|---|---|---|---|---|
| Event taxonomy | `docs/metrics/events.md` | Names, properties, owners, status (live, deprecated) | B | Path rule on analytics code; brief | `user_sign_up` versus `user_signed_up` forks the data\[27\] | PostHog recommends `category:object_action`, present-tense verbs, static names, and new versions such as `registration_v2:sign_up_button_click` "to preserve historical data" [V, posthog.com docs, accessed Sept 30, 2026]\[27\]\[28\]\[29\] |
| Metric definitions | `docs/metrics/definitions.md` | North Star plus 2 to 4 inputs, guardrails; formula, event IDs, version | B | Tally; readouts | Silent redefinition; the trend line lies | dbt MetricFlow [NF, search budget exhausted] |
| Metrics changelog | `docs/metrics/CHANGELOG.md` | Version bumps; both series kept | H | Never | Unexplained breaks in the series | [J] Ahead of PostHog's event-versioning advice |
| Readout template | `docs/metrics/templates/readout.md` | Weekly written readout with a "what the data can't say" section | H | Tally | Small-n overclaiming | [J] |
| Rollout plan | `docs/metrics/templates/rollout.md` | Flag, cohort, guardrails, kill criteria, 48h replay review | B | Release runbook | Flags without exit criteria | [J] |
| Experiment plan | `docs/metrics/templates/experiment.md` | Pre-registered hypothesis, minimum detectable effect, stop rule | H | Tally | P-hacking at seed n | [J] |

### 1.8 References

| Asset | Path | For | Reader | Loads | Without it | Precedent |
|---|---|---|---|---|---|---|
| Laws of UX | `docs/references/laws-of-ux/` | Rule IDs, severities, pass and fail examples | A | Router, at most 3 files | Critic grounded in nothing | Thread 13 [V]; matches Vercel stable rule IDs [V] |
| Sibling folders | `wcag22/`, `conventions/`, `map-ui/`, `dense-ui/` | As planned in thread 13 Primers A to D | A | Router | [n/a] | Thread 13 |
| PROVENANCE.md | Per folder | Source, date, license, distillation notes | H | Never | Rules no one can trace | Thread 13 [V] |

### 1.9 Runbooks

| Asset | Path | For | Reader | Loads | Without it | Precedent |
|---|---|---|---|---|---|---|
| Release | `docs/runbooks/release.md` | Flag, events verified, rollout plan, 48h replay review, changelog | B | Explicit | Recipe A step 8 skipped under deadline | [J] |
| Incident | `docs/runbooks/incident.md` plus `postmortem-template.md` | Includes AI-specific incidents: a wrong citation, an unsupported claim shown to an investor | H | Explicit | Trust failures handled ad hoc | Google SRE Book ch. 15: blameless means "identifying the contributing causes... without indicting any individual" [V]; example postmortem has summary, impact, root causes, timeline, lessons [V]\[30\]\[31\] |
| Onboard a contractor | `docs/runbooks/onboard-human.md` | Repo tour, which files are law, how to run the loops | H | Explicit | Contractor reverse-engineers conventions | [J] |
| Onboard an agent | `docs/runbooks/onboard-agent.md` | For a new tool or model: verify `/context`, run `/doctor prompt-audit`, run the known-screen test | H | Explicit | New tool silently skips `CLAUDE.md` or `AGENTS.md` | Docs: `/doctor prompt-audit` finds "references to files or commands that don't exist, and files that contradict each other" (v2.1.283+) [V]\[2\] |
| Weekly rituals | `docs/runbooks/weekly.md` | Discovery calls, replay review, readout, toolkit prune | H | Explicit | Rituals decay | Textbook Part 7: "rituals are products" |

### 1.10 Evals (DealReady AI surfaces; Tally owns measurement, Assay owns rubric grading)

| Asset | Path | For | Reader | Loads | Without it | Precedent |
|---|---|---|---|---|---|---|
| Surface card | `evals/<surface>/README.md` | What the surface claims to do, pass bar, owner, last run | B | Harness and humans | "It feels better" instead of numbers | Anthropic "Demystifying evals for AI agents" (Jan 9, 2026): split capability evals from regression evals [S]\[32\] |
| Failure-mode catalog | `evals/<surface>/failure-modes.md` | Binary failure modes found through error analysis on real traces | B | Judge authoring | Generic "hallucination score" | Husain and Shankar: error analysis is "the most important activity in evals"; binary pass/fail over Likert [V, hamel.dev FAQ]\[33\]\[34\]\[35\]\[36\] |
| Judge prompts | `evals/<surface>/judges/<mode>.md` | One binary judge per failure mode | A | Harness | Unvalidated LLM judges | Husain and Shankar: "30 to 50 Pass examples and 30 to 50 Fail examples in both the dev and test sets" [V]\[37\] |
| Graded set | `evals/<surface>/cases.jsonl` (not markdown) | Question, documents, gold answer, gold spans | A | Harness | [n/a] | FinanceBench (Islam et al., Patronus AI, arXiv:2311.11944, Nov 20, 2023): 10,231 questions; the authors tested "16 state of the art model configurations (including GPT-4-Turbo, Llama2 and Claude2, with vector stores and long context prompts) on a sample of 150 cases" and manually reviewed the answers (n=2,400); GPT-4-Turbo with retrieval "incorrectly answered or refused to answer 81%" [V] |
| Harness README | `evals/HARNESS.md` | How to run, CI gate, cost per run | B | Explicit | Evals that nobody runs | Anthropic harness post (Mar 2026): "Out of the box, Claude is a poor QA agent" [S]\[38\] |
| Eval changelog | `evals/CHANGELOG.md` | Case additions, judge revisions, bar changes | H | Never | Moving goalposts | [J] |

---

## 2. Principles of the Toolkit

**Precedence.** Claude Code concatenates every instruction file rather than letting one override another. "If two instructions contradict each other, Claude may pick one arbitrarily" [V].\[2\] So precedence has to be written down, and conflicts have to be pruned rather than tolerated. The house ladder, from strongest to weakest:
1. Enforced checks: hooks, lint, types, tests. These are not negotiable.
2. The session's explicit instruction.
3. DESIGN.md and the product charter (the constitutions).
4. Accepted decisions in `docs/decisions/`.
5. The brief.
6. states.md and anti-patterns.md.
7. References.
8. Role judgment, which fills silences.

This merges thread 13's ladder with your role guide's fact-over-judgment rule. Vercel's published "Decision Authority" orders things similarly: the user's explicit goal, then verified evidence, then repository-canonical guidance, then accepted decisions, then adjacent shipped patterns, then general heuristics [V].\[1\] One deliberate difference [J]: a brief may not override DESIGN.md. It may request an exception, and the exception is recorded as a decision.

**Progressive disclosure.** Four tiers, each with a loading mechanism the tool actually honors:
- Always on: root files, the skill listing, auto memory.
- By path: `.claude/rules` with `paths`, nested `AGENTS.md`.
- By trigger: skill bodies.
- By explicit read: references through routers, runbooks, decisions by grep.

Imports are organization, not disclosure. They load at launch [V].\[2\]\[3\] Anthropic's context-engineering post (Sep 29, 2025) frames the goal as "the minimal set of high-signal tokens" and endorses a hybrid: CLAUDE.md "dropped into context up front," with just-in-time exploration for the rest [S, via summaries; post confirmed to exist].\[15\]\[16\]

**Repo versus project versus personal toolkit.** Three homes [J, built on verified loading facts]:
- **Personal toolkit**: a git repo you own, `taylor-toolkit/`. It holds universal roles, universal skills, the role guide, reference folders (laws-of-ux, wcag22, conventions), templates (brief, decision, readout, rollout, experiment, postmortem) and the runbook skeletons. Nothing client-confidential ever goes in it.
- **Project repo** (DealReady, Fybr, each of your products): vendored copies of the personal assets it uses, each with a provenance header (`source: taylor-toolkit@<sha>`). It also holds everything project-bound: charter, decisions, events, metrics, evals, extensions, DESIGN.md.
- **Personal machine**: `~/.claude/CLAUDE.md` for preferences only.

Vendor the copies; don't symlink or rely on personal scope, for three reasons:
- A `.claude/rules` symlink that points outside the working directory is treated as an external import. After approval, "only the ones without a `paths` field load" [V].\[2\] Your path-scoped rules would silently die.
- Personal skills outrank project skills in precedence (thread 04) [V]. A personal skill can shadow a client's repo skill, and a contractor never sees it.
- Fybr and DealReady must be operable without you.

**Universal versus project-bound, applied to every asset type** [J]:

| Asset type | Universal (lives in toolkit) | Project-bound (lives in repo) |
|---|---|---|
| Agent context | `AGENTS.md` skeleton, section order | Actual commands, layout, boundaries |
| Conventions | TS rules, testing, commit, review scale | Module boundaries, domain naming |
| Roles | 11-role department bodies with intake contracts | `_ext—<project>.md` |
| Skills | ui-critic, ui-diverge, ui-code-lint, eval skills | Product lines inside ui-code-lint; critic rubric house lines |
| Design | Anti-pattern base list, states taxonomy, workflow | DESIGN.md, tokens, components, exemplars, coverage gaps |
| Product | Templates: brief, decision, OST, positioning, ledger | Charter, decisions, roadmap, glossary, ledger entries |
| Measurement | Templates: readout, rollout, experiment; naming convention | Events, definitions, changelog |
| References | All reference folders | Pass/fail examples tied to a product (extension file per folder) |
| Runbooks | Skeletons | Filled runbooks |
| Evals | Harness pattern, judge template, failure-mode taxonomy | Cases, judges, bars |

**Staying current.** Every asset carries frontmatter or a leading HTML comment with `owner`, `last_reviewed` and `load_when`. Block-level HTML comments are "stripped before the content is injected into Claude's context" [V], so maintainer metadata costs zero tokens.\[2\] Beyond that:
- Changelogs are mandatory for four assets with downstream consumers: metrics, events, evals, DESIGN.md.
- Pruning cadence [J]:
  - Monthly: run `/doctor prompt-audit`, then apply the deletion test to every always-on line: "if I delete this, will Claude make a mistake?" [S, attributed to Anthropic best practices].\[13\]\[14\]
  - At every model upgrade: re-run the known-screen test and the eval suite, and delete compensations the new model no longer needs. Anthropic's harness post reports that tasks that once needed the evaluator "were now often within what the generator handled well on its own" [S].\[38\]
  - Quarterly: check redundancy across the whole toolkit.
- The update loop copies Vercel's pattern. Evidence from reviews, PR comments and replays becomes a proposed guideline edit, and a human accepts it. "Never promote one screenshot, one shipped file, or one reviewer comment into a universal rule by itself" [V].\[1\]

**The budget.** Recommendation [J]. It sits under Anthropic's documented target of "under 200 lines per CLAUDE.md file" [V]\[3\]\[14\] and is tighter because of the Gloaguen cost finding [V].\[2\]\[39\]

| Context | Contents | Budget |
|---|---|---|
| Always on, every session | `~/.claude/CLAUDE.md` (40 lines) + `AGENTS.md` (120 lines) + `CLAUDE.md` shim (20 lines) + zero unconditional rules + skill listing (at most 12 model-invocable skills, descriptions of at most 400 characters) + auto memory (tool-capped at 200 lines or 25KB [V])\[2\] | 4,000 tokens, excluding auto memory |
| Per UI task | Always-on + DESIGN.md (1,600, thread 13) + `ui.md` rule with token and component summary (2,500) + brief (1,500) + states and anti-patterns excerpts (1,500) + up to 3 law files (1,500) + one skill body (at most 5,000; the Agent Skills standard recommends under 5,000 tokens [S])\[40\] | 14,000 tokens |
| Per non-UI task | Always-on + `ts.md` and `testing.md` + nested package file + brief | 7,000 tokens |
| Critic subagent | Forked context: rubric, exemplars (3 at most), screenshots, brief | Own window; rubric plus exemplars at most 6,000 |

Enforce the budget with a CI script that counts tokens per file and per documented load path from `LOADING.md`, and fails the build on overage. That makes the budget itself pass the enforceability test.

---

## 3. The Gap Analysis

| Category | Item | Verdict | Action |
|---|---|---|---|
| Have | Role guide plus 33 roles, 11-role department | Strong on judgment; weak on runtime isolation | Add `.claude/agents/` wrappers for Assay, Tally, Compass |
| Have | Recipe A, three loops | Sound; lives in shared context, not the repo | Move to `docs/design/workflow.md` |
| Have | Design layer (target) | Right shape; matches Vercel's June 2026 structure | Add exemplars, coverage gaps, stories, lint\[1\] |
| Have | Brief template | Right sections; EARS criteria make it testable | Add "expected action" (thread 13) and an event-plan table referencing event IDs |
| Have | Four-phase spec flow | Correct; the brief is Specify | Keep `plan.md` and `tasks.md`; no Spec Kit directories |
| Missing | Evals layer | The largest product risk. DealReady's trust UI promises provenance, and nothing measures whether the provenance is true | Thread 16 |
| Missing | Enforcement: token lint, raw-hex ban, component-import lint, PreToolUse hooks, budget CI | Almost every rule you have is prose | Tier 2 build |
| Missing | Event taxonomy, metric definitions, changelog as files | Tally's API has no file | Thread 18 |
| Missing | Decision log template and folder | Compass "records decisions" with no format | Thread 17; MADR-minimal is the default candidate |
| Missing | Glossary | Needed by Gloss, Tally and builders | 1 hour, now |
| Missing | Runbooks (release, incident, onboard human, onboard agent, weekly) | Step 8 of Recipe A has no checklist | Tier 6 |
| Missing | Skill registry and trigger tests | Hygiene checklist exists; no record of results | 1 hour |
| Missing | Cross-tool contract (`AGENTS.md`) | Fybr contractors or Cursor sessions get nothing | Tier 1 |
| Redundant | Assay role and `ui-critic` skill | Two sources for one critic | The skill's body is Assay; the role file becomes the skill's reference |
| Redundant | PM role (engineering roster) and Compass | Both author Specify | Compass writes Problem, Who, Outcome and Appetite with you. PM becomes a formatting and EARS pass, or retires |
| Redundant | Brief and Spec Kit `spec.md` | Same artifact | One file: `brief.md` |
| Redundant | Slop bans in CLAUDE.md, the prompting checklist and anti-patterns.md | Three copies drift | anti-patterns.md is canonical; the others point to it |
| Redundant | Alembic, Envoy, Tribune for a solo operator | Three research roles, one person | Keep the bodies; inject one per thread [J] |
| Misplaced | Compass §7 socket facts | Facts inside a role violate your own precedence rule | Move to `charter.md` |
| Misplaced | Tally's metric definitions | Same | Move to `docs/metrics/` |
| Misplaced | Design bans loaded always-on | Pays UI tokens on backend tasks | `.claude/rules/ui.md` with `paths` |
| Misplaced | Thread rulings (04, 13) living in chat outputs | Not in the repo, so agents can't see them | `docs/design/tool-rulings.md`, `docs/references/*/PROVENANCE.md` |
| Misplaced (risk) | Em-dash filenames | Harder to type, glob and quote in shell; a tokenization and grep hazard for agents [J] | Keep for human-browsed role files if you insist; never for paths agents construct |
| Ahead | Precedence rule (documents win on fact; role fills silence) | Vercel published a comparable authority order in June 2026; yours is older and covers roles | Keep\[1\] |
| Ahead | Both-series metric versioning with changelog | PostHog's public advice stops at renaming events `_v2`\[27\] | Keep; publish it in the toolkit |
| Ahead | "What the data can't say" and small-n honesty | No public template found [NF] | Keep |
| Ahead | Critic separated from generator, capped rounds, few-shot calibration | Matches Anthropic's March 2026 harness finding; the round cap is your addition | Keep\[41\]\[42\] |
| Ahead | Skill hygiene review with `/context` measurement | Backed by the 26.1% vulnerability finding; most published setups lack it | Keep |

---

## 4. The Build Order

Ordered by dependency first, then leverage. Effort is in focused days for one engineer working with agents [J].

| # | Asset(s) | Why now | Owner role | Effort |
|---|---|---|---|---|
| 1 | `AGENTS.md`, `CLAUDE.md` shim, `.claude/rules/{ts,ui,testing}.md`, `LOADING.md`, budget CI script | Everything else loads through this; the budget must exist before the files do | Plumb (captain), Tech Lead | 1 day |
| 2 | DESIGN.md, tokens, components, states, anti-patterns finalized; Storybook stories for provenance chip, diff, measurement; token and import lint; `ui-critic` with 3 exemplars; `coverage-gaps.md` | The textbook's Monday plan; the agent-readability test fails without the stories | Plumb, Vesper, Assay; Threshold for states | 4 days |
| 3 | `docs/decisions/` template plus first 5 decisions backfilled; `glossary.md`; `charter.md` for DealReady and Fybr | Every later artifact cites decisions and glossary nouns | Compass, Architect | 1 day |
| 4 | `events.md`, `definitions.md`, metrics `CHANGELOG.md`, readout and rollout templates | The brief's event plan and Recipe A step 8 depend on these | Tally | 1.5 days |
| 5 | First DealReady eval set: one surface, failure modes from 100 real traces, 2 to 3 binary judges validated against human labels, harness plus CI gate | The trust claim is the product; the evals are its proof | Tally (measurement), Assay (rubric), Architect (harness), you (labels) | 5 days\[37\]\[43\] |
| 6 | Runbooks: release, incident plus postmortem template, onboard-agent, onboard-human, weekly | Operational once flags ship | Tech Lead; Compass for weekly | 1 day |
| 7 | Positioning one-pager, OST, research ledger structure | High value but not a dependency for building | Compass, Envoy, Alembic, Gloss | 2 days |
| 8 | Personal toolkit repo extraction with provenance headers; skill registry; trigger tests | Only after two projects have proven the assets | Plumb | 1 day |
| 9 | Reference sibling folders (wcag22, conventions, map-ui, dense-ui) | Already scheduled in thread 13 primers | Per thread 13 | Ongoing |

---

## 5. Convergence Tests Across the Proposed Toolkit

**Enforceability.** How can a violation be caught?
- **A machine can catch it:**
  - Raw hex and off-token values: lint.
  - Imports outside `@/components/ui`: lint.
  - Missing states: a Storybook story per state, plus Playwright at 3 breakpoints.
  - Context budget: CI.
  - Required sections in briefs, decisions and reference files: CI section lint.
  - Event names not in `events.md`: a typed event registry, where TypeScript fails on an unknown name.
  - Metric definition change without a changelog entry: CI diff check.
  - Eval regression: CI gate.
- **A rubric or reviewer can catch it:** DESIGN.md taste lines, anti-patterns (the critic rubric cites the ID), and review severity.
- **Nothing can catch it:** the positioning one-pager, OST, charter "phase," weekly rituals. These are H-reader assets, and that is acceptable. The failure would be pretending they govern agents.
- **Finding:** 11 of the proposed assets gain a mechanical check. Before this plan, 0 did.

**Displacement.** What each addition pushes out of the reader's attention:

| Addition | What it displaces |
|---|---|
| `AGENTS.md` | The tokens that used to hold slop bans. It stays ≤120 lines only because UI rules move to paths |
| `ui.md` path rule | About 2,500 tokens of task reasoning on every `.tsx` read. Accepted, because it replaces an ad hoc re-explanation |
| Exemplars in the critic | Rubric breadth. Cap at 3 so the critic still covers all rubric lines |
| Law files | Brief detail. The router's 3-file cap holds this |
| Glossary as a path rule on copy files | Nothing, as long as it stays ≤60 lines. Beyond that, split per product |
| Skill descriptions | Every model-invocable skill costs listing space in every session. That is why the cap is 12 and side-effect skills use `disable-model-invocation` |
| Evals | Your weekly time: about 2 hours of trace review. The displaced item is feature work, and that is the right trade for DealReady |

**Agent-readability.** Could a coding agent produce an on-system first draft from the layer plus a brief alone? Today, no. After build steps 1 to 3, yes for DealReady tables and forms. Fybr map surfaces are not yet covered: no `map-ui/` reference and no measurement-component story. Three blockers:
- Domain components exist only as prose.
- The brief has no expected-action field.
- `states.md` is not keyed per component.

Proof run: after step 2, give a fresh session only the repo and one brief, and grade the output with `ui-critic`. It passes if it has zero Blocking findings and uses no off-system components.

**Swap test.**
- These would fit any product: `AGENTS.md` skeleton, conventions, runbook skeletons. Correct, because they are universal.
- These must fail the swap test, and currently do (good): DESIGN.md, anti-patterns (manufactured-urgency ban, no artificial latency in DealReady), charter, eval failure modes.
- Weakest spot: `states.md` still reads generic until the per-product entries land.

**Example test.** Every principle in DESIGN.md, anti-patterns and law files already needs a pass/fail pair (thread 13). The new requirement extends that pair to decisions (the rejected option is the counter-example), event names (a good and a bad name in `events.md`) and judge prompts (Pass and Fail few-shots).

**Slop test.** Three toolkit-level tells show up in public repos: a generic "you are a senior engineer" preamble, advice the model already follows, and directory trees with no loading rule. The deletion test and the budget CI remove the first two. `LOADING.md` removes the third.

---

## 6. Investigation Checklist

Rows appear only where research beats judgment. Model tiers:
- Tier A: deepest available (Fable-class) with a long research budget.
- Tier B: standard.
- Tier C: light.

| # | Topic | Question it must answer | Inject | Thread | Tier |
|---|---|---|---|---|---|
| 1 | AGENTS.md at scale | How do teams with published nested files divide root and package files, and what do they leave out? | Plumb, Architect | New: 15 | A |
| 2 | Cross-tool parity | What exactly do Cursor (`.cursor/rules`), Codex (`AGENTS.override.md`, size caps) and Claude Code each load, so one source serves all three? | Plumb, Tech Lead | 15 | B |
| 3 | Budget measurement | How do you count tokens per load path reliably in CI, and what do Anthropic, OpenAI or Cursor document about limits? | Plumb, Tech Lead | 15 | B |
| 4 | Personal toolkit portability | Vendoring, plugins or submodules: what keeps provenance, works for contractors, and avoids personal-scope shadowing? | Plumb | 15 | B |
| 5 | Agent onboarding runbook | What verification proves a new tool or model loaded the context correctly? | Tech Lead | 15 | C |
| 6 | Eval set for a diligence AI | Which failure modes, case count, gold-span format and pass bar for DealReady's first surface; how to grade citation correctness | Tally, Assay, Compass | New: 16 | A |
| 7 | AI incident class | What postmortem fields capture an unsupported claim shown to an investor? | Tally, Tech Lead | 16 | B |
| 8 | Decision-log format | MADR-minimal versus Y-statements versus a single-file log: which survives agent grep and human review at seed stage? | Compass, Architect | New: 17 | B |
| 9 | OST and research ledger in markdown | How do Torres's OST and atomic-observation ledgers stay traceable in plain files? | Compass, Envoy, Alembic | 17 | B |
| 10 | Positioning one-pager | Which published format (April Dunford, Amazon PR/FAQ) fits a seed diligence tool? | Compass, Gloss | 17 | B |
| 11 | Metric taxonomy versioning | How do semantic-layer tools (dbt MetricFlow) and PostHog version definitions, and how are both series kept? | Tally | New: 18 | A |
| 12 | Event taxonomy enforcement | Typed registry versus PostHog schema enforcement versus lint: what catches an unknown event before it ships? | Tally, Tech Lead | 18 | B |
| 13 | Skill trigger design | How reliably do descriptions trigger, and how do you test trigger precision? | Plumb | Folds into 04 | B |
| 14 | Token and component lint | Which existing ESLint and Stylelint rules enforce tokens and imports in a shadcn/Tailwind codebase? | Plumb, Tech Lead | Folds into 04 | C |
| 15 | Map-UI and dense-UI references | As scoped in thread 13 | Plumb, Vesper | Thread 13 Primers C and D | B |

Rows deliberately left out, because judgment settles them: commit convention (adopt Conventional Commits plus commitlint), PR template, review severity scale (P0 to P3), runbook skeletons, and the precedence ladder.

---

## Caveats

- Several dated items are secondary. Anthropic's "Demystifying evals" (Jan 9, 2026) and harness post (Mar 2026) details come from summaries. The OpenAI Codex 88-file figure comes from aggregators. Anthropic best-practices quotes came via summaries.
- Not verified in this thread: Cursor rules, OpenSpec, BMAD, Tessl, Conventional Commits, Google engineering practices, dbt MetricFlow, Teresa Torres, Shape Up, Amazon PR/FAQ, GitLab handbook, Oxide RFDs. Each is either routed to a thread or ruled on as judgment.
- The context-file studies measure SWE-bench-style tasks, not UI convergence against a design system. The finding that context files add cost but not correctness may not transfer. Treat it as a caution, not a verdict.
- FinanceBench's 81% figure applies to one late-2023 configuration.\[44\] Harvey's BigLaw Bench is a vendor grading its own systems.\[45\] LegalBench-RAG gives two different dataset sizes (6,858 and 6,889).\[46\]
- All budgets and effort estimates are judgment.

---

## Appendix: Primer Prompts

### Primer 15 — Agent Context Architecture

**Assignment.** Plumb captains; Architect and Tech Lead are injected. You are defining the always-on and path-loaded layer for three repos (DealReady, Fybr, Taylor's own products) and the personal toolkit that feeds them.

**Decision served.** Final shape of `AGENTS.md`, the `CLAUDE.md` shim, `.claude/rules/`, nested files, `LOADING.md` and the budget CI, plus the vendoring method for the personal toolkit.

**Ask.**
1. How teams that publish nested `AGENTS.md` or `CLAUDE.md` split root from package files. Name at least 3 teams with dated repo links and line counts.
2. The exact load behavior of Claude Code, Cursor and Codex, from their docs, dated.
3. A token-counting method for CI.
4. Vendoring versus plugin versus submodule for the personal toolkit, judged on provenance, contractor access and shadowing.
5. A verification runbook for onboarding a new agent.

**Evidence rules.** Vendor docs and public repos are primary and dated. Aggregator guides are leads only. Label every claim verified, secondary or judgment. Mark what is not found. Never cite adoption counts without a primary source.

**Output shape.** Load-behavior matrix (tool × file × when). Annotated root `AGENTS.md` (≤120 lines) and shim. `LOADING.md` with token counts. Budget CI spec. Toolkit distribution ruling. Onboard-agent runbook.

**Done criteria.** A fresh session in each tool loads exactly what `LOADING.md` predicts, confirmed with `/context` or the equivalent. The budget CI fails a deliberately oversized file.

**Not wanted.** "Best AGENTS.md templates" listicles. Sections copied from other repos without a reason tied to these repos. Any file that loads always-on without a deletion-test justification.

### Primer 16 — DealReady Evals

**Assignment.** Tally leads measurement, Assay owns rubrics, Compass is consulted on which surface matters most, and Plumb captains. You are building the first graded eval set for one DealReady AI surface.

**Decision served.** Which surface to eval first, its failure modes, its pass bar, and the CI gate that blocks a release.

**Ask.**
1. Choose the surface with Compass. Default candidate: claim extraction with provenance.
2. Define error analysis on at least 100 real or realistic traces, following Husain and Shankar's method.\[43\]\[47\]
3. Write binary failure modes. Include at minimum: an unsupported claim, a citation to the wrong span, a correct claim with no source, a refusal when an answer exists, and a numeric mismatch with the source.
4. Specify the grading. Separate answer correctness from source correctness, per Harvey's BigLaw Bench split, and use span-level citation precision and recall, per ALCE.\[6\]\[8\]
5. Plan judge validation: 30 to 50 Pass and 30 to 50 Fail human labels per judge in both dev and test sets.\[37\]
6. Specify the harness and the AI-incident postmortem fields.

**Evidence rules.** Papers and engineering posts are primary and dated: FinanceBench, ALCE, LegalBench-RAG, Harvey BigLaw Bench, Anthropic's evals post, the Husain and Shankar FAQ. Vendor benchmark results are feature facts, not verdicts. No synthetic users standing in for investors. Synthetic inputs are allowed only when labeled as synthetic.

**Output shape.** `evals/<surface>/README.md`, `failure-modes.md`, one judge prompt per mode, the case schema, `HARNESS.md`, the CI gate definition, a postmortem template addendum.

**Done criteria.** Every judge has measured true positive and true negative rates against human labels.\[43\] The suite runs in CI with a stated cost per run. A deliberately broken citation fails the gate.

**Not wanted.** Generic "helpfulness" or "hallucination" scores, Likert scales, public benchmarks presented as DealReady's own quality, or tooling recommendations before the failure modes exist.\[35\]\[43\]\[48\]

### Primer 17 — Product Operating Artifacts

**Assignment.** Compass leads, with Envoy and Alembic for the research ledger and Gloss for positioning. Plumb captains. You are turning the Compass §7 socket into files.

**Decision served.** Templates and first instances for the charter, decision log, roadmap pins, positioning one-pager, OST, research ledger and glossary, for DealReady and Fybr.

**Ask.**
1. Choose a decision-log format: compare MADR 4.0.0 minimal, Nygard, Y-statements and a single-file log for agent grep and human review.
2. Write a charter template from the §7 fields.
3. Choose a positioning format from named, dated primary sources.
4. Design an OST in markdown that links to ledger observation IDs.
5. Define the atomic observation schema: verbatim quote, timestamp, source, consent.
6. Set glossary rules for canonical nouns.

**Evidence rules.** Primary sources dated: Torres's own writing, adr.github.io, Amazon's published PR/FAQ material, Linear's method pages, PostHog's handbook RFC pages. Where a format is chosen on judgment, say so.

**Output shape.** Seven templates. Filled DealReady charter and glossary. Five backfilled decisions. A one-paragraph rationale per format.

**Done criteria.** An agent asked "why did we choose X" answers from `docs/decisions/` with the right record. The Compass role file shrinks by the length of the facts it no longer holds.

**Not wanted.** Frameworks without a file. PRD templates duplicating the brief. Personas unsupported by the ledger.

### Primer 18 — Measurement Layer

**Assignment.** Tally leads, Tech Lead is injected for enforcement, and Plumb captains. You are moving Tally's public API into versioned files.

**Decision served.** Formats for `events.md`, `definitions.md`, the metrics changelog, and the readout, rollout and experiment templates. Also the mechanism that rejects unknown events.

**Ask.**
1. Document how PostHog, Segment and dbt MetricFlow name, version and deprecate events and metrics, dated.
2. Rule on a DealReady and Fybr naming convention: PostHog's `category:object_action` with present-tense verbs as the default candidate.\[27\]\[29\]
3. Choose a versioning scheme that keeps both series.
4. Compare enforcement options: typed registry, PostHog schema features, lint.
5. Write templates that include "what the data can't say" and small-n rules.

**Evidence rules.** Vendor docs are feature facts, dated. No verdicts drawn from vendor comparisons. Label every claim. Mark what is not found.

**Output shape.** Convention ruling. Four files plus three templates. An enforcement spec. A worked example: one metric at v1 and v2 with both series.

**Done criteria.** A build fails on an event name missing from `events.md`. A definition change without a changelog entry fails CI. A sample readout passes Tally's rubric.

**Not wanted.** Dashboards, tool migrations, North Star debates (Compass owns those), or statistics the seed-stage n cannot support.

## Sources

1. [Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel)
2. <https://code.claude.com/docs/en/memory>
3. [CLAUDE.md Best Practices (What Belongs in It)](https://prompt-architects.com/blog/321-claude-md-best-practices-what-belongs-in-it)
4. [Claude Code: Prune Stale CLAUDE.md Files to Improve Reliability](https://windowsforum.com/news/claude-code-prune-stale-claude-md-files-to-improve-reliability-megathread.441263/)
5. [spec-kit/docs/upgrade.md at main · github/spec-kit](https://github.com/github/spec-kit/blob/main/docs/upgrade.md)
6. [Introducing BigLaw Bench to Evaluate LLMs | Harvey](https://www.harvey.ai/blog/introducing-biglaw-bench)
7. [BigLaw Bench Deep Dive: Sources | Harvey](https://www.harvey.ai/blog/biglaw-bench-sources)
8. <https://arxiv.org/pdf/2305.14627v2>
9. [AGENTS.md](https://agents.md/)
10. [AGENTS.md Spec (2026): Recommended Sections + AGENTS.md vs CLAUDE.md vs .cursorrules](https://www.morphllm.com/agents-md-guide)
11. [AGENTS.md Complete Guide 2026: Spec, Tools, Examples](https://codersera.com/blog/agents-md-complete-guide-2026/)
12. [AGENTS.md Emerges as Open Standard for AI Coding Agents - InfoQ](https://www.infoq.com/news/2025/08/agents-md/)
13. [A Thorough Guide to Claude Code Best Practices: 5 Core Design Philosophies from Anthropic](https://zenn.dev/tmasuyama1114/articles/claude_code_best_practice_202601?locale=en)
14. [How to Write a CLAUDE.md File That Actually Works: Best Practices for API Projects](https://www.turbodocx.com/blog/how-to-write-claude-md-best-practices)
15. [Anthropic’s Approach to Effective Context Engineering for AI Agents](https://cr0nu3.github.io/posts/Effective_context_engineering_for_AI_Agents/)
16. [Context Engineering: AI Agent Optimization Guide](https://howaiworks.ai/blog/anthropic-context-engineering-for-agents)
17. [Principles & Practices - Linear Method](https://linear.app/method/introduction)
18. [How we run projects at Linear - Linear](https://linear.app/now/how-we-run-projects-at-linear)
19. [Document Templates](https://deepwiki.com/github/spec-kit/12.1-document-templates)
20. [posthog.com/contents/handbook/which-products.md at master · PostHog/posthog.com](https://github.com/PostHog/posthog.com/blob/master/contents/handbook/which-products.md)
21. [Communication - Handbook - PostHog](https://posthog.com/handbook/company/communication)
22. [Kiro Steering Files: .kiro/steering/, Modes, AGENTS.md](https://kirotutorial.com/concepts/steering/)
23. [Kiro Steering File: Create .kiro/steering Step by Step](https://kirotutorial.com/recipes/first-steering-file/)
24. [About MADR](https://adr.github.io/madr/)
25. [AI-Assisted ADRs in Markdown](https://mdedit.ai/blog/ai-assisted-adrs-in-markdown)
26. [Linear Project Management Guide: Features, Workflow, and Benefits](https://blog.tmetric.com/linear-project-management-guide-features-workflow-and-benefits/)
27. [Product analytics best practices](https://posthog.com/product-engineers/5-ways-to-improve-analytics-data)
28. [Product analytics best practices - Docs - PostHog](https://posthog.com/docs/product-analytics/best-practices)
29. [Event Taxonomy 101: The Object-Action Framework](https://productanalyticshandbook.com/blog/event-taxonomy-object-action/)
30. [Google SRE - Blameless Postmortem for System Resilience](https://sre.google/sre-book/postmortem-culture/)
31. [Google SRE: Incident Postmortem Example for Outage Resolution](https://sre.google/sre-book/example-postmortem/)
32. [Deep dive — Anthropic: Demystifying evals for AI agents — AI & Agent Evaluation](https://ai-eval.org/deep-dive/anthropic-demystifying-evals-for-ai-agents)
33. [LLM Evals: Everything You Need to Know Hamel Husain Shreya Shankar 2025-05-28](https://hamel.dev/blog/posts/evals-faq/evals-faq.pdf)
34. [Frequently Asked Questions (And Answers) About AI Evals Hamel Husain](https://files.btbytes.com/pdfs/ai/evals-faq.pdf)
35. [Evals Skills for Coding Agents - by Hamel Husain](https://hamelhusain.substack.com/p/evals-skills-for-coding-agents)
36. [Frequently Asked Questions (And Answers) About AI Evals Hamel Husain](https://www.gregorojstersek.com/evals-faq.pdf)
37. [AI Evals: Everything You Need to Know](https://hamel.dev/blog/posts/evals-faq/)
38. [harness/docs/research/260324\_anthropic\_harness\_design.md at main · celesteanders/harness](https://github.com/celesteanders/harness/blob/main/docs/research/260324_anthropic_harness_design.md)
39. [\[2602.11988\] Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?](https://arxiv.org/abs/2602.11988)
40. [Knowledge Activation: AI Skills as the Institutional Knowledge Primitive for Agentic Software Development](https://arxiv.org/pdf/2603.14805)
41. [Anthropic — Harness design for long-running application development — AI & Agent Evaluation](https://ai-eval.org/post/anthropic-harness-design-for-long-running-application-development)
42. [Harness Design for Long-Running Application Development — Agents Design](https://agentsdesign.dev/article/anthropic-harness-design-long-running-apps/)
43. [AI Evaluations Crash Course in 50 Minutes (Real Example)](https://creatoreconomy.so/p/ai-evaluations-crash-course-in-50-minutes-hamel-husain)
44. [FinanceBench: A New Benchmark for Financial Question Answering](https://arxiv.org/abs/2311.11944)
45. [Harvey (@harvey) on X](https://x.com/harvey/status/1829191298995343742?lang=en)
46. <https://arxiv.org/pdf/2408.10343>
47. [GitHub - benchflow-ai/awesome-evals: A curated, non-BS library of the best resources for building and evaluating AI agents — papers, blogs, talks, tools, benchmarks. Maintained by BenchFlow.](https://github.com/benchflow-ai/awesome-evals)
48. [How I AI: Hamel Husain's Guide to Debugging AI Products & Writing Evals](https://www.chatprd.ai/how-i-ai/debugging-ai-writing-evals)
