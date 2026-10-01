---
title: Design canon — the universal floor
description: Read before designing, building or critiquing any UI. Holds the twelve principles, twenty anti-patterns and fifteen critic rubric lines every product inherits; a product's DESIGN.md may tighten these, never loosen them.
layer: design
status: ruling
thread: P-A
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique, spec
---

# Design canon

This is the universal floor of design law. A product's `DESIGN.md`, `tokens.md`, `anti-patterns.md` and `states.md` inherit it by reference and add only product law. A product may tighten a line; loosening one needs an amendment here.

- **Examples** use the demo app: records table, record detail, form, settings, destructive dialog, empty state, three-beat onboarding.
- **Source tags** use the ledger's codes. CF-numbers point to `conflicts.md`.

## 1. Principles

### C-P01 — Hierarchy by weight and color before size

- **Principle.** A screen uses two to four type sizes. Emphasis comes from weight and color first; a new size is the last resort.
  - Reading text is 16px or larger.
  - Tabular data may go to the minimum declared in tokens.
  - The muted text token passes 4.5:1 on every surface it sits on, in every theme.
- **Example.** Records table: the record name is foreground at weight 500; owner and date sit beside it in muted at 400, same size. The screen uses three sizes.
- **Counter-example.** A fifth size for the "last synced" footnote; the owner column shrunk to 11px and lightened until it fails AA.
- **Target:** DESIGN (type law); tokens (capped text styles, tabular minimum).
- **Enforced by:** lint (font-size only from text-style tokens); CI count of distinct text styles per story (≤4); contrast check on token pairs; C-R04.
- **Sources:** R08 R1; R06b #1; R06a T1, T6, T15; R04 rubric; CF-38 (tabular minimum `[PROPOSED — needs sign-off]`).

### C-P02 — One focal point, one primary action

- **Principle.** Each view has one focal point and at most one primary-styled action. Emphasis is made by quieting the neighbours, not by amplifying the target. Destructive styling is solid only where the destructive action is the primary action, inside its confirmation.
- **Example.** The table toolbar has one solid "New record". Row delete is a plain item in the row menu. The destructive dialog's solid red button reads "Delete 3 records".
- **Counter-example.** A red solid Delete on each of 200 rows; Import, Export and New all solid in one toolbar.
- **Target:** DESIGN; components (button variant use).
- **Enforced by:** story check (primary-variant buttons per route ≤1); C-R02, C-R03.
- **Sources:** R08 R2, R3; R04 "Spend boldness in one place"; R07b L19.

### C-P03 — Structure says something true

- **Principle.** Numbers, eyebrows, dividers and labels appear only when they encode something real.
  - Display data is formatted so it needs no key.
  - Every input keeps a visible, programmatic label.
  - Visual size follows the focal point; heading levels stay semantically correct.
- **Example.** Onboarding shows "Step 1 of 3" because it is a sequence. Record detail reads "Updated 3 days ago by Ana". The `h1` "Records" is set modestly because the table is the focal point.
- **Counter-example.** "01 / 02 / 03" over settings sections; a key–value stack reading "Last updated: … / Updated by: …"; a placeholder doing a label's job.
- **Target:** DESIGN.
- **Enforced by:** a11y lint (label association, heading order); C-R05.
- **Sources:** R04 "Structure is information"; R08 R4, R5; R09 C-3.

### C-P04 — Space before lines; width is given, not filled

- **Principle.**
  - Spacing comes only from the allowed steps.
  - The space between groups is always greater than the space within them.
  - Separate with space or a surface change before reaching for a border; hairlines mark group boundaries and data grids.
  - Components take the width their content needs; prose stops at about 65–75 characters.
