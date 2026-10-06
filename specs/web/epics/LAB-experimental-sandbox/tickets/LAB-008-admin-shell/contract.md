---
id: LAB-8
size: small
objective: "The team reaches /admin through one shell on @pem/ui's sidebar; anyone else is sent to sign-in or gets the app's 404, and the role is re-checked on every page and action."
slice_type: "Authorization at a route tree and its shell (S4, S12a); the risk is a page or action that trusts the layout, a developer reaching People, or a visitor learning that /admin exists."
non_negotiables:
  - "One pure decision, adminGate, in apps/web/lib/sandbox/admin-gate.ts: no session gives sign-in with next=<path> through safeNextPath; a user role or a code holder gives not-found; a developer on an admin-only path gives not-found."
  - "Every /admin page calls requireTeamPage(path) before any read, and the layout calls it too; every exported /admin server action calls requireTeamAction first and returns a fixed refusal; signOutAdmin is the one named exception."
  - "The team check is getTeamMember() (LAB-2) on each request; the sandbox_access cookie is never read here."
  - "The nav is Experiments, People (admins only), Data, each { title, href, icon, ready }; a not-ready entry is a dimmed label, not a link; the active entry has aria-current=\"page\" and the selection token."
  - "The layout exports robots { index: false, follow: false } metadata; next.config.ts is LAB-5's and is never edited here."
  - "Below 1024px the sidebar is off-canvas, through a backward-compatible option on @pem/ui's SidebarProvider; its default stays 768px, so no other consumer moves (Taylor, 2026-10-05)."
  - "shell.md's Words verbatim; only @pem/ui components and preset tokens; no slop tell (canon §2, A-01 to A-20)."
devs_call: "The split between admin-gate.ts and admin-nav.ts, the icons, the SidebarProvider option's name, and where the client leaf starts."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/admin/shell.md"
  - "D-LAB-22"
  - "C-LAB-shell-1"
  - "C-LAB-shell-2"
  - "C-LAB-shell-3"
  - "C-LAB-shell-4"
  - "C-LAB-shell-5"
  - "C-LAB-shell-6"
  - "C-LAB-shell-7"
truth_files: "none: the approved proposal ux/admin/shell.md reaches specs/web/ux/admin/shell.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
  - warden
focus:
  - "who gets in: sign-in, 404, role re-checked on every page and action (warden)"
operator_review: false
planned_paths:
  - "apps/web/app/admin/layout.tsx"
  - "apps/web/app/admin/page.tsx"
  - "apps/web/app/admin/actions.ts"
  - "apps/web/app/admin/_components/**"
  - "apps/web/app/admin/experiments/page.tsx"
  - "apps/web/lib/sandbox/admin-gate.ts"
  - "apps/web/lib/sandbox/admin-guard.ts"
  - "apps/web/lib/sandbox/admin-nav.ts"
  - "apps/web/lib/sandbox/admin-*.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/ui/src/primitives/navigation/sidebar/**"
  - "packages/ui/src/hooks/use-mobile.ts"
depends_on:
  - LAB-2
  - LAB-4
out_of_scope:
  - "The noindex header: LAB-5's next.config.ts edit."
  - "The People page and role writes: LAB-9. The list and the experiment layout with its tabs: LAB-10. The Data page: LAB-16."
  - "A custom 404 page: the app's default stands."
  - "Setting a first admin: LAB-9's script."
criteria:
  - id: C1
    statement: "With no session, adminGate sends /admin, an experiment path and /admin/people to /auth/sign-in?next=<that path>, and safeNextPath returns the same path after sign-in."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "A signed-in user role gets not-found on /admin, an experiment path and /admin/people, with or without a code; a code alone never makes a team member."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A developer's nav has Experiments and Data and no People entry, and adminGate gives a developer not-found on /admin/people; an admin's nav has all three."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "requireTeamAction refuses no session (a code holder included), a user, and a developer when admin-only, each with the same fixed refusal and no work done."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "The admin layout exports the shared robots metadata, index false and follow false, so every /admin page inherits noindex."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "A source scan finds every page.tsx and layout.tsx under apps/web/app/admin calling requireTeamPage before any other await, and every exported action in a \"use server\" file there calling requireTeamAction first; a synthetic page or action without it fails the scan."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "With keyboard alone at 390: Skip to content, open the menu, navigate, close with Escape; focus returns to the menu button."
    evidence: manual
    reason: "Needs a person at a keyboard; focus return across the sheet has no runner (no end-to-end runner, technical.md). The builder walks it in the browser pane first, then hands it over with --verdict deferred."
  - id: C8
    statement: "Every shell.md ?state= key renders at 390, 834 and 1440, light and dark; at 834 the top bar and sheet show."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-008-admin-shell/evidence/shell-states.png"
  - id: C9
    statement: "SidebarProvider's off-canvas point stays 768px by default and moves to 1024px only where the new option is passed."
    evidence: test
    command: "yarn workspace @pem/ui test"
