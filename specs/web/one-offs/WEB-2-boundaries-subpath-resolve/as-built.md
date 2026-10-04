# As-built — WEB-2

## Shipped against the contract

- C1: `packages/config/eslint/workspace-resolver.cjs` resolves `@pem/*` through each package's `exports` (`createRequire(file).resolve`), listed before `node` under `import/resolver` in `boundaries.js`. `tooling/boundaries.test.ts` lints `ui` → `@pem/db/client`, `env` → `@pem/brand/brand` and the relative `env` → `../../db/src/client` as text through the root config; each fails with its zone message. `yarn test:boundaries` PASS, 7 tests. With the resolver line removed, the two subpath tests fail and the relative one still passes (run by hand, then restored).
- C2: an unexported `@pem/env/not-exported` fails as `Resolve error: … does not resolve through its package's exports`, so an `@pem/*` import can no longer pass as unknown. `db` → `@pem/env/tier`, `next-themes` and `react` in `ui`, and an app importing `@pem/ui/button`, `@pem/ui/styles/globals.css`, `@pem/brand/assets/logo.svg` and `@/app/layout` still lint clean. Same run, PASS.
- C3: `yarn lint:boundaries` PASS on the real tree, with subpaths resolved. The only package-to-package edges are `db` → `env` and each package's `eslint.config.mjs` → `config`, both allowed, so the fix revealed no real violation.
- The literal probes, as asked: `packages/ui/src/zz-probe.ts` and `packages/env/src/zz-probe.ts` each fail `yarn eslint <file>` (`evidence/probes.log`), and both files were deleted. Before the fix, on `agent/STK-3` at `41fc4bc`, both exited 0 (STK-7 batch review, disposition of finding 4).
- No dependency added, so `tech-stack.md` is unchanged. `codebase-conventions.md` §4 gains one sentence on the fail-closed rule; `changelog.md` has the entry.

## Deviations

- **[ASSUMPTION] Venue.** Built in the app-made worktree on `claude/gallant-ellis-94d0c7`, fast-forwarded to `agent/STK-3` at `58af6ef`; Taylor merges it into `agent/STK-3` (Taylor, 2026-10-04). A hook blocks this session's writes to the main checkout.
- **[ASSUMPTION] A one-off under `web`** (Taylor's choice), though the change is repo-wide: an STK epic ticket at tier 2 would have re-run the pre-flight over every drafted STK ticket.
- **Tier raised to 2 by hand.** `toolkit.json` calls `boundaries.js` a one-way door; `TIER_2_PATHS` does not. `contract:init` then required mason, vigil and warden. Warden comes from the planned glob `specs/web/one-offs/WEB-2-…/**`, whose sampled paths reach a warden glob, not from the code.
- **An in-repo resolver instead of `eslint-import-resolver-typescript`:** no native dependency or age-gate wait, and it fails closed, where the TypeScript resolver would still pass an unresolvable specifier as unknown. It does not resolve app `tsconfig` aliases (`@/*`); those stay inside one app and cannot cross a boundary.
- **The resolver uses Node's `require` conditions** (`require`, `node`, `default`). Every `@pem` export today has `default`. A future package exporting under `import` only would be reported as a resolve error, never passed silently.

## Not verified

- review:mason, review:vigil and review:warden until `yarn review:run` records them.

## Next

Taylor merges `claude/gallant-ellis-94d0c7` into `agent/STK-3`. Separately, `TIER_2_PATHS` should name `packages/config/eslint/boundaries.js` and `packages/*/package.json`, which needs Taylor out of auto mode.
