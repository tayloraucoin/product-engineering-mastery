---
title: Records demo — DESIGN
description: The demo's deltas on the canon.
date: 2026-10-08
---

# Records demo — DESIGN

An evaluator finds, compares, edits and deletes synthetic vendor contracts, flipping `?state=` (D-DEMO-6). Deltas only.

**D-P01 One state, one wording.** Width changes layout, never words or rows; where captures differ, 1440 wins (D-DEMO-15, P-5). Tightens C-P08. Critic: P-A01.

**D-P02 Change is marked, never moved.** The Diff marks whole clauses by glyph and strike (P-1, P-4). Tightens C-P11, A-14. Enforced by C-DEMO-record-detail-2.

**Type.** Geist, `--font-brand-sans` (P-3, kept): the demo has no brand, so it keeps the starter's placeholder on purpose; its 400–600 covers every weight used, it has tabular figures, and one file in `@pem/brand` swaps it. Chosen, so not A-01.

**Color.** Neutral, chroma 0; no accent. The one hue, `--destructive`, marks loss only.

**Density, voice.** Table compact; the rest default. Sentence case; "Not loaded", never "Oops".

**Motion.** As C-P11; the delete and reset dialogs use opacity only.
