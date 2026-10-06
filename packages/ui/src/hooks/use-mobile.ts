/**
 * shadcn's use-mobile hook (shadcn 4.21.0, read 2026-10-04): true below
 * Tailwind's `md` breakpoint (48rem), read from the media query itself.
 */
import * as React from "react";

const MOBILE_QUERY = "(max-width: 47.99rem)";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
