---
thread: 08 — Refactoring UI, does it hold up
role: Vesper (Lead UX/UI Designer), verdict addressed to Plumb
date: 2026-09-30
sources_checked: refactoringui.com, the authors' "7 Practical Tips" post, tailwindcss.com v4 post, ui.shadcn.com theming, ui.sh, coverage of the Tailwind Labs / Shopify move
evidence_tags: "[TOC] = the book's own table of contents (primary) · [HOME] = refactoringui.com copy (primary) · [7-TIPS] = Wathan & Schoger's own post (primary) · [FROM MEMORY] = my recollection of the book, not re-checked this session · [JUDGMENT] = mine"
---

# Refactoring UI — review and canon ruling

## Verdict

**Buy The Essentials ($99 USD). Read it once, watch the three videos, do one exercise, and move on. About five hours in total. Skip The Complete Package.**

The book's core holds up: hierarchy, spacing systems, proximity, elevation as a scale, contrast without ugliness, and designing empty states. That is about half the book, and none of it has aged. The color mechanics have aged (HSL has been replaced by OKLCH in the stack you use). A cluster of its "finishing touches" has done something worse than age: those moves became the median look of generated UI. Accent-stripe cards, icons in tinted circles, and decorated backgrounds now read as slop tells. So the book serves you twice. Its reasoning goes into `DESIGN.md`, and several of its moves go into `anti-patterns.md`.

An agent already applies the book's moves, because they are baked into Tailwind's defaults and into the training data. What the book gives you, and what no agent gives you, is the vocabulary to say *why* a generated screen is wrong. That vocabulary is what Assay's rubric and your selection step run on. That is worth $99 and an evening. It is not worth a week.

One honesty note up front. I did not open the book in this session. The table of contents, the package contents and the prices are verified from the book's own site as of today. The authors' free "7 Practical Tips" post is primary. Every other statement about what a chapter says is tagged `[FROM MEMORY]`, so Plumb can weight it. The two free chapters on the homepage would let you upgrade some of those tags to verified.

---

## 1. What it is, verified (2026-09-30)

| Item | Fact | Source |
|---|---|---|
| Format | 218-page PDF, 50 chapters across 9 sections; DRM-free; 60-day no-questions refund | [HOME] |
| Videos | Three screencasts: complex form (11:13), data dashboard (17:20), text-focused landing page (12:08). Total 40:41 | [HOME] |
| The Essentials | $99 USD plus tax: book plus videos | [HOME] |
| The Complete Package | $149 USD plus tax: adds component gallery (200+ ideas, no CSS), a dozen-plus color palettes, 30+ font suggestions, 200 SVG icons | [HOME] |
| Free sample | "Get two free chapters" offer on the homepage; which chapters was not visible | [HOME] |
| Reading time | The authors say a couple of hours | [HOME] |
| Sales claim | The same page says both "over 30,000 copies" and "over 20,000 people" (two stale counters) | [HOME] |
| Seller | © 2026 The UI Company Inc. Still on sale today | [HOME] |
| Context | Tailwind Labs said on Sept 9, 2026 that it is joining Shopify. It closed Tailwind Plus and ui.sh to new customers. The coverage I found says nothing about Refactoring UI | secondary: CMSWire, 2026-09-10; learnshopify.dev |

---

## 2. Chapter map

Section titles are verbatim from the book's table of contents [TOC]. Each principle is my gloss, tagged by where it comes from.

### 1. Starting from Scratch
Sections: *Start with a feature, not a layout · Detail comes later · Don't design too much · Choose a personality · Limit your choices*

- Design the functionality before the app shell. Nav and sidebars come after the thing the screen does. `[FROM MEMORY]`
- Work low-fidelity and in greyscale first, so hierarchy has to come from space, contrast and size before color can rescue it. `[FROM MEMORY]`
- Design the smallest useful version, in short cycles. Don't imply functionality that isn't built yet. `[FROM MEMORY]`
- Personality is a set of concrete choices: typeface, color, border radius and copy tone. `[FROM MEMORY]`
- Constrain choices in advance with systems, then design by elimination. `[FROM MEMORY]`

### 2. Hierarchy is Everything
Sections: *Not all elements are equal · Size isn't everything · Don't use grey text on colored backgrounds · De-emphasize to emphasize · Labels are a last resort · Separate visual hierarchy from document hierarchy · Balance weight and contrast · Semantics are secondary*

