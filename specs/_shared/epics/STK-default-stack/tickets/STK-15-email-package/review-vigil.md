# Review — vigil on STK-15

> Written by `yarn review:run vigil STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: b3afca1d007a01cc26be74a2c89661dfe0653d89eca8bbba832524b4f0965151
- as_built_sha256: 27c12c58bb19151a6826544c5a1324a944cfef6439bd507dff8bca062078f780
- head: bef870aadff5a31cde1410c2d73e2153ebd2fd73
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-05T00:26:56Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## STK-15 — email-package · review in fresh context

**Verdict: Pass with conditions.** No Blocking finding. Two Should-fix items, three Considers, and a runtime checklist the ticket's own as-built already anticipates.

---

### Criterion by criterion

**C1 — "A send on the local tier logs and does not call the vendor." Met (verified in code and in evidence).**
`yarn test` exit 0, head `68506caa`, 130 tests, no `not ok` anywhere in the log. The email suite's 17 tests are visible in `evidence/C1.log:979-1044`, including the exact assertion the criterion names (`ok 7 — a send on the local tier logs the rendered message and does not call the vendor`). Code traces: `mailer.ts:114-128` logs `email.logged` and returns `{ status: "logged" }` before any client is built; the Resend constructor is reached only at `mailer.ts:134`, after both local branches have returned. `mailer.test.ts:43-63` proves it against an injected vendor stand-in with a call counter at zero, masks the recipient, and asserts the raw address is absent from the log fields. The tightened guard the as-built claims is real: `mailer.ts:104-112` returns `withheld` with no subject or body when `tier === "local" && deployed`, pinned by `mailer.test.ts:177-198`, which asserts four separate leak strings are absent. `apps/web/lib/email.ts:18` fills `deployed` from `productionRuntime` (`apps/web/env.ts:71` — `deployed || NODE_ENV === "production"`), so the guard holds off Vercel as claimed. Honest limit, which the as-built states itself: the vendor call is proven against a stand-in, never against Resend.

**C2 — "The default template renders the brand name, from and reply-to from @pem/brand with no literal." Met (verified in code and in evidence).**
`evidence/C2.log:294-324`, six passing tests. Brand name, support address, home URL and both theme colours are asserted present in the HTML and the text (`default-template.test.ts:19-40`), and the colours are derived through `oklchToHex(brand.theme…)` at `default-template.ts:33-34` rather than written. From and reply-to are proven at the vendor boundary, not just in the renderer: `mailer.test.ts:107-108` asserts `options.from === "${brand.name} <${brand.contact.email}>"` and `options.replyTo === brand.contact.support`, with `EMAIL_FROM` overriding only the address (`mailer.test.ts:136`). The "no literal" claim is mechanical, not asserted: `default-template.test.ts:65-101` walks `src/` recursively and fails on any brand string, any hex, any `oklch(`, any address, with a `sources.length >= 2` floor so an empty scan cannot pass vacuously. I checked the SDK surface rather than trusting it — `replyTo` and `template: { id, variables }` are both real fields of `CreateEmailOptions` in the installed `resend` 6.32.0 (`node_modules/resend/dist/index.d.mts:528-536, 574`), and `subject` is optional on the template branch, so the dashboard path is vendor-shaped correctly and not an invented API.

**C3 — "Boundaries pass with resend owned by email." Met.**
`yarn lint:boundaries` exit 0 at head `873c4cc8`. The log body is empty, which on its own proves only "the command exited 0" — but the ownership half of the statement is proven positively elsewhere in frozen evidence: `evidence/C4.log:150-161` shows `import "resend"` failing from `apps/web/lib` and from `packages/observability` with the message `resend is owned by @pem/email`, and `C4.log:222-233` shows it passing from `packages/email` alongside `@pem/brand` and `@pem/observability`. Those cases are pinned in source at `tooling/boundaries.test.ts:90-100` and `:152-156`. `SDK_OWNERS` carries `resend: "email"` (`boundaries.js:101`) and the `email` row is `["config", "env", "brand", "observability"]` (`boundaries.js:89`), matching the conventions table (`codebase-conventions.md:91`).

**C4 — "Types and build pass." Met.**
`yarn verify` exit 0 at head `cf6d3a7a`, the latest proof head on the ticket, with 127 tooling tests passing and no STK-15 staleness warning in `check-specs` at that moment (`C4.log:18-21` warns only about STK-11). The command is broader than the criterion, so nothing is under-proven. See Consider 3 on the contract's shape.

**Non-negotiables.** Locked module: `toolkit.json:289-296` marks `email` `locked: true` with `runbook: null`, and no `docs/runbooks/remove-email.md` exists — I checked the folder, not the claim. Tiered env is wired end to end and mechanically guarded against drift: `.env.example:76-86`, `turbo.json:30-35`, `apps/web/env.ts:36-41, 99-106, 135-136`, with `C4.log:318-323` proving the plan plants server-only names from `.env.example` and `turbo.json` and fails on drift. `resend` is pinned exact with a dated row (`tech-stack.md:49`).

---

### Findings

**Should-fix — `specs/.../STK-15-email-package/results.json:95-96` (reviewer record).** `review:warden`'s PASS was recorded against `contract_sha256 d44b0452` and `as_built_sha256 22c9d7b5`; the most recent reviewer record, mason's, read `b3afca1d` and `27c12c58` (`results.json:65-66`). The contract and the as-built both changed after warden passed. What changed is not cosmetic: `as-built.md:14-18` lists the `deployed` parameter and `productionRuntime` as added *after the reviews*, and `apps/web/env.ts` is the environment-seam one-way door whose named reviewer is warden (`technical.md:39`). The security guard on this ticket has not been looked at by the reviewer who owns that door. Re-run `yarn review:run warden STK-15` before merge. Owner: operator.

**Should-fix — `packages/email/README.md:14-17`.** The section is headed "Calling it from a service" and its example is `import { mailer } from "../lib/email"`. No service can do that. `packages/services` may import only `config`, `validators`, `db` (`boundaries.js:90`), `packages/* → apps/*` is a hard ban (`boundaries.js:212-215`), and `ServiceContext` carries no mailer seam (`packages/services/src/context.ts:11-18`). The only legal caller today is a module inside `apps/web`. D-STK-1 places `email` below `services` in the graph (`technical.md:14`), so the intended edge is probably missing rather than the doc being wrong — but as it stands this is the trap pattern I check for by default: a confident snippet an agent will copy into `@pem/services` and then fight the boundaries lint over. Either add the `email` edge to `PACKAGE_IMPORTS.services` (architecture call, mason's lane) or reword the heading to name the app-level caller. Owner: mason.

**Consider — `packages/email/src/mailer.ts:41-44`.** `DashboardTemplate.id` is a free string, so the non-negotiable "dashboard templates are referenced by id in env" rests entirely on `README.md:12`. Nothing to enforce today, since no dashboard template exists; worth a check when the first one lands.

**Consider — `packages/email/src/mailer.ts:94`.** `from` is passed through `singleLine` and stripped of `"<>"` (`mailer.ts:65-67`), `replyTo` is not. Today `brand.contact.support` is a repo constant, so there is no live exposure — but the asymmetry is exactly what gets missed the day reply-to becomes configurable.

**Consider — `contract.md:57-60`.** C4's command is `yarn verify`, and `.claude/rules/specs.md` says `yarn verify` is never a criterion — it runs once at batch close. The evidence is a superset of what C4 claims, so nothing is weaker for it; the contract's shape is what drifts from the rule.

---

### Conversations

Three things I'd raise on the user's behalf, none of them defects against this contract.

**A retry double-sends.** `mailer.ts:137-140` throws on a vendor refusal and the caller decides what to do. Resend supports an idempotency key; without one, a service that retries a failed-looking send can put two "reset your password" mails in someone's inbox at the worst possible moment. Is per-message idempotency something you want in the seam now, while it is one function, or at the first real caller?

**Staging sends to whatever address it is handed.** The local tier is thoroughly fenced. `staging` is not: a developer running locally with `DATABASE_ENVIRONMENT=staging` sends real mail to any recipient passed in. The as-built's assumption is that `EMAIL_FROM_STAGING` sits on Resend's test domain, which limits the blast radius by convention. Would you want a recipient allowlist on non-production tiers, or is the test-domain convention enough?

**Local logging may eat the link it exists to show.** `email.logged` carries the full `text` part so a developer can read the mail in the terminal — but `@pem/observability` scrubs addresses, bearer credentials, JWTs and secret query values from free text (`logger.test.ts`). A magic-link URL is exactly that shape. If the scrubber redacts the token, the local path shows a link nobody can click, and the first person to hit it will think the mailer is broken rather than the logger careful. Worth five minutes at a terminal to find out which way it falls.

---

### Runtime checklist (ordered by risk; none of this is verifiable from code)

1. Re-run `yarn review:run warden STK-15`, then `yarn check-specs --strict` before merge.
2. Send one real message on staging with `EMAIL_FROM_STAGING` on a verified domain. Confirm from, reply-to, subject, HTML and text all arrive, and that the `email.sent` line carries only the Resend id and the recipient count.
3. Open that message in Gmail web, Gmail iOS, Outlook and Apple Mail **in dark mode**. The template declares `color-scheme: light` with inline hex for ink and paper (`default-template.ts:70, 81`); client-side inversion is the usual place a button label goes ink-on-ink. Check the CTA is readable in every one.
4. Confirm the hidden preview div (`default-template.ts:82`) renders as a preview line and is not visible in the body in any of those clients.
5. On local, trigger a send and read the terminal: masked recipient, subject, text — and whether the action URL survives redaction intact enough to click.
6. On a preview deployment with `DATABASE_ENVIRONMENT` unset, trigger a send: expect `email.withheld`, and confirm no subject, body or address reaches the platform log.

Assumptions I made, since the intake did not supply them: `[ASSUMPTION]` the precedence ladder is the one in `docs/index.md`; `[ASSUMPTION]` the files on disk at this head are the ones intended for merge, since I cannot diff against main with the tools I have — my freshness judgments rest on the heads and hashes recorded in `results.json`.

VERDICT: PASS
