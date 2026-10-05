# Tier 1 batch review: CAT-6, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5), given the contract, the cited law, the two earlier reviews, `results.json`, the evidence folder, the as-built and the list of changed files; never the builder's summary. Its findings are kept here with their substance, ids and figures; the layout is condensed. What was done about each is under "Disposition".

---

**Verdict: Blocked**: one Blocking finding (a one-class fix); the rest careful: no translucent text in `display/`, bubble's relative oklch() mapped to a primary tint, alert's `/90` gone, the progress track on `bg-input`, the skeleton guarded by `motion-reduce`, 13 exports, no token waiver, 50 stories run uncached (163 in C3). Contrast figures are computed with `contrast-audit.ts`'s maths; jsdom renders no colour.

## Blocking

- **B1. The progress bar tweens its value and the tween survives reduced motion.** `progress.tsx:52` `"h-full bg-primary transition-all"`: Base UI sets the indicator's width inline and `transition-all` animates it over the default 125 ms with no `motion-reduce:` guard; no global `prefers-reduced-motion` rule exists. Breaks non-negotiable 5, canon A-14 (tweened values) and C-P11 (data values do not animate; only transform and opacity). Not in the as-built. Fix: drop `transition-all`.

## Should-fix

- **S1. Two ledger rows numbered EN-13** (`ledger.md:348` the age gate, `:349` STK's local-database exposure, also cited at `changelog.md:20`); STK's row (af752c0) predates CAT-6's (61d4c9c). Six places cite EN-13 for the age gate. Fix: renumber the row not yet merged.
- **S2. The ledger half of the hatch is passable by a non-advisory mention.** `age-gate.test.ts:39-42` `ledger.includes(entry)` is a raw substring (`preact@19.2.1`, `react@19.2.10`, `@types/react@19.2.1` all satisfy `react@19.2.1`), any mention passes including a "Was:" cell, nothing checks for an advisory id, and the loop never runs on an empty list with no failing case. The exact-version half (`EXACT`) is sound. Fix: `isApproved(entry, ledger)` requiring one ledger line with the entry on name boundaries plus a GHSA or CVE id; failing cases for each hole.
- **S3. A role-less `aria-label` in the bubble story** (`bubble.stories.tsx:58`, `<span aria-label="2 thumbs up">+2</span>`): axe returns incomplete when the element has text; screen readers read "+2". Fix: icon `aria-hidden`, the number, `sr-only` words.
- **S4. The spinner in a button doubles the button's name** ("Loading Saving"; `spinner.stories.tsx:36-39`, `spinner.tsx:13-14`); this is the pattern people copy. Fix: `aria-hidden` on the spinner in the story, assert the button's name; a JSDoc line on Spinner.
- **S5. Indeterminate progress looks exactly like 0%** (`progress.tsx:50-53`, `progress.stories.tsx:44`): no width, no value, so a running task reads as not started. Fix: a static indeterminate look (design), or the story's words say what is happening.
- **S6. Table row selection is about 1.09:1 with no marker** (`table.tsx:64`; 1.31:1 dark; about 1.04:1 against hovered), C-P07; Should-fix because in the Data Table pattern the checkbox is the marker. Fix: the `SelectedRow` story gains a checkbox column; the `--selected` role proposal stays with design.
- **S7. Bubble's secondary and muted hovers are a 5% colour-mix** (`bubble.variants.ts:11,13`; about 1.13:1 between rest and hover, both themes): canon A-04; not logged; repeating the Button's makes it a pattern. Fix: log the deviation and route a hover-surface token to design.
- **S8. Variants and states not storied** (non-negotiable 6): marker as a link (`marker.variants.ts:4`, `marker.tsx:54`) with no Tab play; label's disabled style (`label.tsx:16`); BubbleReactions `side="top"` and `align="start"`; Alert `WithAction` has no play.

## Consider

- The as-built's "above 15:1" for the tinted bubble holds in light (16.1, 14.5 hovered) but not dark (11.6, 9.8); add the tinted-bubble pair to the audit.
- The outline badge as a link drops from about 19:1 to 4.54:1 on hover (`badge.variants.ts:14`); the ghost badge hovers on a non-interactive span (`:16`).
- Skeleton: `bg-muted` vanishes on a muted panel; the pulse is Tailwind's 2 s loop, not a motion token, and canon A-13 names "pulse"; already routed to Plumb.
- Spinner under reduced motion keeps rotating; a slower spin or an opacity pulse would satisfy C-P11; put "inline only (A-18)" in the README or JSDoc.
- `Alert` always carries `role="alert"`, even for the informational default.
- The age gate can be overridden outside the root `.yarnrc.yml` (`YARN_NPM_MINIMAL_AGE_GATE`, a nested rc, a user rc); "taken out once a week old" has no date to test against.
- The avatar fallback "DO" says nothing about who; in `Message` Incoming it is read before "Dana Okafor" (`aria-hidden` on the message's avatar).
- `results.json` records `tests: 134` while vitest counted 163 (the known parser defect).

## Verified in code

Computed passes: badge and bubble destructive on their tints (audited); bubble destructive on a card 6.16 (dark); bubble default hovered 9.12 / 9.15; table hover muted text 4.75 / 5.38 (5.02 on a card); kbd in a tooltip 11.2 / 15.3; progress track against the page 3.30 / 3.99 (3.61 on a card), on a muted panel 3.02; indicator against track 5.43 / 3.94; avatar fallback 4.54 / 4.58; destructive alert on `bg-card` ≥ 6.9 / 9.33; the alert's outline button ≥ 7.7 / 6.70 (5.11 hovered). Non-negotiables 1 to 4 hold apart from S1 and S2; C1 to C7 evidence matches the code; C3 was not a cache hit; `.yarnrc.yml:4` is `7d`. CAT-6 touched nothing in `control/`, the preset or `lib/`; earlier stories ran in the same 163 and both apps type-check. Not verifiable here: whether Yarn 4.13 honours a `name@x.y.z` entry in `npmPreapprovedPackages`; any rendered colour.

## Conversations

- Indeterminate progress reads as stuck: should it have its own static look and copy that says what is happening (A-20)?
- A spinner in a disabled button: the button loses focus and a live region that mounts already filled is usually silent; should the kit model the busy state as `aria-busy` on a button that stays focusable?

## Runtime checks

1. With "Reduce motion" on, change a Progress value: the bar jumps, not slides (B1).
2. `yarn config get npmMinimalAgeGate`; check CI for `YARN_NPM_MINIMAL_AGE_GATE`; in a scratch clone, confirm a `name@x.y.z` entry lets a same-day release install.
3. VoiceOver on Spinner `InButton`, Bubble `WithReactions`, Avatar `Fallback`.
4. Light and dark: Progress `Indeterminate` beside 0; Table `SelectedRow` hovered and not; Skeleton `Row` on a muted panel.
5. Tab to a Marker rendered as `<a>`: focus visible.

CAT-6: Blocked. B1 (progress indicator `transition-all` animates the value and ignores reduced motion: `progress.tsx:52`).

---

## Disposition

- **B1 fixed**: `transition-all` removed from the progress indicator; its JSDoc says the width does not tween (A-14, C-P11).
- **S1 fixed**: the age-gate ruling is EN-14, below STK's EN-13, in the ledger, `deps.md`, `.yarnrc.yml`, the test, the changelog entry, the contract body and the as-built.
- **S2 fixed**: `isApproved` needs one `| EN-` row naming the exact version on name boundaries, with a GHSA or CVE id, outside a "Was:" cell; failing cases for another package, another version, a scoped neighbour, no advisory id and a "Was:"-only mention.
- **S3 fixed**: reactions are a hidden icon, the number and `sr-only` words.
- **S4 fixed**: the spinner is `aria-hidden` inside the button, whose name "Saving" is asserted; Spinner's JSDoc says inline only (A-18) and to hide it inside a named control.
- **S5 fixed in the story**: the indeterminate story's label says "Preparing the upload…"; a static indeterminate look is routed to Plumb.
- **S6 fixed in the story**: `SelectedRow` gains a checkbox column (its header named for screen readers) with that row's box checked and asserted; the `--selected` role stays with Plumb.
- **S7 logged**: the 5% hover is a deviation in the as-built and in the story's provenance; a hover-surface token is routed to Plumb.
- **S8 fixed**: stories for a marker link (with a Tab play), a disabled label, reactions top and start, and the alert action's focus.
- **Consider, taken**: the as-built's bubble figures corrected; `aria-hidden` on the message's avatar.
- **Consider, left**: the tinted-bubble audit pair, the badge hovers, the skeleton on a muted panel, the spinner under reduced motion, the alert's role for the default variant, gate overrides outside the root rc, the avatar fallback's meaning.
- **Conversations, raised to Taylor**: an indeterminate look; `aria-busy` on a button that stays focusable.
