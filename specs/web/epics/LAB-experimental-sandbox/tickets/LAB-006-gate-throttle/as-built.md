# As-built — LAB-6

## Shipped against the contract

- C1: `apps/web/lib/sandbox/throttle.ts` provides `networkKeyOf(headerValue, trusted)`. It takes the first `x-forwarded-for` hop, keeps an IPv4 address whole, and cuts an IPv6 address to its /64 after expanding `::` and any embedded IPv4. An IPv4-mapped address is its IPv4. It returns null when the header is not trusted, or is missing or malformed (a port, brackets, a double `::`, an empty first hop). `throttleKeys` HMACs `b:<id>` and `n:<address>` through LAB-5's `sandboxMac` under label `throttle`. The test shows neither key holds the raw value or its plain SHA-256, and the two kinds never collide.
- C2: `withGateThrottle(store, keys, now, attempt)` reads both locks before `attempt` runs. It is tested with LAB-5's real `grantAccessWith` on a stub database, so a correct code during a lock never reaches the code lookup. An unknown slug and a real slug give the same result, the same calls and the same rows. A lock reached across five slugs blocks every slug, a locked network refuses a fresh browser, and a success clears the browser key only.
- C3, C4, C5: these run in `packages/db/test/sandbox/throttle.test.ts` on the local Postgres.
  - C3: 4 failures leave the key open and the 5th locks it for 15 minutes. 29 network failures leave it open and the 30th locks it. A failure at the window's end starts again at 1. A window that expired under a running lock restarts at 1 and keeps the lock. `readGateLock` returns the latest lock across keys.
  - C4: ten parallel failures return counts 1 to 10, and the row holds 10. Past the limit, all ten count and six carry the lock.
  - C5: the table's columns are only key, count and two instants, with no foreign key. No row holds the raw id, the address, or the SHA-256 of either. A row past its window is pruned by the next write to another key, and a still-locked row stays until its lock ends.
- C6: `readGateLock`, `recordGateFailure` and `clearGateKey` join `GATE_GROUP` in `test/sandbox/registry.ts`. Each has isolation cases asserting its exact return keys and the fixed refusal of malformed input. The coverage guard passes.
- C7: deferred to the operator with the steps in `evidence/C7-steps.md`.

## Deviations

- **The request binding is LAB-7's.** `throttle.ts` is pure, so `node --test` loads it (see LAB-5's as-built). `throttleKeys` takes `{ secret, browserId, networkKey }`, not a request. LAB-7's action reads the `sandbox_gate` cookie and `x-forwarded-for`, passes `trusted = deployed`, and sets the cookie with `newBrowserId()` and `gateCookieOptions(deployed)`. `readBrowserId` refuses any cookie value this app did not mint.
- **`withGateThrottle` takes a store, not a db.** `bindGateThrottle(db)` binds the three gate functions, and tests pass an in-memory store with the same counting rules. A failure's result also carries `lockedUntil` when that try started a lock, so the page can show the lock at once.
- `clearGateKey` takes `now` as well, because it prunes like every write. It returns `{ cleared }`.
- `recordGateFailure` prunes and upserts in one transaction (a savepoint when handed a transaction). The upsert computes the reset, the count and the lock in SQL from the existing row, so parallel tries never read-then-write. Its timestamps are ISO strings cast to `timestamptz`, because drizzle sends no column encoder in raw SQL. Malformed input throws `THROTTLE_INPUT_INVALID` before any query.
- [ASSUMPTION] A try refused by a lock is not counted, so a lock never extends itself.
- The test file drops only the rows it made. `test:db` needs `DATABASE_ENVIRONMENT=local` and the own-Postgres URLs in the shell; the proofs ran that way.

## Not verified

- C7, on a Vercel deployment: the operator's, on the first deploy.
- `review:warden`, recorded by `yarn review:run`.

## Next

LAB-7's action calls `withGateThrottle(bindGateThrottle(sandboxDb()), keys, now, () => grantAccess(…))`.
