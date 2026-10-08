---
epic: LAB
status: draft
---

# Brief — The experimental sandbox

> Framed 2026-10-05 by Compass, consulting Mason, Vesper, Envoy and Warden, from the builder interview and Taylor's answers to four rounds of Frame questions. It builds what the feature-exploration track's "Where it lives" section promises (`docs/workflows/tracks/feature-exploration.md`). Taylor passed Frame go on 2026-10-05; his gate answers are cited as (Frame go).
>
> Labels: **verified** means read from code or a primary source, with a date. **Secondary** means someone else's claim. **Judgment** means the named role's call. **Estimate** is a guess at size. Markers: `[ASSUMPTION: …]`, `[PROPOSED]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`.
>
> The settled items (S1 to S31), the pinned items, prior art in full, the one-way doors (1 to 8) and the QA carried to the Tickets stage live in [`decisions.md`](decisions.md), moved byte for byte on 2026-10-08 with their ids unchanged.

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

## Out

Out of this epic, and not pinned: random A/B assignment (B10, superseded by "everyone sees every variant"), and comments on product pages.

## Prior art

Read on 2026-10-05; the full table, with paths and what changes, is in `decisions.md`.

| Piece              | Repo                   | Verdict           |
| ------------------ | ---------------------- | ----------------- |
| Code gate          | Kryshan                | **adapt**         |
| On-screen comments | Kryshan                | **adapt**         |
| Form as data       | Kryshan                | **adapt**         |
| Bundled submission | Kryshan, taylor-aucoin | **replace**       |
| Data model         | taylor-aucoin          | **adapt**         |
| Ingest             | taylor-aucoin          | **adapt**         |
| Results view       | taylor-aucoin          | **adapt**         |
| Admin shell        | taylor-aucoin          | **adapt**         |
| Role check         | conscious-connections  | **replace**       |
| Removal            | Kryshan                | **reuse** (shape) |

## Knowledge gaps

None of these needs a web research thread. Each is decided by the stage named, in its own thread.

1. Does the installed Next.js version's proxy support the optimistic, cookie-only half of the split in one-way door 3, and what exactly does it hand to the authoritative check? (Technical, Mason with Warden.)
2. Does a pin's anchor survive a variant toggle that replaces the page's markup, and how is a pin placed on one variant hidden on another? (UX with Technical.)
3. How is the wrong-code throttle keyed, and how long do its counters live, without storing addresses next to feedback? (Technical, Warden.)
4. With hand deletion and no schedule, what tells the team that data is still held after a review ends? Is item 27's marker enough? (UX, Vesper with Warden.)
