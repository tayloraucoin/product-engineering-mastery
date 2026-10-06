---
id: WEB-2
size: small
objective: "The boundaries lint resolves every @pem/<subpath> import to its zone, so a disallowed package edge fails however it is written."
slice_type: "Enforcement of the package graph; the risk is a check that passes silently while seeing nothing (STK-7 batch review, finding 4)."
non_negotiables:
  - "ui importing @pem/db/client and env importing @pem/brand/brand both fail yarn lint:boundaries."
  - "An @pem/* specifier that does not resolve through its package's exports fails the lint; it never passes as unknown."
  - "Allowed edges, relative imports, app aliases and third-party packages lint exactly as before."
  - "No new dependency: resolution is Node's own, through each package's exports."
  - "No boundaries error is suppressed; a real violation the fix reveals is fixed or reported."
  - "The probe files used to prove it are removed."
devs_call: "The resolver's file name and error wording, and how the test lays out its probes."
cites:
  - "specs/_shared/epics/STK-default-stack/technical.md"
  - "D-STK-16"
truth_files: "none: no living UX file covers the lint"
reviewers:
  - mason
  - vigil
  - warden
planned_paths:
  - "packages/config/eslint/workspace-resolver.cjs"
  - "packages/config/eslint/boundaries.js"
  - "tooling/boundaries.test.ts"
  - "package.json"
  - "docs/engineering/codebase-conventions.md"
  - "docs/decisions/changelog.md"
  - "docs/decisions/ledger.md"
  - "specs/web/one-offs/WEB-2-boundaries-subpath-resolve/**"
depends_on: []
out_of_scope:
  - "Adding boundaries.js and packages/*/package.json to TIER_2_PATHS (a change to the agent's own gates)."
  - "New edges or packages in the layer matrix."
  - "Resolving tsconfig path aliases (@/*) inside an app; they cannot cross a boundary."
criteria:
  - id: C1
    statement: "An @pem/<subpath> import across a disallowed edge fails the boundaries lint: ui to @pem/db/client, env to @pem/brand/brand, as the relative path already does."
    evidence: test
    command: "yarn test:boundaries"
  - id: C2
    statement: "An @pem/* specifier its package does not export fails with a resolve error, while allowed edges, app imports of @pem/ui and @pem/brand assets, and third-party packages still pass."
    evidence: test
    command: "yarn test:boundaries"
  - id: C3
    statement: "The real tree passes the boundaries lint with subpaths resolved."
    evidence: check
    command: "yarn lint:boundaries"
qa: Q2
---

# Contract — WEB-2 boundaries-subpath-resolve

## Build notes

- **Approach:** a resolver of about 15 lines (eslint-module-utils interface v2), listed before `node` under `import/resolver` in `boundaries.js`. It handles only `@pem/` specifiers, through `createRequire(file).resolve(source)`, which honours `exports` (patterns such as `./assets/*` included) and returns the real path under `packages/<name>/`, so the zone patterns match. It throws when an `@pem/*` specifier does not resolve: eslint-module-utils reports a thrown resolver as `Resolve error: …`, a lint error. Every other specifier returns `{ found: false }` and falls through to `node`, unchanged.
- **Decisions that apply:** D-STK-16, "Each package ticket adds its row to the layer matrix in `packages/config/eslint/boundaries.js`, and each vendor SDK is pinned to one owner." The matrix is only as good as the resolution under it.
- **Interfaces:** `packages/config/eslint/workspace-resolver.cjs` (`interfaceVersion`, `resolve`); root script `test:boundaries`.
- **Per path:**
  - `workspace-resolver.cjs`: the resolver. CJS, because resolvers are loaded with `require` and `@pem/config` is `"type": "module"`.
  - `boundaries.js`: the resolver first, by absolute path; the stale comment rewritten to say why both resolvers are there.
  - `tooling/boundaries.test.ts`: ESLint's `lintText` with a `filePath` per probe, from the repo root; tests named after C1 and C2. No probe file is written.
  - `package.json`: `"test:boundaries": "node --test tooling/boundaries.test.ts"`.
  - `codebase-conventions.md` §4: one sentence on the fail-closed rule.
  - `changelog.md`: a 2026-10-04 entry.
- **Gotchas:** the node resolver alone returns `{found:false}` for every `@pem/<subpath>` (it ignores `exports`), and the `isUnknown` allow rule then passes the import. A probe file must be linted from the repo root config, not a package's own `eslint.config.mjs`.
- **Model:** Opus. A smaller model tends to "fix" it by adding `main` fields or suppressing, which hides the gap again.

## Notes

The tier is raised to 2 by hand: `toolkit.json` names `boundaries.js` a one-way door, and `TIER_2_PATHS` does not (out of scope above). Spiked before the contract: the real tree lints clean under the fix (133 files, 0 findings).
