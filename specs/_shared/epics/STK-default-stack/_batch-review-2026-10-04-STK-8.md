# Tier 1 batch review: STK-8, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5). It was given the contract, the cited `technical.md`, `results.json`, the as-built, the evidence folder and the list of changed files. The reply is saved here as received, with only its layout reformatted; what was done about each finding is under "Disposition" at the end.

---

# STK-8 component-workshop: tier 1 review

**Verdict: Pass with conditions.** I found no Blocking issues. All five non-negotiables hold in the code. The two checks the ticket depends on (story coverage and axe) do fail when they should. Six Should-fix items remain. Two are the most important. First, the workshop's own checks can report a false failure that survives a reload, after one ordinary click. Second, nothing recorded so far shows the apps still build with the base layer moved, because the C2 run stopped at step 3.

I built the plan from the contract and D-STK-9, 10 and 17 before reading any code. I had no shell in this pass, so everything below is checked against the code and the recorded evidence. Nothing was run.

## Verified in code

- **Location and command:** Storybook lives in `packages/ui`. Root `ui:storybook` runs `yarn workspace @pem/ui storybook`, which runs `storybook dev --port 6006 --config-dir .storybook` (`packages/ui/package.json:29`).
- **Versions:** Storybook major 10 with `@storybook/nextjs-vite`. Installed `node_modules` show 10.6.1 for the framework and for pseudo-states. The as-built gives versions and dates (2026-10-04) and does not restate 8.6 or react-vite as current.
- **Preview:**
  - `preview.css` loads the same three imports the app does.
  - The `.dark` class comes from addon-themes, set on `<html>`.
  - The font is `@pem/brand/font`.
  - Assets are served from `@pem/brand/assets` (resolved through its `./assets/*` export) to `/brand`, not from an app's `public/`.
- **The axe check really fails stories:**
  - `a11y.test: "error"` is set at `preview.tsx:65`, and `VITEST_STORYBOOK: "false"` at `vitest.config.ts:18`.
  - That value matches the installed addon's `getIsVitestStandaloneRun()`, which tests `=== "false"`. With it set, `expect(result).toHaveNoViolations()` runs.
  - `stories.test.ts:26-30` proves this with the `button-name` fixture, using the same `composeStories(...).run()` path every real story takes.
- **The coverage check really fails a component without a story:**
  - `story-coverage.ts` visits every `primitives/<kind>/<name>` and `composed/<kind>/<name>` folder, and every `providers/<name>` folder.
  - `story-coverage.test.ts:14-19` asserts the exact message naming `fixture/src/primitives/control/orphan`.
  - It runs in `@pem/ui`'s `yarn test`, which `yarn verify` includes.
- **Boundaries:** `ui-workshop` is matched before `ui`, allows `config`, `brand` and `ui`, and is left out of `APP_IMPORTS`. The stories in `src/` import nothing from `@pem/brand`.
- **Apps still resolve the CSS:**
  - Both apps depend on `@pem/ui` and list it in `transpilePackages`.
  - In `@pem/ui/styles/globals.css`, `@source "../"` resolves to `packages/ui/src`, so the fixtures under `.storybook/` stay out of the apps' CSS.
  - `apps/docs` keeps its typography plugin and prose rules.
- **C1 evidence:** `stories.test.ts` ran 17 tests (16 stories plus the fixture) and `story-coverage.test.ts` ran 3.

## Findings

### Blocking

None.

### Should-fix

**S1. One normal click in the workshop leaves a stored theme behind, and the System stories then fail.** `preview.tsx:52` (`if (!stored) return;`), `theme-toggle.stories.tsx:28-35`, `theme-provider.stories.tsx:29-33`. Open Theme toggle/System and click "Dark": next-themes writes `localStorage.theme = "dark"` and nothing restores it, because the System story has no `storedTheme`. Providers/Theme/System then renders "Chosen: dark" and its `play` times out; the toggle's own System story fails the same way. The value survives reloads, and the other stories save the stale "dark" as `previous` and put it back. Same cause: an inline `color-scheme` is left on `<html>`. `yarn test` is not affected. Fix: an explicit "no stored choice" parameter (`storedTheme: null`) that clears the key and gets the same restore and cleanup. Owner: builder.

**S2. The verify chain stopped at step 3, so "the apps still build" has no recorded run.** `evidence/C2.log:9-10` against `as-built.md:6`. `yarn verify` stopped at `check-settings`; nothing recorded shows `lint`, `lint:boundaries`, `check-types`, `check-ui-layout`, `check-client-bundle` or either app's `build` running on this code, which is what would catch a broken app after the base layer moved. Fix: re-record C2 once `.claude/settings.json` is fixed. Owner: builder (re-run), Taylor (settings line).

