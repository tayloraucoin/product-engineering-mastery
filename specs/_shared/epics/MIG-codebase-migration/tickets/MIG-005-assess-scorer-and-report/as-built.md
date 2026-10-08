# As-built — MIG-5

## Shipped against the contract

- C1: `tooling/lib/assess/score.ts` holds the thresholds as constants (`NEAR_UP_TO` 15, `MIDDLE_FROM` 16, `FAR_FROM` 22) and the gate (S1 = 2, or not a JavaScript repo); assess.md's three rows score 14 near, 18 middle, 23 far with the gate; S1 = 2 at 10 is far; the band edges 15, 16, 21 and 22 are pinned.
- C2: S1 and S2 in `shape.ts`, C1 to C5 in `checks.ts`, each behind the `Signal` interface in `signal.ts` (`{ id, group, layer, title, measure(repo) => { value, score, evidence } }`). Scratch repos reproduce synapse's shape and checks row (0, 0, 1, 0, 2, 0, 1) and taylor-aucoin's (2, 1, 2, 2, 2, 0, 1).
- C3: `yarn migrate:assess <target> --json` prints the data contract's thirteen keys; the target's tree, `.git` included, hashes the same before and after the run.
- C4: the markdown gives the total and how many signals it covers, the gate, the path and why, a table per group with score and evidence, and the signals not yet measured.
- C5: the test scans every import in `migrate-assess.ts` and `tooling/lib/assess/`: `node:` modules, or a relative path inside the folder.
- C6: tooling types pass.

## Deviations

- [ASSUMPTION] While any signal is unmeasured, the path is decided only when the measured total and its ceiling (each unmeasured signal at 2) fall in the same band, or the gate fails; otherwise `path` is `null` and the report says "not decided". Leaving those signals out of the total alone would print near for every gated-in repo until MIG-6 lands, which the contract's gotcha forbids.
- [ASSUMPTION] `gate` is `{ failed, reasons[] }`; "not a JavaScript repo" (no root package.json) is a gate reason beside S1 = 2. A detector that throws is reported as failed, scores nothing, and keeps the path undecided.
- [ASSUMPTION] S2 reads the root package.json and `apps/*/package.json` only. A tool the target does not declare is not off. Another package manager (a pnpm `packageManager`, or a `package-lock.json` or `pnpm-lock.yaml` with no `packageManager`) counts as Yarn off, and so does a Yarn 1 `yarn.lock`. The six majors are constants in `shape.ts`, read from tech-stack.md on 2026-10-07.
- [ASSUMPTION] C3: test files with no runner score 1, as a runner with no tests does.
- [ASSUMPTION] The tests use their own light scratch repos (`tooling/lib/assess/scratch-target.ts`) instead of `freshRepo()`: a target is a foreign repo, and the contract loop's template (toolkit.json, tooling copy, yarn install) would make it look like the toolkit.
- Review round (Vigil, PASS): one orange and the cheap yellow and grey findings fixed in this round: a test pins that only tracked, non-env files are opened; the read-only test ages a tracked file so an index refresh would show; `lint-staged` and `tsc-alias` no longer count for C4; `prettier -c`, `-l`, Biome without `--write` and a root `format:check` that hands off to the workspaces count as read-only for C5; tests under `test/` and Cypress files count for C3; `NEAR_UP_TO` is derived from `MIDDLE_FROM`; plain `node` resolves a relative target against the shell, not an inherited `INIT_CWD`.

## Not verified

- The detectors were run read-only on synapse and taylor-aucoin while building, and matched assess.md's S and C columns; the filed three-repo capture is MIG-6's C5.

## Next

MIG-6 fills V1 to V5, P1 to P5, the listings and hygiene behind the same interface.
