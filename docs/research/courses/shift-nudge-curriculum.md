---
title: "Shift Nudge — Phase 2: Curriculum, Free-First Plan, Purchase Case, Design-Layer Candidates"
description: Read when deciding on the Shift Nudge purchase or tracing a Shift Nudge canon line.
layer: research
status: archived
thread: "06"
role: Vesper
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Shift Nudge — Phase 2: Curriculum, Free-First Plan, Purchase Case, Design-Layer Candidates

**Role:** Vesper (Lead UX/UI Designer), building on Alembic's Phase 1 inventory (checked 2026-09-30).
**Recipient for section 4:** Plumb.

## How to read this

- **Tags.** Every line of the curriculum document carries one:
  - `[DIRECT]` cites a Phase 1 atom ID (T, L, C, S, I, E, P, R, AI, X series).
  - `[INFERRED]` gives the reasoning in a clause.
  - `[UNKNOWN]` means I won't reconstruct it.
- **Where the free material supports a lesson.** For lesson titles that match a UI-checklist category line, I point to the atom rather than restating it.
- **Pedagogy.** Nothing here claims how a lesson *teaches*. Phase 1 shows only that every lesson follows "why it matters / real client work / how to apply" plus a design exercise `[DIRECT, P16]`.

### Assumptions

- `[ASSUMPTION: you are already fluent in Figma, so Figma 101 is skip-grade except lesson 10]`
- `[ASSUMPTION: DealReady's main surface is a dense deal-room table with provenance on claims]`
- `[ASSUMPTION: Fybr's main surface is a map with a stockpile list, confidence and units visible]`
- `[ASSUMPTION: about 4–5 hours a week for the free plan]`

---

## 1. The curriculum document

### 1.0 The program's own spine (read this first)

These are the few things that make this program *this* program rather than a generic UI course. The drift test is measured against them.

- `[DIRECT, R13]` **Typography, layout, color — in that order.** Most "off" screens break down in one of the three `[DIRECT, R13]`, and fixing TLC "alone will clean up most designs" `[DIRECT, R14]`.
- `[DIRECT, S9; IIDS 8]` Style comes after the fundamentals: "Order comes before style."
- `[DIRECT, observed in CUR]` The module order is Typography → Layout → Color → Style. That is TLC order with style after it.
- `[INFERRED]` **The UI checklist is the course's exam.**
  - Its categories (Start/Getting Started, Typography, Layout, Color, Style, Imagery, Elements, Tactics) match the curriculum's module names one-to-one. `[DIRECT, UIW/SK vs CUR — name match]`
  - The inference is that each category's lines summarize what that module asks you to be able to check.
  - This is the main lever for reconstruction below. It is also why the full 101-item checklist is the single most valuable free asset.
- `[DIRECT, IIDS]` **IIDS is the canon.** It is sixteen principles, openly in the Swiss lineage.
- `[DIRECT, T13, T14]` **Fewer is the default posture.** Fewer sizes read as intentional.
- `[DIRECT, E8]` **"Make it painfully obvious"** is the standard for states.
- `[DIRECT, AI2, AI9, AI10]` **On AI:** context sets the ceiling, the trained eye does the finishing, and the claim is that AI gets you to about 80 percent.

### 1.1 Start (10 lessons)

| Lesson | Reconstruction |
|---|---|
| Design Process Overview (16:55) | `[DIRECT, P1/P5]` Name the human problem before designing. `[DIRECT, P6]` Complexity decides whether you do a low-fidelity pass at all. `[DIRECT, P4/P8]` Know the business and technical constraints. `[INFERRED]` This lesson is where those four "Start" checklist lines are taught, because it is the only process-level lesson in the module. |
| Using Reference Material (24:57) | `[DIRECT, P3/P7]` The side-by-side test: could you put your design next to the reference and walk through what you borrowed without it reading as a copy? `[UNKNOWN]` How references are gathered or annotated. |
| Pro-Designer Mindset; UX vs. UI; Welcome; How Everything Works | `[UNKNOWN]` |
| Choosing Design Software; Quick Keys; Organizing Design Projects; Figma Organization | `[INFERRED]` Tool hygiene, from the titles. Low value to you. |

