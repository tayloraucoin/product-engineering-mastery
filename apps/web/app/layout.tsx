import type { ReactNode } from "react";
import type { Metadata } from "next";

import { ApiProvider } from "@pem/api/react";
import { brand } from "@pem/brand/brand";
import { brandSans } from "@pem/brand/font";
import { appIcon } from "@pem/brand/icon";
import { ThemeProvider } from "@pem/ui/theme";

import { env } from "../env";
import { FloatingThemeToggle } from "./_components/floating-theme-toggle";

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
          <ApiProvider>
            <FloatingThemeToggle />
            {children}
          </ApiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
