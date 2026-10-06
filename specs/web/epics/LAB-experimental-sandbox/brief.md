---
epic: LAB
status: draft
---

# Brief — The experimental sandbox

> Framed 2026-10-05 by Compass, consulting Mason, Vesper, Envoy and Warden, from the builder interview and Taylor's answers to four rounds of Frame questions. It builds what the feature-exploration track's "Where it lives" section promises (`docs/workflows/tracks/feature-exploration.md`). Taylor passed Frame go on 2026-10-05; his gate answers are cited as (Frame go).
>
> Labels: **verified** means read from code or a primary source, with a date. **Secondary** means someone else's claim. **Judgment** means the named role's call. **Estimate** is a guess at size. Markers: `[ASSUMPTION: …]`, `[PROPOSED]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`.
>
> The template asks for no solution vocabulary. The operator's prompt asks for the settled decisions to be carried here so the UX spec re-asks none of them (precedence rung 2 over the template). So Job, User and Metric stay free of solution words, and the decisions sit in their own section, "What is settled".

## Job

- **Trigger:** "I've built two directions for the client's pricing page. I need the client and their two colleagues to look at both, tell me what's wrong where they see it, and say which one to take forward, without a call, a Figma invite or an email thread."
- **Baseline:** today an exploration in code can only sit behind sign-in, and the track says so in its fallback paragraph (verified, `feature-exploration.md`, 2026-10-05). Feedback is gathered by hand: screenshots in email, a call, Figma comments on a copy, or Vercel preview comments, which need every commenter to have a Vercel account (secondary, `research/variant-feedback.md` §4, as accessed Oct 2026). What goes wrong:
  - feedback lands in several places, with no record of who said what about which variant;
  - a client shown one design alone praises it more and criticises it less, so the signal is inflated (verified, Tohidi et al. 2006, via the research note);
  - each client repo has rebuilt a review layer from scratch: Kryshan with one shared code, and taylor-aucoin with a separate ingest backend (verified, read 2026-10-05; see Prior art).

## User

- **The reviewer:** a client, or a colleague of theirs, invited by Taylor. They are not signed in, have no account, and arrive from a link on a laptop or a phone, often between other work. They are polite to the designer by default. They will spend minutes, not an hour.
- **The team:** Taylor, or a developer working with Taylor, signed in with the developer or admin role. They run the exploration, invite reviewers, read the results and decide a direction. They work at a desk, after the review window, with the brief and the variants side by side.

## Metric

- **Signal:** a qualitative bar, named plainly. The first real exploration after this epic ships collects every reviewer's on-screen comments and closing review through the sandbox, and Taylor picks a direction from `/admin` alone, with no feedback gathered by email, call or Figma. (Taylor, Frame round 1.1.)
- **By when:** the first exploration run through the sandbox after LAB ships, whichever that is. If none runs within 60 days of shipping, Compass reopens whether the sandbox earned its place: that is the EN-05 counter-evidence below (judgment, Compass; Taylor at Frame go: "use common sense").
- **Kill criterion:** that exploration needed a separate feedback round outside the sandbox to reach a decision.

## Evidence

- **The promise exists; the feature does not** (verified, 2026-10-05). `feature-exploration.md` §"Where it lives" sets `/experimental/<slug>`, the developer-or-admin rule and the code for everyone else, and says plainly that until the gate is built, pages sit behind sign-in only. `apps/web/app/` has no `experimental` or `admin` route today. `APP_ROLES` is `user | admin` (`packages/db/src/rls.ts`).
- **The pieces have worked before, in three repos** (verified, read 2026-10-05; table under Prior art). Each one stopped short of what this needs:
  - Kryshan's gate has no per-reviewer identity, no revocation short of rotating the secret, and no limit on wrong codes.
  - Its final submission does not carry the comments, only a count of the ones still unsent (`lib/review/pending-store.ts:78-94`; taylor-aucoin `docs/review/specs/DEVIATIONS.md:24`).
