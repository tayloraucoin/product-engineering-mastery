# As-built — LAB-15

## Shipped against the contract

- C2, C3, C8: `packages/db/src/sandbox/codes.ts`, team-only, each refusing a reviewer viewer before any query:
  - `listCodes(db, team, { slug })` returns `{ reviewerId, label, displayName, emailsUsed, lastUsedAt, revoked }[]`, newest first. It never returns a code or a hash. "Emails used" is the distinct typed emails, oldest first. A signed-in access counts in `lastUsedAt` (the latest `last_seen_at`) and never in `emailsUsed`.
  - `makeCode` inserts with `on conflict (code_hash) do nothing` and answers `{ taken: true }` for an issued hash, so the caller draws once more.
  - `replaceCode` rewrites `code_hash`, raises `code_version` and clears `revoked_at` on the same row (D-LAB-23). It answers null for an id not on the slug, and `{ taken: true }` for an issued hash.
  - `revokeCode` locks the row, sets `revoked_at` once and answers null for an id not on the slug. Revoking again keeps the first instant and records nothing.
  - Each write and its `recordAction` share one transaction. Isolation cases are in `test/sandbox/codes-cases.ts`, spread into the suite's REGISTRY with one line. `test/sandbox/codes.test.ts` runs revoke and replace against `checkAccess`, `findLiveReviewerByCodeHash` and `createAccess`, and checks the reviewer's comment and version stay theirs.
- C1, C4, C5: `apps/web/lib/sandbox/admin-codes.ts` (pure) holds `makeCodeWith`, `replaceCodeWith` and `revokeCodeWith(deps, member, input)`.
  - The deps are the registry, LAB-5's `generateCode` and `hashCode`, env's site URL and the store. Only the SHA-256 of the normalised code reaches the store.
  - A closed experiment is refused with `closed` before the store is touched. Revoke stays open.
  - On a private experiment the display name is stored null, whatever the form sent.
  - `admin-codes-data.ts` (`server-only`) binds them. It logs only an error's name, since a failed insert's error carries its parameters.
  - `admin-codes-view.ts` (client-safe) holds the words, the rows and the eleven `codes-*` fixtures.
- C7: `emails-used.ts` `emailsUsedFlags(label, emails)` returns `{ several, differsFromLabel }`; LAB-22 reuses it.
- Routes: `experiments/[slug]/codes/page.tsx` (Suspense over the list, its fallback the `codes-loading` skeleton), `loading.tsx`, `actions.ts` and `_components/`.
  - Make and replace answer with the code and neither revalidates nor redirects; the client refreshes after Done. Revoke revalidates the tab.
  - C1's scan fails the build if a file under `codes/` names browser storage, `console`, `URLSearchParams`, a router push or replace, `history` state or a logger, or if make or replace revalidates.
- C6, C10: `evidence/codes-closed.png` (the tab and its row menu on a closed experiment) and `evidence/codes-states.png` (every `codes-*` key at 390, 834 and 1440, light and dark, reduced motion). Both were taken against a scratch copy whose `team.ts` returns a synthetic admin, because this machine has no Supabase Auth. The copy is never committed.
- C9: walked by keyboard in the browser pane against the local database; handed to the operator (`evidence/C9-operator.md`).

## Deviations

- Record names are `code-made`, `code-replaced` and `code-revoked`, exported as `CODE_ACTIONS`. `recordAction` accepts kebab-case only (`role-change` is the precedent), so the contract's `code_made` cannot be written. LAB-16's thread was told.
- The store functions answer `{ taken: true }` or null beside the contract's `{ reviewerId }` and `{ codeVersion }`, so a taken hash and a foreign id are answers, not errors.
- [ASSUMPTION] The table is `@pem/ui/table`, as People and Experiments use, not the composed `data-table`. `data-table` clips columns at 390 (`overflow-hidden`), always shows a pager ("Page 1 of 1"), and words its own empty line.
- [ASSUMPTION] Limits and words the UX file leaves open:
  - the label is capped at 120 characters and the display name at 60;
  - "Enter the name other reviewers will see."; "Keep the label to 120 characters."; "Keep the display name to 60 characters.";
  - "The code wasn't replaced. Try again."; "The code wasn't revoked. Try again.";
  - "Link copied."; "Code for <label>" as the code step's title;
  - "Not yet" for a code never used; "None yet" for no typed email.
- [ASSUMPTION] A failed read of the accesses leaves the rows with `emailsUsed` and `lastUsedAt` null, and the page shows "—" in both columns (the partial state). A failed read of the reviewers is the error state.
- Make, replace and the shown code are one dialog with steps. Two dialogs raced: the make dialog's return of focus landed after the code dialog opened, behind it. A row menu's choice opens its dialog one task after the menu has closed. Opened sooner, the menu's return of focus to its trigger dismissed the dialog on a keyboard choice.
- The fixtures render a collaborate form, so the Display name column and field are captured. The only registered experiment is private. A fixture's dialogs answer locally with the made-up code `7KQM-29XH-PATR-4WDN` and never reach an action.
- Under `codes-closed`, the header still reads "Open": LAB-10's layout reads the real experiment, while the key closes only the tab.

## Not verified

- C9 by a person with a screen reader (deferred).
- C1, C4, C5 and C7 are recorded failing in `results.json`. Their command, `yarn workspace web test`, exits 1 on two tests LAB-11's commit `9b9f6c1` broke and LAB-11 owns: `gate.test.ts` C2's source scan, and `registry.test.ts` C4 (the square design's sections). This ticket's own tests pass: `admin-codes.test.ts`, `emails-used.test.ts`, `state.test.ts` and `admin-routes.test.ts`, 32 of 32. Re-run `yarn contract:run LAB-15` once LAB-11 lands its fix.
- The Copy buttons use `navigator.clipboard`, which the pane refused. The walk stubbed it; a real browser on https or localhost copies.

## Next

LAB-16 renders these three record names. LAB-22 reuses `emails-used.ts`.
