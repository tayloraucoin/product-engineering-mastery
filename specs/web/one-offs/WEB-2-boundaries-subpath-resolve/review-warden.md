# Review — warden on WEB-2

> Written by `yarn review:run warden WEB-2`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ce45839c4387ad272bd390087ad5c8b64a899d13c323834ffa9fd0a520250d99
- as_built_sha256: 420839230ca153d12ab4ae046198032482e76e737a458574d519aff0329313b2
- head: ae3b55a7d14127265e68c33a2888147fa6edf9e9
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T07:55:00Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden WEB-2`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket WEB-2 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log (sha256 c5e5a9b4b938)
   - C2 test: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log (sha256 e6b1ba7fd341)
   - C3 check: specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log (sha256 d766a08cf286)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): docs/decisions/changelog.md, docs/decisions/ledger.md, docs/engineering/codebase-conventions.md, package.json, packages/config/eslint/boundaries.js, packages/config/eslint/workspace-resolver.cjs, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/as-built.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/contract.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C1.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C2.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/C3.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/evidence/probes.log, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/results.json, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/review-mason.md, specs/web/one-offs/WEB-2-boundaries-subpath-resolve/review-vigil.md, tooling/boundaries.test.ts.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — WEB-2 boundaries-subpath-resolve (warden)

**Verdict up top: PASS.** No Blocking finding. Tier 2, one-way door (`specs/_shared/epics/STK-default-stack/technical.md:38` names `packages/config/eslint/boundaries.js` a door) — read in full, not sampled. My approval is not a merge.

Third review on this ticket. Mason (`review-mason.md:71`) and vigil (`review-vigil.md:84`) both PASS against the same contract and as-built hashes. I checked their load-bearing claims against the files rather than inheriting them, and I'm not refiling what they already filed.

### What this ticket actually protects

Worth naming before the criteria, because it sets the severity floor: `ui` is the client-bundled package and `@pem/db/client` is the postgres client, with `postgres` pinned to `db` as its sole owner (`boundaries.js:65-68`). Before this fix, a `"use client"` leaf in `packages/ui` could `import "@pem/db/client"` and lint green — a server-only module, and the connection string it reads, reachable from a browser module graph while the check reported clean. That is the impact behind "a check that passes silently while seeing nothing," and it is why fail-closed was the right call rather than a tolerable one. `yarn check-client-bundle` (`package.json:44`, `codebase-conventions.md:121`) remains the backstop, so this edge now has two independent controls instead of one that was blind.

### Criteria

**C1 — a disallowed `@pem/<subpath>` edge fails the lint. Met.**
`workspace-resolver.cjs:22` gates on the `@pem/` prefix; `:24` resolves through `createRequire(file).resolve`, which honours `exports` and returns a real path under `packages/<name>/`, inside the element zone (`boundaries.js:29-35` covers the `node_modules/@pem/` symlink form too). First in `import/resolver`, keyed by an absolute path from `import.meta.url` (`boundaries.js:171-176`). `tooling/boundaries.test.ts:22-47` asserts the observable zone message, not merely "an error"; `evidence/C1.log` is 7/7 at exit 0. I confirmed the asserted message can only come from `boundaries/dependencies`: `@pem/db/client` matches neither group of `WORKSPACE_PATH_PATTERN` (`boundaries.js:79-83`), so the test genuinely exercises resolution rather than the string ban. `probes.log:3-23` corroborates with two real files at exit 1 and the exact wording, and `**/zz-probe*` returns nothing — non-negotiable 6 met. The test writes no file, so no run can leave a probe importing `@pem/db/client` behind in a shipped package.

**C2 — an unexported `@pem/*` specifier fails; everything else lints as before. Met.**
I verified the throw path rather than taking it from the as-built: `node_modules/eslint-module-utils/resolve.js:231-251` catches a thrown interface-v2 resolver and reports it through `context.report` with no explicit severity, inheriting `boundaries/dependencies`, configured `"error"` (`boundaries.js:200-209`). So an unresolvable `@pem/*` is an error-severity finding — not a crash, not a warning that `--max-warnings 0` happens to catch. `tooling/boundaries.test.ts:49-60` pins it; the three allow cases (`:62-74`) assert **zero** messages, which is the right strength for non-negotiable 3, and they cover the non-JS export targets (`packages/brand/package.json:27`, `packages/ui/package.json:23`) and the `@/` alias. Only `node:module` is imported (`workspace-resolver.cjs:17`), so non-negotiable 4 holds and `tech-stack.md` is correctly untouched. No boundaries suppression exists in the changed files — non-negotiable 5.

One property neither prior review stated, and the one I care most about in a lint-time hook: this calls `.resolve()`, never `require()`. Resolution reads `package.json` `exports` and executes no module code, so linting a hostile or malformed source file cannot execute workspace code through this path. It should stay that way; a future "just import it to check" would turn the linter into an execution surface.

**C3 — the real tree passes with subpaths resolved. Met, on evidence weaker than the claim.**
`evidence/C3.log` is exit 0 at head `bdd5023` with an empty body. For a slice whose stated risk is a check that passes while seeing nothing, an empty log cannot by itself tell clean from blind. It is closed for this merge by C1/C2, which lint file paths inside `packages/**` and `apps/**` through the same root config (`eslint.config.mjs:27`) and so prove the zones and the resolver are live, plus both reviewers' independent enumeration of every live `@pem/*` specifier finding only `db → env` and `eslint.config.mjs → config`, both in `PACKAGE_IMPORTS` (`boundaries.js:56-62`). The file-count-in-the-log suggestion is already filed twice; I won't refile it.

Docs land where the practice requires: `codebase-conventions.md:79` carries the fail-closed sentence, `ledger.md:343` is EN-12, `changelog.md:18-25` cites it. The changelog's CI claim is true — `package.json:30` puts `boundaries.test.ts` inside `test:tooling`, which `verify` runs (`:14`), so the regression guard is enforced, not asserted.

### Findings

**Should-fix — the resolve error prints a stack trace, leaking absolute paths from the machine that ran the lint.** `workspace-resolver.cjs:26-29` throws a plain `Error`; `node_modules/eslint-module-utils/resolve.js:241-243` substitutes `err.stack` for `err.message` whenever `err.name !== "EslintPluginImportResolveError"` (`:17`). So the careful guidance sentence is the first line of a stack dump carrying local filesystem paths into lint output, CI logs, and anything a developer pastes into an issue. Low impact — a private repo, paths that other build output already exposes — but it is free to avoid, and the one new user-facing output this ticket creates is the one that bleeds. This is vigil's finding 1 (`review-vigil.md:59`), confirmed by me at the third-party source, with the disclosure dimension added: the same one-line fix, `error.name = "EslintPluginImportResolveError"`, closes both the readability problem and the leak. Not a second ticket; the same one.

**Consider — the check now trusts hoisting, not declaration.** `createRequire` from `packages/env/src/…` resolves `@pem/brand` even though `packages/env/package.json:33-38` declares no such dependency. That is exactly what makes C1 report `env must not import brand` instead of a resolve error, and it is correct for this ticket. The side effect: an import across an *allowed* edge also resolves without a declared dependency, so a phantom dependency lints clean. Nothing live today — `apps/web/package.json:13-24`, `packages/db/package.json:48` and each package declare what they import — so this is latent. It matters to the removal protocol: `check-stack` reasons about each module's declared `dependencies` (`technical.md:26`), and a phantom import is reach that list does not show, which is how a removal runbook leaves a live edge behind. A line in the ticket that builds out `check-stack`, not a change here.

**Consider — the same fail-open class survives for non-`@pem` shapes, correctly out of scope.** `import "docs"` from `apps/web` still resolves to nothing and passes on `isUnknown` (`boundaries.js:120`); carried with the right fix at `as-built.md:26` and already filed by mason. The sibling case neither review names: a relative path into `tooling/` from an app or package file. `apps/web/next.config.ts:5` is the one sanctioned instance (STK-19, `codebase-conventions.md:69`), and `WORKSPACE_PATH_PATTERN` (`boundaries.js:79-83`) groups only `**/packages/*/**` and `**/apps/*/**`, so "no other app or package file imports from it" is prose with nothing behind it. Eleven `tooling/` files read `process.env` directly, so the class is not cosmetic — though `check-client-bundle` catches the consequence that would actually hurt. Same shape and same fix pattern as the app-by-name hole; fold it into that follow-up rather than opening a third.

**Consider — the gate protecting this control is itself unenforced, and recorded as such.** `TIER_2_PATHS` (`tooling/lib/specs.ts:71-77`) matches neither `packages/config/eslint/boundaries.js` nor `packages/*/package.json`, though `technical.md:38` names both a one-way door. This ticket compensated by hand (`contract.md:61`, `as-built.md:15`) and recorded the follow-up with an owner and a trigger (`as-built.md:26`). That is a risk acceptance in the shape I want, and `contract.md:33` puts it explicitly out of scope, so I am not relitigating it — only stating it once in this record: until `TIER_2_PATHS` names that file, the next change to this one-way door can ship at tier 1 with no reviewer, which is a governance fail-open of precisely the shape as the lint fail-open this ticket just closed.

### Evidence hygiene

All four evidence files are clean: no environment values, no secrets, no absolute paths (`C1.log`, `C2.log`, `C3.log`, `probes.log`). Worth stating because the new output this ticket introduces is path-bearing by default — once the Should-fix lands, a future `check` log that happens to capture a resolve error will stay clean too. As things stand, anyone who captures one into evidence will commit their machine's paths into the spec folder.

`[ASSUMPTION: the only code change after head bdd5023 is the resolve-error rewording described in as-built.md:17 — I cannot run git. The commit titled "criteria re-proven after the review fixes" sits after bdd5023 and the three proofs record bdd5023 as their head, which reads as the proofs having been run on the revision that ships; vigil's staleness Should-fix (review-vigil.md:61) and check-specs --strict remain the authority before merge.]`

VERDICT: PASS
