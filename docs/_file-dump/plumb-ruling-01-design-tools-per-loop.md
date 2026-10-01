---
title: Plumb ruling 01 — design tools per loop (DealReady, Fybr, personal kit)
owner: Plumb (Design Director)
status: ruling, ready to lift into docs/design/workflow.md
evidence_as_of: 2026-09-30
prompt: prompts/01—paper-vs-figma-vs-alternatives-and-cursor-design-mode.md
---

# Plumb ruling 01 — design tools per loop

Evidence labels used throughout: **[V]** verified against the vendor's own docs, pricing page, changelog, or staff statement, dated · **[S]** secondary, source named · **[J]** my judgment · **[NF]** not found / could not verify this month · `[ASSUMPTION: …]` repeated in the sign-off.

---

## Verdict

The textbook's central hypothesis is wrong on the point that matters most: **Cursor Design Mode does not give the tactile loop back.** In Cursor 3 it is a way to *point* at the running app so an agent knows which element you mean; the agent still edits the code. The direct-manipulation sidebar that Cursor 2.2 shipped (sliders, color pickers, drag) did not survive into Cursor 3, and Cursor staff have confirmed it is gone. So the polish loop has no sanctioned tool that is both tactile and lands in code. The ruling is: **code stays the only source of truth; divergence gets one tactile canvas (Paper), used as a disposable view; polish is done in code with DevTools-measured values, and Onlook gets a one-week trial as the only candidate that writes direct manipulation straight to source.** Figma drops out of the paid kit — Code to Canvas works from any seat into drafts, which covers the one job it still does uniquely. Claude Design is permitted as a sketching surface for non-builders (Kurt, Mike), never as a loop tool. Total new spend for you: about $16–20/month (Paper Pro), plus whatever you already pay for Claude.

---

## 1. Per-tool facts

### Figma (Design + MCP + Make)

| | |
|---|---|
| What it is today | Canvas plus a remote MCP server with three relevant capabilities: read design context; **write to canvas** via `use_figma` (agent runs JavaScript through the Plugin API to create native frames, components, variables, auto layout); and **Code to Canvas** via `generate_figma_design` (captures live UI from a browser into editable Figma layers). [V, developers.figma.com, fetched 2026-09-30]. In-Figma AI agent in beta since 2026-05-20 [S, TechCrunch 2026-05-20; Flowstep]. |
| Source of truth | Figma's cloud, Figma's file format. |
| Code in / out | In: `generate_figma_design` from a running app; `use_figma` writes from any MCP client (Claude Code is on the supported list). Out: design context to agents, Code Connect mappings. Round-trip is documented by Figma as code → canvas → code. [V] |
| Seats and metering | Code to Canvas: *any seat* can create or edit files in drafts, and the tool is exempt from standard MCP rate limits [V, Figma "Code to canvas" and "Tools and prompts" docs]. Write to canvas needs a **Full seat**; free during beta, Figma says it will become **usage-based paid** [V, Figma help center and developer docs]. Reading via MCP needs Dev or Full seat for real use; View/Collab seats capped at 6 calls/month [S, Hedrick 2026-07; usecarly]. |
| Pricing (Sept 2026) | Professional: Full $16/mo annual, $20 monthly; Dev $12/$15; Collab $3/$5. AI credits enforced since 2026-03-18; Figma Make requests cost ~30–100+ credits each [S, uxmagic 2026-09-25; PageDog 2026-09; bilt.me 2026-09]. Did not fetch figma.com/pricing directly — [S]. |
| Maturity | Canvas GA. MCP read side in beta since June 2025; write to canvas beta; Figma agent beta; Make GA inside the credit pool [S, uichemy 2026-09]. |
| Recent (post-August) | 2026-09-16/17 Weave tools on canvas; 2026-09-25 vertical wrap in auto layout; 2026-09-30 community "riffs" [V, figma.com/release-notes]. Nothing that changes this ruling. |

**Judgment [J]:** Figma is still the best *canvas* for hand manipulation, but every edit made there lands in Figma's format and must be translated again. Its unique value for us is narrow — letting a stakeholder who lives in Figma comment on captured states — and Code to Canvas covers that for free in drafts. Write-to-canvas is a future metered bill on a Full seat for a capability we don't need, since our components live in code.

### Paper

