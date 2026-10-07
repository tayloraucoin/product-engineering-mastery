# As-built — LAB-24

## Shipped against the contract

- C1: `toolkit.json` `stack["experimental-sandbox"]` after `billing`: placement.md's six folders, `env` `SANDBOX_SECRET`, `dependencies` `[]`, `boundaries` `["web-sandbox"]`, `locked` false, the runbook path. No new field. `yarn check-stack` passes with 17 modules.
- C2: `docs/runbooks/remove/experimental-sandbox.md`, frontmatter as `billing.md`'s. `yarn lint:docs` exits 1 only on `docs/research/ui-patterns/working-dashboards.md` (no frontmatter, committed in 110cd6e, outside this ticket). The runbook itself passes.
- C3: `yarn check-refs` passes. The two `yarn workspace @pem/db …` commands sit in code blocks, since check-refs reads an inline `yarn <x>` as a root script. `db:generate` uses the root script, as `billing.md` does.
- C4: `evidence/removal-checks.png`. The runbook was followed end to end in a detached worktree at d7db912, with the entry marked removed: check-stack 0, the zero-hit grep printed nothing, check-types 15/15, lint:boundaries 0. `yarn db:generate` wrote `0004_*.sql`, holding seven `DROP POLICY` and seven `DROP TABLE` on the `sandbox_` tables and nothing else; `0003` and its snapshot were untouched. Also green there: `yarn test` (12 tasks), `yarn test:boundaries` (52), and check-refs once the runbook's six refs-pending entries were added. After the edits, `boundaries.js`, `env.ts` and `next.config.ts` were byte-identical to their versions before LAB.
- C5: `evidence/removal-404.png`. Before: `/experimental/pricing-2026` returned 200 with the gate, and `/admin/experiments` returned 307 to sign-in. After: both returned the app's 404.
- The runbook's six phases: tag (STOP), delete, edit (files, variables, dependencies, boundaries, roles), migrate (the export warning before the generate), verify, operator. The shared-edit list was read from `git log --grep '^LAB-'` over every file outside the six folders. `new-project/README.md` gains row C9, and the sandbox's place in the order before auth and the database.

## Deviations

- `depends_on` narrowed to LAB-1–12 and LAB-17, on the operator's word (2026-10-07). Every planned path of LAB-13, 14 and 18–23 sits inside the entry's folders. LAB-15 and LAB-16 were red on another ticket's web test.
- The code held shared edits that placement.md does not list: a second element, `db-sandbox`, with its `PACKAGE_IMPORTS`, `TRANSPORT_FREE`, `NOT_FOR_APPS` and route-override lines; LAB-1's tests in `schema/index.test.ts`; LAB-8 and LAB-11's classes in `floating-theme-toggle.tsx`; LAB-8's `lucide-react` in `apps/web/package.json` and the tech-stack row; and LAB-9's `grant-admin.ts` comments. The runbook covers each.
- The grep terms are narrowed from the build notes' bare `sandbox`, which matches the harness's own `sandbox.enabled` in `tooling/`, so the grep could never print nothing. It looks for `sandbox_`, `SANDBOX_`, `-sandbox`, `/sandbox` as a path, `sandbox` followed by a capital, `data-admin-shell`, `apps/web/app/admin`, `/experimental` and `pricing-2026`.
- `developer` was decided by the grep in the rehearsal: only `rls.ts` and LAB-2's tests named it, so it left `APP_ROLES`. Auth's roleOf test keeps one line, expecting `user`, which proves the fallback.
- `[ASSUMPTION]` from the build notes: placement.md's "a script to clear the value" is met by naming the Auth admin API per holder in the operator's steps. There is no new script.
- Mason's review, round 1 (FAIL, one Blocking): the STOP gate now has two forms. A repo with commits tags. A new-project duplicate, which has no commit until step 7, records `git write-tree` after `git add -A`. Also fixed: the grep skips `tooling/refs-pending.json` and adds `D-LAB-`, `Experimental sandbox`, `apps/web/app/experimental` and an `href=` route term, dropping `/experimental`, which hit Next's `next/experimental`. Added a read-back list for what no grep sees, the kept LAB-8 and LAB-2 edits by name, the `Test-changes:` trailer `yarn verify` needs, the local export and baseline as conditional at new-project step 4, `DATABASE_MIGRATION_URL_LOCAL`, the journal wording, `.env.local`, and backticks in the developer grep. The widened grep's new terms hit only lines the C4 rehearsal removed (probed on today's tree), so C4's capture stands for it.
- `docs/_generated/directory-map.md` and `remove/README.md` were regenerated in the worktree with `docs/research/ui-patterns/` set aside, since `yarn directory-map` refuses while that folder has no README. The map also picks up MIG-8's and MIG-9's files.

## Not verified

- The generated migration was not applied. The local `pem_local` database is shared with LAB threads that still use the tables, and hosted tiers are the operator's.
- The `\copy` export ran once against local `sandbox_actions` (header only, no rows); the other six tables and a hosted export were not run.
- `yarn test:db` (real Postgres) was not run after removal.

## Next

A product repo removing the sandbox runs this runbook from new-project step 4. A later LAB ticket that adds a shared edit adds its row to the runbook.