### 1.2 Typography (13 lessons)

| Lesson | Reconstruction |
|---|---|
| Font Size (16:44) | `[DIRECT, T1, T8, T9, T13, T14]` Aim for 2–4 sizes per screen or section, and as few as possible. More than 4 is a named mistake. "Three was enough" in the published breakdown. |
| Font Weight (17:29) | `[DIRECT, T3, T11]` Reach for weight before adding a size. |
| Hierarchy (25:42) | `[DIRECT, T4; IIDS 1]` Hierarchy matches content priority, and type is what establishes it. |
| Titles & Body (31:32) | `[DIRECT, T6, T15]` 16px floor for primary content. SK allows an accessibility-aware exception; AX states none (a known divergence, see section 4). `[DIRECT, T16, T17]` Line height, and 45–75 characters per line. |
| Callouts (36:21) | `[INFERRED]` Likely applies T3/T12 (case, weight or color instead of a new size) to small emphasis text. Reason: callouts are the usual place a stray fourth size creeps in. |
| Truncation (17:52) | `[DIRECT, T19]` Set explicit truncation or layout-change rules per viewport. `[DIRECT, I2]` Stress-test dynamic content against awkward edge cases. |
| Text Style Definitions (27:53) | `[INFERRED]` Named text styles are the mechanism that enforces T1/T2 (merge stray sizes). Reason: a capped set of named styles is the only durable way to hold a 2–4 size budget. This maps directly to your `tokens.md`. |
| Interactive Text (25:20) | `[DIRECT, C13]` Links carry a non-color signal such as an underline. `[DIRECT, E14, E15]` Action-oriented labels; `<a>` versus `<button>`. `[INFERRED]` The lesson covers how link and button text is styled, from the title plus these atoms. |
| Start With System Fonts (28:04) / Using Alternate Fonts (22:23) | `[INFERRED, from title wording]` System fonts are the default and a custom face is a deliberate later step. `[DIRECT, T5]` The typeface must support the intended personality. Note: "system fonts first" is not the same as your "Inter everywhere" slop tell. Worth reconciling in `anti-patterns.md`. |
| Combining Text and Elements; Typography Overview; Details of UI Typography from Apple | `[UNKNOWN]` |

### 1.3 Layout (11 lessons)

| Lesson | Reconstruction |
|---|---|
| The Box Model (24:50) | `[UNKNOWN]` The body is unknown. The free "Box model animations" file demonstrates a two-frame technique for a thread on the topic (Phase 1 §3). Download it before guessing. |
| Grids & Containers (28:34) | `[DIRECT, L2, L13, L14, L15; IIDS 2]` A clear grid; a 12-column framework for flexibility with fixed mathematical relationships; build on the framework from the start so later changes don't break the structure. |
| Implicit Grid (23:41) | `[UNKNOWN]` This was once a free lesson (availability unconfirmed). Try to get it in week 2. |
| Negative Space (21:54) | `[DIRECT, L3, L4, S4]` Space defines relationships, and space separates before lines do. |
| Alignment (12:40) / Optics vs. Math (24:49) | `[DIRECT, L2, L6, L13]` Visually balanced alignment; correct optically when the mathematically correct placement looks wrong. |
| High & Low Density (28:18) | `[DIRECT, L7]` Density matches the type and volume of the content. `[UNKNOWN]` How he handles dense data. This is the lesson most relevant to DealReady, and the public layer has one line on it. |
| Scale, Weight, & Hierarchy (22:07) | `[DIRECT, L11; IIDS 5, 7]` "Everything feels equally important" is the named failure. Proportion and precision create hierarchy. |
| Affordance (19:25) | `[DIRECT, L8, L12; IIDS 9]` Interactive things must look interactive, and the interface confirms the action. |
| Interactive Layouts (26:22) | `[INFERRED]` Likely teaches L9: remove or layer content that doesn't need to be visible at once. Reason: it is the only layout checklist line about interaction-driven structure. This is the Fybr novice-versus-surveyor progressive-disclosure problem. |
| Layout Connectors (19:00) | `[UNKNOWN]` |

