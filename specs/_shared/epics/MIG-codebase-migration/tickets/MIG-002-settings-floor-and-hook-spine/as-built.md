# As-built — MIG-2

## Shipped against the contract

- C1: `checkSettings(settings, tier, local?)` takes the tier from `toolkit.json`. Under `overlay` and `overlay-local` it requires in the tracked file only the floor (the env, secrets and key read denies, the six database reset and drop denies, the `git reset --hard`, `clean`, `branch -D` and `filter-branch` denies, the publish and login denies, the eight database asks) and the two team hooks. `overlay-c1-pass-floor-only.json` (also judged at `overlay-local`) and `overlay-c1-pass-floor-with-push-deny.json` pass. The overlay case in `tooling/overlay.test.ts` runs the same floor-only file through `check-settings.ts` on the single-app repo.
- C2: one fixture per floor rule, `overlay-c2-fail-{deny,ask}-<rule>-removed.json` (26 of them), each failing and naming its rule. A missing `session-start.ts` or `results-gate.ts`, or `results-gate.ts` under the wrong matcher, fails and names the hook. `bash-guard.ts` only in the local file passes, and so do the operator rows in the local file or in the tracked file. A local hook pointing at a missing script fails. Overlay still fails on a tracked sandbox that is off, a machine path, an allow-everything rule and a deny that blocks the local reset.
- C3: no starter fixture was edited. All 12 old starter fixtures give the same problem lists before (c8c9f1e) and after this ticket, and so do this repo's tracked settings (a side-by-side script in the prove worktree). `fail-c3-floor-only-at-starter.json` shows the floor-only file still fails at starter, naming the push deny.
- C4: `doctor.ts`, under the overlay tiers, fails one line per operator row that is in neither settings file: the push deny (a deny matching both `git push` and `git push origin HEAD`, through `bashRuleMatches`), `bash-guard.ts` on PreToolUse "Bash", and `stop-gate.ts` on Stop (through `hookRegistered`, the same match check-settings uses). Overlay cases: `{}` names all three; a bare-push deny plus bash-guard names the push deny and stop-gate only; the full rows exit 0; at starter an empty local file passes.
- C5: `session-start.ts` names only the spine files that exist. The fixture case uses a `root` context (`apps/web`, which has no `docs/index.md`). Overlay cases on the scratch repo cover `docs/index.md` absent, no spine at all, and a spine no commit has held. At starter the line is byte for byte the same as before.
- C6: proven 2026-10-07 on Claude Code 2.1.232. In one headless `claude -p` session on a scratch repo, `session-start.ts` (registered in `.claude/settings.json`) and `stop-gate.ts` (in `.claude/settings.local.json`) both fired, under the same session id. Capture: `evidence/hooks-in-both-files.md`.
- C7: tooling types pass.

## Deviations

- [ASSUMPTION] The existence check for the spine lives in `session-start.ts`, not the probe. `probeLayout` has no spine field, and `tooling/lib/layout.ts` is MIG-1's planned path, still under review. Moving it into the probe is a one-line follow-up once MIG-1 closes.
- [ASSUMPTION] Under overlay the sandbox is the operator's ruling, so a tracked file without `sandbox` passes. A tracked sandbox is still judged in full: it must be on and deny reads of `~/.ssh` and `~/.aws`.
- [ASSUMPTION] An operator row the team ruled into the tracked file satisfies doctor. The contract names only the local file, but a row ruled team is no longer the operator's.
- [ASSUMPTION] Fixture naming: an overlay fixture carries `"tier"` and is named `overlay-<criterion>-…`, and may carry `"local"`. `local-*.json` stays doctor's.
- check-settings now runs its main block only when it is invoked as a script, comparing real paths because macOS reaches `$TMPDIR` through a symlink. That lets doctor import its rows and matchers.
- `session-start.ts` prints "uncommitted" when no commit has held the spine yet. Before, `git log` printed an empty string and the line read "as of ,". At starter, with a committed spine, the output is unchanged.

## Not verified

- The ticket has not started. `contract:init` refuses because MIG has no Tickets-gate pre-flight line (`review:run vigil MIG`) and MIG-1's C7 is red on the LAB brief's budget. So `contract:run`, `contract:record` and the warden and mason reviews have not run. Every criterion's command was run by hand at a5a35e0 in a detached worktree: check-settings (53 fixtures), test:hooks, test:tooling (275 of 275) and check-types:tooling all exit 0.
- doctor in a real target, against a real `.claude/settings.local.json`.

## Next

Once the MIG Tickets gate and MIG-1's C7 are settled, run `contract:init`, `contract:run` and `contract:record` for C6, then review with warden and then mason.
