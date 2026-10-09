---
id: DEMO-6
size: small
objective: "apps/web gets Playwright, Chromium only, with yarn web:e2e for journey specs and yarn web:capture, which screenshots every registered demo ?state= key at 390, 834 and 1440, light and dark, reduced motion, and fails on any key that does not render."
slice_type: "A new dev dependency and a test harness; the risk is a capture that silently skips a key, flashes the wrong theme, or a browser download dragged into yarn verify."
non_negotiables:
  - "@playwright/test is an apps/web devDependency at an exact pin at least 7 days old (npmMinimalAgeGate), Chromium only; tech-stack.md gains its row and yarn check-stack passes (R1)."
  - "Neither script joins yarn verify or turbo's default pipeline, so the fast path needs no browser."
  - "e2e and capture run against next build && next start, never next dev."
  - 'Capture walks DEMO_SURFACES from apps/web/lib/demo/states.ts, never its own list; each key at 390, 834 and 1440, light and dark, with reducedMotion "reduce", the theme storage key set before navigation and fonts awaited.'
  - "A key whose page is not 200 or whose root lacks data-demo-state equal to the key fails the run with the surface and key named; nothing is skipped."
  - "Output goes to a git-ignored apps/web/.captures/<surface>/<key>-<width>[-dark].png; the critic and CI call this script and never reimplement it."
devs_call: "Config layout, the reporter, a --surface filter, and how the server is started and awaited."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-15"
  - "D-DEMO-16"
truth_files: "none: test tooling changes no living UX file"
qa: Q2
reviewers:
  - vigil
focus:
  - "The capture loop: every DEMO_SURFACES key at three widths and two themes, and a missing or broken key fails, never skips (vigil, Q2)"
operator_review: false
planned_paths:
  - "apps/web/package.json"
  - "apps/web/playwright.config.ts"
  - "apps/web/e2e/**"
  - "apps/web/.gitignore"
  - "package.json"
  - "yarn.lock"
  - "docs/engineering/tech-stack.md"
depends_on:
  - DEMO-1
out_of_scope:
  - "Each surface's journey specs: that surface's ticket writes apps/web/e2e/demo/<surface>.spec.ts."
  - "The critic and its CI job: DEMO-13 and DEMO-16."
criteria:
  - id: C1
    statement: "The new dependency is in the stack table at its exact pin and the stack check passes."
    evidence: check
    command: "yarn check-stack"
  - id: C2
    statement: "yarn web:e2e runs a smoke spec against home on a production build and reports it passed."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-006-capture-harness/evidence/e2e-smoke.txt"
  - id: C3
    statement: "With a registered key whose route is missing, yarn web:capture exits non-zero and names the surface and key."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-006-capture-harness/evidence/capture-fails-missing.txt"
  - id: C4
    statement: "On a rendered key, capture writes six files (three widths, two themes) whose dark files are dark from the first paint."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-006-capture-harness/evidence/capture-six.png"
  - id: C5
    statement: "The capture helpers (file naming, the key walk, the render check) have unit tests that pass."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — DEMO-6 capture-harness

## Build notes

- **Approach:** Add `@playwright/test` to `apps/web` devDependencies, `playwright.config.ts` with one Chromium project and a `webServer` that builds and starts the app, `e2e/smoke.spec.ts` on home, and `e2e/capture.ts` that imports `DEMO_SURFACES`. Root scripts `web:e2e` and `web:capture` call workspace scripts `e2e` and `capture`. Pure helpers (naming, key walk, render check) live in `e2e/lib/` with `node:test` files under a glob `apps/web`'s `test` script already picks up, or widen that glob.
- **Decisions that apply:**
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - R1 (technical.md, ratified by Taylor at the Tickets gate, 2026-10-08): `@playwright/test`, Chromium only, an exact pin at least 7 days old; an `apps/web` devDependency for the e2e criteria, the capture harness and critic CI; stays out of `yarn verify`.
- **Interfaces:** `yarn web:e2e [spec]`, `yarn web:capture [--surface <id>]`; the render contract every surface follows: the page's root element carries `data-demo-state="<key>"`, or `"populated"` with no key.
- **Per path:** `package.json` (both) scripts and the pin; `playwright.config.ts`; `e2e/**` smoke, capture, helpers and tests; `.gitignore` `.captures/`, `test-results/`, `playwright-report/`; `yarn.lock`; `tech-stack.md` the row.
- **Gotchas:**
  - Chromium's download needs the network: ask for the host when the sandbox refuses it; never route around the prompt.
  - Set the theme storage key `next-themes` reads before the first navigation, so a dark capture never flashes light.
  - From `md` up the 1440 layout applies, so 834 takes it.
  - C3 uses a throwaway key registered only inside the test run, never committed to the registry.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to wrap each capture in try/catch and carry on, which is exactly the critic passing a state it never captured.
