# As-built — MIG-1

## Shipped against the contract

- C1: `tooling/lib/layout.ts` exports `probeLayout(root)` → `{ hasTurbo, turboTasks, workspaces, codeRoots, hasSpecsRoot, scripts }` and `findCodeRoot(layout, file)`, node built-ins only; it reads JSONC and Turbo 1's `pipeline`, and expands workspace globs. Unit cases in `tooling/lib/layout.test.ts` run on synthetic roots in `$TMPDIR`.
- C2: on the single-app repo, `verify:fast` passes a clean edit. It fails a type error, a broken `tsconfig.json` and a `.jsx` lint error, naming the step each time.
- C3: `stop-gate.ts` returns no decision after a clean edit and blocks once on a type error. The same scoped `verify:fast` run names every step it did not run.
- C4: a missing script, a Turbo task missing from `turbo.json`, an uninstalled Turbo and an uninstalled ESLint are each printed as `not run: <step> (<why>)`. None of them is counted among the steps run.
- C5: `budget.ts` passes on the single-app repo and prints `SKIP not in this repo, so not counted: …`. It reads nested `AGENTS.md` under each code root. With no specs root, `results-gate.ts` exits 0 and prints nothing.
- C6, C8: tooling types and every hook fixture pass.
- C7: the budget report here is byte for byte the same before and after this ticket. It still fails on two overages that were already there (see Not verified).

## Deviations

- [ASSUMPTION] On the Turbo path, the boundaries lint still covers only `.ts`, `.tsx` and `.mjs`, as before. Without Turbo, ESLint covers every flat-config default extension and runs with `--no-warn-ignored`, and any change under a code root triggers the type-check script.
- [ASSUMPTION] A tool step (Prettier, Turbo, ESLint) runs only when a script of that name, or a dependency declared in the package.json, provides it. Otherwise the step is printed as not run and never fails the stop for want of an install.
- [ASSUMPTION] The toolkit's own folders (`tooling/`, `docs/`, `.claude/`, `.github/`, the specs root) are never product code, even when the app sits at `.`. A host's own code in a folder with one of those names is therefore not linted (review finding 6, a follow-up).
- [ASSUMPTION] Not-run lines are printed on every run, whether or not the changed set reached the step: a missing capability is a fact about the repo.
- The budget's self-check fixtures are required at starter. Under overlay, absent ones are skipped and named.

## Not verified

- C7 is red on this branch for reasons this ticket did not cause: `specs/web/epics/LAB-experimental-sandbox/brief.md` is 8,492 tokens against the 2,000 "brief and package" cap, which also pushes the UI build to 17,976 against 15,000.
- A target whose code roots have ESLint configs but no root config (the per-root branch) is covered by reading only, not by a case.
- The stop gate drops `verify:fast`'s output on a pass, so a person never sees the not-run lines there. `stop-gate.ts` is a hook and out of scope here; this goes to MIG-2 (review finding 3).

## Next

Settle C7 (the LAB brief's budget), then start MIG-3, which waits on every MIG-1 criterion passing.
