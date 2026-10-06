---
target: specs/web/ux/admin/overview.md
status: approved
promoted:
---

# Admin — overview

> Vesper, with Envoy (how results read), Gloss, Threshold and Warden (gap 4, erasure) consulted, from Taylor's rounds 1–7 (2026-10-05). Brief items in "What is settled" are cited as S<n> (S12b is item 12b); the brief's own (B1)–(B10) builder tags are not used here. Canon only: no `apps/web` design layer exists. The shell adapts T's admin shell (`app/admin/_components/admin-shell.tsx`, `admin-nav.ts`; T `ADMIN-UX-SPEC.md` §2–5), rebuilt on `@pem/ui`'s sidebar and never copied.

## Frame

The team is Taylor or a developer working with him, signed in with the developer or admin role, at a desk after the review window. The brief and the designs are side by side. The job: see who has reviewed, read what they said, choose a direction, and look after reviewers' data. That means making and revoking codes, deleting and erasing, and granting roles. The state is considered, not rushed, so the space goes to depth: full answers quoted as written, counts with n, and no dashboard theatre (A-09).

## Routes and surfaces

Route shapes are `[PROPOSED]`; Mason fixes them at Technical.

| Route | Surface | Entry from | Exit to |
| --- | --- | --- | --- |
| `/admin` | `shell.md` | Sign-in | `/admin/experiments` |
| `/admin/experiments` | `experiments.md` | Nav | An experiment |
| `/admin/experiments/<slug>` (tab Results) | `results.md` | List | Tabs; the team view |
| `…/<slug>/reviewers`, `…/reviewers/<reviewer-id>` (never the code itself) | `reviewer.md` | Tab | Data (erase) |
| `…/<slug>/codes` | `access-codes.md` | Tab | — |
| `…/<slug>/data` and `/admin/data` | `data.md` | Tab, nav | — |
| `/admin/people` | `people.md` | Nav (admin only) | — |

## Navigation and shell

The nav has three entries: Experiments, People (admins only) and Data. One experiment opens with the tabs Results, Reviewers, Access codes and Data (D-LAB-22). Detail is in `shell.md`.

## Decision log

| ID | Decision | Why | Date |
| --- | --- | --- | --- |
| D-LAB-3 | The record of actions (S12c) is a read-only list on the nav-level Data page | A record nobody can read is not much of one | 2026-10-05 |
| D-LAB-22 | Each experiment is a page with tabs; the nav is Experiments, People, Data | One place per experiment; erasure cuts across experiments | 2026-10-05 |
| D-LAB-23 | "Replace" issues a new code for the same reviewer; their pins and review carry over. It also restores a revoked code | Follows D-LAB-6 | 2026-10-05 |
| D-LAB-24 | Gap 4: the stale-data marker shows from the day of close, and the Experiments header counts such experiments. **"Not enough" means any closed experiment still holding guest data 90 days after close**, which brings back the pinned scheduled purge | Warden: a marker works only if it is seen and has a trigger | 2026-10-05 |
| D-LAB-25 | The config records the date an experiment closed | Exact; reviewable in the diff; no table (Mason ratifies) | 2026-10-05 |
| D-LAB-26 | **Only an admin deletes an experiment's data**, open or closed. Developers see the counts, not the button. Erasing a reviewer stays open to developers. **Amends S3** (Taylor, round 7, session instruction over the brief) | Taylor's call | 2026-10-05 |
| D-LAB-27 | Erasing an email also removes it from code labels and "Emails used". A code used only by that email is revoked and relabelled "Erased reviewer" | Erasure must reach every copy (Warden) | 2026-10-05 |
| D-LAB-28 | The record of actions never names a reviewer or an email | The record holds no personal data, so erasure never edits it | 2026-10-05 |
| D-LAB-29 | `/admin` also says "design"; "version" means only a review send ("version 2 of 3") | One word on both sides | 2026-10-05 |

## Open

- To carry at Technical, as brief amendments: S3 (D-LAB-26); the pinned "scheduled purge" row's trigger (D-LAB-24); S13 gains the close date (D-LAB-25).
- Routed to Technical: when a role change takes effect (`people.md` assumption).
