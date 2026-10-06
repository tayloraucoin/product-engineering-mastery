# As-built — STK-26

## Shipped against the contract

- NN1, C1: `createAi` runs each case's input check before `modelFor` writes `[ai] vendor`: `checkInput` for extract and generate, and `parseChatRequest` inside `streamChat`, which throws `AiChatRejectedError` for a transcript a caller passed without the gate. Tested for an over-long text, a raw transcript, and refused or rate-limited chat requests.
- NN2, C1: the rate window is `createRateWindow`; each admit drops calls that have left the window and every user left with none, so the map holds only users active in the last `windowMs`. Tested by its `size()`.
- NN3, C1: with no key where fixtures may not answer, the chat route answers `503 {"error":"chat is unavailable"}` first, before asking who is signed in or reading the body; the reason is logged as `[ai] chat.unconfigured`, a warning, so it never reaches the error reporter. The test names what it asserts.
- NN4: `packages/ai/README.md` says the 401 gate assumes a same-site session cookie, and that `sameSite: "none"` or an uncontrolled sibling subdomain needs an origin check.
- C2: `yarn verify` passes.

## Deviations

- [ASSUMPTION] The devs_call: the unconfigured 503 waits for nothing. It answers before the user lookup and the body read, so an unconfigured deployment does no work for any caller; the answer is the same signed in or not, so it reveals no session state.
- Beyond the four considers, from Warden's review in the thread: `streamChat` gates its own input, the sweep skips entries whose oldest call is still inside the window, and the README's 503 line says "where fixtures may not answer".

## Not verified

None: both criteria are automated.

## Next

Nothing waits on this ticket.