- **How to ask** (`research/variant-feedback.md`, Envoy, filed 2026-10-05):
  - verified: showing alternatives lowers inflated ratings;
  - verified: order effects are large and randomising only spreads them;
  - verified: item-specific scales beat agree/disagree;
  - judgment: comments and the closing form do different jobs.
  - The note found no study of client reviews with toggled variants. Every transfer from the lab is inference.
- **Counter-evidence:**
  - No first product is named. The starter's own rule (EN-05, conventions rule 9) says nothing should exist before its first consumer. Taylor's ruling of 2026-10-03, that a convention set in advance beats one invented per project, is the answer on record, and the demo experiment is the stand-in consumer.
  - Kryshan's one shared code was enough for a single client. Per-reviewer codes, emails, versions and a results view may be more than a one-client exploration needs (judgment, Compass). The answer: the kill criterion above, and a removable stack entry.
  - Taylor chose hand deletion over a schedule (round 1.2). So the guest notice cannot promise a date, and data held past its use is Warden's first-rank risk (judgment, Warden). See Knowledge gap 4.

## Appetite

- Small batch: **5 working days** for beat 1 (Taylor, rounds 3b.4 and the builder interview).
- Beat 2, collaborate mode, is cut into its own tickets in this epic and built after beat 1 passes. Estimate: 1 to 2 days.

## Mode

- Production. This ships into the starter as a removable stack piece.

## Decision this unblocks

- Whether explorations run in code, with client feedback collected in the app, instead of in Figma and email.
- Whether the feature-exploration track can drop its "until it is built, sign-in only" fallback.
- Next to decide: Vesper, at the UX stage, from this brief without re-asking.

## What is settled

Builder interview items are cited as (B1)…(B10), and Frame answers by round, for example (F2.2). Nothing below is open unless it carries a marker.

### Roles and access

1. **Roles** (B1). A `developer` role is added beside `admin`. Both open every experiment and `/admin`. Only `admin` grants roles. The role is read from `app_metadata.role`, which only the service role can write (verified, `packages/auth/src/context.ts`).
2. **Granting roles** (F2.4). A **People** page in `/admin` lists signed-up users and their role, and an admin sets `user`, `developer` or `admin`. A guard stops the last admin from removing their own role. The first admin is set once by a runbook step (a script using the service key).
3. **What a developer can do in `/admin`** (Frame go). For now, everything an admin can do except granting roles and deleting an experiment's data. That includes making and revoking codes and erasing a reviewer. Only an admin deletes an experiment's data (D-LAB-26, Taylor round 7). What should separate the two roles is pinned for a later conversation (see "Pinned for later").
4. **`/admin` for anyone else** (F4.3). Not signed in: sent to sign-in, then back. Signed in without a team role: a plain 404. An experiment's access never opens `/admin`.

### The gate

5. **Who goes straight in** (B2). A signed-in developer or admin.
6. **Everyone else enters an access code** (B2). Codes are per reviewer and per experiment. They are made in `/admin` and can be revoked.
   - The admin labels each code with the reviewer's name or email when making it (F2.1).
   - Codes are long and random, stored only as a hash, and shown once at creation. A lost code is replaced, never re-shown (Warden; accepted at Frame go).
7. **A guest who is not signed in types an email first** (B2). It is not verified.
   - The typed email is recorded beside the code's label and never compared with it (F2.1). A mismatch shows in `/admin`.
   - A short notice says what is stored and why (B2).
8. **A signed-in user without a team role who enters a valid code** reviews under their own account, with no email step (F1.4). Their views and feedback carry their user id and the code. Their role is unchanged, and the code opens only that experiment.
9. **Attribution** (B2). Every view and every piece of feedback records who it came from (the auth user, or the guest email) and which code was used.
10. **Code lifetime** (F2.2).
    - A code works until it is revoked or the experiment closes. There is no expiry date in v1.
    - Access on a device lasts 30 days. Every request re-checks that the code is still live, so revoking takes effect on the reviewer's next page load. Kryshan could not do this (verified, `lib/review/access.ts:55-57`; no store found).
