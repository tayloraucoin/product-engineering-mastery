# As-built — LAB-7

## Shipped against the contract

- C1: `apps/web/lib/sandbox/gate.ts` maps LAB-5's result to a view with `gateView(result, props)`. The test builds four results through the real `resolveViewerWith`: a real slug, an unknown slug, a revoked code's cookie (`checkAccess` null) and a closed experiment. All four give the Gate with status 200, and their props are equal apart from the path. The props are exactly path, prefilled email, account email and state. The team on an unknown slug gets not-found. The page's title is the fixed `metadata`, never `generateMetadata`.
- C2, C3: `enterGateWith(deps, input)` runs through LAB-6's real `withGateThrottle` and LAB-5's real `grantAccessWith`, on stub stores.
  - A wrong code, a revoked code, an unknown slug and a non-live code on a closed experiment each return the one wrong-code sentence on the code field. Four tries count four on one key.
  - A code that does not normalise counts as a try and is never looked up.
  - Empty or malformed fields return their own Words and reach neither the throttle nor the store. A throwing store gives server-error.
  - No result holds the code or the email.
  - A live code sets the cookie and redirects to `/experimental/<slug>`, with the email trimmed and lower-cased. A live code on a closed experiment is granted the same way. A lock returns its instant without a lookup.
- C4: a signed-in user without a role gets `accountEmail` and no prefill, even with a link email. They enter with their user id, and the email field is not read. The signed-in notice changes only its first point.
- C5: a developer or admin gets the experiment on a known slug, open or closed. A live reviewer gets the experiment, or ended on a closed one.
- C6: the ten gate.md keys are registered as `anyone` in `state.ts`, and every other key there is `team`. Each gate key renders the same fixture for a guest, a reviewer and the team, on a real and an unknown slug. A non-gate key is null for anyone but the team, and the page ignores it even then.
- C7: `evidence/gate-notice.png` is the guest face at 1440, light: the notice's four points above "Your email". The Words are asserted verbatim in the test.
- C8: `evidence/gate-throttled.png` is the real flow, not the fixture. On the local Postgres with a synthetic secret, five wrong codes on an unknown slug lock it. The page then shows "Too many tries. You can try again after 2:18 PM." with both fields filled and the button disabled. The browser pane reproduced it on a real slug.
- C9: the builder checked the keyboard path and the ARIA wiring (`evidence/C9-steps.md`), then deferred the screen-reader pass to the operator.
- C10: `evidence/gate-states.png` holds all ten keys at 390, 834 and 1440, light and dark. That is 60 headless-Chrome shots (DevTools protocol, reduced motion), set out one row per state.
- C11: `app/experimental/layout.tsx` exports `robots: { index: false, follow: false }`, checked by a source scan.
- C12: `evidence/C12-served-diff.md`. With the slug normalised, a real and an unknown slug's HTML differ only in Next's per-request id and React's `$ACTION_KEY`. `$ACTION_KEY` is a hash of the bound slug, so it is a function of the path alone. Both responses carry `X-Robots-Tag: noindex, nofollow`, and so does `/admin`. This is LAB-5's config-level proof, and it exercises `access.ts`, the request binding LAB-5 could not unit-test.

## Deviations

- **Sign out is `signOutHere(slug)`, a server action calling @pem/auth's one `signOut`.** That is the function STK-24's route calls. The route always lands on `/auth/sign-in` and takes no `next`, so a second route was not written and the route was not edited: the action returns to the same gate.
- **The Gate takes no slug prop.** It reads the slug from its path (`slugOfGatePath`), so its props stay the contract's four.
- **The action's result** is `idle`, `error` (one message per field, so an empty email and an empty code are both shown), `throttled` (an ISO instant) or `server-error`. A redirect never returns. The 5th wrong try already returns `throttled`, because LAB-6 reports the lock that try started.
- **The cookies' `Secure`** follows `productionRuntime`, after LAB-5's review. The network counter's `trusted` stays `deployed`. The test pins both.
- `sandbox_gate` is set on any failed or refused try when the browser had none, and never refreshed.
- [ASSUMPTION] A signed-in user whose account has no email gets the guest face and enters with the email they type. The account line needs an address to name.
- [ASSUMPTION] The lock time is `Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })`, so it reads "2:18 PM" or "14:18" in the reader's own convention. It is formatted after mount, and one `setTimeout` re-enables the button. A fixture holds still, so the throttled capture keeps its disabled button.
- The sign-out target is 44px tall through padding and a negative margin, so the account line keeps its line height.
- Offline is read from `navigator.onLine` and its events. While offline, submitting does nothing and the line shows above the button.
- `gate-success` is fixture-only. In the real flow the action redirects, and the button reads "Checking" until the page changes.

## Not verified

- C9's screen-reader pass: the operator's, with the steps in `evidence/C9-steps.md`.
- The ended and experiment branches are placeholders naming LAB-21 and LAB-11.
- `contact.email` in `@pem/brand` is still `hello@example.com`. A real, monitored address is the operator's before any real code is issued (out of scope).

## Next

LAB-11 replaces the experiment placeholder and LAB-21 the ended one. Both read `resolveViewer`'s result, which the page already has.
