---
id: WEB-15
size: small
objective: "The sandbox slug check exists once, in @pem/db/sandbox, and the twelve copies in apps/web and packages/db call it, so a new sandbox function cannot accept a slug the column refuses."
slice_type: "Refactor of input validation across two workspaces; the risk is a copy whose error path changes (which domain error is thrown) while the check moves."
non_negotiables:
  - "The pattern and the 48 cap come only from SANDBOX_SLUG_PATTERN and SANDBOX_SLUG_MAX in packages/db/src/schema/sandbox/columns.ts."
  - "Each caller keeps its own refusal: the same domain error, result or not-found as today."
  - "No new boundaries edge: apps/web/lib/sandbox already imports @pem/db/sandbox."
devs_call: "Whether the helper is a type guard only or also an asserting variant; where in db/src/sandbox it lives."
cites:
  - "D1"
truth_files: "none: no behaviour changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/db/src/sandbox/slug.ts"
  - "packages/db/src/sandbox/slug.test.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/src/sandbox/erasure.ts"
  - "packages/db/src/sandbox/experiments.ts"
  - "packages/db/src/sandbox/actions.ts"
  - "packages/db/src/sandbox/codes.ts"
  - "packages/db/src/sandbox/threads.ts"
  - "packages/db/src/sandbox/team.ts"
  - "packages/db/src/sandbox/comments.ts"
  - "packages/db/src/sandbox/experiment.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
  - "apps/web/lib/sandbox/slug.ts"
  - "apps/web/lib/sandbox/validators.ts"
  - "apps/web/lib/sandbox/review-variants.ts"
  - "apps/web/lib/sandbox/comments.ts"
  - "apps/web/lib/sandbox/threads.ts"
  - "apps/web/lib/sandbox/experiment.ts"
  - "apps/web/lib/sandbox/cookie.ts"
  - "apps/web/lib/sandbox/review.ts"
  - "apps/web/app/experimental/_experiments/registry.ts"
  - "apps/web/eslint.config.mjs"
  - "packages/db/eslint.config.mjs"
depends_on: []
out_of_scope:
  - "Changing the slug pattern or cap."
  - "Slugs in apps/docs (file-path routes, unrelated)."
criteria:
  - id: C1
    statement: "isSandboxSlug accepts a-b-1 and a 48-character slug, and refuses a 49-character one, a leading or doubled hyphen, upper case and a non-string."
    evidence: test
    command: "yarn workspace @pem/db test"
  - id: C2
    statement: "The web sandbox suites still pass with every validSlug and SLUG copy replaced."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A slug regex literal or new RegExp(SANDBOX_SLUG_PATTERN) outside packages/db/src/sandbox/slug.ts fails lint, naming isSandboxSlug."
    evidence: check
    command: "yarn lint"
---

# Contract — WEB-15 sandbox-slug-check

## Build notes

- **Approach:** (audit: `specs/web/audits/2026-10-08-duplicated-logic.md`, D1) `packages/db/src/sandbox/slug.ts` holds `isSandboxSlug` and `SANDBOX_SLUG` over the column constants; the six db copies call it. A function cannot leave `@pem/db/sandbox` (the isolation suite's coverage guard files every exported function as gate or viewer), so the package exports only the constants `SANDBOX_SLUG` and `SANDBOX_SLUG_MAX`, each with a support case in `isolation.test.ts`. `apps/web/lib/sandbox/slug.ts` binds the web check to them; the web copies and `registry.ts` (a route file, which may not import `@pem/db/sandbox`) go through it. A `no-restricted-syntax` guard in both ESLint configs refuses the literal, the pattern string and `new RegExp(SANDBOX_SLUG_PATTERN)`.
- **Decisions that apply:** D-LAB-34 (only `apps/web/lib/sandbox` imports `@pem/db/sandbox`; every runtime export has isolation cases).
- **Interfaces:** `@pem/db/sandbox`: `SANDBOX_SLUG`, `SANDBOX_SLUG_MAX`. `apps/web/lib/sandbox/slug.ts`: `isSandboxSlug`, and both constants re-exported.
- **Per path:** db and web `slug.ts` are new; each caller drops its copy and keeps its own refusal. Design ids (24-character cap) share the slug's shape: the four design-id literals the guard found (db `comments.ts`, `experiment.ts`; web `validators.ts`, `review-variants.ts`) now use `SANDBOX_SLUG` with their own cap.
- **Gotchas:** `cookie.ts` and review question keys used the pattern without the 48 cap at that call; they keep `SANDBOX_SLUG.test` / `.max`, not `isSandboxSlug`, so nothing gets stricter. No client module imports the files that now reach `@pem/db/sandbox` (checked: `review-form.tsx` imports only `lib/sandbox/client/`).
- **Model:** Opus 5.5; the error paths differ per file and a sweep that unifies them changes behaviour.
