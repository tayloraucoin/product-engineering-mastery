---
id: LAB-5
size: small
objective: "Every experiment page and sandbox action learns who is asking through one resolveViewer(slug), backed by forgiving hashed codes, a signed per-slug cookie and an email-link token that only fills the email, while both trees send noindex."
slice_type: "Authentication for guests without accounts (one-way doors 3 and 7); the risk is a database read before the cookie verifies, a code that normalises two ways, or a link that grants access."
non_negotiables:
  - "resolveViewer follows gate.md's request path: getTeamMember() first; for anyone else an unknown slug, a missing cookie or a bad cookie returns no access with no database call; checkAccess runs only after the cookie verifies; the registry then says open or closed."
  - "Codes are 16 Crockford symbols from crypto.randomBytes, normalised as gate.md says, stored and compared only as SHA-256 of the normalised symbols; never logged, never in a URL."
  - "sandbox_access is exactly gate.md's Cookies row: v1 format, HMAC-SHA256 under label access-v1, Path=/experimental/<slug>, HttpOnly, Lax, Secure when deployed, Max-Age 30 days fixed from issue; every MAC compares in constant time."
  - "SANDBOX_SECRET is tiered in apps/web/env.ts, server-only, at least 32 bytes, listed in turbo.json and .env.example; each use has its own label; unset, every reviewer path fails closed and no fallback secret exists."
  - "The link token fills the email only and never grants access; a bad, foreign-slug or erased token is ignored silently; the link's origin is env's site URL, never the request host."
  - "next.config.ts headers() stamps X-Robots-Tag: noindex, nofollow on /experimental/:path* and /admin/:path* only; no robots file; proxy.ts untouched."
  - "No new dependency and no new query: the database is reached only through LAB-3's gate group; errors are fixed strings that never echo input."
devs_call: "The split between pure cores and request-bound wrappers, the result type's names, the seeded generator in the tests, and the MAC encoding (base64url or hex)."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/gate.md"
  - "D-LAB-30"
  - "D-LAB-31"
  - "D-LAB-32"
  - "D-LAB-38"
truth_files: "none: server modules and config; the gate's UX file promotes with LAB-7"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "no database read before the cookie verifies (warden)"
  - "code normalisation under generated inputs (warden)"
operator_review: false
planned_paths:
  - "apps/web/lib/sandbox/code.ts"
  - "apps/web/lib/sandbox/cookie.ts"
  - "apps/web/lib/sandbox/link.ts"
  - "apps/web/lib/sandbox/access.ts"
  - "apps/web/lib/sandbox/secret.ts"
  - "apps/web/lib/sandbox/robots.ts"
  - "apps/web/lib/sandbox/*.test.ts"
  - "apps/web/env.ts"
  - "apps/web/next.config.ts"
  - "turbo.json"
  - ".env.example"
depends_on:
  - LAB-2
  - LAB-3
  - LAB-4
out_of_scope:
  - "The throttle and the sandbox_gate cookie: LAB-6."
  - "The gate page, its form, action, words and ?state= keys: LAB-7."
  - "Each layout's robots metadata: the ticket that builds the layout."
  - "Issuing and replacing codes in /admin: LAB-15. Sending the email: LAB-20."
criteria:
  - id: C1
    statement: "Over generated inputs, any spacing, dashes, case, trailing newline or O/I/L confusable normalises to the same 16 symbols and hash; any one-symbol change, 15 or 17 symbols, a U, or a non-ASCII character standing in for a symbol fails as a wrong code."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "generateCode returns 16 Crockford symbols shown as four groups of four; 1,000 codes are distinct and each normalises to itself."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A signed cookie verifies for its slug under 30 days; a one-character change anywhere, a foreign slug, an age of 30 days or more, a future issuedAt, a missing part, another version, or a MAC under another label each fail."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "Over generated cookie values (random, tampered, other slugs) and an unknown slug with a valid cookie, resolveViewer returns no access and its database stub, which throws when called, is never called."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "resolveViewer gives a team viewer to a developer or admin without reading the cookie, 404 to the team on an unknown slug, no access when checkAccess returns null, ended for a live access on a closed experiment, and a reviewer viewer on an open one, passing a signed-in reviewer's user id."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "A link token fills its access's email on its own slug; a tampered token, a cookie MAC, a foreign-slug or erased access gives null with no error; a request carrying only ?r= still gets no access."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "The headers config sends X-Robots-Tag: noindex, nofollow for /experimental/:path* and /admin/:path* and for no other source, and a source scan finds next.config.ts's headers() returning that array; a SANDBOX_SECRET under 32 bytes is refused."
    evidence: test
    command: "yarn workspace web test"
  - id: C8
    statement: "SANDBOX_SECRET and its tiered forms never reach a browser bundle, and turbo.json and .env.example list the same names."
    evidence: check
    command: "yarn check-client-bundle"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
