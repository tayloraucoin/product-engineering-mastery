# As-built — LAB-12

## Shipped against the contract

- C1: `client/anchor.ts` builds an anchor inside the shown design's root only: the target's marked region, else its id, else its `nth-of-type` path, plus clamped fractions; a path past 2 KB falls back to the nearest marked region. Enter on a region's Tab stop anchors at its top-start, on a design control at its centre. `client/place-name.ts` names the place. The save carries the shown design's id, checked against the config on the server.
- C2: `client/comment-mode.ts` is a reducer returning the next mode and its announcement. Escape leaves comment mode with "Comment mode off."; a save ends it; Escape in the composer closes the composer first.
- C3: `client/queue.ts` queues before sending, drops an entry only on the ok for exactly what is queued, resends on load, reconnect (`online`) and Retry, runs one request at a time per id, and drops an entry before its delete is sent. Checked live: a pin placed offline was resent on reload under its id, one row.
- C4: `saveComment` (`packages/db/src/sandbox/comments.ts`) is insert `on conflict (id) do nothing`, then an update scoped by id, reviewer and slug, in one transaction. Eight racing saves of one id give one row; delete then Undo restores it; another reviewer's id is `taken`, which the action answers `not-saved`.
- C5: `pinsOnDesign` draws the shown design's pins; the bar's count is across designs. Checked live: switching to Square drew one pin, the count held at 4.
- C6: `resolveAnchor` and `pinOffset` look up inside one root; a missing anchor resolves to null and is not drawn.
- C7: `listMyComments` reads by `reviewerScope`; never a team note. Isolation cases for all three functions as every viewer kind.
- C8: the 500 cap is counted inside the save's transaction behind a lock on the reviewer row; two new pins racing for the last place give one `saved` and one `limit`. A 2,001-character body is refused with a fixed message.
- C9: `closed` (experiment ended) and `revoked` (access no longer passes) hold the sender: nothing more is sent and the queue is untouched. Checked live by revoking the code mid-session: the revoked line showed, Comment disabled, Edit and Delete stayed focusable but disabled, each described by its reason.
- C11: `evidence/pins-states.png`, every pins.md key at 390, 834 and 1440, light and dark, under reduced motion; also LAB-11's `exp-closed` and `exp-revoked` with pins drawn and comment 1's popover open (C9 seen), an open pin, and a focused region stop.

## Deviations

- Files outside the planned paths: `lib/sandbox/comments-data.ts` binds the actions to the database and logs fixed events, as `admin-codes-data.ts` does, so LAB-7's source scan of `actions.ts` stays as it is. `_components/experiment/experiment-switcher.tsx`, `experiment-page.tsx` and `bar-slots.tsx` are LAB-11's files: the switcher now sits inside the pins provider, hands it the design's root, and renders the pins region between `main` and the bar; the page passes the pins source; the bar slots read the provider.
- The anchor's marked-region key is `marked`, the schema's name (LAB-1, `SandboxAnchor`); the contract's `{ region }` is the same thing. The anchor also stores the place's name (`place`), so LAB-13's list and LAB-17's triage can name a pin without the design mounted.
- `listMyComments` also returns `viewportW`, `viewportH` and `clientCreatedAt`, so an edit of a loaded pin re-sends a complete entry.
- [ASSUMPTION] The team previews pins: on a pins.md key its fixture; on LAB-11's `exp-closed` and `exp-revoked` the base pins with comment 1's popover open; on the other `exp-*` keys that bar alone; otherwise none; pins placed by the team stay in memory and are never sent. Team notes are LAB-14's.
- [ASSUMPTION] The type group is named "Type"; the Words give only its labels.
- [ASSUMPTION] Contract Gotcha: a failed delete brings the pin back with "Comment 3 wasn't deleted. Try again." (copy pins.md lacks).
- The pressed Comment toggle wears the selection token and a check, as LAB-11's switcher does, so the bar keeps one primary.
- Popovers fade only (no zoom or slide), and drop the animation when focus inside is keyboard-visible (A-15).
- The toasts are built from `@pem/ui`'s toast parts, so their viewport sits above the review bar.
- Captures and live checks ran against an uncommitted scratch copy whose `team.ts` returns a synthetic admin from a cookie (no local Supabase Auth), on a scratch-only slug `lab12-capture`, as LAB-11 did. Headless Chrome over DevTools for the sheet.

