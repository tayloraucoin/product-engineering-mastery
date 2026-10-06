/**
 * The one error mapper (D-STK-8): a domain error from `@pem/services/errors`
 * becomes its tRPC code here and nowhere else. A procedure never catches; the
 * base procedure's middleware runs this on whatever the service threw.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  DomainError,
  Invalid,
  type DomainErrorCode,
} from "@pem/services/errors";
import { fieldErrors, type FieldErrors } from "@pem/validators/field-errors";

type TRPCCode = ConstructorParameters<typeof TRPCError>[0]["code"];

const CODES: Record<DomainErrorCode, TRPCCode> = {
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INVALID: "BAD_REQUEST",
};

/** A domain error as a TRPCError carrying the domain error as its cause; anything else, null. */
export function toTRPCError(error: unknown): TRPCError | null {
  if (!(error instanceof DomainError)) return null;
  return new TRPCError({
    code: CODES[error.code],
    message: error.message,
    cause: error,
  });
}

/**
 * The fields that failed, for the client to show beside each one: from a
 * service's Invalid, or from the procedure's own input parse. Null otherwise.
 */
export function failedFields(error: TRPCError): FieldErrors | null {
  const cause = error.cause;
  if (cause instanceof Invalid) return cause.fields;
  if (cause instanceof z.ZodError) return fieldErrors(cause);
  return null;
}
