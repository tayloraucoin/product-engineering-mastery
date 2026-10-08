# LAB-17 C9 — keyboard and screen reader (operator check)

## What the builder checked in the browser pane (2026-10-07, local, as a seeded reviewer)

- Every question is a `fieldset` with a visible `legend`; each scale is one radio group named by its legend (`aria-labelledby`), each radio named by its label. "Can't judge yet" is in the goal-fit group, set apart below the scale.
- Triage groups are named "Comment n: Must change, Should change or Fine either way".
- Send with gaps: nothing is sent, the summary ("5 answers are missing") takes focus, lists each gap in page order, and each link moves focus to its field (to the comments section while goal fit is unanswered). Each field's error is tied to its group by `aria-describedby`.
- "Nothing, I'd approve it" disables the blockers box, whose reason "Untick to write blockers" is tied to it.
- After a send, focus is on the sent line ("Review sent" / "Changes sent").

## Steps for a person with a screen reader (VoiceOver, Safari)

1. Open the review as a reviewer (a seeded code on the local database), keyboard only.
2. Tab through: hear each legend before its options, and each comment's triage group name.
3. Press Send review with nothing answered: hear the summary, follow a link, hear the field and its error.
4. Complete every answer by keyboard alone and send; hear "Review sent".
