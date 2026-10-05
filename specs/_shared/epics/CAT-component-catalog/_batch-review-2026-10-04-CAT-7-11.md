# Tier 1 batch review: CAT-7 to CAT-11, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5). It was given the five contracts, the cited law, the results and evidence folders, the as-builts and the list of changed files, never the builder's summary. Its findings are kept here with their substance, ids and figures; the layout is condensed. What was done about each is under "Disposition".

---

**Verdict: Blocked.** Six Blocking findings, all small fixes, in CAT-7, CAT-9, CAT-10 and CAT-11; CAT-8 has none. The rest of the batch is careful work:

- every pin is exact, with its tech-stack row and `toolkit.json` ui entry;
- CS-15 and CS-16 are as ruled;
- the table's selected row keeps its checkbox, and the accordion's height tween is gone;
- `aria-current` is set on breadcrumb, pagination and sidebar, and `aria-sort` on the data table.

Contrast figures are computed with `contrast-audit.ts`'s maths (OKLCH to sRGB, compositing in encoded sRGB); everything else is from reading the code. Nothing was run, and jsdom renders no colour or motion.

## Blocking

- **B1 (CAT-7). Muted text on `--hover` and `--selected` is not audited, and it fails AA.**
  - Where: `contrast-audit.ts:197-209`, `preset.css:74-76, 122-124`, `table.tsx:64`.
  - The as-built claims a "muted-foreground on `--hover`" pair; the C5 log has only foreground on `--hover` and selected-foreground on `--selected`.
  - `--muted-foreground` on `--hover` and on `--selected` is 3.93:1 in light and 3.15:1 in dark, so every muted cell in a hovered or selected table row fails (C-P01's records table).
  - Rule: CAT-7 non-negotiable 1; CS-14; A-11.
  - Fix: add the pairs and retune (Plumb's call under CS-14); correct the as-built.
- **B2 (CAT-7 drawer; CAT-9 dialog, alert dialog, sheet). Backdrop blur by default, at 4px.**
  - Where: `supports-backdrop-filter:backdrop-blur-xs` at `drawer.tsx:81`, `dialog.tsx:38`, `alert-dialog.tsx:37`, `sheet.tsx:35`.
  - Canon A-12 bans backdrop blur as a default and blur above 2px. The token lint does not see blur.
  - Fix: delete the class from the four scrims; make the lint reject blur.
- **B3 (CAT-9). The field's checked choice card puts muted text on an uncomputed tint.**
  - Where: `field.tsx:96`, `has-data-checked:bg-primary/5` (dark `/10`).
  - `FieldDescription` on it is 4.48:1 in light. No pair, note or story covers it.
  - Fix: `has-data-checked:bg-muted` plus `border-primary`, with the checkbox as the marker; add a checked choice-card story.
- **B4 (CAT-10). Charts animate their values by default.**
  - Where: `chart.tsx:66-86`, `:121`. `isAnimationActive={false}` is set only in the story, so a product's `<Bar>` tweens.
  - The as-built says a container cannot turn this off. It can: clone the series with the prop where it is unset.
  - A deviation cannot waive a non-negotiable (precedence rung 5).
  - Rule: CAT-10 non-negotiable 1; A-14.
  - Fix: default it off in the kit, and assert it in the play.
- **B5 (CAT-11). The combobox popup's input is on `bg-input/30`.**
  - Where: `combobox.tsx:128`. The placeholder on it is 3.65:1 in light and 3.90:1 in dark.
  - Command was fixed for exactly this; combobox was not.
  - Fix: `bg-muted/50`, as command.
- **B6 (CAT-11). The date picker's empty label fails AA in dark.**
  - Where: `date-picker.tsx:61`. `text-muted-foreground` on the outline button's `dark:bg-input/30` is 4.43:1 at rest and 3.29:1 on hover.
  - Fix: `text-foreground`, with the wording marking empty.

## Should-fix

- **S1 (CAT-7, 8, 9, 11). Most motion ignores reduced motion (C-P11: opacity only).**
  - tw-animate `zoom-in-95` and `slide-in-from-*` entrances in dialog, alert dialog, popover, hover card, tooltip, dropdown, context menu, menubar, navigation menu and combobox;
  - the drawer's translate (`drawer.tsx:131`);
  - the sidebar's width and left transition (`sidebar.tsx:226,238`).
  - Fix: one reduced-motion rule in `globals.css` neutralising tw-animate's scale and translate variables, plus `motion-reduce:transition-none` on the drawer and sidebar.
- **S2 (CAT-9).** The alert dialog scales in (`alert-dialog.tsx:59`). C-P11 wants high-stress paths opacity only. Fix: drop the zoom.
- **S3 (CAT-9).** The toast runs at 500ms (`toast.tsx:51`). C-P11 caps at 300ms; the sheet token is the drawer's alone. Fix: the moderate token.
- **S4 (CAT-8, 10, 11, and select).** The menu and listbox highlight (`bg-accent`, `bg-muted` on `--popover`) is 1.07:1 in light and 1.19:1 in dark. With `outline-hidden` it is the only focus cue (C-P07; CS-14). Route to Plumb: a highlight role at 3:1 against `--popover`, or a non-fill cue.
- **S5 (CAT-11).** The sidebar's active item is fill and weight only. `--sidebar-accent` on `--sidebar` is 1.04:1 in light and 1.19:1 in dark, hover shares it, and the icon rail loses the weight. Fix: `bg-selected` plus a marker; `bg-hover` for hover.
- **S6 (CAT-8).** The navigation menu's current link is `bg-muted/50`, about 1.03:1 (`navigation-menu.tsx:135`). Fix: the selected treatment plus a marker, and an active-link story.
- **S7 (CAT-10).** The current pagination page is marked by a 1.26:1 border (`pagination.tsx:64`). Fix: `bg-selected text-selected-foreground font-medium border-input`.
- **S8 (CAT-10).** Today, a range's middle days and hover all share `bg-muted` in the calendar (`calendar.tsx:122,127,131,224`). Fix: middle days `bg-selected`; today a non-fill cue.
- **S9 (CAT-8).** Bare `shadow` in the navigation menu (`navigation-menu.tsx:90,119`); CS-11, C-P06. Fix: `shadow-overlay`, and the lint rejects bare `shadow`.
- **S10 (CAT-11).** The combobox chip's remove button has no name, and no story renders chips (`combobox.tsx:268-274`).
- **S11 (CAT-10).** The chart tooltip animates (`chart.tsx:121`); A-15, C-P11.
- **S12 (CAT-10, preset).** Chart roles are not audited. `--chart-1` on the page is 1.48:1 in light and 1.31:1 in dark; `--chart-2` in dark is 2.54:1 (WCAG 1.4.11). Fix: NON_TEXT pairs, then retune.
- **S13 (CAT-11).** Every data-table row checkbox is named "Select row" (`data-table.tsx:98`).
- **S14 (CAT-11).** With no data, the data table still shows the filter and the pager (C-P08's counter-example).
- **S15 (CAT-11).** The date picker's `aria-label` hides the chosen date.
- **S16 (CAT-10).** The carousel animates keyboard and reduced-motion scrolling (`carousel.tsx:74-80`).
- **S17 (CAT-10).** Carousel slides have no names (`carousel.tsx:165`).
- **S18 (CAT-8, 10).** Some plays assert too little. The context menu is never opened; the navigation menu is never opened and shows no active link; the chart play does not assert the absence of animation.
- **S19 (CAT-10).** The message scroller's `scrollbar-*` utilities are defined nowhere (`message-scroller.tsx:49`).

## Nit

- `toggle-group.tsx:79` uses Radix's `data-[state=on]`.
- In the navigation menu, the `data-activation-direction` variants are malformed, and `easing-[ease]` and `xs:` are no-ops.
- The sidebar uses `ease-linear`, and `shadow-[0_0_0_1px_…]` should be `ring-1`.
- The sheet enters ease-in-out. Dialogs exit at the full duration.
- Pagination has a redundant role and a lowercase label, as does the breadcrumb's label.
- The FirstPage story keeps Previous live.
- The carousel never removes its `reInit` listener, and its vertical orientation still uses Left and Right.
- `@types/react-is` has no row.
- There is no `tabular-nums` on table amounts (C-P10).
- CS-15's indeterminate bar is 1.6:1 against the track.
- cmdk's transitive Radix deserves a ledger line.
- Primitives hard-code English strings.

## The axe rule changes

- **`preview.tsx`'s `aria-hidden-focus` scope** (Base UI focus guards and `[data-base-ui-inert]`) is justified. Check in a browser that Tab cannot leave an open modal.
- **Command's NoMatch `aria-required-children` off** is acceptable as scoped. `CommandEmpty` should be `role="status"` (Consider).

## Verdict per ticket

- **CAT-7:** Blocked (B1, B2).
- **CAT-8:** Pass with conditions (S4, S6, S9, S18, S1).
- **CAT-9:** Blocked (B2, B3).
- **CAT-10:** Blocked (B4).
- **CAT-11:** Blocked (B5, B6).

## Disposition

- **B1 fixed:**
  - the audit has the pairs `--muted-foreground` on `--hover` and on `--selected`;
  - muted-foreground moved to new raw steps: `--neutral-550` (oklch 0.49) in light and `--neutral-350` (oklch 0.76) in dark;
  - it now reads 4.97:1 and 4.84:1 on hover and selected, 5.74:1 and 7.04:1 on muted, and 6.26:1 and 9.22:1 on the page;
  - all 57 pairs pass, and the CAT-7 as-built line is corrected.
- **B2 fixed:** the drawer, dialog, alert dialog and sheet scrims have no blur. The token lint rejects `blur` and `backdrop-blur` at every named size (A-12), with tests.
- **B3 fixed:** the checked choice card is `bg-muted` with a primary border, and its radio is the marker. A `ChoiceCardChecked` story covers it.
- **B4 fixed:** `ChartContainer` gives every series and the tooltip `isAnimationActive={false}` unless the caller sets it. `StillByDefault` asserts the props (jsdom draws no bars), and the as-built's claim is corrected.
- **B5 fixed:** the combobox popup's input is on `bg-muted/50`.
- **B6 fixed:** the date picker's empty label is solid text, with its wording as the cue.
- **S1 fixed:**
  - under reduced motion, `globals.css` neutralises tw-animate's enter and exit scale, translate and rotate for every popup;
  - the drawer and the sidebar turn their transitions off.
- **S2 fixed:** the alert dialog does not zoom.
- **S3 fixed:** the toast is on the moderate token.
- **S9 fixed:** the navigation menu is on `shadow-overlay`, and the lint rejects a bare `shadow`.
- **S10 fixed:** the chip remove button is named "Remove".
- **S11 fixed** with B4: the tooltip is still.
- **S13 fixed:** a `getRowLabel` prop; checkboxes read "Select INV-1042".
- **S14 fixed:** with no data, the filter and pager are hidden and "Nothing here yet." shows. A filter that matches nothing says so, and the `NoMatch` story covers it.
- **S15 fixed:** the name carries the date ("Start date, October 14th, 2026").
- **S18 fixed:** the context menu's `Open` story right-clicks, finds the destructive item and closes on Escape. The chart's stillness is asserted (B4).
- **Drafted as CAT-14 (state contrast and markers):**
  - S4, the highlight role;
  - S5 to S8, `bg-selected` plus a marker on sidebar, navigation menu, pagination and calendar;
  - S12, the chart roles;
  - S16 and S17, the carousel;
  - S19, the message scroller's utilities;
  - three nits: toggle-group's `data-[state=on]`, the navigation menu's malformed variants, and `tabular-nums`.
- **Left:**
  - the remaining nits: sheet easing, the dialog exit duration, pagination's role and label case, the FirstPage story, the carousel `reInit` listener, the `@types/react-is` row, CS-15's 1.6:1, cmdk's Radix ledger line, hard-coded strings;
  - `CommandEmpty` as `role="status"` (Consider).
