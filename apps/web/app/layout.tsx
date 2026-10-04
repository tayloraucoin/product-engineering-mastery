import type { ReactNode } from "react";
import type { Metadata } from "next";

import { brand } from "@pem/brand/brand";
import { brandSans } from "@pem/brand/font";
import { appIcon } from "@pem/brand/icon";
import { ThemeProvider } from "@pem/ui/theme";
import { ThemeToggle } from "@pem/ui/theme-toggle";

import { env } from "../env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  applicationName: brand.name,
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  icons: { icon: [{ url: appIcon.src, type: appIcon.type }] },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={brandSans.variable} suppressHydrationWarning>
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
