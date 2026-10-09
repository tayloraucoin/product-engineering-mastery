"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { WifiOffIcon } from "lucide-react";

import { Alert, AlertDescription } from "@pem/ui/alert";
import { Button } from "@pem/ui/button";
import { Progress } from "@pem/ui/progress";
import { Skeleton } from "@pem/ui/skeleton";

import { BEATS, OFFLINE_NOTE, type OnboardingKey } from "../_lib/beats";
import {
  DEMO_PREFS_COOKIE,
  parseDemoPrefs,
  writeDemoPrefs,
} from "../../_lib/prefs";

/** Remembers that onboarding is done, keeping the visitor's other prefs (D-DEMO-3). */
function markOnboarded() {
  const prefix = `${DEMO_PREFS_COOKIE}=`;
  const raw = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  writeDemoPrefs({ ...parseDemoPrefs(raw), onboarded: true });
}

/**
 * The full-bleed welcome (onboarding.md). Beats are `?state=` keys swapped
 * with `router.replace`, so the back button leaves onboarding; on load and on
 * each beat the h1 takes focus so the new beat is read.
 */
export function OnboardingView({
  stateKey,
  illustration,
}: {
  stateKey: OnboardingKey;
  illustration: ReactNode;
}) {
  const router = useRouter();
  const beat = BEATS[stateKey];
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The fade marks a change of beat, so the first render does not fade.
  const firstKey = useRef(stateKey);
  const changed = firstKey.current !== stateKey;

  useEffect(() => {
    headingRef.current?.focus();
  }, [stateKey]);

  const goToBeat = (to: OnboardingKey) =>
    router.replace(`/demo/welcome?state=${to}`, { scroll: false });
  const leave = (href: string) => {
    markOnboarded();
    router.push(href);
  };
  const primary = beat.primary;

  return (
    <div data-demo-state={stateKey} className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-4 md:px-8">
        <span className="text-sm font-semibold">Records demo</span>
        {beat.skip ? (
          <Button variant="ghost" onClick={() => leave("/demo/records")}>
            Skip to records
          </Button>
        ) : null}
      </header>
      <main
        key={stateKey}
        aria-busy={beat.loading || undefined}
        className={
          (changed
            ? "animate-in fade-in duration-(--motion-duration-base) ease-(--motion-ease-out) motion-reduce:animate-none "
            : "") +
          "mx-auto flex w-full max-w-(--container-xl) flex-col px-4 pt-12 pb-16 md:px-0 md:pt-16"
        }
      >
        {beat.offline ? (
          <Alert className="mb-8">
            <WifiOffIcon />
            <AlertDescription>{OFFLINE_NOTE}</AlertDescription>
          </Alert>
        ) : null}
        {beat.step !== null ? (
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Step {beat.step} of 3
            </p>
            <Progress value={(beat.step / 3) * 100} aria-hidden="true" />
          </div>
        ) : null}
        {beat.slot !== null ? <div className="mb-8">{illustration}</div> : null}
        {beat.title !== null ? (
          <>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-semibold outline-none"
            >
              {beat.title}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">{beat.body}</p>
          </>
        ) : (
          // Below md the title wraps to two lines and the body to three (states.md).
          <div aria-hidden="true" className="flex flex-col gap-3">
            <Skeleton className="h-6 w-3/5 animate-none" />
            <Skeleton className="h-6 w-2/5 animate-none md:hidden" />
            <Skeleton className="mt-1 h-4 w-11/12 animate-none" />
            <Skeleton className="h-4 w-10/12 animate-none md:hidden" />
            <Skeleton className="h-4 w-1/2 animate-none" />
          </div>
        )}
        <div className="mt-8 flex flex-row-reverse justify-start gap-2">
          <Button
            disabled={beat.loading}
            onClick={() =>
              primary.kind === "beat"
                ? goToBeat(primary.to)
                : leave(primary.href)
            }
          >
            {primary.label}
          </Button>
          {beat.back !== null ? (
            <Button variant="ghost" onClick={() => goToBeat(beat.back!)}>
              Back
            </Button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
