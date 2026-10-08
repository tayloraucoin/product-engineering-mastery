---
id: LAB-31
size: small
objective: "Two tabs for one reviewer never send requests for the same pin at once, so a delete or an edit made in one tab is never overtaken by the other tab's older send."
slice_type: "Client ordering across tabs (door 4); the risk is a deleted pin coming back, or an old body overwriting an edit, with the queue already empty so nothing corrects it."
non_negotiables:
  - "Each send, edit and delete for a pin id runs under one lock shared by every tab of the browser (navigator.locks, keyed by slug, reviewer and pin id), injected through the sender's deps so tests fake it."
  - "Where the Locks API is missing, the sender falls back to today's per-tab order; nothing is lost."
  - "No server change, no new table."
devs_call: "The lock's name, and whether a held lock waits or skips."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/pins.md"
truth_files: "none: no behaviour a person sees changes"
qa: Q2
reviewers:
  - mason
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/sandbox/client/queue.ts"
  - "apps/web/lib/sandbox/client/queue.test.ts"
  - "apps/web/app/experimental/[slug]/_components/pins/pins-provider.tsx"
depends_on:
  - LAB-12
out_of_scope:
  - "A server tombstone for a delete that lands before a save the browser thought failed (LAB-12's accepted grey)."
criteria:
  - id: C1
    statement: "With a shared fake lock, tab B's flush of pin P waits for tab A's delete of P and then finds nothing to send; the server stub receives the delete last."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "Tab A's edit of P and tab B's flush of P's older body never overlap; the last request the stub receives carries the edit."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "Without navigator.locks the sender keeps one request at a time per id within the tab, as LAB-12's tests prove."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — LAB-31 pin-queue-cross-tab

## Build notes

- **Approach:** `createPinSender`'s deps gain `withLock(id, task)`; `inTurn` runs each task inside it. The provider binds it to `navigator.locks.request("sandbox:pin:<slug>:<reviewerId>:<id>", task)` when present, else runs the task directly.
- **Why:** LAB-12's queue is shared across tabs (it re-reads storage before every step), but its one-request-per-id order holds only inside one tab (mason, LAB-12 round 2, yellow).
- **Gotchas:** keep the lock short: one request per hold. A tab closed mid-request releases its lock.
- **Model:** Opus 5.5 (`claude-opus-5-5`).
