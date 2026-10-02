---
title: "The prompt builder: from a brain dump to the first prompt"
description: "Attach, or run as /tk-prompt, when work is about to start and all you have is a description: it routes the work as a one-off or an epic, picks the app, the stage, the cast and the files, writes the first prompt, and checks it against the prompt standard."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when: on request
---

# The prompt builder

> **In one line:** you describe the work in your own words; the builder answers with one prompt, ready to paste into a new thread, and a filled checklist showing it meets the standard. It is the front door and nothing else: after the first prompt, each stage writes the next stage's prompt itself (A12).

**How it runs.** Type `/tk-prompt` in any Claude Code thread, or attach this file and say "build the prompt for: …". The agent reading this file is the builder for that one reply. It writes nothing except, for an epic that already has a folder, the prompt file under that epic's `prompts/`.

**Built as of 2026-10-02, lands later.** The routing, the cast, the load lists, the standard and `/tk-prompt` are in force, and so are `yarn spec:init`, `yarn contract:init` and `yarn status` (J5), and `/tk-close` (J7). `yarn pr:body` lands in J8; until a command lands, treat it as the step it describes.

---

## 0. Read, in this order, before anything else

| Read                                                        | Why                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `toolkit.json`                                              | The apps and their prefixes; the specs root; the reviewer rows                           |
| `specs/_status.md` (when it exists)                         | Active items, open epics and their stage, so the dump is routed into what already runs   |
| `docs/workflows/README.md`                                  | The routing rule and the map; this file never restates them                              |
| `docs/workflows/stages/<stage>.md`                          | The stage the dump lands in: its cast, loads, writes, gate and handoff                   |
| `docs/workflows/prompt-standard.md`                         | The checklist the prompt must pass                                                       |
| `docs/roles/README.md` and the department `README.md` files | The cast available, by description                                                       |
| `docs/references/README.md`                                 | Which references a UX or build thread may load, at most three                            |
| `docs/prompts/README.md`                                    | Whether a toolkit phase or a commissioned thread already covers the work                 |
| `docs/_generated/directory-map.md`                          | To name a file to attach, by its one-line description, without opening the whole library |

Do not read role bodies, the canon, or research files here. The builder chooses files; the thread reads them.

## 1. Restate the dump

Write back, in three lines: what changes, for whom, and in which app. If the dump could mean two different pieces of work, ask one question with a recommended default and stop. Otherwise proceed and label every inference `[ASSUMPTION: …]`.

## 2. Route: one-off or epic

Apply the routing rule from `docs/workflows/README.md` exactly. It is an epic if any one holds:

- the work needs more than one ticket;
- it adds a new surface: a screen, a flow step, or a component users meet;
- no living UX file in `specs/<app>/ux/` covers what is changing;
- the problem itself is not settled.

Otherwise it is a one-off. Size never decides the route; a small change that adds a surface is an epic with one ticket.

Then decide:

- **The app.** The folder under `specs/` and the prefix from `toolkit.json`. Work that spans apps goes to `specs/_shared/`.
- **For an epic, the prefix.** Two to five upper-case letters or digits, pronounceable, not in use (`toolkit.json` prefixes and every `specs/*/epics/*` folder). Propose it; Taylor can rename it in the Frame thread.
- **The stage.** New work enters at Frame (epic) or Build (one-off). Work on an existing epic enters at the stage `specs/_status.md` says is next.

## 3. Cast the thread

| Stage     | Lead                            | Support, consulted by function                                                                                        |
| --------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Frame     | Compass                         | Tribune when the customer's voice matters; Tally when the numbers do                                                  |
| Research  | The role that fits the gap      | Alembic for sources, Envoy for users, Chancery for legal, Sage for behaviour, Loom for AI                             |
| UX        | Vesper                          | Gloss for words; Threshold for access; Turner when a primitive may change                                             |
| Technical | Mason                           | Warden for auth or personal data; Loom for AI features; Tally for instrumentation; Quartermaster for a new dependency |
| Tickets   | Reeve                           | Mason; Vigil runs the pre-flight at the gate                                                                          |
| Build     | None: the thread is the builder | Reviewers are computed from what the ticket touches (`toolkit.json` rows, and Vigil by rule)                          |

