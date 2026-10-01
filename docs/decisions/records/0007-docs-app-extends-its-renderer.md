---
title: 0007 — The docs app keeps its own renderer, extended with frontmatter, layer grouping and search, instead of moving to Fumadocs
description: Read before changing how apps/docs reads, groups or searches docs/, or before proposing a docs framework.
layer: decisions
status: ruling
thread: P-B
role: Mason
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0007 — The docs app keeps its own renderer, extended instead of replaced

Closes the revisit trigger of record 0004 ("the docs need search … at which point a docs framework replaces the renderer").

## Context and problem

Phase 2 needs the docs app to read `docs/`, group its sidebar by the `layer` field, render frontmatter, search everything, and keep `research/` out of the sidebar while leaving it searchable. Record 0004 named search as the moment to consider Fumadocs or Nextra, and the plan (PL §2.2) prefers Fumadocs. The renderer already resolves relative `.md` links from root `docs/`, which every primer prompt and role writes.

## Considered options

1. Extend the existing renderer: parse frontmatter with `yaml`, group by `layer`, build a search index at build time, search it on the client with MiniSearch.
2. Migrate to Fumadocs: its sidebar and search come built in; layer grouping, the research exclusion and link rewriting become custom page-tree code, and every `.md` is compiled as MDX.

## Decision

Chosen: option 1, because the one part a framework would give for free (a file-tree sidebar) is the part this repo does not want, and the parts it wants (grouping by a frontmatter field, a hidden-but-searchable layer, links that work raw) are custom code in either case. Compiling 30-plus third-party reports as MDX also invites parse failures on text nobody may edit (record 0006). The owner chose this option on 2026-10-01.

## Consequences

- **Buys:** no new framework; one dependency (`minisearch`) on the client and one (`yaml`) shared with `tooling/`; content stays plain markdown that renders the same raw.
- **Costs:** search, headings and frontmatter display are ours to maintain (about 300 lines across `apps/docs/lib/` and `app/_components/`). The full-text index ships to the browser on first search: 1.7 MB before compression at 131 documents (2026-10-01).
- **Forecloses:** nothing. Fumadocs can still be pointed at the same files.

## Revisit trigger

The search index passes about 5 MB, the docs need versioning, or a page needs interactive MDX components.
