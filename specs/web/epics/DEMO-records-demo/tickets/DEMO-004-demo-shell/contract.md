---
id: DEMO-4
size: small
objective: "A visitor reaches /demo from one home link, is sent to onboarding or the records, and every shell route sits in the demo's own top-bar shell with its store and toasts mounted."
slice_type: "Routing, layout and shared chrome; the risk is a redirect that flashes or loops, a store that resets on client navigation, or two theme toggles on one page."
non_negotiables:
  - "/demo renders nothing: a Server Component reads the prefs cookie and redirect()s to /demo/welcome until onboarded, else /demo/records."
  - "app/demo/layout.tsx carries the data-demo marker, the store provider and the kit ToastProvider; writes survive client navigation inside /demo and a reload resets them (D-DEMO-7)."
  - 'The shell is a 56px top bar per overview.md: "Records demo" (not a link), nav "Records" and "Settings" named "Demo" with aria-current="page" and the --color-muted pill, Skip to content first, main as content.'
  - 'At 1440 "Back to PEM" and the composed theme-toggle sit right; at 390 the toggle follows the nav and "Back to PEM" is an underlined foot link at the end of main in every state.'
  - "Home gets one text link to /demo; STK-18's ?state=error throw on home is untouched."
  - "The floating theme toggle hides on [data-demo] and nowhere else."
devs_call: "The shell's internal component split, the store hook names beyond those listed, and the placeholder each shell route shows until its surface ticket lands."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-2"
  - "D-DEMO-3"
  - "D-DEMO-5"
  - "D-DEMO-15"
  - "D-DEMO-16"
truth_files: "none: the approved proposal ux/demo/overview.md reaches specs/web/ux/demo/overview.md through yarn truth:promote DEMO once its citing tickets close"
qa: Q2
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/page.tsx"
  - "apps/web/app/demo/page.tsx"
  - "apps/web/app/demo/layout.tsx"
  - "apps/web/app/demo/_components/demo-store.tsx"
  - "apps/web/app/demo/_lib/entry.ts"
  - "apps/web/app/demo/_lib/entry.test.ts"
  - "apps/web/app/demo/(shell)/layout.tsx"
  - "apps/web/app/demo/(shell)/_components/demo-shell.tsx"
  - "apps/web/app/demo/(shell)/_components/demo-nav.tsx"
  - "apps/web/components/shell/floating-theme-toggle.tsx"
depends_on:
  - DEMO-1
out_of_scope:
  - "Every surface's content and keys: DEMO-7 to DEMO-12. Status badge, Diff and confirm dialog: DEMO-5."
  - "Proving the redirect end to end in a browser: DEMO-7's C-DEMO-onboarding-1."
criteria:
  - id: C1
    statement: "demoEntryPath returns /demo/welcome for a missing, invalid or not-onboarded cookie and /demo/records once onboarded."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "The shell renders at 390 and 1440, light and dark, with Records current, Skip to content first, and the 390 foot link at the end of main."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-004-demo-shell/evidence/shell.png"
  - id: C3
    statement: "Home shows one text link to /demo, and the floating theme toggle shows on home and is hidden on every /demo route."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-004-demo-shell/evidence/home-link.png"
  - id: C4
    statement: "A store write made on one shell route is still there after client navigation to the other, and gone after a reload."
    evidence: capture
    path: "specs/web/epics/DEMO-records-demo/tickets/DEMO-004-demo-shell/evidence/store-survives.txt"
  - id: C5
    statement: "With keyboard alone at 390, Skip to content, the nav, the theme toggle and Back to PEM are reached in order with visible focus."
    evidence: manual
    reason: "Keyboard order and focus visibility are judged by a person at Seen; the builder checks the DOM order first."
---

# Contract — DEMO-4 demo-shell

## Build notes

- **Approach:** Routes and chrome from `technical/placement.md`. The redirect decision is a pure `demoEntryPath(prefs)` in `_lib/entry.ts` so it is unit-tested; `app/demo/page.tsx` reads the cookie, parses with DEMO-1's codec and calls it. `demo-store.tsx` (`"use client"`) holds DEMO-1's reducer in `useReducer`. The `(shell)` group keeps onboarding outside the shell.
- **Decisions that apply:**
  - D-DEMO-2: "Every route under `/demo`; home gets one text link."
  - D-DEMO-3: "Onboarding completion is remembered client-side; no account."
  - D-DEMO-5: "The demo has its own shell, not the admin sidebar."
  - D-DEMO-15: "One state keeps the same content and words at every width; where the captures differ, the 1440 wording and the same fixture rows win. Width changes layout only."
  - D-DEMO-16: "The build fixes capture drift; the canvas stays locked: skeletons copy each width's final layout, static labels as text; rows grow with wrapped text; a disabled control dims its label and helper; a pending button keeps its width; dark spacing and scrim match light; the 390 foot link is in every state; raw widths become tokens."
  - D-DEMO-26, D-DEMO-28 (technical.md): all of it in `apps/web` under `app/demo/`; prefs in one first-party cookie the client writes, read on the server so `/demo` redirects without a flash; theme stays with the kit's `next-themes`.
- **Interfaces:** `DemoStoreProvider`, `useDemoStore()` (state and dispatch), `useDemoRecord(id)`; `demoEntryPath(prefs)`.
- **Per path:** `page.tsx` (home) one link; `demo/page.tsx` redirect; `demo/layout.tsx` marker, provider, `ToastProvider`; `(shell)/layout.tsx` and `demo-shell.tsx` the bar and `main`; `demo-nav.tsx` the `"use client"` leaf for `aria-current`; `floating-theme-toggle.tsx` adds `[body:has([data-demo])_&]:hidden` beside the two existing guards.
- **Gotchas:**
  - Design: Paper `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`; the shell appears in every surface's captures under `specs/web/epics/DEMO-records-demo/ux/demo/captures/`. Never edit the canvas.
  - Side padding is `--spacing-8` at 1440 and `--spacing-4` at 390; from `md` up the 1440 layout applies, so 834 takes it.
  - Server and client render the same: no `Date.now()` or random values in render.
  - C4 is recorded from a short browser run: write on records, navigate to settings, read it back, reload.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to redirect on the client after a flash, or to mount the provider per route so writes vanish on navigation.
