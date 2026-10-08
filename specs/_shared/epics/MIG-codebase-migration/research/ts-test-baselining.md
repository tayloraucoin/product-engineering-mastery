# Freezing TypeScript and Test Debt as a Committed Baseline on a Trunk-Committing Team

The mechanically installable answer as of 2026-10-06 is to turn `strict` on in the real tsconfig and freeze every existing error as a per-line `// @ts-expect-error` comment. TypeScript has reported an unused directive as error TS2578 since 3.9, so each fix forces the matching comment out (verified).\[1\]\[2\] Pair that with a committed suppression-count ratchet, and with a test gate made of one real smoke test, `test.fails`/`test.failing` quarantines for known failures, and floor-rounded coverage thresholds. Nothing here involves fixing old code. File-level (typescript-strict-plugin) or results-file (Betterer, tsc-baseline) baselines also work, but each has a weaker maintenance record or weaker editor/CLI parity (judgment, sourced below).

## TL;DR

- **Types:** the strongest shrink and merge properties come from baselines stored as comments in source and checked by the compiler itself. `@ts-expect-error` is checked per line and self-reports when stale (TypeScript 3.9+). `@ts-strict-ignore` from typescript-strict-plugin is per file and needs a separate `tsc-strict` CLI. Central results files (Betterer `.betterer.results`, tsc-baseline) need merge tooling and have no compiler-level editor parity.
- **Tests:** do not rely on `passWithNoTests`. Commit one trivial passing test so the gate is real. Quarantine deterministic failures with `test.fails` (Vitest) / `test.failing` (Jest 28+) / `test.fail()` (Playwright), all of which turn red when the test unexpectedly passes. Ratchet coverage with Vitest `coverage.thresholds.autoUpdate` using a floor-rounding function to avoid merge churn. Gate new code with patch coverage (Codecov's patch status measures a single commit when there is no PR).
- **One day vs later:** installation, mass comment insertion, the count file, the smoke test, quarantine markers and the initial thresholds are all mechanical. Fixing errors, removing suppressions, un-quarantining tests and raising coverage must wait. Without PRs, every "block" is either a bypassable local hook or a post-commit red build.

## Part 1 - Types

### 1.1 Tool-by-tool comparison

| Tool | Version and date | Maintenance status (as of 2026-10-06) | Mechanism | Stored in git | Parallel-fix merge behaviour | How it shrinks | Editor/CLI parity | Label and source |
|---|---|---|---|---|---|---|---|---|
| typescript-strict-plugin (allegro) | CHANGELOG top entry 2.4.0, 2024-03-07; issue #79 reports 2.4.4 in use with TS 5.4.5 (2024-06-11)\[3\]\[4\] | 24 open issues, 6 open PRs; open issues include #88 "paths not recognized" (2025-01-01) and #82 per-flag ignore (2024-07-30); no upstream TS 7 support found\[5\]\[6\] | Language service plugin applies strict checks to all files except those headed `//@ts-strict-ignore` (since 2.0.0). `update-strict-comments` adds the ignore comment to every file with at least one strict error. `tsc-strict` CLI re-checks the strict files at build time\[6\] | One comment line at the top of each ignored file; plugin block in tsconfig (`paths`, `exclude` since 2.2.0, `excludePattern` since 2.4.0)\[3\] | [NOT IN SOURCE]; no central file exists | Delete the file's ignore comment once clean; automatic detection of a no-longer-needed ignore [NOT FOUND] | Plugin works only in the editor; README says TypeScript plugins do not work at compile time, hence `tsc && tsc-strict`\[6\]\[7\] | verified: allegro/typescript-strict-plugin README, CHANGELOG, issues list, PR #19 (merged 2022-01-24) |
| typescript7-strict-plugin (fork) | `^1.0.0` per README; release date [NOT FOUND] | Single-maintainer fork, 0 stars at fetch\[8\] | Same as upstream, adds TypeScript 7 (native/Go) support and resolves `extends` chains for plugin config\[8\] | Same comments; plugin name in tsconfig must change\[8\] | [NOT IN SOURCE] | Same as upstream | Claims TS 7 support; not independently verified | verified (fork README only): shemhazai/typescript7-strict-plugin |
| ts-migrate (Airbnb) | npm 0.1.x line (issue reports `^0.1.12`); last release date [NOT FOUND]\[9\] | README warns it is designed around Airbnb projects, use at your own risk. A fork README claims upstream unmaintained since 2022 (secondary). Issue #168 mentions an internal upgrade from TS 4.2 to 4.6\[10\]\[11\]\[12\] | `reignore` adds `any` or `@ts-expect-error` comments at every error site so the project compiles\[13\] | Inline comments of the form `// @ts-expect-error ts-migrate(2339) FIXME: ...`\[14\] | Comments live beside code; conflicts only where code lines conflict [NOT IN SOURCE] | Remove comment when fixed; TS2578 flags stale ones | Same compiler in editor and CLI, but the tool bundles its own TS version (see issue #95)\[15\] | verified: airbnb/ts-migrate README, issues #95, #96, #168; secondary: @obiemunoz/ts-migrate fork README |
| Betterer + @betterer/typescript (phenomnomnominal) | Stable 5.4.0, 2022-08-09; 6.0.0-alpha.1, 2024-12-01\[16\] | One maintainer; no stable release since 2022-08 (Snyk/Socket listings, secondary for dates)\[17\]\[18\] | Runs `tsc` with overridden compiler options (e.g. `strict: true`) over an `include` glob and snapshots the error set; regressions fail\[19\]\[20\] | `.betterer.results` with a `// BETTERER RESULTS V2.` header; `.betterer.ts` test file\[21\] | `betterer merge` does a "fairly naive" merge; `betterer init --automerge` writes a git merge driver into `.gitattributes` (since 5.0.0-alpha.0, 2021-08-27); results order kept stable since 4.4.0 (2021-06-18)\[22\]\[23\] | Automatic: a better result rewrites the file; `betterer ci` throws if results do not exactly match the committed file\[23\]\[24\] | Docs link a VS Code extension; parity with `tsc` [NOT IN SOURCE] | verified: Betterer docs (results-file, workflow, tests pages), CHANGELOG, repo `.betterer.results`; secondary: Snyk advisor, Socket |
| tsc-baseline (TimMikeladze) | 1.9.0 per jsDelivr; date [NOT FOUND]\[25\] | 13 stars, 3 open issues, 11 open PRs at fetch\[26\] | Pipe `tsc` output into `save`, then `check` filters out baselined errors; `add <hash>` adds an error by hash; `--changedFiles` limits failures to listed files; `--exclude` patterns are stored in the baseline\[26\] | One baseline file of hashed errors; paths recorded relative to run directory\[26\] | [NOT IN SOURCE]; no merge command documented | Manual `clear` when done; automatic pruning [NOT FOUND]\[26\] | CLI only; no editor surface documented | verified: tsc-baseline README;\[26\] secondary: jsDelivr for version |
| type-coverage (plantain-00) | 2.30.3 on npm (latest at fetch); repo builds against TypeScript 6.0.3; PR #155 (2026-10-03) fixes a `--strict` stack overflow\[27\]\[28\]\[29\] | Active in 2026 | Measures the share of identifiers not typed `any`; `--at-least` / `typeCoverage.atLeast` fails below a percentage; `--strict` (since 1.7); ignore comments `type-coverage:ignore-next-line`\[30\] | A number in `package.json`; optional ignore comments | A single number; textual conflicts only if two commits edit it | Manual raise; v2.26.1 release note says it updates `atLeast` when set to zero (meaning beyond that [NOT IN SOURCE])\[31\] | Optional `ts-plugin-type-coverage` language service plugin (since 2.12)\[30\] | verified: type-coverage README, repo package.json, PR #155, release notes in renovate PR |
| Plain tsc + include allowlist (VS Code's strict null checks) | Blog 2019-05-23; tracking issue #60565 | Historic, completed migration | Separate `tsconfig.strictNullChecks.json` extending the base, `strictNullChecks: true`, starting with zero files; files added to `files`/`include` once clean; CI compiles it\[32\]\[33\] | The tsconfig's file list | [NOT IN SOURCE] | Grows (allowlist of clean files) rather than shrinks; ended by deleting the file and setting the flag in the main tsconfig\[33\] | Editor uses main tsconfig; strict project only checked via `yarn strict-null-check` and CI\[32\] | verified: code.visualstudio.com blog 2019-05-23; microsoft/vscode issue #60565 |
| ts-incremental-strict-mode | Version/date [NOT FOUND] | [NOT FOUND] | CLI that strict-checks given file paths, for lint-staged\[34\] | Nothing beyond config | n/a | n/a | CLI only | verified (README only): RikuMantysalo/ts-incremental-strict-mode |

### 1.2 Mechanics worth knowing per approach

**typescript-strict-plugin (verified, allegro README and CHANGELOG).**
- Since 2.0.0, files are strict by default and opt out with `//@ts-strict-ignore`. `//@ts-strict` opts files back in from ignored `paths`.\[3\]\[6\]
- The CHANGELOG dates 2.0.0 as "2021-29-11", but PR #19 merged on 2022-01-24.\[3\]\[35\] Treat the 2.0 date as uncertain.
- `tsc-strict` accepts normal tsc arguments, e.g. `--strictNullChecks false` to drop one flag (README). Per-flag ignoring inside the plugin is an open request (#82).\[5\]\[6\]
- Allegro's own blog post (Kamil Krysiak and Jarosław Glegoła, blog.allegro.tech, 2021-09-06) says `tsc-strict` uses tsc under the hood, so full type-check time would double.
- With TypeScript 6.0 defaulting `strict` to true (TypeScript 6.0 release notes), the plugin's base tsconfig must now set `"strict": false` explicitly (judgment from both sources).\[36\]

Synthetic example of the in-source artefact:

```ts
//@ts-strict-ignore
// src/legacy/ledgerExport.ts (synthetic)
export function totalOf(rows) { return rows.reduce((a, r) => a + r.amount, 0); }
```

**@ts-expect-error baselining (verified, TypeScript 3.9 release notes).**
- TypeScript 3.9 (announced 2020-05-12 by Daniel Rosenwasser on the Microsoft TypeScript devblog) suppresses the error on the next line. If there is no error, it reports "Unused '@ts-expect-error' directive" (TS2578).
- `@ts-ignore` does nothing on an error-free line. That makes `@ts-expect-error` the only directive that shrinks itself.\[1\]\[37\]
- ts-migrate `reignore` inserts these comments with the error code and message (issue #96).\[14\]
- Two documented problems with ts-migrate:
  - It replaced user-written `@ts-ignore` reasons with its FIXME text (issue #96).\[14\]
  - After `reignore`, `tsc` still reported 126 errors, including TS2578, despite matching the bundled TS version (issue #95).\[15\] Fix [NOT FOUND] beyond manual removal.
- Synthetic example:

```ts
// src/billing/invoiceTotals.ts (synthetic)
// @ts-expect-error TS-BASELINE(2532) frozen 2026-10-06
const first = lineItems.find(i => i.sku === "SKU-0042").price;
```

**Betterer (verified, Betterer docs).**
- The results file works like a Jest snapshot.\[23\]\[38\]
  - A better result updates it automatically and becomes the new baseline.\[23\]\[39\]
  - `betterer precommit` is intended for a pre-commit hook.\[24\]
  - `betterer ci` throws if results differ from the committed file at all.\[24\]
- Tests can carry a `deadline` (Date or string). After the deadline the test is marked expired.\[40\]
- `@betterer/typescript` is a file test, so it supports `include`, `exclude`, `only` and `skip`.\[19\]
- Synthetic `.betterer.ts`:

```ts
import { typescript } from '@betterer/typescript';
export default {
  'strict for acme-sample': () =>
    typescript('./tsconfig.json', { strict: true, noEmit: true }).include('./src/**/*.ts'),
};
```

**Per-folder / per-tsconfig strict islands.**
- VS Code's approach (verified, 2019 blog):
  - A strict tsconfig extending the base, with an explicit file list.\[33\]
  - Adding a file also strict-checks everything it imports, so they started with files that had few imports.\[32\]
  - A helper script auto-added eligible files.\[41\] The repo found is a fork of those tools, so it is labelled secondary.
- Limits: whole-program semantics. A strict island compiles its imports too, so a strict file importing a non-strict file pulls that file's errors into the island. This is verified for VS Code; generalising it is judgment.
- tsgo / TypeScript 7 native previews (announced 2025-05-22, Microsoft TypeScript blog): at preview time, `--build` mode, project-reference language service features and declaration emit were not yet supported.\[42\] A secondary source (openapps.pro listing `7.0.0-dev.20260707.2`) says these are now implemented and the port has merged into microsoft/TypeScript.\[43\] Primary confirmation of current status [NOT FOUND].
- How editors pick a tsconfig for a file: [NOT FOUND] in the sources gathered.

**Official per-file strict.**
- microsoft/TypeScript issue #28306 ("strict per file", `//@ts-strict` proposal) is still open, labelled "In Discussion" and "Suggestion", with over 390 reactions (verified as of 2026-10-06).\[44\]
- No shipped per-file strict pragma or error-baseline feature in TypeScript 6.0 or the native previews [NOT FOUND].
- A third-party page claims `// @ts-strict-ignore` is a TypeScript 5.0+ feature.\[45\] That is wrong: it is the allegro plugin's comment, not a compiler directive. This is secondary and contradicted by the primary sources.

### 1.3 ESLint interaction with a type baseline (narrow)

- **ban-ts-comment** (verified, typescript-eslint docs for `ban-ts-comment`, current as of 2026-10-06):
  - Default: `@ts-expect-error` allowed only with a description; `@ts-ignore` and `@ts-nocheck` banned; `minimumDescriptionLength` defaults to 3.\[46\]\[47\]
  - `descriptionFormat` can require a regex such as a TS error code.\[46\]
  - Mass-inserted comments that carry a reason (ts-migrate's `ts-migrate(2339) FIXME: ...`, or a synthetic `TS-BASELINE(2532)` tag) satisfy the default. A `descriptionFormat` lets lint tell baseline suppressions apart from hand-written ones (judgment).
- **Separate baselines** (judgment): type-aware lint rule violations and tsc errors are separate baselines. A tsc suppression does not silence lint, and an ESLint suppression does not silence tsc. If both are committed, expect two artefacts (inline TS directives plus the ESLint suppressions file), touched by different commands.
- typescript-strict-plugin issue #81 (open, 2024-07-16) asks to disable strict-dependent typescript-eslint rules in ignored files.\[5\] That interaction is unresolved [NOT FOUND fix].

## Part 2 - Tests

### 2.1 Day-one gate on a repo with no runner

| Runner and flag | Behaviour | Version and date | Label and source |
|---|---|---|---|
| Vitest `passWithNoTests` | Default false; when true, Vitest does not fail if no tests are found\[48\] | Current docs, verified 2026-10-06 | verified: vitest.dev config/passwithnotests |
| Vitest in-source tests | Errors on files without in-source tests even with `--passWithNoTests`\[49\] | Issue #2763 | verified: vitest-dev/vitest #2763 |
| Jest `--passWithNoTests` | Exits 0 when no test files match; an existing empty test file still fails with "Your test suite must contain at least one test"\[50\]\[51\]\[52\] | Jest 29.6.2 (#14448), 29.7.0 (#15107) | verified: jestjs/jest issues #14448, #15107 |
| Nx Jest executor | Docs recommend `passWithNoTests: true` while tests are still being added\[53\] | Current Nx docs | verified: nx.dev @nx/jest executors |
| node:test, glob matching nothing | Node 22.20.0 and 24.16.0: `tests 0`, exit 0. Node 22.20.0, existing directory with no test files: exit 1 "Could not find". Node 20.x: quoted glob exits 1\[54\]\[55\]\[56\] | Measured 2026-09/10 in third-party issues | secondary: GitHub issues in mrveiss/AutoBot-AI #15696, abhayla/IPODhan #461, mikeycdavis/StandardsOrchestrator #3; official Node docs [NOT FOUND] |
| Playwright `--pass-with-no-tests` | [NOT FOUND] in sources gathered | n/a | [NOT FOUND] |

Practice (judgment, resting on the rows above): commit one trivial test, e.g. `tests/smoke.test.ts` asserting `1 + 1 === 2` (synthetic), and leave `passWithNoTests` off. A zero-test exit 0 cannot be told apart from a broken glob. Node 22/24 already behave that way without any flag.\[54\]

### 2.2 Quarantine semantics: which markers are ratchets

| Marker | Runs? | Unexpected pass fails the run? | Version | Label and source |
|---|---|---|---|---|
| Vitest `test.fails` | Yes | Yes. Passes if the body fails, otherwise fails. Shown as "expected fail" in the summary since Vitest 4.1\[57\] | Vitest 4.1+ for summary tracking | verified: vitest.dev api/test |
| Jest `test.failing` | Yes | Yes. Passes if the body throws; if it does not throw, it fails. Docs suggest removing the modifier when it flips\[58\] | Added in Jest 28 (jest-circus #12610)\[59\] | verified: jestjs.io Globals docs;\[58\] secondary: Jest 28 changelog via renovate MR |
| Jest `test.skip.failing` | No | No | Jest 28+ | verified: jestjs.io Globals docs |
| Playwright `test.fail()` | Yes | Yes; Playwright complains if it does not fail\[60\] | Current docs | verified: playwright.dev test-annotations |
| Playwright `test.fixme()` | No | No; use when running is slow or crashes\[60\] | Current docs | verified: playwright.dev test-annotations |
| `test.skip` / `test.todo` (any runner) | No | No; not a ratchet | n/a | judgment |

**Flaky-test quarantine systems (primary write-ups):**
- **Slack** (Arpita Patel, slack.engineering, 2022-04-05):
  - The first version kept an `is_flaky` flag in a backend database. It was rolled back because failures leaked into main and CI depended on the backend being up.\[61\]
  - The second version stores quarantine in source. A bot opens a ticket and a PR that disables the test (iOS `disabled_` prefix, Android `@Ignore('<ticket>')`), auto-approves it and merges it on main only.\[61\]
  - Re-enabling was manual and described as hard.\[61\] The promised automatic re-enable follow-up [NOT FOUND].
  - Reported results: main-branch stability rose from 19.82% on 2020-07-27 to 96% on 2021-02-22, and the post says test job failures dropped from 57% to less than 5% (56.76% to 3.85% in its detailed figures).
- **Atlassian Flakinator** (Nitish Malik, atlassian.com engineering blog, 2025-12-08):
  - It replaced "a manually managed file-based system" with a central database fed by CI.\[62\]
  - Quarantined tests keep running in branch, scheduled or quarantine pipelines. They are removed automatically after staying healthy for a configured period.\[62\]
  - Bitbucket's quarantine feature only adds metadata; the build script must skip the tests itself (Atlassian support docs, date not checked).\[63\]
- GitHub, Dropbox, Spotify, Google, Shopify, Uber primary write-ups: [NOT FOUND].

### 2.3 Ratchets on coverage and new code

| Mechanism | Mechanics | Stored in git | Merge behaviour | Tightening | Label and source |
|---|---|---|---|---|---|
| Vitest `coverage.thresholds` (+ `perFile`, glob keys, `100`) | Exits non-zero below thresholds; glob thresholds do not inherit globals\[64\]\[65\]\[66\] | Numbers in vitest config | Plain text edits | Manual, or `autoUpdate` | verified: vitest.dev config/coverage |
| Vitest `coverage.thresholds.autoUpdate` | Rewrites thresholds in the config when coverage exceeds them.\[64\] Current docs accept a function `(newThreshold, previousThreshold) => number`\[65\]\[67\] | Config file rewritten by the tool | Two-decimal values caused constant config conflicts (discussion #6143, 2024-07-16; maintainer: no option to change decimals). Rewrite strips trailing newlines (#9227). With `perFile`, it raised thresholds to global values, causing the next run to fail (#3179)\[68\]\[69\]\[70\] | Only upward | verified: vitest.dev config/coverage, vitest-dev/vitest #6143, #9227, #3179, #10459 |
| Codecov patch status | Measures only lines changed in the PR, or in a single commit if it is not in a PR. `target: auto` compares to base/parent; a number sets a fixed bar. `only_pulls` defaults to false\[71\] | `codecov.yml` | n/a (no numbers in repo) | Raise target | verified: docs.codecov.com commit-status (v2023 page, modified 2025-11-11); the patch-section wording was seen via search excerpt, not full fetch |
| diff-cover `--fail-under` | Non-zero exit if coverage of diff lines is below the value; only lines present in both diff and report are compared\[72\] | Command in CI script | n/a | Raise value | verified: diff_cover README/PyPI; version 10.1.0 per Snyk (secondary), date [NOT FOUND] |
| Vitest `--changed` | Runs tests related to changed files; accepts `HEAD~1`, a commit hash or a branch\[67\] | Nothing | n/a | n/a | verified: v2.vitest.dev CLI docs (Vitest 2) |
| Jest coverageThreshold globs, `--changedSince`, `--findRelatedTests`, jest-coverage-ratchet, Coveralls, SonarQube new-code gate, danger-js test-file rule | [NOT FOUND] in sources gathered | | | | [NOT FOUND] |

**Trunk without PRs** (judgment, resting on the Codecov row): Codecov's per-commit patch status still fires on direct pushes, but only after the commit is already on the default branch. It reports rather than prevents. The only pre-landing gate available without PRs is a local hook (pre-commit/pre-push), and hooks can be skipped by the committer. Betterer's docs explicitly pair a pre-commit mode with a CI mode for this reason.\[24\]

## Part 3 - One-day mechanical install vs what must wait (all judgment)

**Recommended combination: strict in tsconfig + mass `@ts-expect-error` + suppression-count ratchet, with a smoke test + marker quarantine + floor-rounded coverage thresholds + Codecov patch status.**

Why, and which verified facts each reason rests on:
1. **Per-line freezing gates new lines inside old files.** File-level `@ts-strict-ignore` exempts the whole file, including lines written tomorrow. Rests on the allegro README file-level semantics and the TS 3.9 line-level semantics.
2. **Self-shrinking.** A fix that removes an error makes the directive fail with TS2578, so stale entries cannot accumulate (TS 3.9 notes).\[1\]\[2\]
3. **Merge behaviour.** There is no central baseline file. Suppressions conflict only where the code lines themselves conflict. The absence of a central file is verified by the mechanics; the conflict claim is judgment.
4. **Editor/CLI parity.** The compiler itself is the checker, so there is no language service plugin to load. JS language-service plugins are the known risk for TypeScript 7; upstream allegro TS 7 support was not found.

**Install steps, in order:**
1. Pin TypeScript (e.g. 6.0.x) and set `"strict": true` explicitly in the main tsconfig. 6.0 defaults it to true,\[36\] but explicit beats implicit.
2. Run `tsc --noEmit` and record the error count (synthetic: 412 errors in 97 files).
3. Insert `// @ts-expect-error <tag>(<code>)` above every reported line.
   - The tool can be ts-migrate `reignore` or a short script driven by tsc's `file(line,col): error TSxxxx` output.
   - Re-run tsc until clean. Issue #95 shows a single pass may leave TS2578 residue when TS versions differ, so use the repo's own TS version.\[15\]
4. Configure `ban-ts-comment` with a `descriptionFormat` that recognises the baseline tag. Hand-written suppressions then need a real reason.\[46\]
5. Commit a count file, e.g. `type-baseline.count` containing `412` (synthetic). Add a CI step that counts the tag and fails if the count is above the file's number. The step also fails if the count is below it and the file was not lowered in the same commit, so the file only moves down.
   - This is a custom script; no off-the-shelf tool found is primary-verified for exactly this. Betterer's regexp test is the nearest documented equivalent.\[38\]
6. Tests:
   - Install the runner the repo will use, with no runner comparison implied.
   - Commit one smoke test and leave `passWithNoTests` off.
   - Wrap known deterministic failures in `test.fails` / `test.failing`. Use `test.fixme`/`skip` only for crashing or flaky tests, and list those in a committed `tests/QUARANTINE.md` with an owner and date (synthetic).
7. Coverage:
   - Set thresholds to the current measured values rounded down to integers.
   - Enable `autoUpdate` with a function that floors, e.g. `autoUpdate: (n) => Math.floor(n)` (synthetic illustration of the documented function form).
   - Add Codecov patch status with a fixed target for new lines.
8. Hooks:
   - pre-commit runs `tsc --noEmit` on the project, plus the count check.
   - pre-push runs `vitest --changed origin/main` or the runner's equivalent.
   - CI repeats everything on every push to the default branch.

**What must wait:**
- Fixing frozen errors and lowering the count.
- Removing quarantines: Slack found re-enabling hard; Atlassian automated it via a health window.\[61\]\[62\]
- Raising coverage beyond floor ratchets.
- Enabling flags outside `strict` (e.g. `noUncheckedIndexedAccess`), which would need a second freeze pass.
- Moving the gate from hooks to a blocking pre-merge check, which requires adopting PRs or a merge queue.

**Per-tool exit paths and re-evaluation:**

| Choice | Verified-as-of | Maintenance status | Exit path (what is left) | Re-evaluate when |
|---|---|---|---|---|
| `@ts-expect-error` baseline | 2026-10-06 (TS 3.9 notes, TS 6.0 notes) | Core language feature | Delete the count file and CI step; any remaining tagged comments stay as ordinary suppressions | TypeScript 7 ships with any change to directive semantics (none found) |
| ts-migrate (insertion only) | 2026-10-06 | Effectively unmaintained upstream (fork claim, secondary)\[11\] | Uninstall after day one; only comments remain | Insertion fails on the repo's TS version; use a script instead |
| Vitest/Jest/Playwright markers | 2026-10-06 | Active runners | Delete markers as tests are fixed | Quarantine list stops shrinking for a set period |
| Vitest autoUpdate | 2026-10-06 | Active; #9227 and #10459 open topics\[68\]\[73\] | Remove `autoUpdate`; thresholds stay as numbers | Commit noise or conflicts recur |
| Codecov patch | 2026-10-06 (page modified 2025-11-11) | Commercial SaaS | Delete `codecov.yml` and upload step | Team adopts PRs (then it becomes blocking) |

**Runner-up: typescript-strict-plugin** (`update-strict-comments` plus `tsc && tsc-strict`). It is just as mechanical and produces far fewer comments, because there is one per file rather than one per error.
- It flips to first choice if the frozen error count is so large that per-line comments make files unreadable (judgment; no threshold sourced).
- It also flips if the team needs whole files exempt because generated or vendored code is churned by codegen.
- Against it:
  - The latest release on the npm registry is 2.4.4, last published about two years ago (the repo's package.json on master also reads 2.4.4).
  - The plugin works only in the editor, so `tsc-strict` is required in CI.\[7\]
  - Type-check time doubles.\[7\]
  - TS 7 support exists only in a 0-star fork.\[8\]
- Exit path: delete `//@ts-strict-ignore` lines and the plugin entry, then set `strict: true`.

## Part 4 - Failure modes seen in practice

| Failure mode | Project, source, date | Fix used |
|---|---|---|
| Baseline silently passing: `tsc-strict` reported success on out-of-memory | typescript-strict-plugin, CHANGELOG 2.0.2, 2022-07-28\[3\]\[74\] | Fixed handling of the OOM exception (verified)\[3\] |
| Path-keyed config stops applying: relative path resolving wrong; path features broken on Windows | typescript-strict-plugin CHANGELOG 2.0.1 (2022-07-28), 1.1.1 (2021-08-29)\[3\] | Fixed in those releases (verified) |
| Paths not recognised; CLI missed type errors | typescript-strict-plugin #88 (2025-01-01), #72 (2024-04-01)\[5\] | [NOT FOUND]; both open |
| `tsc-strict --watch` hangs on "Looking for strict files" | typescript-strict-plugin #79, 2.4.4 + TS 5.4.5, 2024-06-11\[4\] | [NOT FOUND]; open |
| Editor vs CLI: plugin ignored by tsc | typescript-strict-plugin README; Allegro blog 2021-09 | Ship `tsc-strict` and run `tsc && tsc-strict` (verified)\[6\]\[7\] |
| Editor uses wrong TypeScript (plugin needs workspace TS) | typescript-strict-plugin README sample-project instructions ("Select Typescript Version")\[6\] | Select workspace TS version and restart the TS server (verified) |
| TS server crash with TS 5.4 | Reported via githubhelp aggregator (secondary)\[74\] | [NOT FOUND] |
| Results-file paths wrong across machines/roots | Betterer 5.1.1 (2021-11-23), 5.1.6 (2022-02-09, #961)\[22\] | Results paths rewritten relative to repository root (verified)\[22\] |
| Results-file merge conflicts under parallel work | Betterer #799 (user proposal of a keep-theirs driver); docs\[75\] | `betterer merge`; `init --automerge` writes a merge driver; stable ordering since 4.4.0; merge header since 5.1.0 (verified)\[22\]\[23\] |
| Betterer test fails to load / ESM projects\[76\]\[77\] | Betterer #938, #952\[76\]\[77\] | [NOT FOUND] |
| Mass insertion leaves residue (126 errors incl. TS2578) | ts-migrate #95\[15\] | [NOT FOUND]; reporter removed directives manually\[15\] |
| Codemod strips human reasons from suppressions | ts-migrate #96\[14\] | [NOT FOUND] upstream; fork in #168 added custom-message and skip-strip options\[10\] |
| Hash/absolute-path drift in error baselines (TS7016 embeds paths in message) | tsc-baseline README | Paths normalised relative to run directory (verified, documented behaviour)\[26\] |
| Counts raised by hand to pass CI | No primary post found | [NOT FOUND]. Nearest documented guard: `betterer ci` exact-match rule\[24\] |
| Coverage threshold churn and conflicts from 2-decimal auto-updates | Vitest discussion #6143, 2024-07-16\[69\] | [NOT FOUND] upstream at the time; current docs document a function form usable for rounding\[65\] |
| autoUpdate rewrite strips newline, breaking lint | Vitest #9227\[68\] | Workaround: ignore the lint rule on that line (reporter)\[68\] |
| autoUpdate + perFile raises thresholds to global values, next run fails | Vitest #3179\[70\] | [NOT FOUND] in sources gathered |
| Thresholds left far below actual, gate useless (about 11 points) | cncf/prow-github-actions #201\[78\] | PR #202 ("Closes #201") raises thresholds from 85/83/91/85 to 95/93/98/95 against measured 96.35/94.55/99.14/96.16; it was still unmerged at check time (bot-authored, sequenced to "merge last" per #214) |
| Zero-test run masks a broken glob | Node 22/24 node:test exits 0 on no-match (third-party issues, 2026-09)\[54\]\[56\] | [NOT FOUND] official; commit a real test |
| `passWithNoTests` does not cover empty files\[50\]\[51\] | Jest #14448, #15107\[50\]\[51\] | [NOT FOUND] |
| Editor shows `test.fails` as failed while CLI passes\[79\] | vitest-dev/vscode #812\[79\] | [NOT FOUND] |
| HTML report shows `test.fail` tests as passed\[80\] | microsoft/playwright #28938, 1.40.1\[80\] | [NOT FOUND] |
| Quarantined tests never return | Slack, 2022-04-05 | Planned scheduled reruns and auto re-enable (outcome [NOT FOUND]); Atlassian 2025-12-08 auto-removes after a health window (verified)\[61\]\[62\] |
| Quarantine store as a single point of failure | Slack v1 DB flag; Atlassian file-based system | Slack moved quarantine into source via bot PRs; Atlassian moved to a central DB with CI ingestion (verified)\[61\]\[62\] |

## Synthesizer's notes / judgment

- In-source suppressions put merge risk where engineers already resolve conflicts, inside the code. Central results files concentrate it in one hot file. Betterer's need for a merge command and merge driver is itself evidence of that hot-file cost.
- For an AI-agent-assisted migration, the compiler's own TS2578 is the most stable contract. It has been stable since 2020 and no third-party API is involved. Agents can also lower the count file one fix at a time without regenerating anything. Betterer's last stable release dates from 2022, and ts-migrate is effectively unmaintained, which makes both poor long-lived dependencies.
- On a no-PR trunk, every gate is either advisory-before-landing (bypassable hooks) or blocking-after-landing (red CI). Pick one owner for "red main" and treat the count file and quarantine list as reviewed artefacts, e.g. via CODEOWNERS. CODEOWNERS has no effect without PRs, so it only helps once PRs are adopted.
- The ESLint suppressions file and the TS directive baseline should be ratcheted by separate CI steps. This avoids a commit that lowers one artefact being blamed for the other.

## Not found inventory

- typescript-strict-plugin: exact publish date of 2.4.4 (npm shows only "2 years ago"); upstream TS 7 support; detection of no-longer-needed ignore comments; fixes for #88, #72, #79.
- ts-migrate: last npm release date; official maintenance statement from Airbnb.
- Betterer: documented behaviour of `--update` beyond "better results update the file"; editor-vs-CLI parity details.
- tsc-baseline: release dates; merge behaviour of the baseline file.
- tsc-silent, ts-strictify, loose-ts-check, tsc-files, HubSpot or other company-published tools; Figma, Slack, Stripe, Bloomberg, Patreon, Etsy, Quip, Sentry type-migration posts.
- suppress-ts-errors and other `@ts-expect-error` codemods.
- How editors select the tsconfig for a file; primary confirmation of current tsgo language-service-plugin support.
- Official TypeScript per-file strict or baseline feature (issue #28306 remains open).
- Playwright `--pass-with-no-tests`; official Node.js docs on zero-match behaviour.
- Jest `coverageThreshold` globs, `--changedSince`, `--findRelatedTests`; jest-coverage-ratchet; Coveralls; SonarQube new-code gate; danger-js test-file rules; lint rules with skip-count baselines.
- Primary flaky-quarantine posts from GitHub, Google, Dropbox, Spotify, Shopify, Uber; Slack's auto re-enable follow-up.
- Any primary post-mortem of counts raised by hand, and the fix used.

## Sources

1. [TypeScript: Documentation - TypeScript 3.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html)
2. [New Feature: ts-expect-error](https://blog.tekmi.nl/typescript-evolution/ts-expect-error/)
3. [typescript-strict-plugin/CHANGELOG.md at master · allegro/typescript-strict-plugin](https://github.com/allegro/typescript-strict-plugin/blob/master/CHANGELOG.md)
4. [\`tsc-strict\` doesn't work with \`--watch\` flag · Issue #79 · allegro/typescript-strict-plugin](https://github.com/allegro/typescript-strict-plugin/issues/79)
5. [Issues · allegro/typescript-strict-plugin](https://github.com/allegro/typescript-strict-plugin/issues)
6. [GitHub - allegro/typescript-strict-plugin: Typescript plugin that allows turning on strict mode in specific files or directories.](https://github.com/allegro/typescript-strict-plugin)
7. [How to turn on TypeScript strict mode in specific files](https://blog.allegro.tech/2021/09/How-to-turn-on-TypeScript-strict-mode-in-specific-files.html)
8. [GitHub - shemhazai/typescript7-strict-plugin](https://github.com/shemhazai/typescript7-strict-plugin)
9. [Unusabel npx ts-migrate -- reignore](https://lightrun.com/answers/airbnb-ts-migrate-unusabel-npx-ts-migrate----reignore)
10. [Modification Cornucopia · Issue #168 · airbnb/ts-migrate](https://github.com/airbnb/ts-migrate/issues/168)
11. [GitHub - davidfurey/ts-migrate: A tool to help migrate JavaScript code quickly and conveniently to TypeScript · GitHub](https://github.com/davidfurey/ts-migrate)
12. [ts-migrate - npm](https://www.npmjs.com/package/ts-migrate)
13. [ts-migrate/packages/ts-migrate/README.md at master · airbnb/ts-migrate](https://github.com/airbnb/ts-migrate/blob/master/packages/ts-migrate/README.md)
14. [reignore swallows comments on ts-ignores · Issue #96 · airbnb/ts-migrate](https://github.com/airbnb/ts-migrate/issues/96)
15. [tsc does not pass after running reignore · Issue #95 · airbnb/ts-migrate](https://github.com/airbnb/ts-migrate/issues/95)
16. [@betterer/betterer](https://snyk.io/advisor/npm-package/@betterer/betterer)
17. [@betterer/cli - npm Package Security Analysis - Socket](https://socket.dev/npm/package/@betterer/cli)
18. [@betterer/betterer - npm Package Security Analysis - Socket](https://socket.dev/npm/package/@betterer/betterer)
19. [TypeScript test](https://phenomnomnominal.github.io/betterer/docs/typescript-test/)
20. [DEV Community](https://dev.to/phenomnominal/stricter-typescript-compilation-with-betterer-dp7)
21. [betterer/.betterer.results at master · phenomnomnominal/betterer](https://github.com/phenomnomnominal/betterer/blob/master/.betterer.results)
22. [betterer/CHANGELOG.md at master · phenomnomnominal/betterer](https://github.com/phenomnomnominal/betterer/blob/master/CHANGELOG.md)
23. [Results file](https://phenomnomnominal.github.io/betterer/docs/results-file/)
24. [Workflow](https://phenomnomnominal.github.io/betterer/docs/workflow/)
25. [tsc-baseline CDN by jsDelivr - A CDN for npm and GitHub](https://www.jsdelivr.com/package/npm/tsc-baseline)
26. [GitHub - TimMikeladze/tsc-baseline: 🌡️ Creates a baseline of TypeScript errors and compares new errors against it. This is useful for reducing noise in TypeScript projects which have a lot of pre-existing errors. This tool will filter out all existing errors and only show new type-errors introduced by your changes.](https://github.com/TimMikeladze/tsc-baseline)
27. [fix: prevent stack overflow on self-referential type arguments by Kshot3000 · Pull Request #155 · plantain-00/type-coverage](https://github.com/plantain-00/type-coverage/pull/155)
28. [type-coverage/package.json at master · plantain-00/type-coverage](https://github.com/plantain-00/type-coverage/blob/master/package.json)
29. [type-coverage - npm](https://www.npmjs.com/package/type-coverage?activeTab=readme)
30. [GitHub - plantain-00/type-coverage: A CLI tool to check type coverage for typescript code · GitHub](https://github.com/plantain-00/type-coverage)
31. [Update dependency type-coverage to ^2.30.2 by renovate\[bot\] · Pull Request #31 · un-ts/typemod](https://github.com/un-ts/typemod/pull/31)
32. [Strict null checking VS Code · Issue #60565 · microsoft/vscode](https://github.com/microsoft/vscode/issues/60565)
33. [Strict null checking Visual Studio Code](https://code.visualstudio.com/blogs/2019/05/23/strict-null)
34. [ts incremental strict mode](https://github.com/RikuMantysalo/ts-incremental-strict-mode)
35. [(v2.0) Strict mode by default by kamkry · Pull Request #19 · allegro/typescript-strict-plugin](https://github.com/allegro/typescript-strict-plugin/pull/19)
36. [TypeScript: Documentation - TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
37. [JS.TS.PREFER.TS.EXPECT.ERROR - Klocwork Documentation](https://help.klocwork.com/2023/en-us/reference/js.ts.prefer.ts.expect.error.htm)
38. [Enforce Best Practices Incrementally With Betterer](https://charpeni.com/blog/enforce-best-practices-incrementally-with-betterer)
39. [Frontend: Betterer. If by Betterer you mean the open-source…](https://medium.com/@qingedaig/frontend-betterer-746cccaa8532)
40. [Tests](https://phenomnomnominal.github.io/betterer/docs/tests/)
41. [Scripts to help migrate VS Code to use strict null checks](https://github.com/vmerino/vscode-strict-null-check-migration-tools)
42. [Announcing TypeScript Native Previews - TypeScript](https://devblogs.microsoft.com/typescript/announcing-typescript-native-previews/)
43. [TypeScript Native Preview (tsgo): the Go Port of tsc](https://openapps.pro/packages/typescript-native-preview)
44. [github.com](https://github.com/microsoft/TypeScript/issues/28306)
45. [TypeScript Strict Mode: What It Does and How to Enable It — js2ts.com](https://js2ts.com/typescript-strict-mode)
46. [ban-ts-comment](https://typescript-eslint.io/rules/ban-ts-comment/)
47. [node\_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-ts-comment.md](https://chromium.googlesource.com/devtools/devtools-frontend/+/ecf2a202fad263c062bae386125e8c625ce17f7f/node_modules/@typescript-eslint/eslint-plugin/docs/rules/ban-ts-comment.md)
48. [passWithNoTests](https://vitest.dev/config/passwithnotests)
49. [vitest errors if there are no in-source tests, even with --passWithNoTests · Issue #2763 · vitest-dev/vitest](https://github.com/vitest-dev/vitest/issues/2763)
50. [\[Bug\]: Empty test suites fail with "--passWithNoTests" CLI option set · Issue #14448 · jestjs/jest](https://github.com/jestjs/jest/issues/14448)
51. [\[Bug\]: passWithNoTests flag ignored for empty test files · Issue #15107 · jestjs/jest](https://github.com/jestjs/jest/issues/15107)
52. [Jest — Filenames without test or spec](https://medium.com/@damianmyerscough/jest-filenames-without-test-or-spec-3379a141d21a)
53. [@nx/jest - Executors](https://nx.dev/docs/technologies/test-tools/jest/executors)
54. [test(guards): node --test exits 0 when its glob matches no file, so a deleted suite goes green · Issue #15696 · mrveiss/AutoBot-AI](https://github.com/mrveiss/AutoBot-AI/issues/15696)
55. [Hosted test job cannot discover test files (quoted glob) · Issue #3 · mikeycdavis/StandardsOrchestrator](https://github.com/mikeycdavis/StandardsOrchestrator/issues/3)
56. [CI: node --test exits 0 on a glob that matches nothing — hollow-gate route (no current exposure; 16/16 sites literal and present) · Issue #461 · abhayla/IPODhan](https://github.com/abhayla/IPODhan/issues/461)
57. [Test](https://vitest.dev/api/test)
58. [Globals · Jest](https://jestjs.io/docs/api)
59. [Update dependency jest to v28 - autoclosed](https://code.usgs.gov/wma/iow/waterdataui/-/merge_requests/297)
60. [Annotations](https://playwright.dev/docs/test-annotations)
61. [Handling Flaky Tests at Scale: Auto Detection & Suppression](https://slack.engineering/handling-flaky-tests-at-scale-auto-detection-suppression/)
62. [Taming Test Flakiness: How We Built a Scalable Tool to Detect and Manage Flaky Tests - Inside Atlassian](https://www.atlassian.com/blog/atlassian-engineering/taming-test-flakiness-how-we-built-a-scalable-tool-to-detect-and-manage-flaky-tests)
63. [Quarantining flaky tests](https://support.atlassian.com/bitbucket-cloud/docs/quarantining-flaky-tests/)
64. [Vitest Coverage Thresholds: Fail CI on Low Coverage (2026)](https://nerdleveltech.com/vitest-coverage-thresholds-fail-ci-tutorial)
65. [coverage](https://vitest.dev/config/coverage)
66. [Vitest Coverage 2026: v8 vs Istanbul, Thresholds & Reporters](https://qaskills.sh/blog/vitest-coverage-v8-istanbul-guide-2026)
67. [Command Line Interface](https://v2.vitest.dev/guide/cli)
68. [The \`coverage.autoUpdate\` rewrite strips intended newlines from config files · Issue #9227 · vitest-dev/vitest](https://github.com/vitest-dev/vitest/issues/9227)
69. [Configuring Vitest coverage thresholds decimal place significance · vitest-dev/vitest · Discussion #6143](https://github.com/vitest-dev/vitest/discussions/6143)
70. [\`coverage.thresholdAutoUpdate\` and \`coverage.perFile\` Conflict · Issue #3179 · vitest-dev/vitest](https://github.com/vitest-dev/vitest/issues/3179)
71. [Status Checks - Codecov](https://docs.codecov.com/docs/commit-status)
72. [diff\_cover · PyPI](https://pypi.org/project/diff_cover/)
73. [coverage.thresholds.autoUpdate: pass previous threshold as second argument · Issue #10459 · vitest-dev/vitest](https://github.com/vitest-dev/vitest/issues/10459)
74. [The typescript-strict-plugin from allegro - GithubHelp](https://githubhelp.com/allegro/typescript-strict-plugin)
75. [Auto-resolve merge conflicts in .betterer.results · Issue #799 · phenomnomnominal/betterer](https://github.com/phenomnomnominal/betterer/issues/799)
76. [Betterer fails to load plugin · Issue #938 · phenomnomnominal/betterer](https://github.com/phenomnomnominal/betterer/issues/938)
77. [es module support · Issue #952 · phenomnomnominal/betterer](https://github.com/phenomnomnominal/betterer/issues/952)
78. [\[quality\] vitest coverage thresholds sit \~11 points below actual coverage; the gate cannot catch regressions · Issue #201 · cncf/prow-github-actions](https://github.com/cncf/prow-github-actions/issues/201)
79. [Failing test.fails shows as failed instead of passed · Issue #812 · vitest-dev/vscode](https://github.com/vitest-dev/vscode/issues/812)
80. [\[BUG\] tests using test.fail annotation that fails is shown as passed in the html report main page · Issue #28938 · microsoft/playwright](https://github.com/microsoft/playwright/issues/28938)
