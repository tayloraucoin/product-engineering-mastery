# Review — warden on STK-15

> Written by `yarn review:run warden STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 22c9d7b56d4da7794068dffd311d292b393dd0399cfca54b9d8557edbae1f0e5
- head: b76c592f56a77103ccec84b1db9bcb1f770c69bc
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/warden-security-privacy-engineer.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:23:15Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run warden STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are warden, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Criteria

**C1 — a send on the local tier logs and does not call the vendor: met.**
`packages/email/src/mailer.ts:96-120` returns before `resendSender` is ever reached; `new Resend()` exists only inside `resendSender` (`mailer.ts:72-75`), so no client is constructed and no socket opened on local. `mailer.test.ts:38-58` asserts zero vendor calls, one `email.logged` line, recipients masked to `p***@example.test`, and that the raw address appears nowhere in the serialized fields. The dashboard-template case logs the id and the variable *names* only (`mailer.test.ts:60-77`). C1.log, exit 0, carries all nine mailer tests including the withheld case (line 536) and the package's `1..14` summary matches the two test files as they stand, so the proof covers the current source.

**C2 — brand name, from and reply-to from `@pem/brand`, no literal: met.**
`default-template.ts:33-34, 86, 93-94, 113-115` read name, home URL, support address and both colours from `@pem/brand`; `mailer.ts:82-86` builds `from` as `brand.name <EMAIL_FROM ?? brand.contact.email>` and `replyTo` from `brand.contact.support`. The control I care about is `default-template.test.ts:65-100`: it scans every non-test source in the package for any brand value, hex, `oklch(` or address shape. That is structural, not a spot check — a future hard-coded address fails CI.

**C3 — boundaries pass with `resend` owned by `email`: met as stated, with the guard unpinned and the proof stale.**
`boundaries.js:93` sets `resend: "email"`, `email` is in `ELEMENTS` (line 63) and `PACKAGE_IMPORTS` (line 82), and `ownerOverrides()` (lines 127-139) gives only `packages/email` the exemption. C3.log is exit 0. Two caveats below as findings: nothing in `tooling/boundaries.test.ts` pins the resend rule, and the file has since been edited by CAT-3.

**C4 — types and build pass: met.**
C4.log, exit 0: format, lint, check-types, build and `check-client-bundle — 18 server-only value(s)`. The 18 reconciles exactly against `.env.example` plus `turbo.json`, and includes all six email names, so `RESEND_API_KEY` and `EMAIL_FROM` are planted as sentinels and proven absent from every client chunk and prerendered payload. No drift: `turbo.json:30-35` and `.env.example:79-86` declare the same six.

**Non-negotiables.** All five hold. Locked module confirmed at `toolkit.json:264-271` (`locked: true`, `runbook: null`). `resend` pinned exact at `tech-stack.md:44` and `packages/email/package.json:25`. I checked the dashboard-template shape against the installed SDK: `node_modules/resend/dist/index.d.mts:528-533` is `template: { id, variables? }`, exactly what `mailer.ts:38-41` sends — the as-built's claim holds, not just at the type level.

## Findings

**Should-fix — the app's key-holder has no `server-only` marker.** `apps/web/lib/email.ts:1-16` builds the mailer from `env.RESEND_API_KEY` at module scope and its own comment calls it "Server-only", but nothing enforces that. All four sibling secret-holders do: `lib/supabase/server.ts:8`, `admin.ts:8`, `context.ts:9`, `local-mirror.ts:12`. Adversary is a later developer or agent importing `mailer` into a client leaf. The key does not leak — `next.config.ts:42` inlines only `NEXT_PUBLIC_*`, and check-client-bundle proves it — so the impact is a confusing runtime throw instead of a compile-time refusal. One line at `lib/email.ts:7` closes it, at the strongest layer available.

**Should-fix — the non-negotiable's own rule is the one SDK rule nothing pins.** `tooling/boundaries.test.ts:22-70` probes every peer: `@supabase/*` from both `packages/db` and `apps/web` (added by STK-12, citing D-STK-16), catalog from two places, and this ticket's own layer rule `email must not import auth` (lines 54-58). There is no probe importing `resend` from a non-owner, and none confirming `packages/email` may import it. A later edit dropping `resend` from `SDK_OWNERS` passes CI. Relatedly, `as-built.md:7` says "A probe file in `apps/web` importing `resend` was rejected" — that describes a transient manual act; nothing in the tree records it. Two rows in that table turn the claim into evidence.

**Should-fix — C3 and C4 were proven before a later edit to a planned path.** `packages/config/eslint/boundaries.js:11-14, 70, 85, 101` carries the `catalog` element and `NOT_FOR_APPS`, and `tooling/boundaries.test.ts:59-69` carries CAT-3's probes — CAT-3 is still open, so those edits post-date C3 (`d0a1b7b2`) and C4 (`d5d468cd`). I cannot run git here, so this is read off the files' content rather than the log. The substance of C3 still holds by inspection, but the proof needs re-recording before merge; `check-specs --strict` will say the same.

**Should-fix — the withheld guard rests on a Vercel-only signal.** `site-url.ts:11-13` derives `deployed` from `VERCEL_ENV` alone, consumed at `apps/web/env.ts:63` and gating `mailer.ts:96-104`. This repo exists to be ported (`docs/runbooks/new-project.md`), and on a non-Vercel host `VERCEL_ENV` is unset, so `deployed` is false and a deployment left on the local tier takes the `mailer.ts:106-118` branch, writing the full subject and rendered text into retained platform logs. `redact.ts` will not catch it: `subject` and `text` match no key rule. Residual is modest — such a deployment's site URL also collapses to localhost, so a logged action link is largely inert, and Supabase's own auth mail does not pass through here (`README.md:32`) — but a reset or sign-in link in a hosted log is a disclosure class I would rather name than leave implied. Withholding whenever the tier is local and `NODE_ENV` is production closes it in one predicate. The seam is STK-4's; the asset at risk is this ticket's.

**Consider — header values are sanitized inconsistently.** `mailer.ts:62-64` strips `"<>` from the display name but no CR/LF, and neither `config.fromAddress` (deliberately unvalidated at `apps/web/env.ts:94-98`, for a stated reason I agree with) nor `content.subject` is stripped before reaching Resend's JSON body. Resend encodes header fields, so this is defence in depth rather than a live injection path. One `replace(/[\r\n]/g, "")` across the three makes the sanitizing uniform.

**Consider — the vendor's error text is passed through verbatim.** `mailer.ts:128-132` interpolates Resend's message, which can name the recipient ("domain not verified for …"). `redact.ts:64-73` renders an Error by its message, and a message is never key-matched, so an address inside one reaches the reporter intact. Masking the address or wrapping with a fixed string keeps the vendor's detail out of the error.

**Consider — no recipient cap.** `mailer.ts:43-46, 91` accepts an unbounded `to` array with no cap and no rate limit. `.env.example:54-55` already tells the operator to keep Supabase's own email rate limit set; `@pem/email`'s README has no equivalent line. Real limiting belongs to `@pem/services` (STK-13); a cap plus a README sentence is the cheap interim.

**Consider — "dashboard templates by id in env" is carried by prose.** `README.md:12` instructs adding `RESEND_TEMPLATE_<NAME>` to env, but `DashboardTemplate.id` (`mailer.ts:38-41`) accepts any string. There is nothing to enforce until the first such variable exists; worth a line in the ticket that adds one.

No Blocking findings. The disclosure path I most expected — the Resend key reaching a bundle — is closed structurally and proven: server-only schema slot, `nextPublicEnv` filtering, and a planted sentinel that does not appear in 27 browser-facing files.

VERDICT: PASS
