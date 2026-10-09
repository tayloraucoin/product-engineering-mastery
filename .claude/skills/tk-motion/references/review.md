# Motion review: M1 to M12 (canon C-R12)

The critic (`tk-ui-critic`) calls this as one rubric line, C-R12. Report one line per check. Evidence rules: every finding cites a screenshot or recording region or a `file:line`, and anything that cannot be observed statically (timing, easing) is checked in code and marked UNVERIFIED-IN-RENDER if not recorded.

## Checks (each is PASS / an issue with a region / N/A)

| # | Check | How to verify | Severity if it fails |
|---|---|---|---|
| M1 | Every animation has a job (feedback, state, spatial, continuity) | Read the PR's motion lines (SKILL.md output format); flag any animation with no line | Should-fix |
| M2 | Nothing animates on keyboard-initiated actions | Grep for transitions not gated on `[data-input="keyboard"]` in palette, row navigation, tabs, and dialogs opened by shortcut; run Playwright keyboard traversal with trace | Blocking |
| M3 | Data does not move: no count-up, no row animation on sort/filter, no tweened live values | Grep for `animate` or `transition` on table rows and number components; watch a sort in a recording | Blocking |
| M4 | High-stress paths are still: no shake, pulse, flash, bounce, or scale on error or destructive UI | Grep for `shake`, `pulse`, `bounce`, `animate-ping`, and keyframes on error components; screenshot the error state | Blocking |
| M5 | Only tokens: no raw `ms`, `cubic-bezier`, or spring numbers outside tokens | Grep `\d+ms`, `cubic-bezier\(`, `stiffness`, `bounce:` in `.tsx`/`.css`, excluding the tokens file | Should-fix |
| M6 | No `ease-in`; no bounce or elastic; no spring with `bounce` above 0 | Grep `ease-in[^-]`, `bounce: 0\.[1-9]`, `elastic` | Should-fix |
| M7 | Transform and opacity only; blur 2px or less; no `backdrop-filter` or layout-property transitions | Grep `transition.*(width|height|top|left|margin|padding)`, `backdrop-filter`, `blur\((?:[3-9]|\d{2,})px` | Should-fix |
| M8 | Durations: 300ms or less for UI (except the Vaul sheet); exits at about ×0.8 of enters | Read the tokens used against values.md | Should-fix |
| M9 | Popovers and menus scale from their trigger; entrance scale is 0.95, not 0 | Grep `transform-origin` on popover content; `scale(0)` | Consider |
| M10 | Reduced motion is designed: each animation has an equivalent, confirmations stay, drag still tracks | Emulate `prefers-reduced-motion: reduce` in Playwright; screenshot every state in states.md | Blocking if a confirmation disappears; otherwise Should-fix |
| M12 | Frequency: no motion on anything used tens or hundreds of times a day beyond the catalog treatment | Judgment against catalog.md; name the action and the estimated frequency | Consider |

## Output line for the ui-critic report

One line per check: `M<n>: PASS | <issue> (<file:line or screenshot region>) | N/A`, M1 to M12 in order, then the severity-ranked findings.
