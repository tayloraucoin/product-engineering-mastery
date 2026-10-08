"use client";

/**
 * The /admin shell (shell.md): `@pem/ui`'s sidebar, fixed at 1024px and wider
 * and collapsible to an icon strip; below 1024px a top bar with a menu button
 * opens it as a sheet. The server layout has already checked the role and
 * passes only the entries this person may see.
 */
import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, usePathname, useSearchParams } from "next/navigation";
import {
  DatabaseIcon,
  FlaskConicalIcon,
  MenuIcon,
  PanelLeftIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { appIcon } from "@pem/brand/icon";
import { Button } from "@pem/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@pem/ui/sidebar";
import { ThemeToggle } from "@pem/ui/theme-toggle";

import {
  activeAdminHref,
  adminShellView,
  type AdminNavEntry,
  type AdminNavIcon,
} from "../../../lib/sandbox/admin/admin-nav";
import { readSandboxState } from "../../../lib/sandbox/shared/state";
import type { TeamRole } from "../../../lib/sandbox/shared/team-check";

const ICONS: Record<AdminNavIcon, LucideIcon> = {
  experiments: FlaskConicalIcon,
  people: UsersIcon,
  data: DatabaseIcon,
};

export const ADMIN_MAIN_ID = "admin-main";

export type AdminShellProps = {
  role: TeamRole;
  email: string;
  children: ReactNode;
};

export function AdminShell({ role, email, children }: AdminShellProps) {
  // Only a team member ever renders the shell, so a team key is theirs to see.
  const state = readSandboxState(
    useSearchParams().get("state") ?? undefined,
    "team",
  );
  const view = adminShellView(state, role);
  if (view.notFound) notFound();
  return (
    <SidebarProvider
      mobileBreakpoint="lg"
      defaultOpen={!view.collapsed}
      data-admin-shell=""
    >
      <a
        href={`#${ADMIN_MAIN_ID}`}
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>
      <AdminSidebar nav={view.nav} email={email} sheetOpen={view.sheetOpen} />
      <SidebarInset id={ADMIN_MAIN_ID} tabIndex={-1} className="outline-none">
        <AdminTopBar />
        <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminSidebar({
  nav,
  email,
  sheetOpen,
}: {
  nav: AdminNavEntry[];
  email: string;
  sheetOpen: boolean;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const active = activeAdminHref(pathname, nav);
  const shownPath = useRef(pathname);

  // shadcn's sheet stays open across a navigation: close it on every route change.
  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  // The `shell-phone` state opens the sheet once, as a person would.
  useEffect(() => {
    if (sheetOpen) setOpenMobile(true);
  }, [sheetOpen, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" sheetTitle="Admin" sheetDescription={null}>
      <nav aria-label="Admin" className="flex min-h-0 flex-1 flex-col">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Admin"
                render={<Link href="/admin" />}
                className="font-semibold"
              >
                <Image src={appIcon.src} alt="" width={16} height={16} />
                <span>Admin</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((entry) => (
                  <AdminNavItem
                    key={entry.href}
                    entry={entry}
                    isActive={entry.href === active}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </nav>
      <SidebarFooter className="gap-3 group-data-[collapsible=icon]:hidden">
        <p className="truncate px-2 text-sm text-muted-foreground">{email}</p>
        <ThemeToggle className="self-start" />
        {/* The hardened sign-out route (STK-24): clears every session cookie whatever Supabase answers. */}
        <form method="post" action="/auth/sign-out">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start"
          >
            Sign out
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}

function AdminNavItem({
  entry,
  isActive,
}: {
  entry: AdminNavEntry;
  isActive: boolean;
}) {
  const Icon = ICONS[entry.icon];
  if (!entry.ready)
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={`${entry.title}, not built yet`}
          render={<span />}
          className="cursor-default text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
        >
          <Icon aria-hidden="true" />
          <span>{entry.title}, not built yet</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={entry.title}
        render={<Link href={entry.href} />}
      >
        <Icon aria-hidden="true" />
        <span>{entry.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * Below 1024px: the menu button and "Admin". At 1024px and wider: the labels
 * toggle. CSS picks which shows, so the first paint is right before the
 * media query is read.
 */
function AdminTopBar() {
  const { open, openMobile, toggleSidebar } = useSidebar();
  return (
    <header className="flex h-12 items-center gap-2 border-b px-4 lg:px-8">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        aria-label="Open menu"
        aria-expanded={openMobile}
        onClick={toggleSidebar}
      >
        <MenuIcon aria-hidden="true" />
      </Button>
      <span className="text-sm font-semibold lg:hidden">Admin</span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden lg:inline-flex"
        aria-label={open ? "Hide menu labels" : "Show menu labels"}
        onClick={toggleSidebar}
      >
        <PanelLeftIcon aria-hidden="true" />
      </Button>
    </header>
  );
}
