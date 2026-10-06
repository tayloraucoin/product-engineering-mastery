---
target: specs/web/ux/experimental/review-variants.md
status: approved
promoted:
---

# Closing review: the designs section — experimental

## Job

With two to four designs, judge each one on its own first, then choose which to take forward, how strongly, and why. Done: every design is rated, and a preference has been made that order and politeness have had the least chance to bend (research §2). This file changes `review.md` only where stated. Wording is core v1 (Envoy, final).

## Layout and components

- **"Overall" is replaced by "Each design"** (D-LAB-18). The designs come in switcher order, the reviewer's first design first. For each design:
  - "How well does the ◆ Diamond design meet the goals below?" The goals are shown once, above the first design, and the scale is the same as in `review.md`.
  - "What is the main weakness of the ◆ Diamond design?" One line, optional.
  - A link, "Look at the ◆ Diamond design again", which opens the experiment on that design. The bar then reads "Back to your review" (D-LAB-2).
  - If the design was never viewed, the line "You haven't looked at the ▲ Triangle design yet." shows with "Look at it" (named "Look at the ▲ Triangle design"), and both questions stay disabled until it is viewed.
- **"Your comments"** (from `review.md`) is grouped by design.
- **"Your choice"** comes after "Your comments":
  - "Which design would you take forward?" A single choice:
    - the designs, shuffled per reviewer and fixed for that reviewer;
    - then, anchored below them and never shuffled: "Combine elements of more than one", "None of these", "No preference; any would work".
    - Nothing is pre-selected and nothing is marked recommended.
  - **Locked until every design is rated** (S20). "Can't judge yet" counts as rated. While locked, the group is disabled, and a line names what is left: "Rate the ■ Square design above to choose." With two or more left: "Rate the ■ Square and ▲ Triangle designs above to choose."
  - **After choosing a design:**
    - "How strong is that preference?" Slight, Clear or Strong. Required.
    - "What made you choose that one?" Optional, asked after the choice (research §1b V5).
    - "Is there anything from the other designs you'd want carried into it?" Optional.
  - **After Combine:** only "Which parts of each would you combine?", optional.
  - **After None of these:** only "What would a design need to do to work for you?", optional.
  - **After No preference:** nothing more.
- **Blockers** name the choice: "What, if anything, would stop you approving the ◆ Diamond design as it stands?" With Combine, None or No preference, and before any choice is made, it reads "…approving any of these as they stand?"
- **A rating changed after choosing** is allowed. The version records that the rating was changed after the choice (D-LAB-21). Nothing is shown to the reviewer about it.

## States

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| empty | `variants-empty` | All designs unrated; choice locked | Rate | "Rate each design above to choose." |
| not viewed | `variants-unviewed` | A design's questions disabled with the line | Look at it | "You haven't looked at the ▲ Triangle design yet." |
| partial | `variants-partial` | Some rated; choice locked; the line names what is left | Rate the rest | "Rate the ■ Square design above to choose." |
| unlocked | `variants-unlocked` | Choice enabled | Choose | — |
| chosen | `variants-chosen` | Strength, reasons and carry-over shown | Answer | — |
| combine | `variants-combine` | One follow-up | Answer | "Which parts of each would you combine?" |
| none | `variants-none` | One follow-up | Answer | "What would a design need to do to work for you?" |
| loading, error, offline, success | as `review.md` | as `review.md` | — | — |

## Words

The strings are above. Design names are always the glyph plus the name.

## Access

- Each design's questions are a `fieldset` with the legend "◆ Diamond design".
- The locked choice is a disabled radio group, with its reason tied to it through `aria-describedby`, not just greyed out.
- When the choice unlocks, it is announced politely: "You can now choose a design."
- Follow-up questions appear after the choice in DOM order. Focus stays on the chosen option, and nothing jumps.
- No motion.

## Instrumentation

The version record adds: the rating and weakness per design; the shuffled order shown; the choice and the strength; the reasons and carry-over; the last design viewed before the choice; and a "changed after choosing" flag per rating (research §2; S15).

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-variants-1 | A 2-design review with nothing rated | The choice is disabled with the reason line | capture |
| C-LAB-variants-2 | Every design is rated | The choice enables and is announced | test |
| C-LAB-variants-3 | Many reviewers open the choice | The design options' order varies per reviewer; the three anchors stay last | test |
| C-LAB-variants-4 | The choice first renders | Nothing is selected | test |
| C-LAB-variants-5 | A design was never viewed | Its questions are disabled until it is viewed | test |
| C-LAB-variants-6 | A rating is changed after choosing | The version flags it | test |
| C-LAB-variants-7 | A design is chosen | Strength is required, and reasons follow the choice in DOM order | test |
| C-LAB-variants-8 | Keyboard alone with a screen reader | Rate, unlock, choose and answer the follow-ups | manual |
| C-LAB-variants-9 | Each `?state=` key | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-18, D-LAB-21. None open.
