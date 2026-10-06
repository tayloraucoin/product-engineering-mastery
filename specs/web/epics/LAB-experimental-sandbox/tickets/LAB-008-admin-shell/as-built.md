# As-built — LAB-8

## Shipped against the contract

- C1 to C4: `adminGate({ member, signedIn, path, adminOnly })` in `apps/web/lib/sandbox/admin-gate.ts` returns `team`, `sign-in` (with `next` through `safeNextPath`), `bare` or `not-found`. `admin-guard.ts` (`server-only`) binds it to `getTeamMember()` as `requireTeamPage(path, { adminOnly })` and `requireTeamAction({ adminOnly })`; a refused action gets the frozen `TEAM_ACTION_REFUSED`, `{ outcome: "refused" }`, and does nothing. Neither file reads a cookie, so a code holder is signed out here.
- C3: `admin-nav.ts` holds `ADMIN_NAV` (`{ title, href, icon, ready, adminOnly }`), `adminNavFor(role)` and `activeAdminHref`. People and Data ship `ready: false`.
- C5: `ADMIN_METADATA` (`robots: { index: false, follow: false }`, title "Admin"), exported by `app/admin/layout.tsx` as its `metadata`; seen in the page as `noindex, nofollow`.
- C6: `admin-routes.test.ts` parses every route file under `app/admin` with the TypeScript compiler: each `page.tsx` and `layout.tsx` awaits `requireTeamPage` before any other await, and each export of a `"use server"` file awaits `requireTeamAction` in its first statement. Synthetic pages and actions without the guard fail it.
- C7: walked at 390 in the browser pane; handed to the operator (`evidence/C7-operator.md`).
- C8: every `shell-*` key at 390, 834 and 1440, light and dark (`evidence/shell-states.png`). Taken against a scratch copy whose `team.ts` returns a synthetic member from a cookie, because this machine has no Supabase Auth. The copy was never committed.
- C9: `SidebarProvider` takes `mobileBreakpoint` (`"md"` by default, or `"lg"`), and `useIsMobile(breakpoint)` reads `MOBILE_QUERIES`. Two stories at a simulated 900px prove it: the default stays fixed, and `lg` opens as a sheet. The `lg` story fails when the option is ignored.

## Deviations

- [ASSUMPTION] The layout calls `requireTeamPage(null)`: with no session it renders the page bare, and the page's redirect carries `next`. C6's scan lets awaiting the handed `params` or `searchParams` come before the guard, since that reads nothing (LAB-10's `[slug]` layout needs it).
- [ASSUMPTION] Shell `?state=` keys are read in the client leaf with `useSearchParams`: a layout gets no search params, and only a team member ever renders the shell. `shell-not-found` calls `notFound()` from the client. `shell-phone` opens the sheet on mount.
- `lucide-react@1.48.0` was added to `apps/web` for the nav icons. It was already in the lockfile, and the tech-stack row now names `apps/web`.
- Outside the planned paths: `apps/web/app/layout.tsx` and a new `app/_components/floating-theme-toggle.tsx`. The root layout's corner theme toggle sat invisible behind the shell and was the first Tab stop, ahead of "Skip to content". It now renders nothing under `/admin`, whose footer carries the toggle.
- `signOutAdmin` calls `auth.signOut({ scope: "local" })` and redirects to `/auth/sign-in`.

## Not verified

- C7 by a person, with a real session (deferred).
- A real sign-in round trip: no Supabase Auth on this machine.

## Next

LAB-9 flips People to ready and adds `/admin/people`; LAB-10 replaces `experiments/page.tsx`; LAB-16 flips Data.
