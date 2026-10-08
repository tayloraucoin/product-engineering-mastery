# LAB-6 C7 — the client address on Vercel (operator check)

Deferred: no hosted deployment exists yet. Check on the first deploy, before any real code is issued (Taylor, 2026-10-06).

1. Deploy the branch to a Vercel preview or production URL.
2. From a known network, look up your own public address (any "what is my IP" page).
3. Enter a wrong code on `/experimental/pricing-2026` 30 times within 15 minutes from two browsers on that network (or one browser, clearing cookies between tries): the 31st try from a fresh browser must show the locked state. That proves the network counter runs on the first `x-forwarded-for` hop.
4. Repeat one wrong try with a spoofed header, for example `curl -H "x-forwarded-for: 198.51.100.9" -X POST …` against the gate action, from a different network: the lock from step 3 must not apply, and a lock reached with the spoofed value must not lock your real address. Vercel overwrites the header, so the client's own address is the first hop.
5. If either fails, the network counter is keyed on a value the client controls: set `trusted` to false in the gate action (browser counter only) and reopen gap 3.