- **Example.** The settings form is a fixed narrow width, each label one step above its input, field groups three steps apart. The records table separates rows by rhythm, with one hairline under the header.
- **Counter-example.** The settings form stretched to 1440px; a bordered card holding a bordered table holding bordered badges; `gap-[13px]`.
- **Target:** DESIGN; tokens (allowed spacing steps, max widths).
- **Enforced by:** lint allowlist of spacing values; C-R06, C-R07.
- **Sources:** R08 R6, R7, R13; R06b #6; R09 C-3; R06a "Arbitrary spacing".

### C-P05 — Color carries role, never decoration

- **Principle.**
  - Neutrals carry the surface.
  - One accent marks the primary action, selection and focus, at roughly 10 percent of the surface or less.
  - Each shade has exactly one meaning.
  - Every status also carries text, an icon or a shape.
  - When a colored element fails contrast, flip the pairing (dark text on a light tint) rather than darkening it toward black.
- **Example.** Selected rows take the selection token and a filled checkbox. The "Archived" pill is icon plus word, in dark text on a light tint.
- **Counter-example.** Accent tint on section headers; one blue meaning "selected" in the table and "syncing" in the header; status shown by colored dots alone.
- **Target:** DESIGN (color law); tokens (role table).
- **Enforced by:** token role table (one role per token); the auditor's color-alone and contrast tests; C-R09.
- **Sources:** R04 "Restrained color"; R06b #2, #3, #5; R08 R11.

### C-P06 — Everything visual is a token

- **Principle.** Color, type, spacing, radius, elevation and motion come only from tokens.
  - Color is OKLCH ramps, with background/foreground pairs defined for every theme.
  - Neutrals are tinted, with a stated temperature chosen per product. Warmth is not a default.
  - Elevation is a closed scale: resting, raised, overlay, modal.
  - Radius follows component tier.
  - The typeface is declared in tokens with a one-line reason.
- **Example.** The destructive dialog sits at `modal` with the large-tier radius; the table surface is `resting`. The font token reads "system stack — native rendering, no load cost".
- **Counter-example.** `bg-[#3b82f6]`; `shadow-2xl` on a static card "to make it pop"; four radii on one card; a chroma-zero gray ramp nobody chose.
- **Target:** tokens.
- **Enforced by:** lint bans raw color, arbitrary values, and any font-family, shadow or duration outside tokens; C-R08.
- **Sources:** R08 R6, R9, R10, R12; R06b #7, #8; R04 (Cream alternative); R07b values.md; CF-36, CF-37.

### C-P07 — States are obvious

- **Principle.** Hover, active, selected and focus are each more prominent than rest. Focus is always visible. Selection is unmissable: a whole-element treatment plus a marker.
- **Example.** A hovered row moves to the hover surface token; keyboard focus adds the ring token; a selected row takes the selection surface and a filled checkbox.
- **Counter-example.** Hover that changes only the cursor; selection shown by a 1px border tint.
- **Target:** DESIGN; states.
- **Enforced by:** one story per interactive state; C-R10.
- **Sources:** R04 "Interactive states increase contrast"; R06b #4; R06a "Weak affordance".

### C-P08 — Every reachable state is designed

- **Principle.** `states.md` lists each surface's reachable states: empty, loading, error, partial, offline, success.
  - Each one is designed, backed by a story, and capturable.
  - An empty state says what will be here, offers the first action, and hides controls that would act on nothing.
  - Loading shows a skeleton of the final layout.
- **Example.** The empty records table shows one sentence and "Import records" as the primary action, with no filter bar and no "0 of 0".
- **Counter-example.** A full filter bar over "Showing 0 of 0"; a centered spinner on page load.
- **Target:** states.
- **Enforced by:** every state reachable by `?state=` and captured by the critic. A state the critic cannot capture is UNVERIFIED, never passed (C-R01, C-R10).
- **Sources:** R08 R14; R04; R06a "Missing states"; R14 §1.5; R07b catalog (Loading).

### C-P09 — Controls say what happens

