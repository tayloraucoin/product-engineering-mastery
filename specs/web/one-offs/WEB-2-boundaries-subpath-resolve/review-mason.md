# Review — mason on WEB-2

> Written by `yarn review:run mason WEB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ce45839c4387ad272bd390087ad5c8b64a899d13c323834ffa9fd0a520250d99
- as_built_sha256: 90e9dfc89a4e46863a29e5bff637391805f5c0e6a86c200f604e6eeccae72968
- head: 7b66fdb22b32cb13f32fdb7769c552ab58f5befd
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T08:01:19Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason WEB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket WEB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Review — WEB-2 boundaries-subpath-resolve (mason)

**Verdict up top: PASS.** Tier 2, one-way door: `specs/_shared/epics/STK-default-stack/technical.md:38` names `packages/config/eslint/boundaries.js` the package-graph door with mason as reviewer, so this was read in full, not sampled. No Blocking finding. My approval is not a merge; a human merge is still required, and see Should-fix 1 for what must clear first.

This is a re-review after `1dec187`. `results.json:43-57` holds a mason PASS at `5786c62`, against the resolver as it stood before the error-name change; that record is superseded by this one, not contradicted.

## Criteria

**C1 — a disallowed `@pem/<subpath>` edge fails the boundaries lint. Met.**
`packages/config/eslint/workspace-resolver.cjs:23` handles only `@pem/` specifiers; `:25` resolves through `createRequire(file).resolve(source)`, which honours each package's `exports` and returns the realpath under `packages/<name>/`, inside the element zone — and `boundaries.js:29-35` covers the `node_modules/@pem/` symlink form as well, so either path matches. It is listed first under `import/resolver`, keyed by absolute path built from `import.meta.url` (`boundaries.js:171-176`), which is both necessary (eslint-module-utils resolves resolver names from the source file's package dir) and portable. `tooling/boundaries.test.ts:22-47` asserts the observable zone message for `ui → @pem/db/client`, `env → @pem/brand/brand` and the relative `env → ../../db/src/client`; `evidence/C1.log` is 8/8 at exit 0, head `1dec187`. `evidence/probes.log:3-23` corroborates the literal `yarn eslint <file>` form at exit 1 with the exact wording, and `**/zz-probe*` returns nothing — non-negotiable 6 met.

**C2 — an unexported `@pem/*` specifier is a resolve error; everything else lints as before. Met.**
I checked the throw path in the library rather than assuming it. `node_modules/eslint-module-utils/resolve.js:179-181` calls an `interfaceVersion: 2` resolver **outside** the try/catch, so the throw propagates to `:232-251` and is reported as `Resolve error: …` through `context.report` with no explicit severity — inheriting `boundaries/dependencies`, configured `"error"` (`boundaries.js:200-209`). Failures are not memoized (`resolve.js:211` leaves `cache(undefined)` commented out), so there is no cross-file poisoning and no stale pass after a fix.

The error-name fix is real and correct, not a guess: `resolve.js:17` defines `ERROR_NAME = 'EslintPluginImportResolveError'` and `:241` prints `err.stack` instead of `err.message` for any other name. `workspace-resolver.cjs:32` sets exactly that name, and nothing else in the file keys on it (`:89`, `:107`, `:112` only set it), so there is no other behaviour being impersonated. `tooling/boundaries.test.ts:55-63` pins both the message and the absence of a stack (`assert.doesNotMatch(error!, /\n\s+at /)`), over `@pem/env/not-exported` and the bare `@pem/db` — the case that matters most, since no package declares a `"."` export and the old wording could have been read as "add one." The three allow cases (`:65-77`) assert **zero** messages, which is what carries non-negotiable 3: `@pem/env/tier` across an allowed edge, `next-themes`/`react` as third-party, and an app probe covering `@pem/ui/button`, `@pem/ui/styles/globals.css`, `@pem/brand/assets/logo.svg` (the `./assets/*` pattern, `packages/brand/package.json:27`) and the `@/app/layout` alias, which still falls through to `unresolvableAlias: true`. Only `node:module` is imported (`:18`) and neither `package.json` gained a resolver dependency, so non-negotiable 4 holds and `tech-stack.md` is correctly untouched. `package.json:9` adds `test:boundaries`; `:30` means `test:tooling` picks up the same file, and `:14` puts that inside `yarn verify` — the guard is in CI, as `changelog.md:24` claims.

**C3 — the real tree passes with subpaths resolved. Met.**
`evidence/C3.log` is exit 0 at head `1dec187`, with an empty body (see Consider 3). I verified the stronger claim by enumeration rather than taking it: all 42 live `@pem/*` specifiers in `apps/**` and `packages/**` resolve against a declared export (`packages/{config,env,brand,ui,db}/package.json` exports maps), and the only package-to-package edges are `db → env` (`packages/db/src/client.ts:12`, `connection.ts:9`, `scripts/env.ts:17-18`, `scripts/database.ts:14`) and each `eslint.config.mjs → config` — both allowed by `PACKAGE_IMPORTS` (`boundaries.js:56-62`). No `eslint-disable` touches a boundaries rule anywhere in the repo, so non-negotiable 5 holds and the fix revealed no real violation, as stated.

Deviations I ratify as accurate: `TIER_2_PATHS` (`tooling/lib/specs.ts:71-77`) genuinely omits `packages/config/eslint/boundaries.js` and `packages/*/package.json`, so the hand-raised `tier: 2` was the right compensating move; the `require`/`node`/`default` condition set (`as-built.md:19`) fails closed for a future `import`-only package; CJS is forced by `require`-loaded resolvers. Every changed file sits inside `planned_paths`, and the three out-of-scope items were respected.

## Findings

**Should-fix — `as-built.md:18` says "All three reviews were re-run"; `results.json` says they were not.** The recorded heads are mason `5786c62` (`:51`), vigil `c85c6ad` (`:65`) and warden `ae3b55a` (`:80`), all at 07:45–07:55 — every one of them before `1dec187`, the commit that changed the resolver in response to their findings. This session is the first mason run on the shipping code; vigil's and warden's PASS do not cover it, and both should be re-run at the shipping head before merge. `as-built.md:23` does hedge correctly ("until `yarn review:run` records them"), and `yarn check-specs --strict` enforces staleness at the gate, so nothing is hidden — but a record should not state a pending step in the past tense.

**Consider — `interfaceVersion = 2` is load-bearing for fail-closed and the comment does not say so.** `workspace-resolver.cjs:20` sets it, and `resolve.js:183-189` shows that a v1 resolver's `resolveImport` throw is swallowed into `{ found: false }` — straight back to passing as unknown. The header (`:1-2`) names the interface descriptively; half a sentence saying a v1 rewrite silently reopens the hole is the cheap insurance. The C2 tests would catch it in `yarn verify`, which is why this is a Consider.

**Consider — the error name couples to a private constant in a transitive, caret-ranged dependency.** `workspace-resolver.cjs:32` depends on `resolve.js:17`, reached through `eslint-plugin-boundaries: ^6.0.0` (`packages/config/package.json:24`). A minor bump that renames it degrades the output to a stack bearing local absolute paths — which is also warden's privacy point, since anyone capturing a resolve error into a `check` log would commit their machine's paths. `tooling/boundaries.test.ts:62` makes that a loud CI failure rather than silent rot; the pin, if one is wanted, is the stack owner's call.

**Consider — `evidence/C3.log:5` still cannot distinguish "clean" from "saw nothing."** For a slice whose stated risk (`contract.md:5`) is a check that passes while seeing nothing, an empty body is the one evidence shape to avoid. The builder's disposition (`as-built.md:18`: criteria frozen, `test:boundaries` is the regression guard) is sound and my enumeration closes it for this merge; a file count in a `check` log would make the next one self-evident.

**Consider (no action here) — the app-by-name hole is carried, correctly, not closed.** `apps/docs/package.json:2` declares `"name": "docs"` with no `main` or `exports`, so `import "docs"` from `apps/web` resolves to nothing and passes on `isUnknown` (`boundaries.js:120`) despite the zones at `:37-43` and `:177-182`. Outside WEB-2's `@pem/*`-only non-negotiables, low exposure (`WORKSPACE_PATH_PATTERN`, `boundaries.js:79-83`, catches the plausible vector), and `as-built.md:27` records it with the right fix — `no-restricted-imports` on the app names, so a hard-banned edge reports the zone message rather than a resolve error.

The second-round fixes all landed as described, and I verified each against the files: the resolver header now states one error per file at line 1 (`workspace-resolver.cjs:11-13`), the bare `@pem/db` case is pinned (`boundaries.test.ts:49-52`, `C1.log:32-36`), and `probes.log:25-34` renders the resolve error as users see it — message only, no stack, no local paths.

VERDICT: PASS
