---
title: Records demo — tokens
description: The demo's token roles beyond the preset.
date: 2026-10-08
---

# Records demo — tokens

Values live in `packages/config/tailwind/preset.css`; its roles apply as written. The demo adds:

- `--destructive-foreground` on `--destructive` (P-2, DEMO-2): a live dialog's solid confirm only; contrast in `tooling/contrast-audit.ts`.
- Diff: added on `--color-muted`, `--radius-sm`; removed in `--muted-foreground`, struck.
- Shell side padding: `--spacing-8` at 1440, `--spacing-4` at 390 (D-DEMO-5).