- Create hierarchy with weight and color, not only size. Use two or three text colors (dark, grey, lighter grey) and two weights (400–500 for body, 600–700 for emphasis). Avoid weights under 400 for UI text. `[7-TIPS]`
- On colored backgrounds, lower the contrast by using white at reduced opacity, or a color hand-picked from the background's hue. Never use grey. `[7-TIPS]`
- Every page has an action pyramid. Primary actions are solid and high-contrast, secondary actions are outlined or low-contrast, and tertiary actions are link-styled. A destructive action gets red, bold styling only when it *is* the primary action, as in a confirmation dialog. `[7-TIPS]`
- To make the primary element stand out, soften the elements competing with it rather than amplifying it. `[FROM MEMORY]`
- Format data so it explains itself, and combine label and value into one phrase. Emphasize labels only when the user scans by label, as in spec tables. `[FROM MEMORY]`
- Semantic heading level and visual size are separate decisions. Section titles often behave like labels and can be small. `[FROM MEMORY]`
- Heavy elements such as icons get lower contrast to balance with text. Thin elements such as hairlines get more contrast. `[FROM MEMORY]`

### 3. Layout and Spacing
Sections: *Start with too much white space · Establish a spacing and sizing system · You don't have to fill the whole screen · Grids are overrated · Relative sizing doesn't scale · Avoid ambiguous spacing*

- Start with too much space and remove it until the layout is right. The book also allows that dense UIs have their place. `[FROM MEMORY]`; the density point is also noted in a secondary Goodreads reading log.
- Use a non-linear spacing and sizing scale, with neighbouring steps far enough apart to be distinguishable (roughly 25% or more). `[FROM MEMORY]`
- Give each element the width its content needs. A form does not need 1200px. `[FROM MEMORY]`
- Fixed-width sidebars and max-width components beat percentage grids for many layouts. `[FROM MEMORY]`
- Size relationships don't hold across breakpoints: headlines shrink faster than body text, and padding does not scale proportionally. `[FROM MEMORY]`
- Put more space between groups than within them (proximity). `[FROM MEMORY]`

### 4. Designing Text
Sections: *Establish a type scale · Use good fonts · Keep your line length in check · Baseline, not center · Line-height is proportional · Not every link needs a color · Align with readability in mind · Use letter-spacing effectively*

- Use a hand-picked type scale rather than a mathematical modular one, and avoid em-based sizes. `[FROM MEMORY]`
- For UI text, use a neutral sans. As a quality filter, choose families with many weights. `[FROM MEMORY]`
- Keep line length to about 45–75 characters. `[FROM MEMORY]`
- When sizes are mixed on one line, align on the baseline. `[FROM MEMORY]`
- Use tall line-height for small text and long lines, and tight line-height for large headings. `[FROM MEMORY]`
- In link-heavy UI, show links with weight or color depth rather than brand color everywhere. `[FROM MEMORY]`
- Left-align most text, center only short blocks, and right-align numbers in tables. `[FROM MEMORY]`
- Tighten large headings set in body fonts, and loosen all-caps text. `[FROM MEMORY]`

### 5. Working with Color
Sections: *Ditch hex for HSL · You need more colors than you think · Define your shades up front · Don't let lightness kill your saturation · Greys don't have to be grey · Accessible doesn't have to mean ugly · Don't rely on color alone*

- Reason about color in HSL. `[TOC]`
- You need 8–10 greys, 5–10 shades per primary, and accent ramps for status colors. Define all of them up front as 100–900 scales rather than picking at the point of use. `[FROM MEMORY]`
- At the light and dark ends of a ramp, raise saturation and rotate hue so colors don't wash out. `[FROM MEMORY]`
- Tint greys cool or warm. `[FROM MEMORY]`
- Meet contrast by flipping the pairing (dark text on a light tint) rather than darkening a color toward black. `[FROM MEMORY]`
- Pair color with a second signal, such as an icon or a sign. `[FROM MEMORY]`; the need for a second signal is also noted in a secondary review (techgee.hashnode.dev).

### 6. Creating Depth
Sections: *Emulate a light source · Use shadows to convey elevation · Shadows can have two parts · Even flat designs can have depth · Overlap elements to create layers*

- Offset shadows vertically rather than inflating blur, as if light came from above. The same applies to inset wells. `[7-TIPS]`
- Use a small, fixed set of shadows, each meaning an elevation: button, dropdown, modal. `[FROM MEMORY]`
- Build shadows from two layers: a large soft one and a tight dark one. `[FROM MEMORY]`
- In flat designs, lighter means closer. `[FROM MEMORY]`
- Overlapping elements create layers. `[FROM MEMORY]`

### 7. Working with Images
Sections: *Use good photos · Text needs consistent contrast · Everything has an intended size · Beware user-uploaded content*

