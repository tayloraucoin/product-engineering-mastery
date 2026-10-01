---
title: Design-layer candidates — every proposed line, grouped not merged
description: Read when merging the canon into DESIGN.md, tokens.md, anti-patterns.md, states.md or the critic rubric. Holds every line any report proposed for those files, verbatim, with source and target, duplicates grouped side by side.
layer: design
status: draft
thread: P-A
role: Alembic
date: 2026-10-01
supersedes:
load_when:
---

# Design-layer candidates

## How to read this file

- **Source codes** are as in `docs/decisions/ledger.md`.
- **Wording.** Text in quotation marks is verbatim. Where a candidate carries an example, counter-example or enforcement line, only the principle is copied, and the cut is marked `[ex/cx: source]`. Plumb's message 2 re-derives examples from the demo app's surfaces, and the product-bound examples would not survive that step anyway.
- **Groups.** Lines from different reports that address the same rule sit together. Nothing is merged.
- **Counts.** "Reports" counts distinct report files. "Underlying" names the original source where two reports trace to the same one, so a duplicate does not read as independent agreement.

## 1. DESIGN.md

**G-D01 — Hierarchy before size.** 2 reports. Underlying: Shift Nudge (R06b) and Refactoring UI (R08).

- R08 §6 R1 → DESIGN.md: "Hierarchy by weight and color before size, with a contrast floor." Principle: "Secondary information recedes through the muted-foreground token and a lower weight, at the same or near size. The muted token must pass 4.5:1 on every surface it sits on, in every theme." [ex/cx: source]
- R06b §4 #1 → "`DESIGN.md` type law; `tokens.md` caps the named text styles": "**2–4 type sizes per screen; reach for weight, case or color before a new size.**" [ex/cx: source]

**G-D02 — Soften the competitors.** 1 report.

- R08 §6 R2 → DESIGN.md: "When one element must stand out, lower the visual weight of its neighbours before adding weight to it." [ex/cx: source]

**G-D03 — One place for boldness.** 2 reports. R07b names R04's principle as its source.

- R04 Mined into DESIGN.md: "**Spend boldness in one place** … Principle: each surface gets one signature element; everything around it stays quiet." [ex/cx: source]
- R07b law.md L19: "**Motion follows hierarchy; it does not create it.** The primary object of a transition gets the longest, most spatial motion. Secondary elements (overlay, sibling content) get opacity only, at the same or a shorter duration. Nothing secondary moves more than the primary." (R07b calls it "the buildable form of Plumb's 'spend boldness in one place'")

**G-D04 — Labels and structure.** 3 reports. Underlying: frontend-design (R04), Refactoring UI (R08), Meng To (R09).

- R04 Mined into DESIGN.md: "**Structure is information** … Principle: labels, numbering, dividers and eyebrows must encode something true about the content." [ex/cx: source]
- R08 §6 R4 → DESIGN.md: "**Display data explains itself; labels are a last resort, except on inputs.**" Principle: "Format values so they need no key. Combine label and value into one phrase. Every input keeps a visible, programmatic label." [ex/cx: source]
- R09 §6 C-3 → "Assay rubric wording, not a new principle": "**Hierarchy before labels, proximity before containers.**" [ex/cx: source]

**G-D05 — Heading level versus visual size.** 1 report.

- R08 §6 R5 → DESIGN.md: "Semantic heading levels stay correct for assistive technology. Visual size follows the screen's focal point." [ex/cx: source]

**G-D06 — Width.** 1 report.

- R08 §6 R7 → DESIGN.md: "**Width is given, not filled.** … Components take the width their content needs. Prose is capped at about 65–75 characters. Surplus width goes to a rail or to margin, never to stretching." [ex/cx: source]

**G-D07 — Copy for actions and errors.** 1 report proposes. 2 related lines elsewhere.

- R04 Mined into DESIGN.md: "**A control says what happens, and the action keeps its name** … Principle: button labels are verbs for the actual outcome, and the resulting toast reuses the same word."
- R04 Mined into DESIGN.md: "**Errors direct, they don't apologize; empty is an invitation** … Principle: explain what failed and how to fix it; empty states name the first action."
- Related, not proposed for DESIGN.md: R07b catalog.md Success, "the button label changes to the past tense of its verb for 1.5s"; R08 §6 R3, which routes destructive-label copy "to Gloss".

**G-D08 — Interactive states.** 2 reports. See also S-01.

