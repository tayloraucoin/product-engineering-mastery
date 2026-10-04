# Review — vigil on STK-12

> Written by `yarn review:run vigil STK-12`. Never edit it: check-specs binds it to the hashes below, and Taylor reads it before merge.

- contract_sha256: ba875bb0ce0deabe9ef8132358a95bb904251e291baf8587446b35a0d4f92eeb
- as_built_sha256: 855981be4d2ad425fff17544d9036a119228db59e102d6af23b444dbbf0e4ce3
- head: 9e1336164ea21edac17a2bdeda7384b08723cdc7
- runner: claude 2.1.232 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5[1m]
- at: 2026-10-04T21:26:43Z
- verdict: PASS

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil STK-12`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, reviewing ticket STK-12 in fresh context. You have not seen the builder's conversation and must not ask for it: judge only from the files.

Read, in this order:
1. The contract: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/contract.md. Its criteria, non-negotiables, planned paths and out of scope are what was promised.
2. The results: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/results.json. Each criterion's run record and evidence file.
3. The as-built: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/as-built.md. What the builder says shipped, and every deviation. Check its claims against the code; do not trust them.
4. The evidence:
   - C1 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C1.log (sha256 0fe563b5bae1)
   - C2 test: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C2.log (sha256 09b8a0b8bd2e)
   - C3 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C3.log (sha256 0d14b91358c9)
   - C4 check: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C4.log (sha256 58b2fe37b3e7)
   - C5 manual: specs/_shared/epics/STK-default-stack/tickets/STK-12-auth-package/evidence/C5-operator.md (sha256 f5398d318881)
5. The files this ticket changes against main (its planned paths; other tickets share the branch): .env.example, apps/web/app/auth/callback/route.ts, apps/web/app/auth/sign-in/_components/email-field.tsx, apps/web/app/auth/sign-in/_components/send-link-button.tsx, apps/web/app/auth/sign-in/actions.ts, apps/web/app/auth/sign-in/page.tsx, apps/web/env.ts, apps/web/lib/supabase/admin.ts, apps/web/lib/supabase/client.ts, apps/web/lib/supabase/config.ts, apps/web/lib/supabase/context.ts, apps/web/lib/supabase/local-mirror.ts, apps/web/lib/supabase/server.ts, apps/web/next.config.ts, apps/web/package.json, apps/web/proxy.ts, docs/engineering/codebase-conventions.md, docs/engineering/tech-stack.md, docs/runbooks/remove-supabase-auth.md, docs/runbooks/remove-supabase-database.md, packages/auth/eslint.config.mjs, packages/auth/package.json, packages/auth/src/admin.test.ts, packages/auth/src/admin.ts, packages/auth/src/browser.ts, packages/auth/src/client-safe.test.ts, packages/auth/src/config.ts, packages/auth/src/context.test.ts, packages/auth/src/context.ts, packages/auth/src/cookies.ts, packages/auth/src/redirect.test.ts, packages/auth/src/redirect.ts, packages/auth/src/server.ts, packages/auth/src/session.test.ts, packages/auth/src/session.ts, packages/auth/src/test-helpers.ts, packages/auth/tsconfig.json, packages/config/eslint/boundaries.js, tooling/boundaries.test.ts, toolkit.json, turbo.json, yarn.lock.
6. The surface the ticket cites: specs/_shared/epics/STK-default-stack/technical.md. Every state and criterion it names.

For each criterion, say whether the evidence and the code show it is met. Then list findings as Blocking, Should-fix or Consider, each with a file and line. A Blocking finding means FAIL.

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

## Review — STK-12 `@pem/auth`

**Verdict: Pass with conditions.** Every criterion is met by the recorded evidence and holds up against the code. Two Should-fix items, three Considers; none of them blocking.

Plan built from `contract.md` + `technical.md` (D-STK-7, D-STK-16) before the implementation was read. High-stakes surfaces identified up front: authorization from an unverified session, the service-role key, the open-redirect boundary, and cross-project cookie bleed on a tier switch.

### Criteria

**C1 — the seam returns user and role from `getUser`, refuses a session whose user cannot be fetched. Met.**
`packages/auth/src/context.ts:96-117` reads only `client.auth.getUser()`; an `error`, a null user or a throw each return `null` (lines 100-104). Role comes from `app_metadata` via `roleOf` (`context.ts:63-68`), filtered against `APP_ROLES`. The adversarial case is genuinely adversarial, not a stub: `context.test.ts:87-108` builds a real `@supabase/ssr` server client over a forged cookie that claims `app_metadata.role: "admin"` (`test-helpers.ts:44-70`), asserts `getSession()` *would* hand over that admin, stubs `/auth/v1/user` with 401, and asserts the seam returns `null` and that the Auth endpoint was actually called. `context.test.ts:110-132` then proves the role is taken from the server's answer, not the cookie. The `UserReader` fixture throws if `getSession()` is ever touched (`context.test.ts:41-43`). Mirror-once semantics, concurrency and the anonymous path are covered at `context.test.ts:134-188`. All eight pass in `C1.log` (ok 7-14).

**C2 — `updateSession` purges cookies for a different project ref. Met.**
`session.ts:49-51` purges before any refresh; `cookies.ts:40-63` matches the stem and all four companion forms. `session.test.ts:27-107` covers staging-on-local, local-on-staging, own cookies kept, an unrelated `sb-session-notes` kept, no-foreign-cookie writing nothing, and the cookie-name grammar including `-flow-<id>-code-verifier`. Passes in `C2.log` (ok 18-22). The accumulating-batch design (`session.ts:41-47`) is correct by inspection and matches what `proxy.ts:24-35` needs, but no test exercises a purge *followed by* a real refresh write — every C2 test answers 401/500, so the Supabase write path is never triggered. Logic verified in code; composition is runtime-required.

**C3 — boundaries pass with `@supabase/*` owned by auth. Met.**
`boundaries.js:83-88` adds `"@supabase/*": "auth"`; `PACKAGE_IMPORTS.auth` is `["config","db","observability"]` (line 74) and the layer-order comment was updated (line 6). `tooling/boundaries.test.ts:38-58,86-97` adds the six probes the as-built claims — `@supabase/*` refused in `db` and `apps/web`, `@pem/auth` refused in `db` and `email`, both allowed in `auth` and the app — and they pass in `C4.log` (ok 4-7, 12-13) at the same head. A repo-wide grep confirms `@supabase/*` is imported in exactly three files, all under `packages/auth/src/`. `C3.log` itself is header-only (exit 0, no output), so the "owned by auth" half rests on the C4 probes rather than on C3's own artifact.

**C4 — full chain passes, service-role key among the seeded server-only variables, no sentinel in a client chunk. Met, by derivation.**
`tooling/check-client-bundle.ts:74-93` plants every non-`NEXT_PUBLIC_` name from `.env.example` ∪ `turbo.json` minus three enum words. `SUPABASE_SERVICE_ROLE_KEY` and its `_LOCAL`/`_STAGING` forms are in both registries (`.env.example:68-70`, `turbo.json:27-29`) and are read by `env.ts:53-56,120-124`, so they are necessarily planted; the 18 plantable names I derive match the log's `18 server-only value(s), none in 27 browser-facing file(s)` exactly (`C4.log:1295`). `yarn verify` exit 0. The browser path is literal-only: `env.ts:127-132` falls back to `raw.NEXT_PUBLIC_*`, which are literal `process.env.NEXT_PUBLIC_*` reads (lines 43-52) collapsed by `next.config.ts:42`. The log never names the planted variables, so the key-specific half of this criterion is proven by reading the tooling, not by reading the artifact.

**C5 — a staging sign-in on localhost redirects back to localhost. Correctly deferred, not verified.**
Recorded `--verdict deferred` per the specs rule; `C5-operator.md` gives reproducible steps and is honest about what the agent could and could not reach. The rules it rests on are sound in code: `redirect.ts:15-33` pins the origin to `env.NEXT_PUBLIC_SITE_URL` and rejects `//host`, `/\host`, control characters and anything that re-resolves off-origin; `callback/route.ts:32,51` never reads `Host`. Unit-covered in `C1.log` ok 15-17. This remains the single largest unverified surface in the ticket, and the as-built says so.

### Findings

**Should-fix — `server-only` is claimed as an auth-module dependency, but `apps/docs` depends on it too, so the removal protocol cannot be satisfied.**
`toolkit.json:263` lists `server-only` under the `auth` module's `dependencies`, and `docs/runbooks/remove-supabase-auth.md:61` tells the operator to drop it. `tooling/check-stack.ts:192-199` fails a removed module whose dependency is still in *any* `package.json` — and `apps/docs/package.json:23` lists `server-only` for `apps/docs/lib/docs.ts`, which is nothing to do with auth. So the runbook's own Verify step 2 (`remove-supabase-auth.md:75`, `yarn check-stack` exits 0) cannot pass after a correct removal, and an operator who "fixes" it by deleting the line from `apps/docs` breaks that app. `docs/engineering/tech-stack.md:43` compounds it by scoping the row to `apps/web` only. Expected per D-STK-13: a module's listed dependencies are the ones removing it must remove. Suggested owner: the builder (drop `server-only` from the auth entry and from the runbook's dependency list, or state the `apps/web`-only scope the checker can actually enforce). STK-20's removal dry-run will hit this otherwise.

**Should-fix — STK-11's proofs were invalidated by this ticket's shared-file edits and must be re-recorded before the merge.**
`C4.log:18-23` shows all five STK-11 criteria stale, each naming `.env.example`, `docs/engineering/tech-stack.md` and `docs/runbooks/remove-supabase-auth.md` — three of STK-12's planned paths — plus STK-11's reviews unproven. STK-12's seam calls STK-11's mirror (`local-mirror.ts:51`), so this ticket's dependency is currently unproven, and `yarn check-specs --strict` will fail the merge. Not a code defect and not a reason to hold STK-12's own work; a batch action. Suggested owner: the batch (re-run STK-11 C2/C3, re-record C1/C4/C5).

**Consider — the as-built asserts two live checks that left no artifact.**
`as-built.md:6` ("Checked live on 2026-10-04 with a synthetic staging URL: three `sb-127-*` cookies were deleted on the next request") and `as-built.md:21` ("All six were checked in the browser on 2026-10-04"). Both are plausible and consistent with the code, but once the as-built is merged it is immutable, and neither claim can be audited by anyone reading the folder. The same document handles C5 exactly right — an evidence file plus a "Not verified" entry. These two deserve the same treatment or an explicit not-verified line, especially since `.claude/rules/testing.md` holds every capture criterion UNVERIFIED until P-C.

**Consider — C4's command conflicts with a binding rule, and its log under-proves the criterion's specific half.**
`contract.md:64` sets C4's command to `yarn verify`, which `.claude/rules/specs.md` says is never a criterion (it runs once at batch close). Separately, because the non-`--plan` mode prints only a count, a fresh reviewer has to reconstruct the seed list from the tooling to confirm the criterion's named variable. Attaching `yarn check-client-bundle --plan` output alongside would make the service-role key's presence readable instead of derivable. Routed to the contract author, not relitigated here — the criterion is met either way.

**Consider — the two `yarn test` runs recorded at one head report different test totals.**
`results.json:15` records 106 for C1, `results.json:28` records 105 for C2, with C2 a full-turbo replay of the identical cached logs. The difference is almost certainly the counter losing a line to interleaved turbo output (both logs show heavy interleaving). Harmless here, but the zero-test gate in `contract:run` reads the same count.

I did not file the sign-in page's missing `empty`/`partial`/`offline` states: `as-built.md:32` logs the deviation with sound reasoning (a form with no data has no such states), and canon C-P08 is satisfied for every state that is actually reachable.

### Conversations

**The proxy has no failure floor.** `proxy.ts:22` awaits `updateSession` with nothing around it. In practice supabase-js returns network failures as `error` rather than throwing, so an Auth outage degrades to signed-out — which is the right behavior. But any unexpected throw inside the refresh (and the proxy matcher covers nearly every route, `proxy.ts:42-44`) takes out the sign-in page too, which is the one page a user needs when auth is misbehaving. Is a `try/catch` that logs and returns the pass-through response worth the cost of hiding a real bug? Given this is starter code a product inherits, I lean yes, but it is a judgment call about which failure you would rather debug.

**The typed address is lost on every failure.** `actions.ts:30` and `:45` redirect to `?state=invalid` / `?state=error`, and the field comes back empty (`email-field.tsx:8-16` has no `defaultValue`). That is a direct consequence of a good privacy decision — the address never enters a URL or a log (`actions.ts:4-5,44`) — so repopulating would need a cookie or a client-held value. For one field it is a small cost, and the error copy is kind about it ("Check the address, then send it again in a minute"). Worth naming because a one-handed user on a phone who mistypes pays for it twice, and the fix has a privacy price. Owner: whoever holds the form-state convention when the demo app's forms land.

**The error message is not tied to the input.** `page.tsx:69-73` renders the `invalid` / `error` message as a `role="alert"` paragraph above the field, but the input carries no `aria-invalid` and no `aria-describedby` pointing at it. A screen-reader user hears the alert once; a user who navigates back to the field afterwards gets no indication it is the field in question. Small, and arguably the design owner's call on the shared input primitive rather than a one-off here, since `@pem/ui` has no input yet (`as-built.md:33`).

### Runtime checklist (ordered by risk)

1. **C5 as written in `C5-operator.md`** — real staging project, real inbox, link opened in the same browser; confirm the landing is `http://localhost:3000/...` and the cookie is `sb-<staging ref>-auth-token` on localhost.
2. **Purge plus refresh in one request.** Sign in on staging, switch `DATABASE_ENVIRONMENT` to Mode B, load any page, and confirm in DevTools that both the foreign `Set-Cookie` deletions *and* the new project's refreshed cookies survive on the one response — this is the composition `session.ts:41-47` and `proxy.ts:24-35` get right in code but no test exercises together.
3. **Auth outage with the proxy in the path.** Point the Supabase URL at an unroutable host and load `/auth/sign-in`: expect a served, signed-out page, not a 500.
4. **Session refresh against a genuinely expired access token** — listed as not verified in `as-built.md:39` and still the gap closest to the authorization boundary.
5. **The sign-in states in a browser**, light and dark: `?state=` for each of `loading`, `sent`, `invalid`, `error`, `expired`, plus the no-project message with `NEXT_PUBLIC_SUPABASE_*` unset.
6. **`createSupabaseBrowserClient` has no caller anywhere** (`lib/supabase/client.ts:12`), so the inlined-literal path is proven only by `check-client-bundle`, never by instantiation. First client component to need it should be watched.

Assumptions: `[ASSUMPTION: the precedence ladder is docs/index.md's, since none was supplied with this run]`. Where the contract was silent I tested to the most user-protective reading — in particular I treated any path that could authorize from the cookie's session, or put the service-role key or an email address in front of the browser, as a Blocking class; none of them fired.

VERDICT: PASS
