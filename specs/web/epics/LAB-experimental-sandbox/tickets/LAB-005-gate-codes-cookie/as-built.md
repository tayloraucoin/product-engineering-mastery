# As-built — LAB-5

## Shipped against the contract

- C1, C2: `apps/web/lib/sandbox/code.ts`. `normaliseCode` upper-cases ASCII only, drops everything outside `0-9A-Z`, maps `O` to `0` and `I`/`L` to `1`, then needs exactly 16 Crockford symbols (so `U` is a wrong code). `hashCode` is SHA-256 of the 16 symbols, checked against a fixed vector. `generateCode` encodes 10 bytes of `crypto.randomBytes` as four groups of four. The tests draw 500 cases per property from a seeded generator (mulberry32, seed printed in each test name). They cover forgiving spellings, one-symbol changes, 15 and 17 symbols, `U`, and ten non-ASCII stand-ins: Greek and Cyrillic look-alikes, `ı`, `ſ`, `ß`, the Kelvin sign and full-width forms.
- C3: `cookie.ts`. The cookie is `v1.<accessId>.<slug>.<issuedAt seconds>.<mac>`, with an HMAC-SHA256 under label `access-v1`. MACs are compared as base64url text in constant time, never decoded, because base64url ignores a final symbol's spare bits and two spellings would otherwise verify as one. Every one-character change at every position fails. So do a foreign slug, an age of 30 days or more, a future `issuedAt`, a missing or empty part, `v2`, `V1` or an empty version, and a MAC under `email-link` or `throttle`.
- C4, C5: `access-check.ts` holds `resolveViewerWith(deps, slug)`, and `access.ts` binds it to the request. The order is `getTeamMember()`, the registry, then the cookie. The database is reached only through `checkAccess`, after the cookie verifies. The tests run random, tampered and foreign-slug cookies, and an unknown slug with a valid cookie, against a `checkAccess` that throws when called. Team viewers are tested with a cookie reader that throws.
- C6: `link.ts`. The token is `<accessId>.<mac>`, label `email-link`, truncated to 16 bytes. `readLinkEmailWith` checks the registry before the database, so an unknown slug's token never reaches it. A cookie's MAC or a whole cookie is not a token. A request with only `?r=` resolves to the gate.
- C7: `robots.ts` exports `SANDBOX_NOINDEX_HEADERS`, which `next.config.ts`'s `headers()` returns. A source scan checks that line, that no robots file exists, and that `proxy.ts` is untouched. `sandboxSecretProblem` refuses fewer than 32 bytes, counted in bytes, and env.ts's schema calls it.
- C8: `yarn check-client-bundle` planted 37 server-only values, the three `SANDBOX_SECRET` forms among them, and found none in the browser output. `turbo.json` and `.env.example` list the same three names.

## Deviations

- **Pure cores, one server-only binding.** `node --test` cannot load `env.ts` (its extensionless imports) or anything importing `server-only`. So `code.ts`, `secret.ts`, `cookie.ts` and `link.ts` take the secret, clock and site URL as arguments, and `access.ts` is the one `server-only` file that binds them. This follows `team-check.ts` and `team.ts`. The contract's request-bound forms live in `access.ts`: `resolveViewer(slug)`, `readLinkEmail(db, slug, token)`, `linkUrl(slug, accessId)` and `accessCookieOptions(slug)`. Beside them sit `setAccessCookie(slug, accessId)`, `sandboxSecret()` and `sandboxDb()`, the database bound as `billing/webhook/ledger.ts` binds the ledger. `cookie.ts`'s pure `accessCookieOptions(slug, deployed)` takes `deployed` as an argument.
- **`secret-check.ts`.** `env.ts` reaches the browser bundle through `instrumentation-client.ts`, so the length check it imports cannot import `node:crypto`. `secret.ts` re-exports it.
- **The result type** is `{ kind: "team" | "reviewer" | "ended", viewer, experiment }`, `{ kind: "gate" }` or `{ kind: "not-found" }`. The viewer is LAB-3's `TeamViewer` or `ReviewerViewer`. Closed means `closedOn !== null`, since the registry refuses a future date.
- **`grantAccess(db, input)`** sits in `access-check.ts` beside `grantAccessWith(deps, input)`, which LAB-7's tests stub. Both are re-exported from `access.ts`.
- [ASSUMPTION] MACs are base64url without padding. The label and data are joined by a newline, which no label contains. A cookie over 256 characters, or a token over 128, is refused before it is split.
- [ASSUMPTION] With SANDBOX_SECRET unset, `setAccessCookie` and `linkUrl` throw, so LAB-7's action and LAB-20's sender fail before reporting success.
- The generated-input seed is printed in each test name and replayed by fixing `SEED`. An environment variable would need declaring to Turbo.
- After the first reviews (mason and warden, both PASS):
  - **`Secure` reads `productionRuntime`, not `deployed`** (Mason). A production build served off Vercel no longer sends the access cookie over plain HTTP. `cookie.ts`'s `accessCookieOptions(slug, secure)` takes the flag, and `access.ts` passes `productionRuntime`. `technical/gate.md`'s Cookies row now says so. LAB-6's `sandbox_gate` follows the same rule.
  - **Every `sandbox_access` value is read, and the first that verifies wins** (Warden). `resolveViewerWith` takes `readAccessCookies()`, so a cookie planted at a broader path cannot shadow the real one. Tested both ways: several bad values together still reach no database, and a planted value ahead of the real cookie does not hide it.
  - C7's count of `headers()` now counts definitions, not mentions, so a comment cannot fail it (Mason).

## Not verified

- `review:mason` and `review:warden` are recorded by `yarn review:run`.
- **The noindex header on the config Next actually receives.** C7 reads `next.config.ts`'s source because `node --test` cannot load the file: it imports `env.ts`. `withSentryConfig` composes the export. The installed `@sentry/nextjs` sets no `headers`, so nothing overrides it today (Warden). LAB-7's served check (C12) reads the `X-Robots-Tag` header off real responses.
- **`access.ts` itself**, the request binding, has no unit test, for the same reason. LAB-7's served check exercises it on a real and an unknown slug.
- Accepted residual (Warden): the link token carries no issue time, as D-LAB-38 defines it. An old link prefills only the address its own message was sent to, and `findAccessEmail` re-checks slug and revocation on every use.

## Next

LAB-6 wraps `grantAccess` in the throttle. LAB-7's page calls `resolveViewer` and `readLinkEmail`, and its action calls `setAccessCookie`. LAB-20 sends `linkUrl`.
