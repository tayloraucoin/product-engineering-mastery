# As-built — MIG-6

## Shipped against the contract

- C1: `tooling/lib/assess/conventions.ts` measures V1 (boundaries file), V2 (preset), V3 (tracked source files outside an `env.*` reading `process.env`, vendored `.yarn/`, `node_modules/` and `vendor/` excluded), V4 (the share of `"use client"` files outside a `_components/` segment) and V5 (SDK-importing files no toolkit reviewer glob reaches), on scratch repos per band in `tooling/migrate-assess-listings.test.ts`.
- C2: `tooling/lib/assess/process.ts` measures P1 (instruction lines against four toolkit policies, scored by distinct policy), P2 (share of `docs/` markdown opening with frontmatter), P3 (decision, deviation and progress logs and host `docs/decisions/` files, scored by kind), P4 (`specs/<app>/ux/`, else a UX spec by `ux/` folder or name, archives excluded) and P5 (tracked markdown paths with a space or a non-ASCII byte).
- C3: the listings follow the data contract: `conflicts` with policy, file, 1-based line and text; `sdkImports` with the first toolkit glob that reaches the file or `none`; `records` with kind, path and line count (decision, deviation and progress logs; one `closed spec folder` row per folder holding a log, its `lines` the folder's tracked file count; host decisions; host role prompts without the practice's frontmatter; UX specs), a tracked file deleted from the working tree read from HEAD; `collisions` from the day-one manifest's placeholder-free paths plus the practice folder each `docs/` or `.claude/` file entry sits in (so a host `docs/decisions/` collides), `package.json` excluded; `hygiene` with the branch against `refs/remotes/origin/<branch>` (equal, ahead, behind, diverged, absent), the dirty count, the linked worktrees and tracked files over 10 MB. The markdown gains one section per listing, `none` where empty, and a test reads the rendered sections.
- C4: every read goes through `Repo.read` over `git ls-files -z`; a worktree is listed under hygiene only and the files inside it are never opened; the test asserts the opened-path trace holds no env file and no worktree path.
- C5: `evidence/capture-three-repos.md`, retaken 2026-10-08 after the review fixes: synapse 15 near, conscious-connections 17 middle, taylor-aucoin 24 far by the gate, with `git status` identical before and after in each repo, and every difference from assess.md's table (score or count) noted under each report.
- C6: tooling types pass.

## Deviations

- Review round 1 (Vigil, Q2, FAIL on one red): the records listing lacked the `closed spec folder` kind the contract names; added, one row per folder holding a log. Oranges fixed: a tracked file missing from the working tree is read from HEAD rather than listed at 0 lines; P3 scores decision logs, deviation logs and host decisions only (progress logs stay in the listing, never in the score, as the table defines); the capture notes every count difference, not only the score differences; a host `docs/decisions/` collides. Yellows fixed: `@stripe/*` kept and logged; every band cut-off is a named constant in `score.ts` (`BANDS`) with a test at each edge; the rendered listings are tested; `.claude/rules/*.md` count as instruction files and a negated push line ("never push") is no conflict; `ux` must be its own word in a spec's name and a `ux/` folder matches at any depth; `package.json` is not a collision. Greys fixed: V4 excludes vendored code as V3 and V5 do; the capture demotes the report's inner headings; "1 entry". Left as noted: V3 counts `process.env` inside comments and strings (the table's definition is "files reading", a grep); the tokenizer treats a quote inside a regex literal as a string start (an undercount only); the SDK scan runs twice per report (V5 and the listing).
- Lines are counted as an editor counts them: a trailing newline closes the last line. MIG-5's tests were not affected.

- [ASSUMPTION] P5 counts spaces and non-ASCII bytes together, as the signal's name says; assess.md's table counted spaces only, so synapse and taylor-aucoin score 1 where the table scored 0 (6 and 10 role-prompt paths with an em-dash). The totals move one point each (15, 24) and the paths do not. The thresholds are untouched, as the contract rules; whether P5 should ignore non-ASCII is a question for the synapse dry run.
- [ASSUMPTION] P4 reads a `ux/` folder segment as well as a name holding `ux-spec`, `ux-design` or `ux-architecture`, archives excluded. Conscious-connections therefore scores 1 (12 files under `docs/ux/`) where the table's name-only scan scored 2; total 17, still middle.
- [ASSUMPTION] P1 is scored by distinct policy (tests, branches, push, protected-branch), not by line, so synapse's five lines against two policies score 1 as the table does. "No branches or PRs" is one policy, branches, since the toolkit's objection is the same for both.
- [ASSUMPTION] V5 and the SDK listing read the toolkit's glob rows only; the imports rows MIG-4 seeded are ignored on purpose, since the signal measures whether paths reach the SDK use (T6's risk), which an imports row retires rather than measures.
- The import scanner (`tooling/lib/assess/imports.ts`) mirrors `listImportedModules` and `importsModule` in `tooling/lib/specs.ts` rather than importing them: that file reads YAML and assess is node built-ins only (MIG-5 C5 pins the folder). One home for the scanner is a follow-up for MIG-14 (scanner hardening) to take, noted there in the report.
- MIG-5's three interim-state tests (`C2` null scores for V and P, `C4` the "not yet measured" lines) now assert the full measurement; no test was deleted, skipped or weakened. Test changes: three assertions replaced by stronger ones, in `tooling/migrate-assess.test.ts`.
- The `--check` preconditions section stays empty until MIG-7; the markdown prints it only when filled.

## Not verified

- C5 is a capture: the three reports are read, not asserted. The signal-by-signal difference from the table is noted in the capture file; the table itself is not amended (assess.md is the Technical stage's).
- Nothing has run against a real repo beyond the read-only capture, and the runbook's step 1 gate on unmeasured rows is MIG-10's text to relax.

## Next

MIG-7 lands `--check`, `--end` and `--protected`; the runbook's status line then drops its "until MIG-6 lands" clause and MIG-11's changelog bullet is amended.
