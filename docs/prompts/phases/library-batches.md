---
title: P-D — Library batches (general Claude threads; the retargeting note)
description: Prepend to each library batch message (Alembic) so reference files land with the right path, frontmatter and router entry.
layer: prompts
status: adopted
thread: P-D
role: Alembic
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# P-D — Library batches (general Claude threads; the retargeting note)

> **Amendments in force (docs/decisions/conflicts.md).** Folders are `docs/references/{laws-of-ux, canons, practitioners, books}` with `practitioners/` and `books/` flat (CF-14). There is one router, `docs/references/index.md` (CF-15). Reference frontmatter adds `source`, `source_type`, `review_by`, `verification`, `coverage`, `exclusions` (CF-16). One verbatim anchor under 15 words per source per file (CF-48). No product sections; Example and Counter-example on demo surfaces instead (CF-49).

The prompts for 11 (practitioners), 12 (books), and 13 (Laws of UX) already exist and already run as batches with Alembic. Add this paragraph to the top of each batch message so files land correctly:

> Target repo layout: files go under `docs/references/<practitioners|books|laws-of-ux>/` with the frontmatter schema attached (title, description-as-trigger, layer: references, status, thread, role, date, load_when). `load_when` lists the task types that should load this file — table, form, onboarding, navigation, error state, dashboard, map, critique, spec, discovery, positioning, metrics. Deliver each file as a fenced block with its path on the first line. The `docs/references/README.md` index is updated in the same batch: add each new file under its task types.

Order: file the Laws of UX set and the four canons first (they're done — one short Alembic session to add frontmatter and the index entries), then one practitioner batch and one book batch per week.
