import type { ReactNode } from "react";

/** Fixture: a provider with no story beside it. */
export function BareProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
