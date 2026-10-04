# Review — warden on STK-15

> Written by `yarn review:run warden STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 033fafa5858adffa8480f5b6e2fcd905a9b3b3e374e0b1683123e3e17ca3faca
- head: 137bcff45dd0c8a422aebc5ffa605d27fd053656
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T20:36:37Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C1.log (sha256 2f90f6080ff0)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C2.log (sha256 45331153ff14)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C3.log (sha256 21cb9d9a73f8)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C4.log (sha256 6e3436e08cd5)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/env.ts, apps/web/next.config.ts, apps/web/package.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, packages/config/eslint/boundaries.js, packages/email/README.md, packages/email/eslint.config.mjs, packages/email/package.json, packages/email/src/default-template.test.ts, packages/email/src/default-template.ts, packages/email/src/mailer.test.ts, packages/email/src/mailer.ts, packages/email/tsconfig.json, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-15 `@pem/email` (warden)

I could not read `.env.example` (denied by permission rule), so claims about its contents are unverified; where it mattered I found a path to the same answer through `turbo.json`, which I did read.

### Criteria

**C1 — met.** `mailer.ts:88-102` returns `{ status: "logged" }` before `sendEmail ??= resendSender(...)` at `:108`, so on `local` no Resend client is ever constructed — the vendor import at `:15` loads a module but opens no socket. `mailer.test.ts:38-58` proves it from the caller's side: zero vendor calls, the recipient masked to `p***@example.test`, and `assert.ok(!JSON.stringify(fields).includes("person@example.test"))` — an assertion that the raw address appears nowhere in the line, which is the right shape for this check. The dashboard-template case (`:60-77`) logs the variable *names* and asserts the values are absent. `C1.log:273-290` shows all thirteen email tests passing, exit 0. The fail-closed ordering is sound: tier is compared against the literal `"local"`, so any unexpected value falls through to the send path rather than silently suppressing mail.

**C2 — met.** Brand values are read, never written: `default-template.ts:33-34` (colours via `oklchToHex`), `:86` (name), `:93-94` (support address, home URL); the sender is assembled at `mailer.ts:74-78` from `brand.name` and `brand.contact.email`, with `EMAIL_FROM` as the only override, and reply-to is `brand.contact.support` with no override at all. The enforcing control is `default-template.test.ts:65-100`: it reads every non-test source in the package and fails on any brand string, any hex colour, any `oklch(`, or any address-shaped token. That is a structural check rather than a spot assertion — it survives a later refactor, which is what this non-negotiable needed. Escaping is correct for the contexts used (`:48-50` covers `&<>"'`, and every interpolation sits inside a double-quoted attribute or text node), and `safeUrl` at `:53-58` parses with `new URL` then rejects any non-http(s) protocol, tested against `javascript:` at `:54-63`.

**C3 — met.** `boundaries.js:58` adds the element, `:75` grants `email` only `config, env, brand, observability`, `:84` pins `resend` to `email` in `SDK_OWNERS`, and `:116-129` scopes the owner override to the package's own source files. A repo-wide grep confirms `from "resend"` occurs exactly once, at `mailer.ts:15`. `C3.log` exit 0. The as-built's claim of a rejected probe file in `apps/web` (`as-built.md:7`) is not in the evidence and I cannot confirm it, but the rule shape and the grep carry the criterion without it. `packages/email/eslint.config.mjs:8-18` additionally bans `process.env` inside the package, keeping the env seam where §5 puts it.

**C4 — met.** `C4.log` exit 0 end to end: format, `lint:docs`, hook checks, `check-refs`, `check-stack` (8 modules, nothing missing or left behind), `check-migrations`, `check-specs`, `check-test-weakening`, contrast, budget, lint, `check-types`, `check-client-bundle` (12 server-only values, none in 25 browser-facing files), both builds. Every staleness warning in that log names another ticket; none names STK-15.

**Non-negotiables** all hold, including the locked-module rule: `toolkit.json:252-253` marks `email` `locked: true` with `runbook: null`, and no removal runbook exists for it.

**As-built accuracy.** The one substantive deviation is true as written: `apps/web/package.json:13-22` has no `@pem/email`, `next.config.ts:27` omits it from `transpilePackages`, `env.ts:25-34` reads no email variable, and `turbo.json:5-27` names neither `RESEND_API_KEY` nor `EMAIL_FROM`. `resend` is pinned exact at `packages/email/package.json:25` and carries its row at `docs/engineering/tech-stack.md:42`.

### Findings

**Should-fix — a deploy that forgets `DATABASE_ENVIRONMENT` writes whole email bodies, including one-time links, into retained platform logs.** `packages/env/src/tier.ts:22-24`: unset or empty silently returns `local`, and `apps/web/env.ts:36,59` passes that already-defaulted value into the zod enum, so the schema can never fail on an absent variable. On a deployed host in that state, `mailer.ts:88-99` takes the log path and emits `subject` and the full rendered `text`. Transactional mail is where reset links, magic links and invite tokens live; the adversary is anyone with read access to the hosting platform's logs — a contractor, a vendor support engineer, a leaked CI token — and the impact is account takeover from a log line, plus no mail reaching users at all. The fail-safe *direction* is right (local, never production), but the local branch currently trusts the tier alone. `@pem/env` already exposes `isDeployed` and D-STK-3 establishes "where the code runs is derived, never set" (`technical.md:16`) — the control is to refuse the log path, or log metadata only and never the body, when the process is deployed. Not Blocking: nothing constructs a mailer today, so no body can reach any log on any tier as merged. It must be closed by the wiring change, before the first real send — not after.

**Should-fix — the guard that would catch a leaked email key does not cover it.** `check-client-bundle` plants sentinels from `.env.example` and `turbo.json` (`C4.log:124-128`, `codebase-conventions.md:121`). `turbo.json:5-27` contains neither `RESEND_API_KEY` nor `EMAIL_FROM`, so the key is outside the sentinel set regardless of what `.env.example` holds. STK-9 landed its database URLs in `turbo.json` even while deferring `.env.example`, which kept the coverage intact; this ticket defers both. Add both names to `turbo.json` and `.env.example` in the same change that teaches `env.ts` to read them, so the key is a sentinel from the first moment it exists.

**Consider — the email body bypasses the redactor by key name.** `packages/observability/src/redact.ts:10-29` redacts `body` and `requestbody`, not `text`, so the rendered message prints in full through `createLogger`. On `local` that is the designed behaviour and the correct call. But STK-5's promise is "no secret, request body or personal data reaches a log" (`logger.ts:11-13`), and this is the one place that promise does not hold. `info` currently reaches only `console` (`logger.ts:51-54`), never the reporter — worth a line beside either the redact list or `mailer.ts:89` recording that, so nobody later routes `info` to a vendor sink and ships email bodies off the machine without noticing.

**Consider — `formatSender` sanitizes the name but not the address.** `mailer.ts:54-56` strips `"`, `<` and `>` from the display name and interpolates `address` untouched, so a malformed `EMAIL_FROM` flows into the From header as given. The value is operator-set and the operator already holds the API key, so the exposure is small; a one-line shape check on the address closes it for the price of one line.

**Consider — nothing structurally prevents a client import of `@pem/email`.** `boundaries.js:92-94` lets any app import the package, and only `README.md:5` asks for a server-only module. No `packages/*` currently imports `server-only` (only `apps/docs/lib/docs.ts:1` does), so this matches house pattern rather than departing from it — but a `server-only` import in `mailer.ts` would turn a client import from a README convention into a build failure, and the wiring change is the natural moment.

No Blocking findings: the package keeps the vendor to one file, keeps brand values out of code with a scan that will hold, never constructs a client on `local`, and reads no `process.env`. The two Should-fix items both land in the deferred wiring, and that wiring now carries a security obligation, not just a convenience one.

VERDICT: PASS
