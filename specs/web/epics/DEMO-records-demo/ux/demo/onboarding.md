---
target: specs/web/ux/demo/onboarding.md
status: approved
promoted:
design:
  file: https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0
  page: p-1-0
  artboards:
    - "onboarding / beat-1 / 390 / light"
    - "onboarding / beat-1 / 390 / dark"
    - "onboarding / beat-1 / 1440 / light"
    - "onboarding / beat-1 / 1440 / dark"
    - "onboarding / beat-2 / 390 / light"
    - "onboarding / beat-2 / 390 / dark"
    - "onboarding / beat-2 / 1440 / light"
    - "onboarding / beat-2 / 1440 / dark"
    - "onboarding / beat-3 / 390 / light"
    - "onboarding / beat-3 / 390 / dark"
    - "onboarding / beat-3 / 1440 / light"
    - "onboarding / beat-3 / 1440 / dark"
    - "onboarding / empty / 390 / light"
    - "onboarding / empty / 390 / dark"
    - "onboarding / empty / 1440 / light"
    - "onboarding / empty / 1440 / dark"
    - "onboarding / loading / 390 / light"
    - "onboarding / loading / 390 / dark"
    - "onboarding / loading / 1440 / light"
    - "onboarding / loading / 1440 / dark"
    - "onboarding / error / 390 / light"
    - "onboarding / error / 390 / dark"
    - "onboarding / error / 1440 / light"
    - "onboarding / error / 1440 / dark"
    - "onboarding / partial / 390 / light"
    - "onboarding / partial / 390 / dark"
    - "onboarding / partial / 1440 / light"
    - "onboarding / partial / 1440 / dark"
    - "onboarding / offline / 390 / light"
    - "onboarding / offline / 390 / dark"
    - "onboarding / offline / 1440 / light"
    - "onboarding / offline / 1440 / dark"
  locked: 2026-10-08
---

# Onboarding — demo

## Job

A first-time evaluator learns in three beats what the records product does and lands in the table ready to act. Done: they are on `/demo/records`, having finished or skipped. (judgment)

**Entry:** `/demo` on first visit (D-DEMO-3); "Replay onboarding" in settings. **Exit:** `/demo/records` on finish or skip; empty's primary goes to `/demo/records/new`.

## Layout and components

Full-bleed, no demo shell. The 1440 layout applies from `md` up (834 takes it); below, the 390 layout.

- **Top bar**, 56px: "Records demo" (sm semibold, not a link) left; "Skip to records" `button` ghost right, hidden on beat-3, empty and error (D-DEMO-12).
- **Beat column**, `--container-xl` centred, `--spacing-16` below the bar (390: full width, `--spacing-4` gutters, `--spacing-12` top). Top to bottom:
  1. "Step n of 3" (sm, muted) over `progress` (6px, fill 1/3, 2/3, full).
  2. Illustration slot: a bordered `--radius-lg` panel built from real primitives, inert. Job lines: beat-1, three table rows (vendor, `badge`, value), "shows what one record holds"; beat-2, a removed and an added clause in the P-1 Diff, "shows what compare marks"; beat-3, a mini `alert-dialog` with the kit tint delete (D-DEMO-11), "shows that delete asks first". Rows grow with a wrapped vendor name (D-DEMO-16).
  3. Title (h1, `--text-2xl` semibold), body (base, muted).
  4. Actions, right-aligned: "Back" ghost (beats 2 and 3), then the primary `button` default, outermost (D-DEMO-21).
- The offline note is a kit `alert` default with the wifi-off icon, above the progress.

## States

Cell `x`: `captures/onboarding/x-{390,1440}[-dark].png`.

