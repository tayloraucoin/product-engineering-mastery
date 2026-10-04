---
title: Component sources — what the kit and the catalog may draw from, and how an item enters
description: Read before adding a component from shadcn or any registry, choosing components for a new product, or finding which source serves a job the product's components.md lacks; holds the source verdicts, the base and style, the registry review deltas, the job index and the starter kits.
layer: design
status: ruling
thread: CAT
role: Plumb
date: 2026-10-04
last_reviewed: 2026-10-04
supersedes:
load_when: on request
---

# Component sources

Lifted from Quartermaster's component-sourcing ledger ([`react-ui-libraries.md`](../research/design-tools/react-ui-libraries.md), read 2026-10-03; the evidence and dates for every verdict are there), with Taylor's approval of 2026-10-04 (CAT epic, `specs/_shared/epics/CAT-component-catalog/technical.md`). Ledger lines CS-01 to CS-10. The two shelves are record [0011](../decisions/records/0011-component-kit-and-catalog.md).

## The ruling

shadcn/ui core is the house component source, on the Base UI track, in the Vega style. It is built into `@pem/ui`, the kit apps import. Everything else worth seeing lives on a shelf, `@pem/catalog`, that no app imports: shadcn's blocks, ecosystem items, custom components lifted from earlier products, and alternate tracks. A product picks from the shelf by copying; an item enters the kit only by a ruling here. Registry code is untrusted code, for the same reason third-party skills are ([`skills.md`](skills.md)): an `add` writes files, dependencies and global CSS.

