---
id: LAB-9
size: medium # Taylor, 2026-10-05: the first-admin script stays here, which takes the ticket past half a day
objective: "An admin sees who has signed up and sets each person's role to user, developer or admin; the last admin cannot remove their own role, every change is recorded, and a script sets the first admin."
slice_type: "Role grants through the service role (one-way door 1); the risk is an app left with no admin, a developer or a stale session changing a role, or a record that names a reviewer."
non_negotiables:
  - "changeRole calls LAB-8's requireTeamAction({ adminOnly: true }) first, validates { userId, role } against APP_ROLES, and returns fixed results only."
  - "The last-admin guard runs in the action, inside withRoleChangeLock: pg_advisory_xact_lock in one transaction, in packages/db/src/sandbox/, refusing a reviewer and a developer, with its isolation case in packages/db/test/sandbox/. The disabled select is a courtesy only."
  - "Roles are written to app_metadata.role through apps/web/lib/supabase/admin.ts only; no other app_metadata key changes."
  - "Each change calls recordAction with the actor, the action and targetEmail, the changed team member's email, never a reviewer's (D-LAB-28)."
  - 'The line under the heading is R11''s: "Changes take effect the next time they open a page." Every other string is people.md''s Words verbatim.'
  - "yarn workspace @pem/db db:grant-admin <email> makes an existing account admin through the Auth admin API: unknown email refused, idempotent, redirect: 'error', the key never printed."
  - "Only @pem/ui components and preset tokens; no slop tell (canon §2, A-01 to A-20)."
devs_call: "The action's result names, how users are paged and filtered at 50, the record's action names, the lock key, and where the toast is raised."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/admin/people.md"
  - "D-LAB-26"
  - "D-LAB-28"
  - "C-LAB-people-1"
  - "C-LAB-people-2"
  - "C-LAB-people-3"
  - "C-LAB-people-4"
  - "C-LAB-people-5"
  - "C-LAB-people-6"
truth_files: "none: the approved proposal ux/admin/people.md reaches specs/web/ux/admin/people.md through yarn truth:promote LAB once its citing tickets close; promotion reconciles R11's line"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "last-admin guard inside the action, under an advisory lock (warden)"
operator_review: false
planned_paths:
  - "apps/web/app/admin/people/**"
  - "apps/web/lib/sandbox/people.ts"
  - "apps/web/lib/sandbox/people-data.ts"
  - "apps/web/lib/sandbox/people.test.ts"
  - "apps/web/lib/sandbox/admin-nav.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/**"
  - "packages/db/test/sandbox/**"
  - "packages/db/scripts/grant-admin.ts"
  - "packages/db/scripts/grant-admin.test.ts"
  - "packages/db/package.json"
depends_on:
  - LAB-3
  - LAB-8
out_of_scope:
  - "The shell, the nav and the guards: LAB-8. Reading the record of actions: LAB-16."
  - "A developer-or-admin policy twin: none in v1 (R3)."
  - "Running the script on a hosted project: the operator's step, written into LAB-24's runbook."
criteria:
  - id: C1
    statement: 'An admin making a user a developer writes app_metadata.role developer, keeps their other app_metadata keys (provider, providers), records one action naming that user''s email, and returns the outcome whose toast reads "ben@example.com is now a developer."; for an admin the nav''s People entry is a link.'
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "The only admin lowering their own role, by a direct action call, is refused with nothing written or recorded; with a second admin it succeeds."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A developer, a user and a code holder calling changeRole are refused with nothing written, and a developer on /admin/people gets not-found."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "On the local database withRoleChangeLock refuses a reviewer and a developer, and two concurrent calls run one after the other, so two admins demoting each other leave one admin."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "Against a stubbed Auth admin API, grant-admin makes an existing account admin and keeps its other app_metadata keys, refuses an unknown email with a fixed message, changes nothing on a second run, and never prints the key."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C6
    statement: "Each role change asks for confirmation naming its consequence, with people.md's words and button."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/people-confirm.png"
  - id: C7
    statement: "With keyboard alone and a screen reader: filter, change a role and confirm; focus returns to the select."
    evidence: manual
    reason: "Needs a person with VoiceOver or NVDA; no screen-reader runner exists. The builder checks the keyboard path and aria wiring first, then hands it over with --verdict deferred."
  - id: C8
    statement: "Every people.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-009-admin-people/evidence/people-states.png"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — LAB-9 admin-people