- **Principle.** An action label is the verb for its outcome, and the result reuses that word. Errors say what failed and how to fix it, without apology. Destructive confirmations name the object and the consequence.
- **Example.** "Delete 3 records" produces the toast "3 records deleted", with Undo. The form error reads "This email is already on another record. Open that record or use a different email."
- **Counter-example.** "Submit" followed by "Success!"; "Are you sure?" with OK / Cancel; "Oops! Something went wrong."
- **Target:** DESIGN (voice). The content designer owns the words.
- **Enforced by:** C-R05; content review.
- **Sources:** R04 (copy lines); R08 R3; R07b catalog (Success).

### C-P10 — Numbers align

- **Principle.** Numeric columns are right-aligned in tabular figures, with the unit in the header or a consistent suffix. A large value and its small unit share a baseline.
- **Example.** The Amount column: right-aligned, `tabular-nums`, header "Amount (USD)".
- **Counter-example.** Centered proportional digits that change width when a row updates.
- **Target:** DESIGN; components (table defaults).
- **Enforced by:** table component default; C-R11.
- **Sources:** R04 "Numbers align"; R08 R8.

### C-P11 — Motion carries information or does not exist

- **Principle.** Motion does one of four jobs: feedback, state change, spatial relationship, continuity.
  - Keyboard-initiated actions, data values, and anything used hundreds of times a day do not animate.
  - High-stress paths use opacity only.
  - Animate transform and opacity only. Ease-out for enter and exit, ease-in-out for on-screen movement, never ease-in or bounce.
  - Durations come from motion tokens and stay at 300ms or less. Exits run at about 80% of the entrance.
  - Reduced motion keeps opacity and every confirmation.
  - Full law: `.claude/skills/tk-motion/references/law.md`.
- **Example.** The destructive dialog fades in at 250ms (opacity only, because it is a high-stress path) and out at 200ms. Opened by keyboard, it appears at once. Sorting the table re-renders rows in place.
- **Counter-example.** Totals counting up on load; rows sliding on sort; a shake on the invalid field.
- **Target:** DESIGN (motion line); tokens (motion tokens).
- **Enforced by:** motion-token lint; C-R12.
- **Sources:** R07b §5 and L1–L22; IIDS 10 via R06b. Retires R04's motion line (CF-34).

### C-P12 — Remove what has no job

- **Principle.** Every element names its job (information, state, action, hierarchy or meaning) or it goes. Every image and every motion carries a one-line job in the package before it is generated. Named tells are banned outright; everything else passes this removal test.
- **Example.** Onboarding beat 2 has an illustration whose job line reads "shows where imported records will appear". It stays.
- **Counter-example.** A soft radial glow behind the table header; a stock photo in the empty state with no job line.
- **Target:** DESIGN; package (media and motion job lines).
- **Enforced by:** a required package field; C-R13.
- **Sources:** R09 C-1, C-2; DC-20; CF-39.

## 2. Anti-patterns

Each entry gives the tell as people will see it, why it reads as generic, the on-system alternative, and its sources.