| Source                                                  | Verdict (CS-01)                         | What happens                                                                                                      |
| ------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| shadcn/ui core                                          | **Adopt** (baseline)                    | Every Base-track component into `@pem/ui`, except `sonner` (CS-04) and `form` (until the form library is chosen)  |
| Base UI                                                 | **Adopt** as the primitive base (CS-02) | Pinned exactly; the only primitive library in `@pem/ui`                                                           |
| shadcn blocks                                           | **Shelf**                               | Into `@pem/catalog`; a block is a page, never a kit primitive                                                     |
| tablecn                                                 | **Adopt after edits**, data grid only   | Into the catalog by commit-pinned GitHub address; strip row animation and real-time items; tabular numbers        |
| Dice UI                                                 | **Adopt after edits**                   | Into the catalog by commit-pinned GitHub address; never its data-table or data-grid items (those are tablecn's)   |
| ReUI                                                    | **Mine, not install**                   | Read the MIT items as references; never configure `@reui`                                                         |
| Radix Primitives                                        | **Defer**                               | A catalog alternate track only, for products porting from Radix                                                   |
| Every other source                                      | **Unruled shelf**                       | Into the catalog by job (CS-09), tagged `verdict:unruled`; licence kept; link-only when it cannot be token-mapped |
| Styled systems, paid and licence-gated sources, indexes | **Not catalogued**                      | MUI, Mantine and the rest carry their own styling runtime; paid items cannot be kept in a shared repo             |

## Base, style and single vendors

- **Base (CS-02).** Base UI; `components.json` `style: base-vega`. No new Radix primitive enters the kit.
- **Style (CS-03).** Vega, shadcn's default. The other styles differ in radius, spacing and density, never in colour roles; the preset carries every role Vega uses.
- **Toast (CS-04).** Core Toast, not sonner.
- **`cn` (CS-05).** Core imports `cn` from the `cn` package; on copy-in it is rewritten to `@pem/ui/cn` (clsx and tailwind-merge stay).
- **Global CSS (CS-06).** `shadcn/tailwind.css` is ejected once into `packages/ui/src/styles/`; nothing imports it from the package.
- **Icons (CS-10).** lucide-react.
- **Form library.** Not chosen. The first ticket that needs one recommends React Hook Form or TanStack Form, paired with Zod.

## Registry access and review (CS-08)

`ui.shadcn.com` is reached by a per-command network approval. A third-party item is addressed as a GitHub path pinned to a full commit SHA, never by namespace. On top of the review procedure in [`skills.md`](skills.md), every `add`:

1. Runs with `--dry-run` (and `--view`) first; the resolved payload's source, SHA and read date go in the item's provenance.
2. Is rejected when it declares `envVars` or `font`, a `registry:file` or `registry:page` type, a `~/` target, a target outside `packages/ui/**` or `packages/catalog/**`, `css` with `@plugin` or `@layer base`, or `cssVars` not mapped in the preset.
3. Resolves its whole `registryDependencies` tree; every node is pinned, or the review fails.
4. Is followed by a diff of `components.json`; a namespace the registry index inserted is reverted.
5. Brings each new npm dependency through one vendor per category and a `tech-stack.md` row before merge.
6. Is reviewed again on any SHA change, not only a version bump.

## Copy-in mapping (CS-11 to CS-13)

shadcn's Vega classes enter on house tokens. The token lint judges only the utility after a class's last variant (`data-[size=sm]:` is a selector, not a value), and passes arbitrary values built from variables, `--spacing()`, keywords and relative units. What it rejects is mapped like this:

| Vega writes                                    | The kit writes                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `shadow-xs`                                    | `shadow-control` (inputs, buttons, toggles, cards)                                                                  |
| `shadow-sm`                                    | `shadow-raised` (slider thumb, active tab)                                                                          |
| `shadow-md`, `shadow-xl`                       | `shadow-overlay` (popovers, menus, select, hover card, chart tooltip)                                               |
| `shadow-lg`                                    | `shadow-floating` (sheets, toasts, submenus)                                                                        |
| `duration-100`, `duration-150`                 | `duration-(--motion-duration-fast)`                                                                                 |
| `duration-200`                                 | `duration-(--motion-duration-base)`                                                                                 |
| `duration-250`, `duration-300`, `duration-400` | `duration-(--motion-duration-moderate)`                                                                             |
| `duration-450` on the drawer                   | `duration-(--motion-duration-sheet)`                                                                                |
| `ease-[cubic-bezier(…)]`, `ease-in`            | `ease-(--motion-ease-out)`; on-screen movement `ease-(--motion-ease-in-out)`; drawers `ease-(--motion-ease-drawer)` |
| `ring-[3px]`, `rounded-[2px]`, `rounded-[4px]` | `ring-3`, `rounded-xs`, `rounded-sm`                                                                                |
| other px or rem literals                       | the nearest spacing, size or text step; a gap no step serves is a token proposal here                               |
| `bg-black`, `bg-white`, colour functions       | a role (`bg-foreground/10` for a scrim, `bg-background` for a thumb)                                                |

## Catalogue by job (CS-09)

The catalog takes an ecosystem item when it serves a job core does not, or serves one markedly better; reskins of a core component are left out. Copy-in maps to house tokens with the token lint on. An item that needs more than a mechanical rename is a manifest entry with a link and its reason, not code.

## Job index

The job vocabulary for `components.md` rows and for the scout. "Domain" means no source serves it: a product builds it.

| Job  | Task type          | Job                                       | Core answer                                   | Beyond core                      |
| ---- | ------------------ | ----------------------------------------- | --------------------------------------------- | -------------------------------- |
| J-01 | Table              | Sortable, paginated records table         | Data Table, Table, Pagination                 | tablecn data-table (server-side) |
| J-02 | Table              | Act on several selected rows              | Data Table + Checkbox                         | tablecn action bar               |
| J-03 | Search / filter    | Filter a long list by several facets      | Combobox, Command, Popover                    | tablecn filter-list              |
| J-04 | Data entry         | Edit many cells inline                    | none                                          | tablecn data-grid; else domain   |
| J-05 | Table              | Scroll a very long list without lag       | Scroll Area                                   | tablecn virtualised scroll       |
| J-06 | Compare            | Compare two versions side by side         | Resizable                                     | domain                           |
| J-07 | Audit trail        | Read a chronological event log            | Table, Item                                   | domain                           |
| J-08 | Form               | Labelled field with help and error        | Field, Label, Input                           | —                                |
| J-09 | Form               | Validate and submit with one schema       | Field + the chosen form library               | —                                |
| J-10 | Form               | Choose one from a short set               | Radio Group, Select, Native Select            | —                                |
| J-11 | Form               | Toggle a setting                          | Switch, Checkbox                              | —                                |
| J-12 | Form               | Pick a date or range                      | Date Picker, Calendar                         | —                                |
| J-13 | Form               | Text with prefix, suffix or inline action | Input Group                                   | —                                |
| J-14 | Form               | Enter a bounded number                    | Input                                         | Base UI NumberField              |
| J-15 | Onboarding         | Enter a one-time code                     | Input OTP                                     | —                                |
| J-16 | Onboarding         | Step through a questionnaire              | Questionnaire                                 | —                                |
| J-17 | Onboarding         | Take a product tour                       | none                                          | domain                           |
| J-18 | Navigation         | Move between app sections                 | Sidebar, Navigation Menu, Breadcrumb          | —                                |
| J-19 | Navigation         | Switch views within a page                | Tabs, Toggle Group                            | —                                |
| J-20 | Navigation         | Jump anywhere by keyboard                 | Command, Kbd                                  | —                                |
| J-21 | Search / filter    | Search with suggestions as you type       | Combobox, Command                             | Base UI Autocomplete             |
| J-22 | Search / filter    | Pick one or many from a long list         | Combobox                                      | —                                |
| J-23 | Navigation         | Act from a toolbar                        | Button Group, Toggle Group                    | —                                |
| J-24 | Dashboard          | Headline figure with context              | Card                                          | —                                |
| J-25 | Dashboard          | Trend over time                           | Chart                                         | —                                |
| J-26 | Settings           | More detail on hover or focus             | Hover Card, Tooltip                           | —                                |
| J-27 | Settings           | Act on an item from a context menu        | Context Menu, Dropdown Menu                   | —                                |
| J-28 | Settings           | Collapsible groups of settings            | Accordion, Collapsible                        | —                                |
| J-29 | Settings           | Adjust a value along a range              | Slider                                        | —                                |
| J-30 | Navigation         | Secondary panel on mobile                 | Drawer, Sheet                                 | —                                |
| J-31 | Destructive action | Confirm a destructive action              | Alert Dialog                                  | —                                |
| J-32 | Loading            | Progress of a known-length task           | Progress                                      | —                                |
| J-33 | Loading            | Hold layout while content loads           | Skeleton, without shimmer (A-14)              | —                                |
| J-34 | Report             | Visualise a report figure                 | Chart                                         | —                                |
| J-35 | Error state        | Explain a failure and offer recovery      | Alert, Empty                                  | —                                |
| J-36 | Empty state        | Explain an empty view and the next step   | Empty                                         | —                                |
| J-37 | Loading            | Confirm a background result               | Toast                                         | —                                |
| J-38 | Map                | Pan and select on a map                   | none                                          | domain                           |
| J-39 | Canvas             | Connect nodes on a canvas                 | none                                          | domain                           |
| J-40 | Loading            | Stream a conversational response          | Message, Message Scroller, Bubble, Attachment | —                                |
| J-41 | Data entry         | Attach files to a record                  | Attachment                                    | domain for upload pipelines      |
| J-42 | Data entry         | Edit rich text                            | none                                          | domain                           |

## Starter kits by profile

The scout's first cut for a new product. The product's `components.md` keeps what its first release needs.

| Profile                    | Core components                                                                                                           | Beyond core                  | Avoid                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| Data-dense product app     | Data Table, Table, Pagination, Combobox, Command, Field, Select, Date Picker, Alert Dialog, Skeleton, Empty, Sidebar, Kbd | tablecn; Base UI NumberField | Chart animation and shimmer (A-14); a second grid vendor                                   |
| Consumer mobile-first app  | Drawer, Sheet, Tabs, Input OTP, Toast, Empty, Skeleton, Avatar                                                            | —                            | Animated registries (A-13); glass overlays (A-12)                                          |
| Internal admin tool        | Sidebar, Data Table, Field, Native Select, Switch, Alert Dialog, Breadcrumb, Empty                                        | tablecn; Dice UI hooks       | Marketing blocks (A-03, A-07)                                                              |
| AI product surface         | Message, Message Scroller, Bubble, Attachment, Questionnaire, Spinner (inline only)                                       | —                            | Thinking theatre (A-20); page-load spinners (A-18)                                         |
| Docs site                  | Typography, Navigation Menu, Command, Breadcrumb, Tabs, Collapsible                                                       | —                            | A second typography vendor                                                                 |
| Marketing register in code | Button, Card, Navigation Menu, Accordion                                                                                  | —                            | Animated registry defaults (A-02, A-03, A-12 to A-14); routing to Framer is not ruled here |

## Open

- The form library (above).
- Whether a marketing register is built in code or routed by the Framer ruling (research §6).
- Re-screening the sources the research could not open (its §10) happens ticket by ticket in CAT, each with a primary read of React 19 support and the licence.

## Changelog

- 2026-10-04: v0.1, from the P-M research and Taylor's approval (CAT-1).
