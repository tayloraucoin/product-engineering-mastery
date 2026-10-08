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

import { ANCHOR_REF_MAX, PLACE_MAX } from "./client/anchor.ts";

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

/**
 * A pin as the browser sends it (LAB-12, pins.md). The limits are
 * data-contract.md's; `@pem/db/sandbox` checks them again, with the anchor's
 * one-reference rule and 2 KB bound. A refusal says nothing about the input.
 */
const fraction = z.number().min(0).max(1);
const anchorRef = z.string().min(1).max(ANCHOR_REF_MAX);

export const pinInput = z.strictObject({
  id: z.uuid(),
  number: z.number().int().min(1).max(100_000),
  design: z
    .string()
    .max(24)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  kind: z.enum(["problem", "question", "suggestion", "keep"]).nullable(),
  // Stored as typed: refused when blank, never trimmed.
  body: z
    .string()
    .max(2000)
    .refine((body) => body.trim().length > 0),
  anchor: z.union([
    z.strictObject({
      marked: anchorRef,
      x: fraction,
      y: fraction,
      place: z.string().max(PLACE_MAX).optional(),
    }),
    z.strictObject({
      id: anchorRef,
      x: fraction,
      y: fraction,
      place: z.string().max(PLACE_MAX).optional(),
    }),
    z.strictObject({
      path: z.string().max(ANCHOR_REF_MAX),
      x: fraction,
      y: fraction,
      place: z.string().max(PLACE_MAX).optional(),
    }),
  ]),
  viewportW: z.number().int().min(1).max(100_000),
  viewportH: z.number().int().min(1).max(100_000),
  clientCreatedAt: z.iso.datetime(),
});

export const commentIdInput = z.strictObject({ id: z.uuid() });

/**
 * A reply as the browser sends it (LAB-25, threads.md): its browser-minted id,
 * the comment or reply it answers, and its text. Never a mode, a slug or a
 * design: the mode is read from the registry, the rest from the root.
 */
export const replyInput = z.strictObject({
  id: z.uuid(),
  parentId: z.uuid(),
  body: z
    .string()
    .max(2000)
    .refine((body) => body.trim().length > 0),
  clientCreatedAt: z.iso.datetime(),
});

/** A pin opened: the root whose replies load again. */
export const replyRootInput = z.strictObject({ rootId: z.uuid() });
