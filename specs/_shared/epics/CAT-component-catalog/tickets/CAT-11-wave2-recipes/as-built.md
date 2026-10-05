# As-built — CAT-11

## Shipped against the contract

- C1: combobox and command (`primitives/control/`), sidebar (`primitives/navigation/`), date-picker (`composed/control/`) and data-table (`composed/display/`), each storied with tags and provenance. Typography is link-only: shadcn's page is utility classes, not a component, and the house text styles come with P-K. STATUS.md shows 65 of 92; the shadcn kit is complete.
- C2: 26 new stories pass interactions and axe (303 in the run). Among them:
  - combobox filtering and no match;
  - command filtering and the palette in a named dialog;
  - the sidebar's active item, collapse and the icon rail;
  - the date picker filling and closing;
  - the data table's filter, sort with `aria-sort`, selection count and pages.
- C3: no token-lint waiver.
- C4: one folder per component, five `exports` entries, the hook in `src/hooks/`, and the kind READMEs list them.
- C5: every audited pair passes; no new role.
- C6: the kit, the catalog and both apps type-check.
- C7: cmdk 1.1.1 and @tanstack/react-table 8.21.3 are pinned exactly, at least a week old, with tech-stack rows and in the ui module.

## Deviations

- `[ASSUMPTION]` **@tanstack/react-table v8, not v9.** shadcn's data-table guide is written for v8, and v9 is a new major.
- **cmdk brings Radix's dialog transitively.** CS-01 keeps Radix out of the kit as a primitive base; this is a dependency of shadcn's own command, not a base.
- **The date picker and data table are the docs recipes made into components:** controlled or not, with strings in `copy.ts`, the popover closing on a choice, and sorting announced by `aria-sort`.
- **Accessibility fixes to upstream:**
  - the combobox's open and clear buttons are named ("Show options", "Clear") and out of the tab order, as in the ARIA combobox pattern;
  - the command dialog's title is inside the popup, so it names the dialog and is gone while closed;
  - the command separator is `aria-hidden` inside the listbox;
  - the sidebar's active item carries `aria-current="page"` as well as its fill and weight;
  - the sidebar group label is at full `sidebar-foreground`, which was 70%.
- **The command input's tint** is `bg-muted/50`, an audited role, not `bg-input/30`.
- **The command's no-match story turns off axe's `aria-required-children`.** cmdk keeps an empty listbox beside the message. This is the only story-level rule change, recorded here.
- **The registry JSON was used for command and sidebar,** because `--view` stops listing after their dependencies. Its icon placeholders were resolved to lucide, as the CLI does.
- **use-mobile** reads the media query's own `matches` at `md` (47.99rem).
- **Shims and inlining:** `vitest.setup.ts` shims `scrollIntoView` for cmdk, and Vitest inlines cmdk, Radix and react-table.

## Not verified

- The sidebar's mobile sheet and its Ctrl/Cmd+B shortcut. jsdom's matchMedia reports desktop, and the shortcut's synthetic KeyboardEvent hits jsdom's realm quirk.
- Light and dark in the workshop.

## Next

Close the CAT-7 to CAT-11 batch with one review, then CAT-12 (the blocks).
