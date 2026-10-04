# Review — vigil on STK-4

> Written by `yarn review:run vigil STK-4`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: db07be97c45119b2c225fa5d746d1be093caf2258b16bc12bda576e1db822d2b
- as_built_sha256: 943b1ff906287b29a2c11eef61e5ba5df286f98931f0671ac2162a931e276d6c
- head: 793574d73e56c07a0a18985e539101ad27180919
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T04:41:59Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-4`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-4 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C1.log (sha256 bedfa847d671)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C2.log (sha256 5aeef66bfc8e)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C3.log (sha256 a082dcbbbdaf)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C4.log (sha256 f41b14998f6b)
   - C5 test: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C5.log (sha256 a85cdce3587b)
   - C6 check: specs/_shared/epics/STK-default-stack/tickets/STK-4-env-module/evidence/C6.log (sha256 1a98ebccb5c5)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, AGENTS.md, apps/web/env.ts, apps/web/next.config.ts, apps/web/package.json, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, package.json, packages/config/eslint/boundaries.js, packages/env/eslint.config.mjs, packages/env/package.json, packages/env/src/key-mode.test.ts, packages/env/src/key-mode.ts, packages/env/src/next-public.test.ts, packages/env/src/next-public.ts, packages/env/src/pick.test.ts, packages/env/src/pick.ts, packages/env/src/site-url.test.ts, packages/env/src/site-url.ts, packages/env/src/tier.ts, packages/env/tsconfig.json, tooling/check-client-bundle.test.ts, tooling/check-client-bundle.ts, tooling/fixtures/client-bundle/clean/static/chunks/app-synthetic.js, tooling/fixtures/client-bundle/empty/static/README.md, tooling/fixtures/client-bundle/leak/static/chunks/app-synthetic.js, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## STK-4 env-module — Vigil review

Plan built from `contract.md`, `technical.md` (D-STK-3, D-STK-4, D-STK-16) and `.claude/rules/specs.md` before the implementation was read. I did not read `review-mason.md`: a second opinion is only worth something if it is independent.

**One limit to declare up front:** my tools are denied read access to `.env.example` (both Read and Grep refused). Non-negotiable 6 therefore cannot be verified directly from my seat; what I could establish about it indirectly is below, marked as inference.

---

## Criterion by criterion

| ID | Verdict | Basis |
|----|---------|-------|
| **C1** | **Met** | `packages/env/src/pick.ts:36-42` returns the tier's own variable then falls back to the unsuffixed one, empty strings counting as absent (`:29-30`); production's suffix is `""` (`:13-17`), so it can never read a suffixed value. `pick.test.ts` proves each tier (`:15`), the absent/empty fallback (`:30`), nothing-set → undefined (`:48`), production-never-suffixed (`:55`), the suffix grammar (`:66`) and the local default (`:80`). `C1.log` exit 0, TAP `ok 7`–`ok 12`; re-run green inside `C6.log:363-398`. |
| **C2** | **Met** | `key-mode.ts:27-42` names the variable in all three cases, including no-prefix-at-all — the right default for a mode it cannot vouch for. `key-mode.test.ts:12,31,38,47`; `C2.log`/`C1.log` TAP `ok 1`–`ok 4`. |
| **C3** | **Met** | `boundaries.js:55-60`: `env: ["config"]`, `db: ["config","env"]`, apps import all of `PACKAGE_IMPORTS` (`:72,128-134`), default `disallow` (`:196`). `C3.log` exit 0; re-run clean in `C6.log:463`. Matches `codebase-conventions.md:85,89`. |
| **C4** | **Met** | `C4.log` exit 0 across 5 packages (cached replay, keyed on file hashes); re-run in `C6.log:465-482`. |
| **C5** | **Met** | `check-client-bundle.test.ts:27,37,49,58` — leak named by variable *and* file, missing folder, folder with no JS, clean pass, and a scan with no sentinel refused. The `leak` fixture really carries the sentinel (`app-synthetic.js:2`). `C5.log` exit 0. |
| **C6** | **Met as recorded** | `C6.log` exit 0 at head `a208417`, full chain, `check-client-bundle — 3 server-only value(s), none in 25 browser-facing file(s)` (`:484`). Three caveats, none fatal: the as-built still says C6 is FAIL (Consider 1); `check-specs` is warn-only post-PR-15, so the branch-wide staleness lines at `:18-25` no longer fail `verify` — `--strict` before merge is the real gate; and the sentinel count is only as complete as `.env.example` (Should-fix 2). |

### Non-negotiables

1. **Local default** — met. `tier.ts:22-29`: unset or empty → `local`, anything else throws naming `DATABASE_ENVIRONMENT`. No production default exists anywhere in the package.
2. **`@pem/env` is pure** — met. `eslint.config.mjs:9-17` bans `process.env`; a repo-wide grep of `packages/env` finds it only in comments.
3. **One reader** — met. Grep of `apps/web`: `env.ts:26-33` only. `next.config.ts:5,26` imports the collapsed object rather than reading the environment, so validation happens once at build.
4. **Key-mode guard** — guard shipped and tested; **no caller exists yet** (Consider 4). The contract's `out_of_scope` puts Stripe variables in STK-16, so this is sanctioned, not a defect.
5. **Localhost outside a deployment** — met in code and unit tests (`site-url.ts:11-23`, `site-url.test.ts:10`; `env.ts:39-43`). The *browser* half — Next's `env` block overriding a shell `NEXT_PUBLIC_SITE_URL` — rests on an uncommitted manual build (`as-built.md:18-22`), so it is runtime-required, not verified (Consider 6).
6. **`.env.example` ↔ `turbo.json`** — **unverifiable from my seat.** `turbo.json:5-21` lists every name `env.ts` reads, and `turbo/no-undeclared-env-vars` passes in lint. For `.env.example` I can only infer: `C6-control-leak.txt:3` shows `EXAMPLE_API_KEY_LOCAL` was planted, so the tier forms are listed; the "what breaks without it" comments are checked by nothing mechanical and I cannot read them.
7. **`verify` runs both** — met, `package.json:13`.

---

## Findings

### Blocking
None.

### Should-fix

**1. The client-chunk leak path was never exercised by a real build.** `check-client-bundle.ts:140-146` scans `.next/static` and `.next/server/app`, and C6 reports zero sentinels in 25 files — but a grep of `apps/web` finds no `"use client"` anywhere and no module except `next.config.ts` importing `env`. So the one scenario the slice names as its risk ("a secret reaching a browser bundle") has a synthetic fixture (C5) and a server-render control (`C6-control-leak.txt`), and no end-to-end demonstration on the static-chunk path. Suggested owner: builder. Cheapest close: a temporary client leaf reading `env.EXAMPLE_API_KEY`, `yarn check-client-bundle`, confirm it names a file under `.next/static`, revert — the same shape as the control already filed.

**2. Nothing enforces that `.env.example` is complete, so the detector's name source can silently shrink.** `check-client-bundle.ts:109-117` derives the sentinel set from `.env.example` alone; a server-only variable that never gets a line there is never planted, and the check still exits 0 with a smaller number nobody reads. `check-stack` does not close this: it compares `toolkit.json` `env` lists against the files only for modules marked *removed*. Suggested owner: mason/builder. Concrete close: have `check-stack` assert each **present** module's `env` names (`toolkit.json:179-191,205-212`) appear in both `.env.example` and `turbo.json`.

**3. `turbo.json` appears to declare six `DATABASE_*` names that `.env.example` does not list** — against `codebase-conventions.md:122`, the rule this ticket authored. Chain: `turbo.json:15-20` declares `DATABASE_URL`/`DATABASE_MIGRATION_URL` and their `_LOCAL`/`_STAGING` forms; `remove-supabase-database.md:36-39` says both files carry them; but `check-client-bundle` reports **3** server-only names at head `a208417` in both `STK-4/evidence/C6.log:484` and `STK-9/evidence/C4.log:483`, and the control proves tier forms are counted when present — 3 is `EXAMPLE_API_KEY` ×3, not 9. **Routed to STK-9, not a STK-4 defect:** at STK-4's own close the parity held, and the db variables arrived with another ticket. Confirm by reading `.env.example` (I could not). If confirmed, it is also the live symptom of Should-fix 2: today's database credentials are never planted.

### Consider

1. `as-built.md:10` ("C6 is recorded FAIL") and `:71` ("review:mason… have not run") now contradict `results.json` (C6 PASS at `a208417`, mason PASS). The file is immutable by rule and its own `Next` section predicted exactly this, but say so in the batch report so the merged record is not read as a failure.
2. `results.json` records `tests: 26` for C1 and `27` for C2 from one interleaved turbo log whose TAP totals are 13 + 14 = 27 (`C1.log:95,189`). The named tests are all visible and green, so no proof is lost — but the count is a mis-parse of interleaved output and should not be treated as a signal.
3. C6's command is `yarn verify`, which `.claude/rules/specs.md` says is never a criterion. That choice is what produced the whole branch-wide coupling documented at `as-built.md:37-46`; worth retiring the pattern rather than re-living it.
4. `key-mode.ts:27` has no caller in the repo. The non-negotiable is enforced only when STK-16 wires it, and nothing fails in the meantime.
5. `check-client-bundle.ts:37-46` deliberately matches commented-out lines. Right for coverage, but a later vendor key meant to be *absent* locally will be present-with-garbage during the sentinel build — watch STK-18's tokenless-build criterion for the collision.
6. The browser-side site URL (`as-built.md:18-22`) rests on a build that was reverted and never committed. No artifact, so it stays runtime-required.

---

## Conversations

**On the pattern that keeps arriving in a new costume.** The pre-flight's conversation on this epic was about commands that cannot observe their subject. Should-fix 1 is the same shape one layer in: the detector is real, the fixtures are real, the control is real — and all three sit on the path that was easy to build (server render), while the path the risk is named after (a client chunk) is proven only synthetically. Not because anyone cut a corner: there is no client component in the app yet, so the honest control was awkward to write. It is worth asking, for each guard this epic ships, *which of its paths has been walked with real output, and which only with a fixture?*

**On `.env.example` as an unenforced registry.** Three mechanisms now key off that one file — the sentinel set, the removal runbooks, and the new-project guide's step 6 — and nothing fails when a name is missing from it. The failure is silent and in the safe-looking direction (fewer sentinels, exit 0). That is the property worth fixing, more than today's specific gap.

**On the dead guard.** The key-mode rule is the sharpest piece of logic in the ticket and currently protects nothing. Its wiring lives in a ticket eleven slots away. A one-line note in STK-16's Build notes naming `@pem/env/key-mode` would cost nothing now and is cheap insurance against a live key on a staging tier later.

---

## Runtime checklist (ordered by risk)

1. **Read `.env.example`** and confirm every `turbo.json` `globalEnv` name is listed with a comment saying what breaks without it (non-negotiable 6 — I was denied access; Should-fix 3 turns on this).
2. **Add a temporary client leaf** reading `env.EXAMPLE_API_KEY`, run `yarn check-client-bundle`, confirm it fails naming a file under `apps/web/.next/static`, then revert — and file the output beside `C6-control-leak.txt`.
3. **Before merge, run `yarn check-specs --strict`**, and re-record C1–C5 if any planned path moved after `a208417`. Their logs sit at `0a9e14a`; the only thing making them current is C6's own re-run of the same commands.
4. **Run `yarn review:run warden STK-4`** — the environment seam is a one-way door (`technical.md:39`) and warden is still FAIL in `results.json`.
5. **On a real Vercel preview**, confirm the browser's site URL is the `_STAGING` value, and localhost on a local production build. Only the `VERCEL_ENV` variable has been exercised, never the platform.

## Assumptions

- `[ASSUMPTION]` `.env.example` content is inferred from `check-client-bundle`'s reported sentinel count plus `C6-control-leak.txt`, never read. If it does list the `DATABASE_*` names in a form the regex at `check-client-bundle.ts:40` misses, Should-fix 3 dissolves and Should-fix 2 becomes more urgent, not less — the regex would then be the silent gap.
- `[ASSUMPTION]` Turbo cache replays (C4, and C6's lint/types/build) count as evidence, since the cache key is the input hashes.
- I executed nothing. Every claim above is traced to a file and line, or left on the runtime checklist.

No Blocking findings: the criteria are met on their own evidence, the seam holds under grep from every direction I could point it, and the two Should-fixes are coverage gaps in a guard, not a shipped leak.

VERDICT: PASS