- C9's Retry: the bar's Retry gives way to the closed or revoked line (experiment.md), so it is never shown disabled with a reason here; Retry on each pin is LAB-13's.
- Comment mode gives each marked region `role="group"` (not `button`), so the design's own controls stay inside it; its name is "Comment on: …".
- Placing waits for the reviewer's pins to load, so a new pin's number never repeats one the server holds.
- The queue re-reads storage before every step, so two tabs for one reviewer share it; while storage refuses writes, memory is the truth. Another tab's change re-marks which pins are unsent (`storage` event); a pin placed in another tab is not added here until a reload, so this tab may repeat its number, which the contract's numbering assumption tolerates.
- Accepted, from mason (grey): a save whose request fails after the server received it counts as finished, so a delete sent next could land first and the row return. Narrow; a server tombstone would close it.

## Review (Q2, in the thread: assay, and mason on the focus line)

Round 1, both FAIL; fixed, then one re-review each.

- **Mason, fixed:** red, two tabs overwrote each other's queue (now read before every step, with a two-store test for a lost pin, a revived delete and a reverted edit); orange, anchors the server refuses (a reference capped at 1,024 and a place at 80 in the browser, the server's limits, tested through `pinInput`); orange, placing during the load (now waits); yellow, the failed-delete put-back moved into the sender, with tests for it and for Undo during a delete; grey, the body is stored as typed.
- **Assay, fixed:** black, focus after a delete was invisible (now the next pin, else the previous, else the Comment toggle); black, a raw `2rem` in the popover's width (now `--spacing(8)`); red, closed and revoked with pins were not reachable (fixtures and captures added); orange, the offline save now shows the kept toast; orange, the composer is titled "On: …", and regions are groups, not buttons; orange, a chosen type carries a check; orange, a pin's text is `text-base`; yellow, an edit draws with its pin's state; yellow, announcements clear before they repeat; yellow, the label no longer turns to error (the field keeps `aria-invalid`'s border, which assay accepted in round 2); yellow, Ctrl or Cmd+Enter saves from anywhere in the composer; yellow, the hour is numeric; yellow, a draft being typed when the review closes stays, with Save disabled and the reason.
- **Assay, routed:** grey, no Retry below 768px until LAB-13's list; grey, "Comment 3 wasn't deleted. Try again." and "Type" to pins.md's Words through the brief owner; rubric and token gaps for Plumb: `tokens.js` misses a unit after an operator in `calc()`, pins.md's "hover outline token" does not exist (the build uses `ring`), and C11 names only pins.md's keys.

Round 2 (the one re-review each FAIL earns), both FAIL; fixed, no third run.

- **Mason, fixed:** red, a regression from round 1: with storage that reads but refuses writes, a new pin was lost (memory is now the truth while writes fail; tested); grey, a delete waiting behind a send that comes back closed is no longer sent (tested); grey, a reference must also fit 2 KB in bytes, the server's check (tested).
- **Mason, drafted:** yellow, one request per pin holds only within a tab: LAB-31 pin-queue-cross-tab.
- **Mason, noted:** grey, a pin placed in another tab is not drawn here until a reload (Deviations).
- **Assay, fixed:** red, Edit, Delete and a held Save are focusable while disabled, so `@pem/ui`'s `disabled:` look never applied; each now carries `data-disabled:opacity-50`; yellow, `pins-offline` shows the kept toast; grey, the comment on the field's error look corrected.
- **Assay, routed:** the Button's missing focusable-disabled style is `@pem/ui`'s (`button.variants.ts`), for Plumb and the catalog owner.

## Not verified

- C10, with a screen reader (deferred: `evidence/C10-operator.md`). Tab stops, focus return, the live region and the disabled reasons were checked in the browser.
- Pointer hover outline and touch tap were not exercised on a touch device.

## Next

LAB-13 builds the list (Show on page, not-found pins, Retry per pin); LAB-17 reads the queue and `listMyComments` for the review's triage.
