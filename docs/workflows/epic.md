---
title: "Workflow: the epic"
description: "Read when work needs several tickets, a new surface or an unsettled problem, or when teaching someone how a feature goes from idea to shipped: the levels, who plays each, what each writes, and the gates between them."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# The epic: a campaign

> **In one line:** an epic is a folder of tickets sharing one problem, one UX proposal and one set of technical notes. It's played in levels, each in its own thread, each ending at a gate you pass. Then every ticket gets its own build thread, and shipping updates the living UX truth.

New to the terms? See [`glossary.md`](glossary.md). The big picture and the map are in [`README.md`](README.md).

## The levels at a glance

| Level | Lead | You do | It writes | Gate |
|---|---|---|---|---|
| 0. Entry | Prompt builder | Brain dump | The Frame prompt | none |
| 1. Frame | Compass | Answer questions | `brief.md` | You say go |
| 2. Research (optional) | Fits the gap | Run the prompts | `research/<topic>.md` | Each question answered, or marked not found |
| 3. UX spec | Vesper | Answer rounds of questions | `ux/` proposals | You approve; files marked `approved` |
| 4. Technical | Mason | Ratify routed calls | `technical.md` | You ratify |
| 5. Tickets | Reeve, with Mason | Read the pre-flight | One contract per ticket | Vigil pre-flight plus `check-specs` |
| 6. Build | No role (per ticket) | Merge | Code, results, as-built | Scripts, reviewers, you |

## Every level plays the same five beats

1. **Enter with a prompt.** The builder writes the first one. After that, each level writes the next level's prompt into `prompts/NN-<stage>.md`.
2. **Load.** The level's stage file names exactly which laws and files to load: canon, the product's design file, references, the living truth for the area, research notes.
3. **Interview.** Shaping levels ask unlimited questions, in numbered rounds, each with a recommended default, so you can answer "3: keep". Nothing is invented silently. Anything left open carries a marker.
4. **Write.** One output, to a known path, from a template.
5. **Gate, then hand off.** When the gate passes, the level prints the next prompt and tells you to open a new thread.

**When to start a new thread.** Stay in one thread while you are being interviewed, because your answers are the context. Start a new one when the lead role changes, or when the output is a file someone else will use. A fresh thread is also a test: if Mason has to ask what the UX spec meant, the spec has a hole.

## The level cards

### Level 0: Entry

- **You:** brain dump into `/tk-prompt` in any thread.
- **Builder:** routes it as an epic, picks the app, proposes an epic prefix (say `OB2`), and prints the Frame prompt with its venue line.
- **First move in the Frame thread:** `yarn spec:init web OB2 onboarding-v2` creates the epic folder on the branch the operator has checked out (PR-14).

### Level 1: Frame

- **Lead:** Compass, the product strategist. Tribune or Tally can join when the customer's voice or the numbers matter.
- **Loads:** the brief template, the living truth for the area being changed, and any earlier epic on the same area.
- **Asks about:** who has the problem; why now; the appetite (how much time it's worth); what success looks like; what's out; and the knowledge gaps.
- **Writes:** `brief.md`.
- **Gate:** you say go.
- **Hands off:** research prompts, one per real gap, if any. Then the UX prompt.

### Level 2: Research (optional side missions)

Run this only when a real knowledge gap or a need for certainty exists. Examples: dashboard design patterns when there's no reference app; current privacy rules for a new data flow; how competitors handle a step.

- **Lead:** whoever fits the gap. Alembic synthesizes sources, Envoy handles user research, Chancery handles legal questions.
- **Venue:** often a general Claude thread with web research. The prompt says which.
- **Writes:** `research/<topic>.md` from the research-note template. A finding useful beyond this epic is flagged "promote to Library" and goes through the library's own procedure.
- **Gate:** each note answers its question, or says plainly what wasn't found.

### Level 3: UX spec

- **Lead:** Vesper. Support: Gloss for words in the product, Threshold for accessibility, plus anyone the brief calls for.
- **Loads:**
  - the canon and the product's design file (the global laws, then the brand's)
  - up to three references from the router
  - the states and components templates
  - the living truth for the area
  - the research notes
  - a `docs/research/` source only when nothing distilled covers the topic, and labeled as such
