# Review — warden on WEB-2

> Written by `yarn review:run warden WEB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ce45839c4387ad272bd390087ad5c8b64a899d13c323834ffa9fd0a520250d99
- as_built_sha256: 90e9dfc89a4e46863a29e5bff637391805f5c0e6a86c200f604e6eeccae72968
- head: 2d2d40aaf4686cfab660dc14fa2a2e14edb41d78
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T08:11:43Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden WEB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket WEB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log (sha256 4d4ac7505ab4)
   - C2 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log (sha256 d9607a1642ba)
   - C3 check: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log (sha256 9907a0be6896)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): docs/decisions/changelog.md, docs/decisions/ledger.md, docs/engineering/codebase-conventions.md, package.json, packages/config/eslint/boundaries.js, packages/config/eslint/workspace-resolver.cjs, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/probes.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/review-mason.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/review-vigil.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/review-warden.md, tooling/boundaries.test.ts.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I have everything I need. Writing the review.

## Review — WEB-2 boundaries-subpath-resolve (warden, re-run at the shipping head)

**Verdict up top: PASS.** No Blocking, no Should-fix from me this round. Tier 2, one-way door (`specs/_shared/epics/STK-default-stack/technical.md:38` names `packages/config/eslint/boundaries.js` the package-graph door), so read in full, not sampled. My approval is not a merge.

This is the re-run mason and vigil both asked for (`review-mason.md:61`, `review-vigil.md:59`): `results.json:73-87` holds a warden PASS at `ae3b55a`, against the resolver *before* the error-name fix that my own Should-fix asked for. That record is superseded by this one. I re-derived every load-bearing claim from the files rather than inheriting it from the two PASSes or from my own prior review.

### What this protects, stated once

`ui` is the client-bundled package and `@pem/db/client` is the postgres client, with `postgres` pinned to `db` as sole owner (`boundaries.js:65-68`). Before this fix a `"use client"` leaf in `packages/ui` could `import "@pem/db/client"` and lint green — a server-only module, and the connection string it reads, reachable from a browser module graph while the check reported clean. That is the impact behind "a check that passes silently while seeing nothing," and it is why fail-closed was correct rather than merely tolerable. `yarn check-client-bundle` (`package.json:44`) remains the backstop, so this edge now has two independent controls instead of one that was blind.

### Criteria

**C1 — a disallowed `@pem/<subpath>` edge fails the lint. Met.**
`workspace-resolver.cjs:23` gates on the `@pem/` prefix; `:25` resolves through `createRequire(file).resolve(source)`, which honours `exports` and returns the realpath under `packages/<name>/`, inside the element zone (`boundaries.js:29-35` covers the `node_modules/@pem/` symlink form too). First under `import/resolver`, keyed by an absolute path from `import.meta.url` (`boundaries.js:171-176`), and `eslint.config.mjs:27` spreads that config, so the resolver is live where `yarn lint:boundaries` runs.

The check that matters for honesty here: `@pem/brand/brand` is a **real** export (`packages/brand/package.json:7`), so test 2 proves resolution *succeeded* and the zone rule then fired — it is not a resolve error wearing a zone message. `tooling/boundaries.test.ts:22-47` asserts the zone string, which can only come from `boundaries/dependencies` (`boundaries.js:205-206`): `@pem/db/client` matches neither group of `WORKSPACE_PATH_PATTERN` (`:79-83`), so the path ban cannot be producing it. `C1.log:8-25` is 8/8 at exit 0, head `1dec187`. `probes.log:3-23` corroborates with two real files at exit 1 and the exact wording, and `**/zz-probe*` across the tree returns nothing — non-negotiable 6 met. The test writes no file, so no run can leave a probe importing the db client behind in a shipped package.

**C2 — an unexported `@pem/*` specifier fails; everything else lints as before. Met, and my prior finding is closed.**
I verified the fix at the third-party source rather than taking the as-built's word: `node_modules/eslint-module-utils/resolve.js:17` defines `ERROR_NAME = 'EslintPluginImportResolveError'`, and `:241-243` substitutes `err.stack` for `err.message` for any other name. `workspace-resolver.cjs:32` sets exactly that name, and `resolve.js:89,107,112` only ever *set* it, so no other behaviour is being impersonated. `boundaries.test.ts:62` pins the absence of stack frames, and `probes.log:25-34` renders the error as a developer sees it: message only, no local paths. **The Should-fix I filed last round — a stack dump carrying this machine's absolute paths into lint output, CI logs and pasted issues — is fixed and regression-guarded.**

Both unexported cases are real: `@pem/db` has no `"."` export (`packages/db/package.json:6-31`) and `@pem/env` has no `./not-exported` (`packages/env/package.json:6-27`). The three allow cases assert **zero** messages (`boundaries.test.ts:74-77`), the right strength for non-negotiable 3, over real specifiers — `@pem/env/tier` (`packages/env/package.json:7`), `@pem/ui/button` and `./styles/globals.css` (`packages/ui/package.json:7,23`), `@pem/brand/assets/logo.svg` through `./assets/*` (`packages/brand/package.json:27`) — plus the `@/` alias. Only `node:module` is imported (`:18`): non-negotiable 4 holds, `tech-stack.md` correctly untouched. No boundaries suppression anywhere in the changed files: non-negotiable 5. `package.json:9` adds the script, `:30` sweeps the file into `test:tooling`, `:14` puts that inside `verify` — the guard is in CI, as `changelog.md:24` claims.

The property I care most about in a lint-time hook still holds: `:25` calls `.resolve()`, never `require()`. Resolution reads `package.json` and executes no module code, so linting a hostile or malformed source file cannot execute workspace code through this path. `createRequire(file)` sits *inside* the `try`, so even a bad `file` argument becomes a reported resolve error rather than a crashed lint run. Both should stay that way; a future "just import it to check" would turn the linter into an execution surface.

**C3 — the real tree passes with subpaths resolved. Met, on evidence weaker than the claim.**
`C3.log:1-5` is exit 0 at `1dec187` with an empty body. I spot-checked the stronger claim against the exports maps myself and agree with both reviewers' enumeration: the only package-to-package edges are `db → env` and each `eslint.config.mjs → config`, both in `PACKAGE_IMPORTS` (`boundaries.js:56-62`). Filed twice already as a Consider; I am not refiling it.

Docs land where the practice requires: `codebase-conventions.md:79` carries the fail-closed sentence, `ledger.md:343` is EN-12, `changelog.md:18-25` cites it.

### Findings

**Consider — the resolve message still has one path-bearing fallback, and the no-stack test would not catch it.** `workspace-resolver.cjs:28` interpolates `${error.code ?? error.message}`. Every ordinary Node resolution failure carries a code (`ERR_PACKAGE_PATH_NOT_EXPORTED`, `MODULE_NOT_FOUND`, `ERR_INVALID_MODULE_SPECIFIER`), which is why this is narrow — but a malformed `packages/*/package.json` mid-edit can surface as a parse error whose message names the offending file by absolute path, and `boundaries.test.ts:62` only asserts the absence of `\n  at ` frames, so a path-bearing *message* passes it silently. This is the residual of the fix I asked for last round, not a reopening of it: `error.code ?? "unresolved"` closes it in one token, or the assertion could reject `REPO_ROOT` appearing in the message. Low impact — a private repo, a developer's own paths — and not worth a round trip on its own; fold it into whichever follow-up touches this file.

**Nothing new on the governance gap.** `TIER_2_PATHS` (`tooling/lib/specs.ts:71-77`) still matches neither `packages/config/eslint/boundaries.js` nor `packages/*/package.json`, though `technical.md:38` names both a door. `contract.md:33` puts it out of scope and `as-built.md:27` records the follow-up with an owner and a trigger. That is risk acceptance in the shape I want; I stated it in my last review and will not relitigate it here.

**The staleness Should-fix closes with this run, and the gate can go clean.** Mason and vigil both filed `as-built.md:18`'s past-tense "All three reviews were re-run" against `results.json`, where warden sat at `ae3b55a`. This record is that re-run, at the shipping head and against the same contract and as-built hashes mason and vigil reviewed. I checked that the review records themselves cannot block the gate: `changedAfter` excludes the specs root from staleness (`tooling/lib/specs.ts:812-813`), so the `review-*.md` and `results.json` commits landing after `1dec187` do not stale C1–C3. `yarn check-specs --strict` remains the authority before merge.

### Evidence hygiene

All four evidence files are clean: no environment values, no secrets, no absolute paths (`C1.log`, `C2.log`, `C3.log`, `probes.log`). Worth restating because the output this ticket introduces was path-bearing by default and no longer is — `probes.log:30` is now the proof of that, captured as rendered. Anyone who captures a resolve error into a future `check` log will commit a message, not their filesystem.

`[ASSUMPTION: the working tree I read is the shipping revision. I cannot run git, so I matched the committed resolver's error name and wording against probes.log:30 and the C1/C2 assertions, which agree, and against resolve.js:17 in the installed dependency.]` `[ASSUMPTION: the app-by-name hole (as-built.md:27) and the TIER_2_PATHS follow-up are out of scope per contract.md:32-35, so neither is a finding here.]`

VERDICT: PASS
