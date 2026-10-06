# As-built — CAT-12

## Shipped against the contract

- C1: 26 of shadcn's 27 Base blocks are in `packages/catalog/src/shadcn/`:
  - login-01 to login-05 and signup-01 to signup-05, under `layout/`;
  - sidebar-01 to sidebar-16, under `navigation/`.

  Each is storied as `Catalog/<Kind>/<Name>/shadcn`, with `source:shadcn`, `verdict:shelf`, `layer:block` and provenance, beside shadcn's MIT `LICENSE`. dashboard-01 is link-only, with its reason. STATUS.md shows 92 of 92.

- C2: 26 block stories pass their plays and axe, 329 in the run:
  - each form's fields are named by their labels, and typing fills them;
  - each sidebar renders, and its trigger collapses it;
  - the settings dialog opens and closes on Escape.
- C3: no token-lint waiver, and the catalog's lint is clean. Mapped:
  - `w-[260px]` to `w-65`;
  - the settings dialog's pixel sizes to the spacing scale;
  - the date picker's `--cell-size` to `--spacing(8.5)`;
  - two inline `--sidebar-width` literals to classes on the spacing scale.
- C4: the kit's layout is unchanged; blocks export nothing (the catalog exports only its manifest).
- C5: every audited pair passes; no new role.
- C6: the kit, the catalog and both apps type-check.

## Deviations

- **dashboard-01 is link-only**, drafted as CAT-13. It needs four @dnd-kit packages and sonner, and CS-04 rules toast, not sonner. The kit's data table and chart cover its parts.
- **The catalog now depends on `lucide-react` 1.48.0**, the kit's exact pin. The blocks' icons resolve to it, and its tech-stack row names both packages.
- **Accessibility fixes to upstream:**
  - collapsible menu items render as the list item (`render={<SidebarMenuItem />}`) in sidebar-05, -10 and -15, as the other blocks already did;
  - sidebar-11's file leaves sit in list items;
  - icon-only buttons are named: workspace toggles and add-page actions, the favourite and page-actions buttons, and sidebar-16's header toggle;
  - sidebar-10's actions popover is named.
- **Text at full strength:** the "More" rows at `text-sidebar-foreground`, which was 70%.
- **The placeholder photo** in login-02, login-04, signup-02 and signup-04 is a muted, decorative panel. Upstream had a broken `/placeholder.svg` with alt "Image".
- **sidebar-11's folder chevron** rotates on Base UI's `data-open`. Upstream read Radix's `data-state=open`, so it never turned.
- **Page components are named exports** (`Login01` …), not `export default function Page`.

## Review fixes

From `_batch-review-2026-10-04-CAT-12.md`:

- **B1:** the version switcher in sidebar-01 and -02 is a radio group. Upstream's Radix `onSelect` never fired on Base UI. A `PickVersion` story chooses one and reads it on the trigger.
- **B2 and S1:** every sidebar block now has these stories:
  - `Default`, expanded;
  - `Collapsed`, by its trigger;
  - `MenuOpen`, which opens its first menu, where it has one;
  - `SectionToggle`, which toggles a section, where it has one;
  - `PickDay`, where it has the date picker.

  sidebar-13 has `Open` (the dialog named "Settings", scanned by axe) and `Closed`. The forms gain a `Focus` story. 382 stories run.

- **S2:** the newsletter email and the mail search are labelled.
- **S3:** calendar toggles carry `aria-pressed` on an audited `border-input`.
- **S4:** More menus and section toggles are named per row.
- **S5:** each block's provenance names its own changes and, where present, the brand marks outside MIT.
- **S6:** each file's header carries shadcn's copyright notice, and the README says the licence sits once per source.
- **S7:** dashboard-01 is CAT-13's, and its C1 names CAT-13. Its build will also need zod and @tanstack/react-table in the catalog.
- **Nits taken:**
  - sidebar-09's menu label is in a group (Base UI throws otherwise);
  - brand SVGs and emoji are hidden from assistive tech;
  - sidebar-11's dead `data-[active=true]` is gone;
  - the date pickers show a fixed month and are client components.

## Not verified

- The blocks at phone width and in dark mode in the workshop. jsdom has no layout or colour.
- The mobile sheet of each sidebar.

## Next

Close the CAT-7 to CAT-12 work with the batch review's fixes and one `yarn verify`. Then CAT-13 (the dashboard) and the custom lifts.
