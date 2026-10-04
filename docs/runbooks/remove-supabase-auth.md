---
title: "Remove Supabase Auth — a removal runbook"
description: "Follow from step 4 of new-project.md when the briefing drops Supabase Auth; delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes:
load_when:
---

# Remove Supabase Auth

> **Module:** the auth package (D-STK-7: server, browser, admin and session-refresh factories, the request seam that returns the auth context, refresh in the proxy), the one owner of the `@supabase/*` SDKs (D-STK-16).
> **Built by:** STK-12 builds it; STK-11 builds the local auth mirror it calls (D-STK-6). The module is not built, so every list below is empty until STK-12 fills it; nothing here is guessed ahead of the code.
> **Run from:** step 4 of [`new-project.md`](new-project.md).

**When both Supabase modules go.** Run this runbook first, then [`remove-supabase-database.md`](remove-supabase-database.md): auth sits above the database in the package graph (D-STK-1). With both gone, nothing uses the Supabase project, so the vendor-side steps of both runbooks apply, and the database guardrails in `.claude/settings.json` (D-STK-18, STK-10) guard nothing. Where the local auth mirror goes is filled by STK-11; which database policies assume a signed-in user is filled by STK-9 and STK-12.

## Files to delete

Not built yet: STK-12 fills this from the module's `files` list in `toolkit.json`.

## Files to edit

Not built yet: STK-12 fills this.

## Variables

Not built yet: STK-12 fills this from the module's `env` list in `toolkit.json`.

## Dependencies

Not built yet: STK-12 fills this from the module's `dependencies` list in `toolkit.json`.

## Boundaries entries

Not built yet: STK-12 fills this from the module's `boundaries` list in `toolkit.json`. The rows live in the layer matrix in `packages/config/eslint/boundaries.js` (D-STK-16).

## Vendor-side steps

Not built yet: STK-12 fills this.

## Verify

1. In `toolkit.json`, set `"removed": true` on the module's `stack` entry. Until STK-12 adds the entry, there is nothing to mark.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