### 1.4 Color (10 lessons)

| Lesson | Reconstruction |
|---|---|
| Color Picking Methods (23:17) | `[DIRECT, C1]` A systematic palette, never ad hoc picking. |
| Contrast & Accessibility (26:57) | `[DIRECT, C2, C13, C14]` Contrast across text, icons, controls and states. Thresholds of 3.0 for large text and informational graphics, 4.5 for other text, 7.0 for high-contrast AAA. Never color alone. |
| Structural vs. Interactive (34:53) | `[DIRECT, C3, C9]` The title and the checklist line match exactly: structural colors stay distinct from interactive ones, and accent or CTA color used decoratively is a named mistake. |
| First, Second, Third (21:46) | `[INFERRED]` Likely CTA hierarchy (C4, "Establish a clear CTA hierarchy"). Reason: the numbered title plus a checklist line about ranking actions. Phase 1 found nothing public on this lesson. |
| Strategic Definitions (16:58) | `[DIRECT, C10, C11]` One meaning per shade; audit what each color means. `[INFERRED]` Colors are defined by role, not by hue. Reason: "definitions" plus the meaning-per-shade essay. |
| Amount & Modification (23:37) | `[UNKNOWN]` |
| Gradients (31:49) | `[DIRECT, C8, S8, S9]` Only when they help; gradients without a hierarchy purpose are named noise; chasing trendy gradients is the fundamentals-skipper's move. |
| Nifty Shades of Grey (14:13) | `[DIRECT, C5, C9]` Keep neutrals disciplined; too many near-identical grays is a named mistake. |
| White & Almost White (25:20) | `[INFERRED]` The light-theme counterpart to C7. Reason: the paired title, and C7 only covers dark UI. |
| Secrets of Dark UI (14:38) | `[DIRECT, C7]` Avoid pure black and pure white unless deliberate. |

Also `[DIRECT, C12]`: shifting color can introduce deliberate hesitation before an important decision. This is relevant to destructive actions in DealReady.

### 1.5 Style (10 lessons)

| Lesson | Reconstruction |
|---|---|
| Design Direction (27:32) | `[DIRECT, S1]` The direction is describable in a few specific adjectives. The tension with Plumb's "no moodboard adjectives" is resolvable: adjectives are acceptable only if each rules something out. Carry an example and a counter-example (see section 4). |
| Subtlety is Key (19:59) | `[DIRECT, S7, S10]` Restraint removes what isn't needed; don't pile on blur, opacity and effects. |
| Corner Radius (36:34) | `[DIRECT, S2, R8]` Radii are intentional and consistent. "The card uses 4 corner radii" is the program's own example of a concrete finding. |
| Borders & Dividers (31:15) | `[DIRECT, S3, S4]` Borders support hierarchy without dominating it, and space goes in before lines. |
| Depth, Lighting and Shadow (27:30) | `[DIRECT, S5, C6]` Depth reinforces the visual model, and color can carry depth. |
| Opacity & Blur (24:18) | `[DIRECT, S7, S8]` Only with a reason; decorative blur is noise. |
| Button Styles (23:04) | `[DIRECT, S6, E2]` Considered interaction states on key actions. |
| Form vs. Function (21:53) | `[INFERRED]` Likely IIDS 14: avoid depending on style. Reason: the title restates that principle's tension. |
| Deconstructing Styles (73:08) | `[UNKNOWN]` This is the longest lesson in the course, which suggests it is a centerpiece. |
| Marketing Site Style (21:41) | `[UNKNOWN]` Route to Vitrine regardless. |

### 1.6 Imagery (11 lessons)

