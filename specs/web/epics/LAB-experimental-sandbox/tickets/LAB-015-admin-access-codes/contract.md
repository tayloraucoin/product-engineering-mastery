---
id: LAB-15
size: medium
objective: "The team makes a code for one person and sees it once, replaces or revokes it, and reads which codes are live and which emails used them, on an experiment's Access codes tab."
slice_type: "Issuing guest credentials (one-way doors 3 and 6); the risk is a code that survives in clear past its one response, a replace that orphans a reviewer's pins, or a closed experiment that still issues codes."
non_negotiables:
  - "A code exists in clear only in the make or replace action's response; no page render, list read, record row, log, URL, toast or browser storage holds it, and the client drops it on Done or Escape."
  - "Codes come from LAB-5's code.ts (generateCode, hashCode) only; the database stores and compares the SHA-256 hash, never the code."
  - "Replace rewrites code_hash and bumps code_version in place on the same reviewer row, clearing revoked_at (D-LAB-23); revoke sets revoked_at; both take effect on the reviewer's next load through LAB-3's checkAccess (S10)."
  - "On a closed experiment the server refuses make and replace with closed; revoke stays open."
  - "The display name is required on a collaborate experiment and stored null on a private one; an empty label is refused."
  - "Every action runs requireTeamAction() (developers and admins, S3) and, in the same transaction as its write, recordAction with the action and slug only: never the label, display name, an email, the code or its hash (D-LAB-28)."
  - "New queries live in packages/db/src/sandbox/codes.ts, take (db, viewer, input), refuse a reviewer viewer, and each has its isolation case in packages/db/test/sandbox/."
devs_call: "The component split, the action result names, the label and display-name length limit, and how a failed emails-used read becomes the partial state."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/admin/access-codes.md"
  - "D-LAB-16"
  - "D-LAB-23"
  - "D-LAB-28"
  - "C-LAB-codes-1"
  - "C-LAB-codes-2"
  - "C-LAB-codes-3"
  - "C-LAB-codes-4"
  - "C-LAB-codes-5"
  - "C-LAB-codes-6"
  - "C-LAB-codes-7"
truth_files: "none: the approved proposal ux/admin/access-codes.md reaches specs/web/ux/admin/access-codes.md through yarn truth:promote LAB once its citing tickets close"
qa: Q3
reviewers:
  - assay
  - warden
focus:
  - "the code exists in clear only in the shown-once response (warden)"
operator_review: false
planned_paths:
  - "apps/web/app/admin/experiments/[slug]/codes/**"
  - "apps/web/lib/sandbox/admin-codes*.ts"
  - "apps/web/lib/sandbox/emails-used*.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/codes.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/**"
depends_on:
  - LAB-5
  - LAB-10
out_of_scope:
  - "Generating, normalising and hashing codes, and the gate's check: LAB-5. The gate page: LAB-7."
  - "The Reviewers tab, which reuses emails-used.ts: LAB-22. Rendering record rows: LAB-16."
  - "Beat 2's use of the display name: LAB-25, LAB-26. Sending the code by email: never (S6)."
criteria:
  - id: C1
    statement: "Making a code returns it and its link once; the codes list read, the page render after Done and every record row hold neither the code nor its hash, and a second read of the same reviewer cannot return it."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "On the local database, a revoked code's access fails checkAccess on the next call, and the reviewer's comments and versions are still there."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: "On the local database, replacing a live or revoked code bumps code_version and clears revoked_at; the old code's hash finds nothing, its accesses fail checkAccess, the new code finds the same reviewer id, and that reviewer's comments and versions are still theirs."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C4
    statement: 'On a collaborate experiment a make without a display name is refused; on a private one the field is absent and the stored display name is null; an empty label is refused with "Enter who this code is for."'
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "On a closed experiment the make and replace actions return closed with a store stub, which throws when called, never called; revoke still succeeds."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: 'On a closed experiment "Make a code" and "Replace code" are disabled with "This experiment is closed."'
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/codes-closed.png"
  - id: C7
    statement: 'Emails used flags "2 emails used with this code" for two typed emails, and "Email differs from the label" only when the label is an email that differs ignoring case; a name label is never flagged.'
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "Each codes.ts function's isolation case passes for every viewer kind; a reviewer viewer is refused and no slug's codes reach another's list."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C9
    statement: 'With keyboard alone and a screen reader: make a code, copy it, revoke one and replace one; focus lands on "Copy code" and "Code copied." is announced.'
    evidence: manual
    reason: "Needs a person with a screen reader; there is no end-to-end runner (technical.md). The builder checks focus and names in the browser pane first, then hands it over with --verdict deferred."
  - id: C10
    statement: "Every access-codes.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-015-admin-access-codes/evidence/codes-states.png"
  - id: review:assay
    statement: Assay reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run assay <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — LAB-15 admin-access-codes

