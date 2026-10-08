/**
 * The theme toggle every page shows in its corner. The /admin shell carries
 * its own in the sidebar footer (LAB-8, shell.md), so this one hides while
 * the shell is on the page: there it would sit behind the shell and still be
 * the first Tab stop, ahead of "Skip to content". It hides on the shell, not
 * on the path, so the 404 a visitor gets under /admin looks like any other.
 * It hides on an experiment's design too (LAB-11): the design fills the page
 * in its own styling, and a corner control would cover a header it pins to
 * the top.
 */

import { ThemeToggle } from "@pem/ui/theme-toggle";

export function FloatingThemeToggle() {
  return (
    <header className="fixed top-4 right-4 [body:has([data-admin-shell])_&]:hidden [body:has([data-sandbox-design])_&]:hidden">
      <ThemeToggle />
    </header>
  );
}