| Lesson | Reconstruction |
|---|---|
| Imagery Overview; Static Images; Dynamic Images | `[DIRECT, I1, I2; IIDS 13]` Every image earns its place, dynamic imagery is stress-tested, and visuals serve clarity rather than decoration. |
| To Rasterize or Not (12:38) | `[DIRECT, I5, I7]` Prefer SVG or CSS; no text inside bitmaps. |
| Blend Modes (18:23) / Photo Manipulation (26:46) | `[DIRECT, I11]` The published blur-plus-blend-mode masking technique. `[UNKNOWN]` Anything beyond it. |
| Creating Icons (24:01) / Using Icons (25:20) | `[DIRECT, I4, I10]` One system for icon size, stroke, fill and role; icons need 3.0 contrast and a label. |
| Simple Illustrations (29:32) | `[DIRECT, I6]` Use illustration intentionally. |
| Resourceful Assets; App Icons | `[UNKNOWN]` |

`[DIRECT, I3]` Empty states still feel designed. The checklist files this under Imagery.

### 1.7 Elements (12 lessons)

| Lesson | Reconstruction |
|---|---|
| Navigation (23:42) | `[DIRECT, E1]` Focused and scannable. |
| User Input (12:52) / Forms (33:52) | `[DIRECT, E2, E3, E4, E16]` Full input states; ask only for what is necessary; required versus optional is obvious; feedback says what happened and what to do next. |
| Profile (18:38) / Settings (16:52) | `[DIRECT, E5]` Considered end to end. |
| Lists & Cards (15:49) | `[DIRECT, E9, E10]` Whole-card selection makes the state unmissable; remove repeated units such as "/10, /10, /10". `[UNKNOWN]` The lesson's rule for choosing list versus card. The old free lesson "Lists vs. Cards" may answer it. |
| Modals (13:58) | `[DIRECT, E18]` Nothing changes context automatically ("Newsletter popups anyone?"). `[UNKNOWN]` Beyond that. |
| Tables (27:14); Sorting & Filtering (18:58); Detail Screens (12:51) | `[UNKNOWN]` Nothing public. These are the three lessons closest to DealReady's core, and the strongest single argument for the purchase. |
| Design Systems (41:29) | `[DIRECT, E6]` Components are complete beyond the happy path. The free "Lego design system" file is his published system example. `[UNKNOWN]` The lesson body. |
| Introduction to Elements | `[UNKNOWN]` |

### 1.8 Tactics (11 lessons)

| Lesson | Reconstruction |
|---|---|
| No-stress Experiments / Low-Fidelity Designs | `[DIRECT, P6, P9]` Complexity decides low-fidelity; the result should look explored, not first-draft. |
| Mobile-First Responsive (38:39) | `[DIRECT, P10]` Mobile forces prioritization. |
| iOS Design / Material Design | `[DIRECT, P11]` Follow platform conventions, or break them for a stated reason. |
| Leading Design Reviews (20:07) | `[INFERRED]` Likely teaches the review method that SK encodes: name the artifact, evidence only, leverage first, concrete language, top three priorities (R1–R12). Reason: SK is the program's own review skill, and this is the only review lesson. |
| Prototyping (1:11) | `[DIRECT, P13]` Prototype when motion or state matters. The lesson is 71 seconds long, so it is a pointer, not a teaching unit. |
| Design Doc Organization; Developer Handoff | `[UNKNOWN]` |
| Pricing & Getting Work | `[UNKNOWN]` Irrelevant to you. |
| Bonus: Figma Variants | `[DIRECT, free asset]` The "Variants" Figma file (listing not found; get it via the files gate). |

### 1.9 Claude Code for Designers (20 lessons, about 3 h 24 m total, plus 24+ hours of behind-the-scenes footage)

- **What the course stands on:**
  - `[DIRECT, AI2, AI4, AI7, AI8]` Spec the build and supply the context before the model starts. The method (spec, steer, iterate) outlasts the tools.
  - `[DIRECT, AI5]` Comprehension checks come before the build begins.
  - `[DIRECT, the visible prompt]` The published prompt asks the model to read the spec and context files and say what it thinks is being built *before writing anything*. That is a concrete, adoptable pattern (section 4, candidate 10).
  - `[DIRECT, AI6]` Six modes of working with AI: ideation, research, spec, build, play, refine.
  - `[DIRECT, AI9, AI10, AI11]` The eye trained in the interface course is what makes the building good. Rhythm, hierarchy and micro-adjustment are named as what AI can't do.
