"use client";

import { useEffect, useRef } from "react";

/**
 * While `active`, an in-app link (the back link, the breadcrumb, the nav,
 * "Back to PEM") hands its destination to `onLeave` instead of navigating, and
 * a reload or close asks through the browser's own `beforeunload`. Listening
 * on the document in the capture phase covers every link, so no way out is
 * missed by wiring each one.
 */
export function useLeaveGuard(
  active: boolean,
  onLeave: (href: string) => void,
) {
  const onLeaveRef = useRef(onLeave);
  useEffect(() => {
    onLeaveRef.current = onLeave;
  });

  useEffect(() => {
    if (!active) return;

    function onClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target as Element | null;
      const link = target?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (
        (link.target && link.target !== "_self") ||
        link.hasAttribute("download")
      )
        return;
      const url = new URL(link.href);
      // Another site unloads the page, which beforeunload already asks about.
      if (url.origin !== window.location.origin) return;
      // An in-page link (the error summary, the skip link) is not leaving.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      onLeaveRef.current(`${url.pathname}${url.search}${url.hash}`);
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Older browsers read the prompt from returnValue.
      event.returnValue = "";
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [active]);
}
