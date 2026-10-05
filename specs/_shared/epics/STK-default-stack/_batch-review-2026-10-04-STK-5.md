# Batch review 2026-10-04: STK-5 (tier 1), by vigil

Verdict as delivered: **FAIL**, one Blocking finding. Disposition is at the end.

## Criteria

- C1 met: `logger.ts` hands error, tags plus namespace and event, and userId to `reportError`; `error-reporter.ts` swallows a throw and a rejection; tests pass in `evidence/C1.log`.
- C2 met as worded: password, token and Authorization are redacted at any depth and case.
- C3 met: both packages are foundation elements importing only `config`; `evidence/C3.log` exits 0.
- C4 met on a fresh reading: each of the three READMEs states a convention and the trigger for its first module; each folder holds `README.md` only.
- C5 met: `evidence/C5.log` exits 0.

## Non-negotiables

1, 3, 4, 5 and 6 met. 2 (never logs secrets, request bodies or personal data) partly met: see B1 and S2.

## Findings

- **B1 (Blocking)** `redact.ts`: personal-data keys matched exactly, so `userEmail`, `emailAddress`, `phoneNumber` and `ipAddress` printed in the clear. Fix: suffix-match `email`, `phone`, `phonenumber` and `address`; add exact `ip`, `firstname`, `lastname`, `fullname` and `displayname`; add a test.
- **S1 (Should-fix)** `logger.ts`: `tags` were redacted on the console line but reached the reporter raw.
- **S2 (Should-fix)** `redact.ts`: request bodies matched only `body` and `requestBody`; this stack's are `input` (tRPC) and `payload`.
- **K1 (Consider)** `redact.ts`: the `describeError` comment said an Error's own properties are redacted, but they are dropped.
- **K2 (Consider)** Error message and stack pass through untouched; STK-18's Sentry `beforeSend` should scrub free text.
- **K3 (Consider)** The contract's C5 uses `yarn verify` as a criterion, which `.claude/rules/specs.md` says it never is.

## Disposition (builder)

- B1, S1, S2 and K1 fixed in the commit after this file. `body` and `cookie` moved to the suffix list as well. Two tests were added: compound personal-data and body names, and a secret-like tag redacted before the reporter. C1 to C3 and C5 re-proven after the fix.
- K2 is carried to STK-18. K3 is carried into the report; the contract is frozen.
