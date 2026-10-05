---
title: "Track: new project"
description: "Read when the boilerplate is being duplicated for a new product: the builder runs the expanded set-up interview and hands the work to the new-project runbook."
layer: workflows
status: draft
thread: PR-18
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# New project: starting a new save file

> **In one line:** duplicating the boilerplate is its own piece of work with a much longer interview. The builder asks everything the set-up needs, then prints a prompt that runs the new-project runbook, plus separate prompts for the pieces that are too big to share a thread.

## When it applies

A new product is being started from this repo, by an agent, with an operator answering questions. The steps themselves live in `docs/runbooks/new-project/README.md`; this track is how the work is opened.

## Stages

| Stage         | What happens                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| 1. Interview  | The builder asks the set-up questions below, in rounds                                                 |
| 2. Set up     | One thread follows the runbook: rename, remove what is not wanted, add what is, verify after each step |
| 3. Brand      | Its own thread: brand material becomes tokens, typography and the product design files                 |
| 4. UX spec    | Its own thread, through the builder, when no spec exists yet                                           |
| 5. Components | Its own thread, after the UX spec: keep the components the product needs, delete the rest              |

Stages 3 to 5 each have a prompt in the runbook folder. The set-up thread prints the next one when it is time.

## Cast and QA

Lead: Usher. Support: Quartermaster for stack choices, Hearth and Vesper for brand, Turner for components. Q1, with `yarn verify` after every step of the runbook so a broken step is caught where it happened.

## The builder's own questions for this track

Ask all of these; the runbook's interview section is the authority and may add more.

1. The project's name, the package scope that replaces `@pem/`, and the short prefix for each app's tickets.
2. Which apps: web, docs, marketing site, mobile?
3. For each part of the default stack (database, auth, API layer, billing, email, AI, error monitoring, component catalog): keep or remove?
4. Technology to add that is off by default, each with its recipe in `docs/runbooks/add/` (for example a local database in Docker).
5. Who signs decisions for this product (the default owner in the decision files)?
6. Does brand material exist? **Yes**: attach it (colours, type, logo, voice). **No**: the builder prints the branding prompt for a separate thread.
7. Does a full UX spec exist? **Yes**: attach it or name where it is. **No**: the builder prints a prompt to produce one.
8. Where will the code live and who needs access (repository, hosting, the accounts the stack needs)? Credentials are never typed into a thread; the answer is who will set them.
9. What from this repo's own history should not travel (its specs, decision log, build prompts, research)? Recommend removing all of it.

## What the builder prints

- The set-up prompt, with every answer above written in as an instruction.
- The branding prompt, or a note that brand material is attached.
- The UX-spec prompt, or a note that the spec is attached.
- A note that the components prompt comes from the set-up thread once the UX spec exists.
- The forecast, as estimates.

## What gets written

The new repository. In it: a first decision record of the set-up choices, so the next person knows what was removed and why.