---

# Contract — LAB-5 gate-codes-cookie

## Build notes

- **Approach:**
  - Pure cores take the secret, the clock and their inputs; thin wrappers read `env`, `cookies()` and `getAuthContext()`. Model the seam on `apps/web/lib/billing/webhook/handle.ts` (a pure handler with an injected ledger) and its test.
  - `access.ts`:
    - `resolveViewer(slug)` builds on a `resolveViewerWith(deps, slug)` core. Order: `getTeamMember()` (LAB-2); `findExperiment(slug)` (LAB-4), unknown means no access; the cookie verified; `checkAccess` (LAB-3); open or closed.
    - `grantAccess(db, { slug, code, identity })` returns `{ accessId }` or null: unknown slug or malformed code is null with no database call; otherwise `findLiveReviewerByCodeHash` then `createAccess` with the email trimmed and lower-cased, or the user id. LAB-7's action calls it after LAB-6's throttle and sets the cookie.
  - Bind the db in `lib/sandbox` as `apps/web/lib/billing/webhook/ledger.ts` binds the ledger.
- **Decisions that apply:**
  - D-LAB-30 to 32 (R1): "the page checks the cookie's signature, slug and age before any database read, then `access.ts` checks code, version, open or role. The gate renders in place (no redirect, no rewrite), one component for every slug. Noindex via `next.config.ts` `headers()`, so D-STK-7 stands as written. Codes: 16 Crockford symbols, forgiving input, SHA-256. Cookie per slug, Lax, 30 days fixed."
  - D-LAB-31 (gate.md): "Input: uppercase; drop every character outside `0-9A-Z`; map `O` to `0`, `I` and `L` to `1`. Exactly 16 valid symbols, or it is a wrong code (same error, counts as a try)."
  - D-LAB-38 (R6): "The email link is `/experimental/<slug>?r=<token>`: a signed access id that fills the email and never grants access. Slugs are named as if they will leak." Token: `<accessId>.<mac>`, label `email-link`, truncated to 128 bits.
  - D-LAB-42 (R12): "Noindex header and meta only; no robots disallow, since a disallowed page's noindex is never read."
  - S10 (brief): "Access on a device lasts 30 days. Every request re-checks that the code is still live."
  - S12b (brief): "an unknown slug, a wrong code, a revoked code and a closed experiment look the same."
  - Gate group (Taylor, Tickets gate, 2026-10-05): its functions "return only ids, versions and flags (plus the access's email, for a verified link token)."
  - `getTeamMember()` (LAB-2) is the one team check; resolveViewer calls it first.
- **Interfaces:** `normaliseCode`, `generateCode`, `hashCode` (code.ts); `sandboxMac(secret, label, data)` and `sandboxSecretProblem(value)` (secret.ts); `signAccessCookie`, `verifyAccessCookie`, `accessCookieOptions(slug)` (cookie.ts); `signLinkToken`, `linkUrl(slug, accessId)`, `readLinkEmail(db, slug, token)` (link.ts); `resolveViewer`, `grantAccess` (access.ts), returning `team`, `reviewer`, `ended`, `gate` or `not-found`, with LAB-3's `Viewer`; `SANDBOX_NOINDEX_HEADERS` (robots.ts), which next.config.ts spreads into `headers()`.
- **Per path:** one module each as listed. `env.ts` gains the three raw names, the schema entry (refined by `sandboxSecretProblem`) and the tiered pick. `.env.example` gets the names with a comment saying what breaks without them. Tests sit beside each module, names starting with the criterion id.
- **Gotchas:**
  - Upper-case only ASCII: `toUpperCase` turns `ß` into `SS` and `ı` into `I`, which would invent symbols. Drop non-ASCII first (judgment, Mason).
  - `U` is not a Crockford symbol: it is a wrong code, never remapped.
  - Domain-separate every label, so a link MAC never verifies as a cookie.
  - `getAuthContext()` is React-cached, so calling it after `getTeamMember()` costs no second `getUser`.
  - Generated inputs need no dependency: a seeded loop over `crypto.randomBytes`, with the seed printed on failure.
  - `Secure` reads `deployed` from env.ts. Never log a code, a cookie or a token, even on failure.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model reads the database to check the slug "for safety", which is exactly the leak the order prevents.
