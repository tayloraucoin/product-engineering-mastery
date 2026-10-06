---
id: LAB-3
size: small
objective: "Sandbox reads and writes go through @pem/db/sandbox, which takes a verified viewer and only apps/web/lib/sandbox may import, and a suite proves no read or write crosses reviewers, slugs or roles."
slice_type: "Data-access isolation for guest rows without RLS (one-way door 4); the risk is one unscoped query leaking one reviewer's pins or reviews to another."
non_negotiables:
  - "Every viewer-facing function takes (db, viewer, input) with Viewer exactly as data-contract.md types it; reviewer functions filter by viewer.reviewerId and viewer.slug; team functions refuse a reviewer; admin-only functions refuse a developer."
  - "The gate group (Tickets-gate ruling) lives in packages/db/src/sandbox/gate.ts: (db, input) only, returning ids, versions and flags, and for a verified link token the access's email; never a feedback row or a label."
  - "One subpath export, @pem/db/sandbox; it imports neither next nor react, and never the getDb singleton: db is always an argument."
  - "A boundaries.js element web-sandbox lets only apps/web/lib/sandbox/** import @pem/db/sandbox, and keeps @pem/db/client and @pem/db/schema out of apps/web/app/experimental/** and apps/web/app/admin/**."
  - "The isolation suite in packages/db/test/sandbox/ runs every runtime export against every viewer kind; an export with no registered case fails it."
  - "Errors are fixed strings that never echo input."
devs_call: "The file split inside packages/db/src/sandbox/, the shape of the isolation-case registry, and the fixture builders."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md"
  - "D-LAB-34"
  - "D-LAB-37"
truth_files: "none: a data-access module; no living UX file changes"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "the isolation suite: every export against every viewer kind; an export with no case fails (mason)"
  - "the gate group returns nothing a caller without a viewer may not hold (warden)"
operator_review: false
planned_paths:
  - "packages/db/src/sandbox/**"
  - "packages/db/package.json"
  - "packages/db/test/sandbox/**"
  - "packages/config/eslint/boundaries.js"
  - "tooling/boundaries.test.ts"
depends_on:
  - LAB-1
  - LAB-2
out_of_scope:
  - "resolveViewer, the cookie, codes and the link token in apps/web/lib/sandbox: LAB-5."
  - "The throttle's functions: LAB-6 adds them to gate.ts with their cases."
  - "Each surface's own queries: its ticket adds the functions and their isolation cases."
  - "Guest rows under RLS, or a bridge guest context: rejected for v1 (R2)."
criteria:
  - id: C1
    statement: "Every export, called by each viewer kind (two reviewers on one slug, a reviewer on a second slug, a developer, an admin), reads and writes only what that viewer may; no row crosses."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C2
    statement: "The coverage guard fails for an export that has no registered isolation case (shown with a synthetic module)."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: "The gate group finds a live code's reviewer by hash only on its own slug; a revoked code, a foreign slug, a stale code_version, or a signed-in reviewer's access read by another user id each returns null."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C4
    statement: "recordAction writes one sandbox_actions row with actor, action, slug and counts only, and refuses a reviewer viewer."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "An apps/web file outside lib/sandbox importing @pem/db/sandbox is refused, as is an experimental or admin route file importing @pem/db/client or @pem/db/schema; lib/sandbox importing @pem/db/sandbox is allowed."
    evidence: test
    command: "yarn test:boundaries"
---

# Contract — LAB-3 sandbox-data-access

## Build notes

- **Approach:**
  - `src/sandbox/viewer.ts`: the `Viewer` type plus the scope guards (`reviewerScope`, `requireTeam`, `requireAdmin`). Build reviewer scoping as one helper, so LAB-25 can widen reads for collaborate mode in one place.
  - `src/sandbox/gate.ts`: the gate group.
  - `src/sandbox/actions.ts`: `recordAction`.
  - `src/sandbox/index.ts`: re-exports them, as the subpath `./sandbox`.
  - Model the module on the billing ledger: service-only queries in `@pem/db` (`src/billing/stripe-event-ledger.ts`), bound in the app (`apps/web/lib/billing/webhook/ledger.ts`), with a real-Postgres test (`test/stripe-event-ledger.test.ts`).
  - The isolation registry maps each export name to its cases. One test compares `Object.keys` of the module with the registry.
- **Decisions that apply:**
  - D-LAB-34 (R2): "Every sandbox table is service-only. `@pem/db/sandbox` functions take `(db, viewer, input)`, and a lint element (`web-sandbox`) lets only `apps/web/lib/sandbox/` import them. Isolation is proven by tests. Residual risk accepted on the record: isolation rests on one module, not RLS. Revisit when a second feature needs guest rows."
  - D-LAB-37 (R5): "The reviewer is the reviewer row (one code at a time); each gate entry records its email or user id per device, and every row carries both."
  - **Tickets-gate ruling (Taylor, 2026-10-05):** four reads and writes run before any viewer exists. They form the gate group in `gate.ts`, take `(db, input)`, and "return only ids, versions and flags (plus the access's email, for a verified link token). They never return a feedback row or a label, and the isolation suite proves it. Viewer stays as technical.md wrote it."
  - D-LAB-28: "The record of actions never names a reviewer or an email."
- **Interfaces:**
  - `type Viewer`; `findLiveReviewerByCodeHash(db, { slug, codeHash })` returns `{ reviewerId, codeVersion }` or null.
  - `createAccess(db, { reviewerId, codeVersion, email } | { reviewerId, codeVersion, userId })` returns `{ accessId }`.
  - `checkAccess(db, { accessId, slug, userId })` returns `{ reviewerId, accessId }` or null: it checks the row exists, the slug matches, the code is not revoked, the `code_version` is equal, and for a signed-in reviewer `user_id` equals `userId`.
  - `findAccessEmail(db, { accessId, slug })` returns the email or null.
  - `recordAction(db, teamViewer, { action, slug?, targetEmail?, counts? })`.
  - The builder may rename these, with a line in the as-built.
- **Per path:**
  - `src/sandbox/*.ts`: as above.
  - `package.json`: the `./sandbox` export, shaped like `./stripe-event-ledger`.
  - `test/sandbox/isolation.test.ts`, `test/sandbox/fixtures.ts`: C1 to C4.
  - `boundaries.js`: the `web-sandbox` element listed before `app-web` (first match wins), as `web-ai-route` is.
  - `tooling/boundaries.test.ts`: C5 cases, beside "app-web must not import web-ai-route".
- **Gotchas:**
  - `targetEmail` holds only a team member's email, on role changes. A reviewer's email never reaches `recordAction`.
  - `createAccess` lower-cases and trims the email in the caller (LAB-5), never here. Assert it arrives normalised.
  - The suite runs on the local database only. Type-only exports are not runtime keys; the guard skips them.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model writes a convenient unscoped "get by id", which is exactly the leak.
