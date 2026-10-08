import type { ReactNode } from "react";
import type { Metadata } from "next";

/**
 * Every sandbox page is noindex (S12, D-LAB-42): this metadata, and the
 * X-Robots-Tag header next.config.ts sends. No chrome: each page draws its
 * own.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ExperimentalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