11. **Wrong codes** (F2.3). After a handful of wrong tries from one browser or network, entry pauses for a few minutes, and the page says when to try again. The thresholds are set at the Technical stage.
12. **Not indexed.** `[PROPOSED]` (Warden): `/experimental` and `/admin` send a noindex header and are disallowed in robots, as in Kryshan (verified, `proxy.ts:24-27,50-52`, `app/robots.ts:9`) and taylor-aucoin (`app/admin/layout.tsx:21-23`).
12a. **Checked at every door, not just the route.** Every server action and route handler checks again, beyond the gate and the `/admin` 404 (Warden). This is part of the gate direction in one-way door 3, which Taylor delegated at Frame go ("use best practices").
    - `/admin` actions, including People and erasure, re-check the role.
    - A guest write re-checks for a live code that belongs to this experiment while it is open.
    - taylor-aucoin did this (`server/services/admin-auth.ts:27-30`). Kryshan checked only in the proxy, and its access page itself was ungated (`proxy.ts:13-15`).
12b. **Nothing leaks that an experiment exists** (Warden; accepted at Frame go). To someone without a live code, an unknown slug, a wrong code, a revoked code and a closed experiment look the same. The "review has ended" state (item 16) shows only after a code is entered, or to the team.
    - Why the state exists at all: a reviewer who comes back from the confirmation email or a bookmark after close would otherwise meet the gate again, or an error, and conclude their review was lost or the link is broken. The state says the review is over and theirs was received. Gloss words it at UX.
12c. **Who did what is recorded** (Warden; accepted at Frame go). Granting a role, making or revoking a code, deleting an experiment's data and erasing a reviewer each leave a record of who acted and when. An erasure record keeps a count, never the erased email. Neither prior-art repo kept such a record. It is one more table, so it joins one-way door 2.

### Experiments

13. **Defined in code** (B3). There is one folder per experiment in the experimental route group, at `/experimental/<slug>`, never linked from the product.
    - Its config holds: slug, title, variants, feedback kinds, extra questions, and open or closed, with the date an experiment closed (D-LAB-25).
    - `[PROPOSED]` (Envoy): the config also holds the 2 to 3 goals shown with the goal-fit question, and an optional targeted question.
    - The config holds the mode, `private` by default or `collaborate`, which is beat 2 (F3b.3).
14. **The database holds codes, viewers, comments and reviews** (B3).
    - An experiment is keyed in the database by its slug. Once an experiment has data, its slug cannot change, because renaming would orphan the rows (Mason; accepted at Frame go). One-way door 2.
15. **Variants are optional** (B4).
    - With several variants, the viewer toggles between them and gives feedback on each, on how they compare, and on which they prefer and why. There is no random split, and everyone sees every variant.
    - For each reviewer, the variant that loads first is chosen at random and fixed (F3.4).
    - The preference options are shuffled. Labels are neutral: shape or colour tokens, never A/B or 1/2 (F3.4).
    - Logged per reviewer: the first variant seen, the last variant viewed before the preference, the toggle count, and the time on each variant (F3.4; research §2).
16. **Open and closed** (B8). Set in the config. When closed:
    - the team can still view;
    - guests see a "review has ended" state, including guests arriving from the confirmation email's link;
    - no new feedback is taken, and no edits.

### Feedback

17. **On-screen comments** (B5). Placed on the screen Figma-style, as in Kryshan:
    - anchored to an element, with the position stored as a fraction of its box;
    - numbered pins;
    - a comment that fails to send is queued and retried with the same id.
    - Each comment is tagged with the variant it was placed on.
    - `[PROPOSED]` (Envoy): an optional one-tap type on each pin: Problem, Question, Suggestion, Keep this.
