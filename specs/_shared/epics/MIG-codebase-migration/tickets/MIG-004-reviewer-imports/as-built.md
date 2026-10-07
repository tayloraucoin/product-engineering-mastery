# As-built — MIG-4

## Shipped against the contract

- **C1:** `listImportedModules` in `tooling/lib/specs.ts` tokenizes the source (comments dropped; strings, templates and regex literals kept as single tokens) and reads `from "m"`, `import "m"`, `import("m")` and `require("m")`; `importsModule` matches the module, its subpaths and an `@scope/*` entry, never a longer name (`stripe-mock`, `@stripe/stripe-js`). Tested in process and in a scratch repo, where a file naming stripe only in a comment and a string matches nothing.
- **C2:** `ToolkitReviewer.glob` is optional and `imports?: string[]` is new. `validateToolkit` names a row with neither, an empty list, and each malformed module.
- **C3:** `suggestReviewers` adds an import pass over the tracked files each planned path holds, with the reason `<file> imports <specifier>`. A planned file not yet tracked matches by glob only. `samplePaths` skips rows that have no glob.
- **C4:** `tooling/check-reviewers.ts` skips at `starter` and exits 0. Under overlay it walks `git ls-files` once through `findRowReach` (the glob, then `findImportMatch`) and fails, naming `reviewers[i] (glob …; imports …; role …)`.
- **C5:** `check-reviewers` is in `package.json`, and in `verify` right after `check-settings`.
- **C6, C7:** tooling types pass. `toolkit.json` and the template carry the six seeded import rows (stripe goes to mason, warden and chancery; auth SDKs to mason and warden; resend to warden; no AI row), all `status: draft`. A test also validates the template.
- `docs/engineering/tooling.md`: one `check-reviewers` entry, plus a §4 row (net 2.8).

## Deviations

- [ASSUMPTION] An entry may name a whole scope as `@scope/*`, because the contract seeds `@supabase/*` and `@clerk/*`. The validator accepts a package, a subpath or a scope wildcard.
- [ASSUMPTION] "Its diff" is covered without a separate diff call. `review:run` and `check-specs` have no diff-side reviewer lookup today, and neither is a planned path. `suggestReviewers` scans every tracked file a planned path holds, and that includes each committed file of the ticket's diff. The import half (`findImportMatch`) is the one function both `suggestReviewers` and `check-reviewers` use.
- A known limit of the scanner: JSX text holding `from "x"` with no apostrophe earlier on the line would read as an import. An unterminated quote drops only the rest of its line.
- The T6 fallback (per-file rows) was not needed; the time box held.

## Not verified

- None of the criteria is manual. At overlay, this repo would fail three rows (`**/policies/**` warden, `**/legal/**` and `**/consent/**` chancery): a probe measured this on 2026-10-07, and no test pins it. It does not matter here because this repo is at `starter`.

## Next

MIG-6 lists SDK importers in the assess report. MIG-11 records the imports field and the zero-match rule in the ledger.