| ID   | Tell                                                                                                                        | Why it reads generic                                      | On-system alternative                                                | Sources              |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- | -------------------- |
| A-01 | Default typeface by default (Inter, Geist, Manrope because they were there)                                                 | The training-data median; the product reads as a template | The declared, reasoned font token (C-P06)                            | SC; R04; R08 B4; R09 |
| A-02 | Gradient wash or gradient text (purple to white or blue)                                                                    | The 2023–25 AI SaaS signature                             | Solid surface tokens; emphasis by weight                             | SC; R04; R08 B3      |
| A-03 | Equal-card grid with icon tiles (same-size cards; icon in a tinted circle; heading; two lines)                              | Template rhythm                                           | A table or list with real columns; icons at their drawn size, inline | SC; R04; R08 B2; R02 |
| A-04 | Weak hover (cursor or a 5% opacity change only)                                                                             | A static-mockup reflex                                    | State tokens that raise contrast (C-P07)                             | SC; R04; R06a        |
| A-05 | Accent stripe on cards or alerts (colored left or top border)                                                               | The most recognizable generated move                      | Icon plus text; tint only for an exceptional state                   | R04; R08 B1          |
| A-06 | Cream or paper surface (near #F4F1EA)                                                                                       | The 2026 default look                                     | Neutral tinted per product, temperature stated                       | R04; CF-36           |
| A-07 | An eyebrow above every section                                                                                              | Applied by reflex, regardless of content                  | The heading alone; at most one eyebrow per three sections            | R04                  |
| A-08 | Decorative section numbers (01 / 02 / 03)                                                                                   | Scaffolding by reflex                                     | Numbers only for real sequences                                      | R04                  |
| A-09 | Hero-metric block (big number, small label, supporting stats, gradient accent)                                              | The template answer                                       | A table with deltas and their source                                 | R04                  |
| A-10 | Nested cards                                                                                                                | Boxes used as crutches                                    | One surface, separated by space                                      | R04; R08             |
| A-11 | Low-contrast text (gray on color; light-gray body)                                                                          | Fails contrast "for elegance"                             | Foreground tokens passing 4.5:1                                      | R04; R08             |
| A-12 | Glass and heavy blur (backdrop blur as default; blur above 2px)                                                             | Spectacle; costly; fails in glare                         | Opaque surfaces                                                      | R04; R09; R07b L14   |
| A-13 | Alarming or celebratory motion (bounce, elastic, shake, pulse, confetti, success pops)                                      | Reads as play or alarm on a working surface               | An opacity state change; a past-tense label                          | R04; R07b cuts; R09  |
| A-14 | Data that moves for style (count-up, animated sort or filter, tweened values, shimmer on table skeletons, flash highlights) | Hides change, spends attention                            | Re-render in place; a persistent static "changed" marker             | R07b §5, L4          |
| A-15 | Animated keyboard navigation                                                                                                | The keyboard user's cursor lags                           | 0ms under keyboard modality                                          | R07b L3              |
| A-16 | Placeholder as label                                                                                                        | Disappears on input                                       | A visible label above the field                                      | R04; R08             |
| A-17 | Duplicate CTA intent ("Get started", "Try free", "Sign up")                                                                 | One intent, three names                                   | One label per intent, everywhere                                     | R04                  |
| A-18 | Generic spinner for page loads                                                                                              | Says nothing about what is coming                         | A skeleton of the final layout                                       | R04; R07b            |
| A-19 | Manufactured urgency (countdowns, "only 2 left", guilt copy on dismiss, streaks)                                            | Trades trust for a click                                  | Plain status and real dates                                          | R04; R09; R02        |
| A-20 | Fabricated system behavior (added latency, "analysing" theatre, progress counting unfinished work)                          | Lies about the system                                     | Acknowledge within 400ms, show real stages, count only finished work | R13 (generalized)    |

## 3. Critic rubric

**Procedure (not a rubric line).**

- **Input.** The critic receives the brief, the package, this rubric, and screenshots at 390, 834 and 1440, in light and dark, with reduced motion, for every `?state=`. It receives nothing from the builder's summary.
- **Review order.** Purpose and clarity; then hierarchy, layout and interaction; then color and state; then polish.
- **Output.**
  - The top 3 priorities.
  - Each line marked PASS, N issues, N/A or UNVERIFIED.
  - Each finding cites a screenshot region or `file:line` and a rule ID.
  - A round verdict.
- **Severity.** Blocking / Should-fix / Consider.
- **Limits.** At most 3 rounds, and at most 3 calibration exemplars in context.
- **Sources:** R04; R06b; R09 C-4; R14; CF-40.

| ID    | Check                                                                                                                                                                                   | Default severity                                      | Rules        | Sources        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------ | -------------- |
| C-R01 | Evidence: every finding cites a region or `file:line`; uncaptured states are UNVERIFIED, never passed; concrete language ("4 radii", not "inconsistent")                                | procedural (a finding without evidence is withdrawn)  | all          | R04; R06b (SK) |
| C-R02 | Greyscale test: desaturated, the screen has one focal point and secondary information recedes by weight and color                                                                       | Should-fix                                            | C-P01, C-P02 | R08            |
| C-R03 | At most one primary-styled action per view; destructive primary only inside its confirmation                                                                                            | Blocking                                              | C-P02        | R08            |
| C-R04 | At most 4 type sizes; reading text ≥16px; tabular text ≥ the declared minimum                                                                                                           | Should-fix (Blocking below the minimum)               | C-P01        | R06a; R06b     |
| C-R05 | Structure and labels: numbering or eyebrows that encode nothing; a key–value pair that should be a phrase; an input without a visible label; action labels that aren't the outcome verb | Should-fix (unlabeled input: Blocking)                | C-P03, C-P09 | R08; R04       |
| C-R06 | Spacing: an off-scale value; space between groups not greater than space within                                                                                                         | Should-fix                                            | C-P04        | R08; R06a      |
| C-R07 | Separation: a border where space would do; a shadow outside its named level; nested cards                                                                                               | Should-fix                                            | C-P04, C-P06 | R08; R04       |
| C-R08 | Tokens only: raw color, spacing, radius, shadow, font or duration                                                                                                                       | Blocking                                              | C-P06        | R04; R07b M5   |
| C-R09 | Color role: accent used decoratively; one shade with two meanings; meaning by color alone; contrast below AA                                                                            | Blocking (contrast, color alone); Should-fix (others) | C-P05        | R06a; R08      |
| C-R10 | States: every state in `states.md` captured; hover, focus and active above rest; focus visible; empty state designed                                                                    | Blocking (missing state, invisible focus)             | C-P07, C-P08 | R06a; R04      |
| C-R11 | Numbers: tabular, right-aligned, unit placed, baseline shared                                                                                                                           | Should-fix                                            | C-P10        | R08            |
| C-R12 | Motion: the `tk-motion` review checks M1–M12, reported as one line                                                                                                                      | per M#                                                | C-P11        | R07b           |
| C-R13 | Removal test: an element or asset with no stated job                                                                                                                                    | Consider (Should-fix on the focal path)               | C-P12        | R09            |
| C-R14 | Slop tells, checked by ID (A-01 to A-20)                                                                                                                                                | Should-fix (A-19, A-20: Blocking)                     | §2           | R04; R08; R06a |
| C-R15 | Laws of UX: findings cite LUX rule IDs loaded through `docs/references/index.md` (at most 3 files). A finding with no rule ID of any kind (C-, A-, LUX-, M) is Consider at most         | per LUX rule                                          | references   | R13            |

## 4. Cut, and why

- **Product-bound, cut.** Field-mode target size and thumb-zone tokens; the DealReady/Fybr motion decisions; provenance and measurement lines; R07b M11 (camera).
- **Merged.** Shift Nudge's "cut repeated units" goes into C-P03's counter-example. Interactive-states candidates merge into C-P07. Neutrals, radius and elevation merge into C-P06. Copy lines merge into C-P09.
- **Routed.**
  - Rebuilt native controls (R08 B5) → the accessibility auditor's criteria.
  - Hover scale on cards and rows → `tk-motion` catalog.
  - Model-defaults note (R09 #5) → a section of the anti-patterns template, not an entry.
  - Prompting-checklist amendments (R09) → `docs/design/workflow.md`.
- **Marketing register, cut until a marketing layer exists.** Clone modes; Framer template tells; the "10x Conversion" claim; spectacle packs beyond A-12.
- **Displaced.** About 34 candidate principles became 12; 25 anti-pattern groups became 20; about 45 rubric candidates became 15. The losing lines stay in `_candidates.md` (filed under `docs/research/` as archived) as provenance.

## Changelog

- 2026-10-01: v0.1, merged from `_candidates.md` (P-A). Retires R04's motion line (CF-34). Tabular type minimum pending sign-off (CF-38).
