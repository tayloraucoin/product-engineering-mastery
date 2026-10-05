# Review — vigil on STK-15

> Written by `yarn review:run vigil STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: b3afca1d007a01cc26be74a2c89661dfe0653d89eca8bbba832524b4f0965151
- as_built_sha256: b54b3f09baac51ef4710b448dc9a10cf29216eaab3ce82408b9039ae0ac531f0
- head: 2d0bdc5c98a9a2ed8b2fa33411bdc2eda537c8db
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:48:16Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Verdict

**Pass with conditions** — no Blocking finding. One Should-fix (local-tier log legibility through the real logger) and four Considers; all evidence traces to code I re-read by hand.

Note on provenance: `results.json` already carries a `review:vigil` PASS recorded at `00:26:56` against as-built `27c12c58`; the current as-built is `b54b3f09` and the proofs were re-run at `00:41–00:42`. This run supersedes that record. C1–C3 were recorded at head `8f2e32a`, C4 at `e486e8c`; I re-traced every assertion in those logs to the files in the tree, and each still holds, so I treat the proofs as current rather than stale.

---

## Criterion by criterion

**C1 — "A send on the local tier logs and does not call the vendor." MET.**
Verified in code: `packages/email/src/mailer.ts:117-131` returns `{ status: "logged" }` after one `log.info("email.logged", …)` and never constructs a Resend client; the client is built lazily and only past the local guard (`mailer.ts:80-83`, `137`). The stricter deployed-on-local case returns `withheld` and logs no subject or body (`mailer.ts:104-115`). Evidence: `C1.log:1020-1037` (`ok 7`, `ok 8`, `ok 9` — local logs and no vendor call; dashboard template logs id and variable names only; local needs no key) and `C1.log:1068-1073` (`ok 15` — a deployment on local neither sends nor logs the body). The positive seats are covered too: `ok 10` staging and production call the vendor once, `ok 12` staging without a key refuses naming the variable, `ok 13` a vendor error is thrown. `deployed` is a required field on `MailerConfig` (`mailer.ts:37`), so no caller can omit the guard by accident.

**C2 — "The default template renders the brand name, from and reply-to from @pem/brand with no literal." MET.**
Verified in code: name, home URL, support address at `default-template.ts:86`, `93`, `94`; both colours derived via `oklchToHex(brand.theme.*)` at `default-template.ts:33-34`; sender and reply-to built from `brand.name` / `brand.contact.email` / `brand.contact.support` at `mailer.ts:90-94`. `brand.ts:14-54` is the single source. Evidence: `C1.log:984-1013` (`ok 1`–`ok 5`), including the recursive no-literal scan over `src/*.ts` (`default-template.test.ts:65-101`) that fails on any brand value, hex, `oklch(` or address literal. The package is also fenced off from `process.env` by its own lint rule (`packages/email/eslint.config.mjs:9-17`), so the env-sourced half of the promise cannot regress quietly.

**C3 — "Boundaries pass with resend owned by email." MET.**
Verified in code: `resend: "email"` in `SDK_OWNERS` (`packages/config/eslint/boundaries.js:101`), the owner override that lets only `packages/email/**` import it (`boundaries.js:127-139`, `168-179`), and the declared edge `email: ["config", "env", "brand", "observability"]` (`boundaries.js:89`), which matches the actual imports (`mailer.ts:18-24`, `default-template.ts:14-15`). A repo-wide grep finds `from "resend"` in exactly one file, `mailer.ts:18`. Evidence: `C3.log` exits 0 (header-only; see Consider 3), and the ownership is positively pinned by probes recorded in `C4.log:152-159` (resend from `apps/web/lib` and from `@pem/observability` both fail) and `C4.log:224-225` (resend from `packages/email/src` still passes), from `tooling/boundaries.test.ts:90-100`, `152-156`.

**C4 — "Types and build pass." MET.**
`C4.log` header exits 0 and the tail shows the whole chain completing: `@pem/email:lint` cache miss executed (`C4.log:1972`), `@pem/email:check-types` cache miss executed (`:1996`), `check-client-bundle — 18 server-only value(s), none in 27 browser-facing file(s)` (`:2013`), and both app builds succeeding (`:2050-2078`). `RESEND_API_KEY` / `EMAIL_FROM` are picked up by that bundle check automatically, since it plants a sentinel for every non-`NEXT_PUBLIC_` name in `.env.example` and `turbo.json` (`tooling/check-client-bundle.ts:74-92`), and both names are present in `.env.example:76-86` and `turbo.json:30-35`.

**Non-negotiables.** All five hold: resend owned by email (above); local never sends (above); from/reply-to/brand from `@pem/brand` and env with no literal (above); one default HTML template in code with dashboard templates referenced by id supplied from the app's env (`mailer.ts:40-49`, `README.md:12`, and no id literal anywhere); `email` marked `"locked": true, "runbook": null` in `toolkit.json:289-296` with no `docs/runbooks/remove-email.md` in the tree.

**As-built claims.** Checked all of them; every one is true as written, including the restored `apps/web` wiring (`apps/web/lib/email.ts:1-19`, `env.ts:36-41`, `99-106`, `135-136`), `server-only` on line 8 of `lib/email.ts`, `productionRuntime` as the source of `deployed` (`env.ts:71`), `resend` pinned exact with a verified date (`docs/engineering/tech-stack.md:49`, `packages/email/package.json:25`), and the README's explanation that no `services → email` edge exists yet (`boundaries.js:90`, `README.md:33`). Nothing shipped outside `planned_paths`; the "Not verified" section is honest.

---

## Findings

**Should-fix — the local-tier log is redacted by the real logger, and no test exercises that path.**
`packages/email/src/mailer.ts:118-129` logs the rendered `text` and `subject` through `@pem/observability`, whose `createLogger` runs every field through `redactFields` → `scrubText` (`packages/observability/src/logger.ts:57-59`, `packages/observability/src/redact.ts:109-117`). That scrubber replaces `?code=…` (`redact.ts:93`), any `token=`/`secret=`-style pair (`redact.ts:105-116`) and every email address (`redact.ts:96`). The stated purpose of the local branch is that "a developer reads the mail in the terminal" (`mailer.ts:7-8`, `README.md:8`), but the action URL in exactly the mail that matters most locally — verify, reset, invite — carries one of those shapes, so the printed link will come out unusable. Both tests inject a memory logger (`mailer.test.ts:34-41`), so nobody has yet seen what the real line prints. Expected per the module's own stated contract: a developer can read and follow the local message. Owner: the builder, with the observability owner consulted, since the fix is a choice between logging the body through a non-scrubbed path and accepting the redaction and saying so in the README. This is runtime-verifiable in one minute (see the checklist).

**Consider — a relative action URL throws the wrong error.**
`packages/email/src/default-template.ts:53-58`: `new URL(url)` throws a bare `TypeError: Invalid URL` before the friendly check runs, so a caller who passes `/open` or `app.example.test/open` gets no hint about what the template wanted. The test only covers `javascript:` (`default-template.test.ts:54-63`). Cheap to make both cases say the same sentence.

**Consider — a vendor refusal produces no `email.*` event.**
`packages/email/src/mailer.ts:140-143` throws and logs nothing, while success logs `email.sent` (`:144-149`) and misconfiguration logs `email.withheld` (`:107-113`). The throw is loud and will reach the app's reporter once error monitoring lands, but the `email` namespace will show sends and withholds and never failures, so a rising refusal rate (unverified domain, rate limit) is invisible where someone would look for it.

**Consider — C3's evidence file carries no content.**
`evidence/C3.log:1-5` is header-only (eslint prints nothing on success). The criterion's substance — *resend owned by email* — is actually demonstrated in `C4.log:152-159` and `:224-225`. A reader of C3 alone cannot see the promise was tested. Pointing C3 at `yarn test:boundaries`, or naming the C4 lines in the as-built, would close the gap.

**Consider — `yarn verify` as a criterion command.**
`contract.md:57-60` makes C4 `yarn verify`, which `.claude/rules/specs.md` says is never a criterion because it runs once at batch close. It ran and passed here, so nothing is wrong with the ticket; it is a note for the next contract author.

---

## Conversations

**Staging sends reach real inboxes.** `env.ts:135-136` and `.env.example:76-86` give staging its own Resend key and sending address, and `mailer.ts:117` guards only `tier === "local"`. A developer running locally in Mode A — the documented default, where `DATABASE_ENVIRONMENT` points at hosted staging (`.env.example:49-57`) — who calls a send with a real customer address typed in for a test will deliver real mail from their laptop. The contract's non-negotiables protect only the local tier, so this is not a defect; it is the thing I would expect to write the first support ticket about. The question for the owner: is an allowlist or a single "staging may only send to these domains" guard worth half an hour now, or is the Resend test-domain convention in the as-built assumption enough standing policy?

**The email surface has no copy or render review.** The template is the product's voice in a place the design system cannot reach: the footer sentence at `default-template.ts:93` and `113` ("Questions? Reply to this email or write to …") and the README's example words are reasonable and in the functional-warm register transactional mail wants, but nobody has seen the HTML in a client, and the ticket carries no `capture` criterion (correctly — no harness exists). Worth one real render before the first product mail ships, rather than before merge.

---

## Runtime checklist, by risk

1. On the local tier, send one message whose action URL carries `?code=` or `?token=` and read the printed `[email] email.logged` line. Confirm the link is still followable. This is the Should-fix above.
2. On staging, with `EMAIL_FROM_STAGING` on a verified or test domain, send one real message. Confirm `email.sent` prints Resend's id with no address or body, and that delivery actually happens.
3. Open that message in Gmail (light and dark) and Outlook. Check the button, the preview line, and that the forced light scheme survives Gmail's dark mode.
4. Set `DATABASE_ENVIRONMENT=local` with `NODE_ENV=production`, send once, and confirm `email.withheld` reaches the reporter and that no subject, body or address appears in the line.
5. Unset `RESEND_API_KEY` on staging and confirm the thrown message names the variable and that the caller's surface does not dead-end the user on it.

**Assumptions I made:** `[ASSUMPTION]` the precedence ladder is the repo default from `docs/index.md`, since none was supplied with this run; `[ASSUMPTION]` the proofs recorded at `8f2e32a` still describe the tree, based on re-reading every asserted behaviour in the code rather than on the recorded heads, which I cannot diff with the tools I have.

VERDICT: PASS
