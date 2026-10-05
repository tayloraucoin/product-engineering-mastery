"use client";

/**
 * The last error boundary: it replaces the root layout, so it brings its own
 * html, body, styles and font (STK-18). The error goes to the logger, which
 * hands it to whatever error reporter the app registered, if any.
 * Reachable on local and staging by `/?state=error`.
 */
import { useEffect } from "react";

import { brandSans } from "@pem/brand/font";
import { createLogger } from "@pem/observability/logger";
import { Button } from "@pem/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@pem/ui/empty";

import "./globals.css";

const log = createLogger("app");

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    log.error("render.failed", {
      error,
      ...(error.digest ? { tags: { digest: error.digest } } : {}),
    });
  }, [error]);

  return (
    <html lang="en" className={brandSans.variable}>
      <body>
        <main className="flex min-h-dvh items-center justify-center px-6">
          <Empty>
            <EmptyHeader>
              <title>Page failed to load</title>
              <EmptyTitle>This page failed to load</EmptyTitle>
              <EmptyDescription>
                The error was recorded. Try again; if it fails a second time,
                come back later.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => retry()}>Try again</Button>
            </EmptyContent>
          </Empty>
        </main>
      </body>
    </html>
  );
}
