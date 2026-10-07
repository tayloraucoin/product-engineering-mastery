---
title: Migrate, layer 2 — the repo's own checks become one verify command, with baselines that freeze old debt
description: "Open from step 6 of the migrate guide, with the verify inputs answered. Maps the repo's own checks, then the toolkit's, into one verify command; runs each once on the base commit; freezes a failing check by kind (ESLint bulk suppressions, tagged ts-expect-error lines with a count ratchet, expected-fail markers, a literal-path node test) or leaves it as a gap; the live-team rule; the CI edit."
layer: runbooks
status: draft
thread: "MIG"
role: Mason
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when:
---

# Verify: layer 2

> **Open from:** step 6 of [the guide](README.md), with rounds 51 to 53 answered and layer 1 committed.
> **In one line:** `verify` holds the repo's own checks as they pass at base, then the toolkit's. A check that fails at base is frozen so old debt is counted and new debt fails, or it stays out as a drafted gap the operator rules on. Nothing here rewrites the target's source to make a check pass.
> **Never on day one:** `strict` turned on, a new test runner, a baseline tool with a hot results file, a code rewrite.

The example repo is `acme-shop`, prefix `ACM`, with its count file reading `212`.

## 1. The mapping

`verify` chains, in this order, each script by the name 51 gave it:

1. **The repo's own:** lint; the boundaries lint, where one exists; the type check; `test`; then `build`.
2. **The toolkit's:** `check-settings`, `test:hooks`, `check-specs`, `check-test-weakening`, `check-reviewers`, `check-refs`, `budget`, `gen:agents --check`, `check-types:tooling`.

Two things stay out:

- **A repo-wide format check**, while the repo's `format` script writes. `verify:fast` (installed in step 5) checks formatting on changed files only, and the format-all commit is layer 3, part 10.
- **Any check the repo does not have.** An absent lint, type check or build is not invented today: "none" in 51 is recorded in `rulings.md`, and the part of layer 3 that brings it is the gap. An absent `test` is the one exception: section 3 gives every repo a `test` script, because a chain with no tests passes on nothing.

The script lands in the root `package.json` as one `&&` chain, as the toolkit's own does:

```json
"verify": "yarn lint && yarn check-types && yarn test && yarn build && yarn check-settings && yarn test:hooks && yarn check-specs && yarn check-test-weakening && yarn check-reviewers && yarn check-refs && yarn budget && yarn gen:agents --check && yarn check-types:tooling"
```

Names differ per repo; the order does not. `toolkit.json`'s `verify.full` already says `yarn verify` (step 3).

## 2. Every check runs once on the base commit

Before a check enters the chain, it runs once on the base commit, in a detached worktree so the live tree is untouched:

```sh
BASE=$(git merge-base <protected-branch> HEAD)
git worktree add --detach "$TMPDIR/base" "$BASE"
cd "$TMPDIR/base" && yarn install && yarn <lint> ; yarn <types> ; yarn <test> ; yarn <build>
```

A `build` that reads `.env` files (51 said so) runs unsandboxed with the operator's yes, here and at every later `yarn verify`: the floor denies those reads to a sandboxed session, and a build failing on a denied read is not a failing build.

Write a four-row table in `rulings.md`: check, script, exit code at base, what happens (enters as written; frozen by section 3; a gap). A check that passes enters as written. A check that fails is frozen by its kind below, or stays out as a gap when its recipe says so or the operator rules so (53). Remove the worktree when the table is written.

**Check:** the table has a row for every script 51 named, and `git status` shows the migration branch untouched by the base run.

## 3. Freeze by kind

Each recipe freezes what is red today so that the same debt passes and new debt fails. Each ends on a check. The **never** list is part of the recipe.

### 3.1 Lint: ESLint bulk suppressions

Needs ESLint 9.24.0 or later (`yarn eslint --version`). Older, and the lint freeze is a gap: it stays out of `verify` and the gap's plan is "upgrade ESLint, then this recipe".

1. `yarn eslint . --suppress-all`. It writes `eslint-suppressions.json` at the repo root, one entry per file and rule with a count, and exits 0.
2. Commit the file alone: `ACM: migrate step 6, the lint baseline`.
3. The lint script enters `verify` unchanged: ESLint reads the suppressions file on every run, fails a file whose count for a rule rises, and reports a count that fell as prunable. `yarn eslint . --prune-suppressions` lowers the counts; run it in the commit that fixes the code, never alone.

