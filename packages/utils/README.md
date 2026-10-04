# packages/utils

A seam, not a package yet (D-STK-1; codebase-conventions rule 9). There is no `package.json` here, so nothing can import it.

**Convention.** Pure functions with no I/O, no environment and no framework: the same input gives the same output in a server, a browser or a test. One file per subject, named for what it does (`slugify.ts`, `money.ts`), each with its own subpath export and a test beside it. A function that logs, fetches or reads a request belongs to the package that owns that concern, not here. There is no `misc`, `helpers` or `lib` module.

**When it becomes a package.** When a pure function gains its second consumer in another workspace (codebase-conventions §1). That first module adds `package.json` (`@pem/utils`), `tsconfig.json` and `eslint.config.mjs`, a row in `packages/config/eslint/boundaries.js` at the foundation layer (it imports only `@pem/config`), an entry in `toolkit.json`'s `stack`, and turns its row in codebase-conventions §4 to built. Until then, a helper used by one app lives in that app's `lib/`.
