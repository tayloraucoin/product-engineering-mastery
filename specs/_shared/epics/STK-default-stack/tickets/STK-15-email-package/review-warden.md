# Review — warden on STK-15

> Written by `yarn review:run warden STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: b3afca1d007a01cc26be74a2c89661dfe0653d89eca8bbba832524b4f0965151
- as_built_sha256: b54b3f09baac51ef4710b448dc9a10cf29216eaab3ce82408b9039ae0ac531f0
- head: 9ca66f63d3a72b9b67bdacbd44807ddda7ac7a10
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:53:45Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

# Warden — review of STK-15 (email-package)

## Criteria

**C1 — "A send on the local tier logs and does not call the vendor." MET.**

The code is stronger than the criterion. `mailer.ts:104-131` splits the local tier two ways: a non-deployed process logs `email.logged` with the subject, the rendered text and *masked* recipients (`maskAddress`, `mailer.ts:75-78`), and returns `logged` without constructing a Resend client — `resendSender` is reached only at `mailer.ts:137`, after both local branches return. A deployed process on the local tier returns `withheld` and logs neither subject nor body (`mailer.ts:107-114`), on `log.error` so the registered reporter pages someone rather than dropping mail silently.

Evidence holds. C1.log (exit 0, head `8f2e32a6`) shows all 17 email tests passing, including `C1: a send on the local tier logs the rendered message and does not call the vendor` with `vendor.calls.length === 0` asserted (`mailer.test.ts:54`), `C1: the local tier needs no key`, and `C1: a deployment left on the local tier neither sends nor logs the body`, which asserts the absence of four distinct leak strings (`mailer.test.ts:192-198`). The same 17 tests re-run inside C4's `yarn verify` at the later head, so the proof is not stale.

**C2 — "The default template renders the brand name, from and reply-to from @pem/brand with no literal." MET.**

`default-template.ts` reads `brand.name`, `brand.contact.support`, `brand.urls.home` and both theme colours through `oklchToHex` (`:33-34`); `mailer.ts:90-94` builds `from` from `brand.name` and reply-to from `brand.contact.support`. The no-literal claim is not asserted by inspection — `default-template.test.ts:65-101` walks `src/` recursively and fails any non-test source containing a brand value, a hex colour, an `oklch(` call or an address-shaped string. That is the right shape of test: it will catch a literal added later, not just today's.

Enforcement sits at a second layer too: `packages/email/eslint.config.mjs:9-17` bans `process.env` inside the package, so the key and the sending address can only arrive as arguments.

**C3 — "Boundaries pass with resend owned by email." MET.**

`boundaries.js:102` adds `resend: "email"` to `SDK_OWNERS`, and `:89` gives `email` exactly `config, env, brand, observability` — no `db`, so the mailer cannot reach data. C3.log is a bare exit-0 with no output, which alone proves only that nothing currently violates the rule; the ownership itself is pinned by `tooling/boundaries.test.ts:90-99` and `:153-156`, whose probes appear in C4.log as tests 14, 15 and 26 (resend from `apps/web` fails, from `@pem/observability` fails, from `packages/email` passes). Taken together the criterion is proven, not asserted.

**C4 — "Types and build pass." MET.** `yarn verify` exit 0, recorded at head `e486e8c8`. Worth naming: that is a different head from C1–C3's `8f2e32a6`, but C4's own run embeds the full test suite and `check-specs`, both clean, so nothing rests on the gap.

## Non-negotiables

All five hold. Locked module: `toolkit.json:289-296` marks `email` `"locked": true, "runbook": null`, and C4.log test 48 proves a locked module marked removed fails the check. Dashboard templates by id: `mailer.ts:41-44`, documented at README:12 with the env-variable rule. No literal from/reply-to/brand strings: covered by C2's scan.

One thing I checked specifically because it is the usual failure: the Resend key reaching a browser. `apps/web/lib/email.ts:8` imports `server-only`; `.env.example:76-86` and `turbo.json:30-35` register all six tiered names, so `check-client-bundle` plants sentinels for them (`check-client-bundle.ts:78-93`); C4.log:2013 reports 18 server-only values and none in 27 browser-facing files. The key is proven absent from the bundle, not assumed absent.

The as-built's claims check out against the code, including the post-review additions it lists (`deployed`, `server-only`, `email.sent`, the recursive scan). Its "Not verified" section is honest: no message has gone through Resend, and the HTML has not been opened in a mail client.

## Findings

**Should-fix — the array recipient form discloses addresses between recipients, unwarned.** `packages/email/src/mailer.ts:46` accepts `to: string | readonly string[]` and `:99` flattens it into one Resend `to`, which lands in a visible To: header. Actor: a developer in a product copied from this starter, careless rather than malicious. Path: `mailer.send({ to: members.map((m) => m.email), content })` → one message, every recipient reads every other address. Impact: a membership list and personal addresses disclosed to third parties — the ordinary shape of a real privacy complaint. Nothing in the code or `packages/email/README.md:14` warns, and the README's "one function per message" wording reads as a style note rather than a constraint. The cheap control is a sentence on the type and in the README saying the array form puts recipients on one visible header and that fan-out is the default; the strong control is dropping the array and fanning out inside `send`. Either is a small change now and a retrofit across consumers later.

**Consider — the `deployed` guard has a residual case it cannot see.** `apps/web/env.ts:71` derives `productionRuntime` from `VERCEL_ENV` or `NODE_ENV === "production"`, and `mailer.ts:104` keys the withhold on it. A publicly reachable server running in dev mode with `DATABASE_ENVIRONMENT` unset therefore takes the logging branch and writes full subjects and bodies — including sign-in and reset links — to its platform logs. The env.ts comment already scopes the flag accurately, so this is documented rather than hidden, and closing it would need a signal the app does not have. Noting it so the residual is on the record rather than discovered later.

**Consider — `to` is the one header value not normalized.** `mailer.ts:124` strips CR/LF from the subject and `:66-72` strips CR/LF and `"<>` from the sender, both with tests; the recipient at `:139` passes through untouched. Over Resend's JSON API this is not header injection and Resend validates addresses, so there is no path to harm today — but the asymmetry invites the assumption that recipients are checked somewhere. Running `singleLine` over each recipient would cost nothing and make the invariant uniform. Related: `formatSender` strips `<` and `>` from the display name but not from the address (`:66`), so a malformed operator-set `EMAIL_FROM` reaches Resend intact.

No Blocking findings. The controls that mattered here — no send on local, no body in a deployed log, no key in the bundle, no brand literal, one owner for the SDK — are each enforced at a layer that a later refactor cannot quietly remove, and each is proven by a test that would fail if the control were deleted.

VERDICT: PASS
