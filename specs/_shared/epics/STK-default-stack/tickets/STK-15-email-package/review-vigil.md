# Review — vigil on STK-15

> Written by `yarn review:run vigil STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 22c9d7b56d4da7794068dffd311d292b393dd0399cfca54b9d8557edbae1f0e5
- head: 6a9646ccb6f03a914583072f82fd11a6ff1bf0e7
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:17:31Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C1.log (sha256 8e997874c62f)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C2.log (sha256 5b1252e7ff8b)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C3.log (sha256 00f612b5032f)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C4.log (sha256 9b5a5a743f4a)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/env.ts, apps/web/lib/email.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/tsconfig.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, packages/config/eslint/boundaries.js, packages/email/README.md, packages/email/eslint.config.mjs, packages/email/package.json, packages/email/src/default-template.test.ts, packages/email/src/default-template.ts, packages/email/src/mailer.test.ts, packages/email/src/mailer.ts, packages/email/tsconfig.json, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Vigil — STK-15 email-package

**Verdict: Pass with conditions.** Three Should-fix findings, none Blocking. The slice's named risk (a hard-coded brand value or address, or a send on a local tier) has a real mechanism behind it, tested from both message shapes and both deployment states. The gap is in proof, not behaviour: the one non-negotiable this ticket could regress silently — `resend` owned by `email` — has no test, and the as-built claims a probe that does not exist in the tree.

I built the checklist from `contract.md` and `technical.md` (D-STK-12, D-STK-16, D-STK-9, D-STK-3) before reading `packages/email/`, then traced each item. No UX surface applies (`truth_files: none`, D-STK-15 waives the UX level); this is a non-UI build, so no capture dimension.

### Criteria

**C1 — a send on the local tier logs and does not call the vendor: met.**
`evidence/C1.log` header exit 0, head `d0a1b7b2`, 113 tests, `# fail 0`. Four lines carry the criterion: `:296` local content send logs and makes no vendor call, `:309` a dashboard template on local logs its id and variable names only, `:358` local needs no key, `:536` a deployment left on the local tier neither sends nor logs the body. Code agrees: `mailer.ts:96-104` warns `email.withheld` and returns before any rendering is logged; `:106-120` logs `email.logged` with masked recipients (`:111`, `maskAddress` at `:67-70`) and returns `logged`; the Resend client is only constructed at `:126`, below both early returns, so no vendor object exists on local. The guard tests are real adversarial tests, not assertions of shape: `mailer.test.ts:57` asserts the raw address appears nowhere in the log payload, and `:186-192` asserts the subject, heading, action host and recipient stem are all absent from the withheld line. Verified in code and test.

**C2 — the default template renders the brand name, from and reply-to from `@pem/brand` with no literal: met.**
`evidence/C2.log` exit 0; `:77` HTML carries name, support address, home URL and both converted colours, `:130` the text part, `:208` the literal scan. Code: `default-template.ts:33-34` derives both hexes through `oklchToHex(brand.theme.*)`, `:86/:93/:94` interpolate `brand.name`, `brand.contact.support`, `brand.urls.home`; sender and reply-to come from `brand` at `mailer.ts:82-86`, asserted against `brand.*` (not against strings) in `mailer.test.ts:102-103`. The no-literal half is enforced, not asserted: `default-template.test.ts:65-100` scans every non-test source in the package for each brand value, any hex, any `oklch(`, and anything matching an address. `brand.ts` values are placeholders, so the test would catch a real product's values being pasted in later. Verified in code and test.

**C3 — boundaries pass with `resend` owned by `email`: met as configured, not proven against regression.**
`boundaries.js:87` puts `resend` in `SDK_OWNERS` under `email`; `:69-80` adds the `email` row (`config`, `env`, `brand`, `observability`); `:108-131` bans every SDK owned elsewhere repo-wide and generates the owner's own override. `evidence/C3.log` is exit 0 with no output, which does prove the allow side for real code — `mailer.ts:18` imports `resend` inside `packages/email`, so a mis-scoped override would have failed the lint. The deny side is unproven: see Should-fix 1 and 2.

**C4 — types and build pass: met at the head recorded.**
`evidence/C4.log` exit 0 at head `d5d468cd`: format, `lint:docs`, hooks, `check-refs`, `check-stack` (`:16`, 9 modules, nothing missing or left behind — the locked `email` entry at `toolkit.json:264-271` with `runbook: null`), `check-migrations`, `check-specs`, test-weakening, contrast, 71 tooling tests, the package tests, budget, lint (`:1300` `@pem/email:lint`), check-types (`:1320`), `check-client-bundle` (`:1335`, 18 server-only values, none in 27 browser-facing files — `RESEND_API_KEY` is among the planted names via `.env.example:79-81` and `turbo.json:30-32`), both builds. Note that this same log warns at `:25-27` that two of this ticket's review records had already gone stale and that C4 itself was last recorded exit 1; the heads in `results.json` move on after it (`013fc52`, `f4429a5`, `53a8da1`). That is a close-time problem, not a build problem — see the operator checklist.

