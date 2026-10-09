---
epic: DEMO
status: draft
---

# DEMO — technical notes

> Mason, 2026-10-08, from the brief and the approved `ux/demo/` files (D-DEMO-1 to 25). Tally not needed: no instrumentation (D-DEMO-24). Quartermaster consulted on one new dev dependency (R1). Warden not needed: no auth, no personal data, no agent-permission file (R5). Every ticket shares the detail in `technical/placement.md`, `technical/data-contract.md` and `technical/tests.md`. Labels: verified (read in the repo, 2026-10-08), judgment.

## Appetite verdict

**Not in one hour** (judgment, Mason). P-C parts 1 to 6 are six surfaces with about 50 `?state=` keys, captured at three widths in two themes, plus a kit change, a design layer, three skills, a calibrated critic and a CI job. With six parallel threads that is several hours. That is not a veto: the brief already treats overrun as a recorded v1 result, never a silent cut, and proposes a two-hour checkpoint. R0 ratifies that checkpoint, and the build order below puts parts 4 and 5 last so the checkpoint can cut them.

## Decided inside the law

- **D-DEMO-26 Placement.** All of it lives in `apps/web`, with no new package and no route handler. Demo-only code sits under `app/demo/`, climbing the §1 ladder inside one section. `lib/demo/` holds only the state registry, which the capture harness also imports. `technical/placement.md`.
- **D-DEMO-27 Data.** Fixtures are typed TS modules. The live data is a pure reducer held by a client provider in `app/demo/layout.tsx`, so writes survive client navigation and a reload resets them (D-DEMO-7). The records index and the bodies are separate maps (D-DEMO-20). `technical/data-contract.md`.
- **D-DEMO-28 Memory.** Onboarding completion, Compact rows and Default sort go in one first-party cookie that the client writes. It stays client-side with no account (D-DEMO-3), and `/demo` and the table's default sort can read it on the server without a flash. Theme stays with the kit's `next-themes`. This is reversible and not routed. Say so if you would rather use localStorage; the cost is a client-side redirect and a client-only default sort.
- **D-DEMO-29 States.** There is one registry and reader for every demo `?state=` key, modelled on `lib/sandbox/shared/state.ts`. An unknown key reads as absent. A forced key sets the first render; the person's next action runs for real and drops the key. `technical/data-contract.md`.

## Calls routed to Taylor

Ratify each, or send it back. An unratified call blocks Tickets. **Ratified, all six as recommended: Taylor, at the Tickets gate, 2026-10-08.**

| ID  | Call                           | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                           | If wrong                                                                         |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| R0  | Appetite                       | Ratify the brief's checkpoint: if the build waves pass two hours, stop and ask whether parts 4 and 5 move to a follow-up epic                                                                                                                                                                                                                                                                                                                            | Over-runs get recorded either way                                                |
| R1  | New dependency (Quartermaster) | `@playwright/test`, Chromium only, an exact pin at least 7 days old (`npmMinimalAgeGate`). It is an `apps/web` devDependency for the e2e criteria, the capture harness and critic CI. Its ticket adds the tech-stack row and whatever `yarn check-stack` asks for. It stays out of `yarn verify`, so the fast path needs no browser                                                                                                                      | One dev dependency to remove                                                     |
| R2  | P-2 solid destructive          | It lands in `@pem/ui` in wave 1, before the delete dialog, the form's dirty dialog and the reset confirm. That means one `buttonVariants` variant (Plumb names it) plus a `--destructive-foreground` token, light and dark, through `yarn contrast-audit`. No new export                                                                                                                                                                                 | A demo-local override is kit drift Assay would flag; a variant is easy to remove |
| R3  | P-1 Diff, P-4                  | Build P-1 in the demo at `app/demo/_components/diff.tsx`, ruled as a product primitive in `apps/web/docs/design/components.md`. It moves to `@pem/ui` only when `apps/docs` imports it (§1). For P-4, mark whole clauses only in this epic; word-level marking is out of bounds                                                                                                                                                                          | Moving it is one file, paid once                                                 |
| R4  | Critic CI credential           | A separate `.github/workflows/critic.yml`, keeping `ci.yml` free of the key. It runs on `pull_request` only, never `pull_request_target`, path-filtered to `apps/web/**`, `packages/ui/**`, `packages/config/tailwind/**` and `.claude/skills/tk-ui-critic/**`. It needs an `ANTHROPIC_API_KEY` repo secret, which only you can add. A missing key fails the job, never skips it. The model is the one the critic was calibrated on, pinned in the skill | Spend per run; fork PRs never receive the secret                                 |
| R5  | Critic hands-off guard         | Use the skill's `allowed-tools` (read, the capture script, no Edit or Write), not a hook or a `.claude/settings.json` change. No agent-permission file is touched, so the skill tickets stay at Q2. A PreToolUse hook would make the ticket Q3 with Warden                                                                                                                                                                                               | The critic edits what it scores; Vigil's focus test is the guard                 |

## One-way doors

None is touched (verified against `toolkit.json`'s reviewer rows):

- `packages/*/package.json`: R2 adds a variant, not an export.
- `packages/config/eslint/boundaries.js`: no package is added.
- `apps/*/app/api/**`: no route handler, and no server action either, because the cookie is written client-side.
- `**/schema/**`, `**/migrations/**`: there is no database.
- `**/auth/**`, `**/proxy.ts`: `/demo` is public, and the proxy is untouched.
- `.claude/settings.json`, `tooling/hooks/**`: R5 keeps both untouched.

The gate is R0 to R5.

## Build order every ticket respects

1. **Foundation.** Fixtures, the store, the state registry, the cookie codec, `/demo`, the shell, the home link.
2. **In parallel with the foundation.** R2 in `@pem/ui`, R1 with the harness, the design-layer docs.
3. **The six surfaces in parallel.** Each surface ticket includes its own `?state=` keys.
4. **Once every surface captures.** `tk-ui-critic`, `tk-ui-diverge`, `tk-motion`.
5. **Last.** Critic CI and the run (part 5). This is where R0's checkpoint falls.

## Rules every UI ticket carries

D-DEMO-15 and D-DEMO-16 apply as written: one content per state at every width, and the build fixes capture drift and never edits the locked canvas. They come with the hydration and capture rules in `technical/tests.md`.