18. **Who sees which pins** (F3.2, F3.3).
    - In `private` mode, a reviewer sees only their own pins.
    - The team sees every pin, filtered by reviewer and variant, and can leave pins of its own. These are marked `team` and kept out of client tallies. The team cannot submit the closing form.
19. **Devices** (F4.4). Pins can be placed and read by tap on a phone, by mouse, and by keyboard with a screen reader. Threshold designs the keyboard and screen-reader path at UX. Kryshan had neither (verified: `comment-layer.tsx` has no keyboard placement, and pins carry only a `title`).
20. **The closing review** (B6). A standard core, plus questions set per experiment. Envoy and Vesper decide the core.
    - Envoy's recommendation, from `research/variant-feedback.md` §1, accepted at Frame go. Vesper sets the final wording at UX, and the wording is then versioned.
    - **Every review:**
      1. goal fit, on a labelled 5-point item-specific scale, asked before the pins are shown;
      2. triage of the reviewer's own pins (must change, should change, fine either way, plus "most important");
      3. "what would stop you approving this as it stands?", with a "nothing, I'd approve it" box;
      4. "anything missing?";
      5. next step, a forced choice: approve as is, approve once my must-change items are done, another round first, or rethink the direction.
    - **With variants, added:**
      1. goal fit per variant;
      2. an optional main weakness per variant;
      3. then the preference: a forced choice with Combine, None of these and No preference, unlocked only when every variant has been viewed and rated;
      4. the strength of the preference (slight, clear or strong);
      5. the reasons, after the choice;
      6. "anything from the other version(s) to carry over?"
    - "Do you like it?", NPS and agree/disagree items are excluded.
21. **The submission bundles the reviewer's comments** (B5). The form plays every pin back for triage, and the send stores the triage with the answers. This is new: neither prior-art repo bundled comments.
22. **Confirmation and edits** (F3.1, F3.b1, F3.b2).
    - On sending, the reviewer gets an email through `@pem/email` confirming the send.
    - It carries a link back that is a **convenience, not a key**: it opens the experiment with the email filled in, and the code is still required.
    - The reviewer can change their review until the experiment closes.
    - Each send is kept as a numbered version, which records the pin triage as it was then.
    - Results and the preference tally use each reviewer's latest version. `/admin` shows "version n of m", with earlier versions expandable.

### `/admin`

23. **Shell** (B7). A role-gated dashboard with a side navigation, as in taylor-aucoin: nav entries carry a `ready` flag, and a sheet opens on a phone. It is rebuilt on `@pem/ui`'s sidebar primitive.
24. **Pages** (B7, F2.4):
    - **Experiments**, a list.
    - **Results**, per experiment:
      - views;
      - comments by variant;
      - review answers (the latest version, with history);
      - the preference tally and its strength;
      - the order log (first and last seen, toggles).
    - **Access codes:** make, label and revoke, per experiment.
    - **People:** grant roles, admin only.
