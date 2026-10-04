# Tier 1 batch review: STK-2 and STK-6, 2026-10-03

The reply of one `vigil` subagent (claude-opus-5-5), given each ticket's contract, `results.json`, as-built and changed files. Saved as received; Prettier may have reformatted the markdown. What was done about each finding is under "Disposition" at the end.

---

I wrote the plan from each contract before reading any code. I read every file listed, each contract, each results.json and as-built, and the evidence logs and images. I ran nothing; the run results below are the recorded logs.

## STK-2 stack-manifest

**Criteria**

- **C1 holds.** The check is at `tooling/check-stack.ts:163-169`. Its message names the module and the file. The test is at `tooling/check-stack.test.ts:74-76`, with expected text in `tooling/fixtures/stack/c1-present-file-missing/case.json:4`. `runCase` also asserts the exact problem count (`check-stack.test.ts:66-71`), so an extra or missing problem fails the test. The log shows it passing (`evidence/C1.log:45`).
- **C2 holds.**
  - Leftover file: `check-stack.ts:175-177`.
  - `.env.example`, including commented lines and the `_LOCAL`/`_STAGING` forms: `check-stack.ts:74-83, 178-183`.
  - turbo.json `globalEnv`, `globalPassThroughEnv` and per-task `env`/`passThroughEnv`: `check-stack.ts:86-106, 184-190`.
  - Dependency in any of four dependency fields: `check-stack.ts:192-199`.
  - There are four fixtures, one per kind of leftover (`check-stack.test.ts:78-83`). A clean fixture with near-miss names passes (`:85-87`, `fixtures/stack/clean/env.example`).
- **C3 holds.** The check is at `tooling/lib/toolkit.ts:309-310`. Fixture: `fixtures/stack/c3-locked-removed/case.json:4`.
- **C4 holds.** Each missing field is named at `toolkit.ts:262-264`. `fixtures/stack/c4-missing-field/toolkit.json` has one module per missing field, and `case.json:4-9` expects all six messages.
- **C5 holds.** The check is at `toolkit.ts:327-328` and only runs for non-null paths (`:319`). Fixture: `fixtures/stack/c5-runbook-missing/case.json:4`.
- **C6 holds.** `results.json:70-81` records exit 0.
- **C7 holds.** `check-stack` is in `verify` at `package.json:13`. `evidence/C7.log:2` shows exit 0, and `:16` shows "check-stack — 4 module(s); nothing missing, nothing left behind."

**Non-negotiables**

1. **Met:** stack block in toolkit.json, read through toolkit.ts. The block is at `toolkit.json:170-213`. It is typed and validated at `toolkit.ts:53-54, 236, 247-332`. The repo run goes through `loadToolkit` (`check-stack.ts:232`). The `--root` fixture mode parses the file itself but validates it with `validateStack` from toolkit.ts (`check-stack.ts:221-227`).
2. **Met:** an entry carries all six fields. The field list is at `toolkit.ts:87-94`; a missing field is rejected at `:262-264`.
3. **Met:** fails on a present module's missing file and on a removed module's leftovers. Same lines as C1 and C2.
4. **Met:** a locked module cannot be marked removed. `toolkit.ts:309-310`.
5. **Met:** a locked module's runbook is null, and only non-null runbook paths are checked. `toolkit.ts:314-318` enforces null when locked; `:319-328` checks only non-null paths.
6. **Met:** verify runs check-stack. `package.json:13`.
7. **Met:** the manifest lists only modules that exist today. The template lists only `config` and `ui` (`docs/engineering/templates/toolkit.template.json:170-190`). The live `toolkit.json` also has `env` and `db` (`:179-212`). Both packages exist (`packages/env`, `packages/db`), and the `db` runbook exists at `docs/runbooks/remove-supabase-database.md`. That fits "later tickets add their own". I could not see the git history to confirm which ticket added which entry.

**Findings**

