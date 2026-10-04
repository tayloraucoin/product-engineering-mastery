# Review — vigil on STK-15

> Written by `yarn review:run vigil STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 033fafa5858adffa8480f5b6e2fcd905a9b3b3e374e0b1683123e3e17ca3faca
- head: 137bcff45dd0c8a422aebc5ffa605d27fd053656
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T20:36:36Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — STK-15 `@pem/email`

Reviewed in fresh context from the contract, `results.json`, the as-built, the four evidence logs, the changed files, and `technical.md` (D-STK-12, D-STK-13, D-STK-16). I built the checklist from the contract before reading `packages/email`.

### Criterion by criterion

**C1 — "A send on the local tier logs and does not call the vendor." MET.**
`createMailer` returns `{ status: "logged" }` on `local` and returns before any Resend client is constructed (`packages/email/src/mailer.ts:88-102`); `resendSender` is only reached after the tier gate and the key gate (`mailer.ts:104-108`). The log line carries subject, rendered text, masked recipients, and — for a dashboard template — the id and the variable *names* only, never their values (`mailer.ts:89-100`). Tests cover both message kinds, the no-key local case, the staging/production send, the missing-key refusal and the vendor error (`mailer.test.ts:38-161`); all 13 pass in `C1.log:273-321`. The recipient-masking assertion is adversarial (`mailer.test.ts:57` asserts the raw address appears nowhere in the fields) — good.

**C2 — "The default template renders the brand name, from and reply-to from @pem/brand with no literal." MET.**
Name, home URL, support address and both colours are read from `@pem/brand` and the colours converted via `oklchToHex` (`default-template.ts:14-15,33-34,86-94`); `from` is `brand.name <EMAIL_FROM ?? brand.contact.email>` and reply-to is `brand.contact.support` (`mailer.ts:74-78`). The literal ban is enforced by a source scan over every non-test file in `src/`, covering brand strings, hex, `oklch(` and any address-shaped token, with a `sources.length >= 2` guard so it cannot pass by scanning nothing (`default-template.test.ts:65-100`). Escaping and the non-http(s) refusal are tested too (`default-template.test.ts:42-63`). Passes in `C2.log` / `C1.log:267-272`.

**C3 — "Boundaries pass with resend owned by email." MET.**
`SDK_OWNERS` has `resend: "email"` (`boundaries.js:81-85`); the root config applies `restrictedImports(null)` to all of `apps/**` and `packages/**`, which bans `resend` and `resend/*` everywhere (`boundaries.js:173-217`), and `ownerOverrides()` re-grants it to `packages/email/**/*.{ts,…}` only (`boundaries.js:117-129`). `email`'s edge list is `config, env, brand, observability` (`boundaries.js:75`), matching the package's actual imports and its `dependencies` (`packages/email/package.json:21-26`). `C3.log` exit 0; the root script is `eslint . --max-warnings 0`, so the rule set genuinely ran. The as-built's "a probe file in `apps/web` importing `resend` was rejected" (`as-built.md:7`) has no recorded artifact — I accept it as **verified in code**, not as evidence.

**C4 — "Types and build pass." MET.** `C4.log` exit 0: `check-stack`, `check-specs`, `lint`, `check-types`, `check-client-bundle` (12 server-only values, none leaked), both builds. `@pem/email` appears in the lint, type and test task sets.

**Non-negotiables.** (1) resend owned by email — met. (2) Local never sends — met. (3) From/reply-to/brand from `@pem/brand` and env, never literals — met at the package seam; the env half is a parameter, and no app passes it yet (see F1). (4) One default HTML template in code, dashboard templates by id from env — met (`mailer.ts:32-41`, `README.md:12`); `template: { id, variables }` is a real field of `CreateEmailOptions` in resend 6.32.0 (`node_modules/resend/dist/index.d.mts:528-613`), and the union correctly excludes `html`/`text`, which the test asserts (`mailer.test.ts:128`). (5) Locked module — `toolkit.json:247-254` has `locked: true`, `runbook: null`, and no `docs/runbooks/remove-email.md` exists.

**Deviation check.** The as-built's reason for backing out the `apps/web` wiring is factually correct, not a convenience: a name in `turbo.json` that `.env.example` lacks is drift and **fails `check-client-bundle` in every mode** (`tooling/check-client-bundle.ts:14-21,89-99`), and `.env.example` is in a permission-denied path — my own read of it was refused too. Backing the wiring out rather than shipping a red `verify` was the right call, and it is declared, not buried. Rule 9 ("a seam ships with a default consumer **or** a README that states its convention", `codebase-conventions.md:30`) is satisfied by `README.md:14-30`, and `packages/services` does not exist yet, so the ticket note's "example call from a service" could not land as a file.

### Findings

**Should-fix — the module's two environment variables exist in the manifest and nowhere else.** `toolkit.json:249` declares `env: ["RESEND_API_KEY", "EMAIL_FROM"]`, but neither name appears in `turbo.json:5-27`, in `apps/web/env.ts:25-34`, or (per the as-built) in `.env.example`. `check-stack` only reads `env` for *removed* modules (`tooling/check-stack.ts:161-191`), so nothing will ever flag this. The consequence is for a porting developer following `docs/runbooks/new-project.md` ("fill `.env.example` values"): a locked, un-removable module with no variable to fill and no prompt that it needs one. The as-built's remedy lives in a "Next" line (`as-built.md:26-28`) on a document that becomes immutable at merge and that nobody re-reads. Owner: whoever closes the epic — carry it as a ticket, not a note.

**Consider — C1's observability claim is proven only at the seam.** Every test injects a memory logger (`mailer.test.ts:29-36`), so the real `createLogger` path is never exercised by this package. I checked it by hand: none of `tier`, `from`, `replyTo`, `recipients`, `subject`, `text`, `templateId`, `templateVariables` matches `isSecretKey`, so the body does print today (`packages/observability/src/redact.ts:10-41`). But the redactor matches on key names including `email`, `address` and `body` — the day someone renames `recipients` to `addresses`, the local log silently becomes `[redacted]` and the one feature of the local tier quietly dies with every test still green. One test through `createLogger("email")` with a captured console would pin it.

**Consider — a successful hosted send leaves no trace in our own logs.** `mailer.ts:110-115` returns the id without a log line, so on staging and production the only record of what was sent is Resend's dashboard. One `log.info("email.sent", { templateId or subject, recipients: masked, id })` would cost nothing and makes "did the welcome mail go out?" answerable from our side.

**Consider — a relative action URL surfaces as `Invalid URL`.** `safeUrl` (`default-template.ts:53-57`) names the problem beautifully for `javascript:`, but `new URL("/welcome")` throws TypeError first, so the caller sees a bare `Invalid URL` with no mention of the email, the field, or the http(s) rule. Wrap the construction and reuse the existing message.

**Consider — `formatSender` sanitises the name but not the address.** `mailer.ts:54-56` strips `"<>` from `brand.name` while `config.fromAddress` goes in untouched, so a stray `>` or trailing whitespace in `EMAIL_FROM` produces a malformed `From` header that fails at the vendor with no named variable — unlike the missing-key path (`mailer.ts:104-107`), which names it well. A one-line shape check would make the two failure modes equally legible.

**Consider — C4's command is `yarn verify`.** `.claude/rules/specs.md` says `yarn verify` is never a criterion; it runs once at batch close. The contract (`contract.md:57-59`) makes it one, so C4's proof is the whole batch's proof rather than this ticket's. A contract-authoring nit, consistent across sibling STK tickets, worth fixing in the template rather than here.

### Conversations

The template renders *all* body copy, the footer rule and the footer links in `brand.theme.primary` on `brand.theme.primaryForeground` (`default-template.ts:33-34,81-94`). Contrast is not the issue — the audit records 17.16:1 for that pair — but a transactional email whose every word is set in a saturated brand colour reads differently from one with neutral ink and a brand-coloured button. Was that the intent, or is a neutral `foreground` token the one that should carry copy with `primary` reserved for the action? Design owner's call; I have no spec line to cite either way.

Related: the document declares `color-scheme: light` with light-only values (`default-template.ts:78-81`) and no `prefers-color-scheme` block, so dark-mode Apple Mail and Outlook will force-invert it on their own terms. The as-built is honest that nothing has been opened in a mail client (`as-built.md:21-24`). Is one pass through a rendering service worth it before a product sends real mail, or is force-inversion acceptable for the starter's default?

Smaller: the footer says "Questions? Reply to this email or write to <support>" while reply-to *is* support (`default-template.ts:93`) — two routes to one inbox, which may read as "replying won't work." And the local log carries the full rendered text, including action URLs, which for a magic link or reset means a live token in a terminal scrollback. That is exactly what the criterion asks for and it is local-only, but one README line telling a developer not to paste a local email log into a ticket would be cheap.

### Runtime checklist (ordered by risk, none of it done yet)

1. On staging, with `EMAIL_FROM` on a Resend-verified domain, send one real message: confirm the display name is the brand, reply-to lands in support, and the recipient receives both parts.
2. Send a dashboard-template message by an id read from env: confirm variables substitute and no `html`/`text` is attached.
3. Unset `RESEND_API_KEY` on staging and confirm the refusal names the variable before any vendor call.
4. Once the wiring lands, run the local tier and confirm `[email] email.logged` prints subject and full text with recipients masked — through the real logger, not a stand-in.
5. Open the message in Apple Mail (dark), Gmail web, Gmail Android and Outlook Windows: the button, the preheader, and the primary-colour body.
6. After adding both names to `.env.example` and `turbo.json`, re-run `yarn check-client-bundle` and confirm no drift and no sentinel in the client bundle.

### Assumptions

`[ASSUMPTION]` `.env.example` is unreadable to me as it was to the builder, so its contents are taken from the as-built; finding F1 rests on that and on the absence of both names from `turbo.json`. `[ASSUMPTION]` the back-out commit `7086a07` preceded head `aa7df74`; the tree and `C4.log`'s drift-free `check-client-bundle` are consistent with that, but staleness should be confirmed with `yarn check-specs --strict` before merge. `[ASSUMPTION]` the cached turbo logs in `C1.log`/`C2.log` are valid proof for that head, since the test task's inputs cover the package source.

No finding reaches Blocking: no binding decision is broken, no privacy or safety boundary is crossed, no user is dead-ended, and every stated criterion is met with evidence. The one real gap — a locked module nobody imports and two variables nobody can fill — is incomplete scope, declared honestly, and needs a ticket rather than a rejection.

VERDICT: PASS