- Icons drawn for 16–24px look crude at 3–4× their size. Enclose them in a colored shape instead. `[7-TIPS]`
- Give text over images an overlay or reduce the image's contrast. `[FROM MEMORY]`
- Control the aspect ratio of user-uploaded images and prevent background bleed. `[FROM MEMORY]`

### 8. Finishing Touches
Sections: *Supercharge the defaults · Add color with accent borders · Decorate your backgrounds · Don't overlook empty states · Use fewer borders · Think outside the box*

- Add colored accent borders to alerts, active nav items or the top of the layout to make a bland UI feel designed. `[7-TIPS]`
- Separate elements with a box shadow, two background colors or extra space before reaching for a border. `[HOME]`, `[7-TIPS]`
- Replace bullets and checkboxes with styled versions. `[FROM MEMORY]`
- Decorate backgrounds with subtle gradients, patterns or shapes. `[FROM MEMORY]`
- Empty states are a first impression: add an image and a call to action, and hide controls that have nothing to act on. `[FROM MEMORY]`
- Dropdowns, tables and radio groups don't have to look like their defaults. `[FROM MEMORY]`

### 9. Leveling Up
- Study interfaces you admire for the decisions you wouldn't have made, and rebuild them. `[FROM MEMORY]`

**What the book does not cover (visible from the TOC alone):** motion; dark mode; the state matrix beyond empty (loading, error, partial, focus-visible); keyboard and screen-reader access; content design; dense data tables as a discipline; and anything about AI or provenance. Against the textbook's craft stack (§2.1), it covers items 2–5 (hierarchy, spacing, typography, color) plus depth. It does not cover IA and flows, states, motion or content design. `[TOC]` plus `[JUDGMENT]`.

---

## 3. Does it hold up?

I added a fourth status beyond timeless / absorbed / aged, because it is the most important finding. **Inverted** means the rule was good advice in 2018 and is now a generic tell, because it was absorbed so thoroughly into Tailwind-era UI, and from there into model output, that it signals "default" rather than "designed."

