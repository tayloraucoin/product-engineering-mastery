import type { ReactNode } from "react";
import type { Metadata } from "next";

import { ThemeProvider } from "@pem/ui/theme";
import { ThemeToggle } from "@pem/ui/theme-toggle";

import "./globals.css";

export const metadata: Metadata = {
  title: "Product Engineering Mastery",
  description: "The product app.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="fixed top-4 right-4">
            <ThemeToggle />
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
