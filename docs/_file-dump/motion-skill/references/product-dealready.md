# Motion in DealReady (trust UI)

**State budget:** the user is a reviewer doing diligence. They are often under deadline and sometimes reading material that changes a deal. The UI is calm, dense and keyboard-first. Motion budget: minimal. "A professional dashboard should be crisp and fast" ([DIRECT] A63).

[ASSUMPTION: DealReady is a React/Next.js app using shadcn (`@/components/ui`) with Radix primitives, per Plumb's ruling. The command palette and j/k row navigation exist or are planned.]

## The three decisions that matter most

### 1. Keyboard-driven work never animates
- **Treatment:**
  - Track the input modality on `<html data-input="keyboard|pointer">`.
  - Under `keyboard`, every transition in this list is `0ms`: command palette, row focus and selection (j/k, arrows), tab switching, sheet and dialog open/close by shortcut, Escape dismiss, Enter submit.
  - Pointer-initiated versions of the same actions use the catalog treatments.
- **Reason:** [DIRECT] A32. A reviewer stepping through 200 claims with j/k sees every transition hundreds of times (A53, A56). Any latency there reads as the tool being slower than the reviewer.

### 2. Evidence does not move; changes are marked, not animated
- **Treatment:**
  - Never animate these: table rows on sort, filter or pagination; numbers (no count-up); AI claim text as it streams (append in place); diff hunks; confidence scores; provenance chips.
  - When a value changes after load (for example, a re-run analysis), show a persistent static "changed" marker (token-colored dot plus a timestamp on hover) until the reviewer acknowledges it. Do not use a flash or a highlight fade.
  - Tables use `tabular-nums`.
- **Reason:** [DIRECT] A34, A35. The persistent marker is [INFERRED]: in trust UI the change has to be auditable after the fact, and a 300ms highlight is invisible to anyone who looked away. That would make motion a way to hide change rather than show it. This passes the trust test because one treatment is reused everywhere a value changes.

### 3. Motion is spent in one place: the path from claim to source
- **Treatment:**
  - Clicking a provenance chip on an AI claim opens the source in a right side sheet: translateX 100% to 0, `--motion-duration-moderate` (250ms), `--motion-ease-drawer`, exit 200ms.
  - The cited passage in the source is already highlighted when the sheet lands. Do not scroll-animate to it; the sheet opens scrolled to the passage.
  - The chip that opened it keeps a selected state while the sheet is open.
  - Under keyboard or reduced motion, the sheet appears with a 125ms opacity fade only.
- **Reason:** this is the product's signature interaction ([CONVENTION] Plumb DESIGN.md, "spend boldness in one place"; provenance chip named there as DealReady's one distinctive element). Spatial continuity (the source comes from the side, the claim stays in place) tells the reviewer that the document is beside the claim, not replacing it ([DIRECT] A30 on the spatial consistency of an in/out path; applied here [INFERRED]). Pre-scrolling instead of animating the scroll is [INFERRED] from L4.

## Everything else in DealReady
- **Hover:** background token only, `--motion-duration-fast`. No row lift.
- **Press:** 0.97 scale on primary buttons only. None on table rows or toolbar icons.
- **Loading:** static skeleton, no shimmer; content crossfade at 125ms.
- **Toasts:** Sonner defaults, and no toast for keyboard-shortcut actions that show their result in place.
- **Destructive:** a confirm dialog (opacity only) or an undo window. No hold-to-confirm.
- **Success:** a past-tense label swap in place. No celebration on report generation or deal close.