| Rule | Status | Evidence |
|---|---|---|
| Hierarchy by weight and color before size | **Timeless**, with a floor | [7-TIPS]. Commenters on the original post flagged that its light-grey example fails AA (secondary: Medium responses, Feb 21 and 26, 2018). Adopt only with a contrast floor on the muted token. |
| No grey text on colored backgrounds | **Timeless** | [7-TIPS]. Nothing in the stack prevents it. |
| De-emphasize to emphasize | **Timeless** | [TOC]. This is a judgment rule, and no default can apply it. |
| Action pyramid; destructive styling follows hierarchy | **Timeless** | [7-TIPS]. shadcn ships variants (default, secondary, ghost, destructive) but not the rule about when to use them. |
| Labels are a last resort | **Timeless for display data**; wrong if applied to inputs | [TOC]. Inputs still need programmatic labels (Threshold's native-first rule). A secondary summary (sobrief) flags the same tension. |
| Visual hierarchy ≠ document hierarchy | **Timeless** | [TOC] |
| Start with too much white space | **Timeless as a default**; needs a density contract per surface | [TOC]. DealReady's dense-but-calm tables and Fybr's surveyor mode are deliberate exceptions, which the book allows. |
| Spacing and sizing system | **Absorbed, then loosened** | Tailwind v4 derives spacing from one `--spacing: 0.25rem` variable, and utilities accept any multiplier out of the box, e.g. `w-17`, `pr-29` (primary: tailwindcss.com v4.0 post, 2025-01-22; site shows v4.3 today). The scale is a given; the *constraint* is gone, so it now has to be a lint rule. |
| You don't have to fill the screen / grids are overrated | **Timeless**; partly absorbed | v4 ships container queries in core (primary, same post). |
| Avoid ambiguous spacing (proximity) | **Timeless** | Gestalt proximity. A generator gets this wrong constantly. |
| Type scale; proportional line-height | **Absorbed** | Tailwind's text scale pairs each size with a line-height. `[JUDGMENT]` from working knowledge. |
| Use good fonts (neutral sans for UI) | **Inverted** | "Neutral sans for UI" is the road to Inter everywhere, which is a banned tell in your prompting checklist. The book's own *Choose a personality* section is the fix. Variable fonts have also retired the "many weights" filter as a mechanism. |
| Line length 45–75 characters | **Timeless**; absorbed as `max-w-prose` | [TOC]. |
| Baseline alignment; right-align numbers | **Timeless**, high value for you | [TOC]. Both products are number-heavy. The stack gives you `items-baseline` and `tabular-nums`, but no default applies them. |
| Letter-spacing | **Absorbed** | Tracking utilities. Minor. |
| Ditch hex for HSL | **Aged** | Tailwind v4 moved its whole palette from rgb to oklch (primary, v4.0 post). shadcn's default theme is written in oklch (primary: ui.shadcn.com/docs/theming, checked 2026-09-30). HSL is not perceptually uniform; a secondary summary (sobrief) makes the same point. |
| Don't let lightness kill saturation (hue rotation) | **Aged mechanism, timeless intent** | The hue-rotation trick compensates for HSL's non-uniformity. OKLCH ramps mostly remove the need. `[JUDGMENT]` |
| Define shades up front | **Absorbed**, but the book lacks the modern layer | Ramps ship in Tailwind. The stack's real improvement is semantic background/foreground pairs overridden per theme (shadcn: `primary` / `primary-foreground`, `.dark` overrides; primary). The book predates both the pairing convention and dark mode. |
| Greys don't have to be grey | **Timeless; not absorbed** | shadcn's default `neutral` theme is chroma-zero grey, e.g. `--muted-foreground: oklch(0.556 0 0)`. Tinted bases (Stone, Taupe, Mauve, Olive, Mist) exist but are opt-in (primary, theming docs). This matches Vesper's "warm neutrals, never gray." |
| Accessible doesn't have to mean ugly; don't rely on color alone | **Timeless**; now the WCAG floor, owned by Threshold | [TOC] |
| Emulate a light source | **Aged at the edges** | Top-highlight insets read skeuomorphic now. In dark mode, elevation is carried by lighter surfaces, not shadows. `[JUDGMENT]` |
| Shadows as an elevation scale; two-part shadows | **Absorbed** | Tailwind ships a shadow scale, and v4 adds stackable `inset-shadow-*` / `inset-ring-*` layers (primary, v4.0 post). The rule that each level has a *meaning* is not absorbed. |
| Empty states | **Timeless; partly absorbed** | shadcn now ships an `Empty` component (primary, docs nav, 2026-09-30). The *content* of the empty state is still yours (Gloss). |
| Use fewer borders | **Timeless; the stack pulls the other way** | [HOME], [7-TIPS]. shadcn's token set is built around `border` and `input` hairlines used by cards, menus and tables (primary, theming docs). |
| Accent borders for color | **Inverted** | [7-TIPS]. The colored side-stripe on cards and alerts is now one of the most recognizable generated-UI moves. `[JUDGMENT]`; check against the ban lists read in thread 04. |
| Enclose small icons in a colored shape | **Inverted** | [7-TIPS]. The icon-in-a-tinted-circle feature card is the unit of the four-card-grid tell. |
| Decorate your backgrounds | **Inverted** in product UI | [TOC]. Gradient washes are on your banned list. On marketing sites it is Vitrine's call, not the product's. |
| Supercharge the defaults (custom checkboxes, bullets) | **Aged** | `accent-color` now brands native controls. Rebuilding controls visually risks losing native semantics (Threshold). |

**Tally:** of the 50 sections, the large majority of the hierarchy, layout, depth-as-scale and accessibility material is timeless. Mechanics of scales and shadows are absorbed. Color-space mechanics are aged. Four of the finishing-touch tactics are inverted. `[JUDGMENT]`

---

## 4. Is it worth it in the era of AI?

**The rules are already in the machine.** The authors built Tailwind, and their commercial products turned the book's principles into components and templates (secondary: RuntimeWire, 2026-09-09, on Schoger's role). They went further and packaged design know-how as agent skills. ui.sh sells "Design," "Ideas," "Add Dark Mode" and "Make Responsive" skills for interface builders (primary: ui.sh, checked 2026-09-30). ui.sh closed to new customers on Sept 9 (secondary, multiple outlets). Unofficial "Refactoring UI" skills also circulate on skill registries, e.g. a LobeHub listing with a 0–10 scoring rubric built on the book (secondary: lobehub.com). That one is unvetted, of unclear license, and goes to Plumb's untrusted-skill procedure in thread 04, not into the repo.

The strongest evidence that the moves are absorbed is commercial. Wathan wrote in January 2026 that docs traffic was down about 40% since early 2023 while Tailwind usage kept growing, and that revenue was down close to 80%. He blamed AI (secondary: DevClass, 2026-01-08; seroundtable, quoting his post of 2026-01-07). Developers stopped visiting because the model already knew. The same is true of the book's tactics.

**So what does holding the rules buy you?** Three things an agent with the rules does not give you.

