# As-built — LAB-13

## Shipped against the contract

- `lib/sandbox/client/pin-list.ts` (pure, no `@pem/db`, `next/headers` or `env.ts`): `LIST_WORDS` (pin-list.md's Words), `groupComments`, `showOnPagePlan`, `retryOutcome` and `runRetry`, `focusAfterDelete`, `actionName`, and the eight `list-*` fixtures. Its test holds C2 to C5; C3 and C4 drive LAB-12's real queue and sender over a fake network, so "under the same ids" is the sender's own behaviour.
- `_components/pin-list/`: `pin-list.tsx` (the Comments button, Sheet or Drawer chosen by `matchMedia('(min-width: 768px)')` when it opens, focus on the title, focus back to the button), `list-body.tsx` (the lines, the groups as `section`s, the static skeleton, the empty state), `list-item.tsx` (number, type, place, the three-line clamp with "Show all", "Not sent" or the not-found line, the three actions named with the number).
- C1, C6, C7, C9: `evidence/list-grouped.png`, `list-empty.png`, `list-detached.png`, `list-states.png` (every key at 390, 834 and 1440, light and dark, reduced motion). `list-detached` is real: comment 2's anchor names a region the Circle design lacks, and the page's own lookup marks it.
- Checked live: keyboard open (no transition), delete then focus on the next item, Undo reached inside the list, Edit and Escape and Ctrl+Enter in place, Show on page across designs ending with focus in the popover, Retry announcing "2 comments sent.", Escape returning focus to the button.

## Deviations

- Files outside the planned paths, all LAB-11's or LAB-12's: `pins-provider.tsx` exposes every pin, the load, online, the not-found set, `retryFromList`, `reveal`, a list edit (`Draft.in: "list"`, with `refocus`) and focus hooks on `startEdit` and `deletePin`; `composer.tsx` takes `inList` (no popover title there); `pins-toaster.tsx` takes a `container`; `experiment-switcher.tsx` renders `PinList` in the bar's Comments slot with LAB-11's `onSwitch`; `experiment-page.tsx` feeds the list fixtures; `bar-slots.tsx` loses its placeholder `CommentsButton`. `review-bar.tsx` needed no change.
- The toasts are portalled into the open list: the modal list covered them and trapped focus away from Undo. Closed, they return to the page.
- Not found is what the shown design's lookup last found. A pin on a design not yet shown counts as found; Show on page that then finds nothing announces the not-found line and focuses the pins region. A comment on a design the config no longer lists goes in a last group, "Other designs", not found.
- The pins' re-lay now waits for the new design's root mid-switch (it measured the old one, which could mark a pin not found during Show on page).
- Retry in the list reads its outcome into the list's own polite region rather than through LAB-12's announcement, so it is not read twice. LAB-12's preview queue now holds the fixture's unsent pins, so Retry is seen to work on the team's fixtures.
- Turning Comment on drops an edit left open in the list.
- [ASSUMPTION] After a delete of the last item, focus goes to the previous item; the title only when none is left (pin-list.md names the next item and the title).
- [ASSUMPTION] "1 comment sent." for one, as the contract says.
- [ASSUMPTION] Start commenting is disabled with the reason when closed or revoked, and afterwards focus goes to the Comment toggle.

## Not verified

- C8 with a screen reader (deferred: `evidence/C8-operator.md`); the focus path, names and live regions were checked in the browser.
- The drawer's swipe on a touch device.

## Next

LAB-14 builds the team's face on this list (grouped by reviewer).