A one-off has no lead role. Its kickoff prompt names only the reviewers and the specialists the contract will need, by function.

## 4. Choose the files, one reason each

Take the stage file's "Loads" list as the ceiling; attach only what this dump needs, and give each file one reason. Rules that bind every choice:

- Exact paths that exist. Use the directory map's descriptions to pick; never guess a name.
- References through `docs/references/README.md`, at most three, only in UX and build prompts.
- A `docs/research/` file only in a Frame, Research or UX prompt, labelled `[research: <why>]`, and only when nothing distilled covers the topic. Never in a Technical, Tickets or build prompt (`check-specs` fails a contract or kickoff that names one).
- The living truth for the area, when it exists; say so when it does not, because that fact alone routes the work to an epic.

## 5. Name the research gaps

List what the thread cannot decide without facts it does not have: a current price, a competitor's flow, a legal rule, a user behaviour. Each gap is one question. If any gap would change the UX spec, the Frame prompt carries the list and the Frame thread spawns a Research prompt per gap. If none, say "no research gaps found".

## 6. Pick the venue and the model

| Thread                                               | Venue                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Build, Tickets, Technical, anything that runs checks | Claude Code, in the repo, on the work branch                                                      |
| Frame, UX                                            | Claude Code (the files are read and written there); a general thread only when no file is written |
| Research with web sources                            | General Claude thread with web research                                                           |

Model: the deepest available for shaping and for one-way-door tickets. For a build thread, name the model and state the failure mode of choosing down (missed states, invented tokens, stale APIs).

## 7. Write the prompt

Use the standard's shape, in this order: venue line; role and support; attached, with reasons; decision served; the ask, numbered; writes; gate; handoff; evidence rules; not wanted; model. A build prompt ends with the kickoff block. Keep it under a page: the thread reads the files, the prompt only points.

Where it goes:

- **One-off:** print it. The next thread pastes it, drafts the contract and runs `yarn contract:init <APP> <slug>`.
- **New epic:** print it. The Frame thread's first move is `yarn spec:init <app> <EPIC> <slug>`, and its second is to save this prompt as `specs/<app>/epics/<EPIC>-<slug>/prompts/00-frame.md`.
- **Existing epic:** save it as `prompts/NN-<stage>.md` with the next number, and print it.

## 8. Check it, and show the check

Print the standard's fourteen-row table with pass or fail per row and the fix for any fail. A prompt with a failing row is not handed over; fix it first. Then the one closing line: "Open a new thread and paste the prompt above."

---

## Two desk walks

**"Fix the status filter on the records table" (web).** Restated: the filter on an existing table drops rows wrongly; one surface, already in truth. Route: one-off, app `web`, stage Build. Cast: no lead; reviewers Assay (UI glob) and nothing else unless the diff says so. Files: the contract template; `specs/web/ux/records/table.md` (the one cited surface); `docs/design/canon.md` through `ui.md` on touch. Research gaps: none. Venue: Claude Code on `agent/WEB-<n>`. Prompt: one page with the kickoff block. Check: 14 of 14.

**"Redesign onboarding for the web app."** Restated: a new three-beat flow replaces the current entry; several surfaces; the problem is not settled. Route: epic, app `web`, prefix `OB2`, stage Frame. Cast: Compass; Tribune for the customer's voice. Files: `docs/product/brief.template.md` (what the thread writes); `specs/web/ux/_global/navigation.md` and `specs/web/ux/onboarding/overview.md` (the truth being changed); `docs/workflows/stages/frame.md` (the protocol); no references, no research yet. Research gaps: how comparable products sequence first-run; the drop-off numbers at each current beat. Venue: Claude Code on `agent/OB2`, deepest model. Writes: `brief.md`; hands off a Research prompt per gap, then the UX prompt. Check: 14 of 14.
