---
id: WEB-11
size: small
objective: "A planned path naming a Next dynamic segment, like apps/web/app/experimental/[slug]/page.tsx, matches its own file, so review prompts list it and check-specs --strict stales its proofs when it changes."
slice_type: "Integrity of the contract loop's path matching; the risk is a glob change that widens or narrows what every other ticket's planned paths match."
non_negotiables:
  - "A literal [ and ] in a planned path match themselves; existing globs (*, **, ?) keep their meaning."
  - "Every existing ticket's planned paths match the same files before and after, except the bracketed ones that matched nothing."
  - "results.json is written only by the tooling."
devs_call: "Escaping brackets before matchesGlob, or matching literal paths first; helper names."
cites:
  - "PR-14"
truth_files: "none: no living UX file covers the contract loop"
qa: Q1
reviewers: []
planned_paths:
  - "tooling/lib/specs.ts"
  - "tooling/contract-run.test.ts"
depends_on: []
out_of_scope:
  - "Re-proving or re-reviewing any ticket whose staleness this changes."
criteria:
  - id: C1
    statement: "inPlannedPaths matches apps/web/app/experimental/[slug]/page.tsx against itself and against apps/web/app/experimental/[slug]/**, and not against apps/web/app/experimental/s/page.tsx."
    evidence: test
    command: "yarn test:tooling"
  - id: C2
    statement: "Across every contract in specs/, the set of files each planned path matches is unchanged except for bracketed paths."
    evidence: test
    command: "yarn test:tooling"
---

# Contract — planned-path-brackets

## Build notes

- Found by Warden in LAB-7's second review (2026-10-06): `inPlannedPaths` (`tooling/lib/specs.ts:912-916`) uses `path.matchesGlob`, where `[slug]` is a character class. LAB-7's `page.tsx`, `actions.ts` and `_components/gate/**` were therefore left out of its review prompt's file list, and `changedAfter` would not stale its proofs.
- LAB-7 is the first ticket with a bracketed planned path; later LAB tickets (`[slug]/review/**`) have them too.
