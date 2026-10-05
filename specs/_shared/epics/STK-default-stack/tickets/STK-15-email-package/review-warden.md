# Review — warden on STK-15

> Written by `yarn review:run warden STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: b3afca1d007a01cc26be74a2c89661dfe0653d89eca8bbba832524b4f0965151
- as_built_sha256: 27c12c58bb19151a6826544c5a1324a944cfef6439bd507dff8bca062078f780
- head: 3ebd17532e276a28772c6aa9b71ca59b2edfd0e1
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:37:11Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C1.log (sha256 a737f28e03a2)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C2.log (sha256 2daf8c2c36a3)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C3.log (sha256 52c8f0b61bb2)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C4.log (sha256 ae26f08b2a8e)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/env.ts, apps/web/lib/email.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/tsconfig.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, packages/config/eslint/boundaries.js, packages/email/README.md, packages/email/eslint.config.mjs, packages/email/package.json, packages/email/src/default-template.test.ts, packages/email/src/default-template.ts, packages/email/src/mailer.test.ts, packages/email/src/mailer.ts, packages/email/tsconfig.json, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

# Warden review — STK-15 email-package

## Criteria

**C1 — "A send on the local tier logs and does not call the vendor." PASS.**
`createMailer` checks the tier before any client exists: the Resend client is built lazily at `packages/email/src/mailer.ts:134`, below both the `withheld` and `logged` returns, so on `local` no constructor runs and no key is needed. Proven by `packages/email/src/mailer.test.ts:43` (injected vendor records zero calls, the log line carries subject and text, the recipient is masked and the raw address is asserted absent) and `:65` (a dashboard template logs its id and variable *names*, never their values). `evidence/C1.log:979-1045` shows all 17 email tests passing, exit 0.

**C2 — "The default template renders the brand name, from and reply-to from @pem/brand with no literal." PASS.**
`default-template.ts:86,93,94` read `brand.name`, `brand.contact.support` and `brand.urls.home`; the two colours come through `oklchToHex(brand.theme…)` at `:33-34`. From and reply-to are built from `brand` in `mailer.ts:90-94` and asserted equal to the brand values in `mailer.test.ts:107-108`. The no-literal claim is enforced, not asserted: `default-template.test.ts:65` scans every non-test source for each brand string, a hex colour, an `oklch(` and any address. `packages/email/eslint.config.mjs:9-17` additionally bans `process.env` inside the package, so values can only arrive as arguments — the control sits a layer below the test.

**C3 — "Boundaries pass with resend owned by email." PASS.**
`SDK_OWNERS` at `packages/config/eslint/boundaries.js:101` maps `resend → email`, and `ownerOverrides()` (`:169`) grants only `packages/email/**` source files the exemption. `email: ["config","env","brand","observability"]` at `:89`. Pinned both ways in `tooling/boundaries.test.ts:91-100` (fails from `apps/web`, fails from `@pem/observability`) and `:153-156` (passes from `packages/email`, and `@pem/email/mailer` passes from the app). `evidence/C3.log` exit 0.

**C4 — "Types and build pass." PASS.** `evidence/C4.log` exit 0; `check-client-bundle` reports 18 server-only values and none in 27 browser-facing files (`:1970`), which covers the planted `RESEND_API_KEY` sentinel.

**Non-negotiables.** Locked module: `toolkit.json:289-296` has `"locked": true, "runbook": null`, and no `docs/runbooks/remove-email.md` exists. `RESEND_API_KEY` is server-schema only (`apps/web/env.ts:100`), tiered, absent from `nextConfigEnv`, and `apps/web/lib/email.ts:8` adds `server-only`. `resend` 6.32.0 pinned exact with its row at `docs/engineering/tech-stack.md:49`.

Deviations in the as-built match the code I read; the two "Not verified" lines (no real send, no mail-client render) are stated honestly and are the right items to leave to a runtime check.

## Findings

**Should-fix — a production deployment left on the local tier drops every email silently, and nothing is paged.**
`packages/email/src/mailer.ts:105` signals `email.withheld` through `log.warn`. Only `log.error` reaches the error reporter (`packages/observability/src/logger.ts:57-74`); `warn` prints to the console and stops there. Adversary: no attacker, just a misconfigured `DATABASE_ENVIRONMENT`. Path: deploy → tier resolves `local` → every password reset and sign-in link returns `{status:"withheld"}` → a console line in platform logs nobody reads. Impact: a locked-out user cannot recover their account and the team learns from a support ticket, not a page. Fail-closed is the right call; the invisibility is not. The fields already logged (`tier`, `reason`, `recipientCount`) carry no personal data, so switching to `log.error` is safe under `redactFields` and costs one word.

**Consider — recipients skip the single-line treatment the sender gets.** `mailer.ts:99` flattens `to` and `:136` hands it to the vendor unchanged, while `from` goes through `singleLine` (`:66`) and the subject is stripped of CR/LF (`default-template.ts:124`). Resend's JSON API means this is not a header-injection path, so the asymmetry is defensible — but the comment at `mailer.ts:69` says "no value can add a header," which overstates what is enforced.

**Consider — the local log prints link tokens, and the guard does not cover CI.** `mailer.ts:125` logs the full rendered `text`, which is the point on a developer's terminal. `scrubText`'s pair rule keys on exact names (`packages/observability/src/redact.ts:10-34,105-117`), so `token=` is redacted but `token_hash=` — Supabase's own parameter — is not. The guard is `deployed`, false in CI, so a future test or script that sends through the mailer would put a live-shaped link into a retained job log. Nothing does today.

**Consider — the no-literal scan stops at the package boundary.** `default-template.test.ts:66-70` reads only `packages/email/src`, but `toolkit.json:290` counts `apps/web/lib/email.ts` as part of the module. That file is clean now; a brand string or address added there would not trip the scan.

**Consider — "dashboard templates referenced by id in env" rests on prose.** `DashboardTemplate.id` is a plain string (`mailer.ts:42`); the only thing holding the non-negotiable is `packages/email/README.md:12`. Nothing to enforce yet, since no `RESEND_TEMPLATE_*` variable exists, but the promise and its enforcement are in different places.

No Blocking finding. The insider pass turns up nothing: no message content, address or key is retained anywhere, the one place a body is written is a console on a machine the developer already owns, and the deployment case is withheld before rendering reaches the log.

VERDICT: PASS
