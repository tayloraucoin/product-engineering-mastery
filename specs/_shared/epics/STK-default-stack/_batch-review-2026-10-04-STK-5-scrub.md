# Review 2026-10-04: STK-5 follow-up (free-text scrub, 3631988), by vigil

Tier 1. Verdict as delivered: **PASS**, no Blocking finding. C1 to C5 and the non-negotiables still hold; the scrub only adds protection. Disposition is at the end.

## Findings

- **S1 (Should-fix)** `redact.ts`: the email pattern had no start anchor, so a long run of word characters cost O(n²) on every log line.
- **S2 (Should-fix)** `redact.ts`: the `key=value` rule used a fixed name list behind `\b`, so it missed `client_secret=`, `STRIPE_SECRET_KEY=`, `accessToken=`, `api-key=`, `pwd=`, `password: x`, `"password":"x"`, `?email=` and tRPC `?input=`, and disagreed with the key rule. The as-built overclaimed it.
- **S3 (Should-fix)** `redact.ts`: case-insensitive `Basic\s+<word>` rewrote prose ("upgrade from basic to pro").
- **S4 (Should-fix)** `redact.ts`: `toISOString()` on an invalid Date threw from the logger, before `reportError`.
- **S5 (Should-fix)** The error reaches the reporter as caught, and STK-18's contract has no criterion that scrubs its message and stack before Sentry. Owner: STK-18.
- **K1 (Consider)** Version strings (`pkg@1.2.3`) matched the email pattern.
- **K2 (Consider)** `code=` was redacted everywhere, including database error codes.
- **K3 (Consider)** A connection-string password was caught only when the host looked like a domain.
- **K4 (Consider)** Object keys are not scrubbed; the logger comment overstated it.
- **Discussion** STK-15's local `email.logged` line now scrubs addresses and tokens inside links, so a developer cannot follow a tokenised link from the local log.

## Disposition (builder)

- S1 to S4 and K1 to K3 are fixed in the commit after this file:
  - Every text pattern is anchored by a lookbehind or a literal and bounded, and a time-bounded test runs on 200,000-character strings.
  - `name=value`, `name: value` and `"name":"value"` go through `isSecretKey`, one rule for keys and text. The key rule gains `secretkey`, `privatekey`, `accesskey`, `servicerolekey`, `signingkey` and `pwd`.
  - `Authorization` values are redacted whole; `Bearer` needs a credential-length value; `Basic` is redacted only as an Authorization value.
  - An invalid Date logs as `[invalid date]`.
  - A domain made only of digits is not an email address.
  - `code=` is redacted only in a URL query.
  - Connection-string passwords have their own pattern.
- K4: the comment now says string values; keys stay unscrubbed.
- S5 is carried to Taylor: STK-18 is another ticket's contract.
- Discussion: kept as is. The local log is a log like any other, and redacting a token there is right.