25. **How results read** (Envoy, research Recommendation 4; accepted at Frame go, with Taylor's rider: know when an average or a percentage is the better choice).
    - One reviewer's rating shows as its label.
    - Across reviewers, every question shows the count for each label, with n.
    - The preference tally shows counts and strengths, with n.
    - A percentage, and a median for the labelled scales, are added once a question has at least 10 answers on the same wording version, always shown with n. Below 10, one person moves a percentage by 10 points or more, and the research warns that numerical ratings need larger samples (secondary, NN/g 2024, via the note). The threshold of 10 is Envoy's judgment.
    - No mean is shown on a labelled scale: its points are ordered but not evenly spaced (judgment, Envoy).
    - Free text is quoted as written.
    - A slight preference that matches the first-seen or last-seen variant is flagged as weak signal.

### Guest data

26. **Held:**
    - the typed email, or the user id;
    - the code used;
    - views (when, which variant, the order log);
    - comments with the viewport size;
    - review versions.
    - `[PROPOSED]` (Warden): nothing else. No IP address or user agent is stored with feedback, and the wrong-code throttle keeps only short-lived counters.
27. **Retention** (F1.2). Kept until an admin deletes an experiment's data by hand. There is no schedule.
    - `[PROPOSED]` (Warden): `/admin` marks a closed experiment that still holds guest data, with the days since it closed, so hand deletion has a prompt. Knowledge gap 4.
28. **Erasure** (F1.3). An admin erases one email from `/admin`. Every view, comment and review version from that email, across all experiments, is hard-deleted, not anonymised. The notice says whom to ask.
    - `[ASSUMPTION: the contact is @pem/brand's contact email.]`
29. **The notice** (B2). Shown before the email field. It says:
    - what is stored: the email, what they view, their comments and answers;
    - why: so the team knows whose feedback it is, and to send a confirmation (D-LAB-19);
    - how long: until the team deletes it after the review;
    - how to ask for erasure.
    - It follows standard practice for a notice given when data is collected: plain language, shown before the email field rather than behind a link, and naming whom to contact. No counsel review (Taylor, Frame go). Gloss writes the wording at UX.

### Shipping and removal

30. **Included** (B9):
    - a demo experiment in `apps/web`: two variants, comments and a form, with synthetic content only;
    - a `toolkit.json` stack entry with `locked: false` and its `files`, `env`, `dependencies` and `boundaries`, modelled on the `billing` and `ai` entries;
    - a removal runbook at `docs/runbooks/remove/experimental-sandbox.md`, shaped after Kryshan's SITE-9: phases, a zero-hit grep, a 404 check, and the operator's manual steps.
    - The entry depends on `db`, `auth` and `email`. `email` is locked in, with no removal runbook (verified, `toolkit.json`, `stack.email.locked: true`), so the confirmation email can rely on it.
31. **Two beats** (F3b.4).
    - Beat 1: everything in this section except collaborate mode.
    - Beat 2: `collaborate` mode. Every reviewer and the team see all pins and can reply in a one-level thread under a pin. There is no resolve, and the closing form stays individual (F3.2, F3b.3).
    - The comment table is shaped for threads in beat 1, so beat 2 adds no migration to it. One-way door 2.

## Out

Out of this epic, and not pinned: random A/B assignment (B10, superseded by "everyone sees every variant"), and comments on product pages.

### Pinned for later

These are deferred, not refused (B10, F4.1). Taylor called them valuable after v1. Each names what would bring it back. A follow-up epic (LAB2) starts its Frame here.

| Item                                   | Why not now                                                                                               | Brings it back                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| CSV export of results                  | `/admin` is the one place to read results in v1                                                           | Results needed outside `/admin` (a client report, analysis across several explorations) |
| Email verification                     | The edit link is a convenience, not a key, so nothing rests on the address                                | Anything that uses the email as a credential or a legal record              |
| Creating experiments in the admin UI   | Experiments are code, so a direction can move into the product without being rebuilt                      | A non-developer needs to run an exploration                                 |
| A team email per submission            | `/admin` is the one place; `@pem/email` makes this cheap later                                            | A review sat unread for more than two days                                  |
| Analytics on experiment pages          | The sandbox's own tables already record views and toggles; analytics would widen the notice                | A question the order log cannot answer                                      |
| Screenshots on pins                    | Position, variant and viewport are stored; Kryshan left screenshots out too                               | Pins that cannot be re-placed because the variant's markup changed          |
| Resolve or status on pins              | Decisions go to `findings.md`                                                                             | Beat 2's threads make "is this handled?" a question reviewers ask           |
| What separates developer from admin, and whether roles (the first admin included) are set during new-project setup | For now a developer can do everything an admin can except grant roles (Frame go) | A second developer joins, or a product needs a role with less than all of `/admin` |
| Expiry dates on codes                  | Revoking and closing cover v1 (F2.2)                                                                      | Codes shared beyond the person they were made for                           |
| A scheduled purge of guest data        | Taylor chose hand deletion (F1.2)                                                                         | Any closed experiment still holds guest data 90 days after close (D-LAB-24, Warden), or a client asks for a date |

## Prior art

Read on 2026-10-05, read-only, with no `.env` files opened (verified). Repos: K is `clients/kryshan-film-portfolio`, T is `taylor-aucoin`, and C is `conscious-connections/apps/toolkit`. Each piece is cited as **reuse**, **adapt** or **replace**. Nothing is copied: the Build stage rebuilds on `@pem/*`.

| Piece | Where it works | Verdict | What changes, and what the prior art lacked |
| ----- | -------------- | ------- | -------------------------------------------- |
| Code gate | K `lib/review/access.ts:22-37` (trimmed, length-checked `timingSafeEqual`; HMAC-signed `<issuedAt>` cookie); K `app/review/access/_actions/enter-code.ts:38-49` (HttpOnly, `sameSite: lax`, `path: /review`, 30 days, `?next=` checked against the gated tree); K `proxy.ts:24-52` | **adapt** | One shared env code becomes hashed per-reviewer, per-experiment codes in the database. Adds email capture, live revocation (K had none) and a wrong-code throttle (K had none: `enter-code.ts:32`, `REVIEW-BACKEND-CONTRACT.md:146`). |
| On-screen comments | K `lib/review/anchor.ts:33-98` (`data-review-id`, then `id`, then an nth-of-type path; x and y as fractions of the box); K `review-context.tsx:105-183` (numbered pins; browser-minted uuid; queue retried with the same id); K `comment-layer.tsx:76-96` | **adapt** | Adds the variant tag. Rebuilt on `@pem/ui` popover, sheet, tooltip and toast. Adds keyboard and screen-reader placement and labelled pins (K had neither). Retries on load as well as on the button (K's docs claimed load retry; the code had only the button). |
| Form as data | K `lib/review/types.ts:105-135` (sections; kinds rank, scale, choice, text); K `lib/review/build-answers.ts:18-134` (checked on the server; labels from the server; unknown ids rejected) | **adapt** | A versioned standard core plus questions per experiment. Adds the per-variant, comparison and preference sections, and the pin playback. |
| Bundled submission | K `final/_actions/submit-final.ts`; T `DEVIATIONS.md:24` | **replace** | K's submission carried only a count of unsent comments. Here the send stores the triage of every pin, and versions are kept. |
| Data model | T `db/schema/review-rounds.ts:30-66`, `review-comments.ts:33-62` (client-generated id, jsonb `target`, viewport, soft delete), `review-submissions.ts:22-37` (jsonb payload) | **adapt** | Experiment, variant, code and viewer replace client and engagement. Drizzle in `@pem/db`, with its policies. Hard delete for erasure (T used soft delete). T stored no reviewer identity, and this stores an email or a user id. |
| Ingest | T `server/services/review.ts:80-175` (shared bearer key; idempotent through the primary key, `onConflictDoNothing`); T `app/api/review/_lib/http.ts:12-66` (64 KB cap, fixed error bodies) | **adapt** | Same app, so no bearer key. Idempotency through client ids carries over, as do the size cap and the fixed errors. |
| Results view | T `app/admin/(protected)/design-reviews/page.tsx:30-78` (list: counts, status); `[id]/page.tsx:79-229` (forms, oldest first; comments grouped by path) | **adapt** | Grouped by experiment and variant. Adds the preference tally, versions, the order log and code management. |
| Admin shell | T `admin-shell.tsx:48-84` (rail `w-60`, collapsing to `w-14`; a sheet below `lg`); T `admin-nav.ts:21-56` (`{title, href, icon, ready}` in sections); T `server/services/admin-auth.ts:43-135` (`getUser()` plus `app_metadata.role`, checked in the layout and again in every page and action); T `app/admin/layout.tsx:21-23` (noindex) | **adapt** | Rebuilt on `@pem/ui`'s sidebar. Signed-in users without a role get a 404, not T's redirect to login (F4.3). Roles are granted on a People page, not T's `scripts/grant-admin.ts`. Note: T's own spec contradicts itself on `ready` (`ADMIN-UX-SPEC.md:137` against `:71-77`), and the code follows D-ADM-7. |
| Role check | C `lib/auth/is-viewer-admin.ts:8-14` (a lookup cached per request with `cache()`) | **replace** | Superseded by `@pem/auth` `roleOf`. C keeps its role in `public.users.role`, not `app_metadata`, and its "developer" is an admin-only query flag (`lib/onboarding/admin-developer.ts:2-16`), not a role. The developer role here is new. |
| Removal | K `docs/specs/03-site-build/SITE-9-style-guide-and-review-removal.md:79-250` (four phases; a STOP gate on a tag; a zero-hit grep; `/review` returns 404; before-and-after screenshots; the operator deletes env vars) | **reuse** (shape) | The runbook follows the shape of `docs/runbooks/remove/billing.md` and `ai.md`, with SITE-9's checks. |

Extended in this repo, never duplicated:
- `packages/db/src/rls.ts`: `APP_ROLES` gains `developer`.
- `packages/db/src/policies.ts`: `appUserIsAdmin` gets a developer-or-admin twin. Guest rows are expected to use `serviceOnlyPolicies`, which is one-way door 4.
- `packages/auth/src/context.ts`: `roleOf` and `AuthContext`.
- `apps/web/proxy.ts`.
- From `packages/ui/src/`: `primitives/navigation/sidebar`, `primitives/layout/sheet`, `primitives/feedback/{popover,tooltip,toast}` and `composed/display/data-table`.

## One-way doors

Each is decided at the Technical stage (Mason ratifies, Taylor rules), and each is named here so nothing slips through as a detail.

1. **The role list, where roles live, and who can write them.**
   - `APP_ROLES` gains `developer`, written into users' `app_metadata` in Supabase. Today the only role check in a policy is an exact `= 'admin'` match (`packages/db/src/policies.ts:23`), used only by `ownerRowPolicies` (`:66`). So `developer` reaches a policy only through the developer-or-admin twin. Once the twin ships and users hold the value, renaming it means a data change on every holder.
   - **Where roles live.** The People page commits to `app_metadata` as the only home of a role, with no row to join or audit. taylor-aucoin marks moving roles to a table as a revisit (`server/services/admin-auth.ts:21-25`). That move would be a migration across every role holder.
   - **Granting from inside the app.** The People page writes `app_metadata` through the service-role client. It is the first surface where the app itself can make an admin. It is authorization topology, not a page detail.
2. **The tables.** Codes, viewers, views, comments, reviews and review versions, under `@pem/db` with RLS. Within them:
   - the slug as the key to an experiment;
   - the variant tag on comments;
   - the parent id on comments, for beat 2's threads;
   - hard delete as the erasure semantics.
   Once they are migrated and hold reviewers' data, each change is a migration on personal data.
3. **The gate.**
   - How codes are hashed: changing it invalidates every code already issued.
   - The cookie's name, scope and signing.
   - Where the check runs. `proxy.ts` "authorizes nothing" under D-STK-7 (verified, the file's header), the operator's prompt puts the gate there, and a live revocation check needs a database read on every request. Taylor delegated this at Frame go ("use best practices").
   - Direction, `[PROPOSED]` (Mason ratifies at the Technical stage): split the check in two.
     - **In `proxy.ts`, an optimistic check:** the experiment cookie's signature and its slug scope, with no database read. A missing or bad cookie redirects to the gate, and the noindex header is set there.
     - **Next to the data, the authoritative check:** the code is still live, the experiment is open, or the role allows it. It runs in the one data-access module that every experimental page, server action and route handler calls (item 12a).
     - Basis: Next.js's authentication guidance puts optimistic, cookie-only checks in proxy and real authorization next to the data (secondary; Next.js docs as known at June 2026, to be re-checked against the installed version at the Technical stage).
     - D-STK-7 then needs only a wording amendment: proxy refreshes the session and redirects optimistically, and it still authorizes nothing.
4. **How guests reach their rows.** The RLS bridge admits only a UUID user with an `APP_ROLES` role (`packages/db/src/rls.ts:37-48`), so a guest holding a code cannot pass through it. Taylor delegated this at Frame go.
   - Direction, `[PROPOSED]` (Mason and Warden ratify at the Technical stage): every sandbox table uses `serviceOnlyPolicies`. That is the repo's existing factory for rows no signed-in user owns, and its docstring says "service code reaches the table through the singleton" (verified, `packages/db/src/policies.ts:87`).
   - Every read and write, by guests and the team alike, goes through one server-only data-access module. It takes a verified viewer (a guest's live code and experiment, or a team role) and scopes every query by it.
   - Isolation is proven by tests: a reviewer cannot read another reviewer's pins or reviews in `private` mode, and a code cannot reach another experiment.
   - Recorded as an accepted residual risk: isolation rests on one module, not on RLS.
   - Rejected for v1: extending the bridge with a guest context, which reopens D-STK-5's one-way door for one feature; and Supabase anonymous sign-in, which would put a user in `auth.users` per guest and make erasure reach the auth tables.
   - Revisit if a second feature needs guest rows.
5. **Placement in the package graph.** Where the sandbox's code lives: `apps/web` only, a new `@pem/*` package, or `@pem/services`. That decides the `boundaries.js` rows (D-STK-1, D-STK-16) and the stack entry's `boundaries`. It also decides whether removal can undo the edits to shared files (`developer` in `APP_ROLES`, the policy twin) or must leave them in place.
6. **Guest identity.** An unverified email is the guest's identity, scoped to one experiment's code. Data keyed on it cannot later be re-keyed to verified accounts without a migration.
7. **Addresses handed out.** `/experimental/<slug>` and the confirmation email's link back sit in reviewers' inboxes and mail logs once sent, and an email cannot be recalled. The URL shape and anything the link carries are fixed from the first send. `[PROPOSED]` (Warden): the link never carries the email or the code in its query string, and the email is filled in some other way, decided at the Technical stage.
8. **The notice's promises.** Once reviewers have read what is stored and how to be erased, narrowing either breaks a promise already given.

## QA, carried to the Tickets stage

- The default for every ticket is Q2 (Taylor's choice). Reviewers and focus are confirmed in one table at the Tickets gate: Warden on the gate and codes, Mason on schema, Assay on UI. Every ticket is cut before any build starts.
- **To flag once at the Tickets stage:** the gate, the codes, guest emails, the role list and the migrations touch auth, personal data and schema, which normally sit at Q3 (`docs/workflows/qa-levels.md`).

## Knowledge gaps

None of these needs a web research thread. Each is decided by the stage named, in its own thread.

1. Does the installed Next.js version's proxy support the optimistic, cookie-only half of the split in one-way door 3, and what exactly does it hand to the authoritative check? (Technical, Mason with Warden.)
2. Does a pin's anchor survive a variant toggle that replaces the page's markup, and how is a pin placed on one variant hidden on another? (UX with Technical.)
3. How is the wrong-code throttle keyed, and how long do its counters live, without storing addresses next to feedback? (Technical, Warden.)
4. With hand deletion and no schedule, what tells the team that data is still held after a review ends? Is item 27's marker enough? (UX, Vesper with Warden.)
