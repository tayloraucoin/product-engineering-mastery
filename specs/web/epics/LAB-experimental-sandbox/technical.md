---
epic: LAB
status: approved
---

# LAB — technical notes

> Mason, with Warden consulted on doors 1, 3, 4 and 7, gap 3 and erasure, 2026-10-05, from the brief (S-items) and the approved `ux/` (D-LAB-1 to 29). Quartermaster was not needed: nothing new is installed. Detail every ticket shares is in `technical/placement.md`, `technical/data-contract.md`, `technical/gate.md` and `technical/tests.md`. Labels: verified (read, dated), secondary, judgment.

## Appetite verdict

Possible in 5 working days for beat 1 (judgment, Mason), if nothing new is installed, no package is added, and the roughly 16 half-day tickets build in two parallel waves once the schema and gate land; serially they do not fit. The risk is the comment layer, not the gate. If day 3 runs late, the cut is Taylor's call.

## Calls routed to Taylor

All twelve ratified by Taylor on 2026-10-05, as recommended. No one-way door is open.

| ID                  | Call                  | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                              | If wrong                                                                     |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| R1 · D-LAB-30 to 32 | Door 3: the gate      | The split, minus `proxy.ts`: the page checks the cookie's signature, slug and age before any database read, then `access.ts` checks code, version, open or role. The gate renders in place (no redirect, no rewrite), one component for every slug. Noindex via `next.config.ts` `headers()`, so D-STK-7 stands as written. Codes: 16 Crockford symbols, forgiving input, SHA-256. Cookie per slug, Lax, 30 days fixed. `technical/gate.md` | Code format and hashing are permanent once issued; the rest is reversible    |
| R2 · D-LAB-34       | Door 4: guest rows    | As the brief proposed. Every sandbox table is service-only. `@pem/db/sandbox` functions take `(db, viewer, input)`, and a lint element (`web-sandbox`) lets only `apps/web/lib/sandbox/` import them. Isolation is proven by tests. Residual risk accepted on the record: isolation rests on one module, not RLS. Revisit when a second feature needs guest rows                                                                            | A missed scope leaks one reviewer's pins to another; the tests are the guard |
| R3 · D-LAB-35       | Door 1: roles         | `developer` joins `APP_ROLES`. **No policy twin in v1**: no policy would read it (rule 9). People writes `app_metadata` via the service-role client, with the last-admin guard in the action                                                                                                                                                                                                                                                | Renaming the role later is a data change on every holder                     |
| R4 · D-LAB-36       | Door 2: tables        | Seven `sandbox_` tables keyed by slug; variant tag and `parent_id` on comments from beat 1; hard delete; codes rotated in place; a record with no reviewer column; erasure by access row, scrubbing labels and emails used. `technical/data-contract.md`                                                                                                                                                                                    | Every later change is a migration on personal data                           |
| R5 · D-LAB-37       | Door 6: identity      | The reviewer is the reviewer row (one code at a time); each gate entry records its email or user id per device, and every row carries both                                                                                                                                                                                                                                                                                                  | Re-keying to verified accounts later needs a migration                       |
| R6 · D-LAB-38       | Door 7: addresses     | Ratify every UX route as written. Also `/admin/experiments/<slug>` is Results, and the reviewer erase page is `/admin/data?reviewer=<reviewer-id>`. The email link is `/experimental/<slug>?r=<token>`: a signed access id that fills the email and never grants access. Slugs are named as if they will leak                                                                                                                               | Links in inboxes cannot be recalled                                          |
| R7 · D-LAB-39, 43   | Door 5: placement     | `apps/web` plus `@pem/db`; no new package; server actions only, with no route handler or tRPC. Stack entry `experimental-sandbox`. Removal undoes every shared edit except applied migrations (dropped by a new migration) and `developer` while another feature reads it. `technical/placement.md`                                                                                                                                         | Moving later is a one-time cost                                              |
| R8 · D-LAB-33       | Gap 3: throttle       | Two counters, browser cookie and client address (IPv6 /64), stored only as HMACs in a table with no slug and no feedback link. Rows live 30 minutes at most. 5 tries per browser and 30 per network in 15 minutes, then a 15-minute lock. Keyed globally, so unknown slugs throttle alike                                                                                                                                                   | Thresholds are one constant                                                  |
| R9 · D-LAB-40       | Gap 2: hidden design  | Unmounted. Both designs render on the server; the switcher mounts only the shown one, so the two designs' own ids never share a document. Switching needs no request; a design's own state resets, which is accepted                                                                                                                                                                                                                        | Reversible, inside one component                                             |
| R10 · D-LAB-41      | Time zone, close date | `Europe/London`, named in the email, one constant. The config's `closedOn` is an ISO date or null, one field, so closed always has a date                                                                                                                                                                                                                                                                                                   | Both reversible                                                              |
| R11                 | people.md timing line | "Changes take effect the next time they open a page.": `getUser()` reads the Auth database on every request (verified, `technical/gate.md`). The UX file stays as approved; the People ticket builds these words and promotion reconciles them                                                                                                                                                                                              | Wrong words on one page                                                      |
| R12 · D-LAB-42      | S12 robots            | Noindex header and meta only; no robots disallow, since a disallowed page's noindex is never read (secondary, Google Search Central, as known at June 2026)                                                                                                                                                                                                                                                                                 | Reversible                                                                   |

## One-way doors

| Door         | Path glob                                                            | Ratification   | Reviewer      |
| ------------ | -------------------------------------------------------------------- | -------------- | ------------- |
| 1 Roles      | `packages/db/src/rls.ts`, `apps/web/app/admin/people/**`             | R3             | mason, warden |
| 2 Tables     | `packages/db/src/schema/sandbox/**`, `packages/db/migrations/**`     | R4             | mason, warden |
| 3 Gate       | `apps/web/lib/sandbox/**`, `apps/web/next.config.ts`                 | R1, R8         | warden, mason |
| 4 Guest rows | `packages/db/src/sandbox/**`, `packages/config/eslint/boundaries.js` | R2             | mason, warden |
| 5 Placement  | `toolkit.json`, `packages/db/package.json`                           | R7             | mason         |
| 6 Identity   | as door 2                                                            | R5             | mason, warden |
| 7 Addresses  | `apps/web/app/experimental/**`, the email sender                     | R6             | warden        |
| 8 Notice     | gate.md's Words, as built                                            | approved at UX | warden        |

Verified 2026-10-05: no `toolkit.json` reviewer row matches `rls.ts`, `policies.ts` (`**/policies/**` is a folder glob) or `apps/web/lib/sandbox/**`, so the Tickets stage names these reviewers by hand.

## Brief amendments

Approved at the UX gate; applied to `brief.md` on 2026-10-05:

1. S3: only an admin deletes an experiment's data; developers can still erase a reviewer (D-LAB-26).
2. Pinned "scheduled purge": comes back when any closed experiment still holds guest data 90 days after close (D-LAB-24).
3. S13: the config also holds the date an experiment closed (D-LAB-25).
4. S29: the notice says the email is used to send a confirmation (D-LAB-19).

## Test shape per risk

One row per risk, in `technical/tests.md`.

## Rabbit holes

- **Patched:** a rewrite would fight the gate's action, so the gate renders in place; mounted designs would collide on ids, so the hidden one unmounts; pins are capped at 500 per reviewer `[PROPOSED]`; the last-admin race is accepted and recoverable; the client address is an `[ASSUMPTION]` the gate ticket verifies.
- **Out of bounds:** beat 2's build, a robots file, analytics, email verification, a scheduled purge, code expiry.