- **Setup lessons:** `[INFERRED]` About 46 minutes (terminal basics through hello world) are setup you already have, judging by the titles. Skip-grade.
- **Canvas vs Code (11:05):** `[UNKNOWN]` content. `[INFERRED]` It maps onto your three-loop model by title. It is the one lesson worth checking against Recipe A.
- **Tools named:** Figma MCP, Agentation, DialKit, Ghostty.
  - `[DIRECT, tool names only]` The names are public.
  - `[INFERRED]` DialKit ("live-tuning", "tuning animation feel") is a polish-loop tool for motion. Reason: the titles describe direct manipulation of a running build. Route to Plumb for the Prompt 01 tool ruling.
- **Behind-the-scenes footage:** `[UNKNOWN]` all bodies. Three titles name exactly your gaps:
  - "Breaking AI target fixation"
  - "Designing while building"
  - "Tuning animation feel with DialKit"

### Convergence (buildability and drift)

- **Cut for drift.** I removed every reconstruction that would have been generic design-course filler: what "Pro-Designer Mindset" or "UX vs. UI" teaches, anything about table best practice, and anything about modal patterns. Where the only available fill was convention, the line is `[UNKNOWN]`.
- **Honest drift finding.** Read line by line, most of the SK checklist is close to industry-standard UI review. The program's distinctive point of view lives in:
  - the TLC ordering,
  - the "fewest sizes" and "painfully obvious" essays,
  - the structural-versus-interactive color split,
  - IIDS,
  - the spec-plus-comprehension-check AI stance.

  Weight those.
- **Buildability.** Every `[DIRECT]` line can be turned into a check without a follow-up question. The `[INFERRED]` lines are hypotheses to test against the gated assets and, if you buy, the lessons.

---

## 2. Free-first study plan (four weeks)

**Before week 1 (about 30 minutes).** Get the gated free material:
- The 101-item UI checklist and the files list (both behind a free name and email).
- The three old free lessons (Design Process, Implicit Grid, Lists vs. Cards), if still reachable.
- The 2024 workshop replays, if reachable.

Record what you got. Any "not reachable" is a Phase 1 update.

| Week | Material | Exercise on your own work | Output |
|---|---|---|---|
| **1 — TLC and the checklist as an instrument** | NL-TLC; IIDS (all 16); full 101-item checklist; SK; Figma 101 lesson 10 only | Take the DealReady deal-room table and the Fybr map-plus-list screen. Do a TLC pass in order: count type sizes per screen (T1), then layout, then color. Then run SK on the same two screenshots in Claude and compare its top three with yours. | A size/weight/color inventory for both screens, and a note of where your top three and SK's differ. The differences are where your eye is uncalibrated. |
| **2 — Layout and density** | NL-VLA; Implicit Grid and Lists vs. Cards (if obtained); Box model, Lego design system and Variants files | Rebuild the DealReady table at two densities on your grid (L7, L14). Run the visual language audit (C10/C11) on Fybr: list every background and selection color and what each means. Open the Lego file and diff its structure against your `tokens.md` plan. | Two-density table study; Fybr color-meaning table; a list of conflicts to fix. |
| **3 — Color and states** | Accessibility checklist (AX/AXW); Use Contrast plugin; SK Color and Elements sections; "Ideal UI contrast scores" and "Advanced interactive components" files | Audit structural versus interactive color on both products (C3, C9). Count neutrals (C5). Measure contrast against the AX thresholds (C14). Redesign Fybr stockpile selection and DealReady row selection to "painfully obvious" (E8/E9), with a non-color carrier (C13). | State matrices for row and stockpile selection; neutral-count reduction proposal. |
| **4 — Style, motion and the AI loop** | NL-ANIM plus its Figma file and Loom; SK Style section; the /claude page (Color Shift demo, visible prompt); "Before & after animation", "Smart animated blobs" and "Claude Code animated icons" files | Inventory radii, borders and shadows on one DealReady screen (S2–S5, R8). Rebuild the avatar-in-motion technique in Figma, then in code. Add a comprehension-check step to one real Recipe A build ("read the brief, tell me what we're building before writing"). Run SK as a mock Assay on three screens. | Style inventory; one motion rebuild; a note on whether the comprehension check changed the first draft; the design-layer candidates in section 4 validated or amended. |

