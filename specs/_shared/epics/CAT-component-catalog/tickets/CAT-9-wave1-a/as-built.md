# As-built — CAT-9

## Shipped against the contract

- C1: dialog, alert-dialog and toast (`feedback/`), sheet and field (`layout/`), button-group, toggle-group and input-group (`control/`), and item (`display/`), each storied with tags and provenance.
- C2: 45 new stories pass interactions and axe (250 in the run). Among them:
  - a dialog named and described, and Escape returning focus;
  - an alert dialog's cancel;
  - toast types and the close button;
  - a sheet on each side;
  - field validity, description and fieldset;
  - single and multiple toggle groups;
  - an input group's button reached by Tab;
  - an item as a link.
- C3: no token-lint waiver. Mapped:
  - the dialog's `calc(100%-2rem)` as `--spacing` times 8;
  - the toast's gap and peek on the spacing scale, and its transition on the sheet and fast motion tokens;
  - the sheet's 2.5rem slide as `translate-10`;
  - the input group's `radius-5px` corners as `rounded-xs`.
- C4: one folder per component, nine `exports` entries, and the kind READMEs list them.
- C5: every audited pair passes; no new role.
- C6: the kit, the catalog and both apps type-check.

## Deviations

- **Under reduced motion,** the toast fades without sliding, and the sheet's slide is off.
- **`ItemSeparator` is `aria-hidden`.** An `ItemGroup` is a list, which may hold only list items; the separator is decorative between rows.
- **A modal popup's hidden page is exempt from `aria-hidden-focus`** (`preview.tsx`, `[data-base-ui-inert]`). Base UI hides the page behind it with aria-hidden while its focus trap keeps Tab inside.
- **Base UI hides the toast's close button from the reading cursor;** Escape dismisses the toast. The story finds it by its slot. Kept as upstream.
- **Formatting:** the first commit missed the root prettier config, and `0485fc5` fixed it.

## Batch review fixes

- **B2:** no backdrop blur on the dialog, alert dialog and sheet scrims (A-12).
- **B3:** the checked choice card is `bg-muted` with a primary border, and its radio is the marker. Its muted description stays on an audited pair, and a `ChoiceCardChecked` story covers it.
- **S1:** under reduced motion, tw-animate's scale, slide and spin are neutralised for every popup (`globals.css`), leaving opacity.
- **S2:** the alert dialog does not zoom.
- **S3:** the toast runs at the moderate token (250ms), not 500ms.

## Not verified

- Toast swipe and stacking in a browser. jsdom has no pointer gestures or layout.
- Light and dark in the workshop.

## Next

CAT-10: wave 1, part B.
