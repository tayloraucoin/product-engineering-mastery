# Review — mason on STK-15

> Written by `yarn review:run mason STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 22c9d7b56d4da7794068dffd311d292b393dd0399cfca54b9d8557edbae1f0e5
- head: 14ac1b81eca89827f06e78073dc3c2822d7bb5d7
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:45:17Z
- verdict: none (the reviewer did not finish with a VERDICT line)

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

(no review: You've hit your weekly limit · resets 4pm (America/Vancouver))
