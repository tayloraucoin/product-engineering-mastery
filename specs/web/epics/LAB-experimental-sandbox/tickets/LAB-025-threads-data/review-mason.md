# Review — mason on LAB-25

> Written by `yarn review:run mason LAB-25`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 19e7342a90ee30621b52ef958498352d75431700222602877f10e76f560551db
- criteria_sha256: de327f783a2a24a287ec3e99414b7c32e8390f8b92ae3fb4eace38991c2fadb1
- as_built_sha256: 7498cdab23690a42d9b3f1f567b5d9b26cb79059f45256bafb32e0e592b18f33
- head: 65cc038e31add66a7f4085fab42c8dc6c8d8ae6c
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-08T00:26:16Z
- run: 1 of mason on LAB-25
- tokens_input: 34
- tokens_cache_read: 3966309
- tokens_cache_write: 269208
- tokens_output: 25330
- seconds: 390.5
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason LAB-25`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket LAB-25 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C1.log (sha256 37c378339f91)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C2.log (sha256 37c378339f91)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C3.log (sha256 37c378339f91)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C4.log (sha256 37c378339f91)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C5.log (sha256 37c378339f91)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C6.log (sha256 37c378339f91)
   - C7 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C7.log (sha256 addfeb893864)
   - C8 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-025-threads-data/evidence/C8.log (sha256 37c378339f91)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/lib/sandbox/threads.test.ts, apps/web/lib/sandbox/threads.ts, packages/db/src/sandbox/comments.ts, packages/db/src/sandbox/index.ts, packages/db/src/sandbox/threads.ts, packages/db/src/sandbox/viewer.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/threads.test.ts. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/experimental/threads.md. Read only the parts the contract names (D-LAB-16, D-LAB-17, C-LAB-threads-1, C-LAB-threads-2, C-LAB-threads-3, C-LAB-threads-4, C-LAB-threads-5, C-LAB-threads-6), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Criteria

| | Verdict |
|---|---|
| **C1** | **Met.** `C1.log:1339` green. `threads.test.ts:127-146` reads as both Ana and Ben on one collaborate slug, asserts both roots in each read, `number === 1` on the reader's own and `!("number" in theirs)`. Code path: `assemble`'s `showNumber` is `row.reviewerId === me.reviewerId` (`packages/db/src/sandbox/threads.ts:407`), and the number is spread in conditionally (`:341`). |
| **C2** | **Met.** `C1.log:1345` green. `threads.test.ts:183-199` serialises both `listThread` and `listReplies` payloads and asserts neither holds either email, either label, the team email, the team user id, either reviewer id, either access id, or `"example.com"`. The isolation cases repeat it for every reviewer kind (`threads-cases.ts:111-122`). The reviewer join reads `sandboxReviewers.displayName` (`threads.ts:220`), the team join `label` (`:271`); `assemble` constructs fresh rows, so `reviewerId`/`teamUserId` never cross. |
| **C3** | **Met.** `C1.log:1351` green. A team note is excluded three ways: the scope (`viewer.ts:102-105` — `reviewer_id is not null or parent_id is not null`, and a note is neither), `hiddenParents` dropping a reply whose parent exists outside the read (`threads.ts:352-354`), and `listReplies`' root probe (`:460`). `saveReply` refuses it (`:506`) with nothing written, asserted by row lookup (`threads.test.ts:229`). A team reply under a reviewer comment reads `"team"` (`:240-243`). |
| **C4** | **Met.** `C1.log:1357` green. `threads.test.ts:246-295`: the second reply's stored `parent_id` is the root, `design` and `anchor` equal the root's, the same id twice gives one row, Ben cannot rewrite Ana's reply, and the pair lists oldest first. `resolveRoot` walks parent → root inside the transaction (`threads.ts:496-503`). |
| **C5** | **Met.** `C1.log:1363` green. `threads.test.ts:297-343` erases through LAB-16's `eraseEmail`: Ana's root and reply gone, Ben's reply present, the root reads `removed: true` with the root's design and anchor and no `body`/`author`, and both a reviewer's and the team's new reply land under the removed root. |
| **C6** | **Met.** `C1.log:1369` green. `threads.test.ts:345-383` plants the row a collaborate read would show, then proves each private read holds neither the other's comment id nor their display name, a private reply is `not-saved` with no row, and Ana never sees Ben's planted reply under her own comment. |
| **C7** | **Met.** `C7.log:2849-2875` green (4/4). `threads.test.ts:117-145`: the resolved request carries a **collaborate** config while the registry returns **private**, and the recorded db calls carry `mode: "private"` — and for a reviewer, no `slug`. `:173-190` proves an input naming a mode, a slug or a design is refused with `world.calls` empty. `serve` reads `findExperiment(result.viewer.slug)` (`lib/sandbox/threads.ts:120`), the route slug only for the team (`:126`). |
| **C8** | **Met.** `C1.log:1375` green. `threads.test.ts:385-431`: the team's read names a reviewer by label and a team member by email, the team note is absent, the reply's author is `"self"` to its writer, and `listMyComments` returns Ana's root alone (`comments.ts:215` adds `isNull(parentId)`). |

**Non-negotiables.** All held. The reviewer widening is in `reviewerScope` alone and only `threads.ts` passes a mode. The mode never comes from the request (C7). `Viewer`, `ReviewerViewer`, `TeamViewer` are unchanged. `parent_id` stays foreign-key-free, a reply points at its root and copies its design and anchor, and a reply under a team note or in private mode is refused. Erasure cascades and others' replies survive. No path under `packages/db/migrations/` or `packages/db/src/schema/` changed. Each new query is `(db, viewer, input)` and has its isolation case as all five viewer kinds in both modes (`C1.log:622-737`, 20/20 green).

## Findings

**Should-fix — `as-built.md:5`: a claimed test file does not exist.** "`viewer.test.ts` pins both SQL shapes" — there is no `packages/db/test/sandbox/viewer.test.ts`, and nothing under `packages/db/test/` references `SCOPE_MODE_INVALID`. Both scope shapes are in fact proven: private by `isolation.test.ts:1601-1635`, collaborate end-to-end by C1–C6/C8. What is unproven is the fail-closed branch at `viewer.ts:100-101` (an unknown mode, or collaborate asked of a table with no `parentId`). No criterion is unmet, but the as-built is the ground truth the next session reads. Correct the line, and add the two assertions to the existing scope test, which already calls `reviewerScope` directly.

**Should-fix — `as-built.md:19`: the unplanned-paths list is incomplete.** It names three files and says "None of these paths was planned," but the ticket also changed `packages/db/src/sandbox/review.ts:179-180` (the triage's `parent_id is null` — mentioned in Shipped, absent from Deviations) and `packages/db/test/sandbox/erasure-fixtures.ts:29,36` (`seedCode` gained `displayName`). Add both.

**Should-fix — the collaborate predicate has two homes.** `viewer.ts:102-105` and `threads.ts:253-260` both spell out `slug = X and (reviewer_id is not null or parent_id is not null)`. The non-negotiable covers the reviewer scope and holds; the team's read is a separate authorization basis, so this is not a breach. But a later correction to one will silently miss the other, and the rule it encodes — what on a slug is a thread row and what is a team note — is exactly the rule that must not drift. Give the predicate one home both callers read.

**Consider — a removed root cannot be ordered or named.** `RemovedComment` (`threads.ts:107-113`) has no `createdAt`, and `assemble` returns live roots in `createdAt` order then removed roots in the order their oldest reply appeared (`:369`). Replies are oldest-first as Interfaces promises; roots are only within the live set. LAB-26 can place a removed pin by its anchor but cannot sort it into a timeline or the by-name list (`threads.md:34`). Either carry the oldest reply's `createdAt` on the removed root or state the order on the type.

**Consider — `Placement` is not what its type says.** `resolveRoot` returns `{ rootId, ...root }` (`threads.ts:507`, `:516`) where `root` also carries `id`, `parentId` and `reviewerId`; TypeScript does not excess-check spread properties, so three extra fields cross at runtime. Nothing downstream reads them today. Name the five fields explicitly so a later caller cannot trust `root.id` meaning the reply's root.

**Consider — an unnamed team-facing author.** `teamAuthor` falls back to `{ reviewer: "" }` when a label is null (`threads.ts:308`). Labels are required by LAB-15, so this is unreachable today; allowing `null` (as `ReviewerAuthor` already does) would let LAB-26 render a placeholder rather than an empty name if that ever changes.

The "Not verified" disclosure is honest and correctly scoped: the one race with real consequence — two saves racing the 500 cap — is serialized by the reviewer-row lock `saveReply` takes before resolving the root (`threads.ts:556-566`), the same lock `saveComment` uses.

VERDICT: PASS