- **Should-fix:** the as-built contradicts the recorded results.
  - `as-built.md:18` and `:22` say "C7 is FAIL" and blame stale STK-1 proofs and the budget cap. `results.json:82-92` records C7 PASS at `a208417`.
  - `as-built.md:46` says review:mason, review:vigil and review:warden have not run. The contract is now tier 1 with `reviewers: []` (`contract.md:19, 63`).
  - `as-built.md:57` ("merge STK-1 and raise the evaluator-pass cap, then rerun C7") is overtaken by events.
  - An as-built becomes immutable at merge, so this would ship a permanent false record. Owner: the builder, before merge.
- **Note:** one turbo.json reports a variable only once. `turboEnvNames` stores variables in a `Map` keyed by name (`check-stack.ts:91`). If a removed variable sits in both `globalEnv` and a task's `env` of the same file, only the last location is reported. The check still fails correctly; the message names one location, not each.
- **Note:** dependencies hiding in `resolutions` or overrides are missed. `DEPENDENCY_FIELDS` (`check-stack.ts:37-42`) leaves out `resolutions`, `overrides` and `dependenciesMeta`, so a removed package pinned in root `resolutions` would pass. The contract's "in any package.json" arguably covers this. Worth a line in the removal runbooks.
- **Note:** the as-built's own gaps are noted honestly and outside the contract: wildcard turbo env entries (`as-built.md:47`) and `boundaries` names not checked against `boundaries.js` (`:48`).

VERDICT (STK-2): PASS

## STK-6 theme-switch

**Criteria**

- **C1 holds.** `evidence/C1.log:2` shows exit 0. `packages/config/eslint/tokens.js:35-36` adds the colour-function rule. A grep for `oklch(`, hex, `rgb(` and `hsl(` across `apps/**` and `packages/**` (css, ts, tsx, js) finds matches only in `packages/config/tailwind/preset.css:30-38`.
- **C2 holds.** `evidence/C2.log:2` shows exit 0, with turbo build tasks successful (`:460, :480, :541`). The provider is mounted at `apps/web/app/layout.tsx:18` and `apps/docs/app/layout.tsx:24`.
- **C3 holds.** `evidence/dark.png` shows the demo home dark, with "Dark" selected in the toggle.
- **C4 holds.** `evidence/light.png` shows the demo home light, with "Light" selected.
- **C5 holds as a manual record, not a runtime proof.** `evidence/C5.md:7-9` traces the mechanism: the CSS reads only the class (`preset.css:26, 58`), the next-themes script runs ahead of the content, and `suppressHydrationWarning` is set (`apps/web/app/layout.tsx:16`). `C5.md:15-16` shows that after a reload with dark stored and the system set to light, `<html>` has `dark`. `C5.md:22` and `as-built.md:21` both say nobody watched a throttled hard reload. Under `.claude/rules/testing.md`, a manual criterion is reported as not verified, and they report it that way.
- **C6 holds.** `evidence/toggle-states.png` shows Light, Dark and System, with the focus ring on "Dark". The code is at `packages/ui/src/theme-toggle/theme-toggle.tsx:78-106`, and the ring classes are at `:94` (`focus-visible:ring-2 focus-visible:ring-ring`).

**Non-negotiables**

1. **Met:** D-STK-17 was ratified before the ticket started. `technical.md:46` records D-STK-16 to D-STK-19 as ratified on 2026-10-03.
2. **Met:** the preset has three layers, with dark overrides under `.dark`. Raw scale at `preset.css:29-39`, semantic light at `:42-55`, semantic dark under `.dark` at `:58-70`, shadcn bridge at `:73-87`. The `prefers-color-scheme` block is gone (grep finds it only in a comment).
3. **Met, with an enforcement gap:** no hex or oklch literal outside preset.css, and the tokens lint passes. The grep is clean. The lint only covers class strings and inline styles in TS/TSX (`tokens.js:56-64, 79`), and per `tokens.js:11-12` it is not applied to `apps/docs`. See the Note below.
4. **Met:** next-themes unpatched, class strategy, system as an option, no flash on load.
   - Exact pin `next-themes: 0.4.6` at `packages/ui/package.json:32`; plain npm resolution at `yarn.lock:4940`, with no `patch:` entry.
   - Provider options: `attribute="class"`, `defaultTheme="system"`, `enableSystem` (`theme-provider.tsx:18-20`).
   - System is offered in the toggle (`themes.ts:2`).
   - No-flash rests on the C5 record above.