**Check:** `yarn <lint>` exits 0 on the migration branch, and the same command with `--no-config-lookup` is not used anywhere (nothing bypasses the config).

**Never:** `--max-warnings` raised to today's count (it freezes a number, not the lines, so a fix in one file licenses a regression in another); turning a rule off to make the run green.

### 3.2 Types: tagged lines and a count ratchet

The repo's own `tsc` reports its errors; each gets one line above it, so the baseline is one line per error and rebases with the file. A fix then fails as TS2578 (an unused directive), which removes its own line.

1. **Pin `strict` to its current value.** In the root `tsconfig.json`, if `strict` is not written, write `"strict": false`. Nothing changes today; TypeScript 6 defaults it to `true`, and an unpinned repo would fail every file at once on that upgrade (layer 3, part 1).
2. **Insert the tags.** Run the type check, parse each `path(line,col): error TScode` line, and insert `// @ts-expect-error MIG-BASELINE(TScode)` on its own line above the reported line, keeping the reported line's indentation. Work bottom-up within each file so line numbers stay true. The script is a few lines of Node, written in the thread and not kept:

   ```js
   // node insert-baseline.mjs < tsc-output.txt
   import { readFileSync, writeFileSync } from "node:fs";

   const byFile = new Map();
   for (const m of readFileSync(0, "utf8").matchAll(
     /^(.+?)\((\d+),\d+\): error (TS\d+)/gm,
   ))
     byFile.set(m[1], [
       ...(byFile.get(m[1]) ?? []),
       { line: +m[2], code: m[3] },
     ]);
   for (const [file, errors] of byFile) {
     const lines = readFileSync(file, "utf8").split("\n");
     for (const { line, code } of errors.sort((a, b) => b.line - a.line)) {
       const indent = lines[line - 1].match(/^\s*/)[0];
       lines.splice(
         line - 1,
         0,
         `${indent}// @ts-expect-error MIG-BASELINE(${code})`,
       );
     }
     writeFileSync(file, lines.join("\n"));
   }
   ```

3. **Re-run until clean.** A line inside JSX children takes the block form, `{/* @ts-expect-error MIG-BASELINE(TScode) */}`; the second run names those lines, and they are done by hand. Two errors on one line share one tag. Repeat until `tsc` exits 0.
4. **The count file.** Write the number of tags to `type-baseline.count` at the repo root (`git grep -c "MIG-BASELINE(" | awk -F: '{ s += $2 } END { print s }'`), as `212`.
5. **The ratchet, as a verify step.** Add the script and put it in the chain right after the type check:

   ```json
   "check-type-baseline": "test \"$(git grep -c 'MIG-BASELINE(' -- '*.ts' '*.tsx' | awk -F: '{ s += $2 } END { print s+0 }')\" = \"$(cat type-baseline.count)\""
   ```

   It fails above the count (new debt) and below it (a fix that did not lower the file), so a fix lowers `type-baseline.count` in the same commit and the number only falls. A type-freeze script that does steps 2 to 4 is written the first time a target's base fails its type check; until then this is the recipe.

6. **The lint rule.** Where `@typescript-eslint/ban-ts-comment` runs, give it the tag's format so a bare `@ts-expect-error` is still refused:

   ```json
   "@typescript-eslint/ban-ts-comment": ["error", {
     "ts-expect-error": "allow-with-description",
     "descriptionFormat": "^ (MIG-BASELINE\\(TS\\d+\\)|: TS\\d+ because .+)$"
   }]
   ```

Commit together: `ACM: migrate step 6, the type baseline (212 lines)`. Count the files touched first: over about 50, section 4 applies.

**Check:** `yarn <types>` and the `check-type-baseline` script exit 0; deleting one tag makes the type check fail with TS2578 and restoring it passes again.

**Never:** turning `strict` on (tightening is layer 3); ts-migrate (unmaintained, and it strips the reasons); Betterer and tsc-baseline (a hot results file that conflicts under a live team, and no stable release since 2022); a `// @ts-nocheck` at the top of a file.

### 3.3 Tests: a runner where there is none, markers where tests fail

**Where the repo has no runner and no tests** (every far repo so far):

1. `test` becomes `node --test tests/smoke.test.ts`, a literal path. A glob that matches nothing exits 0 on Node 22, so the path is never a glob: a missing file is a failing `test`, and that is the point.
2. Write the smoke test. It proves the one thing every later test needs, that the repo's root module loads:

   ```ts
   // tests/smoke.test.ts
   import assert from "node:assert/strict";
   import { readFileSync } from "node:fs";
   import test from "node:test";

   test("the root package is readable and named", () => {
     const pkg = JSON.parse(
       readFileSync(new URL("../package.json", import.meta.url), "utf8"),
     );
     assert.equal(typeof pkg.name, "string");
   });
   ```

   `node:test` runs `.ts` files unflagged from Node 22.18, which step 0 checked.

