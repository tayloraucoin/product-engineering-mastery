import type { ReactNode } from "react";
import type { Metadata } from "next";

import { requireTeamPage } from "../../lib/sandbox/admin-guard";
import { ADMIN_METADATA } from "../../lib/sandbox/admin-nav";
import { AdminShell } from "./_components/admin-shell";

/** Noindex on the whole tree, beside LAB-5's header (D-LAB-42). */
export const metadata: Metadata = ADMIN_METADATA;

/**
 * The shell, for a developer or an admin. Anyone else signed in gets the
 * app's 404 here; with no session the page renders bare and its own guard
 * sends it to sign-in with the right `next`. Each page checks again: this
 * layout does not re-run on client navigation.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const member = await requireTeamPage(null);
  if (!member) return children;
  return (
    <AdminShell role={member.role} email={member.email}>
      {children}
    </AdminShell>
  );
}