**S3. The objective says "branded", but only the font is.** `main.ts:25`; there is no `manager.ts`. `/brand/` is served but nothing uses it; `button-dark.png` shows the default Storybook logo and title. Fix: a `manager.ts` with a `storybook/theming` theme, `brandTitle` from `brand.ts` and `brandImage: "/brand/logo.svg"`. Owner: builder.

**S4. Nothing stops `preview.css` drifting from the app's CSS, which is the risk the contract names.** `preview.css:1-4` is a hand copy; nothing checks "line for line". Fix: a small `tooling/` check comparing the import lines of the two files (`tooling/` may read both; `@pem/ui` must not read an app). Owner: builder.

**S5. `results.json` shows C3 and C4 as PASS, which overstates what was proven.** C3 is a `capture`, and `.claude/rules/testing.md` says every capture is UNVERIFIED until P-C, but the as-built does not list it. C4 is `manual` ("timed by a person") and was timed by an agent script at `e0854e1`, before `fe9a66a` changed the preview. Fix: add C3 to Not verified; a person times C4 at the current head. Owner: builder, then a person.

**S6. The theme toggle has no story for its "nothing selected yet" state.** `theme-toggle.tsx:20-30, 42, 75`. Before hydration no option is checked and the first option is the tab stop; every server-rendered visitor sees it. Fix: an `Unresolved` story without `ThemeProvider`, with a `play` asserting nothing is checked and Light is the tab stop. Owner: builder.

### Nit

- **N1.** Hover is shown for the default variant only (`button.stories.tsx:30`); outline and ghost change to `hover:bg-accent`, ghost's only affordance.
- **N2.** The "has a story" regex (`story-coverage.ts:15`) needs a type annotation, so an unannotated or CSF-factory story fails as "exports no story"; a story inside a `/* */` block still matches.
- **N3.** A story can set `parameters.a11y.test: "off"` or `"todo"` and skip axe while still passing (`preview.tsx:65`).
- **N4.** No fixture for a provider folder without a story, or a story file that exports no story (`story-coverage.test.ts:21-28`).
- **N5.** `VITEST_STORYBOOK: "false"` reads as switching the check off; it is the addon's standalone-run flag that makes violations throw (`vitest.config.ts:7-9, 18`).
- **N6.** The pre-paint decorator reads `globals.theme` but not `parameters.themes.themeOverride` (`preview.tsx:26-29`).
- **N7.** The Keyboard story asserts focus after `{End}` but not selection; wrap-around and `{Home}` are not exercised (`theme-toggle.stories.tsx:77-80`).
- **N8.** `tech-stack.md`: `last_reviewed` still 2026-10-01; the Next.js row says exact for "apps" but `@pem/ui` now has `next@16.3.8`; the "Tests" row under Deliberately absent is partly untrue now that Vitest ships in `@pem/ui`.
- **N9.** `storyCoverage` is not verb-first (`.claude/rules/ts.md`); for example `findStoryCoverageProblems`.

## Conversations (not defects)

- **Contrast is not checked in verify for component compositions.** `contrast-audit` covers the preset's token pairs, but combinations inside a component (`text-muted-foreground` on `bg-background`, `hover:bg-primary/90`, dark mode in general, since stories run light-only in `yarn test`) are proven only by the builder's one-off Chromium run. Is "move to browser mode" a ticket with a date, or does it stay open?
- **Two existing gaps in the dependency rules (not this ticket's).** `.claude/rules/deps.md` says "pin exactly" and cites an age gate in `.yarnrc.yml`; `tech-stack.md:48` allows caret ranges and `.yarnrc.yml` has only `nodeLinker`. Storybook 10.6.1 was 5 days old when added, and no gate checked that.

## Runtime checklist (highest risk first)

1. After the `.claude/settings.json` fix, run `yarn verify` in full, then load `yarn web:dev` and `yarn docs:dev` in light and dark and confirm background, text and border colours look as before the move.
2. Workshop: click "Dark" in Theme toggle/System, then open Providers/Theme/System; expect the S1 failure today and a pass once fixed. Reload to confirm nothing persists.
3. A person runs `yarn ui:storybook` on a warm cache at the current head and times it against the 60 s limit.
4. Workshop, toolbar on dark: step through every Button story; the Accessibility panel shows 0 violations and Focus shows the ring.
5. Optional: delete `button.stories.tsx` locally and confirm `yarn test` fails, naming `packages/ui/src/primitives/control/button`.

## Assumptions

- No command was run; every "verified" means verified by reading the code and the recorded evidence.
- "A story per state" is judged against the states the component code actually styles or branches on.