**What you'll be able to do at the end that you can't reliably do now:**
- Review any screen in the program's own order, in about fifteen minutes, with every finding citing a named rule.
- Tell a type-count problem from a hierarchy problem, and a gray problem from a structural-versus-interactive problem.
- Hold a counted inventory (sizes, neutrals, radii, color meanings) for both products.
- Know precisely which questions the free layer cannot answer. That list is the purchase brief.

---

## 3. What the purchase actually buys

**Price.** PRO is $1,997/yr in USD, and VIP is $4,997/yr (verified 2026-09-30). The 60-day refund requires doing the work for one training option and posting progress.

**Only behind the wall, ranked by value to your practice:**

1. **Tables, Sorting & Filtering, Detail Screens, and High & Low Density.** Nothing public. These are DealReady's core surface. If his treatment of dense data is as specific as his published essays, this is where the money is.
2. **The behind-the-scenes build footage.** "Designing while building", "Breaking AI target fixation" and "Tuning animation feel with DialKit" address your stated loss exactly: the tactile polish loop inside an AI build. No other resource in your queue shows a practitioner doing loop 3 on camera.
3. **The critique vault (1,000+).** It trains *your* eye on a volume of worked critiques. It is not rubric material for Assay; Assay's exemplars must come from your products. But it is the fastest calibration for the person who writes Assay's rubric.
4. **The color lessons with no public body.** Structural vs. Interactive, First/Second/Third, and Strategic Definitions. The checklist gives the rules; the lessons presumably give the judgment.

**Low value to you:**
- Start-module tooling.
- Figma 101.
- About 46 minutes of Claude Code setup.
- Pricing & Getting Work.
- App Icons.
- Marketing Site Style (Vitrine's genre).
- Most of the Claude Code *method*, which overlaps with what you already run (spec first, context files, roles). The footage is worth more than the lessons.

**VIP.** At $3,000 more for weekly coaching, not now. Revisit only if, after using the vault, the bottleneck is feedback on *your* work rather than calibration on others'.

**Recommendation: buy PRO after the four free weeks, not now, and not VIP.**

- **Reason one: timing the guarantee.** Arriving with a written list of the questions the free layer couldn't answer (section 2's end state) means the 60-day window is spent on those lessons and the footage, not on material you already had free.
- **Reason two: it's a real test.** If week 4 shows your checklist reviews already produce findings you trust, the lesson bodies matter less, and the purchase reduces to "the footage and the vault". That is still likely worth it for you, but it is a decision you should make with evidence rather than intent.
- **What would change my mind toward buying now:** a DealReady table redesign scheduled inside the next four weeks. Then Tables and Density are needed before the free plan ends.

---

## 4. What enters your design layer (addressed to Plumb)

Each principle is `[DIRECT]` with its atoms. The examples and counter-examples are mine, written for your products, and are illustrative only.

