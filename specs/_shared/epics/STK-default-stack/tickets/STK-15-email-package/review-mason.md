# Review — mason on STK-15

> Written by `yarn review:run mason STK-15`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: d44b04528f1ef26fb18566b40794cf59646c5b6a1a844d6d4fba9c5e32942a5b
- as_built_sha256: 22c9d7b56d4da7794068dffd311d292b393dd0399cfca54b9d8557edbae1f0e5
- head: 5663de08d2e20eb397664e850e8c8823e21d65ef
- runner: claude 2.1.232 (Claude Code) (role docs/roles/engineering/mason-cto-principal-dev.md; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:13:02Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run mason STK-15`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are mason, reviewing ticket STK-15 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C1.log (sha256 82c78f935e53)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C2.log (sha256 8e166ecdeb50)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C3.log (sha256 78376f5fa75f)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-15-email-package/evidence/C4.log (sha256 7681b4940fec)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/env.ts, apps/web/lib/email.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/tsconfig.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, packages/config/eslint/boundaries.js, packages/email/README.md, packages/email/eslint.config.mjs, packages/email/package.json, packages/email/src/default-template.test.ts, packages/email/src/default-template.ts, packages/email/src/mailer.test.ts, packages/email/src/mailer.ts, packages/email/tsconfig.json, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-15 email-package (mason, fresh context)

**Verdict up top: PASS.** Four criteria met, five non-negotiables met, both one-way doors ratified. Two Should-fix items, three Consider; none of them blocking.

---

### Criterion by criterion

**C1 — "A send on the local tier logs and does not call the vendor." Met.**

Code: `packages/email/src/mailer.ts:96-120`. The `withheld` branch (deployment on local) precedes the `logged` branch, and neither reaches `resendSender` at `:126` — on local no `Resend` client is ever constructed, not merely unused. Key absence throws before construction (`:122-125`).

Evidence: `mailer.test.ts:38-58` asserts `status: "logged"`, zero vendor calls, masked recipients, and that the raw address appears nowhere in the fields; `:60-77` a dashboard template logs id and variable *names*, not values; `:79-87` local needs no key; `:89-108` staging and production each call once with `brand.name <brand.contact.email>` and `brand.contact.support`; `:135-147` staging without a key throws naming `RESEND_API_KEY`; `:149-165` a vendor error is rethrown; `:172-193` a deployment left on local withholds and leaks neither subject, heading, action host nor recipient. `C1.log:400-453` shows ok 6–14, exit 0, 79 tests.

**C2 — "The default template renders the brand name, from and reply-to from @pem/brand with no literal." Met.**

Code: `default-template.ts:33-34` derives both colours through `oklchToHex`; `:86`, `:93-94` take the name, support address and home URL from `brand`. The sender and reply-to live in `mailer.ts:82-86`, both from `brand`.

Evidence: `default-template.test.ts:19-29` (HTML carries name, `mailto:` support, home href, both converted colours), `:31-40` (text part), `:42-52` (caller values escaped, `<script>` neutralised), `:54-63` (`javascript:` action refused), and `:65-100` — a source scan asserting no file writes a brand value, a hex colour, an `oklch()` or an address. "from and reply-to" are proven at `mailer.test.ts:102-103`. `C2.log` exit 0.

**C3 — "Boundaries pass with resend owned by email." Met.**

`boundaries.js:81-85` maps `resend → email` in `SDK_OWNERS`; `:105-114` bans it for every non-owner including files in no zone (`restrictedImports(null)` at `:222`); `:116-129` emits one override so `packages/email/**` source may import it. `:75` grants `email → config, env, brand, observability`; `:92` puts `email` in `APP_IMPORTS`, which is the edge `apps/web/lib/email.ts:7` needs. This matches `codebase-conventions.md:91` and `:98` word for word. `C3.log` exit 0.

**C4 — "Types and build pass." Met, with a freshness note.**

`C4.log` exit 0 end to end at head `73c0659`: format, `lint:docs`, hooks, `check-refs`, `check-stack` (8 modules — `toolkit.json`'s eight entries, so the `email` entry is registered, not merely written), `check-migrations`, `check-specs`, test-weakening, contrast, 65 tooling tests, 79 package tests, budget, lint, `check-types`, `check-client-bundle` (18 server-only values, none in 25 browser-facing files), both Next builds.

The warnings at `C4.log:24-29` are that run's own pre-record state, not a live failure: C1–C3 were re-run afterwards at `7294682`, and the `C4 (last run exited 1)` line is exactly what this log cleared. One limit I can state but not close: C4's head (`73c0659`) is now the *oldest* proof on the ticket, older than C1–C3's `7294682`. The two commits since it are results/evidence writes by their messages, but I have no shell and cannot confirm no planned path moved. Batch close's single `yarn verify` settles it.

### Non-negotiables

All five met. `resend` owned by `email` (C3 above). Local never sends (C1). From, reply-to and brand strings from `@pem/brand` and env, no literal (C2's scan). One default HTML template in code, dashboard templates by id (`mailer.ts:37-46`, README `:12`). Locked module: `toolkit.json:252-253` is `"locked": true, "runbook": null`, and no `docs/runbooks/remove-email*.md` exists — the six runbooks present are api, ai, error-monitoring, billing, supabase-auth, supabase-database.

### One-way doors

Two: `packages/config/eslint/boundaries.js` and `packages/email/package.json` (exports are public API shape). Both ratified in advance — REC 0010 for the package graph, D-STK-16 for SDK owners (`technical.md:29`, ratification recorded at `technical.md:46`). The added rows are exactly what D-STK-16 prescribes, nothing wider. `package.json:6-15` is two subpath exports with no barrel, per `.claude/rules/ts.md`. Doors passed.

On placement: a package with one consumer would normally co-locate under my own rule. D-STK-1 and D-STK-12 ratified `@pem/email` as a package, and D-STK-13's removal manifest is the point of a starter. Project law outranks my default; correct as built.

---

### Findings

**Should-fix 1 — `apps/web/lib/email.ts:1-5`: the docblock asserts "Server-only" but nothing enforces it.** The sibling precedent one directory over is `apps/docs/lib/docs.ts:1`, `import "server-only"`. Without it, a client import of this module is a runtime throw from t3-env (because `createMailer` reads `env.RESEND_API_KEY` eagerly at module scope, `:11-16`) rather than a build error, and it puts `resend` in a client graph on the way there. Fix: add `import "server-only"` on line 1, plus the dependency in `apps/web/package.json` and its row in `docs/engineering/tech-stack.md` (`.claude/rules/deps.md`). Not blocking: nothing imports the module today, and `check-client-bundle` proves the bundle clean.

**Should-fix 2 — `as-built.md:7` asserts a probe result no artifact records.** "A probe file in `apps/web` importing `resend` was rejected" is plausible and the mechanism is readable in `boundaries.js:105-114`, but no committed evidence holds it, and the standing probe tests (`C4.log:54-101`) cover layer-graph edges only, never an SDK owner. Either drop the claim to what the evidence shows (C3 exit 0 plus the rule), or make it permanent with a probe case beside the existing ones. Flagged because `resend` is the newest entry in a one-way-door file.

**Consider 1 — `docs/.../contract.md:56-59` sets C4's command to `yarn verify`, which `.claude/rules/specs.md` forbids** ("`yarn verify` is never a criterion: it runs once at batch close"). `contract:run` accepted it, so the tool permits what the prose bans — one of the two is defective. Not STK-15's invention; STK-9 did the same. The fix belongs in the rule or the contract template, not in this ticket.

**Consider 2 — `packages/email/src/default-template.test.ts:66-67`: the no-literal scan is a non-recursive `readdirSync` over `src/`.** A file added in a subfolder escapes it silently, and `sources.length >= 2` is a weak floor against that. Walk the tree, or raise the floor as files land.

**Consider 3 — `packages/email/README.md:12` makes "a template id is an env variable, never a literal" a documented convention with no mechanism.** Fine while no dashboard template exists. When the first one lands, that's the moment for a check.

**Consider 4 — `apps/web/lib/email.ts` is imported by nothing, so the env → `createMailer` wiring is proven by types alone.** The declared deviation (`as-built.md:18`, `@pem/services` is STK-13) is fair and the README example is a reasonable stand-in. STK-13's first real send should be the executed proof.

VERDICT: PASS
