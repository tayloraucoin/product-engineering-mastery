---
epic: DEMO
status: draft
---

# DEMO — test shape and rabbit holes

> Touchstone's rule: the shape of the risk picks the test type. Mason, 2026-10-08.

## Test shape per risk

| Risk                                                                                                                                                                                                                                                         | Test                                                                                                                                                                                                                           | Where                                                                                        | Runs in                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Query parsing, filter and sort; the state reader; the prefs codec; the reducer (save, versioning, delete, reset); form validation; built words ("Vendor contains …", "You changed 2 fields", "all 4 versions" / "its only version", the error summary count) | Unit, `node:test`, beside the module                                                                                                                                                                                           | `app/demo/**/_lib/*.test.ts`, `lib/demo/*.test.ts` (picked up by `apps/web`'s `test` script) | `yarn test`, `yarn verify`                      |
| The diff (combinatorial)                                                                                                                                                                                                                                     | Generated inputs from a seeded generator, with no new dependency. Same plus removed rebuilds the old version, same plus added rebuilds the new one, and the summary counts agree. Halvorsen 4 against 3 is a fixed golden case | `_lib/diff.test.ts`                                                                          | as above                                        |
| Journeys and DOM behaviour: the redirect, focus moves, the focus trap, `aria-*`, replace versus push, a double press, Escape                                                                                                                                 | e2e, Playwright (R1), against `next build && next start`                                                                                                                                                                       | `apps/web/e2e/demo/<surface>.spec.ts`                                                        | `yarn web:e2e`; `critic.yml`; contract criteria |
| Every state renders as captured                                                                                                                                                                                                                              | Capture: every `DEMO_SURFACES` key at 390, 834 and 1440, light and dark, with reduced motion emulated                                                                                                                          | `yarn web:capture`, writing to a git-ignored `apps/web/.captures/`                           | capture criteria; critic; CI artifact           |
| The critic can be trusted                                                                                                                                                                                                                                    | Calibration: it fails all three fail exemplars and passes all three pass exemplars. Removing one capture from the set makes it fail, never pass                                                                                | the `tk-ui-critic` ticket (Vigil's focus)                                                    | that ticket's criteria                          |
| Tokens and contrast                                                                                                                                                                                                                                          | `yarn lint` (token lint) and `yarn contrast-audit`; the P-2 token joins the audit                                                                                                                                              | —                                                                                            | `yarn verify`                                   |
| Keyboard alone at 390                                                                                                                                                                                                                                        | Manual, at Seen                                                                                                                                                                                                                | —                                                                                            | each surface's manual criterion                 |

A criterion evidenced `test` in a UX file is a unit test when the behaviour is pure, and an e2e spec when it needs a DOM. `apps/web` has no DOM test runner, and none is added: Playwright covers that ground.

## Capture and hydration rules (every UI ticket)

- D-DEMO-15 and D-DEMO-16, as written in `ux/demo/overview.md`.
- Before navigating, the harness sets the theme storage key and waits for fonts. It uses Playwright's `reducedMotion: "reduce"` and never relies on a flash.
- From `md` up the 1440 layout applies, so 834 takes it. Anything below `md` is the 390 layout.
- Server and client render the same: the fixed clock, explicit locales, and no `Date.now()` or random values in render.
- A designed `error` never throws. Only home's STK-18 key throws.

## Rabbit holes

- **Real offline detection, simulated latency, persistence, pagination:** out of bounds. Each is a forced key or nothing (D-DEMO-7).
- **Word-level diff (P-4):** out of bounds in this epic (R3).
- **The date picker:** it stores an `IsoDate` string. A time zone never enters state.
- **The floating theme toggle** would double the shell's toggle. The foundation ticket hides it on `[data-demo]`.
- **Critic CI spend:** the path filter plus one run per PR push (R4).
- **`.claude/skills/`** is sandbox-protected. Its writes need Taylor's approval in the build thread; plan for the prompts, never route around them.
- **The skill listing cap:** three new `tk-` skills must fit the ≤12 listing and its description limits (`yarn budget`).