| # | Principle (source) | Example | Counter-example | Lands in |
|---|---|---|---|---|
| 1 | **2–4 type sizes per screen; reach for weight, case or color before a new size.** (T1, T3, T8, T13, T14) | DealReady deal room: one size each for page title, section label and table body; emphasis in cells by weight only. | A fifth size introduced for a provenance footnote that could have been the body size in a muted color. | `DESIGN.md` type law; `tokens.md` caps the named text styles |
| 2 | **Structural colors stay distinct from interactive colors; accent is never decoration.** (C3, C9; IIDS 3) | Accent appears only on controls, focus and the selected state. | Accent used for chart series, section headers or a hero wash. | `DESIGN.md` color law; `anti-patterns.md` |
| 3 | **One meaning per shade.** (C10, C11) | Fybr "selected stockpile" has one treatment in both map and list. | Selected shown as a blue fill on the map and a different blue background in the list, while that second blue also means "processing". | `tokens.md` role definitions |
| 4 | **Make states painfully obvious.** (E8, E9, E7) | Row selection is a whole-row treatment plus a leading marker. | Selection shown only by a 1px border tint. | `states.md` |
| 5 | **Never color alone.** (C13; AX) | Fybr measurement confidence shown as label plus icon plus color. | Red, amber and green dots only. | `DESIGN.md`; Threshold criteria |
| 6 | **Space before lines; borders only in service of hierarchy.** (S3, S4, L3) | Table groups separated by space; one hairline under the header. | Row dividers plus card border plus section rule on the same table. | `anti-patterns.md` |
| 7 | **Disciplined neutrals.** (C5, C9) | A small, named neutral scale. | Five near-identical grays on one screen. | `tokens.md`; `anti-patterns.md` ("gray proliferation") |
| 8 | **One radius logic.** (S2, R8) | Radius set by component tier from the scale. | "The card uses 4 corner radii." | `tokens.md`; `anti-patterns.md` |
| 9 | **Cut repeated units.** (E10) | "Score /10" in the column header; cells show "7". | "7/10" in every row. | `components.md` (table rules) |
| 10 | **Comprehension check before build.** (AI5 plus the visible prompt) | The agent restates what it is building from `brief.md` before writing code. | The agent starts generating from the brief with no restatement. | Recipe A step 5 (and the `ui-diverge` skill); a workflow rule, not a visual one |

**Plumb decision needed (a conflict between the program's own sources):** the 16px floor (T6 versus T15).
- SK allows an accessibility-aware exception; AX states none.
- A dense DealReady table almost certainly wants cell text below 16px.
- `[PROPOSED — needs sign-off]`: the floor applies to *reading* text (prose, descriptions, provenance explanations). Tabular data may go lower, with a stated minimum and Threshold's zoom test (200 and 400 percent) as the condition.
- Cost of being wrong: a density that fails field or low-vision users on Fybr.

Fybr is out of scope for this exception unless measured.

### Lines Assay's rubric should adopt verbatim (from SK)

- **Evidence rules** (fit Assay's "rendered evidence" law exactly):
  - "Base findings on visible evidence. Do not invent issues you cannot verify."
  - "If reviewing a screenshot only, mention when states, interactions, or responsive behavior cannot be confirmed."
  - "Prefer concrete language like 'The card uses 4 corner radii' over 'The design feels inconsistent.'"
- **Slop-tell rows** (from the Common Mistakes table; add them to Assay's rubric line 7 by name):
  - "Too many font sizes | More than 4 distinct sizes on one screen or section"
  - "Arbitrary spacing | Gaps that do not follow a consistent spacing rhythm"
  - "Weak hierarchy | Everything feels equally important"
  - "Color role confusion | Accent or CTA colors used decoratively instead of functionally"
  - "Gray proliferation | Too many nearly identical neutrals"
  - "Decorative noise | Borders, shadows, blur, or gradients without a hierarchy purpose"
  - "Weak affordance | Interactive elements do not look interactive"
- **Review order** (maps onto Assay's severity ranking): "1. Clarity of the problem and interface purpose 2. Hierarchy, layout, and interaction clarity 3. Color and state usage 4. Stylistic consistency and polish"

### Two fit notes for Plumb

- **N/A versus unverified.** SK's "N/A" is not Assay's "unverified". Keep both, because they mean different things.
- **Praise.** SK's "if the work is strong, say why with the same level of specificity" is compatible with Assay's one-line strong verdict. It should not grow into a praise paragraph.

### Not adopted, with reason

- NL-ANIM's "extra delight" framing. It conflicts with the house refusal of "delight" as a goal.
  - IIDS 10 ("Motion clarifies relationships and supports continuity") is the adoptable version.
  - Hold it for the motion skill in Prompt 07.

---

**Assumptions repeated:**
- You are Figma-fluent.
- DealReady's core is a dense table; Fybr's core is map plus list.
- About 4–5 hours a week for the free plan.
- All examples in section 4 are mine, not the program's.
