import type { ReactNode } from "react";
import Link from "next/link";

import { ThemeToggle } from "@pem/ui/theme-toggle";

import { DemoNav } from "./demo-nav";

export const DEMO_MAIN_ID = "demo-main";

/**
 * The 56px top bar and `main` (overview.md). From `md` up the 1440 layout
 * applies: "Back to PEM" sits right beside the toggle. Below it the toggle
 * follows the nav (the three-option toggle is wider than the room left in one
 * 390 row, so the bar wraps there) and "Back to PEM" is the foot link at the end of `main`.
 */
export function DemoShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href={`#${DEMO_MAIN_ID}`}
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>
      <header className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2 md:h-14 md:flex-nowrap md:gap-x-6 md:px-8 md:py-0">
        <span className="text-sm font-semibold whitespace-nowrap">Records demo</span>
        <DemoNav />
        <div className="flex items-center gap-4 md:ml-auto md:gap-6">
          <Link
            href="/"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline"
          >
            Back to PEM
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main
        id={DEMO_MAIN_ID}
        tabIndex={-1}
        className="flex flex-col px-4 py-6 outline-none md:px-8"
      >
        {children}
        <p className="pt-8 md:hidden">
          <Link href="/" className="text-sm text-muted-foreground underline">
            Back to PEM
          </Link>
        </p>
      </main>
    </>
  );
}
