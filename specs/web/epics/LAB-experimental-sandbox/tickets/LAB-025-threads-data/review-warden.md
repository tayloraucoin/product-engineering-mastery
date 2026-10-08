# Review — warden on LAB-25

> Written by `yarn review:run warden LAB-25`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 19e7342a90ee30621b52ef958498352d75431700222602877f10e76f560551db
- criteria_sha256: de327f783a2a24a287ec3e99414b7c32e8390f8b92ae3fb4eace38991c2fadb1
- as_built_sha256: 7e56a9e9843aebe0a4c0c97446db43c19d19cdc28c2ecb3bb0bf417a6cb286c0
- head: 09ae658234e258512682dd87e59a12936786184b
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T00:35:27Z
- run: 1 of warden on LAB-25
- tokens_input: 18
- tokens_cache_read: 2320165
- tokens_cache_write: 176233
- tokens_output: 22871
- seconds: 369.7
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-25`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-25 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C1.log (sha256 8493c6bd4a67)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C2.log (sha256 8493c6bd4a67)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C3.log (sha256 8493c6bd4a67)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C4.log (sha256 8493c6bd4a67)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C5.log (sha256 8493c6bd4a67)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C6.log (sha256 8493c6bd4a67)
   - C7 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C7.log (sha256 d6ef52aa8f58)
   - C8 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C8.log (sha256 8493c6bd4a67)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/lib/sandbox/threads.test.ts, apps/web/lib/sandbox/threads.ts, packages/db/src/sandbox/comments.ts, packages/db/src/sandbox/index.ts, packages/db/src/sandbox/threads.ts, packages/db/src/sandbox/viewer.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/threads.test.ts. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/experimental/threads.md. Read only the parts the contract names (D-LAB-16, D-LAB-17, C-LAB-threads-1, C-LAB-threads-2, C-LAB-threads-3, C-LAB-threads-4, C-LAB-threads-5, C-LAB-threads-6), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

**C1 — met.** `listThread` for a reviewer in collaborate mode scopes through `reviewerScope` → `threadRowsOn` (`viewer.ts:115-127`), which drops `reviewer_id` from the predicate and keeps only `slug`, so both reviewers' roots return; `showNumber` is `row.reviewerId === me.reviewerId` (`threads.ts:411`), so only the reader's own root carries `number`. Proven by `threads.test.ts:127` and, as every viewer kind in both modes, by `threads-cases.ts:125-208` (`C1.log:1338`, exit 0).

**C2 — met.** The reviewer read joins `sandboxReviewers.displayName` (`threads.ts:224`); the team read joins `.label` and `users.email` (`threads.ts:269-270`). The output objects are built field by field in `assemble` and `replyOf` (`threads.ts:331-341`, `310-318`) — the row's `reviewerId`/`teamUserId` are never spread out — and both the ticket test (`threads.test.ts:183-199`) and `assertNothingLeaks` (`threads-cases.ts:111-122`) scan the serialised payload for every label, email, access id, reviewer id and team user id in the world.

**C3 — met, and this is the focus.** A team note is `reviewer_id` null + `parent_id` null, which `threadRowsOn` excludes by construction. Defence in depth holds at three more points: a team reply *under* a note matches the predicate but is dropped by `hiddenParents` (`threads.ts:343-352`); `listReplies` refuses a rootId whose row has `reviewerId === null` (`threads.ts:464`); `resolveRoot` returns null for the same (`threads.ts:520`), so the save is `not-saved` with nothing written. The isolation case plants a team reply under the note *past the module* — the one write the module refuses — and asserts no read in either mode shows it (`threads-cases.ts:143-157`). That is the right way to prove this.

**C4 — met.** `resolveRoot` walks parent → root and stores `parentId: root.rootId` with the root's design, anchor and viewport (`threads.ts:510, 593-607`); `onConflictDoNothing` plus an own-scoped update gives one row per id (`threads.ts:609-641`). `threads.test.ts:246`.

**C5 — met.** Replies carry `reviewerId`+`accessId` (`threads.ts:588-591`), so `eraseEmail`'s cascade takes them; a surviving reply rebuilds the root from its own copied design and anchor, timed by the oldest survivor so roots still sort oldest first (`threads.ts:353-373`), and `resolveRoot` places a *new* reply under the removed root from a survivor (`threads.ts:523-530`). `threads.test.ts:297` asserts the removed root carries no `body` and no `author`.

**C6 — met.** Private scope is `reviewer_id = me AND slug = me.slug` (`viewer.ts:96-99`); `saveReply` returns `not-saved` before the transaction when the mode is not collaborate (`threads.ts:564`). Proven with a planted cross-reviewer reply that private mode must not show (`threads.test.ts:351-389`).

**C7 — met.** `serve` takes the mode only from `deps.findExperiment(...)` and discards the mode on the already-resolved `experiment` (`threads.ts:120-139`); the spread order puts `served.input` last (`threads.ts:222-226`), and `replyInput`/`replyRootInput` are `z.strictObject`, so a request naming `mode`, `slug` or `design` is rejected before any call. The test asserts a collaborate request reaching a private registry calls the database with `{ mode: "private" }` and that the refused inputs produce no call at all (`lib/sandbox/threads.test.ts:117-190`, `C7.log` exit 0).

**C8 — met.** `teamAuthor` gives `{ reviewer: label }` or `{ team: email }` (`threads.ts:304-308`); `listMyComments` gained `isNull(parentId)` so a reviewer's own list stays roots (`comments.ts:212-217`). `threads.test.ts:391`.

Writes never widen: every `reviewerScope` call outside `rowsForReviewer` passes no mode, so it defaults to private — the cap count, the reply edit, `deleteReply` (`threads.ts:617, 627, 662`) and all of `comments.ts`. `reviewerScope` also fails closed on an unknown mode or a table without `parentId` (`viewer.ts:100-101`). That is the single most important property here and it holds.

## Findings

**Should-fix — a collaborate read never confirms the viewer's reviewer row belongs to the slug.** `threads.ts:216-237`, with `viewer.ts:100-107`. In collaborate mode the read predicate is `slug` alone; `reviewerId` and `accessId` are used only to label authors. Every *write* proves the pair first by locking `sandbox_reviewers` on `id`+`slug` and throwing `REVIEWER_NOT_FOUND` (`threads.ts:570-580`), and every private read self-enforces because `reviewer_id` is in the predicate. The collaborate read has neither check, so a `ReviewerViewer` whose `slug` is not the one its `accessId` was validated against returns that slug's entire thread — every reviewer's body, display name and placement. Adversary: a code holder on experiment A against experiment B. Path: anything that constructs the viewer from a request-supplied slug rather than from the `checkAccess(accessId, slug)` pair. Not reachable today — LAB-5's `resolveViewer` binds them and the cookie is slug-bound (`C7.log:409`, "a valid cookie for another slug gives the gate with no database call") — which is why this is not Blocking. But the widened read is the one place where the module's own predicate stopped carrying the tenant boundary, and the fix is one row: read `sandbox_reviewers` by `reviewerId`+`slug` before the collaborate read and refuse with `REVIEWER_NOT_FOUND`, as the writes do. The matching case is also missing: `threads-cases.ts:191-199` crosses the viewer's slug only in `private` mode, so nothing asserts what a crossed viewer gets in collaborate mode.

**Consider — a team reply under a *deleted* team note would read to reviewers as a removed root.** `threads.ts:351-367`. The removed-root rebuild fires whenever an orphan reply's parent row is absent, with no check that the parent was ever a reviewer comment — the row keeps no evidence of it. `saveReply` refuses a reply under a team note, so this is unreachable through the module, and `hiddenParents` covers the case while the note exists. The exposure appears only if LAB-14 ever writes a team reply under a note (including threaded notes) and the note is later deleted; a reviewer would then see a team-internal reply body. Worth carrying into LAB-14 as a constraint: team notes take no replies, or orphan replies need a stored marker of their root's author kind.

**Consider — the collaborate read is unbounded.** `threads.ts:395-422`. `listThread` has no limit and no pagination: every root and every reply on the slug, assembled in memory and serialised to the browser. The 500-per-reviewer cap bounds it only per code, so the payload scales with the number of codes on the slug. Acceptable for a handful of reviewers; name a cap before a slug carries many.

**Consider — replies are rows in `sandbox_comments`, so pre-existing counts now include them.** The builder correctly added `parent_id is null` where a reply would have been wrong: `listMyComments` and `saveComment`'s update (`comments.ts:216, 278`) and LAB-17's triage check. Two surfaces were left as-is and may be intended: LAB-16's held/erasure counts now count a reviewer's replies as comments in `/admin`, and LAB-10's last-activity `max(created_at) … where reviewer_id is not null` now moves on a reply. Confirm both read the way the admin copy claims.

**Consider — a planned path changed but was not in this review's diff set.** `apps/web/app/experimental/[slug]/actions.ts` is a planned path and the as-built claims it gained the four actions, but it was not among the files handed to me. I checked: it does hold `listThread`, `listReplies`, `saveReply` and `deleteReply` delegating to the seam (lines 237-264), so the claim is true and the actions are wired — but that file went through this Q3 pass unreviewed. Worth a line so the next pass knows.

**Consider — concurrency is unproven, as the as-built says.** Two saves of one reply id at once, and an erasure racing a reply, have no test; LAB-12 has the equivalent race test for comments (`C1.log:186`). The reasoning in the as-built is sound (the insert conflicts, the composite FK refuses an erased access) and the gap is declared honestly, so this is a follow-up, not a defect.

Evidence note, not a finding: `C1.log`'s header says `tests: 249` while TAP reports `232` tests across `17` suites — the header counts both. The run is exit 0 at `fea6bab`, and `09ae658` adds only the spec files, so the proofs are not stale against the code I read.

VERDICT: PASS
