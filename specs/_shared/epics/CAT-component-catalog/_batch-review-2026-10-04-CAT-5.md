# Tier 1 batch review: CAT-5, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5). It was given the contract, the cited `technical.md`, `component-sources.md`, ledger section 11, the canon, the kind README, the previous batch review, `results.json`, the evidence folder, the as-built and the list of changed files; never the builder's summary. The reply is saved here as received, with only its layout reformatted; what was done about each finding is under "Disposition" at the end.

---

## Tier 1 review — CAT-5 (wave0-control)

**Verdict: Blocked** — five Blocking findings: three are contrast regressions computed with `tooling/contrast-audit.ts`'s own encoded-sRGB compositing, one is the Toggle's pressed state, one is missing focus/invalid/open stories. The rest of the build is careful: the kit path is followed, every Build-notes gotcha is handled, no translucent label, no token waiver, input-otp wired correctly.

Method: verification plan written from the contract and the cited law before reading code. Read-only: nothing was run and no git diffs were taken; C2's jsdom/axe run computes no colour, so every contrast figure below is a computation, not a measurement — the runtime checks at the end confirm them.

### Blocking

**B1 — Focus no longer changes the border of any field-like control (WCAG 1.4.11, canon C-P07). Caused by this ticket.** `packages/config/tailwind/preset.css:67,75` (light) and `:112,120` (dark): `--input` moved onto the same step as `--ring` (neutral-400 light, neutral-500 dark; C5 log shows identical ratios, 3.30/3.30 and 3.99/3.99). `focus-visible:border-ring` is now a no-op on every `border-input` control; the only remaining indicator is `ring-ring/50`, which composites to ≈ **1.70:1** (light) and ≈ **1.82:1** (dark). Before CAT-5 the 200→400 border change was the indicator (the previous review recorded "the solid border-ring carries the indicator (3.3:1)"). Affected: `input.tsx:16`, `textarea.tsx:14`, `select.tsx:48`, `native-select.tsx:31`, `checkbox.tsx:17` and `radio-group.tsx:27` unchecked, `switch.tsx:23` unchecked (track is `bg-input`, same as `border-ring`), `input-otp.tsx:62` active slot, and the dark outline Button (`button.variants.ts:19`) used by apps/web and apps/docs. Already halo-only by design: `slider.tsx:54` (thumb focus identical to its hover) and `toggle.variants.ts:4` (default variant has no border width at all). The audit misses it because its "focus ring 3.30:1" pair (`contrast-audit.ts:174`) measures an opaque ring that is never drawn. Smallest fix: give `--ring` its own step — neutral-700 light (≈ 10.4:1 page, 3.15:1 vs `--input`), neutral-300 dark (≈ 13.4:1 page, 3.34:1 vs `--input`) — add a `--ring` on `--input` 3:1 pair so the change of state is audited, and give the slider thumb and default toggle an opaque indicator (tabs already have `focus-visible:outline-1 focus-visible:outline-ring`). Owner: design (with the builder).

**B2 — Placeholder text fails AA in dark on the tinted field fill (WCAG 1.4.3, A-11). Also a regression from this ticket's `--input` change.** `dark:bg-input/30` now tints neutral-500 instead of neutral-800, so `placeholder:text-muted-foreground` (neutral-400) on it computes to **4.43:1** on the page, ≈ **3.90:1** inside a card or dialog (neutral-900), and **3.29:1** on the hovered select/native-select (`dark:hover:bg-input/50`); before CAT-5 it was ≈ 5.66:1. `input.tsx:16`, `textarea.tsx:14`, `select.tsx:48` (`data-placeholder:` — the trigger's only visible prompt). Smallest fix: tint a dark role, not the boundary — `dark:bg-input/30` → `dark:bg-muted/50` (≈ 5.4:1 page, 5.0:1 on a card), `dark:hover:bg-input/50` → `dark:hover:bg-muted` (the audited muted pair, 4.58:1); add the tinted pair to PAIRS. Owner: design.

**B3 — Dark switch track is below 3:1 (non-negotiable 3).** `switch.tsx:23` `dark:data-unchecked:bg-input/80` puts the unchecked track at ≈ **2.94:1** on the background; the switch has no solid border (`border-transparent`), so the track is its boundary. The new audit pair, whose comment names "a checkbox, radio or switch", never sees it because the track is translucent. Smallest fix: drop `dark:data-unchecked:bg-input/80` — the solid `--input` gives 3.99:1, and the unchecked thumb (`bg-foreground`) on it stays ≈ 4.75:1.

**B4 — The Toggle's pressed state is not perceivable (WCAG 1.4.11 for states, canon C-P07).** `toggle.variants.ts:4`: `aria-pressed:bg-muted` is the only on-state cue — **1.11:1** against the page in light, **1.31:1** in dark — and it is identical to `hover:bg-muted`, so on, off+hovered and on+hovered all look the same, with no marker. This is canon C-P07's counter-example, and the same class of defect as the previous review's B4: a kit primitive every product inherits. Smallest fix: a pressed fill at ≥ 3:1 — the preset has no selection role, so `aria-pressed:bg-primary aria-pressed:text-primary-foreground` for now, or propose a `--selected` role; add an audit pair either way. Owner: design.