3. No `--passWithNoTests`, no `|| true`, no runner that reports 0 tests as success.

**Where the repo has a runner and some tests fail at base:**

- **A deterministic failure** gets the runner's expected-fail marker on the test, with the tag in its name: Vitest `test.fails`, Jest `test.failing`, Playwright `test.fail()`. The test keeps running; a fix flips it to an unexpected pass, which fails the run and removes its own marker.
- **A flaky or crashing test** is skipped with the runner's skip and listed in `tests/QUARANTINE.md`, one row each: test name, file, what it does when it fails, owner, date quarantined, and the trigger to bring it back. A skip with no row is refused by review.
- **`node:test`** has no expected-fail marker this guide can name: a failing `node:test` test is skipped and listed, never marked.

Commit: `ACM: migrate step 6, the test baseline`, with the quarantine file when there is one.

**Check:** `yarn <test>` exits 0; renaming `tests/smoke.test.ts` makes it exit 1; every skipped test has a row in the quarantine list, and every row names an owner and a date.

**Never:** `test.skip` without the list; a new runner chosen on day one (a runner change is its own layer-3 ticket under part 3); coverage thresholds today, since there is nothing to measure.

### 3.4 Build: not freezable

A build that fails at base stops the run. **Operator:** say so, show the error, and wait. The operator rules one of two ways: they fix the build in their own hands and the run resumes at section 2 with a new base run of `build`; or the day ends at layer 1 plus the chain without `build`, and `build` is a drafted gap whose plan is the error.

**Check:** `yarn <build>` exits 0 at base, or the gap ticket exists and `verify` has no `build` step.

## 4. The live team

Other developers commit to the protected branch all day. The rules that keep the baselines rebasing:

- Every baseline is one line per file and rule (3.1), one line per error (3.2), or one marker per test (3.3). None is one hot file the whole repo writes to.
- **A freeze that touches more than about 50 files** is either the last commit of the day, in the window the team named, or a drafted gap with the count in its Build notes. The operator rules which (53), and the thread does not start the freeze until they have.
- The interview already ruled on the instruction line "no tests during slices" (round 2); the smoke test and the markers are not a return to that question.
- A repo-wide format run stays out of `verify` and out of today: it is layer 3, part 10.

**Check:** `rulings.md` names the ruling for every freeze over the line, and no commit today touches more than about 50 files unless it is the day's last.

## 5. Gates without pull requests

Before a change lands, the gates are the stop hook (`verify:fast` at every stop, when ruled operator or team) and the opt-in git hooks (`yarn hooks:install`, local to a clone). After it lands, the gate is CI. Coverage thresholds and patch coverage come with layer 3, part 3, because today there are no tests to measure and patch coverage needs a hosted service.

## 6. CI wiring

**Where CI exists** (52 named a workflow): in that file, replace the chained check steps (lint, boundaries, types, build, in whatever order) with one step that runs `yarn verify`, under the same triggers and the same setup steps (checkout, Node, Corepack, install). One commit: `ACM: migrate step 6, CI runs verify`. Keep the file's other jobs (deploy, preview) as they are.

**Operator:** the first CI run. It is hosted and comes after the operator's push, which the thread never makes. Step 9 hands it over by name (54). A workflow that needs a secret `verify` does not need is left as it was.

**Where CI is absent:** writing a workflow needs repository settings, secrets and branch protection, so it is a drafted gap (step 7) and a hosted step. The plan in its Build notes: one workflow, `yarn verify` on push and pull request to the protected branch, written by the operator's thread after the merge; the first run is the operator's.

**Check:** the workflow's diff changes only the steps and keeps the triggers (`git diff HEAD~1 -- <workflow>`), or the gap ticket exists.

## 7. Done

Add `verify` to `package.json` as section 1 shows, with `check-type-baseline` after the type check when 3.2 ran. Commit: `ACM: migrate step 6, verify over the repo's own checks`.

**Proof (the guide's step 6):** `yarn verify` exits 0 on the migration branch; `rulings.md` holds the base-commit table; and every frozen check has its baseline file committed (`eslint-suppressions.json`, `type-baseline.count`, `tests/QUARANTINE.md` as applies).
