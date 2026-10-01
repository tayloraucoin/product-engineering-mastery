# Directory map (generated)

Every markdown file under `docs/` (118), written by `yarn directory-map`. Do not edit by hand. The map of the practice is `docs/index.md`.

## docs/decisions/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `changelog.md` | Changelog — amendments to the practice | decisions | adopted |
| `conflicts.md` | Conflicts — resolved | decisions | ruling |
| `decision.template.md` | Decision record (template) | decisions | adopted |
| `ledger.md` | Decisions ledger — every ruling, one line each | decisions | adopted |
| `only-you.md` | Calls only Taylor can make | decisions | draft |

## docs/decisions/records/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `0001-repo-is-reference-and-starter.md` | 0001 — This repository is both the conventions reference and the product starter, named `product-engineering-mastery` | decisions | ruling |
| `0002-package-scope-pem.md` | 0002 — Packages use the `@pem/*` scope | decisions | ruling |
| `0003-toolchain-pinned-to-house-set.md` | 0003 — The toolchain is pinned to the house set — TypeScript 5.9.2, Node 22, ESLint 9 — not `create-turbo`'s current TypeScript 7 / Node 24 / ESLint 10 | decisions | ruling |
| `0004-docs-as-root-markdown-rendered-by-apps-docs.md` | 0004 — Docs stay as markdown in the root `docs/`; `apps/docs` is a renderer over them, not the `create-turbo` example app and not a content home | decisions | ruling |
| `0005-two-packages-and-boundaries-lint.md` | 0005 — Start with two packages — `@pem/config` and `@pem/ui` — and the boundaries lint wired from day one | decisions | ruling |
| `0006-file-naming-and-filing.md` | 0006 — Files are named in ASCII kebab-case, and filing preserves every body byte for byte | decisions | ruling |
| `0007-docs-app-extends-its-renderer.md` | 0007 — The docs app keeps its own renderer, extended with frontmatter, layer grouping and search, instead of moving to Fumadocs | decisions | ruling |
| `0008-subagents-are-generated-opt-in.md` | 0008 — Subagents are generated from roles that opt in, with tools set in the role's frontmatter | decisions | ruling |
| `0009-canon-split.md` | 0009 — The canon splits in two, the builder's law in canon.md and the critic's rubric in canon-rubric.md | decisions | ruling |

## docs/design/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `canon-rubric.md` | Design canon — the critic rubric | design | ruling |
| `canon.md` | Design canon — the universal floor | design | ruling |
| `index.md` | The design layer — loops, Recipe A, and where verification sits | design | ruling |
| `skills.md` | Skills — adoption rulings, load order, and the review procedure | design | ruling |

## docs/design/templates/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `DESIGN.template.md` | DESIGN.md (template) — the product's design law | design | adopted |
| `anti-patterns.template.md` | anti-patterns.md (template) — the product's no-gos and model defaults | design | adopted |
| `components.template.md` | components.md (template) — which component for which job | design | adopted |
| `coverage-gaps.template.md` | coverage-gaps.md (template) — where no standard exists yet | design | adopted |

## docs/design/templates/refs/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `index.md` | refs/ (template) — the annotated reference set | design | adopted |

## docs/design/templates/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `states.template.md` | states.md (template) — the required state matrix | design | adopted |
| `tokens.template.md` | tokens.md (template) — the token role table | design | adopted |

## docs/design/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `workflow.md` | Workflow — tools per loop | design | ruling |

## docs/engineering/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `codebase-conventions.md` | Codebase conventions | engineering | adopted |
| `tech-stack.md` | Tech stack | engineering | adopted |

## docs/evals/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `failure-modes.template.md` | Failure-mode catalog (template) | evals | adopted |
| `judge.template.md` | Judge prompt (template) — one binary judge per failure mode | evals | adopted |
| `surface.template.md` | Eval surface card (template) | evals | adopted |

## docs/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `index.md` | The practice — map | decisions | ruling |

## docs/metrics/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `definitions.template.md` | Metric definitions (template) — versioned, both series kept | metrics | adopted |
| `events.template.md` | Events (template) — the event taxonomy | metrics | adopted |
| `experiment.template.md` | Experiment plan (template) — the pre-registered rule | metrics | adopted |
| `readout.template.md` | Readout (template) — what moved, and what this scale can't tell us | metrics | adopted |

## docs/product/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `brief.template.md` | Brief (template) — the frame | product | draft |
| `cycle-charter.template.md` | Cycle charter (template) | product | draft |
| `glossary.template.md` | Glossary (template) — canonical nouns | product | adopted |
| `index.md` | The product layer — templates and gates | product | adopted |
| `package.template.md` | Package (template) — the shaped bet | product | draft |

