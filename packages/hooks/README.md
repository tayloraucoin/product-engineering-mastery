# packages/hooks

A seam, not a package yet (D-STK-1; codebase-conventions rule 9). There is no `package.json` here, so nothing can import it.

**Convention.** React hooks that hold data logic and render nothing: fetching, caching and mutating through the app's data layer, and state that two apps share. A hook bound to the DOM or to one component's markup lives beside that component in `@pem/ui` or the app. A hook never imports `@pem/api` directly (D-STK-8); it takes the client it calls. One hook per file, named `use-<thing>.ts`, each with its own subpath export. There is no `misc`, `helpers` or `lib` module.

**When it becomes a package.** When a data hook gains its second consumer in another workspace. That first module adds `package.json` (`@pem/hooks`), `tsconfig.json` and `eslint.config.mjs`, a row in `packages/config/eslint/boundaries.js` below `ui` and above the packages it reads, an entry in `toolkit.json`'s `stack`, and turns its row in codebase-conventions §4 to built.
