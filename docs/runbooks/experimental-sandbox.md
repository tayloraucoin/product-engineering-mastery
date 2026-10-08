---
title: "Use the experimental sandbox — an operator's guide"
description: "Follow when you run a gated design review as the operator: make an experiment, make the first admin, hand out and revoke codes, know what a reviewer sees, close an experiment, delete data, test locally, and clear the pre-launch checks. Says plainly which tickets are not built yet."
layer: runbooks
status: draft
thread: "LAB-guide"
role: Scribe
date: 2026-10-08
last_reviewed: 2026-10-08
supersedes:
load_when:
---

# Use the experimental sandbox

> **What it is:** gated design reviews inside the web app. An experiment is a folder of code with two to four designs of one page. A reviewer opens it with a link and an access code, leaves pinned comments, and sends one structured review. The team runs it from `/admin`.
> **Written from:** the LAB epic's as-builts (`specs/web/epics/LAB-experimental-sandbox/tickets/*/as-built.md`), the living truth under `specs/web/ux/`, `toolkit.json`'s `stack["experimental-sandbox"]` and [`remove/experimental-sandbox.md`](remove/experimental-sandbox.md). State as of 2026-10-08. If a ticket below has since closed, trust its as-built over this page and update this page.
> **Not this page:** removing the sandbox from a product repo is [`remove/experimental-sandbox.md`](remove/experimental-sandbox.md).

## 1. What works today

Read this first. A step below that touches a "not built yet" row does not work.

