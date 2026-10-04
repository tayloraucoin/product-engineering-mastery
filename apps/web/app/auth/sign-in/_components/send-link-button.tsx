"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@pem/ui/button";

/** The form's one action; while the link is being sent it says so and cannot be pressed twice. */
export function SendLinkButton({ pending: forced }: { pending?: boolean }) {
  const { pending } = useFormStatus();
  const busy = forced || pending;
  return (
    <Button type="submit" disabled={busy} aria-disabled={busy}>
      {busy ? "Sending link" : "Email me a sign-in link"}
    </Button>
  );
}
