# Audit: duplicated logic across apps and packages (2026-10-08)

Track: audit, Q0. Lens: Mason (is it sound underneath). Reader: Taylor, as context for the next sandbox tickets and for choosing how agents learn what already exists. Depth: a pass, grep-led; every count below was seen in code, not walked in the app.

## Verdict

Ready with these fixes: nothing is broken, but four helpers are each written two to twelve times, and every new sandbox ticket writes them again because nothing tells an agent they exist. The cheapest guard is a lint rule per repeated shape, shipped with each fix, plus a "look first" line and a finder command loaded by path on TypeScript files; a loaded ledger of every export costs more than the budget allows.

## Counts

| Black | Red | Orange | Yellow | Grey |
| ----- | --- | ------ | ------ | ---- |
| 0     | 0   | 2      | 3      | 3    |

## Findings, ranked by how often each would be rewritten

### D1 · Orange · The sandbox slug check: 12 copies

- **Where.** `apps/web`: `const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/` in `lib/sandbox/comments.ts:45`, `threads.ts:106`, `experiment.ts:157`, `cookie.ts:28`, `review.ts:52`, and `SLUG_PATTERN` in `app/experimental/_experiments/registry.ts:21`; a `validSlug` that hard-codes `48` in `comments.ts:47`, `threads.ts:108`, `review.ts:54`. `packages/db`: `new RegExp(SANDBOX_SLUG_PATTERN)` plus a `validSlug` in `src/sandbox/erasure.ts`, `experiments.ts`, `actions.ts`, `codes.ts`, `threads.ts`, `team.ts`.
- **What it costs.** Every new sandbox data function (web side and db side) adds a copy; this is the most rewritten helper in the repo. The web copies restate the pattern and the 48 cap that `packages/db/src/schema/sandbox/columns.ts:12-13` owns, so a change to the column check leaves six web copies accepting what the database refuses.
- **Home.** `@pem/db/sandbox` exports `isSandboxSlug(value: unknown): value is string`, built on `SANDBOX_SLUG_PATTERN` and `SANDBOX_SLUG_MAX`. Two workspaces import it and `apps/web/lib/sandbox` already imports `@pem/db/sandbox` (the `web-sandbox` element), so no new edge.
- **Fix.** WEB-15 (`specs/web/one-offs/WEB-015-sandbox-slug-check/`).

### D2 · Orange · Email normalising: `trim().toLowerCase()` at 12 sites in two workspaces

- **Where.** `apps/web/lib/sandbox/admin-data.ts:154,171`, `admin-data-data.ts:74`, `people.ts:181,252`, `access-check.ts:153`, `emails-used.ts:22`, `app/admin/data/_components/erase-section.tsx:153`; `packages/db/src/sandbox/gate.ts:77`, `actions.ts:71`, `erasure.ts:168` (asserting it), `scripts/grant-admin.ts:61,95`. `people.ts:234` lowercases without trimming (inferred inconsistency, not seen failing).
- **What it costs.** Every surface that takes or matches an address writes it again, and the database refuses an address a caller forgot to trim (`EMAIL_NOT_NORMALISED`). Personal data rides on it: the gate, erasure and the people list must agree on one form.
- **Home.** The first module of `packages/utils`: `@pem/utils/email` with `normaliseEmail` and `isNormalisedEmail`. A pure function with a second consumer in another workspace is the exact trigger `packages/utils/README.md` names; `utils` sits at the foundation, so `db` and `apps/web` may both import it.
- **Fix.** WEB-16 (`specs/web/one-offs/WEB-016-utils-normalise-email/`).

### D3 · Yellow · Sandbox date and number formatters: 10 inline `Intl` formatters

- **Where.** Four module-level `en-GB` + `SANDBOX_TIME_ZONE` formatters, two identical (`WHEN` in `app/admin/experiments/[slug]/codes/_components/codes-table.tsx:59` and `app/admin/data/_components/record-table.tsx:33`), plus `DATE` in `app/admin/people/_components/people-table.tsx:75` and `EXACT` in `lib/sandbox/admin-experiments.ts:81`. Two hydration-safe "reader's locale, UTC before hydration" formatters: `formatLockTime` in `app/experimental/[slug]/_components/gate/gate-form.tsx:63` and `endedDate` in `lib/sandbox/ended.ts:154`. Two locale-parameter formatters in `lib/sandbox/client/review-view.ts:283` and `pins-view.ts:86,90`; two `Intl.NumberFormat("en-GB")` counters in `lib/sandbox/client/pin-list.ts:18` and `pins-view.ts:15`.
- **What it costs.** Each new admin table or reviewer screen writes another, and the zone rule D-LAB-41 is restated each time instead of held once. `lib/sandbox/time.ts` already calls itself "the sandbox's one time zone"; nothing points a builder at it.
- **Home.** `apps/web/lib/sandbox/time.ts` (one consumer app: §1 co-locates). The `local` hydration-safe pair needs a home a client leaf may import; keep it pure.
- **Fix.** WEB-17 (`specs/web/one-offs/WEB-017-sandbox-date-formats/`).

### D4 · Yellow · The `next/headers` cookie-jar adapter: 2 copies

