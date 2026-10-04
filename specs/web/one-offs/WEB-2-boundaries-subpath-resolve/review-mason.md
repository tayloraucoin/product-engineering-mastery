# Review — mason on WEB-2

> Written by `yarn review:run mason WEB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ce45839c4387ad272bd390087ad5c8b64a899d13c323834ffa9fd0a520250d99
- as_built_sha256: 420839230ca153d12ab4ae046198032482e76e737a458574d519aff0329313b2
- head: 5786c6284d432b6432162bb1254ef9a630b0b1b3
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T07:45:07Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason WEB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket WEB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log (sha256 c5e5a9b4b938)
   - C2 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log (sha256 e6b1ba7fd341)
   - C3 check: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log (sha256 d766a08cf286)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): docs/decisions/changelog.md, docs/decisions/ledger.md, docs/engineering/codebase-conventions.md, package.json, packages/config/eslint/boundaries.js, packages/config/eslint/workspace-resolver.cjs, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/probes.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/review-mason.md, tooling/boundaries.test.ts.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Review — WEB-2 boundaries-subpath-resolve (mason)

**Verdict up top: PASS.** Tier 2, one-way door (`packages/config/eslint/boundaries.js`; `specs/_shared/epics/STK-default-stack/technical.md:38` names the package graph a door with mason as reviewer) — read in full, not sampled. No blocking finding. Human merge still required; my approval is not a merge.

This is a re-review: `results.json:43-57` holds a mason PASS at `9a473b1` against the older contract and as-built hashes. The two fixes that run claimed are real (see findings), so that record is superseded by this one rather than contradicted.

## Criteria

**C1 — a disallowed `@pem/<subpath>` edge fails the lint. Met.**
`packages/config/eslint/workspace-resolver.cjs:22` handles only `@pem/` specifiers; `:24` resolves through `createRequire(file).resolve(source)`, which honours each package's `exports`, and the realpath it returns lands under `packages/<name>/`, inside the element zone (`boundaries.js:29-35` covers the `node_modules/@pem/` symlink form too). It is listed first in `import/resolver`, keyed by absolute path (`boundaries.js:171-176`) — necessary, since `eslint-module-utils` resolves resolver names from the source file's package dir, and portable, because `configDir` comes from `import.meta.url`. `tooling/boundaries.test.ts:22-47` asserts the observable zone message for `ui → @pem/db/client`, `env → @pem/brand/brand` and the relative `env → ../../db/src/client`; `evidence/C1.log` is 7/7 at exit 0, head `bdd5023`. `evidence/probes.log:3-23` corroborates with two real files at exit 1 and the exact wording, and both are gone from the tree (`**/zz-probe*` returns nothing) — non-negotiable 6 met.

**C2 — an unexported `@pem/*` specifier is a resolve error; everything else lints as before. Met.**
The throw path is real and error-severity, which I checked rather than assumed: `node_modules/eslint-module-utils/resolve.js:245-248` reports a thrown resolver as `Resolve error: …` through `context.report` with no explicit severity, so it inherits `boundaries/dependencies`, configured `"error"` (`boundaries.js:200-209`). It therefore fails CI independent of `--max-warnings 0`. `tooling/boundaries.test.ts:49-60` pins the message. The three allow cases (`:62-74`) assert **zero** messages — the stronger assertion, and the one that carries non-negotiable 3: `@pem/env/tier` across an allowed edge, `next-themes`/`react` as third-party, and an app probe covering `@pem/ui/button`, `@pem/ui/styles/globals.css`, `@pem/brand/assets/logo.svg` (the `./assets/*` pattern, `packages/brand/package.json:27`) and the `@/app/layout` alias, which still falls to `unresolvableAlias: true`. Only `node:module` is imported, so non-negotiable 4 holds and `tech-stack.md` is correctly untouched. `package.json:9` adds `test:boundaries`, and `:30` means `test:tooling` — inside `yarn verify` (`:14`) — runs the same file, so the guard is in CI, as the changelog claims.

**C3 — the real tree passes. Met.**
`evidence/C3.log` is exit 0 at head `bdd5023`. I verified the as-built's stronger claim by enumeration instead of taking it: every live `@pem/*` specifier in `apps/**` and `packages/**` (38 of them) resolves against a declared export, and the only package-to-package edges are `db → env` (`packages/db/src/client.ts:12`, `connection.ts:9`, `scripts/env.ts:17-18`, `scripts/database.ts:14`) and each `eslint.config.mjs → config` — both allowed by `PACKAGE_IMPORTS` (`boundaries.js:56-62`). No package declares a `"."` export and none needs one. No `eslint-disable` touches a boundaries rule anywhere in the repo (non-negotiable 5). So the fix revealed no real violation, as stated.

Two things the as-built asserts and I ratify: the `require`/`node`/`default` condition limit (`as-built.md:18`) fails closed for a future `import`-only package, which is the right default; and CJS is forced by `require`-loading resolvers.

## Findings

**Should-fix (file as a docs ticket, not a WEB-2 blocker) — the two always-on files still disagree on what recording a ruling requires.** `docs/index.md:75` says ledger line **and** changelog entry; `.claude/rules/docs.md:3` says ledger line **or** changelog entry. WEB-2 now satisfies the stricter reading — `ledger.md:343` (EN-12) and `changelog.md:18-25`, which cites it — so the ticket is clean; the ambiguity is not, and it is why the line was missing the first time. Amending `.claude/rules/docs.md` is outside this ticket's planned paths, which is the right call; it needs its own ticket rather than a third review raising it.

**Consider — resolve errors are one per file, not one per specifier.** `eslint-module-utils/resolve.js:235,249` guards on `erroredContexts`, so a second unresolvable `@pem/*` in the same file is silent until the first is fixed, and the error is reported at line 1 column 0 rather than at the import. Fail-closed still holds — the file cannot pass — so `codebase-conventions.md:79` is true per file; a half-sentence in the resolver's header comment would spare the next reader the surprise.

**Consider — C3's evidence still cannot distinguish "clean" from "saw nothing."** `evidence/C3.log:5` is an empty body for a slice whose stated risk is a check that passes while seeing nothing. The builder's reasoning for leaving it (`as-built.md:17`: criteria frozen, `test:boundaries` is the regression guard) is sound, and my enumeration above closes it for this merge. A file count in a `check` log would make future ones self-evident.

**Consider — the negative control and the before-state remain prose.** `as-built.md:5` (resolver line removed → the two subpath tests fail) and `probes.log:1` (before the fix, `agent/STK-3` at `41fc4bc`, exit 0) are assertions; `probes.log` captures only the after-state. Costs nothing operationally now that the test file is in `yarn verify`.

**Consider (no action for this merge) — the app-by-name hole is correctly carried, not closed.** `apps/web/package.json:2` has no `main` or `exports`, so `import "docs"` from `apps/web` still resolves to nothing and passes on `isUnknown` (`boundaries.js:120`) despite the anticipated zones at `:37-43` and `:177-182`. Out of WEB-2's `@pem/*`-only non-negotiables, low exposure (`WORKSPACE_PATH_PATTERN`, `boundaries.js:79-83`, catches the plausible vector), and `as-built.md:26` records it with the right fix — `no-restricted-imports` on the app names, so a hard-banned edge gets the zone message rather than a resolve error.

The remaining deviations are accurate as written: `TIER_2_PATHS` (`tooling/lib/specs.ts:71-77`) genuinely omits `boundaries.js` and `packages/*/package.json`, so the hand-raised `tier: 2` is the right compensating move, and promoting those two into `TIER_2_PATHS` is the right follow-up for Taylor. Adding `ledger.md` to `planned_paths` after the proofs does not disturb them: `criteria_sha256` covers criteria only, and declaring a path actually changed beats leaving it undeclared.

VERDICT: PASS
