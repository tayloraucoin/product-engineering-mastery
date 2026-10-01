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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8">
          <aside className="md:sticky md:top-8 md:h-[calc(100dvh-4rem)] md:w-72 md:shrink-0 md:overflow-y-auto">
            <Sidebar />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
