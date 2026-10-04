# Review — mason on STK-15

> Written by `yarn review:run mason STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 033fafa5858adffa8480f5b6e2fcd905a9b3b3e374e0b1683123e3e17ca3faca
- head: 137bcff45dd0c8a422aebc5ffa605d27fd053656
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T20:36:37Z
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

# Review — mason · STK-15 email-package

**Verdict: PASS.** No Blocking findings. The two one-way doors this ticket opens — the boundary edge plus SDK ownership (`packages/config/eslint/boundaries.js`) and the package's public `exports` (`packages/email/package.json`) — are both correct now, which is the part that cannot be changed cheaply later. The deferred `apps/web` wiring is additive and reversible, the blocker behind it is real, and it is declared in the as-built rather than hidden.

## Criteria

**C1 — a send on the local tier logs and does not call the vendor: met.** Structurally, not just by assertion: `mailer.ts:88-102` returns `{ status: "logged" }` before the key check (`:104`) and before `resendSender` is ever reached (`:108`), and `new Resend(...)` exists at exactly one call site (`:64-67`). `mailer.test.ts:38-58` proves zero vendor calls *with a key present* — the right shape, since it rules out "it only logged because it couldn't send" — and `:60-77` covers the dashboard-template path. Recipients are masked by the mailer itself (`:61`, `:94`) rather than relying on the logger's key list, which is the correct place for that guarantee. Evidence: `C1.log` exit 0, 76 tests, subtests 6-8 and 11-12 named.

**C2 — the default template renders brand name, from and reply-to from `@pem/brand` with no literal: met.** `default-template.ts:33-34, 86, 93-94` read every brand value and compute both colours through `oklchToHex`; from and reply-to are built in `mailer.ts:74-78`. The "no literal" half is mechanically enforced, not asserted: `default-template.test.ts:65-100` scans each source file for all six brand values, hex, `oklch()` and any address, and `packages/email/eslint.config.mjs:9-17` bans `process.env` inside the package. Note the criterion's from/reply-to clause is proven by `mailer.test.ts:99-100`, a test labelled C1; both logs carry it, so nothing is unevidenced, but the criterion's proof is split across two files.

**C3 — boundaries pass with `resend` owned by `email`: met by reading.** `boundaries.js:58` adds the element, `:75` declares `email → config, env, brand, observability` (every undeclared edge stays denied by default), `:84` sets `resend: "email"`, `:217` applies the repo-wide SDK ban, and `:116-129` grants the owner its single exception without dropping `WORKSPACE_PATH_PATTERN`. Exit 0. See Should-fix 2 on what the evidence cannot show.

**C4 — types and build pass: met.** `C4.log` exit 0 end to end: lint, `check-types`, both builds, `check-stack`, `check-client-bundle`, `budget`. The 60-odd stale-proof warnings are other tickets on the shared branch; none is STK-15's.

**Non-negotiables:** all five hold. `toolkit.json:252-253` marks email `locked: true`, `runbook: null`. I also checked the dashboard-template path against the vendor rather than the stand-in: `node_modules/resend/dist/index.d.mts:607-613` makes `template: { id, variables }` a real discriminated arm with `react`/`html`/`text` set to `never`, so `mailer.ts:84-85, 110` matches the vendor's own contract and `mailer.test.ts:128`'s `html: undefined` assertion is meaningful.

## Findings

### Should-fix

**1. The planned `apps/web` wiring is absent, so nothing in the repo can send.** `apps/web/env.ts:25-34` reads neither `RESEND_API_KEY` nor `EMAIL_FROM`; `apps/web/lib/email.ts` does not exist; `apps/web/next.config.ts:27` omits `@pem/email` from `transpilePackages`; `apps/web/package.json:14-16` has no dependency on it. `contract.md:28, 31-34` named all of those paths and `contract.md:79` asked for "one example call from a service," which landed in `packages/email/README.md:14-30` instead. I verified the stated blocker rather than taking it: `.env.example` is denied to this review session too, and a committed `env.ts` reading a name absent from `.env.example` and `turbo.json:5-27` would trip the sentinel plan at `C4.log:124`. Backing the wiring out (`as-built.md:13`) beats suppressing an enforced check, and it is declared with a follow-up at `:28`. But `@pem/email` currently has no consumer and the objective "sends through Resend" is unproven end to end — that remainder needs to be a tracked ticket, not a line in a closed as-built.

**2. C3's evidence cannot show the rule bites.** `C3.log` is a bare exit-0 with no output, and a passing boundaries run proves only that no violation exists today. `as-built.md:7` claims "A probe file in `apps/web` importing `resend` was rejected"; the probe left no artifact, so I cannot verify it. `boundaries.js:82-83` has the same gap for `postgres` and `drizzle-kit`. The fix is a committed negative fixture over `SDK_OWNERS`, one case per owner, in `tooling/` — it belongs to the harness, not this diff, and it will otherwise recur at STK-14 (`@trpc/server`) and STK-17 (`@ai-sdk/*`).

**3. `toolkit.json:249` declares env names nothing defines or checks.** The email entry lists `env: ["RESEND_API_KEY", "EMAIL_FROM"]`, but `check-stack.ts:161-170` validates only `files` for a present module; env names are read only on the removed path (`:178-191`), which `locked: true` makes unreachable. Both names are absent from `turbo.json:5-27`. Defensible as a forward declaration of what a removal would purge, but a reader takes a manifest as fact. Closing Should-fix 1 closes this.

### Consider

**4.** `mailer.ts:54-56` strips `"`, `<` and `>` from the display name but not from the address, and `fromAddress` is operator input. Resend's JSON API has no header to inject into and `env.ts` will validate the value when the wiring lands, so this is shape rather than a hole — symmetry costs one line.

**5.** `default-template.test.ts:66-69` uses a non-recursive `readdirSync`, so the first `src/` subfolder escapes the brand-literal scan silently. The `sources.length >= 2` guard at `:70` catches an empty scan, not a partial one.

**6.** Nothing mechanical holds a dashboard-template id to env: `mailer.ts:33-36` types `id` as a bare `string` and the convention lives only in `README.md:12`. Fine while no app sends one; worth a rule before the first one ships.

**7.** C4's command is `yarn verify`, which `.claude/rules/specs.md` says is never a criterion — it runs once at batch close. Harmless here (verify is a superset of types and build) and the pre-flight passed it, but vigil logged the same drift on STK-6 C2, so it is a recurring contract-drafting defect that belongs in `check-specs` rather than in reviewers' heads.

VERDICT: PASS
