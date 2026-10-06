# LAB — data contract

> Detail for D-LAB-34, D-LAB-36, D-LAB-37 and D-LAB-41 (`../technical.md`). Shared by every ticket that reads or writes sandbox data. Mason, with Warden on erasure, 2026-10-05. Column order, relations and row types follow D-STK-5; this lists what the shape commits to, not every column.

## Tables (door 2)

All in `packages/db/src/schema/sandbox/`, prefixed `sandbox_`, each with `serviceOnlyPolicies` (door 4). There is no experiments table: an experiment is its config, keyed by slug (S14). A slug matches `^[a-z0-9]+(-[a-z0-9]+)*$`, at most 48 characters, and never changes once it holds data.

| Table | What it commits to |
| --- | --- |
| `sandbox_reviewers` | One person on one experiment (D-LAB-6): `slug`, `label`, `display_name` (beat 2, null in private mode), `code_hash` (unique), `code_version`, `revoked_at`, `first_design` (drawn once, S15), `last_design`. Replace rewrites the hash in place (D-LAB-23). |
| `sandbox_accesses` | One gate entry per device: `reviewer_id` (cascade), exactly one of `email` or `user_id` (S8), `code_version`, `last_seen_at`. "Emails used" is the distinct emails. |
| `sandbox_view_events` | `reviewer_id`, `access_id` (cascade), `slug`, `kind` (`load` or `switch`), `design`, `at`. The order log and time per design derive from it. Never written for the team (D-LAB-14). |
| `sandbox_comments` | `id` minted in the browser (retries insert with `on conflict do nothing`), `slug`, `design` (S17), `number`, `kind` (null or `problem`, `question`, `suggestion`, `keep`), `body` (at most 2,000 characters), `anchor` (jsonb: marked id, id or path, plus x and y fractions), `viewport_w`, `viewport_h`, `client_created_at`. Author: either `reviewer_id` plus `access_id` (cascade), or `team_user_id` for a team note; a check holds exactly one. `parent_id` (beat 2) is in from beat 1. |
| `sandbox_review_versions` | `id` minted in the browser, `reviewer_id`, `access_id` (cascade), `slug`, `number` (unique per reviewer), `core_version`, `answers` (jsonb), `triage` (jsonb, keyed by comment id, with "matters most"), `created_at`. Results read each reviewer's latest. |
| `sandbox_actions` | The record of actions (S12c): `at`, `actor_user_id`, `actor_email`, `action`, `slug`, `target_email` (role changes only: a team member, never a reviewer), `counts` (jsonb). No reviewer column of any kind (D-LAB-28), so erasure never touches it. |
| `sandbox_gate_attempts` | `key_hash` (primary key), `failures`, `window_ends_at`, `locked_until`. No slug and no foreign key (gap 3). |

**Threads without a tombstone.** `parent_id` has no foreign key, a reply always points at its root (one level), and a reply copies its root's `design` and `anchor`. Erasing or deleting a root hard-deletes it, and the surviving replies still know where to draw "Comment removed" (C-LAB-threads-5). Beat 2 adds no migration.

**Deletion is hard everywhere.** A reviewer's "Delete" removes the row, and Undo re-inserts it under the same id. The queue drops an item before its delete is sent, so a late retry cannot bring it back.

## Erasure semantics (S27, S28, D-LAB-26, D-LAB-27)

Each runs in one transaction and writes one `sandbox_actions` row with counts only.

- **An experiment's data** (admins only): delete its reviewers (cascading to accesses, views, comments and versions) and its team notes.
- **An email** (developers and admins), across every slug:
  - delete the accesses with that email, or for a signed-in reviewer the accesses with their user id, found by account email through the service-role client;
  - the cascade removes every view, comment, reply and version that came through them;
  - then a label equal to the email (ignoring case) becomes "Erased reviewer";
  - a reviewer left with no access, whose only email this was, is revoked and relabelled;
  - a name label is cleared only when ticked.
- **Why by access, not by reviewer:** a code used with two emails keeps the other email's data ("Each is erased separately", data.md).

## The viewer the data-access module takes (door 4)

```ts
type Viewer =
  | { kind: "reviewer"; slug: string; reviewerId: string; accessId: string }
  | { kind: "team"; userId: string; email: string; role: "developer" | "admin" };
```

- Every function in `@pem/db/sandbox` takes `(db, viewer, input)`. The type makes an unscoped call impossible to write by accident; the isolation tests prove it.
- A reviewer function filters by `viewer.reviewerId` and `viewer.slug`. In beat 2's collaborate mode it widens reads to the slug's reviewer comments, never team notes.
- A team function refuses a reviewer viewer. An admin-only function (deleting an experiment's data) refuses a developer.

## Config (per experiment, `_experiments/<slug>/config.ts`)

`slug`, `title`, `designs` (1 to 4, each `{ id, shape, component }`; shapes circle, square, triangle, diamond, D-LAB-10), `goals` (2 to 3), `targetedQuestion?`, `questions`, `mode` (`private` or `collaborate`), `coreVersion` (`v1`), and **`closedOn`: an ISO date, or null while open** (D-LAB-25, D-LAB-41). One field means closed always has a date. A registry test validates every config with zod and refuses a duplicate slug or a future `closedOn`.

## Limits and where state lives

- **Limits:** a comment body at most 2,000 characters; at most 500 comments per reviewer per experiment `[PROPOSED]`; an anchor at most 2 KB; answers at most 64 KB (as T `app/api/review/_lib/http.ts:12`). Errors are fixed strings that never echo input.
- **Server:** every record.
- **Browser storage:** the unsent-pin queue and the review draft, per slug and reviewer, cleared as ended.md and review.md say.
- **Cookies:** `sandbox_access` and `sandbox_gate` (`gate.md`).
- **URL:** the path, `?state=` and the link's `?r=` only; never an email or a code.
- **`?state=` keys** (C-P08): gate keys render for anyone, since they hold no data and the gate stays one face. Every other sandbox key renders only for the team, on synthetic fixtures.
- **Time:** the confirmation email formats times in `Europe/London` with the zone named, one constant in `apps/web/lib/sandbox/` (D-LAB-41). The gate's lock time and ended.md's date use the reader's locale and zone.
