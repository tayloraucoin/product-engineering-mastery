/**
 * The one sign-in page (STK-12): an email link, no password, no providers.
 * Each state is reachable by `?state=`: the form (default), `loading`, `sent`,
 * `invalid`, `error` (the link could not be sent) and `expired` (a link that
 * failed at the callback). Without a Supabase project for the tier, the page
 * says so instead of offering a form that cannot work.
 */

import type { Metadata } from "next";

import { supabaseConfig } from "../../../lib/supabase/config";
import { EmailField } from "./_components/email-field";
import { SendLinkButton } from "./_components/send-link-button";
import { sendSignInLink } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

const STATES = ["loading", "sent", "invalid", "error", "expired"] as const;
type SignInState = (typeof STATES)[number] | "default";

const MESSAGE_ID = "sign-in-message";

const MESSAGES: Partial<Record<SignInState, string>> = {
  invalid: "Enter an email address, such as ana@example.test.",
  error:
    "The sign-in link could not be sent. Check the address, then send it again in a minute.",
  expired:
    "That sign-in link has expired or was already used. Send yourself a new one.",
};

function readState(value: string | string[] | undefined): SignInState {
  return (STATES as readonly unknown[]).includes(value)
    ? (value as SignInState)
    : "default";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const state = readState(params.state);
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>

      {!supabaseConfig ? (
        <p className="text-muted-foreground">
          Sign-in is not set up for this environment yet. It needs the
          project&apos;s Supabase URL and publishable key.
        </p>
      ) : state === "sent" ? (
        <div className="flex flex-col gap-2" role="status">
          <p>Check your email for a sign-in link.</p>
          <p className="text-muted-foreground">
            It works once, in this browser. No email after a few minutes?{" "}
            <a href="/auth/sign-in" className="underline underline-offset-4">
              Send another link
            </a>
            .
          </p>
        </div>
      ) : (
        <form action={sendSignInLink} className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            We will email you a link that signs you in.
          </p>
          {MESSAGES[state] ? (
            <p id={MESSAGE_ID} role="alert" className="font-medium">
              {MESSAGES[state]}
            </p>
          ) : null}
          <EmailField errorId={state === "invalid" ? MESSAGE_ID : undefined} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <SendLinkButton pending={state === "loading"} />
        </form>
      )}
    </main>
  );
}
