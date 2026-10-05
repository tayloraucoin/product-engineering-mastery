# Review — assay on STK-12

> Written by `yarn review:run assay STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: f2b2b2eef19c313a1cccdd8ba172108e296f041186791c0fd9eb9b958f574f6a
- head: 5508fbe40f011859ff647540c562fc1e5d0bd20c
- runner: claude 2.1.232 (Claude Code) (agent assay; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T23:53:44Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run assay STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are assay, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C1.log (sha256 bd185ff046fc)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C2.log (sha256 1dabe5d64363)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C3.log (sha256 53615ab69c28)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C4.log (sha256 2802c2f9c9fc)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C5-operator.md (sha256 f5ff425ccc9e)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/auth/callback/route.ts, apps/web/app/auth/sign-in/_components/email-field.tsx, apps/web/app/auth/sign-in/_components/send-link-button.tsx, apps/web/app/auth/sign-in/actions.ts, apps/web/app/auth/sign-in/page.tsx, apps/web/env.ts, apps/web/lib/supabase/admin.ts, apps/web/lib/supabase/client.ts, apps/web/lib/supabase/config.ts, apps/web/lib/supabase/context.ts, apps/web/lib/supabase/local-mirror.ts, apps/web/lib/supabase/server.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, packages/auth/eslint.config.mjs, packages/auth/package.json, packages/auth/src/admin.test.ts, packages/auth/src/admin.ts, packages/auth/src/browser.ts, packages/auth/src/client-safe.test.ts, packages/auth/src/config.test.ts, packages/auth/src/config.ts, packages/auth/src/context.test.ts, packages/auth/src/context.ts, packages/auth/src/cookies.ts, packages/auth/src/redirect.test.ts, packages/auth/src/redirect.ts, packages/auth/src/server.ts, packages/auth/src/session.test.ts, packages/auth/src/session.ts, packages/auth/src/test-helpers.ts, packages/auth/tsconfig.json, packages/config/eslint/boundaries.js, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Coverage

**Read:** `contract.md`, `results.json`, `as-built.md`, `C1.log`–`C4.log`, `C5-operator.md`, the unrecorded `evidence/live-checks.md`, the changed files in the planned paths (auth package, app wiring, sign-in surface, boundaries, env, manifest, docs), `technical.md` (D-STK-7, D-STK-16), `canon-rubric.md`, canon §2 (A-01–A-20), `review-assay.md` (round 2).

**Round 3 of 3.** `results.json:68-72` shows `review:assay` reset to `run: null`. The round-2 PASS was taken at head `b54069cd`; `C1`–`C4` were then re-recorded at head `89bff074` (`results.json:11-52`, new evidence hashes), which staled it. `contract_sha256` and `as_built_sha256` in the mason, vigil and warden records (`results.json:83-84, 103-104, 118-119`) are the same pair round 2 was bound to, so **the as-built has not changed since round 2** and the code I read matches what round 2 described: no regression, and no fix to round 2's open items.

**Not verified — named, not passed (C-R01):**

- The sign-in surface at 390 and 1440, in dark theme, and with reduced motion, in every `?state=`. `live-checks.md:29-38` records light theme at 800 px only and names the rest as not captured; `.claude/rules/testing.md` puts the capture harness at P-C. These rubric lines are UNVERIFIED, never PASS. System gap, not a builder failure.
- C5, recorded `--verdict deferred` — legitimate under `.claude/rules/specs.md`.
- `live-checks.md` carries no hash in `results.json`: cited by the as-built, recorded evidence for nothing.
- C1–C4 freshness at `89bff074`: I cannot run `check-specs` and take the harness's word.
- No product design layer (`apps/web/docs/design/` absent), so the canon alone governs and C-R10's "every state in `states.md`" is N/A.

## Criteria

| ID  | Verdict                   | Evidence and code                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | **Met**                   | `context.ts:98-106`: `getUser()` only, a throw → null, `result.error \|\| !user` → null; `getSession` is never called in the package's seam. `C1.log:468-469, 528-535` (forged cookie refused at a 401), `:561-570` (mirror once per user per process). `# fail 0`, `# skipped 0` across all six packages.                                           |
| C2  | **Met**                   | `session.ts:63-64` purges before refresh; `:70-72` hides purged cookies from the SDK; `cookies.ts:40` matches the chunk and all three verifier forms; `:52-67` covers the no-project case. `C2.log:648-679`: both switch directions, own cookies kept, every cookie form, no-project clear. Exit 0.                                                 |
| C3  | **Met**                   | `boundaries.js:62` adds the `auth` element, `:81` its row (`config`, `db`, `observability`), `:92` `"@supabase/*": "auth"`. `C3.log` is exit 0 with an empty body (a silent lint — thin, but consistent with the script); the six probes that give it teeth are in `C4.log:92-115, 152-159`.                                                        |
| C4  | **Met**                   | `C4.log:1571` — "18 server-only value(s), none in 27 browser-facing file(s)". The service-role names are seeded because `.env.example:70-72` declares them and `check-client-bundle.ts:77-98` plants every non-public name from `.env.example` and `turbo.json` (`C4.log:242-247`); `env.ts:54-57, 130-136` reads them server-side. Exit 0.         |
| C5  | **Deferred, correctly**   | `C5-operator.md` gives the operator steps and what was probed against a synthetic project; `results.json:65` records `deferred: true`.                                                                                                                                                                                                             |

