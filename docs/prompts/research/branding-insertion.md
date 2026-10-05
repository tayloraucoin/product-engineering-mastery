---
title: "P-K — Branding insertion: how a company's brand enters the toolkit"
description: "Commission after P-C's first surface exists, to settle where brand primitives, semantic roles, fonts, assets and the marketing register live, so a product repo ports its brand in one ordered pass."
layer: prompts
status: draft
thread: P-K
role: Plumb
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when:
---

# P-K — Branding insertion (general Claude thread, then Claude Code)

**Venue:** general Claude thread for the ruling, Claude Code in `~/lighthouse/product-engineering-mastery` for the build. **When:** after P-C has built one real surface, so tokens are designed for a component that exists (Crucible, audit day). **Model:** deepest available. **Inject:** Plumb captains the law; Turner builds. **Attach:** `docs/prompts/shared-context.md`, both role prompts, `docs/design/canon.md`, `docs/design/templates/DESIGN.template.md` and `tokens.template.md`, `packages/config/tailwind/preset.css`, `packages/config/eslint/tokens.js`, Turner's audit-day review (changelog, "Audit day").

**Decision served.** One ordered path by which a product's brand enters the system, with the canon as the floor and the token lint keeping literals out.

**What Turner found (2026-10-02).** The toolkit has one entry for colour (ten roles, one radius, dark by `prefers-color-scheme` only) and none for type, spacing, elevation, motion, fonts or assets; the lint bans defaults it offers no replacement for. Of the three product repos, conscious-connections has a three-layer token model with 176 arbitrary utilities beside it, synapse has the cleanest layering with raw-scale utilities leaking, and taylor-aucoin holds everything in one 573-line `globals.css` with literals in 219 of 284 files.

**Ask.**

1. Rule, as Plumb: OKLCH or not; the names of the elevation, motion, spacing, radius and text-style roles; class-based dark (`@custom-variant dark`, a `ThemeProvider`) versus media; whether a marketing register may use gradients (A-02) and which display fonts need an A-01 reason recorded. Each ruling is a ledger line.
2. Build, as Turner: `packages/config/brand.css` (brand primitives only, never exposed to Tailwind); `preset.css` (semantic roles only, `:root` and `.dark`, a reduced-motion block per C-P11); `packages/config/brand.ts` (name, manifest and OG colours, read by `manifest.ts`, `opengraph-image.tsx` and email); the font seam in `apps/<app>/app/layout.tsx`; `docs/design/tokens.md` and `DESIGN.md` filled for the demo.
3. Write the port step, as Usher reviews it: the order a product fills these in, in `docs/runbooks/port.md`, and the mapping for each of the three repos (keep, move, delete), timed.
4. Record which decisions stay with Plumb and which a product may take locally.

**Evidence rules.** Measure, do not describe: the token lint runs clean on `apps/web` and `packages/ui`; every state renders light and dark with reduced motion; contrast ratios are recorded per role as taylor-aucoin's `DESIGN-SYSTEM.md` does. Vendor docs are dated feature facts.

**Done.** One brand enters through the named files in the named order; the lint passes; the three repos' mappings are written; the ledger carries the rulings.

**Not wanted.** A theme switcher before a surface needs one; tokens designed for no component; a second home for any value `brand.css` already holds.
