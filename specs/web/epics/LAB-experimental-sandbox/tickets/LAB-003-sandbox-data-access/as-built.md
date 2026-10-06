# As-built — LAB-3

## Shipped against the contract

- C1: `packages/db/test/sandbox/isolation.test.ts` runs every runtime export of `@pem/db/sandbox` through its registered cases.
  - The fixtures (`fixtures.ts`): two reviewers on slug A, one on slug B, a signed-in reviewer on slug A, and a team note. Each reviewer has an access, a view, a comment and a review version.
  - `recordAction`, the one viewer function, runs as each of the five viewer kinds.
  - The four gate functions run through named cases that assert their exact return keys.
  - `reviewerScope`, the one helper every later reviewer function filters by, is shown to return each reviewer only their own view, comment and version. It returns nothing when the slug is swapped, and refuses both team viewers.
- C2: `registry.ts` holds `coverageProblems(module, registry)`, the guard. It flags an export with no entry, a viewer entry missing any of the five kinds, and an entry for nothing exported. Run on the real module it finds nothing. A synthetic module shows all three failures.
- C3: the gate group in `src/sandbox/gate.ts` takes `(db, input)` and returns only ids, versions and flags, or the access's email from `findAccessEmail`.
  - `findLiveReviewerByCodeHash` finds a code only on its own slug.
  - A revoked code, a foreign slug, a stale `code_version`, and a signed-in reviewer's access read by another user id or signed out each return null.
  - So do an unknown or malformed hash or id, which never reach a query.
- C4: `recordAction` writes one row with the actor's id and email, the action, the slug and the counts. The row holds no label, reviewer email, code or reviewer id.
  - It refuses all three reviewer viewers with a fixed message and writes nothing.
  - It refuses free text or an email as the action, a bad slug, and a count name outside the schema's closed list or a non-integer count.
- After the first reviews (mason, warden, both PASS):
  - `recordAction` admits `targetEmail` only with `ROLE_CHANGE_ACTION` (`role-change`), and only as a trimmed, lower-cased address. An erasure therefore cannot write the address it erased. It is refused with the fixed message otherwise.
  - `requireTeam` also refuses a team viewer whose `userId` is not a UUID or whose email is empty.
  - The coverage guard checks each entry's group against the function's arity: three parameters must be `viewer`, a `gate` takes two. A synthetic mis-filed export proves it.
  - The suite imports the module as `@pem/db/sandbox`, so a wrong `exports` entry fails it.
  - The purity check also bans `createDb` and `closeDb`.
  - The LAB-3 boundary probes run as `C5 (LAB-3)`.
  - `data-contract.md` names the gate group's `(db, input)` exception.
- C5: `boundaries.js` adds `web-sandbox` (`apps/web/lib/sandbox/**`, before `app-web`) and `db-sandbox` (`packages/db/src/sandbox/**`, before `db`, transport-free). An override on `apps/web/app/experimental/**` and `apps/web/app/admin/**` bans `@pem/db/client` and `@pem/db/schema`, and keeps apps/web's SDK bans. `tooling/boundaries.test.ts` adds nine refusals and four allowed cases. `yarn lint:boundaries` passes on the whole repo.

## Deviations

- **A second element, `db-sandbox`.** The boundaries plugin matches elements by path, not by a package's subpath. `@pem/db/sandbox` therefore needs its own element for the rules to name it.
  - It is in `NOT_FOR_APPS`, so only `web-sandbox` among app files may import it.
  - `db` may import it, for @pem/db's own tests; no other package lists it.
  - Being in `TRANSPORT_FREE` makes "imports neither next nor react" a lint rule, which `src/sandbox/viewer.test.ts` backs. That test also fails on any `getDb` in the module.
- **`createAccess` returns `{ accessId }` or null.** The insert is `insert … select` from the reviewer row, guarded by `code_version` and `revoked_at`. A code replaced or revoked between the lookup and the insert therefore grants nothing, instead of writing an access `checkAccess` would refuse anyway. It throws a fixed message for an email that is not already trimmed and lower-cased, both or neither identity, or a malformed id.
- **`findAccessEmail` returns null for a revoked code** as well as for a foreign slug, an erased access and a signed-in reviewer's access. A link token on a revoked code then says no more than an unknown slug does (gate.md). A stale `code_version` still fills the email, so a reviewer whose code was replaced is greeted by name.
- **`SandboxAccessError`** is the one error class. Its messages are exported constants and never carry input. A non-UUID id is checked before any query, because Postgres echoes a bad uuid in its error. It is a runtime export, so it has its own "support" entry in the registry.
- **`SandboxDb = Db | transaction`**, so LAB-16 can write its erasure and its `recordAction` row in one transaction.
- `requireReviewer` sits beside `requireTeam` and `requireAdmin`. `reviewerScope` uses it to refuse a team viewer. None of the three is re-exported: a later function in the module calls them.
- The registry's entries may name extra criteria (`criteria: ["C3"]`), which prefix the test names.

## Not verified

- `review:mason` and `review:warden` are manual criteria, recorded by `yarn review:run`.
- Only one viewer function exists yet (`recordAction`). Reviewer-scoped reads arrive with the surface tickets. `reviewerScope` is proven against real rows here, but each new function's own cases are its ticket's.

## Next

Points the reviews raised for later tickets:

- `findAccessEmail` is the one gate function returning personal data. LAB-5's link-token verification is all that stands between a leaked access id and an address, so it needs its own verification item there (warden).
- LAB-6's throttle should land before LAB-5's gate is reachable over HTTP. Until then, codes can be guessed with no lockout (warden).
- The seven tables are still in the `@pem/db/schema` barrel. Only the experimental and admin route trees are kept off it, so a `./schema/sandbox` subpath that only `db-sandbox` may import would close the rest (warden, consider).

LAB-5 binds the gate group in `apps/web/lib/sandbox/access.ts` (`resolveViewer`, `grantAccess`). Each surface ticket adds its functions to `src/sandbox/` together with their registry cases.
