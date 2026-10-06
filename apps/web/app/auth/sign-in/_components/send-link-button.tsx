"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@pem/ui/button";

/**
 * The form's one action. While the link is being sent it says so, cannot be
 * pressed twice, and announces it: the status region is always present, so a
 * screen reader hears the change when focus leaves the disabled button.
 */
export function SendLinkButton({ pending: forced }: { pending?: boolean }) {
  const { pending } = useFormStatus();
  const busy = forced || pending;
  return (
    <>
      <Button type="submit" disabled={busy}>
        {busy ? "Sending link" : "Email me a sign-in link"}
      </Button>
      <p role="status" className="sr-only">
        {busy ? "Sending your sign-in link" : ""}
      </p>
    </>
  );
}