## docs/prompts/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `00-shared-context.md` | Shared context — attach to every thread alongside the role prompt | prompts | adopted |
| `index.md` | Primer prompts — index and run order | prompts | adopted |
| `pa-consolidation-and-the-map.md` | P-A — Consolidation and the map (general Claude thread, Opus) | prompts | adopted |
| `pb-practice-layer-and-docs-app.md` | P-B — The practice layer and the docs app (Claude Code, in the repo, Opus) | prompts | adopted |
| `pc-demo-app-and-skills.md` | P-C — The demo app and the skills (Claude Code, in the repo, Opus) | prompts | adopted |
| `pd-library-batches.md` | P-D — Library batches (general Claude threads; the retargeting note) | prompts | adopted |
| `pe-port-dry-run.md` | P-E — The port dry-run and the README (Claude Code, fresh directory, Sonnet is enough) | prompts | adopted |
| `pf-agent-context-architecture.md` | P-F — Agent context architecture | prompts | draft |
| `pg-measurement-layer.md` | P-G — Measurement layer | prompts | draft |
| `ph-product-operating-artifacts.md` | P-H — Product operating artifacts | prompts | draft |
| `pi-ai-evals.md` | P-I — AI evals | prompts | draft |

## docs/references/_meta/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `books-plan.md` | Books extraction plan (Prompt 12, Part 8.4 canon) | references | draft |
| `extraction-guide.md` | Reference Library Extraction Guide | references | draft |

## docs/references/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `index.md` | References — the router | references | adopted |

## docs/research/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `00-shared-context-original.md` | Shared context — attach to every thread (original, product-bound) | research | archived |
| `01-tools-per-loop-plumb.md` | Plumb ruling 01 — design tools per loop (DealReady, Fybr, personal kit) | research | archived |
| `02-framer-marketing-sites-vitrine.md` | Framer for marketing sites — Vitrine investigation | research | archived |
| `03-staging-branches-customer-testing-tally.md` | Customer variant testing and honest A/B at seed scale | research | archived |
| `04-design-skills-adoption-plumb.md` | Design Skills for Coding Agents: Plumb's Adoption Ruling | research | archived |
| `05-shape-up-compass.md` | Shape Up at AI speed — Compass report and cycle charter | research | archived |
| `06a-shift-nudge-free-layer-alembic.md` | Shift Nudge Free-Layer Inventory | research | archived |
| `06b-shift-nudge-curriculum-vesper.md` | Shift Nudge — Phase 2: Curriculum, Free-First Plan, Purchase Case, Design-Layer Candidates | research | archived |
| `06c-sn-ui-checklist-shift-nudge.md` | Shift Nudge sn-ui-checklist skill (third-party copy) | research | archived |
| `07a-kowalski-motion-inventory-alembic.md` | Emil Kowalski's public motion work: a source-faithful inventory | research | archived |
| `07b-motion-skill-vesper.md` | Motion skill: Phase 2 (Vesper) | research | archived |

## docs/research/07c-motion-skill-files-vesper/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `SKILL.md` | Motion skill bundle — SKILL.md (as delivered) | research | archived |

## docs/research/07c-motion-skill-files-vesper/references/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `catalog.md` | Motion skill bundle — Micro-interaction catalog | research | archived |
| `law.md` | Motion skill bundle — The motion law | research | archived |
| `product-dealready.md` | Motion skill bundle — Motion in DealReady (product-bound) | research | archived |
| `product-fybr.md` | Motion skill bundle — Motion in Fybr (product-bound) | research | archived |
| `review.md` | Motion skill bundle — Motion review: rubric line for the critic | research | archived |
| `values.md` | Motion skill bundle — Motion values | research | archived |

## docs/research/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `08-refactoring-ui-review-vesper.md` | Refactoring UI — review and canon ruling | research | archived |
| `09-design-plus-code-review-vesper.md` | Design+Code (Meng To): review and canon ruling | research | archived |
| `10-product-talk-academy-review-envoy.md` | Product Talk Academy — is it alive, what does it teach beyond the book, and should Taylor enrol? | research | archived |
| `13-laws-of-ux-reference-layer-plumb.md` | Laws of UX as a Reference Layer | research | archived |
| `14-toolkit-map-plumb.md` | The Toolkit Map | research | archived |
| `pa-conflicts-unresolved-alembic.md` | Conflicts between reports — unresolved | research | archived |
| `pa-design-candidates-alembic.md` | Design-layer candidates — every proposed line, grouped not merged | research | archived |
| `pa-filing-plan-alembic.md` | Filing plan — attached files to target paths | research | archived |
| `pa-phase-2-checklist-plumb.md` | Phase 2 checklist — the practice layer | research | archived |
| `pl-toolkit-plan.md` | The craft toolkit: regrouped plan | research | archived |

