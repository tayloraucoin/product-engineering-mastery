---
title: Records demo — states
description: Every ?state= key per demo surface.
date: 2026-10-08
---

# Records demo — states

Keys as each surface's `ux/demo/` States table gives them. "(none)" is the default view; success is the action's own key.

- **onboarding:** `beat-1` (default), `beat-2`, `beat-3`, `empty`, `loading`, `error`, `partial`, `offline`
- **records-table:** (none), `empty`, `no-results`, `loading`, `error`, `partial`, `offline`, `deleted`
- **record-detail:** (none), `diff`, `no-history`, `empty`, `loading`, `error`, `not-found`, `partial`, `offline`, `saved`
- **record-form:** (none on `/new`, `/edit`), `invalid`, `submitting`, `empty`, `loading`, `error`, `partial`, `offline`, `dirty`
- **settings:** (none), `saved`, `empty`, `loading`, `error`, `partial`, `offline`, `reset`
- **delete-dialog:** (none), `deleting`, `error`, `partial`, `offline`; `empty`, `loading` N/A

Skeletons copy each width's final layout, no shimmer (A-14).
