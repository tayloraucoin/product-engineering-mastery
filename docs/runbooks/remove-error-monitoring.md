---
title: "Remove error monitoring — a removal runbook"
description: "Follow from step 4 of new-project.md when the briefing drops Error monitoring (Sentry); delete, edit and unlist what the module added, then prove it gone with yarn check-stack."
layer: runbooks
status: draft
thread: "STK-3"
role: Usher
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes:
load_when:
---

# Remove error monitoring

> **Module:** Sentry, wired in the web app only (D-STK-12), and `@sentry/nextjs`, owned by the web app (D-STK-16). The observability package's vendor-free error reporter (STK-5) is not part of it and stays.
> **Built by:** STK-18 builds it. The module is not built, so every list below is empty until STK-18 fills it; nothing here is guessed ahead of the code.
> **Run from:** step 4 of [`new-project.md`](new-project.md).

## Files to delete

Not built yet: STK-18 fills this from the module's `files` list in `toolkit.json`.

## Files to edit

Not built yet: STK-18 fills this.

## Variables

Not built yet: STK-18 fills this from the module's `env` list in `toolkit.json`.

## Dependencies

Not built yet: STK-18 fills this from the module's `dependencies` list in `toolkit.json`.

## Boundaries entries

Not built yet: STK-18 fills this from the module's `boundaries` list in `toolkit.json`. The rows live in the layer matrix in `packages/config/eslint/boundaries.js` (D-STK-16).

## Vendor-side steps

Not built yet: STK-18 fills this.

## Verify

1. In `toolkit.json`, set `"removed": true` on the module's `stack` entry. Until STK-18 adds the entry, there is nothing to mark.
2. `yarn check-stack` exits 0: no listed file, variable or dependency of the module is left.
3. `yarn verify` exits 0.
