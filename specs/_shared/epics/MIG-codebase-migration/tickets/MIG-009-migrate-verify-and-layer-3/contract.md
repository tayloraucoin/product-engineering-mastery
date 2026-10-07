---
id: MIG-9
size: small
objective: "The runbook's layer 2 and layer 3 are written: how a target's own checks become one verify command with baselines that freeze old debt, how CI is wired where it exists, the twelve ordered gap tickets, and the follow-on prompts the run prints at its end."
slice_type: "Practice docs (two runbook files); the risk is a freeze recipe that rewrites many files under a live team, or a verify mapping that lets a check pass with no tests."
non_negotiables:
  - "docs/runbooks/migrate/verify.md maps verify as layers-2-3.md rules: the repo's own checks (lint, boundaries where present, types, test, build) then the toolkit's (check-settings, test:hooks, check-specs, check-test-weakening, check-reviewers, check-refs, budget, gen:agents --check, check-types:tooling); every check runs once on the base commit before it enters."
  - "The freeze recipes are the table's: ESLint bulk suppressions (9.24.0 or later, else a gap); per-line @ts-expect-error MIG-BASELINE(<code>) with type-baseline.count and the ratchet; node --test over a literal path plus one smoke test and no pass-with-no-tests; expected-fail markers per runner and tests/QUARANTINE.md; a build failing at base stops the run."
  - "A freeze over about 50 files is the last commit of the day or a gap, and the operator rules which; a repo-wide format check stays out of verify while format writes."
  - "CI wiring: where CI exists, the chained steps become one yarn verify step under the same triggers in one commit, and the first CI run is the operator's; where none exists, CI is a drafted gap and a hosted step."
  - "docs/runbooks/migrate/layer-3.md lists the twelve parts in layers-2-3.md's order, each as a gap ticket's Build notes (layer, what did not cross, the plan, the conflict-risk flag and trigger, an estimate labelled as one), and ends with the follow-on prompts: the layer-3 opening prompt and the living-truth promotion prompt."
  - "Nothing here is a codemod or an agent rewrite of the target's source (out of scope); strict is pinned before any TypeScript 6 upgrade."
devs_call: "Section order, the wording of the recipes, how the ratchet step is phrased for a repo with no CI, and the prompts' exact text."
cites:
  - "specs/_shared/epics/MIG-codebase-migration/technical.md"
  - "T7"
truth_files: "none: practice docs; no living UX file changes"
qa: Q2
reviewers:
  - crucible
focus:
  - "walk it as taylor-aucoin: Next 15, no runner, no CI, 49 raw hex values, a root app that must one day move into apps/web; does each part stay a gap with a plan and never a day-one rewrite (crucible)"
operator_review: false
planned_paths:
  - "docs/runbooks/migrate/verify.md"
  - "docs/runbooks/migrate/layer-3.md"
  - "docs/runbooks/migrate/README.md"
  - "tooling/refs-pending.json"
depends_on:
  - MIG-8
out_of_scope:
  - "A type-freeze script or a count-ratchet script: prose until a target's base fails its type check (appetite cut)."
  - "The layer-1 steps and the interview: MIG-8."
  - "Running any recipe on a real repo (settled)."
  - "Coverage thresholds and patch coverage: layer 3, part 3, hosted."
criteria:
  - id: C1
    statement: "Both files carry valid frontmatter and names."
    evidence: check
    command: "yarn lint:docs"
  - id: C2
    statement: "Every path and yarn script the two files name exists, and the MIG-9 entries are gone from refs-pending.json."
    evidence: check
    command: "yarn check-refs"
  - id: C3
    statement: "The runbook folder's table lists both files with their descriptions."
    evidence: check
    command: "yarn directory-map --check"
  - id: C4
    statement: "verify.md holds a freeze recipe per kind (lint, types, tests, build) with its never column, the 50-file rule and the CI rule; layer-3.md holds twelve parts in order, each with the five gap items, and two prompts; read and listed in the as-built."
    evidence: manual
    reason: "prose structure; no script reads it"
---

# Contract — MIG-0 migrate-verify-and-layer-3

## Build notes

- **Approach:** two files beside the README, in the new-project folder's style (one file per handed-out piece, each with a one-line purpose at the top). `verify.md`: the mapping, the base-commit rule, the freeze table rewritten as steps a cold session runs (lint: `eslint --suppress-all` to `eslint-suppressions.json`, commit; types: the short inline script that inserts the tagged comment above each `tsc` error and re-runs until clean, the `type-baseline.count` file, the ratchet check as a verify step, the `ban-ts-comment` `descriptionFormat`; tests: the `node --test <literal path>` script and the smoke test, the expected-fail markers by runner, `tests/QUARANTINE.md` columns; build: stop), the live-team rule, and CI wiring. `layer-3.md`: the twelve parts with a Build-notes block each, then the two prompts. Link both from the README's steps 6 and 9 (MIG-8 named them in plain words or in `refs-pending.json`).
- **Decisions that apply:**
  - T7: "`verify` holds the repo's own checks as they pass at base, plus the toolkit's. A check failing at base is frozen (ESLint bulk suppressions; tagged per-line `@ts-expect-error` plus a count ratchet; expected-fail markers) or left as a gap. `node:test` and a smoke test where there is no runner. Layer 3 is twelve ordered gap tickets; hosted steps stop." Beat: "Betterer, tsc-baseline, ts-migrate; `strict` on day one." If wrong: "A freeze over about 50 files waits; the operator rules."
  - layers-2-3.md, Layer 2: the freeze table's Freeze and Never columns, verbatim as the recipe's rules; "A glob matching nothing exits 0 on Node 22.20 (TB, Part 2.1, secondary)"; "Where CI exists, the chained steps become one `yarn verify` step under the same triggers, in one commit."
  - layers-2-3.md, Layer 3: the twelve parts, 1 toolchain majors to 12 leftovers, with their notes (strict pinned before TS 6; `check-migrations` scans contents, never names; each module's remove recipe is the checklist of conformant; part 11 is its own epic in the product repo, last).
  - layers-2-3.md, Hosted steps: every push and merge, the first CI run, CI creation and secrets, hosted migrations, vendor dashboards, coverage SaaS, worktrees and large files (never rewritten).
- **Interfaces:** two markdown files; the README's two links.
- **Per path:**
  - `docs/runbooks/migrate/verify.md`: layer 2.
  - `docs/runbooks/migrate/layer-3.md`: layer 3 and the prompts.
  - `docs/runbooks/migrate/README.md`: the two links and the folder table rows.
  - `tooling/refs-pending.json`: remove the "lands in MIG-9" entries MIG-8 added, if any.
- **Gotchas:**
  - The research note behind the recipes is cited only through `layers-2-3.md`; never name a research path in these files (A11, and `check-specs` fails a contract that does).
  - The expected-fail marker for `node:test` was not found; the recipe says skip and list, never invent one.
  - `check-refs` fails on an entry in `refs-pending.json` that now exists; remove the MIG-9 entries in the same commit as the files.
  - Prompts are printed by the run, never saved as files in the target; here they are text inside `layer-3.md`.
  - Examples are synthetic: a repo `acme-shop`, a count file reading `type-baseline.count: 212`.
- **Model:** Fable 5.1 (`claude-fable-5-1`). A smaller model tends to recommend `strict` on day one or a runner change, both beaten.