| State   | Key                | What shows; what the person can do                                               | Artboard  |
| ------- | ------------------ | -------------------------------------------------------------------------------- | --------- |
| beat 1  | `beat-1` (default) | Step 1, rows illustration; Next, Skip                                            | `beat-1`  |
| beat 2  | `beat-2`           | Step 2, diff illustration; Back, Next, Skip                                      | `beat-2`  |
| beat 3  | `beat-3`           | Step 3, track full, inert dialog; Back, Go to records                            | `beat-3`  |
| empty   | `empty`            | Step 3; the slot holds the empty-table line; Back, New record                    | `empty`   |
| loading | `loading`          | Step 1; slot and text are skeletons at final size; Next disabled; Skip works     | `loading` |
| error   | `error`            | No progress, no slot; the failure line; Go to records                            | `error`   |
| partial | `partial`          | Beat 2 without its illustration; text and controls stand alone; Back, Next, Skip | `partial` |
| offline | `offline`          | Beat 1 with the offline note; every control works                                | `offline` |

## Primary action

Next; "Go to records" on beat 3; "New record" on empty. One per beat.

## Words

Gloss; the canvas words stand.

- Shared: "Records demo", "Skip to records", "Step 1 of 3" (2, 3), "Back", "Next".
- beat-1: "Every record is a vendor contract" / "Each one has an owner, a status, an annual value, a renewal date and the terms you agreed. All of it is sample data."
- beat-2: "Find one, read what changed" / "Sort and filter the table, open a record, and compare its terms with the version before." Illustration caption: "Halvorsen Freight, version 4 compared with version 3".
- beat-3: "Change it safely" / "Edit a record and each save keeps a version. Delete asks first, and demo data comes back when you reload." Primary "Go to records". Illustration: "Delete Halvorsen Freight?", "Cancel", "Delete record".
- empty: "Your table is empty" / "Add your first vendor contract to see the rest of the demo: reading, comparing and deleting." Slot: "No records yet" / "Your first record will be listed here." Primary "New record".
- error: "The welcome did not load" / "You can go straight to records. Replay this any time from Settings." Primary "Go to records".
- offline: "You are offline. These steps still work; records may not load until you reconnect."

## Access

- Tab order: Skip (when shown), Back, primary. On load and on each beat change, focus moves to the h1 (`tabindex="-1"`), so the new beat is read.
- "Step n of 3" is the progress's text; the bar is `aria-hidden`.
- The illustration is `aria-hidden` and inert: nothing in it is focusable, including its Cancel and Delete.
- Beats change by `?state=beat-n` with `router.replace`, so the browser back button leaves onboarding.
- Loading: the beat region is `aria-busy`; Next is `disabled`.
- Motion: a beat change fades (opacity, motion token, at most 200ms); reduced motion makes it instant.

## Instrumentation

None (D-DEMO-24).

## Criteria

| ID                  | When                                               | Then                                                                        | Evidence |
| ------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- | -------- |
| C-DEMO-onboarding-1 | `/demo` on first visit; again after finish or skip | Redirects to `/demo/welcome`; then to `/demo/records`                       | test     |
| C-DEMO-onboarding-2 | Next on beats 1 and 2                              | The next beat shows, its h1 has focus, and the URL is replaced, not pushed  | test     |
| C-DEMO-onboarding-3 | Skip, or "Go to records"                           | `/demo/records` opens and completion is remembered                          | test     |
| C-DEMO-onboarding-4 | Each key                                           | Skip shows on beat-1, beat-2, loading, partial, offline; hidden on the rest | test     |
| C-DEMO-onboarding-5 | Any beat                                           | The illustration is `aria-hidden` with no focusable descendant              | test     |
| C-DEMO-onboarding-6 | "New record" on `empty`                            | `/demo/records/new` opens                                                   | test     |
| C-DEMO-onboarding-7 | Each key                                           | Renders at 390, 834 and 1440, light and dark, reduced motion, as captured   | capture  |
| C-DEMO-onboarding-8 | Keyboard alone at 390                              | Beat 1 to records with visible focus throughout                             | manual   |

## Decisions and open items

D-DEMO-3, 11, 12, 16, 21, 24. Decided earlier: beats are `?state=` keys on one route. None open.
