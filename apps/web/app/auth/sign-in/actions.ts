"use server";

/**
 * Sends the sign-in link. The address never goes into a URL or a log; the
 * page learns only which state to show.
 */
import { redirect } from "next/navigation";
import { z } from "zod";

import { callbackUrl } from "@pem/auth/redirect";
import { createLogger } from "@pem/observability/logger";

import { env } from "../../../env";
import { supabaseConfig } from "../../../lib/supabase/config";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const log = createLogger("auth");

const SignInForm = z.object({
  email: z.email(),
  next: z.string().optional(),
});

export async function sendSignInLink(formData: FormData): Promise<never> {
  const parsed = SignInForm.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });
  if (!supabaseConfig) redirect("/auth/sign-in");
  if (!parsed.success) redirect("/auth/sign-in?state=invalid");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl(
        env.NEXT_PUBLIC_SITE_URL,
        "/auth/callback",
        parsed.data.next,
      ),
    },
  });
  if (error) {
    log.warn("auth.sign_in_link_failed", { status: error.status });
    redirect("/auth/sign-in?state=error");
  }
  redirect("/auth/sign-in?state=sent");
}
