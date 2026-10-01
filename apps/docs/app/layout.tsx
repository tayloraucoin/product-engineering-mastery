import type { ReactNode } from "react";
import type { Metadata } from "next";

import { Sidebar } from "./_components/sidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Docs · Product Engineering Mastery",
    template: "%s · PEM Docs",
  },
  description:
    "The practice — roles, design canon, templates, decisions, prompts — rendered from docs/ for reading.",
};

/** Two columns: a full-height sidebar panel that scrolls on its own, and the page body. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="md:flex">
          <aside className="border-b border-border bg-muted md:sticky md:top-0 md:h-dvh md:w-80 md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0">
            <Sidebar />
          </aside>
          <main className="min-w-0 flex-1 px-4 py-8 md:px-12 md:py-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
