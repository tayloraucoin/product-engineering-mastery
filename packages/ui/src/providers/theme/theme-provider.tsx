"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Sets the `.dark` class on <html> that `@pem/config/tailwind/preset.css`
 * reads. next-themes, unpatched, injects a blocking script so the class is
 * in place before first paint: no flash of the wrong theme on load.
 *
 * The options are fixed here so every app themes the same way. Mount it once,
 * inside <body> of the root layout, and put `suppressHydrationWarning` on
 * <html>, whose class the script changes before React hydrates.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
