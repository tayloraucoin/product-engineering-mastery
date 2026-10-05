# Tier 1 review: CAT-12, 2026-10-04

The reply of one `vigil` subagent (claude-opus-5-5). It was given the contract, the cited law, the results and evidence, the as-built and the changed files (commit `dd62690`), never the builder's summary. Its findings are kept with their substance and ids; the layout is condensed. What was done about each is under "Disposition".

---

**Verdict: Blocked.** There are two Blocking findings.

**Checked and clean:**
- every import goes through `@pem/ui` subpaths, lucide, react or a relative path;
- no waivers, and no raw values slipped through;
- the only translucent surfaces carry no text;
- lucide hides its icons by default;
- the settings dialog and the actions popover are named;
- the licence text matches upstream, and lucide is pinned with its row and module entry;
- the dashboard-01 deferral is sound.

## Blocking

- **B1. The version switcher does nothing.**
  - Where: `sidebar-01/version-switcher.tsx:59`, `sidebar-02/version-switcher.tsx:59`.
  - `onSelect` is Radix's API; Base UI's menu item has `onClick` only, so a click never selects. The choice is shown only by an icon.
  - Fix: a `DropdownMenuRadioGroup` with radio items, plus a play that picks a version.
- **B2. The plays operate only the sidebar trigger.**
  - No story opens a dropdown, expands a collapsible or uses the date picker. sidebar-16's play operates nothing.
  - Rule: contract non-negotiable 4.
  - Fix: a play per kind of widget in each block.

## Should-fix

- **S1.**
  - Every sidebar `Default` ends collapsed, so the offcanvas ones vanish in the workshop.
  - sidebar-13 ends with its dialog closed, so axe never scans it.
  - Fix: split them into `Default` and `Collapsed`, and into `Open` and `Closed`.
- **S2.** Two inputs are labelled only by their placeholder (sidebar-06 email, sidebar-09 search); A-16.
- **S3.** The calendar toggles' unchecked border is about 1.2:1, and their state is hidden (sidebar-12, -15); WCAG 1.4.11, C-P07.
- **S4.** Icon buttons repeat generic names ("Toggle", "More"); WCAG 2.4.6.
- **S5.** Provenance under-reports the per-block changes.
- **S6.** The licence notice does not travel with a copied block, and the README says LICENSE per folder.
- **S7.** dashboard-01 stays under CAT-12, and CAT-13's C1 checks CAT-12. Its build likely also needs zod and @tanstack/react-table.

## Nit

- N1: inline brand SVGs are not hidden from assistive tech.
- N2: emoji are read before row names.
- N3: the brand marks are trademarks outside MIT.
- N4: sidebar-11 has a dead `data-[active=true]`.
- N5: sidebar-09's mail list is not a list.
- N6: three pairs the blocks introduce are unaudited (sidebar-foreground on muted and on popover; muted-foreground on sidebar).
- N7: header transitions use `ease-linear`.
- N8: the team switchers show ⌘ shortcuts with no handler.
- N9: nav-user avatars 404, and their alt repeats the name.
- N10: date pickers depend on today's date; one file lacks `"use client"`; `Math.random` runs in sidebar-09.
- N11: sidebar-10 opens its popover on mount.
- N12: there is a `<main>` inside the settings modal.

## Disposition

- **B1 fixed:** sidebar-01 and -02 use a radio group. The `PickVersion` story chooses `v1.1.0-alpha` and reads it on the trigger.
- **B2 and S1 fixed:**
  - every sidebar block has `Default` (expanded), `Collapsed`, and, where it has them, `MenuOpen`, `SectionToggle` and `PickDay`;
  - sidebar-13 has `Open` (axe scans the named dialog) and `Closed`;
  - the forms gain `Focus`;
  - 382 stories pass.
- **S2 fixed:** a visible label for the newsletter email, and an `sr-only` label for the mail search.
- **S3 fixed:** `aria-pressed` on each toggle, on `border-input` (audited at 3:1).
- **S4 fixed:** "More actions for {name}" and "Show {title} pages".
- **S5 fixed:** each block's `adapted` line names its changes, and the brand-mark caveat (N3).
- **S6 fixed:** every file's header carries "Copyright (c) 2023 shadcn, MIT: keep this notice when copying". The README says the licence sits once per source.
- **S7 fixed:** dashboard-01 is ticket CAT-13 (still link-only). CAT-13's C1 names CAT-13, and its dependency line adds zod and @tanstack/react-table.
- **Nits taken:**
  - N1 and N2 hidden;
  - N4 removed;
  - N10: a fixed month and `"use client"`; the shuffle runs only on a click;
  - sidebar-09's menu label is wrapped in a group, which Base UI requires (found by the new `MenuOpen` play).
- **Nits left:**
  - N5, N8, N9, N11 and N12 are upstream's demo content on a shelf block. Each is a copier's edit, and N11 is named in sidebar-10's provenance.
  - N6 and N7 go to the drafted state-contrast follow-up with the CAT-7 to CAT-11 review's routed items.