**Non-negotiables: all six hold.** Four factories (`server.ts`, `browser.ts`, `admin.ts`, `session.ts`); `admin.ts:20-24` sets `persistSession`, `autoRefreshToken`, `detectSessionInUrl` false. Authorization reads `getUser` only (`context.ts:101`). `updateSession` is called at `proxy.ts:42` and nowhere else; `proxy.ts:41` sheds cookies on an unconfigured tier. The browser path reads literal `NEXT_PUBLIC_*` names (`env.ts:44-53, 137-142`). `client-safe.test.ts` walks `./config`, `./browser`, `./redirect` and asserts `import "server-only"` on all four server subpaths (`C4.log:1308-1361`).

**UI, from code (rubric lines I can score without captures):** one primary action per view (`send-link-button.tsx:17`) — C-R03 PASS. Visible label above a native input (`email-field.tsx:8-10`) — C-R05, A-16 PASS. Focus visible (`email-field.tsx:19`, `focus-visible:ring-2 ring-ring`) — C-R10 PASS for focus; contrast of the ring is audited at 3.30:1 and 3.99:1 (`C4.log:48, 67`). Tokens only, enforced (`C4.log:1529-1539`) — C-R08 PASS. Six states reachable by `?state=` plus the unconfigured branch (`page.tsx:18, 50-79`) — present in code, UNVERIFIED as rendered outside light/800 px.

## Findings

**1. Should-fix — the as-built overstates what the UI verification covered.** `as-built.md:22` reads "Every state was checked in the browser on 2026-10-04 (`evidence/live-checks.md`)"; the cited file says light theme, 800 px, and names dark, 390, 1440 and reduced motion as not captured (`live-checks.md:38`). The "Not verified" section (`as-built.md:49-53`) lists C5, live refresh and the mirror, and omits the capture gap. A merged as-built is immutable (`.claude/rules/specs.md`), so this becomes the permanent coverage record of a tier-2 auth ticket, against C-R01. Unresolved from round 2. *I ranked this above last round's first finding, and name the reorder: both are Should-fix, but this one cannot be corrected after merge and the other can.* Smallest fix: narrow line 22 to "light theme, 800 px", and add one line under Not verified naming the uncaptured viewports, theme and reduced motion.

**2. Should-fix — `next` is dropped on every recoverable path.** A user deep-linked to `/auth/sign-in?next=/settings` who mistypes the address goes to `?state=invalid` with no `next` (`actions.ts:30`); a send failure the same (`actions.ts:45`); an expired link the same (`route.ts:53-54`); "Send another link" goes to a bare `/auth/sign-in` (`page.tsx:60`). `next` survives the happy path only (`page.tsx:77`), against the redirect rules this ticket claims as its own `devs_call` (`contract.md:13`). Not a regression; unresolved from round 2. Smallest fix: carry the request's `next` onto those four targets.

