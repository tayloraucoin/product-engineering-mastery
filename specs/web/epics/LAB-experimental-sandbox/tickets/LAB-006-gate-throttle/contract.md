---
id: LAB-6
size: small
objective: "Wrong codes are throttled per browser and per network before any code lookup, with keys stored only as HMACs, so guessing is slowed on every slug alike and the page can say when to try again."
slice_type: "Abuse control on an unauthenticated form (one-way door 3, gap 3); the risk is a raw address stored, a race that skips the count, or a slug the throttle treats differently."
non_negotiables:
  - "Two counters per try, checked before the code lookup: the browser key (the sandbox_gate cookie) and the network key (IPv4 whole, IPv6 /64); a locked key refuses even a correct code."
  - "Keys are stored only as HMAC-SHA256 under SANDBOX_SECRET, label throttle, with the counter kind in the input; never raw, never logged; sandbox_gate_attempts holds no slug and no link to feedback."
  - "Thresholds live in one constant: browser 5 wrong tries in 15 minutes, network 30, each then locked 15 minutes; a success clears the browser counter only."
  - "Keyed globally, never by slug: an unknown slug counts and locks exactly like a real one, and reaches no other table."
  - "Each failure is one atomic upsert; rows past the later of window and lock (at most 30 minutes) are deleted on every write."
  - "The throttle's reads and writes are gate.ts functions taking (db, input), returning only counts and instants, each with its isolation case."
  - "The network key runs only where x-forwarded-for is trusted (deployed on Vercel), per gate.md's assumption; elsewhere only the browser counter runs."
devs_call: "The window arithmetic inside the upsert, function names, the address parser's shape, and whether the wrapper takes the attempt as a callback."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/gate.md"
  - "D-LAB-33"
truth_files: "none: server logic; the throttle's words and state promote with LAB-7"
qa: Q3
reviewers:
  - warden
focus:
  - "keys stored only as HMACs; unknown slugs throttle like real ones (warden)"
operator_review: false
planned_paths:
  - "apps/web/lib/sandbox/throttle.ts"
  - "apps/web/lib/sandbox/throttle.test.ts"
  - "packages/db/src/sandbox/gate.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/**"
depends_on:
  - LAB-5
out_of_scope:
  - "The gate page, its throttle state and the local-time wording: LAB-7."
  - "The code lookup and cookie: LAB-5. The table: LAB-1."
  - "A CAPTCHA, an account lockout or alerting: not in v1."
criteria:
  - id: C1
    statement: "The network key is an IPv4 address whole and an IPv6 address's /64 (compressed and expanded spellings of one /64 give one key, another /64 another); an IPv4-mapped IPv6 is its IPv4; not deployed, or a missing or malformed header, gives no network key."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "During a lock the next try returns lockedUntil as an instant and the code lookup is never called, even with a correct code; a wrong try on an unknown slug and on a real slug give the same result and count against the same keys, and a lock reached on one slug blocks every slug."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "On the local database, 5 failures on a browser key in 15 minutes lock it for 15 minutes, 30 lock a network key, a failure after an expired window starts again at 1, and a success clears the browser row only."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C4
    statement: "Ten concurrent failures on one key count ten."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C5
    statement: "After tries, no sandbox_gate_attempts row holds the raw browser id or address or its plain SHA-256, and a row past the later of its window and lock is gone after the next write."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C6
    statement: "The isolation suite covers each new gate.ts export, each returning only counts and instants, and its coverage guard passes."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C7
    statement: "On a Vercel deployment, the first x-forwarded-for hop is the client's own address, and a client-sent spoofed hop is not the one used."
    evidence: manual
    reason: "Needs a hosted deployment; none exists yet (no staging project). Handed to the operator with --verdict deferred; on localhost only the browser counter runs. Taylor, 2026-10-06: confirmed on the first deploy, before any real code is issued."
---

# Contract — LAB-6 gate-throttle

## Build notes

- **Approach:**
  - `throttle.ts`:
    - `throttleKeys()` reads the `sandbox_gate` cookie and, when trusted, the address, and returns the HMACs.
    - `withGateThrottle(db, keys, now, attempt)` checks both keys, runs `attempt` (LAB-5's `grantAccess`) only when neither is locked, records a failure on both keys, or clears the browser key on success. It returns `{ ok: true }` or `{ ok: false, lockedUntil }`.
    - On any failed try it sets `sandbox_gate`, a random 128-bit id: `Path=/experimental`, HttpOnly, Lax, Secure when deployed, 1 day.
    - LAB-7's action calls it.
  - `gate.ts` gains:
    - `readGateLock(db, { keyHashes, now })`, returning the latest `lockedUntil` or null;
    - `recordGateFailure(db, { keyHash, limit, windowMs, lockMs, now })`, one `insert … on conflict do update … returning`, deleting expired rows in the same transaction;
    - `clearGateKey(db, { keyHash })`.
  - Register each new export in LAB-3's isolation registry.
- **Decisions that apply:**
  - D-LAB-33 (R8): "Two counters, browser cookie and client address (IPv6 /64), stored only as HMACs in a table with no slug and no feedback link. Rows live 30 minutes at most. 5 tries per browser and 30 per network in 15 minutes, then a 15-minute lock. Keyed globally, so unknown slugs throttle alike."
  - gate.md: "Network: 30 in 15 minutes, because a client and colleagues may share one office address. Thresholds are judgment (Mason, Warden) and live in one constant."
  - gate.md: "The page receives `lockedUntil` as an instant; the client formats it in local time." And: "a lock can come from either counter."
  - gate.md, carried as written: `[ASSUMPTION: on Vercel the first x-forwarded-for hop is the client address, set by the platform. Secondary (Vercel docs, as known at June 2026); the gate ticket verifies it on the installed platform before relying on it. Without a trustworthy address, as on localhost, only the browser counter runs.]` C7 is that verification.
  - S11 (brief): "After a handful of wrong tries from one browser or network, entry pauses for a few minutes, and the page says when to try again."
  - Gate group (Taylor, Tickets gate, 2026-10-05): its functions "take (db, input), and return only ids, versions and flags… They never return a feedback row or a label, and the isolation suite proves it."
- **Interfaces:** `GATE_THROTTLE` (the thresholds), `throttleKeys`, `networkKeyOf(headerValue, trusted)`, `withGateThrottle` (throttle.ts); `readGateLock`, `recordGateFailure`, `clearGateKey` (gate.ts, re-exported from `@pem/db/sandbox`).
- **Per path:**
  - `throttle.ts` and its test: C1, C2, with stubbed gate functions.
  - `gate.ts`, `index.ts`: the three functions.
  - `test/sandbox/`: C3 to C6, plus the isolation cases.
- **Gotchas:**
  - HMAC input is `b:<id>` or `n:<address>`, through LAB-5's `sandboxMac` under label `throttle`, so the two kinds never collide.
  - Parse addresses with `node:net` (`isIP`); expand `::` before taking the first four hextets.
  - A missing browser cookie means no browser row to read; the network key still runs when trusted.
  - Compare `now` from one clock argument; never SQL `now()` or `Date.now()` inside the functions, so C3 can fix time.
  - Never log the address, the cookie or a key hash.
  - `test:db` runs on the local database only.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model reads the count, then writes it, which lets parallel tries past the limit.
