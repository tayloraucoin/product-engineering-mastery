---
id: MIG-3
size: small
objective: "Day one's file list exists as a manifest the runbook walks and the tooling reads; under overlay check-refs checks only installed files, gen:agents skips host role files, and the contract loop runs end to end on a single-app repo."
slice_type: "Repo tooling and a data file; the risk is a manifest that names a file this repo does not have, or a check that walks host docs and fails a target's first verify."
non_negotiables:
  - "docs/runbooks/migrate/manifest.json holds one entry per layer-1 path, each { path, mode: copy | derive, when }, following layer-1.md's T2 table group by group, and lists itself as a copied entry."
  - "Every copy entry's path exists in this repo; no entry names the references, research or prompts folders under docs, nor apps/ or packages/ (not installed)."
  - "Under the overlay tiers check-refs scans only the manifest's copied and derived paths that exist, plus the spine; at starter it is unchanged."
  - "gen-agents.ts skips a role file without the practice's frontmatter, proven on the single-app repo with a host role file."
  - "On the single-app repo with a specs root, contract:init then status run as subprocesses and status lists the drafted ticket."
  - "No workspace-package boundary changes; nothing under apps/ or packages/ is touched."
  - "tooling/tsconfig.json is a derive entry (its extends names a package no target has); tooling/check-reviewers.ts and tooling/check-test-weakening.ts are copy entries; every package.json script that runs a tooling file resolves to a manifest entry, except the starter-only checks overlay.md lists and the toolkit-only migrate:assess."
devs_call: "The manifest's when vocabulary (signal ids and ruling names), the order of entries, and how check-refs reads the manifest when running inside a target."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T2"
  - "T3"
truth_files: "none: repo tooling and a data file; no living UX file changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "docs/runbooks/migrate/manifest.json"
  - "tooling/check-refs.ts"
  - "tooling/check-refs.test.ts"
  - "tooling/overlay.test.ts"
  - "tooling/fixtures/overlay/**"
depends_on:
  - MIG-1
out_of_scope:
  - "The runbook README that walks the manifest, and the migrate track: MIG-8."
  - "A migrate:install script that applies the manifest: deferred (T8, appetite cut)."
  - "The settings floor and session-start.ts: MIG-2."
  - "Changes to lint-frontmatter.ts and directory-map.ts: they already skip under overlay (verified in overlay.md)."
criteria:
  - id: C1
    statement: "Every manifest entry has path, mode and when; every copy path exists in this repo; no entry names a not-installed root; the manifest lists itself."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "On a scratch repo at tier overlay whose host docs hold a broken link, check-refs exits 0 when the broken link is outside the manifest's paths and exits 1 naming the file when a manifest path holds one."
    evidence: test
    command: "yarn test:tooling"
  - id: C3
    statement: "gen-agents.ts on the single-app repo with a host role file that has no frontmatter exits 0, writes no agent for it, and writes one for a copied role that opts in."
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "contract:init for an epic ticket, then status, on the single-app repo with a specs root both exit 0, and status lists the draft."
    evidence: test
    command: "yarn test:tooling"
  - id: C5
    statement: "At starter, check-refs passes on this repo unchanged."
    evidence: check
    command: "yarn check-refs"
  - id: C6
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
  - id: C7
    statement: "Every package.json script that runs a tooling file names a manifest tooling entry, except the starter-only checks (check-stack, check-catalog, check-ui-layout, contrast-audit, check-client-bundle), the starter's dev-server helper (print-local-urls) and the toolkit-only migrate:assess; check-reviewers.ts and check-test-weakening.ts are copy entries and tooling/tsconfig.json is a derive entry."
    evidence: test
    command: "yarn test:tooling"
  - id: C8
    statement: "On the single-app repo with a specs root holding a migration epic and one drafted gap ticket, check-specs exits 0."
    evidence: test
    command: "yarn test:tooling"
---

# Contract — MIG-0 overlay-manifest-and-refs

## Build notes

- **Approach:** write the manifest from layer-1.md's T2 table: Spine (derive), Path rules (copy `specs.md`, `docs.md`, `deps.md`; derive `ui.md`, `ts.md`, `testing.md`, `next.md`, `turbo.md` with `when` naming the signal), Practice docs (copy, folder entries allowed), Skills, Subagents (derive), Tooling (copy the overlay subset: `tooling/lib/`, `tooling/hooks/`, `tooling/git-hooks/`, the work-loop scripts, the checks overlay.md lists as installed, `tooling/package.json`, `tooling/tsconfig.json`, the hook and settings fixtures), Specs root (derive), Decisions, Layout, Verify. Then `check-refs.ts`: under the overlay tiers `liveFiles()` returns the manifest's paths that exist (folders expanded to their markdown) plus `AGENTS.md`, `CLAUDE.md` and `docs/index.md`. C1 is a unit test over the JSON; C2 to C4 are cases in `tooling/overlay.test.ts` on MIG-1's single-app helper.
- **Decisions that apply:**
  - T2: "Copy the practice docs, skills and the overlay tooling. Derive the spine, path rules, `toolkit.json` (overlay), settings and `verify`."
  - layer-1.md, T2: "The manifest is `docs/runbooks/migrate/manifest.json` (toolkit). Each entry is `{ path, mode: "copy" | "derive", when }`, where `when` names an assess signal or a ruling. The runbook walks the manifest; a later script can too (T8)." Not installed: the references, research and prompts folders under docs ("They stay in the toolkit, and a role that needs one reads it there"), "`apps/docs`, the demo app, and every `packages/*`."
  - overlay.md, `check-refs.ts` row: "Overlay: only the manifest's copied and derived paths. Host docs are left alone, as `lint:docs` already does." `gen-agents.ts` row: "Already skips a file whose frontmatter lacks `subagent: true` (verified, `build()`). One fixture with a host role file that has no frontmatter." Work-loop scripts: "Covered by one end-to-end case: `contract:init` then `status` in the fixture."
  - overlay.md, starter only: "`check-stack`, `check-catalog`, `check-ui-layout`, `contrast-audit`, `check-client-bundle`, `check-migrations`, the token lint, the boundaries config. Each arrives with its layer 3 part."
- **Interfaces:** the manifest file; `check-refs` reads it under overlay. No new package.json script.
- **Per path:**
  - `docs/runbooks/migrate/manifest.json`: the entries; a short `_comment` or `README` reference is the builder's call.
  - `tooling/check-refs.ts`: tier-aware `liveFiles()`.
  - `tooling/check-refs.test.ts`: C1 (manifest shape and existence) and C2.
  - `tooling/overlay.test.ts`: C3 and C4.
  - `tooling/fixtures/overlay/**`: any static fixture files the cases need (a host role file, a copied role with `subagent: true`); scratch repos stay in `$TMPDIR`.
- **Gotchas:**
  - The manifest is installed into the target at the same path, so check-refs inside a target finds it; that is why it lists itself.
  - `contract:init` needs an epic folder; in the fixture create it with `spec-init.ts` first (the harness already does this in `tooling/contract-review.test.ts`).
  - `status` refreshes `_status.md` at the specs root; the fixture must have one.
  - `lint:docs` and `directory-map` already skip under overlay; do not touch them.
  - `yarn check-refs` fails on any new doc naming a script that does not exist yet; the manifest is JSON, not scanned, but any README you add is. Add none here.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model tends to copy the whole `tooling/` folder into the manifest, starter-only checks included.
