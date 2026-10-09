---
title: Records demo — components
description: Which component does which job in the demo.
date: 2026-10-08
---

# Records demo — components

- **A live dialog's destructive confirm:** `button` `destructive-solid`. A page trigger and onboarding's inert dialog keep `destructive`, the tint (D-DEMO-10, 11).
- **Retry after a failed load:** destructive `alert`; Retry is the solid primary (D-DEMO-22).
- **A notice in a dialog:** icon and text line, never an `alert` (D-DEMO-17).
- **Sort at 390:** `native-select` "Sort" (D-DEMO-14).
- **Pending:** `button` with `spinner`, same width (D-DEMO-16).
- **Forbidden:** the admin `sidebar` (D-DEMO-5).

**P-1 `Diff`**, a product primitive (R3): `apps/web/app/demo/_components/diff.tsx`, anatomy in `record-detail.md`; it moves to `@pem/ui` only when `apps/docs` imports it. Built by DEMO-9.
