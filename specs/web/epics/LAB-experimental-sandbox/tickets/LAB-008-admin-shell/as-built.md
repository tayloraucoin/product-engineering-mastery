# As-built — LAB-8

## Shipped against the contract

- C1 to C4: `adminGate({ member, signedIn, path, adminOnly })` in `apps/web/lib/sandbox/admin-gate.ts` returns `team`, `sign-in` (with `next` through `safeNextPath`), `bare` or `not-found`. `admin-guard.ts` (`server-only`) binds it to `getTeamMember()` as `requireTeamPage(path, { adminOnly })` and `requireTeamAction({ adminOnly })`. A path under an admin-only nav entry (People) is admin-only even when the caller omits the flag (`isAdminOnlyPath`). A refused action gets the frozen `TEAM_ACTION_REFUSED`, `{ outcome: "refused" }`, and does nothing. Neither file reads a cookie, so a code holder is signed out here.
- C3: `admin-nav.ts` holds `ADMIN_NAV` (`{ title, href, icon, ready, adminOnly }`), `adminNavFor(role)` and `activeAdminHref`. People and Data ship `ready: false`.
- C5: `ADMIN_METADATA` (`robots: { index: false, follow: false }`, title "Admin"), exported by `app/admin/layout.tsx` as its `metadata`; seen in the page as `noindex, nofollow`.
- C6: `admin-routes.test.ts` parses every file under `app/admin` with the TypeScript compiler.
  - A `page.tsx` (and its `generateMetadata`) opens with `await requireTeamPage(<path>)`, imported from admin-guard. Only reading the handed `params` or `searchParams` may come first, and the path is never `null`.
  - A `layout.tsx` may pass `null`, and its next statement must then be `if (!member) return children;`.
  - Each `"use server"` export opens with `const member = await requireTeamAction(...)` and `if (isTeamActionRefusal(member)) return member;`. Under `people/` it passes `{ adminOnly: true }`.
  - It refuses route handlers, any route file outside page, layout, loading and actions, `loading.tsx` with an await, re-exports from action files, inline `"use server"`, and `generateStaticParams`.
  - Synthetic files fail each rule.
- C7: walked at 390 in the browser pane; handed to the operator (`evidence/C7-operator.md`).
- C8: every `shell-*` key at 390, 834 and 1440, light and dark (`evidence/shell-states.png`). Taken against a scratch copy whose `team.ts` returns a synthetic member from a cookie, because this machine has no Supabase Auth. The copy was never committed.
- C9: `SidebarProvider` takes `mobileBreakpoint` (`"md"` by default, or `"lg"`), and `useIsMobile(breakpoint)` reads `MOBILE_QUERIES`. Two stories at a simulated 900px prove it: the default stays fixed, and `lg` opens as a sheet. The `lg` story fails when the option is ignored.

## Deviations

- [ASSUMPTION] The layout calls `requireTeamPage(null)`: with no session it renders the page bare, and the page's redirect carries `next`. C6's scan lets awaiting the handed `params` or `searchParams` come before the guard, since that reads nothing (LAB-10's `[slug]` layout needs it).
- [ASSUMPTION] Shell `?state=` keys are read in the client leaf with `useSearchParams`: a layout gets no search params, and only a team member ever renders the shell. `shell-not-found` calls `notFound()` from the client. `shell-phone` opens the sheet on mount.
- `lucide-react@1.48.0` was added to `apps/web` for the nav icons. It was already in the lockfile, and the tech-stack row now names `apps/web`.
- Outside the planned paths: `apps/web/app/layout.tsx` and a new `app/_components/floating-theme-toggle.tsx`. The root layout's corner theme toggle sat invisible behind the shell and was the first Tab stop, ahead of "Skip to content". It now renders nothing under `/admin`, whose footer carries the toggle.
- No `signOutAdmin` action, against the contract's interface list: the footer's "Sign out" posts to the hardened `/auth/sign-out` route (STK-24). That route clears every session cookie whatever Supabase answers, checks Origin and logs a failed revoke (warden O5). So `app/admin/` has no action file and no unguarded action.
- After review, the root's corner toggle hides on `[data-admin-shell]` through CSS, not on the path. A 404 under `/admin` then looks like any other 404.
- `Sidebar` gained `sheetTitle` and `sheetDescription` (defaults unchanged). The shell names its sheet "Admin" with no description and drops `SidebarRail`, whose "Toggle Sidebar" name is not in shell.md.
- Not-ready entries read ", not built yet" on screen, not only to a screen reader (assay, C-P05).

## Reviews (Q2, in the thread)

- Round 1: assay FAIL (black: the not-ready entry was told apart by colour alone; red: the "Sidebar" and "Toggle Sidebar" names), warden FAIL (red: the scan passed a dropped refusal and a page passing `null`; orange: scan gaps, flag-only admin-only, a weaker sign-out). All black, red and orange findings above are fixed, except the two below.
- Not taken, routed: hover and the active entry share `sidebar-accent`, because no selection token exists (a token for Plumb, outside this ticket). The collapsed strip hides the footer; shell.md is silent on that.
- Not taken, yellow: a tooltip on the labels toggle; the sheet's width (`w-3/4`, `sm:max-w-sm`) beats `--sidebar-width`; the primitive animates width.
- The red "1 issue" badge on the 404 capture is Next's dev overlay reporting next-themes' "script tag" warning. It shows on every 404 in the app, not only under /admin.

## Not verified

- C7 by a person, with a real session (deferred).
- A real sign-in round trip: no Supabase Auth on this machine.

## Next

LAB-9 flips People to ready and adds `/admin/people`; LAB-10 replaces `experiments/page.tsx`; LAB-16 flips Data.
