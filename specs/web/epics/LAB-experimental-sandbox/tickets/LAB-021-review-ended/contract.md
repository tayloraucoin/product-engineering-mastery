---
id: LAB-21
size: small
objective: "A reviewer with a live code who reaches a closed experiment learns the review has ended and whether theirs was received; this browser's unsent comments show once, read-only, then clear, as does any unsent draft."
slice_type: "A server-rendered end state with browser-storage cleanup (S12b, S16); the risk is the page reaching someone without a live code or the team, or a queue cleared for the wrong experiment or not at all."
non_negotiables:
  - "page.tsx's ended branch (LAB-5's ended result) renders the Ended view; the team on a closed experiment and anyone without a live code never reach it."
  - "The sent line takes the reviewer's latest version's instant through a reviewer-scoped read in packages/db/src/sandbox/ with its isolation case; no version gives the not-sent line."
  - "Opening the page writes nothing: no view event, no request after load."
  - "A client leaf touches only this slug and reviewer's queue and draft keys: it shows the queued comments' text read-only, removes the draft on arrival, removes the queue on pagehide, and sends nothing."
  - "The date is an instant formatted in the client, in the reader's locale and zone."
  - "The ended keys register in lib/sandbox/state.ts as team-only, on synthetic fixtures."
  - "ended.md's Words verbatim; the heading is the h1; the disclosure is a native button with aria-expanded, named Show them or Hide them."
devs_call: "The split between the server Ended view and the client leaf, the disclosure's markup, and whether the latest-send read reuses one LAB-17 already exports."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/ended.md"
  - "D-LAB-8"
  - "C-LAB-ended-1"
  - "C-LAB-ended-2"
  - "C-LAB-ended-3"
  - "C-LAB-ended-4"
  - "C-LAB-ended-5"
  - "C-LAB-ended-6"
  - "C-LAB-ended-7"
truth_files: "none: the approved proposal ux/experimental/ended.md reaches specs/web/ux/experimental/ended.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/page.tsx"
  - "apps/web/app/experimental/[slug]/_components/ended/**"
  - "apps/web/lib/sandbox/ended.ts"
  - "apps/web/lib/sandbox/ended.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/**"
  - "packages/db/test/sandbox/**"
depends_on:
  - LAB-12
  - LAB-17
out_of_scope:
  - "resolveViewer's closed check: LAB-5. The gate: LAB-7. state.ts's reader: LAB-4."
  - "Writing the queue (LAB-12) and the draft (LAB-17); disabling pins after close (pins.md, LAB-12)."
  - "The team's view of a closed experiment: LAB-11, LAB-14."
criteria:
  - id: C1
    statement: "A live access on a closed experiment (LAB-5's ended) renders the Ended view, never the gate or its error, and writes no view event."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "A developer or admin on a closed experiment gets the experiment branch, and a request without a live code gets the gate; neither reaches the Ended view."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "With 2 queued comments for this experiment and 1 for another, the view shows '2 comments in this browser weren't sent before it closed.' and both texts; after pagehide this experiment's queue key is gone and the other's untouched; a malformed queue or a throwing storage shows no count and no error."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "A review draft for this experiment is removed on arrival and the draft line shows; with no draft the line is absent."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "The latest-send read returns the viewer's own latest version instant, null when there is none, never another reviewer's or slug's, and refuses a team viewer; its isolation case passes."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C6
    statement: "A reviewer with a sent review sees the sent line with the latest send's date."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-021-review-ended/evidence/ended-sent.png"
  - id: C7
    statement: "A reviewer who never sent sees the not-sent line."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-021-review-ended/evidence/ended-not-sent.png"
  - id: C8
    statement: "Every ended.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-021-review-ended/evidence/ended-states.png"
---

# Contract — LAB-21 review-ended

## Build notes

- **Approach:**
  - The server `Ended` view renders the gate's column, the brand mark, the h1, the sent or not-sent line and the footer.
  - A `"use client"` leaf reads the queue and the draft after mount, fills the count, the list and the draft line, and removes the queue on `pagehide`.
  - `lib/sandbox/ended.ts` holds the pure parts: `readUnsent`, `clearUnsent`, `takeDraft` and `endedLines`, over an injected `Storage`, so tests run in node with a fake.
  - The latest-send read follows LAB-3's pattern (`(db, viewer, input)`, reviewer scope) and registers its isolation case.
- **Decisions that apply:**
  - D-LAB-8: "Unsent pins on 'review has ended' are counted and shown read-only, then cleared", because "Honest; nothing lingers (Warden)".
  - S16: "When closed: the team can still view; guests see a 'review has ended' state, including guests arriving from the confirmation email's link; no new feedback is taken, and no edits."
  - technical/gate.md: "Closed with a live code renders `ended.md`; an unknown slug never reaches the database."
  - data-contract.md: "Browser storage: the unsent-pin queue and the review draft, per slug and reviewer, cleared as ended.md and review.md say." And: "ended.md's date use[s] the reader's locale and zone."
- **Interfaces:**
  - Keys, named here because LAB-12 and LAB-17 were unfilled when this was written (each carries the matching `[ASSUMPTION]`):
    - the queue is localStorage `sandbox:pin-queue:<slug>:<reviewerId>`, a JSON array whose entries carry `id` and `body`;
    - the draft is localStorage `sandbox:review-draft:<slug>:<reviewerId>`, any value.
    - If either ticket's as-built names other keys or exports key builders, use those.
  - `latestSentAt(db, viewer)` returns `Date | null` (unless LAB-17 exports an equivalent).
  - `Ended` and `EndedBrowserState`; the ended keys in `SANDBOX_STATE_KEYS`.
- **Per path:**
  - `page.tsx`: the ended branch only, replacing LAB-7's placeholder.
  - `_components/ended/`: the view and the leaf.
  - `ended.ts` and its test: C1 to C4, named by criterion id.
  - `state.ts`: five keys and their fixtures.
  - `packages/db/src/sandbox/` and `test/sandbox/`: C5.
- **Gotchas:**
  - Storage can throw (private modes, blocked site data). Wrap every read and remove; on failure, show the base line only.
  - Clear on `pagehide`, never `beforeunload`, which the back-forward cache and mobile Safari skip.
  - Read only the `body` strings; skip entries without one.
  - `[ASSUMPTION: one queued comment reads "1 comment in this browser wasn't sent before it closed."; the Words give only the plural.]`
  - The reviewer id reaches the client only as this leaf's prop.
  - Fixtures are synthetic: "3 October" and two invented comment texts.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model clears every `sandbox:` key, or posts the unsent text "to be safe".