5. **Met:** the toggle is a @pem/ui component, and its stories are deferred to STK-8. Subpath export at `packages/ui/package.json:19-22`; `theme-toggle/index.ts:1`. The stories are deferred as the contract allows (`as-built.md:22`).
6. **Met in code; the docs app has no capture.** Both apps keep rendering with no visual regression beyond the dark class.
   - Each provider wraps the existing tree unchanged (`apps/docs/app/layout.tsx:24-33`).
   - `defaultTheme="system"` reproduces the old media-query behaviour, and `dark:prose-invert` (`apps/docs/app/[[...slug]]/page.tsx:32`) now follows the class through `preset.css:26`.
   - The web home captures show the same content in both themes. The docs app was not captured.

**Findings**

- **Should-fix:** the light-mode focus ring is under 3:1. Light `--ring` is `--neutral-400` = `oklch(0.708 0 0)`, about #a1a1a1 (`preset.css:34, 53`). The ring is drawn outside the button, against the white track (`theme-toggle.tsx:74, 94`), which works out to about 2.6:1. WCAG 1.4.11 asks 3:1 for a focus indicator, and canon line 100 says "Focus is always visible."
  - The only focus capture is in dark mode (`toggle-states.png`), where it is about 4.2:1.
  - The value appears to be shadcn's neutral default, which the contract says to keep (`contract.md:35`). The Button uses the same ring (`packages/ui/src/button/button.tsx:11`).
  - So this is not a defect of STK-6's diff, and I did not count it against C6. It needs routing. Suggested owner: STK-7, which re-sets the palette on these layers.
- **Note:** the tokens lint does not cover CSS files or `apps/docs`. `as-built.md:5` says the lint "rejects colour functions outside the preset", but it only inspects `className` and `cn`/`cva` literals in TS/TSX (`tokens.js:56-64`). A raw `oklch()` added to any `globals.css` would pass `yarn lint`. Today the non-negotiable holds by grep only, not by the check.
- **Note:** the STK-2 manifest does not list next-themes. STK-6 adds it to `@pem/ui` (`packages/ui/package.json:32`), but `toolkit.json:195-200` does not list it under the `ui` module. `ui` is locked, so nothing fails today. The manifest is drifting from what the module actually brings in.

**Runtime checklist for a human, in risk order**

1. On the demo home with theme set to dark and the OS set to light, do a hard reload with the network throttled to Slow 3G. Watch for any light frame.
2. In light mode, Tab to the toggle and confirm the focus ring is visible against the white track.
3. Open the docs app in light, dark and system and compare with main. Check the sidebar `bg-muted` and the prose inversion.
4. On the demo home at 390 px wide, confirm the fixed toggle (`apps/web/app/layout.tsx:19`) does not overlap page content.

VERDICT (STK-2): PASS
VERDICT (STK-6): PASS

---

## Disposition (builder, batch close)

- STK-2 as-built: corrected at batch close. C7, the reviews line and Next now match `results.json`, and the scratch-repo harness fix is named.
- STK-6 light-mode focus ring under 3:1: carried to Taylor in the closing report; not changed here, because the contract keeps the neutral palette and STK-7 re-sets it.
- STK-6 as-built: the tokens-lint line now says what the lint covers (TS/TSX class strings and inline styles).
- Notes (turbo duplicate locations, `resolutions`/`overrides`, `next-themes` missing from the `ui` manifest entry, tokens lint not reaching CSS): left as found; none fails a criterion.
