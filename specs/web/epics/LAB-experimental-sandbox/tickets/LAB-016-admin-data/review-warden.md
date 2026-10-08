# Review — warden on LAB-16

> Written by `yarn review:run warden LAB-16`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 8c1b1605ef1938ac7b89fd2cda1d2c04bde3779008ffee28b115f8092d73367e
- criteria_sha256: 770c82a6452886aacf1fc872b14a362dd0334df30599a7c283d894af20a2f357
- as_built_sha256: 6ee5aec2e8bb7f0215bdebf91cdda875ad90ae82cd3cffb3f176231e6dc016c1
- head: eff9425ea2ce895189537dccb1cc15d59d7a94c8
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: unknown
- at: 2026-10-08T02:16:47Z
- run: 1 of warden on LAB-16
- tokens_input: 0
- tokens_cache_read: 0
- tokens_cache_write: 0
- tokens_output: 0
- seconds: 9.1
- verdict: none (the reviewer did not finish with a VERDICT line)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden LAB-16`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket LAB-16 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

This is the only review pass unless you FAIL it, so list every finding now. A PASS is final for its round: Should-fix and Consider findings become follow-ups the builder fixes without reopening the review, and nothing you hold back is asked for later. Only a Blocking finding earns a second pass.

Read, in this order:
1. The contract: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised, and what you judge the changes against.
2. The results: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/as-built.md. What the builder says shipped, and every deviation. It is a claim to check inside the changed files, not an invitation to read the repo.
4. The evidence:
   - C1 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C1.log (sha256 9b1a4eaf163a)
   - C2 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C2.log (sha256 9b1a4eaf163a)
   - C3 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C3.log (sha256 3b64d7114e79)
   - C4 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C4.log (sha256 9b1a4eaf163a)
   - C5 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C5.log (sha256 9b1a4eaf163a)
   - C6 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C6.log (sha256 3b64d7114e79)
   - C7 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C7.log (sha256 9b1a4eaf163a)
   - C8 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C8.log (sha256 3b64d7114e79)
   - C9 test: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C9.log (sha256 3b64d7114e79)
   - C10 manual: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/C10-operator.md (sha256 7e50d3c9545e)
   - C11 capture: specs/web/epics/LAB-experimental-sandbox/tickets/LAB-016-admin-data/evidence/data-states.png (sha256 8095d33f3370)
5. The changed files, this ticket's planned paths against main (other tickets share the branch): apps/web/app/admin/data/_components/erase-section.tsx, apps/web/app/admin/data/_components/record-table.tsx, apps/web/app/admin/data/actions.ts, apps/web/app/admin/data/loading.tsx, apps/web/app/admin/data/page.tsx, apps/web/app/admin/experiments/[slug]/data/_components/data-tab.tsx, apps/web/app/admin/experiments/[slug]/data/actions.ts, apps/web/app/admin/experiments/[slug]/data/loading.tsx, apps/web/app/admin/experiments/[slug]/data/page.tsx, apps/web/lib/sandbox/admin-data-data.ts, apps/web/lib/sandbox/admin-data-view.ts, apps/web/lib/sandbox/admin-data.test.ts, apps/web/lib/sandbox/admin-data.ts, apps/web/lib/sandbox/admin-nav.ts, apps/web/lib/sandbox/state.ts, packages/db/src/sandbox/erasure.ts, packages/db/src/sandbox/index.ts, packages/db/test/sandbox/codes-cases.ts, packages/db/test/sandbox/codes.test.ts, packages/db/test/sandbox/comments.test.ts, packages/db/test/sandbox/erasure-cases.ts, packages/db/test/sandbox/erasure-fixtures.ts, packages/db/test/sandbox/erasure.test.ts, packages/db/test/sandbox/experiment.test.ts, packages/db/test/sandbox/fixtures.ts, packages/db/test/sandbox/isolation.test.ts, packages/db/test/sandbox/registry.ts, packages/db/test/sandbox/review.test.ts, packages/db/test/sandbox/roles.test.ts, packages/db/test/sandbox/schema.test.ts, packages/db/test/sandbox/threads-cases.ts, packages/db/test/sandbox/threads.test.ts, packages/db/test/sandbox/throttle.test.ts. Judge these changes against the criteria and the non-negotiables.
6. The surface the ticket cites: specs/web/epics/LAB-experimental-sandbox/ux/admin/data.md. Read only the parts the contract names (D-LAB-3, D-LAB-26, D-LAB-27, D-LAB-28, C-LAB-data-1, C-LAB-data-2, C-LAB-data-3, C-LAB-data-4, C-LAB-data-5, C-LAB-data-6, C-LAB-data-7), not the whole file.

Stay inside the changed files. Follow an import one hop out of a changed file only to confirm a Blocking finding, never to look for one, and never further than that hop.

For each criterion, say whether the evidence and the changed code show it is met. Then list every finding, graded Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL; a Should-fix or Consider finding never does.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

(no review: You've hit your session limit · resets 10:10pm (America/Vancouver))