1. **Diagnosis in named terms.** The book's founding promise is turning "I know this looks terrible but have no idea why" into a named cause [HOME]. That is exactly the job of Assay's rubric and of your selection step at Recipe A stage 3. An agent can generate three directions. Choosing between them, and writing the one-line reason, needs the vocabulary in your head, not in a skill file.
2. **Knowing which move this screen needs.** The rules split cleanly into two groups.
   - *An agent applies these well from a skill*, because they are checkable: scale adherence, line length, no grey on color, right-aligned tabular numbers, baseline alignment, one primary action, contrast floors, elevation tokens.
   - *These require the eye*, because they depend on knowing the job of the screen: de-emphasize to emphasize (you must know what is primary), labels as a last resort (you must know the data), choose a personality, don't design too much, start with a feature, balance weight and contrast.
   Everything in the first group should become lint and rubric lines, so neither you nor the agent has to remember it. Everything in the second group is why you read the book.
3. **Recognizing the book's own moves in generated output.** Much of what makes AI UI look generic is 2018-era Refactoring UI applied without judgment: accent stripes, icons in tinted circles, soft gradients, a neutral sans. Having read it, you see the source of each tell and can reject it by name. `[JUDGMENT]`

**Where it sits.** Refactoring UI is the vocabulary and the baseline: two to three hours, $99. The Shift Nudge free checklists you already hold probably overlap much of its checkable surface. I haven't read them in this thread, so the dedupe belongs to thread 06's Alembic phase. Shift Nudge's paid tier (per the textbook, $1,997/yr, not re-verified here) is where the *eye* gets trained, through critique volume. The order is: Refactoring UI first, then Shift Nudge's free layer, then decide on the paid tier. The book doesn't replace Shift Nudge; it makes Shift Nudge's critiques land faster.

**Caveat for you specifically.** You already work as a design-minded engineer. Expect much of it to be review, not first exposure. The value is the precise vocabulary for writing rules and critiques, which is exactly what the design layer needs. `[JUDGMENT]`

---

## 5. Teaching versus tips

About half of the book builds a way of seeing; the other half is a catalogue of moves. `[JUDGMENT]`, counting by section.

- **Model-building (about 24 of 50 sections):** Chapter 1, the process of greyscale-first, feature-first and constrained choices. Chapter 2, hierarchy, the best chapter and the one to reread. Chapter 3, spacing as a system plus proximity. The system half of Chapter 5 (ramps defined up front, tinted neutrals, contrast by flipping). The elevation-as-scale sections of Chapter 6.
- **Catalogue of moves (about 26 sections):** most of Chapter 4's micro-rules, the HSL mechanics, Chapter 7, and Chapter 8. That half has aged fastest.

**What you can do after reading it that you couldn't before:** take a screen that "looks off" and name the cause in the book's terms. Lay out a new screen greyscale-first with a deliberate hierarchy. Construct spacing, type, color and shadow scales and explain each step.

**What it won't teach:** flows, states, motion, access, content, or dense data design. For those, the canon needs other sources (threads 07 and 13, Gloss, Threshold).

**Time to value:** about 2.5 hours for the book [HOME says a couple of hours], 41 minutes of video (watch the dashboard one; it is closest to DealReady), and a 2-hour exercise. The exercise: take one real DealReady table view and one Fybr measurement panel, strip them to greyscale, and re-derive the hierarchy using Chapter 2 only. About five hours total.

---

## 6. Canon ruling, addressed to Plumb

Plumb, below are 14 rules for the design layer and 5 anti-pattern entries, in your required form. I ran the drift test on each: would it produce a generic dashboard? I cut five candidates:

- *Emulate a light source*: aged.
- *Overlap elements*: decorative in product UI.
- *Choose a personality*: kept only as the alternative in anti-pattern B4.
- *Use good photos*: not relevant to either product.
- *Type scale*: the stack already enforces it.

Every rule below is one the stack does **not** already enforce.

### Rules for `DESIGN.md`, `tokens.md` and `components.md`

**R1 — Hierarchy by weight and color before size, with a contrast floor.** → `DESIGN.md`
- *Principle:* Secondary information recedes through the muted-foreground token and a lower weight, at the same or near size. The muted token must pass 4.5:1 on every surface it sits on, in every theme. `[7-TIPS]` plus floor `[JUDGMENT]`
- *Example:* A DealReady claim row. Claim text in `foreground` at 500 weight; the source citation beside it in `muted-foreground` at 400 weight, same size.
- *Counter-example:* The citation shrunk to 11px and lightened until it fails AA "because it's secondary."
- *Enforced by:* A token contrast check in CI, and Assay rubric line 1.

