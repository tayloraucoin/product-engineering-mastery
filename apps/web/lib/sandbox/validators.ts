/**
 * The sandbox actions' input schemas (placement.md: one consumer, so they
 * live here until a second appears). The gate form: an email (guest face
 * only) and a code. Each message is gate.md's Words; none echoes input.
 *
 * The code is only checked for presence: a code that does not normalise to
 * 16 symbols is a wrong code and counts as a try (D-LAB-31), so its shape is
 * judged after the throttle, never here.
 */

import { z } from "zod";

const EMAIL_EMPTY = "Enter your email.";
const EMAIL_MALFORMED = "Enter an email address, like name@example.com.";
const CODE_EMPTY = "Enter the access code you were sent.";

const email = z
  .string({ error: EMAIL_EMPTY })
  .trim()
  .min(1, { error: EMAIL_EMPTY })
  .pipe(
    z.email({ error: EMAIL_MALFORMED }).max(254, { error: EMAIL_MALFORMED }),
  );

const code = z
  .string({ error: CODE_EMPTY })
  .trim()
  .min(1, { error: CODE_EMPTY });

/** A guest: the email they type, and the code. */
export const guestGateForm = z.object({ email, code });

/** A signed-in user without a team role (S8): the code only. */
export const signedInGateForm = z.object({ code });
