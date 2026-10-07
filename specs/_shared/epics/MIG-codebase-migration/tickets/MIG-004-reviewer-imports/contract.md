---
id: MIG-4
size: small
objective: "A reviewer row can match files by what they import, so a Stripe call in an ordinary component reaches Mason and Warden; yarn check-reviewers fails a row that matches nothing in a migrated repo."
slice_type: "The layout file's shape (a one-way door: toolkit.json, tooling/lib/toolkit.ts, the template) and a new verify check; the risk is a Q3 change shipping at Q1 because no glob reached it (Risk 6)."
non_negotiables:
  - "A reviewer row takes an optional imports: string[] and may then omit glob; validateToolkit requires at least one of glob and imports and rejects an empty imports list."
  - "A file matches an imports row when a static import or require names one of the listed modules or a subpath of it (stripe and stripe/webhooks both match stripe); tooling/lib/specs.ts applies this to a ticket's existing planned files and its diff, and planned files that do not exist yet match by glob only."
  - "yarn check-reviewers fails under the overlay tiers when a row matches zero tracked files, naming the row; at starter it prints that it is skipped and exits 0."
  - "check-reviewers joins the verify chain in package.json, after check-settings."
  - "The seeded import rows go in the template and this repo's toolkit.json: stripe to mason, warden and chancery; the auth SDKs (@supabase/*, next-auth, @clerk/*, better-auth) to mason and warden; resend to warden. No row for an AI SDK (T11)."
  - "The fallback named in T6 is written into the as-built if the time box runs out: assess writes per-file rows, and the zero-match check still lands."
devs_call: "The import scanner's exact regexes, how a glob-plus-imports row combines (either matches), the check's output format, and the test file layout."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T6"
  - "T11"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - mason
  - vigil
focus:
  - "the reviewers[].imports shape in tooling/lib/toolkit.ts, toolkit.json and the template: a one-way door (mason)"
operator_review: false
planned_paths:
  - "tooling/lib/toolkit.ts"
  - "tooling/lib/specs.ts"
  - "tooling/check-reviewers.ts"
  - "tooling/check-reviewers.test.ts"
  - "toolkit.json"
  - "docs/engineering/templates/toolkit.template.json"
  - "package.json"
  - "docs/engineering/tooling.md"
depends_on: []
out_of_scope:
  - "The SDK-importer listing in the assess report: MIG-6 reads the toolkit globs only."
  - "A Loom reviewer row for AI imports: T11, no seat."
  - "Widening any glob to **, or per-file rows written by hand (beats in T6)."
  - "The ledger lines recording imports and the zero-match rule: MIG-11."
criteria:
  - id: C1
    statement: 'A row with imports ["stripe"] matches a file importing stripe or stripe/webhooks outside every glob, and does not match a file whose only mention of stripe is in a comment or a string.'
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "validateToolkit rejects a row with neither glob nor imports, and a row with an empty imports list, naming the row; it accepts a row with imports and no glob."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "suggestReviewers on a contract whose planned path is a tracked file importing stripe suggests mason, warden and chancery with the import as the reason."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "On a scratch repo at tier overlay, check-reviewers exits 1 naming a row that matches zero tracked files and exits 0 once the row is deleted; on the same repo at tier starter it exits 0 and says it is skipped."
    evidence: test
    command: "yarn test:tooling"
  - id: C5
    statement: "package.json's verify chain runs check-reviewers right after check-settings, and spawning the script in this repo at tier starter exits 0 and prints that it is skipped."
    evidence: test
    command: "yarn test:tooling"
  - id: C6
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
  - id: C7
    statement: "This repo's toolkit.json and the template still validate, with the seeded import rows."
    evidence: check
    command: "yarn check-stack"
---

# Contract — MIG-0 reviewer-imports

## Build notes

- **Approach:** extend `ToolkitReviewer` with `imports?: string[]` and make `glob` optional, then `validateToolkit`. In `specs.ts`, `suggestReviewers` gains an import pass over the planned paths that are tracked files (read, scan for `import ... from "m"`, `import "m"`, `export ... from "m"`, `require("m")`, `await import("m")`), and the diff-side matcher used by `review:run` and `check-specs` reuses it; the glob pass is untouched. `tooling/check-reviewers.ts` loads the toolkit, exits 0 with a skipped line at starter, and under overlay walks `git ls-files` once, matching every row by glob and by imports; a zero-match row fails. Tests on scratch repos in `$TMPDIR` built with `freshRepo()` plus a rewritten `toolkit.json`; the overlay case does not need MIG-1's single-app helper.
- **Decisions that apply:**
  - T6: "Reviewer rows take an optional `imports` list. The new `check-reviewers` fails a row matching zero files under overlay. Assess lists every money, auth, email or AI SDK importer." If wrong: "A Q3 change ships at Q1; fallback named."
  - assess.md, T6: "A reviewer row in `toolkit.json` takes an optional `imports: string[]` and may then omit `glob`. A file matches the row when it imports one of those modules. `tooling/lib/specs.ts` applies the rule to a ticket's existing planned files and its diff. Planned files that do not exist yet match by glob only." Seeded rows: "Stripe goes to mason, warden and chancery, as the billing globs do. Auth SDKs go to mason and warden; email to warden (personal data)." Zero-match: "At `starter` the check is skipped, because a starter's rows are seats for modules not built yet (`**/legal/**` here)."
  - T11: "No seat; AI importers are listed in the report only."
- **Interfaces:** `ToolkitReviewer.imports`; a matcher exported from `specs.ts` (name is the builder's) used by `suggestReviewers` and the diff reviewer lookup; the script `check-reviewers` in package.json and `verify`.
- **Per path:**
  - `tooling/lib/toolkit.ts`: the type and validation (C2).
  - `tooling/lib/specs.ts`: the import scanner and its use in `suggestReviewers` and the diff matcher (C1, C3).
  - `tooling/check-reviewers.ts`, `tooling/check-reviewers.test.ts`: the check and C1 to C4.
  - `toolkit.json`, `docs/engineering/templates/toolkit.template.json`: the seeded rows, `status: draft`.
  - `package.json`: the script and its place in `verify`.
  - `docs/engineering/tooling.md`: one entry for `check-reviewers`, scored as §2 says.
- **Gotchas:**
  - `samplePaths` in `specs.ts` reads `row.glob.split("/")`; a row without a glob must be skipped there or it throws.
  - `check-specs` and `review:run` look up reviewers for a ticket's diff through the same map; keep one function so the two never disagree.
  - `package.json` is shared with parallel threads (MIG-5 adds `migrate:assess`); commit only your own lines.
  - A seeded row is a seat, never an assignment: the operator confirms reviewers at the Tickets gate (qa-levels.md).
  - The import scan reads tracked source files only; never open a file matching an env-file pattern (the sandbox denies it and the scan does not need it).
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to match module names as substrings and seat Warden on every file that mentions a word.