- R04 Mined into DESIGN.md: "**Interactive states increase contrast** … Principle: hover, active and focus are each more prominent than rest, and focus is always visible."
- R06b §4 #4 → states.md: see S-01.

**G-D09 — Accent and color roles.** 2 reports. Underlying: impeccable (R04) and Shift Nudge (R06b).

- R04 Mined into DESIGN.md: "**Restrained color** … Principle: tinted neutrals plus one accent at no more than 10 percent of the surface; color carries state, not decoration."
- R06b §4 #2 → "`DESIGN.md` color law; `anti-patterns.md`": "**Structural colors stay distinct from interactive colors; accent is never decoration.**"

**G-D10 — Contrast and color alone.** 2 reports.

- R08 §6 R11 → DESIGN.md: "When a colored element fails contrast, use dark text on a light tint rather than darkening the color toward black. Every status carries a second signal: text, icon or shape."
- R06b §4 #5 → "`DESIGN.md`; Threshold criteria": "**Never color alone.**"

**G-D11 — Numbers.** 2 reports. R08's line targets components.md.

- R04 Mined into DESIGN.md: "**Numbers align** … Principle: numeric columns and measurement readouts use tabular figures."
- R08 §6 R8 → components.md: "Numeric columns are right-aligned with tabular numerals, with units in the header or a consistent suffix. A large value and its small unit share a baseline."

**G-D12 — Separation.** 2 reports. R06b's line targets anti-patterns.md.

- R08 §6 R13 → DESIGN.md: "Reach for spacing or a surface change first. Hairlines are reserved for group boundaries and data grids where scanning needs them."
- R06b §4 #6 → anti-patterns.md: "**Space before lines; borders only in service of hierarchy.**"

**G-D13 — The removal test.** 1 report.

- R09 §6 C-1 → DESIGN.md (stated "Principle"): "Named tells in `anti-patterns.md` stay banned outright on product surfaces. Everything the list does not name must pass the removal test: name the element, state its job (information, state, action, hierarchy, meaning), remove it mentally, and keep it only if something real is lost."

**G-D14 — Every asset and every motion has a job.** 2 reports. The job lists differ; see CF-39.

- R09 §6 C-2: "Each section's brief carries one line per media asset (what it must explain, where the subject sits, how copy shares the frame) and one line per motion (which of state, causality, hierarchy, continuity or spatial change it explains). No line, no asset."
- R07b law.md L1: "**Motion must do one of four jobs, or it does not exist.**" The jobs: "Feedback … State change … Spatial relationship … Continuity".

**G-D15 — The motion section.** 2 reports. R07b explicitly replaces R04's line; see CF-34.

- R04 Mined into DESIGN.md: "**Motion: exits faster than entrances, and reduced motion keeps feedback** … Principle: 100–150 ms for feedback and 150–300 ms for state changes. Reduced motion means fewer and gentler animations, but confirmations stay visible."
- R07b §5, proposed replacement, verbatim:
  > **Motion.** Motion carries information or does not exist: feedback, state change, spatial relationship, continuity.
  >
  > - Keyboard-initiated actions, data values, and anything used hundreds of times a day do not animate.
  > - High-stress paths use opacity only.
  > - Properties: transform and opacity only. Easing: ease-out for enter and exit, ease-in-out for on-screen movement, never ease-in, never bounce.
  > - Durations come from motion tokens and stay at 300ms or less. Exits run at about 80% of the entrance.
  > - Reduced motion keeps opacity and every confirmation, and drops movement.
  > - Counter-example: a number counting up in a diligence table.
  > - Values and provenance: tokens.md. Procedure: the `motion` skill.
- Related: R06b §4, "IIDS 10 ('Motion clarifies relationships and supports continuity') is the adoptable version. Hold it for the motion skill"

**G-D16 — Type floor.** 1 report, carrying a contradiction between two source checklists; see CF-38.

- R06a T6 (SK): "Keep primary content at 16px or larger unless there is a strong accessibility-aware reason not to."
- R06a T15 (AX): "Is the text at a readable size? (Primary body copy no smaller than 16px)"
- R06b §4, proposed: "the floor applies to _reading_ text (prose, descriptions, provenance explanations). Tabular data may go lower, with a stated minimum and Threshold's zoom test (200 and 400 percent) as the condition." No target is named. [ASSUMPTION: DESIGN.md type law] `[product-bound]`

**G-D17 — Field-mode tokens and the expected action.** 1 report. `[product-bound]`

