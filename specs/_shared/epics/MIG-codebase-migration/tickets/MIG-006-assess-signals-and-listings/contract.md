---
id: MIG-6
size: small
objective: "The assess report measures the conventions and process signals and lists what the interview rules on: policy conflicts, SDK importers, records by kind, path collisions and hygiene; one read-only capture on synapse, conscious-connections and taylor-aucoin is filed."
slice_type: "Read-only detectors over a foreign repo; the risk is a detector that opens an env file, walks a worktree, or misreads a count the interview then rules on."
non_negotiables:
  - "V1 to V5 and P1 to P5 are measured as assess.md's table defines, through MIG-5's signal interface, and the total now covers all seventeen."
  - "The listings follow the data contract: conflicts { policy, file, line, text } from the target's AGENTS.md, CLAUDE.md and nested instruction files against the toolkit's policies; sdkImports { file, module, matchedBy } for stripe, @supabase/*, next-auth, @clerk/*, better-auth, resend, @anthropic-ai/*, openai, ai and @ai-sdk/*, matchedBy a toolkit reviewer glob or none; records { kind, path, lines } for decision logs, deviation logs, UX specs, closed spec folders and host roles; collisions for practice paths that already exist."
  - "Hygiene is reported, never scored: the current branch and its remote state, git worktrees, tracked files over 10 MB."
  - "Every read goes through git ls-files; no walk of the filesystem, no worktree, no env file."
  - "One capture runs migrate:assess read-only on the three repos and files the three reports under this ticket's evidence folder; the repos' trees are unchanged before and after (git status recorded)."
  - "Where a capture differs from assess.md's table, the difference is noted beside the capture, not hidden; the thresholds are not moved in this ticket."
devs_call: "The policy list P1 matches against and its line matcher, how a UX spec is found by name for P4, the evidence phrasing, and the capture file names."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T1"
  - "T6"
  - "T10"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - vigil
focus: []
operator_review: false
planned_paths:
  - "tooling/lib/assess/**"
  - "tooling/migrate-assess.test.ts"
  - "tooling/migrate-assess-listings.test.ts"
depends_on:
  - MIG-5
out_of_scope:
  - "Recalibrating the thresholds: after the synapse dry run (T1, if wrong)."
  - "Any write in synapse, conscious-connections or taylor-aucoin, and any run of the procedure there (settled)."
  - "The imports reviewer rows: MIG-4; this listing reads globs only."
  - "The --check preconditions: MIG-7."
criteria:
  - id: C1
    statement: "On scratch repos built for each case, V1 to V5 score as the table says: a boundaries file present scores V1 0 and absent 2; 3 process.env files outside env.ts score V3 1 and 30 score 2; 60 percent of use-client files outside _components/ scores V4 2; 3 unmatched SDK importers score V5 1 and 12 score 2."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "On scratch repos, P1 to P5 score as the table says: two conflicting instruction lines score P1 1; 95 percent of docs with frontmatter scores P2 0; two foreign record kinds score P3 2; a UX spec outside specs/<app>/ux/ scores P4 1; 60 doc paths with spaces score P5 2."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "The listings name each conflict with file and line, each SDK importer with the glob that matches it or none, each record with kind, path and line count, and each collision; hygiene names a dirty tree, an unpushed branch, a worktree and a tracked file over 10 MB without scoring them."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "On a scratch repo with a git worktree and an untracked .env file, the run reads neither: the report lists the worktree under hygiene only, and a trace of opened paths holds no env file and no worktree path."
    evidence: test
    command: "yarn test:tooling"
  - id: C5
    statement: "The three reports are filed, each with the target's commit, date and the git status before and after the run; synapse, conscious-connections and taylor-aucoin read as near, middle and far, or the difference from assess.md's table is noted."
    evidence: capture
    path: "specs/_shared/epics/MIG-codebase-migration/tickets/MIG-006-assess-signals-and-listings/evidence/capture-three-repos.md"
  - id: C6
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
---

# Contract — MIG-0 assess-signals-and-listings

## Build notes

- **Approach:** fill the remaining detectors in `tooling/lib/assess/`. V1 and V2 are path checks on the tracked list. V3 reads every tracked `.ts`, `.tsx`, `.mjs`, `.js` file outside `env.ts` files and counts those containing `process.env`. V4 counts tracked source files whose first non-comment line is `"use client"` and the share outside a `_components/` segment. V5 reuses the SDK-importer scan (a static import or require of a listed module) and the toolkit's reviewer globs, read from the toolkit checkout's `toolkit.json` (the folder this script runs from), to decide `matchedBy`. P1 compares instruction files against a short policy list (no tests, no branches or PRs, no commits, push allowed) with the exact lines quoted. P2 is the share of tracked markdown under `docs/` whose first line is `---`. P3 finds `TECHNICAL-DECISIONS.md`, `DEVIATIONS.md` and a host `docs/decisions/`. P4 finds `<specsRoot>/<app>/ux/`, else a tracked markdown whose name or first heading says UX spec. P5 counts tracked doc paths with a space or a non-ASCII byte. Hygiene uses `git status --porcelain`, `git rev-parse --abbrev-ref @{upstream}`, `git worktree list --porcelain` and `git ls-files -z` plus `stat`. Then the capture: run `yarn migrate:assess` on the three repos by absolute path, redirect the output into this ticket's `evidence/` folder, and record `git status --porcelain` in each repo before and after.
- **Decisions that apply:**
  - T1: the signal table rows V1 to V5 and P1 to P5 with their 0 / 1 / 2 columns; "Not scored, but listed in the report: Hygiene ... The listings: P1 conflicts, SDK importers, and records by kind (T5). Collisions: practice paths that already exist in the target."
  - T6, Listing: "The report lists every tracked file that imports `stripe`, an auth SDK (`@supabase/*`, `next-auth`, `@clerk/*`, `better-auth`), an email SDK (`resend`) or an AI SDK (`@anthropic-ai/*`, `openai`, `ai`, `@ai-sdk/*`). Each row says which toolkit glob matches the file, or 'none'."
  - T10: "Synthetic fixtures, plus one read-only `migrate:assess` capture on the three repos (writes nothing)."
  - assess.md: the expected captures are synapse 14, conscious-connections 18, taylor-aucoin 23 with the gate, scanned 2026-10-06; a different count means a different definition, and the note says which.
- **Interfaces:** no new command or flag; the data contract's `conflicts`, `sdkImports`, `records`, `collisions`, `hygiene` are now filled.
- **Per path:**
  - `tooling/lib/assess/**`: the detectors, listings and hygiene.
  - `tooling/migrate-assess.test.ts`: C1 to C4, on scratch repos written per case in `$TMPDIR`.
  - this ticket's `evidence/` folder: `capture-three-repos.md` (C5), one section per repo with the report inline; evidence is committed except `*.log`.
- **Gotchas:**
  - The three repos are at `~/lighthouse/synapse`, `~/lighthouse/conscious-connections/conscious-connections` and `~/lighthouse/taylor-aucoin`; read only. The sandbox denies env-file reads everywhere, so a detector that opens one fails loudly: good.
  - The `ai` module name is short; match the import specifier exactly or as `ai/<subpath>`, never as a substring.
  - Conscious-connections has 57 tracked paths with spaces and 173 with em-dashes; `-z` everywhere.
  - A toolkit `toolkit.json` is found relative to the script's own location, never the target's.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to walk the filesystem instead of the tracked list and count a 17 GB worktree.