- **Where.** `apps/web/lib/supabase/server.ts:17-27` and `signOutHere` in `apps/web/app/experimental/[slug]/actions.ts:170-176`.
- **Answer to the brief's first question.** Yes, a seam that should exist once, but in the app, not in `@pem/auth`. `@pem/auth` already owns the one shape (`SessionCookieStore`, `packages/auth/src/cookies.ts:35`) and the one `signOut`; the half that knows `next/headers` has one consumer, `apps/web`. The other two adapters are different by necessity and stay: `proxy.ts:24` mirrors writes onto the request and a rebuilt response, and `app/auth/sign-out/route.ts:48` writes to its redirect response with Supabase's headers. Only the jar adapter repeats, and the copy in `signOutHere` lacks the read-only guard `server.ts` carries.
- **What it costs.** Every Server Action that touches the session writes it again (the next gate sign-in action will).
- **Home.** `apps/web/lib/supabase/cookie-store.ts`, `nextCookieStore()`, used by `server.ts` and `signOutHere`.
- **Fix.** WEB-14 (`specs/web/one-offs/WEB-014-next-cookie-store/`).

### D5 · Yellow · The team-role predicate and the refused result

- **Where.** `role === "developer" || role === "admin"` in `apps/web/lib/sandbox/admin-data.ts:142`, `admin-codes.ts:88` and `packages/db/src/sandbox/viewer.ts:52`. `Object.freeze({ outcome: "refused" })` three times: `TEAM_ACTION_REFUSED` (`lib/sandbox/admin-gate.ts:76`, already used in five files), `DATA_ACTION_REFUSED` (`admin-data.ts:129`), `ROLE_CHANGE_REFUSED` (`people.ts:122`).
- **What it costs.** A third team role changes three files and misses whichever a new ticket copied; each new admin action mints its own refused constant.
- **Home.** `isTeamRole` beside `requireTeam` in `@pem/db/sandbox` (it owns the roles); the refused result stays `TEAM_ACTION_REFUSED` in `apps/web/lib/sandbox/admin-gate.ts`.
- **Fix.** WEB-18 (`specs/web/one-offs/WEB-018-sandbox-team-guards/`).

### D6 · Grey · `?state=` readers

`apps/web/lib/sandbox/state.ts` is already the sandbox's one reader (26 importers). Outside it, `app/auth/sign-in/page.tsx:31` has a three-line allowlist `readState`, and `app/page.tsx:17` reads `state` raw for its error fixture. Two small readers are not yet a pattern; when a third non-sandbox surface needs one, it belongs in `apps/web/lib/state.ts`. No contract.

### D7 · Grey · Zod email schema twice

`app/auth/sign-in/actions.ts:20` (`z.email()`) and `lib/sandbox/validators.ts:24` (`z.email(...).max(254)`), with different messages. Fold into `@pem/validators` when a second auth form arrives. No contract.

### D8 · Grey · `apps/docs` against `apps/web`

No shared logic found. `apps/docs/lib` holds `docs.ts` and `search-entry.ts`; its `toSlug` turns file paths into routes and is unrelated to sandbox slugs. Clean.

## What tells an agent what already exists

**Today, almost nothing.** Codebase-conventions §4 names each package's role, layer and edges; it lists no function. `packages/utils/README.md` says when the seam becomes a package, not what exists. `apps/web/lib/` (76 modules) has no index. The one place an agent is told to look first is `packages/ui/AGENTS.md:41`, and `@pem/ui` is the one package with no duplicate found. Taylor's old ledger of `packages/utils` has no successor, and §4 does not do its job.

**Most duplication is not between packages.** D1, D3, D4 and D5 sit inside `apps/web` or between `apps/web/lib/sandbox` and `@pem/db/sandbox`. A ledger of package exports alone would have caught D2 at most.

**A loaded ledger does not fit the budget.** `packages/*/src`, `apps/web/lib` and `apps/docs/lib` hold 410 source modules and 781 exported functions and constants (tests and stories excluded). One line per module is about 6,000 tokens; packages without `@pem/ui`, about 2,700. Both exceed the non-UI build's 1,500-token share for path rules and nested `AGENTS.md` (`docs/index.md`, budget table), and the 4,000 always-on share outright.

## Recommendation: the cheapest mechanism that would work

1. **Each fix ships a lint guard for its shape.** A `no-restricted-syntax` (or `no-restricted-imports`) rule in the web and db ESLint configs whose message names the home: a slug regex literal outside `@pem/db/sandbox`; `.trim().toLowerCase()` on an `email`; `new Intl.DateTimeFormat` in `apps/web/app/admin` or `lib/sandbox` outside `time.ts`; `cookies()` from `next/headers` passed to an auth client outside `lib/supabase/`. **Cost: 0 tokens**; it fires at the moment the copy is written, which no document can.
2. **A "look first" line in `.claude/rules/ts.md`, and `yarn exists <word>`.** The line: before writing a helper, run `yarn exists <word>`. The command prints matching exports from `packages/*/src` and `apps/*/lib` with each module's first header-comment line (the modules already carry one), capped at 20 lines. **Cost: about 45 tokens, by path on `*.ts`/`*.tsx`, inside the 1,500 share; 0 always-on.** Nothing is generated or committed, so nothing goes stale.
3. **No §4 table refresh.** §4 answers "where does it go"; the finder answers "does it exist". Writing exports into §4 would put them in two places.

Drafted as WEB-19 (`specs/web/one-offs/WEB-019-helper-finder/`). Rejected: a generated ledger loaded by a path rule (2,700 to 6,000 tokens, over budget, and it misses intra-app duplicates unless it lists `apps/web/lib` too, which makes it larger).

## What was not examined

- Code under `apps/web/app/**` beyond the files named above, for shapes other than the seven the brief listed.
- `packages/ui`, `catalog`, `ai`, `email`, `services`, `api` internals, beyond the greps (no hits for the listed shapes).
- `tooling/` against the workspaces.
- Behaviour in the running app; nothing was walked.
- Tests and stories (excluded from every count).