- R13 Recommendations 3 → DESIGN.md: "Add two tokens to DESIGN.md: a field-mode target size and a one-hand thumb zone. Also add a rule that briefs must name the expected action at each decision point."

## 2. tokens.md

**G-T01 — Spacing.** 1 report.

- R08 §6 R6 → tokens.md: "Tailwind v4 accepts any spacing multiplier, so `tokens.md` lists the allowed steps and everything else is off-system. Space between groups is always greater than space within a group."

**G-T02 — Color.** 1 report.

- R08 §6 R9 → tokens.md: "**Color is defined up front, in OKLCH, as ramps plus semantic pairs per theme.** … Every color used is a named token from a ramp. Surfaces use background/foreground pairs defined in both themes. Nothing is picked at the point of use."

**G-T03 — Neutrals.** 3 reports. They disagree on warmth; see CF-36.

- R08 §6 R10 → tokens.md: "Greys are tinted, with low chroma and a stated temperature, per product." [ex: "DealReady on a warm, low-chroma neutral ramp (start from shadcn's Stone or Taupe base)"]
- R06b §4 #7 → "`tokens.md`; `anti-patterns.md` ('gray proliferation')": "**Disciplined neutrals.**"
- R04 anti-patterns, Cream background entry, alternative: "the neutral surface token at chroma toward the brand hue, not toward warmth by default."

**G-T04 — Color meaning.** 1 report.

- R06b §4 #3 → "`tokens.md` role definitions": "**One meaning per shade.**"

**G-T05 — Radius.** 1 report.

- R06b §4 #8 → "`tokens.md`; `anti-patterns.md`": "**One radius logic.**"

**G-T06 — Elevation.** 1 report.

- R08 §6 R12 → tokens.md: "There are four named levels: resting, raised, overlay, modal. Nothing uses a shadow outside its level. In dark mode, elevation is expressed by lighter surfaces, with shadows minimal."

**G-T07 — Motion tokens.** 1 report. Values verbatim from R07b values.md.

- Easing:
  - `--motion-ease-out` `cubic-bezier(0.23, 1, 0.32, 1)`
  - `--motion-ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)`
  - `--motion-ease-drawer` `cubic-bezier(0.32, 0.72, 0, 1)`
  - `--motion-ease-hover` `ease`
  - `linear`
  - banned: `ease-in`, bounce, elastic
- Duration:
  - `--motion-duration-instant` 0ms
  - `--motion-duration-fast` 125ms
  - `--motion-duration-press` 160ms
  - `--motion-duration-base` 180ms
  - `--motion-duration-moderate` 250ms
  - `--motion-duration-sheet` 500ms
  - `--motion-duration-hold` 1500ms
  - ceiling: 300ms
- Transform:
  - `--motion-scale-press` 0.97
  - `--motion-scale-enter` 0.95
  - `--motion-translate-enter` 8px
  - `--motion-blur-crossfade` 2px
  - `--motion-stagger` 40ms
- Spring:
  - `--motion-spring-default` `{ type: "spring", duration: 0.35, bounce: 0 }`
  - `--motion-spring-pointer` `{ stiffness: 300, damping: 30 }`
- Rules: "exit duration is the entrance duration × 0.8, rounded to the nearest 10ms"; the distance rule (over 50% of the viewport uses the upper bound; under 16px uses the lower bound).
- Status: tags as in the source. `--motion-duration-hold` and `--motion-spring-pointer` values are [INFERRED], and R07b flags the pointer spring "Validate by eye".