**R2 — Soften the competitors; don't amplify the primary.** → `DESIGN.md`
- *Principle:* When one element must stand out, lower the visual weight of its neighbours before adding weight to it. `[TOC]` / `[FROM MEMORY]`
- *Example:* On Fybr's map, non-selected stockpiles drop to reduced opacity. The selected one keeps its normal stroke.
- *Counter-example:* The selected stockpile gets a thicker stroke, an accent fill, a glow and a badge, while everything else stays at full strength.
- *Enforced by:* Assay line 1, via the greyscale test.

**R3 — One primary action per view; destructive styling follows hierarchy, not semantics.** → `components.md`
- *Principle:* Primary is solid, secondary is outline or low-contrast, tertiary is link-styled. The red solid treatment appears only where the destructive action *is* the primary action, in its confirmation. `[7-TIPS]`
- *Example:* "Remove from deal room" as a tertiary item in the row menu. The confirmation dialog then names the document and uses the destructive primary button, labelled with the consequence (Gloss).
- *Counter-example:* A red "Delete" button on every row of a table.
- *Enforced by:* A story or visual check counting primary-variant buttons per route (≤1), and Assay line 1.

**R4 — Display data explains itself; labels are a last resort, except on inputs.** → `DESIGN.md`
- *Principle:* Format values so they need no key. Combine label and value into one phrase. Every input keeps a visible, programmatic label. `[TOC]` / `[FROM MEMORY]`, plus the input exception from Threshold.
- *Example:* "3 of 12 sources verified." On Fybr: "1,240 m³ ± 2.1%."
- *Counter-example:* Key–value stacks ("Verified sources: 3 / Total sources: 12"), or a placeholder standing in for an input label.
- *Enforced by:* A new Assay line (see below).

**R5 — Visual size is decided separately from heading level.** → `DESIGN.md`
- *Principle:* Semantic heading levels stay correct for assistive technology. Visual size follows the screen's focal point. `[TOC]`
- *Example:* The `h1` "Acme — Q3 financials" set at a modest size, because the table is the focal point.
- *Counter-example:* A 36px `h1` dominating a screen whose job is the table below it; or the reverse, a `div` styled large with no heading semantics.
- *Enforced by:* Assay line 1, and Threshold's semantics pass.

**R6 — Spacing comes from the allowed steps only; groups are separated by more space than their contents.** → `tokens.md`
- *Principle:* Tailwind v4 accepts any spacing multiplier, so `tokens.md` lists the allowed steps and everything else is off-system. Space between groups is always greater than space within a group. `[TOC]` plus the v4 finding.
- *Example:* A label sits one step above its input; field groups are three or more steps apart.
- *Counter-example:* `pt-7`, `w-17`, `gap-[13px]`; or a label equidistant between two inputs.
- *Enforced by:* A lint allowlist of spacing multipliers, and Assay line 2 (proximity).

**R7 — Width is given, not filled.** → `DESIGN.md`
- *Principle:* Components take the width their content needs. Prose is capped at about 65–75 characters. Surplus width goes to a rail or to margin, never to stretching. `[TOC]` / `[FROM MEMORY]`
- *Example:* The DealReady memo reader capped at a reading measure, with provenance in a right rail. A Fybr report-settings form at a fixed narrow width, centered in the pane.
- *Counter-example:* A settings form stretched to 1440px; body text running the full width of a table view.
- *Enforced by:* `max-w` tokens and Assay line 10.

**R8 — Numbers right-aligned in tabular figures; mixed sizes aligned on the baseline.** → `components.md` (table and metric components)
- *Principle:* Numeric columns are right-aligned with tabular numerals, with units in the header or a consistent suffix. A large value and its small unit share a baseline. `[TOC]` / `[FROM MEMORY]`; tabular numerals are `[CONVENTION]`.
- *Example:* DealReady financials columns aligned on the decimal. Fybr's "1,240 m³" readout, with the unit baseline-aligned to the number.
- *Counter-example:* Centered numeric cells in proportional figures; `items-center` on a mixed-size metric.
- *Enforced by:* Defaults in the table component, and Assay line 3.

