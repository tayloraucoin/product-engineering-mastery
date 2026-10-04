---
title: "Remove the API layer — a removal runbook"
description: "Follow from step 4 of new-project.md when the briefing drops API (tRPC); delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes:
load_when:
---

# Remove the API layer

> **Module:** the API package (D-STK-8: tRPC 11, transport only, each procedure one call into the services), the one owner of `@trpc/server` (D-STK-16). Route Handlers for webhooks, AI streaming, cron and auth callbacks call services directly and are not part of it. D-STK-8 names the product this runbook is for: one simple Next.js app.
> **Built by:** STK-14 builds it. The module is not built, so every list below is empty until STK-14 fills it; nothing here is guessed ahead of the code.
> **Run from:** step 4 of [`new-project.md`](new-project.md).

## Files to delete

Not built yet: STK-14 fills this from the module's `files` list in `toolkit.json`.

## Files to edit

Not built yet: STK-14 fills this.

## Variables

Not built yet: STK-14 fills this from the module's `env` list in `toolkit.json`.

## Dependencies

Not built yet: STK-14 fills this from the module's `dependencies` list in `toolkit.json`.

## Boundaries entries

Not built yet: STK-14 fills this from the module's `boundaries` list in `toolkit.json`. The rows live in the layer matrix in `packages/config/eslint/boundaries.js` (D-STK-16).

## Vendor-side steps

Not built yet: STK-14 fills this.

## Verify

1. In `toolkit.json`, set `"removed": true` on the module's `stack` entry. Until STK-14 adds the entry, there is nothing to mark.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
