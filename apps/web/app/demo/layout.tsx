import type { ReactNode } from "react";
import type { Metadata } from "next";

import { Toaster } from "@pem/ui/toast";

import { DemoStoreProvider } from "./_components/demo-store";

export const metadata: Metadata = { title: "Records demo" };

/**
 * The demo root: the marker the floating theme toggle hides on, the store
 * (mounted once, so writes survive client navigation and a reload resets
 * them, D-DEMO-7) and the toasts the root layout does not mount.
 */
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div data-demo="">
      <DemoStoreProvider>
        <Toaster>{children}</Toaster>
      </DemoStoreProvider>
    </div>
  );
}
