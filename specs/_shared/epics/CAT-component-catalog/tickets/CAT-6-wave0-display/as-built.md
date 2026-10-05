# As-built — CAT-6

## Shipped against the contract

- C1: label, badge, avatar, kbd, table, empty, bubble, marker, message, skeleton, progress and alert are in `primitives/display/`, and spinner in `primitives/feedback/`. Each comes from `yarn shadcn add <name> --dry-run --view` (base-vega, shadcn 4.21.0), with stories tagged `source:shadcn`, `verdict:kit` and `layer:primitive`, plus provenance. STATUS.md shows 28 of 92 entries done.
- C2: `tooling/age-gate.test.ts` holds `npmMinimalAgeGate` at `7d` and every entry in `npmPreapprovedPackages` to one exact `name@x.y.z` named in the ledger. It rejects ranges, globs, bare names and tags.
- C3: 50 new stories pass their interactions and axe (163 in the run). Among them:
  - the label naming its field;
  - a badge rendered as a focusable link;
  - the avatar's fallback;
  - a table's rows and column headers;
  - an empty state's single action;
  - a bubble rendered as a button taking focus;
  - a message;
  - the progressbar's value;
  - the alert's role;
  - the spinner's status name.
- C4: no token-lint waiver. Badge `ring-3`; bubble's tinted variant on a primary tint; focus rings appear at once.
- C5: one folder per component, with five `.variants.ts` files (badge, empty, bubble with two cva calls, marker, alert), thirteen `exports` entries, and the display and feedback READMEs listing them.
- C6: all 49 audited pairs still pass.
- C7: the kit and both apps type-check.

## Deviations

- **The age gate's exception (EN-14)** is in `.yarnrc.yml` (`npmPreapprovedPackages: []`) and `.claude/rules/deps.md`, with a ledger line and a changelog entry, approved in plan mode.
- **Bubble's tinted variant:** upstream mixes its fill with relative `oklch(from var(--primary) …)`. It became `bg-primary/10` (`/20` in dark), with hovers at `/15` and `/25`. Foreground text on it computes to 16.1:1 at rest in light and 11.6:1 in dark.
- **Alert's destructive description:** `text-destructive/90` became solid `text-destructive`. Translucent text is what the audit cannot see.
- **The progress track** moved from `bg-muted` to `bg-input` (3.30:1 light, 3.99:1 dark), so the bar's full length shows. This follows CAT-5's slider-track fix.
- `[ASSUMPTION]` **The skeleton keeps its pulse**, with `motion-reduce:animate-none`. Canon A-14 bans shimmer specifically; a slow opacity pulse is a quieter loading signal. Plumb can rule it out if it reads as decoration.
- **The spinner keeps `animate-spin` under reduced motion,** because its motion is the information. A-18 holds through usage: inline only, and a skeleton of the final layout for a page.
- **Story fixes from the first run:**
  - the avatar's status dot carries screen-reader text rather than an `aria-label` on a role-less `span`;
  - the skeleton row is a `role="status"` region;
  - the label story asserts the field's accessible name rather than clicking, which hits jsdom's PointerEvent realm quirk.

- **Batch review fixes** (`_batch-review-2026-10-04-CAT-6.md`):
  - the progress indicator no longer tweens its width (B1);
  - the age-gate ruling is renumbered EN-14, since STK took EN-13 first;
  - its ledger check needs one row naming the exact version, with name boundaries, and a GHSA or CVE id;
  - the spinner is hidden inside a labelled button;
  - reactions are read as words;
  - indeterminate progress says what is happening;
  - the selected table row carries a checked box;
  - new stories for a marker link, a disabled label, reactions top and start, and the alert action's focus.
- **Bubble's secondary and muted hovers keep upstream's 5% colour mix** (about 1.13:1 between rest and hover, an A-04 risk), as the Button's does. A hover-surface token is routed to Plumb.

## Not verified

- The components rendered in light and dark in the workshop. jsdom computes no colour, so contrast rests on the audit's pairs and the computations above.
- The avatar's image load in a browser. In jsdom the fallback shows.

## Next

CAT-7 brings the wave-0 layout components: card, separator, aspect ratio, scroll area, resizable, collapsible, accordion and drawer.
