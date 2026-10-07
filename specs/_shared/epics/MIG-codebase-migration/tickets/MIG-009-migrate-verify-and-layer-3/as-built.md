# As-built — MIG-9

## Shipped against the contract

- C1: `docs/runbooks/migrate/verify.md` and `docs/runbooks/migrate/layer-3.md` (layer runbooks, role Mason, thread "MIG") carry the full frontmatter block with quoted titles and descriptions under 400 characters; `yarn lint:docs` reports nothing on either.
- C2: `yarn check-refs` resolves every reference in the 132 live files. MIG-8 named the two files in plain words and added nothing to `tooling/refs-pending.json`, so there was nothing to remove; the file is untouched. The target-only `check-type-baseline` script is named outside a `yarn` code span.
- C3: the folder table in `docs/runbooks/migrate/README.md` lists both files with their descriptions, written by `yarn directory-map` (in a scratch worktree, as MIG-8's as-built explains); `yarn directory-map --check` passes there.
- C4: read and listed under Not verified.

## Deviations

- [ASSUMPTION] The type ratchet is a one-line `check-type-baseline` script in the target's `package.json` (the tag count from `git grep` must equal `type-baseline.count`), placed after the type check in `verify`; equality covers "fail above, and fail below unless the file was lowered in the same commit". The script that inserts the tags is given inline as a few lines of Node, written in the thread and not kept, since the type-freeze script is an appetite cut.
- [ASSUMPTION] `verify.md` pins `strict` to its current value as step 1 of the type freeze, where the type check failed at base; layer 3 part 1 repeats the rule for every repo before a TypeScript 6 upgrade. Nothing changes behaviour today.
- [ASSUMPTION] The `ban-ts-comment` description format admits the tag or a ": TS1234 because …" reason, so a bare directive is still refused and new legitimate ones are not blocked.
- [ASSUMPTION] A build that reads `.env` files runs unsandboxed with the operator's yes, in the base run and at every later `yarn verify` (Crucible's finding 11 on MIG-8, routed here); the README's 51 asks it.
- [ASSUMPTION] Layer 3 part 11's ticket is drafted like the others and its Build notes say it is opened as its own epic through the prompt builder; the twelve tickets keep one list for `yarn status`.
- [ASSUMPTION] The layer-3 opening prompt names a drafted ticket by id and is printed once per part the operator opens; the promotion prompt runs through `/tk-prompt` on the product-spec track, as the new-project UX-spec prompt does.
- Review round 1 (Crucible, as taylor-aucoin, PASS with six oranges, all fixed, and the yellows and greys fixed in the same pass since each was a line): the base worktree has no untracked env files, so the operator copies them in or the base build is recorded as not run; a `next lint` script becomes `eslint .` in the baseline commit, since the Node API never reads the suppressions file; `strict` is pinned to its effective value from `tsc --showConfig`, never a literal; the count file and the ratchet use one command; part 11 re-derives `eslint-suppressions.json` in the move commit because it is path-keyed; parts 2 and 6 are Q3 with their reviewers named; the opening prompt names the toolkit checkout; the base run records exit codes; the type check runs with `--pretty false`; part 5 adopts an existing env reader; the lint check proves the suppressions file is read; part 4 names a root app's elements.
- The ticket has not started: `yarn contract:init` refuses on MIG-8 (not started) and the MIG Tickets gate, as for MIG-8. Every criterion's command was run by hand instead.

## Not verified

- C4, read on 2026-10-07: `verify.md` holds one recipe per kind, each ending on a check and a **Never** list: 3.1 lint (ESLint 9.24.0 or later, `--suppress-all`, the suppressions file; never `--max-warnings`), 3.2 types (tagged `@ts-expect-error MIG-BASELINE(<code>)` lines, `type-baseline.count`, the ratchet step, the `ban-ts-comment` format; never `strict`, ts-migrate, Betterer, tsc-baseline, `@ts-nocheck`), 3.3 tests (`node --test` over a literal path plus the smoke test, no pass-with-no-tests, Vitest, Jest and Playwright expected-fail markers, `tests/QUARANTINE.md` with owner and date, `node:test` skip-and-list; never a bare skip or a new runner), 3.4 build (not freezable, stops for the operator). Section 4 holds the about-50-files rule and the format exclusion; section 6 the CI rule (one `yarn verify` step under the same triggers, one commit, first run the operator's; a gap and a hosted step where none exists). `layer-3.md` holds parts 1 to 12 in layers-2-3.md's order, each with Layer, What did not cross, Plan, Conflict risk with its trigger, and Estimate labelled as one, then the hosted-steps list and the two prompts.
- `yarn contract:run` and `yarn contract:record` have not run. `yarn lint:docs` and `yarn directory-map --check` exit 1 in this tree only on `docs/research/ui-patterns/` (committed before this ticket, untouched).
- No recipe has run on a real repo (settled); the desk walks are MIG-10.

## Next

Start the ticket with MIG-8 once the MIG pre-flight passes, run `contract:run` and record C4; MIG-10 walks both files as taylor-aucoin.
