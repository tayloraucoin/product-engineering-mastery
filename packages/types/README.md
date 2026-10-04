# packages/types

A seam, not a package yet (D-STK-1; codebase-conventions rule 9). There is no `package.json` here, so nothing can import it.

**Convention.** Type declarations only, with no runtime code: shapes two or more workspaces share and no package owns. A type that a package's own code produces lives in that package and is exported from it: a row type from `@pem/db`, a schema's inferred type from `@pem/validators` (STK-13). One file per subject, each with its own subpath export. There is no `misc`, `helpers` or `lib` module.

**When it becomes a package.** When a shared type has no owning package and a second workspace needs it. That first module adds `package.json` (`@pem/types`), `tsconfig.json` and `eslint.config.mjs`, a row in `packages/config/eslint/boundaries.js` at the foundation layer (it imports only `@pem/config`), an entry in `toolkit.json`'s `stack`, and turns its row in codebase-conventions §4 to built.
