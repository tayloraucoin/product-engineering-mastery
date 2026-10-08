/**
 * shadcn's use-mobile hook (shadcn 4.21.0, read 2026-10-04): true below
 * Tailwind's `md` breakpoint (48rem), read from the media query itself.
 * `breakpoint` moves the point to `lg` (64rem) for a caller that asks; the
 * default stays `md`, so no existing caller moves (LAB-8).
 */
import * as React from "react";

export type MobileBreakpoint = "md" | "lg";

/** The query that is true below each breakpoint, a hair under it so the breakpoint itself is not mobile. */
export const MOBILE_QUERIES: Readonly<Record<MobileBreakpoint, string>> = {
  md: "(max-width: 47.99rem)",
  lg: "(max-width: 63.99rem)",
};

export function useIsMobile(breakpoint: MobileBreakpoint = "md") {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERIES[breakpoint]);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return !!isMobile;
}
