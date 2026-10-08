import type { ReactNode } from "react";

import { DemoShell } from "./_components/demo-shell";

/** Every demo route but onboarding sits in the shell (D-DEMO-5). */
export default function DemoShellLayout({ children }: { children: ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}
