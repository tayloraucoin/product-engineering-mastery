# Review — vigil on WEB-2

> Written by `yarn review:run vigil WEB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ce45839c4387ad272bd390087ad5c8b64a899d13c323834ffa9fd0a520250d99
- as_built_sha256: 90e9dfc89a4e46863a29e5bff637391805f5c0e6a86c200f604e6eeccae72968
- head: 36d354d09adf5bd5b040a316f82579f73ffb0d99
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T08:06:57Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil WEB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket WEB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — WEB-2 boundaries-subpath-resolve (vigil, re-run at the shipping head)

**Verdict: Pass with conditions.** No Blocking finding. One Should-fix, which is a record-and-gate item, not a code item. Tier 2, one-way door (`specs/_shared/epics/STK-default-stack/technical.md:38` names `packages/config/eslint/boundaries.js` the package-graph door), so this was read in full, not sampled. My approval is not a merge.

I built the expected-behaviour list from the contract's six non-negotiables and three criteria before opening `workspace-resolver.cjs`, then traced each to code. Where a claim rested on third-party behaviour I read the third party (`eslint-module-utils/resolve.js`, `eslint-plugin-boundaries/dist/Elements/Elements.js`) rather than the as-built or the earlier reviews.

### Criteria

**C1 — a disallowed `@pem/<subpath>` edge fails the boundaries lint. Met.**
`workspace-resolver.cjs:23` handles only `@pem/` specifiers; `:25` resolves through `createRequire(file).resolve(source)`, which honours `exports` and returns the realpath under `packages/<name>/` — inside the element zone, and `boundaries.js:29-35` also covers the `node_modules/@pem/<name>/` symlink form, so either shape matches. It is listed first under `import/resolver`, keyed by an absolute path derived from `import.meta.url` (`boundaries.js:171-176`), which is both required (eslint-module-utils resolves a resolver name relative to the source file's package dir) and portable in a copied repo; it also explains why no `packages/*/package.json` is touched, consistent with `planned_paths`. `tooling/boundaries.test.ts:22-47` asserts the observable zone message for `ui → @pem/db/client`, `env → @pem/brand/brand` and the relative control `env → ../../db/src/client`; the asserted strings can only come from `boundaries/dependencies` (`boundaries.js:205-206`), not from `no-restricted-imports` — `@pem/db/client` matches neither group of `WORKSPACE_PATH_PATTERN` (`boundaries.js:79-83`) — so the test genuinely exercises resolution rather than the path ban. `C1.log:8-25` is 8/8 at exit 0, head `1dec187`. `probes.log:3-23` corroborates with two real files at exit 1 and the exact wording, and `**/zz-probe*` across the tree returns nothing: non-negotiable 6 met. The "before" state is not taken on the builder's word either — `_batch-review-2026-10-04-STK-7.md:61` records both edges linting clean on 2026-10-04, independently of this ticket.

**C2 — an unexported `@pem/*` specifier fails as a resolve error; everything else lints as before. Met.**
Fail-closed is real, and it rests on `interfaceVersion = 2` (`workspace-resolver.cjs:20`): `resolve.js:179-181` calls a v2 resolver **outside** the try/catch, so the throw propagates to `:231-251` and is reported via `context.report` with no explicit severity, inheriting `boundaries/dependencies` at `"error"` (`boundaries.js:200-209`). A v1 rewrite would be swallowed into `{found:false}` (`resolve.js:183-189`) and reopen the hole; the header comment now says one error per file at line 1 (`workspace-resolver.cjs:10-12`), which matches `erroredContexts` at `resolve.js:235,249`. Failures are not memoised (`resolve.js:211` leaves `cache(undefined)` commented), so no cross-file poisoning and no stale pass after a fix. `Elements.js:83` calls the reporting `resolve`, never the throwing `relative`, so an unresolvable specifier reports rather than crashing the run — and `C2.log:26-36` proves that empirically. The message-only output is correctly earned: `resolve.js:17` defines `ERROR_NAME = 'EslintPluginImportResolveError'` and `:241-243` prints `err.stack` for any other name; `workspace-resolver.cjs:32` sets exactly that name, and `tooling/boundaries.test.ts:62` pins the absence of stack frames. Both unexported cases are covered — `@pem/env/not-exported` and the bare `@pem/db`, which matters because no package declares a `"."` export (`packages/db/package.json:6-31`). The three allow cases assert **zero** messages (`boundaries.test.ts:74-77`), the right strength for non-negotiable 3, and every probed specifier is real: `@pem/env/tier` (`packages/env/package.json:7`), `@pem/ui/button` and `./styles/globals.css` (`packages/ui/package.json:7,23`), `@pem/brand/assets/logo.svg` through the `./assets/*` pattern (`packages/brand/package.json:27`, file present), plus `@/app/layout` falling through to `unresolvableAlias: true`. Only `node:module` is imported (`workspace-resolver.cjs:18`) and no `package.json` gained a dependency, so non-negotiable 4 holds and `tech-stack.md` is correctly untouched. `package.json:9` adds `test:boundaries`; `:30` sweeps the same file into `test:tooling`, which `:14` runs inside `yarn verify` — the regression guard is in CI, as `changelog.md:24` claims.

**C3 — the real tree passes with subpaths resolved. Met.**
`C3.log:1-5` is exit 0 at `1dec187` with an empty body (Consider 2), so I checked the stronger claim myself rather than trusting it. Every live cross-package `@pem/*` specifier in `packages/**` is `db → env` (`client.ts:12`, `connection.ts:9`, `scripts/env.ts:17-18`, `scripts/database.ts:14`) or `<pkg>/eslint.config.mjs → @pem/config/eslint/{base,react-internal,tokens}` — all allowed by `PACKAGE_IMPORTS` (`boundaries.js:56-62`) and all declared in `packages/config/package.json:7-16`, so none of them is a silent resolve error either. The root config ignores only `node_modules`, `.next`, `dist`, `.turbo` (`eslint.config.mjs:14-19`), `eslint .` exits non-zero when it matches no files, and the C1/C2 tests lint through that same root config — together that rules out "passed while seeing nothing," the stated risk at `contract.md:5`. No `eslint-disable` touches a boundaries rule anywhere, so non-negotiable 5 holds.

Docs land where the practice requires: `codebase-conventions.md:79` carries the fail-closed sentence, `ledger.md:343` is EN-12, `changelog.md:18-25` cites it. Deviations I can verify are accurate: `TIER_2_PATHS` (`tooling/lib/specs.ts:71-77`) genuinely omits `boundaries.js` and `packages/*/package.json`, so the hand-raised tier was the right compensating move; CJS is forced by `require`-loaded resolvers; the `require`/`node`/`default` condition set fails closed.

### Findings

**Should-fix — `as-built.md:18` says "All three reviews were re-run"; `results.json` says two of them were not.** Recorded heads are vigil `c85c6ad` at 07:49 (`results.json:64-65`) and warden `ae3b55a` at 07:55 (`:79-80`), both before `1dec187`, the commit that carries the error-name fix those two reviews asked for (`C1.log:4`). Only mason ran after it (`:50`, 08:01:19). This session re-runs vigil; **warden's PASS still does not cover the shipped resolver**, and warden's finding is precisely the one the fix addresses, so the reviewer who raised it has not seen the result. `as-built.md:23` hedges correctly and `check-specs --strict` will block the merge, so nothing is concealed — but a record should not put a pending step in the past tense, and mason filed the same item at `review-mason.md:61` where it remains open. Owner: builder — re-run `yarn review:run warden WEB-2` at the shipping head and reword the line to name what is outstanding.

**Consider — the resolve-error guidance misdirects for an `import`-only export.** `workspace-resolver.cjs:28` tells the reader to "Import a subpath the package exports; add an export only for an edge codebase-conventions §4 allows." Under `require` conditions (`as-built.md:19`), a future package whose subpath exists but is declared only under `"import"` fails with the same sentence, while the real fix is a `default` condition, not a new export entry. Every `@pem` export declares `default` today, so this costs nothing now; one clause in the message, or a line in `codebase-conventions.md:102` saying each `@pem` export declares `default`, would spare the next package author a wrong turn.

**Consider — `C3.log:5` still cannot distinguish "clean" from "blind."** For a slice whose named risk is a check that passes while seeing nothing, an empty `check` body is the one evidence shape to avoid. My enumeration closes it for this merge and `as-built.md:18`'s disposition (criteria frozen, `test:boundaries` is the standing guard) is sound; a linted-file count in a `check` log would make the next one self-evident without a reviewer's legwork.

**Consider — the error name couples to a private constant in a caret-ranged transitive dependency** (`workspace-resolver.cjs:32` → `resolve.js:17`, reached through `eslint-plugin-boundaries: ^6.0.0`, `packages/config/package.json:24`). A rename in a minor bump degrades output back to a stack carrying local absolute paths. `boundaries.test.ts:62` turns that into a loud CI failure rather than silent rot, which is why this is only a Consider; whether to pin is the stack owner's call.

### Conversation

The person who meets this change is a developer mid-refactor with the lint red. The zone message serves them well — it names both sides of the edge and says "Refactor — do not suppress." The resolve path now reads cleanly too (message only, no stack), but it is still anchored to line 1 rather than the offending import, and only the first unresolvable specifier in a file surfaces. Neither breaks the contract, and the header comment warns the next maintainer. Worth noting for whoever picks up the follow-up: the resolve error is the one a developer hits while doing something *legitimate* — importing from a package that simply has no entry yet — so it is the message most worth making kind.

### Runtime checklist (ordered by risk)

1. `yarn review:run warden WEB-2` at the shipping head; then `yarn check-specs --strict` must be clean (clears the Should-fix).
2. `yarn verify` once at batch close — `test:tooling` carries `boundaries.test.ts`, so a resolver regression fails CI.
3. Eyeball one real resolve error (scratch file importing `@pem/env/not-exported`, then delete it) and confirm CI prints the message with no local paths.
4. After any `eslint-plugin-boundaries` bump, re-read `C2.log` for the no-stack assertion before merging the bump.

Assumptions: `[ASSUMPTION: the working tree I read is the shipping revision; I cannot run git, so I judged the delta by matching the committed resolver's wording and error name against probes.log:30 and the C1/C2 assertions, which agree.]` `[ASSUMPTION: the app-by-name hole (as-built.md:27) and the TIER_2_PATHS follow-up are out of scope per contract.md:32-35, so neither is a finding here.]`

VERDICT: PASS
