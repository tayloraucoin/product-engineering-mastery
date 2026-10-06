---
id: LAB-18
size: small
objective: "With two to four designs, a reviewer rates each design on its own, then chooses from a per-reviewer shuffled list that unlocks once all are rated; the version records the order shown and how the choice was reached."
slice_type: "Form logic on the review page plus one read (door 4); the risk is bias the research warns of: an unstable or unshuffled order, a pre-selection, a choice before every rating, or a lost changed-after-choosing flag."
non_negotiables:
  - "Each design replaces Overall (D-LAB-18): designs in switcher order, the reviewer's first design first, goals shown once, review-variants.md's Words verbatim with glyph plus name."
  - "The design order is a pure function of slug and reviewer id, the same on every load and device, never a column; the three anchors stay last; the server stores the order it derives, never the client's."
  - "Nothing is pre-selected or marked recommended; the choice is a disabled radio group, its reason tied through aria-describedby, until every design has a rating ('Can't judge yet' counts); unlocking is announced politely."
  - "A design with no view event has both its questions disabled, with the line and 'Look at it'."
  - "The version adds per design the rating, weakness and changed-after-choosing flag, plus the order shown, choice, strength, reasons, carry-over and the last design viewed before the choice; the server checks every design id against the config."
  - "After a design is chosen strength is required; follow-ups come after the choice in DOM order and focus stays on the chosen option."
  - "The new read lives in packages/db/src/sandbox/review.ts, takes (db, viewer, input), refuses a team viewer and has its isolation case; variants-* keys register in state.ts as team-only, on synthetic fixtures."
devs_call: "The component split, the designs section's JSON shape within the core's ids, and the hash-to-order detail, as long as it is deterministic and unbiased."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/review-variants.md"
  - "D-LAB-18"
  - "D-LAB-21"
  - "C-LAB-variants-1"
  - "C-LAB-variants-2"
  - "C-LAB-variants-3"
  - "C-LAB-variants-4"
  - "C-LAB-variants-5"
  - "C-LAB-variants-6"
  - "C-LAB-variants-7"
  - "C-LAB-variants-8"
  - "C-LAB-variants-9"
truth_files: "none: the approved proposal ux/experimental/review-variants.md reaches specs/web/ux/experimental/review-variants.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/review/**"
  - "apps/web/lib/sandbox/review*.ts"
  - "apps/web/lib/sandbox/client/review-*.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/review.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
depends_on:
  - LAB-17
out_of_scope:
  - "The core sections, triage, drafts and versions: LAB-17. The sent view: LAB-19."
  - "Tallying preferences, the order log and time per design: LAB-23."
criteria:
  - id: C1
    statement: "A 2-design review with nothing rated shows the choice disabled, with 'Rate each design above to choose.' tied to it."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-018-review-variants/evidence/variants-locked.png"
  - id: C2
    statement: "Once every design has a rating, 'Can't judge yet' included, the choice enables and 'You can now choose a design.' is announced; before that the line names the one or two designs left."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "Over 1,000 synthetic reviewer ids on one 2-design slug each design is listed first 50% ± 5%, and the three anchors are always last in their fixed order."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "When the choice first renders nothing is selected and no option is marked."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "A design with no view event has its rating and weakness disabled with 'You haven't looked at the ▲ Triangle design yet.' until a view is logged."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "Changing a design's rating while a choice is set stores that design's changed-after-choosing flag as true; the others stay false."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "With a design chosen, a send without strength is refused by the form and the server, and reasons and carry-over follow the choice in DOM order; Combine and None show only their one follow-up."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "With keyboard alone and a screen reader a reviewer can rate, hear the unlock, choose and answer the follow-ups."
    evidence: manual
    reason: "Needs a person with a screen reader. The builder checks legends, aria-describedby and the live region, then defers it."
  - id: C9
    statement: "Every review-variants.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-018-review-variants/evidence/variants-states.png"
  - id: C10
    statement: "One reviewer gets the same order on every call and on a second access; the stored version holds the server's order and the last design viewed before the choice."
    evidence: test
    command: "yarn workspace web test"
  - id: C11
    statement: "The viewed-designs read returns only the calling reviewer's designs on their slug, refuses a team viewer, and its isolation case passes for every viewer kind."
    evidence: test
    command: "yarn workspace @pem/db test:db"
---

# Contract — LAB-18 review-variants

## Build notes

- **Approach:**
  - With two or more designs, the page swaps LAB-17's Overall section (by section id) for "Each design" and inserts "Your choice" after "Your comments", which is grouped by design.
  - `lib/sandbox/review-variants.ts` (server): `designOrder(slug, reviewerId, designIds)` sorts the ids by `sha256(slug:reviewerId:designId)`. The page passes the order, not the reviewer id, to the form leaf.
  - `client/review-variants-form.ts`, pure: lock state and its line, the unlock announcement, follow-ups per choice, the Blockers wording, and the flags.
  - The send (LAB-17's `sendReviewWith`) validates the section, replaces the order with `designOrder`, and stores all of it in the version's answers.
- **Decisions that apply:**
  - D-LAB-18: "With several designs, goal fit per design replaces the overall question", because "No single object to rate".
  - D-LAB-21: "A rating changed after choosing is allowed and marked", because "Choice-supportive memory, logged".
  - D-LAB-2 (overview.md): "The closing review is its own page; each design question has 'Look at ◆ again'".
  - S15: "The preference options are shuffled"; logged per reviewer: "the last variant viewed before the preference".
  - S20: the preference is "a forced choice with Combine, None of these and No preference, unlocked only when every variant has been viewed and rated".
  - R2 (D-LAB-34): "Isolation is proven by tests."
- **Interfaces:**
  - `designOrder` (review-variants.ts).
  - `@pem/db/sandbox`: `listMyViewedDesigns(db, viewer)` returns the distinct designs in the reviewer's view events on this slug.
  - "Look at the ◆ Diamond design again" and "Look at it" use LAB-11's `?design=<id>&from=review`.
- **Per path:** `review/**`, the designs section and choice; `review.ts`, the send's validation; `review-variants.ts` and the client module with their tests, named by criterion id; `state.ts`, the seven variants keys; db files, C11.
- **Gotchas:**
  - Sort by hash rather than seeding a shuffle: no modulo bias and no PRNG to get wrong. Never `Math.random`.
  - Last design before the choice: LAB-11's `readReviewerDesigns().lastDesign` at page render, snapshotted into the draft each time the choice is set. A "Look at it" round trip re-renders the page, so it tracks the view log.
  - Blockers read "…approving the ◆ Diamond design as it stands?" for a chosen design, and "…approving any of these as they stand?" otherwise.
  - Flags belong to each version: they start false in edit mode and turn true when a rating changes while a choice is set. Nothing is shown to the reviewer.
  - `[ASSUMPTION: the choice is required, since S20 calls it forced; review.md's required list predates it.]`
  - `[ASSUMPTION: "Your comments" opens once every design has a rating, carrying review.md's goal-fit-first rule to each design.]`
  - One design renders LAB-17's page unchanged. Fixtures are synthetic. `test:db` runs only locally.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model shuffles with `Math.random` on each render or pre-selects the first design, and both bend the preference the decision rests on.
