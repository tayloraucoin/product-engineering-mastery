---
target: specs/web/ux/admin/reviewer.md
status: approved
promoted:
---

# Reviewers and one reviewer — admin

## Job

See where each reviewer is. Open one to read everything they said, how it changed between sends, and what they looked at. Done: the team knows one person's view in full and can erase them if asked.

## Layout and components

- **Reviewers tab:** the composed `data-table`.
  - Columns:
    - Label, linking to the reviewer.
    - Status: "Not opened yet", "Looking" or "Sent · version 2 of 2". As words.
    - Emails used, flagged "2 emails used with this code" when there is more than one, or "Email differs from the label" only when the label is an email address and the typed one differs, ignoring case; names are never flagged.
    - Comments: a count.
    - Last activity.
  - Revoked codes are listed with "Revoked" after the status.
  - A signed-in reviewer (S8) shows their account email under the label.
- **One reviewer**, in this order:
  1. Heading: the label. Under it: emails used, status, and the code's state (Live or Revoked).
  2. **Latest answers:** "Version 2 of 2 · sent 6 October 2026, 14:32". Every answer is grouped as in the review (`review.md`, `review-variants.md`), and ratings show as their labels. "Changed after choosing" is marked where it applies (D-LAB-21).
  3. **Earlier versions:** a `Collapsible` per version, newest first, each named "Version 1 · sent 5 October 2026, 10:05". Each holds the answers and triage as they were then (S22). An answer that differs from the version after it carries a static "changed" marker, never a highlight that moves (A-14).
  4. **Comments:** their pins, grouped by design, with type, triage and text. Each links to "See on the page", which opens the team view filtered to them.
  5. **Order log:** first design, last design before choosing, switches, time on each design.
  6. **"Erase this reviewer…":** opens the nav-level Data page for this reviewer by reviewer id, never the email in a URL (`data.md`). That page lists every email used with the code. It is a link, not destructive-styled here.

## States

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| empty list | `reviewer-empty` | One line | Go to Access codes | "No reviewers yet. Make a code in Access codes." |
| not opened | `reviewer-not-opened` | Heading and status; no sections | Wait | "Ana Ruiz hasn't opened the review yet." |
| looking | `reviewer-looking` | Comments and order log; no answers | Read | "No review sent yet." |
| one version | `reviewer-success` | Latest answers; no "Earlier versions" | Read | — |
| several versions | `reviewer-versions` | Latest, plus collapsed earlier versions | Expand | — |
| loading | `reviewer-loading` | A static skeleton of the sections | Wait | — |
| error | `reviewer-error` | A line | Reload | "Couldn't load this reviewer. Reload the page." |
| partial | `reviewer-partial` | Sections that loaded; a line where one failed | Reload | "Couldn't load their comments. Reload to try again." |
| offline | `reviewer-offline` | The last render, plus a line | Reconnect | "You're offline. This may be out of date." |
| erased | `reviewer-erased` | The label reads "Erased reviewer"; no data | — | "Everything from this reviewer was erased." |

## Words

The strings are above. "Version n of m" counts this reviewer's sends.

## Access

- Each version is a disclosure button named "Version 1, sent 5 October 2026", with `aria-expanded`.
- The "changed" marker is text ("changed"), not colour.
- Tables have captions. Section headings are `h2`.

## Instrumentation

None.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-reviewer-1 | A reviewer sent 2 versions | "Version 2 of 2" shows its answers; version 1 is collapsed with its own triage | test |
| C-LAB-reviewer-2 | An answer differs between versions | Version 1's answer carries "changed" | test |
| C-LAB-reviewer-3 | One code was used with two emails | The list flags "2 emails used with this code" | test |
| C-LAB-reviewer-4 | "Erase this reviewer…" is used | The Data page opens listing each email used with the code; no email is in the URL; nothing is erased yet | test |
| C-LAB-reviewer-5 | Each `?state=` key | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-6, D-LAB-21, D-LAB-27. None open.
