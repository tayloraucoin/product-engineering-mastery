# As-built — CAT-8

## Shipped against the contract

- C1: popover, tooltip, hover-card, dropdown-menu and context-menu (`primitives/feedback/`), navigation-menu and breadcrumb (`primitives/navigation/`), and the direction provider (`providers/direction/`, export `./direction`), each storied with tags and provenance.
- C2: their stories pass interactions and axe. Among them: open and Escape back to the trigger, menu checkbox and radio state, submenus, and the breadcrumb's current page.
- C3: no token-lint waiver.
- C4: one folder per component, an `exports` entry each, and the kind READMEs list them.
- C5: every audited pair passes; no new role.
- C6: the kit, the catalog and both apps type-check.

## Deviations

- **The navigation menu's viewport** uses the moderate motion token, not upstream's 0.35s, and the arrow's pixel offset is on the spacing scale. `navigationMenuTriggerStyle` lives in `navigation-menu.variants.ts`.
- **The dropdown's list** has `min-w-24` for upstream's pixel minimum.
- **Elevation:** `shadow-overlay` for menus and popovers, `shadow-modal` for submenus.
- **Base UI's focus guards are exempt from axe's `aria-hidden-focus`** (`preview.tsx`). They are focusable on purpose, so Tab wraps inside the popup; the rule still runs on every other element.

## Not verified

- Hover-card and tooltip delays in a browser. jsdom has no pointer timing, so the stories open them by `defaultOpen`.
- Light and dark in the workshop.

## Next

CAT-9: wave 1, part A.
