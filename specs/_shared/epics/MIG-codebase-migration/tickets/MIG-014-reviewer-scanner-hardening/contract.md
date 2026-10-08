---
id: MIG-14
size: small
objective: "The reviewer import scanner reads the specifiers a real overlay repo uses: Deno and URL specifiers, Vue, Svelte, Astro and MDX sources, and JSX text without hiding later imports."
slice_type: "Tooling only: the scanner in tooling/lib/specs.ts; reversible, no layout-file change unless node: builtins are admitted."
non_negotiables:
  - "A name in a comment or a string still never matches (MIG-4 C1 stays green)."
  - "npm:stripe@14, https://esm.sh/stripe@14 and jsr:@supabase/supabase-js@2 match stripe and @supabase/*."
  - "The script blocks of .vue, .svelte and .astro files, and the import lines of .mdx files, are scanned."
  - "`/*` inside JSX text does not hide a later import() or require()."
devs_call: "The scanner's internals only. [NEEDS DECISION] Two questions are the operator's, put at the Tickets gate: whether type-only imports keep counting toward @supabase/* (breadth), and whether node: builtins become valid reviewers[].imports entries (the layout-file-shape door, mason's row; if it stays in scope mason joins the review with a focus line)."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/tickets/MIG-004-reviewer-imports/as-built.md"
truth_files: "none: repo tooling; no living UX file changes"
qa: Q2
reviewers:
  - vigil
focus: []
operator_review: false
planned_paths:
  - "tooling/lib/specs.ts"
  - "tooling/lib/toolkit.ts"
  - "tooling/check-reviewers.test.ts"
  - "docs/engineering/tooling.md"
depends_on:
  - MIG-4
out_of_scope:
  - "Following a path-alias wrapper to its importers: a wrapper gets its own glob row (document it in tooling.md)."
criteria:
  - id: C1
    statement: "Deno and URL specifiers, Vue, Svelte, Astro and MDX sources, and a dynamic import after `/*` in JSX text each match as the non-negotiables say."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "Tooling types pass."
    evidence: check
    command: "yarn check-types:tooling"
  - id: C3
    statement: "MIG-4 C1 stays green: a module named only in a comment or a string still never matches, in every source kind the scanner now reads."
    evidence: test
    command: "yarn test:tooling"
---

# Contract — scanner-hardening

## Build notes

- **Why:** Vigil's K2 to K5 and Mason's 6 and 7 on MIG-4, logged as known limits in its as-built.
- **Approach:** normalize a specifier before `importsModule` (strip `npm:`/`jsr:` and a version, take an esm.sh path's package); extract script blocks before tokenizing; treat `/*` as a comment only where a regex or division could not start.
