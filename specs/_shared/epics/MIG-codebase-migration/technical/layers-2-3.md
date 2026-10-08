---
epic: MIG
status: draft
---

# MIG — layers 2 and 3 as paths

> Detail for call T7 (`../technical.md`). Mason, with Quartermaster consulted on the parts and their order, 2026-10-06. The baselining rests on `../research/ts-test-baselining.md` (2026-10-06), cited as "TB" with its part. Its tool facts are dated there and are not re-verified here.

## Layer 2: the verify command, with baselines

**The mapping.** `verify` chains the repo's own checks, then the toolkit's:

- **The repo's own:** lint, the boundaries lint where one exists, the type check, `test`, then `build`.
- **The toolkit's:** `check-settings`, `test:hooks`, `check-specs`, `check-test-weakening`, `check-reviewers`, `check-refs`, `budget`, `gen:agents --check`, `check-types:tooling`.

`verify:fast` is the overlay version (`overlay.md`). A repo-wide format check is left out of `verify` while the repo's `format` writes (all three, verified). `verify:fast` checks formatting on changed files only, and the format-all commit is a layer 3 gap.

**Every check runs once on the base commit before it enters `verify`.** If it passes, it goes in as written. If it fails, it is frozen by kind, or it stays out as a named gap that the operator rules on:

| Kind  | Freeze                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Never                                                                                                                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint  | ESLint bulk suppressions, `eslint-suppressions.json`, ESLint 9.24.0 or later (`research/brownfield-adoption.md`). An older ESLint makes the lint freeze a gap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `--max-warnings` raised to the current count                                                                                                                                                |
| Types | Per line, `// @ts-expect-error MIG-BASELINE(<code>)` above each error that the repo's own `tsc` reports, inserted by a short script and re-run until clean. Each fix then fails as TS2578 and removes its own line (TB, Part 1.2 and Part 3). A count file, `type-baseline.count`, and a ratchet step: fail above the count, and fail below it unless the file was lowered in the same commit (TB, Part 3, step 5). `ban-ts-comment` gets a `descriptionFormat` for the tag (TB, Part 1.3)                                                                                                                                                                            | Turning `strict` on (tightening is layer 3); ts-migrate (TB: unmaintained, #95 residue, #96 strips reasons); Betterer and tsc-baseline (TB: hot results file; no stable release since 2022) |
| Tests | None of the three has a runner or a test (verified). Where none: `test` is `node --test` over a literal path, plus one smoke test, and no pass-with-no-tests. A glob matching nothing exits 0 on Node 22.20 (TB, Part 2.1, secondary), and `node:test` is the practice's runner (verified: `apps/web/package.json`). Where tests fail: deterministic failures get the runner's expected-fail marker (Vitest `test.fails`, Jest `test.failing`, Playwright `test.fail()`; TB, Part 2.2). Flaky or crashing tests are skipped and listed in `tests/QUARANTINE.md` with an owner and a date. A `node:test` expected-fail marker: [NOT FOUND] in TB, so skip and the list | `test.skip` without the list; a new runner chosen on day one                                                                                                                                |
| Build | Not freezable. A build that fails at base stops the run for the operator                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                                                                                                                                                                                             |

- **Live team.** A freeze that touches more than about 50 files (judgment) is either the last commit of the day or a gap, and the operator rules which. The interview has already ruled on the conflicting instruction line "no tests during slices" (`layer-1.md`).
- **Gates without pull requests (TB, Part 3).** Before landing: the stop gate and the opt-in native hooks. After landing: CI. Coverage thresholds and patch coverage arrive with layer 3, because there are no tests to measure.
- **CI wiring.** Where CI exists, the chained steps become one `yarn verify` step under the same triggers, in one commit. That is synapse's and CC's `.github/workflows/ci.yml` (verified). The first CI run is the operator's: it is hosted, and comes after the operator's push. Where CI is absent (TA), writing a workflow is a drafted gap: it needs repo settings and secrets, so it is a hosted step.

## Layer 3: the conventions, part by part

Each part is a drafted gap ticket (`layer-1.md`, T5), in this order. Dependencies come first, and parts that rewrite many files come last (live-team rule, settled). A part runs only when the operator starts it, and none is a codemod (out of scope).

1. **Toolchain majors** (S2; Quartermaster). Majors land within a stated window, after the minimum release age (Quartermaster, belief 7). TypeScript 6.0 defaults `strict` to true (TB, Part 1.2, citing the 6.0 notes), so `strict` is pinned explicitly before any TS 6 upgrade. Otherwise one upgrade fails the whole repo's types at once. TA: Next 15 to 16.
2. **Database and migrations.** `migrationsDir` stays the existing folder. Drizzle's random names need no rename: `check-migrations` scans contents for DDL against `auth`, never names (verified: `packages/db/scripts/check-migrations.ts`). That answers the brief's knowledge gap 3. The check is installed with this part. A local database follows the operator's choice. `docs/runbooks/add/docker-local-database.md` applies only when Docker is chosen.
3. **Tests beyond the smoke test.** Coverage thresholds rounded down, with an auto-update that floors (TB, Part 2.3). Patch coverage needs a hosted service and stops for the operator.
4. **Boundaries lint** (V1). `packages/config/eslint/boundaries.js` with bulk suppressions. In the target this is a Mason one-way door (the package graph).
5. **Env seam** (V3). One reader per workspace and the tier picker (codebase-conventions §5). A lint rule against `process.env` outside `env.ts`, with suppressions. `env.ts` is a Warden row.
6. **SDK seams** (V5). Money, auth and AI calls move behind their module folders. Each module's remove recipe is the checklist of what conformant looks like: files, variables, dependencies and boundaries names (`docs/runbooks/remove/{billing,supabase-auth,supabase-database,ai,api,error-monitoring}.md`, verified present). Its `toolkit.json` `stack` entry is added when it conforms, and `check-stack` is installed with the first entry. An add recipe is written the first time a target adopts a module it never had (`docs/runbooks/add/README.md`).
7. **Token preset and token lint** (V2). TA has 49 raw hex values in four files (brief). The lint lands with suppressions.
8. **`"use client"` placement** (V4). A check with a baseline first; the moves come late.
9. **Design layer and living truth.** The product design files, and promoting the imported UX spec into `specs/<app>/ux/`. This is the UX-spec work new-project hands to its own thread on the deepest model (Risk 4).
10. **Format-all commit** (C5). One commit, in a quiet window the team agrees.
11. **Shape** (S1, far path only). The root app moves into `apps/web`, with workspaces and Turbo. It is its own epic in the product repo, and last, because every path changes.
12. **Leftovers from day one.** Entry-by-entry indexing of the imported decision logs, and the per-rule guard split for a team.

## Hosted steps that stop for the operator

- Every push and merge.
- The first CI run.
- Creating CI, adding its secrets, and branch protection.
- Any hosted database migration.
- Vendor dashboards: Supabase, Stripe webhooks, Vercel environment variables.
- Any coverage or monitoring SaaS.
- Removing worktrees or tracked large files. TA's 74 MB video is documented and never rewritten: moving it to LFS would rewrite history, which is out of bounds.