---

# Contract — LAB-8 admin-shell

## Build notes

- **Approach:**
  - `admin-gate.ts` (pure): `adminGate({ member, signedIn, path, adminOnly })` returns `team`, `sign-in` (url) or `not-found`. `admin-guard.ts` (`server-only`) binds it to `getTeamMember()`, `redirect` and `notFound` as `requireTeamPage(path, { adminOnly })` and `requireTeamAction({ adminOnly })`. Model the seam on `apps/web/lib/billing/webhook/handle.ts` and its test. Tests sit under `lib/`: `yarn workspace web test` runs only `lib/**/*.test.ts`. C6 reads the route sources as text, as LAB-4's C4 does.
  - `admin-nav.ts`: `ADMIN_NAV`, `adminNavFor(role)`, `ADMIN_METADATA`. People and Data ship `ready: false`; LAB-9 and LAB-16 flip their own flag.
  - `layout.tsx`: the guard, then `SidebarProvider` with the 1024px option, the nav, the footer (email, `theme-toggle`, Sign out) and `main`. `page.tsx` redirects to `/admin/experiments`. `experiments/page.tsx` is a placeholder (guard, the `h1`, one line naming LAB-10), which LAB-10 replaces.
  - Prior art: T's admin shell, as summarised in `brief.md`'s Prior art (rail collapsing to an icon strip, a sheet below `lg`, `{ title, href, icon, ready }` entries, the role checked in the layout and again in every page and action). Never copied. `apps/web/app/auth/sign-in/` and `packages/auth/src/redirect.ts` handle `next`.
- **Decisions that apply:**
  - D-LAB-22: "Each experiment is a page with tabs; the nav is Experiments, People, Data."
  - S4 (brief): "Not signed in: sent to sign-in, then back. Signed in without a team role: a plain 404. An experiment's access never opens `/admin`."
  - S12a (brief): "Every server action and route handler checks again, beyond the gate and the `/admin` 404."
  - S23 (brief): "nav entries carry a `ready` flag, and a sheet opens on a phone. It is rebuilt on `@pem/ui`'s sidebar primitive."
  - R12 (D-LAB-42): "Noindex header and meta only; no robots disallow."
  - R11: a role change applies on the person's next request; nothing caches a role beyond it.
  - Taylor, 2026-10-05 (this thread): the 1024px off-canvas point is a backward-compatible option on `@pem/ui`'s sidebar, not a 768px deviation.
- **Interfaces:** `adminGate`, `requireTeamPage(path, opts?)`, `requireTeamAction(opts?)` (resolving to LAB-2's `TeamMember` or the refusal), `ADMIN_NAV`, `adminNavFor`, `ADMIN_METADATA`, `signOutAdmin()`, and the new `SidebarProvider` option.
- **Per path:**
  - `layout.tsx`, `page.tsx`, `experiments/page.tsx`: as above.
  - `actions.ts`: `signOutAdmin`, `signOut({ scope: "local" })` through `lib/supabase/server.ts`, then `/auth/sign-in` `[ASSUMPTION: sign-out lands on sign-in]`.
  - `_components/`: the client leaf for the sidebar, the menu button and the skip link.
  - `state.ts`: register the shell's keys as `team` in LAB-4's registry.
  - `packages/ui` sidebar and `use-mobile.ts`: the option, its default unchanged. C9 is two stories in `sidebar.stories.tsx` (the `@pem/ui` test runs only stories); never change the vitest config.
- **Gotchas:**
  - A layout gets no pathname and does not re-run on client navigation (Next 16 docs, "Layouts and auth checks"). So each page passes its own path and is the authority. With no session the layout renders its children bare, and the page's redirect carries the right `next`.
  - `sandbox_access` has `Path=/experimental/<slug>` (LAB-5), so `/admin` never receives it. `[ASSUMPTION: C-LAB-shell-2's code holder is met by never admitting them: signed out they see sign-in, signed in as a user the 404.]`
  - `notFound()` in the layout gives the root default 404: the app has no `not-found.tsx`.
  - shadcn's mobile sheet does not close on navigation: close it on a pathname change.
  - Seeded local users hold no role. For captures, give two synthetic local users admin and developer through the local Auth admin API, never a hosted project. LAB-9's script replaces this. `[ASSUMPTION: a local sign-in works by wave 2]`.
  - `state.ts` is LAB-4's (wave 1, batch B2). If it has not landed, report it rather than creating it.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model trusts the layout's check for pages and actions, which is exactly the hole S12a closes.
