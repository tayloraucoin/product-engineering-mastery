# Review — mason on STK-15

> Written by `yarn review:run mason STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: b3afca1d007a01cc26be74a2c89661dfe0653d89eca8bbba832524b4f0965151
- as_built_sha256: b54b3f09baac51ef4710b448dc9a10cf29216eaab3ce82408b9039ae0ac531f0
- head: 3e3b46840f915a7cf1866f35f74957847fb5c887
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:43:28Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C1.log (sha256 eba70bbd3662)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C2.log (sha256 9291db1f897a)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C3.log (sha256 ba563a40716f)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C4.log (sha256 585df8bb7fdd)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/env.ts, apps/web/lib/email.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/tsconfig.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, packages/config/eslint/boundaries.js, packages/email/README.md, packages/email/eslint.config.mjs, packages/email/package.json, packages/email/src/default-template.test.ts, packages/email/src/default-template.ts, packages/email/src/mailer.test.ts, packages/email/src/mailer.ts, packages/email/tsconfig.json, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

**VERDICT: PASS** (no Blocking findings)

## Proof freshness

C1–C3 ran at `8f2e32a`, C4 at `e486e8c`; the only commits after those heads (`e486e8c`, `3e3b468`) are the results writes themselves, and no STK-15 planned path is dirty in the working tree. Every proof is fresh against the code I read.

## Criteria

**C1 — a send on the local tier logs and does not call the vendor: MET.**
`evidence/C1.log` exit 0, 134 tests, with subtests 7–9 and 15 covering it. The code backs the claim: `packages/email/src/mailer.ts:104-131` returns `withheld` or `logged` before line 137, the only place a Resend client is constructed (`resendSender`, `mailer.ts:80-83`). The vendor is injected (`SendEmail`, `mailer.ts:57`), so `mailer.test.ts:54` asserting `calls.length === 0` is a real observation, not a mock of the thing under test. The local tier also needs no key (`mailer.test.ts:84`), which matches the code path order.

**C2 — the default template renders brand name, from and reply-to from `@pem/brand` with no literal: MET.**
`evidence/C2.log` exit 0, same head. `default-template.ts:86,93,94` read `brand.name`, `brand.contact.support`, `brand.urls.home`; the two colours come from `oklchToHex(brand.theme.*)` (`default-template.ts:33-34`), which `@pem/brand` does export (`packages/brand/package.json:11`). From and reply-to are assembled in `mailer.ts:90-94` and asserted equal to the brand values in `mailer.test.ts:107-108`. The no-literal scan (`default-template.test.ts:65-101`) walks `src/` recursively and fails on any brand value, hex, `oklch(` or address-shaped literal.

**C3 — boundaries pass with `resend` owned by `email`: MET.**
`evidence/C3.log` exit 0, clean. `SDK_OWNERS.resend = "email"` (`packages/config/eslint/boundaries.js:101`), `email` is an element (`:68`) allowed only `config, env, brand, observability` (`:89`), and `ownerOverrides()` (`:169-179`) is what lets the package import what it owns. Pinned both directions by `tooling/boundaries.test.ts:86-100` (email→auth, apps/web→resend, observability→resend all fail) and `:153-156` (email→resend+brand+observability, apps/web→`@pem/email/mailer` pass) — green as C4.log tests 13–15, 26–27. `resend` appears in exactly one source file repo-wide.

**C4 — types and build pass: MET.** `evidence/C4.log` exit 0 for `yarn verify`.

**Non-negotiables.** All five hold. Locked module: `toolkit.json:289-296` (`locked: true`, `runbook: null`), no `docs/runbooks/*email*` exists, and the `check-stack` locked-module fixture is green. Dashboard templates are typed to Resend's own shape — `DashboardTemplate` (`mailer.ts:41-44`) mirrors `EmailTemplateOptions` in `node_modules/resend/dist/index.d.mts:528-533`, where `subject` is correctly optional for the template variant, so that path is vendor-valid and not just stand-in-valid.

**Architecture (tier 2, one-way-door paths read in full).** The boundary graph change matches D-STK-1 and D-STK-16 verbatim — `email` above `auth`, below `services`, no upward edge, layer comment updated (`boundaries.js:6`). Package API is two subpaths, named exports, no barrel. `apps/web/lib/email.ts` is the right home: `@pem/services` has no `email` edge, and extracting one with zero consumers would be premature packaging; the README records how the first service takes a `Mailer` from its caller. Plain `Error` in the mailer is correct rather than drift — the domain taxonomy lives in `packages/services/src/errors.ts`, a higher layer email may not import. The `deployed` guard is derived from `productionRuntime` (`apps/web/env.ts:71`), never set by hand, and errs toward withholding.

## Findings

**Should-fix — `packages/email/README.md:8` and `packages/email/src/mailer.ts:7-8` overstate what the local log shows.** Both say the local tier logs the rendered message so a developer reads the mail in the terminal. The line goes through `redactFields`, which scrubs every string value: `scrubText` replaces email addresses (`packages/observability/src/redact.ts:95-98`), any `?code=` query value (`:93`) and any `token=`-style pair (`:105-116`). So `from` and `replyTo` print as `[redacted]`, and a link carrying a code or token is not clickable from the log. Masked recipients survive by design (`*` is outside the local-part charset), which is good. Fix: one clause in the Tiers paragraph naming the scrubbing, so the first person testing a link locally does not go hunting for a bug in the mailer.

**Consider — `packages/email/src/default-template.test.ts:72-84` cannot catch a brand *name* literal that differs from `brand.name`.** Addresses and colours are caught by pattern, brand values only by equality. The slice's stated risk is a hard-coded brand value; a stray name that disagrees with `brand.ts` would pass. Low odds here (the name is read in both parts), and the fix is not obvious — noting it so nobody reads this scan as stronger than it is.

**Consider — `packages/email/README.md:12` keeps the "dashboard template ids live in env" rule in prose only.** No `RESEND_TEMPLATE_*` variable exists yet, so there is nothing to enforce and no code to misplace; `DashboardTemplate.id` is a bare `string` and would accept a literal. When the first dashboard template lands, that ticket should add the mechanism, not another paragraph.

Clean work on a one-way-door path: the boundary edge, the SDK ownership and the tier guard are all pinned by structural tests rather than by prose, and the deferral of the `services` edge is recorded with its trigger. The as-built's claims check out against the code, including the post-review additions and the stated "not verified" items (no real Resend send, no mail-client render) — which remain the right next step.

VERDICT: PASS