## Build notes

- **Approach:**
  - `packages/db/src/sandbox/codes.ts`, team-only: `listCodes`, `makeCode`, `replaceCode`, `revokeCode`. Each write and its `recordAction` share one transaction. Register each in LAB-3's isolation registry, or the coverage guard fails.
  - `lib/sandbox/admin-codes.ts` (pure): `makeCodeWith`, `replaceCodeWith`, `revokeCodeWith(deps, member, input)`, taking the registry, `generateCode` and `hashCode` as deps, with the Words. `admin-codes-data.ts` (`server-only`) binds the db, LAB-8's `requireTeamAction()` and LAB-4's `findExperiment`. Model the seam on `apps/web/lib/billing/webhook/handle.ts` and its test.
  - `codes/page.tsx` under LAB-10's layout: `requireTeamPage`, then `listCodes`, then the table on the composed `data-table`. `actions.ts` holds the three actions. The shown-once dialog is a client leaf that keeps the code in component state only.
- **Decisions that apply:**
  - D-LAB-16: "Beat 2 shows a display name set on the code, never the email", because "Names without leaking addresses".
  - D-LAB-23: "'Replace' issues a new code for the same reviewer; their pins and review carry over. It also restores a revoked code."
  - D-LAB-28: "The record of actions never names a reviewer or an email."
  - D-LAB-6 (experimental/overview.md): "The reviewer is the code: one code is one person on any device; each typed email is recorded."
  - R4 (D-LAB-36): "codes rotated in place". gate.md: "Replace rewrites the hash and bumps `code_version` in place (D-LAB-23), so pins and versions stay the reviewer's and old devices return to the gate."
  - D-LAB-31 (gate.md): codes are "Never logged, never in a URL, never returned after the shown-once dialog."
  - S3 (brief, as amended): developers and admins both make, replace and revoke codes. S6: the code is shown once. S10: "Every request re-checks that the code is still live." S12c: each action leaves a record of who acted and when.
- **Interfaces:**
  - `listCodes(db, team, { slug })` returns `{ reviewerId, label, displayName, emailsUsed, lastUsedAt, revoked }[]`, newest first.
  - `makeCode(db, team, { slug, label, displayName, codeHash })` returns `{ reviewerId }`; `replaceCode(db, team, { slug, reviewerId, codeHash })` returns `{ codeVersion }`; `revokeCode(db, team, { slug, reviewerId })`.
  - Actions `makeCode`, `replaceCode`, `revokeCode(slug, prev, formData)` return `made` (`code`, `link`), `revoked`, `closed`, `invalid` (field) or `failed`.
  - `emailsUsedFlags(label, emails)` in `emails-used.ts` returns `{ several, differsFromLabel }`; LAB-22 reuses it.
  - Record actions `code_made`, `code_replaced`, `code_revoked`, each with the slug; LAB-16 renders their words.
- **Gotchas:**
  - Never `console.log` form data or an action result. Never `revalidatePath` with the code in scope of a render, and never put it in `searchParams`, a toast or `localStorage`.
  - The link is env's site URL plus `/experimental/<slug>`, with no `?r=` (that token needs an access), never the request host.
  - A unique violation on `code_hash` is 80-bit improbable: retry generation once, then `failed`.
  - Revoke and replace scope by `slug` and `reviewer_id` together, so a reviewer id from another slug matches no row.
  - `[ASSUMPTION: "Emails used" lists typed emails only; a signed-in access counts in "Last used" and shows its account email on the Reviewers tab (LAB-22).]`
  - `codes-copied` holds "Copied" for 2 seconds; under reduced motion, dialogs fade by opacity only.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model returns the code from the list "for convenience" or records the label in the action row.
