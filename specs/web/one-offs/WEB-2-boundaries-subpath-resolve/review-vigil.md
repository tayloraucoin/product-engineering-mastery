# Review — vigil on WEB-2

> Written by `yarn review:run vigil WEB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ce45839c4387ad272bd390087ad5c8b64a899d13c323834ffa9fd0a520250d99
- as_built_sha256: 420839230ca153d12ab4ae046198032482e76e737a458574d519aff0329313b2
- head: c85c6ad2c5cc7ff2885db4c32d9ee278f8924260
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T07:49:16Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil WEB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket WEB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — WEB-2 boundaries-subpath-resolve (vigil)

**Verdict: PASS with conditions.** No Blocking finding. Two Should-fix items, both narrow; one of them (stale proofs) is already enforced by `check-specs` and must be cleared before merge. Tier 2, one-way door (`specs/_shared/epics/STK-default-stack/technical.md:38` names `packages/config/eslint/boundaries.js` a door) — read in full, not sampled. My approval is not a merge.

I built the expected-behaviour list from the contract's non-negotiables and criteria before reading `workspace-resolver.cjs`, then traced each to code; where the claim rested on third-party behaviour I read the third party rather than the as-built.

### Criteria

**C1 — a disallowed `@pem/<subpath>` edge fails the lint. Met.**
`workspace-resolver.cjs:22` gates on the `@pem/` prefix; `:24` resolves through `createRequire(file).resolve`, which honours `exports` and returns a path inside the element zone (`boundaries.js:29-35` covers both the `packages/<name>/` and `node_modules/@pem/<name>/` forms). It is first in `import/resolver` and keyed by an absolute path derived from `import.meta.url` (`boundaries.js:171-176`), so it stays portable in a copied repo and needs no `exports` entry of its own — which is why no `packages/*/package.json` is touched, consistent with the planned paths. `tooling/boundaries.test.ts:22-47` asserts the observable zone message for the two subpath cases plus the relative control; `evidence/C1.log` is 7/7 at exit 0. I confirmed the asserted message can only come from `boundaries/dependencies`, not from `no-restricted-imports`: `@pem/db/client` matches neither group in `WORKSPACE_PATH_PATTERN` (`boundaries.js:79-83`), so the test genuinely exercises resolution. `probes.log:3-23` corroborates with two real files at exit 1, and `**/zz-probe*` returns nothing — non-negotiable 6 met.

**C2 — an unexported `@pem/*` specifier fails; everything else lints as before. Met, with a Should-fix on what the failure prints.**
I verified the throw path rather than assuming it. `eslint-module-utils/resolve.js:178-181` calls an interfaceVersion-2 resolver with no try/catch, so the throw propagates to `:231-251`, which reports it through `context.report` with no explicit severity — inheriting `boundaries/dependencies`, configured `"error"` (`boundaries.js:200-209`). `eslint-plugin-boundaries/dist/Elements/Elements.js:83` calls that same reporting `resolve`, never the bare `relative`, so an unresolvable `@pem/*` can never crash the lint run; it always reports. Fail-closed holds, and non-negotiable 2 is met. The three allow cases (`tooling/boundaries.test.ts:62-74`) assert **zero** messages, which is the right strength for non-negotiable 3, and they cover the condition question: every `@pem` export declares `default` (`packages/env/package.json:6-27`, `packages/brand/package.json:6-28`, `packages/ui/package.json:6-24`), and the non-JS targets `./assets/*` and `./styles/globals.css` resolve. Only `node:module` is imported, so non-negotiable 4 holds and `tech-stack.md` is correctly untouched. `package.json:9` adds `test:boundaries`, and `:30` puts the same file inside `test:tooling`, which `verify` (`:14`) runs — the regression guard is in CI, as the changelog claims.

**C3 — the real tree passes with subpaths resolved. Met.**
`evidence/C3.log` is exit 0 at head `bdd5023`. I did not take the "no hidden violation" claim on trust: there are 42 live `@pem/*` specifiers across 22 files in `apps/**` and `packages/**`, every one of which now runs through the new resolver, and the only package-to-package edges are `db → env` and each `eslint.config.mjs → config`, both in `PACKAGE_IMPORTS` (`boundaries.js:56-62`). The root config ignores only `node_modules`, `.next`, `dist`, `.turbo` (`eslint.config.mjs:14-19`), so `eslint .` does see those zones — and the C1/C2 tests, which lint file paths inside `packages/**` and `apps/**` through that same config, independently prove the zones are live. No boundaries suppression exists anywhere (non-negotiable 5).

Docs are where they should be: `codebase-conventions.md:79` carries the fail-closed sentence, `ledger.md:343` is EN-12, `changelog.md:18-25` cites it — the stricter reading of `docs/index.md` §Changing the practice, satisfied.

### Findings

**Should-fix — the resolver throws a plain `Error`, so the lint message is the guidance sentence followed by a stack trace.** `packages/config/eslint/workspace-resolver.cjs:26-29` throws `new Error(...)`; `eslint-module-utils/resolve.js:241-243` substitutes `err.stack` for `err.message` whenever `err.name !== "EslintPluginImportResolveError"` (`:17`). So what a developer and CI actually get is `Resolve error: @pem/… does not resolve … allows.` plus `    at …` frames carrying absolute paths from the machine that ran the lint. The careful re-wording recorded in `as-built.md:17` is the first line of a stack dump. Setting `error.name = "EslintPluginImportResolveError"` on the thrown error restores the message-only report; wording itself is `devs_call`, but the stack trace is an artifact, not a choice. Owner: builder.

**Should-fix — the recorded proofs predate the shipped resolver.** `results.json:12,25,38` record C1–C3 at head `bdd5023`, while `as-built.md:17` states the resolver's error wording was changed after mason's first review — i.e. after the proofs. By inspection the behaviour is unchanged (the C2 assertion at `tooling/boundaries.test.ts:55-58` pins only `Resolve error: @pem/env/not-exported does not resolve`, which `workspace-resolver.cjs:27` still produces, and C1/C3 never touch the string), so I am not calling the criteria unproven. But they are now verified-by-inspection for the revision that ships, and the loop's own staleness rule (`tooling/lib/specs.ts:809-818`) will mark them stale, failing `check-specs --strict` before merge. Re-run `yarn test:boundaries` and `yarn lint:boundaries` and re-record. Owner: builder, before merge.

**Consider — a resolve error is one per file, at line 1 column 0, and the unresolved edge itself still passes as unknown.** `eslint-module-utils/resolve.js:235-250` guards on `erroredContexts`; `Elements.js:83-86` then describes the dependency with `to: undefined`, which `boundaries.js:120` allows. The file cannot pass, so `codebase-conventions.md:79` is true per file — but a second unresolvable specifier is silent until the first is fixed, and the error points at line 1, not the import. Half a sentence in the resolver's header comment (`workspace-resolver.cjs:10-12`) would spare the next reader the surprise.

**Consider — no test pins a bare `@pem/<pkg>` specifier.** No package declares a `"."` export, so `import "@pem/db"` in `packages/ui` produces a resolve error rather than the `ui must not import db` zone message. Non-negotiable 2 is satisfied either way, and the re-worded guidance was written for exactly this case, but nothing locks the reading; one row in `DISALLOWED`-adjacent form would.

**Consider — `evidence/C3.log:5` has an empty body.** For a slice whose stated risk is "a check that passes silently while seeing nothing," a `check` log that cannot distinguish clean from blind is the one shape to avoid. My 42-specifier enumeration closes it for this merge; a file count in the log would make the next one self-evident.

**Consider — `probes.log` captures only the two zone-message probes.** The resolve-error path, the one new user-facing output this ticket creates, appears in no evidence file as rendered text — which is why finding 1 went unseen. A third `$ yarn eslint` block on an unexported subpath would have shown it.

### Conversation

The reader of this feature is a developer at a bad moment — mid-refactor, lint red, wanting to know which line to change. The zone message does that well ("ui must not import db … Refactor — do not suppress"). The resolve path is weaker: right now the useful sentence is buried at the head of a stack trace, it is anchored to line 1 instead of the import, and only one such error surfaces per file. None of that breaks the contract, and the fail-closed decision behind it is the right one. It is worth one small follow-up so the two failure modes read equally well, since this error is the one a developer will hit while doing something legitimate (importing a module that simply has no export entry yet), not while violating a boundary.

### Runtime checklist (ordered by risk)

1. `yarn test:boundaries` and `yarn lint:boundaries` at the merge head, re-recorded — clears the stale proofs.
2. `yarn check-specs --strict` before merge; expect it to demand step 1 until done.
3. Eyeball one real resolve error (`import "@pem/env/not-exported"` in a scratch file, then delete it) and read what CI prints — the confirmation for finding 1.
4. `yarn verify` once at batch close; `test:tooling` carries `boundaries.test.ts`.

Assumptions: `[ASSUMPTION: the post-proof resolver edit described in as-built.md:17 is the only code change after head bdd5023 — I cannot run git and judged the delta from the as-built plus the current file.]` `[ASSUMPTION: the carried app-by-name hole (as-built.md:26) and the TIER_2_PATHS follow-up are out of scope per the contract's out-of-scope list, so neither is a finding here.]`

VERDICT: PASS
