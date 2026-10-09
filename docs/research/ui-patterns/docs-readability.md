# Research note: measurable reading and scanning choices on ten documentation sites (dated 2026-10-08)

No value in this note is "verified". No computed styles could be read from any live docs page in this run. Everything below is either secondary (a design-system doc, a platform's documented defaults, or a third-party capture, each cited) or "not found". Only one pattern has three named sites behind it: a two-tier type system. Radix Themes' typography doc gives the exact values: step 2 is 14px / 0em / 20px for interface chrome, and step 3 is 16px / 0em / 24px for reading text. The same doc says each step's "font size, line height and letter spacing" values are "designed to be used in combination".

## TL;DR

- **Evidence status:** 0 of 10 sites were measured from live computed styles. Stripe Docs has the most secondary data, with two third-party captures that disagree with each other. Radix (Radix Themes) and Vercel (Geist) have first-party design-system docs. Claude/Anthropic docs inherit documented Mintlify theme defaults. OpenAI, Linear, Supabase, Next.js and Tailwind CSS Docs are almost entirely "not found".
- **What holds up across sources:** a 14px/20px chrome tier plus a 16px/24px reading tier (Vercel, Radix, Stripe). Code that scrolls horizontally instead of wrapping (Stripe, @tailwindcss/typography baseline). A capped text measure: 36–40.5rem in several Mintlify themes, 65ch in the prose plugin. A left sidebar of about 16.5–19rem in Mintlify themes.
- **What to do:** keep your @tailwindcss/typography defaults as the baseline. Adopt the two-tier sizes, horizontal-scroll wrappers for tables, and contrast floors taken from the recorded Stripe ratios. Treat everything else as Consider until you run a computed-style capture. Promote to library: no.

## 1. The question

What do the best documentation sites do, measurably, to make long technical reading pleasant and scannable, and which of those choices should a Next.js + Tailwind v4 + @tailwindcss/typography docs site adopt? That site has sidebar nav, search, markdown articles with a frontmatter panel, many wide tables, blockquote instruction blocks, and light and dark themes.

## 2. The answer in one paragraph

This run produced no verified values. The tools could not read computed styles from any live docs page, so the evidence below is secondary or "not found". The secondary evidence does converge on a few points:

- **Two type tiers.** Chrome and UI text sits at 14px with a 20px line-height. Reading text sits at 16px with a 24px line-height. Vercel's Geist, Radix Themes and two Stripe Docs captures all show this.\[1\]\[2\]\[3\]\[4\]\[5\]
- **Code and wide content scroll horizontally** rather than wrap: Stripe Docs capture, and the @tailwindcss/typography `pre` rule.\[3\]\[6\]
- **Text measure is capped.** Several Mintlify themes cap it at 36–40.5rem, and the prose plugin caps it at 65ch.\[7\]\[8\]
- **The left sidebar is about 16.5–19rem** in Mintlify themes (Anthropic's docs run on Mintlify).\[7\]\[9\]

Stripe Docs is the only site with recorded colour pairs. They compute to 9.55:1 for body text and 4.83:1 for links in light mode. In dark mode, body text reaches 15.55:1 but the link drops to 4.31:1. That is below the 4.5:1 minimum in W3C's WCAG 2.2 SC 1.4.3 Contrast (Minimum), Level AA. That criterion covers all normal-size text, links included.

For your stack: keep the prose plugin's spacing as the baseline. Adopt the two-tier sizes, horizontal-scroll table wrappers and contrast floors. Hold everything else as Consider until a computed-style pass has been run.

## 3. Evidence tables

### Source keys (every cell below refers to these)

| Key | Source and locator | Date | Type |
|---|---|---|---|
| OMD-Stripe | oh-my-design.kr/design-systems/stripe (capture of docs.stripe.com, docs.stripe.com/payments, docs.stripe.com/api) | captured 2026-07-13 per source; read 2026-10-08 | secondary (third-party capture) |
| Fudge-Stripe | design.withfudge.com/share/docs.stripe.com-design (API Reference, dark theme). The source says its measurements are "practical adaptation targets based on visible proportions" | capture date not found; read 2026-10-08 | secondary (third-party, low precision) |
| Geist-Typo | vercel.com/geist/typography (Vercel design-system doc; search snippet only) | read 2026-10-08 | secondary (first-party design system) |
| DS1-Geist | designsystems.one/design-systems/vercel-geist (third-party restatement of Geist scale) | read 2026-10-08 | secondary (third-party) |
| Radix-Typo | radix-ui.com/themes/docs/theme/typography; radix-ui.com/themes/docs/theme/spacing; radix-ui.com/themes/docs/components/text and /heading | read 2026-10-08 | secondary (first-party design system for Radix Themes library) |
| Mint-CSS | mintlify.com/docs/customize/custom-scripts (sections "Change the sidebar width", "Change the content width", CSS hooks) | read 2026-10-08 | secondary (platform theme defaults) |
| Mint-Anthropic | mintlify.com/customers/anthropic | read 2026-10-08 | secondary (platform statement) |
| TW-Typo | github.com/tailwindlabs/tailwindcss-typography src/styles.js, main branch (June 2026) for sizes and spacing. Weights and decoration from commit 6566aa3 (early 0.5) | read 2026-10-08 | secondary (library source; your current baseline, not one of the ten sites) |
| Spell | spell.sh/blog/tailwind-typography-plugin | read 2026-10-08 | secondary (third-party article) |

Page measured per site (live computed styles): none, for all ten sites. No representative article URL could be opened with a style inspector in this run.

### 3.1 Body text: family, size, line-height, letter-spacing

| Site | Family | Size | Line-height | Letter-spacing |
|---|---|---|---|---|
| Stripe Docs | Conflict. "operating-system stack, not a named Stripe UI family" per OMD-Stripe;\[2\] Inter per Fudge-Stripe (secondary)\[2\]\[3\] | 14px per OMD-Stripe; 1rem (16px) per Fudge-Stripe (secondary)\[2\]\[3\] | 1.43 per OMD-Stripe; 1.6 per Fudge-Stripe (secondary) | 0em per Fudge-Stripe (secondary); OMD-Stripe not found |
| Next.js Docs | not found | not found | not found | not found |
| OpenAI Platform docs | not found | not found | not found | not found |
| Claude / Anthropic docs | not found (Mintlify platform per Mint-Anthropic; theme not identified) | not found | not found | not found |
| Vercel Docs | Geist / Geist Mono (Geist-Typo, secondary, design system not docs page) | Copy 14 is "Most commonly used text style." Copy 16 is "Used in simpler, larger views like Modals where text can breathe." (Geist-Typo, secondary) | copy-14 = 20px; copy-16 = 24px (DS1-Geist, secondary)\[5\] | not found |
| Linear Docs | not found (only marketing-page data exists; excluded) | not found | not found | not found |
| Tailwind CSS Docs | not found | not found | not found | not found |
| Supabase Docs | not found (third-party sources disagree for marketing pages; none sampled docs) | not found | not found | not found |
| Resend Docs | not found (Mintlify platform, per Mintlify's Resend customer case study at mintlify.com/customers/resend; theme not identified) | not found | not found | not found |
| Radix UI Docs | System stack default "-apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto…" (Radix-Typo, secondary, Themes library)\[1\] | Step 2 = 14px; step 3 = 16px (Radix-Typo, secondary)\[1\] | 20px; 24px (Radix-Typo, secondary) | 0em at steps 2 and 3 (Radix-Typo, secondary) |
| Baseline: @tailwindcss/typography | inherits | 1rem (16px) (TW-Typo, secondary)\[10\] | 1.75 (28/16) (TW-Typo, secondary)\[10\] | not set |

### 3.2 Heading scale (h1–h4 size, weight, spacing)

| Site | h1 | h2 | h3 | h4 | Top/bottom spacing |
|---|---|---|---|---|---|
| Stripe Docs | 32px / 700 / 1.25 per OMD-Stripe (API h1 only); 2rem / 700 / 1.2 / -0.02em per Fudge-Stripe (secondary)\[2\]\[3\] | 1.5rem / 600 / 1.3 / -0.01em per Fudge-Stripe (secondary) | not found | not found | Section breaks 3rem; related elements 1.5rem (Fudge-Stripe, secondary)\[3\] |
| Next.js Docs | not found | not found | not found | not found | not found |
| OpenAI Platform docs | not found | not found | not found | not found | not found |
| Claude / Anthropic docs | not found | not found | not found | not found | not found |
| Vercel Docs | Geist heading tier exists (Heading 32, Heading 16 named in Geist-Typo); heading-24 = 24/32, heading-40 = 40/48 (DS1-Geist) (secondary; mapping to h1–h4 not found)\[4\]\[5\] | see left | see left | see left | not found |
| Linear Docs | not found | not found | not found | not found | not found |
| Tailwind CSS Docs | not found | not found | not found | not found | not found |
| Supabase Docs | not found | not found | not found | not found | not found |
| Resend Docs | not found | not found | not found | not found | not found |
| Radix UI Docs | Heading component sizes match the Text scale with tighter line-heights; e.g. step 6 = 24/30, -0.00625em; step 8 = 35/40, -0.01em (Radix-Typo, secondary; h-level mapping not found)\[1\]\[11\] | see left | see left | see left | not found |
| Baseline: @tailwindcss/typography | 2.25em / 800 / 1.111; mt 0, mb 0.889em | 1.5em / 700 / 1.333; mt 2em, mb 1em | 1.25em / 600 / 1.6; mt 1.6em, mb 0.6em | 1em / 600 / 1.5; mt 1.5em, mb 0.5em | (TW-Typo, secondary; weights from early-0.5 commit)\[10\]\[12\] |

### 3.3 Content measure (max width, characters per line)

| Site | Max width | Characters per line |
|---|---|---|
| Stripe Docs | not found (Fudge-Stripe: "max-width constraints", no value) | not found |
| Next.js Docs | not found | not found |
| OpenAI Platform docs | not found | not found |
| Claude / Anthropic docs | Mintlify `--content-width` defaults by theme: Mint/Palm/Aspen no maximum; Linden 35.75rem on extra-large screens; Maple 36rem (42rem on largest screens); Willow 600px; Almond 36rem; Sequoia/Luma 40.5rem (Mint-CSS, secondary, theme defaults; Anthropic's theme not identified)\[7\] | not found (font not recorded; not derived) |
| Vercel Docs | not found | not found |
| Linear Docs | not found | not found |
| Tailwind CSS Docs | not found | not found |
| Supabase Docs | not found | not found |
| Resend Docs | Same Mintlify defaults as above (on Mintlify per mintlify.com/customers/resend; theme not identified) | not found |
| Radix UI Docs | not found | not found |
| Baseline: @tailwindcss/typography | 65ch (TW-Typo, secondary)\[8\]\[12\] | not derived. The ch unit is the width of "0", so real characters per line depends on the font. Method not applied. |

### 3.4 Paragraph and list spacing

| Site | Paragraph spacing | List spacing |
|---|---|---|
| Stripe Docs | not found | Sidebar siblings 0.25rem apart (Fudge-Stripe, secondary); article lists not found\[3\] |
| Next.js Docs | not found | not found |
| OpenAI Platform docs | not found | not found |
| Claude / Anthropic docs | not found | not found |
| Vercel Docs | not found | not found |
| Linear Docs | not found | not found |
| Tailwind CSS Docs | not found | not found |
| Supabase Docs | not found | not found |
| Resend Docs | not found | not found |
| Radix UI Docs | Space scale 4/8/12/16/24/32/40/48/64px (Radix-Typo spacing page, secondary);\[13\] paragraph use not found | not found |
| Baseline: @tailwindcss/typography | p margin 1.25em top and bottom (TW-Typo, secondary)\[10\] | ul/ol margin 1.25em, padding-start 1.625em; li margin 0.5em; nested lists 0.75em (TW-Typo, secondary)\[10\] |

### 3.5 Text colours and contrast (light and dark)

Contrast ratios were computed by Alembic from the recorded hex pairs using the WCAG relative-luminance formula. Where either hex is missing, the ratio is "not found".

| Site | Light: body / muted / link on bg | Light ratios | Dark: body / muted / link on bg | Dark ratios |
|---|---|---|---|---|
| Stripe Docs | #414552 / #50617a / #5469d4 on #ffffff (OMD-Stripe, secondary); strong text #1a2c44\[2\] | body 9.55:1; muted 6.30:1; link 4.83:1; strong 14.12:1 | #e5e7eb / #9ca3af / #6366f1 on #0a0e1a (Fudge-Stripe, secondary)\[3\] | body 15.55:1; muted 7.58:1; link 4.31:1 |
| Next.js Docs | not found | not found | not found | not found |
| OpenAI Platform docs | not found | not found | not found | not found |
| Claude / Anthropic docs | not found | not found | not found | not found |
| Vercel Docs | Link #0070f3 per DS1-Geist (secondary);\[5\] body, muted, bg not found\[5\] | not found | not found | not found |
| Linear Docs | not found | not found | not found | not found |
| Tailwind CSS Docs | not found | not found | not found | not found |
| Supabase Docs | not found | not found | not found | not found |
| Resend Docs | not found | not found | not found | not found |
| Radix UI Docs | not found | not found | not found | not found |
| Baseline: @tailwindcss/typography | gray theme hex values not found (built from tailwindcss/colors) | not found | invert values not found | not found |

### 3.6 Inline code and code blocks

| Site | Inline code | Code block |
|---|---|---|
| Stripe Docs | Same mono family as blocks, no background: "Inline code uses the same family as blocks but without background treatment" (Fudge-Stripe, secondary)\[3\] | SF Mono 0.875rem / 1.6; elevated surface background; radius 0.5rem; padding 1rem; internal scroll for overflow; copy button and language indicator (Fudge-Stripe, secondary)\[3\] |
| Next.js Docs | not found | not found |
| OpenAI Platform docs | not found | not found |
| Claude / Anthropic docs | not found | Mintlify exposes copy button, "Ask Assistant" button and collapse fade overlay hooks (Mint-CSS, secondary; existence only)\[7\] |
| Vercel Docs | Copy 13 Mono, described as "Used for inline code mentions." (Geist-Typo, secondary)\[4\] | not found |
| Linear Docs | not found | not found |
| Tailwind CSS Docs | not found | not found |
| Supabase Docs | not found | not found |
| Resend Docs | not found | not found |
| Radix UI Docs | Code font default 'Menlo', 'Consolas (Custom)', 'Bitstream Vera Sans Mono', monospace (Radix-Typo, secondary)\[1\] | not found |
| Baseline: @tailwindcss/typography | 0.875em, weight 600, backtick pseudo-content before/after (TW-Typo, secondary)\[12\] | 0.875em / 1.714; radius 0.375rem; padding 0.857em 1.143em; overflow-x auto (TW-Typo, secondary)\[10\]\[12\] |

### 3.7 Tables, callouts/admonitions, blockquotes, keyboard keys

| Site | Tables | Callouts | Blockquotes | Kbd |
|---|---|---|---|---|
| Stripe Docs | Transparent with horizontal dividers; cells 0.875rem; headers 0.75rem / 500 / uppercase / +0.02em; rows 0.75rem vertical, 1rem horizontal padding (Fudge-Stripe, secondary)\[3\] | not found | not found | not found |
| Next.js Docs | not found | not found | not found | not found |
| OpenAI Platform docs | not found | not found | not found | not found |
| Claude / Anthropic docs | not found | Mintlify callout types Note, Warning, Tip (Mint-CSS, secondary; styling not found)\[7\] | not found | not found |
| Vercel Docs | not found | not found | not found | not found |
| Linear Docs | not found | not found | not found | not found |
| Tailwind CSS Docs | not found | not found | not found | not found |
| Supabase Docs | not found | not found | not found | not found |
| Resend Docs | not found | not found | not found | not found |
| Radix UI Docs | Table component exists (Radix-Typo nav, secondary); styling not found | Callout component exists; styling not found | Blockquote and Quote exist; Quote font default 'Times New Roman', serif (Radix-Typo, secondary)\[1\] | Kbd component exists; styling not found |
| Baseline: @tailwindcss/typography | 0.875em / 1.714; cell padding 0.571em, first cell start and last cell end padding 0; thead border 1px, weight 600 (TW-Typo, secondary)\[10\] | none provided | italic, weight 500, left border 0.25rem, padding-start 1em, margins 1.6em, curly open/close quotes added (TW-Typo, secondary)\[10\]\[12\] | 0.875em; radius 0.3125rem; padding 0.1875em 0.375em; colours not found (TW-Typo, secondary)\[10\] |

### 3.8 Sidebar: width, item density, active state

| Site | Width | Item density | Active state |
|---|---|---|---|
| Stripe Docs | about 20–25% of viewport on desktop (Fudge-Stripe, secondary, estimate by source)\[3\] | 0.875rem / 1.5; 0.5rem vertical item padding; 0.25rem between siblings; 1.5rem nested indent; uppercase category labels (Fudge-Stripe, secondary)\[3\] | Elevated surface background plus accent text (Fudge-Stripe, secondary); OMD-Stripe not found\[3\] |
| Next.js Docs | not found | not found | not found |
| OpenAI Platform docs | not found | not found | not found |
| Claude / Anthropic docs | Mintlify `--sidebar-width` defaults: Mint/Linden/Willow/Aspen/Sequoia 18rem; Maple/Palm 19rem; Almond 16.5rem; Luma 14rem (Mint-CSS, secondary, theme defaults; Anthropic theme not identified)\[7\] | not found | `#sidebar-content li[data-active]` hook exists (Mint-CSS);\[7\] styling not found |
| Vercel Docs | not found | not found | not found |
| Linear Docs | not found | not found | not found |
| Tailwind CSS Docs | not found | not found | not found |
| Supabase Docs | not found | not found | not found |
| Resend Docs | Mintlify defaults above (on Mintlify per mintlify.com/customers/resend; theme not identified) | not found | not found |
| Radix UI Docs | not found | not found | not found |

### 3.9 In-page table of contents

| Site | Present | Where | Notes |
|---|---|---|---|
| Stripe Docs | not found | not found | Section headers carry "Ask about this section", "Copy for LLM", "View as Markdown" actions (Fudge-Stripe, secondary)\[3\] |
| Next.js Docs | not found | not found | not found |
| OpenAI Platform docs | not found | not found | not found |
| Claude / Anthropic docs | Yes, in Mintlify default page mode (Mint-CSS, secondary, theme default)\[14\] | "Table of contents panel on the right side of the page." (Mint-CSS)\[7\] | Hooks mark both the active item and the deepest active heading (`toc-item[data-active-deepest]`) (Mint-CSS)\[7\] |
| Vercel Docs | not found | not found | not found |
| Linear Docs | not found | not found | not found |
| Tailwind CSS Docs | not found | not found | not found |
| Supabase Docs | not found | not found | not found |
| Resend Docs | Mintlify default (on Mintlify per mintlify.com/customers/resend; theme not identified) | right (theme default) | not found |
| Radix UI Docs | not found | not found | not found |

### 3.10 Header height

| Site | Header height |
|---|---|
| Stripe Docs | not found |
| Next.js Docs | not found |
| OpenAI Platform docs | not found |
| Claude / Anthropic docs | not found |
| Vercel Docs | not found |
| Linear Docs | not found |
| Tailwind CSS Docs | not found |
| Supabase Docs | not found |
| Resend Docs | not found |
| Radix UI Docs | not found |

## 4. Recurring patterns (3+ named sites) and outliers worth stealing

### Patterns meeting the three-site bar

**P1. Two copy tiers: 14px / 0em / 20px for chrome and labels, 16px / 0em / 24px for reading (Radix Themes steps 2 and 3).** This rests on three sites, all secondary:

- **Vercel Docs (Geist-Typo, DS1-Geist):** Copy 14 at 14/20 is the "Most commonly used text style." Copy 16 at 16/24 is "Used in simpler, larger views like Modals where text can breathe." Note that Geist names modals here, not article reading text.
- **Radix UI Docs (Radix-Typo):** step 2 is 14/20 and step 3 is 16/24.\[1\] "Sizes 1–3 are designed to work well for UI labels."\[15\]
- **Stripe Docs:** 14px/1.43 for docs text and controls (OMD-Stripe); 1rem/1.6 for body in the API reference (Fudge-Stripe).\[2\]\[3\]

Why it works, judgment (Vitrine): the size step makes chrome (nav, labels, table cells) read as quieter than the article without changing colour. Readers can then skim the frame and read the content at different speeds.

No other pattern reached three named sites with sourced values. Two candidates fell short:

- Negative tracking that grows with heading size: Radix and Stripe only.
- Inline code set one step below body: Vercel and Stripe, plus the prose baseline, which is not one of the ten sites.

### Outliers worth stealing

| Outlier | Site and source | Why it works |
|---|---|---|
| A letter-spacing and line-height value for every size step, with tracking tightening as size grows: 12px 0.0025em; 14px and 16px 0em; 18px -0.0025em; 20px -0.005em; 24px -0.00625em; 28px -0.0075em; 35px -0.01em; 60px -0.025em | Radix UI Docs (Radix-Typo, secondary) | judgment (Vitrine): large type looks loose at default tracking. Tightening it step by step keeps headings dense, so they read as one unit and don't pull the eye more than their rank warrants. |
| Inline code without background fill | Stripe Docs (Fudge-Stripe, secondary) | judgment (Vitrine): inline code in dense reference prose is frequent. A fill on every instance turns a paragraph into a striped pattern. Letting the font change carry the distinction keeps the reading rhythm even. |
| Inline code one size below copy (13 Mono beside 14 copy)\[4\] | Vercel Docs (Geist-Typo, secondary) | Geist's own reason (secondary): Label 13 Mono is "Used to pair with Label 14, as the smaller mono size looks better in that pairing", and Copy 13 Mono is "Used for inline code mentions." judgment (Vitrine): monospace looks larger than sans at the same size, so dropping one step keeps line spacing even. |
| Highlighting the deepest active heading in the TOC, separately from its parents\[7\] | Claude / Anthropic docs via Mintlify (Mint-CSS, secondary) | judgment (Vitrine): in long pages with nested h3s, highlighting only the exact current heading gives a precise "you are here". Highlighting the whole branch says little. |
| Uppercase, smaller, slightly tracked table headers (0.75rem / 500 / +0.02em)\[3\] | Stripe Docs (Fudge-Stripe, secondary) | judgment (Vitrine): headers that differ in case and size from cells can be told apart without heavy rules or fills. That keeps wide tables light. |
| Per-section "Copy for LLM" / "View as Markdown" actions\[3\] | Stripe Docs (Fudge-Stripe, secondary) | judgment (Vitrine): the actions sit at the heading's right edge, so they never break the reading column. |

## 5. Wide tables

| Site | Horizontal scroll | Sticky first column | Smaller type | Breaks out of measure |
|---|---|---|---|---|
| Stripe Docs | Prescribed: tables "should scroll horizontally" (Fudge-Stripe, secondary; phrased as guidance, not observed)\[3\] | Prescribed: method columns "remaining visible during scroll" (Fudge-Stripe, secondary; guidance)\[3\] | Cells 0.875rem vs 1rem body (Fudge-Stripe, secondary) | Code blocks and tables "extending to panel edges" (Fudge-Stripe, secondary)\[3\] |
| Next.js Docs | not found | not found | not found | not found |
| OpenAI Platform docs | not found | not found | not found | not found |
| Claude / Anthropic docs | not found | not found | not found | Mintlify `wide` page mode hides the TOC to use full width (Mint-CSS / Mintlify layouts doc, secondary; page-level, not per table)\[14\]\[16\] |
| Vercel Docs | not found | not found | not found | not found |
| Linear Docs | not found | not found | not found | not found |
| Tailwind CSS Docs | not found | not found | not found | not found |
| Supabase Docs | not found | not found | not found | not found |
| Resend Docs | not found | not found | not found | not found |
| Radix UI Docs | not found | not found | not found | not found |
| Baseline: @tailwindcss/typography | Not provided: "Tables are styled but not made responsive." (Spell, secondary). The `pre` element alone has overflow-x auto (TW-Typo)\[8\]\[12\] | not provided | 0.875em (TW-Typo, secondary)\[10\] | No; bound by 65ch unless max-w-none (TW-Typo, secondary)\[6\] |

Finding: your current stack gives tables a smaller size but no overflow handling. The only site-level evidence for scroll and sticky columns is Stripe Docs, and that is phrased as guidance by a third party.\[3\]

## 6. Text emphasis and highlighting

| Device | What sources record | Sites |
|---|---|---|
| Bold | Baseline strong weight 600 (TW-Typo).\[12\] Geist offers "with Strong" variants of copy and label styles (Geist-Typo). Radix Strong is its own component with a separately mappable font (Radix-Typo) | Vercel, Radix, baseline |
| Links | Stripe light link #5469d4 (OMD-Stripe).\[2\] Stripe dark inline-link/action colour #6366f1 (Fudge-Stripe). Vercel link #0070f3 (DS1-Geist).\[2\]\[3\]\[5\] Baseline links underlined, weight 500 (TW-Typo)\[12\] | Stripe, Vercel, baseline |
| Accent colour sparingly | Stripe's accent purple is "used sparingly for navigation selection states and focus indicators" (Fudge-Stripe, paraphrased here)\[3\] | Stripe |
| Inline code | Stripe: no background (Fudge-Stripe). Vercel: 13 Mono (Geist-Typo). Baseline: weight 600 plus backticks (TW-Typo)\[12\] | Stripe, Vercel, baseline |
| Italic/emphasis | Radix Em and Quote default to 'Times New Roman' serif (Radix-Typo).\[1\] Baseline blockquote italic (TW-Typo)\[12\] | Radix, baseline |
| Marks/highlights | not found on any site | none |
| Callout colours | Mintlify callout types Note, Warning, Tip exist (Mint-CSS);\[7\] colours not found. Radix Callout exists; colours not found | Claude/Anthropic (via Mintlify), Radix |
| Semantic colour coding | HTTP methods colour-coded green POST, blue GET, orange DELETE, with text labels kept (Fudge-Stripe)\[3\] | Stripe |

How sparingly: the only source that measures restraint is Fudge-Stripe. It says the accent appears only on active and focus states and that method colours are always paired with text labels.\[3\] No source gives a frequency or density figure for emphasis on any site.

## 7. Contradictions found between sources

| Item | Side A | Side B | Status |
|---|---|---|---|
| Stripe Docs body family | "operating-system stack, not a named Stripe UI family" (OMD-Stripe, captured 2026-07-13, docs home/payments/api)\[2\] | Inter (Fudge-Stripe, API Reference, undated)\[3\] | Unresolved; OMD-Stripe is the more conservative, dated capture |
| Stripe Docs body size and leading | 14px / 1.43 (OMD-Stripe) | 1rem / 1.6 (Fudge-Stripe) | Unresolved; possibly different surfaces (docs home and guides vs API reference). Not averaged |
| Stripe Docs h1 line-height | 1.25 at 32px (OMD-Stripe) | 1.2 at 2rem (Fudge-Stripe) | Unresolved |
| Stripe Docs dark link vs the WCAG minimum | Link #6366f1 on #0a0e1a computes to 4.31:1 (Fudge-Stripe values) | WCAG 2.2 SC 1.4.3 (Level AA) requires "a contrast ratio of at least 4.5:1" for all normal-size text, links included | Fails AA, on that capture's own values. Fudge-Stripe's own colours are adaptation targets, so this needs re-checking against live styles. |
| Prose plugin weights | Weights recorded from early-0.5 commit 6566aa3 (TW-Typo) | Current main branch weights not read | Not confirmed for current version |

## 8. What was not found

- **Verified values:** none. No live docs page's computed styles were read for any of the ten sites, so no cell carries "verified".
- **Sites with no docs-specific data at all:** Next.js Docs, OpenAI Platform docs, Linear Docs, Tailwind CSS Docs and Supabase Docs. The Linear and Supabase data that does exist comes from marketing pages and was excluded as out of scope. The available Next.js capture was a conference page and was excluded.
- **Theme identity:** the Mintlify theme used by Claude/Anthropic docs and by Resend docs. Resend's use of Mintlify is confirmed by Mintlify's customer case study (mintlify.com/customers/resend), which says the migration was completed "in under two days". The theme is still not identified.
- **Header height:** all ten sites.
- **Callout, blockquote and kbd colours and styling:** all ten sites.
- **Mark/highlight usage:** all ten sites.
- **Dark-theme colours:** every site except Stripe.
- **Prose plugin colours:** gray-theme hex values for the @tailwindcss/typography `--tw-prose-*` variables, and their invert counterparts.
- **Characters per line:** not derived for any site, because no pairing of measure width with a recorded font was available.
- **Template:** the file docs/workflows/templates/research-note.template.md was not accessible. This note follows the section order given in the brief.

## 9. Synthesizer's notes (Alembic's inference, not findings)

- The Fudge-Stripe dark hex values (#e5e7eb, #9ca3af, #111827, #1f2937, #6366f1) are identical to stock Tailwind palette steps. That fits with the source's own statement that its values are adaptation targets, not exact samples.\[3\] Treat its colours, and the ratios computed from them, as weaker than OMD-Stripe's.
- The two Stripe captures probably sampled different surfaces: guides vs API reference, light vs dark. If so, the 14px vs 16px conflict may describe two real tiers rather than an error. This is unconfirmed.
- Next.js Docs and Vercel Docs are both Vercel properties, and Geist is Vercel's system.\[5\]\[17\] It is plausible that Geist values apply to Next.js Docs too, but no source here says so, so the Next.js row stays "not found".
- The prose plugin baseline already supplies most of the spacing values that the ten sites left unrecorded. That is why the spec below leans on it as the default and marks site-derived departures as Consider.
- The fastest way to turn this note into verified evidence: open one long guide per site in a browser, read getComputedStyle for body, h1–h4, p, li, a, code, pre, table, th, td, blockquote, kbd, nav item and header, in both themes, and record the URL and date.

## 10. Docs spec

Paste as instructions. Values apply to both themes unless a theme is named. Sources are in brackets.

- **Adopt: body 16px, letter-spacing 0.** Reading tier recurring at 16px. [Vercel/Geist copy-16; Radix step 3; Stripe API ref (Fudge); prose baseline]
- **Consider: body line-height 24px (1.5).** Recorded reading-tier leading; prose default 1.75 is the alternative if lines feel tight. [Vercel/Geist; Radix; prose baseline 1.75]
- **Adopt: chrome text (sidebar, TOC, table cells, frontmatter panel) 14px / 20px.** Quieter tier for frame elements (P1). [Vercel/Geist copy-14; Radix step 2; Stripe (OMD) 14px/1.43]
- **Consider: h1 32px / 700 / 1.2, letter-spacing -0.02em.** Only sourced docs h1 values. [Stripe (OMD, Fudge)]
- **Consider: h2 24px / 600 / 1.3, letter-spacing -0.01em; margin 2em above, 1em below.** 24px recurs as a heading step; spacing from prose. [Stripe (Fudge); Radix step 6; Geist heading-24; prose baseline]
- **Consider: h3 20px / 600 / 28px; margin 1.6em above, 0.6em below. h4 16px / 600 / 1.5; margin 1.5em above, 0.5em below.** Sourced scale steps. [Radix step 5; prose baseline]
- **Adopt: tracking tightens as heading size grows, never positive above body.** Keeps large headings dense. [Radix scale; Stripe (Fudge)]
- **Consider: article text measure 65ch, or a fixed 36–40.5rem.** Capped measure; pick one unit and keep it. [prose baseline 65ch; Mintlify Almond/Maple 36rem, Sequoia/Luma 40.5rem]\[6\]\[7\]
- **Adopt: paragraph margin 1.25em; list item margin 0.5em; nested lists 0.75em.** Keep the prose rhythm, since no site recorded a different one. [prose baseline]\[10\]
- **Adopt: contrast floors computed from recorded pairs. Light: body at least 9.5:1, muted at least 6.3:1, link at least 4.5:1. Dark: body at least 15:1, muted at least 7.5:1, link at least 4.5:1.** Floors match Stripe's recorded body and muted ratios. The link floor is the WCAG 2.2 SC 1.4.3 (Level AA) minimum of 4.5:1 for all normal-size text, links included; Stripe's dark link misses it at 4.31:1. Choose your own hexes; do not copy one brand. [Stripe (OMD, Fudge); W3C WCAG 2.2]
- **Consider: inline code mono, 0.875em, no background fill, no backtick pseudo-content.** Keeps dense paragraphs even. [Stripe (Fudge); Vercel 13 Mono beside 14 copy; overrides prose backticks]
- **Adopt: code blocks scroll horizontally, never wrap; 0.875em / 1.6–1.714 line-height; radius 0.375–0.5rem; padding 1rem.** Recorded on both sources. [Stripe (Fudge); prose baseline]
- **Adopt: wrap every table in a horizontally scrolling container; table text 0.875em; cell padding 0.571em.** The prose plugin does not handle overflow. [Spell; prose baseline; Stripe (Fudge) guidance]\[8\]
- **Consider: sticky first column on wide tables; uppercase 0.75rem / 500 headers with +0.02em tracking.** Third-party guidance from one site. [Stripe (Fudge)]
- **Consider: blockquote instruction blocks: left border 0.25rem, padding-start 1em, margins 1.6em; remove italic and curly quotes.** Border and spacing from prose. Removing the quote marks is judgment (Vitrine): quote marks signal citation, not instruction. [prose baseline]
- **Consider: kbd 0.875em, radius 0.3125rem, padding 0.1875em 0.375em.** Only sourced values. [prose baseline]\[10\]
- **Consider: sidebar 18rem (range 16.5–19rem); nav items 14px / 1.5, 0.5rem vertical padding, 0.25rem gap, 1.5rem nested indent; active item is a background tint plus accent text.** [Mintlify theme defaults; Stripe (Fudge)]\[7\]
- **Consider: right-side in-page TOC that highlights the deepest active heading separately from its parents.** [Claude/Anthropic via Mintlify defaults]\[7\]
- **Header height: not found on any site; no value specified.**
- **Marks/highlights: not found on any site; no value specified.**

## 11. Promote to library: no

Promote to library: no. The note holds zero verified values, and Stripe Docs is the only site with colour pairs. Its patterns rest on secondary design-system docs and third-party captures, one of which describes its own figures as approximate.\[3\] Re-run with a computed-style capture of one long guide per site, in both themes, dated and URL-located. Promote after that.

## Sources

1. [Typography – Radix Themes](https://www.radix-ui.com/themes/docs/theme/typography)
2. [Stripe Design System — Colors, Typography & Tokens](https://oh-my-design.kr/design-systems/stripe)
3. [docs.stripe.com website design: fonts, colors and UI patterns | Fudge](https://design.withfudge.com/share/docs.stripe.com-design)
4. [Typography](https://vercel.com/geist/typography)
5. [Vercel Geist Design System](https://www.designsystems.one/design-systems/vercel-geist)
6. [GitHub - tailwindlabs/tailwindcss-typography: Beautiful typographic defaults for HTML you don't control. · GitHub](https://github.com/tailwindlabs/tailwindcss-typography)
7. <https://www.mintlify.com/docs/customize/custom-scripts>
8. [A Guide to the Tailwind CSS Typography Plugin](https://spell.sh/blog/tailwind-typography-plugin)
9. [Anthropic](https://www.mintlify.com/customers/anthropic)
10. [tailwindcss-typography/src/styles.js at main · tailwindlabs/tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js)
11. [Heading](https://www.radix-ui.com/themes/docs/components/heading)
12. [tailwindcss-typography/src/styles.js at 6566aa3b84e45ea873ead29f29158cf3ca9ca7aa · tailwindlabs/tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography/blob/6566aa3b84e45ea873ead29f29158cf3ca9ca7aa/src/styles.js)
13. [Spacing](https://www.radix-ui.com/themes/docs/theme/spacing)
14. [Build custom page layouts - Mintlify](https://www.mintlify.com/docs/guides/custom-layouts)
15. [Text](https://www.radix-ui.com/themes/docs/components/text)
16. [Mintlify · GitHub](https://gist.github.com/SimpleVictor/76946b0ddd7c6252dd4dc880d13f3aca)
17. [geist - npm](https://www.npmjs.com/package/geist)
