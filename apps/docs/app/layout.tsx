import type { ReactNode } from "react";
import type { Metadata } from "next";

import { brand } from "@pem/brand/brand";
import { brandSans } from "@pem/brand/font";
import { appIcon } from "@pem/brand/icon";
import { ThemeProvider } from "@pem/ui/theme";

import { Sidebar } from "../components/shell/sidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `Docs · ${brand.name}`,
    template: `%s · ${brand.shortName} Docs`,
  },
  icons: { icon: [{ url: appIcon.src, type: appIcon.type }] },
  description:
    "The practice — roles, design canon, templates, decisions, prompts — rendered from docs/ for reading.",
};

/** Two columns: a full-height sidebar panel that scrolls on its own, and the page body. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={brandSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="md:flex">
            <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-dvh md:w-72 md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0">
              <Sidebar />
            </aside>
            <main className="min-w-0 flex-1 px-4 py-8 md:px-12 md:py-10">
              <div className="mx-auto max-w-5xl">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
