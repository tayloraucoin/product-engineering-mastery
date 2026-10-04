# @pem/constants

Values that never change at runtime and that two or more workspaces read. Foundation layer: it imports nothing above `@pem/config` (D-STK-1).

- **One file per subject, named for it** (`time.ts`), each with its own subpath export (`@pem/constants/time`). No `index.ts` and no `misc.ts`.
- **Only true constants.** A value that differs per tier is an environment variable, read in the app's `env.ts`. A brand value (name, address, colour) is `@pem/brand`. A value one workspace reads stays in that workspace (codebase-conventions §1).
- **Named with units** where a unit applies: `DAY_MS`, never `DAY`.
