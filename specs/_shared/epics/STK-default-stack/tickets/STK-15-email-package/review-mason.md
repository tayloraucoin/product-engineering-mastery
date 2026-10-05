# Review — mason on STK-15

> Written by `yarn review:run mason STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: b3afca1d007a01cc26be74a2c89661dfe0653d89eca8bbba832524b4f0965151
- as_built_sha256: 27c12c58bb19151a6826544c5a1324a944cfef6439bd507dff8bca062078f780
- head: dabf2b9e0ea844df38257f8ee5862cecaff0a1a1
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:20:44Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — STK-15 email-package (mason, tier 2)

**Verdict: PASS.** No blocking findings. Two Considers and one Should-fix, all documentation-level.

One-way-door paths this ticket touches — `packages/config/eslint/boundaries.js` (the boundary graph), `packages/email/package.json` (a package's exports are its public API), `apps/web/env.ts` (the environment seam) — got a full read, not a sample. The merge is still a person's.

### Criteria

**C1 — a send on the local tier logs and does not call the vendor: met.** `packages/email/src/mailer.ts:104-128` returns before any client is constructed: `resendSender` (line 80) is reached only on the paths past line 130, so on `local` no Resend object is ever built, not merely never called. `mailer.test.ts:43-63` asserts the stand-in got zero calls, that the line is `email.logged`, and that the raw recipient never appears in the fields. The `deployed && local` path (line 104) returns `withheld` and `mailer.test.ts:177-198` proves subject, heading, action URL and address are all absent from the log — the right instinct, since sign-in links live in that body and platform logs are retained. Evidence `C1.log` shows the 17 email tests passing, exit 0, no `not ok`.

**C2 — brand name, from and reply-to from `@pem/brand`, no literal: met.** `from` is `formatSender(brand.name, config.fromAddress ?? brand.contact.email)` and `replyTo` is `brand.contact.support` (`mailer.ts:90-94`); `mailer.test.ts:107-108` pins both against the brand module rather than against strings. The template reads `brand.name`, `brand.urls.home`, `brand.contact.support` and both theme colours through `oklchToHex` (`default-template.ts:33-34, 86-94`), which is the correct call — email clients do not read OKLCH. The no-literal scan (`default-template.test.ts:65-101`) is the part I'd have asked for: it walks `src/` recursively, asserts `sources.length >= 2` so it cannot pass by matching nothing, and rejects brand values, hex, `oklch(` and bare addresses. Verified independently: no `process.env` anywhere in `packages/email`, and the package's own ESLint config bans it (`eslint.config.mjs:9-17`).

**C3 — boundaries pass with `resend` owned by email: met.** `SDK_OWNERS.resend = "email"` (`boundaries.js:101`) with `email: ["config", "env", "brand", "observability"]` (line 89). `yarn lint:boundaries` exits 0 and clean. The pins in `tooling/boundaries.test.ts` are the right three: `resend` from `apps/web` fails (92-95), from `@pem/observability` fails (96-100), from `packages/email` passes (152-155), and `@pem/email/mailer` from `apps/web` passes (156). I checked that `resend` is imported in exactly one file repo-wide — `mailer.ts:18`.

**C4 — types and build pass: met.** `yarn verify` exit 0 at `cf6d3a7`, with lint and check-types green across 13 packages, both builds successful, and `check-stack` reporting nothing missing or left behind. The only warnings in the log belong to STK-11, not this ticket.

**Non-negotiables.** `toolkit.json:289-296` marks `email` locked with `runbook: null`, and the `check-stack` test "a locked module marked removed fails" holds that semantic. `resend` is pinned exact at 6.32.0 with its owner named (`tech-stack.md:49`), and the email row is gone from "Deliberately absent" as D-STK-2 requires. I checked the vendor shape rather than trusting it: Resend's `CreateEmailOptions` template variant is `template: { id, variables?: Record<string, string | number> }` with optional `from` and `subject` (`resend/dist/index.d.mts:528-537, 609`), so `DashboardTemplate` matches the API exactly and the brand sender does override the dashboard template's own. Header injection is closed at both ends — `singleLine` on sender (line 70) and the subject (line 124), each with a test.

On the as-built's "Added after the reviews" list: all three recorded reviews sit at earlier heads than C1–C4, but `check-specs` inside the C4 run flags only STK-11's reviews as stale and calls `specs/` otherwise clean. The enforced check outranks the prose, so I'm treating vigil's and warden's PASSes as fresh rather than inventing a staleness finding.

### Findings

**Should-fix — `packages/email/README.md:14-17`.** "Calling it from a service. One function per message, in the service that owns the event" points an agent at `packages/services`, where that code cannot compile: `services` has no `email` edge (`boundaries.js:90`) and no package may import an app (`boundaries.js:212-215`). The snippet's own `import { mailer } from "../lib/email"` only resolves inside `apps/web`, so the prose and the code disagree. One sentence fixes it — the mailer is built in the app because that is where env lives, so the send function lives in app code until a service takes a mailer on `ctx`. Related: the as-built's stated reason for keeping the example in the README rather than in code ("since `@pem/services` is STK-13", `as-built.md:23`) no longer holds; STK-13 is built. The example-in-README itself I'd accept — the mailer instance genuinely belongs where env is read — but the reason on record is wrong and the wording misroutes the reader.

**Consider — `packages/config/eslint/boundaries.js:90`.** No `services → email` edge, though D-STK-1's order (`technical.md:14`) places `email` below `services`. This is the documented design, not drift — conventions §4 says every unlisted edge is disallowed and edges are added by the ticket that needs them. Worth one line somewhere so the first service that must send mail arrives expecting to ratify an edge, instead of discovering it as a lint failure.

**Consider — `packages/email/src/mailer.ts:41-44`.** `DashboardTemplate.id` is a free string. "Dashboard templates are referenced by id in env" is kept by convention and by the README (`README.md:12`), with nothing mechanical behind it. There is nothing to enforce today — no dashboard template exists — but when the first one lands, a check that the id traces to a `RESEND_TEMPLATE_*` variable would make the rule real rather than remembered.

VERDICT: PASS