| | |
|---|---|
| What it is today | Design canvas where every element is real HTML/CSS; web app plus Paper Desktop; MCP server that reads and writes the open file (create artboards, write HTML, update styles, screenshot, return JSX/Tailwind of a node) [V, paper.design/docs/mcp, fetched 2026-09-30; tool count of 24 is S, uithings]. |
| Source of truth | Paper's cloud (app.paper.design). The *content* is HTML/CSS, so exit cost is low, but the file is not in your repo. |
| Code in / out | Out: agent reads a selected frame and builds it in your stack. In: agent writes HTML into the canvas; Paper documents pulling tokens from Figma and content from Notion via MCP. No documented automatic sync from a repo's components [NF]. MCP requires Paper Desktop running (stdio via `paper mcp`) [V]. |
| Pricing | Free: unlimited editors and viewers, 100 MCP calls/week. Pro: **$20/editor/month, $16 on annual**, 1M MCP calls/week. Organizations (SSO, admin): contact sales [V, paper.design/pricing, 2026-09-30]. |
| Maturity | The pricing page no longer carries an alpha label; I could not find a dated GA announcement [NF]. $34M Series A led by Accel and ICONIQ announced 2026-07-23 [S, Value Add VC; Accel's own post is V]. Founder Stephen Haney previously built Modulz/Radix UI [V, Accel]. Named production users on its pricing page include Vercel, Ramp, PostHog, Lovable [V]. |

**Judgment [J]:** The only canvas where hand manipulation and agent writes share the same primitive the product ships in (DOM + CSS). That makes it the right divergence canvas: directions can be compared side by side, pushed by hand, and the chosen one travels to code with little translation loss. It fails the source-of-truth rule if used as anything but a view — so it is sanctioned as disposable.

### Pencil (now pen.dev)

| | |
|---|---|
| What it is today | Canvas whose `.pen` files are JSON, live in your repo, and are read/written by agents through a **local** MCP server; runs in the IDE or desktop [V, docs.pencil.dev]. Rebranded to pen.dev [S, uxmagic 2026-09-25; The Rundown 2026-08]. |
| Source of truth | Your Git repo (the `.pen` file). Collaboration is Git-only [V, docs]. Variables sync two-way with CSS [V, docs]. |
| Pricing | Free; pricing page says paid plans will be announced before any charge [S, itechguides checked 2026-09-20; uxmagic]. |
| Maturity | Rebrand churn; app source not public though the format is open [S]. |

**Judgment [J]:** Closest to the letter of "files the team owns," but a `.pen` file beside the components is a **second source of truth in the same repo**, which is the exact failure Plumb exists to prevent. Watch, don't adopt.

### Subframe

| | |
|---|---|
| What it is today | Visual editor that produces deterministic React + Tailwind + TypeScript on Radix; CLI syncs components into your project; MCP for agents [V, subframe.com's own pages; S, Banani 2026-02]. |
| Source of truth | Subframe's cloud, synced into the repo by CLI. |
| Pricing | Free tier; Pro **$29/editor/month** with unlimited AI [V, subframe.com tips page; S, uxmagic 2026-08]. |

**Judgment [J]:** It wants to own the component layer. We already own ours (shadcn/Radix pattern in code). Two component authorities is drift by design.

### Claude Design

| | |
|---|---|
| What it is today | Anthropic Labs canvas launched 2026-04-17; overhauled 2026-06-17 with design-system import from GitHub or files, **`/design-sync`** in Claude Code to pull a local repo's design system in, **`/design`** to create/edit/sync design projects from the terminal, a direct layout editor, and more exports [S, VentureBeat; The New Stack; letsdatascience 2026-06]. Still labelled beta/research preview [S, technobezz; agence-scroll 2026-09-23]. |
| Source of truth | Anthropic's cloud. The design system it uses is imported *from* your repo, which is the right direction. |
| Pricing | Included in Pro and above; draws from the **same usage pool** as chat and Claude Code [V, claude.com/pricing, fetched 2026-09-30]. Earlier reviews reporting a separate weekly Design allowance are out of date. |

**Judgment [J]:** Strong at producing a plausible screen from a sentence, weak at the thing you asked for (tactile control). Its real value to you is organizational: Kurt and Mike already have Claude, and `/design-sync` means their sketches start from your tokens rather than the internet's. Cost is invisible but real — it eats the same pool your Claude Code runs on.

### Google Stitch

| | |
|---|---|
| What it is today | Google Labs AI canvas (infinite canvas, design agent, voice) relaunched 2026-03-18; DESIGN.md format; MCP server and SDK [V, blog.google 2026-03-18]. DESIGN.md draft spec open-sourced 2026-04-21 [V, blog.google]. Real-time Stitch Agent announced at I/O, May 2026 [S, pasqualepillitteri]. |
| Source of truth | Google's cloud; DESIGN.md exportable. |
| Code out | HTML/CSS/Tailwind confirmed; React export status conflicts across sources (some say shipped, one May 2026 review says roadmap-only) [S; NF for a primary statement]. Official skills repo includes a React components conversion skill [V, github.com/google-labs-code/stitch-skills]. |
| Pricing | Free with generation limits, Labs beta [S, multiple, latest checked 2026-08-28]. Paid plans rumoured for Q4 2026 [S, unconfirmed]. |

**Judgment [J]:** Free divergence with generic output. The artifact worth taking is the **DESIGN.md spec**, read once for compatibility — but note our `DESIGN.md` is a governing law with examples and counter-examples; Stitch's is a token/rules file for generation. Same name, different job; don't let one overwrite the other.

### Cursor Design Mode

Covered in its own section (§3). Facts summary:

| | |
|---|---|
| What it is today | Overlay in the Agents Window browser: click an element, multi-select, draw on a frozen frame, or narrate by voice; the agent receives element identity (xpath, component, attributes, computed styles, **props from the React fiber tree**) plus a screenshot, then edits the code; app hot-reloads [V, cursor.com/docs/agent/design-mode, 2026-09-30]. |
| Versions | Introduced Cursor 3, 2026-04-02; multi-select, voice, and Design Mode in canvases in 3.7, 2026-06-04/05 [V, cursor.com/changelog]. |
| Direct manipulation | **Removed.** Staff confirmed on 2026-04-06 that the 2.2 Visual Editor's property sidebar was not carried into Cursor 3's Design Mode; a staff reply in August says the remaining CSS inspector panel was removed in release 3.12; feature-request threads still open as of 2026-09-25 [V, forum.cursor.com staff replies]. |
| Pricing | Pro $20/mo, Pro+ $60, Ultra $200, Teams $40/user; usage billed against pools [S, several, Sept 2026]. |
| Vendor change | Anysphere became a SpaceX subsidiary on 2026-08-14 (SpaceXAI division) [S, Techzine; Wikipedia citing 8-K]. OpenAI announced it would stop providing models to Cursor [S, Wikipedia/Techzine]. |

---

## 2. Loop map

| Tool | Divergent (compare many directions) | Convergent (make one real) | Polish (last 10% of feel) | What is manipulated |
|---|---|---|---|---|
| Code + Storybook stories (Recipe A step 3) | **Yes — default** | **Yes — only place** | Yes, by hand | Source files |
| Paper | **Yes — sanctioned canvas** | No | No — edits land in Paper, not the app | Proxy canvas (HTML/CSS in Paper's cloud) |
| Figma Design | Credible, but output is Figma-format | No | No as a scalpel for us — edits need re-translation | Proxy canvas (Figma format) |
| Figma Code to Canvas | No — capture only | No | No | Snapshot of rendered DOM into Figma layers |
| Claude Design | Sketching only (non-builders) | Handoff to Claude Code | No | Proxy canvas (Anthropic cloud) |
| Stitch | Credible but generic | No | No | Proxy canvas (Google cloud) |
| Pencil / pen.dev | Credible | No | No | A file in the repo (`.pen`), not the app |
| Subframe | Credible within its own components | Yes, but in its component system | Partial | Its own component model, synced to code |
| Cursor Design Mode | No — it cannot generate layouts to compare | Assists (targets edits) | **Pointer only** — agent writes the change | Running app's DOM, as *context* for an agent |
| Onlook (trial) | No | No | **Candidate** — visual edits written to source | Running React+Tailwind app, instrumented to map DOM to source [S, Onlook README; opensourcealternatives 2026-09-20] |

The polish column is the finding. Only two things on this list change the running build directly: you with a text editor, and (unverified for your stacks) Onlook.

---

## 3. Cursor Design Mode, specifically

**What it can change.** Anything an agent can change in the code behind the element you selected. You supply the target (click, multi-select, drawn region) and the intent (typed or spoken); Cursor supplies element identity and a screenshot [V].

**How it writes back.** Through the agent, as ordinary code edits, then hot reload. There is no value you set directly; every tweak is a prompt and a model round-trip [V]. Cursor recommends its fast Composer 2.5 model for this loop [V].

**What it cannot do.**
- Set a value by hand (no sliders, pickers, or numeric fields in Cursor 3) [V, staff replies].
- Generate or compare layout directions — it iterates on what is already rendered [V, doc framing].
- Work outside the Agents Window browser [V, forum staff reply].
- Identify components as well outside React: the "props from the fiber tree" signal is React-specific; other frameworks get xpath, attributes, and computed styles only [V for the React signal; J for the degradation].
- See into a WebGL canvas. A map is one `<canvas>` element to the DOM; you can point at the map container, not at a stockpile polygon or a label layer [J].

**Replace or complement Figma-as-scalpel?** Neither, really. It replaces the *element-identification* step of prompting ("the second button in the header") — a real saving — but it is still the prompt lottery with a better aim. Figma-as-scalpel is tactile but lands in the wrong place. Neither closes the loop you lost.

**Tested against your stacks.** `[ASSUMPTION: both products are TypeScript + React (Next.js or Vite) + Tailwind with shadcn/Radix-pattern primitives; Fybr's map is a WebGL renderer such as MapLibre/Mapbox GL or deck.gl.]`
- *DealReady* (dense tables, keyboard-first): Design Mode helps for "make this column's numerals tabular and right-aligned" style fixes — pointing beats describing in a 40-column table. It does not help with density tuning, where you want to drag a row height and watch 200 rows reflow; that is a value you want to set, not a sentence you want to write. [J]
- *Fybr* (map-first): useful for the panels, readouts, and toolbars around the map; useless for the map itself. Map polish (layer colors, label halos for glare, line widths) lives in the map style JSON, and is best tuned in a style editor against the running map. [J]
- *Your practice:* you are moving to Claude Code as your main driver [from your own notes, Aug 2026]. Design Mode requires working in Cursor's Agents Window. Keeping a $20/month editor for a pointer is a weak case, and the August change of ownership plus OpenAI's model withdrawal add vendor risk you don't need to take on for this feature. [J]

**Is there a credible claim it closes the tactile gap?** The claims I found are from before the sidebar was removed or conflate Design Mode with the 2.2 Visual Editor. Cursor's own forum shows users making the opposite claim in August–September 2026. **Not credible as of this month.**

---

## 4. Ignore list (for now)

- **Subframe** — a second component authority beside our shadcn primitives; $29/editor.
- **Pencil / pen.dev** — puts a second source of truth in the repo; pricing undefined; revisit if it ships component import from code.
- **Stitch** — generic output and Google-cloud source of truth; read the open DESIGN.md spec once, don't install.
- **Figma Make** — prompt-to-app inside a credit pool; duplicates Claude Code at a worse price.
- **Figma's in-canvas agent** — beta, destined for metered credits, and it makes things that live in Figma.
- **Figma write-to-canvas (`use_figma`)** — needs a Full seat and becomes a paid API; we don't keep components in Figma.
- **Glue (YC W26, open-source agent canvas)** — too early to judge [S, YC listing]; watch.
- **Cursor Design Mode as a sanctioned tool** — not ignored, demoted: allowed if you are already in Cursor, never required.

**New since August 2026 that the textbook missed:** Cursor's acquisition by SpaceX (closed 2026-08-14) and OpenAI's model withdrawal; the Cursor 3 removal of the CSS inspector (confirmed by staff, Aug 2026); Figma's Weave-on-canvas (2026-09-16/17). No new canvas entrant this quarter changes the ruling.

---

## 5. The ruling

### The source-of-truth rule (both products, and your kit)

> Tokens, components, and Storybook stories in the product repo are the design system. Every canvas is a view. Nothing on a canvas is reviewed, approved, or referenced by a brief until it exists as a story or route in a PR. Canvas files are disposable and are never linked from `DESIGN.md` as authority.

Enforceable by: PR template field "story or route link required for any UI decision"; Assay's rubric scores only rendered builds; Plumb rejects any ruling request that cites a canvas file.

**Data rule (DealReady first, Fybr too):** no real data-room documents, deal names, or client survey data go into a vendor canvas (Paper, Figma, Claude Design, Stitch). Divergence uses seeded fixtures. Paper's MCP makes pulling real content easy; that is exactly why the rule is written down. [J]

### Tool per loop

| Loop | DealReady | Fybr | Personal kit / side work |
|---|---|---|---|
| **Divergent** | Default: 3 directions as Storybook stories in code, with fixture data at real density. Tactile canvas: **Paper**, for pushing a direction by hand before it becomes a story. | Same default for panels and flows. Map directions are prototyped against the real map in code, not on any canvas (no canvas renders your map layers). | Paper. |
| **Capture (optional, Recipe A step 4)** | Share preview-deploy URLs of the stories. Use Figma Code to Canvas into drafts **only** if a named reviewer works in Figma — free on any seat. | Same. | Same. |
| **Convergent** | Claude Code (primary), against tokens and `@/components/ui` only. | Same. | Same. |
| **Polish** | By hand in code, values measured in browser DevTools, then written to tokens or component props. **Trial Onlook for one week** (see exit criteria). | Chrome and panels: as DealReady. Map: tune the style JSON in a map style editor against the running map `[ASSUMPTION: MapLibre/Mapbox stack]`. | Same. |
| **Stakeholder sketching** (not a loop) | Kurt may use **Claude Design** with `/design-sync` run against the repo, so sketches start from our tokens. Output is an input to a brief, never a spec. | Mike, likewise — it matches how he built the prototype and your goal of him iterating after you. | — |

### Cost per month (as of 2026-09-30)

| Item | Cost | Who pays |
|---|---|---|
| Paper Pro | $16 (annual) or $20 (monthly) per editor | You; one seat. DealReady/Fybr buy seats only if their engineers adopt it. |
| Figma | $0 (Starter; Code to Canvas works into drafts on any seat) | Upgrade to Professional Full ($16/$20) only when a stakeholder needs shared files. |
| Claude Design | $0 incremental; draws from existing Claude plan usage | Already paid. Watch the shared pool. |
| Onlook trial | $0 (open source) | — |
| Cursor | $0 required; $20 Pro if you keep it for other reasons | Optional. |
| Pencil, Stitch, Subframe | $0 — not adopted | — |

### Exit criteria (what would make me switch)

- **Paper → Figma** as the divergence canvas: Paper's MCP becomes metered below ~1M calls/week, it adds a proprietary component layer we'd have to maintain, or a DealReady stakeholder base standardizes on Figma and comments there weekly.
- **Paper → Pencil**: pen.dev can import our real components from code *and* round-trips edits back as component props — i.e., stops being a second source of truth.
- **Hand polish → Onlook**: in the one-week trial on one DealReady table screen and one Fybr panel, ≥80% of polish edits land as clean diffs using existing tokens (no raw values, no new classes outside the scale), and nothing breaks HMR or routing. Fail either and it's out.
- **Hand polish → Cursor Design Mode**: Cursor restores direct value controls (the removed inspector) *and* edits land as token-aware diffs.
- **Claude Design promoted to a loop tool**: it can render our actual Storybook components (not approximations) and its handoff produces a PR that passes Assay first round more often than a code-first story does. Also drop it entirely if stakeholder sketching measurably drains the Claude pool your builds depend on.

**Where two tools were close:** Paper vs. Figma for the divergence canvas. I picked Paper because its primitive is the DOM, its MCP writes are bundled rather than a future metered API, and it costs the same as a Figma Full seat. The cost of being wrong is small — it's a view, and a subscription you cancel.

---

## 6. Convergence tests run

- **Loop test** — every tool now sits in one loop, and the polish loop is explicitly in code. Passed, with the known gap (no sanctioned tactile polish tool) named rather than papered over.
- **Enforceability test** — the source-of-truth rule is enforced by the PR template, Assay's rubric scoring only rendered builds, and the data rule by review. Passed. The Claude Design "sketch, not spec" rule is enforceable only by review — weakest link, named.
- **Swap test** — the ruling is specific to this situation: DealReady's confidentiality drives the data rule; Fybr's WebGL map drives the separate map-polish path; your move to Claude Code drives Cursor's demotion. Passed.
- **Displacement test** — adding Paper displaces Figma from your paid kit and displaces Cursor from the required kit. Net tools required: Claude Code, Paper, code. Passed.
- **Agent-readability test** — an agent given this file knows where directions are built (stories), what it may read from Paper (frames, via MCP), and what it must not treat as authority (any canvas). Passed.
- Not run: **dialect** and **example** tests — this is a workflow ruling, not a design-layer amendment.

---

## Assumptions (sign-off)

- `[ASSUMPTION: both products are TypeScript + React (Next.js or Vite) + Tailwind with shadcn/Radix-pattern primitives and Storybook as the catalog.]` If DealReady's front end is not React, Design Mode and Onlook both degrade and the Onlook trial is void.
- `[ASSUMPTION: Fybr's map renders through a WebGL library (MapLibre/Mapbox GL or deck.gl) with a JSON style.]` If it's a different renderer, the map-polish path changes; the rest holds.
- `[ASSUMPTION: no DealReady or Fybr stakeholder currently requires Figma for review.]` If one does, add a single Figma Professional seat for that capture step only.
- `[ASSUMPTION: you already hold a Claude plan that includes Claude Design.]`

## Open items

- `[PROPOSED — needs sign-off]` Onlook trial, one week, on one DealReady table and one Fybr panel; cost of being wrong is a week of polish done the slow way.
- Stitch React export status: no primary statement found [NF].
- Paper's current maturity label: no dated GA announcement found [NF].

---

## Sources (accessed 2026-09-30 unless dated otherwise)

**Primary (vendor)**
- Cursor — Design Mode docs: https://cursor.com/docs/agent/design-mode
- Cursor — Browser docs: https://cursor.com/docs/agent/tools/browser
- Cursor — Changelog, Design Mode Improvements (3.7, 2026-06-05): https://cursor.com/changelog/design-mode-improvements
- Cursor — Changelog, Canvas Design Mode (3.7, 2026-06-04): https://cursor.com/changelog/canvas-improvements
- Cursor forum — "Where's Design mode sidebar?" staff reply (2026-04-06): https://forum.cursor.com/t/where-s-design-mode-sidebar/156841
- Cursor forum — "Design Mode has stopped working!" staff reply on 3.12 removal (2026-08-14): https://forum.cursor.com/t/design-mode-has-stopped-working/168352
- Cursor forum — open request thread (2026-09-25): https://forum.cursor.com/t/cursor-design-mode/172997
- Figma — Code to canvas: https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/
- Figma — Tools and prompts: https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- Figma — Write to canvas: https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/
- Figma — Get started with the MCP server (beta pricing note): https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server
- Figma — Release notes (through 2026-09-30): https://www.figma.com/release-notes/
- Figma — "Agents, meet the Figma canvas": https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/
- Paper — Pricing: https://paper.design/pricing
- Paper — MCP docs: https://paper.design/docs/mcp
- Accel — Investment in Paper (2026-07): https://www.accel.com/news/our-investment-in-paper-the-ai-native-design-space
- Pencil — Core concepts and AI integration: https://docs.pencil.dev/core-concepts · https://docs.pencil.dev/ai-integration
- Subframe — React UI builders page (pricing): https://www.subframe.com/tips/best-react-ui-builders
- Anthropic — Claude pricing (shared usage pool, Claude Design on paid plans): https://claude.com/pricing
- Google — Stitch "vibe design" (2026-03-18): https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/
- Google — DESIGN.md open-sourced (2026-04-21): https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/
- Google Labs — stitch-skills repo: https://github.com/google-labs-code/stitch-skills

**Secondary (named)**
- VentureBeat — Claude Design overhaul (2026-06): https://venturebeat.com/technology/anthropic-ships-major-claude-design-overhaul-with-design-system-imports-code-round-trips-and-a-fix-for-its-token-burning-problem
- The New Stack — Claude Design overhaul (2026-06): https://thenewstack.io/anthropic-claude-design-overhaul/
- Value Add VC — Paper Series A (2026-07-23): https://valueaddvc.com/pulse/paper-34m-series-a-ai-design-platform-2026
- uxmagic — Figma pricing (2026-09-25): https://uxmagic.ai/blog/figma-pricing
- uxmagic — Pencil/pen.dev review (2026-09-25): https://uxmagic.ai/blog/pencil-dev-review
- itechguides — pen.dev (facts checked 2026-09-20): https://www.itechguides.com/products/pen-dev/
- Hedrick — Figma for developers, MCP limits (2026-07): https://hedrick.io/post/figma-for-developers
- uichemy — Figma AI credits and agents (2026-09): https://uichemy.com/blog/figma-ai-credits/
- TechCrunch — Figma agent (2026-05-20): https://techcrunch.com/2026/05/20/figma-adds-an-ai-assistant-to-its-collaborative-canvas/
- Techzine — SpaceX completes Cursor acquisition (2026-08-14): https://www.techzine.eu/news/devops/143619/spacex-completes-acquisition-of-cursor/
- Cursor pricing roundups (Sept 2026): https://www.opslyft.com/blog/cursor-pricing-2026
- Onlook listing (last verified 2026-09-20): https://www.opensourcealternatives.to/item/onlook
- YC — Glue (W26): https://www.ycombinator.com/companies/glue
- Pasquale Pillitteri — Stitch at I/O 2026 (2026-05): https://pasqualepillitteri.it/en/news/2964/google-stitch-agent-real-time-design-io-2026
