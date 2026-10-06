/**
 * The /admin nav and the tree's metadata (LAB-8, D-LAB-22, S23). The nav is
 * Experiments, People (admins only) and Data. Each entry carries a `ready`
 * flag: an entry that is not ready renders as a dimmed label, never a link.
 * People and Data ship not ready; LAB-9 and LAB-16 each flip their own.
 *
 * `icon` is a name, not a component, so this file runs under `node --test`;
 * the shell's client leaf maps it to the drawn icon.
 */

import type { Metadata } from "next";

import type { TeamRole } from "./team-check.ts";

export type AdminNavIcon = "experiments" | "people" | "data";

export type AdminNavEntry = {
  title: string;
  href: string;
  icon: AdminNavIcon;
  ready: boolean;
  /** Shown only to an admin; the page is a 404 for anyone else. */
  adminOnly: boolean;
};

export const ADMIN_NAV: readonly AdminNavEntry[] = [
  {
    title: "Experiments",
    href: "/admin/experiments",
    icon: "experiments",
    ready: true,
    adminOnly: false,
  },
  {
    title: "People",
    href: "/admin/people",
    icon: "people",
    ready: false,
    adminOnly: true,
  },
  {
    title: "Data",
    href: "/admin/data",
    icon: "data",
    ready: false,
    adminOnly: false,
  },
];

/** The entries a role sees: a developer never sees People. */
export function adminNavFor(
  role: TeamRole,
  nav: readonly AdminNavEntry[] = ADMIN_NAV,
): AdminNavEntry[] {
  return nav.filter((entry) => !entry.adminOnly || role === "admin");
}

/** True when `path` sits under an admin-only entry (People), whatever the caller passed. */
export function isAdminOnlyPath(
  path: string,
  nav: readonly AdminNavEntry[] = ADMIN_NAV,
): boolean {
  return nav.some(
    (e) => e.adminOnly && (path === e.href || path.startsWith(`${e.href}/`)),
  );
}

/** The entry `pathname` sits under, if any: `/admin/experiments/x/codes` is under Experiments. */
export function activeAdminHref(
  pathname: string,
  nav: readonly AdminNavEntry[] = ADMIN_NAV,
): string | null {
  const entry = nav.find(
    (e) => pathname === e.href || pathname.startsWith(`${e.href}/`),
  );
  return entry?.href ?? null;
}

/**
 * Every /admin page inherits this from the layout: noindex in the page as
 * well as LAB-5's header (D-LAB-42). No robots file disallows the path, so a
 * crawler that fetches it reads both.
 */
export const ADMIN_METADATA = {
  title: "Admin",
  robots: { index: false, follow: false },
} as const satisfies Metadata;

/** The shell's `?state=` keys (shell.md), each registered as `team` in state.ts. */
export const SHELL_STATE_KEYS = [
  "shell-admin",
  "shell-developer",
  "shell-not-ready",
  "shell-collapsed",
  "shell-phone",
  "shell-not-found",
] as const;
export type ShellStateKey = (typeof SHELL_STATE_KEYS)[number];

export type AdminShellView = {
  nav: AdminNavEntry[];
  /** Opens as the icon strip. */
  collapsed: boolean;
  /** Opens the sheet on a phone. */
  sheetOpen: boolean;
  /** Renders the app's 404. */
  notFound: boolean;
};

const allReady = (nav: readonly AdminNavEntry[]) =>
  nav.map((entry) => ({ ...entry, ready: true }));

/**
 * What the shell shows for this role and `?state=` key. `state` has already
 * passed `readSandboxState` for a team viewer; any other key, or none, is the
 * real nav.
 */
export function adminShellView(
  state: string | null,
  role: TeamRole,
  nav: readonly AdminNavEntry[] = ADMIN_NAV,
): AdminShellView {
  const view: AdminShellView = {
    nav: adminNavFor(role, nav),
    collapsed: false,
    sheetOpen: false,
    notFound: false,
  };
  switch (state as ShellStateKey | null) {
    case "shell-admin":
      return { ...view, nav: adminNavFor("admin", allReady(nav)) };
    case "shell-developer":
      return { ...view, nav: adminNavFor("developer", allReady(nav)) };
    case "shell-not-ready":
      return {
        ...view,
        nav: adminNavFor("admin", allReady(nav)).map((entry) =>
          entry.adminOnly ? { ...entry, ready: false } : entry,
        ),
      };
    case "shell-collapsed":
      return { ...view, collapsed: true };
    case "shell-phone":
      return { ...view, sheetOpen: true };
    case "shell-not-found":
      return { ...view, notFound: true };
    default:
      return view;
  }
}
