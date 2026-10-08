---
target: specs/web/ux/admin/shell.md
status: approved
promoted: 2026-10-07
---

# Shell — admin

## Job

Get a team member to the right experiment or task in one move, and keep everyone else out without telling them what is here. Done: the page they wanted is open, with the nav in reach.

## Layout and components

- `@pem/ui` `sidebar` (S23), fixed at 1024px and wider and collapsible to an icon strip. Below 1024px it is off-canvas: a top bar holds a menu button and "Admin", and the sidebar opens as a `Sheet`. It closes on route change, on scrim click and on Escape.
- **Sidebar, top to bottom:**
  - Header: the brand mark and "Admin", linking to `/admin`.
  - Nav entries, each with an icon and a label: "Experiments", "People" (admins only), "Data".
  - Footer: the signed-in email (muted), the composed `theme-toggle`, and "Sign out".
- **`ready` flags** (S23): each nav entry carries one. An entry that is not ready renders as a dimmed label, not a link, named "People, not built yet" (T's D-ADM-7 reading). None is unready at beat 1.
- **The active entry** gets the selection surface token plus `aria-current="page"`, never colour alone (C-P07).
- `/admin` goes to `/admin/experiments`.
- **Content area:** the page heading (`h1`), then the page. On an experiment, the heading is the experiment's title with its status word, then `Tabs`: Results, Reviewers, Access codes, Data (D-LAB-22).
- **Who gets in** (S4, S12a):
  - Not signed in: sent to `/auth/sign-in?next=<path>`, and back after signing in.
  - Signed in without a developer or admin role: the app's plain 404. An experiment's access code never opens `/admin`.
  - A developer has no People entry. `/admin/people` returns the same 404.
  - An unknown experiment slug under `/admin/experiments/` is the app's 404.
  - Every page and every action re-checks the role on the server, not only this layout.
- Noindex on the whole tree (S12).

## States

| State                                            | Key               | What shows                                                    | What the person can do | Copy                               |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------- | ---------------------- | ---------------------------------- |
| admin                                            | `shell-admin`     | All three entries                                             | Navigate               | —                                  |
| developer                                        | `shell-developer` | Experiments and Data                                          | Navigate               | —                                  |
| not ready                                        | `shell-not-ready` | A dimmed label                                                | Nothing                | —                                  |
| collapsed                                        | `shell-collapsed` | Icon strip; labels as tooltips                                | Expand                 | Expand control: "Show menu labels" |
| phone                                            | `shell-phone`     | Top bar; sheet on open                                        | Open, navigate         | Menu button: "Open menu"           |
| loading, empty, error, partial, offline, success | per page          | Owned by each page's file; the sidebar always renders at once | —                      | —                                  |
| not allowed                                      | `shell-not-found` | The app's 404                                                 | —                      | the app's own 404 copy             |

## Words

"Admin", "Experiments", "People", "Data", "Sign out", "Open menu", "Show menu labels" and "Hide menu labels". The tab labels are "Results", "Reviewers", "Access codes" and "Data".

## Access

- The sidebar is a `nav` named "Admin". The content is `main`.
- A "Skip to content" link comes first in the tab order.
- Collapsed entries keep their accessible names (tooltips are not the only name).
- **The sheet** traps focus and returns focus to the menu button on close.
- **Tabs** are real tabs or links with `aria-current`. Each tab is its own route, so the back button works.
- With reduced motion, the sheet and collapse transitions are instant.

## Instrumentation

None.

## Criteria

| ID            | When                                                     | Then                                              | Evidence |
| ------------- | -------------------------------------------------------- | ------------------------------------------------- | -------- |
| C-LAB-shell-1 | `/admin` is opened when not signed in                    | A redirect to sign-in with `next`, and back after | test     |
| C-LAB-shell-2 | Signed in with the `user` role, or holding only a code   | 404 on every `/admin` path                        | test     |
| C-LAB-shell-3 | A developer                                              | No People entry; `/admin/people` is a 404         | test     |
| C-LAB-shell-4 | Any `/admin` server action is called without a team role | It is refused                                     | test     |
| C-LAB-shell-5 | Any `/admin` response                                    | It carries noindex                                | test     |
| C-LAB-shell-6 | Keyboard alone at 390                                    | Open the menu, navigate, close; focus returns     | manual   |
| C-LAB-shell-7 | Each `?state=` key                                       | It renders at 390, 834 and 1440, light and dark   | capture  |

## Decisions and open items

D-LAB-22. None open.
