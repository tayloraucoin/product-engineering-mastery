---
title: Prompt 01 — Paper vs. Figma vs. alternatives, and where Cursor Design Mode fits
description: Paste into a new general thread to re-open the tool-per-loop ruling (canvas, code, polish tools). Its run is archived at docs/research/01-tools-per-loop-plumb.md.
layer: prompts
status: adopted
thread: "01"
role: Plumb
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Prompt 01 — Paper vs. Figma vs. alternatives, and where Cursor Design Mode fits

**Model:** Opus
**Inject:** Plumb (Design Director) — this is a workflow ruling, and Plumb owns which tool is sanctioned for which loop.
**Attach:** `00-shared-context`, the Plumb role prompt, textbook Part 3.2 and Part 4 (the tool tables and the workflow recipes).
**Expected output:** an investigation report ending in a workflow ruling: tool per loop, per product, with the source-of-truth rule and the exit criteria for each tool.

---

Plumb — you're on this one. Read your role prompt and the shared context first; everything below assumes them.

**The decision this serves.** I am about to write the official design workflow for two products (DealReady, Fybr) and for my own toolkit, and I need to know which canvas tools earn a place in it and in which loop. The prompt lottery is real: I lost the tactile craftsman loop when I moved to prompting, and I want to know which tool gives it back — for divergence, and separately for polish — without breaking the rule that code is the source of truth. This report decides what I install, what I pay for, and what I tell the DealReady team to use.

**What I already hold.** The September textbook's read: Figma has shifted to a canvas for exploration and polish feeding Claude Code; the Figma MCP is two-way (Code to Canvas since February 2026, `generate_figma_design`); Claude Design launched April 17, 2026 with a Claude Code handoff; Paper is an agent-native HTML/CSS canvas with an MCP link (alpha, ~$20/mo, $34M Series A July 2026); Pencil keeps `.pen` JSON in Git with a local MCP; Subframe is deterministic React/Tailwind codegen at $29/editor; Stitch 2.0 has DESIGN.md and an infinite canvas; Cursor Design Mode (Cursor 3, April 2026; 3.7 in June added multi-select and voice) lets me point, draw, or speak at the running app and is "an iteration tool, not a generation tool." Treat all of that as a hypothesis to verify, not a finding to repeat.

**The ask.**

1. For each of Figma (Design + MCP + Make), Paper, Pencil, Subframe, Claude Design, Stitch, and Cursor Design Mode: what it is *today*, verified against the vendor's own docs and changelog with dates; where its source of truth lives (its file format, Git, my repo, a vendor cloud); how it enters and exits code (what an agent can read, what it can write, what round-trips); pricing and metering as of this month; and its maturity (GA, beta, alpha) with the evidence.
2. Map each tool to the three loops. Which are credible for divergence (side-by-side comparison of many directions), which for polish (direct manipulation of a real build), and which for neither. Be specific about *what* is manipulated in the polish tools — DOM of the running app, a proxy canvas, or a file — because that decides whether polish lands in code.
3. Cursor Design Mode in particular: what exactly it can change, how it writes back, what it cannot do (generation, layout exploration, non-React stacks), and whether it replaces or complements Figma-as-scalpel for the polish loop. If there is a credible claim that it closes the tactile gap, test the claim against my two products' stacks.
4. Name the tools I should ignore for now and why, in one line each. Include anything noteworthy that entered the market after August 2026 that the textbook missed.
5. The ruling: for each product, tool per loop, the source-of-truth rule, the exit criteria that would make me switch, and the cost per month. Where two tools are close, pick one and say what would change your mind.

**Evidence rules.** Vendor docs and changelogs are primary. Vendor comparison pages (Subframe on Pencil, Paper on Pencil) are feature facts, never verdicts. Practitioner write-ups are secondary and named. Anything you cannot verify this month is marked as such. Do not restate the textbook back to me; extend it or correct it.

**Output shape.** A report with: a one-paragraph verdict up top; the per-tool section (fact table plus a short judgment); the loop map as a table; the Cursor Design Mode section; the ignore list; the ruling per product; sources with dates. Run your convergence tests before shipping — especially the loop test and the enforceability test — and say which you ran.

**Done means** I can write `docs/design/workflow.md` from your ruling without opening another tab, and I know what each tool costs me in money and in source-of-truth risk.

**Not wanted:** a neutral buffet of seven tools, marketing adjectives, pricing without dates, or a recommendation that puts the source of truth in a vendor's file format without saying so out loud.
