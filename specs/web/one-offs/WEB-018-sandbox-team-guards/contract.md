---
id: WEB-18
size: small
objective: "Which roles count as the team is answered once, by isTeamRole in @pem/db/sandbox, and admin actions share one refused result, so a new role or a new admin action changes one place."
slice_type: "Refactor of an authorization predicate; the risk is a role check that widens or narrows while it moves."
non_negotiables:
  - "Exactly developer and admin are the team, as today; admin-only checks are unchanged."
  - "requireTeam and requireAdmin keep their errors."
  - 'Every refused result is still { outcome: "refused" } to its caller and its type.'
devs_call: "Whether ROLE_CHANGE_REFUSED stays a typed alias of TEAM_ACTION_REFUSED or is replaced."
cites:
  - "D5"
truth_files: "none: no behaviour changes"
qa: Q2
reviewers:
  - vigil
focus:
  - "the role checks: no caller's set of allowed roles changes (vigil)"
operator_review: false
planned_paths:
  - "packages/db/src/sandbox/viewer.ts"
  - "packages/db/src/sandbox/index.ts"
  - "apps/web/lib/sandbox/admin/admin-data.ts"
  - "apps/web/lib/sandbox/admin/admin-codes.ts"
  - "apps/web/lib/sandbox/admin/people.ts"
  - "apps/web/lib/sandbox/admin/admin-gate.ts"
depends_on: []
out_of_scope:
  - "Adding a role."
  - "@pem/api's admin tier (packages/api/src/trpc.ts), a different role source."
criteria:
  - id: C1
    statement: "isTeamRole is true for developer and admin only; requireTeam uses it."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C2
    statement: "The admin data, codes and people suites pass with the predicate and the refused result shared."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — WEB-18 sandbox-team-guards

## Build notes

- **Approach:** (audit: `specs/web/audits/2026-10-08-duplicated-logic.md`) export `isTeamRole` beside `requireTeam` (`viewer.ts:49`); `admin-data.ts:142` and `admin-codes.ts:88` call it; `DATA_ACTION_REFUSED` and `ROLE_CHANGE_REFUSED` reuse `TEAM_ACTION_REFUSED` (`admin-gate.ts:76`).
- **Decisions that apply:** the team/reviewer split in `viewer.ts`'s header.
- **Interfaces:** `isTeamRole(role: unknown): boolean` from `@pem/db/sandbox`.
- **Per path:** viewer.ts and index.ts add and export it; the web files call it.
- **Gotchas:** `admin-gate.ts` is web-side; check `people.ts` may import it without a cycle.
- **Model:** Sonnet 5.5 is enough; the vigil review covers the predicate.
