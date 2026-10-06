---
target: specs/web/ux/experimental/review.md
status: approved
promoted:
---

# Closing review — experimental

## Job

Say, once and deliberately, how well the work meets its goals, which of your comments matter, what would stop you approving it, and what should happen next. Done: the review is sent with the triage of every pin bundled in (S21). This file is the core, wording **core v1** (S20, Envoy's set, research §1a). With several designs, `review-variants.md` replaces "Overall" and adds "Your choice".

## Layout and components

- Its own page at `/experimental/<slug>/review` (D-LAB-2). One column at prose width. The brand mark sits top-left. A link back reads "Back to the designs".
- Sections have headings and no numbers (C-P03). Built from `Field`, `RadioGroup`, `Checkbox`, `Textarea` and `Button`. `[ASSUMPTION: the build thread checks whether @pem/ui's questionnaire primitive fits one long page; if it pages one item at a time, it is not used.]`
- **Section order** (one design):
  1. **Overall:** "How well does this design meet the goals below?" The 2–3 goals from the config are listed above it. Scale: "Not at all well", "Slightly well", "Moderately well", "Very well", "Extremely well". "Can't judge yet" is set apart below the scale. Asked before the pins are shown (research §3): until goal fit has an answer, "Your comments" renders only its heading and the line "Answer the question above to see your comments." In edit mode it is open. With one design, a link "Look at the design again" sits under the question.
  2. **Your comments:** "Here are the comments you left. For each, choose: Must change, Should change or Fine either way. Then pick the one that matters most."
     - Each comment: number, design, place, type, and text, which is editable in place (it edits the pin itself). Plus "Delete" and a three-option radio group.
     - "Which matters most?" is a single choice among the comments marked Must or Should. With exactly one so marked, it is set to that one and the question is hidden. With one design, playback shows no design label.
     - No merge (pinned).
  3. **Blockers:** "What, if anything, would stop you approving this as it stands?" (`Textarea`), plus the checkbox "Nothing, I'd approve it". Ticking it disables the text box and keeps its text unsent.
  4. **Gaps:** "Is anything missing that you expected to see?" Optional.
  5. The optional targeted question from the config (a 5-point item-specific scale), then any extra questions from the config (scale, choice or text). All optional unless the config marks one required.
  6. **Next step:** "What should happen next?" Options: "Approve as it is", "Approve once my must-change items are done", "I need another round before deciding", "Rethink the direction".
- **Primary:** "Send review". In edit mode it reads "Send changes".
- **Draft:** answers are kept in this browser, for this experiment and code, and cleared on send. The lead line says so.
- **Required:** goal fit (where "Can't judge yet" counts as an answer); the triage choice for every comment; "matters most" when two or more comments are marked Must or Should; blockers (text or the checkbox); next step. On send with gaps, a summary sits at the top ("3 answers are missing"), linking to each one, plus an error on each field.
- **Sending:** queued pins send first, and the send waits for them. Each send stores a numbered version with the triage as it was (S22).
- **Team members** opening this page are sent to the experiment page (the team never sends a review, S18).
- **Edit mode:** the latest version is filled in. Comments added since then are untriaged. Deleted comments are gone.

## States

| State       | Key                  | What shows                                     | What the person can do | Copy                                                                                                                 |
| ----------- | -------------------- | ---------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| empty       | `review-empty`       | Blank form                                     | Answer                 | Lead: "Answers are kept in this browser until you send."                                                             |
| no comments | `review-no-comments` | The comments section holds one line and a link | Go back or carry on    | "You didn't leave any comments. That's fine; you can go back and add some, or carry on." Link: "Back to the designs" |
| loading     | `review-loading`     | Section skeletons (static) while comments load | Wait                   | —                                                                                                                    |
| error       | `review-error`       | Summary plus field errors                      | Fix                    | "3 answers are missing"                                                                                              |
| partial     | `review-partial`     | A draft restored                               | Continue               | —                                                                                                                    |
| offline     | `review-offline`     | Line above the button; send disabled           | Reconnect              | "You're offline. Your answers are kept in this browser; send when you're back."                                      |
| sending     | `review-sending`     | Button reads "Sending"                         | Wait                   | "Sending"                                                                                                            |
| send failed | `review-send-failed` | Line above the button                          | Retry                  | "Your review didn't send. Your answers are still here. Try again."                                                   |
| closed      | `review-closed`      | Line and link                                  | Go to ended            | "This review closed before your answers arrived, so they weren't saved." Link: "See what happened"                   |
| edit        | `review-edit`        | Filled with the latest                         | Change, send           | Lead: "You sent this on 5 October. The team sees your latest answers and can look back at earlier ones."             |
| success     | `review-success`     | Moves to `sent.md`                             | —                      | —                                                                                                                    |

## Words

The strings are above. Wording changes only with a new core version (S20).

## Access

- Each question is a `fieldset` with a visible `legend`, and each scale is a native radio group. "Can't judge yet" is in the same group.
- **Errors:** the summary is focused on a failed send. Each link moves focus to its field. Each field's error is tied to it.
- Triage groups are named "Comment 3: Must change, Should change or Fine either way".
- A disabled text box has its reason tied to it ("Untick to write blockers").
- "Back to the designs" and "Look at ◆ again" say where they go. On return, focus goes to the question the reviewer left from.
- No motion.

## Instrumentation

The version record: the answers, the triage per pin id, the core version, and the send time. Time from first view to send (research §2).

## Criteria

| ID              | When                                   | Then                                                                       | Evidence |
| --------------- | -------------------------------------- | -------------------------------------------------------------------------- | -------- |
| C-LAB-review-1  | A one-design review page               | The sections render in the order above with the exact core v1 wording      | capture  |
| C-LAB-review-10 | Goal fit is unanswered on a first send | No comment text is in the page until it is answered                        | test     |
| C-LAB-review-2  | The reviewer has 3 pins                | Each is played back with a 3-way choice, and the text edit changes the pin | test     |
| C-LAB-review-3  | Send with a required answer missing    | Nothing is sent; the summary is focused and lists each gap                 | test     |
| C-LAB-review-4  | A valid send                           | One version is stored, holding the answers and every pin's triage          | test     |
| C-LAB-review-5  | A second send                          | Version 2 is stored, version 1 is kept, and results use version 2          | test     |
| C-LAB-review-6  | Send while pins are queued             | The pins send first; the version refers to their ids                       | test     |
| C-LAB-review-7  | The experiment closed before the send  | Nothing is stored, and the closed state shows                              | test     |
| C-LAB-review-8  | Keyboard alone with a screen reader    | The form is completable; the legends and errors are read                   | manual   |
| C-LAB-review-9  | Each `?state=` key                     | It renders at 390, 834 and 1440, light and dark                            | capture  |

## Decisions and open items

D-LAB-2, D-LAB-18, D-LAB-21. None open.