| Part                                                                     | Ticket       | State                                                                            |
| ------------------------------------------------------------------------ | ------------ | -------------------------------------------------------------------------------- |
| Tables, roles, data access, experiment registry                          | LAB-1 to 4   | Built                                                                            |
| The gate: codes, cookie, wrong-code throttle, gate page                  | LAB-5 to 7   | Built                                                                            |
| `/admin` shell, People, Experiments list                                 | LAB-8 to 10  | Built                                                                            |
| The experiment page: design switcher                                     | LAB-11       | Built                                                                            |
| Pins and the comments list                                               | LAB-12, 13   | Built                                                                            |
| Access codes tab                                                         | LAB-15       | Built                                                                            |
| Data tab, erase a reviewer, the record of actions                        | LAB-16       | Built. Its last review (Warden) is not recorded yet, so the ticket is not closed |
| The review page, core questions                                          | LAB-17       | Built                                                                            |
| The ended page                                                           | LAB-21       | Built                                                                            |
| Removal runbook                                                          | LAB-24       | Built                                                                            |
| Replies: database and actions only                                       | LAB-25       | Built. No screen uses them                                                       |
| **Team layer**: the team sees every reviewer's pins, leaves team notes   | LAB-14       | **Not built yet** (open)                                                         |
| **Review of several designs**: a rating per design, then a choice        | LAB-18       | **Not built yet** (open)                                                         |
| **"Review sent" page**                                                   | LAB-19       | **Not built yet.** A plain placeholder shows after a send (§5)                   |
| **Confirmation email**                                                   | LAB-20       | **Not built yet.** No email is sent to a reviewer                                |
| **Reviewers tab** (one reviewer's answers and earlier versions)          | LAB-22       | **Not built yet.** The tab is listed and has no page                             |
| **Results tab**                                                          | LAB-23       | **Not built yet.** The page says the results "arrive with LAB-23"                |
| **Collaborate mode screens** (reviewers see each other's comments)       | LAB-26       | **Not built yet.** Keep every experiment `private`                               |
| Follow-ups: text checks, role recorded, scan, view-log bounds, tab races | LAB-27 to 32 | **Not built yet** (drafted)                                                      |

The live list is `specs/_status.md`.

## 2. Make an experiment

An experiment is code, not a database row. There is no screen to create one.

1. **Make the folder** `apps/web/app/experimental/_experiments/<slug>/`. The slug is lower-case letters and digits in words joined by single hyphens, at most 48 characters. It is in every reviewer's URL and never changes once a reviewer row holds it. Name it as if it will leak. The demo, `pricing-2026`, is the model: copy its folder.
2. **Write `config.ts`.** It holds no JSX and no static `.tsx` import, so Node loads it in tests. Fields, all checked at module load (a bad config fails `yarn build`, not a reviewer):

   | Field              | Rule                                                                                                                                                        |
   | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `slug`             | Equals the folder name.                                                                                                                                     |
   | `title`            | Required. Shown to reviewers after the gate.                                                                                                                |
   | `designs`          | One to four. Each has an `id`, a `shape` (`circle`, `square`, `triangle` or `diamond`, one each) and a `component` loader.                                  |
   | `goals`            | Two or three. The review asks how well the design meets them.                                                                                               |
   | `targetedQuestion` | Optional: `text` and exactly five `labels`.                                                                                                                 |
   | `questions`        | Optional extra review questions: `id`, `text`, `kind` (`scale`, `choice` or `text`; default `text`), `options` (2 to 7, scale and choice only), `required`. |
   | `mode`             | `private` or `collaborate`. Use `private`: collaborate has no screens yet (§1).                                                                             |
   | `coreVersion`      | `"v1"`.                                                                                                                                                     |
   | `closedOn`         | `null` while open. See §6.                                                                                                                                  |

   Reviewers see designs by shape, not by name ("Circle", "Square"), to keep names from biasing them.

3. **Write each design** as a component that loads lazily: `component: () => import("./circle.tsx").then((m) => m.CircleDesign)`. The root is a `<div>`, not `<main>`. Every `<section>` carries `data-sandbox-region` and `data-sandbox-name`, with ids unique within the design: pins anchor to those regions, and a region a design lacks leaves a pin "not found" on that design. Use `@pem/ui` and tokens only, with synthetic copy. Copy shared by the designs goes in `content.ts`, as `pricing-2026` does.
4. **Register it** by adding the config to `registeredConfigs` in `apps/web/app/experimental/_experiments/registry.ts`. A folder that is not listed there does not exist.
5. **Check it** by running the web workspace's tests (the registry test lists every folder and checks slug equals folder and one entry each), then `yarn web:dev`, and open `/experimental/<slug>` signed in as the team.

## 3. The first admin, and the roles

There are three roles, held in the account's Supabase `app_metadata.role`: `user` (the default, no access to `/admin`), `developer` and `admin`.

| Can                                               | developer | admin |
| ------------------------------------------------- | :-------: | :---: |
| Open `/admin`, Experiments, Access codes, Data    |    yes    |  yes  |
| Open any experiment, open or closed, with no code |    yes    |  yes  |
| Erase a reviewer by email                         |    yes    |  yes  |
| Delete an experiment's data                       |    no     |  yes  |
| People: change anyone's role                      |    no     |  yes  |

Anyone else gets the app's 404 at `/admin`, or the sign-in page when signed out.

**Make the first admin once per project.** The account must exist, so sign in once first (an unknown email is refused).

```bash
yarn workspace @pem/db db:grant-admin you@example.com
```

It needs that tier's Supabase URL and `SUPABASE_SERVICE_ROLE_KEY` in `packages/db/.env.local`. It is safe to repeat: an existing admin is left alone. It also restores an admin if the last one was ever lost.

**Every later role** is set on `/admin/people`: find the person by email, choose the role, confirm. The last admin cannot be removed. Demoting yourself works when another admin exists, and lands you on a 404. A change applies on the person's next request. Each change is written to the record (§8), naming who changed whose role. The record does not yet say which role (LAB-28, not built yet).

## 4. Codes: make, send, revoke, replace

Open the experiment (`/admin/experiments`, then its title), then **Access codes**. One code is one reviewer.

- **Make.** Choose "Make a code" and give a label: who it is for, a name or an email, up to 120 characters. The code (four groups of four characters) appears **once**. Copy it, or copy the link, before you close the dialog. Only a hash is stored, so a lost code cannot be shown again: replace it.
- **Send.** You send it yourself, by your own mail or chat. Nothing in the sandbox emails a code. Send the link and the code in **separate** messages; the dialog says so. The link is the site's address plus `/experimental/<slug>` and carries no code.
- **What a code looks like to type.** Spaces and dashes are ignored, and look-alikes are forgiven (`O` for `0`, `I` or `L` for `1`).
- **Read the table.** Each row shows the label, the emails typed with that code, when it was last used and whether it is revoked. A row that shows several emails, or one that differs from the label, is flagged: a code may have been shared.
- **Revoke.** The reviewer cannot open the review again, on any device, from their next request. Anything they sent stays. Revoke still works after the experiment closes.
- **Replace.** Gives the same reviewer a new code and stops the old one. It also brings a revoked code back. Their comments and review stay theirs. Replace and make are refused once the experiment is closed.
- Rotating `SANDBOX_SECRET` signs every reviewer's device out. Their codes still work.
- Display name appears only for `collaborate` experiments. On a `private` one it is not stored.

## 5. What a reviewer sees, end to end

1. **The gate** at `/experimental/<slug>`. One plain page for every slug, real or not, so nobody learns which experiments exist. It shows the notice "What we keep", an email field and the code field. A wrong, revoked or unissued code gets the same one sentence. Five wrong tries lock that browser for 15 minutes, and 30 lock a network; the page shows the time the lock ends in the reader's own clock. A signed-in account with no team role enters the code only, and the feedback is saved to the account. The team skips the gate. Access lasts 30 days in that browser.
2. **The experiment.** The reviewer opens on one design, drawn at random on their first visit and fixed as their "first" from then on, then switches between designs on a bar at the bottom. Each switch is logged. The team's own visits are never counted.
3. **Pins.** "Comment" turns on comment mode: click a spot (or press Enter on a region) to pin a comment, choose its type and save. Up to 500 per reviewer, 2,000 characters each. A pin is queued in the browser first, so one placed offline is sent when the connection returns and survives a reload. "Comments" opens the list: edit, delete (with Undo), "Show on page", Retry for unsent ones.
4. **The review** at `/experimental/<slug>/review`, from "Finish review". In this order: Overall (how well the design meets the goals), Your comments, Blockers, Gaps, the targeted question if the config has one, the config's own questions, Next step. Your comments stays locked until Overall is answered, so the pins do not bias the rating. For each comment the reviewer picks Must change, Should change or Fine either way, then picks the one that matters most. Send is refused with a list of what is missing. The pin queue is flushed first, so the review never goes ahead of its comments.
5. **After Send.** Each send stores a new version; earlier ones are kept. A reviewer who comes back sees "Send changes". In the build today the page then shows a placeholder: the heading "Review sent" (or "Changes sent") and "Back to the designs". The sent page that says where the confirmation went is LAB-19, and the email itself is LAB-20. **Neither is built yet, so no email goes out, though the gate's notice says one will.** See §10.
6. **Several designs.** The review asks one Overall rating for the whole experiment. A rating per design, a shuffled choice and the changed-after-choosing flag are LAB-18, not built yet. `pricing-2026` has two designs, so it hits this.

## 6. Close an experiment

Closing is a code change. There is no button.

1. Set `closedOn` in the experiment's `config.ts` to a date, `"YYYY-MM-DD"`. It may not be in the future. The date is the Europe/London calendar date, not UTC.
2. Deploy.

From then on:

- A reviewer with a live code lands on the **ended page** instead of the experiment. It says whether and when they sent a review. If they have comments the browser never sent, it says how many and lets them read them; the unsent comments are cleared from that browser when they leave. The draft review is cleared on arrival.
- A visitor with no live code gets the ordinary gate, as for any slug.
- The team still opens the experiment and can still revoke codes. Make and replace are refused.
- No view is counted any more.
- On `/admin/experiments` the experiment reads "Closed". If it still holds reviewers' data it shows "Holds data from 3 reviewers · closed 34 days ago", counted from `closedOn`, with "Delete data" for admins. The same line sits under the experiment's heading. Treat it as your cue to read the results and then delete (§8).

## 7. Reading Results

**Not built yet** (LAB-23). The Results tab, and so the experiment's title link in the list, show only a line saying the results arrive with LAB-23. The Reviewers tab (LAB-22) has no page. Answers are stored, one version per send, but no screen shows them yet.

What LAB-23's contract promises, so you know what to wait for (a plan, not a feature): counts per rating label with the number of reviewers, a percentage and a median only from ten answers on one wording version, never an average, chart or headline number, only each reviewer's latest version, no team notes, and quotes exactly as written under the code's label.

## 8. Erasure and deleting an experiment's data

Everything here is under **Data**: the experiment's own Data tab, and the nav-level `/admin/data`.

**Delete an experiment's data** (admin only). Open the experiment's **Data** tab. It lists what is held: reviewers, codes, views, comments, reviews, versions and team notes. "Delete data" asks you to type the experiment's slug exactly; the button stays off until it matches. It then deletes, in one transaction, every view, comment (team notes too), version, access and reviewer of that slug. That includes the codes, so nobody can open the experiment again. It writes one record row holding counts only. A delete that finds nothing writes nothing.

**Erase one person** (developer or admin), on `/admin/data`. Type the reviewer's email and choose Find. The page lists what that email holds **across every experiment**, plus any code whose label or display name is that email. Review it, choose "Erase everything from …" and confirm in the dialog, which states the counts. It then:

- deletes every access with that email, or that signed-in account, and with them the views, comments, replies and review versions;
- revokes a code left with no access and relabels it "Erased reviewer";
- clears any label or display name equal to the email;
- clears the ticked name labels you chose to clear on codes that keep another email.

The email travels only in the request body, never in a URL, and is never written to the record. Signed-in accounts are matched by email through the Auth API, so this step needs that tier's service-role key.

**The record** is the table below the erase form: who did what and when, 50 to a page. It holds code made, replaced and revoked, role changes, data deleted and reviewer erased, with counts and no emails of the erased. A role-change row does not yet name the role (LAB-28, not built yet).

A reviewer can also ask for erasure by emailing the address in the gate's notice. That is the `contact.email` check in §10. A one-click "Erase this reviewer…" link from a reviewer's own page is LAB-22, not built yet.

## 9. Test locally

**Database.** Taylor's machine runs Postgres.app on `127.0.0.1:5432`, no Docker, no Supabase project. Copy each example file to `.env.local`: `.env.example` into `apps/web`, and `packages/db/.env.example` into `packages/db`. They already set `DATABASE_ENVIRONMENT=local` and the `_LOCAL` database URLs for `pem_local`. The one value you add is the sandbox's secret, in the `.env.local` you made for `apps/web`:

```bash
SANDBOX_SECRET_LOCAL=<the output of: openssl rand -base64 48>
```

It needs at least 32 bytes. Without one, every reviewer sees the gate and no code can be entered. Then:

```bash
yarn db:setup:local
yarn web:dev
```

`db:setup:local` creates `pem_local` and applies the migrations, including `0003_sandbox_schema`. If a migration was regenerated after you applied it, the migrator fails with "already exists"; check the database holds nothing you need, then run `yarn db:local:reset`. The real-Postgres tests run with `yarn test:db`.

**What Postgres alone gives you:** the gate (all ten `gate-*` states), the throttle, and any reviewer flow, once a code row exists. There is no screen or script that makes a code without a team sign-in. The tests make theirs through `seedCode` in `packages/db/test/sandbox/erasure-fixtures.ts`.

**What it does not give you: team sign-in.** `/admin` and every team-only `?state=` key need a signed-in developer or admin, and sign-in needs Supabase Auth. That is either a hosted project (Mode A) or Docker's full stack (Mode B, `yarn db:local:full`, see `docs/runbooks/add/docker-local-database.md`). This machine has neither. The builders captured the team screens against an uncommitted scratch copy whose team check returned a made-up admin. With Mode B, `yarn db:seed-users` creates two synthetic accounts (`alice@example.test` and `bob@example.test`; their local-only passwords are in `packages/db/scripts/local-users.ts`), and you then make one an admin with `db:grant-admin` (§3).

**`?state=` keys.** Append `?state=<key>` to a page to see a designed state on made-up data. The one list is `apps/web/lib/sandbox/shared/state.ts`. A key a viewer may not use, or one that does not exist, reads as absent and the page renders normally. A fixture never spends a gate try, sends a pin or ends a session.

| Prefix                                                            | Page                                               | Who       |
| ----------------------------------------------------------------- | -------------------------------------------------- | --------- |
| `gate-` (10)                                                      | `/experimental/<slug>`                             | Anyone    |
| `exp-` (11), `pins-` (6), `comment-mode`, `too-long`, `list-` (8) | The experiment page                                | Team only |
| `review-` (11)                                                    | `/experimental/<slug>/review`                      | Team only |
| `ended-` (5)                                                      | A closed experiment                                | Team only |
| `shell-`, `people-`, `expts-`, `codes-`, `data-`                  | The matching `/admin` page                         | Team only |
| `variants-` (7)                                                   | Registered for LAB-18; the screen is not built yet | Team only |

## 10. Before the first real code

Do these before any code reaches a real reviewer. The first two are the operator's, and an agent stops before them.

1. **The throttle's first-deploy check (LAB-6, C7).** The network lock keys on the first `x-forwarded-for` hop, which only a hosted deployment can prove. The steps are kept in `specs/web/epics/LAB-experimental-sandbox/tickets/LAB-006-gate-throttle/evidence/C7-steps.md`:
   - Deploy to Vercel (preview or production).
   - From a known network, enter a wrong code on `/experimental/<slug>` 30 times within 15 minutes, from two browsers or clearing cookies. The 31st try from a fresh browser must show the locked state.
   - Send one wrong try with a spoofed header from another network, for example `curl -H "x-forwarded-for: 198.51.100.9"` against the gate action. The first lock must not apply to it, and a lock reached with the spoofed value must not lock your real address.
   - If either fails, the network counter is keyed on a value the client controls. Set `trusted` to false in the gate action (browser counter only) and reopen the gap.
2. **A real `contact.email` in `@pem/brand`.** `packages/brand/src/brand.ts` still holds `hello@example.com`. The gate's notice tells reviewers to email that address to have their data deleted. Put a monitored address there first.
3. **`SANDBOX_SECRET` on every hosted tier**, at least 32 bytes, one per tier, never shared: `openssl rand -base64 48`.
4. **Migration `0003_sandbox_schema` applied to the hosted database**, and `db:grant-admin` run once against the hosted project (§3). The build applied them to the local database only.
5. **The confirmation email is not built (LAB-20).** The gate's notice says the team "can email you a confirmation when you send your review". Until LAB-20 closes, either wait, or reword that line. Do not tell a reviewer to expect an email.
6. **Checks only a person can do** are listed in `specs/_status.md` (the screen-reader and look-over passes). They do not block the sandbox working, but they are unfinished.

## 11. Taking it out

A product that does not want the sandbox follows [`remove/experimental-sandbox.md`](remove/experimental-sandbox.md): tag, delete, edit, migrate, prove it gone, then the operator's hosted steps.