**R9 — Color is defined up front, in OKLCH, as ramps plus semantic pairs per theme.** → `tokens.md`. This amends the book's HSL chapter.
- *Principle:* Every color used is a named token from a ramp. Surfaces use background/foreground pairs defined in both themes. Nothing is picked at the point of use. `[TOC]` intent; mechanism from the Tailwind v4 and shadcn primary docs.
- *Example:* `bg-warning` / `text-warning-foreground`, defined under `:root` and `.dark`.
- *Counter-example:* `bg-[#3b82f6]`; an HSL value nudged inline to "fix" a hover.
- *Enforced by:* A no-raw-color lint rule (not the stack's default), and Assay line 4.

**R10 — Neutrals carry temperature.** → `tokens.md`
- *Principle:* Greys are tinted, with low chroma and a stated temperature, per product. `[TOC]`; the stack's default is chroma-zero (primary).
- *Example:* DealReady on a warm, low-chroma neutral ramp (start from shadcn's Stone or Taupe base). Fybr's neutral chosen by testing contrast in glare first, temperature second.
- *Counter-example:* Shipping shadcn's default `neutral` unchanged, at `oklch(L 0 0)` throughout.
- *Enforced by:* A token review at Plumb's gate.

**R11 — Contrast is fixed by flipping the pairing, and meaning never rides on color alone.** → `DESIGN.md`
- *Principle:* When a colored element fails contrast, use dark text on a light tint rather than darkening the color toward black. Every status carries a second signal: text, icon or shape. `[TOC]`
- *Example:* A "Needs review" pill as dark text on a light amber tint, with an icon. Fybr confidence shown as "± 2.1%" text as well as color.
- *Counter-example:* White text on mid-green that fails AA; a green/amber/red dot as the only confidence signal on a measurement.
- *Enforced by:* Threshold's color-alone and contrast tests, and Assay line 4.

**R12 — Elevation is a closed scale where each level means one layer.** → `tokens.md`
- *Principle:* There are four named levels: resting, raised, overlay, modal. Nothing uses a shadow outside its level. In dark mode, elevation is expressed by lighter surfaces, with shadows minimal. `[TOC]`, amended for dark mode `[JUDGMENT]`.
- *Example:* The dropdown uses `overlay` and the dialog uses `modal`. Static cards sit at `resting`.
- *Counter-example:* `shadow-2xl` on a static card to make it "pop"; a card inside a card, each with its own shadow.
- *Enforced by:* Shadow tokens restricted to the four names, and Assay line 6.

**R13 — Separate with space or background before border.** → `DESIGN.md`
- *Principle:* Reach for spacing or a surface change first. Hairlines are reserved for group boundaries and data grids where scanning needs them. `[HOME]`, `[7-TIPS]`
- *Example:* DealReady table rows separated by row rhythm, with hairlines only between row groups. Panels separated by a surface-tone change.
- *Counter-example:* The shadcn default look carried into every surface: a bordered card holding a bordered table holding bordered badges.
- *Enforced by:* Assay line 6 (dialect test).

**R14 — The empty state is designed as a first screen.** → `states.md`
- *Principle:* An empty state says what will be here, offers the first action, and hides controls that act on nothing. `[TOC]`
- *Example:* A new deal room shows one sentence and "Upload the data room index," with filters, sort and pagination hidden until there are documents.
- *Counter-example:* An empty table under a full filter bar, reading "Showing 0 of 0."
- *Enforced by:* The state matrix, and Assay line 5. The copy goes to Gloss.

### Entries for `anti-patterns.md`: the book's moves that became tells

Each entry gives the tell as people will see it, why it reads as generic here, and the on-system alternative.

- **B1 — Colored side or top stripe on cards and alerts.** Book source: [7-TIPS], *Add color with accent borders*. Why generic: it is one of the most frequent moves in generated Tailwind UI and signals a template. Alternative: carry status in icon plus text, with a tinted surface only when the state is exceptional.
- **B2 — Small icon enlarged inside a tinted circle or rounded square as a feature marker.** Book source: [7-TIPS]. Why generic: it is the unit of the four-card-grid tell. Alternative: no icon, or an icon at its drawn size inline with the text it labels.
- **B3 — Decorative background gradients, patterns or blobs in product surfaces.** Book source: [TOC], *Decorate your backgrounds*. Why generic: gradient washes are already banned in your prompting checklist. Alternative: surface-tone steps from the neutral ramp; marketing surfaces are Vitrine's call.
- **B4 — A neutral sans picked as the safe default.** Book source: [FROM MEMORY], *Use good fonts*. Why generic: it produces Inter everywhere. Alternative: the book's own *Choose a personality* chapter. Choose for the product. For DealReady, strong tabular figures and legibility at 12px. For Fybr, a high x-height that survives glare.
- **B5 — Native controls rebuilt as custom visuals.** Book source: [FROM MEMORY], *Supercharge the defaults*. Why it's a problem: it loses native semantics and keyboard behavior. Alternative: `accent-color` and the design system's accessible primitives (Threshold's native-first rule).

### Lines Assay's rubric should adopt

| Rubric line | Addition | Source |
|---|---|---|
| 1 Hierarchy | **Greyscale test:** desaturate the screenshot. There is one focal point, and secondary information recedes by weight and color, not only by size. | [FROM MEMORY], ch. 1–2 |
| 1 Hierarchy | **Action count:** at most one primary-styled action per view. Destructive primary appears only in confirmations. | [7-TIPS] |
| 1 Hierarchy | **Label test:** any key–value pair that could be a formatted phrase is a finding (display data only). | [TOC] |
| 2 Spacing | **Proximity:** space between groups is greater than space within groups, everywhere. No off-list multipliers. | [TOC] |
| 3 Typography | Prose at 75 characters or fewer. Numeric columns right-aligned with tabular figures. Mixed sizes on one line share a baseline. | [TOC] |
| 4 Color | No grey text on colored backgrounds. No meaning carried by color alone. Muted text passes AA. | [7-TIPS], [TOC] |
| 6 Design-layer fit | Separation by space or surface before border; shadows only at their named elevation. | [HOME], [TOC] |
| 7 Slop tells | B1–B4 checked by name. | this ruling |

**Plumb, to note:** the `[FROM MEMORY]` rules (R2, R4 detail, R7, R8 baseline, B4, B5) should be marked provisional in the changelog until someone verifies them against the book. The free two-chapter sample covers part of that.

---

## 7. Purchase verdict

- **Buy The Essentials, $99 USD** (verified 2026-09-30). The before-and-after images are the teaching, and summaries or unofficial skills strip them out. There is a 60-day refund.
- **Skip The Complete Package ($149).** Its extras are the most aged and most generic parts of the offer. The palettes are HSL-era ramps, which your OKLCH tokens supersede. The component gallery is a catalogue of layout conventions, the source of template rhythm, and ships without CSS by design. The font list skews to exactly the defaults B4 bans.
- **Optional first step:** grab the two free chapters from the homepage. If one of them is Chapter 2, you may find the rest is review, and the refund covers you.
- **Availability:** the book was on sale when checked today. Tailwind Labs closed its other products to new customers when it joined Shopify on Sept 9. I found no statement either way about Refactoring UI, so this is an observation, not a reason to rush.

---

## Convergence tests run

- **Drift test:** run on every proposed rule; five cut (listed in §6). Four of the book's own tactics were moved to anti-patterns.
- **Buildability test:** every rule names its file, an example, a counter-example and an enforcement point. R10 and R12 need Plumb to choose actual token values; I've left them open rather than inventing them.
- **Register and trust tests:** R3 and R14 route their copy to Gloss. R4, R5, R11 and B5 route to Threshold.
- **Alarm test:** R3 keeps red and destructive styling off routine rows.

## Assumptions

- `[ASSUMPTION: the stack for both products is Tailwind v4 plus shadcn, per the shared context's Recipe A]`
- `[ASSUMPTION: DealReady and Fybr both support light and dark themes; if Fybr is light-only for glare, R12's dark-mode clause applies to DealReady only]`

## Sources (accessed 2026-09-30 unless noted)

- Refactoring UI homepage: TOC, packages, prices, sample offer — https://www.refactoringui.com/ (primary)
- Wathan & Schoger, "7 Practical Tips for Cheating at Design," Feb 20, 2018 — https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 (primary; reader responses on accessibility are secondary)
- Tailwind CSS v4.0 release post, 2025-01-22; site currently shows v4.3 — https://tailwindcss.com/blog/tailwindcss-v4 (primary)
- shadcn/ui Theming docs — https://ui.shadcn.com/docs/theming (primary)
- ui.sh, "Agent skills for interface builders" — https://ui.sh (primary)
- DevClass, "Tailwind Labs lays off 75 percent of its engineers," 2026-01-08 — https://devclass.com/2026/01/08/tailwind-labs-lays-off-75-percent-of-its-engineers-thanks-to-brutal-impact-of-ai/ (secondary)
- Search Engine Roundtable, quoting Wathan's post of 2026-01-07 — https://www.seroundtable.com/tailwind-css-google-drop-40725.html (secondary)
- CMSWire, "Shopify Acquires Tailwind Labs," 2026-09-10 — https://www.cmswire.com/digital-experience/shopify-acquires-tailwind-labs-to-secure-css-framework/ (secondary)
- RuntimeWire, on the Shopify announcement and Schoger's role, 2026-09-09 — https://runtimewire.com/article/tailwind-labs-joining-shopify-undefined-deal (secondary)
- LobeHub, unofficial "Refactoring UI Design System" skill — https://lobehub.com/skills/comeonoliver-skillshub-refactoring-ui (secondary; unvetted)
- SoBrief summary, on HSL versus OKLCH — https://sobrief.com/books/refactoring-ui (secondary)
