# As-built — STK-5

## Shipped against the contract

- C1: `createLogger(namespace)` in `@pem/observability/logger` has one call shape, `log.<info|warn|error>(event, fields?)`. `error` hands `fields.error` (or an Error named for the event), `tags` plus `namespace` and `event`, and `userId` to the reporter registered through `@pem/observability/error-reporter`. The default reporter is a no-op, and one that throws or rejects is swallowed (`logger.test.ts`).
- C2: every field is redacted by key, at any depth, case and separator ignored (`redact.ts`). Exact keys cover passwords, authorization, sessions, `input`, `payload`, `ip` and name fields. Suffixes cover secret, token, apikey, password, cookie, body, email, phone and address, so `userEmail`, `phoneNumber` and `requestBody` are caught. The reporter's context and tags are redacted too; the error object goes to the reporter as caught. The batch review's B1, S1 and S2 widened this (`_batch-review-2026-10-04-STK-5.md`). Every string value, an error's message and stack included, is scrubbed (`scrubText`, exported as `@pem/observability/redact`). The scrub covers connection-string passwords, Authorization values, bearer credentials, JWTs, OAuth codes in a query, email addresses, and any `name=value`, `name: value` or JSON pair whose name the key rule calls secret. Every pattern is bounded and linear (`_batch-review-2026-10-04-STK-5-scrub.md`).
- C3: `constants` and `observability` sit at the foundation layer in `boundaries.js`, importing only `config`, with `toolkit.json` entries (locked) and built rows in codebase-conventions §4.
- C4: `packages/utils`, `types` and `hooks` each hold one README stating the convention and what makes the folder a package (`evidence/C4.md`).
- C5: `yarn verify` passes.

## Deviations

- [ASSUMPTION] devs_call, logger format: `[namespace] event` plus the redacted fields object, printed on the console method for the level. No debug level, since the package cannot read the environment to switch it on.
- [ASSUMPTION] devs_call, constants file names: one file per subject; the first is `time.ts` (`SECOND_MS` to `WEEK_MS`). The README states the rule.
- [ASSUMPTION] The analytics stub is `track(name, properties)` over an `AnalyticsEvents` map with one example event, `page_viewed`. It is a no-op until P-G.
- Built in the same thread as STK-15 because STK-15 depends on it. Taylor asked for STK-15 only.
- `yarn.lock` was added to `planned_paths` before the start, for the two workspace entries.

## Not verified

- C4 is a reading judgment by the builder; the batch review re-reads it.
- Nothing calls `registerErrorReporter` yet; STK-18 registers Sentry.

## Next

STK-18 registers Sentry as the reporter, and its `beforeSend` runs `scrubText` over the error, which reaches the reporter as caught for its stack frames.