**B5 — Non-negotiable 6 (stories for default, focused, disabled, invalid, and checked/selected/open) is unmet on six of eleven controls.** Missing: Radio group — Focus, Invalid; Select — Focus, Open (a resting `defaultOpen` story; `Choose` opens the list only in passing); Native select — Focus; Slider — Focus; Toggle — Focus, Invalid (it has `aria-invalid` styles); Input otp — Focus (the active slot). These are exactly the stories in which B1 would have been visible. Smallest fix: one-line stories (`play: userEvent.tab()` plus `toHaveFocus` for each Focus).

### Should-fix

- **S1 — Implicit motion durations (C-P11, CS-12, A-15).** `transition-[color,box-shadow]`, `transition-all` and `transition-transform` with no duration fall back to Tailwind's 150 ms in input, textarea, select, native select, switch, slider, toggle, tabs and otp, and the keyboard focus ring fades in over 150 ms (A-15). The as-built logs it as a deviation, but a ticket cannot waive the canon. Smallest fix: in the preset's `@theme`, `--default-transition-duration: var(--motion-duration-fast)` and `--default-transition-timing-function: var(--motion-ease-out)`, plus `focus-visible:transition-none` in the shared focus classes.
- **S2 — Slider thumbs get no `index`.** `slider.tsx:50-53`: Base UI computes `index = indexProp ?? compositeIndex` (`SliderThumb.js:153`), so before the list registers a range slider calls `getAriaLabel(-1)` — with the story's function both thumbs are named "Maximum price" in SSR or first-paint markup. Fix: `index={index}` on each `Thumb`. Otherwise the prop is sound: Base UI 1.8.0 has the same signature (`SliderThumb.d.ts:29`), it is applied per input, and it rightly drops the Field label id when set.
- **S3 — The slider's unfilled track is ≈ 1.11:1 (light) and 1.31:1 (dark)** (`slider.tsx:42`, `bg-muted`): at a low value the extent of the range cannot be seen. Judgment under 1.4.11. Fix: `bg-input` (3.30 and 3.99, audited).
- **S4 — The OTP invalid state is visual only.** The story puts `aria-invalid` on the decorative slot `div`s (`input-otp.stories.tsx:37,43`); the real textbox is never marked invalid, so a screen reader never hears it. Fix: `<InputOTP aria-invalid={invalid} …>` in the story render, plus an assertion.
- **S5 — Most stories only render.** Only 16 of the 64 new stories have a `play`. No keyboard path is tested for the select (open, arrows, Escape returning focus), the radio group (arrows) or the slider (arrows, Home/End); the tabs' ArrowRight-then-Enter is tested and holds. The `Range` slider story asserts nothing, and with `thumbAlignment="edge"` the thumbs stay `visibility:hidden` in jsdom (`SliderThumb.js:236`), so axe never inspects them — the as-built's "one or two named slider thumbs" is half proven. No Invalid story asserts `aria-invalid` is exposed. Fix: a play per keyboard path; `getByLabelText("Minimum price")` and `("Maximum price")` in `Range`.

### Consider

- `tooling/contrast-audit.ts:10-11` still says "Borders are decorative here and are not audited"; `contrast-audit.test.ts` has no failing case for a `--input` below 3:1; `--input` on `--muted` (light, 3.02) and on `--card` (dark, 3.62) pass but are unaudited, though forms live in cards.
- The default tabs variant's active pill is 1.11:1 on the list in light; the label darkening carries the state; the line variant's underline is the stronger marker.
- input-otp spreads `defaultValue` onto a controlled input, so `Filled` and `Invalid` emit React's both-value-and-defaultValue warning (C2.log:299-301).
- `getAriaLabel` is a function prop, so a Server Component cannot name a slider; Base UI's Thumb also takes a plain `aria-label`, and `Slider.Label` exists — a string-array prop would be server-safe.
- Every field story uses placeholder plus `aria-label` with no visible label, which models A-16 in the workshop people copy from; a Labelled story per field, or deferring to Field in CAT-9, would stop that.
- Counts: the as-built's "66 new stories" is 64 control stories plus the 2 Button stories from the batch fix; `results.json` records `tests: 128` while vitest counted 104 (the known parser defect, already raised).

### Verified in code

Non-negotiable 1 (`.yarnrc.yml:4` `npmMinimalAgeGate: 7d`); non-negotiable 2 across all eleven (`cn` from `lib/cn`; no `cn-*`, eslint-disable, raw shadow or `duration-N`; every gotcha handled — Canvas to the popover roles, `bg-white` to `bg-background`, `cn-input-otp` and `duration-1000` gone, the switch on spacing steps; each `cva()` in its `.variants.ts`; all eleven `exports` entries and the README); non-negotiable 4 (no `text-*/N` in `primitives/control`; inactive tabs on `text-muted-foreground` in both themes); non-negotiable 5 (input-otp pinned exactly at 1.5.0, its tech-stack row at `tech-stack.md:41`, `toolkit.json:232`, `yarn.lock:6397`; its peers allow React 19). No accessible name missing or doubled: the radio is named by its wrapping label; a single `getByRole` match for checkbox and switch proves the hidden input is not exposed; Toggle `WithText` is named by its content. C1 to C7 evidence is consistent with the code, and C2 really ran the ui tests rather than replaying the turbo cache. Not verifiable here: Yarn 4.13's parsing of `7d`, input-otp 1.5.0's publish date (offline), and whether `yarn.lock` changed anything besides input-otp (no git diff).