Non-negotiables, separately: locked manifest entry with no runbook, met (`toolkit.json:269-270`; `C4.log:197` shows the check that a locked module marked removed fails). One default template in code, met. Dashboard templates by id, met in shape (`mailer.ts:38-41`) with the env convention stated at `README.md:12`; nothing enforces it, and nothing was promised to. Out of scope respected: no Supabase auth email customisation, no bulk path.

### Findings

**Should-fix 1 — no probe proves `resend` is refused outside `@pem/email`.** `tooling/boundaries.test.ts:22-59`: the `DISALLOWED` table has no `resend` row. STK-12 set the precedent at `:38-48`, adding both an `apps/web` and a `packages/db` probe for `@supabase/*`, plus the matching `ALLOWED` row at `:90-92`. Contract non-negotiable 1 therefore rests on configuration plus a green lint: delete `resend: "email"` from `boundaries.js:87`, or change `ownerOverrides`' pattern handling at `:119-132`, and no test in the repo fails. Two rows, one disallowed and one allowed, close it. Owner: builder.

**Should-fix 2 — the as-built asserts a proof that does not exist.** `as-built.md:7`: "A probe file in `apps/web` importing `resend` was rejected." No such probe exists (`tooling/boundaries.test.ts`), and the cited evidence for C3 is a five-line header with no output (`evidence/C3.log:1-5`). A reader reconciling the as-built against the logs finds nothing behind the sentence. Either land Should-fix 1 and the claim becomes true and reproducible, or restate it as a one-off observation made in session. The as-built is the durable record; this is the same class of defect flagged on STK-4. Owner: builder.

**Should-fix 3 — `apps/web/lib/email.ts` is not marked server-only.** `apps/web/lib/email.ts:1-16` reads `env.RESEND_API_KEY` at module scope and carries no `import "server-only"`, while every sibling in the app that holds a secret does: `apps/web/lib/supabase/admin.ts:8`, `server.ts:8`, `context.ts:9`, `local-mirror.ts:12`, and `@pem/auth`'s server subpaths, where the marker is asserted by test (`packages/auth/src/client-safe.test.ts:84-86`). As written, a client component that imports the app mailer fails at runtime through t3-env rather than at build, and drags the `resend` SDK into the browser graph on the way. The dependency is already present (`apps/web/package.json:25`); this is one line. Not Blocking: no leak is demonstrable — `C4.log:1335` plants a sentinel for `RESEND_API_KEY` and finds none in any browser-facing file. Owner: builder.

**Consider 1 — a successful send logs nothing.** `mailer.ts:128-133` returns `{ status: "sent", id }` with no event, while both non-sending outcomes log (`:97`, `:107`). In production the only trace is Resend's dashboard and whatever the caller chooses to write, and the Resend id is not correlatable to a request. One `log.info("email.sent", { tier, recipientCount, id })` makes the three outcomes symmetrical. There are no callers in-tree yet, so the next ticket inherits whichever way this goes. Owner: builder or STK-13.

**Consider 2 — the README example propagates a throw into the caller's flow.** `mailer.ts:122-132` throws both for a missing key and for a vendor refusal, and `README.md:16-30` returns `mailer.send(...)` directly. A service copied from that example turns a Resend outage into a failed user action. One line in the README naming who catches — and that the user-visible action should usually succeed while the mail is retried or reported — costs nothing now and saves a dead end later. Owner: builder.

### Not verified, and what a human must do

Nothing here is a code finding; it is the honest remainder, and it matches `as-built.md:22-26`.

1. Send one real message on staging with `EMAIL_FROM` on a verified domain. The vendor call is proven only against the injected stand-in (`mailer.test.ts:19-26`); `resend` 6.32.0's actual request shape for `replyTo` and `template` has not been exercised once.
2. Open that message in Gmail and Outlook, light and dark. The HTML has never been rendered by a mail client. Specifically: the hidden preview div (`default-template.ts:82`), the button (`:70`), and that `ink`/`paper` are being used as body text and page background rather than as a button pair — legible at the preset's values (`oklch(0.205 0 0)` on `oklch(0.985 0 0)`), but it is brand primary doing a job it was not defined for, and a product that sets a saturated primary inherits that.
3. Start the app on the local tier and confirm the terminal line is actually readable as mail — subject and text present, address masked (`mailer.ts:107-118`).
4. Operator, before merge: `review:warden` stands at FAIL in `results.json` (21:49, head `f4429a5`) and `review:mason`'s PASS was recorded at a later head (23:11, `53a8da1`) than C1–C4 (21:43–21:44). Re-run `yarn check-specs --strict`; if any of C1–C4 went stale against a path that moved after 21:44, re-record before close. I judged the files as they stand now, and the current test files reconcile exactly to the C1/C2 logs (5 template plus 9 mailer, `tests 14`, `fail 0`), so the proofs do cover the code I read.

### Assumptions

- `[ASSUMPTION]` I treated the four as-built `[ASSUMPTION]` lines (plain template string, tiered `EMAIL_FROM`, system font stack, README as the example caller) as settled within `devs_call` and the epic's silence, and tested to them as written rather than filing them.
- `[ASSUMPTION]` `yarn verify` as C4's command departs from `.claude/rules/specs.md`, but it is the pattern across every STK ticket in this epic; I did not relitigate a contract-authoring choice through a review finding.
- I did not read the other reviewers' files, by design.

VERDICT: PASS
