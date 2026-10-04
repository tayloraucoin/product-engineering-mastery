# Review — mason on STK-15

> Written by `yarn review:run mason STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 22c9d7b56d4da7794068dffd311d292b393dd0399cfca54b9d8557edbae1f0e5
- head: 53a8da1006a48be579817a14e743bc249f3900ce
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:11:57Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

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

## Review — mason on STK-15

**Verdict up top: PASS.** No Blocking findings. Two Should-fix, four Consider. The three prior review files on this ticket (`review-mason.md:39`, `review-vigil.md:39`, `review-warden.md:39`) all record "no review: You've hit your weekly limit" — no reviewer judgment exists for STK-15 yet, so I treated this as a first read, not a re-run.

### Criteria

**C1 — a send on the local tier logs and does not call the vendor. MET.**
`C1.log` exits 0 at `d0a1b7b2`, 113 tests. The code holds up: `packages/email/src/mailer.ts:106-120` logs and returns `logged`, and the Resend client is constructed lazily at `:126`, on the send path only — so the local path cannot reach the vendor even by accident. Positive controls are present, not just the happy case: staging and production do call it (`mailer.test.ts:89-108`), a missing key throws naming the variable (`:135-147`), a vendor error is rethrown (`:149-165`). The deployment-on-local path is the sharpest test in the file (`:172-193`): it asserts the absence of the subject, the heading, the action host and the recipient stem from the log, rather than asserting the happy shape.

**C2 — brand name, from and reply-to from `@pem/brand`, no literal. MET.**
`default-template.ts:86,93,94,113-114` read `brand.name`, `brand.contact.support`, `brand.urls.home`; colours come from `oklchToHex(brand.theme…)` at `:33-34`. From and reply-to are built in `mailer.ts:82-86` and asserted against the brand at `mailer.test.ts:102-103`. The non-negotiable is enforced mechanically, not by inspection: `default-template.test.ts:65-100` scans every non-test source for brand values, hex, `oklch(` and anything address-shaped.

**C3 — boundaries pass with `resend` owned by `email`. MET.**
`C3.log` exits 0. `boundaries.js:59` adds the element, `:77` declares `email → config, env, brand, observability`, `:87` puts `resend` in `SDK_OWNERS`, and `:225` bans it everywhere else via `restrictedImports(null)`. Grep confirms exactly one importer repo-wide: `packages/email/src/mailer.ts:18`. The committed probe suite proves the element is wired into the matrix rather than merely declared (`C4.log:88-89`: `@pem/auth/server` from `packages/email/src/zz-probe.ts` is rejected). Placement matches D-STK-1 and the conventions table at `codebase-conventions.md:91`.

**C4 — types and build pass. MET.**
`C4.log` exits 0 at `d5d468cd`: lint and check-types across 10 packages including `@pem/email`, both app builds, `check-stack` clean at 9 modules, `check-client-bundle` with 18 planted server-only values and no leak. The `check-specs` lines in that log are warnings on STK-11/STK-12 still closing, which is the designed behaviour, not a failure of this ticket. C1–C3 were recorded one commit earlier and the later commits touch only `specs/`, so no planned path moved under them; the proofs are fresh.

**Non-negotiables.** All five hold. Worth stating one explicitly, since nobody has sent a real message: the dashboard-template shape is not invented. Resend 6.32.0's `CreateEmailOptions` has a genuine template arm — `node_modules/resend/dist/index.d.mts:528-533` is `template: { id: string; variables?: Record<string, string | number> }`, and `:607-613` makes `subject` optional in that variant. `DashboardTemplate` (`mailer.ts:37-41`) matches it field for field, and the id reaches it from env, never a literal (`README.md:12`). Locked module confirmed at `toolkit.json:264-271` (`locked: true`, `runbook: null`).

### Findings

**Should-fix 1 — `apps/web/lib/email.ts:1-7`: the header asserts "Server-only, since it holds the Resend key" and nothing enforces it.** Every sibling server module in the same app imports the barrier — `lib/supabase/server.ts:8`, `admin.ts:8`, `context.ts:9`, `local-mirror.ts:12` — and `server-only` is already a dependency (`apps/web/package.json:25`). Without it, a client import fails at runtime in the browser (t3-env throws on `env.RESEND_API_KEY`) after pulling the Resend SDK into the chunk, instead of failing the build. Not Blocking: the key's value does not reach a bundle, `check-client-bundle` passes and would catch an actual leak, and nothing imports this module yet. Add `import "server-only";` after the header.

**Should-fix 2 — `packages/email/src/default-template.test.ts:66-69`: the no-literal scan does not recurse.** `readdirSync(dir)` reads one directory level, so a brand value or colour literal in a future `src/templates/` subfolder would pass unseen. This scan is the only mechanical enforcement of a stated non-negotiable, in a package explicitly expected to grow templates. One-line fix (`recursive: true`), and it keeps the guard honest as the package grows.

**Consider 1 — no permanent probe for `resend` in the boundaries suite.** The as-built (`:7`) cites a throwaway probe in `apps/web`. The committed table covers `@supabase/supabase-js` from `apps/web` (`C4.log:76-81`) but not `resend`. Same mechanism, so I am satisfied C3 is met — but adding `import "resend"` to the `apps/web/lib/zz-probe.ts` row would make the claim re-provable in CI rather than in a review.

**Consider 2 — the local log is proven only against an injected logger.** `mailer.test.ts:29-36` substitutes a memory logger, so the real path through `createLogger` → `redactFields` is never exercised with this payload. I checked it: none of `subject`, `text`, `recipients`, `from`, `replyTo`, `templateId` matches a key or suffix in `packages/observability/src/redact.ts:10-51`, so the behaviour is correct today. But a later addition to `SECRET_SUFFIXES` would silently empty the local log without failing a test.

**Consider 3 — the `withheld` backstop is Vercel-shaped.** `config.deployed` comes from `isDeployed(VERCEL_ENV)` (`packages/env/src/site-url.ts:11-13`, D-STK-3's rule, not this ticket's). A product that ports this starter to a non-Vercel host and leaves `DATABASE_ENVIRONMENT` unset gets `deployed === false` on a real deployment, and the local path then logs subjects and bodies — which is exactly where reset and sign-in links live. Two independent faults are required and the tier is the primary guard, so this is not a defect here. But the whole value of `withheld` is being the backstop, so the port step in `docs/runbooks/new-project.md` deserves one line saying `isDeployed` must be re-derived off Vercel.

**Consider 4 — as-built `:19` overstates the bundle check.** `check-client-bundle` plants variable *names* from `.env.example` and `turbo.json` with its own sentinel values and never reads the file's values (`tooling/check-client-bundle.ts:14-20,43`). `RESEND_API_KEY=` is empty in `.env.example:79`; the name is what gets planted. The outcome is right, the sentence is not.

The as-built's "Not verified" section is accurate and correctly scoped: no message has gone through Resend and the HTML has not been opened in a client. That is the right thing to carry forward rather than paper over.

VERDICT: PASS
