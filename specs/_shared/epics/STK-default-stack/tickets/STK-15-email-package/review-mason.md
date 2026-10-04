# Review — mason on STK-15

> Written by `yarn review:run mason STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 033fafa5858adffa8480f5b6e2fcd905a9b3b3e374e0b1683123e3e17ca3faca
- head: 0a8d9a6ea176145e33265f437b41c072af38d906
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T20:50:47Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — mason · STK-15 email-package

**Verdict: PASS.** No Blocking findings. The two one-way doors this ticket opens are both right, which is the part that cannot be changed cheaply later: the boundary edge plus SDK ownership (`packages/config/eslint/boundaries.js:58, 75, 84`) and the package's public `exports` (`packages/email/package.json:6-15`, two subpaths, no barrel, per codebase-conventions §4). The deferred `apps/web` wiring is additive, reversible, and declared in the as-built rather than hidden.

### Criteria

**C1 — a send on the local tier logs and does not call the vendor: met, structurally and not only by assertion.** `mailer.ts:88-102` returns `{ status: "logged" }` *before* the key check (`:104-107`) and before the only `new Resend(...)` call site is reached (`:64-67`, lazily at `:108`), so the local tier cannot send even with a key set. `mailer.test.ts:38-58` proves zero vendor calls *with* `apiKey` present — the right shape, since it rules out "it only logged because it couldn't" — and `:60-77` covers the dashboard-template path. Recipients are masked by the mailer itself (`:59-62`, `:94`), not left to the logger's key list; I checked that choice against the real logger and it is the correct layer — `redact.ts:40-51` would not match a key named `recipients`. Evidence: `C1.log` exit 0, 76 tests, subtests named at `:267-320`.

**C2 — the default template renders the brand name, from and reply-to from `@pem/brand` with no literal: met.** `default-template.ts:33-34, 86, 93-94` read the name, home URL, support address and both colours through `oklchToHex`; from and reply-to are composed in `mailer.ts:74-78`. The "no literal" half is mechanically enforced rather than asserted: `default-template.test.ts:65-100` scans each source file for all six brand values, hex, `oklch()` and any address, and `packages/email/eslint.config.mjs:9-17` bans `process.env` in the package. The from/reply-to clause is proven at `mailer.test.ts:99-100`, a test labelled C1 — both logs carry it, so nothing is unevidenced, but the criterion's proof is split across two files.

**C3 — boundaries pass with `resend` owned by `email`: met by reading the rule, not by the log.** `boundaries.js:217` applies the repo-wide SDK ban to `packages/**` and `apps/**`; `:116-129` grants the owner its single exception without dropping `WORKSPACE_PATH_PATTERN`; `:75` declares `email → config, env, brand, observability` with every undeclared edge denied by default. I confirmed nothing re-sets the rule afterwards: `eslint.config.mjs:27` spreads `boundariesConfig` last, and `no-restricted-imports` appears nowhere else in `packages/config`. So the ban is live and email holds the only `resend` exception. See Should-fix 2 on what the evidence itself cannot show.

**C4 — types and build pass: met.** `C4.log` exit 0 end to end: format, lint, `check-types`, both builds, `check-stack` (`:16`), `check-client-bundle` (`:1023`), budget. The ~60 stale-proof warnings in that log belong to other tickets on the shared branch; none is STK-15's.

**Non-negotiables: all five hold.** `toolkit.json:252-253` marks email `locked: true, runbook: null`. Dashboard templates carry no literal id — `mailer.ts:33-36` takes it as a caller value and the env convention is stated at `README.md:12`. `resend` is pinned exact at `packages/email/package.json:25` with its row at `docs/engineering/tech-stack.md:42`, and the package's status is `built` at `codebase-conventions.md:91`, `:98`.

**As-built accuracy: the one substantive deviation is true as written.** I checked it rather than took it: `apps/web/package.json:13-22` has no `@pem/email`, `next.config.ts:27` omits it from `transpilePackages`, `env.ts:25-34` reads no email variable, `turbo.json:5-27` names neither variable, and `apps/web/lib/email.ts` does not exist (`Glob` on `packages/email/**` shows four source files and nothing in the app).

### Findings

#### Should-fix

**1. The planned `apps/web` wiring is absent, so the module has no consumer.** `contract.md:28, 31-34` named `apps/web/env.ts`, `lib/email.ts`, `package.json` and `tsconfig.json`; `contract.md:79` asked for "one example call from a service," which landed as a code block in `packages/email/README.md:14-30` instead. The stated blocker is real — a name in `env.ts` absent from `turbo.json` and `.env.example` trips the sentinel plan (`C4.log:124`), and backing the wiring out beats suppressing an enforced check. Note `@pem/db` shipped the same way (no app dependency either), so this is the repo's established order, not new drift. Still: the objective "sends through Resend" is unproven end to end, and `as-built.md:28` carries the remainder as a line in a closing document. That needs to be a tracked ticket.

**2. C3's evidence cannot show the rule bites.** `C3.log` is a bare exit 0 with no output, and a passing run proves only that no violation exists today. `as-built.md:7` claims a probe file in `apps/web` importing `resend` was rejected; the probe left no artifact, so that claim is unverifiable from the files — I substituted my own reading of the config above. The fix is a committed negative fixture over `SDK_OWNERS`, one case per owner, in `tooling/`; it belongs to the harness, not this diff, and it will otherwise recur at STK-14 (`@trpc/server`) and STK-17 (`@ai-sdk/*`).

**3. `toolkit.json:249` declares env names nothing defines or checks.** The email entry lists `env: ["RESEND_API_KEY", "EMAIL_FROM"]`, but `check-stack.ts:163-168` validates only `files` for a present module; env names are read solely on the removed path (`:178-191`), which `locked: true` makes unreachable. Both names are absent from `turbo.json:5-27`. Defensible as a forward declaration of what a removal would purge, but the manifest is the removal protocol's source of truth (D-STK-13) and a reader takes it as fact. Closing Should-fix 1 closes this.

#### Consider

**4.** `mailer.ts:54-56` strips `"`, `<` and `>` from the display name but interpolates `fromAddress` untouched, and that value is operator input. Resend's JSON API has no header to inject into and `env.ts` will validate it when the wiring lands, so this is shape, not a hole — symmetry costs one line.

**5.** `default-template.test.ts:66-69` uses a non-recursive `readdirSync`, so the first `src/` subfolder would escape the brand-literal scan silently. The `sources.length >= 2` guard at `:70` catches an empty scan, not a partial one. Harmless today (four files, flat).

**6.** Nothing mechanical binds a dashboard template id to env: `mailer.ts:33-36` types `id` as a bare `string` and the convention lives only in `README.md:12`. Fine while no app sends one; worth a rule before the first one ships.

**7.** The local-tier line logs the full rendered `text` (`mailer.ts:99`), which is the criterion's intent, and the logger redacts by key, so a token inside an `action.url` would print. Tier is the only guard. Supabase's own auth mail is explicitly not sent from here (`README.md:32`), so note this for the first ticket that mails a credential-bearing link rather than changing anything now.

**8.** `contract.md:59` sets C4's command to `yarn verify`, which `.claude/rules/specs.md` bars as a criterion (it runs once at batch close). Harmless here, since verify is a superset of types and build, but it is a recurring contract-drafting defect that belongs in `check-specs` rather than in reviewers' heads.

**9.** C1–C4 were recorded at head `aa7df745` (`results.json:12, 25, 38, 50`), which is now several commits back, and two of the ticket's planned paths (`docs/engineering/tech-stack.md`, `codebase-conventions.md`) are files other tickets have been editing. I cannot run `check-specs`, so staleness is its call before merge; the behaviour itself still holds — the email subtests pass at a later head in `STK-5/evidence/C5.log:659-660`.

VERDICT: PASS
