"use server";

/**
 * The shell's one action. Every other exported /admin action calls
 * `requireTeamAction()` first; signing out is the named exception, since it
 * only ends the caller's own session and anyone may do that.
 */
import { redirect } from "next/navigation";

import { supabaseConfig } from "../../lib/supabase/config";
import { createSupabaseServerClient } from "../../lib/supabase/server";

/** Ends this browser's session (the person's other devices stay signed in) and lands on sign-in. */
export async function signOutAdmin(): Promise<void> {
  if (supabaseConfig) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect("/auth/sign-in");
}