## Build notes

- **Approach:**
  - `packages/db/src/sandbox/roles.ts`: `withRoleChangeLock(db, viewer, fn)`, admin only, runs `fn` inside `pg_advisory_xact_lock` in one transaction.
  - `lib/sandbox/people.ts` (pure): `changeRoleWith(deps, actor, input)` gives `changed`, `last-admin`, `refused` or `failed`, with the Words. `people-data.ts` (`server-only`) binds `createSupabaseAdminClient`, the lock and `recordAction`. Inside the lock: count admins, refuse the last one's own demotion, write, record. Model the seam on `apps/web/lib/billing/webhook/handle.ts`.
  - `app/admin/people/`: page, `actions.ts` and client leaves (filter, role `Select`, `AlertDialog`, toast). Flip People to `ready: true` in `admin-nav.ts`.
  - `grant-admin.ts`: prior art is `packages/db/scripts/local-users.ts` (the Auth admin API over `fetch`, both key forms, `redirect: "error"`) and `scripts/env.ts` `authSettings()`. It sits in `@pem/db` because `admin` predates LAB, so it survives removing the stack entry.
- **Decisions that apply:**
  - D-LAB-26: "Only an admin deletes an experiment's data, open or closed. Developers see the counts, not the button. Erasing a reviewer stays open to developers."
  - D-LAB-28: "The record of actions never names a reviewer or an email." data-contract.md: `target_email` is for "role changes only: a team member, never a reviewer".
  - R3 (D-LAB-35): "`developer` joins `APP_ROLES`. No policy twin in v1: no policy would read it (rule 9). People writes `app_metadata` via the service-role client, with the last-admin guard in the action."
  - R11: "Changes take effect the next time they open a page.": `getUser()` reads the Auth database on every request.
  - S2 (brief): "A guard stops the last admin from removing their own role. The first admin is set once by a runbook step (a script using the service key)."
  - S12c (brief): "Granting a role ... each leave a record of who acted and when."
  - placement.md: "Two admins demoting each other in the same instant is an accepted, recoverable race: the runbook's first-admin script restores an admin."
  - Taylor, 2026-10-05 (this thread): the script is built here, not left to LAB-24, since every `/admin` ticket needs an admin.
- **Interfaces:** `withRoleChangeLock`; `changeRoleWith`, `PEOPLE_WORDS`; `changeRole(prev, formData)`; the `db:grant-admin` script.
- **Per path:**
  - `app/admin/people/**`: page, action, leaves.
  - `people*.ts`: core, binding, C1 to C3.
  - `admin-nav.ts`: People ready.
  - `state.ts`: the `people-*` keys as `team`.
  - `packages/db/src/sandbox/`, `test/sandbox/`: the lock, its isolation case, C4.
  - `grant-admin*.ts`, `package.json`: the script, C5.
- **Gotchas:**
  - Hosted `DATABASE_URL` is the transaction pooler: use `pg_advisory_xact_lock` inside the transaction, never a session lock.
  - `[ASSUMPTION: GoTrue merges top-level app_metadata keys on update; verify against the installed auth-js, else read and write the whole object inside the lock.]`
  - Count admins inside the lock, through the Auth admin API, never from the session.
  - Demoting yourself lands on Experiments, or on the 404 if no role is left (LAB-8's guards on the next request).
  - LAB-24's runbook calls `yarn workspace @pem/db db:grant-admin`. LAB-2's out_of_scope line still names LAB-24 for the script.
  - Fixtures: `ana@example.com`, `ben@example.com`. Never log an email or the key.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model guards only in the UI, or counts admins outside the lock.
