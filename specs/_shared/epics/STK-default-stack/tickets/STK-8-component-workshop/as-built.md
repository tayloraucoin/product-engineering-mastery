# As-built — STK-8

## Shipped against the contract

- C1: `packages/ui/.storybook/stories.test.ts` composes every `src/**/*.stories.tsx` (portable stories, `@storybook/nextjs-vite`) and runs each one in Vitest on jsdom: render, then its `play` interactions, then the a11y addon's own axe pass (`a11y.test: "error"`), so the workshop and `yarn test` use one rule set. A fixture story with an unnamed button must fail (`button-name`), which proves the axe pass really fails a story. There are 16 stories: button (Default, Outline, Ghost, Small, Large, Hover, Focus, Disabled), theme toggle (System, Light, Dark, Keyboard, Click) and theme provider (System, Light, Dark). `yarn test` PASS.
- C2: every step of `yarn verify` except `check-settings` passes with the story checks in it. `check-settings` fails on `.claude/settings.json`, which STK-10's template change (58af6ef) now requires to ask before `db:local:reset`. That file is write-protected for agents and is not this ticket's, so C2 stays FAIL until it is updated (see Next).
- C3: `evidence/button-dark.png` shows the workshop at 1440×900 with Button / Default in dark mode from the toolbar: the brand font, the dark `--primary`, and the Accessibility panel at 0 violations.
- C4: `evidence/C4-warm-start.log`: `yarn ui:storybook --ci` answered on `localhost:6006` after 2.5 s, warm (Storybook reports manager 143 ms, preview 214 ms).
- C5: `.storybook/story-coverage.ts` requires `<name>.stories.tsx` beside each primitive and composed component, and a `*.stories.tsx` in each provider folder. Each story file needs at least one story and a title in the grammar `<Group>/<Kind>/<Name>` (`Primitives/Control/Button`, `Composed/Control/Theme toggle`) or `Providers/<Name>`. `story-coverage.test.ts` passes on the package. On `.storybook/fixtures/uncovered` it fails `orphan`, naming its folder and the missing file, and fails a misnamed title. `yarn test` PASS.
- Non-negotiables. The workshop lives in `packages/ui/.storybook/`; `yarn ui:storybook` runs `storybook dev --port 6006`. Versions verified on the registry on 2026-10-04: `storybook`, `@storybook/nextjs-vite`, `@storybook/addon-a11y`, `@storybook/addon-themes` and `storybook-addon-pseudo-states` at 10.6.1 (published 2026-09-29); `vitest` 5.0.3, `jsdom` 30.1.1, `vite` 8.3.2, `@tailwindcss/vite` 4.3.3. `preview.css` is the app's CSS chain, line for line. The `.dark` class comes from the toolbar (addon-themes, class on `<html>`). The font is `@pem/brand/font` (`next/font/local` through the framework's Vite plugin), and `@pem/brand/assets` is served at `/brand/`, never from an app's `public/`.

## Deviations

- **devs_call, settled: addons and title grammar.** The addons are `a11y`, `themes` and `pseudo-states` (Hover renders `:hover` without a pointer). Titles follow the folder: `<Group>/<Kind>/<Name>`, with the name in sentence case. The coverage check enforces the grammar.
- **[ASSUMPTION] The story checks run in jsdom, not in a browser.** `@storybook/addon-vitest` needs Vitest browser mode and a Playwright Chromium download in CI, and CI runs only `yarn verify`. jsdom runs every `play` function and axe's DOM rules, but not colour contrast. Contrast is held by `yarn contrast-audit` on the preset. On 2026-10-04 I also ran axe in Chromium over all 16 stories in light and dark: 0 violations. Moving to browser mode is a later call.
- **The base layer moved into `@pem/ui/styles/globals.css`** (`border-border`, and the body's background, foreground and antialiasing). Both apps' `globals.css` are now the three imports, so the workshop loads the same CSS as the app without importing an app (packages never import apps). The docs app keeps its typography plugin and prose rules.
- **A `ui-workshop` element in `packages/config/eslint/boundaries.js`** for `packages/ui/.storybook/**`, allowed `config`, `brand` and `ui`. The workshop may read `@pem/brand`; `@pem/ui`'s components still may not. Apps cannot import the workshop.
- **The theme class is set before paint.** The toolbar addon applies `.dark` in an effect after the first paint, so axe in the workshop scanned the button mid `transition-colors` and reported a false contrast failure. `withToolbarTheme` sets the class during render, as next-themes does in the app. A story whose `ThemeProvider` owns the class sets `themes: { disable: true }`. `parameters.storedTheme` seeds next-themes' storage before the story mounts and restores it afterwards.
- **jsdom stubs** in `vitest.setup.ts`: `matchMedia`, which next-themes reads and which answers "light", and `HTMLCanvasElement.getContext`, which axe probes.
- **Known console noise:** next-themes 0.4.6 logs React 19's "script tag while rendering" warning when it renders client-only, which happens in the workshop. The app server-renders it, so the app is unaffected.
- **Paths added before building:** `packages/ui/tsconfig.json` (types now cover `.storybook`), `packages/ui/src/styles/globals.css`, `packages/ui/AGENTS.md`, both apps' `globals.css`, `boundaries.js` and `yarn.lock`. `turbo.json` was planned but not needed. `.claude/launch.json` gained a `storybook` entry; it is local and not tracked.

## Not verified

- C4 was timed by the agent with a script that polled the port, not by a person. The criterion asks for a person.
- C2 cannot pass until `.claude/settings.json` asks before `db:local:reset`.
- The boundaries lint still ignores `@pem/*` subpath imports (STK-7's finding 4, its own task). So the new `ui-workshop` edge is declared, but the lint does not enforce it yet.

## Next

Taylor adds `"Bash(*db:local:reset*)"` to `permissions.ask` in `.claude/settings.json`, as in `docs/engineering/templates/settings.template.json`. Then `yarn contract:run STK-8` proves C2.
