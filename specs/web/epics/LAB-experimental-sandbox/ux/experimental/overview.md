---
target: specs/web/ux/experimental/overview.md
status: approved
promoted:
---

# Experimental — overview

> Vesper, with Envoy, Gloss, Threshold and Warden consulted, from Taylor's rounds 1–7 (2026-10-05). Brief items in "What is settled" are cited as S<n> (S12b is item 12b); the brief's own (B1)–(B10) builder tags are not used here. No `apps/web` design layer exists (verified 2026-10-05), so the canon is the floor alone. No reference file exists yet (router, verified 2026-10-05). Prior art K and T was read, never copied.

## Frame

Two people use this area. The **reviewer** is a client or a colleague of theirs. They are not signed in and arrive from a link on a phone or a laptop, between other work. They are polite to the designer, and they have minutes. The **team** is a developer or admin, signed in at a desk, reading what reviewers pointed at. The reviewer's job: look at each design, pin what is wrong or right where they see it, then answer the closing review. The worst moment is a phone, a long code and a bad connection, so nothing a reviewer writes is ever lost silently.

## Routes and surfaces

Route shapes are `[PROPOSED]`: they sit in reviewers' inboxes, so Mason fixes them at Technical (one-way door 7).

| Route | Surface | Entry from | Exit to |
| --- | --- | --- | --- |
| `/experimental/<slug>` without live access | `gate.md` | Link, email, bookmark | `experiment.md`, `ended.md` |
| `/experimental/<slug>` after close | `ended.md` | Gate, next load | none |
| `/experimental/<slug>` | `experiment.md`, `pins.md`, `pin-list.md` | Gate, review page | `review.md` |
| same, team signed in | `team-layer.md` | `/admin` experiment | `/admin` Results |
| `/experimental/<slug>/review` | `review.md`, `review-variants.md` | Bar "Finish review" | `sent.md`, `experiment.md` |
| same, after send | `sent.md` | Send | `experiment.md`, `review.md` |
| email | `confirmation-email.md` | Each send | gate (code required) |
| beat 2 | `threads.md` | Collaborate mode | none |

## Navigation and shell

No product navigation, and never linked from the product (S13). The brand mark sits top-left on the gate, ended and review pages. The experiment page's only chrome is the review bar at the bottom (D-LAB-9). Noindex on the whole tree (S12).

## Decision log

| ID | Decision | Why | Date |
| --- | --- | --- | --- |
| D-LAB-1 | 20 surface files across `experimental/` and `admin/` | Each buildable alone, under cap | 2026-10-05 |
| D-LAB-2 | The closing review is its own page; each design question has "Look at ◆ again" | Same on a phone; mirrors K's `/feedback` | 2026-10-05 |
| D-LAB-4 | UK English in every string | Repo prose; Taylor's clients | 2026-10-05 |
| D-LAB-5 | The gate is one form: notice, email, code, one button | One screen, one primary action | 2026-10-05 |
| D-LAB-6 | The reviewer is the code: one code is one person on any device; each typed email is recorded | A typo must not split a person (door 6, Mason) | 2026-10-05 |
| D-LAB-7 | Reviewers call a variant a "design"; "version" means only a review send | One word, one meaning | 2026-10-05 |
| D-LAB-8 | Unsent pins on "review has ended" are counted and shown read-only, then cleared | Honest; nothing lingers (Warden) | 2026-10-05 |
| D-LAB-9 | The review bar sits at the bottom of the screen | Thumb reach; no clash with the design's header | 2026-10-05 |
| D-LAB-10 | Shape labels (Circle, Square, Triangle, Diamond) are fixed per experiment, at most four | Free text means one thing across reviewers | 2026-10-05 |
| D-LAB-11 | Optional pin type: Problem, Question, Suggestion, Keep this | Envoy's S17 proposal accepted | 2026-10-05 |
| D-LAB-12 | Keyboard placement: comment mode makes marked regions and the design's controls Tab stops | One path for keyboard and screen reader | 2026-10-05 |
| D-LAB-13 | Gap 2: a pin is drawn only on its own design; anchors resolve inside the shown design's root; an unresolved pin stays in the list | Variant markup differs | 2026-10-05 |
| D-LAB-14 | Team visits are not counted in views or the order log | Team checks never skew tallies | 2026-10-05 |
| D-LAB-15 | Team notes can be added after close | Synthesis happens after the window | 2026-10-05 |
| D-LAB-16 | Beat 2 shows a display name set on the code, never the email | Names without leaking addresses | 2026-10-05 |
| D-LAB-17 | Beat 2: team replies are visible to reviewers; team notes are not | Collaboration without exposing synthesis | 2026-10-05 |
| D-LAB-18 | With several designs, goal fit per design replaces the overall question | No single object to rate | 2026-10-05 |
| D-LAB-19 | The confirmation email carries no answers | The address is unverified (Warden) | 2026-10-05 |
| D-LAB-20 | The email carries no experiment title | Titles can be confidential | 2026-10-05 |
| D-LAB-21 | A rating changed after choosing is allowed and marked | Choice-supportive memory, logged | 2026-10-05 |

D-LAB-3 and D-LAB-22 to D-LAB-29 are in `../admin/overview.md`.

## Open

- Routed to Technical, not blocking UX: route shapes and the email-link fill (door 7); gate redirect or rewrite (door 3); the code format and forgiving input; whether the hidden design stays mounted (D-LAB-13).
- Brief amendment to carry at Technical: S29's notice now says "a confirmation" (D-LAB-19).
