---
title: "QA levels: how much proof, review and paperwork a piece of work gets"
description: "Read when choosing or changing how carefully a ticket, a stage or one named part of the work is checked: the four levels, what each costs, who picks the reviewers, and how an operator asks for more on demand."
layer: workflows
status: draft
thread: PR-18
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# QA levels

> **In one line:** every piece of work carries a level from Q0 to Q3. The level sets three things together: how the work is proven, who reviews it, and what is written down. The prompt builder recommends a level, the operator confirms it, and anyone can raise it later for the whole ticket or for one named part.

## The four levels

| Level  | For                                                                  | Proof                                                         | Review                                                                                     | Written down                                              |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Q0** | Questions, reports, docs, trivial fixes                              | The stop check on the files the thread edited                 | None                                                                                       | Nothing                                                   |
| **Q1** | Ordinary code                                                        | The builder runs the criteria; one `yarn verify` at the end   | None                                                                                       | A ticket if chosen; an as-built only if something changed |
| **Q2** | Code worth a second look                                             | Same as Q1                                                    | One reviewer in fresh context; findings come back in the thread, not as a file             | A ticket and a short as-built                             |
| **Q3** | Money, auth, schema and migrations, personal data, agent permissions | Recorded proofs (the ledger: `results.json`), frozen at close | The specialists the operator confirmed, each in fresh context; their review files are kept | The full contract, the as-built, the review files         |

What each level costs, as a rough guide (estimates): Q0 and Q1 add almost nothing to the build. Q2 adds one reviewer session and usually one round of fixes. Q3 adds a reviewer session per specialist, a fix round per review, and the recorded proofs; expect it to cost as much again as the build itself.

## Who picks the level and the reviewers

1. **The prompt builder recommends.** It reads the dump and the files the work will touch. The reviewer map in `toolkit.json` (which paths suggest which specialist) is its evidence, never an automatic assignment.
2. **The operator confirms or changes it,** in the interview, before any work starts.
3. **A critical path below Q3 is flagged, not blocked.** If the planned paths touch money, auth, schema, personal data or agent permissions and the level is below Q3, the thread says so once, names the path, and carries on with the operator's choice.

## One level per ticket, not per epic

An epic rarely has one level. A copy change and a payment webhook can sit in the same epic. So:

- The builder asks for the epic's **default** level and for any parts the operator already knows are critical.
- At the Tickets stage, Reeve proposes a level, reviewers and focus for **every ticket**, in one table. The operator confirms the table once, changing any row.
- Shaping stages (Frame, Research, UX, Technical) have gates, not QA levels: the operator's approval is the check.

## Focus: asking for a deeper look at one part

A level can be raised for a named part without raising the whole ticket. The operator says what to look at and, if they want, who should look:

- "Have Warden go through the webhook handling and confirm every event type is handled."
- "Q3 on the migration only."
- "Give the empty state a second look."

The thread writes each request into the contract as a `focus` line (what to examine, the reviewer, the level), and that part is proven and reviewed at the higher level. Everything else stays at the ticket's level.

## Raising or lowering later

Say it in the thread: "raise STK-16 to Q3", "this one is only Q1". The thread updates the contract and does what the new level requires. Raising is always allowed. Lowering a ticket that touches a critical path gets the one-time flag above.

## Review findings and the audit flags

Reviewers and audits use one scale, so a finding means the same thing everywhere:

| Flag       | Meaning                                   | In a review |
| ---------- | ----------------------------------------- | ----------- |
| **Black**  | Stop everything and fix this now          | Blocking    |
| **Red**    | Critical: must be fixed before this ships | Blocking    |
| **Orange** | High to medium concern: fix soon, plan it | Should fix  |
| **Yellow** | Minor concern                             | Consider    |
| **Grey**   | Low concern, or a note                    | Consider    |

The builder fixes black and red findings and any orange one that is cheap, then re-proves. The rest are listed in the closing report as drafted follow-ups.

## What is never written down

- Evidence logs are not committed. A Q3 proof keeps the command, its exit code and a short tail.
- Review output below Q3 lives in the thread and its closing report.
- Prompts are printed, never saved ([`prompt-builder.md`](prompt-builder.md)).
