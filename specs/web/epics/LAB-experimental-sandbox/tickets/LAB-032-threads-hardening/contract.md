---
id: LAB-32
size: small
objective: "Two saves of one reply id, or a reply racing its author's erasure, leave one row or none; a slug's thread read has a stated ceiling; and a team reply can never reach a reviewer under a deleted team note."
slice_type: "Hardening LAB-25's threads after Warden's review (door 4); the risk is a reviewer reading a team-internal reply under a removed root, or a read that grows without bound."
non_negotiables:
  - "No migration: nothing under packages/db/migrations/ or packages/db/src/schema/ changes."
  - "Collaborate widening stays in reviewerScope and threadRowsOn (packages/db/src/sandbox/viewer.ts); nothing else widens a reviewer read."
  - "Deleting a team note deletes every reply under it in the same transaction, so no team reply is ever an orphan a reviewer read could rebuild as 'Comment removed'."
devs_call: "The ceiling's number and what the read returns past it, the race harness, and where the note-delete cascade lives in LAB-14's team.ts."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/threads.md"
truth_files: "none: no behaviour a person sees changes, unless the ceiling needs words, which go to threads.md first"
qa: Q3
reviewers:
  - warden
focus: []
operator_review: false
planned_paths:
  - "packages/db/src/sandbox/threads.ts"
  - "packages/db/src/sandbox/team.ts"
  - "packages/db/test/sandbox/threads.test.ts"
  - "packages/db/test/sandbox/threads-cases.ts"
depends_on:
  - LAB-25
  - LAB-14
out_of_scope:
  - "The thread UI: LAB-26. Admin counts that now include replies as comments (LAB-16's held and erasure counts, LAB-10's last activity): confirm their words, change them in their own tickets if needed."
criteria:
  - id: C1
    statement: "Two concurrent saveReply calls with one id from the same reviewer leave exactly one row, and both return ok or one returns not-saved."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C2
    statement: "A saveReply racing eraseEmail of its author's email leaves no reply from that access: the save is refused or its row is cascaded."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: "listThread returns at most the stated ceiling of rows for a slug, oldest roots first, and says when it stopped short."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C4
    statement: "A team reply planted under a team note is gone once the note is deleted through LAB-14's delete, and no reviewer read in either mode ever shows it."
    evidence: test
    command: "yarn workspace @pem/db test:db"
---

# Contract — LAB-32 threads-hardening

## Build notes

- **Approach:** LAB-25's Warden review (round 1, `tickets/LAB-025-threads-data/review-warden.md`) left these as Consider. Prove the two races with LAB-12's race harness (`packages/db/test/sandbox/comments.test.ts`'s concurrent saves); cap `listThread` in `threads.ts`; make LAB-14's team-note delete take its replies.
- **Decisions that apply:** D-LAB-17: "Beat 2: team replies are visible to reviewers; team notes are not." R2 (D-LAB-34): isolation rests on one module, proven by tests.
- **Interfaces:** `listThread` gains a way to say it stopped short (`{ threads, more }`, or similar; LAB-26 reads it).
- **Gotchas:** today a reply under a team note is refused by `saveReply` and dropped by `hiddenParents` while the note exists; only a deleted note leaves an orphan that rebuilds as a removed root. The fix is at the delete, never by reading a reply's author kind.
- **Model:** Opus 5.5 (`claude-opus-5-5`).