### Conversations

- With the gate never skipped, a security patch younger than a week cannot be installed. Should `deps.md` name the escape hatch (`npmPreapprovedPackages` for one named package, recorded with a ledger line), so the gate is never quietly disabled under incident pressure?

### Runtime checks (highest risk first)

1. Tab through every control in the workshop, light and dark: is focus distinguishable from rest? (B1 computes 1.70 and 1.82.)
2. Dark, Input and Textarea `Empty`, Select `Placeholder` at rest and hovered, on the page and in a card: placeholder at 4.5 or above. (B2: 4.43, 3.90, 3.29.)
3. Dark Switch `Off`: track at 3:1 or better against the page. (B3: 2.94.)
4. Toggle Off against Pressed against hovered, both themes. (B4.)
5. Keyboard paths: Select (Enter, arrows, typeahead, Escape returning focus); Radio (arrows); Slider (arrows, Home, End, PageUp); Tabs (does ArrowRight skip the disabled Billing tab?).
6. Screen reader: the Select announces "Produce" and the chosen value; the OTP's invalid state is announced; a server-rendered range slider names "Minimum price" and "Maximum price".
7. `git show b6a1d67 -- yarn.lock` shows only the input-otp lines; `yarn config get npmMinimalAgeGate` prints 10080.

### Per ticket

CAT-5: Blocked — B1 (focus border unchanged: `--input` equals `--ring`), B2 (dark placeholder 4.43, 3.90, 3.29:1), B3 (dark switch track 2.94:1), B4 (Toggle pressed state 1.11:1, same as hover), B5 (Focus, Invalid and Open stories missing on six controls).

---

## Disposition

Every Blocking item is fixed; CAT-5 re-proves after the fix commit.

- **B1 fixed.** `--ring` has its own step, neutral-700 in light and neutral-300 in dark; contrast-audit adds `--ring` on `--input` at 3:1, so a focused boundary must differ from a resting one (3.15:1 light, 3.34:1 dark). The slider thumb shows a solid `outline-ring` on focus, and the toggle adds one beside its ring.
- **B2 fixed.** Dark field fills moved from `dark:bg-input/30` and `dark:hover:bg-input/50` to `dark:bg-muted/50` and `dark:hover:bg-muted` in input, textarea, select, native select, checkbox, radio and the one-time code; contrast-audit adds the placeholder on `--muted/50` pair (5.38:1).
- **B3 fixed.** `dark:data-unchecked:bg-input/80` removed; the solid `--input` track is 3.99:1.
- **B4 fixed.** A pressed toggle fills with `--primary` and its label with `--primary-foreground`, also when hovered; contrast-audit adds the fill against the page (17.91:1 light, 15.72:1 dark).
- **B5 fixed.** Focus stories for the radio group (with an ArrowDown that moves the choice), select, native select, slider, toggle and one-time code; Invalid stories for the radio group and toggle; an Open story for the select. The slider's arrow-key path stops at focus in jsdom, which rejects the KeyboardEvent Base UI builds; it stays a runtime check.
- **S1 fixed.** The preset's `@theme` sets `--default-transition-duration` to `--motion-duration-fast` and the timing to `--motion-ease-hover` (tk-motion's curve for hover colour changes, rather than ease-out); `focus-visible:transition-none` on every control's focus classes.
- **S2 fixed.** `index={index}` on each slider thumb.
- **S3 fixed.** The slider track is on `bg-input` (3.30:1 light, 3.99:1 dark).
- **S4 fixed.** `aria-invalid` is on the real input-otp input, asserted in its Invalid story.
- **S5 in part.** Select Keyboard story (Enter opens, Escape closes and returns focus); radio arrows (in its Focus story); `Range` asserts both thumb names and values; input and textarea Invalid stories assert `aria-invalid`.
- **New, from the fixes:** axe's `aria-hidden-focus` rule now skips Base UI's focus guards (`[data-base-ui-focus-guard]`), which are aria-hidden and focusable by design; it still runs on every other aria-hidden element (`preview.tsx`).
- **Consider, taken:** the audit's header names `--input` as audited; input-otp's Filled and Invalid type their value instead of passing `defaultValue` to a controlled input.
- **Consider, left:** a failing audit test for a low `--input`; `--input` on `--muted` and `--card` pairs; the tabs' default-variant pill; a server-safe slider label; Labelled field stories (CAT-9's Field).
- **Conversation, raised to Taylor:** an escape hatch for the age gate (`npmPreapprovedPackages`, one package at a time, with a ledger line).
