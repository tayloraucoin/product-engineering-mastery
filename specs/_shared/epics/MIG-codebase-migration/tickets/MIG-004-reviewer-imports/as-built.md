# As-built — MIG-4

## Shipped against the contract

- **C1:** `listImportedModules` in `tooling/lib/specs.ts` tokenizes the source (comments dropped; strings, templates and regex literals kept as single tokens) and reads `from "m"`, `import "m"`, `import("m")` and `require("m")`; `importsModule` matches the module, its subpaths and an `@scope/*` entry, never a longer name (`stripe-mock`, `@stripe/stripe-js`). Tested in process and in a scratch repo, where a file naming stripe only in a comment and a string matches nothing.
- **C2:** `ToolkitReviewer.glob` is optional and `imports?: string[]` is new. `validateToolkit` names a row with neither, an empty list, each malformed or repeated module, and any row key outside `glob, imports, role, why, status` (review round: a typo such as `import` no longer passes silently).
- **C3:** `suggestReviewers` adds an import pass over the tracked files each planned path holds, with the reason `<file> imports <specifier>`. A planned file not yet tracked matches by glob only. `samplePaths` skips rows that have no glob.
- **C4:** `tooling/check-reviewers.ts` skips at `starter` and exits 0. Under overlay it walks `git ls-files` once through `findRowReach` (the glob, then `findImportMatch`) and fails, naming `reviewers[i] (glob …; imports …; role …)`. A row carrying both is checked half by half and names the dead half (review round). It reads `git ls-files -z`, so non-ASCII paths match.
- **C5:** `check-reviewers` is in `package.json`, and in `verify` right after `check-settings`.
- **C6, C7:** tooling types pass. `toolkit.json` and the template carry the six seeded import rows (`stripe` and `@stripe/*` go to mason, warden and chancery, the client packages added in the review round; auth SDKs to mason and warden; resend to warden; no AI row), all `status: draft`. A test also validates the template.
- `docs/engineering/tooling.md`: one `check-reviewers` entry, plus a §4 row (net 2.8).

## Deviations

- [ASSUMPTION] An entry may name a whole scope as `@scope/*`, because the contract seeds `@supabase/*` and `@clerk/*`. The validator accepts a package, a subpath or a scope wildcard.
- [ASSUMPTION] "Its diff" is covered only for the diff files inside the ticket's planned paths. `review:run` and `check-specs` have no diff-side reviewer lookup today, and neither is a planned path here. `suggestReviewers` scans every tracked file a planned path holds. A file the builder touches outside the planned paths is never scanned, so a Stripe import added there reaches no seat (Vigil, S1). That gap is drafted as a follow-up. The import half (`findImportMatch`) is the one function both `suggestReviewers` and `check-reviewers` use.
- Known limits of the scanner, each pinned or drafted as a follow-up:
  - JSX text holding `from "x"` reads as an import (pinned by a test). An unterminated quote drops only the rest of its line.
  - `/*` in JSX text opens a comment that can hide a later dynamic import.
  - Deno and URL specifiers are not matched.
  - `.vue`, `.svelte`, `.astro` and `.mdx` files are not scanned.
  - Type-only imports count as imports.
  - A wrapper imported through a path alias needs its own glob row.
- The T6 fallback (per-file rows) was not needed; the time box held.

## Not verified

- None of the criteria is manual. At overlay, this repo would fail three rows (`**/policies/**` warden, `**/legal/**` and `**/consent/**` chancery): a probe measured this on 2026-10-07, and no test pins it. It does not matter here because this repo is at `starter`.

## Review round

Vigil and Mason (Q2, in the thread) both passed. Fixed:

- unknown row keys and repeated modules are rejected;
- a row's dead half is named;
- `@stripe/*` is seeded;
- `ls-files -z`;
- capitals are allowed in subpaths;
- the JSX limit is pinned.

Drafted as follow-ups: the diff-side lookup, and scanner hardening.

## Next

MIG-6 lists SDK importers in the assess report. MIG-11 records the imports field and the zero-match rule in the ledger.