## docs/roles/engineering/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `forge-staff-engineer.md` | Role Prompt — Forge · Staff Engineer | roles | adopted |
| `gardner-growth-engineer.md` | Role Prompt — Gardner · Growth Engineer | roles | adopted |
| `loom-ai-systems-architect.md` | Role Prompt — Loom · AI Systems Architect | roles | adopted |
| `mason-cto-principal-dev.md` | Role Prompt — Mason · Principal Full-Stack Product Engineer (CTO-level) | roles | adopted |
| `vigil-qa.md` | Role Prompt — Vigil · QA & Product Experience Lead | roles | adopted |
| `warden-security-privacy-engineer.md` | Role Prompt — Warden · Security & Privacy Engineer | roles | adopted |

## docs/roles/marketing-growth/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `cantor-copywriter.md` | Role Prompt — Cantor · Lead Copywriter & Voice Steward | roles | adopted |
| `cantor-ext-human-hand-mode.md` | Extension — Cantor · Human-Hand Mode | roles | adopted |
| `drummer-sales-funnel-lead.md` | Role Prompt — Drummer · Sales & Funnel Lead, Local Websites (Agora Network Technologies) | roles | adopted |
| `hearth-brand-strategist.md` | Role Prompt — Hearth · Brand Strategist | roles | adopted |
| `lantern-social-marketing.md` | Role Prompt — Lantern · Social Marketing Lead | roles | adopted |

## docs/roles/operations-strategy/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `assayer-opportunity-product-strategist.md` | Role Prompt — Assayer · Opportunity & Product Strategist | roles | adopted |
| `crucible-devils-advocate.md` | Role Prompt — Crucible · Devil's Advocate & Red-Team Reviewer | roles | adopted |
| `pilot-business-advisor.md` | Role Prompt — Pilot · Startup Business Advisor | roles | adopted |
| `reeve-project-manager.md` | Role Prompt — Reeve · Technical Engineering Project Manager | roles | adopted |

## docs/roles/product-design/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `alembic-research-synthesizer.md` | Role Prompt — Alembic · Research Synthesizer | roles | adopted |
| `assay-ui-critic.md` | Role Prompt — Assay · UI Critic | roles | adopted |
| `compass-product-strategist.md` | Role Prompt — Compass · Product Strategist | roles | adopted |
| `envoy-user-researcher.md` | Role Prompt — Envoy · User Research Specialist | roles | adopted |
| `gloss-content-designer.md` | Role Prompt — Gloss · Content Designer | roles | adopted |
| `index.md` | Product-design department — role coverage report | roles | adopted |
| `plumb-design-director.md` | Role Prompt — Plumb · Design Director | roles | adopted |
| `tally-metrics-analyst.md` | Role Prompt — Tally · Metrics Analyst | roles | adopted |
| `threshold-accessibility-auditor.md` | Role Prompt — Threshold · Accessibility Auditor | roles | adopted |
| `tribune-customer-advocate.md` | Role Prompt — Tribune · Customer Advocate | roles | adopted |
| `vesper-ux-ui-designer.md` | Role Prompt — Vesper · Lead UX/UI Designer | roles | adopted |
| `vitrine-web-designer.md` | Role Prompt — Vitrine · Lead Web Designer | roles | adopted |

## docs/roles/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `role-authoring-guide.md` | Guide — Authoring a Role Prompt | roles | adopted |

## docs/roles/science-clinical/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `sage-behavioral-scientist.md` | Role Prompt — Sage · Behavioral Scientist | roles | adopted |

## docs/roles/trust-legal-compliance/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `chancery-regulatory-counsel.md` | Role Prompt — Chancery · Regulatory & Compliance Counsel | roles | adopted |
| `porter-member-support-trust-safety.md` | Role Prompt — Porter · Member Support & Trust-Safety Lead | roles | adopted |

## docs/runbooks/

| File | Title | Layer | Status |
| --- | --- | --- | --- |
| `onboard-agent.md` | Onboard an agent — verify the context loads as documented | runbooks | adopted |
| `postmortem.template.md` | Postmortem (template) — blameless, with the AI-incident fields | runbooks | adopted |
| `release.template.md` | Release (template) — from merged to read | runbooks | adopted |
| `variant-testing-runbook.md` | Variant testing at small scale (runbook) | runbooks | draft |
