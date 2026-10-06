/**
 * The theme toggle every page shows in its corner. The /admin shell carries
 * its own in the sidebar footer (LAB-8, shell.md), so this one hides while
 * the shell is on the page: there it would sit behind the shell and still be
 * the first Tab stop, ahead of "Skip to content". It hides on the shell, not
 * on the path, so the 404 a visitor gets under /admin looks like any other.
 */

import { ThemeToggle } from "@pem/ui/theme-toggle";

export function FloatingThemeToggle() {
  return (
    <header className="fixed top-4 right-4 [body:has([data-admin-shell])_&]:hidden">
      <ThemeToggle />
    </header>
  );
}