**3. Consider — the test-count note describes a condition the files do not show.** `as-built.md:46` explains totals "one apart", but `results.json:15` and `:28` both read 114, and the per-package totals in `C1.log` and `C2.log` match line for line. Smallest fix: delete the paragraph.

**4. Consider — the cookie contract's `headers` is documented but unimplemented on the app's server store.** `cookies.ts:27-36` says a store answering an HTTP response sets Supabase's no-store headers; `apps/web/lib/supabase/server.ts:20` takes `(written)` and drops them. The callback sets them by hand (`route.ts:27-36`), so what remains is the Server Action path, where `signInWithOtp` writes the PKCE verifier cookie (`actions.ts:33`). Smallest fix: set them there, or state in `server.ts` why they are not needed.

**5. Consider — "Send another link" names an outcome it does not produce.** `page.tsx:60` links to the form; it sends nothing, and it is a second label for the intent the button already names "Email me a sign-in link" (`send-link-button.tsx:18`) — C-R05 (action labels that aren't the outcome verb), A-17. Smallest fix: "Use a different address", or keep the label and submit the form.

**Cut (polish):** the `sent` state's `role="status"` is mounted with its content on a fresh navigation, where announcement is unreliable (`page.tsx:56`) — threshold's depth. `route.ts:39` admits four link types, so `live-checks.md:25`'s `recovery` probe reads as expired; `as-built.md:21` does not say so.

## Rubric and contract gaps (routed, kept out of the score)

- **No `capture` criterion** on a ticket shipping a six-state UI surface, while the cited surface itself says "UI: stories with captures" (`technical.md:52`) and `.claude/rules/testing.md` makes every capture UNVERIFIED until P-C. The UI therefore has no line to be unverified against. Unchanged across all three rounds — route to the contract owner and to Plumb.
- **C4's command is `yarn verify`**, which `.claude/rules/specs.md` bars outright ("never a criterion: it runs once at batch close"), and `contract:run` accepted it (`contract.md:64`). Route to vigil.
- **The `?state=` vocabulary diverges** from `apps/web/AGENTS.md` (`empty|loading|error|partial|offline`): `page.tsx:18` declares `loading|sent|invalid|error|expired`. `as-built.md:37` argues empty and partial away for a form, which I accept; `offline` is neither argued nor built, and with no `states.md`/`coverage-gaps.md` there is nowhere to record the five real states and the three N/A. Route to the design layer at Phase 3.
- **The native `<input>`** (`email-field.tsx:11-20`) sits outside the `@pem/ui` vocabulary and can only be ruled in by a `components.md` that does not exist; `as-built.md:38` names the promotion trigger, which is the best home available today.

**Not scored, owned by the gate:** `review:threshold` stands FAIL with `run: null` (`results.json:88-92`), and `review:warden`'s PASS is stale against later changes to `docs/engineering/tech-stack.md`, `toolkit.json` and `yarn.lock` (`C4.log:27`). `check-specs --strict` holds the merge.

## Round-3 report — the loop closes here

No fourth round. Nothing open is a build defect: finding 2 is a four-line behavioural fix the builder can take at any time, findings 1 and 3 are text edits to an as-built that must happen **before** merge because the file then becomes immutable, and the only structural hole is the missing `capture` criterion with no harness behind it until P-C. The underlying gap is that one: **a tier-2 ticket may ship a multi-state UI surface with no criterion that even records the UI as unverified**, which is why three rounds of critique have each had to re-derive the coverage caveat by hand from an unhashed `live-checks.md`. That is Plumb's and the contract owner's to close, not this ticket's.

**Near-the-line call, named:** finding 2 again sat between Should-fix and Blocking — it silently discards a user's destination, a trust cost — and I held it at Should-fix, matching round 2 rather than hardening because a round passed without the fix. It breaks no law, no criterion and no required state, and the scope is "one minimal page" (`contract.md:46`). If the rubric wants redirect continuity treated as a law, that line needs sharpening.

No Blocking finding: authorization from an unverified session, a secret in a client bundle, an open redirect, a session-persisting admin client and invisible focus are each closed by a cited test or an enforced check.

VERDICT: PASS