- **Interview:** every empty slot in the surface template is a question. Every surface needs every state, an accessibility section and criteria with IDs.
- **Writes:** `ux/` proposals that mirror the truth paths:
  - an area overview with frame, routes and a decision log (`D-OB2-1`)
  - one file per surface, at most 2,000 tokens each, split if bigger
  - in each file, `target:` naming the truth file it will replace or add
- **Gate:** you approve, and each file is marked `status: approved`. The detail test: a fresh thread could build any one surface file without asking a question. A `[NEEDS DECISION — BLOCKING]` left in a file stops any ticket that cites it.

### Level 4: Technical

- **Lead:** Mason. Support as the spec calls for: Warden for auth or personal data, Loom for AI features, Tally for instrumentation.
- **Loads:** the approved UX files, codebase conventions, the tech stack, the reviewer map.
- **Writes:** `technical.md` (or `technical/` when large):
  - placement
  - data contract
  - one-way doors
  - calls routed to you, each with a recommendation
- **Gate:** you ratify the routed calls.

### Level 5: Tickets

- **Lead:** Reeve, with Mason.
- **Writes:** one contract per ticket in `tickets/`. Each:
  - cites one surface file (the decisions and criterion IDs it builds)
  - states its slice type, non-negotiables, dev's call, planned paths and depends-on
  - lists its reviewers, computed from what it touches
  - starts at three tickets per thread, a ceiling re-measured on the first epic
- **Gate:** Vigil runs the pre-flight check, and `check-specs` validates every contract. This replaces agreeing each contract separately.
- **Hands off:** one kickoff prompt per ticket in `prompts/`, with a model recommendation and the failure mode of choosing down. `yarn status --epic OB2` shows the build order, generated from each contract's depends-on.

### Level 6: Build, once per ticket

The same as moves 2 to 5 of the one-off ([`one-off.md`](one-off.md)). You say which tickets to build ("build OB2-3 and OB2-4"), and one thread takes the batch from start to its closing report ([`stages/build.md`](stages/build.md)).

- `yarn contract:init OB2 welcome-copy` creates `OB2-3` and its FAIL results, on the operator's branch. It refuses if a cited UX file isn't approved.
- The thread proves each ticket, writes its as-built and runs the review its tier calls for; `yarn verify` runs once for the batch.
- **Merge order:** a ticket that depends on another starts once that one is built: its own criteria PASS, merged or not, reviewed or not. Tickets share the operator's branch, parallel ones included; Taylor branches and merges. Nobody waits on a merge or a review to start the next ticket.
- **Promotion:** when every ticket citing a surface file has merged, `truth:promote` copies the proposal into `specs/web/ux/`, reconciled with what actually shipped. The truth now describes the real app.

## Gates: law or judgment

| Gate | Enforced by |
|---|---|
| UX approved before tickets start | `contract:init` refuses (law) |
| No blocking decision left open | `contract:init` refuses (law) |
| Contracts well-formed and sized | `check-specs` (law) |
| The right reviewers named, by tier | `check-specs` (law) |
| Done means proven | Results written only by scripts, with run records (law) |
| The brief is worth building; the UX is right; the technical calls are right | You (judgment) |

## Who reviews what

The tier decides whether a ticket is reviewed alone (tier 2), with its batch (tier 1) or not at all (tier 0); see [`stages/build.md`](stages/build.md). For a tier 2 ticket the reviewers are computed from the files it touches, from the map in `toolkit.json`.

| Touches | Reviewer |
|---|---|
| Any tier 2 epic ticket; every tier 1 batch | Vigil |
| UI | Assay |
| Schema, migrations, package boundaries, public API | Mason |
| Auth, secrets, personal data | Warden |
| A new surface or interactive component | Threshold |
| Consent, terms, billing copy | Chancery |

Vigil and Assay run as subagents. The others get a written review prompt in the ticket folder, which you run in a new thread.

## Version two of anything

"Onboarding v2" is a new epic (`OB2`). Its Frame reads the current truth as the starting point, and its `ux/` holds only the files it changes. As its tickets ship, those files replace the truth. Version one stays in git history and in the earlier epic's folder.

## Explain it back

> "An epic is a campaign in levels. The builder opens it. Compass frames the problem and appetite, optional research fills real gaps, Vesper interviews me into a UX proposal held to our design laws, Mason works out the technical calls, and Reeve cuts it into tickets that each cite one surface. Every level runs in its own thread and hands me the next prompt. Then each ticket builds in its own thread, proves itself with scripts, gets reviewed by whoever its risk calls for, and once merged its UX proposal becomes the living truth."