**G-T08 — Text styles.** See G-D01 (R06b #1, "`tokens.md` caps the named text styles").

**Open values, no line to copy.** R08 Convergence tests: "R10 and R12 need Plumb to choose actual token values."

## 3. anti-patterns.md

**G-A01 — Default font.** 4 reports plus SC.

- SC Prompting checklist: "ban the slop tells in `CLAUDE.md` (Inter everywhere, purple-to-white gradients, 4-card grids, weak hover states)"
- R04: "**Inter everywhere** (the default font)." [why/alternative: source]
- R08 §6 B4: "**A neutral sans picked as the safe default.**" [why/alternative: source]
- R09 §6 Rejected: "'Inter, Geist, and Manrope are great for modern apps' and multi-layer 'beautiful shadows'"
- R06b §1.2: "'system fonts first' is not the same as your 'Inter everywhere' slop tell. Worth reconciling in `anti-patterns.md`." See CF-37.

**G-A02 — Gradients.** 3 reports plus SC.

- SC: "purple-to-white gradients"
- R04: "**Purple-to-white or purple-to-blue gradient wash** (and gradient text)."
- R08 §6 B3: "**Decorative background gradients, patterns or blobs in product surfaces.**"
- R06b (SK slop row, for the rubric): "Decorative noise \| Borders, shadows, blur, or gradients without a hierarchy purpose"

**G-A03 — Card grids and icon tiles.** 3 reports plus SC.

- SC: "4-card grids"
- R04: "**The four-card grid** (same-size cards, icon plus heading plus two lines, repeated)."
- R08 §6 B2: "**Small icon enlarged inside a tinted circle or rounded square as a feature marker.**"
- R02 Convergence tests (Framer agent defaults): "a 2x3 grid of feature cards"

**G-A04 — Hover and affordance.** 2 reports plus SC.

- SC: "weak hover states"
- R04: "**Weak hover states**."
- R06b (SK slop row, for the rubric): "Weak affordance \| Interactive elements do not look interactive"

**G-A05 — Accent stripes.** 2 reports.

- R04: "**Side-stripe borders** (colored `border-left` over 1px on cards and alerts)."
- R08 §6 B1: "**Colored side or top stripe on cards and alerts.**"

**G-A06 — Cream background.** 1 report. See CF-36.

- R04: "**Cream / sand / paper background** (near #F4F1EA; tokens named paper, cream, bone)."

**G-A07 — Eyebrows.** 1 report.

- R04: "**An eyebrow above every section** (tiny uppercase tracked kicker)."

**G-A08 — Section numbers.** 1 report.

- R04: "**01 / 02 / 03 section markers**."

**G-A09 — Hero metric.** 1 report.

- R04: "**The hero-metric template** (big number, small label, supporting stats, gradient accent)."

**G-A10 — Nested cards.** 2 reports.

- R04: "**Nested cards**."
- R08 §6 R12 counter-example: "a card inside a card, each with its own shadow."

**G-A11 — Gray text.** 2 reports.

- R04: "**Gray text on a colored background, or light-gray body text**."
- R08 rubric line 4: "No grey text on colored backgrounds."

**G-A12 — Glass and blur.** 3 reports.

- R04: "**Glassmorphism as default**."
- R09 §6 Rejected: "The spectacle skill packs (glass dark UI, beam glow states, liquid-metal borders, gooey blobs, mesh gradients, holographic depth) on any DealReady or Fybr product surface." `[product-bound]`
- R07b law.md L14: "Blur is 2px at most on product surfaces."

**G-A13 — Bounce.** 2 reports.

- R04: "**Bounce or elastic easing**."
- R07b Cuts: "Spring bounce 0.1–0.3 'when used'" ("Bounce is 0").

**G-A14 — Placeholder as label.** 2 reports.

- R04: "**Placeholder as label**."
- R08 §6 R4 counter-example: "a placeholder standing in for an input label."

**G-A15 — Duplicate CTA intent.** 1 report.

- R04: "**Duplicate CTA intent** ('Get started', 'Try free', 'Sign up')."

**G-A16 — Spinners.** 2 reports.

- R04: "**Generic spinner for page loads**."
- R07b catalog.md Loading: "A spinner is only for in-button async (with the button width locked) and for indeterminate background work."

**G-A17 — Manufactured urgency.** 3 reports.

- R04: "**Manufactured urgency (product no-go)**: countdowns, 'only 2 seats left', guilt copy on dismiss, streaks."
- R09 §6 Rejected: "**designcode.io's lifetime-discount countdown,** which restarts at 72:00:00 per page load. File it as the anti-patterns entry for manufactured urgency on pricing surfaces."
- R02 Convergence tests (Framer agent defaults): "a launch countdown timer"

**G-A18 — Motion tells.** 1 report. `[product-bound]` for camera.

- R07b §5: "shake on error; count-up numbers; shimmer skeletons on data tables; camera moves on data refresh; animated keyboard navigation; hover scale on cards and rows."

**G-A19 — Fabricated system behavior.** 1 report. `[product-bound]`

- R13 Recommendations 5: "no artificial latency and no artificial progress in DealReady."

**G-A20 — Rebuilt native controls.** 1 report.

- R08 §6 B5: "**Native controls rebuilt as custom visuals.**"

**G-A21 — Gray proliferation and type-size count.** 2 reports. Underlying: Shift Nudge SK, in both.

- R06b SK rows: "Gray proliferation \| Too many nearly identical neutrals"; "Too many font sizes \| More than 4 distinct sizes on one screen or section"
- R04 rubric: "more than 4 font sizes per screen … gray proliferation"

**G-A22 — Radius count.** 1 report.

- R06b §4 #8 counter-example: "'The card uses 4 corner radii.'"

**G-A23 — Model defaults.** 1 report.

- R09 §6 amendment 5: "**Keep a model-defaults note in `anti-patterns.md`:** what each model you use reaches for unprompted, updated when you switch models."

**G-A24 — Marketing-register rejections.** 1 report.

- R09 §6 Rejected: "Clone modes and 'rebuild a premium website without copying its identity' lessons."; "'Success Modal and Confetti'"; "'Customize your UI for 10x Conversion'. An outcome claim with no measurement."

**G-A25 — Framer template tells.** 1 report. Marketing register.

- R02: "a testimonials carousel, a 2x3 grid of feature cards, a liquid-gradient hero shader, parallax, scroll-triggered fade-ins and a launch countdown timer"

## 4. states.md

**S-01 — Obvious states.** 2 reports.

- R06b §4 #4 → states.md: "**Make states painfully obvious.**" (source atoms E8, E9, E7)
- R04 DESIGN.md interactive-states line (G-D08)

**S-02 — Empty states.** 2 reports.

- R08 §6 R14 → states.md: "An empty state says what will be here, offers the first action, and hides controls that act on nothing."
- R04 (G-D07): "empty states name the first action."

**S-03 — Missing states.** 1 report.

- R06b SK row: "Missing states \| Hover, focus, disabled, error, empty, or loading states are absent" (rubric)

**S-04 — Structural requirements.** 1 report.

- R14 §1.5: `states.md` holds "Every reachable state per surface"
- R14 §5: "states.md is not keyed per component"
- R14 §5: "states.md still reads generic until the per-product entries land"

**S-05 — Loading thresholds (lives in the motion skill).** 1 report.

- R07b catalog.md Loading: "Show nothing for the first 200ms, then show the skeleton. Once it has shown, keep it for at least 400ms before swapping to content." Marked [INFERRED], "Validate with Tally on real latency".

## 5. Critic rubric (ui-critic / Assay)

**K-01 — Evidence rules.** 2 reports. Underlying: Shift Nudge SK, in both.

- R04: "Evidence: every finding cites a screenshot region or `file:line`; states you cannot see are marked UNVERIFIED, not passed."
- R06b §4: "Base findings on visible evidence. Do not invent issues you cannot verify." / "If reviewing a screenshot only, mention when states, interactions, or responsive behavior cannot be confirmed." / "Prefer concrete language like 'The card uses 4 corner radii' over 'The design feels inconsistent.'"

**K-02 — Review order.** 2 reports. Underlying: Shift Nudge SK.

- R04: "Priority order: purpose and clarity, then hierarchy/layout/interaction, then color and state, then polish."
- R06b §4: "1. Clarity of the problem and interface purpose 2. Hierarchy, layout, and interaction clarity 3. Color and state usage 4. Stylistic consistency and polish"

**K-03 — Output format.** 4 reports.

- R04: "Output: Top 3 priorities, then each rubric line as PASS / N issues / N/A, then the round verdict."
- R06b §4: "SK's 'N/A' is not Assay's 'unverified'. Keep both"; praise kept to "one-line strong verdict"
- R07b review.md: "`Motion: PASS | N issues (M# list) | N/A`, followed by findings in `file:line`, severity-ranked, no more than 5 lines."
- R13 index.md: "Cite findings as: Fails <Law> [<RULE-ID>] at <element>: <evidence>. Fix: <fix>."

**K-04 — Common-mistake rows.** 2 reports. Underlying: Shift Nudge SK.

- R04: "Common-mistakes lines: more than 4 font sizes per screen; spacing off the token scale; accent used decoratively; gray proliferation; decorative borders, shadows or blur."
- R06b §4 (for "Assay's rubric line 7 by name"):
  - "Too many font sizes \| More than 4 distinct sizes on one screen or section"
  - "Arbitrary spacing \| Gaps that do not follow a consistent spacing rhythm"
  - "Weak hierarchy \| Everything feels equally important"
  - "Color role confusion \| Accent or CTA colors used decoratively instead of functionally"
  - "Gray proliferation \| Too many nearly identical neutrals"
  - "Decorative noise \| Borders, shadows, blur, or gradients without a hierarchy purpose"
  - "Weak affordance \| Interactive elements do not look interactive"

**K-05 — Refactoring UI additions.** 1 report. R08 §6, by Assay rubric line.

- 1 Hierarchy: "**Greyscale test:** desaturate the screenshot. There is one focal point, and secondary information recedes by weight and color, not only by size."
- 1 Hierarchy: "**Action count:** at most one primary-styled action per view. Destructive primary appears only in confirmations."
- 1 Hierarchy: "**Label test:** any key–value pair that could be a formatted phrase is a finding (display data only)."
- 2 Spacing: "**Proximity:** space between groups is greater than space within groups, everywhere. No off-list multipliers."
- 3 Typography: "Prose at 75 characters or fewer. Numeric columns right-aligned with tabular figures. Mixed sizes on one line share a baseline."
- 4 Color: "No grey text on colored backgrounds. No meaning carried by color alone. Muted text passes AA."
- 6 Design-layer fit: "Separation by space or surface before border; shadows only at their named elevation."
- 7 Slop tells: "B1–B4 checked by name."

**K-06 — Motion line.** 1 report. R07b review.md, check text and severity. [how-to-verify column: source]

- M1 "Every animation has a job (feedback, state, spatial, continuity)". Should-fix.
- M2 "Nothing animates on keyboard-initiated actions". Blocking (DealReady), Should-fix (Fybr).
- M3 "Data does not move: no count-up, no row animation on sort/filter, no tweened live values". Blocking.
- M4 "High-stress paths are still: no shake, pulse, flash, bounce, or scale on error or destructive UI". Blocking.
- M5 "Only tokens: no raw `ms`, `cubic-bezier`, or spring numbers outside tokens". Should-fix.
- M6 "No `ease-in`; no bounce or elastic; no spring with `bounce` above 0". Should-fix.
- M7 "Transform and opacity only; blur 2px or less; no `backdrop-filter` or layout-property transitions". Should-fix (Blocking over the Fybr map).
- M8 "Durations: 300ms or less for UI (except the Vaul sheet and capped `flyTo`); exits at about ×0.8 of enters". Should-fix.
- M9 "Popovers and menus scale from their trigger; entrance scale is 0.95, not 0". Consider.
- M10 "Reduced motion is designed: each animation has an equivalent, confirmations stay, drag still tracks". Blocking if a confirmation disappears; otherwise Should-fix.
- M11 "Fybr only: the camera never moves without user input; `flyTo` has `maxDuration` and `essential: false`". Blocking. `[product-bound]`
- M12 "Frequency: no motion on anything used tens or hundreds of times a day beyond the catalog treatment". Consider.

**K-07 — Laws of UX hook.** 1 report.

- R13 SKILL.md line: "Before scoring, read /docs/references/laws-of-ux/index.md and load at most three law files for the task type. Cite rule IDs (e.g. LUX-HICK-01)."
- R13 Assay role line: "Findings cite a rule ID; a finding without one is Consider at most."
- The 31 LUX rule IDs live in the law files (references layer), not in the rubric. Pointer: R13, delivered files.

**K-08 — Separation of maker and judge.** 2 reports plus SC.

- R09 §6 C-4: "Assay receives the brief, the rubric and the screenshots, and nothing from the builder's summary."
- R09 §6 amendment 7: "**Withhold builder rationale from the critic pass** (C-4)."
- SC Prompting checklist: "separate generate and critique passes into different roles"

**K-09 — Severity scale.** 3 reports. They disagree; see CF-40.

- R13 and R07b: Blocking / Should-fix / Consider.
- R14 §1.2 `docs/conventions/review.md`: "Vercel P0 to P3 severity"

**K-10 — Exemplars.** 1 report.

- R14 §5: "Exemplars in the critic … Cap at 3 so the critic still covers all rubric lines"

## 6. Proposed for other targets (pointers only)

- **components.md**
  - R08 §6 R3: "One primary action per view; destructive styling follows hierarchy, not semantics."
  - R08 §6 R8 (G-D11).
  - R06b §4 #9: "**Cut repeated units.**"
  - R04 shadcn: "Empty states use `Empty`"; "Use `Skeleton` for loading placeholders"; "Dialog, Sheet, and Drawer always need a Title."
- **UI prompting checklist (SC):** R09 §6 amendments 1–4, 6, 8.
- **Workflow / Recipe A:** R06b #10 (comprehension check); R09 C-4.
- **Form requirements for every canon line:**
  - R14 §5: "Every principle in DESIGN.md, anti-patterns and law files already needs a pass/fail pair"
  - R08 and R09 address their lines to Plumb in "principle, example, counter-example" form.
