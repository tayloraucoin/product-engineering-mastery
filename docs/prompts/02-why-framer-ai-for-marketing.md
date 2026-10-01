---
title: Prompt 02 — Why Framer AI is (or isn't) ideal for marketing sites
description: Paste into a new general thread to re-investigate the marketing-site builder and the marketing/app boundary. Its run is archived at docs/research/02-framer-marketing-sites-vitrine.md.
layer: prompts
status: adopted
thread: "02"
role: Vitrine
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 02 — Why Framer AI is (or isn't) ideal for marketing sites

**Model:** Opus
**Inject:** Vitrine (Lead Web Designer) — marketing and portfolio sites are Vitrine's genre, not Vesper's.
**Attach:** `00-shared-context`, the Vitrine role prompt, textbook Part 3.2 (the row on Framer AI, flagged "not re-verified").
**Expected output:** an investigation report that either confirms Framer as the sanctioned marketing-site tool for my two products and my side hustle, or names what beats it — with the boundary between marketing site and product app made explicit.

---

Vitrine — you're on this one. Read your role prompt and the shared context first.

**The decision this serves.** DealReady needs a marketing site that a non-engineer can edit after I hand it off, Fybr's self-serve product needs a landing and pricing surface that converts operators who arrive from a Google search, and I run a website side hustle (Durable for local trades, a coded track for creative portfolios) where tool choice is margin. The textbook marked Framer AI as the marketing-site standard ("★ for marketing") but did not re-verify it. I want the claim tested, not repeated.

**The ask.**

1. What Framer is today, verified on Framer's own docs, pricing, and changelog with dates: the AI features actually shipped (generation, the reasoning toggle, localization, anything since June 2026), the CMS, the hosting and performance story, the collaboration model, the export or lock-in reality, and the pricing tiers as of this month.
2. Why marketing sites are a different genre from product UI, in your terms — the thirty-second test, the two-bars test, the editability test — and which of those Framer serves better than a coded Next.js site, and which it serves worse. Be concrete about performance on a mid-range phone and about what a non-technical owner can and cannot change without breaking the system.
3. The competitive set, honestly: Webflow, a coded site with a headless CMS, Wix Studio, Squarespace, and anything AI-native that entered the category in 2026. One paragraph each on where they beat Framer, with evidence. Vendor comparison pages are feature facts, not verdicts.
4. The boundary ruling: when does a "marketing site" stop being one and become a product surface that belongs in the app repo (pricing page with live plan logic, an interactive calculator, a self-serve signup that touches the product's auth)? I need the line drawn so the DealReady team doesn't build product flows in a site builder.
5. The verdict per use case: DealReady marketing site, Fybr self-serve landing and pricing, and the side hustle's two tracks. Tool, why, monthly cost, what a handoff to a non-technical editor looks like, and the exit criteria.

**Evidence rules.** Framer's own pages are primary. Third-party "Framer vs. X" content is secondary and named. Performance claims need a measurement or a named source. Date everything about pricing and features.

**Output shape.** Verdict paragraph; the Framer fact sheet; the genre argument; the competitive set; the boundary ruling; the per-use-case verdict as a table; sources with dates. Run your convergence tests — the thirty-second, two-bars, template, and editability tests — against Framer's actual output where you can see examples, and say what you found.

**Done means** I can choose the tool for each of the three use cases this week and explain the choice to a client in their language, and the DealReady team has a written line between marketing site and product.

**Not wanted:** "it depends," a feature grid with no judgment, or a recommendation that ignores what the owner can edit after I'm gone.
