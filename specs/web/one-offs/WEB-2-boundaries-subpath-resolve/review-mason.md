# Review — mason on WEB-2

> Written by `yarn review:run mason WEB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: 5f3ce29eeb8f5ac5b6b4b3f38fd13c09156803be628708743452424d079b35f2
- as_built_sha256: 67149d91bbd0c72beaf33587a12ff26ca723f2ef8bee46998905c0624d0390ba
- head: 9a473b11e473fe78f33f00fdf2c8a3ce745c677f
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T07:37:21Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason WEB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket WEB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log (sha256 a7f34a502b8c)
   - C2 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log (sha256 e794c6b6d54d)
   - C3 check: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log (sha256 1b6aea9710b4)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): docs/decisions/changelog.md, docs/engineering/codebase-conventions.md, package.json, packages/config/eslint/boundaries.js, packages/config/eslint/workspace-resolver.cjs, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/probes.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json, tooling/boundaries.test.ts.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Review — WEB-2 boundaries-subpath-resolve (mason)

**Verdict up top: PASS.** Tier 2, one-way door (`packages/config/eslint/boundaries.js`, `toolkit.json` line 44, reviewer mason) — read in full, not sampled. No blocking finding. Human merge still required; my approval is not a merge.

## Criteria

**C1 — a disallowed `@pem/<subpath>` edge fails the lint. Met.**
`packages/config/eslint/workspace-resolver.cjs:21-30` handles only `@pem/` specifiers through `createRequire(file).resolve(source)` and is listed first in `import/resolver` (`packages/config/eslint/boundaries.js:171-176`). Because `require.resolve` returns the realpath under `packages/<name>/`, the resolved path lands in the element zone (`boundaries.js:29-35` also covers the `node_modules/@pem/` symlink form), so `boundaries/dependencies` fires with the zone message. `tooling/boundaries.test.ts:22-47` asserts the observable message for `ui → @pem/db/client`, `env → @pem/brand/brand` and the relative `env → ../../db/src/client`; `evidence/C1.log` is 7/7 at exit 0, head `f9d7da1`, and `evidence/probes.log` corroborates with two real files linted at exit 1 and the exact zone wording. Both probe files are gone from the tree (glob for `**/zz-probe*` returns nothing) — non-negotiable 6 met.

**C2 — an unexported `@pem/*` specifier is a resolve error; everything else lints as before. Met.**
The throw path is real, not assumed: `eslint-module-utils/resolve.js:231-252` catches a thrown resolver and reports `Resolve error: <message>` against the rule's own severity, which is `error` here (`boundaries.js:200-209`), so it fails `eslint . --max-warnings 0`. `tooling/boundaries.test.ts:49-60` pins that message. The three allow cases (`:62-74`) assert **zero** messages, which is the stronger assertion and the one that proves non-negotiable 3: `@pem/env/tier` across an allowed edge, `next-themes`/`react` as third-party, and the app probe covering `@pem/ui/button`, `@pem/ui/styles/globals.css`, `@pem/brand/assets/logo.svg` (the `./assets/*` pattern) and the `@/app/layout` alias — the alias still falls to `unresolvableAlias: true` and raises no resolve error. No dependency added (`node:module` only), so non-negotiable 4 holds and `tech-stack.md` is correctly untouched.

**C3 — the real tree passes. Met.**
`evidence/C3.log` is exit 0 at the same head. I checked the claim rather than took it: the only package-to-package specifiers in the tree are `@pem/env/{tier,pick}` from `db` (allowed) and `@pem/config/eslint/*` from four `eslint.config.mjs` files (allowed), and every `@pem/*` subpath in use is exported by its package's `package.json` — all five point at `./src/`, no `dist`, so lint does not depend on a build. No `eslint-disable` touches a boundaries rule anywhere in the repo (non-negotiable 5). The post-proof commit `9a473b1` touched only the ticket folder, which `changedAfter` excludes from staleness by design (`tooling/lib/specs.ts:812-826`), so the proofs still bind.

Two design calls I ratify: keying the resolver by absolute path (`boundaries.js:172`) is necessary, since `eslint-module-utils` resolves resolver names from `pkgDir(sourceFile)`, and it survives being copied to a product repo because `configDir` comes from `import.meta.url`; CJS is forced by `require`-loading. The `require`/`node`/`default` condition limit is named in the as-built and fails closed, which is the right default.

## Findings

**Should-fix — no ledger line for a new enforced rule.** `docs/engineering/codebase-conventions.md:79` gains a rule ("An `@pem/*` import is resolved through its package's `exports`, and one that does not resolve fails the lint") and `docs/decisions/changelog.md:18-24` records it, but `docs/decisions/ledger.md` has no line — contrast EN-11 (`ledger.md:342`), the parallel STK-22 change that also amended §4 and added a check, and the STK-22 changelog entry that cites it (`changelog.md:34`). Root cause is a doc conflict, which is the part worth fixing at the source: `docs/index.md` ("Changing the practice") says ledger line **and** changelog entry; `.claude/rules/docs.md` says **or**. Add the EN line and make the two files agree.

**Should-fix (follow-up ticket, not a merge blocker) — the same hole remains for app package names.** `boundaries.js:37-43` and `:177-182` deliberately anticipate app-by-name imports (`node_modules/web/**`), but nothing resolves them: `apps/web/package.json` has no `main` and no `exports`, so `import "docs"` from `apps/web` resolves to nothing, passes on `isUnknown` (`boundaries.js:120`), and the hard app-to-app ban never fires — the exact silent-pass class this ticket closed for `@pem/*`. Out of WEB-2's declared scope (the non-negotiables are `@pem/*`-only), and the plausible vector is already caught by `WORKSPACE_PATH_PATTERN` (`boundaries.js:79-83`), so exposure is low. The cheaper fix is a `no-restricted-imports` pattern on the app package names, not widening the resolver, because a hard-banned edge deserves the zone message rather than a resolve error.

**Consider — C3's evidence cannot distinguish "clean" from "saw nothing."** `evidence/C3.log:5` is an empty body, yet the slice's stated risk is "a check that passes silently while seeing nothing," and the contract's own spike counted 133 files (`contract.md:82`). C1/C2 cover it indirectly by erroring through the same root config, but recording the file count in a `check` log would make the proof self-evident.

**Consider — a bare `@pem/db` now reports a resolve error, not the zone message.** No package declares a `"."` export, so `workspace-resolver.cjs:27`'s wording ("export the subpath from its package.json, or fix the import") invites someone to add a root export to silence a lint that is actually a boundary violation. Adding the edge back to the message would close the loop; the end state is correct either way, since once it resolves the zone rule fires.

**Consider — the negative control is prose.** `as-built.md:5` ("with the resolver line removed, the two subpath tests fail") and `evidence/probes.log:1` implying a before/after pair while capturing only the after-state are assertions, not artifacts. The regression test in `yarn test:tooling` is what protects this going forward, so this costs nothing operationally.

The as-built's deviations are accurate as written: `TIER_2_PATHS` (`tooling/lib/specs.ts:71-77`) genuinely omits `boundaries.js` and `packages/*/package.json` while `toolkit.json:43-54` names both doors, so the hand-raised `tier: 2` is the right compensating move and the Next item is the right follow-up for Taylor.

VERDICT: PASS
