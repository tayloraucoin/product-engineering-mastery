# As-built — CAT-10

## Shipped against the contract

- C1: calendar and questionnaire (`control/`), carousel (`media/`), chart and attachment (`display/`), menubar and pagination (`navigation/`), and message-scroller (`layout/`), each storied with tags and provenance. STATUS.md shows 60 of 92.
- C2: 27 new stories pass interactions and axe (277 in the run). Among them:
  - a calendar day chosen, a range, disabled days and the next month;
  - the carousel's region and slides;
  - the chart's figure and its chart-role colours;
  - menubar open, Escape, and checkbox state;
  - the pagination's current page and tab order;
  - attachment states and the remove action's focus;
  - questionnaire choice and advance.
- C3: no token-lint waiver.
  - The chart's default strokes are matched by `:not([stroke^='var('])`, not recharts' literal hex.
  - The tooltip's 1.5px dashed border is `border-2`.
  - Small text (0.8rem and 0.625rem) is `text-xs`.
- C4: one folder per component, eight `exports` entries, and the kind READMEs list them (media's first).
- C5: every audited pair passes; no new role.
- C6: the kit, the catalog and both apps type-check.
- C7: each new dependency is pinned exactly, at least a week old, with a tech-stack row and in the ui module:
  - react-day-picker 10.0.1 and date-fns 4.4.0;
  - embla-carousel-react 8.6.0;
  - recharts 3.8.0 (shadcn's pin), with its peer react-is 19.2.8;
  - @shadcn/react 0.3.1.

## Deviations

- **The pagination link is a plain `<a>` styled with `buttonVariants`.** Base UI's Button gives a rendered anchor `role="button"`, so each page was announced as a button and its label was dropped.
- **Charts do not animate values (A-14), in the kit itself** (batch review B4). `ChartContainer` gives every series and the tooltip `isAnimationActive={false}` unless the caller sets it. The `StillByDefault` story proves it on the props, since jsdom draws no bars.
- **Text at full strength:**
  - the calendar day's secondary line, which was 70% opacity;
  - the attachment's error description, which was 80% destructive.
- **Vitest inlines** react-day-picker, embla, recharts and @shadcn/react, so they resolve React through the stories' alias. **`vitest.setup.ts` shims `IntersectionObserver`** for Embla.
- **Yarn added `@types/react-is`** (caret, devDependency) with react-is.

## Not verified

- Carousel swipe, the message scroller's auto-scroll and the chart's tooltip on hover in a browser. jsdom has no layout, scroll or pointer movement.
- Light and dark in the workshop.

## Next

CAT-11: the wave-2 recipes.
