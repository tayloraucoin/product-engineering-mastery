"use client";

/**
 * The theme toggle every page shows in its corner, except under /admin,
 * whose shell carries its own in the sidebar footer (LAB-8, shell.md). There
 * it would be a second toggle, hidden behind the shell and still the first
 * Tab stop, ahead of "Skip to content".
 */
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@pem/ui/theme-toggle";

export function FloatingThemeToggle() {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return (
    <header className="fixed top-4 right-4">
      <ThemeToggle />
    </header>
  );
}
